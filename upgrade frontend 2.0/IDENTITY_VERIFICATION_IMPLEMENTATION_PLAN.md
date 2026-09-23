# CarePath Identity Verification Upgrade Plan

## Conclusion

The supplied repository is an existing CarePath portal, not a blank application. The secure upgrade must extend its current Express API, PostgreSQL schema, React/Vite client, JWT authentication, and record-sharing persistence. The current implementation is not production-ready for identity verification because it has an in-memory OTP provider, a test/demo `123456` bypass, plaintext OTP logging, no email-token flow, no Aadhaar provider adapter, no verification columns, and no frontend translation provider for the main portal.

The implementation will preserve the existing UI and record-sharing model while adding backend-controlled verification state and separate account-verification storage.

## Repository Map

| Concern | Existing implementation | Upgrade location |
|---|---|---|
| Frontend | React 18 + Vite in `src/main.jsx` and `src/styles.css` | Add verification API calls and an account-verification panel in `src/main.jsx`; reuse current cards, buttons, icons, and accessibility patterns. |
| Backend | Express 5 in `backend/src/index.js` | Add reusable authentication/verification guards, provider adapters, routes, safe error responses, and audit events. |
| Database | PostgreSQL via `pg`, with file-backed fallback in `backend/src/db.js` and `backend/src/persistence.js` | Extend `backend/sql/schema.sql`; mirror the required records in the fallback store for local/test operation. |
| Authentication | Bearer JWT in `backend/src/index.js` | Keep JWT role claims server-issued; enrich login and session responses with verification status. |
| Registration | `POST /api/auth/register` creates patient and immediately returns a token | Create the account as unverified, trigger the email-verification flow, and return a limited authenticated session/status rather than claiming activation. |
| Mobile OTP | `backend/src/otpService.js`, `POST /api/auth/otp/*` | Replace fixed/demo OTP behavior with hashed account OTP records and a configured SMS adapter; retain aliases only as secure wrappers. |
| Record sharing | `record_shares.pin_hash`, `/api/shares/*` | Keep this separate from account OTP tables and services; add attempt/lockout controls without exposing the PIN to doctors. |
| Frontend auth | `AuthScreen` in `src/main.jsx` | Point mobile verification at account-verification endpoints and show safe provider-unavailable messages. |
| i18n | No top-level i18n system exists; a clinical ontology contains a separate translation dictionary | Add a small verification dictionary with English/Hindi keys at the feature boundary and avoid hard-coded verification copy in the new UI. |

## Security Design

Three independent flags will be stored on `users`: email verification, phone verification, and Aadhaar verification. The backend will derive `identity_verification_status` and will never accept verification flags from request bodies. Email tokens and phone OTPs will be stored as SHA-256 hashes. Aadhaar numbers will never be persisted; the provider reference and a masked last-four value are the maximum client-visible data.

Email, phone, and Aadhaar providers will fail closed when production configuration is absent. Sandbox mode will be explicit and will never be represented as production verification. The provider interfaces will isolate credentials on the server and return normalized results rather than raw provider responses.

## Delivery Sequence

1. Extend the schema and fallback stores.
2. Add provider adapters and secure account-verification service functions.
3. Add backend routes and reusable verification guards.
4. Remove fixed OTP generation and plaintext OTP logging.
5. Harden record-sharing attempt handling and add structured audit events.
6. Add the frontend account-verification dashboard and safe status refresh.
7. Add bilingual verification copy and accessible loading/error states.
8. Add automated tests for token, OTP, provider-failure, role, and sharing boundaries.
9. Run the security search, backend tests, frontend build, and migration checks.

## External Configuration Required for Production

The repository does not contain regulated Aadhaar approval or transactional messaging credentials. Production requires server-side values for `EMAIL_PROVIDER_URL` or SMTP, `SMS_PROVIDER_URL` and `SMS_PROVIDER_API_KEY`, and the authorized Aadhaar provider variables `AADHAAR_API_URL`, `AADHAAR_CLIENT_ID`, `AADHAAR_CLIENT_SECRET`, and `AADHAAR_CALLBACK_URL`. Empty configuration will produce a safe service-unavailable result; it will not fabricate verification.

## Known Scope Boundary

The existing repository has no general application-wide i18n context, so the upgrade will introduce a verification-specific English/Hindi dictionary rather than silently claiming that all legacy portal copy has been translated. Existing unrelated screens remain unchanged.
