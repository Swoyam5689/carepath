import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  HeartPulse, Mic, MicOff, Volume2, Pause, Play, AlertTriangle, ShieldCheck,
  FileText, Upload, Camera, Check, ChevronRight, ChevronLeft, Stethoscope,
  Sparkles, RefreshCw, Eye, Download, Info, Trash2, Send, Activity, Pill,
  UserCheck, AlertCircle, FileCheck2, HelpCircle, FileCode, CheckCircle2,
  Clock, Thermometer, Wind, Brain, ShieldAlert, Calendar, ArrowDownCircle,
  FileSpreadsheet, ClipboardList
} from "lucide-react";

import {
  SUPPORTED_LANGUAGES, TRANSLATIONS, CHIEF_COMPLAINTS,
  RED_FLAG_RULES, PAST_CONDITIONS, PERSONAL_HISTORY_QUESTIONS, REVIEW_OF_SYSTEMS,
  evaluateRedFlags, getSocratesQuestionsForComplaint,
  getLocalizedComplaintVoicePrompt, getLocalizedSummaryVoicePrompt, getLocalizedQuestionVoicePrompt
} from "./clinicalOntology.js";

import { speechService } from "./speechService.js";
import { runDocumentOcr, runGeminiDocumentVision, extractMedicalEntities, SAMPLE_DOCUMENTS } from "./documentIntelligence.js";
import { validateAbhaAddress, validateAbhaNumber, createConsentArtifact, generateFhirR4Bundle } from "./fhirAbdm.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { SUPPORTED_LANGUAGES as I18N_LANGUAGES } from "../i18n/languages.js";
import { VoiceInputButton } from "../components/VoiceInputButton.jsx";
import { normalizeSpeech, parseSpokenNumber, matchChiefComplaint, matchOption } from "../utils/voiceMatcher.js";
import "./medikiosk.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
function apiHeaders(extra = {}) {
  const token = localStorage.getItem("carepath-access-token");
  return { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...extra };
}

export default function MediKioskIntakePage({ state, onUpdateState, onNotify, onNavigate }) {
  const { bhashiniLocale, t: globalT, language } = useLanguage();
  const selectedLanguage = bhashiniLocale || "en-IN";
  const [isPaused, setIsPaused] = useState(false);
  const currentLangObj = I18N_LANGUAGES.find((l) => l.code === (language || "en")) || I18N_LANGUAGES[0];

  // Automatically synchronize speech recognition engine whenever global site language changes
  useEffect(() => {
    speechService.setLanguage(selectedLanguage);
  }, [selectedLanguage]);

  // Register non-intrusive fallback notification when a voice is not supported
  useEffect(() => {
    speechService.setOnVoiceUnavailable(({ label }) => {
      const notice = globalT("voiceUnavailableNotice", { label }) ||
        `Voice output is not supported for ${label} on your browser. Please refer to the text display.`;
      if (onNotify) {
        onNotify(notice);
      }
    });
  }, [onNotify, globalT]);

  // Section 1: Identity & Consent
  const [abhaId, setAbhaId] = useState(state.user?.email === "patient@carepath.demo" ? "91-4455-8822-1923" : "");
  const [aadhaarLast4, setAadhaarLast4] = useState("4321");
  const [consentPermissions, setConsentPermissions] = useState({
    voice: true,
    ocr: true,
    shareHis: true,
    linkAbha: true
  });
  const [consentSaved, setConsentSaved] = useState(false);
  const [consentArtifact, setConsentArtifact] = useState(null);

  const abhaIsValid = Boolean(validateAbhaNumber(abhaId) || validateAbhaAddress(abhaId));

  // Section 2: Chief Complaint & Dynamic SOCRATES
  const [selectedComplaint, setSelectedComplaint] = useState(CHIEF_COMPLAINTS[0]);

  function getLocalizedComplaintLabel(complaint, lang) {
    if (!complaint) return "";
    const code = (lang || "en").toLowerCase().slice(0, 2);
    if (code === "hi") return complaint.labelHi || complaint.label;
    if (code === "bn") return complaint.labelBn || complaint.label;
    if (code === "mr") return complaint.labelMr || complaint.label;
    if (code === "te") return complaint.labelTe || complaint.label;
    if (code === "ta") return complaint.labelTa || complaint.label;
    return complaint.label;
  }

  function getSecondaryComplaintLabel(complaint, lang) {
    if (!complaint) return "";
    const code = (lang || "en").toLowerCase().slice(0, 2);
    if (code !== "en") {
      return complaint.label; // Clinical/English term as subtitle
    }
    return complaint.labelHi || complaint.category || "";
  }

  function getLocalizedOptionLabel(opt, lang) {
    if (!opt) return "";
    const code = (lang || "en").toLowerCase().slice(0, 2);
    if (code === "hi") return opt.labelHi || opt.label;
    if (code === "bn") return opt.labelBn || opt.labelHi || opt.label;
    if (code === "mr") return opt.labelMr || opt.labelHi || opt.label;
    if (code === "te") return opt.labelTe || opt.labelHi || opt.label;
    if (code === "ta") return opt.labelTa || opt.labelHi || opt.label;
    return opt.label;
  }

  function getSpokenSelectionFeedback(label, isDeselect = false, lang = "en") {
    const code = (lang || "en").toLowerCase().slice(0, 2);
    if (isDeselect) {
      switch (code) {
        case "hi": return `हटाया गया: ${label}`;
        case "bn": return `বাদ দেওয়া হয়েছে: ${label}`;
        case "mr": return `काढून टाकले: ${label}`;
        case "te": return `తీసివేయబడింది: ${label}`;
        case "ta": return `நீக்கப்பட்டது: ${label}`;
        default: return `Deselected: ${label}`;
      }
    }
    switch (code) {
      case "hi": return `चयनित: ${label}`;
      case "bn": return `নির্বাচিত: ${label}`;
      case "mr": return `निवडले: ${label}`;
      case "te": return `ఎంచుకోబడింది: ${label}`;
      case "ta": return `தேர்ந்தெடுக்கப்பட்டது: ${label}`;
      default: return `Selected: ${label}`;
    }
  }

  function getSpokenSeverityFeedback(value, label, lang = "en") {
    const code = (lang || "en").toLowerCase().slice(0, 2);
    switch (code) {
      case "hi": return `चयनित दर्द की तीव्रता: 10 में से ${value}, ${label || ""}`;
      case "bn": return `নির্বাচিত তীব্রতা: 10 এর মধ্যে ${value}, ${label || ""}`;
      case "mr": return `निवडलेली तीव्रता: 10 पैकी ${value}, ${label || ""}`;
      case "te": return `ఎంచుకున్న తీవ్రత: 10 లో ${value}, ${label || ""}`;
      case "ta": return `தேர்ந்தெடுக்கப்பட்ட தீவிரத்தன்மை: 10 இல் ${value}, ${label || ""}`;
      default: return `Selected pain severity: ${value} out of 10, ${label || ""}`;
    }
  }

  const [socratesAnswers, setSocratesAnswers] = useState({
    site: "",
    onset: "",
    character: "",
    radiation: "",
    associations: [],
    time_course: "",
    exacerbating_relieving: "",
    severity: 5
  });

  // Section 3: Past Medical & Chronic Conditions (Req 4: Free-text other conditions)
  const [pastConditions, setPastConditions] = useState(["dm2"]);
  const [otherChronicDiseases, setOtherChronicDiseases] = useState("");
  const [personalHistory, setPersonalHistory] = useState({
    diet: "vegetarian",
    tobacco: "none",
    alcohol: "none"
  });
  const [rosAnswers, setRosAnswers] = useState([]);
  const [freeTextNotes, setFreeTextNotes] = useState("");

  // Voice recognition live state
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");

  // Section 4: Document Intelligence State
  const [documents, setDocuments] = useState([]);
  const [isProcessingDoc, setIsProcessingDoc] = useState(false);
  const [docProgress, setDocProgress] = useState(0);
  const [expandedOcr, setExpandedOcr] = useState({});
  const fileInputRef = useRef(null);

  function toggleOcr(id) {
    setExpandedOcr(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function addMedsToSchedule(medsList) {
    if (!medsList || medsList.length === 0) return;
    onUpdateState(prev => {
      const existingNames = (prev.meds || []).map(m => (m.name || "").toLowerCase());
      const newMedsToAdd = [];
      for (const m of medsList) {
        const name = m.name || m.medicineName;
        if (name && !existingNames.includes(name.toLowerCase())) {
          newMedsToAdd.push({
            id: crypto.randomUUID(),
            name,
            dosage: m.dosage || "As prescribed",
            frequency: m.frequency || "Once daily",
            schedule: "09:00",
            instructions: [m.instructions, m.timing, m.duration].filter(Boolean).join(" · ") || "Follow prescription instructions",
            adherent: true
          });
        }
      }
      if (newMedsToAdd.length === 0) {
        onNotify("All medications from this prescription are already in your active schedule.");
        return prev;
      }
      onNotify(`Added ${newMedsToAdd.length} prescribed medication(s) to your daily tracker!`);
      return {
        ...prev,
        meds: [...prev.meds, ...newMedsToAdd]
      };
    });
  }

  // Red Flag Alert State
  const [triggeredRedFlags, setTriggeredRedFlags] = useState([]);
  const [emergencyDismissed, setEmergencyDismissed] = useState(false);

  // Section 5: Consultation & FHIR Output
  const [pushedToDoctor, setPushedToDoctor] = useState(false);
  const [fhirModalOpen, setFhirModalOpen] = useState(false);
  const [generatedFhirBundle, setGeneratedFhirBundle] = useState(null);
  const [bilingualPatientMode, setBilingualPatientMode] = useState(false);

  // Section-wise Guided Questionnaire Navigation State: 1 to 5
  const [sectionIndex, setSectionIndex] = useState(1);
  const [socratesIndex, setSocratesIndex] = useState(0); // 0 = Complaint selection, 1..N = Active SOCRATES questions
  const [historySubIndex, setHistorySubIndex] = useState(0); // 0 = Chronic chips, 1 = Other free text, 2 = Current meds
  const [lifestyleSubIndex, setLifestyleSubIndex] = useState(0); // 0 = Diet, 1 = Tobacco, 2 = Alcohol, 3 = Notes, 4 = Docs

  const SECTIONS = [
    { id: 1, name: globalT("navIdentityConsent") || "Personal Information", tag: "Identity & Consent", icon: <ShieldCheck size={16} /> },
    { id: 2, name: globalT("navChiefSocrates") || "Symptoms & Complaint", tag: "Clinical Triage", icon: <Activity size={16} /> },
    { id: 3, name: globalT("navMedicalHistory") || "Medical History", tag: "Chronic Conditions", icon: <FileText size={16} /> },
    { id: 4, name: globalT("navLabReports") || "Lifestyle & Reports", tag: "Habits & Lab OCR", icon: <Thermometer size={16} /> },
    { id: 5, name: globalT("navSummaryConsult") || "Review & Submit", tag: "Consultation Routing", icon: <CheckCircle2 size={16} /> },
  ];

  function handleGlobalBack() {
    if (sectionIndex === 2) {
      if (socratesIndex > 0) {
        setSocratesIndex((prev) => prev - 1);
      } else {
        setSectionIndex(1);
      }
    } else if (sectionIndex === 3) {
      if (historySubIndex > 0) {
        setHistorySubIndex((prev) => prev - 1);
      } else {
        setSectionIndex(2);
        setSocratesIndex(activeSocratesQuestions.length);
      }
    } else if (sectionIndex === 4) {
      if (lifestyleSubIndex > 0) {
        setLifestyleSubIndex((prev) => prev - 1);
      } else {
        setSectionIndex(3);
        setHistorySubIndex(2);
      }
    } else if (sectionIndex === 5) {
      setSectionIndex(4);
      setLifestyleSubIndex(4);
    }
  }

  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS["en-IN"];

  // Language switch handler
  function handleLanguageChange(lang) {
    setSelectedLanguage(lang);
    speechService.setLanguage(lang);
  }

  // Voice Interaction Toggle
  function toggleVoiceListening() {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      setLiveTranscript("");
      const success = speechService.startListening(
        (transcript) => {
          const text = transcript.final || transcript.interim;
          setLiveTranscript(text);
          if (transcript.final && transcript.final.trim()) {
            setFreeTextNotes((prev) => (prev ? `${prev} ${transcript.final.trim()}` : transcript.final.trim()));
          }
        },
        (error) => {
          console.warn("Speech error:", error);
          setIsListening(false);
          onNotify("Voice input paused or unavailable in this browser. Touch controls active.");
        },
        (active) => setIsListening(active)
      );
      if (!success) {
        onNotify("Microphone access could not be initialized. Please use touch input.");
      }
    }
  }

  // Audio prompt TTS
  function speakPrompt(text) {
    speechService.speak(text, selectedLanguage);
  }

  function speakOptionSelection(opt, isDeselect = false) {
    if (!opt) return;
    const optLabel = getLocalizedOptionLabel(opt, language);
    const feedbackText = getSpokenSelectionFeedback(optLabel, isDeselect, language);
    speakPrompt(feedbackText);
  }

  function speakSeveritySelection(opt) {
    if (!opt) return;
    const optLabel = language !== "en" && opt.labelHi ? opt.labelHi : opt.label;
    const feedbackText = getSpokenSeverityFeedback(opt.value, optLabel, language);
    speakPrompt(feedbackText);
  }

  // Evaluate red-flags whenever symptoms or answers change
  useEffect(() => {
    const combinedAnswers = {
      chief_complaint: selectedComplaint?.id,
      ...socratesAnswers,
      free_text: freeTextNotes
    };
    const flags = evaluateRedFlags(combinedAnswers);
    setTriggeredRedFlags(flags);
  }, [selectedComplaint, socratesAnswers, freeTextNotes]);

  // Handle complaint selection with dynamic reset
  function handleComplaintSelect(item) {
    setSelectedComplaint(item);
    setSocratesAnswers({
      site: "",
      onset: "",
      character: "",
      radiation: "",
      associations: [],
      time_course: "",
      exacerbating_relieving: "",
      severity: 5
    });
    speakPrompt(getLocalizedComplaintVoicePrompt(item, selectedLanguage));
  }

  // Dynamic SOCRATES question set for selected complaint
  const activeSocratesQuestions = useMemo(() => {
    return getSocratesQuestionsForComplaint(selectedComplaint?.id);
  }, [selectedComplaint]);

  // Save Identity & Consent
  function saveConsent() {
    if (!abhaIsValid) {
      onNotify("Please enter a valid 14-digit ABHA number or handle (e.g. user@abdm).");
      return;
    }
    if (!consentPermissions.shareHis) {
      onNotify("Consent to share consultation data with the hospital HIS is required.");
      return;
    }
    const consent = createConsentArtifact({
      patientId: state.user?.id || "demo-patient",
      abhaId,
      permissions: consentPermissions
    });
    setConsentArtifact(consent);
    setConsentSaved(true);
    onNotify("Consent verified and linked with ABHA.");
  }

  // SOCRATES change helper
  function updateSocrates(key, value) {
    setSocratesAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function toggleAssociation(id) {
    setSocratesAnswers((prev) => {
      const current = prev.associations || [];
      const updated = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
      return { ...prev, associations: updated };
    });
  }

  // Comprehensive Voice Action Engine: ACTUALLY OPERATES UPON THE INPUT
  function handleMediKioskVoiceInput(spokenText) {
    if (!spokenText || !spokenText.trim()) return;
    const raw = spokenText.trim();
    const norm = normalizeSpeech(raw);

    // 1. Check Global Navigation Commands
    if (
      norm.includes("next") || norm.includes("continue") || norm.includes("आगे") ||
      norm.includes("পরবর্তী") || norm.includes("తరువాత") || norm.includes("அடுத்து") || norm.includes("पुढील")
    ) {
      if (sectionIndex === 1) {
        if (!consentSaved) saveConsent();
        setSectionIndex(2);
        setSocratesIndex(0);
      } else if (sectionIndex === 2) {
        if (socratesIndex < activeSocratesQuestions.length) {
          setSocratesIndex((prev) => prev + 1);
        } else {
          setSectionIndex(3);
        }
      } else if (sectionIndex === 3) {
        setSectionIndex(4);
      } else if (sectionIndex === 4) {
        setSectionIndex(5);
      }
      onNotify?.(`Voice Action: Navigating to next step`);
      return;
    }

    if (
      norm.includes("back") || norm.includes("previous") || norm.includes("पीछे") ||
      norm.includes("पिछला") || norm.includes("পূর্ববর্তী") || norm.includes("మునుపటి") ||
      norm.includes("முந்தைய") || norm.includes("मागे")
    ) {
      handleGlobalBack();
      onNotify?.(`Voice Action: Navigating back`);
      return;
    }

    if (
      norm.includes("submit") || norm.includes("send to doctor") || norm.includes("push to doctor") ||
      norm.includes("सबमिट") || norm.includes("डॉक्टर को भेजें") || norm.includes("भेजें")
    ) {
      pushToDoctorDesk();
      onNotify?.(`Voice Action: Submitting clinical summary to doctor`);
      return;
    }

    // 2. Section 1 (Identity & Consent)
    if (sectionIndex === 1) {
      if (
        norm.includes("agree") || norm.includes("consent") || norm.includes("हाँ") ||
        norm.includes("मंजूर") || norm.includes("सहमति") || norm.includes("yes")
      ) {
        setConsentPermissions({ voice: true, ocr: true, shareHis: true, linkAbha: true });
        saveConsent();
        onNotify?.(`Voice Action: DPDP Consent granted & verified via voice`);
        return;
      }
      const digitsOnly = raw.replace(/\D/g, "");
      if (digitsOnly.length === 4) {
        setAadhaarLast4(digitsOnly);
        onNotify?.(`Voice Action: Aadhaar Last 4 set to ${digitsOnly}`);
        return;
      }
      if (digitsOnly.length >= 10 || raw.includes("@abdm") || raw.includes("-")) {
        const cleaned = raw.replace(/\s+/g, "-");
        setAbhaId(cleaned);
        onNotify?.(`Voice Action: ABHA ID set to ${cleaned}`);
        return;
      }
    }

    // 3. Section 2 (Chief Complaint & SOCRATES)
    if (sectionIndex === 2) {
      if (socratesIndex === 0) {
        // Robust Semantic Match for chief complaint
        const matched = matchChiefComplaint(raw, CHIEF_COMPLAINTS);
        if (matched) {
          handleComplaintSelect(matched);
          setSocratesIndex(1);
          onNotify?.(`Recognized: "${raw}". Selected: ${matched.label} (${matched.labelHi || ""})`);
          return;
        }
      } else {
        // Active SOCRATES question
        const currentQ = activeSocratesQuestions[socratesIndex - 1];
        if (currentQ) {
          if (currentQ.type === "scale") {
            const num = parseSpokenNumber(raw);
            if (num !== null && num >= 1 && num <= 10) {
              updateSocrates("severity", num);
              const opt = currentQ.options?.find((o) => o.value === num) || { value: num, label: `${num}/10` };
              speakSeveritySelection(opt);
              onNotify?.(`Voice Action: Pain severity set to ${num}/10`);
              if (socratesIndex < activeSocratesQuestions.length) {
                setSocratesIndex((prev) => prev + 1);
              }
              return;
            }
          } else if (currentQ.type === "chips" && currentQ.options) {
            const matchedOpt = matchOption(raw, currentQ.options);
            if (matchedOpt) {
              updateSocrates(currentQ.key, matchedOpt.id);
              speakOptionSelection(matchedOpt, false);
              onNotify?.(`Voice Action: Selected "${matchedOpt.label}"`);
              if (socratesIndex < activeSocratesQuestions.length) {
                setSocratesIndex((prev) => prev + 1);
              }
              return;
            }
          } else if (currentQ.type === "multi-chips" && currentQ.options) {
            const matchedOpt = matchOption(raw, currentQ.options);
            if (matchedOpt) {
              const isSelected = (socratesAnswers.associations || []).includes(matchedOpt.id);
              toggleAssociation(matchedOpt.id);
              speakOptionSelection(matchedOpt, isSelected);
              onNotify?.(`Voice Action: Toggled "${matchedOpt.label}"`);
              return;
            }
          }
        }
      }
    }

    // 4. Section 3 (Past Medical History)
    if (sectionIndex === 3) {
      const matchedCond = matchOption(raw, PAST_CONDITIONS);
      if (matchedCond) {
        setPastConditions((prev) => [...new Set([...prev.filter((x) => x !== "none"), matchedCond.id])]);
        speakOptionSelection(matchedCond, false);
        onNotify?.(`Voice Action: Added chronic condition: ${matchedCond.label}`);
        return;
      }
    }

    // 5. Section 4 (Lifestyle & Habits)
    if (sectionIndex === 4) {
      if (norm.includes("vegetarian") || norm.includes("शाकाहारी") || norm.includes("veg")) {
        setPersonalHistory((prev) => ({ ...prev, diet: "vegetarian" }));
        onNotify?.(`Voice Action: Diet set to Vegetarian`);
        return;
      }
      if (norm.includes("non-veg") || norm.includes("non veg") || norm.includes("मांसाहारी") || norm.includes("meat") || norm.includes("chicken")) {
        setPersonalHistory((prev) => ({ ...prev, diet: "non_vegetarian" }));
        onNotify?.(`Voice Action: Diet set to Non-Vegetarian`);
        return;
      }
      if (norm.includes("vegan")) {
        setPersonalHistory((prev) => ({ ...prev, diet: "vegan" }));
        onNotify?.(`Voice Action: Diet set to Vegan`);
        return;
      }
      if (norm.includes("no tobacco") || norm.includes("never smoke") || norm.includes("नहीं") || norm.includes("no smoke")) {
        setPersonalHistory((prev) => ({ ...prev, tobacco: "none" }));
        onNotify?.(`Voice Action: Tobacco set to None`);
        return;
      }
      if (norm.includes("smoke") || norm.includes("daily") || norm.includes("सिगरेट") || norm.includes("बीड़ी")) {
        setPersonalHistory((prev) => ({ ...prev, tobacco: "regular" }));
        onNotify?.(`Voice Action: Tobacco set to Daily`);
        return;
      }
      if (norm.includes("no alcohol") || norm.includes("never drink") || norm.includes("शराब नहीं")) {
        setPersonalHistory((prev) => ({ ...prev, alcohol: "none" }));
        onNotify?.(`Voice Action: Alcohol set to None`);
        return;
      }
      if (norm.includes("drink") || norm.includes("social") || norm.includes("कभी-कभार") || norm.includes("शराब")) {
        setPersonalHistory((prev) => ({ ...prev, alcohol: "social" }));
        onNotify?.(`Voice Action: Alcohol set to Social`);
        return;
      }
    }

    // Default Fallback: append spoken text directly into freeTextNotes
    setFreeTextNotes((prev) => (prev ? `${prev} ${raw}`.trim() : raw));
    onNotify?.(`Spoken note recorded: "${raw}"`);
  }

  // Document upload handler (Powered by Gemini Multimodal Vision)
  async function handleFileUpload(file) {
    if (!file) return;
    setIsProcessingDoc(true);
    setDocProgress(15);

    try {
      setDocProgress(35);
      const scanResult = await runGeminiDocumentVision(file, (p) => setDocProgress(Math.max(35, p)));
      setDocProgress(85);

      const ocrText = scanResult.ocrText || "";
      const analysis = extractMedicalEntities(ocrText, state.meds, state.allergies);

      // Merge any Gemini-extracted structured medications into the analysis if not already captured
      if (Array.isArray(scanResult.medications) && scanResult.medications.length > 0) {
        for (const gemMed of scanResult.medications) {
          const medName = gemMed.name || gemMed.medicineName;
          if (medName && !analysis.medications.some((m) => m.name.toLowerCase() === medName.toLowerCase())) {
            analysis.medications.push({
              name: medName,
              dosage: gemMed.dosage || "As prescribed",
              frequency: gemMed.frequency || "1-0-1",
              timing: gemMed.timing || "After meals",
              duration: gemMed.duration || "5 days",
              instructions: gemMed.instructions || "Follow prescription instructions"
            });
          }
        }
      }

      // Merge any Gemini-extracted lab parameters
      if (Array.isArray(scanResult.labResults) && scanResult.labResults.length > 0) {
        for (const lab of scanResult.labResults) {
          if (!analysis.labResults.some((l) => l.test?.toLowerCase() === lab.test?.toLowerCase())) {
            analysis.labResults.push(lab);
            if (["abnormal", "critical", "high", "low"].includes(lab.status)) {
              analysis.abnormalLabs.push(lab);
            }
          }
        }
      }

      // Use Gemini clinical summary if available
      if (scanResult.clinicalSummary && (!analysis.clinicalInterpretation || analysis.clinicalInterpretation.includes("No structured laboratory parameters"))) {
        analysis.clinicalInterpretation = scanResult.clinicalSummary;
      }
      if (scanResult.facilityName && analysis.labName === "Diagnostic Laboratory & Health Services") {
        analysis.labName = scanResult.facilityName;
      }

      const isVision = scanResult.isHandwritingDeciphered || Boolean(scanResult.source?.includes("gemini")) || scanResult.source === "gemini-3.8-flash";
      const newDoc = {
        id: crypto.randomUUID(),
        title: file.name,
        type: scanResult.documentType || (file.type.includes("pdf") ? "PDF Lab / Discharge" : "Prescription / Lab Image"),
        file,
        previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
        ocrText,
        patientSummary: scanResult.patientSummary || null,
        clinicalSummary: scanResult.clinicalSummary || null,
        questionsForDoctor: scanResult.questionsForDoctor || [],
        source: scanResult.source || "gemini-3.5-flash-lite",
        analysis,
        isGeminiVision: isVision,
        uploadedAt: new Date().toISOString()
      };

      setDocuments((prev) => [newDoc, ...prev]);
      setDocProgress(100);
      setIsProcessingDoc(false);
      onNotify(`Digitized ${file.name} successfully ${isVision ? "✨ (Gemini Vision Deciphered)" : ""}.`);
    } catch (err) {
      console.error(err);
      setIsProcessingDoc(false);
      onNotify("OCR read failed. You can still review with manual entity extraction.");
    }
  }

  // Load sample test document (1-click test)
  function loadSampleDocument(sample) {
    setIsProcessingDoc(true);
    setTimeout(() => {
      const analysis = extractMedicalEntities(sample.text, state.meds, state.allergies);
      const isPrescription = sample.type?.toLowerCase().includes("prescription") || sample.id.includes("prescription");
      const newDoc = {
        id: sample.id,
        title: sample.title,
        type: sample.type,
        ocrText: sample.text,
        patientSummary: isPrescription
          ? "This prescription contains medications for blood pressure, blood sugar, and cholesterol control. Follow daily dosing instructions carefully."
          : "Diagnostic laboratory panel shows elevated HbA1c (8.4%) and elevated serum creatinine (1.8 mg/dL) indicating need for diabetic kidney review.",
        clinicalSummary: isPrescription
          ? "Cardiology OPD prescription: Metformin 500mg (1-0-1), Telmisartan 40mg (1-0-0), Atorvastatin 10mg (0-0-1), Pantoprazole 40mg."
          : "Diabetic nephropathy risk indicators present with HbA1c 8.4% and Serum Creatinine 1.8 mg/dL.",
        questionsForDoctor: isPrescription
          ? ["Are there any food interactions with Metformin and Telmisartan?", "When should I repeat my blood sugar check?"]
          : ["Should I consult a nephrologist for the elevated creatinine?", "Should we adjust my glycemic medication?"],
        source: "carepath-clinical-demo",
        analysis,
        uploadedAt: new Date().toISOString(),
        isSample: true,
        isGeminiVision: true
      };
      setDocuments((prev) => [newDoc, ...prev]);
      setIsProcessingDoc(false);
      onNotify(`Loaded ${sample.title}`);
    }, 500);
  }

  // Build Structured Clinical Summary
  const clinicalSummary = useMemo(() => {
    const formattedConditions = pastConditions
      .map((id) => PAST_CONDITIONS.find((c) => c.id === id)?.label || id)
      .filter((x) => x && x !== "None");

    if (otherChronicDiseases.trim()) {
      formattedConditions.push(`Other: ${otherChronicDiseases.trim()}`);
    }

    return {
      chiefComplaint: selectedComplaint ? `${selectedComplaint.label} (${selectedComplaint.labelHi})` : "General Health Consultation",
      socrates: {
        site: socratesAnswers.site || "Not specified",
        onset: socratesAnswers.onset || "Gradual onset",
        character: socratesAnswers.character || "Constant discomfort",
        radiation: socratesAnswers.radiation || "None",
        associations: socratesAnswers.associations.length ? socratesAnswers.associations.join(", ") : "None reported",
        timeCourse: socratesAnswers.time_course || "Continuous",
        exacerbatingRelieving: socratesAnswers.exacerbating_relieving || "No clear postural changes",
        severityScore: `${socratesAnswers.severity}/10`
      },
      pastConditions: formattedConditions.length ? formattedConditions : ["None reported"],
      otherChronicDiseases: otherChronicDiseases.trim() || null,
      allergies: (state.allergies || []).length ? state.allergies.join(", ") : "No known drug allergies reported",
      currentMeds: (state.meds || []).map((m) => `${m.name} (${m.frequency})`),
      personal: {
        diet: personalHistory.diet,
        tobacco: personalHistory.tobacco,
        alcohol: personalHistory.alcohol
      },
      ros: rosAnswers.length ? rosAnswers.map((r) => REVIEW_OF_SYSTEMS.find((x) => x.id === r)?.label || r) : ["No systemic red-flags reported on ROS screen"],
      priorInvestigations: documents.flatMap((d) => d.analysis?.labResults || []),
      abnormalLabs: documents.flatMap((d) => d.analysis?.abnormalLabs || []),
      labInterpretations: documents.map((d) => ({
        labName: d.analysis?.labName || "Clinical Pathology",
        date: d.analysis?.reportDate || d.analysis?.reportDates?.[0] || "Recent",
        interpretation: d.analysis?.clinicalInterpretation
      })).filter((x) => x.interpretation),
      redFlags: triggeredRedFlags,
      triageStatus: triggeredRedFlags.length > 0 ? "EMERGENCY_CODE_RED" : "ROUTINE_OUTPATIENT",
      freeTextNotes
    };
  }, [selectedComplaint, socratesAnswers, pastConditions, otherChronicDiseases, state.allergies, state.meds, personalHistory, rosAnswers, documents, triggeredRedFlags, freeTextNotes]);

  // Push Summary to Doctor Consultation Desk & Backend
  async function pushToDoctorDesk() {
    const fhir = generateFhirR4Bundle({
      patient: {
        id: state.user?.id || "demo-patient",
        name: state.user?.name || "Swyom Sharma",
        abhaId,
        sex: "Male",
        dob: "2005-04-15"
      },
      intakeAnswers: {
        chief_complaint: selectedComplaint?.id,
        chief_complaint_label: selectedComplaint?.label,
        other_chronic_diseases: otherChronicDiseases.trim(),
        ...socratesAnswers
      },
      extractedDocs: documents,
      redFlags: triggeredRedFlags,
      ayushAssessment: null,
      triageStatus: clinicalSummary.triageStatus
    });
    setGeneratedFhirBundle(fhir);

    const payload = {
      id: crypto.randomUUID(),
      patientId: state.user?.id || "demo-patient",
      patientName: state.user?.name || "Swyom Sharma",
      abhaId,
      summary: clinicalSummary,
      fhirBundle: fhir,
      consentArtifact: consentArtifact || createConsentArtifact({
        patientId: state.user?.id || "demo-patient",
        abhaId,
        permissions: consentPermissions
      }),
      triageStatus: clinicalSummary.triageStatus,
      timestamp: new Date().toISOString()
    };

    onUpdateState((prev) => ({
      ...prev,
      medikioskIntake: payload,
      queue: triggeredRedFlags.length > 0 ? {
        ...prev.queue,
        status: "EMERGENCY TRIAGE ACTIVE",
        priorityTokens: [...new Set([...(prev.queue.priorityTokens || []), prev.queue.patientToken])]
      } : prev.queue
    }));

    try {
      await fetch(`${API_BASE}/api/medikiosk/intakes`, {
        method: "POST",
        headers: apiHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn("Backend intake sync fallback (local state preserved):", err);
    }

    setPushedToDoctor(true);
    onNotify(triggeredRedFlags.length > 0 ? "HIGH PRIORITY: Intake routed to Emergency Triage Desk!" : "Clinical summary pushed to Doctor's Consultation Desk.");
  }

  // Clear Session Data (DPDP Privacy Compliance)
  async function clearSessionData() {
    setSelectedComplaint(CHIEF_COMPLAINTS[0]);
    setSocratesAnswers({ site: "", onset: "", character: "", radiation: "", associations: [], time_course: "", exacerbating_relieving: "", severity: 5 });
    setOtherChronicDiseases("");
    setDocuments([]);
    setFreeTextNotes("");
    setTriggeredRedFlags([]);
    setPushedToDoctor(false);
    setConsentSaved(false);

    try {
      await fetch(`${API_BASE}/api/medikiosk/session/clear`, {
        method: "POST",
        headers: apiHeaders({ "Content-Type": "application/json" })
      });
    } catch (err) {
      console.warn("Backend session clear error (local state wiped):", err);
    }

    onNotify("All temporary kiosk session data and transcripts cleared per DPDP Act.");
  }

  function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="medikiosk-container">
      {/* Page Header */}
      <div className="page-intro">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <span className="eyebrow">{globalT("kioskIntakeEyebrow")}</span>
            <h1>{t.intakeTitle}</h1>
            <p>{globalT("kioskContinuousDesc")}</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              className="outline-btn"
              onClick={() => setIsPaused(!isPaused)}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
              {isPaused ? t.resumeInterview : t.pauseInterview}
            </button>
          </div>
        </div>
      </div>

      {/* Active Red-Flag Warning Banner (if triggered) */}
      {triggeredRedFlags.length > 0 && !emergencyDismissed && (
        <div className="medikiosk-emergency-banner">
          <div className="medikiosk-emergency-icon">
            <ShieldAlert size={28} color="#fff" />
          </div>
          <div className="medikiosk-emergency-content">
            <h3>{t.emergencyAlertTitle}</h3>
            <p>
              {triggeredRedFlags[0].title} — {triggeredRedFlags[0].recommendedAction}
            </p>
          </div>
          <button className="medikiosk-emergency-action" onClick={() => pushToDoctorDesk()}>
            {globalT("routeToEmergencyNow")}
          </button>
        </div>
      )}

      {/* Multimodal Voice Input Console (Always accessible across all sections) */}
      <div className="medikiosk-voice-bar" style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "stretch" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <VoiceInputButton
              continuous={true}
              variant="button"
              label={globalT("dictateNotes") || "Tap to Speak"}
              onTranscript={({ full, final, interim }) => {
                const live = final || full || interim;
                if (live) setLiveTranscript(live);
              }}
              onFinalTranscript={(finalText) => {
                setFreeTextNotes((prev) => (prev ? `${prev} ${finalText}`.trim() : finalText));
                setLiveTranscript("");
                handleMediKioskVoiceInput(finalText);
              }}
            />
            <div>
              <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: "var(--navy)" }}>
                🎙️ Voice Input & Symptom Dictation ({currentLangObj.nativeLabel || currentLangObj.label})
              </span>
              <span className="muted" style={{ fontSize: 12 }}>
                Speak in your selected language ({currentLangObj.label}). Your words will be transcribed below in real-time.
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {freeTextNotes && (
              <button
                type="button"
                className="outline-btn"
                onClick={() => setFreeTextNotes("")}
                style={{ fontSize: 11.5, padding: "5px 12px", color: "var(--muted)" }}
                title="Clear spoken notes"
              >
                Clear Notes
              </button>
            )}
            <button
              type="button"
              className="outline-btn"
              onClick={() => speakPrompt(getLocalizedSummaryVoicePrompt(selectedComplaint, socratesAnswers.severity, selectedLanguage))}
              title={t.playAudioPrompt}
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "6px 14px" }}
            >
              <Volume2 size={15} />
              <span>{t.playAudioPrompt || "Read Aloud"}</span>
            </button>
          </div>
        </div>

        {/* Live Editable Voice Input Textarea */}
        <div style={{ position: "relative" }}>
          <textarea
            rows={2}
            value={freeTextNotes}
            onChange={(e) => setFreeTextNotes(e.target.value)}
            placeholder={`Tap "${globalT("dictateNotes") || "Tap to Speak"}" above to speak in ${currentLangObj.label} (${currentLangObj.nativeLabel}), or type your symptoms here...`}
            style={{
              width: "100%",
              borderRadius: 12,
              border: "1.5px solid var(--nav-indigo-border, #c7d2fe)",
              background: "#ffffff",
              padding: "10px 14px",
              fontSize: 13.5,
              color: "var(--ink)",
              lineHeight: 1.5,
              boxSizing: "border-box",
              resize: "vertical"
            }}
          />
          {liveTranscript && (
            <div style={{
              position: "absolute",
              bottom: 8,
              left: 12,
              right: 12,
              background: "rgba(254, 242, 242, 0.96)",
              border: "1px solid #fca5a5",
              color: "#991b1b",
              borderRadius: 6,
              padding: "4px 10px",
              fontSize: 12,
              fontStyle: "italic",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
            }}>
              <span className="voice-dot-live" style={{ width: 6, height: 6 }} />
              <span style={{ fontWeight: 600 }}>Transcribing:</span>
              <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{liveTranscript}</span>
            </div>
          )}
        </div>
      </div>

      {/* SECTION-WISE QUESTIONNAIRE NAVIGATION HEADER */}
      <div className="questionnaire-nav-header">
        <div className="questionnaire-nav-top">
          <button
            type="button"
            className="questionnaire-nav-back-btn"
            onClick={handleGlobalBack}
            disabled={sectionIndex === 1 && socratesIndex === 0 && historySubIndex === 0 && lifestyleSubIndex === 0}
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <div className="questionnaire-nav-title-box">
            <span className="questionnaire-section-tag">{SECTIONS[sectionIndex - 1].tag}</span>
            <h2>{SECTIONS[sectionIndex - 1].name}</h2>
          </div>
          <span className="questionnaire-step-counter">
            Step {sectionIndex} of 5
          </span>
        </div>

        {/* Animated Progress Bar */}
        <div className="questionnaire-progress-track">
          <div
            className="questionnaire-progress-fill"
            style={{ width: `${(sectionIndex / 5) * 100}%` }}
          />
        </div>

        {/* Section Navigation Pills */}
        <div className="questionnaire-section-pills">
          {SECTIONS.map((sec) => {
            const isActive = sectionIndex === sec.id;
            const isDone = sectionIndex > sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                className={`questionnaire-pill-item ${isActive ? "active" : ""} ${isDone ? "completed" : ""}`}
                onClick={() => {
                  setSectionIndex(sec.id);
                  if (sec.id === 2) setSocratesIndex(0);
                  if (sec.id === 3) setHistorySubIndex(0);
                  if (sec.id === 4) setLifestyleSubIndex(0);
                }}
              >
                <span className="questionnaire-pill-dot" />
                <span>{sec.id}. {sec.name}</span>
                {isDone && <Check size={12} style={{ marginLeft: "auto" }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 1: PERSONAL INFORMATION & DPDP CONSENT */}
      {/* ========================================================================= */}
      {sectionIndex === 1 && (
        <div className="questionnaire-screen-card">
          <div className="questionnaire-question-meta">
            <div>
              <span className="questionnaire-substep-badge"><ShieldCheck size={14} /> Page 1 of 5 · Identity</span>
              <h3 className="questionnaire-question-title">{globalT("sec1Title") || "Patient Identification & DPDP Consent"}</h3>
              <p className="questionnaire-question-subtitle">{globalT("kioskIdentitySubtitle") || "Verify your ABHA Health ID and authorize DPDP-compliant local clinical processing."}</p>
            </div>
            <div className="score-badge" style={{ fontSize: 12.5, background: abhaIsValid ? "#e8f4ef" : "#fee2e2", color: abhaIsValid ? "var(--green)" : "#b91c1c", padding: "6px 12px", borderRadius: 12 }}>
              <ShieldCheck size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
              {abhaIsValid ? "ABDM Format Verified" : "Enter valid ABHA (14-digit or @abdm)"}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <label className="field">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span>{globalT("abhaIdLabel")}</span>
                  <VoiceInputButton
                    variant="pill"
                    label="Speak ABHA"
                    onFinalTranscript={(text) => {
                      const cleaned = text.replace(/\s+/g, "-");
                      setAbhaId(cleaned);
                    }}
                  />
                </div>
                <input
                  value={abhaId}
                  onChange={(e) => setAbhaId(e.target.value)}
                  placeholder="e.g. 91-4455-8822-1923 or swyom@abdm"
                />
                <small className="muted">{globalT("abhaIdHelpText")}</small>
              </label>
            </div>
            <div>
              <label className="field">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span>{globalT("aadhaarLast4Label")}</span>
                  <VoiceInputButton
                    variant="pill"
                    label="Speak Last 4"
                    onFinalTranscript={(text) => {
                      const digits = text.replace(/\D/g, "").slice(-4);
                      if (digits) setAadhaarLast4(digits);
                    }}
                  />
                </div>
                <input
                  maxLength={4}
                  value={aadhaarLast4}
                  onChange={(e) => setAadhaarLast4(e.target.value)}
                  placeholder="e.g. 4321"
                />
                <small className="muted">{globalT("aadhaarLast4HelpText")}</small>
              </label>
            </div>
          </div>

          <div className="field">
            <span>{globalT("dpdpFrameworkTitle")}</span>
            <div className="check-list">
              <label className="check-item">
                <input
                  type="checkbox"
                  checked={consentPermissions.voice}
                  onChange={(e) => setConsentPermissions({ ...consentPermissions, voice: e.target.checked })}
                />
                <div>
                  <strong>{globalT("voiceConsentTitle")}</strong>
                  <span className="muted" style={{ display: "block" }}>{globalT("voiceConsentDesc")}</span>
                </div>
              </label>
              <label className="check-item">
                <input
                  type="checkbox"
                  checked={consentPermissions.ocr}
                  onChange={(e) => setConsentPermissions({ ...consentPermissions, ocr: e.target.checked })}
                />
                <div>
                  <strong>{globalT("ocrConsentTitle")}</strong>
                  <span className="muted" style={{ display: "block" }}>{globalT("ocrConsentDesc")}</span>
                </div>
              </label>
              <label className="check-item">
                <input
                  type="checkbox"
                  checked={consentPermissions.shareHis}
                  onChange={(e) => setConsentPermissions({ ...consentPermissions, shareHis: e.target.checked })}
                />
                <div>
                  <strong>{globalT("hisShareConsentTitle")}</strong>
                  <span className="muted" style={{ display: "block" }}>{globalT("hisShareConsentDesc")}</span>
                </div>
              </label>
              <label className="check-item">
                <input
                  type="checkbox"
                  checked={consentPermissions.linkAbha}
                  onChange={(e) => setConsentPermissions({ ...consentPermissions, linkAbha: e.target.checked })}
                />
                <div>
                  <strong>{globalT("phrLinkConsentTitle")}</strong>
                  <span className="muted" style={{ display: "block" }}>{globalT("phrLinkConsentDesc")}</span>
                </div>
              </label>
            </div>
          </div>

          <div className="questionnaire-footer-nav">
            <button
              type="button"
              className="secondary-btn"
              onClick={saveConsent}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <Check size={16} />
              <span>{consentSaved ? "Consent Verified & Linked" : "Save / Update Consent"}</span>
            </button>
            <button
              type="button"
              className="questionnaire-btn-next"
              onClick={() => {
                if (!consentSaved) saveConsent();
                setSectionIndex(2);
                setSocratesIndex(0);
              }}
            >
              <span>
                {language === "hi" ? "लक्षणों पर आगे बढ़ें" :
                 language === "bn" ? "লক্ষণগুলিতে এগিয়ে যান" :
                 language === "mr" ? "लक्षणांकडे पुढे जा" :
                 language === "te" ? "లక్షణాలకు కొనసాగించండి" :
                 language === "ta" ? "அறிகுறிகளுக்குத் தொடரவும்" :
                 "Continue to Symptoms"}
              </span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 2: SYMPTOMS & CHIEF COMPLAINT (DYNAMIC SOCRATES) */}
      {/* ========================================================================= */}
      {sectionIndex === 2 && (
        <>
          {socratesIndex === 0 ? (
            /* Sub-step 0: Select Chief Complaint */
            <div className="questionnaire-screen-card">
              <div className="questionnaire-question-meta">
                <div>
                  <span className="questionnaire-substep-badge">
                    <Activity size={14} />{" "}
                    {globalT("page2Substep") ||
                      (language === "hi" ? "पृष्ठ 2 / 5 · मुख्य समस्या" :
                       language === "bn" ? "পৃষ্ঠা ২ / ৫ · প্রধান সমস্যা" :
                       language === "mr" ? "पान २ / ५ · मुख्य समस्या" :
                       language === "te" ? "పేజీ 2 / 5 · ప్రధాన సమస్య" :
                       language === "ta" ? "பக்கம் 2 / 5 · முதன்மை குறைபாடு" :
                       "Page 2 of 5 · Primary Concern")}
                  </span>
                  <h3 className="questionnaire-question-title">
                    {globalT("primaryConcernTitle") ||
                      (language === "hi" ? "आज आपकी मुख्य स्वास्थ्य समस्या क्या है?" :
                       language === "bn" ? "আজ আপনার প্রধান স্বাস্থ্য সমস্যা কী?" :
                       language === "mr" ? "आज तुमची मुख्य आरोग्य समस्या कोणती आहे?" :
                       language === "te" ? "ఈరోజు మీ ప్రధాన ఆరోగ్య సమస్య ఏమిటి?" :
                       language === "ta" ? "இன்று உங்கள் முதன்மையான உடல்நலக் குறைபாடு என்ன?" :
                       "What is your primary health concern today?")}
                  </h3>
                  <p className="questionnaire-question-subtitle">
                    {globalT("chiefComplaintSubtitle") ||
                      (language === "hi" ? "लक्षण अन्वेषण शुरू करने के लिए अपनी मुख्य समस्या चुनें। आगे बढ़ने के लिए किसी भी कार्ड को दबाएं।" :
                       language === "bn" ? "লক্ষণ অনুসন্ধান শুরু করতে আপনার প্রধান লক্ষণ নির্বাচন করুন। পরবর্তী ধাপে যেতে যেকোনো কার্ড স্পর্শ করুন।" :
                       language === "mr" ? "लक्षण तपासणी सुरू करण्यासाठी तुमचे मुख्य लक्षण निवडा. पुढे जाण्यासाठी कोणत्याही कार्डवर टॅप करा." :
                       language === "te" ? "లక్షణాల అన్వేషణను ప్రారంభించడానికి మీ ప్రధాన లక్షణాన్ని ఎంచుకోండి. ముందుకు సాగడానికి ఏదైనా కార్డుపై నొక్కండి." :
                       language === "ta" ? "அறிகுறிகளை ஆராய உங்கள் முதன்மை அறிகுறியைத் தேர்ந்தெடுக்கவும். தொடர ஏதேனும் அட்டையைத் தட்டவும்." :
                       "Select your chief symptom to begin the clinical exploration protocol. Tap any card to auto-advance.")}
                  </p>
                </div>
                {selectedComplaint && (
                  <span className="score-badge" style={{ background: "#f0fdf4", color: "var(--green-dark)", fontWeight: 700 }}>
                    {globalT("selectedPrefix") || (language === "hi" ? "चुना गया:" : language === "bn" ? "নির্বাচিত:" : language === "mr" ? "निवडले:" : language === "te" ? "ఎంచుకున్నది:" : language === "ta" ? "தேர்ந்தெடுக்கப்பட்டது:" : "Selected:")} {getLocalizedComplaintLabel(selectedComplaint, language)}
                  </span>
                )}
              </div>

              {/* Voice Symptom Input Banner */}
              <div style={{
                background: "#f0fdf4",
                border: "1.5px solid #bbf7d0",
                borderRadius: 14,
                padding: "14px 18px",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <VoiceInputButton
                    variant="button"
                    label={globalT("dictateNotes") || "Tap to Speak"}
                    onFinalTranscript={(spokenText) => {
                      handleMediKioskVoiceInput(spokenText);
                    }}
                  />
                  <div>
                    <strong style={{ fontSize: 13.5, color: "#166534", display: "block" }}>
                      {globalT("speakSymptomsNaturally", { language: currentLangObj.nativeLabel || currentLangObj.label }) ||
                        `Speak your symptoms naturally in ${currentLangObj.label} (${currentLangObj.nativeLabel})`}
                    </strong>
                    <span style={{ fontSize: 12, color: "#15803d" }}>
                      Say e.g. "Chest pain", "बुखार और खांसी", "বুকের ব্যথা", "डोकेदुखी", "గుండె నొప్పి", "தலைவலி"...
                    </span>
                  </div>
                </div>
              </div>

              <div className="medikiosk-chips-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                {CHIEF_COMPLAINTS.map((item) => {
                  const isSelected = selectedComplaint?.id === item.id;
                  const primaryText = getLocalizedComplaintLabel(item, language);
                  const secondaryText = getSecondaryComplaintLabel(item, language);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`medikiosk-touch-chip ${isSelected ? "selected" : ""}`}
                      onClick={() => handleComplaintSelect(item)}
                      style={{ minHeight: 64, padding: "12px 14px" }}
                    >
                      <div className="medikiosk-chip-icon">
                        {item.id === "chest_pain" && <HeartPulse size={20} />}
                        {item.id === "fever" && <Thermometer size={20} />}
                        {item.id === "cough_breathlessness" && <Wind size={20} />}
                        {item.id === "abdominal_pain" && <Activity size={20} />}
                        {item.id === "headache" && <Brain size={20} />}
                        {item.id === "joint_pain" && <Activity size={20} />}
                        {item.id === "skin_rash" && <AlertCircle size={20} />}
                        {item.id === "diabetes_followup" && <Pill size={20} />}
                        {item.id === "hypertension_followup" && <HeartPulse size={20} />}
                        {item.id === "weakness_fatigue" && <Clock size={20} />}
                      </div>
                      <div className="medikiosk-chip-labels">
                        <strong style={{ fontSize: 14 }}>{primaryText}</strong>
                        <span style={{ fontSize: 12 }}>{secondaryText}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="questionnaire-footer-nav">
                <span className="auto-advance-hint">
                  <i>ℹ</i> {globalT("selectPrimarySymptomHint") ||
                    (language === "hi" ? "ऊपर अपना मुख्य लक्षण चुनें, फिर आगे बढ़ने के लिए जांचें पर क्लिक करें" :
                     "Select your primary symptom above, then click Explore to continue")}
                </span>
                {selectedComplaint && (
                  <button
                    type="button"
                    className="questionnaire-btn-next"
                    onClick={() => setSocratesIndex(1)}
                  >
                    <span>
                      {language === "hi" ? `${getLocalizedComplaintLabel(selectedComplaint, language)} की जांच करें` :
                       language === "bn" ? `${getLocalizedComplaintLabel(selectedComplaint, language)} অনুসন্ধান করুন` :
                       language === "mr" ? `${getLocalizedComplaintLabel(selectedComplaint, language)} तपासा` :
                       language === "te" ? `${getLocalizedComplaintLabel(selectedComplaint, language)} అన్వేషించండి` :
                       language === "ta" ? `${getLocalizedComplaintLabel(selectedComplaint, language)} ஆராயுங்கள்` :
                       `Explore ${selectedComplaint.label}`}
                    </span>
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Sub-steps 1..N: Step-by-Step SOCRATES Question */
            (() => {
              const currentQ = activeSocratesQuestions[socratesIndex - 1];
              if (!currentQ) return null;

              return (
                <div className="questionnaire-screen-card">
                  <div className="questionnaire-question-meta">
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span className="questionnaire-substep-badge">
                          {language === "hi" ? `प्रश्न ${socratesIndex} / ${activeSocratesQuestions.length}` :
                           language === "bn" ? `প্রশ্ন ${socratesIndex} / ${activeSocratesQuestions.length}` :
                           language === "mr" ? `प्रश्न ${socratesIndex} / ${activeSocratesQuestions.length}` :
                           language === "te" ? `ప్రశ్న ${socratesIndex} / ${activeSocratesQuestions.length}` :
                           language === "ta" ? `கேள்வி ${socratesIndex} / ${activeSocratesQuestions.length}` :
                           `Question ${socratesIndex} of ${activeSocratesQuestions.length}`}
                        </span>
                        <span style={{ fontSize: 12, color: "var(--ai-violet)", fontWeight: 700 }}>
                          Protocol: {getLocalizedComplaintLabel(selectedComplaint, language)}
                        </span>
                      </div>
                      <h3 className="questionnaire-question-title">
                        {language !== "en" && currentQ.labelHi ? currentQ.labelHi : currentQ.label}
                      </h3>
                      {language !== "en" && currentQ.labelHi ? (
                        <p className="questionnaire-question-subtitle">{currentQ.label}</p>
                      ) : (
                        currentQ.labelHi && <p className="questionnaire-question-subtitle">{currentQ.labelHi}</p>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <VoiceInputButton
                        variant="button"
                        label={globalT("dictateNotes") || "Tap to Speak"}
                        onFinalTranscript={(text) => handleMediKioskVoiceInput(text)}
                      />
                      <button
                        type="button"
                        className="outline-btn"
                        onClick={() => speakPrompt(getLocalizedQuestionVoicePrompt(currentQ, selectedLanguage))}
                        style={{ fontSize: 12, padding: "6px 12px" }}
                      >
                        <Volume2 size={15} /> Listen
                      </button>
                    </div>
                  </div>

                  {/* Question body based on currentQ.type */}
                  {currentQ.type === "chips" && (
                    <div className="questionnaire-options-grid-2col">
                      {currentQ.options.map((opt) => {
                        const isSelected = socratesAnswers[currentQ.key] === opt.id;
                        return (
                          <div
                            key={opt.id}
                            className={`questionnaire-option-card ${isSelected ? "selected" : ""}`}
                            onClick={() => {
                              updateSocrates(currentQ.key, opt.id);
                              speakOptionSelection(opt, false);
                            }}
                          >
                            <div className="option-card-content">
                              <span className="option-card-title">
                                {language !== "en" && opt.labelHi ? opt.labelHi : opt.label}
                              </span>
                              <span className="option-card-desc">
                                {language !== "en" && opt.labelHi ? opt.label : opt.labelHi}
                              </span>
                            </div>
                            <div className="option-radio-indicator">
                              {isSelected && <Check size={14} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {currentQ.type === "multi-chips" && (
                    <div className="questionnaire-options-grid-2col">
                      {currentQ.options.map((opt) => {
                        const isSelected = (socratesAnswers.associations || []).includes(opt.id);
                        return (
                          <div
                            key={opt.id}
                            className={`questionnaire-option-card ${isSelected ? "selected" : ""}`}
                            onClick={() => {
                              toggleAssociation(opt.id);
                              speakOptionSelection(opt, isSelected);
                            }}
                          >
                            <div className="option-card-content">
                              <span className="option-card-title">
                                {language !== "en" && opt.labelHi ? opt.labelHi : opt.label}
                              </span>
                              <span className="option-card-desc">
                                {language !== "en" && opt.labelHi ? opt.label : opt.labelHi}
                              </span>
                            </div>
                            <div className="option-radio-indicator">
                              {isSelected && <Check size={14} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {currentQ.type === "scale" && (
                    <div>
                      <div className="medikiosk-severity-row">
                        {currentQ.options.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            className={`medikiosk-severity-btn ${socratesAnswers.severity === opt.value ? "active" : ""}`}
                            onClick={() => {
                              updateSocrates("severity", opt.value);
                              speakSeveritySelection(opt);
                            }}
                          >
                            <strong>{opt.value} / 10</strong>
                            <span>{opt.label}</span>
                          </button>
                        ))}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14 }}>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={socratesAnswers.severity}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            updateSocrates("severity", val);
                            const opt = currentQ.options?.find((o) => o.value === val) || { value: val, label: `${val}/10` };
                            speakSeveritySelection(opt);
                          }}
                          style={{ flex: 1, accentColor: socratesAnswers.severity >= 7 ? "#dc2626" : "var(--green)" }}
                        />
                        <span style={{ fontWeight: 800, fontSize: 18, minWidth: 50, textAlign: "right", color: socratesAnswers.severity >= 7 ? "#dc2626" : "var(--navy)" }}>
                          {socratesAnswers.severity} / 10
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="questionnaire-footer-nav">
                    <button
                      type="button"
                      className="questionnaire-nav-back-btn"
                      onClick={() => setSocratesIndex((prev) => prev - 1)}
                    >
                      <ChevronLeft size={16} /> Previous Question
                    </button>
                    <span className="auto-advance-hint">
                      {currentQ.type === "chips"
                        ? `${globalT("selectedPrefix") || (language === "hi" ? "चुना गया:" : "Selected:")} ${
                            (() => {
                              const opt = currentQ.options.find((o) => o.id === socratesAnswers[currentQ.key]);
                              if (!opt) return language === "hi" ? "कोई नहीं" : "None";
                              return language !== "en" && opt.labelHi ? opt.labelHi : opt.label;
                            })()
                          }`
                        : `${globalT("selectedPrefix") || (language === "hi" ? "चुना गया:" : "Selected:")} ${
                            currentQ.type === "scale"
                              ? `${socratesAnswers.severity}/10 ${language === "hi" ? "तीव्रता" : "severity"}`
                              : `${(socratesAnswers.associations || []).length} ${language === "hi" ? "संबंधित लक्षण" : "associated symptoms"}`
                          }`}
                    </span>
                    <button
                      type="button"
                      className="questionnaire-btn-next"
                      onClick={() => {
                        if (socratesIndex < activeSocratesQuestions.length) {
                          setSocratesIndex((prev) => prev + 1);
                        } else {
                          setSectionIndex(3);
                          setHistorySubIndex(0);
                        }
                      }}
                    >
                      <span>{socratesIndex < activeSocratesQuestions.length ? "Next Question" : "Continue to Medical History"}</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })()
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* PAGE 3: MEDICAL HISTORY & CHRONIC CONDITIONS */}
      {/* ========================================================================= */}
      {sectionIndex === 3 && (
        <div className="questionnaire-screen-card">
          <div className="questionnaire-question-meta">
            <div>
              <span className="questionnaire-substep-badge"><FileText size={14} /> Page 3 of 5 · Medical History</span>
              <h3 className="questionnaire-question-title">{globalT("sec3Title") || "Past Medical History & Chronic Conditions"}</h3>
              <p className="questionnaire-question-subtitle">{globalT("medicalHistorySubtitle") || "Select any previously diagnosed chronic illnesses or active prescriptions."}</p>
            </div>
            <VoiceInputButton
              variant="button"
              label="Speak Conditions"
              onFinalTranscript={(text) => handleMediKioskVoiceInput(text)}
            />
          </div>

          {/* Standard Chronic Conditions Chips */}
          <div>
            <label style={{ fontSize: 13.5, fontWeight: 700, color: "#2d3c37", display: "block", marginBottom: 10 }}>
              Diagnosed Chronic Diseases
            </label>
            <div className="medikiosk-chips-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
              {PAST_CONDITIONS.map((cond) => {
                const isSelected = pastConditions.includes(cond.id);
                return (
                  <button
                    key={cond.id}
                    type="button"
                    className={`medikiosk-touch-chip ${isSelected ? "selected" : ""}`}
                    onClick={() => {
                      if (cond.id === "none") {
                        setPastConditions(["none"]);
                        speakOptionSelection(cond, false);
                      } else {
                        const isAlreadySelected = pastConditions.includes(cond.id);
                        setPastConditions((prev) => {
                          const withoutNone = prev.filter((x) => x !== "none");
                          return withoutNone.includes(cond.id)
                            ? withoutNone.filter((x) => x !== cond.id)
                            : [...withoutNone, cond.id];
                        });
                        speakOptionSelection(cond, isAlreadySelected);
                      }
                    }}
                    style={{ minHeight: 52 }}
                  >
                    <div className="medikiosk-chip-labels">
                      <strong>{language !== "en" && cond.labelHi ? cond.labelHi : cond.label}</strong>
                      <span>{language !== "en" && cond.labelHi ? cond.label : cond.labelHi}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Free-Text Chronic Diseases Input (Requirement 4) */}
          <div style={{ marginTop: 8 }}>
            <label className="field">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 13.5, color: "#1f2937" }}>
                  Other chronic diseases or conditions not listed above (optional)
                </span>
                <VoiceInputButton
                  variant="pill"
                  onFinalTranscript={(text) => {
                    setOtherChronicDiseases((prev) => (prev ? `${prev}, ${text}` : text));
                  }}
                />
              </div>
              <input
                type="text"
                value={otherChronicDiseases}
                onChange={(e) => setOtherChronicDiseases(e.target.value)}
                placeholder="e.g. Hypothyroidism, Chronic Kidney Disease Stage 2, Bronchial Asthma, Vitiligo"
                style={{ marginTop: 6 }}
              />
              <small className="muted">
                Enter any previously diagnosed medical conditions or rare disorders to append to your clinical record and doctor consultation note.
              </small>
            </label>
          </div>

          {/* Existing Allergies and Medications Review */}
          <div style={{ background: "#f8fafc", padding: "14px 18px", borderRadius: 14, border: "1px solid var(--line)" }}>
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "var(--muted-2)", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>
              Current Profile Records Review
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
              <div>
                <strong style={{ fontSize: 12.5, color: "var(--navy)" }}>Known Allergies: </strong>
                <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{(state.allergies || []).join(", ") || "No drug allergies recorded"}</span>
              </div>
              <div>
                <strong style={{ fontSize: 12.5, color: "var(--navy)" }}>Active Prescriptions: </strong>
                <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{(state.meds || []).map((m) => m.name).join(", ") || "No active prescriptions"}</span>
              </div>
            </div>
          </div>

          <div className="questionnaire-footer-nav">
            <button
              type="button"
              className="questionnaire-nav-back-btn"
              onClick={() => {
                setSectionIndex(2);
                setSocratesIndex(activeSocratesQuestions.length);
              }}
            >
              <ChevronLeft size={16} /> {language === "hi" ? "वापस लक्षणों पर जाएं" :
                                         language === "bn" ? "লক্ষণগুলিতে ফিরে যান" :
                                         language === "mr" ? "लक्षणांवर परत जा" :
                                         language === "te" ? "లక్షణాలకు తిరిగి వెళ్లండి" :
                                         language === "ta" ? "அறிகுறிகளுக்குத் திரும்புங்கள்" :
                                         "Back to Symptoms"}
            </button>
            <button
              type="button"
              className="questionnaire-btn-next"
              onClick={() => {
                setSectionIndex(4);
                setLifestyleSubIndex(0);
              }}
            >
              <span>Continue to Lifestyle & Reports</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 4: LIFESTYLE & DIAGNOSTIC LAB REPORTS */}
      {/* ========================================================================= */}
      {sectionIndex === 4 && (
        <div className="questionnaire-screen-card">
          <div className="questionnaire-question-meta">
            <div>
              <span className="questionnaire-substep-badge"><Thermometer size={14} /> Page 4 of 5 · Lifestyle & Reports</span>
              <h3 className="questionnaire-question-title">{globalT("sec4Title") || "Lifestyle Habits & Prior Lab Reports"}</h3>
              <p className="questionnaire-question-subtitle">{globalT("ocrSectionSubtitle") || "Review your daily health habits and digitize prior medical prescriptions via OCR."}</p>
            </div>
            <VoiceInputButton
              variant="button"
              label="Speak Habits"
              onFinalTranscript={(text) => handleMediKioskVoiceInput(text)}
            />
          </div>

          {/* Personal Habits Card Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            <label className="field">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontWeight: 700 }}>{globalT("dietaryPatternLabel")}</span>
                <VoiceInputButton
                  variant="pill"
                  onFinalTranscript={(text) => handleMediKioskVoiceInput(text)}
                />
              </div>
              <select
                value={personalHistory.diet}
                onChange={(e) => setPersonalHistory({ ...personalHistory, diet: e.target.value })}
                style={{ padding: "10px 12px", borderRadius: 10 }}
              >
                <option value="vegetarian">{globalT("dietVegetarian")}</option>
                <option value="non_vegetarian">{globalT("dietNonVegetarian")}</option>
                <option value="vegan">{globalT("dietVegan")}</option>
                <option value="lacto_ovo">{globalT("dietLactoOvo")}</option>
              </select>
            </label>
            <label className="field">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontWeight: 700 }}>{globalT("tobaccoUsageLabel")}</span>
                <VoiceInputButton
                  variant="pill"
                  onFinalTranscript={(text) => handleMediKioskVoiceInput(text)}
                />
              </div>
              <select
                value={personalHistory.tobacco}
                onChange={(e) => setPersonalHistory({ ...personalHistory, tobacco: e.target.value })}
                style={{ padding: "10px 12px", borderRadius: 10 }}
              >
                <option value="none">{globalT("tobaccoNever")}</option>
                <option value="former">{globalT("tobaccoFormer")}</option>
                <option value="occasional">{globalT("tobaccoOccasional")}</option>
                <option value="regular">{globalT("tobaccoDaily")}</option>
              </select>
            </label>
            <label className="field">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontWeight: 700 }}>{globalT("alcoholUsageLabel")}</span>
                <VoiceInputButton
                  variant="pill"
                  onFinalTranscript={(text) => handleMediKioskVoiceInput(text)}
                />
              </div>
              <select
                value={personalHistory.alcohol}
                onChange={(e) => setPersonalHistory({ ...personalHistory, alcohol: e.target.value })}
                style={{ padding: "10px 12px", borderRadius: 10 }}
              >
                <option value="none">{globalT("alcoholNone")}</option>
                <option value="social">{globalT("alcoholSocial")}</option>
                <option value="moderate">{globalT("alcoholModerate")}</option>
                <option value="regular">{globalT("alcoholRegular")}</option>
              </select>
            </label>
          </div>

          {/* Free-Text Additional Comments with Voice Dictation */}
          <div>
            <label className="field">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontWeight: 700 }}>{globalT("additionalCommentsLabel")}</span>
                <VoiceInputButton
                  continuous={true}
                  variant="button"
                  onFinalTranscript={(text) => {
                    setFreeTextNotes((prev) => (prev ? `${prev} ${text}`.trim() : text));
                  }}
                />
              </div>
              <textarea
                rows={3}
                value={freeTextNotes}
                onChange={(e) => setFreeTextNotes(e.target.value)}
                placeholder={globalT("additionalCommentsPlaceholder") || "Describe any other symptoms or notes in your own words..."}
              />
            </label>
          </div>

          {/* Document Intelligence OCR Section */}
          <div style={{ borderTop: "1px solid var(--line)", paddingTop: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
              <div>
                <strong style={{ fontSize: 14.5, color: "var(--navy)" }}>Diagnostic Document Intelligence</strong>
                <span className="muted" style={{ display: "block", fontSize: 11.5 }}>Scan, upload or load sample lab reports for automated extraction.</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="outline-btn"
                  onClick={() => loadSampleDocument(SAMPLE_DOCUMENTS[0])}
                  style={{ fontSize: 11 }}
                  title="Loads demo diabetic lab report"
                >
                  + Demo Lab Report
                </button>
                <button
                  type="button"
                  className="outline-btn"
                  onClick={() => loadSampleDocument(SAMPLE_DOCUMENTS[1])}
                  style={{ fontSize: 11 }}
                  title="Loads demo cardiology prescription"
                >
                  + Demo Prescription
                </button>
              </div>
            </div>

            {/* Upload Drop Zone */}
            <div
              className="upload-zone"
              onClick={() => fileInputRef.current?.click()}
              style={{ padding: "20px 16px", marginBottom: 16 }}
            >
              <Camera size={28} />
              <strong>{globalT("scanOrUploadPrompt")}</strong>
              <span style={{ color: "#047857", fontWeight: 600 }}>✨ Powered by Gemini 3.8 Flash Multimodal Vision: Reads handwritten doctor prescriptions, clinic slips & lab reports.</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => handleFileUpload(e.target.files?.[0])}
              />
            </div>

            {/* Processing Progress Bar */}
            {isProcessingDoc && (
              <div style={{ margin: "14px 0", background: "#f5f8f6", padding: 12, borderRadius: 12, border: "1px solid var(--line)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                  <strong>{globalT("ocrRunningStatus")}</strong>
                  <span>{docProgress}%</span>
                </div>
                <div className="progress-track">
                  <div style={{ width: `${docProgress}%` }} />
                </div>
              </div>
            )}

            {/* Digitized Documents List */}
            {documents.length > 0 && (
              <div className="medikiosk-doc-grid">
                {documents.map((doc) => {
                  const labName = doc.analysis?.labName || "Diagnostic Pathology Laboratory";
                  const reportDate = doc.analysis?.reportDate || doc.analysis?.reportDates?.[0] || new Date(doc.uploadedAt).toLocaleDateString();
                  const abnormalCount = doc.analysis?.abnormalLabs?.length || 0;

                  return (
                    <div key={doc.id} className="medikiosk-doc-card">
                      <div className="medikiosk-doc-head">
                        <div>
                          <strong>{doc.title}</strong>
                          <span className="muted" style={{ display: "block", fontSize: 11 }}>
                            {labName} · Dated: {reportDate}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                          {doc.isGeminiVision && (
                            <span className="medikiosk-abnormal-badge" style={{ background: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0" }}>
                              ✨ Gemini Vision (Handwriting Deciphered)
                            </span>
                          )}
                          {doc.analysis?.medications?.length > 0 && (
                            <span className="medikiosk-abnormal-badge" style={{ background: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe" }}>
                              💊 {doc.analysis.medications.length} Medicines Found
                            </span>
                          )}
                          <span className={`medikiosk-abnormal-badge ${abnormalCount > 0 ? "critical" : "normal"}`}>
                            {abnormalCount > 0 ? `${abnormalCount} Abnormal Parameters` : "All Values Normal"}
                          </span>
                        </div>
                      </div>

                      {/* 1. Patient Friendly Explanation */}
                      {doc.patientSummary && (
                        <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 10, padding: "10px 14px", margin: "10px 0" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#065f46", fontWeight: 700, fontSize: 12.5, marginBottom: 4 }}>
                            <Sparkles size={14} /> Patient Summary (What Your Doctor Wrote):
                          </div>
                          <p style={{ margin: 0, fontSize: 12.5, color: "#047857", lineHeight: 1.5 }}>
                            {doc.patientSummary}
                          </p>
                        </div>
                      )}

                      {/* 2. Clinical Interpretation */}
                      {doc.analysis?.clinicalInterpretation && !doc.patientSummary && (
                        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "8px 12px", margin: "10px 0" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#1e40af", fontWeight: 700, fontSize: 12, marginBottom: 2 }}>
                            <Sparkles size={14} /> Automated Clinical Interpretation:
                          </div>
                          <p style={{ margin: 0, fontSize: 12, color: "#1e3a8a", lineHeight: 1.4 }}>
                            {doc.analysis.clinicalInterpretation}
                          </p>
                        </div>
                      )}

                      {/* 3. Prescribed Medications Table */}
                      {doc.analysis?.medications?.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
                            <strong style={{ fontSize: 13, color: "var(--navy)", display: "flex", alignItems: "center", gap: 6 }}>
                              <Pill size={15} color="#059669" /> Prescribed Medications ({doc.analysis.medications.length})
                            </strong>
                            <button
                              type="button"
                              className="outline-btn"
                              style={{ fontSize: 11, padding: "3px 8px", borderColor: "#059669", color: "#065f46", background: "#ecfdf5", fontWeight: 600 }}
                              onClick={() => addMedsToSchedule(doc.analysis.medications)}
                            >
                              + Add to Daily Schedule
                            </button>
                          </div>
                          <table className="medikiosk-lab-table">
                            <thead>
                              <tr>
                                <th>Medicine</th>
                                <th>Dosage</th>
                                <th>Schedule</th>
                                <th>Instructions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {doc.analysis.medications.map((m, idx) => (
                                <tr key={idx}>
                                  <td><strong>{m.name || m.medicineName}</strong></td>
                                  <td>{m.dosage || "—"}</td>
                                  <td><span className="medikiosk-abnormal-badge normal">{m.frequency || "1-0-1"}</span></td>
                                  <td><small>{[m.timing, m.instructions, m.duration].filter(Boolean).join(" · ") || "Follow doctor prescription"}</small></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* 4. Laboratory Results Table */}
                      {doc.analysis?.labResults?.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                          <strong style={{ fontSize: 13, color: "var(--navy)", display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                            <Activity size={15} color="#0d9488" /> Diagnostic Parameters ({doc.analysis.labResults.length})
                          </strong>
                          <table className="medikiosk-lab-table">
                            <thead>
                              <tr>
                                <th>{globalT("tableInvestigation")}</th>
                                <th>{globalT("tableValue")}</th>
                                <th>{globalT("tableNormalRange")}</th>
                                <th>{globalT("tableStatus")}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {doc.analysis.labResults.map((lab, i) => (
                                <tr key={i}>
                                  <td><strong>{lab.test}</strong></td>
                                  <td>{lab.value} {lab.unit}</td>
                                  <td className="muted">{lab.referenceRange}</td>
                                  <td>
                                    <span className={`medikiosk-abnormal-badge ${lab.status}`}>
                                      {lab.interpretation}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* 5. Verbatim Deciphered Handwriting Transcript */}
                      {doc.ocrText && (
                        <div style={{ marginTop: 12 }}>
                          <button
                            type="button"
                            className="outline-btn"
                            style={{ fontSize: 11, padding: "5px 10px", display: "inline-flex", alignItems: "center", gap: 5 }}
                            onClick={() => toggleOcr(doc.id)}
                          >
                            <FileText size={13} />
                            {expandedOcr[doc.id] ? "Hide Deciphered Handwriting" : "📝 View Deciphered Handwriting"}
                          </button>
                          {expandedOcr[doc.id] && (
                            <div style={{ marginTop: 8, padding: 12, background: "#f8fafc", borderRadius: 8, border: "1px solid var(--line)" }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: doc.isGeminiVision ? "#047857" : "#b45309", marginBottom: 4 }}>
                                {doc.isGeminiVision
                                  ? "✨ VERBATIM TRANSCRIPTION (GEMINI MULTIMODAL VISION):"
                                  : "⚠️ LOCAL FALLBACK OCR TRANSCRIPT (PRINTED ONLY):"}
                              </div>
                              {!doc.isGeminiVision && (
                                <div style={{ color: "#92400e", fontSize: 11, marginBottom: 6, background: "#fef3c7", padding: "4px 8px", borderRadius: 4 }}>
                                  Notice: Local browser OCR cannot read cursive doctor handwriting accurately.
                                </div>
                              )}
                              <pre style={{ margin: 0, fontSize: 12, fontFamily: "monospace", whiteSpace: "pre-wrap", color: "#1e293b", maxHeight: 180, overflowY: "auto" }}>
                                {doc.ocrText}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="questionnaire-footer-nav">
            <button
              type="button"
              className="questionnaire-nav-back-btn"
              onClick={() => {
                setSectionIndex(3);
                setHistorySubIndex(0);
              }}
            >
              <ChevronLeft size={16} /> Back to Medical History
            </button>
            <button
              type="button"
              className="questionnaire-btn-next"
              onClick={() => setSectionIndex(5)}
            >
              <span>Continue to Review & Submit</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 5: REVIEW & SUBMIT TO DOCTOR */}
      {/* ========================================================================= */}
      {sectionIndex === 5 && (
        <div className="questionnaire-screen-card">
          <div className="questionnaire-question-meta">
            <div>
              <span className="questionnaire-substep-badge"><CheckCircle2 size={14} /> Page 5 of 5 · Clinical Summary</span>
              <h3 className="questionnaire-question-title">{globalT("sec5Title") || "Review & Route to Doctor Desk"}</h3>
              <p className="questionnaire-question-subtitle">{globalT("soapNoteSubtitle") || "Verify your structured clinical summary before routing to the physician's examination room."}</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className="outline-btn"
                onClick={() => setBilingualPatientMode(!bilingualPatientMode)}
                style={{ fontSize: 12 }}
              >
                {bilingualPatientMode ? "View Doctor Note (English)" : "View Patient Summary (हिंदी)"}
              </button>
              <button
                type="button"
                className="outline-btn"
                onClick={() => setFhirModalOpen(true)}
                style={{ fontSize: 12 }}
              >
                <FileCode size={15} /> Inspect FHIR R4
              </button>
            </div>
          </div>

          {/* Structured SOAP Presentation */}
          <div className="medikiosk-summary-box">
            {/* Triage Urgency Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e0eae5", paddingBottom: 14, marginBottom: 18 }}>
              <div>
                <strong style={{ fontSize: 16 }}>Patient: {state.user?.name || "Swyom Sharma"}</strong>
                <span className="muted" style={{ display: "block", fontSize: 12 }}>ABHA: {abhaId || "swyom@abdm"} · Age: 21 · Sex: Male</span>
              </div>
              <div>
                <span
                  className={`medikiosk-abnormal-badge ${clinicalSummary.triageStatus === "EMERGENCY_CODE_RED" ? "critical" : "normal"}`}
                  style={{ fontSize: 12, padding: "6px 12px" }}
                >
                  TRIAGE: {clinicalSummary.triageStatus}
                </span>
              </div>
            </div>

            {/* Section 1: Chief Complaint & HPI (SOCRATES) */}
            <div className="medikiosk-soap-section">
              <h4><Activity size={16} /> {globalT("chiefComplaintHpiHeading")}</h4>
              <div className="medikiosk-soap-content">
                <p><strong>{globalT("chiefComplaintLabel")}</strong> {clinicalSummary.chiefComplaint}</p>
                <p>
                  <strong>{globalT("socratesAnalysisLabel")}</strong> Location: {clinicalSummary.socrates.site} | 
                  Onset: {clinicalSummary.socrates.onset} | Character: {clinicalSummary.socrates.character} | 
                  Radiation: {clinicalSummary.socrates.radiation} | Associations: {clinicalSummary.socrates.associations} | 
                  Exacerbation/Relief: {clinicalSummary.socrates.exacerbatingRelieving} | 
                  Pain/Severity: <strong style={{ color: Number(socratesAnswers.severity) >= 7 ? "#dc2626" : "var(--green)" }}>{clinicalSummary.socrates.severityScore}</strong>.
                </p>
                {freeTextNotes && (
                  <p><strong>{globalT("patientFreeTextLabel")}</strong> “{freeTextNotes}”</p>
                )}
              </div>
            </div>

            {/* Section 2: Past Medical & Drug History */}
            <div className="medikiosk-soap-section">
              <h4><Pill size={16} /> {globalT("pastMedicalAllergyHeading")}</h4>
              <div className="medikiosk-soap-content">
                <p><strong>{globalT("chronicConditionsLabel")}</strong> {clinicalSummary.pastConditions.join(", ") || "None reported"}</p>
                <p><strong>{globalT("activePrescriptionsLabel")}</strong> {clinicalSummary.currentMeds.join(", ") || "No active medicines listed"}</p>
                <p><strong>{globalT("knownAllergiesLabel")}</strong> {clinicalSummary.allergies}</p>
              </div>
            </div>

            {/* Section 3: Personal & Habits */}
            <div className="medikiosk-soap-section">
              <h4><UserCheck size={16} /> {globalT("personalSocialHistoryHeading")}</h4>
              <div className="medikiosk-soap-content">
                <p>
                  Diet: <span style={{ textTransform: "capitalize" }}>{clinicalSummary.personal.diet}</span> | 
                  Tobacco: <span style={{ textTransform: "capitalize" }}>{clinicalSummary.personal.tobacco}</span> | 
                  Alcohol: <span style={{ textTransform: "capitalize" }}>{clinicalSummary.personal.alcohol}</span>
                </p>
              </div>
            </div>

            {/* Section 4: Prior Document Intelligence & Interpretations */}
            {documents.length > 0 && (
              <div className="medikiosk-soap-section">
                <h4><FileText size={16} /> {globalT("priorDiagnosticReportsHeading")}</h4>
                <div className="medikiosk-soap-content">
                  {clinicalSummary.abnormalLabs.length > 0 ? (
                    <div>
                      <span style={{ color: "#b91c1c", fontWeight: 700 }}>{globalT("abnormalLabAlertsLabel")}</span>
                      <ul>
                        {clinicalSummary.abnormalLabs.map((lab, idx) => (
                          <li key={idx}>
                            <strong>{lab.test}:</strong> {lab.value} {lab.unit} (Ref: {lab.referenceRange}) — 
                            <span className={`medikiosk-abnormal-badge ${lab.status}`} style={{ marginLeft: 6 }}>
                              {lab.interpretation}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p>All extracted laboratory tests are within physiological reference intervals.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
            <button
              type="button"
              className="outline-btn"
              onClick={clearSessionData}
              style={{ color: "#dc2626", borderColor: "#fecaca" }}
            >
              <Trash2 size={15} /> Clear Kiosk Session
            </button>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <VoiceInputButton
                variant="button"
                label="Voice: Say 'Submit to Doctor'"
                onFinalTranscript={(text) => handleMediKioskVoiceInput(text)}
              />
              <button
                type="button"
                className="primary-btn btn-violet"
                onClick={pushToDoctorDesk}
                style={{ padding: "12px 28px", fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}
              >
                <Send size={16} />
                <span>{globalT("pushClinicalIntakeBtn") || "Push Clinical Intake to Doctor's Desk"}</span>
              </button>
            </div>
          </div>

          {/* Push Confirmation Banner */}
          {pushedToDoctor && (
            <div style={{ marginTop: 20, padding: 20, background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 14, textAlign: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--green)", color: "#fff", display: "grid", placeItems: "center", margin: "0 auto 10px" }}>
                <CheckCircle2 size={28} />
              </div>
              <h3 style={{ margin: "0 0 6px", color: "var(--green-dark)" }}>{globalT("clinicalSummaryPushedTitle")}</h3>
              <p style={{ margin: "0 0 16px", color: "#374151", fontSize: 13.5 }}>
                Your complete history, SOCRATES symptom profile, and digitized diagnostics are ready on the physician's screen.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                <button className="primary-btn btn-violet" onClick={() => onNavigate("doctor")}>
                  <Stethoscope size={16} />
                  <span>{globalT("switchToDoctorViewBtn")}</span>
                </button>
                <button className="secondary-btn" onClick={() => onNavigate("dashboard")}>
                  <CheckCircle2 size={16} />
                  <span>{globalT("dashboard") || "Return to Dashboard"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FHIR R4 Bundle Inspection Modal */}
      {fhirModalOpen && (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setFhirModalOpen(false)}>
          <div className="modal" style={{ width: "min(750px, 95%)" }}>
            <div className="modal-head">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FileCode size={20} color="var(--green)" />
                <h2>{globalT("fhirR4DocBundleHeading")}</h2>
              </div>
              <button className="icon-btn" onClick={() => setFhirModalOpen(false)}>✕</button>
            </div>
            <p className="muted" style={{ margin: "-10px 0 16px" }}>
              Standard HL7 FHIR R4 payload containing Composition, Patient, Encounter, Condition, and Observation resources ready for ABDM gateway sync.
            </p>
            <pre style={{ background: "#f5f8f6", padding: 14, borderRadius: 10, fontSize: 11, maxHeight: 380, overflow: "auto", border: "1px solid var(--line)" }}>
              {JSON.stringify(generatedFhirBundle || generateFhirR4Bundle({
                patient: { id: state.user?.id || "demo-patient", name: state.user?.name || "Swyom Sharma", abhaId },
                intakeAnswers: { chief_complaint: selectedComplaint?.id, other_chronic_diseases: otherChronicDiseases.trim(), ...socratesAnswers },
                extractedDocs: documents,
                redFlags: triggeredRedFlags,
                ayushAssessment: null,
                triageStatus: clinicalSummary.triageStatus
              }), null, 2)}
            </pre>
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button
                className="primary-btn"
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(generatedFhirBundle, null, 2));
                  const dl = document.createElement("a");
                  dl.setAttribute("href", dataStr);
                  dl.setAttribute("download", `FHIR_BUNDLE_${state.user?.name || "Patient"}_${Date.now()}.json`);
                  document.body.appendChild(dl);
                  dl.click();
                  dl.remove();
                }}
              >
                <Download size={16} /> Download FHIR JSON
              </button>
              <button className="secondary-btn" onClick={() => setFhirModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
