import React, { useState } from "react";
import { FileText, LockKeyhole, ShieldCheck, X, Upload, Sparkles, CheckSquare } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export function Modal({ title, onClose, children }) {
  const { t } = useLanguage();
  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" aria-label={t("closeDialog") || "Close dialog"} onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Empty({ title, text }) {
  const { t } = useLanguage();
  return (
    <div className="empty">
      <div className="empty-icon-box">
        <FileText size={24} />
      </div>
      <strong>{title || t("emptyDefaultTitle")}</strong>
      <span>{text || t("emptyDefaultText")}</span>
    </div>
  );
}

export function ShareModal({ records, doctors, onClose, onCreate, onUpload }) {
  const { t } = useLanguage();
  const [doctorId, setDoctorId] = useState(doctors[0]?.id || "");
  const [recordIds, setRecordIds] = useState(records.length ? records.map(r => r.id) : []);
  const [hours, setHours] = useState("24");
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [generateSummary, setGenerateSummary] = useState(true);

  const toggle = id => setRecordIds(x => (x.includes(id) ? x.filter(y => y !== id) : [...x, id]));
  const toggleAll = () => {
    if (recordIds.length === records.length) {
      setRecordIds([]);
    } else {
      setRecordIds(records.map(r => r.id));
    }
  };

  async function handleBatchFiles(files) {
    if (!files || !files.length || !onUpload) return;
    setUploading(true);
    try {
      const newRecs = await onUpload(files);
      if (newRecs && newRecs.length) {
        setRecordIds(prev => Array.from(new Set([...prev, ...newRecs.map(r => r.id)])));
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <Modal title={t("shareHealthRecords")} onClose={onClose}>
      <label className="field">
        <span>{t("selectDoctor")}</span>
        <select value={doctorId} onChange={e => setDoctorId(e.target.value)}>
          {doctors.map(d => (
            <option key={d.id} value={d.id}>
              {d.name} — {d.specialty}
            </option>
          ))}
        </select>
      </label>

      {/* Inline Multi-Report Upload Dropzone */}
      {onUpload && (
        <div style={{ marginBottom: 14 }}>
          <label
            className={`upload-zone ${isDragging ? "dragging" : ""}`}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => {
              e.preventDefault();
              setIsDragging(false);
              handleBatchFiles(e.dataTransfer.files);
            }}
            style={{
              minHeight: 90,
              padding: "12px 16px",
              border: isDragging ? "2px dashed var(--health-emerald)" : "1.5px dashed #86efac",
              background: isDragging ? "#ecfdf5" : "#f0fdf4",
              borderRadius: 12,
              cursor: uploading ? "wait" : "pointer"
            }}
          >
            <input
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg"
              disabled={uploading}
              onChange={e => {
                handleBatchFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#059669",
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0
                }}
              >
                <Upload size={16} />
              </div>
              <div style={{ textAlign: "left" }}>
                <strong style={{ fontSize: 13, color: "#166534", display: "block" }}>
                  {uploading ? "Uploading & encrypting reports..." : "Upload New Reports to Share (One or Many)"}
                </strong>
                <span style={{ fontSize: 11, color: "#15803d" }}>
                  Select one, two, or multiple PDF/JPG reports — they will be auto-selected below.
                </span>
              </div>
            </div>
          </label>
        </div>
      )}

      <div className="field">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span>{t("selectDocuments")}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11.5, color: "#059669", fontWeight: 700 }}>
              {recordIds.length} of {records.length} selected
            </span>
            {records.length > 1 && (
              <button
                type="button"
                className="outline-btn"
                onClick={toggleAll}
                style={{ fontSize: 11, padding: "2px 8px" }}
              >
                {recordIds.length === records.length ? "Deselect All" : "Select All"}
              </button>
            )}
          </div>
        </div>

        <div className="check-list" style={{ maxHeight: "180px", overflowY: "auto" }}>
          {records.map(r => (
            <label className="check-item" key={r.id}>
              <input type="checkbox" checked={recordIds.includes(r.id)} onChange={() => toggle(r.id)} />
              <FileText size={17} />
              <span style={{ flex: 1 }}>{r.name}</span>
              <small style={{ color: "var(--muted)", fontSize: 11 }}>{r.type}</small>
            </label>
          ))}
          {!records.length && (
            <p style={{ color: "var(--muted)", fontSize: 12, textAlign: "center", margin: "14px 0" }}>
              No records in vault yet. Upload files above to share.
            </p>
          )}
        </div>
      </div>

      <label className="field">
        <span>{t("accessDuration")}</span>
        <select value={hours} onChange={e => setHours(e.target.value)}>
          <option value="1">{t("duration1h")}</option>
          <option value="6">{t("duration6h")}</option>
          <option value="24">{t("duration24h")}</option>
          <option value="72">{t("duration3d")}</option>
          <option value="168">{t("duration7d")}</option>
        </select>
      </label>

      {/* Doctor Summary Notice */}
      <div
        style={{
          background: "#ecfdf5",
          border: "1px solid #a7f3d0",
          borderRadius: 10,
          padding: "8px 12px",
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 12,
          color: "#065f46"
        }}
      >
        <Sparkles size={16} color="#059669" style={{ flexShrink: 0 }} />
        <span>
          <strong>AI Clinical Briefing:</strong> CarePath AI will automatically compile an executive clinical summary synthesizing all {recordIds.length} shared report(s) for your doctor.
        </span>
      </div>

      <div className="security-line" style={{ marginBottom: 12 }}>
        <LockKeyhole size={15} />
        {t("sharePinNotice")}
      </div>
      <div className="modal-actions">
        <button className="secondary-btn" onClick={onClose} disabled={uploading}>
          {t("cancel")}
        </button>
        <button
          className="primary-btn"
          disabled={!recordIds.length || uploading}
          onClick={() => onCreate({ doctorId, recordIds, hours })}
        >
          <ShieldCheck size={17} />
          {uploading ? "Uploading..." : t("createAuthorization")}
        </button>
      </div>
    </Modal>
  );
}
