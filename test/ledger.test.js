import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import {
  appendLedgerEntry,
  verifyLedger,
  canonicalizeJson,
  sha256,
  inMemoryLedger,
  resetInMemoryLedger,
  GENESIS_HASH
} from "../src/ledger.js";

process.env.NODE_ENV = "test";
process.env.DEMO_MODE = "true";

const { default: app, runScheduledLedgerVerification } = await import("../src/index.js");

async function doctorToken() {
  const res = await request(app).post("/api/auth/session").send({ role: "doctor" });
  assert.equal(res.status, 200);
  return res.body.token;
}

async function patientToken() {
  const res = await request(app).post("/api/auth/session").send({ role: "patient" });
  assert.equal(res.status, 200);
  return res.body.token;
}

test("ledger: canonical JSON sorts keys deterministically", () => {
  const objA = { b: 2, a: 1, c: { y: "bar", x: "foo" } };
  const objB = { a: 1, c: { x: "foo", y: "bar" }, b: 2 };

  assert.equal(canonicalizeJson(objA), canonicalizeJson(objB));
  assert.equal(sha256(canonicalizeJson(objA)), sha256(canonicalizeJson(objB)));
});

test("ledger: appendLedgerEntry creates valid monotonic cryptographic chain", async () => {
  resetInMemoryLedger();

  const entry1 = await appendLedgerEntry("patient_registered", "00000000-0000-0000-0000-000000000001", { name: "Alice" });
  assert.equal(entry1.seq, 1);
  assert.equal(entry1.prev_hash, GENESIS_HASH);
  assert.ok(entry1.entry_hash);

  const entry2 = await appendLedgerEntry("medikiosk_intake_created", "00000000-0000-0000-0000-000000000002", { complaint: "Fever" });
  assert.equal(entry2.seq, 2);
  assert.equal(entry2.prev_hash, entry1.entry_hash);

  const entry3 = await appendLedgerEntry("record_share_created", "00000000-0000-0000-0000-000000000003", { doctorId: "d1" });
  assert.equal(entry3.seq, 3);
  assert.equal(entry3.prev_hash, entry2.entry_hash);

  const verification = await verifyLedger();
  assert.equal(verification.valid, true);
  assert.equal(verification.count, 3);
});

test("ledger: detects payload tampering and pinpoints broken sequence", async () => {
  resetInMemoryLedger();

  await appendLedgerEntry("event_1", "00000000-0000-0000-0000-000000000001", { data: "first" });
  await appendLedgerEntry("event_2", "00000000-0000-0000-0000-000000000002", { data: "second" });
  await appendLedgerEntry("event_3", "00000000-0000-0000-0000-000000000003", { data: "third" });

  // Tamper with entry 2 payload hash
  const originalPayloadHash = inMemoryLedger[1].payload_hash;
  inMemoryLedger[1].payload_hash = sha256("tampered_payload");

  const tamperedCheck = await verifyLedger();
  assert.equal(tamperedCheck.valid, false);
  assert.equal(tamperedCheck.brokenAtSeq, 2);
  assert.ok(tamperedCheck.reason.includes("Cryptographic tamper detected at sequence 2"));

  // Restore payload hash and tamper with entry 3 prev_hash
  inMemoryLedger[1].payload_hash = originalPayloadHash;
  inMemoryLedger[2].prev_hash = "deadbeef".repeat(8);

  const brokenChainCheck = await verifyLedger();
  assert.equal(brokenChainCheck.valid, false);
  assert.equal(brokenChainCheck.brokenAtSeq, 3);
  assert.ok(brokenChainCheck.reason.includes("Previous hash broken at sequence 3"));
});

test("ledger: /api/ledger/verify endpoint restricts access to clinical/staff and returns integrity status", async () => {
  resetInMemoryLedger();
  await appendLedgerEntry("audit_test", "00000000-0000-0000-0000-000000000001", { action: "verified" });

  const patientJwt = await patientToken();
  const forbiddenRes = await request(app)
    .get("/api/ledger/verify")
    .set("Authorization", `Bearer ${patientJwt}`);

  assert.equal(forbiddenRes.status, 403);
  assert.ok(forbiddenRes.body.error.includes("Access denied"));

  const docJwt = await doctorToken();
  const allowedRes = await request(app)
    .get("/api/ledger/verify")
    .set("Authorization", `Bearer ${docJwt}`);

  assert.equal(allowedRes.status, 200);
  assert.equal(allowedRes.body.valid, true);
  assert.ok(allowedRes.body.count >= 1);
});

test("ledger: scheduled ledger verification detects and alerts on corrupted blocks", async () => {
  resetInMemoryLedger();
  await appendLedgerEntry("audit_test_1", "00000000-0000-0000-0000-000000000001", { payload: "ok" });
  await appendLedgerEntry("audit_test_2", "00000000-0000-0000-0000-000000000002", { payload: "ok2" });

  // Initial scheduled check is valid
  const initialReports = await runScheduledLedgerVerification();
  assert.ok(initialReports.length > 0);
  assert.equal(initialReports[0].valid, true);

  // Tamper with sequence 2
  inMemoryLedger[1].entry_hash = "tampered-hash-value";

  // Next scheduled check catches tampering and pinpoints broken block
  const tamperedReports = await runScheduledLedgerVerification();
  assert.ok(tamperedReports.length > 0);
  const badReport = tamperedReports.find(r => r.valid === false);
  assert.ok(badReport, "Scheduled check should flag invalid report");
  assert.equal(badReport.valid, false);
  assert.equal(badReport.brokenAtSeq, 2);
  assert.ok(badReport.reason.includes("Cryptographic tamper detected at sequence 2"));
});
