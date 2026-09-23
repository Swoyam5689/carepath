import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  HeartPulse,
  Activity,
  Sparkles,
  ChevronRight,
  Stethoscope,
  Share2,
  UserCheck,
  FileText
} from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { getGreetingPeriod, GREETING_TEXTS } from "../components/NavAndStats.jsx";

export function PatientDashboard({ state, onNavigate }) {
  const { t, language } = useLanguage();
  const userName = state?.user?.name || "Swyom Sharma";
  const firstName = userName.split(" ")[0];

  const [greetingPeriod, setGreetingPeriod] = useState(() => getGreetingPeriod());

  // Keep greeting synchronized automatically without requiring a page refresh
  useEffect(() => {
    const updateGreeting = () => {
      const nextPeriod = getGreetingPeriod();
      setGreetingPeriod((prev) => (prev !== nextPeriod ? nextPeriod : prev));
    };
    const timer = setInterval(updateGreeting, 15000);
    return () => clearInterval(timer);
  }, []);

  const greeting = (language && GREETING_TEXTS[greetingPeriod]?.[language]) || GREETING_TEXTS[greetingPeriod]?.en || "Good Morning";

  return (
    <div className="patient-dashboard-container">
      {/* 1. Startup Hero Header */}
      <header className="dashboard-hero-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span className="eyebrow" style={{ marginBottom: 0 }}>👋 {greeting}</span>
            <span className="live" style={{ fontSize: 9.5, padding: "2px 8px" }}><i/>Clinical Telemetry Live</span>
          </div>
          <h1 className="greeting-title">{greeting}, {firstName}</h1>
          <p className="greeting-subtitle">{t("dashboardSubtitle") || "Your connected clinical health dashboard, AI medical intake, and encrypted health records."}</p>
        </div>
        <div className="dashboard-quick-actions">
          <span className="abha-id-chip">
            <ShieldCheck size={14} color="#059669" />
            <span>ABHA ID #91-2304-9821-4412</span>
          </span>
        </div>
      </header>

      {/* 2. Clinical Vitals Telemetry Ribbon */}
      <div className="telemetry-ribbon">
        <div className="telemetry-card heart">
          <div className="telemetry-icon-box"><HeartPulse size={20} /></div>
          <div className="telemetry-content">
            <span className="telemetry-label">Heart Rate</span>
            <div className="telemetry-value">72 <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted)" }}>bpm</span></div>
            <span className="telemetry-status-pill good">● Normal Range</span>
          </div>
        </div>
        <div className="telemetry-card bp">
          <div className="telemetry-icon-box"><Activity size={20} /></div>
          <div className="telemetry-content">
            <span className="telemetry-label">Blood Pressure</span>
            <div className="telemetry-value">118/76 <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted)" }}>mmHg</span></div>
            <span className="telemetry-status-pill good">● Ideal Resting</span>
          </div>
        </div>
        <div className="telemetry-card oxygen">
          <div className="telemetry-icon-box"><ShieldCheck size={20} /></div>
          <div className="telemetry-content">
            <span className="telemetry-label">Blood Oxygen</span>
            <div className="telemetry-value">98% <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted)" }}>SpO2</span></div>
            <span className="telemetry-status-pill good">● Optimal</span>
          </div>
        </div>
        <div className="telemetry-card glucose">
          <div className="telemetry-icon-box"><ShieldCheck size={20} /></div>
          <div className="telemetry-content">
            <span className="telemetry-label">Identity Status</span>
            <div className="telemetry-value" style={{ fontSize: 15 }}>Verified</div>
            <span className="telemetry-status-pill good">● ABHA Linked</span>
          </div>
        </div>
        <div className="telemetry-card dosha">
          <div className="telemetry-icon-box"><Sparkles size={20} /></div>
          <div className="telemetry-content">
            <span className="telemetry-label">AYUSH Prakriti</span>
            <div className="telemetry-value" style={{ fontSize: 15 }}>Pitta-Vata</div>
            <span className="telemetry-status-pill accent">● Balanced Season</span>
          </div>
        </div>
      </div>

      {/* 3. Primary Features Hub */}
      <div className="section-head" style={{ marginTop: 36, marginBottom: 16 }}>
        <div>
          <span className="eyebrow" style={{ color: "var(--ai-violet)" }}>CLINICAL SERVICES</span>
          <h2 style={{ fontSize: 20 }}>Connected Care Features</h2>
        </div>
        <span style={{ fontSize: 12, color: "var(--muted-2)", fontWeight: 600 }}>AI · AYUSH · Records · Sharing · Identity</span>
      </div>

      <div className="startup-grid">
        <div className="innovation-card ai" onClick={() => onNavigate("medikiosk")}>
          <div className="innovation-card-header">
            <div className="innovation-card-icon"><Stethoscope size={22} /></div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div className="voice-equalizer"><span/><span/><span/><span/></div>
              <span className="card-badge">AI Voice</span>
            </div>
          </div>
          <div>
            <h4>MediKiosk Smart Intake</h4>
            <p>Voice & touch intake in 5 Indian languages with real-time translation and automated ABDM FHIR triage export.</p>
          </div>
          <div className="innovation-card-footer">
            <span style={{ fontSize: 11, color: "var(--muted-2)" }}>Offline-Ready · ABDM</span>
            <span className="footer-action">Launch Intake <ChevronRight size={14} /></span>
          </div>
        </div>

        <div className="innovation-card ayush" onClick={() => onNavigate("ayush")}>
          <div className="innovation-card-header">
            <div className="innovation-card-icon"><Sparkles size={22} /></div>
            <span className="card-badge">Ayurveda</span>
          </div>
          <div>
            <h4>AYUSH Diagnostics</h4>
            <p>Dashavidha Pariksha, Prakriti Dosha assessment, Nadi Pariksha analysis, and holistic Ayurvedic history intake.</p>
          </div>
          <div className="innovation-card-footer">
            <span style={{ fontSize: 11, color: "var(--muted-2)" }}>Ayurveda · Siddha · Unani</span>
            <span className="footer-action">Dosha Balance <ChevronRight size={14} /></span>
          </div>
        </div>

        <div className="innovation-card vault" onClick={() => onNavigate("records")}>
          <div className="innovation-card-header">
            <div className="innovation-card-icon"><FileText size={22} /></div>
            <span className="card-badge">AES-256 Vault</span>
          </div>
          <div>
            <h4>Health Records</h4>
            <p>Upload, view, and download medical records with AI document digitization and summarization.</p>
          </div>
          <div className="innovation-card-footer">
            <span style={{ fontSize: 11, color: "var(--muted-2)" }}>{state?.records?.length || 0} Records Stored</span>
            <span className="footer-action">View Records <ChevronRight size={14} /></span>
          </div>
        </div>

        <div className="innovation-card share" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)", border: "1px solid #bbf7d0" }} onClick={() => onNavigate("sharing")}>
          <div className="innovation-card-header">
            <div className="innovation-card-icon" style={{ background: "#dcfce7", color: "#166534" }}><Share2 size={22} /></div>
            <span className="card-badge" style={{ background: "#dcfce7", color: "#166534" }}>PIN Gated</span>
          </div>
          <div>
            <h4>Record Sharing</h4>
            <p>Time-bound, consent-gated record sharing with temporary PIN authorization for doctor access.</p>
          </div>
          <div className="innovation-card-footer">
            <span style={{ fontSize: 11, color: "var(--muted-2)" }}>{state?.shares?.length || 0} Active Shares</span>
            <span className="footer-action">Manage Access <ChevronRight size={14} /></span>
          </div>
        </div>

        <div className="innovation-card profile" style={{ background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #bfdbfe" }} onClick={() => onNavigate("profile")}>
          <div className="innovation-card-header">
            <div className="innovation-card-icon" style={{ background: "#dbeafe", color: "#1e40af" }}><UserCheck size={22} /></div>
            <span className="card-badge" style={{ background: "#dbeafe", color: "#1e40af" }}>Identity</span>
          </div>
          <div>
            <h4>Profile & Identity</h4>
            <p>Manage patient demographics and ABHA / Aadhaar identity verification (KYC).</p>
          </div>
          <div className="innovation-card-footer">
            <span style={{ fontSize: 11, color: "var(--muted-2)" }}>ABHA / Aadhaar KYC</span>
            <span className="footer-action">View Profile <ChevronRight size={14} /></span>
          </div>
        </div>
      </div>
    </div>
  );
}
