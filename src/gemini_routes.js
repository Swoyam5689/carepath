// ==========================================================================
// CarePath Gemini AI Clinical Intelligence — Express Router
// Endpoints:
//   - POST /api/ai/report-summary       (Medical report summarization from text/image)
//   - POST /api/ai/prescription-extract (Prescription parameter & handwriting extraction)
//   - POST /api/ai/document-scan        (Multimodal vision handwriting digitization)
//   - POST /api/ai/patient-chat         (Interactive patient chatbot)
//   - POST /api/ai/symptom-triage       (Symptom triage & specialist routing)
//   - GET  /api/ai/status               (AI subsystem health & config status)
// ==========================================================================

import { Router } from "express";
import {
  summarizeMedicalReport,
  extractPrescription,
  scanDocumentWithGemini,
  patientChat,
  triageSymptoms,
  generateMultiReportSummary
} from "./gemini_service.js";

const router = Router();

/**
 * 1. Medical Report Summarization Endpoint (Text & Image)
 * POST /api/ai/report-summary
 * Body: { reportText?: string, image?: string (base64), mimeType?: string, patientContext?: string }
 */
router.post("/api/ai/report-summary", async (req, res) => {
  try {
    const { reportText, image, mimeType, patientContext } = req.body || {};
    if ((!reportText || !reportText.trim()) && !image) {
      return res.status(400).json({ error: "Missing required field: either 'reportText' or 'image' must be provided" });
    }

    const summary = await summarizeMedicalReport({ reportText, image, mimeType, patientContext });
    return res.json(summary);
  } catch (err) {
    console.error("Error in /api/ai/report-summary:", err);
    return res.status(500).json({ error: err.message || "Failed to summarize medical report" });
  }
});

/**
 * 2. Prescription Extraction & Handwriting Deciphering Endpoint
 * POST /api/ai/prescription-extract
 * Body: { prescriptionText?: string, image?: string (base64), mimeType?: string }
 */
router.post("/api/ai/prescription-extract", async (req, res) => {
  try {
    const { prescriptionText, image, mimeType } = req.body || {};
    if ((!prescriptionText || !prescriptionText.trim()) && !image) {
      return res.status(400).json({ error: "Missing required field: either 'prescriptionText' or 'image' must be provided" });
    }

    const extracted = await extractPrescription({ prescriptionText, image, mimeType });
    return res.json(extracted);
  } catch (err) {
    console.error("Error in /api/ai/prescription-extract:", err);
    return res.status(500).json({ error: err.message || "Failed to extract prescription" });
  }
});

/**
 * 3. Generalized Multimodal Document Scanner Endpoint
 * Reads handwritten doctor prescriptions, clinic slips, and lab tests directly from image/PDF.
 * POST /api/ai/document-scan
 * Body: { image: string (base64), mimeType?: string, textHint?: string }
 */
router.post("/api/ai/document-scan", async (req, res) => {
  try {
    const { image, mimeType, textHint } = req.body || {};
    if (!image && (!textHint || !textHint.trim())) {
      return res.status(400).json({ error: "Missing required field: 'image' (base64 string) is required" });
    }

    const result = await scanDocumentWithGemini({ image, mimeType, textHint });
    return res.json(result);
  } catch (err) {
    console.error("Error in /api/ai/document-scan:", err);
    return res.status(500).json({ error: err.message || "Failed to scan document with Gemini Vision" });
  }
});

/**
 * 4. Patient Care Chatbot Endpoint
 * POST /api/ai/patient-chat
 * Body: { message: string, conversationHistory?: Array, patientProfile?: Object }
 */
router.post("/api/ai/patient-chat", async (req, res) => {
  try {
    const { message, conversationHistory, patientProfile } = req.body || {};
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Missing required field: 'message'" });
    }

    const response = await patientChat({ message, conversationHistory, patientProfile });
    return res.json(response);
  } catch (err) {
    console.error("Error in /api/ai/patient-chat:", err);
    return res.status(500).json({ error: err.message || "Failed to process chat message" });
  }
});

/**
 * 5. Symptom Triage Endpoint
 * POST /api/ai/symptom-triage
 * Body: { symptoms: string, patientAge?: number|string, gender?: string, duration?: string, severity?: number|string, existingConditions?: Array|string }
 */
router.post("/api/ai/symptom-triage", async (req, res) => {
  try {
    const { symptoms, patientAge, gender, duration, severity, existingConditions } = req.body || {};
    if (!symptoms || typeof symptoms !== "string" || !symptoms.trim()) {
      return res.status(400).json({ error: "Missing required field: 'symptoms'" });
    }

    const triage = await triageSymptoms({
      symptoms,
      patientAge,
      gender,
      duration,
      severity,
      existingConditions
    });
    return res.json(triage);
  } catch (err) {
    console.error("Error in /api/ai/symptom-triage:", err);
    return res.status(500).json({ error: err.message || "Failed to triage symptoms" });
  }
});

/**
 * 6. Multi-Report Clinical Consolidation & Doctor Summary Endpoint
 * POST /api/ai/multi-report-summary
 * Body: { reports: Array, patientName?: string, patientContext?: string }
 */
router.post("/api/ai/multi-report-summary", async (req, res) => {
  try {
    const { reports, patientName, patientContext } = req.body || {};
    if (!Array.isArray(reports) || !reports.length) {
      return res.status(400).json({ error: "Missing required field: 'reports' must be a non-empty array of report objects" });
    }

    const summary = await generateMultiReportSummary({ reports, patientName, patientContext });
    return res.json(summary);
  } catch (err) {
    console.error("Error in /api/ai/multi-report-summary:", err);
    return res.status(500).json({ error: err.message || "Failed to generate multi-report clinical summary" });
  }
});

/**
 * 7. Gemini AI System Health & Status Endpoint
 * GET /api/ai/status
 */
router.get("/api/ai/status", (_req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== "");
  res.json({
    status: "online",
    model: "gemini-3.8-flash",
    apiKeyConfigured: hasKey,
    features: [
      "handwritten_document_vision",
      "medical_report_summarization",
      "prescription_extraction",
      "patient_chatbot",
      "symptom_triage",
      "multi_report_clinical_summary"
    ],
    multimodalVisionEnabled: true,
    resilientFallbackEnabled: true
  });
});

export default router;
