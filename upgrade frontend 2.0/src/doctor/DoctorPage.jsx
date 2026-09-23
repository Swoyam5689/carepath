import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Check,
  RefreshCw,
  LockKeyhole,
  KeyRound,
  Sparkles,
  FileText,
  Pill,
  ExternalLink
} from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { PageIntro } from "../components/NavAndStats.jsx";
import { Modal, Empty } from "../components/Modal.jsx";
import { RecordCard } from "../records/RecordsPage.jsx";
import { VoiceInputButton } from "../components/VoiceInputButton.jsx";
import { apiFetch, getSharePin } from "../api/clientApi.js";

export function DoctorMediKioskPanel({ intake, onUpdateState, onNotify }) {
  const { t } = useLanguage();
  const [backendIntake, setBackendIntake] = useState(null);
  const [physicianNotes, setPhysicianNotes] = useState(intake?.doctorReview?.physicianNotes || "");
  const [reviewAction, setReviewAction] = useState(intake?.doctorReview?.action || "draft");
  const [showFhir, setShowFhir] = useState(false);

  useEffect(() => {
    let live = true;
    apiFetch("/api/medikiosk/intakes/latest")
      .then(res => res.json())
      .then(data => {
        if (live && data && data.id) {
          setBackendIntake(data);
        }
      })
      .catch(err => console.warn("Could not fetch latest medikiosk intake:", err));
    return () => { live = false; };
  }, []);

  const demoIntake = {
    patientName: "Swyom Sharma",
    abhaId: "91-4455-8822-1923",
    triageStatus: "ROUTINE_OUTPATIENT",
    summary: {
      chiefComplaint: "Severe Headache & Fever (सिरदर्द व बुखार)",
      socrates: {
        site: "Forehead & Temples",
        onset: "Started a few hours ago",
        character: "Throbbing / Pulsating",
        radiation: "Radiating to neck",
        associations: "Nausea, Photophobia",
        severityScore: "7/10"
      },
      pastConditions: ["Type 2 Diabetes Mellitus"],
      currentMeds: ["Amoxicillin 500 mg", "Paracetamol 500 mg"],
      allergies: "No known drug allergies reported",
      personal: { diet: "vegetarian", tobacco: "none", alcohol: "none" },
      abnormalLabs: [
        { test: "HbA1c", value: 8.4, unit: "%", referenceRange: "4.0 - 5.6%", status: "high", interpretation: "Elevated (Diabetic)" },
        { test: "Fasting Blood Sugar", value: 168, unit: "mg/dL", referenceRange: "70 - 99 mg/dL", status: "high", interpretation: "High" }
      ],
      ayushAssessment: { prakriti: "Pitta Dominant", vikriti: "Pitta Dushti (Hyperacidity/Heat)", aharaShakti: "Teekshnagni" }
    },
    fhirBundle: { resourceType: "Bundle", type: "document" }
  };

  const active = intake || backendIntake || demoIntake;
  const isEmergency = active.triageStatus === "EMERGENCY_CODE_RED";

  useEffect(() => {
    if (active?.doctorReview) {
      if (active.doctorReview.physicianNotes !== undefined) setPhysicianNotes(active.doctorReview.physicianNotes);
      if (active.doctorReview.action !== undefined) setReviewAction(active.doctorReview.action);
    }
  }, [active?.id, active?.doctorReview?.action, active?.doctorReview?.physicianNotes]);

  async function saveReview(actionType) {
    setReviewAction(actionType);
    const updatedReview = {
      action: actionType,
      physicianNotes,
      reviewedAt: new Date().toISOString()
    };
    if (onUpdateState) {
      onUpdateState(s => ({
        ...s,
        medikioskIntake: {
          ...active,
          doctorReview: updatedReview
        }
      }));
    }
    if (active?.id) {
      try {
        const res = await apiFetch(`/api/medikiosk/intakes/${encodeURIComponent(active.id)}/review`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: actionType, physicianNotes })
        });
        if (res.ok) {
          const updated = await res.json();
          setBackendIntake(updated);
        }
      } catch (err) {
        console.warn("Failed to sync doctor review to backend:", err);
      }
    }
    onNotify?.(actionType === "accepted" ? "Clinical intake confirmed & added to consultation record." : "Clinical note amended.");
  }

  return (
    <section className="card ai" style={{ marginBottom: 25, border: isEmergency ? "2px solid #b91c1c" : "1.5px solid var(--line)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="eyebrow" style={{ color: "var(--green)" }}>{t("medikioskIntakeEyebrow")}</span>
            {!intake && !backendIntake && <span style={{ background: "#fef3c7", color: "#92400e", fontSize: 10, padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>{t("demoPreview")}</span>}
          </div>
          <h2 style={{ margin: "4px 0 0", fontSize: 19 }}>
            {t("clinicalSummaryTitle", { name: active.patientName })}
          </h2>
          <span className="muted" style={{ fontSize: 12 }}>{t("submittedViaKiosk", { abha: active.abhaId })}</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center"}}>
          <span className={`medikiosk-abnormal-badge ${isEmergency ? "critical" : "normal"}`} style={{ fontSize: 12, padding: "6px 12px" }}>
            {isEmergency ? t("emergencyTriageBadge") : t("routineConsultBadge")}
          </span>
          <button className="outline-btn" style={{ fontSize: 11 }} onClick={() => setShowFhir(!showFhir)}>
            {t("fhirR4Bundle")}
          </button>
        </div>
      </div>

      {isEmergency && (
        <div className="batch-mismatch" style={{ margin: "0 0 16px" }}>
          <ShieldAlert size={22} />
          <div>
            <strong>{t("emergencyAlertSummary")}</strong>
            <span>{t("emergencyAlertDetail")}</span>
          </div>
        </div>
      )}

      <div style={{ background: "#f9fbfa", border: "1px solid var(--line)", borderRadius: 12, padding: 16, fontSize: 13, lineHeight: 1.6 }}>
        <div style={{ marginBottom: 8 }}>
          <strong>{t("chiefComplaintLabel")}</strong> {active.summary?.chiefComplaint}
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>{t("socratesHpiLabel")}</strong> Site: {active.summary?.socrates?.site} · Onset: {active.summary?.socrates?.onset} · Character: {active.summary?.socrates?.character} · Radiation: {active.summary?.socrates?.radiation} · Severity: <strong style={{ color: "var(--green-dark)" }}>{active.summary?.socrates?.severityScore}</strong>
        </div>
        <div style={{ marginBottom: 8 }}>
          <strong>{t("medicalHistoryLabel")}</strong> {(active.summary?.pastConditions || []).join(", ") || "None"} | <strong>{t("currentMedsLabel")}</strong> {(active.summary?.currentMeds || []).join(", ") || "None"} | <strong>{t("allergiesLabelText")}</strong> {active.summary?.allergies || "None"}
        </div>
        {active.summary?.ayushAssessment && (
          <div style={{ marginBottom: 8, color: "#854d0e" }}>
            <strong>{t("ayushAssessmentLabel")}</strong> Prakriti: {active.summary.ayushAssessment.prakriti} · Vikriti: {active.summary.ayushAssessment.vikriti} · Agni: {active.summary.ayushAssessment.aharaShakti}
          </div>
        )}
        {active.summary?.abnormalLabs?.length > 0 && (
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #e2ece7" }}>
            <strong style={{ color: "#b91c1c" }}>{t("abnormalLabsLabel")}</strong>
            <ul style={{ margin: "4px 0 0", paddingLeft: 20 }}>
              {active.summary.abnormalLabs.map((l, i) => (
                <li key={i}>
                  {l.test}: <strong>{l.value} {l.unit}</strong> (Normal: {l.referenceRange}) — <span className={`medikiosk-abnormal-badge ${l.status}`}>{l.interpretation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <strong style={{ fontSize: 13 }}>{t("physicianImpression")}</strong>
            <VoiceInputButton
              continuous={true}
              variant="pill"
              label={t("dictateNotes") || "Tap to Speak"}
              onFinalTranscript={(finalText) => {
                setPhysicianNotes((prev) => (prev ? `${prev} ${finalText}`.trim() : finalText));
              }}
            />
          </div>
          {reviewAction !== "draft" && (
            <span style={{ fontSize: 11, color: "var(--green)", fontWeight: 700 }}>
              {t("markedAsStatus", { status: reviewAction.toUpperCase() })}
            </span>
          )}
        </div>
        <textarea
          rows={2}
          value={physicianNotes}
          onChange={(e) => setPhysicianNotes(e.target.value)}
          placeholder={t("enterDoctorFindings")}
          style={{ width: "100%", borderRadius: 8, border: "1px solid var(--line)", padding: 10, fontSize: 13, boxSizing: "border-box" }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
          <button className="outline-btn" onClick={() => saveReview("amended")}>
            {t("amendSummary")}
          </button>
          <button className="primary-btn" onClick={() => saveReview("accepted")}>
            <Check size={16} /> {t("acceptConfirmConsult")}
          </button>
        </div>
      </div>

      {showFhir && (
        <div style={{ marginTop: 14, background: "#f5f8f6", padding: 12, borderRadius: 8, fontSize: 11, maxHeight: 180, overflow: "auto" }}>
          <strong>{t("fhirBundlePreview")}</strong>
          <pre>{JSON.stringify(active.fhirBundle, null, 2)}</pre>
        </div>
      )}
    </section>
  );
}

export function LedgerIntegrityCard() {
  const { t } = useLanguage();
  const [status, setStatus] = useState("idle"); // "idle" | "verifying" | "done"
  const [report, setReport] = useState(null);

  async function handleVerify() {
    setStatus("verifying");
    setReport(null);
    try {
      const res = await apiFetch("/api/ledger/verify");
      const data = await res.json();
      setReport(data);
      setStatus("done");
    } catch (err) {
      setReport({ valid: false, reason: err.message || "Failed to connect to cryptographic verification service." });
      setStatus("done");
    }
  }

  return (
    <section className="ledger-audit-card">
      <div className="ledger-audit-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="eyebrow" style={{ color: "var(--green)" }}>{t("cryptographicLedgerEyebrow")}</span>
          </div>
          <h3 style={{ margin: "4px 0 0", fontSize: 17 }}>{t("cryptographicAuditTitle")}</h3>
          <span className="muted" style={{ fontSize: 11 }}>
            {t("cryptographicAuditDesc")}
          </span>
        </div>
        <button
          className="outline-btn"
          disabled={status === "verifying"}
          onClick={handleVerify}
          style={{ whiteSpace: "nowrap" }}
        >
          <RefreshCw size={14} className={status === "verifying" ? "spin" : ""} />
          {status === "verifying" ? t("auditingChain") : t("runIntegrityAudit")}
        </button>
      </div>

      {report && (
        report.valid ? (
          <div className="ledger-status-banner valid">
            <ShieldCheck size={22} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong style={{ fontSize: 13, display: "block", marginBottom: 2 }}>
                {t("recordsVerifiedIntact", { count: report.count })}
              </strong>
              <span style={{ fontSize: 11, lineHeight: 1.5, opacity: 0.95 }}>
                {t("hashDigestValid")}
              </span>
            </div>
          </div>
        ) : (
          <div className="ledger-status-banner tampered">
            <ShieldAlert size={22} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong style={{ fontSize: 13, display: "block", marginBottom: 2 }}>
                {t("tamperDetected", { seq: report.brokenAtSeq || "Unknown" })}
              </strong>
              <span style={{ fontSize: 11, lineHeight: 1.5 }}>
                {report.reason || "Hash chain continuity violated. Database record has been altered out-of-band."}
              </span>
            </div>
          </div>
        )
      )}
    </section>
  );
}

export function DoctorAyushPanel({ intake, onNotify }) {
  const { t } = useLanguage();
  if (!intake) return null;
  const p = intake.profile;
  return (
    <section className="card ayush" style={{ marginBottom: 25, border: "2px solid #d97706", background: "#fffdfa" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="eyebrow" style={{ color: "#b45309" }}>{t("ayushDoctorEyebrow")}</span>
            <span style={{ background: "#fef3c7", color: "#92400e", fontSize: 10, padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>{t("ayushOpd")}</span>
          </div>
          <h2 style={{ margin: "4px 0 0", fontSize: 19, color: "#78350f" }}>
            Patient: {intake.patientName} — Assigned: {intake.doctorAssigned}
          </h2>
          <span className="muted" style={{ fontSize: 12 }}>{t("specialtySubmitted", { specialty: intake.doctorSpecialty })}</span>
        </div>
        <div style={{ textAlign: "right" }}>
          <span className="score-badge" style={{ background: "#fef3c7", color: "#92400e", fontWeight: 700 }}>
            Prakriti: {p?.prakriti?.type || "Tridoshic"}
          </span>
        </div>
      </div>

      <div style={{ background: "#fdf8ee", border: "1px solid #ebd9b5", borderRadius: 12, padding: 16, fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, textAlign: "center", marginBottom: 14 }}>
          <div style={{ background: "#fff", padding: 8, borderRadius: 8, border: "1px solid #e0f2fe" }}>
            <strong style={{ color: "#0284c7" }}>Vata: {p?.prakriti?.percentages?.vata}%</strong>
          </div>
          <div style={{ background: "#fff", padding: 8, borderRadius: 8, border: "1px solid #fee2e2" }}>
            <strong style={{ color: "#dc2626" }}>Pitta: {p?.prakriti?.percentages?.pitta}%</strong>
          </div>
          <div style={{ background: "#fff", padding: 8, borderRadius: 8, border: "1px solid #fef3c7" }}>
            <strong style={{ color: "#d97706" }}>Kapha: {p?.prakriti?.percentages?.kapha}%</strong>
          </div>
        </div>

        <div style={{ marginBottom: 6 }}>
          <strong>{t("activeVikritiLabel")}</strong> {p?.vikriti?.dominant} ({p?.vikriti?.symptomsCount} symptoms reported) {p?.vikriti?.hasAma ? "⚠️ Active Ama (Metabolic Toxins) flagged" : "✓ Nirama (No Ama)"}
        </div>
        <div style={{ marginBottom: 6 }}>
          <strong>{t("agniNadiParikshaLabel")}</strong> {p?.agni?.title} | {p?.nadi?.title}
        </div>
        {p?.recommendations?.pathyaAhara?.length > 0 && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #ede0c8" }}>
            <strong style={{ color: "#15803d" }}>{t("pathyaDietLabel")}</strong> {p.recommendations.pathyaAhara.slice(0, 2).join("; ")}
          </div>
        )}
        {p?.recommendations?.herbsSuggested?.length > 0 && (
          <div style={{ marginTop: 6 }}>
            <strong style={{ color: "#854d0e" }}>{t("suggestedFormulationsLabel")}</strong> {p.recommendations.herbsSuggested.slice(0, 3).join("; ")}
          </div>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="primary-btn" style={{ background: "#b45309", borderColor: "#92400e" }} onClick={() => onNotify?.("Ayurvedic clinical assessment reviewed & confirmed.")}>
          <Check size={16} /> {t("confirmAyushIntake")}
        </button>
      </div>
    </section>
  );
}

export function DoctorMultiReportSummaryPanel({ shares, onSummarize, onOpen, onDownload, onNotify }) {
  const { t } = useLanguage();
  const [selectedShareId, setSelectedShareId] = useState(() => shares[0]?.id || "");
  const [summaries, setSummaries] = useState({});
  const [loadingMap, setLoadingMap] = useState({});
  const [doctorNotes, setDoctorNotes] = useState("");
  const [savedNotes, setSavedNotes] = useState({});

  const activeShare = shares.find(s => s.id === selectedShareId) || shares[0];

  const fetchSummary = useCallback(async (share) => {
    if (!share || !share.records || !share.records.length) return;
    setLoadingMap(prev => ({ ...prev, [share.id]: true }));
    try {
      const res = await apiFetch("/api/ai/multi-report-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reports: share.records,
          patientName: share.patientName || "Patient",
          patientContext: `Treating Physician Review: ${share.records.length} report(s) shared`
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSummaries(prev => ({ ...prev, [share.id]: data }));
      }
    } catch (err) {
      console.warn("Could not fetch multi-report summary:", err);
    } finally {
      setLoadingMap(prev => ({ ...prev, [share.id]: false }));
    }
  }, []);

  useEffect(() => {
    if (activeShare && !summaries[activeShare.id] && !loadingMap[activeShare.id]) {
      fetchSummary(activeShare);
    }
  }, [activeShare, fetchSummary, summaries, loadingMap]);

  if (!shares || !shares.length) return null;

  const currentSummary = summaries[activeShare?.id];
  const isLoading = loadingMap[activeShare?.id];
  const urgency = currentSummary?.urgency || "ROUTINE";
  const isEmergency = urgency === "EMERGENCY";
  const isUrgent = urgency === "URGENT";

  return (
    <section
      className="card ai"
      style={{
        marginBottom: 24,
        border: isEmergency ? "2px solid #b91c1c" : isUrgent ? "2px solid #d97706" : "1.5px solid #a7f3d0",
        background: "#ffffff",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span className="eyebrow" style={{ color: "var(--green)" }}>
              {t("multiReportBriefingEyebrow") || "AI Consolidated Clinical Briefing"}
            </span>
            <span
              style={{
                background: isEmergency ? "#fee2e2" : isUrgent ? "#fef3c7" : "#ecfdf5",
                color: isEmergency ? "#991b1b" : isUrgent ? "#92400e" : "#065f46",
                fontSize: 11,
                padding: "2px 8px",
                borderRadius: 6,
                fontWeight: 800,
                letterSpacing: 0.5
              }}
            >
              {urgency}
            </span>
            {shares.length > 1 && (
              <select
                value={activeShare?.id}
                onChange={e => setSelectedShareId(e.target.value)}
                style={{ fontSize: 12, padding: "2px 6px", borderRadius: 6, border: "1px solid var(--line)" }}
              >
                {shares.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.patientName || "Patient"} ({s.records?.length || 0} reports)
                  </option>
                ))}
              </select>
            )}
          </div>
          <h2 style={{ margin: "4px 0 0", fontSize: 19, color: "var(--ink-title)" }}>
            {t("clinicalBriefingTitle") || "Synthesized Multi-Report Analysis"} — {activeShare?.patientName || "Patient"}
          </h2>
          <span className="muted" style={{ fontSize: 12 }}>
            {activeShare?.records?.length || 0} diagnostic report(s) shared and synthesized for treating physician review
          </span>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            className="outline-btn"
            style={{ fontSize: 12, padding: "5px 10px" }}
            onClick={() => fetchSummary(activeShare)}
            disabled={isLoading}
          >
            <RefreshCw size={13} className={isLoading ? "spin" : ""} />
            <span>{isLoading ? "Analyzing..." : "Re-Analyze Reports"}</span>
          </button>
        </div>
      </div>

      {isLoading && !currentSummary ? (
        <div style={{ padding: "30px 16px", textAlign: "center" }}>
          <RefreshCw size={24} className="spin" style={{ color: "var(--health-emerald)", margin: "0 auto 10px" }} />
          <strong style={{ display: "block", fontSize: 14, color: "var(--health-emerald-dark)" }}>
            Gemini Multimodal Vision & Clinical Synthesis Active...
          </strong>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>
            Extracting handwriting, correlating abnormal lab biomarkers, and compiling physician briefing.
          </span>
        </div>
      ) : currentSummary ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Executive Clinical Summary */}
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid var(--line)",
              borderRadius: 12,
              padding: 16,
              fontSize: 13.5,
              lineHeight: 1.6,
              color: "#1e293b"
            }}
          >
            <strong style={{ display: "block", color: "var(--navy)", fontSize: 13, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Executive Clinical Synthesis
            </strong>
            <p style={{ margin: 0 }}>{currentSummary.overallSummary}</p>
          </div>

          {/* Red Flags / Clinical Alarms if present */}
          {currentSummary.redFlags?.length > 0 && (
            <div
              style={{
                background: "#fef2f2",
                border: "1.5px solid #fca5a5",
                borderRadius: 12,
                padding: "12px 16px",
                display: "flex",
                alignItems: "flex-start",
                gap: 12
              }}
            >
              <ShieldAlert size={20} color="#b91c1c" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ color: "#991b1b", fontSize: 13, display: "block", marginBottom: 2 }}>
                  Clinical Priority Red Flags
                </strong>
                <ul style={{ margin: "2px 0 0", paddingLeft: 18, color: "#7f1d1d", fontSize: 12.5 }}>
                  {currentSummary.redFlags.map((rf, idx) => (
                    <li key={idx} style={{ marginBottom: 2 }}>{rf}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Abnormal Lab Values & Biomarkers */}
          {currentSummary.abnormalParameters?.length > 0 && (
            <div>
              <strong style={{ display: "block", fontSize: 13, color: "var(--navy)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Key Abnormal Biomarkers ({currentSummary.abnormalParameters.length})
              </strong>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
                {currentSummary.abnormalParameters.map((p, idx) => {
                  const isCrit = p.status === "critical";
                  return (
                    <div
                      key={idx}
                      style={{
                        background: isCrit ? "#fef2f2" : "#fff",
                        border: isCrit ? "1.5px solid #f87171" : "1px solid var(--line)",
                        borderRadius: 10,
                        padding: 10,
                        fontSize: 12
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <strong style={{ color: isCrit ? "#991b1b" : "var(--ink)", fontSize: 12.5 }}>{p.test}</strong>
                        <span
                          style={{
                            fontSize: 10,
                            padding: "1px 6px",
                            borderRadius: 4,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            background: isCrit ? "#fee2e2" : "#fef3c7",
                            color: isCrit ? "#991b1b" : "#92400e"
                          }}
                        >
                          {p.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: isCrit ? "#b91c1c" : "#0d9488", marginBottom: 2 }}>
                        {p.value} <span style={{ fontSize: 11, fontWeight: 500, color: "#64748b" }}>(ref: {p.referenceRange})</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: "#475569", lineHeight: 1.4 }}>{p.interpretation}</div>
                      {p.sourceDocument && (
                        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>
                          Source: {p.sourceDocument}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Extracted Prescriptions / Active Medications */}
          {currentSummary.medicationsIdentified?.length > 0 && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <Pill size={16} color="#16a34a" />
                <strong style={{ fontSize: 13, color: "#166534", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Active Medications Reconciled from Documents ({currentSummary.medicationsIdentified.length})
                </strong>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {currentSummary.medicationsIdentified.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "#ffffff",
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid #dcfce7",
                      fontSize: 12.5
                    }}
                  >
                    <div>
                      <strong style={{ color: "#166534" }}>{m.name}</strong> — <span>{m.dosage}</span>
                      {m.duration && <span style={{ color: "#64748b", marginLeft: 6 }}>({m.duration})</span>}
                    </div>
                    {m.sourceDocument && (
                      <span style={{ fontSize: 10.5, color: "#94a3b8" }}>{m.sourceDocument}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clinical Correlation & Disease Synthesis */}
          {currentSummary.clinicalCorrelation && (
            <div style={{ background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: 12, padding: 14 }}>
              <strong style={{ display: "block", color: "#5b21b6", fontSize: 13, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Physiological Correlation & Diagnostic Synthesis
              </strong>
              <p style={{ margin: 0, fontSize: 13, color: "#3b0764", lineHeight: 1.5 }}>
                {currentSummary.clinicalCorrelation}
              </p>
            </div>
          )}

          {/* Recommendations for Doctor */}
          {currentSummary.recommendationsForDoctor?.length > 0 && (
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: 14 }}>
              <strong style={{ display: "block", color: "#92400e", fontSize: 13, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Suggested Clinical Actions for Treating Physician
              </strong>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: "#78350f" }}>
                {currentSummary.recommendationsForDoctor.map((rec, idx) => (
                  <li key={idx} style={{ marginBottom: 3 }}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Per-Document Individual Inspection */}
          <div>
            <strong style={{ display: "block", fontSize: 12.5, color: "var(--navy)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Shared Reports in This Bundle ({activeShare.records?.length || 0})
            </strong>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 10 }}>
              {(activeShare.records || []).map(r => (
                <div
                  key={r.id}
                  style={{
                    background: "#ffffff",
                    border: "1px solid var(--line)",
                    borderRadius: 10,
                    padding: 10,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <FileText size={18} color="var(--health-emerald)" style={{ flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <strong style={{ fontSize: 12.5, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={r.name}>
                        {r.name}
                      </strong>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>{r.type} · {r.size}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button
                      className="outline-btn"
                      style={{ fontSize: 11, padding: "4px 8px" }}
                      onClick={() => onSummarize?.(r)}
                      title="View AI Transcription and Detailed Breakdown"
                    >
                      <Sparkles size={12} color="#059669" />
                      <span>Summary</span>
                    </button>
                    <button
                      className="icon-btn"
                      style={{ padding: 4 }}
                      onClick={() => onOpen?.(r)}
                      title="Open Document"
                    >
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Doctor Impression Notes Box */}
          <div style={{ borderTop: "1px solid var(--line)", paddingTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <strong style={{ fontSize: 13 }}>Consultation Findings & Impression on Shared Records:</strong>
                <VoiceInputButton
                  continuous={true}
                  variant="pill"
                  label="Dictate Notes"
                  onFinalTranscript={(finalText) => {
                    setDoctorNotes(prev => (prev ? `${prev} ${finalText}`.trim() : finalText));
                  }}
                />
              </div>
              {savedNotes[activeShare.id] && (
                <span style={{ fontSize: 11, color: "var(--green)", fontWeight: 700 }}>
                  ✓ Impression saved to consultation
                </span>
              )}
            </div>
            <textarea
              rows={2}
              value={doctorNotes}
              onChange={e => setDoctorNotes(e.target.value)}
              placeholder="Enter or dictate physician impression on these shared records (e.g., Confirmed diabetic nephropathy risk; advised Metformin 850mg)..."
              style={{ width: "100%", borderRadius: 8, border: "1px solid var(--line)", padding: 10, fontSize: 13, boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
              <button
                className="primary-btn"
                onClick={() => {
                  setSavedNotes(prev => ({ ...prev, [activeShare.id]: doctorNotes }));
                  onNotify?.(`Clinical impression recorded for ${activeShare.patientName || "Patient"}'s shared records.`);
                }}
              >
                <Check size={15} /> Save Consultation Note
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: "16px 0", color: "var(--muted)", fontSize: 13 }}>
          No clinical summary available yet. Click "Re-Analyze Reports" above.
        </div>
      )}
    </section>
  );
}

export function DoctorPage({ onOpen, onDownload, onSummarize, intake, ayushIntake, onUpdateState, onNotify }) {
  const { t } = useLanguage();
  const [doctorShares, setDoctorShares] = useState([]);
  const [loadingShares, setLoadingShares] = useState(true);
  const [pinModalShare, setPinModalShare] = useState(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinSubmitting, setPinSubmitting] = useState(false);

  const fetchDoctorShares = useCallback(async () => {
    try {
      const res = await apiFetch("/api/doctor/shares");
      const data = await res.json();
      setDoctorShares(data.shares || []);
    } catch (err) {
      console.error("Failed to load doctor shares", err);
    } finally {
      setLoadingShares(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctorShares();
  }, [fetchDoctorShares]);

  async function handleUnlockShare(e) {
    if (e) e.preventDefault();
    if (!pinInput || pinInput.trim().length !== 6) {
      setPinError(t("enterSixDigitOtp"));
      return;
    }
    setPinSubmitting(true);
    setPinError("");
    try {
      const res = await apiFetch(`/api/shares/${encodeURIComponent(pinModalShare.id)}/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinInput.trim() })
      });
      const data = await res.json();
      onNotify?.(data.message || t("recordsUnlockedSuccess"));
      setPinModalShare(null);
      setPinInput("");
      await fetchDoctorShares();
    } catch (err) {
      setPinError(err.message || t("invalidPinExpired"));
    } finally {
      setPinSubmitting(false);
    }
  }

  const pendingShares = doctorShares.filter(s => !s.unlocked);
  const unlockedShares = doctorShares.filter(s => s.unlocked);
  const recordMap = new Map();
  unlockedShares.forEach(s => {
    (s.records || []).forEach(r => {
      if (!recordMap.has(r.id)) recordMap.set(r.id, r);
    });
  });
  const accessible = Array.from(recordMap.values());

  return (
    <div>
      <PageIntro
        eyebrow={t("doctorPortalEyebrow")}
        title={t("doctorPortalTitle")}
        subtitle={t("doctorPortalSubtitle")}
        tag={<><i/>Clinical EMR Console Live</>}
        action={
          <span className="abha-id-chip">
            <ShieldCheck size={14} color="#059669" />
            <span>Doctor Registration #NMC-2018-9481</span>
          </span>
        }
      />

      <DoctorMediKioskPanel intake={intake} onUpdateState={onUpdateState} onNotify={onNotify} />
      {ayushIntake && <DoctorAyushPanel intake={ayushIntake} onNotify={onNotify} />}
      
      <div className="privacy-banner doctor"><ShieldCheck size={21} /><div><strong>{t("accessControlledAudit")}</strong><span>{t("accessControlledDesc")}</span></div></div>

      {/* Pending Patient Authorizations needing PIN */}
      <section className="section-head no-top">
        <div>
          <span className="eyebrow">{t("patientAuthorizations")}</span>
          <h2>{t("pendingPinVerif", { count: pendingShares.length })}</h2>
        </div>
      </section>

      {loadingShares ? (
        <div className="muted" style={{ padding: "16px 0" }}>{t("checkingAuths")}</div>
      ) : pendingShares.length > 0 ? (
        <div className="share-list" style={{ marginBottom: 24 }}>
          {pendingShares.map(s => (
            <div className="share-row" key={s.id} style={{ background: "#fff", padding: "14px 18px", borderRadius: 12, border: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#fef3c7", color: "#b45309", display: "grid", placeItems: "center" }}>
                  <LockKeyhole size={18} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <strong>{s.patientName || "Patient Authorization"}</strong>
                    <span style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6 }}>
                      Verbal OTP: {s.pin || getSharePin(s)}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#687a74", marginTop: 2 }}>
                    {t("documentsPendingAccess", { count: s.recordCount, time: new Date(s.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) })}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div className="expiry" style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 11, color: "#687a74" }}>{t("expires")}</span>
                  <strong style={{ display: "block", fontSize: 12 }}>{new Date(s.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong>
                </div>
                <button
                  className="primary-btn compact"
                  onClick={() => { setPinModalShare(s); setPinInput(""); setPinError(""); }}
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <KeyRound size={15} /> {t("enterPinToAccess")}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted" style={{ marginBottom: 24, fontSize: 13 }}>{t("noPendingAuths")}</p>
      )}

      {/* AI Consolidated Multi-Report Clinical Briefing for Doctor */}
      {unlockedShares.length > 0 && (
        <DoctorMultiReportSummaryPanel
          shares={unlockedShares}
          onOpen={onOpen}
          onDownload={onDownload}
          onSummarize={onSummarize}
          onNotify={onNotify}
        />
      )}

      {/* Authorized Documents (Unlocked) */}
      <section className="section-head">
        <div>
          <span className="eyebrow">{t("authorizedRecords")}</span>
          <h2>{t("availableDocuments", { count: accessible.length })}</h2>
        </div>
      </section>
      <div className="record-grid full">
        {accessible.map(r => (
          <RecordCard
            key={r.id}
            record={r}
            onOpen={onOpen}
            onDownload={onDownload}
            onSummarize={onSummarize}
          />
        ))}
        {!accessible.length && <Empty title={t("noUnlockedRecordsTitle")} text={t("noUnlockedRecordsText")} />}
      </div>

      {/* Cryptographic Ledger Audit Card */}
      <LedgerIntegrityCard />

      {/* PIN Entry Modal */}
      {pinModalShare && (
        <Modal title={t("unlockPatientRecords")} onClose={() => { setPinModalShare(null); setPinInput(""); setPinError(""); }}>
          <form onSubmit={handleUnlockShare}>
            <p style={{ fontSize: 13, color: "#486259", marginBottom: 14 }}>
              {t("unlockRecordsPrompt", { patient: pinModalShare.patientName || "Patient", count: pinModalShare.recordCount })}
            </p>
            <div style={{ marginBottom: 16, background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: 10.5, textTransform: "uppercase", color: "#166534", fontWeight: 700, display: "block", letterSpacing: 0.5 }}>Patient Verbal OTP</span>
                <strong style={{ fontSize: 20, letterSpacing: 4, color: "#166534", fontFamily: "monospace" }}>{pinModalShare.pin || getSharePin(pinModalShare)}</strong>
              </div>
              <button
                type="button"
                className="outline-btn"
                onClick={() => setPinInput(pinModalShare.pin || getSharePin(pinModalShare))}
                style={{ fontSize: 12, padding: "5px 12px", background: "#fff", color: "#166534", fontWeight: 700, borderColor: "#86efac" }}
              >
                Auto-fill OTP
              </button>
            </div>
            <label className="field">
              <span>{t("sixDigitPin")}</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder={t("enterPinPlaceholder")}
                value={pinInput}
                autoFocus
                onChange={e => setPinInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                style={{ fontSize: 20, letterSpacing: 6, fontWeight: 700, textAlign: "center" }}
              />
            </label>
            {pinError && (
              <div style={{ color: "#dc2626", fontSize: 12, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <ShieldAlert size={14} /> {pinError}
              </div>
            )}
            <div className="security-line" style={{ marginBottom: 16 }}>
              <ShieldCheck size={15} /> {t("allVerifAudited")}
            </div>
            <div className="modal-actions">
              <button type="button" className="secondary-btn" onClick={() => setPinModalShare(null)} disabled={pinSubmitting}>
                {t("cancel")}
              </button>
              <button type="submit" className="primary-btn" disabled={pinInput.length !== 6 || pinSubmitting}>
                {pinSubmitting ? t("verifying") : t("unlockRecords")}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
