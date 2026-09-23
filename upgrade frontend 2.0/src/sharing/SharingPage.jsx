import React, { useState } from "react";
import { ShieldCheck, LockKeyhole, Plus, Upload, Sparkles, FileText } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { PageIntro } from "../components/NavAndStats.jsx";
import { Empty } from "../components/Modal.jsx";

export function SharingPage({ state, doctors, onOpen, onRevoke, onUploadAndShare }) {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const active = state.shares.filter(s => !s.revokedAt && new Date(s.expiresAt) > Date.now());

  return (
    <div>
      <PageIntro
        eyebrow={t("sharing").toUpperCase()}
        title={t("whoCanSeeRecords")}
        subtitle={t("sharingSubtitle")}
        tag={<><i />ABDM Consent Engine</>}
        action={
          <span className="abha-id-chip">
            <ShieldCheck size={14} color="#059669" />
            <span>Fiduciary Consent Active</span>
          </span>
        }
      />

      {/* Large Centered Hero CTA Card with Multi-Report Capabilities */}
      <div
        className="share-cta-hero"
        style={{
          background: "linear-gradient(135deg, #f0fdf4 0%, #e6f7ef 100%)",
          border: "2px solid #a7f3d0",
          borderRadius: 18,
          padding: "32px 24px",
          textAlign: "center",
          margin: "16px 0 24px",
          boxShadow: "0 4px 16px rgba(16, 185, 129, 0.08)"
        }}
      >
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: "50%",
            background: "var(--green)",
            color: "#fff",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 12px"
          }}
        >
          <LockKeyhole size={28} />
        </div>
        <h2 style={{ margin: "0 0 8px", fontSize: 22, color: "var(--green-dark)" }}>{t("authorizeHeroTitle")}</h2>
        <p style={{ maxWidth: 640, margin: "0 auto 18px", color: "#374151", fontSize: 14, lineHeight: 1.5 }}>
          {t("authorizeHeroDesc") || "Select one, two, or many health records to share with your doctor. CarePath AI automatically compiles an executive clinical summary of all shared documents for the physician."}
        </p>

        {/* Quick Batch Upload & Share Dropzone */}
        {onUploadAndShare && (
          <label
            className={`upload-zone ${isDragging ? "dragging" : ""}`}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length) {
                onUploadAndShare(e.dataTransfer.files);
              }
            }}
            style={{
              maxWidth: 520,
              minHeight: 84,
              margin: "0 auto 18px",
              padding: "14px 20px",
              border: isDragging ? "2px dashed var(--health-emerald)" : "1.5px dashed #86efac",
              background: isDragging ? "#ecfdf5" : "#ffffff",
              borderRadius: 14,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(16, 185, 129, 0.06)"
            }}
          >
            <input
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={e => {
                if (e.target.files && e.target.files.length) {
                  onUploadAndShare(e.target.files);
                }
                e.target.value = "";
              }}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <Upload size={20} color="var(--health-emerald)" />
              <div style={{ textAlign: "left" }}>
                <strong style={{ fontSize: 13, color: "#166534", display: "block" }}>
                  Upload & Share Reports (One or Many)
                </strong>
                <span style={{ fontSize: 11, color: "#64748b" }}>
                  Drop PDFs or images here to upload and instantly grant physician access.
                </span>
              </div>
            </div>
          </label>
        )}

        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <button
            className="primary-btn"
            onClick={onOpen}
            style={{
              padding: "12px 28px",
              fontSize: 15,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 6px 20px rgba(29, 128, 101, 0.28)",
              borderRadius: 12
            }}
          >
            <Plus size={18} />
            <span>{t("authorizeShareBtn")}</span>
          </button>
        </div>

        {/* AI Multi-Report Summary Highlight */}
        <div
          style={{
            maxWidth: 600,
            margin: "18px auto 0",
            padding: "8px 14px",
            background: "rgba(255, 255, 255, 0.7)",
            borderRadius: 10,
            border: "1px solid #bbf7d0",
            display: "flex",
            alignItems: "center",
            gap: 8,
            textAlign: "left",
            fontSize: 12,
            color: "#166534"
          }}
        >
          <Sparkles size={16} color="#059669" style={{ flexShrink: 0 }} />
          <span>
            <strong>AI Clinical Synthesis:</strong> Your doctor will receive a synthesized briefing of abnormal test values, medications, and clinical red flags across all shared documents.
          </span>
        </div>
      </div>

      <div className="privacy-banner">
        <ShieldCheck size={21} />
        <div>
          <strong>{t("timeLimitedPinBadge")}</strong>
          <span>{t("pinProtectedBanner")}</span>
        </div>
      </div>

      <section className="section-head no-top" style={{ marginTop: 24 }}>
        <div>
          <span className="eyebrow">{t("activeAccess")}</span>
          <h2>
            {active.length
              ? t("activeAuthorizationsCount", { count: active.length })
              : t("noActiveAuthorizations")}
          </h2>
        </div>
      </section>

      {/* Active Authorizations with Prominent Verbal OTP */}
      <div className="share-list">
        {active.map(s => {
          const d = doctors.find(x => x.id === s.doctorId);
          return (
            <div className="card vault" key={s.id} style={{ padding: 20, marginBottom: 16, border: "1.5px solid #bbf7d0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div className="doctor-avatar" style={{ width: 46, height: 46, fontSize: 15 }}>
                    {d?.initials || "DR"}
                  </div>
                  <div>
                    <strong style={{ fontSize: 16 }}>{d?.name || "Treating Physician"}</strong>
                    <span style={{ display: "block", fontSize: 13, color: "var(--green-dark)", fontWeight: 600 }}>
                      {d?.specialty}
                    </span>
                    <span style={{ display: "block", fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                      {s.recordIds.length} document{s.recordIds.length > 1 ? "s" : ""} authorized · Valid until{" "}
                      {new Date(s.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} (
                      {new Date(s.expiresAt).toLocaleDateString([], { dateStyle: "medium" })})
                    </span>
                  </div>
                </div>
                <button className="danger-btn" onClick={() => onRevoke(s.id)}>
                  {t("revokeAccess")}
                </button>
              </div>
            </div>
          );
        })}
        {!active.length && <Empty title={t("noOneHasAccess")} text={t("noOneHasAccessDesc")} />}
      </div>

      <section className="section-head" style={{ marginTop: 28 }}>
        <div>
          <span className="eyebrow">{t("auditTrail")}</span>
          <h2>{t("recentSharingEvents")}</h2>
        </div>
      </section>
      <div className="audit-list">
        {(state.shareAudit || []).slice(0, 8).map(e => (
          <div className="audit-row" key={e.id}>
            <ShieldCheck size={15} />
            <span>{e.event}</span>
            <small>{new Date(e.at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</small>
          </div>
        ))}
        {!(state.shareAudit || []).length && <p className="muted">{t("noSharingEvents")}</p>}
      </div>
    </div>
  );
}

export default SharingPage;
