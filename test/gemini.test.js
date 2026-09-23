import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

process.env.NODE_ENV = "test";
process.env.DEMO_MODE = "true";

const { default: app } = await import("../src/index.js");

test("GET /api/ai/status returns healthy status and capabilities list", async () => {
  const res = await request(app).get("/api/ai/status");
  assert.equal(res.status, 200);
  assert.equal(res.body.status, "online");
  assert.equal(res.body.model, "gemini-3.8-flash");
  assert.equal(typeof res.body.apiKeyConfigured, "boolean");
  assert.ok(Array.isArray(res.body.features));
  assert.ok(res.body.features.includes("medical_report_summarization"));
  assert.ok(res.body.features.includes("prescription_extraction"));
  assert.ok(res.body.features.includes("patient_chatbot"));
  assert.ok(res.body.features.includes("symptom_triage"));
});

test("POST /api/ai/report-summary summarizes lab report with structured clinical insights", async () => {
  const sampleReport = `
    Comprehensive Metabolic & Glycemic Panel
    Patient: John Doe, Age: 45
    HbA1c: 8.4 % (Ref: 4.0 - 5.6 %) HIGH
    Fasting Blood Glucose: 168 mg/dL (Ref: 70 - 99 mg/dL) HIGH
    Serum Creatinine: 1.1 mg/dL (Ref: 0.6 - 1.2 mg/dL) NORMAL
    Total Cholesterol: 235 mg/dL (Ref: < 200 mg/dL) HIGH
  `;

  const res = await request(app)
    .post("/api/ai/report-summary")
    .send({ reportText: sampleReport, patientContext: "Known Type 2 Diabetic on Metformin" });

  assert.equal(res.status, 200);
  assert.ok(res.body.patientSummary);
  assert.ok(res.body.clinicalSummary);
  assert.ok(Array.isArray(res.body.keyFindings));
  assert.ok(res.body.keyFindings.length > 0);
  assert.ok(Array.isArray(res.body.potentialConcerns));
  assert.ok(Array.isArray(res.body.questionsForDoctor));
  assert.ok(res.body.urgency);
});

test("POST /api/ai/report-summary rejects missing reportText with 400", async () => {
  const res = await request(app).post("/api/ai/report-summary").send({});
  assert.equal(res.status, 400);
  assert.match(res.body.error, /reportText/i);
});

test("POST /api/ai/prescription-extract extracts structured medications and schedules", async () => {
  const samplePrescription = `
    Rx:
    1. Tab. Paracetamol 650mg - 1 tablet 1-0-1 after food for 3 days
    2. Cap. Amoxicillin 500mg - 1 capsule TID after food for 7 days
    3. Tab. Pantoprazole 40mg - 1 tablet OD empty stomach in morning for 7 days
    Advice: Warm water gargle, avoid cold drinks.
  `;

  const res = await request(app)
    .post("/api/ai/prescription-extract")
    .send({ prescriptionText: samplePrescription });

  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.medications));
  assert.ok(res.body.medications.length >= 1);
  const med = res.body.medications[0];
  assert.ok(med.medicineName);
  assert.ok(med.dosage);
  assert.ok(med.frequency);
});

test("POST /api/ai/prescription-extract rejects missing prescriptionText with 400", async () => {
  const res = await request(app).post("/api/ai/prescription-extract").send({});
  assert.equal(res.status, 400);
  assert.match(res.body.error, /prescriptionText/i);
});

test("POST /api/ai/patient-chat generates conversational medical assistance with safety boundaries", async () => {
  const res = await request(app)
    .post("/api/ai/patient-chat")
    .send({
      message: "I have had a mild fever of 99.5 F and slight body ache since yesterday. What should I do?",
      conversationHistory: [],
      patientProfile: { age: 32, sex: "Female" }
    });

  assert.equal(res.status, 200);
  assert.ok(res.body.reply);
  assert.ok(typeof res.body.reply === "string");
  assert.ok(res.body.timestamp);
});

test("POST /api/ai/patient-chat triggers urgent escalation for red-flag emergency symptoms", async () => {
  const res = await request(app)
    .post("/api/ai/patient-chat")
    .send({
      message: "I am having sudden crushing chest pain radiating to my left jaw and I can't breathe!",
      conversationHistory: []
    });

  assert.equal(res.status, 200);
  assert.ok(res.body.reply);
  assert.match(res.body.reply, /emergency|108|112|911|hospital/i);
});

test("POST /api/ai/symptom-triage categorizes emergency vs routine urgency correctly", async () => {
  // Emergency scenario
  const emergencyRes = await request(app)
    .post("/api/ai/symptom-triage")
    .send({
      symptoms: "Severe acute chest pain radiating to left arm with profuse sweating and nausea",
      patientAge: 58,
      gender: "Male",
      duration: "30 minutes",
      severity: 9
    });

  assert.equal(emergencyRes.status, 200);
  assert.equal(emergencyRes.body.urgencyLevel, "EMERGENCY");
  assert.equal(emergencyRes.body.recommendedSpecialty, "Cardiology");
  assert.ok(emergencyRes.body.redFlagsIdentified.length > 0);

  // Routine scenario
  const routineRes = await request(app)
    .post("/api/ai/symptom-triage")
    .send({
      symptoms: "Mild dry skin rash on elbow with occasional itching for 2 weeks",
      patientAge: 26,
      gender: "Female",
      duration: "2 weeks",
      severity: 2
    });

  assert.equal(routineRes.status, 200);
  assert.ok(["ROUTINE", "SELF_CARE"].includes(routineRes.body.urgencyLevel));
  assert.equal(routineRes.body.recommendedSpecialty, "Dermatology");
});

test("POST /api/ai/document-scan deciphers handwritten document from base64 image", async () => {
  // 1x1 transparent PNG as test base64 image
  const dummyBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

  const res = await request(app)
    .post("/api/ai/document-scan")
    .send({
      image: dummyBase64,
      mimeType: "image/png",
      textHint: "Doctor handwritten prescription: Paracetamol 650mg 1-0-1"
    });

  assert.equal(res.status, 200);
  assert.ok(res.body.documentType);
  assert.ok(res.body.ocrText);
  assert.ok(Array.isArray(res.body.medications));
  assert.ok(res.body.medications.length >= 1);
});

test("POST /api/ai/prescription-extract accepts base64 image for handwriting vision", async () => {
  const dummyBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

  const res = await request(app)
    .post("/api/ai/prescription-extract")
    .send({
      image: dummyBase64,
      mimeType: "image/png"
    });

  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.medications));
  assert.ok(res.body.medications.length >= 1);
});

test("POST /api/ai/report-summary accepts base64 image for diagnostic lab vision", async () => {
  const dummyBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

  const res = await request(app)
    .post("/api/ai/report-summary")
    .send({
      image: dummyBase64,
      mimeType: "image/png",
      patientContext: "Handwritten lab slip"
    });

  assert.equal(res.status, 200);
  assert.ok(res.body.patientSummary);
  assert.ok(Array.isArray(res.body.keyFindings));
});

test("POST /api/ai/multi-report-summary synthesizes multiple shared reports for doctor", async () => {
  const sampleReports = [
    {
      id: "rec-1",
      name: "CBC_Blood_Panel.pdf",
      type: "PDF document",
      text: "HbA1c: 8.4% (HIGH), Fasting Blood Glucose: 168 mg/dL (HIGH), Hemoglobin: 11.2 g/dL (LOW)"
    },
    {
      id: "rec-2",
      name: "Physician_Prescription.jpg",
      type: "Image",
      text: "Rx: Tab Metformin 500mg BD, Tab Paracetamol 650mg SOS"
    }
  ];

  const res = await request(app)
    .post("/api/ai/multi-report-summary")
    .send({
      reports: sampleReports,
      patientName: "Swyom Sharma",
      patientContext: "Patient shared 2 diagnostic documents"
    });

  assert.equal(res.status, 200);
  assert.ok(res.body.overallSummary);
  assert.ok(res.body.urgency);
  assert.equal(res.body.reportCount, 2);
  assert.ok(Array.isArray(res.body.abnormalParameters));
  assert.ok(Array.isArray(res.body.medicationsIdentified));
  assert.ok(res.body.clinicalCorrelation);
  assert.ok(Array.isArray(res.body.recommendationsForDoctor));
});

test("POST /api/ai/multi-report-summary rejects empty reports with 400", async () => {
  const res = await request(app)
    .post("/api/ai/multi-report-summary")
    .send({ reports: [] });

  assert.equal(res.status, 400);
  assert.match(res.body.error, /reports/i);
});
