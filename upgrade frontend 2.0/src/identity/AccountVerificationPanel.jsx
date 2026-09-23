import React, { useEffect, useState, useRef } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

function maskPhonePreview(phone) {
  if (!phone) return "";
  const cleaned = String(phone).replace(/\D/g, "");
  if (cleaned.length <= 4) return cleaned;
  return `••••••${cleaned.slice(-4)}`;
}

export default function AccountVerificationPanel({ user, onVerificationComplete }) {
  const { t } = useLanguage();
  const [status, setStatus] = useState(null);
  const [mobile, setMobile] = useState(user?.mobile || "");
  const [otp, setOtp] = useState("");
  const [token, setToken] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [last4, setLast4] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isDemoActive, setIsDemoActive] = useState(import.meta.env.VITE_DEMO_MODE === "true");
  const [devHints, setDevHints] = useState({});
  const [phoneCooldown, setPhoneCooldown] = useState(0);
  const [phoneSent, setPhoneSent] = useState(false);

  const cooldownTimerRef = useRef(null);

  const api = (path, options = {}) =>
    fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${localStorage.getItem("carepath-access-token") || ""}`,
        ...(options.headers || {})
      }
    });

  const refresh = async () => {
    try {
      const res = await api("/api/auth/verification-status");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        if (data.emailVerified && data.phoneVerified && data.aadhaarVerified) {
          onVerificationComplete?.(data);
        }
        return data;
      }
    } catch {
      // Ignored
    }
    return null;
  };

  useEffect(() => {
    refresh().catch(() => {
      setMessage(t("verificationUnavailable"));
      setIsError(true);
    });
  }, []);

  useEffect(() => {
    if (user?.mobile && !mobile) {
      setMobile(user.mobile);
    }
  }, [user?.mobile]);

  useEffect(() => {
    if (phoneCooldown <= 0) {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
      return;
    }
    cooldownTimerRef.current = setInterval(() => {
      setPhoneCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(cooldownTimerRef.current);
  }, [phoneCooldown]);

  async function run(action, path, body) {
    setBusy(action);
    setMessage("");
    setIsError(false);
    try {
      const res = await api(path, { method: "POST", body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.code === "RESEND_COOLDOWN") {
          setPhoneCooldown(30);
          throw new Error(data.error || `${t("resendIn")} 30s`);
        }
        throw new Error(data.error || t("verificationUnavailable"));
      }

      if (data.dev) {
        setIsDemoActive(true);
      }

      // Handle specific action responses
      if (action === "email") {
        if (data.dev && data.devToken) {
          setToken(data.devToken);
          setDevHints((prev) => ({ ...prev, email: `${t("devEmailHint")}: ${data.devToken.slice(0, 10)}...` }));
          setMessage(`${t("sendVerificationEmail")} (Demo Auto-filled).`);
        } else if (data.alreadyVerified) {
          setMessage(t("verified"));
        } else {
          setMessage(t("sendVerificationEmail"));
        }
      } else if (action === "emailVerify") {
        setToken("");
        setDevHints((prev) => {
          const next = { ...prev };
          delete next.email;
          return next;
        });
        setMessage(t("verified"));
      } else if (action === "phone") {
        setPhoneSent(true);
        setPhoneCooldown(30);
        if (data.dev && data.devOtp) {
          setOtp(data.devOtp);
          setDevHints((prev) => ({ ...prev, phone: `${t("devOtpHint")}: ${data.devOtp}` }));
          setMessage(`${t("otpSentSuccess")}: ${data.devOtp}`);
        } else {
          setMessage(t("otpSentSuccess"));
        }
      } else if (action === "phoneVerify") {
        setOtp("");
        setDevHints((prev) => {
          const next = { ...prev };
          delete next.phone;
          return next;
        });
        setMessage(t("verified"));
      } else if (action === "aadhaar") {
        if (data.dev && data.devLast4) {
          setLast4(data.devLast4);
          setDevHints((prev) => ({ ...prev, aadhaar: `${t("devAadhaarHint")}: ${data.devLast4}` }));
          setMessage(`${t("startAadhaarVerification")} (Demo: ${data.devLast4}).`);
        } else {
          setMessage(t("startAadhaarVerification"));
        }
      } else if (action === "aadhaarVerify") {
        setLast4("");
        setAadhaar("");
        setDevHints((prev) => {
          const next = { ...prev };
          delete next.aadhaar;
          return next;
        });
        setMessage(t("verified"));
      }

      const updated = await refresh();
      if (updated && updated.emailVerified && updated.phoneVerified && updated.aadhaarVerified) {
        setMessage(t("allCompletedVerification"));
      }
    } catch (e) {
      setMessage(e.message || t("verificationUnavailable"));
      setIsError(true);
    } finally {
      setBusy("");
    }
  }

  const label = (value) => (value ? t("verified") : t("notVerified"));

  if (!status) return <section className="card" aria-live="polite">{t("accountVerificationTitle")}…</section>;

  const allVerified = status.emailVerified && status.phoneVerified && status.aadhaarVerified;

  return (
    <section className="card" aria-labelledby="account-verification-heading" style={{ marginTop: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div>
          <span className="eyebrow">{t("identityEyebrow")}</span>
          <h2 id="account-verification-heading" style={{ margin: "4px 0" }}>{t("accountVerificationTitle")}</h2>
          <p className="muted">{t("accountVerificationSubtitle")}</p>
        </div>
      </div>

      {isDemoActive && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "10px 14px", borderRadius: 10, fontSize: 12.5, marginTop: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>🧪</span>
          <span>{t("demoVerificationBanner")}</span>
        </div>
      )}

      <div className="verification-status-grid" style={{ display: "grid", gap: 12, marginTop: 16 }}>
        {/* Email Verification Section */}
        <div className="notice" style={{ background: status.emailVerified ? "#f0fdf4" : "#fdfcf9", borderColor: status.emailVerified ? "#bbf7d0" : "var(--line)" }}>
          <strong style={{ color: status.emailVerified ? "#166534" : "inherit" }}>
            {status.emailVerified ? "✓" : "⚠"} {t("emailOwnership")}: {label(status.emailVerified)}
          </strong>
          {!status.emailVerified && (
            <>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                <button
                  className="outline-btn"
                  type="button"
                  disabled={!!busy || status.emailVerified}
                  onClick={() => run("email", "/api/auth/email/send-verification", {})}
                >
                  {busy === "email" ? "…" : t("sendVerificationEmail")}
                </button>
                <input
                  aria-label={t("emailTokenPlaceholder")}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder={t("emailTokenPlaceholder")}
                  disabled={!!busy || status.emailVerified}
                  style={{ flex: 1, minWidth: 200 }}
                />
                <button
                  className="primary-btn"
                  type="button"
                  disabled={!!busy || !token || status.emailVerified}
                  onClick={() => run("emailVerify", "/api/auth/email/verify", { token })}
                >
                  {busy === "emailVerify" ? "…" : t("verifyActionBtn")}
                </button>
              </div>
              {devHints.email && (
                <small style={{ display: "block", marginTop: 6, color: "#15803d", fontSize: 11.5 }}>
                  ✓ {devHints.email}
                </small>
              )}
            </>
          )}
        </div>

        {/* Mobile Number Verification Section */}
        <div className="notice" style={{ background: status.phoneVerified ? "#f0fdf4" : "#fdfcf9", borderColor: status.phoneVerified ? "#bbf7d0" : "var(--line)" }}>
          <strong style={{ color: status.phoneVerified ? "#166534" : "inherit" }}>
            {status.phoneVerified ? "✓" : "⚠"} {t("mobileNumberLabel")}: {label(status.phoneVerified)}
            {status.phoneVerified && status.phoneVerifiedAt ? ` (${status.mobileMasked || maskPhonePreview(mobile)})` : ""}
          </strong>
          {!status.phoneVerified && (
            <>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                <input
                  aria-label={t("mobileInputPlaceholder")}
                  inputMode="tel"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder={t("mobileInputPlaceholder")}
                  disabled={!!busy || status.phoneVerified}
                  style={{ width: 170 }}
                />
                <button
                  className="outline-btn"
                  type="button"
                  disabled={!!busy || mobile.length < 10 || phoneCooldown > 0 || status.phoneVerified}
                  onClick={() => run("phone", "/api/auth/phone/send-otp", { mobile })}
                >
                  {phoneCooldown > 0 ? `${t("resendIn")} ${phoneCooldown}s` : busy === "phone" ? "…" : phoneSent ? t("sendAgain") : t("sendCodeBtn")}
                </button>
                <input
                  aria-label={t("otpInputPlaceholder")}
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder={t("otpInputPlaceholder")}
                  disabled={!!busy || status.phoneVerified}
                  style={{ width: 110, letterSpacing: 2, textAlign: "center" }}
                />
                <button
                  className="primary-btn"
                  type="button"
                  disabled={!!busy || otp.length !== 6 || status.phoneVerified}
                  onClick={() => run("phoneVerify", "/api/auth/phone/verify-otp", { mobile, otp })}
                >
                  {busy === "phoneVerify" ? "…" : t("verifyActionBtn")}
                </button>
              </div>
              {devHints.phone && (
                <small style={{ display: "block", marginTop: 6, color: "#15803d", fontSize: 11.5 }}>
                  ✓ {devHints.phone}
                </small>
              )}
            </>
          )}
        </div>

        {/* Aadhaar Identity Verification Section */}
        <div className="notice" style={{ background: status.aadhaarVerified ? "#f0fdf4" : "#fdfcf9", borderColor: status.aadhaarVerified ? "#bbf7d0" : "var(--line)" }}>
          <strong style={{ color: status.aadhaarVerified ? "#166534" : "inherit" }}>
            {status.aadhaarVerified ? "✓" : "⚠"} {t("aadhaarIdentity")}: {status.aadhaarVerified ? t("verified") : status.identityVerificationStatus === "PENDING" ? t("pending") : t("notVerified")}
            {status.aadhaarVerified && status.aadhaarLast4 ? ` (•••• •••• ${status.aadhaarLast4})` : ""}
          </strong>
          {!status.aadhaarVerified && (
            <>
              <p style={{ margin: "8px 0", fontSize: 12, color: "#4b5563" }}>{t("aadhaarConsentText")}</p>
              <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12.5, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  disabled={!!busy || status.aadhaarVerified}
                />
                <span>{t("aadhaarConsentText")}</span>
              </label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                <input
                  aria-label={t("aadhaarInputPlaceholder")}
                  type="password"
                  inputMode="numeric"
                  maxLength={12}
                  value={aadhaar}
                  onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, "").slice(0, 12))}
                  placeholder={t("aadhaarInputPlaceholder")}
                  disabled={!!busy || status.aadhaarVerified}
                  style={{ width: 230, letterSpacing: 1 }}
                />
                <button
                  className="primary-btn"
                  type="button"
                  disabled={!!busy || !consent || aadhaar.length !== 12 || status.aadhaarVerified}
                  onClick={() => run("aadhaar", "/api/identity/aadhaar/initiate", { aadhaar, consent })}
                >
                  {busy === "aadhaar" ? "…" : t("startAadhaarVerification")}
                </button>
                <input
                  aria-label={t("last4DigitsPlaceholder")}
                  inputMode="numeric"
                  maxLength={4}
                  value={last4}
                  onChange={(e) => setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder={t("last4DigitsPlaceholder")}
                  disabled={!!busy || status.aadhaarVerified || status.identityVerificationStatus !== "PENDING"}
                  style={{ width: 110, letterSpacing: 2, textAlign: "center" }}
                />
                <button
                  className="outline-btn"
                  type="button"
                  disabled={!!busy || status.identityVerificationStatus !== "PENDING" || last4.length !== 4}
                  onClick={() => run("aadhaarVerify", "/api/identity/aadhaar/verify", { last4 })}
                >
                  {busy === "aadhaarVerify" ? "…" : t("verifyActionBtn")}
                </button>
              </div>
              {devHints.aadhaar && (
                <small style={{ display: "block", marginTop: 6, color: "#15803d", fontSize: 11.5 }}>
                  ✓ {devHints.aadhaar}
                </small>
              )}
            </>
          )}
        </div>
      </div>

      {message && (
        <div
          role={isError ? "alert" : "status"}
          aria-live="polite"
          className={isError ? "auth-inline-error" : "auth-inline-success"}
          style={{ marginTop: 14 }}
        >
          {message}
        </div>
      )}

      {allVerified && (
        <div style={{ marginTop: 14, padding: "10px 14px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, color: "#166534", fontSize: 12.5, display: "flex", alignItems: "center", gap: 8 }}>
          <span>✓</span>
          <strong>{t("allCompletedVerification")}</strong>
        </div>
      )}
    </section>
  );
}
