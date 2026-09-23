import React, { useState, useEffect, useMemo } from "react";
import {
  HeartPulse, ArrowLeft, ArrowRight, ShieldCheck, Check, AlertCircle,
  Smartphone, Lock, Calendar, MapPin, Activity, PhoneCall, FileText,
  User, RefreshCw, Eye, EyeOff, Sparkles, HelpCircle, ChevronRight
} from "lucide-react";
import { useLanguage, LanguageSelector } from "../i18n/LanguageContext.jsx";
import { ThemeToggle } from "../theme/ThemeContext.jsx";

const DRAFT_STORAGE_KEY = "carepath_registration_draft";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const INITIAL_FORM = {
  // Step 1: Identity & Contact
  name: "",
  mobile: "",
  mobileVerified: false,
  otpCode: "",
  email: "",
  preferredLanguage: "en",

  // Step 2: Account Security
  password: "",
  confirmPassword: "",
  passwordless: false,
  biometricEnabled: false,

  // Step 3: Demographics
  dob: "",
  gender: "Male",
  city: "",
  address: "",

  // Step 4: Health Profile
  heightCm: 170,
  weightKg: 68,
  bloodGroup: "O+",
  chronicConditions: [],
  otherConditionText: "",
  allergies: [],
  otherAllergyText: "",
  medications: "",

  // Step 5: Emergency Contact
  emergencyName: "",
  emergencyRelation: "Parent",
  emergencyPhone: "",

  // Step 6: Consent
  consentDpdp: false
};

const CHRONIC_OPTIONS = [
  { key: "diabetes", labelKey: "conditionDiabetes" },
  { key: "hypertension", labelKey: "conditionHypertension" },
  { key: "asthma", labelKey: "conditionAsthma" },
  { key: "thyroid", labelKey: "conditionThyroid" },
  { key: "heart", labelKey: "conditionHeart" },
  { key: "kidney", labelKey: "conditionKidney" },
  { key: "none", labelKey: "conditionNone" }
];

const ALLERGY_OPTIONS = ["Penicillin", "Sulfa drugs", "Peanuts", "Pollen / Dust", "Latex", "None"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];
const RELATIONS = ["Parent", "Spouse", "Child", "Sibling", "Relative", "Friend", "Other"];

export default function RegistrationWizard({ onAuthenticated, onSwitchToLogin, onDemoLogin }) {
  const { t, language, setLanguage, languages } = useLanguage();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...INITIAL_FORM, ...parsed.formData };
      }
    } catch {}
    return { ...INITIAL_FORM, preferredLanguage: language };
  });

  const [hasDraft, setHasDraft] = useState(false);
  const [draftStep, setDraftStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP state for Step 1
  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState("");

  // Check for saved draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.step && parsed.step > 1) {
          setHasDraft(true);
          setDraftStep(parsed.step);
        }
      }
    } catch {}
  }, []);

  // Auto-save draft on every change
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ step, formData }));
    } catch {}
  }, [step, formData]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = setInterval(() => setOtpCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [otpCooldown]);

  function updateField(key, value) {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setError("");
  }

  // Password strength calculator
  const passwordStrength = useMemo(() => {
    const pwd = formData.password;
    if (!pwd) return { score: 0, text: "" };
    let score = 0;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 1, label: t("passwordWeak"), color: "#ef4444" };
    if (score <= 3) return { score: 2, label: t("passwordMedium"), color: "#f59e0b" };
    return { score: 3, label: t("passwordStrong"), color: "#10b981" };
  }, [formData.password, t]);

  // Step 1: Send Mobile OTP
  async function handleSendOtp() {
    const cleanMobile = formData.mobile.replace(/\D/g, "").slice(-10);
    if (cleanMobile.length < 10) {
      setError(t("validMobileError"));
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: cleanMobile })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t("otpSendFail"));
      }
      setOtpSent(true);
      setOtpCooldown(30);
      if (data.devOtp) {
        setDevOtpHint(data.devOtp);
      }
      setInfoMsg(t("otpSentSuccess", { mobile: cleanMobile }));
    } catch (err) {
      setError(err.message || t("otpSendFail"));
    } finally {
      setLoading(false);
    }
  }

  // Step 1: Verify Mobile OTP
  async function handleVerifyOtp() {
    const cleanMobile = formData.mobile.replace(/\D/g, "").slice(-10);
    if (!formData.otpCode || formData.otpCode.length < 6) {
      setError(t("enterSixDigitOtp"));
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: cleanMobile, otp: formData.otpCode })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t("otpInvalidExpired"));
      }
      if (data.userExists && data.token) {
        // User is already registered! Inform user or sign them in
        onAuthenticated(data.token, data.user);
        return;
      }
      updateField("mobileVerified", true);
      setInfoMsg(t("mobileVerifiedSuccess"));
    } catch (err) {
      setError(err.message || t("otpInvalidExpired"));
    } finally {
      setLoading(false);
    }
  }

  // Validation before advancing to next step
  function validateCurrentStep() {
    setError("");
    if (step === 1) {
      if (!formData.name.trim()) {
        setError(t("fullNameRequired"));
        return false;
      }
      const cleanMobile = formData.mobile.replace(/\D/g, "");
      if (cleanMobile.length < 10) {
        setError(t("validMobileError"));
        return false;
      }
      if (!formData.mobileVerified) {
        setError(t("verifyMobileFirst"));
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (!formData.passwordless) {
        if (!formData.password || formData.password.length < 10) {
          setError(t("passwordLengthError"));
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError(t("passwordMismatch"));
          return false;
        }
      }
      return true;
    }

    if (step === 3) {
      if (!formData.dob) {
        setError(t("dobRequired"));
        return false;
      }
      if (!formData.city.trim()) {
        setError(t("cityRequired"));
        return false;
      }
      return true;
    }

    if (step === 4) {
      if (!formData.heightCm || formData.heightCm < 50 || formData.heightCm > 250) {
        setError(t("heightRangeError"));
        return false;
      }
      if (!formData.weightKg || formData.weightKg < 20 || formData.weightKg > 300) {
        setError(t("weightRangeError"));
        return false;
      }
      return true;
    }

    if (step === 5) {
      // Optional, but if phone is entered, ensure 10 digits
      if (formData.emergencyPhone && formData.emergencyPhone.replace(/\D/g, "").length < 10) {
        setError(t("emergencyPhoneDigits"));
        return false;
      }
      return true;
    }

    if (step === 6) {
      if (!formData.consentDpdp) {
        setError(t("dpdpConsentRequired"));
        return false;
      }
      return true;
    }

    return true;
  }

  function handleNext() {
    if (validateCurrentStep()) {
      setStep((s) => Math.min(6, s + 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleBack() {
    setError("");
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Toggle chronic condition chips
  function toggleCondition(condKey) {
    if (condKey === "none") {
      updateField("chronicConditions", ["none"]);
      return;
    }
    const current = formData.chronicConditions.filter((c) => c !== "none");
    if (current.includes(condKey)) {
      updateField("chronicConditions", current.filter((c) => c !== condKey));
    } else {
      updateField("chronicConditions", [...current, condKey]);
    }
  }

  // Toggle allergy chips
  function toggleAllergy(allergy) {
    if (allergy === "None") {
      updateField("allergies", ["None"]);
      return;
    }
    const current = formData.allergies.filter((a) => a !== "None");
    if (current.includes(allergy)) {
      updateField("allergies", current.filter((a) => a !== allergy));
    } else {
      updateField("allergies", [...current, allergy]);
    }
  }

  // Final submission of all onboarding wizard data
  async function handleFinalSubmit(e) {
    e?.preventDefault();
    if (!validateCurrentStep()) return;

    setLoading(true);
    setError("");
    try {
      const allConditions = [...formData.chronicConditions];
      if (formData.otherConditionText.trim()) {
        allConditions.push(formData.otherConditionText.trim());
      }

      const allAllergies = [...formData.allergies];
      if (formData.otherAllergyText.trim()) {
        allAllergies.push(formData.otherAllergyText.trim());
      }

      const payload = {
        name: formData.name.trim(),
        mobile: formData.mobile.replace(/\D/g, "").slice(-10),
        email: formData.email.trim() || undefined,
        password: formData.passwordless ? undefined : formData.password,
        role: "patient",
        preferredLanguage: formData.preferredLanguage || language,
        dob: formData.dob,
        gender: formData.gender,
        city: formData.city.trim(),
        address: formData.address.trim() || undefined,
        healthProfile: {
          heightCm: Number(formData.heightCm),
          weightKg: Number(formData.weightKg),
          bloodGroup: formData.bloodGroup,
          chronicConditions: allConditions,
          allergies: allAllergies,
          medications: formData.medications.trim() ? [formData.medications.trim()] : []
        },
        emergencyContact: formData.emergencyName.trim() ? {
          name: formData.emergencyName.trim(),
          relation: formData.emergencyRelation,
          phone: formData.emergencyPhone.replace(/\D/g, "")
        } : undefined,
        consent: true
      };

      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t("registrationFailed"));
      }

      // Clear draft storage upon successful creation
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      onAuthenticated(data.token, data.user);
    } catch (err) {
      setError(err.message || t("registrationFailed"));
    } finally {
      setLoading(false);
    }
  }

  // Resume / Discard draft handlers
  function handleResumeDraft() {
    setStep(draftStep);
    setHasDraft(false);
  }

  function handleDiscardDraft() {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setFormData({ ...INITIAL_FORM, preferredLanguage: language });
    setStep(1);
    setHasDraft(false);
  }

  return (
    <div className="auth-screen" style={{ padding: "30px 16px" }}>
      <div className="wizard-container">
        {/* Universal Top Header */}
        <div className="wizard-header-top">
          <div className="brand" style={{ padding: 0 }}>
            <div className="brand-mark"><HeartPulse size={21} /></div>
            <div><strong>CarePath</strong><span>{t("appName")}</span></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <LanguageSelector variant="compact" />
            <ThemeToggle variant="compact" />
          </div>
        </div>

        {/* Resumable draft banner */}
        {hasDraft && (
          <div className="resume-draft-alert">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={16} color="#ca8a04" />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#854d0e" }}>
                {t("resumeDraftBanner")}
              </span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className="primary-btn compact"
                onClick={handleResumeDraft}
                style={{ padding: "4px 10px", fontSize: 11 }}
              >
                {t("resumeDraftBtn", { step: draftStep })}
              </button>
              <button
                type="button"
                className="text-btn"
                onClick={handleDiscardDraft}
                style={{ fontSize: 11, color: "#a16207" }}
              >
                {t("discardDraftBtn")}
              </button>
            </div>
          </div>
        )}

        {/* Progress Bar & Step Badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="wizard-step-badge">
            {t("stepOf", { current: step, total: 6 })}
          </span>
          <button
            type="button"
            className="text-btn"
            onClick={onSwitchToLogin}
            style={{ fontSize: 12 }}
          >
            {t("alreadyAccount")}
          </button>
        </div>

        <div className="wizard-progress-track">
          <div className="wizard-progress-bar" style={{ width: `${(step / 6) * 100}%` }} />
        </div>

        {/* Hackathon Evaluator Quick-Start Showcase Bar */}
        {onDemoLogin && (
          <div className="hackathon-demo-showcase">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span className="demo-header-badge">⚡ QUICK-START DEMO</span>
              <span style={{ fontSize: 10.5, color: "#cbd5e1", fontWeight: 600 }}>Zero setup · 1-click test</span>
            </div>
            <h3 className="demo-showcase-title">Explore CarePath 2.0 Live Prototype</h3>
            <p className="demo-showcase-subtitle">
              Choose an evaluator role below to instantly load the full connected experience with seeded telemetry, health records, and clinical intake:
            </p>
            <div className="demo-cards-row">
              <div
                className="demo-card-item"
                role="button"
                tabIndex={0}
                onClick={() => onDemoLogin("patient")}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onDemoLogin("patient"); }}
              >
                <div>
                  <div className="demo-card-role-tag patient">
                    <span>👤 Aarav Sharma</span>
                    <span style={{ fontSize: 9.5, background: "#065f46", color: "#a7f3d0", padding: "1px 5px", borderRadius: 4 }}>PATIENT</span>
                  </div>
                  <p className="demo-card-desc">
                    AI MediKiosk voice intake, encrypted health records, PIN sharing & AYUSH Prakriti engine.
                  </p>
                </div>
                <button type="button" className="demo-card-pill-btn">
                  <span>Launch Patient Portal</span>
                  <ChevronRight size={13} />
                </button>
              </div>

              <div
                className="demo-card-item"
                role="button"
                tabIndex={0}
                onClick={() => onDemoLogin("doctor")}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onDemoLogin("doctor"); }}
              >
                <div>
                  <div className="demo-card-role-tag doctor">
                    <span>🩺 Dr. Alok Verma</span>
                    <span style={{ fontSize: 9.5, background: "#4c1d95", color: "#ddd6fe", padding: "1px 5px", borderRadius: 4 }}>DOCTOR</span>
                  </div>
                  <p className="demo-card-desc">
                    Clinical triage desk, PIN-verified patient record access, MediKiosk intake transcripts & ABDM FHIR review.
                  </p>
                </div>
                <button type="button" className="demo-card-pill-btn">
                  <span>Launch Doctor Console</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Messages */}
        {error && (
          <div className="auth-inline-error" role="alert" style={{ marginBottom: 16 }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}
        {infoMsg && (
          <div className="auth-inline-success" role="status" style={{ marginBottom: 16 }}>
            <Check size={15} style={{ flexShrink: 0 }} />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 1: IDENTITY & CONTACT */}
        {/* ============================================================ */}
        {step === 1 && (
          <div className="wizard-body">
            <span className="eyebrow">{t("registerTitle")}</span>
            <h1 style={{ fontSize: 24, margin: "6px 0 4px" }}>{t("step1Title")}</h1>
            <p className="muted" style={{ marginBottom: 20 }}>{t("step1Desc")}</p>

            <div className="auth-field">
              <label htmlFor="reg-fullname">{t("fullNameLabel")} *</label>
              <input
                id="reg-fullname"
                type="text"
                required
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder={t("fullNamePlaceholder")}
                autoComplete="name"
              />
            </div>

            {/* Mobile with OTP flow */}
            <div className="auth-field">
              <label htmlFor="reg-mobile">{t("mobileLabel")} *</label>
              <div className="auth-otp-row">
                <input
                  id="reg-mobile"
                  type="tel"
                  required
                  maxLength={13}
                  value={formData.mobile}
                  onChange={(e) => {
                    updateField("mobile", e.target.value);
                    if (formData.mobileVerified) updateField("mobileVerified", false);
                  }}
                  placeholder={t("mobilePlaceholder")}
                  disabled={formData.mobileVerified}
                />
                <button
                  type="button"
                  className="outline-btn"
                  onClick={handleSendOtp}
                  disabled={loading || otpCooldown > 0 || formData.mobileVerified}
                  style={{ whiteSpace: "nowrap", fontSize: 11, padding: "8px 12px" }}
                >
                  {formData.mobileVerified
                    ? t("verified")
                    : otpCooldown > 0
                    ? `${t("resendOtp")} (${otpCooldown}${t("seconds")})`
                    : otpSent
                    ? t("resendOtp")
                    : t("sendOtp")}
                </button>
              </div>
              <span style={{ fontSize: 11, color: "#64748b", marginTop: 4, display: "block" }}>
                {t("mobileOtpNotice")}
              </span>
            </div>

            {/* OTP code input when sent and not yet verified */}
            {otpSent && !formData.mobileVerified && (
              <div className="auth-field" style={{ background: "#f8fafc", padding: 14, borderRadius: 12, border: "1px solid var(--line)" }}>
                <label htmlFor="reg-otp">{t("enterOtp")}</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    id="reg-otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={formData.otpCode}
                    onChange={(e) => updateField("otpCode", e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    style={{ fontSize: 18, letterSpacing: 4, textAlign: "center", fontWeight: 700 }}
                  />
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={handleVerifyOtp}
                    disabled={loading || formData.otpCode.length < 6}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {loading ? <RefreshCw size={14} className="spin" /> : t("verify")}
                  </button>
                </div>
                {devOtpHint && (
                  <div style={{ marginTop: 8, fontSize: 11, color: "var(--green)" }}>
                    💡 Sandbox Helper: Use verification code <strong>{devOtpHint}</strong> (
                    <button
                      type="button"
                      className="text-btn"
                      style={{ fontSize: 11, textDecoration: "underline", padding: 0 }}
                      onClick={() => updateField("otpCode", devOtpHint)}
                    >
                      Fill code
                    </button>
                    )
                  </div>
                )}
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="reg-email">{t("emailLabel")}</label>
              <input
                id="reg-email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder={t("emailPlaceholder")}
                autoComplete="email"
              />
            </div>

            {/* Preferred Language - asked once here, sets globally */}
            <div className="auth-field">
              <label htmlFor="reg-lang">{t("languageLabel")}</label>
              <select
                id="reg-lang"
                value={formData.preferredLanguage}
                onChange={(e) => {
                  const val = e.target.value;
                  updateField("preferredLanguage", val);
                  setLanguage(val);
                }}
                className="field"
                style={{ borderRadius: 10, padding: 10, fontWeight: 600 }}
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag ? `${l.flag} ` : ""}{l.nativeLabel || l.nativeName} ({l.label || l.name})
                  </option>
                ))}
              </select>
              <span style={{ fontSize: 11, color: "#64748b", marginTop: 4, display: "block" }}>
                {t("languageDesc")}
              </span>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 2: ACCOUNT SECURITY */}
        {/* ============================================================ */}
        {step === 2 && (
          <div className="wizard-body">
            <span className="eyebrow">{t("registerTitle")}</span>
            <h1 style={{ fontSize: 24, margin: "6px 0 4px" }}>{t("step2Title")}</h1>
            <p className="muted" style={{ marginBottom: 20 }}>{t("step2Desc")}</p>

            {/* Passwordless OTP toggle */}
            <label style={{ display: "flex", gap: 10, alignItems: "center", background: "#f8faf9", padding: "12px 14px", borderRadius: 12, border: "1px solid var(--line)", marginBottom: 18, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={formData.passwordless}
                onChange={(e) => updateField("passwordless", e.target.checked)}
                style={{ accentColor: "var(--green)", width: 16, height: 16 }}
              />
              <span style={{ fontSize: 12, fontWeight: 600 }}>
                {t("passwordlessOption")}
              </span>
            </label>

            {!formData.passwordless && (
              <>
                <div className="auth-field">
                  <label htmlFor="sec-password">{t("passwordLabel")} *</label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="sec-password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      placeholder={t("passwordPlaceholder")}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={t("togglePasswordAria")}
                      style={{ position: "absolute", right: 8, top: 7 }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {formData.password && (
                    <div style={{ marginTop: 6 }}>
                      <div className="strength-meter">
                        <div
                          className="strength-meter-bar"
                          style={{
                            width: `${(passwordStrength.score / 3) * 100}%`,
                            background: passwordStrength.color
                          }}
                        />
                      </div>
                      <span style={{ fontSize: 11, color: passwordStrength.color, fontWeight: 600, display: "block", marginTop: 4 }}>
                        {passwordStrength.label}
                      </span>
                    </div>
                  )}
                </div>

                <div className="auth-field">
                  <label htmlFor="sec-confirm">{t("confirmPasswordLabel")} *</label>
                  <input
                    id="sec-confirm"
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                    placeholder={t("confirmPasswordPlaceholder")}
                    autoComplete="new-password"
                  />
                </div>
              </>
            )}

            {/* Optional Biometric / 2FA */}
            <label style={{ display: "flex", gap: 10, alignItems: "center", background: "#f8faf9", padding: "12px 14px", borderRadius: 12, border: "1px solid var(--line)", marginTop: 12, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={formData.biometricEnabled}
                onChange={(e) => updateField("biometricEnabled", e.target.checked)}
                style={{ accentColor: "var(--green)", width: 16, height: 16 }}
              />
              <span style={{ fontSize: 12, color: "#475569" }}>
                {t("biometricOption")} ({t("optional")})
              </span>
            </label>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 3: DEMOGRAPHICS */}
        {/* ============================================================ */}
        {step === 3 && (
          <div className="wizard-body">
            <span className="eyebrow">{t("registerTitle")}</span>
            <h1 style={{ fontSize: 24, margin: "6px 0 4px" }}>{t("step3Title")}</h1>
            <p className="muted" style={{ marginBottom: 20 }}>{t("step3Desc")}</p>

            <div className="two-fields">
              <div className="auth-field">
                <label htmlFor="demo-dob">{t("dobLabel")} *</label>
                <input
                  id="demo-dob"
                  type="date"
                  required
                  value={formData.dob}
                  onChange={(e) => updateField("dob", e.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                />
              </div>

              <div className="auth-field">
                <label>{t("genderLabel")} *</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                  {["Male", "Female", "Non-Binary", "Prefer not to say"].map((g) => {
                    const isSel = formData.gender === g;
                    return (
                      <button
                        key={g}
                        type="button"
                        className={`chip-btn ${isSel ? "selected" : ""}`}
                        onClick={() => updateField("gender", g)}
                        style={{ padding: "8px 12px", fontSize: 11 }}
                      >
                        {g === "Male" ? t("genderMale") : g === "Female" ? t("genderFemale") : g === "Non-Binary" ? t("genderNonBinary") : t("genderPreferNot")}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="demo-city">{t("cityLabel")} *</label>
              <input
                id="demo-city"
                type="text"
                required
                value={formData.city}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder={t("cityPlaceholder")}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="demo-address">{t("addressLabel")}</label>
              <input
                id="demo-address"
                type="text"
                value={formData.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder={t("addressPlaceholder")}
              />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 4: CORE HEALTH PROFILE */}
        {/* ============================================================ */}
        {step === 4 && (
          <div className="wizard-body">
            <span className="eyebrow">{t("registerTitle")}</span>
            <h1 style={{ fontSize: 24, margin: "6px 0 4px" }}>{t("step4Title")}</h1>
            <p className="muted" style={{ marginBottom: 14 }}>{t("step4Desc")}</p>

            {/* DPDP Sensitive Data Protection Notice */}
            <div className="dpdp-notice-card">
              <ShieldCheck size={20} color="#166534" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong>{t("dpdpComplianceTitle")}</strong>
                <p style={{ margin: "4px 0 0", fontSize: 11 }}>{t("dpdpHealthNotice")}</p>
              </div>
            </div>

            {/* Height Slider + Stepper */}
            <div className="auth-field">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label>{t("heightLabel")}</label>
                <strong style={{ fontSize: 14, color: "var(--green)" }}>
                  {formData.heightCm} cm ({Math.floor(formData.heightCm / 30.48)}' {Math.round((formData.heightCm % 30.48) / 2.54)}")
                </strong>
              </div>
              <div className="stepper-box">
                <input
                  type="range"
                  min={100}
                  max={220}
                  value={formData.heightCm}
                  onChange={(e) => updateField("heightCm", Number(e.target.value))}
                  className="range-slider"
                />
                <div className="stepper-controls" style={{ marginLeft: 16 }}>
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => updateField("heightCm", Math.max(100, formData.heightCm - 1))}
                  >
                    -
                  </button>
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => updateField("heightCm", Math.min(220, formData.heightCm + 1))}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Weight Slider + Stepper */}
            <div className="auth-field">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label>{t("weightLabel")}</label>
                <strong style={{ fontSize: 14, color: "var(--green)" }}>{formData.weightKg} kg</strong>
              </div>
              <div className="stepper-box">
                <input
                  type="range"
                  min={30}
                  max={180}
                  value={formData.weightKg}
                  onChange={(e) => updateField("weightKg", Number(e.target.value))}
                  className="range-slider"
                />
                <div className="stepper-controls" style={{ marginLeft: 16 }}>
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => updateField("weightKg", Math.max(30, formData.weightKg - 1))}
                  >
                    -
                  </button>
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => updateField("weightKg", Math.min(180, formData.weightKg + 1))}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Blood Group Pills */}
            <div className="auth-field">
              <label>{t("bloodGroupLabel")} *</label>
              <div className="chip-group">
                {BLOOD_GROUPS.map((bg) => {
                  const isSel = formData.bloodGroup === bg;
                  return (
                    <button
                      key={bg}
                      type="button"
                      className={`chip-btn ${isSel ? "selected" : ""}`}
                      onClick={() => updateField("bloodGroup", bg)}
                    >
                      {bg}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chronic Conditions */}
            <div className="auth-field">
              <label>{t("chronicConditionsLabel")}</label>
              <span style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 6 }}>
                {t("chronicConditionsDesc")}
              </span>
              <div className="chip-group">
                {CHRONIC_OPTIONS.map((item) => {
                  const isSel = formData.chronicConditions.includes(item.key);
                  return (
                    <button
                      key={item.key}
                      type="button"
                      className={`chip-btn ${isSel ? "selected" : ""}`}
                      onClick={() => toggleCondition(item.key)}
                    >
                      {t(item.labelKey)}
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                value={formData.otherConditionText}
                onChange={(e) => updateField("otherConditionText", e.target.value)}
                placeholder={t("otherConditionPrompt")}
                style={{ marginTop: 6 }}
              />
            </div>

            {/* Allergies */}
            <div className="auth-field">
              <label>{t("allergiesLabel")} ({t("optional")})</label>
              <div className="chip-group">
                {ALLERGY_OPTIONS.map((al) => {
                  const isSel = formData.allergies.includes(al);
                  return (
                    <button
                      key={al}
                      type="button"
                      className={`chip-btn ${isSel ? "selected" : ""}`}
                      onClick={() => toggleAllergy(al)}
                    >
                      {al}
                    </button>
                  );
                })}
              </div>
              <input
                type="text"
                value={formData.otherAllergyText}
                onChange={(e) => updateField("otherAllergyText", e.target.value)}
                placeholder={t("allergiesPlaceholder")}
                style={{ marginTop: 6 }}
              />
            </div>

            {/* Current Medications */}
            <div className="auth-field">
              <label htmlFor="health-meds">{t("medicationsLabel")} ({t("optional")})</label>
              <input
                id="health-meds"
                type="text"
                value={formData.medications}
                onChange={(e) => updateField("medications", e.target.value)}
                placeholder={t("medicationsPlaceholder")}
              />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 5: EMERGENCY CONTACT */}
        {/* ============================================================ */}
        {step === 5 && (
          <div className="wizard-body">
            <span className="eyebrow">{t("registerTitle")}</span>
            <h1 style={{ fontSize: 24, margin: "6px 0 4px" }}>{t("step5Title")}</h1>
            <p className="muted" style={{ marginBottom: 20 }}>{t("step5Desc")}</p>

            <div className="auth-field">
              <label htmlFor="em-name">{t("emergencyNameLabel")} ({t("optional")})</label>
              <input
                id="em-name"
                type="text"
                value={formData.emergencyName}
                onChange={(e) => updateField("emergencyName", e.target.value)}
                placeholder={t("emergencyNamePlaceholder")}
              />
            </div>

            <div className="two-fields">
              <div className="auth-field">
                <label htmlFor="em-rel">{t("emergencyRelationLabel")}</label>
                <select
                  id="em-rel"
                  value={formData.emergencyRelation}
                  onChange={(e) => updateField("emergencyRelation", e.target.value)}
                  className="field"
                  style={{ borderRadius: 10, padding: 10 }}
                >
                  {RELATIONS.map((r) => (
                    <option key={r} value={r}>
                      {r === "Parent" ? t("relationParent") :
                       r === "Spouse" ? t("relationSpouse") :
                       r === "Child" ? t("relationChild") :
                       r === "Sibling" ? t("relationSibling") :
                       r === "Relative" ? t("relationRelative") :
                       r === "Friend" ? t("relationFriend") : t("relationOther")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="auth-field">
                <label htmlFor="em-phone">{t("emergencyPhoneLabel")}</label>
                <input
                  id="em-phone"
                  type="tel"
                  maxLength={13}
                  value={formData.emergencyPhone}
                  onChange={(e) => updateField("emergencyPhone", e.target.value)}
                  placeholder={t("emergencyPhonePlaceholder")}
                />
              </div>
            </div>

            <button
              type="button"
              className="text-btn"
              onClick={() => {
                updateField("emergencyName", "");
                updateField("emergencyPhone", "");
                handleNext();
              }}
              style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}
            >
              {t("skip")} →
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 6: CONSENT & REVIEW */}
        {/* ============================================================ */}
        {step === 6 && (
          <div className="wizard-body">
            <span className="eyebrow">{t("registerTitle")}</span>
            <h1 style={{ fontSize: 24, margin: "6px 0 4px" }}>{t("step6Title")}</h1>
            <p className="muted" style={{ marginBottom: 20 }}>{t("step6Desc")}</p>

            {/* Summary Review Card with Edit Jumps */}
            <div className="summary-review-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <strong style={{ fontSize: 13 }}>{t("reviewSummary")}</strong>
                <span style={{ fontSize: 10, color: "#64748b" }}>{t("clickEditToModify")}</span>
              </div>

              {/* Section 1 summary */}
              <div className="summary-section-row">
                <div>
                  <span style={{ color: "#64748b" }}>{t("step1Title")}: </span>
                  <strong>{formData.name}</strong> · {formData.mobile} {formData.email ? `· ${formData.email}` : ""}
                </div>
                <button type="button" className="text-btn" onClick={() => setStep(1)} style={{ fontSize: 11 }}>
                  {t("edit")}
                </button>
              </div>

              {/* Section 2 summary */}
              <div className="summary-section-row">
                <div>
                  <span style={{ color: "#64748b" }}>{t("step2Title")}: </span>
                  <strong>{formData.passwordless ? t("passwordlessOtpBadge") : t("passwordProtectedBadge")}</strong>
                </div>
                <button type="button" className="text-btn" onClick={() => setStep(2)} style={{ fontSize: 11 }}>
                  {t("edit")}
                </button>
              </div>

              {/* Section 3 summary */}
              <div className="summary-section-row">
                <div>
                  <span style={{ color: "#64748b" }}>{t("step3Title")}: </span>
                  <strong>{formData.gender}</strong> · {t("bornText", { dob: formData.dob })} · {formData.city}
                </div>
                <button type="button" className="text-btn" onClick={() => setStep(3)} style={{ fontSize: 11 }}>
                  {t("edit")}
                </button>
              </div>

              {/* Section 4 summary */}
              <div className="summary-section-row">
                <div>
                  <span style={{ color: "#64748b" }}>{t("step4Title")}: </span>
                  <strong>{formData.heightCm} cm / {formData.weightKg} kg</strong> · Blood: {formData.bloodGroup} · {t("conditionsSummaryText", { conditions: formData.chronicConditions.join(", ") || t("noneText") })}
                </div>
                <button type="button" className="text-btn" onClick={() => setStep(4)} style={{ fontSize: 11 }}>
                  {t("edit")}
                </button>
              </div>

              {/* Section 5 summary */}
              {formData.emergencyName && (
                <div className="summary-section-row">
                  <div>
                    <span style={{ color: "#64748b" }}>{t("step5Title")}: </span>
                    <strong>{formData.emergencyName}</strong> ({formData.emergencyRelation}) · {formData.emergencyPhone}
                  </div>
                  <button type="button" className="text-btn" onClick={() => setStep(5)} style={{ fontSize: 11 }}>
                    {t("edit")}
                  </button>
                </div>
              )}
            </div>

            {/* DPDP Act 2023 Consent Checkbox */}
            <label style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "#f0fdf4", padding: "14px 16px", borderRadius: 14, border: "1.5px solid #86efac", cursor: "pointer", marginTop: 16 }}>
              <input
                type="checkbox"
                required
                checked={formData.consentDpdp}
                onChange={(e) => updateField("consentDpdp", e.target.checked)}
                style={{ accentColor: "var(--green)", width: 18, height: 18, marginTop: 2 }}
              />
              <span style={{ fontSize: 11.5, color: "#166534", lineHeight: 1.5 }}>
                {t("dpdpConsentLabel")}
              </span>
            </label>
          </div>
        )}

        {/* Wizard Navigation Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 28, paddingTop: 18, borderTop: "1px solid var(--line)" }}>
          {step > 1 ? (
            <button
              type="button"
              className="secondary-btn"
              onClick={handleBack}
              disabled={loading}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <ArrowLeft size={16} /> {t("back")}
            </button>
          ) : (
            <button
              type="button"
              className="text-btn"
              onClick={onSwitchToLogin}
              style={{ fontSize: 12 }}
            >
              {t("alreadyAccount")}
            </button>
          )}

          {step < 6 ? (
            <button
              type="button"
              className="primary-btn"
              onClick={handleNext}
              disabled={loading}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              {t("next")} <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              className="primary-btn"
              onClick={handleFinalSubmit}
              disabled={loading || !formData.consentDpdp}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 20px" }}
            >
              {loading ? (
                <>
                  <RefreshCw size={15} className="spin" /> {t("loading")}
                </>
              ) : (
                <>
                  <ShieldCheck size={17} /> {t("createAccountBtn")}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
