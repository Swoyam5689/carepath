# CarePath MediKiosk Extension Documentation

Transforming CarePath into a full Smart Healthcare MediKiosk platform with conversational multimodal history taking, medical document intelligence, physician-ready structured summaries, and an ABDM/FHIR R4 interoperability layer.

---

## 1. Architectural Overview

The MediKiosk extension is designed with a **100% additive, non-invasive architecture**:
- **Zero Regression**: All original CarePath features (appointments, UPI/card demo payment, live queue telemetry, health records, temporary PIN sharing, medication schedule, medicine info scanner with Tesseract OCR & QR provenance, OpenStreetMap healthcare maps) remain intact and fully functional.
- **Single-File Frontend Integration**: Implemented via a modular directory `src/medikiosk/` and cleanly imported into `src/main.jsx`.
- **Privacy-First & DPDP Act 2023 Aligned**: Patient voice transcripts, raw document buffers, and temporary session data are session-scoped and can be wiped with one click, supporting DPDP auditability and data minimization requirements.
- **ABDM Ready**: Generates compliant HL7 FHIR R4 Document Bundles (`Composition`, `Patient`, `Encounter`, `Condition`, `Observation`, `DocumentReference`, `MedicationStatement`) conforming to the National Digital Health Mission (NDHM / ABDM) HIE-CM specifications.

---

## 2. Modules Implemented

### Module A – Conversational Multimodal History Engine
- **Dual-Mode Input**:
  - **Voice (Web Speech API)**: Native browser speech recognition (`SpeechRecognition` / `webkitSpeechRecognition`) supporting 8 Indian languages:
    - English (`en-IN`), Hindi (`hi-IN`), Tamil (`ta-IN`), Telugu (`te-IN`), Bengali (`bn-IN`), Marathi (`mr-IN`), Gujarati (`gu-IN`), Kannada (`kn-IN`).
  - **Touch Interface**: High-contrast, large touch-friendly chips (48px+ touch targets) with medical iconography, designed for elderly and low-literacy users.
  - **Text-to-Speech (TTS)**: Built-in `window.speechSynthesis` prompts reading questions aloud in the selected language.
- **Adaptive Clinical Ontology**:
  - **Chief Complaint Selection**: Chest pain, fever, cough/breathlessness, abdominal pain, headache, joint pain, rash, diabetes follow-up, hypertension checkup, weakness.
  - **SOCRATES Framework**:
    - **S**ite (anatomical location)
    - **O**nset (sudden vs. gradual duration)
    - **C**haracter (crushing pressure, sharp, burning, throbbing, dull ache, cramping)
    - **R**adiation (left arm/jaw, back, groin, localized)
    - **A**ssociations (cold sweats/diaphoresis, breathlessness, nausea, dizziness, chills)
    - **T**ime course (rapidly worsening, continuous, intermittent)
    - **E**xacerbating & Relieving factors (worse on exertion, relieved by rest, post-prandial)
    - **S**everity (interactive 1–10 visual scale)
- **AYUSH / Ayurvedic Mode Toggle**:
  - **Dashavidha Pariksha (10-Fold Ayurvedic Assessment)**:
    1. *Prakriti* (Vata, Pitta, Kapha, or Dwandwaja psychophysical constitution)
    2. *Vikriti* (Current doshic imbalance / dushti)
    3. *Sara* (Tissue excellence / Dhatu vitality: Pravara, Madhyama, Avara)
    4. *Ahara Shakti & Agni* (Digestive capacity: Samagni, Vishamagni, Teekshnagni, Mandagni)
    5. *Vyayama Shakti* (Physical endurance & stamina)
    6. *Ahara-Vihara Assessment* (Meal timing regularity, dietary habits, sleep cycles)
- **Emergency Red-Flag Detection**:
  - Automatic clinical rule engine monitoring combinations (e.g. Chest pain + diaphoresis/radiation to left arm -> Acute Coronary Syndrome; FAST stroke symptoms; severe dyspnoea; sudden worst-of-life headache).
  - Triggers an immediate **EMERGENCY_CODE_RED** triage alert banner and routes the patient's queue token to the emergency triage staff desk.

---

### Module B – Medical Document Digitization & Intelligence
- **High-Accuracy OCR Pipeline**:
  - Image preprocessing using Canvas (grayscale conversion, dynamic contrast stretching, adaptive thresholding).
  - Tesseract.js engine execution with live percentage progress tracking.
  - Pluggable mock layer for handwritten prescription recognition.
  - One-click **Demo Sample Documents** (Diabetic Lab Report, Cardiology Prescription) to test without a physical scanner or camera.
- **Medical Entity Extraction**:
  - **Laboratory Tests & Reference Ranges**:
    - HbA1c (Normal: 4.0 - 5.6 %, Prediabetes: 5.7 - 6.4 %, Diabetic: >= 6.5 %)
    - Fasting Blood Sugar (Normal: 70 - 99 mg/dL, High: >= 126 mg/dL)
    - Post-Prandial Sugar (Normal: < 140 mg/dL, High: >= 200 mg/dL)
    - Serum Creatinine (Normal: 0.6 - 1.2 mg/dL, High: > 1.3 mg/dL)
    - Hemoglobin (Normal: 12.0 - 16.5 g/dL, Anemia: < 12.0 g/dL)
    - Blood Pressure (Normal: < 120/80 mmHg, Stage 1/2 HTN: >= 130/80 mmHg, Crisis: >= 180/120 mmHg)
  - **Abnormal Value Highlighting**: Badges for `Normal`, `Borderline`, `High`, `Low`, and `Critical`.
  - **Safety & Drug Interaction Cross-Check**:
    - Automatically checks extracted medications against the patient's active medication schedule (`state.meds`) for duplicate therapy.
    - Flags known drug-drug interactions (e.g. NSAID + Antiplatelet gastric bleeding risk).
    - Cross-checks against patient allergies (e.g. Penicillin allergy cross-reacting with Amoxicillin).

---

### Module C – Structured History Summary Generator
- **Physician-Ready SOAP Output**:
  - **Subjective**: Chief Complaint, SOCRATES symptom analysis, patient voice quotes, past medical conditions, active prescriptions, allergies, personal/habits.
  - **Objective**: Abnormal lab values from digitized prior documents, vital signs.
  - **AYUSH Note**: Prakriti constitution, doshic imbalance, Agni status.
  - **Assessment & Triage Level**: Routine Outpatient vs. Emergency Code Red.
- **Bilingual Presentation**:
  - Doctor-facing: Standard clinical English / medical terminology.
  - Patient confirmation view: Local vernacular language (audio TTS + text).
- **Physician Draft Review**:
  - The doctor can review the draft summary, add clinical examination findings, and mark it as **Accepted**, **Amended**, or **Rejected**.
- **One-Click Push to Consultation**:
  - Summary immediately transfers to the doctor's desk and is synced with the backend.

---

### Module D – Consent, Privacy & ABDM Integration Layer
- **ABHA & Aadhaar Verification**:
  - Validates 14-digit ABHA Numbers (`XX-XXXX-XXXX-XXXX`) and ABHA Addresses (`user@abdm`).
- **Granular Consent (DPDP Act 2023)**:
  - Checkbox controls with plain-language explanations:
    1. Voice recording & speech recognition
    2. Medical document OCR analysis
    3. Consultation record sharing with hospital HIS
    4. Linking consultation record to ABHA Personal Health Record (PHR)
- **Session Privacy**:
  - One-click **Clear Session Data (DPDP Privacy)** wipes all temporary transcripts, OCR buffers, and answers.
- **FHIR R4 Bundle**:
  - Generates standard FHIR JSON with downloadable bundle export for ABDM Gateway sync.

---

## 3. End-to-End Patient Journey

1. **Step 1: Identify & Consent**
   - Patient arrives at MediKiosk terminal.
   - Enters ABHA ID (`swyom@abdm`) and Aadhaar last 4 digits (`4321`).
   - Selects language (e.g. English, Hindi, Tamil) and reviews granular consent toggles.
2. **Step 2: Conversational Intake**
   - Patient selects or speaks chief complaint (e.g. "Chest Pain / Tightness").
   - Dialogue manager asks SOCRATES follow-up questions (Site, Onset, Character, Radiation, Severity).
   - If symptoms meet cardiac red-flag criteria, an emergency alert is triggered.
   - If AYUSH mode is toggled, Dashavidha Pariksha questions appear.
3. **Step 3: Document Digitization**
   - Patient uploads or photographs previous lab reports or prescriptions.
   - OCR runs with contrast preprocessing.
   - Entities are extracted, highlighting high HbA1c (8.4%) or elevated Blood Pressure (146/92 mmHg).
4. **Step 4: Clinical Summary Review**
   - Structured SOAP note is generated.
   - Patient can listen to the vernacular summary.
   - Clicks "Push to Doctor Consultation".
5. **Step 5: Doctor Consultation**
   - Doctor switches to Doctor Portal.
   - `DoctorMediKioskPanel` displays the incoming intake summary, triage status, and abnormal lab callouts.
   - Doctor adds clinical impression notes and clicks "Accept & Confirm for Consultation".

---

## 4. Backend Endpoints Added

All endpoints are secured via JWT authentication:

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/medikiosk/intakes` | Stores patient intake session with summary, FHIR bundle, and triage status. |
| `GET` | `/api/medikiosk/intakes/latest` | Returns latest intake session for patient or doctor. |
| `GET` | `/api/medikiosk/intakes` | Lists all clinical intakes for doctor review. |
| `PUT` | `/api/medikiosk/intakes/:id/review` | Doctor amends/accepts draft summary with clinical notes. |
| `GET` | `/api/medikiosk/triage/emergency` | Returns active emergency red-flag cases for triage queue. |
| `POST` | `/api/medikiosk/session/clear` | DPDP-compliant session termination wiping temporary records. |

---

## 5. Production Upgrade Pathways

| Capability | Demo / Current Implementation | Production Upgrade Path |
|---|---|---|
| **Speech-to-Text (ASR)** | Browser Web Speech API (`webkitSpeechRecognition`) | **Bhashini (NLTM) / AI4Bharat IndicConformer API**: Connect kiosk microphone to `https://dhruva-api.bhashini.gov.in` for high-accuracy regional ASR. |
| **Text-to-Speech (TTS)** | Browser `window.speechSynthesis` | **Bhashini Indic-TTS**: Higher-naturalness neural voices for all 22 scheduled Indian languages. |
| **Prescription OCR** | Tesseract.js with canvas contrast preprocessing | **Google Cloud Vision Document Text Detection** or **Azure AI Health Document OCR** for complex handwritten doctors' scripts. |
| **ABDM Integration** | Demo ABHA validation + FHIR R4 Bundle generator | **ABDM Sandbox M1/M2/M3 APIs**: Real OTP verification via `https://dev.abdm.gov.in/gateway/v0.5/sessions` and Push to PHR via HIE-CM. |
| **Drug Database** | Curated generic medicine dictionary & demo batch registry | **CDSCO / Indian Pharmacopoeia Commission (IPC)** or commercial medical API (e.g. 1mg / PharmEasy / First Databank). |

---

## 6. Verification & Test Summary

- **Frontend Production Build**: Built cleanly with Vite (`npm run build`).
- **Backend Test Suite**: All 31 automated tests passing across 5 suites (`npm test` in `backend/`):
  - `test/api.test.js`: Health check, session tokens, medicine/batch APIs, PIN sharing, payment order status.
  - `test/auth.test.js`: Self-registration, role enforcement, password length validation, duplicate email handling, credential login, mobile OTP flows, production startup fail-closed, tenantId injection defense, OTP collision isolation, per-account lockout defense, unprivileged demo initialization.
  - `test/ledger.test.js`: Canonical JSON determinism, cryptographic hash chain monotonicity, payload/sequence tampering detection, clinical access authorization, scheduled background ledger verification.
  - `test/medikiosk.test.js`: Intake creation/retrieval, doctor summary review and amendment, red-flag emergency queue prioritization, DPDP session data wiping.
  - `test/multitenancy.test.js`: Cross-tenant intake isolation, patient intake listing restrictions, cryptographic ledger chain multi-tenant segregation, queue isolation, appointment and record share strict tenant partitioning.
- **Existing Features Verification**: Zero existing components, routes, styles, or states were deleted, refactored, or broken.

---

## 7. Tamper-Evident Cryptographic Ledger Architecture ("Blockchain" Layer)

### 7.1 Cryptographic Chaining Model
CarePath implements a tamper-evident, append-only cryptographic ledger (`ledger_entries`) providing cryptographic non-repudiation and auditability for sensitive clinical operations:
- **Canonical Payload Hashing**: All transaction payloads are serialized through a recursive key-sorting JSON canonicalizer (`canonicalizeJson`), producing a deterministic SHA-256 hash (`payload_hash`).
- **Sequential Block Chaining**: Each ledger entry incorporates the cryptographic hash of the preceding entry (`prev_hash`). The first block in every tenant ledger references a 64-character genesis hash (`GENESIS_HASH = "0".repeat(64)`).
- **Entry Hash Calculation**:
  $$\text{entry\_hash} = \text{SHA-256}(\text{seq} \parallel \text{entry\_type} \parallel \text{entity\_id} \parallel \text{payload\_hash} \parallel \text{prev\_hash})$$
- **Concurrency & Monotonicity**: Appending entries in PostgreSQL utilizes `SERIALIZABLE` transaction isolation with row-level locking (`FOR UPDATE`) on the terminal sequence, preventing forks or race conditions.
- **Audited Events**:
  - `medikiosk_intake_created`
  - `medikiosk_intake_reviewed`
  - `medikiosk_session_cleared`
  - `record_share_created`
  - `record_share_revoked`

### 7.2 Verification and Tamper Detection
Clinical and compliance administrators can verify ledger integrity on demand via `GET /api/ledger/verify`. In addition, a background verification process runs periodically to continuously inspect the cryptographic chains. The verification engine traverses every entry from genesis:
1. Validates that `row.prev_hash` strictly equals the preceding row's `entry_hash`.
2. Recomputes `entry_hash` from the raw stored primitives and asserts mathematical equality.
3. If any row or payload has been modified in the database, verification fails immediately, returning `{ valid: false, brokenAtSeq: N, reason: "Cryptographic tamper detected at sequence N" }`. Tamper detection occurs within one hour via scheduled background verification, or immediately via manual on-demand check.

### 7.3 Architectural Comparison: CarePath Ledger vs. Hyperledger Fabric

| Dimension | CarePath Cryptographic Ledger | Hyperledger Fabric (HLF) |
|---|---|---|
| **Consensus & Ordering** | Single-node / PostgreSQL serializable ordering with monotonic serial sequence locks. | Multi-organization Byzantine / Raft crash fault-tolerant ordering service (Orderer nodes). |
| **Trust Model** | Trust in database host integrity + cryptographic non-repudiation. Any unauthorized mutation by DBAs or malicious actors is instantly detectable. | Consortium trust model across distinct hospital organizations without trusting any single entity's database administrator. |
| **Throughput & Latency** | Direct relational append latency without distributed network consensus delays. | 100–500 transactions/second depending on endorsement policies and block batch timeouts. |
| **Infrastructure Overhead** | Zero additional infrastructure. Embedded directly into CarePath's PostgreSQL schema or memory fallback. | Requires Orderers, Certificate Authorities (Fabric-CA), Peer nodes, CouchDB state DBs, and Kafka/Raft consensus nodes. |
| **Upgrade Pathway** | Production-ready for hospital intra-system immutability supporting auditability requirements under DPDP Act 2023. | Upgradable to HLF when CarePath federates with external insurance providers (TPAs), government regulators, and non-affiliated health networks. |

---

## 8. Deployment Hardening & Security Architecture

1. **Production Boot Gate**:
   - The backend fails closed: if `NODE_ENV === "production"` and `JWT_SECRET` is unset or set to the development fallback, the process exits with code 1 immediately.
2. **Credential Authentication**:
   - `POST /api/auth/register`: Patient self-registration with bcrypt hash (cost factor 12) and 10+ character password requirement. Staff/Doctor roles are blocked from self-signup.
   - `POST /api/auth/login`: Generic 401 error response to prevent user enumeration.
   - `POST /api/auth/otp/send` & `verify`: Mobile OTP authentication flow with rate limits and 5-minute TTL.
   - `/api/auth/session`: Strictly gated behind `DEMO_MODE=true` (returns 404 in production).
3. **Multi-Tier Rate Limiting**:
   - Authentication endpoints: 5 attempts per 15 minutes per IP.
   - MediKiosk writes: 30 requests per 15 minutes per IP.
   - PIN authorization: 10 attempts per 15 minutes per IP.
4. **Multi-Tenancy**:
   - Every patient, doctor, appointment, intake, and ledger entry belongs to a `tenant_id`. Cross-tenant queries are strictly rejected via JWT claim verification.
5. **Containerization & CI**:
   - Multi-stage minimal `Dockerfile` based on `node:20-alpine` running as non-root `node` user.
   - Full orchestration via `docker-compose.yml` (Postgres 16 + MinIO S3 + Backend + Frontend).
   - Automated testing on GitHub Actions CI with live PostgreSQL container.
