import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

process.env.NODE_ENV = "test";
process.env.DEMO_MODE = "true";

const { default: app, inMemoryUsers, initInMemoryDemoUsers, accountLockoutTracker } = await import("../src/index.js");

test("auth: patient self-registration succeeds with strong password", async () => {
  const email = `patient-${Date.now()}@example.com`;
  const res = await request(app)
    .post("/api/auth/register")
    .send({
      email,
      name: "New Test Patient",
      password: "SuperSecretPassword123!",
      role: "patient"
    });

  assert.equal(res.status, 201);
  assert.ok(res.body.token);
  assert.equal(res.body.user.email, email);
  assert.equal(res.body.user.role, "patient");
  assert.equal(res.body.user.authenticated, true);
});

test("auth: registration rejects non-patient roles", async () => {
  const res = await request(app)
    .post("/api/auth/register")
    .send({
      email: "hacker-doctor@example.com",
      name: "Dr. Hacker",
      password: "SuperSecretPassword123!",
      role: "doctor"
    });

  assert.equal(res.status, 403);
  assert.ok(res.body.error.includes("Only patient registration"));
});

test("auth: registration rejects passwords shorter than 10 characters", async () => {
  const res = await request(app)
    .post("/api/auth/register")
    .send({
      email: "short-pwd@example.com",
      name: "Short Pwd",
      password: "12345",
      role: "patient"
    });

  assert.equal(res.status, 400);
  assert.ok(res.body.error.includes("at least 10 characters"));
});

test("auth: registration rejects duplicate email addresses", async () => {
  const email = `dup-${Date.now()}@example.com`;
  const first = await request(app)
    .post("/api/auth/register")
    .send({
      email,
      name: "User First",
      password: "ValidStrongPassword123!",
      role: "patient"
    });
  assert.equal(first.status, 201);

  const duplicate = await request(app)
    .post("/api/auth/register")
    .send({
      email,
      name: "User Second",
      password: "ValidStrongPassword123!",
      role: "patient"
    });
  assert.equal(duplicate.status, 409);
});

test("auth: login succeeds for valid credentials and fails generically on mismatch", async () => {
  // Test seeded demo credentials
  const successRes = await request(app)
    .post("/api/auth/login")
    .send({
      email: "patient@carepath.demo",
      password: "Password@1234"
    });

  assert.equal(successRes.status, 200);
  assert.ok(successRes.body.token);
  assert.equal(successRes.body.user.role, "patient");

  // Wrong password
  const badPassRes = await request(app)
    .post("/api/auth/login")
    .send({
      email: "patient@carepath.demo",
      password: "IncorrectPassword!"
    });

  assert.equal(badPassRes.status, 401);
  assert.equal(badPassRes.body.error, "Invalid email or password");

  // Missing email
  const badUserRes = await request(app)
    .post("/api/auth/login")
    .send({
      email: "nonexistent@carepath.demo",
      password: "Password@1234"
    });

  assert.equal(badUserRes.status, 401);
  assert.equal(badUserRes.body.error, "Invalid email or password");
});

test("auth: unauthenticated patient mobile OTP send and verify flow", async () => {
  const mobile = "9876540000";

  const sendRes = await request(app)
    .post("/api/auth/otp/send")
    .send({ mobile });

  assert.equal(sendRes.status, 200);
  assert.equal(sendRes.body.sent, true);
  assert.ok(sendRes.body.expiresInSeconds);
  const otp = sendRes.body.devOtp;

  const verifyRes = await request(app)
    .post("/api/auth/otp/verify")
    .send({ mobile, otp });

  assert.equal(verifyRes.status, 200);
  assert.equal(verifyRes.body.verified, true);
});

test("auth: /api/auth/session returns 404 when DEMO_MODE is not true", async () => {
  const originalDemoMode = process.env.DEMO_MODE;
  try {
    process.env.DEMO_MODE = "false";
    const res = await request(app)
      .post("/api/auth/session")
      .send({ role: "patient" });

    assert.equal(res.status, 404);
    assert.ok(res.body.error.includes("disabled"));
  } finally {
    process.env.DEMO_MODE = originalDemoMode;
  }
});

test("auth: production startup fails closed if JWT_SECRET is default or missing", () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const indexPath = path.resolve(__dirname, "../src/index.js");

  const child = spawnSync(
    process.execPath,
    [indexPath],
    {
      env: {
        ...process.env,
        NODE_ENV: "production",
        JWT_SECRET: "development-only-change-me"
      },
      encoding: "utf8"
    }
  );

  assert.equal(child.status, 1);
  assert.ok(child.stderr.includes("FATAL") || child.stdout.includes("FATAL"));
});

test("auth: registration rejects requests specifying tenantId", async () => {
  const res = await request(app)
    .post("/api/auth/register")
    .send({
      email: `patient-tenant-${Date.now()}@example.com`,
      name: "Tenant Hacker",
      password: "StrongPassword123!",
      role: "patient",
      tenantId: "11111111-1111-1111-1111-111111111111"
    });

  assert.equal(res.status, 400);
  assert.ok(res.body.error.includes("tenantId is not permitted"));
});


test("auth: account lockout enforces temporary block after 5 failed attempts", async () => {
  const email = `lockout-target-${Date.now()}@carepath.demo`;
  const reg = await request(app)
    .post("/api/auth/register")
    .send({
      email,
      name: "Lockout Victim",
      password: "StrongPassword123!",
      role: "patient"
    });
  assert.equal(reg.status, 201);

  // Send 5 failed login attempts with wrong password
  for (let i = 0; i < 5; i++) {
    const failRes = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "WrongPassword" });
    assert.equal(failRes.status, 401);
  }

  // 6th attempt should be blocked with HTTP 429
  const lockedRes = await request(app)
    .post("/api/auth/login")
    .send({ email, password: "StrongPassword123!" });
  assert.equal(lockedRes.status, 429);
  assert.ok(lockedRes.body.error.includes("temporarily locked"));
});

test("auth: no privileged accounts exist in memory when DEMO_MODE is false", async () => {
  const originalDemo = process.env.DEMO_MODE;
  try {
    process.env.DEMO_MODE = "false";
    await initInMemoryDemoUsers();
    assert.equal(inMemoryUsers.size, 0);
  } finally {
    process.env.DEMO_MODE = originalDemo;
    await initInMemoryDemoUsers();
  }
});
