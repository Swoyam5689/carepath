import React from "react";

export function NavItem({ icon, label, active, onClick, domain }) {
  return (
    <button className={`nav-item ${domain ? `domain-${domain}` : ""} ${active ? "active" : ""}`} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

export function pageLabel(p, t) {
  if (t) {
    const labels = {
      dashboard: t("overview") || t("dashboard"),
      records: t("records"),
      sharing: t("sharing"),
      profile: "Profile & Identity",
      doctor: t("doctorPortal") || "Dashboard",
      medikiosk: t("medikiosk"),
      ayush: t("ayush")
    };
    if (labels[p]) return labels[p];
  }
  return (
    {
      dashboard: "Overview",
      records: "Health Records",
      sharing: "Record Sharing",
      profile: "Profile & Identity",
      doctor: "Dashboard",
      medikiosk: "MediKiosk Intake",
      ayush: "AYUSH Diagnostics"
    }[p] || "Overview"
  );
}

export function PageIntro({ eyebrow, title, subtitle, action, tag }) {
  return (
    <div className="page-intro">
      <div className="page-intro-content">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span className="eyebrow" style={{ marginBottom: 0 }}>{eyebrow}</span>
          {tag && <span className="live" style={{ fontSize: 9.5, padding: "2px 8px" }}>{tag}</span>}
        </div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action && <div className="page-intro-actions">{action}</div>}
    </div>
  );
}

export function Stat({ label, value }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function getGreetingPeriod(date = new Date()) {
  const hours = date.getHours();
  if (hours >= 5 && hours < 12) {
    return "goodMorning";
  }
  if (hours >= 12 && hours < 17) {
    return "goodAfternoon";
  }
  if (hours >= 17 && hours < 21) {
    return "goodEvening";
  }
  return "goodNight";
}

export const GREETING_TEXTS = {
  goodMorning: {
    en: "Good Morning",
    hi: "शुभ प्रभात",
    bn: "সুপ্রভাত",
    te: "శుభోదయం",
    mr: "शुभ प्रभात",
    ta: "காலை வணக்கம்"
  },
  goodAfternoon: {
    en: "Good Afternoon",
    hi: "शुभ दोपहर",
    bn: "शुभ দুপুর",
    te: "శుభ మధ్యాహ్నం",
    mr: "शुभ दुपार",
    ta: "மதிய வணக்கம்"
  },
  goodEvening: {
    en: "Good Evening",
    hi: "शुभ संध्या",
    bn: "শুভ সন্ধ্যা",
    te: "శుభ సాయంత్రం",
    mr: "शुभ संध्याकाळ",
    ta: "மாலை வணக்கம்"
  },
  goodNight: {
    en: "Good Night",
    hi: "शुभ रात्रि",
    bn: "শুভ রাত্রি",
    te: "శుభరాత్రి",
    mr: "शुभ रात्री",
    ta: "இரவு வணக்கம்"
  }
};
