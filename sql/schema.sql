CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  mobile TEXT UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'staff')),
  password_hash TEXT,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  email_verified_at TIMESTAMPTZ,
  phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  phone_verified_at TIMESTAMPTZ,
  aadhaar_verified BOOLEAN NOT NULL DEFAULT FALSE,
  aadhaar_verified_at TIMESTAMPTZ,
  identity_verification_status TEXT NOT NULL DEFAULT 'NOT_STARTED',
  identity_verification_reference TEXT,
  aadhaar_consent BOOLEAN NOT NULL DEFAULT FALSE,
  aadhaar_consent_at TIMESTAMPTZ,
  aadhaar_last4 CHAR(4),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash CHAR(64) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS email_verification_tokens_user_idx ON email_verification_tokens(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS phone_otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  otp_hash CHAR(64) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS phone_otp_verifications_user_idx ON phone_otp_verifications(user_id, phone, created_at DESC);

CREATE TABLE IF NOT EXISTS security_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS patient_state (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  state JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS health_records (
  id UUID PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  mime TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  storage_key TEXT NOT NULL,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS record_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doctor_id TEXT NOT NULL,
  record_ids TEXT[] NOT NULL,
  pin_hash TEXT NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  locked_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  access_count INTEGER NOT NULL DEFAULT 0,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS share_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID NOT NULL REFERENCES record_shares(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS medikiosk_intakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_name TEXT,
  abha_id TEXT,
  summary JSONB NOT NULL DEFAULT '{}',
  fhir_bundle JSONB NOT NULL DEFAULT '{}',
  consent_artifact JSONB NOT NULL DEFAULT '{}',
  triage_status TEXT NOT NULL DEFAULT 'ROUTINE_OUTPATIENT',
  doctor_review JSONB,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS medikiosk_intakes_patient_idx ON medikiosk_intakes(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS medikiosk_intakes_triage_idx ON medikiosk_intakes(triage_status) WHERE triage_status = 'EMERGENCY_CODE_RED';

CREATE TABLE IF NOT EXISTS medikiosk_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID REFERENCES medikiosk_intakes(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_role TEXT,
  event TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ledger_entries (
  seq BIGSERIAL PRIMARY KEY,
  entry_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  payload_hash TEXT NOT NULL,
  prev_hash TEXT NOT NULL,
  entry_hash TEXT NOT NULL,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ledger_entries_tenant_idx ON ledger_entries(tenant_id, seq);

CREATE INDEX IF NOT EXISTS shares_patient_idx ON record_shares(patient_id, expires_at);
CREATE INDEX IF NOT EXISTS shares_doctor_idx ON record_shares(doctor_id, expires_at);

-- Migrations for existing deployments
ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS aadhaar_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS aadhaar_verified_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS identity_verification_status TEXT NOT NULL DEFAULT 'NOT_STARTED';
ALTER TABLE users ADD COLUMN IF NOT EXISTS identity_verification_reference TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS aadhaar_consent BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS aadhaar_consent_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS aadhaar_last4 CHAR(4);
ALTER TABLE record_shares ADD COLUMN IF NOT EXISTS attempt_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE record_shares ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ;
CREATE UNIQUE INDEX IF NOT EXISTS users_mobile_idx ON users(mobile) WHERE mobile IS NOT NULL;

ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE record_shares ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE medikiosk_intakes ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

INSERT INTO tenants (id, name) VALUES ('00000000-0000-0000-0000-000000000000', 'CityCare Health System') ON CONFLICT (id) DO NOTHING;

-- Backfill all existing null tenant_id values to default tenant
UPDATE users SET tenant_id = '00000000-0000-0000-0000-000000000000' WHERE tenant_id IS NULL;
UPDATE health_records SET tenant_id = '00000000-0000-0000-0000-000000000000' WHERE tenant_id IS NULL;
UPDATE record_shares SET tenant_id = '00000000-0000-0000-0000-000000000000' WHERE tenant_id IS NULL;
UPDATE medikiosk_intakes SET tenant_id = '00000000-0000-0000-0000-000000000000' WHERE tenant_id IS NULL;

-- Enforce NOT NULL constraints on tenant_id
ALTER TABLE users ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE health_records ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE record_shares ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE medikiosk_intakes ALTER COLUMN tenant_id SET NOT NULL;

INSERT INTO users (id, email, name, role, tenant_id, password_hash, email_verified, email_verified_at, phone_verified, phone_verified_at, aadhaar_verified, aadhaar_verified_at, identity_verification_status, aadhaar_consent, aadhaar_consent_at, aadhaar_last4, mobile) VALUES
  ('00000000-0000-0000-0000-000000000001', 'patient@carepath.demo', 'Swyom Sharma', 'patient', '00000000-0000-0000-0000-000000000000', '$2b$12$FmGh1Rx1lrSd16M6JjoeIuyFIFG8untCSvAR47lkwv7nPqWzDdoje', TRUE, '2026-08-01 00:00:00+00', TRUE, '2026-08-01 00:00:00+00', TRUE, '2026-08-01 00:00:00+00', 'VERIFIED', TRUE, '2026-08-01 00:00:00+00', '4321', '9876543210'),
  ('00000000-0000-0000-0000-000000000002', 'doctor@carepath.demo', 'Dr. Ananya Mehta', 'doctor', '00000000-0000-0000-0000-000000000000', '$2b$12$FmGh1Rx1lrSd16M6JjoeIuyFIFG8untCSvAR47lkwv7nPqWzDdoje', FALSE, NULL, FALSE, NULL, FALSE, NULL, 'NOT_STARTED', FALSE, NULL, NULL, NULL),
  ('00000000-0000-0000-0000-000000000003', 'staff@carepath.demo', 'CarePath Staff', 'staff', '00000000-0000-0000-0000-000000000000', '$2b$12$FmGh1Rx1lrSd16M6JjoeIuyFIFG8untCSvAR47lkwv7nPqWzDdoje', FALSE, NULL, FALSE, NULL, FALSE, NULL, 'NOT_STARTED', FALSE, NULL, NULL, NULL)
ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash, tenant_id=COALESCE(users.tenant_id, EXCLUDED.tenant_id), email_verified=COALESCE(EXCLUDED.email_verified, users.email_verified), phone_verified=COALESCE(EXCLUDED.phone_verified, users.phone_verified), aadhaar_verified=COALESCE(EXCLUDED.aadhaar_verified, users.aadhaar_verified), identity_verification_status=COALESCE(EXCLUDED.identity_verification_status, users.identity_verification_status);
