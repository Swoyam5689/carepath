import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";
import { appendLedgerEntry, verifyLedger, resetInMemoryLedger } from "../src/ledger.js";

process.env.NODE_ENV = "test";
process.env.DEMO_MODE = "true";

const { default: app, inMemoryUsers } = await import("../src/index.js");
const jwtSecret = process.env.JWT_SECRET || "development-only-change-me";

const TENANT_A = "11111111-1111-1111-1111-111111111111";
const TENANT_B = "22222222-2222-2222-2222-222222222222";

function makeToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      tenantId: user.tenantId
    },
    jwtSecret,
    { expiresIn: "1h" }
  );
}

test("multitenancy: intakes created in Tenant A are invisible to doctor in Tenant B", async () => {
  const patientA = { id: "user-patient-a", email: "pat-a@test.com", role: "patient", name: "Patient A", tenantId: TENANT_A };
  const doctorB = { id: "user-doc-b", email: "doc-b@test.com", role: "doctor", name: "Dr. Tenant B", tenantId: TENANT_B };
  const doctorA = { id: "user-doc-a", email: "doc-a@test.com", role: "doctor", name: "Dr. Tenant A", tenantId: TENANT_A };

  const tokenPatientA = makeToken(patientA);
  const tokenDocB = makeToken(doctorB);
  const tokenDocA = makeToken(doctorA);

  const intakeId = `intake-${Date.now()}`;
  const createRes = await request(app)
    .post("/api/medikiosk/intakes")
    .set("Authorization", `Bearer ${tokenPatientA}`)
    .send({
      id: intakeId,
      patientName: "Patient A",
      summary: { chiefComplaint: "Tenant A Fever" },
      triageStatus: "ROUTINE_OUTPATIENT"
    });

  assert.equal(createRes.status, 201);
  assert.equal(createRes.body.tenantId, TENANT_A);

  // Doctor A should see the intake
  const listA = await request(app)
    .get("/api/medikiosk/intakes")
    .set("Authorization", `Bearer ${tokenDocA}`);

  assert.equal(listA.status, 200);
  assert.ok(listA.body.some(i => i.id === intakeId));

  // Doctor B must NOT see the intake
  const listB = await request(app)
    .get("/api/medikiosk/intakes")
    .set("Authorization", `Bearer ${tokenDocB}`);

  assert.equal(listB.status, 200);
  assert.ok(!listB.body.some(i => i.id === intakeId));
});

test("multitenancy: patients cannot list all intakes", async () => {
  const patient = { id: "patient-regular", email: "pat@test.com", role: "patient", name: "Regular Patient", tenantId: TENANT_A };
  const token = makeToken(patient);

  const res = await request(app)
    .get("/api/medikiosk/intakes")
    .set("Authorization", `Bearer ${token}`);

  assert.equal(res.status, 403);
  assert.ok(res.body.error.includes("Only doctors and clinical staff"));
});

test("multitenancy: ledger chains remain cryptographically isolated per tenant", async () => {
  resetInMemoryLedger();

  // Interleave entries for Tenant A and Tenant B
  await appendLedgerEntry("event_A1", "00000000-0000-0000-0000-000000000001", { step: 1 }, TENANT_A);
  await appendLedgerEntry("event_B1", "00000000-0000-0000-0000-000000000002", { step: 1 }, TENANT_B);
  await appendLedgerEntry("event_A2", "00000000-0000-0000-0000-000000000003", { step: 2 }, TENANT_A);
  await appendLedgerEntry("event_B2", "00000000-0000-0000-0000-000000000004", { step: 2 }, TENANT_B);

  // Validate Tenant A's independent chain
  const verifyA = await verifyLedger(TENANT_A);
  assert.equal(verifyA.valid, true);
  assert.equal(verifyA.count, 2);

  // Validate Tenant B's independent chain
  const verifyB = await verifyLedger(TENANT_B);
  assert.equal(verifyB.valid, true);
  assert.equal(verifyB.count, 2);
});

test("multitenancy: shares are strictly isolated per tenant with no null fallback", async () => {
  const patientA = { id: "user-patient-iso-a", email: "pat-iso-a@test.com", role: "patient", name: "Patient Iso A", tenantId: TENANT_A, email_verified: true, phone_verified: true, aadhaar_verified: true };
  const patientB = { id: "user-patient-iso-b", email: "pat-iso-b@test.com", role: "patient", name: "Patient Iso B", tenantId: TENANT_B, email_verified: true, phone_verified: true, aadhaar_verified: true };
  inMemoryUsers.set(patientA.id, patientA);
  inMemoryUsers.set(patientB.id, patientB);
  const tokenA = makeToken(patientA);
  const tokenB = makeToken(patientB);

  // Create share in Tenant A
  const shareRes = await request(app)
    .post("/api/shares")
    .set("Authorization", `Bearer ${tokenA}`)
    .send({ doctorId: "d1", recordIds: ["rec-1"], hours: 24 });
  assert.equal(shareRes.status, 201);
  const shareId = shareRes.body.share.id;
  const sharePin = shareRes.body.pin;

  // Patient B in Tenant B attempts to access Patient A's share
  const crossAccess = await request(app)
    .post(`/api/shares/${shareId}/access`)
    .set("Authorization", `Bearer ${tokenB}`)
    .send({ pin: sharePin });
  assert.equal(crossAccess.status, 404);
});
