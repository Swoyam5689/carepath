import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { SPEECH_LANG_MAP, SUPPORTED_LANGUAGES } from "../i18n/languages.js";

/**
 * Enhanced Web Speech API Voice Input (Speech-to-Text) Hook.
 * Supports all 6 CarePath languages (en-IN, hi-IN, bn-IN, mr-IN, te-IN, ta-IN).
 * 
 * Guarantees:
 * - Dynamic language resolution from LanguageContext at start of recognition (no stale closure).
 * - Live interim transcript streaming.
 * - Comprehensive error handling with localized, user-friendly messages.
 * - Auto-silence safety timeout to prevent hanging microphone sessions.
 * - Up-front browser capability detection.
 */
export function useVoiceInput(options = {}) {
  const { language: contextLang, t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState("prompt"); // "granted" | "denied" | "prompt"

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Browser capability check
  const isSupported = typeof window !== "undefined" && Boolean(
    window.SpeechRecognition || window.webkitSpeechRecognition
  );

  // Monitor microphone permission if Permissions API is supported
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.permissions?.query) {
      navigator.permissions.query({ name: "microphone" })
        .then((permission) => {
          setPermissionStatus(permission.state);
          permission.onchange = () => setPermissionStatus(permission.state);
        })
        .catch(() => {
          // Permissions API query for microphone may not be supported in all browsers
        });
    }
  }, []);

  // Map Web Speech API error codes to localized user-facing feedback
  const getErrorMessage = useCallback((errorCode, langCode) => {
    const langObj = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
    const langLabel = langObj?.nativeLabel || langObj?.label || langCode;

    switch (errorCode) {
      case "no-speech":
        return t("micNoSpeech") || "I didn't catch that — please try speaking again.";
      case "audio-capture":
        return t("micNoDevice") || "No microphone detected. Please check your device settings.";
      case "not-allowed":
      case "permission-denied":
      case "service-not-allowed":
        return t("micPermissionDenied") || "Microphone access is blocked. Please allow microphone permissions in your browser settings.";
      case "network":
        return t("micNetworkError") || "Voice input needs an internet connection. Please check your connection and try again.";
      case "language-not-supported":
        return (t("micLangUnsupported", { language: langLabel }) || `Voice input for ${langLabel} is not available in this browser.`);
      case "aborted":
        return null;
      default:
        return `Voice input error (${errorCode}). Please try again or type your notes.`;
    }
  }, [t]);

  // Clean up any active session and timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  // Stop listening
  const stopListening = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn("[useVoiceInput] Error stopping speech recognition:", err);
      }
    }
    setIsListening(false);
  }, []);

  // Clear current transcript and errors
  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    setError(null);
  }, []);

  // Start listening session
  const startListening = useCallback((callOptions = {}) => {
    if (!isSupported) {
      const msg = t("micUnsupported") || "Voice input is not supported in this browser. Please use Chrome, Edge, or Brave.";
      setError({ code: "browser-unsupported", message: msg });
      optionsRef.current.onError?.({ code: "browser-unsupported", message: msg });
      return false;
    }

    // Stop any existing session
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setError(null);
    setInterimTranscript("");

    const activeLang = callOptions.language || optionsRef.current.language || contextLang || "en";
    const activeLocale = SPEECH_LANG_MAP[activeLang] || "en-IN";
    const continuous = callOptions.continuous ?? optionsRef.current.continuous ?? false;
    const interimResults = callOptions.interimResults ?? optionsRef.current.interimResults ?? true;
    const maxAlternatives = callOptions.maxAlternatives ?? optionsRef.current.maxAlternatives ?? 1;
    const timeoutMs = callOptions.timeoutMs ?? optionsRef.current.timeoutMs ?? (continuous ? 20000 : 12000);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = activeLocale;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = maxAlternatives;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      optionsRef.current.onStart?.();

      // Auto-silence safety timeout
      if (timeoutMs > 0) {
        timerRef.current = setTimeout(() => {
          console.info("[useVoiceInput] Auto-stopping speech recognition after timeout");
          stopListening();
        }, timeoutMs);
      }
    };

    recognition.onspeechend = () => {
      if (!continuous) {
        try {
          recognition.stop();
        } catch {}
      }
    };

    recognition.onresult = (event) => {
      let accumulatedFinal = "";
      let currentInterim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i];
        if (item.isFinal) {
          accumulatedFinal += item[0].transcript;
        } else {
          currentInterim += item[0].transcript;
        }
      }

      setInterimTranscript(currentInterim);

      if (accumulatedFinal) {
        setTranscript((prev) => {
          const updated = prev ? `${prev} ${accumulatedFinal.trim()}` : accumulatedFinal.trim();
          optionsRef.current.onFinalTranscript?.(accumulatedFinal.trim(), updated);
          return updated;
        });
      }

      optionsRef.current.onTranscript?.({
        final: accumulatedFinal.trim(),
        interim: currentInterim.trim(),
        full: (transcript + (accumulatedFinal ? ` ${accumulatedFinal}` : "")).trim()
      });

      // Reset the safety timeout on speech activity
      if (timerRef.current && timeoutMs > 0) {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => stopListening(), timeoutMs);
      }
    };

    recognition.onerror = (event) => {
      console.warn("[useVoiceInput] Speech recognition error:", event.error);
      const userMessage = getErrorMessage(event.error, activeLang);

      if (event.error === "not-allowed" || event.error === "permission-denied") {
        setPermissionStatus("denied");
      }

      if (userMessage) {
        setError({ code: event.error, message: userMessage });
        optionsRef.current.onError?.({ code: event.error, message: userMessage });
      }

      setIsListening(false);
    };

    recognition.onend = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setIsListening(false);
      setInterimTranscript("");
      optionsRef.current.onEnd?.();
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      return true;
    } catch (err) {
      console.warn("[useVoiceInput] Failed to start recognition:", err);
      const userMessage = "Could not initialize microphone. Please check permissions.";
      setError({ code: "start-failed", message: userMessage });
      optionsRef.current.onError?.({ code: "start-failed", message: userMessage });
      setIsListening(false);
      return false;
    }
  }, [contextLang, getErrorMessage, isSupported, stopListening, t, transcript]);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    permissionStatus,
    activeLocale: SPEECH_LANG_MAP[contextLang] || "en-IN",
    activeLang: contextLang,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript
  };
}
