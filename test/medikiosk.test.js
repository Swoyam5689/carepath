import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

process.env.NODE_ENV = "test";
process.env.DEMO_MODE = "true";
const { default: app } = await import("../src/index.js");

async function patientToken() {
  const response = await request(app).post("/api/auth/session").send({ role: "patient" });
  assert.equal(response.status, 200);
  return response.body.token;
}

async function doctorToken() {
  const response = await request(app).post("/api/auth/session").send({ role: "doctor" });
  assert.equal(response.status, 200);
  return response.body.token;
}

test("medikiosk intake can be created and retrieved", async () => {
  const jwt = await patientToken();
  const payload = {
    id: "test-intake-1",
    patientName: "Swyom Sharma",
    abhaId: "91-4455-8822-1923",
    summary: {
      chiefComplaint: "Chest Pain",
      socrates: { site: "Left Chest", severityScore: "8/10" },
      triageStatus: "ROUTINE_OUTPATIENT"
    },
    fhirBundle: { resourceType: "Bundle", type: "document" }
  };

  const createRes = await request(app)
    .post("/api/medikiosk/intakes")
    .set("Authorization", `Bearer ${jwt}`)
    .send(payload);

  assert.equal(createRes.status, 201);
  assert.equal(createRes.body.id, "test-intake-1");
  assert.equal(createRes.body.abhaId, "91-4455-8822-1923");

  const getRes = await request(app)
    .get("/api/medikiosk/intakes/latest")
    .set("Authorization", `Bearer ${jwt}`);

  assert.equal(getRes.status, 200);
  assert.equal(getRes.body.id, "test-intake-1");
});

test("doctor can review and amend medikiosk clinical summary", async () => {
  const docJwt = await doctorToken();
  const reviewRes = await request(app)
    .put("/api/medikiosk/intakes/test-intake-1/review")
    .set("Authorization", `Bearer ${docJwt}`)
    .send({
      action: "accepted",
      physicianNotes: "ECG reviewed; troponin-I negative. Prescribed antacid and rest.",
      amendedSummary: {
        chiefComplaint: "Chest Pain (Non-cardiac)",
        doctorConfirmedDiagnosis: "Gastroesophageal Reflux Disease (GERD)"
      }
    });

  assert.equal(reviewRes.status, 200);
  assert.equal(reviewRes.body.doctorReview.action, "accepted");
  assert.equal(reviewRes.body.doctorReview.physicianNotes.includes("troponin-I"), true);
});

test("red flag intake triggers emergency queue priority", async () => {
  const jwt = await patientToken();
  const emergencyPayload = {
    id: "test-emergency-1",
    triageStatus: "EMERGENCY_CODE_RED",
    summary: { chiefComplaint: "Acute Chest Pain + Diaphoresis", triageStatus: "EMERGENCY_CODE_RED" }
  };

  const res = await request(app)
    .post("/api/medikiosk/intakes")
    .set("Authorization", `Bearer ${jwt}`)
    .send(emergencyPayload);

  assert.equal(res.status, 201);

  const emergencyRes = await request(app)
    .get("/api/medikiosk/triage/emergency")
    .set("Authorization", `Bearer ${jwt}`);

  assert.equal(emergencyRes.status, 200);
  assert.ok(emergencyRes.body.some(i => i.id === "test-emergency-1"));
});

test("session clear endpoint wipes temporary records for DPDP privacy", async () => {
  const jwt = await patientToken();
  const clearRes = await request(app)
    .post("/api/medikiosk/session/clear")
    .set("Authorization", `Bearer ${jwt}`);

  assert.equal(clearRes.status, 200);
  assert.equal(clearRes.body.cleared, true);
});
