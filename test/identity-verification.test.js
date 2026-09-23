import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

process.env.NODE_ENV = "test";
process.env.DEMO_MODE = "true";
process.env.TEST_PERSISTENCE = "true";

const {
  default: app,
  inMemoryUsers,
  DEFAULT_TENANT_ID
} = await import("../src/index.js");

const {
  updateUserVerification
} = await import("../src/verificationService.js");

const { loadJson } = await import("../src/persistence.js");

const JWT_SECRET = process.env.JWT_SECRET || "development-only-change-me";

test("identity-verification: email verification lifecycle (valid, reused, expired, cross-user)", async () => {
  const originalFetch = global.fetch;
  const originalDate = global.Date;

  try {
    const userARes = await request(app).post("/api/auth/register").send({
      email: `email-test-a-${Date.now()}@example.com`,
      name: "User A",
      password: "StrongPassword123!",
      role: "patient"
    });
    assert.equal(userARes.status, 201);
    const tokenA = userARes.body.token;

    const userBRes = await request(app).post("/api/auth/register").send({
      email: `email-test-b-${Date.now()}@example.com`,
      name: "User B",
      password: "StrongPassword123!",
      role: "patient"
    });
    assert.equal(userBRes.status, 201);
    const tokenB = userBRes.body.token;

    let capturedTokenA = null;
    process.env.EMAIL_PROVIDER_URL = "https://mock-email.test/send";
    global.fetch = async (_url, options) => {
      const body = JSON.parse(options?.body || "{}");
      if (body.token) capturedTokenA = body.token;
      return { ok: true, json: async () => ({}) };
    };

    const sendRes = await request(app)
      .post("/api/auth/email/send-verification")
      .set("Authorization", `Bearer ${tokenA}`);
    assert.equal(sendRes.status, 200);
    assert.ok(capturedTokenA);

    // 1. Cross-user token failure
    const crossUserRes = await request(app)
      .post("/api/auth/email/verify")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ token: capturedTokenA });
    assert.equal(crossUserRes.status, 400);
    assert.equal(crossUserRes.body.code, "TOKEN_INVALID");

    // 2. Valid token succeeds
    const validRes = await request(app)
      .post("/api/auth/email/verify")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ token: capturedTokenA });
    assert.equal(validRes.status, 200);
    assert.equal(validRes.body.emailVerified, true);

    // 3. Reused token fails
    const reusedRes = await request(app)
      .post("/api/auth/email/verify")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ token: capturedTokenA });
    assert.equal(reusedRes.status, 400);
    assert.equal(reusedRes.body.code, "TOKEN_INVALID");

    // 4. Expired token fails
    let capturedTokenB = null;
    global.fetch = async (_url, options) => {
      const body = JSON.parse(options?.body || "{}");
      if (body.token) capturedTokenB = body.token;
      return { ok: true, json: async () => ({}) };
    };

    await request(app)
      .post("/api/auth/email/send-verification")
      .set("Authorization", `Bearer ${tokenB}`);
    assert.ok(capturedTokenB);

    // Fast-forward time by 1 hour (token TTL is 30 mins)
    class FastForwardDate extends originalDate {
      constructor(...args) {
        if (args.length === 0) super(originalDate.now() + 60 * 60 * 1000);
        else super(...args);
      }
      static now() {
        return originalDate.now() + 60 * 60 * 1000;
      }
    }
    global.Date = FastForwardDate;

    const expiredRes = await request(app)
      .post("/api/auth/email/verify")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ token: capturedTokenB });
    assert.equal(expiredRes.status, 400);
    assert.equal(expiredRes.body.code, "TOKEN_INVALID");
  } finally {
    global.fetch = originalFetch;
    global.Date = originalDate;
    delete process.env.EMAIL_PROVIDER_URL;
  }
});

test("identity-verification: phone OTP lifecycle (bcrypt hash, attempt counter, lockout, cooldown, valid verify)", async () => {
  const originalFetch = global.fetch;

  try {
    const regRes = await request(app).post("/api/auth/register").send({
      email: `otp-test-${Date.now()}@example.com`,
      name: "OTP Test Patient",
      password: "ValidPassword123!",
      role: "patient"
    });
    const patientToken = regRes.body.token;
    const mobile = "9812345678";

    let capturedOtp = null;
    process.env.SMS_PROVIDER_URL = "https://mock-sms.test/send";
    global.fetch = async (_url, options) => {
      const body = JSON.parse(options?.body || "{}");
      if (body.message) {
        const match = body.message.match(/(\d{6})/);
        if (match) capturedOtp = match[1];
      }
      return { ok: true, json: async () => ({}) };
    };

    // 1. Send OTP
    const sendOtpRes = await request(app)
      .post("/api/auth/phone/send-otp")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({ mobile });
    assert.equal(sendOtpRes.status, 200);
    assert.ok(capturedOtp);

    // 2. Confirm otp_hash starts with bcrypt $2 prefix
    const phoneRecords = loadJson("meta_phone_otp_verifications.json", []);
    const lastRecord = phoneRecords[phoneRecords.length - 1];
    assert.ok(lastRecord?.otp_hash?.startsWith("$2"), "OTP hash must use bcrypt and start with $2");

    // 3. Resending before cooldown window is rejected with 429 RESEND_COOLDOWN
    const cooldownRes = await request(app)
      .post("/api/auth/phone/send-otp")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({ mobile });
    assert.equal(cooldownRes.status, 429);
    assert.equal(cooldownRes.body.code, "RESEND_COOLDOWN");

    // 4. First incorrect OTP rejected with 401 OTP_INVALID
    const wrongOtp = capturedOtp === "111111" ? "222222" : "111111";
    const fail1 = await request(app)
      .post("/api/auth/phone/verify-otp")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({ mobile, otp: wrongOtp });
    assert.equal(fail1.status, 401);
    assert.equal(fail1.body.code, "OTP_INVALID");

    // Send remaining incorrect attempts to reach and exceed PHONE_OTP_MAX_ATTEMPTS (5 total)
    for (let i = 2; i <= 5; i++) {
      await request(app)
        .post("/api/auth/phone/verify-otp")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({ mobile, otp: wrongOtp });
    }

    // 5. After PHONE_OTP_MAX_ATTEMPTS failures, the OTP is locked (even if correct OTP is supplied)
    const lockedRes = await request(app)
      .post("/api/auth/phone/verify-otp")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({ mobile, otp: capturedOtp });
    assert.equal(lockedRes.status, 429);
    assert.equal(lockedRes.body.code, "OTP_LOCKED");

    // 6. Correct OTP verifies successfully on a fresh verification session
    const freshRes = await request(app).post("/api/auth/register").send({
      email: `otp-fresh-${Date.now()}@example.com`,
      name: "Fresh OTP Patient",
      password: "ValidPassword123!",
      role: "patient"
    });
    const freshToken = freshRes.body.token;
    const freshMobile = "9899887766";
    let freshCapturedOtp = null;

    global.fetch = async (_url, options) => {
      const body = JSON.parse(options?.body || "{}");
      if (body.message) {
        const match = body.message.match(/(\d{6})/);
        if (match) freshCapturedOtp = match[1];
      }
      return { ok: true, json: async () => ({}) };
    };

    await request(app)
      .post("/api/auth/phone/send-otp")
      .set("Authorization", `Bearer ${freshToken}`)
      .send({ mobile: freshMobile });
    assert.ok(freshCapturedOtp);

    const successVerify = await request(app)
      .post("/api/auth/phone/verify-otp")
      .set("Authorization", `Bearer ${freshToken}`)
      .send({ mobile: freshMobile, otp: freshCapturedOtp });
    assert.equal(successVerify.status, 200);
    assert.equal(successVerify.body.phoneVerified, true);
  } finally {
    global.fetch = originalFetch;
    delete process.env.SMS_PROVIDER_URL;
  }
});

test("identity-verification: aadhaar provider not configured returns 503 and leaves user unverified", async () => {
  const oldUrl = process.env.AADHAAR_API_URL;
  const oldId = process.env.AADHAAR_CLIENT_ID;
  const oldSecret = process.env.AADHAAR_CLIENT_SECRET;
  const oldDemo = process.env.DEMO_MODE;
  delete process.env.AADHAAR_API_URL;
  delete process.env.AADHAAR_CLIENT_ID;
  delete process.env.AADHAAR_CLIENT_SECRET;
  process.env.DEMO_MODE = "false";

  try {
    const regRes = await request(app).post("/api/auth/register").send({
      email: `aadhaar-unconf-${Date.now()}@example.com`,
      name: "Aadhaar Unconfigured",
      password: "ValidPassword123!",
      role: "patient"
    });
    const token = regRes.body.token;

    const res = await request(app)
      .post("/api/identity/aadhaar/initiate")
      .set("Authorization", `Bearer ${token}`)
      .send({ consent: true, aadhaar: "999988887777" });

    assert.equal(res.status, 503);
    assert.equal(res.body.code, "PROVIDER_NOT_CONFIGURED");

    const statusRes = await request(app)
      .get("/api/identity/aadhaar/status")
      .set("Authorization", `Bearer ${token}`);
    assert.equal(statusRes.status, 200);
    assert.equal(statusRes.body.aadhaarVerified, false);
  } finally {
    process.env.DEMO_MODE = oldDemo;
    if (oldUrl) process.env.AADHAAR_API_URL = oldUrl;
    if (oldId) process.env.AADHAAR_CLIENT_ID = oldId;
    if (oldSecret) process.env.AADHAAR_CLIENT_SECRET = oldSecret;
  }
});

test("identity-verification: requireFullyVerifiedPatient gates file upload and share creation", async () => {
  const regRes = await request(app).post("/api/auth/register").send({
    email: `gate-test-${Date.now()}@example.com`,
    name: "Gate Patient",
    password: "ValidPassword123!",
    role: "patient"
  });
  const token = regRes.body.token;
  const user = regRes.body.user;

  // 1. Unverified patient gets 403 on POST /api/files
  const unverifiedFileRes = await request(app)
    .post("/api/files")
    .set("Authorization", `Bearer ${token}`)
    .attach("file", Buffer.from("Test File Content"), "test.pdf");
  assert.equal(unverifiedFileRes.status, 403);
  assert.equal(unverifiedFileRes.body.code, "VERIFICATION_REQUIRED");

  // 2. Unverified patient gets 403 on POST /api/shares
  const unverifiedShareRes = await request(app)
    .post("/api/shares")
    .set("Authorization", `Bearer ${token}`)
    .send({ doctorId: "d2", recordIds: ["r1"], hours: 24 });
  assert.equal(unverifiedShareRes.status, 403);
  assert.equal(unverifiedShareRes.body.code, "VERIFICATION_REQUIRED");

  // 3. Mark patient fully verified
  await updateUserVerification(user, {
    email_verified: true,
    phone_verified: true,
    aadhaar_verified: true
  }, inMemoryUsers);

  // 4. Fully verified patient succeeds on POST /api/files
  const verifiedFileRes = await request(app)
    .post("/api/files")
    .set("Authorization", `Bearer ${token}`)
    .attach("file", Buffer.from("Test File Content"), "test.pdf");
  assert.equal(verifiedFileRes.status, 201);
  const fileId = verifiedFileRes.body.id;
  assert.ok(fileId);

  // 5. Fully verified patient succeeds on POST /api/shares
  const verifiedShareRes = await request(app)
    .post("/api/shares")
    .set("Authorization", `Bearer ${token}`)
    .send({ doctorId: "d2", recordIds: [fileId], hours: 24 });
  assert.equal(verifiedShareRes.status, 201);
  assert.ok(verifiedShareRes.body.share);
  assert.match(verifiedShareRes.body.pin, /^\d{6}$/);
});

test("identity-verification: regression test for FIX 1 - doctor cannot access records shared with another doctor", async () => {
  const regRes = await request(app).post("/api/auth/register").send({
    email: `regression-fix1-${Date.now()}@example.com`,
    name: "Regression Patient",
    password: "ValidPassword123!",
    role: "patient"
  });
  const patientToken = regRes.body.token;
  const user = regRes.body.user;

  await updateUserVerification(user, {
    email_verified: true,
    phone_verified: true,
    aadhaar_verified: true
  }, inMemoryUsers);

  // Patient uploads a health record
  const fileRes = await request(app)
    .post("/api/files")
    .set("Authorization", `Bearer ${patientToken}`)
    .attach("file", Buffer.from("Confidential Lab Report"), "confidential.pdf");
  assert.equal(fileRes.status, 201);
  const fileId = fileRes.body.id;

  // Patient shares the record ONLY with doctor 'd2'
  const shareRes = await request(app)
    .post("/api/shares")
    .set("Authorization", `Bearer ${patientToken}`)
    .send({ doctorId: "d2", recordIds: [fileId], hours: 24 });
  assert.equal(shareRes.status, 201);
  const shareId = shareRes.body.share.id;

  // Doctor 1 token (d1 - formerly backdoor access)
  const doctor1Token = jwt.sign(
    {
      sub: "d1",
      email: "dr.ananya@carepath.demo",
      role: "doctor",
      name: "Dr. Ananya Mehta",
      tenantId: DEFAULT_TENANT_ID
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  // 1. Doctor 1 requests GET /api/doctor/shares -> must NOT contain Doctor 2's share
  const d1SharesRes = await request(app)
    .get("/api/doctor/shares")
    .set("Authorization", `Bearer ${doctor1Token}`);
  assert.equal(d1SharesRes.status, 200);
  const sharesList = d1SharesRes.body.shares || [];
  const foundInD1 = sharesList.some(s => s.id === shareId);
  assert.equal(foundInD1, false, "Doctor 1 must not see shares created for Doctor 2");

  // 2. Doctor 1 requests GET /api/files/:id -> must be denied with 403
  const d1FileRes = await request(app)
    .get(`/api/files/${fileId}`)
    .set("Authorization", `Bearer ${doctor1Token}`);
  assert.equal(d1FileRes.status, 403);
  assert.ok(
    d1FileRes.body.error?.includes("Access denied") ||
    d1FileRes.body.error?.includes("No active patient authorization")
  );

  // 3. Doctor 2 token -> must see the share
  const doctor2Token = jwt.sign(
    {
      sub: "d2",
      email: "dr.rohan@carepath.demo",
      role: "doctor",
      name: "Dr. Rohan Sharma",
      tenantId: DEFAULT_TENANT_ID
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
  const d2SharesRes = await request(app)
    .get("/api/doctor/shares")
    .set("Authorization", `Bearer ${doctor2Token}`);
  assert.equal(d2SharesRes.status, 200);
  const d2SharesList = d2SharesRes.body.shares || [];
  const foundInD2 = d2SharesList.some(s => s.id === shareId);
  assert.equal(foundInD2, true, "Doctor 2 must see shares targeted at Doctor 2");
});

test("security fixes: FIX 2 - path traversal protection in storage and UUID validation in POST /api/files", async () => {
  const { putRecord } = await import("../src/storage.js");

  // assertSafePathSegment throws on path traversal
  await assert.rejects(
    () => putRecord({ ownerId: "../etc", recordId: "valid-id", buffer: Buffer.from("a"), mime: "text/plain" }),
    /Invalid owner id/
  );
  await assert.rejects(
    () => putRecord({ ownerId: "valid-owner", recordId: "../etc/passwd", buffer: Buffer.from("a"), mime: "text/plain" }),
    /Invalid record id/
  );
  await assert.rejects(
    () => putRecord({ ownerId: "valid-owner", recordId: "a/b", buffer: Buffer.from("a"), mime: "text/plain" }),
    /Invalid record id/
  );
  await assert.rejects(
    () => putRecord({ ownerId: "valid-owner", recordId: "a\\b", buffer: Buffer.from("a"), mime: "text/plain" }),
    /Invalid record id/
  );

  // POST /api/files replaces non-UUID with idempotent UUID
  const regRes = await request(app).post("/api/auth/register").send({
    email: `uuid-test-${Date.now()}@example.com`,
    name: "UUID Patient",
    password: "ValidPassword123!",
    role: "patient"
  });
  const token = regRes.body.token;
  await updateUserVerification(regRes.body.user, { email_verified: true, phone_verified: true, aadhaar_verified: true }, inMemoryUsers);

  const res = await request(app)
    .post("/api/files")
    .set("Authorization", `Bearer ${token}`)
    .field("id", "../traversal-attempt")
    .attach("file", Buffer.from("test"), "test.pdf");

  assert.equal(res.status, 201);
  assert.match(res.body.id, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  assert.notEqual(res.body.id, "../traversal-attempt");
});


test("security fixes: FIX 8 - PUT /api/state key filtering, payload size limit, and field stripping", async () => {
  const regRes = await request(app).post("/api/auth/register").send({
    email: `state-test-${Date.now()}@example.com`,
    name: "State Patient",
    password: "ValidPassword123!",
    role: "patient"
  });
  const token = regRes.body.token;

  // 1. Oversized payload returns 413
  const hugeString = "x".repeat(600 * 1024);
  const largeRes = await request(app)
    .put("/api/state")
    .set("Authorization", `Bearer ${token}`)
    .send({ user: { bio: hugeString } });
  assert.equal(largeRes.status, 413);

  // 2. Extra unapproved keys are stripped, user privileged fields stripped
  const updateRes = await request(app)
    .put("/api/state")
    .set("Authorization", `Bearer ${token}`)
    .send({
      user: { name: "Hacked Admin", role: "admin", id: "00000000-0000-0000-0000-000000000099", authenticated: true },
      maliciousKey: { exploit: true },
      records: []
    });
  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.body.maliciousKey, undefined);
  assert.equal(updateRes.body.user?.role, undefined);
  assert.equal(updateRes.body.user?.authenticated, undefined);
  assert.equal(updateRes.body.user?.id, undefined);
});

test("security fixes: updateUserVerification rejects unallowed columns and prevents dynamic SQL injection", async () => {
  const dummyUser = { id: "00000000-0000-0000-0000-000000000001" };
  const dummyMemory = new Map();

  // 1. Rejects unallowed column like 'role'
  await assert.rejects(
    async () => {
      await updateUserVerification(dummyUser, { role: "admin" }, dummyMemory);
    },
    /Invalid verification field\(s\): role/
  );

  // 2. Rejects SQL injection attempt in column name
  await assert.rejects(
    async () => {
      await updateUserVerification(dummyUser, { "email_verified; DROP TABLE users;--": true }, dummyMemory);
    },
    /Invalid verification field\(s\)/
  );

  // 3. Allows valid verification fields
  const updated = await updateUserVerification(dummyUser, { email_verified: true }, dummyMemory);
  assert.equal(updated.email_verified, true);
});

