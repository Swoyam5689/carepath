# CarePath

CarePath is a React + Vite patient portal prototype with patient/doctor views, appointments with patient intake and demo payment, queue tracking, health records, temporary record sharing, medication adherence, accessibility information, and a Medicine Info Scanner MVP.

## Medicine Info Scanner

The scanner is designed around printed medicine text rather than requiring a QR code or barcode.

Flow:

1. Take or upload a medicine photo.
2. Browser OCR reads printed text using Tesseract.js.
3. OCR text is matched against the local demo medicine reference.
4. The app only displays detailed information for supported general-use examples.
5. Ambiguous or unsupported medicines are blocked or sent back for a clearer image/manual search.

### Important MVP limitation

The medicine reference is demo data. It is **not** a live verified medical database and must be replaced with a trusted medicine database/API before production use.

OCR now ships as a real npm dependency (`tesseract.js`) and is bundled by Vite, dynamically imported the first time you open the scanner. This removes the old dependency on a CDN `<script>` tag racing to load the whole library. Note that Tesseract's own worker still fetches its WASM core and English language-training data from a CDN on first use (they're too large to sensibly bundle); those are cached by the browser afterwards, so only the very first scan on a fresh browser profile needs internet.

### Scanner improvements

- Better OCR image preprocessing (contrast/grayscale).
- More tolerant matching for common OCR spelling errors.
- Strength mismatches caused by OCR noise no longer automatically discard an otherwise strong medicine-name match.
- Brand-name fallback for Crocin when the exact strength is not visible.
- Manual search works with brand names such as Crocin and generic names such as Cetirizine.

## QR Batch Verification & Anti-Counterfeiting

The Medicine Info Scanner now checks the same captured/uploaded image for a QR code **before** starting the heavier OCR pipeline. QR payloads are expected to be JSON in this shape:

```json
{
  "batchId": "CP-PCM500-260801",
  "medicineName": "Paracetamol",
  "strength": "500 mg",
  "manufacturer": "CarePath Labs",
  "mfgDate": "2026-08-01",
  "expiryDate": "2028-07-31",
  "tempLog": [{ "time": "2026-08-28 10:05", "tempC": 23 }],
  "custodyChain": [{ "role": "Manufacturer", "actor": "CarePath Labs", "timestamp": "2026-08-01 09:30" }]
}
```

When a QR is found, CarePath looks up `batchId` in the local `BATCH_REGISTRY`, checks the demo expiry/temperature/custody rules, and renders a provenance result. If printed medicine text is also readable, OCR runs as a cross-check and a name/strength disagreement produces a prominent **Label/Batch Mismatch — Possible Counterfeit** warning. If no QR is detected, the existing OCR flow remains the fallback.

### Important anti-counterfeiting MVP limitation

`BATCH_REGISTRY` in `src/main.jsx` is **demo data standing in for a real blockchain ledger**. It is not proof of authenticity, product quality, or an on-chain record. The sample registry intentionally includes valid and flagged batches (expired, temperature excursion, and missing custody step); an unknown/tampered `batchId` is shown as **unknown / possible counterfeit**. Before production use, replace the local registry with authenticated real-world supply-chain data and actual smart-contract/on-chain lookups, with appropriate backend verification. QR verification is an authenticity/provenance signal only and never replaces pharmacist or authorized supply-chain verification.

## Run

```bash
npm install
npm run dev
```

Do not place medical API keys in frontend code. A production medicine database/OCR backend should use server-side secrets and verified sources.

## Medicine Scanner reference coverage

The Medicine Info Scanner now includes a curated MVP reference set covering common fever/pain, allergy, cough/cold, acidity, oral rehydration, vitamin/mineral, and selected topical products. It also includes more cautious information-only entries for certain medicines and combination/pediatric formulations. The local reference set is for demo/UX purposes and is not a substitute for a verified production medicine database.


## Healthcare map

The Healthcare page now works **without any Google API key**. It uses:
- OpenStreetMap tiles for the interactive map;
- OpenStreetMap/Overpass data for nearby hospitals and clinics;
- Nominatim for named healthcare searches;
- OSRM for in-page driving routes and turn-by-turn steps.

Everything stays inside CarePath — there is no need to open another maps tab.

## Run

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal. Allow location access when CarePath asks for it.

> Map and routing services are public services suitable for a prototype/demo. For production, use a commercial/provider-backed maps and routing setup with appropriate usage limits and terms.

## Debugging notes (this build)

- **Fixed:** scanning a package with any QR code that wasn't a CarePath batch payload (a manufacturer's own tracking code, a URL, an unrelated QR) used to hard-fail the whole scan with an error. It now falls back to reading the printed text with OCR instead, matching the "no QR found" behaviour.
- **Added:** `demo-qr-codes/` folder with five ready-to-scan QR images for testing every verification outcome:
  - `verified_paracetamol.png` — clean batch, all checks pass (green)
  - `flagged_expired_amoxicillin.png` — expired batch (yellow)
  - `flagged_tempexcursion_ibuprofen.png` — cold-chain temperature excursion (yellow)
  - `flagged_missingcustody_cetirizine.png` — missing custody step, never reached a patient (yellow)
  - `unknown_counterfeit_fake.png` — batch ID not in the registry at all (red)
  
  Display one on a second screen/phone and scan it with the app's camera to demo each path live.

### Authentication and Appointment Booking + Payments
CarePath features production-grade authentication with real bcrypt password hashing (cost factor 12), signed JWT tokens, rate limiting, and an SMS OTP verification flow. Demo session minting is isolated and strictly gated by `DEMO_MODE=true`.

For appointments, the flow collects patient details (retaining only the last 4 digits of Aadhaar for DPDP compliance), visit reason, doctor, and date/time. The backend integrates with **Razorpay** when configured (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`) to create genuine payment orders and verifies webhook signatures (`X-Razorpay-Signature`) before confirming appointments. When Razorpay is not configured, it gracefully falls back to local demo order simulation.

---

## Local Demo Setup & Account Verification (Dev Mode)

In development with `DEMO_MODE=true`, CarePath enables full end-to-end testing of patient registration, identity verification, health record upload, and record sharing without requiring real SMS, Email, or Aadhaar API contracts.

### Security Guarantees & Production Isolation
- **Triple-Gated Dev Delivery**: Mock verification delivery only activates when:
  1. `NODE_ENV !== "production"`
  2. `DEMO_MODE === "true"`
  3. No upstream provider is configured (`!EMAIL_API_URL`, `!SMS_API_URL`, `!AADHAAR_API_URL`)
- **Strict Production Guard**: In `NODE_ENV === "production"`, `DEMO_MODE=true` is forbidden and causes the backend server to immediately refuse to boot with `FATAL: DEMO_MODE cannot be enabled in production. Boot aborted.`.
- **No Authentication or Verification Bypass**: Registration does not auto-verify accounts. The middleware `requireFullyVerifiedPatient` strictly gates both health record upload (`POST /api/files`) and record sharing (`POST /api/shares`). Unverified accounts are blocked with HTTP 403 `VERIFICATION_REQUIRED`.
- **DPDP Act 2023 Compliance**: Full 12-digit Aadhaar numbers are never stored in plaintext or database columns. Only the last 4 digits are retained for matching and display (`XXXX XXXX 1234`).

### 1-Minute Verification Walkthrough for New Patients
1. **Register**: On `http://localhost:5173`, click **Register**, fill in your details with a strong password (10+ characters), and sign in.
2. **Open Verification Panel**: In the patient sidebar, click **Profile**. Scroll to the **Account Verification** panel.
3. **Verify Email**:
   - Click **Send verification email**.
   - In demo mode, the secure one-time token is generated, logged to the server console, and auto-filled into the token input.
   - Click **Verify** to complete email verification.
4. **Verify Mobile Number**:
   - Enter a 10-digit mobile number (e.g. `9876543210`).
   - Click **Send code**. The 6-digit OTP is generated, logged to the console, and auto-filled into the OTP input.
   - Click **Verify** to complete mobile verification. (A 30-second resend cooldown timer is enforced).
5. **Verify Aadhaar Identity**:
   - Check the **Informed Consent** checkbox.
   - Enter any 12-digit mock Aadhaar number (e.g. `999988881234`).
   - Click **Start Aadhaar verification**. A reference ID is minted, and the last 4 digits (`1234`) are auto-filled for confirmation.
   - Click **Verify** to confirm.
6. **Upload & Share**: With all three identity checks verified (green checkmarks), navigate to **Health Records** to upload documents and **Record Sharing** to generate 6-digit temporary PIN authorizations for consulting doctors.

---

## MediKiosk Extension (SIH Innovation Layer)

CarePath now integrates a complete **MediKiosk Clinical Intake & Document Intelligence** engine:
1. **Conversational Multimodal History (Module A)**: Dual-mode voice (Web Speech API with 8 Indian languages) and touch-driven intake, SOCRATES symptom exploration, AYUSH / Ayurvedic Dashavidha Pariksha, and automatic red-flag emergency triage.
2. **Medical Document Digitization (Module B)**: Preprocessed Tesseract OCR, automated extraction of diagnoses, medications, and laboratory reference ranges (HbA1c, FBS, Creatinine, BP), abnormal lab badges, and drug-interaction safety warnings.
3. **Structured Clinical Summary (Module C)**: Physician-ready SOAP summary, bilingual patient confirmation, and one-click push to the doctor's screen with draft amend/accept controls.
4. **ABDM Consent & FHIR R4 Integration (Module D)**: 14-digit ABHA validation, Digital Personal Data Protection (DPDP) Act 2023 granular consent, session privacy wipe, and compliant FHIR R4 Bundle generation.

See [MEDIKIOSK_EXTENSION.md](./MEDIKIOSK_EXTENSION.md) for full architectural documentation and production upgrade pathways.

