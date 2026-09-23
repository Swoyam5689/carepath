# CarePath Backend

This backend adds server-side persistence and authorization behind the existing CarePath React + Vite frontend. The frontend layout, components, props, CSS, and existing result shapes remain unchanged. The backend is Node.js, Express, PostgreSQL, JWT-based, and S3-compatible for health-record storage.

## Setup

From the `carepath` directory:

```bash
cd backend
cp .env.example .env
# Set DATABASE_URL, JWT_SECRET, and production S3/Razorpay variables.
npm install
npm start
```

Initialize PostgreSQL with the included schema. The server runs the schema bootstrap on startup and seeds the complete medicine reference and batch registry extracted from the frontend.

For local-only smoke testing without PostgreSQL, set `DEMO_MODE=true`. Production must use PostgreSQL and S3-compatible object storage; local file storage is only a development fallback.

In the frontend directory:

```bash
cp .env.example .env
npm install
npm run dev
```

The frontend defaults to `http://localhost:4000`; override it with `VITE_API_BASE_URL`.

## Frontend data-layer changes

Only the internals of the existing data-layer boundaries were replaced.

| Existing frontend function or path | Backend behavior |
|---|---|
| `loadState()` / `saveState(s)` | Local cache remains for immediate rendering; authenticated state is fetched from `GET /api/state` and persisted with `PUT /api/state`. |
| `storeFile(id, file)` / `getStoredFile(id)` | Files upload to `POST /api/files` and download through `GET /api/files/:id`; production storage is S3-compatible with short-lived signed access. |
| `createShare(p)` | Calls `POST /api/shares`; the server generates the six-digit PIN, stores only a bcrypt hash, persists expiry, and returns the PIN once for the existing toast. |
| `revokeShare(id)` | Calls `POST /api/shares/:id/revoke`; revocation is enforced server-side and audited. |
| Appointment `book()` payment step | Calls `POST /api/appointments/payment-order`; no client-reported `Paid` status is trusted. The appointment is stored as pending until the verified Razorpay webhook updates it. |
| `evaluateBatch()` lookup | Batch payloads are fetched from `GET /api/batches/:batchId`; the existing evaluation function and return fields remain unchanged. |
| `MEDICINE_REFERENCE` / `findMedicine()` | The existing matching algorithm is retained; the scanner loads the reference table from `GET /api/medicines`. A local array remains only as a temporary UX fallback if the backend is unavailable. |
| Queue simulation | The local 45-second token simulation is replaced with polling from `GET /api/queue`; token creation uses `POST /api/queue/token`, and staff/doctor advancement uses `POST /api/queue/advance`. |

CarePath implements production-grade credential authentication:
- `POST /api/auth/register`: Patient self-registration with bcrypt password hashing (cost factor 12) and 10+ character minimum length.
- `POST /api/auth/login`: Credential login with generic 401 error responses and per-account lockout protection (15-minute lock after 5 failures).
- `POST /api/auth/otp/send` and `POST /api/auth/otp/verify`: Mobile phone OTP authentication flow with rate limiting and 5-minute TTL.
- `POST /api/auth/session`: Quick-access demo role session minting, strictly gated behind `DEMO_MODE=true` (returns 404 in production).

### Tenant Registration & Isolation Policy
Multi-tenancy is strictly enforced across all database queries and in-memory caches:
- `POST /api/auth/register` enforces a server-derived tenant policy: all public patient registrations are assigned strictly to the default tenant (`00000000-0000-0000-0000-000000000000`).
- Any client request attempting to supply a `tenantId` in the registration payload is rejected immediately with HTTP 400 (`Client-supplied tenantId is not permitted`).
- Doctor and hospital staff accounts cannot be created through public self-registration; they must be provisioned directly by hospital administrators.

## Razorpay payments

Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`. Configure the Razorpay Dashboard webhook URL as:

```text
https://YOUR_BACKEND_HOST/api/payments/webhook
```

Subscribe at minimum to `payment.captured`, `payment.failed`, and `order.paid`. The server validates `X-Razorpay-Signature` against the raw request body before updating payment or appointment status. The frontend only creates an order and displays `Payment pending`; it never marks an appointment paid from client input.

The current unchanged payment form collects UPI and card fields for validation. Those raw values are not sent to the backend. In a production checkout, the Razorpay Checkout UI should collect payment details using the gateway’s hosted/vaulted flow, not application storage.

## Security notes

The backend stores only `aadhaar_last4`, never a full Aadhaar number. It never accepts or stores raw card details. Share PIN access is rate-limited to ten attempts per fifteen minutes per process and uses bcrypt verification. Health-record downloads require authentication and owner checks. Configure HTTPS, a strong random JWT secret, database encryption/backups, object-storage lifecycle policies, centralized audit retention, and a real clinic identity provider before handling production medical data.

## Main API surface

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/auth/register` | Secure patient registration with bcrypt password hash |
| `POST` | `/api/auth/login` | Credential-based login with per-account lockout defense |
| `POST` | `/api/auth/otp/send` | Send 6-digit SMS verification code to Indian mobile number |
| `POST` | `/api/auth/otp/verify` | Verify SMS OTP and authenticate/create patient account |
| `POST` | `/api/auth/session` | Compatibility JWT session strictly gated behind DEMO_MODE |
| `GET/PUT` | `/api/state` | Patient state hydration and optimistic persistence |
| `POST/GET` | `/api/files`, `/api/files/:id` | Health-record upload and authenticated retrieval |
| `POST` | `/api/shares` | Server-side PIN and time-limited share creation |
| `POST` | `/api/shares/:id/revoke` | Server-side revocation |
| `POST` | `/api/shares/:id/access` | Rate-limited PIN access verification |
| `POST` | `/api/appointments/payment-order` | Appointment and Razorpay order creation |
| `POST` | `/api/payments/webhook` | Verified gateway event processing |
| `GET` | `/api/queue` | Queue polling |
| `POST` | `/api/queue/token` | Patient token issuance |
| `POST` | `/api/queue/advance` | Doctor/staff queue advancement |
| `GET` | `/api/batches/:batchId` | Authenticated? No; public batch lookup for scanner verification |
| `GET` | `/api/medicines` | Backend-served medicine reference table |
| `GET` | `/api/ledger/verify` | Traverses and verifies cryptographic SHA-256 ledger integrity |

## Production Hardening & Deployment

### 1. Generating Secure Secrets
In production (`NODE_ENV=production`), CarePath fails closed if `JWT_SECRET` is unset or left with default values. Generate high-entropy secrets using OpenSSL:

```bash
# Generate 256-bit JWT secret
openssl rand -hex 32

# Generate secure PostgreSQL password
openssl rand -base64 24
```

### 2. Docker Compose (Full Stack)
Spin up PostgreSQL 16, MinIO S3, CarePath Backend, and CarePath Frontend with a single command:

```bash
docker compose up --build -d
```

Services will be mapped to:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000`
- PostgreSQL: `localhost:5432`
- MinIO S3 Web Console: `http://localhost:9001` (User: `minioadmin`, Pass: `minioadmin`)

### 3. Kubernetes Probes
CarePath provides an integrated health and readiness probe:

```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 4000
  initialDelaySeconds: 5
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /api/health?deep=true
    port: 4000
  initialDelaySeconds: 10
  periodSeconds: 15
```

When `deep=true` is requested, the probe actively verifies PostgreSQL database connectivity and returns HTTP 200 with readiness status, or HTTP 503 if the database is unreachable.

### 4. Tamper-Evident Ledger Verification
To audit cryptographic integrity across all intake records and record shares:

```bash
curl -X GET http://localhost:4000/api/ledger/verify \
  -H "Authorization: Bearer <DOCTOR_OR_STAFF_JWT>"
```

Returns:
```json
{
  "valid": true,
  "count": 42
}
```

If any unauthorized modification occurs directly in the database, the endpoint returns:
```json
{
  "valid": false,
  "brokenAtSeq": 7,
  "reason": "Cryptographic tamper detected at sequence 7. Recomputed <hash>, stored <hash>"
}
```

## Verification

Run full test suite:

```bash
npm run build --prefix ..
cd backend && npm test
```

All 31 unit and integration tests across auth, ledger, multi-tenancy, medi-kiosk, and core APIs will execute.

## Identity verification

CarePath account verification is backend-controlled and uses separate persistence for email tokens and phone OTPs. The legacy unauthenticated OTP-login endpoints are disabled. Patients must authenticate with their account credentials before starting mobile or Aadhaar verification.

| Route | Purpose |
|---|---|
| `GET /api/auth/verification-status` | Returns independent email, phone, Aadhaar, and aggregate status values. |
| `POST /api/auth/email/send-verification` | Creates a single-use hashed email token and sends it through the configured transactional email provider. |
| `POST /api/auth/email/verify` | Consumes the authenticated user’s token and marks email ownership verified. |
| `POST /api/auth/phone/send-otp` | Creates a cryptographically random, hashed six-digit OTP and sends it through the configured SMS provider. |
| `POST /api/auth/phone/verify-otp` | Verifies the OTP with expiry, attempt, and resend controls. |
| `POST /api/identity/aadhaar/initiate` | Requires explicit consent and starts an authorized provider transaction. |
| `POST /api/identity/aadhaar/verify` | Marks Aadhaar verified only after provider success. |
| `GET /api/identity/aadhaar/status` | Returns only safe masked status data. |

Production requires the email, SMS, and authorized UIDAI-compatible provider values documented in `backend/.env.example`. Missing provider configuration returns a safe unavailable response and never marks a user verified. No Aadhaar number, raw OTP, provider secret, or raw provider response is stored or returned.

Record-sharing PINs remain in `record_shares.pin_hash` and are independent from account OTP tables. They have their own attempt counter and lockout state. Doctor responses never include the patient’s plaintext PIN.
