import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";

process.env.NODE_ENV = "test";
process.env.DEMO_MODE = "true";

const { default: app, inMemoryUsers } = await import("../src/index.js");
const { isDevDeliveryAllowed } = await import("../src/verificationService.js");

const JWT_SECRET = process.env.JWT_SECRET || "development-only-change-me";

function makeToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      tenantId: user.tenantId || user.tenant_id || "00000000-0000-0000-0000-000000000000"
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
}

test("demo-verification test suite", async (t) => {
  // Test isolation: ensure external providers are unset
  delete process.env.EMAIL_API_URL;
  delete process.env.SMS_API_URL;
  delete process.env.AADHAAR_API_URL;

  let testUser;
  let authToken;

  await t.test("1. Fresh registration starts in unverified state", async () => {
    const regRes = await request(app).post("/api/auth/register").send({
      email: `demo-patient-${Date.now()}@example.com`,
      name: "Fresh Demo Patient",
      password: "SuperSecretPassword123!",
      role: "patient"
    });

    assert.equal(regRes.status, 201);
    assert.ok(regRes.body.token);
    assert.equal(regRes.body.user.verification.emailVerified, false);
    assert.equal(regRes.body.user.verification.phoneVerified, false);
    assert.equal(regRes.body.user.verification.aadhaarVerified, false);

    authToken = regRes.body.token;
    testUser = inMemoryUsers.get(regRes.body.user.id);
    assert.ok(testUser);
  });

  await t.test("2. Unverified patient is blocked from upload and sharing", async () => {
    // Attempt upload
    const uploadRes = await request(app)
      .post("/api/files")
      .set("Authorization", `Bearer ${authToken}`)
      .attach("file", Buffer.from("Mock Content"), "test.pdf");

    assert.equal(uploadRes.status, 403);
    assert.equal(uploadRes.body.code, "VERIFICATION_REQUIRED");

    // Attempt share
    const shareRes = await request(app)
      .post("/api/shares")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ doctorId: "d1", recordIds: ["some-id"], hours: "24" });

    assert.equal(shareRes.status, 403);
    assert.equal(shareRes.body.code, "VERIFICATION_REQUIRED");
  });

  await t.test("3. Demo email verification generates token and verifies", async () => {
    const sendRes = await request(app)
      .post("/api/auth/email/send-verification")
      .set("Authorization", `Bearer ${authToken}`);

    assert.equal(sendRes.status, 200);
    assert.equal(sendRes.body.sent, true);
    assert.equal(sendRes.body.dev, true);
    assert.ok(sendRes.body.devToken, "Dev delivery must provide devToken");

    // Verify using the devToken
    const verifyRes = await request(app)
      .post("/api/auth/email/verify")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ token: sendRes.body.devToken });

    assert.equal(verifyRes.status, 200);
    assert.equal(verifyRes.body.emailVerified, true);
  });

  await t.test("4. Demo phone OTP validates mobile, delivers OTP, checks wrong OTP & verifies", async () => {
    const mobile = "9876543210";
    const sendRes = await request(app)
      .post("/api/auth/phone/send-otp")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ mobile });

    assert.equal(sendRes.status, 200);
    assert.equal(sendRes.body.dev, true);
    assert.ok(sendRes.body.devOtp, "Dev delivery must return devOtp");
    assert.equal(sendRes.body.mobileMasked, "98••••••10");

    // Attempt verify with incorrect OTP
    const wrongRes = await request(app)
      .post("/api/auth/phone/verify-otp")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ mobile, otp: "000000" });

    assert.equal(wrongRes.status, 401);
    assert.equal(wrongRes.body.code, "OTP_INVALID");

    // Attempt verify with correct OTP
    const validRes = await request(app)
      .post("/api/auth/phone/verify-otp")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ mobile, otp: sendRes.body.devOtp });

    assert.equal(validRes.status, 200);
    assert.equal(validRes.body.phoneVerified, true);
  });

  await t.test("5. Demo Aadhaar requires 12 digits + consent, matches last4, and verifies", async () => {
    // 5a. Missing consent
    const noConsentRes = await request(app)
      .post("/api/identity/aadhaar/initiate")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ aadhaar: "999988881234", consent: false });

    assert.equal(noConsentRes.status, 400);
    assert.equal(noConsentRes.body.code, "CONSENT_REQUIRED");

    // 5b. Invalid Aadhaar length (< 12 digits)
    const invalidLenRes = await request(app)
      .post("/api/identity/aadhaar/initiate")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ aadhaar: "1234", consent: true });

    assert.equal(invalidLenRes.status, 503);
    assert.equal(invalidLenRes.body.code, "INVALID_AADHAAR");

    // 5c. Valid initiate with 12-digit mock Aadhaar
    const initRes = await request(app)
      .post("/api/identity/aadhaar/initiate")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ aadhaar: "999988881234", consent: true });

    assert.equal(initRes.status, 200);
    assert.equal(initRes.body.dev, true);
    assert.equal(initRes.body.devLast4, "1234");
    assert.match(initRes.body.reference, /^CP-AADHAAR-DEV-/);

    // 5d. Verification with wrong last 4 digits fails
    const wrongLast4Res = await request(app)
      .post("/api/identity/aadhaar/verify")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ last4: "9999" });

    assert.equal(wrongLast4Res.status, 400);
    assert.equal(wrongLast4Res.body.code, "VERIFICATION_FAILED");

    // 5e. Verification with correct last 4 digits succeeds
    const correctLast4Res = await request(app)
      .post("/api/identity/aadhaar/verify")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ last4: "1234" });

    assert.equal(correctLast4Res.status, 200);
    assert.equal(correctLast4Res.body.aadhaarVerified, true);
  });

  await t.test("6. Fully verified patient can now upload records and create shares", async () => {
    // 6a. Upload succeeds
    const uploadRes = await request(app)
      .post("/api/files")
      .set("Authorization", `Bearer ${authToken}`)
      .attach("file", Buffer.from("%PDF-1.4 Demo test record content"), "demo_record.pdf");

    assert.equal(uploadRes.status, 201);
    assert.ok(uploadRes.body.id);
    const fileId = uploadRes.body.id;

    // 6b. Share succeeds
    const shareRes = await request(app)
      .post("/api/shares")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ doctorId: "d1", recordIds: [fileId], hours: "24" });

    assert.equal(shareRes.status, 201);
    assert.ok(shareRes.body.share?.id);
    assert.ok(shareRes.body.pin);
    assert.equal(shareRes.body.pin.length, 6);
  });

  await t.test("7. Production isolation ensures dev delivery is strictly blocked in production", async () => {
    // Test isDevDeliveryAllowed directly
    assert.equal(isDevDeliveryAllowed(undefined), true, "Allowed when DEMO_MODE=true in test");

    const prevNodeEnv = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = "production";
      assert.equal(isDevDeliveryAllowed(undefined), false, "Dev delivery strictly forbidden in production");
    } finally {
      process.env.NODE_ENV = prevNodeEnv;
    }

    const prevDemoMode = process.env.DEMO_MODE;
    try {
      process.env.DEMO_MODE = "false";
      assert.equal(isDevDeliveryAllowed(undefined), false, "Dev delivery strictly forbidden when DEMO_MODE != true");
    } finally {
      process.env.DEMO_MODE = prevDemoMode;
    }
  });
});
