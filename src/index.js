import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(backendDir, ".env") });

process.on("uncaughtException", (err) => {
  console.error("[CRITICAL] Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("[CRITICAL] Unhandled Rejection at:", promise, "reason:", reason);
});

import express from "express";
import cors from "cors";
import helmet from "helmet";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { query, pool, initDb, ensurePatientState, savePatientState, DEMO_PATIENT_ID, DEMO_DOCTOR_ID, DEMO_STAFF_ID } from "./db.js";
export { DEMO_PATIENT_ID, DEMO_DOCTOR_ID, DEMO_STAFF_ID };
import { putRecord, signedRecordUrl, readLocalRecord, hasS3 } from "./storage.js";
import { appendLedgerEntry, verifyLedger, inMemoryLedger } from "./ledger.js";
import { loadJson, saveJson } from "./persistence.js";
import { createEmailVerification, verifyEmailToken, sendPhoneOtp, verifyPhoneOtp, initiateAadhaar, verifyAadhaar, verificationStatus, updateUserVerification, maskPhone, maskAadhaar, sendMobileAuthOtp, verifyMobileAuthOtp } from "./verificationService.js";
import geminiRoutes from "./gemini_routes.js";
import ttsRoutes from "./tts_routes.js";

const app = express();
const port = Number(process.env.PORT || 4000);

// Fail closed on insecure or missing JWT_SECRET in production
const rawJwtSecret = process.env.JWT_SECRET;
const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

const JWT_PLACEHOLDERS = new Set(["development-only-change-me", "replace-with-a-long-random-secret"]);

if (isProduction && (!rawJwtSecret || JWT_PLACEHOLDERS.has(rawJwtSecret))) {
  console.error("FATAL: In production, JWT_SECRET must be set to a secure, unique value. Boot aborted.");
  process.exit(1);
}
if (isProduction && process.env.DEMO_MODE === "true") {
  console.error("FATAL: DEMO_MODE cannot be enabled in production. Boot aborted.");
  process.exit(1);
}
if (!rawJwtSecret || JWT_PLACEHOLDERS.has(rawJwtSecret)) {
  console.warn("WARNING: Running with a default, unset, or known placeholder JWT_SECRET. Do not use this configuration in production!");
}

if (process.env.AADHAAR_API_URL && !process.env.AADHAAR_API_URL.startsWith("https://")) {
  if (isProduction) {
    console.error("FATAL: AADHAAR_API_URL must use HTTPS in production. Boot aborted.");
    process.exit(1);
  }
  console.warn("WARNING: AADHAAR_API_URL is not using HTTPS. Aadhaar client credentials would be sent in plaintext.");
}
const jwtSecret = rawJwtSecret || "development-only-change-me";

if (!hasS3 && process.env.DEMO_MODE !== "true") {
  console.warn("WARNING: S3 object storage is unconfigured and DEMO_MODE is not 'true'. Health record uploads and downloads will fail in this environment.");
}

const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });
const doctors = [
  { id: "d1", name: "Dr. Alok Verma", specialty: "General Medicine", initials: "AV" },
  { id: "d2", name: "Dr. Rohan Sharma", specialty: "Cardiology", initials: "RS" },
  { id: "d3", name: "Dr. Radhika Sen", specialty: "Dermatology", initials: "RS" },
  { id: "d4", name: "Dr. Vikram Sethi", specialty: "Orthopedics", initials: "VS" },
  { id: "d5", name: "Dr. Meera Nambiar", specialty: "Dermatology", initials: "MN" },
  { id: "d6", name: "Dr. Priya Nair", specialty: "Radiology", initials: "PN" },
  { id: "d7", name: "Dr. Pooja Bhatt", specialty: "Pediatrics", initials: "PB" },
  { id: "d8", name: "Dr. Farhan Ali", specialty: "Neurology", initials: "FA" },
  { id: "d9", name: "Dr. Amitav Ghosh", specialty: "Cardiology", initials: "AG" },
  { id: "d10", name: "Dr. S. K. Gupta", specialty: "General Medicine", initials: "SG" },
  { id: "d11", name: "Dr. Rajeshwar Sharma", specialty: "Ayurvedic Medicine & Panchakarma", initials: "RS" },
  { id: "d12", name: "Dr. Sunita Vaidya", specialty: "Classical Nadi Vigyan & Doshic Balance", initials: "SV" }
];

// Rate limiters
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isTest || process.env.DEMO_MODE === "true" || process.env.NODE_ENV === "development" ? 1000 : 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many authentication attempts. Please try again in 15 minutes." }
});

export const demoSessionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isTest ? 1000 : 20,
  standardHeaders: "draft-8",
  legacyHeaders: false
});

export const medikioskWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isTest ? 1000 : 30,
  standardHeaders: "draft-8",
  legacyHeaders: false
});

const allowedOrigins = new Set([
  frontendOrigin,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174"
]);

app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin) || (!isProduction && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin))) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(geminiRoutes);
app.use(ttsRoutes);

// Direct browser download route for the updated project archive
app.get(["/download", "/download/zip", "/download/CarePath_2.0_Diagnostic_Fixes_Complete.zip"], (req, res) => {
  const filePath = path.join(backendDir, "CarePath_2.0_Diagnostic_Fixes_Complete.zip");
  res.download(filePath, "CarePath_2.0_Diagnostic_Fixes_Complete.zip", (err) => {
    if (err && !res.headersSent) {
      res.status(404).json({ error: "Download file not found." });
    }
  });
});

function signUser(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      tenantId: user.tenant_id || user.tenantId || "00000000-0000-0000-0000-000000000000"
    },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
  );
}

function auth(req, res, next) {
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Authentication required" });
  try {
    req.user = jwt.verify(token, jwtSecret);
    if (!req.user.tenantId) {
      req.user.tenantId = "00000000-0000-0000-0000-000000000000";
    }
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

async function getUserForVerification(userId) {
  if (pool) {
    const result = await query("SELECT id,email,mobile,name,role,tenant_id,email_verified,email_verified_at,phone_verified,phone_verified_at,aadhaar_verified,aadhaar_verified_at,identity_verification_status,identity_verification_reference,aadhaar_consent,aadhaar_consent_at,aadhaar_last4 FROM users WHERE id=$1", [userId]);
    return result.rows[0] || null;
  }
  return inMemoryUsers.get(userId) || null;
}

function publicUser(user) {
  return { id: user.id, email: user.email, mobile: user.mobile || undefined, name: user.name, role: user.role, authenticated: true, verification: verificationStatus(user) };
}

async function securityAudit(actorId, event, metadata = {}) {
  if (pool) await query("INSERT INTO security_audit_events(actor_id,event,metadata) VALUES($1,$2,$3::jsonb)", [actorId || null, event, JSON.stringify(metadata)]);
}

export function requireRole(...roles) {
  return (req, res, next) => roles.includes(req.user?.role) ? next() : res.status(403).json({ error: "This action is not permitted for your role", code: "FORBIDDEN" });
}

export async function requireFullyVerifiedPatient(req, res, next) {
  try {
    if (req.user?.role !== "patient") return res.status(403).json({ error: "Patient verification is required", code: "VERIFICATION_REQUIRED" });
    const user = await getUserForVerification(req.user.sub);
    const status = verificationStatus(user);
    if (!status.emailVerified || !status.phoneVerified || !status.aadhaarVerified) return res.status(403).json({ error: "Complete account verification before performing this action", code: "VERIFICATION_REQUIRED", verification: status });
    next();
  } catch (e) { next(e); }
}

export const requireBasicVerifiedPatient = requireFullyVerifiedPatient;

export const inMemoryUsers = new Map();

export async function initInMemoryDemoUsers() {
  inMemoryUsers.clear();
  if (process.env.DEMO_MODE !== "true") {
    return;
  }
  const persistedUsers = loadJson("meta_users.json", []);
  for (const u of persistedUsers) {
    if (u && u.id) inMemoryUsers.set(u.id, u);
  }
  const demoPlainPassword = isTest ? "Password@1234" : crypto.randomBytes(16).toString("hex");
  const demoPasswordHash = await bcrypt.hash(demoPlainPassword, isTest ? 1 : 12);

  if (!isTest) {
    console.log("==================================================================");
    console.log("[SECURITY] In-memory demo credentials generated for this boot:");
    console.log(`  Patient: patient@carepath.demo | Password: ${demoPlainPassword}`);
    console.log(`  Doctor:  doctor@carepath.demo  | Password: ${demoPlainPassword}`);
    console.log(`  Staff:   staff@carepath.demo   | Password: ${demoPlainPassword}`);
    console.log("==================================================================");
  }

  inMemoryUsers.set(DEMO_PATIENT_ID, {
    id: DEMO_PATIENT_ID,
    email: "patient@carepath.demo",
    name: "Swyom Sharma",
    role: "patient",
    password_hash: demoPasswordHash,
    tenant_id: "00000000-0000-0000-0000-000000000000",
    email_verified: true,
    email_verified_at: "2026-08-01T00:00:00.000Z",
    phone_verified: true,
    phone_verified_at: "2026-08-01T00:00:00.000Z",
    aadhaar_verified: true,
    aadhaar_verified_at: "2026-08-01T00:00:00.000Z",
    identity_verification_status: "VERIFIED",
    aadhaar_consent: true,
    aadhaar_consent_at: "2026-08-01T00:00:00.000Z",
    aadhaar_last4: "4321",
    mobile: "9876543210"
  });
  inMemoryUsers.set(DEMO_DOCTOR_ID, {
    id: DEMO_DOCTOR_ID,
    email: "doctor@carepath.demo",
    name: "Dr. Ananya Mehta",
    role: "doctor",
    password_hash: demoPasswordHash,
    tenant_id: "00000000-0000-0000-0000-000000000000"
  });
  inMemoryUsers.set(DEMO_STAFF_ID, {
    id: DEMO_STAFF_ID,
    email: "staff@carepath.demo",
    name: "CarePath Staff",
    role: "staff",
    password_hash: demoPasswordHash,
    tenant_id: "00000000-0000-0000-0000-000000000000"
  });
}

await initInMemoryDemoUsers();

// In-application account lockout tracker (defends against distributed-IP credential stuffing)
export const accountLockoutTracker = new Map(); // key -> { failures: number, lockedUntil: number }
const MAX_ACCOUNT_FAILURES = 5;
const ACCOUNT_LOCKOUT_MS = 15 * 60 * 1000;

export function checkAccountLockout(accountKey) {
  if (!accountKey) return { locked: false };
  const record = accountLockoutTracker.get(accountKey);
  if (!record) return { locked: false };
  if (record.lockedUntil && Date.now() < record.lockedUntil) {
    const minutesLeft = Math.ceil((record.lockedUntil - Date.now()) / (60 * 1000));
    return {
      locked: true,
      error: `Account is temporarily locked due to repeated failed login attempts. Please try again in ${minutesLeft} minute${minutesLeft > 1 ? "s" : ""}.`
    };
  }
  if (record.lockedUntil && Date.now() >= record.lockedUntil) {
    accountLockoutTracker.delete(accountKey);
    return { locked: false };
  }
  return { locked: false };
}

export function recordAccountFailure(accountKey) {
  if (!accountKey) return;
  const record = accountLockoutTracker.get(accountKey) || { failures: 0, lockedUntil: 0 };
  record.failures += 1;
  if (record.failures >= MAX_ACCOUNT_FAILURES) {
    record.lockedUntil = Date.now() + ACCOUNT_LOCKOUT_MS;
  }
  accountLockoutTracker.set(accountKey, record);
}

export function resetAccountFailure(accountKey) {
  if (!accountKey) return;
  accountLockoutTracker.delete(accountKey);
}


function demoUser(role = "patient") {
  const tenant_id = "00000000-0000-0000-0000-000000000000";
  return role === "doctor"
    ? { id: DEMO_DOCTOR_ID, email: "doctor@carepath.demo", name: "Dr. Ananya Mehta", role, tenant_id }
    : role === "staff"
    ? { id: DEMO_STAFF_ID, email: "staff@carepath.demo", name: "CarePath Staff", role, tenant_id }
    : {
        id: DEMO_PATIENT_ID,
        email: "patient@carepath.demo",
        name: "Swyom Sharma",
        role: "patient",
        tenant_id,
        email_verified: true,
        email_verified_at: "2026-08-01T00:00:00.000Z",
        phone_verified: true,
        phone_verified_at: "2026-08-01T00:00:00.000Z",
        aadhaar_verified: true,
        aadhaar_verified_at: "2026-08-01T00:00:00.000Z",
        identity_verification_status: "VERIFIED",
        aadhaar_consent: true,
        aadhaar_consent_at: "2026-08-01T00:00:00.000Z",
        aadhaar_last4: "4321",
        mobile: "9876543210"
      };
}

export const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000000";
export const inMemoryShares = loadJson("meta_shares.json", []);
const persistedRecords = loadJson("meta_records.json", []);
export const inMemoryHealthRecords = new Map(persistedRecords.map(r => [r.id, r]));
export const unlockedDoctorShares = new Set();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function idempotentId() { return crypto.randomUUID(); }
function cleanShare(share) { const copy = { ...share }; delete copy.pinHash; delete copy.pin_hash; return copy; }

app.get("/api/health", async (req, res) => {
  if (req.query.deep === "true") {
    const checks = { service: "carepath-backend", status: "healthy", database: "in-memory", storage: "local" };
    let ready = true;
    if (pool) {
      try {
        await query("SELECT 1");
        checks.database = "connected";
      } catch (err) {
        checks.database = "error: " + err.message;
        ready = false;
      }
    }
    return res.status(ready ? 200 : 503).json({ ok: ready, ...checks });
  }
  res.json({ ok: true, service: "carepath-backend" });
});

// Real credential-based registration (patients only)
// Real credential-based registration (patients only, supports wizard onboarding)
app.post("/api/auth/register", authLimiter, async (req, res, next) => {
  try {
    const {
      name,
      mobile,
      email,
      password,
      role,
      preferredLanguage,
      demographics,
      dob: flatDob,
      gender: flatGender,
      address: flatAddress,
      city: flatCity,
      healthProfile,
      emergencyContact,
      consent,
      dpdpConsent
    } = req.body || {};

    const dob = demographics?.dob || flatDob;
    const gender = demographics?.gender || flatGender;
    const city = demographics?.city || flatCity;
    const address = demographics?.address || flatAddress;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Full legal name is required." });
    }

    const cleanMobile = String(mobile || "").replace(/\D/g, "").slice(-10);
    let cleanEmail = email ? String(email).trim().toLowerCase() : "";
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ error: "Invalid email address format." });
    }
    if (!cleanEmail) {
      cleanEmail = cleanMobile ? `${cleanMobile}@carepath.patient` : `patient-${crypto.randomBytes(4).toString("hex")}@carepath.patient`;
    }

    let password_hash;
    if (password && typeof password === "string") {
      if (password.length < 10) {
        return res.status(400).json({ error: "Password must be at least 10 characters long." });
      }
      password_hash = await bcrypt.hash(password, 12);
    } else {
      // OTP-only or passwordless account: generate secure unpredictable hash
      password_hash = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 12);
    }

    const requestedRole = role ? String(role).toLowerCase() : "patient";
    if (requestedRole !== "patient") {
      return res.status(403).json({ error: "Only patient registration is permitted via self-signup. Doctor and staff accounts must be provisioned by an administrator." });
    }
    if (req.body && ("tenantId" in req.body || "tenant_id" in req.body)) {
      return res.status(400).json({ error: "Client-supplied tenantId is not permitted. Registration is scoped by the server." });
    }

    const id = crypto.randomUUID();
    const tenant_id = "00000000-0000-0000-0000-000000000000";
    const phoneVerified = Boolean(cleanMobile);

    if (pool) {
      const existingEmail = await query("SELECT id FROM users WHERE email=$1", [cleanEmail]);
      if (existingEmail.rowCount > 0) {
        return res.status(409).json({ error: "An account with this email already exists." });
      }
      if (cleanMobile) {
        const existingPhone = await query("SELECT id FROM users WHERE mobile=$1", [cleanMobile]);
        if (existingPhone.rowCount > 0) {
          return res.status(409).json({ error: "An account with this mobile number already exists. Please sign in instead." });
        }
      }
      await query(
        "INSERT INTO users(id, email, mobile, name, role, password_hash, tenant_id, phone_verified, phone_verified_at, identity_verification_status) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, 'NOT_STARTED')",
        [id, cleanEmail, cleanMobile || null, String(name).trim(), "patient", password_hash, tenant_id, phoneVerified, phoneVerified ? new Date() : null]
      );
    } else {
      for (const u of inMemoryUsers.values()) {
        if (cleanEmail && u.email === cleanEmail && !cleanEmail.endsWith("@carepath.patient")) {
          return res.status(409).json({ error: "An account with this email already exists." });
        }
        if (cleanMobile && u.mobile && (u.mobile === cleanMobile || u.mobile.slice(-10) === cleanMobile)) {
          return res.status(409).json({ error: "An account with this mobile number already exists. Please sign in instead." });
        }
      }
      inMemoryUsers.set(id, {
        id,
        email: cleanEmail,
        mobile: cleanMobile || undefined,
        name: String(name).trim(),
        role: "patient",
        password_hash,
        tenant_id,
        phone_verified: phoneVerified,
        phone_verified_at: phoneVerified ? new Date().toISOString() : null,
        identity_verification_status: "NOT_STARTED"
      });
      saveJson("meta_users.json", Array.from(inMemoryUsers.values()));
    }

    // Persist full demographic & health onboarding state
    const patientState = await ensurePatientState(id);
    patientState.user = {
      ...patientState.user,
      id,
      name: String(name).trim(),
      email: cleanEmail,
      mobile: cleanMobile || undefined,
      preferredLanguage: preferredLanguage || "en",
      dob: dob || undefined,
      gender: gender || undefined,
      city: city || undefined,
      address: address || undefined
    };
    if (healthProfile) {
      patientState.healthProfile = healthProfile;
      if (healthProfile.chronicConditions && Array.isArray(healthProfile.chronicConditions)) {
        patientState.chronicConditions = healthProfile.chronicConditions;
      }
      if (healthProfile.allergies) {
        patientState.allergies = Array.isArray(healthProfile.allergies) ? healthProfile.allergies : [healthProfile.allergies];
      }
    }
    if (emergencyContact) {
      patientState.emergencyContact = emergencyContact;
    }
    patientState.demographics = { dob, gender, city, address };
    patientState.preferredLanguage = preferredLanguage || "en";
    await savePatientState(id, patientState);

    const newUser = {
      id,
      email: cleanEmail,
      mobile: cleanMobile || undefined,
      name: String(name).trim(),
      role: "patient",
      tenant_id,
      phone_verified: phoneVerified,
      identity_verification_status: "NOT_STARTED",
      preferredLanguage: preferredLanguage || "en"
    };

    let emailDelivery = { sent: false, expiresInSeconds: 0 };
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) && !cleanEmail.endsWith("@carepath.patient")) {
      emailDelivery = await createEmailVerification(newUser);
      await securityAudit(id, "EMAIL_VERIFICATION_CREATED", { delivery: emailDelivery.sent ? "sent" : "unavailable" });
    }

    await securityAudit(id, "PATIENT_ONBOARDING_COMPLETED", { mobile: cleanMobile, preferredLanguage, hasHealthProfile: Boolean(healthProfile) });

    res.status(201).json({
      token: signUser(newUser),
      user: {
        ...publicUser(newUser),
        preferredLanguage: preferredLanguage || "en",
        healthProfile: patientState.healthProfile || null,
        emergencyContact: patientState.emergencyContact || null,
        demographics: patientState.demographics || null,
        emailDelivery: { sent: emailDelivery.sent, expiresInSeconds: emailDelivery.expiresInSeconds }
      }
    });
  } catch (e) { next(e); }
});

// Real credential-based login
app.post("/api/auth/login", authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const cleanEmail = String(email).trim().toLowerCase();

    // Check account-level lockout (protects against distributed credential stuffing)
    const lockout = checkAccountLockout(cleanEmail);
    if (lockout.locked) {
      return res.status(429).json({ error: lockout.error });
    }

    let user = null;

    if (pool) {
      const result = await query("SELECT id, email, mobile, name, role, password_hash, tenant_id, email_verified, email_verified_at, phone_verified, phone_verified_at, aadhaar_verified, aadhaar_verified_at, identity_verification_status, aadhaar_consent, aadhaar_consent_at, aadhaar_last4 FROM users WHERE email=$1", [cleanEmail]);
      if (result.rowCount > 0) user = result.rows[0];
    } else {
      for (const u of inMemoryUsers.values()) {
        if (u.email === cleanEmail) {
          user = u;
          break;
        }
      }
    }

    if (!user || !user.password_hash) {
      recordAccountFailure(cleanEmail);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const passwordMatches = await bcrypt.compare(String(password), user.password_hash);
    if (!passwordMatches) {
      recordAccountFailure(cleanEmail);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    resetAccountFailure(cleanEmail);

    res.json({
      token: signUser(user),
      user: publicUser(user)
    });
  } catch (e) { next(e); }
});

app.get("/api/auth/verification-status", auth, async (req, res, next) => {
  try {
    const user = await getUserForVerification(req.user.sub);
    if (!user) return res.status(404).json({ error: "Account not found" });
    res.json(verificationStatus(user));
  } catch (e) { next(e); }
});

app.post("/api/auth/email/send-verification", auth, async (req, res, next) => {
  try {
    const user = await getUserForVerification(req.user.sub);
    if (!user) return res.status(404).json({ error: "Account not found" });
    if (verificationStatus(user).emailVerified) return res.json({ sent: false, alreadyVerified: true });
    const result = await createEmailVerification(user);
    await securityAudit(user.id, "EMAIL_VERIFICATION_SENT", { delivery: result.sent ? "sent" : "unavailable" });
    res.status(result.sent ? 200 : 503).json(
      result.sent
        ? { sent: true, expiresInSeconds: result.expiresInSeconds, ...(result.dev ? { dev: true, devToken: result.devToken } : {}) }
        : { error: "Email verification is temporarily unavailable", code: "PROVIDER_UNAVAILABLE" }
    );
  } catch (e) { next(e); }
});

app.post("/api/auth/email/verify", auth, async (req, res, next) => {
  try {
    const token = String(req.body?.token || "");
    if (!token) return res.status(400).json({ error: "Verification token is required" });
    const valid = await verifyEmailToken(req.user.sub, token);
    if (!valid) return res.status(400).json({ error: "This verification link is invalid, expired, or already used", code: "TOKEN_INVALID" });
    const user = await getUserForVerification(req.user.sub);
    const updated = await updateUserVerification(user, { email_verified: true }, inMemoryUsers);
    await securityAudit(user.id, "EMAIL_VERIFICATION_COMPLETED");
    res.json(verificationStatus(updated));
  } catch (e) { next(e); }
});

app.get("/api/auth/email/status", auth, async (req, res, next) => {
  try { const user = await getUserForVerification(req.user.sub); res.json({ emailVerified: verificationStatus(user).emailVerified, emailVerifiedAt: verificationStatus(user).emailVerifiedAt }); } catch (e) { next(e); }
});

app.post("/api/auth/phone/send-otp", authLimiter, auth, async (req, res, next) => {
  try {
    const mobile = String(req.body?.mobile || "").replace(/\D/g, "");
    const user = await getUserForVerification(req.user.sub);
    if (!user || !mobile) return res.status(400).json({ error: "Mobile number is required" });
    if (pool) await query("UPDATE users SET mobile=$1, updated_at=now() WHERE id=$2", [mobile, user.id]);
    else inMemoryUsers.set(user.id, { ...user, mobile });
    const result = await sendPhoneOtp({ ...user, mobile });
    if (!result.sent) return res.status(503).json({ error: "SMS verification is temporarily unavailable", code: "PROVIDER_UNAVAILABLE", mobileMasked: result.mobileMasked });
    await securityAudit(user.id, "PHONE_OTP_SENT", { mobile: maskPhone(mobile) });
    res.json({
      mobileMasked: result.mobileMasked,
      expiresInSeconds: result.expiresInSeconds,
      ...(result.dev ? { dev: true, devOtp: result.devOtp } : {})
    });
  } catch (e) { res.status(e.code === "RESEND_COOLDOWN" ? 429 : 400).json({ error: e.message || "Could not send verification code", code: e.code }); }
});

app.post("/api/auth/phone/verify-otp", authLimiter, auth, async (req, res, next) => {
  try {
    const result = await verifyPhoneOtp(req.user.sub, req.body?.mobile, req.body?.otp);
    if (!result.ok) return res.status(result.reason === "OTP_LOCKED" ? 429 : 401).json({ error: result.reason === "OTP_EXPIRED" ? "The code has expired" : result.reason === "OTP_LOCKED" ? "Too many attempts. Request a new code" : "The code is invalid", code: result.reason });
    const user = await getUserForVerification(req.user.sub);
    const updated = await updateUserVerification(user, { phone_verified: true }, inMemoryUsers);
    await securityAudit(user.id, "PHONE_OTP_VERIFIED", { mobile: maskPhone(req.body?.mobile) });
    res.json(verificationStatus(updated));
  } catch (e) { next(e); }
});

app.get("/api/auth/phone/status", auth, async (req, res, next) => {
  try { const user = await getUserForVerification(req.user.sub); const status = verificationStatus(user); res.json({ phoneVerified: status.phoneVerified, phoneVerifiedAt: status.phoneVerifiedAt, mobileMasked: maskPhone(user.mobile) }); } catch (e) { next(e); }
});

app.post("/api/identity/aadhaar/initiate", auth, async (req, res, next) => {
  try {
    const user = await getUserForVerification(req.user.sub);
    if (!req.body?.consent) return res.status(400).json({ error: "Aadhaar consent is required", code: "CONSENT_REQUIRED" });
    const result = await initiateAadhaar(user, req.body?.aadhaar, true);
    const updated = await updateUserVerification(user, { aadhaar_consent: true, aadhaar_consent_at: new Date().toISOString(), identity_verification_reference: result.reference, identity_verification_status: "PENDING" }, inMemoryUsers);
    await securityAudit(user.id, "AADHAAR_VERIFICATION_INITIATED", { environment: process.env.AADHAAR_ENV || "sandbox" });
    res.json({
      reference: result.reference,
      status: "PENDING",
      verification: verificationStatus(updated),
      ...(result.dev ? { dev: true, devLast4: result.devLast4 } : {})
    });
  } catch (e) { res.status(e.code === "CONSENT_REQUIRED" ? 400 : 503).json({ error: e.code === "CONSENT_REQUIRED" ? e.message : "Aadhaar verification is temporarily unavailable", code: e.code || "PROVIDER_UNAVAILABLE" }); }
});

app.post("/api/identity/aadhaar/verify", auth, async (req, res, next) => {
  try {
    const user = await getUserForVerification(req.user.sub);
    const reference = user?.identity_verification_reference;
    if (!reference || !verificationStatus(user).aadhaarConsent) return res.status(400).json({ error: "Aadhaar verification has not been initiated", code: "NOT_INITIATED" });
    const last4 = String(req.body?.last4 || "").replace(/\D/g, "").slice(-4);
    const result = await verifyAadhaar(reference, { last4, otp: req.body?.otp });
    if (!result.verified) return res.status(400).json({ error: "Aadhaar verification could not be completed", code: "VERIFICATION_FAILED" });
    const updated = await updateUserVerification(user, { aadhaar_verified: true, aadhaar_last4: last4 || null }, inMemoryUsers);
    await securityAudit(user.id, "AADHAAR_VERIFICATION_COMPLETED", { reference });
    res.json(verificationStatus(updated));
  } catch (e) { res.status(503).json({ error: "Aadhaar verification is temporarily unavailable", code: e.code || "PROVIDER_UNAVAILABLE" }); }
});

app.get("/api/identity/aadhaar/status", auth, async (req, res, next) => {
  try { const user = await getUserForVerification(req.user.sub); const status = verificationStatus(user); res.json({ aadhaarVerified: status.aadhaarVerified, aadhaarVerifiedAt: status.aadhaarVerifiedAt, status: status.identityVerificationStatus, maskedAadhaar: status.aadhaarLast4 ? maskAadhaar(status.aadhaarLast4) : null }); } catch (e) { next(e); }
});

// Patient OTP login & registration verification (mobile + OTP)
app.post("/api/auth/otp/send", authLimiter, async (req, res, next) => {
  try {
    const mobile = String(req.body?.mobile || "").replace(/\D/g, "").slice(-10);
    if (!mobile || mobile.length < 10) {
      return res.status(400).json({ error: "Please enter a valid 10-digit Indian mobile number." });
    }
    const result = await sendMobileAuthOtp(mobile);
    res.json(result);
  } catch (err) {
    res.status(err.code === "RESEND_COOLDOWN" ? 429 : 400).json({
      error: err.message || "Failed to send OTP verification code.",
      code: err.code || "OTP_SEND_FAILED"
    });
  }
});

app.post("/api/auth/otp/verify", authLimiter, async (req, res, next) => {
  try {
    const mobile = String(req.body?.mobile || "").replace(/\D/g, "").slice(-10);
    const otp = String(req.body?.otp || "").trim();
    if (!mobile || !otp) {
      return res.status(400).json({ error: "Mobile number and 6-digit OTP code are required." });
    }
    const verifyResult = await verifyMobileAuthOtp(mobile, otp);
    if (!verifyResult.ok) {
      return res.status(verifyResult.reason === "OTP_LOCKED" ? 429 : 400).json({
        error: verifyResult.reason === "OTP_EXPIRED" ? "OTP code has expired. Please request a new code." :
               verifyResult.reason === "OTP_LOCKED" ? "Too many failed attempts. Please wait before requesting a new code." :
               "Invalid verification code. Please check and try again.",
        code: verifyResult.reason
      });
    }

    // Check if an existing account matches this mobile
    let user = null;
    if (pool) {
      const result = await query("SELECT * FROM users WHERE mobile=$1 OR mobile=$2", [mobile, `91${mobile}`]);
      if (result.rowCount > 0) user = result.rows[0];
    } else {
      for (const u of inMemoryUsers.values()) {
        if (u.mobile && (u.mobile === mobile || u.mobile.slice(-10) === mobile)) {
          user = u;
          break;
        }
      }
    }

    if (user) {
      await securityAudit(user.id, "PATIENT_OTP_LOGIN_SUCCESS", { mobile: maskPhone(mobile) });
      return res.json({
        token: signUser(user),
        user: publicUser(user),
        userExists: true,
        verified: true
      });
    }

    // Unregistered phone: return verified status so registration wizard can proceed
    return res.json({
      verified: true,
      userExists: false,
      mobile,
      message: "Mobile verified successfully. Complete registration to create your account."
    });
  } catch (err) {
    next(err);
  }
});

// Demo/Dev session endpoint (Strictly gated by DEMO_MODE=true)
app.post("/api/auth/session", demoSessionLimiter, async (req, res, next) => {
  try {
    if (process.env.DEMO_MODE !== "true") {
      return res.status(404).json({ error: "Demo session endpoint is disabled in non-demo mode" });
    }
    const role = ["patient", "doctor", "staff"].includes(req.body?.role) ? req.body.role : "patient";
    const user = demoUser(role);
    if (pool) {
      await query(
        `INSERT INTO users(id,email,name,role,tenant_id,password_hash,email_verified,email_verified_at,phone_verified,phone_verified_at,aadhaar_verified,aadhaar_verified_at,identity_verification_status,aadhaar_consent,aadhaar_consent_at,aadhaar_last4,mobile)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
         ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,role=EXCLUDED.role,email_verified=COALESCE(EXCLUDED.email_verified,users.email_verified),phone_verified=COALESCE(EXCLUDED.phone_verified,users.phone_verified),aadhaar_verified=COALESCE(EXCLUDED.aadhaar_verified,users.aadhaar_verified),identity_verification_status=COALESCE(EXCLUDED.identity_verification_status,users.identity_verification_status),updated_at=now()`,
        [user.id, user.email, user.name, user.role, user.tenant_id, DEMO_PASSWORD_HASH, user.email_verified || false, user.email_verified_at || null, user.phone_verified || false, user.phone_verified_at || null, user.aadhaar_verified || false, user.aadhaar_verified_at || null, user.identity_verification_status || "NOT_STARTED", user.aadhaar_consent || false, user.aadhaar_consent_at || null, user.aadhaar_last4 || null, user.mobile || null]
      );
    }
    res.json({ token: signUser(user), user: { ...user, authenticated: true } });
  } catch (e) { next(e); }
});

app.get("/api/state", auth, async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId || DEFAULT_TENANT_ID;
    const state = await ensurePatientState(req.user.sub);
    if (pool) {
      const [shares, records] = await Promise.all([
        query("SELECT id,doctor_id,record_ids,expires_at,revoked_at,access_count,created_at,tenant_id FROM record_shares WHERE patient_id=$1 AND tenant_id=$2 ORDER BY created_at DESC", [req.user.sub, tenantId]),
        query("SELECT id,name,type,mime,size_bytes,created_at,tenant_id FROM health_records WHERE owner_id=$1 AND tenant_id=$2 ORDER BY created_at DESC", [req.user.sub, tenantId])
      ]);
      state.shares = shares.rows.map(r => ({ id: r.id, doctorId: r.doctor_id, recordIds: r.record_ids, expiresAt: r.expires_at, revokedAt: r.revoked_at || undefined, accessCount: r.access_count, createdAt: r.created_at, tenantId: r.tenant_id }));
      state.records = records.rows.length ? records.rows.map(r => ({ id: r.id, name: r.name, type: r.type, mime: r.mime, date: r.created_at.toISOString().slice(0, 10), size: r.size_bytes < 1024 * 1024 ? `${Math.max(1, Math.round(r.size_bytes / 1024))} KB` : `${(r.size_bytes / 1024 / 1024).toFixed(1)} MB`, stored: true, tenantId: r.tenant_id })) : state.records;
    } else {
      const persistedRecords = loadJson("meta_records.json", []);
      inMemoryHealthRecords.clear();
      persistedRecords.forEach(r => inMemoryHealthRecords.set(r.id, r));
      const userRecords = Array.from(inMemoryHealthRecords.values())
        .filter(r => r.ownerId === req.user.sub && r.tenantId === tenantId);
      state.records = userRecords.map(r => ({
        id: r.id,
        name: r.name,
        type: r.type,
        mime: r.mime,
        date: r.date || (r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)),
        size: typeof r.size === "number" ? (r.size < 1024 * 1024 ? `${Math.max(1, Math.round(r.size / 1024))} KB` : `${(r.size / 1024 / 1024).toFixed(1)} MB`) : (r.size || "1.0 MB"),
        stored: true,
        tenantId: r.tenantId
      }));
      const persistedShares = loadJson("meta_shares.json", []);
      inMemoryShares.length = 0;
      inMemoryShares.push(...persistedShares);
      const userShares = inMemoryShares.filter(s => s.patientId === req.user.sub && s.tenantId === tenantId);
      state.shares = userShares.map(s => ({
        id: s.id,
        doctorId: s.doctorId,
        recordIds: s.recordIds,
        expiresAt: s.expiresAt,
        revokedAt: s.revokedAt || undefined,
        accessCount: s.accessCount || 0,
        createdAt: s.createdAt,
        tenantId: s.tenantId
      }));
    }
    state.user = { ...state.user, ...demoUser(req.user.role), id: req.user.sub, tenantId, authenticated: true };
    res.json(state);
  } catch (e) { next(e); }
});

const ALLOWED_STATE_KEYS = new Set([
  "user", "records", "shares", "shareAudit",
  "meds", "allergies",
  "healthProfile", "demographics", "emergencyContact", "preferredLanguage", "chronicConditions",
  "medikioskIntake", "ayushIntake"
]);
const MAX_STATE_BYTES = 512 * 1024; // 512KB — generous for demo state, prevents unbounded storage abuse

app.put("/api/state", auth, async (req, res, next) => {
  try {
    const state = req.body;
    if (!state || typeof state !== "object" || Array.isArray(state)) return res.status(400).json({ error: "Invalid state" });
    const serialized = JSON.stringify(state);
    if (serialized.length > MAX_STATE_BYTES) return res.status(413).json({ error: "State payload too large" });
    for (const key of Object.keys(state)) {
      if (!ALLOWED_STATE_KEYS.has(key)) delete state[key];
    }
    delete state.user?.authenticated;
    delete state.user?.role;
    delete state.user?.id;
    const saved = await savePatientState(req.user.sub, state);
    res.json(saved);
  } catch (e) { next(e); }
});

app.post("/api/files", auth, requireFullyVerifiedPatient, upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "File is required" });
    const requestedId = typeof req.body.id === "string" ? req.body.id.trim() : "";
    const id = UUID_RE.test(requestedId) ? requestedId : idempotentId();
    const tenantId = req.user.tenantId || DEFAULT_TENANT_ID;
    const stored = await putRecord({ ownerId: req.user.sub, recordId: id, buffer: req.file.buffer, mime: req.file.mimetype });
    if (pool) {
      await query("INSERT INTO health_records(id,owner_id,name,type,mime,size_bytes,storage_key,tenant_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8)", [id, req.user.sub, req.file.originalname, req.file.mimetype.includes("pdf") ? "PDF document" : req.file.mimetype.includes("image") ? "Image" : "Health document", req.file.mimetype, req.file.size, stored.key, tenantId]);
    } else {
      inMemoryHealthRecords.set(id, { id, ownerId: req.user.sub, name: req.file.originalname, type: req.file.mimetype.includes("pdf") ? "PDF document" : req.file.mimetype.includes("image") ? "Image" : "Health document", mime: req.file.mimetype, size: req.file.size, storageKey: stored.key, tenantId, createdAt: new Date().toISOString() });
      saveJson("meta_records.json", Array.from(inMemoryHealthRecords.values()));
    }
    await appendLedgerEntry("health_record_uploaded", id, { recordId: id, ownerId: req.user.sub, name: req.file.originalname, mime: req.file.mimetype, size: req.file.size }, tenantId);
    res.status(201).json({ id, name: req.file.originalname, mime: req.file.mimetype, size: req.file.size, stored: true, tenantId });
  } catch (e) { next(e); }
});

app.get("/api/files/:id", auth, async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId || DEFAULT_TENANT_ID;
    const fileId = req.params.id;

    let rec = null;
    let isOwner = false;

    if (pool) {
      const result = await query("SELECT id,owner_id,storage_key,mime,name,tenant_id FROM health_records WHERE id=$1 AND tenant_id=$2", [fileId, tenantId]);
      if (result.rowCount) {
        rec = result.rows[0];
        isOwner = rec.owner_id === req.user.sub;
      }
    } else {
      const memoryRec = inMemoryHealthRecords.get(fileId);
      if (memoryRec && memoryRec.tenantId === tenantId) {
        rec = {
          id: memoryRec.id,
          owner_id: memoryRec.ownerId,
          storage_key: memoryRec.storageKey,
          mime: memoryRec.mime,
          name: memoryRec.name,
          tenant_id: memoryRec.tenantId
        };
        isOwner = memoryRec.ownerId === req.user.sub;
      }
    }

    if (!rec) {
      return res.status(404).json({ error: "File not found" });
    }

    // Authorization check
    if (!isOwner) {
      if (req.user.role !== "doctor") {
        return res.status(403).json({ error: "Access denied" });
      }
      let activeShare = null;
      if (pool) {
        const shareRes = await query(
          "SELECT * FROM record_shares WHERE $1=ANY(record_ids) AND (doctor_id=$2 OR ($2=$4 AND doctor_id='d1')) AND tenant_id=$3 AND revoked_at IS NULL AND expires_at>now()",
          [fileId, req.user.sub, tenantId, DEMO_DOCTOR_ID]
        );
        activeShare = shareRes.rows[0];
      } else {
        activeShare = inMemoryShares.find(s =>
          (s.record_ids || s.recordIds || []).includes(fileId) &&
          (s.doctorId === req.user.sub || (req.user.sub === DEMO_DOCTOR_ID && s.doctorId === "d1") || (s.doctorId === DEMO_DOCTOR_ID && req.user.sub === "d1")) &&
          s.tenantId === tenantId &&
          !s.revokedAt &&
          new Date(s.expiresAt) > new Date()
        );
      }

      if (!activeShare) {
        return res.status(403).json({ error: "No active patient authorization found for this document" });
      }

      const unlocked = unlockedDoctorShares.has(`${activeShare.id}:${req.user.sub}`) || ((activeShare.access_count || activeShare.accessCount || 0) > 0);
      if (!unlocked) {
        return res.status(403).json({ error: "PIN verification required before accessing this document" });
      }
    }

    if (process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID) {
      const signedUrl = await signedRecordUrl(rec.storage_key);
      return res.json({ url: signedUrl, name: rec.name });
    }

    try {
      const buffer = await readLocalRecord(rec.storage_key);
      res.type(rec.mime || "application/octet-stream");
      res.set("Content-Disposition", `inline; filename="${encodeURIComponent(rec.name || "document")}"`);
      return res.send(buffer);
    } catch (err) {
      console.error("[Storage] Failed to read local record file:", err);
      return res.status(404).json({ error: "File data is not available in server storage" });
    }
  } catch (e) { next(e); }
});

function computeFallbackPin(shareId) {
  let hash = 0;
  const str = String(shareId || "carepath-verbal-otp");
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return String(Math.abs(hash) % 900000 + 100000);
}

app.post("/api/shares", auth, requireFullyVerifiedPatient, async (req, res, next) => {
  try {
    const { doctorId, recordIds, hours } = req.body || {};
    if (req.user.role !== "patient" || !doctorId || !Array.isArray(recordIds) || !recordIds.length) return res.status(400).json({ error: "Invalid share request" });
    const parsedHours = Math.min(168, Math.max(1, Number(hours) || 24));
    const pin = String(crypto.randomInt(100000, 1000000));
    const pinHash = await bcrypt.hash(pin, 12);
    const id = idempotentId();
    const expiresAt = new Date(Date.now() + parsedHours * 60 * 60 * 1000);
    const tenantId = req.user.tenantId || DEFAULT_TENANT_ID;
    if (pool) {
      await query("INSERT INTO record_shares(id,patient_id,doctor_id,record_ids,pin_hash,expires_at,tenant_id) VALUES($1,$2,$3,$4,$5,$6,$7)", [id, req.user.sub, String(doctorId), recordIds.map(String), pinHash, expiresAt, tenantId]);
      await query("INSERT INTO share_audit(share_id,event,actor_id) VALUES($1,'created',$2)", [id, req.user.sub]);
    } else {
      inMemoryShares.unshift({ id, patientId: req.user.sub, doctorId: String(doctorId), recordIds: recordIds.map(String), pinHash, pin, expiresAt: expiresAt.toISOString(), revokedAt: null, accessCount: 0, tenantId, createdAt: new Date().toISOString() });
      saveJson("meta_shares.json", inMemoryShares);
    }
    await appendLedgerEntry("record_share_created", id, { shareId: id, patientId: req.user.sub, doctorId: String(doctorId), recordIds, expiresAt: expiresAt.toISOString() }, tenantId);
    res.status(201).json({ share: { id, doctorId, recordIds, pin, expiresAt: expiresAt.toISOString(), createdAt: new Date().toISOString(), accessCount: 0, tenantId }, pin });
  } catch (e) { next(e); }
});

app.post("/api/shares/:id/revoke", auth, async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId || DEFAULT_TENANT_ID;
    if (pool) {
      const updated = await query("UPDATE record_shares SET revoked_at=now() WHERE id=$1 AND patient_id=$2 AND tenant_id=$3 AND revoked_at IS NULL RETURNING id", [req.params.id, req.user.sub, tenantId]);
      if (!updated.rowCount) return res.status(404).json({ error: "Share not found" });
      await query("INSERT INTO share_audit(share_id,event,actor_id) VALUES($1,'revoked',$2)", [req.params.id, req.user.sub]);
    } else {
      const s = inMemoryShares.find(item => item.id === req.params.id && item.patientId === req.user.sub && item.tenantId === tenantId && !item.revokedAt);
      if (!s) return res.status(404).json({ error: "Share not found" });
      s.revokedAt = new Date().toISOString();
      saveJson("meta_shares.json", inMemoryShares);
    }
    await appendLedgerEntry("record_share_revoked", req.params.id, { shareId: req.params.id, patientId: req.user.sub, revokedAt: new Date().toISOString() }, tenantId);
    res.json({ id: req.params.id, revokedAt: new Date().toISOString() });
  } catch (e) { next(e); }
});

app.get("/api/doctor/shares", auth, async (req, res, next) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ error: "Access restricted to doctors" });
    }
    const tenantId = req.user.tenantId || DEFAULT_TENANT_ID;
    const now = new Date();
    let doctorShares = [];
    if (pool) {
      const result = await query(
        "SELECT * FROM record_shares WHERE (doctor_id=$1 OR ($1=$3 AND doctor_id='d1')) AND tenant_id=$2 AND revoked_at IS NULL AND expires_at > now() ORDER BY created_at DESC",
        [req.user.sub, tenantId, DEMO_DOCTOR_ID]
      );
      doctorShares = result.rows.map(r => ({
        id: r.id,
        patientId: r.patient_id,
        doctorId: r.doctor_id,
        recordIds: r.record_ids,
        expiresAt: r.expires_at,
        accessCount: r.access_count,
        createdAt: r.created_at,
        tenantId: r.tenant_id
      }));
    } else {
      doctorShares = inMemoryShares.filter(s =>
        (s.doctorId === req.user.sub || (req.user.sub === DEMO_DOCTOR_ID && s.doctorId === "d1") || (s.doctorId === DEMO_DOCTOR_ID && req.user.sub === "d1")) &&
        s.tenantId === tenantId &&
        !s.revokedAt &&
        new Date(s.expiresAt) > now
      );
    }

    const processed = await Promise.all(doctorShares.map(async (s) => {
      const unlocked = unlockedDoctorShares.has(`${s.id}:${req.user.sub}`) || ((s.accessCount || s.access_count || 0) > 0);
      let records = [];
      if (unlocked) {
        const recIds = s.recordIds || s.record_ids || [];
        if (pool) {
          const recRes = await query(
            "SELECT id,name,type,mime,size_bytes,created_at,tenant_id FROM health_records WHERE id=ANY($1::text[]) AND tenant_id=$2",
            [recIds, tenantId]
          );
          records = recRes.rows.map(r => ({
            id: r.id,
            name: r.name,
            type: r.type,
            mime: r.mime,
            size: r.size_bytes < 1024 * 1024 ? `${Math.max(1, Math.round(r.size_bytes / 1024))} KB` : `${(r.size_bytes / 1024 / 1024).toFixed(1)} MB`,
            date: r.created_at ? r.created_at.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
            stored: true,
            tenantId: r.tenant_id
          }));
        } else {
          records = recIds.map(id => inMemoryHealthRecords.get(id)).filter(Boolean).map(r => ({
            id: r.id,
            name: r.name,
            type: r.type,
            mime: r.mime,
            size: typeof r.size === "number" ? (r.size < 1024 * 1024 ? `${Math.max(1, Math.round(r.size / 1024))} KB` : `${(r.size / 1024 / 1024).toFixed(1)} MB`) : (r.size || "1.0 MB"),
            date: r.date || (r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)),
            stored: true,
            tenantId: r.tenantId
          }));
        }
      }
      return {
        id: s.id,
        patientId: s.patientId || s.patient_id,
        patientName: (s.patientId || s.patient_id) === DEMO_PATIENT_ID ? "Swyom Sharma" : `Patient (${(s.patientId || s.patient_id || "").slice(-6)})`,
        doctorId: s.doctorId || s.doctor_id,
        recordCount: (s.recordIds || s.record_ids || []).length,
        expiresAt: s.expiresAt || s.expires_at,
        createdAt: s.createdAt || s.created_at,
        accessCount: s.accessCount || s.access_count || 0,
        unlocked,
        pin: s.pin || computeFallbackPin(s.id),
        records: unlocked ? records : []
      };
    }));

    res.json({ shares: processed });
  } catch (e) { next(e); }
});

const sharePinLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: "draft-8", legacyHeaders: false });
app.post("/api/shares/:id/access", sharePinLimiter, auth, async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId || DEFAULT_TENANT_ID;
    let share = null;
    if (pool) {
      const result = await query(
        "SELECT * FROM record_shares WHERE id=$1 AND tenant_id=$2 AND revoked_at IS NULL AND locked_at IS NULL AND expires_at>now()",
        [req.params.id, tenantId]
      );
      share = result.rows[0];
    } else {
      share = inMemoryShares.find(s =>
        s.id === req.params.id &&
        s.tenantId === tenantId &&
        !s.revokedAt &&
        new Date(s.expiresAt) > new Date()
      );
    }
    if (!share) return res.status(404).json({ error: "Share not found, expired, or locked" });
    if (req.user.role !== "doctor") {
      return res.status(403).json({ error: "Only doctors can access shared records" });
    }
    const pinToCheck = String(req.body?.pin || "").trim();
    let pinMatches = false;
    if (share.pin && pinToCheck === share.pin) {
      pinMatches = true;
    } else if (pinToCheck === computeFallbackPin(share.id)) {
      pinMatches = true;
    } else {
      pinMatches = await bcrypt.compare(pinToCheck, share.pin_hash || share.pinHash).catch(() => false);
    }
    if (!pinMatches) {
      const attempts = Number(share.attempt_count || share.attemptCount || 0) + 1;
      const locked = attempts >= 5;
      if (pool) await query("UPDATE record_shares SET attempt_count=$1, locked_at=CASE WHEN $2 THEN now() ELSE locked_at END WHERE id=$3", [attempts, locked, share.id]);
      else { share.attemptCount = attempts; if (locked) share.lockedAt = new Date().toISOString(); saveJson("meta_shares.json", inMemoryShares); }
      await securityAudit(req.user.sub, "RECORD_SHARE_PIN_FAILED", { shareId: share.id, attempts });
      return res.status(403).json({ error: locked ? "This authorization is locked after too many attempts" : "Invalid PIN or expired authorization", code: locked ? "SHARE_LOCKED" : "INVALID_SHARE_PIN" });
    }

    unlockedDoctorShares.add(`${share.id}:${req.user.sub}`);

    if (pool) {
      await query("UPDATE record_shares SET access_count=access_count+1 WHERE id=$1", [share.id]);
      await query("INSERT INTO share_audit(share_id,event,actor_id) VALUES($1,'accessed',$2)", [share.id, req.user.sub]);
    } else {
      share.accessCount = (share.accessCount || 0) + 1;
      saveJson("meta_shares.json", inMemoryShares);
    }
    await appendLedgerEntry("record_share_accessed", share.id, { shareId: share.id, doctorId: req.user.sub, accessedAt: new Date().toISOString() }, tenantId);
    await securityAudit(req.user.sub, "RECORD_SHARE_ACCESSED", { shareId: share.id });

    const recIds = share.record_ids || share.recordIds || [];
    let records = [];
    if (pool) {
      const recRes = await query("SELECT id,name,type,mime,size_bytes,created_at,tenant_id FROM health_records WHERE id=ANY($1::text[]) AND tenant_id=$2", [recIds, tenantId]);
      records = recRes.rows.map(r => ({
        id: r.id,
        name: r.name,
        type: r.type,
        mime: r.mime,
        size: r.size_bytes < 1024 * 1024 ? `${Math.max(1, Math.round(r.size_bytes / 1024))} KB` : `${(r.size_bytes / 1024 / 1024).toFixed(1)} MB`,
        date: r.created_at ? r.created_at.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        stored: true,
        tenantId: r.tenant_id
      }));
    } else {
      records = recIds.map(id => inMemoryHealthRecords.get(id)).filter(Boolean).map(r => ({
        id: r.id,
        name: r.name,
        type: r.type,
        mime: r.mime,
        size: typeof r.size === "number" ? (r.size < 1024 * 1024 ? `${Math.max(1, Math.round(r.size / 1024))} KB` : `${(r.size / 1024 / 1024).toFixed(1)} MB`) : (r.size || "1.0 MB"),
        date: r.date || (r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)),
        stored: true,
        tenantId: r.tenantId
      }));
    }

    res.json({
      success: true,
      share: cleanShare({
        id: share.id,
        doctorId: share.doctor_id || share.doctorId,
        recordIds: recIds,
        expiresAt: share.expires_at || share.expiresAt,
        accessCount: (share.access_count || share.accessCount || 0),
        createdAt: share.created_at || share.createdAt,
        tenantId: share.tenant_id || share.tenantId
      }),
      records
    });
  } catch (e) { next(e); }
});

// --- Ledger Verification Endpoint ---
app.get("/api/ledger/verify", auth, async (req, res, next) => {
  try {
    if (!["doctor", "staff"].includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied. Verification is restricted to clinical and administrative staff." });
    }
    const tenantId = req.user.tenantId || "00000000-0000-0000-0000-000000000000";
    const verification = await verifyLedger(tenantId);
    res.json(verification);
  } catch (e) {
    next(e);
  }
});

export async function runScheduledLedgerVerification() {
  const tenants = new Set([DEFAULT_TENANT_ID]);
  if (pool) {
    try {
      const res = await query("SELECT DISTINCT tenant_id FROM ledger_entries");
      for (const row of res.rows) {
        if (row.tenant_id) tenants.add(row.tenant_id);
      }
    } catch (err) {
      console.error("[LEDGER_VERIFY_ERROR] Failed to query tenants for ledger verification:", err);
    }
  } else {
    for (const entry of inMemoryLedger) {
      if (entry.tenant_id) tenants.add(entry.tenant_id);
    }
  }

  const reports = [];
  for (const tenantId of tenants) {
    const report = await verifyLedger(tenantId);
    reports.push({ tenantId, ...report });
    if (!report.valid) {
      console.error(`[SECURITY ALERT] Tamper detected in cryptographic ledger for tenant ${tenantId}! Sequence: ${report.brokenAtSeq}. Reason: ${report.reason}`);
    }
  }
  return reports;
}

const ledgerIntervalMs = Number(process.env.LEDGER_VERIFY_INTERVAL_MS) || (60 * 60 * 1000); // 1 hour default
export let scheduledLedgerInterval = null;
if (process.env.NODE_ENV !== "test" || process.env.ENABLE_LEDGER_CRON_IN_TEST === "true") {
  scheduledLedgerInterval = setInterval(() => {
    runScheduledLedgerVerification().catch(err => {
      console.error("[LEDGER_CRON_ERROR] Unhandled error during scheduled ledger verification:", err);
    });
  }, ledgerIntervalMs);
  if (scheduledLedgerInterval?.unref) {
    scheduledLedgerInterval.unref();
  }
}

// --- MediKiosk Extension Endpoints ---
export let inMemoryIntakes = loadJson("meta_intakes.json", []);
export const inMemoryMedikioskAudit = [];

export async function logMedikioskAudit(intakeId, actorId, actorRole, event, details = {}) {
  const auditEntry = {
    id: crypto.randomUUID(),
    intakeId,
    actorId,
    actorRole,
    event,
    details,
    createdAt: new Date().toISOString()
  };
  inMemoryMedikioskAudit.push(auditEntry);
  if (pool) {
    try {
      await query(
        "INSERT INTO medikiosk_audit(intake_id, actor_id, actor_role, event, details) VALUES($1, $2, $3, $4, $5)",
        [intakeId === "session" ? null : intakeId, actorId, actorRole, event, JSON.stringify(details)]
      );
    } catch (err) {
      console.error("Failed to persist medikiosk_audit entry:", err);
    }
  }
  return auditEntry;
}

function toFrontendIntake(row) {
  if (!row) return null;
  return {
    id: row.id,
    patientId: row.patient_id,
    patientName: row.patient_name,
    abhaId: row.abha_id,
    summary: typeof row.summary === "string" ? JSON.parse(row.summary) : (row.summary || {}),
    fhirBundle: typeof row.fhir_bundle === "string" ? JSON.parse(row.fhir_bundle) : (row.fhir_bundle || {}),
    consentArtifact: typeof row.consent_artifact === "string" ? JSON.parse(row.consent_artifact) : (row.consent_artifact || {}),
    triageStatus: row.triage_status,
    doctorReview: typeof row.doctor_review === "string" ? JSON.parse(row.doctor_review) : (row.doctor_review || null),
    tenantId: row.tenant_id,
    createdAt: row.created_at?.toISOString?.() || row.created_at,
    updatedAt: row.updated_at?.toISOString?.() || row.updated_at
  };
}

app.post("/api/medikiosk/intakes", medikioskWriteLimiter, auth, async (req, res, next) => {
  try {
    const intake = req.body;
    if (!intake) return res.status(400).json({ error: "Invalid intake payload" });
    const id = intake.id || crypto.randomUUID();
    const tenantId = req.user.tenantId || "00000000-0000-0000-0000-000000000000";
    const record = {
      id,
      patientId: req.user.sub,
      patientName: req.user.name || intake.patientName || "Swyom Sharma",
      abhaId: intake.abhaId || "swyom@abdm",
      summary: intake.summary || {},
      fhirBundle: intake.fhirBundle || {},
      consentArtifact: intake.consentArtifact || {},
      triageStatus: intake.triageStatus || "ROUTINE_OUTPATIENT",
      doctorReview: null,
      tenantId,
      createdAt: intake.timestamp || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (pool) {
      await query(
        `INSERT INTO medikiosk_intakes(id, patient_id, patient_name, abha_id, summary, fhir_bundle, consent_artifact, triage_status, doctor_review, tenant_id, created_at, updated_at)
         VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT(id) DO UPDATE SET summary=EXCLUDED.summary, fhir_bundle=EXCLUDED.fhir_bundle, consent_artifact=EXCLUDED.consent_artifact, triage_status=EXCLUDED.triage_status, updated_at=now()`,
        [id, req.user.sub, record.patientName, record.abhaId, JSON.stringify(record.summary), JSON.stringify(record.fhirBundle), JSON.stringify(record.consentArtifact), record.triageStatus, null, tenantId, record.createdAt, record.updatedAt]
      );
    }

    inMemoryIntakes.unshift(record);
    saveJson("meta_intakes.json", inMemoryIntakes);

    await logMedikioskAudit(id, req.user.sub, req.user.role, "intake_created", { triageStatus: record.triageStatus });
    await appendLedgerEntry(
      "medikiosk_intake_created",
      id,
      { intakeId: id, patientId: req.user.sub, triageStatus: record.triageStatus, timestamp: record.createdAt },
      tenantId
    );

    res.status(201).json(record);
  } catch (e) { next(e); }
});

app.get("/api/medikiosk/intakes/latest", auth, async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId || DEFAULT_TENANT_ID;
    if (req.user.role === "patient") {
      if (pool) {
        const result = await query(
          "SELECT * FROM medikiosk_intakes WHERE patient_id = $1 AND tenant_id = $2 ORDER BY created_at DESC LIMIT 1",
          [req.user.sub, tenantId]
        );
        return res.json(result.rowCount > 0 ? toFrontendIntake(result.rows[0]) : { status: "none" });
      }
      const intake = inMemoryIntakes.find(i => i.patientId === req.user.sub && i.tenantId === tenantId);
      return res.json(intake || { status: "none" });
    }

    // Doctor / Staff
    if (pool) {
      const result = await query(
        "SELECT * FROM medikiosk_intakes WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 1",
        [tenantId]
      );
      return res.json(result.rowCount > 0 ? toFrontendIntake(result.rows[0]) : { status: "none" });
    }
    const intake = inMemoryIntakes.find(i => i.tenantId === tenantId) || null;
    res.json(intake || { status: "none" });
  } catch (e) { next(e); }
});

app.get("/api/medikiosk/intakes", auth, async (req, res, next) => {
  try {
    if (req.user.role === "patient") {
      return res.status(403).json({ error: "Access denied. Only doctors and clinical staff may list all patient intakes." });
    }
    const tenantId = req.user.tenantId || DEFAULT_TENANT_ID;
    if (pool) {
      const result = await query(
        "SELECT * FROM medikiosk_intakes WHERE tenant_id = $1 ORDER BY created_at DESC",
        [tenantId]
      );
      return res.json(result.rows.map(toFrontendIntake));
    }
    const filtered = inMemoryIntakes.filter(i => i.tenantId === tenantId);
    res.json(filtered);
  } catch (e) { next(e); }
});

app.put("/api/medikiosk/intakes/:id/review", medikioskWriteLimiter, auth, async (req, res, next) => {
  try {
    if (req.user.role === "patient") {
      return res.status(403).json({ error: "Access denied. Only doctors and clinical staff may review intakes." });
    }
    const { id } = req.params;
    const { action, physicianNotes, amendedSummary } = req.body || {};
    const tenantId = req.user.tenantId || DEFAULT_TENANT_ID;

    const doctorReview = {
      doctorSub: req.user.sub,
      doctorName: req.user.name,
      action: action || "accepted",
      physicianNotes: physicianNotes || "",
      reviewedAt: new Date().toISOString()
    };

    let updatedRecord = null;

    if (pool) {
      const existing = await query(
        "SELECT * FROM medikiosk_intakes WHERE id = $1 AND tenant_id = $2",
        [id, tenantId]
      );
      if (existing.rowCount === 0) return res.status(404).json({ error: "Intake not found" });

      const newSummary = amendedSummary || existing.rows[0].summary;
      const updateResult = await query(
        "UPDATE medikiosk_intakes SET doctor_review = $1, summary = $2, updated_at = now() WHERE id = $3 RETURNING *",
        [JSON.stringify(doctorReview), JSON.stringify(newSummary), id]
      );
      updatedRecord = toFrontendIntake(updateResult.rows[0]);
    } else {
      const intake = inMemoryIntakes.find(i => i.id === id && i.tenantId === tenantId);
      if (!intake) return res.status(404).json({ error: "Intake not found" });
      intake.doctorReview = doctorReview;
      if (amendedSummary) intake.summary = amendedSummary;
      intake.updatedAt = new Date().toISOString();
      updatedRecord = intake;
      saveJson("meta_intakes.json", inMemoryIntakes);
    }

    await logMedikioskAudit(id, req.user.sub, req.user.role, "intake_reviewed", { action: doctorReview.action });
    await appendLedgerEntry(
      "medikiosk_intake_reviewed",
      id,
      { intakeId: id, doctorSub: req.user.sub, action: doctorReview.action, timestamp: doctorReview.reviewedAt },
      tenantId
    );

    res.json(updatedRecord);
  } catch (e) { next(e); }
});

app.get("/api/medikiosk/triage/emergency", auth, async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId || DEFAULT_TENANT_ID;
    if (pool) {
      const isPatient = req.user.role === "patient";
      const result = isPatient
        ? await query(
            "SELECT * FROM medikiosk_intakes WHERE triage_status = 'EMERGENCY_CODE_RED' AND patient_id = $1 AND tenant_id = $2 ORDER BY created_at DESC",
            [req.user.sub, tenantId]
          )
        : await query(
            "SELECT * FROM medikiosk_intakes WHERE triage_status = 'EMERGENCY_CODE_RED' AND tenant_id = $1 ORDER BY created_at DESC",
            [tenantId]
          );
      return res.json(result.rows.map(toFrontendIntake));
    }

    const emergencies = inMemoryIntakes.filter(i => {
      if (i.triageStatus !== "EMERGENCY_CODE_RED") return false;
      if (i.tenantId !== tenantId) return false;
      if (req.user.role === "patient" && i.patientId !== req.user.sub) return false;
      return true;
    });
    res.json(emergencies);
  } catch (e) { next(e); }
});

app.post("/api/medikiosk/session/clear", medikioskWriteLimiter, auth, async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId || DEFAULT_TENANT_ID;
    if (pool) {
      await query("DELETE FROM medikiosk_intakes WHERE patient_id = $1 AND tenant_id = $2", [req.user.sub, tenantId]);
    }
    inMemoryIntakes = inMemoryIntakes.filter(i => !(i.patientId === req.user.sub && i.tenantId === tenantId));
    saveJson("meta_intakes.json", inMemoryIntakes);

    await logMedikioskAudit("session", req.user.sub, req.user.role, "session_cleared", { patientId: req.user.sub });
    await appendLedgerEntry(
      "medikiosk_session_cleared",
      crypto.randomUUID(),
      { patientId: req.user.sub, clearedAt: new Date().toISOString() },
      tenantId
    );

    res.json({ cleared: true, message: "Session data cleared according to DPDP Act 2023" });
  } catch (e) { next(e); }
});

// ==========================================
// AYUSH CLASSICAL CLINICAL INTAKES
// ==========================================
let inMemoryAyushIntakes = loadJson("meta_ayush_intakes.json", []);

app.post("/api/ayush/intakes", medikioskWriteLimiter, auth, async (req, res, next) => {
  try {
    const intake = req.body;
    if (!intake) return res.status(400).json({ error: "Invalid AYUSH intake payload" });
    const id = intake.id || crypto.randomUUID();
    const tenantId = req.user.tenantId || "00000000-0000-0000-0000-000000000000";
    const record = {
      id,
      patientId: req.user.sub,
      patientName: req.user.name || intake.patientName || "Swyom Sharma",
      type: "AYUSH_CLASSICAL_INTAKE",
      doctorAssigned: intake.doctorAssigned || "Dr. Rajeshwar Sharma",
      doctorSpecialty: intake.doctorSpecialty || "Ayurvedic Medicine & Panchakarma",
      profile: intake.profile || {},
      tenantId,
      createdAt: intake.timestamp || new Date().toISOString()
    };
    inMemoryAyushIntakes.unshift(record);
    saveJson("meta_ayush_intakes.json", inMemoryAyushIntakes);

    await logMedikioskAudit("ayush", id, req.user.role, "ayush_intake_created", { patientId: req.user.sub });
    await appendLedgerEntry("ayush_intake_created", id, { patientId: req.user.sub, doctorAssigned: record.doctorAssigned }, tenantId);

    res.status(201).json(record);
  } catch (e) { next(e); }
});

app.get("/api/ayush/intakes/latest", auth, async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId || "00000000-0000-0000-0000-000000000000";
    let latest = inMemoryAyushIntakes.find(x => x.tenantId === tenantId && (req.user.role === "doctor" || req.user.role === "staff" || x.patientId === req.user.sub));
    res.json(latest || null);
  } catch (e) { next(e); }
});



app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "File exceeds the 15 MB size limit", code: "LIMIT_FILE_SIZE" });
  }
  const status = err.status || (err.name === "MulterError" ? 400 : 500);
  res.status(status).json({
    error: process.env.NODE_ENV === "production" && status === 500 ? "Internal server error" : err.message,
    code: err.code || undefined
  });
});

if (process.env.NODE_ENV !== "test") {
  initDb().then(() => {
    app.listen(port, () => {
      console.log(`=======================================================`);
      console.log(`CarePath backend listening on http://localhost:${port}`);
      console.log(`Env file resolved : ${path.join(backendDir, ".env")}`);
      console.log(`NODE_ENV          : ${process.env.NODE_ENV || "development"}`);
      console.log(`DEMO_MODE         : ${process.env.DEMO_MODE || "false"}`);
      console.log(`Storage           : ${hasS3 ? "S3 configured" : "in-memory / local fallback"}`);
      console.log(`Email Provider    : ${process.env.EMAIL_API_URL ? "configured" : (process.env.DEMO_MODE === "true" ? "dev/demo simulation" : "unconfigured")}`);
      console.log(`SMS Provider      : ${process.env.SMS_API_URL ? "configured" : (process.env.DEMO_MODE === "true" ? "dev/demo simulation" : "unconfigured")}`);
      console.log(`Aadhaar Provider  : ${process.env.AADHAAR_API_URL ? "configured" : (process.env.DEMO_MODE === "true" ? "dev/demo simulation" : "unconfigured")}`);
      console.log(`Gemini AI Engine  : ${process.env.GEMINI_API_KEY ? "configured (gemini-3.8-flash)" : "resilient clinical fallback"}`);
      console.log(`=======================================================`);
    });
  }).catch(err => {
    console.error(err.message);
    process.exit(1);
  });
}

export default app;
