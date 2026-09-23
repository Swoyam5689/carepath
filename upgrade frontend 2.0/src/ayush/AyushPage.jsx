import React, { useState, useMemo, useEffect } from "react";
import {
  Sparkles, HeartPulse, Activity, ShieldCheck, Check, ChevronRight, ChevronLeft,
  Send, UserCheck, Stethoscope, Pill, AlertCircle, CheckCircle2,
  Calendar, Clock, Download, Compass, RefreshCw, Feather, Flame,
  Wind, Sun, Droplets, ArrowRight, User, Volume2, Mic, MicOff
} from "lucide-react";

import {
  PRAKRITI_QUESTIONS, VIKRITI_SYMPTOMS, AGNI_TYPES, NADI_FEATURES,
  DASHAVIDHA_CATEGORIES, AHARA_VIHARA_QUESTIONS, AYURVEDIC_SPECIALISTS,
  calculateAyushProfile,
  getAyushPrakritiVoicePrompt, getAyushAssessmentVoicePrompt,
  getAyushVikritiVoicePrompt, getAyushLifestyleVoicePrompt,
  getAyushReportVoicePrompt,
  getLocalizedRecommendationList, getLocalizedPrakritiType,
  getLocalizedVikritiType, getLocalizedSpecialist
} from "./ayushOntology.js";
import { speechService } from "../medikiosk/speechService.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { SUPPORTED_LANGUAGES } from "../i18n/languages.js";
import { VoiceInputButton } from "../components/VoiceInputButton.jsx";
import { normalizeSpeech, matchOption } from "../utils/voiceMatcher.js";
import "../medikiosk/medikiosk.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
function apiHeaders(extra = {}) {
  const token = localStorage.getItem("carepath-access-token");
  return { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...extra };
}

function getLocalizedAyushItem(item, lang) {
  if (!item) return "";
  const code = (lang || "en").toLowerCase().slice(0, 2);
  if (code === "hi") return item.labelHi || item.titleHi || item.label || item.title || "";
  if (code === "bn") return item.labelBn || item.titleBn || item.label || item.title || "";
  if (code === "mr") return item.labelMr || item.titleMr || item.label || item.title || "";
  if (code === "te") return item.labelTe || item.titleTe || item.label || item.title || "";
  if (code === "ta") return item.labelTa || item.titleTa || item.label || item.title || "";
  return item.label || item.title || "";
}

function getLocalizedAyushDesc(item, lang) {
  if (!item) return "";
  const code = (lang || "en").toLowerCase().slice(0, 2);
  if (code === "hi") return item.descHi || item.desc || "";
  if (code === "bn") return item.descBn || item.desc || "";
  if (code === "mr") return item.descMr || item.desc || "";
  if (code === "te") return item.descTe || item.desc || "";
  if (code === "ta") return item.descTa || item.desc || "";
  return item.desc || "";
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

function getSecondaryAyushItem(item, lang) {
  if (!item) return "";
  const code = (lang || "en").toLowerCase().slice(0, 2);
  if (code !== "en") return item.label || item.title || "";
  return item.labelHi || item.titleHi || "";
}

export default function AyushPage({ state, onUpdateState, onNotify, onNavigate }) {
  const { t, language, bhashiniLocale } = useLanguage();
  const selectedLanguage = bhashiniLocale || language || "en-IN";
  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === (language || "en")) || SUPPORTED_LANGUAGES[0];

  // Voice Interaction State
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");

  // Automatically synchronize speech recognition engine whenever global site language changes
  useEffect(() => {
    speechService.setLanguage(selectedLanguage);
  }, [selectedLanguage]);

  // Register non-intrusive fallback notification when a voice is not supported
  useEffect(() => {
    speechService.setOnVoiceUnavailable(({ label }) => {
      const notice = t("voiceUnavailableNotice", { label }) ||
        `Voice output is not supported for ${label} on your browser. Please refer to the text display.`;
      if (onNotify) {
        onNotify(notice);
      }
    });
  }, [onNotify, t]);

  // Section-wise Guided Questionnaire Navigation State: 1 to 5
  // Page 1 — General Information & Prakriti Pariksha
  // Page 2 — AYUSH Assessment (Agni & Nadi Pariksha)
  // Page 3 — Symptoms & Doshic Imbalance (Vikriti)
  // Page 4 — Lifestyle & Habits (Dashavidha & Ahara-Vihara)
  // Page 5 — Review & Submit (Classical Profile & Consultation)
  const [ayushSectionIndex, setAyushSectionIndex] = useState(1);
  const [prakritiQuestionIndex, setPrakritiQuestionIndex] = useState(0); // 0 to 5
  const [assessmentStepIndex, setAssessmentStepIndex] = useState(0); // 0 = Agni, 1 = Nadi
  const [symptomDoshaFilter, setSymptomDoshaFilter] = useState("all");
  const [lifestyleStepIndex, setLifestyleStepIndex] = useState(0); // 0 to 6

  // 1. Prakriti Answers
  const [prakritiAnswers, setPrakritiAnswers] = useState({
    body_frame: PRAKRITI_QUESTIONS[0].options[0],
    skin_complexion: PRAKRITI_QUESTIONS[1].options[0],
    hair_nature: PRAKRITI_QUESTIONS[2].options[0],
    sleep_pattern: PRAKRITI_QUESTIONS[3].options[0],
    mental_temperament: PRAKRITI_QUESTIONS[4].options[0],
    weather_sensitivity: PRAKRITI_QUESTIONS[5].options[0]
  });

  // 2. Agni & Nadi
  const [selectedAgni, setSelectedAgni] = useState("vishamagni");
  const [selectedNadi, setSelectedNadi] = useState("sarpa_gati");

  // 3. Vikriti Symptoms (Multi-select)
  const [vikritiSelected, setVikritiSelected] = useState([
    "vata_joint_cracking",
    "pitta_hyperacidity"
  ]);
  const [additionalAyushNotes, setAdditionalAyushNotes] = useState("");

  // 4. Dashavidha & Ahara-Vihara
  const [dashavidhaAnswers, setDashavidhaAnswers] = useState({
    sara: "madhyama_sara",
    samhanana: "madhyama_samhanana",
    satmya: "madhyama_satmya",
    sattva: "pravara_sattva",
    vyayama_shakti: "madhyama_vyayama"
  });
  const [aharaViharaAnswers, setAharaViharaAnswers] = useState({
    dietary_timings: "irregular_late_nights",
    sleep_habits: "regular_night_sleep"
  });

  // Combined 7 Lifestyle questions
  const LIFESTYLE_QUESTIONS = useMemo(() => [
    ...DASHAVIDHA_CATEGORIES.map((c) => ({ ...c, kind: "dashavidha" })),
    ...AHARA_VIHARA_QUESTIONS.map((q) => ({
      ...q,
      title: q.label,
      titleHi: q.labelHi,
      titleBn: q.labelBn,
      titleMr: q.labelMr,
      titleTe: q.labelTe,
      titleTa: q.labelTa,
      kind: "ahara_vihara"
    }))
  ], []);

  // 5. Booking & Consultation State
  const [selectedDoctor, setSelectedDoctor] = useState(AYURVEDIC_SPECIALISTS[0]);
  const [pushedToDoctor, setPushedToDoctor] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Active question pointers for Page 1 (Prakriti) and Page 4 (Lifestyle & Habits)
  const currentPrakritiQ = PRAKRITI_QUESTIONS[prakritiQuestionIndex] || PRAKRITI_QUESTIONS[0];
  const currentLifestyleQ = LIFESTYLE_QUESTIONS[lifestyleStepIndex] || LIFESTYLE_QUESTIONS[0];

  // Compute Classical Profile dynamically
  const profile = useMemo(() => {
    return calculateAyushProfile({
      prakritiAnswers,
      vikritiSelected,
      selectedAgni,
      selectedNadi,
      dashavidhaAnswers,
      aharaViharaAnswers
    });
  }, [prakritiAnswers, vikritiSelected, selectedAgni, selectedNadi, dashavidhaAnswers, aharaViharaAnswers]);

  // Prakriti selection (saves answer without automatic scrolling/advancement)
  function handlePrakritiSelect(questionId, option) {
    setPrakritiAnswers((prev) => ({ ...prev, [questionId]: option }));
    if (option) {
      const optLabel = getLocalizedAyushItem(option, language);
      speakPrompt(getSpokenSelectionFeedback(optLabel, false, language));
    }
  }

  // Agni selection (saves answer without automatic scrolling/advancement)
  function handleAgniSelect(agniId) {
    setSelectedAgni(agniId);
    const agniItem = AGNI_TYPES.find((a) => a.id === agniId);
    if (agniItem) {
      const label = getLocalizedAyushItem(agniItem, language);
      speakPrompt(getSpokenSelectionFeedback(label, false, language));
    }
  }

  // Nadi selection (saves answer without automatic scrolling/advancement)
  function handleNadiSelect(nadiId) {
    setSelectedNadi(nadiId);
    const nadiItem = NADI_FEATURES.find((n) => n.id === nadiId);
    if (nadiItem) {
      const label = getLocalizedAyushItem(nadiItem, language);
      speakPrompt(getSpokenSelectionFeedback(label, false, language));
    }
  }

  // Vikriti toggle (multi-select, no auto-advance)
  function toggleVikritiSymptom(symptomId) {
    const isAlreadySelected = vikritiSelected.includes(symptomId);
    setVikritiSelected((prev) =>
      isAlreadySelected ? prev.filter((x) => x !== symptomId) : [...prev, symptomId]
    );
    const item = VIKRITI_SYMPTOMS.find((s) => s.id === symptomId);
    if (item) {
      const label = getLocalizedAyushItem(item, language);
      speakPrompt(getSpokenSelectionFeedback(label, isAlreadySelected, language));
    }
  }

  // Lifestyle selection (saves answer without automatic scrolling/advancement)
  function handleLifestyleSelect(fieldId, value, kind) {
    if (kind === "dashavidha") {
      setDashavidhaAnswers((prev) => ({ ...prev, [fieldId]: value }));
    } else {
      setAharaViharaAnswers((prev) => ({ ...prev, [fieldId]: value }));
    }
    const currentQ = LIFESTYLE_QUESTIONS[lifestyleStepIndex];
    const opt = currentQ?.options?.find((o) => o.id === value);
    if (opt) {
      const label = getLocalizedAyushItem(opt, language);
      speakPrompt(getSpokenSelectionFeedback(label, false, language));
    }
  }

  // Global Back Navigation across sections and sub-steps
  function handleGlobalBack() {
    if (ayushSectionIndex === 1) {
      if (prakritiQuestionIndex > 0) {
        setPrakritiQuestionIndex((prev) => prev - 1);
      }
    } else if (ayushSectionIndex === 2) {
      if (assessmentStepIndex > 0) {
        setAssessmentStepIndex((prev) => prev - 1);
      } else {
        setAyushSectionIndex(1);
        setPrakritiQuestionIndex(PRAKRITI_QUESTIONS.length - 1);
      }
    } else if (ayushSectionIndex === 3) {
      setAyushSectionIndex(2);
      setAssessmentStepIndex(1);
    } else if (ayushSectionIndex === 4) {
      if (lifestyleStepIndex > 0) {
        setLifestyleStepIndex((prev) => prev - 1);
      } else {
        setAyushSectionIndex(3);
      }
    } else if (ayushSectionIndex === 5) {
      setAyushSectionIndex(4);
      setLifestyleStepIndex(LIFESTYLE_QUESTIONS.length - 1);
    }
  }

  // Dynamic progress percentage
  const progressPercent = useMemo(() => {
    if (ayushSectionIndex === 1) {
      return Math.round(((prakritiQuestionIndex + 1) / 6) * 20);
    }
    if (ayushSectionIndex === 2) {
      return 20 + Math.round(((assessmentStepIndex + 1) / 2) * 20);
    }
    if (ayushSectionIndex === 3) {
      return 60;
    }
    if (ayushSectionIndex === 4) {
      return 60 + Math.round(((lifestyleStepIndex + 1) / 7) * 20);
    }
    return 100;
  }, [ayushSectionIndex, prakritiQuestionIndex, assessmentStepIndex, lifestyleStepIndex]);

  const SECTIONS = [
    { id: 1, name: "General Information", tag: "Prakriti Pariksha", icon: <Sparkles size={16} /> },
    { id: 2, name: "AYUSH Assessment", tag: "Agni & Nadi", icon: <Activity size={16} /> },
    { id: 3, name: "Symptoms", tag: "Doshic Imbalance", icon: <HeartPulse size={16} /> },
    { id: 4, name: "Lifestyle & Habits", tag: "Dashavidha & Ahara", icon: <Compass size={16} /> },
    { id: 5, name: "Review & Submit", tag: "Profile & Consultation", icon: <CheckCircle2 size={16} /> },
  ];

  // Push to Doctor Consultation Desk
  async function pushToAyushDesk() {
    const payload = {
      id: crypto.randomUUID(),
      patientId: state.user?.id || "demo-patient",
      patientName: state.user?.name || "Swyom Sharma",
      type: "AYUSH_CLASSICAL_INTAKE",
      doctorAssigned: selectedDoctor.name,
      doctorSpecialty: selectedDoctor.specialty,
      profile,
      additionalNotes: additionalAyushNotes,
      timestamp: new Date().toISOString()
    };

    onUpdateState((prev) => ({
      ...prev,
      ayushIntake: payload
    }));

    try {
      await fetch(`${API_BASE}/api/ayush/intakes`, {
        method: "POST",
        headers: apiHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn("AYUSH sync to backend fallback (local state preserved):", err);
    }

    setPushedToDoctor(true);
    onNotify(`Classical AYUSH assessment successfully routed to ${selectedDoctor.name}'s Consultation Desk!`);
  }

  // Book Direct Appointment with Vaidya
  function bookAyushAppointment() {
    const apptId = `ayush-${Date.now()}`;
    const newAppointment = {
      id: apptId,
      hospital: selectedDoctor.hospital,
      doctor: selectedDoctor.name,
      specialty: selectedDoctor.specialty,
      date: new Date().toISOString().split("T")[0],
      time: selectedDoctor.nextSlot || "11:30 AM",
      tokenNumber: Math.floor(Math.random() * 20) + 101,
      type: "AYUSH / Classical Ayurvedic Consultation",
      status: "CONFIRMED"
    };

    onUpdateState((prev) => {
      const updatedList = [newAppointment, ...(prev.appointments || [])];
      return {
        ...prev,
        appointments: updatedList,
        queue: {
          ...prev.queue,
          appointmentId: newAppointment.id,
          hospitalName: newAppointment.hospital,
          doctorName: newAppointment.doctor,
          doctorSpecialty: newAppointment.specialty,
          patientToken: newAppointment.tokenNumber,
          servingToken: Math.max(1, newAppointment.tokenNumber - 3),
          patientsAhead: 3,
          estimatedWait: "15 mins",
          status: "SCHEDULED_ON_SITE"
        }
      };
    });

    setBookingSuccess(newAppointment);
    onNotify(`Ayurvedic Consultation booked with ${selectedDoctor.name}. Queue Token #${newAppointment.tokenNumber} issued.`);
  }

  // Filtered Vikriti symptoms for Page 3
  const displayedVikritiSymptoms = useMemo(() => {
    if (symptomDoshaFilter === "all") return VIKRITI_SYMPTOMS;
    return VIKRITI_SYMPTOMS.filter((s) => s.dosha === symptomDoshaFilter);
  }, [symptomDoshaFilter]);

  // Comprehensive AYUSH Voice Action Engine: ACTUALLY OPERATES UPON THE INPUT
  function handleAyushVoiceInput(spokenText) {
    if (!spokenText || !spokenText.trim()) return;
    const raw = spokenText.trim();
    const norm = normalizeSpeech(raw);

    // 1. Global Navigation Commands across all 5 Ayush pages
    if (
      norm.includes("next") || norm.includes("continue") || norm.includes("forward") ||
      norm.includes("आगे") || norm.includes("अगला") || norm.includes("পরবর্তী") ||
      norm.includes("తరువాత") || norm.includes("அடுத்து") || norm.includes("पुढील")
    ) {
      if (ayushSectionIndex === 1) {
        if (prakritiQuestionIndex < PRAKRITI_QUESTIONS.length - 1) {
          setPrakritiQuestionIndex((prev) => prev + 1);
        } else {
          setAyushSectionIndex(2);
          setAssessmentStepIndex(0);
        }
      } else if (ayushSectionIndex === 2) {
        if (assessmentStepIndex === 0) {
          setAssessmentStepIndex(1);
        } else {
          setAyushSectionIndex(3);
        }
      } else if (ayushSectionIndex === 3) {
        setAyushSectionIndex(4);
        setLifestyleStepIndex(0);
      } else if (ayushSectionIndex === 4) {
        if (lifestyleStepIndex < LIFESTYLE_QUESTIONS.length - 1) {
          setLifestyleStepIndex((prev) => prev + 1);
        } else {
          setAyushSectionIndex(5);
        }
      }
      onNotify?.("Voice Action: Navigating to next step");
      return;
    }

    if (
      norm.includes("back") || norm.includes("previous") || norm.includes("पीछे") ||
      norm.includes("पिछला") || norm.includes("পূর্ববর্তী") || norm.includes("మునుపటి") ||
      norm.includes("முந்தைய") || norm.includes("मागे")
    ) {
      handleGlobalBack();
      onNotify?.("Voice Action: Navigating back");
      return;
    }

    // 2. Submission / Booking Commands
    if (
      norm.includes("book") || norm.includes("appointment") || norm.includes("opd") ||
      norm.includes("queue") || norm.includes("token") || norm.includes("बुकिंग") ||
      norm.includes("अपॉइंटमेंट")
    ) {
      bookAyushAppointment();
      onNotify?.("Voice Action: Booking OPD consultation with Ayurvedic Vaidya");
      return;
    }

    if (
      norm.includes("submit") || norm.includes("push to doctor") || norm.includes("send") ||
      norm.includes("consultation desk") || norm.includes("route") || norm.includes("सबमिट") ||
      norm.includes("भेजें")
    ) {
      pushToAyushDesk();
      onNotify?.("Voice Action: Submitting AYUSH intake to doctor desk");
      return;
    }

    // 3. PAGE 1: Prakriti Pariksha (6 Questions)
    if (ayushSectionIndex === 1) {
      const currentQ = PRAKRITI_QUESTIONS[prakritiQuestionIndex];
      if (currentQ) {
        const matched = matchOption(raw, currentQ.options);
        if (matched) {
          handlePrakritiSelect(currentQ.id, matched);
          onNotify?.(`Voice Action: Selected "${matched.label}" (${matched.dosha || ""})`);
          if (prakritiQuestionIndex < PRAKRITI_QUESTIONS.length - 1) {
            setPrakritiQuestionIndex((prev) => prev + 1);
          } else {
            setAyushSectionIndex(2);
            setAssessmentStepIndex(0);
          }
          return;
        }
      }
    }

    // 4. PAGE 2: AYUSH Assessment (Agni & Nadi Pariksha)
    if (ayushSectionIndex === 2) {
      if (assessmentStepIndex === 0) {
        const matchedAgni = matchOption(raw, AGNI_TYPES);
        if (matchedAgni) {
          handleAgniSelect(matchedAgni.id);
          onNotify?.(`Voice Action: Agni set to "${matchedAgni.title}"`);
          setAssessmentStepIndex(1);
          return;
        }
      } else {
        const matchedNadi = matchOption(raw, NADI_FEATURES);
        if (matchedNadi) {
          handleNadiSelect(matchedNadi.id);
          onNotify?.(`Voice Action: Pulse (Nadi) set to "${matchedNadi.title}"`);
          setAyushSectionIndex(3);
          return;
        }
      }
    }

    // 5. PAGE 3: Vikriti Assessment (Doshic Imbalance Signs)
    if (ayushSectionIndex === 3) {
      const matchedSymptom = matchOption(raw, VIKRITI_SYMPTOMS);
      if (matchedSymptom) {
        toggleVikritiSymptom(matchedSymptom.id);
        onNotify?.(`Voice Action: Toggled symptom "${matchedSymptom.label}"`);
        return;
      }
    }

    // 6. PAGE 4: Lifestyle & Habits (Dashavidha & Ahara-Vihara)
    if (ayushSectionIndex === 4) {
      const currentQ = LIFESTYLE_QUESTIONS[lifestyleStepIndex];
      if (currentQ) {
        const matched = matchOption(raw, currentQ.options);
        if (matched) {
          handleLifestyleSelect(currentQ.id, matched.id, currentQ.kind);
          onNotify?.(`Voice Action: Selected "${matched.label}"`);
          if (lifestyleStepIndex < LIFESTYLE_QUESTIONS.length - 1) {
            setLifestyleStepIndex((prev) => prev + 1);
          } else {
            setAyushSectionIndex(5);
          }
          return;
        }
      }
    }

    // 7. Fallback: Save as spoken notes and notify
    setAdditionalAyushNotes((prev) => (prev ? `${prev} ${raw}`.trim() : raw));
    onNotify?.(`Spoken input recorded: "${raw}"`);
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
        },
        (error) => {
          console.warn("AYUSH speech error:", error);
          setIsListening(false);
          if (onNotify) {
            onNotify("Voice input paused or unavailable in this browser. Touch controls active.");
          }
        },
        (active) => setIsListening(active)
      );
      if (!success && onNotify) {
        onNotify("Microphone access could not be initialized. Please use touch input.");
      }
    }
  }

  // Audio prompt TTS
  function speakPrompt(text) {
    speechService.speak(text, selectedLanguage);
  }

  // Speak Current AYUSH Section / Question Aloud
  function speakCurrentAyushSection() {
    let promptText = "";
    if (ayushSectionIndex === 1) {
      promptText = getAyushPrakritiVoicePrompt(currentPrakritiQ, selectedLanguage);
    } else if (ayushSectionIndex === 2) {
      promptText = getAyushAssessmentVoicePrompt(assessmentStepIndex, selectedLanguage);
    } else if (ayushSectionIndex === 3) {
      promptText = getAyushVikritiVoicePrompt(vikritiSelected.length, selectedLanguage);
    } else if (ayushSectionIndex === 4) {
      promptText = getAyushLifestyleVoicePrompt(currentLifestyleQ, selectedLanguage);
    } else if (ayushSectionIndex === 5) {
      promptText = getAyushReportVoicePrompt(profile, selectedLanguage);
    }
    if (promptText) {
      speakPrompt(promptText);
    }
  }

  return (
    <div className="medikiosk-container" style={{ maxWidth: 1060, margin: "0 auto" }}>
      {/* Page Header Banner */}
      <div className="page-intro ayush-header-card calm-segment" style={{ "--calm-delay": "0s" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--teal-primary)", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
              <Sparkles size={18} />
              <span>{t("ayushPageEyebrow")}</span>
            </div>
            <h1 style={{ margin: "4px 0 8px", fontSize: 26, color: "var(--navy)" }}>
              {t("ayushPageTitle")}
            </h1>
            <p style={{ margin: 0, color: "var(--muted)", fontSize: 14, maxWidth: 680, lineHeight: 1.5 }}>
              {t("ayushPageSubtitle")}
            </p>
          </div>
          <div style={{ background: "#f5f9f7", border: "1px solid var(--line)", borderRadius: 12, padding: "10px 16px", textAlign: "right" }}>
            <span style={{ display: "block", fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>{t("dominantConstitution")}</span>
            <strong style={{ fontSize: 16, color: "var(--teal-primary)" }}>{profile.prakriti.type}</strong>
          </div>
        </div>
      </div>

      {/* Multimodal Voice Input Console (Always accessible across all AYUSH sections) */}
      <div className="medikiosk-voice-bar" style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "stretch", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <VoiceInputButton
              continuous={true}
              variant="button"
              label={t("dictateNotes") || "Tap to Speak"}
              onTranscript={({ full, final, interim }) => {
                const live = final || full || interim;
                if (live) setLiveTranscript(live);
              }}
              onFinalTranscript={(finalText) => {
                setAdditionalAyushNotes((prev) => (prev ? `${prev} ${finalText}`.trim() : finalText));
                setLiveTranscript("");
                handleAyushVoiceInput(finalText);
              }}
            />
            <div>
              <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: "var(--navy)" }}>
                🎙️ AYUSH Voice Consultation Intake ({currentLangObj.nativeLabel || currentLangObj.label})
              </span>
              <span className="muted" style={{ fontSize: 12 }}>
                Speak your physical complaints or doshic symptoms in {currentLangObj.label}.
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {additionalAyushNotes && (
              <button
                type="button"
                className="outline-btn"
                onClick={() => setAdditionalAyushNotes("")}
                style={{ fontSize: 11.5, padding: "5px 12px", color: "var(--muted)" }}
                title="Clear spoken notes"
              >
                Clear Notes
              </button>
            )}
            <button
              type="button"
              className="outline-btn"
              onClick={speakCurrentAyushSection}
              title={t("playAudioPrompt") || "Read Aloud"}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, padding: "6px 14px" }}
            >
              <Volume2 size={15} />
              <span>{t("playAudioPrompt") || "Read Aloud"}</span>
            </button>
          </div>
        </div>

        {/* Live Editable Voice Input Textarea */}
        <div style={{ position: "relative" }}>
          <textarea
            rows={2}
            value={additionalAyushNotes}
            onChange={(e) => setAdditionalAyushNotes(e.target.value)}
            placeholder={`Tap "${t("dictateNotes") || "Tap to Speak"}" to describe your digestive issues, sleep, or body aches in ${currentLangObj.label} (${currentLangObj.nativeLabel}), or type here...`}
            style={{
              width: "100%",
              borderRadius: 12,
              border: "1.5px solid var(--health-mint-border, #a7f3d0)",
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
            disabled={ayushSectionIndex === 1 && prakritiQuestionIndex === 0}
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <div className="questionnaire-nav-title-box">
            <span className="questionnaire-section-tag" style={{ color: "var(--alert-amber-dark)" }}>
              {SECTIONS[ayushSectionIndex - 1]?.tag || ""}
            </span>
            <h2>Page {ayushSectionIndex} — {SECTIONS[ayushSectionIndex - 1]?.name || ""}</h2>
          </div>
          <span className="questionnaire-step-counter">
            Step {ayushSectionIndex} of 5
          </span>
        </div>

        {/* Progress Track */}
        <div className="questionnaire-progress-track">
          <div
            className="questionnaire-progress-fill ayush"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Section Pills */}
        <div className="questionnaire-section-pills">
          {SECTIONS.map((sec) => {
            const isActive = sec.id === ayushSectionIndex;
            const isCompleted = sec.id < ayushSectionIndex;
            return (
              <div
                key={sec.id}
                className={`questionnaire-pill-item ${isActive ? "active ayush" : ""} ${isCompleted ? "completed" : ""}`}
                onClick={() => {
                  setAyushSectionIndex(sec.id);
                  if (sec.id === 1) setPrakritiQuestionIndex(0);
                  if (sec.id === 2) setAssessmentStepIndex(0);
                  if (sec.id === 4) setLifestyleStepIndex(0);
                }}
              >
                <span className="questionnaire-pill-dot" />
                <span>{sec.id}. {sec.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          PAGE 1: GENERAL INFORMATION & PRAKRITI PARIKSHA
          ========================================================================= */}
      {ayushSectionIndex === 1 && (
        <div className="questionnaire-screen-card ayush">
          <div className="questionnaire-question-meta">
            <div>
              <span className="questionnaire-substep-badge ayush">
                Constitutional Trait {prakritiQuestionIndex + 1} of {PRAKRITI_QUESTIONS.length}
              </span>
              <h2 className="questionnaire-question-title">
                {getLocalizedAyushItem(currentPrakritiQ, language)}
              </h2>
              {getSecondaryAyushItem(currentPrakritiQ, language) && (
                <p className="questionnaire-question-subtitle" style={{ color: "var(--teal-primary)", fontWeight: 600 }}>
                  {getSecondaryAyushItem(currentPrakritiQ, language)}
                </p>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                <VoiceInputButton
                  variant="button"
                  label="Answer by Voice"
                  onFinalTranscript={(text) => handleAyushVoiceInput(text)}
                />
                <button
                  type="button"
                  className="outline-btn"
                  onClick={() => speakPrompt(getAyushPrakritiVoicePrompt(currentPrakritiQ, selectedLanguage))}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, padding: "4px 10px" }}
                  title="Listen to question in selected language"
                >
                  <Volume2 size={14} /> Listen
                </button>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: 12, color: "var(--muted)", display: "block" }}>
                Patient: <strong>{state.user?.name || "Swyom Sharma"}</strong>
              </span>
              <span style={{ fontSize: 11, color: "var(--muted-2)" }}>
                ABHA: {state.user?.abhaId || "91-4455-8822-1923"}
              </span>
            </div>
          </div>

          {/* Mini Trait Dots Navigation */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "4px 0 12px" }}>
            {PRAKRITI_QUESTIONS.map((q, idx) => {
              const isCurrent = idx === prakritiQuestionIndex;
              const hasAnswer = Boolean(prakritiAnswers[q.id]);
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setPrakritiQuestionIndex(idx)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 16,
                    fontSize: 11.5,
                    fontWeight: 700,
                    border: `1.5px solid ${isCurrent ? "var(--alert-amber)" : hasAnswer ? "var(--line)" : "transparent"}`,
                    background: isCurrent ? "var(--alert-amber-soft)" : hasAnswer ? "#f9fafb" : "transparent",
                    color: isCurrent ? "var(--alert-amber-dark)" : hasAnswer ? "var(--navy)" : "var(--muted)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4
                  }}
                >
                  {hasAnswer && !isCurrent ? <Check size={11} color="#16a34a" /> : null}
                  <span>Trait {idx + 1}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Option Cards */}
          <div className="questionnaire-options-stack">
            {currentPrakritiQ.options.map((opt) => {
              const isSelected = prakritiAnswers[currentPrakritiQ.id]?.id === opt.id;
              return (
                <div
                  key={opt.id}
                  className={`questionnaire-option-card ayush ${isSelected ? "selected ayush" : ""}`}
                  onClick={() => handlePrakritiSelect(currentPrakritiQ.id, opt)}
                >
                  <div className="option-card-content">
                    <span className="option-card-title">
                      {getLocalizedAyushItem(opt, language)}
                    </span>
                    {getSecondaryAyushItem(opt, language) && (
                      <span className="option-card-desc" style={{ color: "#4b5563" }}>
                        {getSecondaryAyushItem(opt, language)}
                      </span>
                    )}
                    <span style={{
                      display: "inline-block",
                      marginTop: 6,
                      fontSize: 10.5,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: opt.dosha === "vata" ? "#e0f2fe" : opt.dosha === "pitta" ? "#fee2e2" : "#fef3c7",
                      color: opt.dosha === "vata" ? "#0369a1" : opt.dosha === "pitta" ? "#b91c1c" : "#b45309"
                    }}>
                      {opt.dosha} trait ({opt.points} pts)
                    </span>
                  </div>
                  <div className="option-radio-indicator">
                    {isSelected && <Check size={13} color="#fff" strokeWidth={3} />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Navigation */}
          <div className="questionnaire-footer-nav">
            <span className="auto-advance-hint">
              <i>ℹ</i> Select a trait option above, then click Next Trait to continue
            </span>
            <div style={{ display: "flex", gap: 10 }}>
              {prakritiQuestionIndex > 0 && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setPrakritiQuestionIndex((prev) => prev - 1)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px" }}
                >
                  <ChevronLeft size={16} /> Previous Trait
                </button>
              )}
              {prakritiQuestionIndex < PRAKRITI_QUESTIONS.length - 1 ? (
                <button
                  type="button"
                  className="questionnaire-btn-next ayush"
                  onClick={() => setPrakritiQuestionIndex((prev) => prev + 1)}
                >
                  Next Trait <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="questionnaire-btn-next ayush"
                  onClick={() => {
                    setAyushSectionIndex(2);
                    setAssessmentStepIndex(0);
                  }}
                >
                  Continue to AYUSH Assessment (Page 2) <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PAGE 2: AYUSH ASSESSMENT (AGNI & NADI PARIKSHA)
          ========================================================================= */}
      {ayushSectionIndex === 2 && (
        <div className="questionnaire-screen-card ayush">
          {assessmentStepIndex === 0 ? (
            // Agni Pariksha Step
            <>
              <div className="questionnaire-question-meta">
                <div>
                  <span className="questionnaire-substep-badge ayush">
                    Pariksha 1 of 2 · Digestive & Metabolic Fire (Agni)
                  </span>
                  <h2 className="questionnaire-question-title">
                    {t("agniParikshaLabel") || "Agni Pariksha (Digestive & Metabolic Fire Assessment)"}
                  </h2>
                  <p className="questionnaire-question-subtitle">
                    Select the pattern that best reflects your appetite consistency, digestion pace, and post-meal fullness.
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                    <VoiceInputButton
                      variant="button"
                      label="Answer by Voice"
                      onFinalTranscript={(text) => handleAyushVoiceInput(text)}
                    />
                    <button
                      type="button"
                      className="outline-btn"
                      onClick={() => speakPrompt(getAyushAssessmentVoicePrompt(0, selectedLanguage))}
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, padding: "4px 10px" }}
                      title="Listen to Agni Pariksha prompt"
                    >
                      <Volume2 size={14} /> Listen
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => setAssessmentStepIndex(0)}
                    style={{
                      padding: "4px 12px",
                      borderRadius: 14,
                      fontSize: 12,
                      fontWeight: 700,
                      background: "var(--alert-amber-soft)",
                      color: "var(--alert-amber-dark)",
                      border: "1px solid var(--alert-amber-border)"
                    }}
                  >
                    1. Agni Pariksha
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssessmentStepIndex(1)}
                    style={{
                      padding: "4px 12px",
                      borderRadius: 14,
                      fontSize: 12,
                      fontWeight: 700,
                      background: "#f9fafb",
                      color: "var(--navy)",
                      border: "1px solid var(--line)"
                    }}
                  >
                    2. Nadi Pariksha
                  </button>
                </div>
              </div>

              <div className="questionnaire-options-stack">
                {AGNI_TYPES.map((a) => {
                  const isSelected = selectedAgni === a.id;
                  return (
                    <div
                      key={a.id}
                      className={`questionnaire-option-card ayush ${isSelected ? "selected ayush" : ""}`}
                      onClick={() => handleAgniSelect(a.id)}
                    >
                      <div className="option-card-content">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                          <span className="option-card-title">
                            {getLocalizedAyushItem(a, language)}
                          </span>
                          <span style={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            padding: "2px 8px",
                            borderRadius: 4,
                            background: a.dosha === "balanced" ? "#dcfce7" : a.dosha === "vata" ? "#e0f2fe" : a.dosha === "pitta" ? "#fee2e2" : "#fef3c7",
                            color: a.dosha === "balanced" ? "#166534" : a.dosha === "vata" ? "#0369a1" : a.dosha === "pitta" ? "#b91c1c" : "#b45309"
                          }}>
                            {a.dosha}
                          </span>
                        </div>
                        <span className="option-card-desc">
                          {getLocalizedAyushDesc(a, language)}
                        </span>
                      </div>
                      <div className="option-radio-indicator">
                        {isSelected && <Check size={13} color="#fff" strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="questionnaire-footer-nav">
                <span className="auto-advance-hint">
                  <i>ℹ</i> Select your Agni pattern above, then click Next to proceed to Nadi Pariksha
                </span>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    className="questionnaire-btn-next ayush"
                    onClick={() => setAssessmentStepIndex(1)}
                  >
                    Continue to Nadi Pariksha <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            // Nadi Pariksha Step
            <>
              <div className="questionnaire-question-meta">
                <div>
                  <span className="questionnaire-substep-badge ayush">
                    Pariksha 2 of 2 · Classical Pulse Diagnostics (Nadi)
                  </span>
                  <h2 className="questionnaire-question-title">
                    {t("nadiParikshaLabel") || "Nadi Pariksha (Classical Arterial Pulse Movement)"}
                  </h2>
                  <p className="questionnaire-question-subtitle">
                    Select your predominant arterial pulse character under radial palpation (Gati Swabhava).
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                    <VoiceInputButton
                      variant="button"
                      label="Answer by Voice"
                      onFinalTranscript={(text) => handleAyushVoiceInput(text)}
                    />
                    <button
                      type="button"
                      className="outline-btn"
                      onClick={() => speakPrompt(getAyushAssessmentVoicePrompt(1, selectedLanguage))}
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, padding: "4px 10px" }}
                      title="Listen to Nadi Pariksha prompt"
                    >
                      <Volume2 size={14} /> Listen
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => setAssessmentStepIndex(0)}
                    style={{
                      padding: "4px 12px",
                      borderRadius: 14,
                      fontSize: 12,
                      fontWeight: 700,
                      background: "#f9fafb",
                      color: "var(--navy)",
                      border: "1px solid var(--line)"
                    }}
                  >
                    1. Agni Pariksha
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssessmentStepIndex(1)}
                    style={{
                      padding: "4px 12px",
                      borderRadius: 14,
                      fontSize: 12,
                      fontWeight: 700,
                      background: "var(--alert-amber-soft)",
                      color: "var(--alert-amber-dark)",
                      border: "1px solid var(--alert-amber-border)"
                    }}
                  >
                    2. Nadi Pariksha
                  </button>
                </div>
              </div>

              <div className="questionnaire-options-stack">
                {NADI_FEATURES.map((n) => {
                  const isSelected = selectedNadi === n.id;
                  return (
                    <div
                      key={n.id}
                      className={`questionnaire-option-card ayush ${isSelected ? "selected ayush" : ""}`}
                      onClick={() => handleNadiSelect(n.id)}
                    >
                      <div className="option-card-content">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                          <span className="option-card-title">
                            {getLocalizedAyushItem(n, language)}
                          </span>
                          <span style={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            padding: "2px 8px",
                            borderRadius: 4,
                            background: n.dosha === "vata" ? "#e0f2fe" : n.dosha === "pitta" ? "#fee2e2" : "#fef3c7",
                            color: n.dosha === "vata" ? "#0369a1" : n.dosha === "pitta" ? "#b91c1c" : "#b45309"
                          }}>
                            {n.dosha} pulse
                          </span>
                        </div>
                        <span className="option-card-desc">
                          <strong>Pulse Wave:</strong> {n.characteristics}
                        </span>
                        <span className="option-card-desc" style={{ marginTop: 2, color: "var(--teal-primary)" }}>
                          <strong>Clinical Correlation:</strong> {n.clinicalCorrelation}
                        </span>
                      </div>
                      <div className="option-radio-indicator">
                        {isSelected && <Check size={13} color="#fff" strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="questionnaire-footer-nav">
                <span className="auto-advance-hint">
                  <i>ℹ</i> Select your pulse rhythm above, then click Next to proceed to Symptoms
                </span>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setAssessmentStepIndex(0)}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px" }}
                  >
                    <ChevronLeft size={16} /> Back to Agni
                  </button>
                  <button
                    type="button"
                    className="questionnaire-btn-next ayush"
                    onClick={() => setAyushSectionIndex(3)}
                  >
                    Continue to Symptoms (Page 3) <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* =========================================================================
          PAGE 3: SYMPTOMS (VIKRITI & LAKSHAN - DOSHIC IMBALANCE)
          ========================================================================= */}
      {ayushSectionIndex === 3 && (
        <div className="questionnaire-screen-card ayush">
          <div className="questionnaire-question-meta">
            <div>
              <span className="questionnaire-substep-badge ayush">
                Section 3 · Multi-Select Symptoms Checklist
              </span>
              <h2 className="questionnaire-question-title">
                {t("vikritiSectionTitle") || "Vikriti Assessment (Current Doshic Imbalance Signs)"}
              </h2>
              <p className="questionnaire-question-subtitle">
                {t("vikritiSectionSubtitle") || "Select all active physical discomforts, digestive signs, and mental sensations you currently experience."}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                <VoiceInputButton
                  variant="button"
                  label="Speak Symptom"
                  onFinalTranscript={(text) => handleAyushVoiceInput(text)}
                />
                <button
                  type="button"
                  className="outline-btn"
                  onClick={() => speakPrompt(getAyushVikritiVoicePrompt(vikritiSelected.length, selectedLanguage))}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, padding: "4px 10px" }}
                  title="Listen to Vikriti symptoms prompt"
                >
                  <Volume2 size={14} /> Listen
                </button>
              </div>
            </div>
            <span className="score-badge" style={{ background: "var(--teal-soft)", color: "var(--teal-deep)", fontWeight: 700, padding: "6px 14px" }}>
              {t("activeSymptomsReported", { count: vikritiSelected.length }) || `${vikritiSelected.length} active symptoms selected`}
            </span>
          </div>

          {/* Dosha Filter Tabs */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "4px 0 10px" }}>
            {[
              {
                id: "all",
                label: language === "hi" ? `सभी लक्षण (${VIKRITI_SYMPTOMS.length})` :
                       language === "bn" ? `সমস্ত লক্ষণ (${VIKRITI_SYMPTOMS.length})` :
                       language === "mr" ? `सर्व लक्षणे (${VIKRITI_SYMPTOMS.length})` :
                       language === "te" ? `అన్ని లక్షణాలు (${VIKRITI_SYMPTOMS.length})` :
                       language === "ta" ? `அனைத்து அறிகுறிகள் (${VIKRITI_SYMPTOMS.length})` :
                       `All Symptoms (${VIKRITI_SYMPTOMS.length})`
              },
              {
                id: "vata",
                label: language === "hi" ? "वात लक्षण" :
                       language === "bn" ? "বাত লক্ষণ" :
                       language === "mr" ? "वात लक्षणे" :
                       language === "te" ? "వాత లక్షణాలు" :
                       language === "ta" ? "வாத அறிகுறிகள்" :
                       "Vata Signs"
              },
              {
                id: "pitta",
                label: language === "hi" ? "पित्त लक्षण" :
                       language === "bn" ? "পিত্ত লক্ষণ" :
                       language === "mr" ? "पित्त लक्षणे" :
                       language === "te" ? "పిత్త లక్షణాలు" :
                       language === "ta" ? "பித்த அறிகுறிகள்" :
                       "Pitta Signs"
              },
              {
                id: "kapha",
                label: language === "hi" ? "कफ लक्षण" :
                       language === "bn" ? "কফ লক্ষণ" :
                       language === "mr" ? "कफ लक्षणे" :
                       language === "te" ? "కఫ లక్షణాలు" :
                       language === "ta" ? "கப அறிகுறிகள்" :
                       "Kapha Signs"
              },
              {
                id: "ama",
                label: language === "hi" ? "आम (विषाक्त तत्व)" :
                       language === "bn" ? "আম (টক্সিন)" :
                       language === "mr" ? "आम (विषारी घटक)" :
                       language === "te" ? "ఆమ (టాక్సిన్స్)" :
                       language === "ta" ? "ஆம (நச்சுகள்)" :
                       "Ama (Toxins)"
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSymptomDoshaFilter(tab.id)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  border: `1.5px solid ${symptomDoshaFilter === tab.id ? "var(--teal-primary)" : "var(--line)"}`,
                  background: symptomDoshaFilter === tab.id ? "var(--teal-soft)" : "#fff",
                  color: symptomDoshaFilter === tab.id ? "var(--teal-deep)" : "#4b5563",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Multi-Select Symptom Cards Grid */}
          <div className="questionnaire-options-grid-2col">
            {displayedVikritiSymptoms.map((item) => {
              const isSelected = vikritiSelected.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`questionnaire-option-card ayush ${isSelected ? "selected ayush" : ""}`}
                  onClick={() => toggleVikritiSymptom(item.id)}
                  style={{ minHeight: 70 }}
                >
                  <div className="option-card-content">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span className="option-card-title" style={{ fontSize: 13.5 }}>
                        {getLocalizedAyushItem(item, language)}
                      </span>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        background: item.dosha === "vata" ? "#e0f2fe" : item.dosha === "pitta" ? "#fee2e2" : item.dosha === "kapha" ? "#fef3c7" : "#f3e8ff",
                        color: item.dosha === "vata" ? "#0369a1" : item.dosha === "pitta" ? "#b91c1c" : item.dosha === "kapha" ? "#b45309" : "#6b21a8",
                        padding: "2px 6px",
                        borderRadius: 4
                      }}>
                        {item.dosha}
                      </span>
                    </div>
                    {getSecondaryAyushItem(item, language) && (
                      <span className="option-card-desc">
                        {getSecondaryAyushItem(item, language)}
                      </span>
                    )}
                  </div>
                  <div className="option-radio-indicator" style={{ borderRadius: 6 }}>
                    {isSelected && <Check size={13} color="#fff" strokeWidth={3} />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional Symptoms / Custom Voice Complaints */}
          <div style={{ marginTop: 18, background: "#f8fafc", padding: "16px", borderRadius: 12, border: "1px solid var(--line)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
              <strong style={{ fontSize: 13.5, color: "var(--navy)" }}>
                {t("additionalCommentsLabel") || "Additional Symptoms or Patient Notes"}
              </strong>
              <VoiceInputButton
                continuous={true}
                variant="button"
                onFinalTranscript={(text) => {
                  setAdditionalAyushNotes((prev) => (prev ? `${prev} ${text}`.trim() : text));
                }}
              />
            </div>
            <textarea
              rows={2}
              value={additionalAyushNotes}
              onChange={(e) => setAdditionalAyushNotes(e.target.value)}
              placeholder={t("additionalCommentsPlaceholder") || "Describe any other symptoms or notes in your own words..."}
              style={{ width: "100%", borderRadius: 8, border: "1px solid var(--line)", padding: 10, fontSize: 13, boxSizing: "border-box" }}
            />
          </div>

          {/* Footer Navigation */}
          <div className="questionnaire-footer-nav">
            <span className="auto-advance-hint">
              <i>ℹ</i> Multi-select: choose all relevant symptoms, then continue
            </span>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setAyushSectionIndex(2);
                  setAssessmentStepIndex(1);
                }}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px" }}
              >
                <ChevronLeft size={16} /> Back to AYUSH Assessment
              </button>
              <button
                type="button"
                className="questionnaire-btn-next ayush"
                onClick={() => {
                  setAyushSectionIndex(4);
                  setLifestyleStepIndex(0);
                }}
              >
                Continue to Lifestyle & Habits (Page 4) <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PAGE 4: LIFESTYLE & HABITS (DASHAVIDHA & AHARA-VIHARA)
          ========================================================================= */}
      {ayushSectionIndex === 4 && (
        <div className="questionnaire-screen-card ayush">
          <div className="questionnaire-question-meta">
            <div>
              <span className="questionnaire-substep-badge ayush">
                {language === "hi" ? `आदत ${lifestyleStepIndex + 1} / ${LIFESTYLE_QUESTIONS.length} · ${currentLifestyleQ.kind === "dashavidha" ? "दशविध परीक्षा" : "आहार एवं विहार"}` :
                 language === "bn" ? `অভ্যাস ${lifestyleStepIndex + 1} / ${LIFESTYLE_QUESTIONS.length} · ${currentLifestyleQ.kind === "dashavidha" ? "দশবিধ পরীক্ষা" : "আহার ও বিহার"}` :
                 language === "mr" ? `सवय ${lifestyleStepIndex + 1} / ${LIFESTYLE_QUESTIONS.length} · ${currentLifestyleQ.kind === "dashavidha" ? "दशविध परीक्षा" : "आहार आणि विहार"}` :
                 language === "te" ? `అలవాటు ${lifestyleStepIndex + 1} / ${LIFESTYLE_QUESTIONS.length} · ${currentLifestyleQ.kind === "dashavidha" ? "దశవిధ పరీక్ష" : "ఆహార మరియు విహార"}` :
                 language === "ta" ? `பழக்கம் ${lifestyleStepIndex + 1} / ${LIFESTYLE_QUESTIONS.length} · ${currentLifestyleQ.kind === "dashavidha" ? "தசவித பரிட்சை" : "ஆகார மற்றும் விஹார"}` :
                 `Habit ${lifestyleStepIndex + 1} of ${LIFESTYLE_QUESTIONS.length} · ${currentLifestyleQ.kind === "dashavidha" ? "Dashavidha Pariksha" : "Ahara & Vihara"}`}
              </span>
              <h2 className="questionnaire-question-title">
                {getLocalizedAyushItem(currentLifestyleQ, language)}
              </h2>
              {language !== "en" && currentLifestyleQ.title && (
                <p className="questionnaire-question-subtitle" style={{ color: "var(--teal-primary)", fontWeight: 600 }}>
                  {currentLifestyleQ.title}
                </p>
              )}
              {language === "en" && currentLifestyleQ.titleHi && (
                <p className="questionnaire-question-subtitle" style={{ color: "var(--teal-primary)", fontWeight: 600 }}>
                  {currentLifestyleQ.titleHi}
                </p>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                <VoiceInputButton
                  variant="button"
                  label={
                    language === "hi" ? "बोलकर उत्तर दें" :
                    language === "bn" ? "ভয়েসে উত্তর দিন" :
                    language === "mr" ? "आवाजाने उत्तर द्या" :
                    language === "te" ? "వాయిస్ ద్వారా సమాధానం" :
                    language === "ta" ? "குரல் மூலம் பதில்" :
                    "Answer by Voice"
                  }
                  onFinalTranscript={(text) => handleAyushVoiceInput(text)}
                />
                <button
                  type="button"
                  className="outline-btn"
                  onClick={() => speakPrompt(getAyushLifestyleVoicePrompt(currentLifestyleQ, selectedLanguage))}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, padding: "4px 10px" }}
                  title="Listen to habit question prompt"
                >
                  <Volume2 size={14} /> {
                    language === "hi" ? "सुनें" :
                    language === "bn" ? "শুনুন" :
                    language === "mr" ? "ऐका" :
                    language === "te" ? "వినండి" :
                    language === "ta" ? "கேளுங்கள்" :
                    "Listen"
                  }
                </button>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: 11, color: "var(--muted-2)" }}>
                Step {lifestyleStepIndex + 1} of 7
              </span>
            </div>
          </div>

          {/* Mini Stepper Tabs for Habits */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "4px 0 12px" }}>
            {LIFESTYLE_QUESTIONS.map((q, idx) => {
              const isCurrent = idx === lifestyleStepIndex;
              const hasAnswer = q.kind === "dashavidha"
                ? Boolean(dashavidhaAnswers[q.id])
                : Boolean(aharaViharaAnswers[q.id]);
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setLifestyleStepIndex(idx)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 16,
                    fontSize: 11.5,
                    fontWeight: 700,
                    border: `1.5px solid ${isCurrent ? "var(--alert-amber)" : hasAnswer ? "var(--line)" : "transparent"}`,
                    background: isCurrent ? "var(--alert-amber-soft)" : hasAnswer ? "#f9fafb" : "transparent",
                    color: isCurrent ? "var(--alert-amber-dark)" : hasAnswer ? "var(--navy)" : "var(--muted)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4
                  }}
                >
                  {hasAnswer && !isCurrent ? <Check size={11} color="#16a34a" /> : null}
                  <span>{idx + 1}. {getLocalizedAyushItem(q, language).split("(")[0].trim()}</span>
                </button>
              );
            })}
          </div>

          {/* Lifestyle Option Cards */}
          <div className="questionnaire-options-stack">
            {currentLifestyleQ.options.map((opt) => {
              const currentVal = currentLifestyleQ.kind === "dashavidha"
                ? dashavidhaAnswers[currentLifestyleQ.id]
                : aharaViharaAnswers[currentLifestyleQ.id];
              const isSelected = currentVal === opt.id;
              return (
                <div
                  key={opt.id}
                  className={`questionnaire-option-card ayush ${isSelected ? "selected ayush" : ""}`}
                  onClick={() => handleLifestyleSelect(currentLifestyleQ.id, opt.id, currentLifestyleQ.kind)}
                >
                  <div className="option-card-content">
                    <span className="option-card-title">
                      {getLocalizedAyushItem(opt, language)}
                    </span>
                    {getSecondaryAyushItem(opt, language) && (
                      <span className="option-card-desc" style={{ marginTop: 2, color: "#4b5563" }}>
                        {getSecondaryAyushItem(opt, language)}
                      </span>
                    )}
                    {opt.dosha && (
                      <span style={{
                        display: "inline-block",
                        marginTop: 4,
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: opt.dosha === "balanced" ? "#dcfce7" : opt.dosha === "vata" ? "#e0f2fe" : opt.dosha === "pitta" ? "#fee2e2" : "#fef3c7",
                        color: opt.dosha === "balanced" ? "#166534" : opt.dosha === "vata" ? "#0369a1" : opt.dosha === "pitta" ? "#b91c1c" : "#b45309"
                      }}>
                        {opt.dosha}
                      </span>
                    )}
                  </div>
                  <div className="option-radio-indicator">
                    {isSelected && <Check size={13} color="#fff" strokeWidth={3} />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Navigation */}
          <div className="questionnaire-footer-nav">
            <span className="auto-advance-hint">
              <i>ℹ</i> {
                language === "hi" ? "ऊपर अपना उत्तर चुनें, फिर आगे बढ़ने के लिए अगली आदत पर क्लिक करें" :
                language === "bn" ? "উপরে আপনার উত্তর নির্বাচন করুন, তারপর পরবর্তী অভ্যাসে ক্লিক করুন" :
                language === "mr" ? "वरील उत्तर निवडा, नंतर पुढील सवयीवर जाण्यासाठी क्लिक करा" :
                language === "te" ? "పైన మీ సమాధానాన్ని ఎంచుకోండి, తరువాత తదుపరి అలవాటుపై క్లిక్ చేయండి" :
                language === "ta" ? "மேலே உங்கள் பதிலை தேர்ந்தெடுக்கவும், பின்னர் அடுத்த பழக்கத்தை கிளிக் செய்யவும்" :
                "Select your answer above, then click Next Habit to continue"
              }
            </span>
            <div style={{ display: "flex", gap: 10 }}>
              {lifestyleStepIndex > 0 && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setLifestyleStepIndex((prev) => prev - 1)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px" }}
                >
                  <ChevronLeft size={16} /> {
                    language === "hi" ? "पिछली आदत" :
                    language === "bn" ? "পূর্ববর্তী অভ্যাস" :
                    language === "mr" ? "मागील सवय" :
                    language === "te" ? "మునుపటి అలవాటు" :
                    language === "ta" ? "முந்தைய பழக்கம்" :
                    "Previous Habit"
                  }
                </button>
              )}
              {lifestyleStepIndex < LIFESTYLE_QUESTIONS.length - 1 ? (
                <button
                  type="button"
                  className="questionnaire-btn-next ayush"
                  onClick={() => setLifestyleStepIndex((prev) => prev + 1)}
                >
                  {
                    language === "hi" ? "अगली आदत" :
                    language === "bn" ? "পরবর্তী অভ্যাস" :
                    language === "mr" ? "पुढील सवय" :
                    language === "te" ? "తదుపరి అలవాటు" :
                    language === "ta" ? "அடுத்த பழக்கம்" :
                    "Next Habit"
                  } <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="questionnaire-btn-next ayush"
                  onClick={() => setAyushSectionIndex(5)}
                >
                  {
                    language === "hi" ? "समीक्षा और सबमिट करें (पृष्ठ 5)" :
                    language === "bn" ? "পর্যালোচনা ও জমা দিন (পৃষ্ঠা ৫)" :
                    language === "mr" ? "पुनरावलोकन आणि सबमिट करा (पृष्ठ ५)" :
                    language === "te" ? "సమీక్ష మరియు సమర్పించండి (పేజీ 5)" :
                    language === "ta" ? "மதிப்பாய்வு செய்து சமர்ப்பிக்கவும் (பக்கம் 5)" :
                    "Continue to Review & Submit (Page 5)"
                  } <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PAGE 5: REVIEW & SUBMIT (CLASSICAL DIAGNOSTIC PROFILE & VAIDYA CONSULT)
          ========================================================================= */}
      {ayushSectionIndex === 5 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Classical Diagnostic Profile Card */}
          <div className="medikiosk-card ayush-report-card">
            <div className="medikiosk-card-head">
              <div>
                <span className="eyebrow" style={{ color: "var(--teal-primary)" }}>
                  {t("ayushReportEyebrow") || "CLASSICAL AYURVEDA DIAGNOSTIC PROFILE"}
                </span>
                <h2>{t("ayushReportTitle") || "Holistic Constitutional & Doshic Analysis"}</h2>
                <p>{t("ayushReportSubtitle") || "Grounded in Charaka and Sushruta Samhita clinical rubrics."}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                  <button
                    type="button"
                    className="outline-btn"
                    onClick={() => speakPrompt(getAyushReportVoicePrompt(profile, selectedLanguage))}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, padding: "4px 12px" }}
                    title="Listen to diagnostic report summary"
                  >
                    <Volume2 size={14} /> Listen to Report Summary
                  </button>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className="score-badge" style={{ background: profile.vikriti.hasAma ? "#fee2e2" : "var(--teal-soft)", color: profile.vikriti.hasAma ? "#b91c1c" : "var(--teal-deep)", fontWeight: 700 }}>
                  {profile.vikriti.hasAma ? (t("amaPresentBadge") || "⚠️ Ama Present") : (t("niramaBadge") || "✓ Nirama (No Ama)")}
                </span>
              </div>
            </div>

            {/* Dosha Meter */}
            <div style={{ background: "#f4f9f6", border: "1px solid #c8e0d4", borderRadius: 14, padding: 18, marginBottom: 20 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 15, color: "var(--navy)" }}>{t("doshaProportionTitle") || "Tri-Doshic Proportion Balance"}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, textAlign: "center" }}>
                <div style={{ background: "#fff", padding: "12px", borderRadius: 10, border: "1px solid #e0f2fe" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#0369a1" }}>{t("vataLabel") || "Vata (Air/Ether)"}</span>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#0284c7", margin: "4px 0" }}>{profile.prakriti.percentages.vata}%</div>
                  <span className="muted" style={{ fontSize: 11 }}>{t("vataRole") || "Movement & Nervous Regulation"}</span>
                </div>
                <div style={{ background: "#fff", padding: "12px", borderRadius: 10, border: "1px solid #fee2e2" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#b91c1c" }}>{t("pittaLabel") || "Pitta (Fire/Water)"}</span>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#dc2626", margin: "4px 0" }}>{profile.prakriti.percentages.pitta}%</div>
                  <span className="muted" style={{ fontSize: 11 }}>{t("pittaRole") || "Metabolism & Digestion"}</span>
                </div>
                <div style={{ background: "#fff", padding: "12px", borderRadius: 10, border: "1px solid #d1e7dd" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--teal-primary)" }}>{t("kaphaLabel") || "Kapha (Earth/Water)"}</span>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "var(--teal-primary)", margin: "4px 0" }}>{profile.prakriti.percentages.kapha}%</div>
                  <span className="muted" style={{ fontSize: 11 }}>{t("kaphaRole") || "Structure, Immunity & Lubrication"}</span>
                </div>
              </div>
            </div>

            {/* Clinical Summary Parameters */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 20 }}>
              <div style={{ background: "#fff", padding: 12, borderRadius: 10, border: "1px solid var(--line)" }}>
                <span className="muted" style={{ fontSize: 11 }}>{t("prakritiTypeLabel") || "Prakriti Constitution"}</span>
                <strong style={{ display: "block", fontSize: 14, color: "var(--navy)" }}>
                  {getLocalizedPrakritiType(profile.prakriti.type, language)}
                </strong>
              </div>
              <div style={{ background: "#fff", padding: 12, borderRadius: 10, border: "1px solid var(--line)" }}>
                <span className="muted" style={{ fontSize: 11 }}>{t("dominantVikritiLabel") || "Dominant Imbalance"}</span>
                <strong style={{ display: "block", fontSize: 14, color: "var(--teal-primary)" }}>
                  {getLocalizedVikritiType(profile.vikriti.dominant, language)}
                </strong>
              </div>
              <div style={{ background: "#fff", padding: 12, borderRadius: 10, border: "1px solid var(--line)" }}>
                <span className="muted" style={{ fontSize: 11 }}>{t("agniStateLabel") || "Agni State"}</span>
                <strong style={{ display: "block", fontSize: 14, color: "#1f2937" }}>
                  {getLocalizedAyushItem(profile.agni, language)}
                </strong>
              </div>
              <div style={{ background: "#fff", padding: 12, borderRadius: 10, border: "1px solid var(--line)" }}>
                <span className="muted" style={{ fontSize: 11 }}>{t("nadiGatiLabel") || "Nadi Gati"}</span>
                <strong style={{ display: "block", fontSize: 14, color: "#1f2937" }}>
                  {getLocalizedAyushItem(profile.nadi, language)}
                </strong>
              </div>
            </div>

            {/* Pathya - Apathya Guidance Matrix */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              {/* Pathya (Do's) */}
              <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 14, padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#15803d", fontWeight: 800, fontSize: 15, marginBottom: 12 }}>
                  <CheckCircle2 size={18} />
                  <span>{t("pathyaHeading") || "Pathya (Recommended Diet & Regimen)"}</span>
                </div>
                <strong style={{ fontSize: 13, color: "#166534", display: "block", marginBottom: 6 }}>{t("beneficialDiet") || "Beneficial Diet (Ahara)"}</strong>
                <ul style={{ margin: "0 0 12px", paddingLeft: 18, fontSize: 12.5, color: "#14532d", lineHeight: 1.5 }}>
                  {getLocalizedRecommendationList(profile.recommendations, "pathyaAhara", language).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
                <strong style={{ fontSize: 13, color: "#166534", display: "block", marginBottom: 6 }}>{t("beneficialLifestyle") || "Beneficial Routine (Vihara)"}</strong>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: "#14532d", lineHeight: 1.5 }}>
                  {getLocalizedRecommendationList(profile.recommendations, "pathyaVihara", language).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Apathya (Don'ts) */}
              <div style={{ background: "#fff1f2", border: "1.5px solid #fecdd3", borderRadius: 14, padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#be123c", fontWeight: 800, fontSize: 15, marginBottom: 12 }}>
                  <AlertCircle size={18} />
                  <span>{t("apathyaHeading") || "Apathya (Avoid or Restrict)"}</span>
                </div>
                <strong style={{ fontSize: 13, color: "#9f1239", display: "block", marginBottom: 6 }}>{t("foodsToAvoid") || "Foods to Avoid"}</strong>
                <ul style={{ margin: "0 0 12px", paddingLeft: 18, fontSize: 12.5, color: "#881337", lineHeight: 1.5 }}>
                  {getLocalizedRecommendationList(profile.recommendations, "apathyaAhara", language).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
                <strong style={{ fontSize: 13, color: "#9f1239", display: "block", marginBottom: 6 }}>{t("activitiesToAvoid") || "Habits to Avoid"}</strong>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: "#881337", lineHeight: 1.5 }}>
                  {getLocalizedRecommendationList(profile.recommendations, "apathyaVihara", language).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Suggested Classical Herbs */}
            <div className="ayush-herbs-block">
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--teal-deep)", fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
                <Pill size={16} /> {t("classicalHerbsTitle") || "Suggested Classical Herbs & Formulations"}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 8 }}>
                {getLocalizedRecommendationList(profile.recommendations, "herbsSuggested", language).map((herb, idx) => (
                  <div key={idx} style={{ background: "#fff", padding: "8px 12px", borderRadius: 8, border: "1px solid #c8e0d4", fontSize: 12, color: "var(--navy)" }}>
                    🌿 {herb}
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="ayush-disclaimer" style={{ marginTop: 16 }}>
              ℹ {t("ayushDisclaimerText") || "This AYUSH intake profile provides structured classical data for qualified Ayurvedic practitioners. Please consult a registered Vaidya before initiating medicinal herbal remedies."}
            </div>
          </div>

          {/* Doctor Selection & Routing Card */}
          <div className="medikiosk-card ayush-section-card">
            <div className="medikiosk-card-head">
              <div>
                <span className="eyebrow" style={{ color: "var(--teal-primary)" }}>
                  {t("ayushDoctorSectionEyebrow") || "AYURVEDIC VAIDYA ROUTING"}
                </span>
                <h2>{t("ayushDoctorSectionTitle") || "Select Practitioner & Route Consultation"}</h2>
                <p>{t("ayushDoctorSectionSubtitle") || "Connect your classical diagnostic profile directly to an on-duty specialist."}</p>
              </div>
            </div>

            {/* Doctors Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 20 }}>
              {AYURVEDIC_SPECIALISTS.map((rawDoc) => {
                const doc = getLocalizedSpecialist(rawDoc, language);
                const isSelected = selectedDoctor.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoctor(doc)}
                    style={{
                      border: `2px solid ${isSelected ? "var(--teal-primary)" : "var(--line)"}`,
                      background: isSelected ? "var(--teal-soft)" : "#fff",
                      borderRadius: 14,
                      padding: 18,
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: "#e8f4f0", display: "grid", placeItems: "center", fontSize: 24 }}>
                        {doc.avatar}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <strong style={{ fontSize: 16, color: "var(--navy)" }}>{doc.name}</strong>
                          {isSelected && <span className="score-badge" style={{ background: "var(--teal-primary)", color: "#fff", fontSize: 11 }}>{t("doctorSelectedBadge") || "Selected"}</span>}
                        </div>
                        <span style={{ display: "block", fontSize: 12.5, color: "var(--teal-primary)", fontWeight: 600 }}>{doc.qualification}</span>
                        <span style={{ display: "block", fontSize: 12, color: "#4b5563", marginTop: 2 }}>
                          {doc.specialty}
                        </span>
                        <span style={{ display: "block", fontSize: 11.5, color: "#6b7280", marginTop: 2 }}>📍 {doc.hospital} ({doc.room})</span>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--line)", fontSize: 12 }}>
                          <span style={{ color: "#166534", fontWeight: 600 }}>● {doc.availability}</span>
                          <span style={{ color: "var(--teal-primary)", fontWeight: 700 }}>{t("nextSlotLabel") || "Next Slot:"} {doc.nextSlot}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setAyushSectionIndex(4);
                  setLifestyleStepIndex(LIFESTYLE_QUESTIONS.length - 1);
                }}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "12px 20px" }}
              >
                <ChevronLeft size={16} /> {
                  language === "hi" ? "जीवनशैली और आदतों में बदलाव करें" :
                  language === "bn" ? "জীবনযাত্রা ও অভ্যাস সম্পাদনা করুন" :
                  language === "mr" ? "जीवनशैली आणि सवयी संपादित करा" :
                  language === "te" ? "జీవనశైలి మరియు అలవాట్లను సవరించండి" :
                  language === "ta" ? "வாழ்வியல் & பழக்கங்களை மாற்றவும்" :
                  "Edit Lifestyle & Habits"
                }
              </button>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <VoiceInputButton
                  variant="button"
                  label={
                    language === "hi" ? "बोलें: 'कंसल्टेशन बुक करें' या 'सबमिट'" :
                    language === "bn" ? "বলুন: 'পরামর্শ বুক করুন' অথবা 'জমা দিন'" :
                    language === "mr" ? "बोला: 'सल्ला बुक करा' किंवा 'सबमिट करा'" :
                    language === "te" ? "చెప్పండి: 'సంప్రదింపు బుక్ చేయండి' లేదా 'సమర్పించండి'" :
                    language === "ta" ? "பேசவும்: 'ஆலோசனை பதிவு செய்' அல்லது 'சமர்ப்பிக்கவும்'" :
                    "Voice: Say 'Book Consultation' or 'Submit'"
                  }
                  onFinalTranscript={(text) => handleAyushVoiceInput(text)}
                />
                <button
                  className="secondary-btn"
                  onClick={bookAyushAppointment}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px" }}
                >
                  <Calendar size={16} />
                  <span>{t("bookAyushConsult") || "Book OPD Consultation"}</span>
                </button>
                <button
                  className="primary-btn"
                  onClick={pushToAyushDesk}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 24px"
                  }}
                >
                  <Send size={16} />
                  <span>{t("consultationDeskBtn") || "Push Ayurvedic Intake to Consultation Desk"}</span>
                </button>
              </div>
            </div>

            {/* Success Confirmation Banner for Consultation Desk Push */}
            {pushedToDoctor && (
              <div style={{ marginTop: 20, padding: 18, background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 14, textAlign: "center" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#16a34a", color: "#fff", display: "grid", placeItems: "center", margin: "0 auto 8px" }}>
                  <CheckCircle2 size={24} />
                </div>
                <h3 style={{ margin: "0 0 6px", color: "#14532d" }}>
                  {t("assessmentPushedTitle", { doctor: selectedDoctor.name }) || `AYUSH Assessment Routed to ${selectedDoctor.name}`}
                </h3>
                <p style={{ margin: "0 0 14px", color: "#166534", fontSize: 13.5 }}>
                  {t("assessmentPushedBody") || "The classical Ayurvedic assessment has been synchronized with the practitioner's EHR desk."}
                </p>
                <button className="primary-btn" onClick={() => onNavigate("doctor")} style={{ padding: "8px 18px", fontSize: 13 }}>
                  {t("switchToDoctorViewBtn") || "Open Doctor Desk View"}
                </button>
              </div>
            )}

            {/* Booking Confirmation Banner for OPD Queue Appointment */}
            {bookingSuccess && (
              <div style={{ marginTop: 20, padding: 18, background: "#eff6ff", border: "1.5px solid #93c5fd", borderRadius: 14, textAlign: "center" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#2563eb", color: "#fff", display: "grid", placeItems: "center", margin: "0 auto 8px" }}>
                  <Calendar size={24} />
                </div>
                <h3 style={{ margin: "0 0 6px", color: "#1e3a8a" }}>
                  {t("ayushConsultConfirmedTitle") || "Ayurvedic Consultation Confirmed"}
                </h3>
                <p style={{ margin: "0 0 14px", color: "#1e40af", fontSize: 13.5 }}>
                  {t("ayushConsultConfirmedBody", {
                    token: bookingSuccess.tokenNumber,
                    doctor: bookingSuccess.doctor,
                    hospital: bookingSuccess.hospital,
                    time: bookingSuccess.time
                  }) || `Token #${bookingSuccess.tokenNumber} confirmed with ${bookingSuccess.doctor} at ${bookingSuccess.hospital} (${bookingSuccess.time}).`}
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
                  <button className="primary-btn" onClick={() => onNavigate("dashboard")}>
                    {t("dashboard") || "Return to Dashboard"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
