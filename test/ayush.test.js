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

test("ayush intake can be created and retrieved", async () => {
  const jwt = await patientToken();
  const payload = {
    id: "ayush-intake-test-1",
    patientName: "Swyom Sharma",
    type: "AYUSH_CLASSICAL_INTAKE",
    doctorAssigned: "Dr. Rajeshwar Sharma",
    doctorSpecialty: "Ayurvedic Medicine & Panchakarma",
    profile: {
      prakriti: { type: "Vata-Pitta Dwandwaja", percentages: { vata: 50, pitta: 35, kapha: 15 } },
      vikriti: { dominant: "Pitta Vriddhi (Imbalance)", hasAma: false },
      agni: { id: "tikshnagni", title: "Tikshnagni (Hyper-Intense / Sharp Fire)" },
      nadi: { id: "manduka_gati", title: "Manduka Gati (Frog Movement — Pitta Nadi)" }
    }
  };

  const createRes = await request(app)
    .post("/api/ayush/intakes")
    .set("Authorization", `Bearer ${jwt}`)
    .send(payload);

  assert.equal(createRes.status, 201);
  assert.equal(createRes.body.id, "ayush-intake-test-1");
  assert.equal(createRes.body.doctorAssigned, "Dr. Rajeshwar Sharma");

  const getRes = await request(app)
    .get("/api/ayush/intakes/latest")
    .set("Authorization", `Bearer ${jwt}`);

  assert.equal(getRes.status, 200);
  assert.equal(getRes.body.id, "ayush-intake-test-1");
  assert.equal(getRes.body.profile.prakriti.type, "Vata-Pitta Dwandwaja");
});
