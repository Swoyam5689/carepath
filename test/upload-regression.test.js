import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";

process.env.NODE_ENV = "test";
process.env.DEMO_MODE = "true";

const { default: app, inMemoryUsers, DEMO_PATIENT_ID } = await import("../src/index.js");

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

test("health-record upload regression suite", async (t) => {
  await t.test("1. Seeded demo patient (Swyom Sharma) successfully uploads a health record", async () => {
    const patientUser = inMemoryUsers.get(DEMO_PATIENT_ID);
    assert.ok(patientUser, "Seeded demo patient exists in memory");
    assert.equal(patientUser.email_verified, true, "Seeded patient must be email-verified");
    assert.equal(patientUser.phone_verified, true, "Seeded patient must be phone-verified");
    assert.equal(patientUser.aadhaar_verified, true, "Seeded patient must be aadhaar-verified");

    const token = makeToken(patientUser);
    const sampleContent = "%PDF-1.4 Mock Lab Blood Report for Swyom Sharma";
    const uploadRes = await request(app)
      .post("/api/files")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from(sampleContent, "utf8"), "swyom_blood_test.pdf");

    assert.equal(uploadRes.status, 201, "Upload must succeed with HTTP 201 Created");
    assert.ok(uploadRes.body.id, "Upload must return the created record ID");
    assert.equal(uploadRes.body.stored, true, "Upload must indicate stored: true");
    assert.equal(uploadRes.body.name, "swyom_blood_test.pdf");

    // Verify record retrieval (open/download)
    const fileId = uploadRes.body.id;
    const fetchRes = await request(app)
      .get(`/api/files/${fileId}`)
      .set("Authorization", `Bearer ${token}`);

    assert.equal(fetchRes.status, 200, "Patient can retrieve uploaded record");
    assert.ok(fetchRes.headers["content-type"].includes("pdf"), "Content-type matches uploaded MIME");
  });

  await t.test("2. Unverified patient is rejected with HTTP 403 and VERIFICATION_REQUIRED code", async () => {
    // Register a new, unverified patient
    const regRes = await request(app).post("/api/auth/register").send({
      email: `unverified-patient-${Date.now()}@example.com`,
      name: "Unverified Test Patient",
      password: "StrongPassword123!",
      role: "patient"
    });
    assert.equal(regRes.status, 201);
    const unverifiedToken = regRes.body.token;

    const uploadRes = await request(app)
      .post("/api/files")
      .set("Authorization", `Bearer ${unverifiedToken}`)
      .attach("file", Buffer.from("%PDF-1.4 test"), "record.pdf");

    assert.equal(uploadRes.status, 403, "Unverified patient must be rejected with 403 Forbidden");
    assert.equal(uploadRes.body.code, "VERIFICATION_REQUIRED", "Error code must be VERIFICATION_REQUIRED");
    assert.match(
      uploadRes.body.error,
      /Complete account verification before performing this action/i,
      "Returns distinct verification error message"
    );
  });

  await t.test("3. Oversized file exceeding 15MB limit is rejected with HTTP 413 and LIMIT_FILE_SIZE code", async () => {
    const patientUser = inMemoryUsers.get(DEMO_PATIENT_ID);
    const token = makeToken(patientUser);

    // Create a buffer exceeding 15MB (15MB + 1KB)
    const oversizedBuffer = Buffer.alloc(15 * 1024 * 1024 + 1024, 0x61);

    const uploadRes = await request(app)
      .post("/api/files")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", oversizedBuffer, "huge_scan.pdf");

    assert.equal(uploadRes.status, 413, "Oversized file must be rejected with HTTP 413 Payload Too Large");
    assert.equal(uploadRes.body.code, "LIMIT_FILE_SIZE", "Error code must be LIMIT_FILE_SIZE");
    assert.match(
      uploadRes.body.error,
      /File exceeds the 15 MB size limit/i,
      "Returns distinct oversized file error message"
    );
  });
});
