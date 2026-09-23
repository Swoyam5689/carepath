/**
 * MediKiosk Medical Document Digitization & Intelligence Pipeline
 * 
 * Capabilities:
 * 1. Image preprocessing (grayscale, contrast boost, adaptive threshold)
 * 2. Tesseract.js OCR with multi-language fallback
 * 3. Structured parsing for real-life lab reports (PDF, image, structured text)
 * 4. Extraction of: Test name, numeric result, units, reference range, abnormal flags, lab name, and date
 * 5. Dynamic data-driven clinical interpretation based strictly on extracted parameters
 * 6. Drug interaction & allergy cross-check against patient active schedule
 */

import { createWorker } from "tesseract.js";
import { API_BASE } from "../api/clientApi.js";

// Comprehensive Clinical Reference Database for Multi-Panel Laboratory Investigations
export const LAB_REFERENCE_RANGES = {
  // 1. Glycemic / Diabetes Panel
  hba1c: {
    aliases: ["hba1c", "glycated hemoglobin", "glycohemoglobin", "a1c", "hb a1c"],
    name: "HbA1c (Glycated Hemoglobin)",
    unit: "%",
    min: 4.0,
    max: 5.6,
    criticalHigh: 9.0,
    interpret: (val) => {
      if (val < 5.7) return { status: "normal", label: "Normal (Non-diabetic)" };
      if (val <= 6.4) return { status: "borderline", label: "Prediabetes range" };
      if (val >= 9.0) return { status: "critical", label: "Critical poor glycemic control" };
      return { status: "high", label: "Elevated (Diabetic range)" };
    }
  },
  fasting_sugar: {
    aliases: ["fasting blood sugar", "fbs", "glucose fasting", "plasma glucose fasting"],
    name: "Fasting Blood Sugar (FBS)",
    unit: "mg/dL",
    min: 70,
    max: 99,
    criticalHigh: 250,
    criticalLow: 50,
    interpret: (val) => {
      if (val < 70) return { status: "low", label: "Hypoglycemia (Low blood sugar)" };
      if (val <= 99) return { status: "normal", label: "Normal fasting glucose" };
      if (val <= 125) return { status: "borderline", label: "Impaired fasting glucose" };
      if (val >= 250) return { status: "critical", label: "Critical hyperglycemia" };
      return { status: "high", label: "High (Diabetic threshold)" };
    }
  },
  post_prandial_sugar: {
    aliases: ["post prandial blood sugar", "ppbs", "glucose post prandial", "post meal glucose"],
    name: "Post-Prandial Blood Sugar (PPBS)",
    unit: "mg/dL",
    min: 80,
    max: 139,
    criticalHigh: 300,
    interpret: (val) => {
      if (val < 140) return { status: "normal", label: "Normal post-prandial" };
      if (val <= 199) return { status: "borderline", label: "Impaired glucose tolerance" };
      return { status: "high", label: "Elevated post-prandial glucose" };
    }
  },
  random_sugar: {
    aliases: ["random blood sugar", "rbs", "glucose random", "blood glucose"],
    name: "Random Blood Sugar (RBS)",
    unit: "mg/dL",
    min: 70,
    max: 140,
    criticalHigh: 300,
    interpret: (val) => {
      if (val < 70) return { status: "low", label: "Low (Hypoglycemia)" };
      if (val <= 140) return { status: "normal", label: "Normal" };
      if (val >= 200) return { status: "high", label: "High (Diabetic criteria)" };
      return { status: "borderline", label: "Borderline elevated" };
    }
  },

  // 2. Renal Function / Kidney Panel (KFT / RFT)
  creatinine: {
    aliases: ["serum creatinine", "creatinine", "s. creatinine", "sr creatinine", "creat"],
    name: "Serum Creatinine",
    unit: "mg/dL",
    min: 0.6,
    max: 1.2,
    criticalHigh: 3.0,
    interpret: (val) => {
      if (val <= 1.2) return { status: "normal", label: "Normal renal filtration" };
      if (val >= 3.0) return { status: "critical", label: "Critical renal impairment" };
      return { status: "high", label: "Elevated (Reduced renal clearance)" };
    }
  },
  blood_urea: {
    aliases: ["blood urea", "urea", "serum urea"],
    name: "Blood Urea",
    unit: "mg/dL",
    min: 15,
    max: 40,
    criticalHigh: 100,
    interpret: (val) => {
      if (val < 15) return { status: "low", label: "Low urea" };
      if (val <= 40) return { status: "normal", label: "Normal" };
      if (val >= 80) return { status: "critical", label: "Severely elevated (Uremia)" };
      return { status: "high", label: "Elevated (Dehydration / Renal retention)" };
    }
  },
  bun: {
    aliases: ["blood urea nitrogen", "bun"],
    name: "Blood Urea Nitrogen (BUN)",
    unit: "mg/dL",
    min: 7,
    max: 20,
    interpret: (val) => {
      if (val <= 20) return { status: "normal", label: "Normal" };
      return { status: "high", label: "Elevated" };
    }
  },
  uric_acid: {
    aliases: ["uric acid", "serum uric acid", "s. uric acid"],
    name: "Serum Uric Acid",
    unit: "mg/dL",
    min: 3.5,
    max: 7.2,
    interpret: (val) => {
      if (val < 3.5) return { status: "low", label: "Low" };
      if (val <= 7.2) return { status: "normal", label: "Normal" };
      return { status: "high", label: "Hyperuricemia (Gout / Joint risk)" };
    }
  },

  // 3. Complete Blood Count (CBC / Hemogram)
  hemoglobin: {
    aliases: ["hemoglobin", "hgb", "hb"],
    name: "Hemoglobin (Hb)",
    unit: "g/dL",
    min: 12.0,
    max: 16.5,
    criticalLow: 7.0,
    interpret: (val) => {
      if (val < 7.0) return { status: "critical", label: "Severe anemia (Transfusion alert)" };
      if (val < 12.0) return { status: "low", label: "Low (Anemia)" };
      if (val > 17.5) return { status: "high", label: "Elevated (Polycythemia)" };
      return { status: "normal", label: "Normal" };
    }
  },
  tlc: {
    aliases: ["total leucocyte count", "tlc", "wbc", "white blood cells", "total wbc"],
    name: "Total Leucocyte Count (TLC / WBC)",
    unit: "/uL",
    min: 4000,
    max: 11000,
    criticalHigh: 25000,
    interpret: (val) => {
      if (val < 4000) return { status: "low", label: "Leukopenia (Low white cells)" };
      if (val > 11000) return { status: "high", label: "Leukocytosis (Infection / Inflammation)" };
      return { status: "normal", label: "Normal" };
    }
  },
  platelets: {
    aliases: ["platelet count", "platelets", "plt"],
    name: "Platelet Count",
    unit: "/uL",
    min: 150000,
    max: 450000,
    criticalLow: 50000,
    interpret: (val) => {
      if (val < 50000) return { status: "critical", label: "Severe thrombocytopenia (Bleeding risk)" };
      if (val < 150000) return { status: "low", label: "Low platelets (Thrombocytopenia)" };
      if (val > 450000) return { status: "high", label: "Thrombocytosis" };
      return { status: "normal", label: "Normal" };
    }
  },
  esr: {
    aliases: ["erythrocyte sedimentation rate", "esr"],
    name: "ESR (Erythrocyte Sedimentation Rate)",
    unit: "mm/hr",
    min: 0,
    max: 20,
    interpret: (val) => {
      if (val <= 20) return { status: "normal", label: "Normal" };
      return { status: "high", label: "Elevated (Inflammatory response)" };
    }
  },

  // 4. Liver Function Panel (LFT)
  total_bilirubin: {
    aliases: ["total bilirubin", "serum bilirubin", "s. bilirubin", "bilirubin total", "bili total"],
    name: "Serum Bilirubin (Total)",
    unit: "mg/dL",
    min: 0.2,
    max: 1.2,
    criticalHigh: 3.0,
    interpret: (val) => {
      if (val <= 1.2) return { status: "normal", label: "Normal bilirubin" };
      if (val >= 3.0) return { status: "critical", label: "Severe hyperbilirubinemia (Clinical jaundice)" };
      return { status: "high", label: "Elevated (Jaundice indicator)" };
    }
  },
  sgot_ast: {
    aliases: ["sgot", "ast", "aspartate aminotransferase", "sgot/ast"],
    name: "SGOT / AST",
    unit: "U/L",
    min: 5,
    max: 40,
    interpret: (val) => {
      if (val <= 40) return { status: "normal", label: "Normal" };
      return { status: "high", label: "Elevated (Hepatic / Cardiac transaminase)" };
    }
  },
  sgpt_alt: {
    aliases: ["sgpt", "alt", "alanine aminotransferase", "sgpt/alt"],
    name: "SGPT / ALT",
    unit: "U/L",
    min: 7,
    max: 56,
    interpret: (val) => {
      if (val <= 56) return { status: "normal", label: "Normal" };
      return { status: "high", label: "Elevated (Hepatocellular injury / Fatty liver)" };
    }
  },
  alkaline_phosphatase: {
    aliases: ["alkaline phosphatase", "alp"],
    name: "Alkaline Phosphatase (ALP)",
    unit: "U/L",
    min: 44,
    max: 147,
    interpret: (val) => {
      if (val <= 147) return { status: "normal", label: "Normal" };
      return { status: "high", label: "Elevated (Biliary or bone involvement)" };
    }
  },

  // 5. Lipid Profile
  total_cholesterol: {
    aliases: ["total cholesterol", "serum cholesterol", "cholesterol total"],
    name: "Total Cholesterol",
    unit: "mg/dL",
    min: 100,
    max: 200,
    interpret: (val) => {
      if (val <= 200) return { status: "normal", label: "Desirable (< 200 mg/dL)" };
      if (val <= 239) return { status: "borderline", label: "Borderline high" };
      return { status: "high", label: "High cholesterol (Atherogenic risk)" };
    }
  },
  triglycerides: {
    aliases: ["serum triglycerides", "triglycerides", "tg"],
    name: "Serum Triglycerides",
    unit: "mg/dL",
    min: 50,
    max: 150,
    interpret: (val) => {
      if (val <= 150) return { status: "normal", label: "Normal (< 150 mg/dL)" };
      if (val <= 199) return { status: "borderline", label: "Borderline high" };
      return { status: "high", label: "Elevated (Hypertriglyceridemia)" };
    }
  },
  hdl_cholesterol: {
    aliases: ["hdl cholesterol", "hdl", "good cholesterol"],
    name: "HDL Cholesterol",
    unit: "mg/dL",
    min: 40,
    max: 60,
    interpret: (val) => {
      if (val >= 50) return { status: "normal", label: "Optimal protective level" };
      if (val >= 40) return { status: "normal", label: "Acceptable" };
      return { status: "low", label: "Low HDL (Cardiovascular risk factor)" };
    }
  },
  ldl_cholesterol: {
    aliases: ["ldl cholesterol", "ldl", "bad cholesterol"],
    name: "LDL Cholesterol",
    unit: "mg/dL",
    min: 50,
    max: 100,
    interpret: (val) => {
      if (val <= 100) return { status: "normal", label: "Optimal (< 100 mg/dL)" };
      if (val <= 129) return { status: "borderline", label: "Near optimal" };
      return { status: "high", label: "High LDL (Atherosclerotic risk)" };
    }
  },

  // 6. Thyroid Panel
  tsh: {
    aliases: ["tsh", "thyroid stimulating hormone", "s. tsh"],
    name: "TSH (Thyroid Stimulating Hormone)",
    unit: "uIU/mL",
    min: 0.4,
    max: 4.5,
    criticalHigh: 15.0,
    interpret: (val) => {
      if (val < 0.4) return { status: "low", label: "Suppressed (Hyperthyroidism)" };
      if (val <= 4.5) return { status: "normal", label: "Euthyroid (Normal)" };
      if (val >= 10.0) return { status: "critical", label: "Overt hypothyroidism" };
      return { status: "high", label: "Elevated (Subclinical hypothyroidism)" };
    }
  },

  // 7. Vitals
  blood_pressure: {
    aliases: ["blood pressure", "bp", "b.p."],
    name: "Blood Pressure",
    unit: "mmHg",
    interpret: (systolic, diastolic) => {
      if (systolic >= 180 || diastolic >= 120) return { status: "critical", label: "Hypertensive crisis (Urgent medical attention)" };
      if (systolic >= 140 || diastolic >= 90) return { status: "high", label: "Stage 2 Hypertension" };
      if (systolic >= 130 || diastolic >= 80) return { status: "borderline", label: "Stage 1 Hypertension" };
      if (systolic < 90 || diastolic < 60) return { status: "low", label: "Hypotension (Low blood pressure)" };
      return { status: "normal", label: "Normal blood pressure" };
    }
  }
};

/**
 * Preprocesses an image using an in-memory Canvas to improve OCR accuracy
 */
export async function preprocessMedicalImage(imageSource) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;

      // Convert to high-contrast grayscale
      for (let i = 0; i < d.length; i += 4) {
        const avg = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        const contrast = 1.25;
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        const enhanced = Math.min(255, Math.max(0, factor * (avg - 128) + 128));
        
        d[i] = enhanced;
        d[i + 1] = enhanced;
        d[i + 2] = enhanced;
      }

      ctx.putImageData(imgData, 0, 0);
      canvas.toBlob((blob) => resolve(blob || imageSource), "image/png");
    };
    img.onerror = () => resolve(imageSource);

    if (imageSource instanceof Blob || imageSource instanceof File) {
      img.src = URL.createObjectURL(imageSource);
    } else if (typeof imageSource === "string") {
      img.src = imageSource;
    } else {
      resolve(imageSource);
    }
  });
}

/**
 * Reads a File or Blob into a base64 Data URL string
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Executes high-precision multimodal document vision using Gemini 3.8 Flash.
 * Deciphers complex doctor handwriting, cursive, abbreviations (1-0-1, TDS, OD),
 * and lab parameters directly from photos and PDFs.
 * Gracefully falls back to local Tesseract OCR if backend is unavailable.
 */
export async function runGeminiDocumentVision(file, onProgress = null) {
  if (onProgress) onProgress(20);

  // If it's an image or PDF, attempt Gemini Multimodal Vision first
  if (file && (file.type?.startsWith("image/") || file.type?.includes("pdf") || file.name?.match(/\.(jpg|jpeg|png|webp|pdf)$/i))) {
    try {
      if (onProgress) onProgress(35);
      const base64 = await fileToBase64(file);
      if (onProgress) onProgress(50);

      const targetUrl = API_BASE ? `${API_BASE}/api/ai/document-scan` : "http://localhost:4000/api/ai/document-scan";
      const res = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64,
          mimeType: file.type || "image/jpeg",
          textHint: file.name
        })
      });

      if (onProgress) onProgress(85);

      if (res.ok) {
        const data = await res.json();
        if (onProgress) onProgress(100);
        return {
          ...data,
          source: data.source || "gemini-3.5-flash-lite",
          isHandwritingDeciphered: true
        };
      } else {
        const errText = await res.text().catch(() => "");
        console.warn(`[Gemini Vision] Backend scan returned ${res.status}:`, errText);
      }
    } catch (err) {
      console.warn("Gemini vision scan error, falling back to local OCR:", err);
    }
  }

  // Fallback to local Tesseract OCR
  const ocrText = await runDocumentOcr(file, onProgress);
  return {
    ocrText,
    documentType: "DOCUMENT",
    source: "tesseract-local",
    isHandwritingDeciphered: false
  };
}

/**
 * Executes OCR on a prescription or lab report using Tesseract.js
 */
export async function runDocumentOcr(file, onProgress = null) {
  const preprocessed = await preprocessMedicalImage(file);
  const worker = await createWorker("eng", 1, {
    logger: (m) => {
      if (onProgress && m.status === "recognizing text") {
        onProgress(Math.round((m.progress || 0) * 100));
      }
    }
  });
  
  try {
    const ret = await worker.recognize(preprocessed);
    await worker.terminate();
    return ret.data.text || "";
  } catch (err) {
    console.warn("Tesseract OCR failed, terminating worker:", err);
    try { await worker.terminate(); } catch {}
    throw err;
  }
}

/**
 * Extracts lab facility / diagnostic center name from the document header.
 */
function extractLabName(lines) {
  const headerLines = lines.slice(0, 8);
  for (const line of headerLines) {
    const trimmed = line.trim();
    if (trimmed.length > 4 && trimmed.length < 75) {
      if (/(?:diagnostic|laborator|patholog|hospital|clinic|pathlabs|metropolis|thyrocare|quest|dr lal|srl|health)/i.test(trimmed)) {
        return trimmed.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "");
      }
    }
  }
  return "Diagnostic Laboratory & Health Services";
}

/**
 * Extracts dates from report text
 */
function extractReportDates(text) {
  const dateRegex = /\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4})\b/gi;
  const matches = text.match(dateRegex) || [];
  return [...new Set(matches)];
}

/**
 * Generates a dynamic, data-driven clinical interpretation strictly based on
 * the actual extracted parameters and their physiological reference values.
 */
export function generateClinicalInterpretation(labResults, abnormalLabs, labName, reportDate) {
  if (!labResults || labResults.length === 0) {
    return "No structured laboratory parameters were identifiable in the uploaded document. Please ensure the scan is clear, well-lit, and unwrinkled for clinical verification.";
  }

  const totalCount = labResults.length;
  const abnormalCount = abnormalLabs.length;
  const criticalCount = abnormalLabs.filter(l => l.status === "critical").length;

  const header = `Report from ${labName}${reportDate ? ` (${reportDate})` : ""}: ${totalCount} parameter${totalCount > 1 ? "s" : ""} analyzed.`;

  if (abnormalCount === 0) {
    return `${header} All ${totalCount} measured investigations fall within normal physiological reference ranges. No acute biochemical, glycemic, renal, or hematologic abnormalities detected.`;
  }

  const findings = [];
  for (const item of abnormalLabs) {
    const flagTag = item.status === "critical" ? "[CRITICAL ALERT] " : "";
    let desc = `${flagTag}${item.test}: ${item.value} ${item.unit} (Ref: ${item.referenceRange}) — ${item.interpretation}`;
    findings.push(desc);
  }

  let clinicalSynthesis = "";
  // Check for common clinical syndromes
  const hasDiabetesSign = abnormalLabs.some(l => l.test.includes("HbA1c") || l.test.includes("Sugar") || l.test.includes("Glucose"));
  const hasRenalSign = abnormalLabs.some(l => l.test.includes("Creatinine") || l.test.includes("Urea"));
  const hasAnemiaSign = abnormalLabs.some(l => l.test.includes("Hemoglobin") && l.status === "low");
  const hasInfectionSign = abnormalLabs.some(l => l.test.includes("Leucocyte") && l.status === "high");
  const hasLipidSign = abnormalLabs.some(l => l.test.includes("Cholesterol") || l.test.includes("Triglycerides"));
  const hasThyroidSign = abnormalLabs.some(l => l.test.includes("TSH"));
  const hasBpHypertension = abnormalLabs.some(l => l.test.includes("Blood Pressure") && l.status !== "normal");

  const syndromes = [];
  if (hasDiabetesSign && hasRenalSign) {
    syndromes.push("Uncontrolled Glycemic Dysregulation with Early Diabetic Nephropathy indicator");
  } else if (hasDiabetesSign) {
    syndromes.push("Elevated Glycemic Index requiring antidiabetic optimization");
  } else if (hasRenalSign) {
    syndromes.push("Renal filtration impairment requiring hydration & nephrology correlation");
  }

  if (hasAnemiaSign) syndromes.push("Microcytic / Normocytic Anemia requiring Iron / B12 evaluation");
  if (hasInfectionSign) syndromes.push("Active leukocytosis suggesting systemic inflammatory or infectious response");
  if (hasLipidSign) syndromes.push("Atherogenic Dyslipidemia with elevated cardiovascular risk");
  if (hasThyroidSign) syndromes.push("Thyroid axis dysfunction requiring endocrinology review");
  if (hasBpHypertension) syndromes.push("Hypertensive stage reading requiring cardiovascular monitoring");

  if (syndromes.length > 0) {
    clinicalSynthesis = `\n\nDiagnostic Impression:\n• ` + syndromes.join("\n• ");
  }

  const summary = `${header} Identified ${abnormalCount} abnormal finding${abnormalCount > 1 ? "s" : ""}${criticalCount > 0 ? ` (${criticalCount} critical)` : ""}:\n\n` +
    findings.map(f => `• ${f}`).join("\n") + clinicalSynthesis +
    `\n\nRecommendation: Consult your attending physician for formal clinical correlation, medication review, and repeat confirmatory testing.`;

  return summary;
}

/**
 * Extracts clinical entities, abnormal laboratory findings, medications, and dates
 * from raw OCR text using structured line-by-line tabular parsing and reference intervals.
 */
export function extractMedicalEntities(ocrText, activeMeds = [], allergies = []) {
  const text = ocrText || "";
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const lower = text.toLowerCase();

  // 1. Lab Name & Date
  const labName = extractLabName(lines);
  const dates = extractReportDates(text);
  const reportDate = dates[0] || "";

  // 2. Structured Line-by-Line Laboratory Value Extraction
  const labResults = [];
  const matchedKeys = new Set();

  // Process Blood Pressure first
  const bpMatch = text.match(/(?:BP|Blood Pressure|B\.P\.)[^0-9\n]{0,15}(\d{2,3})\s*[\/|]\s*(\d{2,3})\s*(?:mmHg)?/i);
  if (bpMatch) {
    const sys = parseInt(bpMatch[1], 10);
    const dia = parseInt(bpMatch[2], 10);
    const interp = LAB_REFERENCE_RANGES.blood_pressure.interpret(sys, dia);
    labResults.push({
      test: "Blood Pressure",
      value: `${sys}/${dia}`,
      unit: "mmHg",
      referenceRange: "< 120/80 mmHg",
      status: interp.status,
      interpretation: interp.label
    });
    matchedKeys.add("blood_pressure");
  }

  // Iterate through lines to catch tabular results: Test Name | Result | Unit | Reference | Flag
  for (const line of lines) {
    const lineLower = line.toLowerCase();

    for (const [key, ref] of Object.entries(LAB_REFERENCE_RANGES)) {
      if (key === "blood_pressure" || matchedKeys.has(key)) continue;

      const matchesAlias = (ref.aliases || []).some(alias => {
        const idx = lineLower.indexOf(alias);
        return idx !== -1;
      });

      if (matchesAlias) {
        // Look for numeric value on this line
        // Pattern matches: 12.5, 8.4, 168.0, 8,400, 150,000, 1.8
        const numMatch = line.match(/(?:^|[^0-9.])([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]+)?)(?!\s*[/-]\s*\d)/);
        if (numMatch) {
          const rawNum = numMatch[1].replace(/,/g, "");
          const val = parseFloat(rawNum);
          if (!isNaN(val) && val > 0) {
            // Check for explicit high/low flag in line
            let status = "normal";
            let interpretation = "Normal";

            if (typeof ref.interpret === "function") {
              const interp = ref.interpret(val);
              status = interp.status;
              interpretation = interp.label;
            } else {
              if (ref.min !== undefined && val < ref.min) {
                status = "low";
                interpretation = `Low (< ${ref.min} ${ref.unit})`;
              } else if (ref.max !== undefined && val > ref.max) {
                status = "high";
                interpretation = `Elevated (> ${ref.max} ${ref.unit})`;
              }
            }

            // Override with explicit textual tags if detected
            if (/\b(high|elevated|\[high\]|\*\*high\*\*|\bH\b)\b/i.test(line) && status === "normal") {
              status = "high";
              interpretation = "Elevated (Flagged High by Lab)";
            } else if (/\b(low|decreased|\[low\]|\*\*low\*\*|\bL\b)\b/i.test(line) && status === "normal") {
              status = "low";
              interpretation = "Low (Flagged Low by Lab)";
            }

            labResults.push({
              test: ref.name,
              value: val,
              unit: ref.unit,
              referenceRange: `${ref.min} - ${ref.max} ${ref.unit}`,
              status,
              interpretation
            });
            matchedKeys.add(key);
            break;
          }
        }
      }
    }
  }

  // 3. Fallback extraction for HbA1c, FBS, Creatinine, Hemoglobin if missing from line loops
  if (!matchedKeys.has("hba1c")) {
    const m = text.match(/(?:HbA1c|HBA1C|Glycated Hemoglobin|A1C)[^0-9\n]{0,25}(\d{1,2}(?:\.\d{1,2})?)\s*%/i);
    if (m) {
      const val = parseFloat(m[1]);
      const interp = LAB_REFERENCE_RANGES.hba1c.interpret(val);
      labResults.push({ test: "HbA1c (Glycated Hemoglobin)", value: val, unit: "%", referenceRange: "4.0 - 5.6%", status: interp.status, interpretation: interp.label });
      matchedKeys.add("hba1c");
    }
  }
  if (!matchedKeys.has("fasting_sugar")) {
    const m = text.match(/(?:Fasting (?:Blood )?Sugar|FBS|Glucose Fasting)[^0-9\n]{0,25}(\d{2,3}(?:\.\d{1,2})?)\s*(?:mg\/dl)?/i);
    if (m) {
      const val = parseFloat(m[1]);
      const interp = LAB_REFERENCE_RANGES.fasting_sugar.interpret(val);
      labResults.push({ test: "Fasting Blood Sugar (FBS)", value: val, unit: "mg/dL", referenceRange: "70 - 99 mg/dL", status: interp.status, interpretation: interp.label });
      matchedKeys.add("fasting_sugar");
    }
  }
  if (!matchedKeys.has("creatinine")) {
    const m = text.match(/(?:Serum Creatinine|Creatinine|S\. Creatinine)[^0-9\n]{0,25}(\d{1,2}(?:\.\d{1,2})?)\s*(?:mg\/dl)?/i);
    if (m) {
      const val = parseFloat(m[1]);
      const interp = LAB_REFERENCE_RANGES.creatinine.interpret(val);
      labResults.push({ test: "Serum Creatinine", value: val, unit: "mg/dL", referenceRange: "0.6 - 1.2 mg/dL", status: interp.status, interpretation: interp.label });
      matchedKeys.add("creatinine");
    }
  }
  if (!matchedKeys.has("hemoglobin")) {
    const m = text.match(/(?:Hemoglobin|HGB|Hb\b)[^0-9\n]{0,25}(\d{1,2}(?:\.\d{1,2})?)\s*(?:g\/dl|gm\/dl)?/i);
    if (m) {
      const val = parseFloat(m[1]);
      const interp = LAB_REFERENCE_RANGES.hemoglobin.interpret(val);
      labResults.push({ test: "Hemoglobin (Hb)", value: val, unit: "g/dL", referenceRange: "12.0 - 16.5 g/dL", status: interp.status, interpretation: interp.label });
      matchedKeys.add("hemoglobin");
    }
  }

  // 4. Extract Diagnoses
  const KNOWN_DIAGNOSES = [
    { key: "Type 2 Diabetes Mellitus", patterns: ["type 2 diabetes", "t2dm", "diabetes mellitus", "dm ii", "sugar"] },
    { key: "Essential Hypertension", patterns: ["hypertension", "htn", "high blood pressure"] },
    { key: "Dyslipidemia", patterns: ["dyslipidemia", "hypercholesterolemia", "high cholesterol", "hyperlipidemia"] },
    { key: "Ischemic Heart Disease (CAD)", patterns: ["ischemic heart disease", "ihd", "coronary artery disease", "cad", "angina"] },
    { key: "Bronchial Asthma / COPD", patterns: ["bronchial asthma", "asthma", "copd", "chronic bronchitis"] },
    { key: "Acute Gastritis / GERD", patterns: ["gastritis", "gerd", "acid peptic disease", "apd", "reflux"] },
    { key: "Hypothyroidism", patterns: ["hypothyroidism", "thyroiditis", "elevated tsh"] },
    { key: "Chronic Kidney Disease", patterns: ["ckd", "chronic kidney disease", "renal insufficiency", "nephropathy"] },
    { key: "Fatty Liver (Grade I/II)", patterns: ["fatty liver", "hepatic steatosis"] }
  ];

  const diagnoses = [];
  for (const item of KNOWN_DIAGNOSES) {
    if (item.patterns.some(p => lower.includes(p))) {
      diagnoses.push(item.key);
    }
  }

  // 5. Extract Medications Mentioned
  const KNOWN_MEDS = [
    { name: "Metformin", commonDose: "500 mg", class: "Biguanide (Antidiabetic)" },
    { name: "Telmisartan", commonDose: "40 mg", class: "ARB (Antihypertensive)" },
    { name: "Amlodipine", commonDose: "5 mg", class: "Calcium Channel Blocker" },
    { name: "Atorvastatin", commonDose: "10 mg", class: "Statin (Lipid-lowering)" },
    { name: "Pantoprazole", commonDose: "40 mg", class: "Proton Pump Inhibitor" },
    { name: "Amoxicillin", commonDose: "500 mg", class: "Penicillin Antibiotic" },
    { name: "Paracetamol", commonDose: "500 mg / 650 mg", class: "Analgesic / Antipyretic" },
    { name: "Aspirin", commonDose: "75 mg", class: "Antiplatelet" },
    { name: "Clopidogrel", commonDose: "75 mg", class: "Antiplatelet" },
    { name: "Glimepiride", commonDose: "1 mg / 2 mg", class: "Sulfonylurea" },
    { name: "Thyroxine (Levothyroxine)", commonDose: "25 mcg / 50 mcg", class: "Thyroid hormone" },
    { name: "Azithromycin", commonDose: "500 mg", class: "Macrolide Antibiotic" }
  ];

  const extractedMeds = [];
  for (const m of KNOWN_MEDS) {
    if (lower.includes(m.name.toLowerCase())) {
      const doseRegex = new RegExp(`${m.name.toLowerCase()}[^\\n]{0,25}(\\d+\\s*(?:mg|mcg|gm))`, "i");
      const match = text.match(doseRegex);
      extractedMeds.push({
        name: m.name,
        dosage: match ? match[1] : m.commonDose,
        class: m.class
      });
    }
  }

  // 6. Safety Cross-Check (Interactions & Allergies)
  const safetyAlerts = [];
  const activeMedNames = (activeMeds || []).map(m => m.name.toLowerCase());
  for (const docMed of extractedMeds) {
    const docMedName = docMed.name.toLowerCase();

    if (activeMedNames.some(m => m.includes(docMedName))) {
      safetyAlerts.push({
        severity: "caution",
        title: `Duplicate Therapy: ${docMed.name}`,
        desc: "This medicine is already present in your active medication schedule. Take care not to double-dose."
      });
    }

    if (docMedName.includes("aspirin") && activeMedNames.some(m => m.includes("amoxicillin") || m.includes("ibuprofen"))) {
      safetyAlerts.push({
        severity: "warning",
        title: "NSAID / Antiplatelet Caution",
        desc: "Simultaneous use of multiple anti-inflammatory or antiplatelet agents increases gastrointestinal irritation risk."
      });
    }

    for (const allergy of (allergies || [])) {
      const allergyLower = allergy.toLowerCase();
      if ((allergyLower.includes("penicillin") && docMedName.includes("amoxicillin")) ||
          (allergyLower.includes("sulfa") && docMedName.includes("glimepiride"))) {
        safetyAlerts.push({
          severity: "danger",
          title: `Allergy Alert: ${docMed.name}`,
          desc: `Patient profile reports an allergy to "${allergy}", which may cross-react with ${docMed.name}.`
        });
      }
    }
  }

  // 7. Abnormal Values & Dynamic Clinical Interpretation
  const abnormalLabs = labResults.filter(l => l.status === "high" || l.status === "low" || l.status === "critical");
  const clinicalInterpretation = generateClinicalInterpretation(labResults, abnormalLabs, labName, reportDate);

  return {
    rawText: text,
    labName,
    reportDate,
    dates,
    diagnoses,
    medications: extractedMeds,
    labResults,
    abnormalLabs,
    clinicalInterpretation,
    safetyAlerts,
    hasCriticalAlerts: safetyAlerts.some(a => a.severity === "danger") || abnormalLabs.some(l => l.status === "critical")
  };
}

/**
 * Sample realistic mock prescriptions and lab reports for testing without a scanner
 */
export const SAMPLE_DOCUMENTS = [
  {
    id: "sample_lab_report",
    title: "Diabetic Kidney & Lipid Panel (Quest/DrLal Demo)",
    type: "Lab Report",
    date: "2026-08-20",
    text: `CITYCARE DIAGNOSTIC LABORATORIES
PATIENT: Swyom Sharma | AGE: 21 | SEX: Male
REF BY: Dr. Alok Verma | DATE: 20/08/2026

BIOCHEMISTRY INVESTIGATION REPORT
------------------------------------------------------------
TEST NAME                  VALUE    UNIT     REFERENCE
------------------------------------------------------------
HbA1c (Glycated Hb)         8.4      %        4.0 - 5.6 [HIGH]
Fasting Blood Sugar (FBS)   168.0    mg/dL    70 - 99   [HIGH]
Serum Creatinine            1.8      mg/dL    0.6 - 1.2 [HIGH]
Hemoglobin (Hb)             11.2     g/dL     12.0 - 16.5 [LOW]
Total Leucocyte Count       8,400    /uL      4,000 - 11,000
Blood Pressure (BP)         146/92   mmHg     < 120/80  [HIGH]
Total Cholesterol           238.0    mg/dL    100 - 200 [HIGH]
Serum Triglycerides         215.0    mg/dL    50 - 150  [HIGH]
Serum Bilirubin Total       0.8      mg/dL    0.2 - 1.2

CLINICAL NOTES:
Uncontrolled Hyperglycemia with Early Diabetic Nephropathy indicator.
Mild Microcytic Anemia.`
  },
  {
    id: "sample_prescription",
    title: "Cardiology Outpatient Prescription (Dr. Sharma)",
    type: "Prescription",
    date: "2026-08-28",
    text: `METRO MULTISPECIALTY HOSPITAL & HEART INSTITUTE
Dr. Rohan Sharma (MD, DNB Cardiology)
Date: 28/08/2026 | OPD No: 88412
Patient: Swyom Sharma, 21y Male

DIAGNOSIS:
Type 2 Diabetes Mellitus, Essential Hypertension, Dyslipidemia

Rx:
1. Tab. Metformin 500mg - 1 Tab twice daily after food (1-0-1)
2. Tab. Telmisartan 40mg - 1 Tab once daily morning after breakfast (1-0-0)
3. Tab. Atorvastatin 10mg - 1 Tab once daily at bedtime (0-0-1)
4. Tab. Pantoprazole 40mg - 1 Tab empty stomach 30 mins before breakfast (1-0-0)

ADVICE:
- Strict low-salt, low-carb diabetic diet
- Daily 30 mins brisk walking
- Review after 4 weeks with repeat HbA1c and Serum Creatinine`
  }
];
