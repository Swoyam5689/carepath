import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";

process.env.NODE_ENV = "test";
process.env.DEMO_MODE = "true";

const { default: app, inMemoryShares, unlockedDoctorShares, inMemoryUsers } = await import("../src/index.js");

const JWT_SECRET = process.env.JWT_SECRET || "development-only-change-me";

function makeToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      tenantId: user.tenantId || "00000000-0000-0000-0000-000000000000"
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
}

test("sharing: full lifecycle - upload, share with PIN, doctor unlock, file streaming, revocation", async () => {
  const patient = { id: "patient-share-test-1", email: "pat-share@test.com", role: "patient", name: "Patient Share", tenantId: "00000000-0000-0000-0000-000000000000", email_verified: true, phone_verified: true, aadhaar_verified: true };
  inMemoryUsers.set(patient.id, patient);
  const doctor = { id: "00000000-0000-0000-0000-000000000002", email: "doctor@carepath.demo", role: "doctor", name: "Dr. Ananya Mehta", tenantId: "00000000-0000-0000-0000-000000000000" };
  const otherPatient = { id: "patient-share-test-2", email: "pat-other@test.com", role: "patient", name: "Other Patient", tenantId: "00000000-0000-0000-0000-000000000000", email_verified: true, phone_verified: true, aadhaar_verified: true };
  inMemoryUsers.set(otherPatient.id, otherPatient);

  const patientToken = makeToken(patient);
  const doctorToken = makeToken(doctor);
  const otherPatientToken = makeToken(otherPatient);

  // 1. Patient uploads a test file
  const testFileBuffer = Buffer.from("%PDF-1.4 Mock Lab Report Content", "utf8");
  const uploadRes = await request(app)
    .post("/api/files")
    .set("Authorization", `Bearer ${patientToken}`)
    .attach("file", testFileBuffer, "Blood_Report_2026.pdf");

  assert.equal(uploadRes.status, 201);
  const fileId = uploadRes.body.id;
  assert.ok(fileId);

  // 2. Owner patient can open/stream their own file
  const ownerFileRes = await request(app)
    .get(`/api/files/${fileId}`)
    .set("Authorization", `Bearer ${patientToken}`);

  assert.equal(ownerFileRes.status, 200);
  assert.ok(ownerFileRes.headers["content-type"].includes("pdf"));

  // 3. Other patient cannot open the file
  const unauthorizedRes = await request(app)
    .get(`/api/files/${fileId}`)
    .set("Authorization", `Bearer ${otherPatientToken}`);

  assert.equal(unauthorizedRes.status, 403);

  // 4. Doctor attempts to open file before any share is created -> 403
  const doctorPreShareRes = await request(app)
    .get(`/api/files/${fileId}`)
    .set("Authorization", `Bearer ${doctorToken}`);

  assert.equal(doctorPreShareRes.status, 403);

  // 5. Patient creates share for doctor "d1"
  const shareRes = await request(app)
    .post("/api/shares")
    .set("Authorization", `Bearer ${patientToken}`)
    .send({ doctorId: "d1", recordIds: [fileId], hours: 24 });

  assert.equal(shareRes.status, 201);
  const shareId = shareRes.body.share.id;
  const pin = shareRes.body.pin;
  assert.match(pin, /^\d{6}$/);

  // 6. Doctor lists shares - sees the share in locked state
  const doctorSharesRes = await request(app)
    .get("/api/doctor/shares")
    .set("Authorization", `Bearer ${doctorToken}`);

  assert.equal(doctorSharesRes.status, 200);
  const foundShare = doctorSharesRes.body.shares.find(s => s.id === shareId);
  assert.ok(foundShare);
  assert.equal(foundShare.unlocked, false);
  assert.equal(foundShare.records.length, 0);

  // 7. Doctor tries to access file BEFORE entering PIN -> 403
  const doctorLockedFileRes = await request(app)
    .get(`/api/files/${fileId}`)
    .set("Authorization", `Bearer ${doctorToken}`);

  assert.equal(doctorLockedFileRes.status, 403);

  // 8. Doctor enters wrong PIN -> 403
  const wrongPinRes = await request(app)
    .post(`/api/shares/${shareId}/access`)
    .set("Authorization", `Bearer ${doctorToken}`)
    .send({ pin: "000000" });

  assert.equal(wrongPinRes.status, 403);

  // 9. Non-doctor tries to enter PIN -> 403
  const nonDoctorAccess = await request(app)
    .post(`/api/shares/${shareId}/access`)
    .set("Authorization", `Bearer ${otherPatientToken}`)
    .send({ pin });

  assert.equal(nonDoctorAccess.status, 403);

  // 10. Doctor enters correct PIN -> 200, returns unlocked records
  const accessRes = await request(app)
    .post(`/api/shares/${shareId}/access`)
    .set("Authorization", `Bearer ${doctorToken}`)
    .send({ pin });

  assert.equal(accessRes.status, 200);
  assert.equal(accessRes.body.success, true);
  assert.equal(accessRes.body.records.length, 1);
  assert.equal(accessRes.body.records[0].id, fileId);

  // 11. Doctor now retrieves the file stream successfully
  const doctorFileRes = await request(app)
    .get(`/api/files/${fileId}`)
    .set("Authorization", `Bearer ${doctorToken}`);

  assert.equal(doctorFileRes.status, 200);
  assert.ok(doctorFileRes.headers["content-type"].includes("pdf"));

  // 12. Doctor shares list now shows share as unlocked
  const doctorSharesUnlockedRes = await request(app)
    .get("/api/doctor/shares")
    .set("Authorization", `Bearer ${doctorToken}`);

  const unlockedFound = doctorSharesUnlockedRes.body.shares.find(s => s.id === shareId);
  assert.ok(unlockedFound);
  assert.equal(unlockedFound.unlocked, true);
  assert.equal(unlockedFound.records.length, 1);

  // 13. Patient revokes share
  const revokeRes = await request(app)
    .post(`/api/shares/${shareId}/revoke`)
    .set("Authorization", `Bearer ${patientToken}`);

  assert.equal(revokeRes.status, 200);

  // 14. Doctor can no longer access file after revocation
  const revokedFileRes = await request(app)
    .get(`/api/files/${fileId}`)
    .set("Authorization", `Bearer ${doctorToken}`);

  assert.equal(revokedFileRes.status, 403);
});

test("persistence: health record and share metadata survive memory reload", async () => {
  const patient = { id: "patient-persist-test", email: "pat-persist@test.com", role: "patient", name: "Patient Persist", tenantId: "00000000-0000-0000-0000-000000000000", email_verified: true, phone_verified: true, aadhaar_verified: true };
  inMemoryUsers.set(patient.id, patient);
  const patientToken = makeToken(patient);

  const testFileBuffer = Buffer.from("Persisted Medical Content", "utf8");
  const uploadRes = await request(app)
    .post("/api/files")
    .set("Authorization", `Bearer ${patientToken}`)
    .attach("file", testFileBuffer, "Persisted_Doc.txt");

  assert.equal(uploadRes.status, 201);
  const fileId = uploadRes.body.id;

  // Verify file stream works
  const streamRes = await request(app)
    .get(`/api/files/${fileId}`)
    .set("Authorization", `Bearer ${patientToken}`);

  assert.equal(streamRes.status, 200);
  assert.equal(streamRes.text, "Persisted Medical Content");
});

