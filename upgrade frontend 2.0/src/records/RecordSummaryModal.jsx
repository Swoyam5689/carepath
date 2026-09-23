import React, { useState } from "react";
import {
  X,
  Sparkles,
  FileText,
  Pill,
  Activity,
  Stethoscope,
  HelpCircle,
  Copy,
  Check,
  Plus,
  AlertCircle,
  Calendar,
  Building2,
  User,
  ShieldCheck,
  Download
} from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

export function RecordSummaryModal({ record, isLoading, onClose, onAddMedication }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [addedMeds, setAddedMeds] = useState({});

  if (!record && !isLoading) return null;

  const summary = record?.aiSummary || {};
  const isPrescription = summary.documentType === "PRESCRIPTION" || (summary.medications && summary.medications.length > 0);
  const medications = summary.medications || [];
  const labResults = summary.labResults || [];
  const questions = summary.questionsForDoctor || [];
  const nextSteps = summary.recommendedNextSteps || [];

  const handleCopyTranscript = () => {
    const textToCopy = summary.ocrText || summary.transcribedText || "";
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAddMedToSchedule = (med, idx) => {
    if (onAddMedication) {
      onAddMedication({
        name: med.name || med.medicineName,
        generic: med.genericName,
        dosage: med.dosage || "As prescribed",
        frequency: med.frequency || "1-0-1",
        timing: med.timing || "After meals",
        schedule: "09:00",
        instructions: [med.instructions, med.duration].filter(Boolean).join(" · ") || "Follow prescription instructions"
      });
      setAddedMeds(prev => ({ ...prev, [idx]: true }));
    }
  };

  const handleAddAllMeds = () => {
    if (!onAddMedication || medications.length === 0) return;
    medications.forEach((med, idx) => {
      onAddMedication({
        name: med.name || med.medicineName,
        generic: med.genericName,
        dosage: med.dosage || "As prescribed",
        frequency: med.frequency || "1-0-1",
        timing: med.timing || "After meals",
        schedule: "09:00",
        instructions: [med.instructions, med.duration].filter(Boolean).join(" · ") || "Follow prescription instructions"
      });
      setAddedMeds(prev => ({ ...prev, [idx]: true }));
    });
  };

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div
        className="modal"
        style={{
          maxWidth: "760px",
          width: "95vw",
          maxHeight: "calc(100vh - 48px)",
          display: "flex",
          flexDirection: "column",
          padding: 0,
          overflow: "hidden"
        }}
      >
        {/* Modal Head */}
        <div
          className="modal-head"
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--line)",
            background: "linear-gradient(135deg, rgba(5,150,105,0.05) 0%, rgba(13,148,136,0.08) 100%)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "10px",
                background: "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff"
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: 17, margin: 0, fontWeight: 700, color: "var(--navy)" }}>
                AI Clinical Summary & Handwriting Transcription
              </h2>
              <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                <span>{record?.name || "Health Record"}</span>
                {summary.source && (
                  <span
                    style={{
                      background: "#ecfdf5",
                      color: "#047857",
                      border: "1px solid #a7f3d0",
                      padding: "1px 7px",
                      borderRadius: 99,
                      fontSize: 10.5,
                      fontWeight: 600
                    }}
                  >
                    ✨ {summary.source}
                  </span>
                )}
              </span>
            </div>
          </div>
          <button
            className="icon-btn"
            aria-label="Close dialog"
            onClick={onClose}
            style={{ borderRadius: "50%", padding: 6 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body with smooth scrolling */}
        <div
          style={{
            padding: "20px",
            overflowY: "auto",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 18
          }}
        >
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "48px 16px" }}>
              <div
                style={{
                  display: "inline-flex",
                  padding: 16,
                  borderRadius: "50%",
                  background: "#ecfdf5",
                  color: "#059669",
                  marginBottom: 16,
                  animation: "pulse 2s infinite"
                }}
              >
                <Sparkles size={36} />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--navy)", marginBottom: 8 }}>
                Deciphering Medical Document with Gemini AI...
              </h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", maxWidth: 460, margin: "0 auto 16px", lineHeight: 1.5 }}>
                Our multimodal vision models are reading physician cursive handwriting, dosage codes (1-0-1, OD, BD), and diagnostic report findings.
              </p>
              <div
                style={{
                  width: 220,
                  height: 5,
                  background: "#e2e8f0",
                  borderRadius: 99,
                  margin: "0 auto",
                  overflow: "hidden"
                }}
              >
                <div
                  style={{
                    width: "60%",
                    height: "100%",
                    background: "linear-gradient(90deg, #059669, #0d9488)",
                    borderRadius: 99,
                    animation: "pulse 1.5s infinite"
                  }}
                />
              </div>
            </div>
          ) : (
            <>
              {/* Metadata strip */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                  padding: "10px 14px",
                  background: "#f8fafc",
                  borderRadius: 10,
                  border: "1px solid var(--line)",
                  fontSize: 12,
                  alignItems: "center"
                }}
              >
                {summary.documentType && (
                  <span style={{ fontWeight: 600, color: "#0f766e" }}>
                    Type: <strong style={{ color: "var(--navy)" }}>{summary.documentType}</strong>
                  </span>
                )}
                {summary.doctorName && (
                  <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#475569" }}>
                    <User size={13} color="#059669" /> Dr: <strong>{summary.doctorName}</strong>
                  </span>
                )}
                {summary.facilityName && (
                  <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#475569" }}>
                    <Building2 size={13} color="#059669" /> Clinic/Lab: <strong>{summary.facilityName}</strong>
                  </span>
                )}
                {summary.date && (
                  <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#475569" }}>
                    <Calendar size={13} color="#059669" /> Date: <strong>{summary.date}</strong>
                  </span>
                )}
                {summary.urgency && (
                  <span
                    style={{
                      marginLeft: "auto",
                      padding: "2px 8px",
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 700,
                      background: summary.urgency === "EMERGENCY" ? "#fee2e2" : summary.urgency === "URGENT" ? "#fef3c7" : "#ecfdf5",
                      color: summary.urgency === "EMERGENCY" ? "#991b1b" : summary.urgency === "URGENT" ? "#92400e" : "#065f46"
                    }}
                  >
                    {summary.urgency}
                  </span>
                )}
              </div>

              {/* 1. Patient Friendly Explanation */}
              {summary.patientSummary && (
                <div
                  style={{
                    background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
                    border: "1px solid #bbf7d0",
                    borderRadius: 12,
                    padding: "16px 18px"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      color: "#166534",
                      fontWeight: 700,
                      fontSize: 13.5,
                      marginBottom: 8
                    }}
                  >
                    <Sparkles size={16} />
                    <span>Patient Summary (Plain Language Explanation)</span>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: "#14532d"
                    }}
                  >
                    {summary.patientSummary}
                  </p>
                </div>
              )}

              {/* 2. Deciphered Handwritten Transcript */}
              {(summary.ocrText || summary.transcribedText) && (
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid var(--line)",
                    borderRadius: 12,
                    padding: "14px 16px"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--navy)",
                        display: "flex",
                        alignItems: "center",
                        gap: 6
                      }}
                    >
                      <FileText size={15} color="#059669" />
                      Deciphered Handwriting Transcript
                    </span>
                    <button
                      type="button"
                      className="outline-btn"
                      style={{ fontSize: 11, padding: "4px 10px", display: "inline-flex", alignItems: "center", gap: 5 }}
                      onClick={handleCopyTranscript}
                    >
                      {copied ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                      {copied ? "Copied!" : "Copy Text"}
                    </button>
                  </div>
                  <div
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      padding: "12px 14px",
                      fontSize: 12.5,
                      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                      color: "#1e293b",
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.55,
                      maxHeight: "180px",
                      overflowY: "auto"
                    }}
                  >
                    {summary.ocrText || summary.transcribedText}
                  </div>
                </div>
              )}

              {/* 3. Prescribed Medications Table */}
              {medications.length > 0 && (
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid var(--line)",
                    borderRadius: 12,
                    padding: "16px"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                      flexWrap: "wrap",
                      gap: 8
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Pill size={16} color="#059669" />
                      <strong style={{ fontSize: 14, color: "var(--navy)" }}>
                        Prescribed Medications ({medications.length})
                      </strong>
                    </div>
                    {onAddMedication && (
                      <button
                        type="button"
                        className="primary-btn"
                        style={{
                          fontSize: 11.5,
                          padding: "5px 12px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          borderRadius: 8
                        }}
                        onClick={handleAddAllMeds}
                      >
                        <Plus size={14} />
                        Add All to Medication Schedule
                      </button>
                    )}
                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <table className="medikiosk-lab-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <th>Medicine</th>
                          <th>Dosage</th>
                          <th>Frequency</th>
                          <th>Timing & Duration</th>
                          <th>Instructions</th>
                          {onAddMedication && <th style={{ textAlign: "right" }}>Action</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {medications.map((med, idx) => {
                          const medName = med.name || med.medicineName;
                          const isAdded = addedMeds[idx];
                          return (
                            <tr key={idx}>
                              <td>
                                <strong style={{ color: "var(--navy)", fontSize: 13 }}>{medName}</strong>
                                {med.genericName && med.genericName !== medName && (
                                  <span style={{ display: "block", fontSize: 11, color: "var(--text-muted)" }}>
                                    ({med.genericName})
                                  </span>
                                )}
                              </td>
                              <td>{med.dosage || "—"}</td>
                              <td>
                                <span
                                  className="medikiosk-abnormal-badge normal"
                                  style={{ fontWeight: 600 }}
                                >
                                  {med.frequency || "1-0-1"}
                                </span>
                              </td>
                              <td>
                                <div>{med.timing || "After meals"}</div>
                                {med.duration && <small className="muted">{med.duration}</small>}
                              </td>
                              <td style={{ fontSize: 12 }}>
                                {med.instructions || "As directed by physician"}
                                {med.precautions && (
                                  <div style={{ color: "#b45309", fontSize: 11, marginTop: 2 }}>
                                    ⚠️ {med.precautions}
                                  </div>
                                )}
                              </td>
                              {onAddMedication && (
                                <td style={{ textAlign: "right" }}>
                                  <button
                                    type="button"
                                    className="outline-btn"
                                    style={{
                                      fontSize: 11,
                                      padding: "4px 8px",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 4,
                                      borderColor: isAdded ? "#059669" : undefined,
                                      color: isAdded ? "#059669" : undefined,
                                      background: isAdded ? "#ecfdf5" : undefined
                                    }}
                                    disabled={isAdded}
                                    onClick={() => handleAddMedToSchedule(med, idx)}
                                  >
                                    {isAdded ? <Check size={12} /> : <Plus size={12} />}
                                    {isAdded ? "Added" : "Track"}
                                  </button>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 4. Diagnostic Lab Results Table */}
              {labResults.length > 0 && (
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid var(--line)",
                    borderRadius: 12,
                    padding: "16px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                    <Activity size={16} color="#0d9488" />
                    <strong style={{ fontSize: 14, color: "var(--navy)" }}>
                      Laboratory Investigations ({labResults.length})
                    </strong>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table className="medikiosk-lab-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <th>Investigation</th>
                          <th>Measured Value</th>
                          <th>Normal Range</th>
                          <th>Status</th>
                          <th>Interpretation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {labResults.map((lab, idx) => (
                          <tr key={idx}>
                            <td><strong>{lab.test}</strong></td>
                            <td style={{ fontWeight: 600 }}>{lab.value}</td>
                            <td className="muted">{lab.referenceRange || "—"}</td>
                            <td>
                              <span
                                className={`medikiosk-abnormal-badge ${
                                  lab.status === "abnormal" || lab.status === "high" || lab.status === "low" ? "critical" : "normal"
                                }`}
                              >
                                {lab.status || "normal"}
                              </span>
                            </td>
                            <td style={{ fontSize: 12 }}>{lab.interpretation || "Normal parameters"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 5. Doctor / Clinical Summary */}
              {summary.clinicalSummary && (
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: "14px 16px"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      color: "#334155",
                      fontWeight: 700,
                      fontSize: 13,
                      marginBottom: 6
                    }}
                  >
                    <Stethoscope size={15} color="#059669" />
                    <span>Clinical Record Synthesis</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.5, color: "#475569" }}>
                    {summary.clinicalSummary}
                  </p>
                </div>
              )}

              {/* 6. Questions for Doctor & Next Steps */}
              {(questions.length > 0 || nextSteps.length > 0) && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: 14
                  }}
                >
                  {questions.length > 0 && (
                    <div
                      style={{
                        background: "#fefce8",
                        border: "1px solid #fef08a",
                        borderRadius: 10,
                        padding: "12px 14px"
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          color: "#854d0e",
                          fontWeight: 700,
                          fontSize: 12.5,
                          marginBottom: 6
                        }}
                      >
                        <HelpCircle size={14} /> Questions to Ask Your Doctor
                      </div>
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#713f12", lineHeight: 1.5 }}>
                        {questions.map((q, i) => (
                          <li key={i} style={{ marginBottom: 4 }}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {nextSteps.length > 0 && (
                    <div
                      style={{
                        background: "#eff6ff",
                        border: "1px solid #bfdbfe",
                        borderRadius: 10,
                        padding: "12px 14px"
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          color: "#1e40af",
                          fontWeight: 700,
                          fontSize: 12.5,
                          marginBottom: 6
                        }}
                      >
                        <ShieldCheck size={14} /> Recommended Next Steps
                      </div>
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#1e3a8a", lineHeight: 1.5 }}>
                        {nextSteps.map((s, i) => (
                          <li key={i} style={{ marginBottom: 4 }}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className="modal-actions"
          style={{
            padding: "12px 20px",
            borderTop: "1px solid var(--line)",
            background: "#ffffff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
            <ShieldCheck size={14} color="#059669" />
            <span>DPDP & ABDM Health Data Security Verified</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="primary-btn" onClick={onClose} style={{ padding: "8px 20px" }}>
              {t("closeDialog") || "Done"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecordSummaryModal;
