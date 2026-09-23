import React, { useEffect, useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  Bell,
  Check,
  ChevronRight,
  FileText,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  UserCog,
  ShieldAlert,
  Stethoscope,
  Sparkles,
  LockKeyhole,
  X
} from "lucide-react";
import "./styles.css";

import { LanguageProvider, useLanguage, LanguageSelector } from "./i18n/LanguageContext.jsx";
import { ThemeProvider, ThemeToggle } from "./theme/ThemeContext.jsx";
import AuthScreen from "./auth/AuthScreen.jsx";
import MediKioskIntakePage from "./medikiosk/MediKioskIntakePage.jsx";
import AyushPage from "./ayush/AyushPage.jsx";

import { API_BASE, apiFetch, getSharePin, isTokenExpired, loadState, saveState, storeFile, getStoredFile } from "./api/clientApi.js";
import { doctors, initialState, todayKey } from "./data/clinicalData.js";
import { ShareModal } from "./components/Modal.jsx";
import { NavItem, pageLabel } from "./components/NavAndStats.jsx";

import { PatientDashboard } from "./dashboard/PatientDashboard.jsx";
import { RecordsPage } from "./records/RecordsPage.jsx";
import { RecordSummaryModal } from "./records/RecordSummaryModal.jsx";
import { SharingPage } from "./sharing/SharingPage.jsx";
import { ProfilePage } from "./profile/ProfilePage.jsx";
import { DoctorPage } from "./doctor/DoctorPage.jsx";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("CarePath UI error caught by boundary:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: "center", background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: 16, margin: "24px auto", maxWidth: 640 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#fee2e2", color: "#dc2626", display: "grid", placeItems: "center", margin: "0 auto 12px" }}>
            <ShieldAlert size={28} />
          </div>
          <h3 style={{ color: "#991b1b", marginBottom: 8, fontSize: 18 }}>View Loading Error</h3>
          <p style={{ color: "#7f1d1d", fontSize: 13.5, marginBottom: 18, lineHeight: 1.5 }}>
            {this.state.error?.message || "An unexpected error occurred while rendering this page."}
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            <button className="primary-btn" onClick={() => { this.setState({ hasError: false, error: null }); if (this.props.onReset) this.props.onReset(); }}>
              Return to Dashboard
            </button>
            <button className="secondary-btn" onClick={() => window.location.reload()}>
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const { t, setLanguage } = useLanguage();
  const [state, setState] = useState(loadState);
  const [page, setPage] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [shareModal, setShareModal] = useState(false);
  const [summaryModalRecord, setSummaryModalRecord] = useState(null);
  const [isSummarizingRecord, setIsSummarizingRecord] = useState(false);
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("carepath-access-token");
    return Boolean(token && !isTokenExpired(token) && state.user?.authenticated);
  });
  const [role, setRole] = useState(() => state.user?.role || "patient");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => saveState(state), [state]);
  useEffect(() => {
    if (!toast) return;
    const tTimer = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(tTimer);
  }, [toast]);

  useEffect(() => {
    function handleSessionExpired(e) {
      console.warn("CarePath session expired:", e?.detail?.message);
      logout("Your session has expired. Please sign in again.");
    }
    window.addEventListener("carepath-session-expired", handleSessionExpired);
    return () => window.removeEventListener("carepath-session-expired", handleSessionExpired);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    }
    if (profileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [profileMenuOpen]);

  // Synchronize authenticated state from server
  useEffect(() => {
    if (!auth) return;
    let live = true;
    apiFetch("/api/state")
      .then(r => r.json())
      .then(remote => {
        if (live && remote) {
          setState(remote);
          if (remote.user?.role) setRole(remote.user.role);
          if (remote.user?.preferredLanguage) setLanguage(remote.user.preferredLanguage);
        }
      })
      .catch(err => {
        console.warn("CarePath state load failed", err);
        if (err?.status === 401) {
          logout("Your session has expired. Please sign in again.");
        }
      });
    return () => { live = false; };
  }, [auth, setLanguage]);

  function notify(x) { setToast(x); }

  function navigate(p) {
    if (p === "doctor" && role !== "doctor") {
      notify("Access restricted: Doctor portal requires physician credentials.");
      return;
    }
    setPage(p);
    setMobileOpen(false);
  }

  function handleAuthenticated(token, user) {
    localStorage.setItem("carepath-access-token", token);
    const resolvedRole = user?.role || "patient";
    setRole(resolvedRole);
    if (user?.preferredLanguage) {
      setLanguage(user.preferredLanguage);
    }
    setState(s => ({
      ...s,
      user: {
        ...s.user,
        ...user,
        authenticated: true
      }
    }));
    setAuth(true);
    setPage(resolvedRole === "doctor" ? "doctor" : "dashboard");
    notify(`Signed in as ${user?.name || user?.email} (${resolvedRole})`);
  }

  async function handleDemoLogin(selectedRole = "patient") {
    try {
      const res = await apiFetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole })
      });
      const isJson = res.headers.get("content-type")?.includes("application/json");
      const data = isJson ? await res.json().catch(() => null) : null;
      if (!res.ok) {
        throw new Error(data?.error || "Demo login unavailable — this deployment is not running in demo mode.");
      }
      if (!data?.token) {
        throw new Error("Invalid session token received from demo server.");
      }
      handleAuthenticated(data.token, data.user);
    } catch (err) {
      console.warn("CarePath demo login failed (enforcing fail-closed policy):", err);
      throw err;
    }
  }

  function logout(notificationMessage = "Signed out successfully.") {
    localStorage.removeItem("carepath-access-token");
    localStorage.removeItem("carepath-state-v2");
    setAuth(false);
    setRole("patient");
    setState({
      ...initialState,
      user: { ...initialState.user, authenticated: false }
    });
    setPage("dashboard");
    if (notificationMessage) notify(notificationMessage);
  }

  async function uploadRecords(files) {
    const fileList = Array.isArray(files) ? files : (files instanceof FileList ? Array.from(files) : (files ? [files] : []));
    if (!fileList.length) return [];

    // Client-side guard 1: 15MB file size limit
    const MAX_FILE_SIZE = 15 * 1024 * 1024;
    const ALLOWED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg"];
    const ALLOWED_MIME_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/pjpeg"];

    const validFiles = [];
    for (const file of fileList) {
      if (!file) continue;
      if (file.size > MAX_FILE_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        notify(`"${file.name}" exceeds the maximum upload limit of 15 MB (${sizeMB} MB).`);
        continue;
      }
      const fileName = (file.name || "").toLowerCase();
      const hasAllowedExt = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
      const fileMime = (file.type || "").toLowerCase();
      const hasAllowedMime = !fileMime || ALLOWED_MIME_TYPES.includes(fileMime);
      if (!hasAllowedExt || !hasAllowedMime) {
        notify(`"${file.name}" has unsupported format. Allowed formats: .pdf, .png, .jpg, .jpeg`);
        continue;
      }
      validFiles.push(file);
    }

    if (!validFiles.length) return [];

    notify(validFiles.length > 1 ? `Uploading ${validFiles.length} health records to secure vault...` : "Uploading health record...");

    const newRecords = [];
    for (const file of validFiles) {
      const id = crypto.randomUUID();
      const record = {
        id,
        name: file.name,
        type: file.type.includes("pdf") ? "PDF document" : file.type.includes("image") ? "Image" : "Health document",
        mime: file.type,
        date: todayKey(),
        size: file.size < 1024 * 1024 ? `${Math.max(1, Math.round(file.size / 1024))} KB` : `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        stored: true
      };
      try {
        await storeFile(id, file);
        newRecords.push(record);
      } catch (err) {
        console.error(`Upload failed for ${file.name}:`, err);
        let errorMsg = `Failed to upload ${file.name}`;
        if (err instanceof Error && err.isNetworkError) {
          errorMsg = `Cannot reach the CarePath server at ${API_BASE}`;
        }
        notify(errorMsg);
      }
    }

    if (newRecords.length) {
      setState(s => ({ ...s, records: [...newRecords, ...s.records] }));
      notify(newRecords.length > 1
        ? `${newRecords.length} health records uploaded securely — ready to view or share!`
        : "Health record uploaded to secure server — ready to view or share."
      );
    }
    return newRecords;
  }

  async function openRecord(record) {
    if (!record?.id) { notify("Invalid record identifier."); return; }
    try {
      notify("Opening document…");
      const stored = await getStoredFile(record.id);
      if (!stored?.blob || stored.blob.size === 0) { notify("The file could not be retrieved from the server."); return; }
      const url = URL.createObjectURL(stored.blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) { console.error(err); notify(err.message || "Could not open this document."); }
  }

  async function downloadRecord(record) {
    if (!record?.id) { notify("Invalid record identifier."); return; }
    try {
      notify("Preparing download…");
      const stored = await getStoredFile(record.id);
      if (!stored?.blob || stored.blob.size === 0) { notify("The file could not be retrieved from the server."); return; }
      const url = URL.createObjectURL(stored.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = record.name || stored.name || "health-document";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) { console.error(err); notify(err.message || "Could not download this document."); }
  }

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async function summarizeRecord(record) {
    if (!record?.id) return;

    // If already summarized, open modal immediately
    if (record.aiSummary) {
      setSummaryModalRecord(record);
      return;
    }

    try {
      setSummaryModalRecord(record);
      setIsSummarizingRecord(true);
      notify("Deciphering handwriting & analyzing document with Gemini AI...");

      let base64 = null;
      let fileMime = record.mime || "image/jpeg";
      try {
        const stored = await getStoredFile(record.id);
        if (stored?.blob && stored.blob.size > 0) {
          base64 = await blobToBase64(stored.blob);
          if (stored.blob.type) fileMime = stored.blob.type;
        }
      } catch (fileErr) {
        console.warn("Could not load stored file blob, using filename hint:", fileErr);
      }

      const res = await apiFetch("/api/ai/document-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64,
          mimeType: fileMime,
          textHint: record.name
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to scan document with Gemini Vision");
      }

      const scanResult = await res.json();
      const updatedRecord = { ...record, aiSummary: scanResult };

      // Update in state so it's cached for future clicks
      setState(s => ({
        ...s,
        records: s.records.map(r => (r.id === record.id ? updatedRecord : r))
      }));

      setSummaryModalRecord(updatedRecord);
      notify("Document deciphered and clinical summary generated!");
    } catch (err) {
      console.error("AI summarization failed:", err);
      notify(err.message || "Could not analyze this document with Gemini AI.");
      setSummaryModalRecord(null);
    } finally {
      setIsSummarizingRecord(false);
    }
  }

  async function createShare(p) {
    try {
      const res = await apiFetch("/api/shares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p)
      });
      const data = await res.json();
      const pin = data.pin || data.share?.pin || getSharePin(data.share);
      const shareWithPin = { ...data.share, pin };
      setState(s => ({
        ...s,
        shares: [shareWithPin, ...s.shares],
        shareAudit: [{ id: crypto.randomUUID(), shareId: data.share.id, event: "created", at: new Date().toISOString() }, ...(s.shareAudit || [])]
      }));
      setShareModal(false);
      notify("Temporary authorization created successfully. Access granted.");
    } catch (err) {
      console.error(err);
      notify(err.message || "Could not create this authorization.");
    }
  }

  async function revokeShare(id) {
    try {
      const res = await apiFetch(`/api/shares/${encodeURIComponent(id)}/revoke`, { method: "POST" });
      const data = await res.json();
      setState(s => ({
        ...s,
        shares: s.shares.map(x => x.id === id ? { ...x, revokedAt: data.revokedAt } : x),
        shareAudit: [{ id: crypto.randomUUID(), shareId: id, event: "revoked", at: new Date().toISOString() }, ...(s.shareAudit || [])]
      }));
      notify("Access revoked.");
    } catch (err) {
      console.error(err);
      notify("Could not revoke this authorization.");
    }
  }

  if (!auth) return <AuthScreen onAuthenticated={handleAuthenticated} onDemoLogin={handleDemoLogin} />;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><HeartPulse size={21} /></div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <strong>{t("appName")}</strong>
              <span style={{ background: "#fef3c7", color: "#92400e", fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 4, letterSpacing: 0.5 }}>v2.0 AI</span>
            </div>
            <span>{t("connectedCare")}</span>
          </div>
          <button className="icon-btn mobile-close" aria-label={t("closeNavMenuAria")} onClick={() => setMobileOpen(false)}><X size={18} /></button>
        </div>
        <div className="user-profile-badge modern">
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ position: "relative" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, var(--nav-indigo) 0%, var(--ai-violet) 100%)", color: "#ffffff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 12, boxShadow: "0 2px 8px rgba(30,27,75,0.25)" }}>
                {role === "doctor" ? "DR" : "PT"}
              </div>
              <span className="online-status-dot" style={{ position: "absolute", bottom: -1, right: -1, border: "2px solid #ffffff" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ display: "block", fontSize: 12, color: "var(--nav-indigo)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{state.user?.name || (role === "doctor" ? "Dr. Alok Verma" : "Swyom Sharma")}</strong>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}>
                <span style={{ fontSize: 9.5, color: role === "doctor" ? "var(--ai-violet)" : "var(--health-emerald)", fontWeight: 800, textTransform: "uppercase" }}>{role === "doctor" ? t("doctorAccount") : t("patientAccount")}</span>
                {role === "patient" && <span style={{ fontSize: 9, color: "#15803d", background: "#f0fdf4", padding: "0 4px", borderRadius: 3, fontWeight: 700 }}>ABHA ✓</span>}
              </div>
            </div>
          </div>
          <button className="text-btn" style={{ fontSize: 10.5, marginTop: 8, width: "100%", justifyContent: "center", color: "var(--muted)", padding: "4px 0", borderTop: "1px solid rgba(199, 210, 254, 0.4)" }} onClick={logout}>
            <LogOut size={12} /> {t("switchAccount")}
          </button>
        </div>
        <nav>
          {role === "patient" ? (
            <>
              <div className="nav-category-heading"><span>Overview & Triage</span></div>
              <NavItem domain="dashboard" icon={<LayoutDashboard size={18} />} label={t("dashboard")} active={page === "dashboard"} onClick={() => navigate("dashboard")} />
              <NavItem domain="medikiosk" icon={<Stethoscope size={18} />} label={t("medikiosk")} active={page === "medikiosk"} onClick={() => navigate("medikiosk")} />
              <NavItem domain="ayush" icon={<Sparkles size={18} />} label={t("ayush")} active={page === "ayush"} onClick={() => navigate("ayush")} />

              <div className="nav-category-heading"><span>Records & Safety</span></div>
              <NavItem domain="records" icon={<FileText size={18} />} label={t("records")} active={page === "records"} onClick={() => navigate("records")} />
              <NavItem domain="sharing" icon={<LockKeyhole size={18} />} label={t("sharing")} active={page === "sharing"} onClick={() => navigate("sharing")} />

              <div className="nav-category-heading"><span>Identity</span></div>
              <NavItem domain="profile" icon={<UserCog size={18} />} label="Profile & Identity" active={page === "profile"} onClick={() => navigate("profile")} />
            </>
          ) : (
            <NavItem domain="doctor" icon={<LayoutDashboard size={18} />} label={t("doctorPortal")} active={page === "doctor"} onClick={() => navigate("doctor")} />
          )}
        </nav>
        <div className="sidebar-bottom">
          <div className="privacy-note">
            <LockKeyhole size={17} />
            <div><strong>{t("privateByDesign")}</strong><span>{t("privateDesc")}</span></div>
          </div>
          <button className="logout" onClick={logout}><LogOut size={17} /> {t("signOut")}</button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="icon-btn hamburger" aria-label={t("openNavMenuAria")} onClick={() => setMobileOpen(true)}><Menu size={21} /></button>
          <div className="breadcrumb">{role === "patient" ? t("patientPortal") : t("doctorPortal")}<ChevronRight size={14} /><strong>{pageLabel(page, t)}</strong></div>
          <div className="top-actions">
            <LanguageSelector variant="compact" />
            <ThemeToggle variant="compact" />
            <button className="icon-btn" aria-label={t("notificationsAria")}><Bell size={19} /></button>
            <div className="profile-menu-container" ref={profileMenuRef}>
              <button
                className="avatar-btn"
                aria-label="Profile and Identity"
                title="Profile & Identity"
                aria-expanded={profileMenuOpen}
                onClick={() => setProfileMenuOpen(v => !v)}
              >
                {role === "patient" ? "SS" : "AV"}
              </button>
              {profileMenuOpen && (
                <div className="profile-popover-menu" role="menu">
                  <div className="profile-popover-header">
                    <div className="profile-popover-avatar">{role === "patient" ? "SS" : "AV"}</div>
                    <div className="profile-popover-user-info">
                      <strong>{state.user?.name || (role === "doctor" ? "Dr. Alok Verma" : "Swyom Sharma")}</strong>
                      <span>{role === "doctor" ? t("doctorAccount") : t("patientAccount")}</span>
                    </div>
                  </div>
                  <div className="profile-popover-identity-badge">
                    <ShieldCheck size={15} color="#16a34a" />
                    <span>ABHA ID & Aadhaar Verified</span>
                  </div>
                  <div className="profile-popover-links">
                    <button
                      className="profile-popover-item primary-action"
                      onClick={() => { navigate("profile"); setProfileMenuOpen(false); }}
                    >
                      <UserCog size={16} />
                      <div>
                        <strong>Profile & Identity</strong>
                        <small>Demographics, Vitals & ABHA KYC</small>
                      </div>
                    </button>
                    <button
                      className="profile-popover-item"
                      onClick={() => { navigate("records"); setProfileMenuOpen(false); }}
                    >
                      <FileText size={16} />
                      <div>
                        <strong>Health Records</strong>
                        <small>Encrypted diagnostic files</small>
                      </div>
                    </button>
                    <div className="profile-popover-divider" />
                    <button
                      className="profile-popover-item logout-action"
                      onClick={() => { setProfileMenuOpen(false); logout(); }}
                    >
                      <LogOut size={16} />
                      <span>{t("signOut")}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="content">
          <ErrorBoundary onReset={() => navigate("dashboard")}>
            {page === "dashboard" && <PatientDashboard state={state} onNavigate={navigate} />}
            {page === "medikiosk" && <MediKioskIntakePage state={state} onUpdateState={setState} onNotify={notify} onNavigate={navigate} />}
            {page === "ayush" && <AyushPage state={state} onUpdateState={setState} onNotify={notify} onNavigate={navigate} />}
            {page === "records" && <RecordsPage records={state.records} onUpload={uploadRecords} onOpen={openRecord} onDownload={downloadRecord} onSummarize={summarizeRecord} onShare={() => setShareModal(true)} />}
            {page === "sharing" && (
              <SharingPage
                state={state}
                doctors={doctors}
                onOpen={() => setShareModal(true)}
                onRevoke={revokeShare}
                onUploadAndShare={async (files) => {
                  const uploaded = await uploadRecords(files);
                  setShareModal(true);
                  return uploaded;
                }}
              />
            )}
            {page === "profile" && (
              <ProfilePage
                state={state}
                onSave={(p) => { setState(s => ({ ...s, user: { ...s.user, ...p } })); notify("Profile updated."); }}
                onVerificationComplete={(verification) => { setState(s => ({ ...s, user: { ...s.user, verification } })); notify("Account verification updated!"); }}
              />
            )}
            {page === "doctor" && (
              role === "doctor" ? (
                <DoctorPage
                  onOpen={openRecord}
                  onDownload={downloadRecord}
                  onSummarize={summarizeRecord}
                  intake={state.medikioskIntake}
                  ayushIntake={state.ayushIntake}
                  onUpdateState={setState}
                  onNotify={notify}
                />
              ) : (
                <div className="empty" style={{ padding: 40 }}>
                  <ShieldAlert size={32} color="#b91c1c" />
                  <strong style={{ color: "#b91c1c", fontSize: 16 }}>{t("accessRestrictedTitle")}</strong>
                  <p style={{ maxWidth: 400, margin: "8px auto 16px", color: "#687a74", fontSize: 12 }}>
                    Doctor Portal requires clinical credentials. Your active session is authenticated as a <strong>{role}</strong>.
                  </p>
                  <button className="primary-btn" onClick={() => navigate("dashboard")}>
                    {t("dashboard")}
                  </button>
                </div>
              )
            )}
          </ErrorBoundary>
        </div>
      </main>
      {shareModal && (
        <ShareModal
          records={state.records}
          doctors={doctors}
          onClose={() => setShareModal(false)}
          onCreate={createShare}
          onUpload={uploadRecords}
        />
      )}
      {summaryModalRecord && (
        <RecordSummaryModal
          record={summaryModalRecord}
          isLoading={isSummarizingRecord}
          onClose={() => { setSummaryModalRecord(null); setIsSummarizingRecord(false); }}
        />
      )}
      {toast && <div className="toast"><Check size={17} />{toast}</div>}
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </ThemeProvider>
);
