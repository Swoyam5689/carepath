import React, { useState, useMemo } from "react";
import { ShieldCheck, Upload, FileText, ExternalLink, Download, Sparkles, Search, X } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { PageIntro } from "../components/NavAndStats.jsx";
import { VoiceInputButton } from "../components/VoiceInputButton.jsx";

export function RecordCard({ record, onOpen, onDownload, onSummarize }) {
  const { t } = useLanguage();
  const hasAiSummary = Boolean(record.aiSummary);

  return (
    <div className="record-card">
      <div className="file-icon">
        <FileText size={20} />
      </div>
      <div className="record-info">
        <strong title={record.name}>{record.name}</strong>
        <span>
          {record.type} · {record.date}
        </span>
        <small>
          {record.size}
          {record.stored ? ` · ${t("securelyStored")}` : ""}
          {hasAiSummary && (
            <span style={{ color: "#059669", fontWeight: 600, marginLeft: 4 }}>
              · ✨ AI Summarized
            </span>
          )}
        </small>
      </div>
      <div className="record-actions">
        <button
          className="outline-btn"
          style={{
            borderColor: hasAiSummary ? "#059669" : "#0d9488",
            color: hasAiSummary ? "#065f46" : "#0f766e",
            background: hasAiSummary ? "#ecfdf5" : "rgba(13,148,136,0.06)",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: 5
          }}
          onClick={() => onSummarize?.(record)}
          disabled={!record.stored}
          title="Transcribe handwriting & generate AI clinical summary"
        >
          <Sparkles size={14} color="#059669" />
          {hasAiSummary ? "View Summary" : "✨ AI Summary"}
        </button>
        <button className="outline-btn" onClick={() => onOpen?.(record)} disabled={!record.stored}>
          <ExternalLink size={14} />
          {t("open")}
        </button>
        {record.stored && (
          <button className="icon-btn" title={t("download")} aria-label={t("download")} onClick={() => onDownload?.(record)}>
            <Download size={17} />
          </button>
        )}
      </div>
    </div>
  );
}

export function RecordsPage({ records, onUpload, onOpen, onDownload, onSummarize, onShare }) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return records;
    const q = searchQuery.toLowerCase().trim();
    return records.filter(r =>
      (r.name && r.name.toLowerCase().includes(q)) ||
      (r.type && r.type.toLowerCase().includes(q)) ||
      (r.date && r.date.toLowerCase().includes(q)) ||
      (r.aiSummary && typeof r.aiSummary === "string" && r.aiSummary.toLowerCase().includes(q))
    );
  }, [records, searchQuery]);

  return (
    <div>
      <PageIntro
        eyebrow={t("records").toUpperCase()}
        title={t("yourHealthRecords")}
        subtitle={t("recordsSubtitle")}
        tag={<><i />AES-256 Vault</>}
        action={
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {onShare && records.length > 0 && (
              <button
                className="primary-btn"
                onClick={onShare}
                style={{
                  fontSize: 12.5,
                  padding: "6px 14px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <ShieldCheck size={14} />
                <span>{t("shareWithDoctor") || "Share with Doctor"}</span>
              </button>
            )}
            <span className="abha-id-chip">
              <ShieldCheck size={14} color="#059669" />
              <span>ABDM Compliant PHR</span>
            </span>
          </div>
        }
      />

      {/* AI Handwriting Intelligence Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
          border: "1px solid #bbf7d0",
          borderRadius: 12,
          padding: "14px 18px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 12
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#059669",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}
        >
          <Sparkles size={18} />
        </div>
        <div style={{ flex: 1 }}>
          <strong style={{ display: "block", color: "#166534", fontSize: 13.5, marginBottom: 2 }}>
            Gemini Multimodal Document Vision & Handwriting Deciphering
          </strong>
          <span style={{ fontSize: 12, color: "#15803d", lineHeight: 1.4 }}>
            CarePath AI automatically deciphers hurried doctor handwriting, cursive prescriptions, and diagnostic lab reports. Upload one, two, or many files at once and click <strong>✨ AI Summary</strong> to view verbatim transcripts, structured medications, and patient-friendly explanations.
          </span>
        </div>
      </div>

      {/* Voice-Enabled Search Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "#ffffff",
          border: "1.5px solid var(--line)",
          borderRadius: 12,
          padding: "6px 14px",
          marginBottom: 16,
          gap: 10,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}
      >
        <Search size={18} style={{ color: "var(--muted-2)", flexShrink: 0 }} />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={t("voiceSearchPlaceholder") || "Search records by name, type, date, or voice..."}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: 13.5,
            color: "var(--ink)",
            padding: "4px 0"
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              display: "flex",
              color: "var(--muted-2)"
            }}
            title={t("micClear") || "Clear search"}
          >
            <X size={16} />
          </button>
        )}
        <VoiceInputButton
          variant="pill"
          onFinalTranscript={(transcript) => {
            setSearchQuery(transcript);
          }}
        />
      </div>

      <label
        className={`upload-zone ${isDragging ? "dragging" : ""}`}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length) {
            onUpload(e.dataTransfer.files);
          }
        }}
        style={{
          border: isDragging ? "2px dashed var(--health-emerald)" : "2px dashed #94a3b8",
          background: isDragging ? "#ecfdf5" : "#f8fafc",
          transition: "all 0.2s ease"
        }}
      >
        <input
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={e => {
            if (e.target.files && e.target.files.length) {
              onUpload(e.target.files);
            }
            e.target.value = "";
          }}
        />
        <Upload size={28} color="var(--health-emerald)" />
        <strong style={{ fontSize: 15, color: "var(--health-emerald-dark)" }}>
          {t("uploadHealthRecord") || "Upload Health Records (Single or Batch)"}
        </strong>
        <span style={{ fontSize: 12, color: "#64748b", maxWidth: 440 }}>
          {t("uploadFormatNotice") || "Drag & drop or click to upload one, two, or many reports at once. Supported formats: PDF, PNG, JPG, JPEG (up to 15 MB each)."}
        </span>
      </label>

      {filteredRecords.length > 0 ? (
        <div className="record-grid full">
          {filteredRecords.map(r => (
            <RecordCard
              key={r.id}
              record={r}
              onOpen={onOpen}
              onDownload={onDownload}
              onSummarize={onSummarize}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            padding: "36px 16px",
            textAlign: "center",
            background: "#f9fafb",
            borderRadius: 12,
            border: "1px dashed var(--line)",
            marginTop: 16
          }}
        >
          <p style={{ color: "var(--muted)", margin: "0 0 8px", fontSize: 14 }}>
            {searchQuery
              ? `No health records found matching "${searchQuery}".`
              : "No health records available."}
          </p>
          {searchQuery && (
            <button
              type="button"
              className="outline-btn"
              onClick={() => setSearchQuery("")}
              style={{ fontSize: 12, padding: "4px 12px" }}
            >
              Clear Search Filter
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default RecordsPage;
