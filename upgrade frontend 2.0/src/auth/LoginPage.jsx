import React, { useState, useEffect } from "react";
import {
  HeartPulse, ShieldCheck, AlertCircle, Check, Smartphone, Lock,
  RefreshCw, UserRound, Stethoscope, Users, ArrowRight
} from "lucide-react";
import { useLanguage, LanguageSelector } from "../i18n/LanguageContext.jsx";
import { ThemeToggle } from "../theme/ThemeContext.jsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export default function LoginPage({ onAuthenticated, onDemoLogin, onSwitchToRegister }) {
  const { t } = useLanguage();

  // Primary tab: "otp" (mobile number + OTP) | Secondary tab: "password" (email + password)
  const [tab, setTab] = useState("otp");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Mobile OTP login state
  const [otpMobile, setOtpMobile] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState("");

  // Password login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Handle Send OTP
  async function handleSendOtp(e) {
    e?.preventDefault();
    setError("");
    setSuccessMsg("");
    const cleanMobile = otpMobile.replace(/\D/g, "").slice(-10);
    if (cleanMobile.length < 10) {
      setError(t("validMobileError"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: cleanMobile })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || t("otpSendFail"));
      }
      setOtpSent(true);
      setCooldown(30);
      if (data.devOtp) {
        setDevOtpHint(data.devOtp);
      }
      setSuccessMsg(t("otpSentSuccess", { mobile: cleanMobile }));
    } catch (err) {
      setError(err.message || t("otpSendFail"));
    } finally {
      setLoading(false);
    }
  }

  // Handle Verify OTP
  async function handleVerifyOtp(e) {
    e?.preventDefault();
    setError("");
    setSuccessMsg("");
    const cleanMobile = otpMobile.replace(/\D/g, "").slice(-10);
    if (!otpCode || otpCode.length < 6) {
      setError(t("enterSixDigitOtp"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: cleanMobile, otp: otpCode.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || t("otpInvalidExpired"));
      }
      if (data.userExists && data.token) {
        onAuthenticated(data.token, data.user);
        return;
      }
      // If mobile is not registered, guide user to Register wizard
      setError(t("noAccountFoundForMobile"));
    } catch (err) {
      setError(err.message || t("otpInvalidExpired"));
    } finally {
      setLoading(false);
    }
  }

  // Handle Email + Password Login
  async function handlePasswordLogin(e) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!email || !password) {
      setError(t("provideEmailPassword"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || t("invalidEmailPassword"));
      }
      if (!data?.token) {
        throw new Error("Invalid session received from server.");
      }
      onAuthenticated(data.token, data.user);
    } catch (err) {
      setError(err.message || t("invalidEmailPassword"));
    } finally {
      setLoading(false);
    }
  }

  // Trigger Demo Sandbox Login
  async function handleDemoTrigger(role) {
    setError("");
    setSuccessMsg("");
    setLoading(true);
    try {
      await onDemoLogin(role);
    } catch (err) {
      setError(err.message || t("demoLoginUnavailable"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card" style={{ width: "min(460px, 100%)", padding: "32px 28px" }}>
        {/* Universal Top Header with Brand & Language Selector */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div className="brand" style={{ padding: 0 }}>
            <div className="brand-mark"><HeartPulse size={21} /></div>
            <div><strong>CarePath</strong><span>{t("tagline")}</span></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <LanguageSelector variant="compact" />
            <ThemeToggle variant="compact" />
          </div>
        </div>

        <span className="eyebrow">{t("loginTitle")}</span>
        <h1 style={{ fontSize: 26, margin: "6px 0 4px" }}>{t("loginTitle")}</h1>
        <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 18px", lineHeight: 1.5 }}>
          {t("loginSubtitle")}
        </p>

        {/* Hackathon Evaluator Quick-Start Showcase Bar */}
        {onDemoLogin && (
          <div className="hackathon-demo-showcase" style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span className="demo-header-badge">⚡ HACKATHON LIVE DEMO QUICK-START</span>
              <span style={{ fontSize: 10.5, color: "#cbd5e1", fontWeight: 600 }}>1-click login</span>
            </div>
            <div className="demo-cards-row">
              <div
                className="demo-card-item"
                role="button"
                tabIndex={0}
                onClick={() => handleDemoTrigger("patient")}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleDemoTrigger("patient"); }}
              >
                <div>
                  <div className="demo-card-role-tag patient">
                    <span>👤 Aarav Sharma</span>
                    <span style={{ fontSize: 9.5, background: "#065f46", color: "#a7f3d0", padding: "1px 5px", borderRadius: 4 }}>PATIENT</span>
                  </div>
                  <p className="demo-card-desc">
                    MediKiosk voice, live queue ticket, drug scanner & AYUSH.
                  </p>
                </div>
                <button type="button" className="demo-card-pill-btn">
                  <span>Demo Patient</span>
                  <ArrowRight size={12} />
                </button>
              </div>

              <div
                className="demo-card-item"
                role="button"
                tabIndex={0}
                onClick={() => handleDemoTrigger("doctor")}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleDemoTrigger("doctor"); }}
              >
                <div>
                  <div className="demo-card-role-tag doctor">
                    <span>🩺 Dr. Alok Verma</span>
                    <span style={{ fontSize: 9.5, background: "#4c1d95", color: "#ddd6fe", padding: "1px 5px", borderRadius: 4 }}>DOCTOR</span>
                  </div>
                  <p className="demo-card-desc">
                    Clinical triage desk, queue control & FHIR intake review.
                  </p>
                </div>
                <button type="button" className="demo-card-pill-btn">
                  <span>Demo Doctor</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Nudge to Register first */}
        <div style={{ background: "var(--green-soft)", border: "1px solid #c7e6dc", borderRadius: 12, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <span style={{ fontSize: 12, color: "var(--green-dark)", fontWeight: 600 }}>
            {t("newHerePrompt")}
          </span>
          <button
            type="button"
            className="primary-btn compact"
            onClick={onSwitchToRegister}
            style={{ fontSize: 11, padding: "6px 12px" }}
          >
            {t("registerTitle")} <ArrowRight size={13} />
          </button>
        </div>

        {/* Primary Tabs: Mobile OTP (default) vs Password */}
        <div className="auth-tabs" role="tablist" style={{ marginBottom: 16 }}>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "otp"}
            className={`auth-tab ${tab === "otp" ? "active" : ""}`}
            onClick={() => { setTab("otp"); setError(""); setSuccessMsg(""); }}
          >
            <Smartphone size={15} style={{ marginRight: 6 }} />
            {t("mobileLoginTab")}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "password"}
            className={`auth-tab ${tab === "password" ? "active" : ""}`}
            onClick={() => { setTab("password"); setError(""); setSuccessMsg(""); }}
          >
            <Lock size={15} style={{ marginRight: 6 }} />
            {t("passwordLoginTab")}
          </button>
        </div>

        {/* Inline Feedback */}
        {error && (
          <div className="auth-inline-error" role="alert" style={{ marginBottom: 14 }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="auth-inline-success" role="status" style={{ marginBottom: 14 }}>
            <Check size={15} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB 1: MOBILE OTP (Primary) */}
        {tab === "otp" && (
          <form className="auth-form" onSubmit={handleVerifyOtp}>
            <div className="auth-field">
              <label htmlFor="login-mobile">{t("mobileLabel")}</label>
              <div className="auth-otp-row">
                <input
                  id="login-mobile"
                  type="tel"
                  required
                  maxLength={13}
                  value={otpMobile}
                  onChange={(e) => setOtpMobile(e.target.value)}
                  placeholder={t("enterMobilePrompt")}
                  disabled={loading && !otpSent}
                />
                <button
                  type="button"
                  className="outline-btn"
                  onClick={handleSendOtp}
                  disabled={loading || cooldown > 0 || !otpMobile}
                  style={{ whiteSpace: "nowrap", fontSize: 11, padding: "8px 12px" }}
                >
                  {cooldown > 0
                    ? `${cooldown}${t("seconds")}`
                    : otpSent
                    ? t("resendOtp")
                    : t("sendOtp")}
                </button>
              </div>
            </div>

            {otpSent && (
              <div className="auth-field" style={{ background: "#f8fafc", padding: 12, borderRadius: 12, border: "1px solid var(--line)" }}>
                <label htmlFor="login-otp-code">{t("enterOtp")}</label>
                <input
                  id="login-otp-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  style={{ fontSize: 18, letterSpacing: 4, textAlign: "center", fontWeight: 700 }}
                  autoFocus
                />
                {devOtpHint && (
                  <div style={{ marginTop: 8, fontSize: 11, color: "var(--green)" }}>
                    💡 Sandbox Helper: OTP code is <strong>{devOtpHint}</strong> (
                    <button
                      type="button"
                      className="text-btn"
                      style={{ fontSize: 11, textDecoration: "underline", padding: 0 }}
                      onClick={() => setOtpCode(devOtpHint)}
                    >
                      Fill code
                    </button>
                    )
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "6px 0 12px" }}>
              {otpSent && (
                <button
                  type="button"
                  className="text-btn"
                  onClick={handleSendOtp}
                  disabled={cooldown > 0 || loading}
                  style={{ fontSize: 11 }}
                >
                  {cooldown > 0 ? t("resendIn", { sec: cooldown }) : t("resendNow")}
                </button>
              )}
            </div>

            <button
              type="submit"
              className="primary-btn auth-btn"
              disabled={!otpSent || otpCode.length < 6 || loading}
            >
              {loading ? (
                <>
                  <RefreshCw size={15} className="spin" /> {t("loading")}
                </>
              ) : (
                t("verifyAndSignIn")
              )}
            </button>
          </form>
        )}

        {/* TAB 2: EMAIL & PASSWORD (Secondary) */}
        {tab === "password" && (
          <form className="auth-form" onSubmit={handlePasswordLogin}>
            <div className="auth-field">
              <label htmlFor="login-email">{t("emailLabel")}</label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label htmlFor="login-password">{t("passwordLabel")}</label>
                <button
                  type="button"
                  className="text-btn"
                  onClick={() => setShowForgotModal(true)}
                  style={{ fontSize: 11, color: "var(--green)" }}
                >
                  {t("forgotPassword")}
                </button>
              </div>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("enterPasswordPlaceholder")}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="primary-btn auth-btn"
              disabled={loading}
              style={{ marginTop: 6 }}
            >
              {loading ? (
                <>
                  <RefreshCw size={15} className="spin" /> {t("loading")}
                </>
              ) : (
                t("signInBtn")
              )}
            </button>
          </form>
        )}

        {/* STRUCTURALLY SEPARATE EVALUATOR SANDBOX DEMO BLOCK */}
        <div className="demo-sandbox-card">
          <div className="demo-sandbox-header">
            <span style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>
              {t("demoAccessTitle")}
            </span>
            <span className="sandbox-badge">{t("demoBadge")}</span>
          </div>
          <p style={{ fontSize: 11, color: "#64748b", margin: "0 0 10px", lineHeight: 1.4 }}>
            {t("demoAccessNotice")}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
            <button
              type="button"
              className="auth-demo-btn"
              disabled={loading}
              onClick={() => handleDemoTrigger("patient")}
              style={{ fontSize: 11, padding: "8px 4px" }}
            >
              <UserRound size={13} /> {t("patientDemo")}
            </button>
            <button
              type="button"
              className="auth-demo-btn"
              disabled={loading}
              onClick={() => handleDemoTrigger("doctor")}
              style={{ fontSize: 11, padding: "8px 4px" }}
            >
              <Stethoscope size={13} /> {t("doctorDemo")}
            </button>
            <button
              type="button"
              className="auth-demo-btn"
              disabled={loading}
              onClick={() => handleDemoTrigger("staff")}
              style={{ fontSize: 11, padding: "8px 4px" }}
            >
              <Users size={13} /> {t("staffDemo")}
            </button>
          </div>
        </div>

        {/* Security & DPDP Footer */}
        <div className="security-line" style={{ marginTop: 18, justifyContent: "center" }}>
          <ShieldCheck size={16} />
          <span>{t("dpdpTransitNotice")}</span>
        </div>

        {/* Forgot Password Dialog */}
        {showForgotModal && (
          <div className="modal-backdrop" onClick={() => setShowForgotModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
              <div className="modal-head">
                <h2>{t("forgotPassword")}</h2>
                <button type="button" className="icon-btn" onClick={() => setShowForgotModal(false)}>✕</button>
              </div>
              <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5, marginBottom: 16 }}>
                {t("forgotPasswordModalText")}
              </p>
              <div className="modal-actions">
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => {
                    setShowForgotModal(false);
                    setTab("otp");
                  }}
                >
                  {t("useMobileOtpBtn")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
