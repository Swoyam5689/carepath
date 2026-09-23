import crypto from "node:crypto";
import { pool } from "./db.js";
import { loadJson, saveJson } from "./persistence.js";

export const GENESIS_HASH = "0".repeat(64);

/**
 * Deterministically canonicalize any JavaScript object or primitive
 * by recursively sorting object keys.
 */
export function canonicalizeJson(obj) {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return "[" + obj.map(canonicalizeJson).join(",") + "]";
  }
  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys.map((k) => `${JSON.stringify(k)}:${canonicalizeJson(obj[k])}`);
  return "{" + pairs.join(",") + "}";
}

/**
 * Computes SHA-256 hex digest of a string
 */
export function sha256(data) {
  return crypto.createHash("sha256").update(data, "utf8").digest("hex");
}

/**
 * In-memory ledger storage for tests and demo mode when PostgreSQL is not configured.
 */
export let inMemoryLedger = loadJson("meta_ledger.json", []);

export function resetInMemoryLedger() {
  inMemoryLedger = [];
  saveJson("meta_ledger.json", inMemoryLedger);
}

/**
 * Appends a new tamper-evident cryptographic ledger entry.
 * Guarantees monotonic sequence ordering and previous-hash chaining.
 */
export async function appendLedgerEntry(entryType, entityId, payload, tenantId = null) {
  const canonicalPayload = canonicalizeJson(payload || {});
  const payloadHash = sha256(canonicalPayload);
  const cleanTenantId = tenantId || "00000000-0000-0000-0000-000000000000";

  if (!pool) {
    const tenantEntries = inMemoryLedger.filter((e) => e.tenant_id === cleanTenantId);
    const seq = inMemoryLedger.length + 1;
    const prevHash = tenantEntries.length > 0 ? tenantEntries[tenantEntries.length - 1].entry_hash : GENESIS_HASH;
    const entryHash = sha256(`${seq}${entryType}${entityId}${payloadHash}${prevHash}`);

    const entry = {
      seq,
      entry_type: entryType,
      entity_id: entityId,
      payload_hash: payloadHash,
      prev_hash: prevHash,
      entry_hash: entryHash,
      tenant_id: cleanTenantId,
      created_at: new Date().toISOString()
    };
    inMemoryLedger.push(entry);
    saveJson("meta_ledger.json", inMemoryLedger);
    return entry;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE");

    // Retrieve the most recent hash for this tenant with row lock or genesis hash
    const lastRowRes = await client.query(
      "SELECT seq, entry_hash FROM ledger_entries WHERE tenant_id=$1 ORDER BY seq DESC LIMIT 1 FOR UPDATE",
      [cleanTenantId]
    );
    const prevHash = lastRowRes.rowCount > 0 ? lastRowRes.rows[0].entry_hash : GENESIS_HASH;
    const nextSeqRes = await client.query("SELECT nextval('ledger_entries_seq_seq') as seq");
    const nextSeq = nextSeqRes.rows[0].seq;

    const entryHash = sha256(`${nextSeq}${entryType}${entityId}${payloadHash}${prevHash}`);

    const insertRes = await client.query(
      `INSERT INTO ledger_entries (seq, entry_type, entity_id, payload_hash, prev_hash, entry_hash, tenant_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, now())
       RETURNING seq, entry_type, entity_id, payload_hash, prev_hash, entry_hash, tenant_id, created_at`,
      [nextSeq, entryType, entityId, payloadHash, prevHash, entryHash, cleanTenantId]
    );

    await client.query("COMMIT");
    return insertRes.rows[0];
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Traverses and cryptographically validates the entire ledger chain.
 * Recomputes all hashes from stored primitives.
 */
export async function verifyLedger(tenantId = "00000000-0000-0000-0000-000000000000") {
  let entries = [];
  const cleanTenantId = tenantId || "00000000-0000-0000-0000-000000000000";

  if (!pool) {
    entries = inMemoryLedger.filter((e) => e.tenant_id === cleanTenantId);
  } else {
    const res = await pool.query(
      "SELECT seq, entry_type, entity_id, payload_hash, prev_hash, entry_hash, tenant_id, created_at FROM ledger_entries WHERE tenant_id=$1 ORDER BY seq ASC",
      [cleanTenantId]
    );
    entries = res.rows;
  }

  if (entries.length === 0) {
    return { valid: true, count: 0, message: "Ledger is empty" };
  }

  let expectedPrevHash = GENESIS_HASH;

  for (let i = 0; i < entries.length; i++) {
    const row = entries[i];
    const seq = Number(row.seq);

    // 1. Verify previous hash link
    if (row.prev_hash !== expectedPrevHash) {
      return {
        valid: false,
        brokenAtSeq: seq,
        reason: `Previous hash broken at sequence ${seq}. Expected ${expectedPrevHash}, found ${row.prev_hash}`
      };
    }

    // 2. Recompute current entry hash
    const calculatedHash = sha256(`${seq}${row.entry_type}${row.entity_id}${row.payload_hash}${row.prev_hash}`);
    if (calculatedHash !== row.entry_hash) {
      return {
        valid: false,
        brokenAtSeq: seq,
        reason: `Cryptographic tamper detected at sequence ${seq}. Recomputed ${calculatedHash}, stored ${row.entry_hash}`
      };
    }

    expectedPrevHash = row.entry_hash;
  }

  return { valid: true, count: entries.length };
}
