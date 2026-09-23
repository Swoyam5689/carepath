import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { query, pool } from "./db.js";
import { loadJson, saveJson } from "./persistence.js";

const TOKEN_TTL_MS = Number(process.env.EMAIL_TOKEN_TTL_MS || 30 * 60 * 1000);
const OTP_TTL_MS = Number(process.env.PHONE_OTP_TTL_MS || 5 * 60 * 1000);
const OTP_MAX_ATTEMPTS = Number(process.env.PHONE_OTP_MAX_ATTEMPTS || 5);
const RESEND_COOLDOWN_MS = Number(process.env.PHONE_OTP_RESEND_COOLDOWN_MS || 30 * 1000);
const emailMemory = loadJson("meta_email_verification_tokens.json", []);
const phoneMemory = loadJson("meta_phone_otp_verifications.json", []);
const aadhaarMemory = loadJson("meta_aadhaar_verifications.json", []);

const hash = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");
async function hashOtp(otp) { return bcrypt.hash(String(otp), 10); }
async function compareOtp(otp, otpHash) { return bcrypt.compare(String(otp), otpHash); }
const safeUserId = (userId) => String(userId);
const normalizePhone = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits.startsWith("91") && digits.length === 12 ? digits.slice(2) : digits;
};
export const maskPhone = (phone) => {
  const value = normalizePhone(phone);
  return value.length >= 4 ? `${value.slice(0, 2)}••••••${value.slice(-2)}` : "••••";
};
export const maskAadhaar = (last4) => `XXXX XXXX ${String(last4 || "").slice(-4).padStart(4, "X")}`;

function persistMemory(name, value) {
  saveJson(name, value);
}

export function verificationStatus(user) {
  const email = Boolean(user?.email_verified ?? user?.emailVerified);
  const phone = Boolean(user?.phone_verified ?? user?.phoneVerified);
  const aadhaar = Boolean(user?.aadhaar_verified ?? user?.aadhaarVerified);
  const status = email && phone && aadhaar ? "VERIFIED" : (email || phone || aadhaar ? "PENDING" : "NOT_STARTED");
  return {
    emailVerified: email,
    emailVerifiedAt: user?.email_verified_at || user?.emailVerifiedAt || null,
    phoneVerified: phone,
    phoneVerifiedAt: user?.phone_verified_at || user?.phoneVerifiedAt || null,
    aadhaarVerified: aadhaar,
    aadhaarVerifiedAt: user?.aadhaar_verified_at || user?.aadhaarVerifiedAt || null,
    identityVerificationStatus: user?.identity_verification_status || user?.identityVerificationStatus || status,
    aadhaarConsent: Boolean(user?.aadhaar_consent ?? user?.aadhaarConsent),
    aadhaarConsentAt: user?.aadhaar_consent_at || user?.aadhaarConsentAt || null,
    aadhaarLast4: user?.aadhaar_last4 || null
  };
}

export const ALLOWED_VERIFICATION_COLUMNS = new Set([
  "email_verified",
  "email_verified_at",
  "phone_verified",
  "phone_verified_at",
  "aadhaar_verified",
  "aadhaar_verified_at",
  "identity_verification_status",
  "identity_verification_reference",
  "aadhaar_consent",
  "aadhaar_consent_at",
  "aadhaar_last4"
]);

export async function updateUserVerification(user, updates, memoryUsers) {
  const unallowed = Object.keys(updates || {}).filter(k => !ALLOWED_VERIFICATION_COLUMNS.has(k));
  if (unallowed.length > 0) {
    throw Object.assign(new Error(`Invalid verification field(s): ${unallowed.join(", ")}`), { code: "INVALID_VERIFICATION_FIELD" });
  }

  const now = new Date().toISOString();
  const next = { ...updates };
  if (next.email_verified === true && !next.email_verified_at) next.email_verified_at = now;
  if (next.phone_verified === true && !next.phone_verified_at) next.phone_verified_at = now;
  if (next.aadhaar_verified === true && !next.aadhaar_verified_at) next.aadhaar_verified_at = now;
  const merged = { ...user, ...next };
  const computed = verificationStatus(merged);
  next.identity_verification_status = computed.emailVerified && computed.phoneVerified && computed.aadhaarVerified ? "VERIFIED" : (computed.emailVerified || computed.phoneVerified || computed.aadhaarVerified ? "PENDING" : "NOT_STARTED");
  if (pool) {
    const fields = Object.keys(next).filter(field => ALLOWED_VERIFICATION_COLUMNS.has(field));
    if (fields.length > 0) {
      const values = fields.map(field => next[field]);
      const set = fields.map((field, index) => `${field}=$${index + 2}`).join(", ");
      await query(`UPDATE users SET ${set}, updated_at=now() WHERE id=$1`, [user.id, ...values]);
    }
  } else if (memoryUsers?.has(user.id)) {
    memoryUsers.set(user.id, { ...memoryUsers.get(user.id), ...next });
  }
  return { ...merged, ...next };
}

async function sendProvider(url, payload, headers = {}) {
  if (!url) throw Object.assign(new Error("Verification provider is not configured"), { code: "PROVIDER_NOT_CONFIGURED" });
  const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(payload) });
  if (!response.ok) throw Object.assign(new Error("Verification provider rejected the request"), { code: "PROVIDER_FAILED", status: response.status });
  const body = await response.json().catch(() => ({}));
  return body;
}

export function isDevDeliveryAllowed(providerUrl) {
  return process.env.NODE_ENV !== "production" && process.env.DEMO_MODE === "true" && !providerUrl;
}

export async function createEmailVerification(user) {
  const rawToken = crypto.randomBytes(32).toString("base64url");
  const tokenHash = hash(rawToken);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
  if (pool) {
    await query("UPDATE email_verification_tokens SET used_at=now() WHERE user_id=$1 AND used_at IS NULL", [user.id]);
    await query("INSERT INTO email_verification_tokens(user_id,token_hash,expires_at) VALUES($1,$2,$3)", [user.id, tokenHash, expiresAt]);
  } else {
    emailMemory.push({ id: crypto.randomUUID(), user_id: user.id, token_hash: tokenHash, expires_at: expiresAt.toISOString(), used_at: null, created_at: new Date().toISOString() });
    persistMemory("meta_email_verification_tokens.json", emailMemory);
  }
  if (process.env.EMAIL_PROVIDER_URL) {
    try {
      await sendProvider(process.env.EMAIL_PROVIDER_URL, { to: user.email, template: process.env.EMAIL_VERIFICATION_TEMPLATE || "carepath-email-verification", token: rawToken, expiresAt: expiresAt.toISOString() }, process.env.EMAIL_PROVIDER_API_KEY ? { authorization: `Bearer ${process.env.EMAIL_PROVIDER_API_KEY}` } : {});
      return { sent: true, expiresInSeconds: Math.floor(TOKEN_TTL_MS / 1000) };
    } catch (error) {
      return { sent: false, code: error.code || "PROVIDER_FAILED", expiresInSeconds: Math.floor(TOKEN_TTL_MS / 1000) };
    }
  }
  if (isDevDeliveryAllowed(process.env.EMAIL_PROVIDER_URL)) {
    console.log(`[DEV EMAIL] Verification token generated for ${user.email}: ${rawToken}`);
    return { sent: true, dev: true, devToken: rawToken, expiresInSeconds: Math.floor(TOKEN_TTL_MS / 1000) };
  }
  return { sent: false, code: "PROVIDER_NOT_CONFIGURED", expiresInSeconds: Math.floor(TOKEN_TTL_MS / 1000) };
}

export async function verifyEmailToken(userId, rawToken) {
  const tokenHash = hash(rawToken);
  let row;
  if (pool) row = (await query("SELECT * FROM email_verification_tokens WHERE user_id=$1 AND token_hash=$2 AND used_at IS NULL AND expires_at>now() ORDER BY created_at DESC LIMIT 1", [userId, tokenHash])).rows[0];
  else row = [...emailMemory].reverse().find(item => item.user_id === userId && item.token_hash === tokenHash && !item.used_at && new Date(item.expires_at) > new Date());
  if (!row) return false;
  if (pool) await query("UPDATE email_verification_tokens SET used_at=now() WHERE id=$1", [row.id]);
  else { row.used_at = new Date().toISOString(); persistMemory("meta_email_verification_tokens.json", emailMemory); }
  return true;
}

export async function sendPhoneOtp(user) {
  const phone = normalizePhone(user.mobile);
  if (!/^\d{10}$/.test(phone)) throw Object.assign(new Error("A valid 10-digit mobile number is required"), { code: "INVALID_PHONE" });
  let recent;
  if (pool) recent = (await query("SELECT created_at FROM phone_otp_verifications WHERE user_id=$1 AND phone=$2 ORDER BY created_at DESC LIMIT 1", [user.id, phone])).rows[0];
  else recent = [...phoneMemory].reverse().find(item => item.user_id === user.id && item.phone === phone);
  if (recent && Date.now() - new Date(recent.created_at).getTime() < RESEND_COOLDOWN_MS) {
    const elapsedMs = Date.now() - new Date(recent.created_at).getTime();
    const remainingSec = Math.max(1, Math.ceil((RESEND_COOLDOWN_MS - elapsedMs) / 1000));
    throw Object.assign(new Error(`Please wait ${remainingSec}s before requesting another code`), { code: "RESEND_COOLDOWN", remainingSec });
  }
  const otp = String(crypto.randomInt(100000, 1000000));
  const otpHash = await hashOtp(otp);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);
  if (pool) {
    await query("UPDATE phone_otp_verifications SET verified_at=COALESCE(verified_at,now()), expires_at=now() WHERE user_id=$1 AND phone=$2 AND verified_at IS NULL", [user.id, phone]);
    await query("INSERT INTO phone_otp_verifications(user_id,phone,otp_hash,expires_at,attempt_count) VALUES($1,$2,$3,$4,0)", [user.id, phone, otpHash, expiresAt]);
  } else {
    phoneMemory.push({ id: crypto.randomUUID(), user_id: user.id, phone, otp_hash: otpHash, expires_at: expiresAt.toISOString(), attempt_count: 0, verified_at: null, created_at: new Date().toISOString() });
    persistMemory("meta_phone_otp_verifications.json", phoneMemory);
  }
  if (process.env.SMS_PROVIDER_URL) {
    try {
      await sendProvider(process.env.SMS_PROVIDER_URL, { to: phone, message: `Your CarePath verification code is ${otp}. It expires in 5 minutes.` }, process.env.SMS_PROVIDER_API_KEY ? { authorization: `Bearer ${process.env.SMS_PROVIDER_API_KEY}` } : {});
      return { sent: true, mobileMasked: maskPhone(phone), expiresInSeconds: Math.floor(OTP_TTL_MS / 1000) };
    } catch (error) {
      return { sent: false, code: error.code || "PROVIDER_FAILED", mobileMasked: maskPhone(phone), expiresInSeconds: Math.floor(OTP_TTL_MS / 1000) };
    }
  }
  if (isDevDeliveryAllowed(process.env.SMS_PROVIDER_URL)) {
    console.log(`[DEV SMS] Verification OTP for ${maskPhone(phone)}: ${otp}`);
    return { sent: true, dev: true, devOtp: otp, mobileMasked: maskPhone(phone), expiresInSeconds: Math.floor(OTP_TTL_MS / 1000) };
  }
  return { sent: false, code: "PROVIDER_NOT_CONFIGURED", mobileMasked: maskPhone(phone), expiresInSeconds: Math.floor(OTP_TTL_MS / 1000) };
}

export async function verifyPhoneOtp(userId, phoneInput, otpInput) {
  const phone = normalizePhone(phoneInput);
  let row;
  if (pool) row = (await query("SELECT * FROM phone_otp_verifications WHERE user_id=$1 AND phone=$2 AND verified_at IS NULL ORDER BY created_at DESC LIMIT 1", [userId, phone])).rows[0];
  else row = [...phoneMemory].reverse().find(item => item.user_id === userId && item.phone === phone && !item.verified_at);
  if (!row) return { ok: false, reason: "OTP_NOT_FOUND" };
  if (new Date(row.expires_at) <= new Date()) return { ok: false, reason: "OTP_EXPIRED" };
  if (Number(row.attempt_count) >= OTP_MAX_ATTEMPTS) return { ok: false, reason: "OTP_LOCKED" };
  const matches = await compareOtp(otpInput || "", row.otp_hash);
  if (!matches) {
    if (pool) await query("UPDATE phone_otp_verifications SET attempt_count=attempt_count+1 WHERE id=$1", [row.id]);
    else { row.attempt_count = Number(row.attempt_count) + 1; persistMemory("meta_phone_otp_verifications.json", phoneMemory); }
    return { ok: false, reason: Number(row.attempt_count) + 1 >= OTP_MAX_ATTEMPTS ? "OTP_LOCKED" : "OTP_INVALID" };
  }
  if (pool) await query("UPDATE phone_otp_verifications SET verified_at=now() WHERE id=$1", [row.id]);
  else { row.verified_at = new Date().toISOString(); persistMemory("meta_phone_otp_verifications.json", phoneMemory); }
  return { ok: true };
}

export async function initiateAadhaar(user, aadhaar, consent) {
  if (!consent) throw Object.assign(new Error("Aadhaar consent is required"), { code: "CONSENT_REQUIRED" });
  const cleanAadhaar = String(aadhaar || "").replace(/\D/g, "");
  if (cleanAadhaar.length !== 12) {
    throw Object.assign(new Error("A valid 12-digit Aadhaar number is required"), { code: "INVALID_AADHAAR" });
  }
  const last4 = cleanAadhaar.slice(-4);

  const hasRealAadhaar = Boolean(process.env.AADHAAR_API_URL && process.env.AADHAAR_CLIENT_ID && process.env.AADHAAR_CLIENT_SECRET);
  if (hasRealAadhaar) {
    const response = await sendProvider(`${process.env.AADHAAR_API_URL.replace(/\/$/, "")}/initiate`, { aadhaar: cleanAadhaar, callbackUrl: process.env.AADHAAR_CALLBACK_URL }, { authorization: `Basic ${Buffer.from(`${process.env.AADHAAR_CLIENT_ID}:${process.env.AADHAAR_CLIENT_SECRET}`).toString("base64")}` });
    const reference = response.reference || response.transactionId || response.requestId;
    if (!reference) throw Object.assign(new Error("Aadhaar provider returned an invalid response"), { code: "PROVIDER_INVALID_RESPONSE" });
    return { reference, status: "PENDING" };
  }

  if (isDevDeliveryAllowed(process.env.AADHAAR_API_URL)) {
    const reference = `CP-AADHAAR-DEV-${crypto.randomUUID()}`;
    const record = { reference, userId: user.id, last4, createdAt: new Date().toISOString() };
    aadhaarMemory.push(record);
    persistMemory("meta_aadhaar_verifications.json", aadhaarMemory);
    console.log(`[DEV AADHAAR] Mock verification initiated for user ${user.id} (${maskAadhaar(last4)}): ref ${reference}`);
    return { reference, status: "PENDING", dev: true, devLast4: last4 };
  }

  throw Object.assign(new Error("Aadhaar provider is not configured"), { code: "PROVIDER_NOT_CONFIGURED" });
}

export async function verifyAadhaar(reference, payload = {}) {
  const hasRealAadhaar = Boolean(process.env.AADHAAR_API_URL && process.env.AADHAAR_CLIENT_ID && process.env.AADHAAR_CLIENT_SECRET);
  if (hasRealAadhaar) {
    const response = await sendProvider(`${process.env.AADHAAR_API_URL.replace(/\/$/, "")}/verify`, { reference, ...payload }, { authorization: `Basic ${Buffer.from(`${process.env.AADHAAR_CLIENT_ID}:${process.env.AADHAAR_CLIENT_SECRET}`).toString("base64")}` });
    return { verified: response.verified === true, reference };
  }

  if (isDevDeliveryAllowed(process.env.AADHAAR_API_URL)) {
    const rec = [...aadhaarMemory].reverse().find(r => r.reference === reference);
    if (!rec) {
      console.warn(`[DEV AADHAAR] Verification failed: reference ${reference} not found in memory`);
      return { verified: false, reference };
    }
    const submittedLast4 = String(payload.last4 || "").replace(/\D/g, "").slice(-4);
    const verified = Boolean(submittedLast4 && submittedLast4 === rec.last4);
    console.log(`[DEV AADHAAR] Verify check for ref ${reference}: submitted=${submittedLast4}, expected=${rec.last4}, match=${verified}`);
    return { verified, reference, dev: true };
  }

  throw Object.assign(new Error("Aadhaar provider is not configured"), { code: "PROVIDER_NOT_CONFIGURED" });
}

export async function sendMobileAuthOtp(phoneInput) {
  const phone = normalizePhone(phoneInput);
  if (!/^\d{10}$/.test(phone)) throw Object.assign(new Error("A valid 10-digit Indian mobile number is required"), { code: "INVALID_PHONE" });
  let recent = [...phoneMemory].reverse().find(item => item.phone === phone);
  if (recent && Date.now() - new Date(recent.created_at).getTime() < RESEND_COOLDOWN_MS) {
    const elapsedMs = Date.now() - new Date(recent.created_at).getTime();
    const remainingSec = Math.max(1, Math.ceil((RESEND_COOLDOWN_MS - elapsedMs) / 1000));
    throw Object.assign(new Error(`Please wait ${remainingSec}s before requesting another code`), { code: "RESEND_COOLDOWN", remainingSec });
  }
  const otp = String(crypto.randomInt(100000, 1000000));
  const otpHash = await hashOtp(otp);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);
  phoneMemory.push({
    id: crypto.randomUUID(),
    user_id: "auth_otp",
    phone,
    otp_hash: otpHash,
    expires_at: expiresAt.toISOString(),
    attempt_count: 0,
    verified_at: null,
    created_at: new Date().toISOString()
  });
  persistMemory("meta_phone_otp_verifications.json", phoneMemory);

  if (process.env.SMS_PROVIDER_URL) {
    try {
      await sendProvider(process.env.SMS_PROVIDER_URL, { to: phone, message: `Your CarePath verification code is ${otp}. It expires in 5 minutes.` }, process.env.SMS_PROVIDER_API_KEY ? { authorization: `Bearer ${process.env.SMS_PROVIDER_API_KEY}` } : {});
      return { sent: true, mobileMasked: maskPhone(phone), expiresInSeconds: Math.floor(OTP_TTL_MS / 1000) };
    } catch (error) {
      return { sent: false, code: error.code || "PROVIDER_FAILED", mobileMasked: maskPhone(phone), expiresInSeconds: Math.floor(OTP_TTL_MS / 1000) };
    }
  }
  if (isDevDeliveryAllowed(process.env.SMS_PROVIDER_URL)) {
    console.log(`[DEV SMS AUTH] Verification OTP for ${maskPhone(phone)}: ${otp}`);
    return { sent: true, dev: true, devOtp: otp, mobileMasked: maskPhone(phone), expiresInSeconds: Math.floor(OTP_TTL_MS / 1000) };
  }
  return { sent: false, code: "PROVIDER_NOT_CONFIGURED", mobileMasked: maskPhone(phone), expiresInSeconds: Math.floor(OTP_TTL_MS / 1000) };
}

export async function verifyMobileAuthOtp(phoneInput, otpInput) {
  const phone = normalizePhone(phoneInput);
  let row = [...phoneMemory].reverse().find(item => item.phone === phone && !item.verified_at);
  if (!row) return { ok: false, reason: "OTP_NOT_FOUND" };
  if (new Date(row.expires_at) <= new Date()) return { ok: false, reason: "OTP_EXPIRED" };
  if (Number(row.attempt_count) >= OTP_MAX_ATTEMPTS) return { ok: false, reason: "OTP_LOCKED" };
  const matches = await compareOtp(otpInput || "", row.otp_hash);
  if (!matches) {
    row.attempt_count = Number(row.attempt_count) + 1;
    persistMemory("meta_phone_otp_verifications.json", phoneMemory);
    return { ok: false, reason: Number(row.attempt_count) >= OTP_MAX_ATTEMPTS ? "OTP_LOCKED" : "OTP_INVALID" };
  }
  row.verified_at = new Date().toISOString();
  persistMemory("meta_phone_otp_verifications.json", phoneMemory);
  return { ok: true };
}
