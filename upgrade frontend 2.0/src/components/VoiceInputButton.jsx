import React from "react";
import { Mic, MicOff, Square, AlertCircle, Sparkles } from "lucide-react";
import { useVoiceInput } from "../hooks/useVoiceInput.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { SUPPORTED_LANGUAGES } from "../i18n/languages.js";

/**
 * Universal Voice Input Button & Visualizer Component.
 * 
 * Props:
 * - onTranscript: callback({ final, interim, full })
 * - onFinalTranscript: callback(finalText, accumulatedText)
 * - continuous: boolean (default false)
 * - variant: "inline" | "button" | "pill" (default "button")
 * - label: optional custom label
 * - className: optional CSS classes
 * - disabled: boolean
 * - showInterimPill: boolean (default true)
 */
export function VoiceInputButton({
  onTranscript,
  onFinalTranscript,
  continuous = false,
  variant = "button",
  label,
  className = "",
  disabled = false,
  showInterimPill = true
}) {
  const { language, t } = useLanguage();
  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  const {
    isSupported,
    isListening,
    interimTranscript,
    error,
    startListening,
    stopListening
  } = useVoiceInput({
    continuous,
    onTranscript,
    onFinalTranscript
  });

  function handleToggle(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }

  // If browser does not support SpeechRecognition
  if (!isSupported) {
    return (
      <button
        type="button"
        className={`voice-input-btn unsupported ${variant} ${className}`}
        disabled
        title={t("micUnsupported") || "Voice input is supported in Chrome, Edge, and Brave."}
        aria-label={t("micUnsupported") || "Voice input unsupported"}
      >
        <MicOff size={16} />
        {variant !== "inline" && <span>{label || t("dictateNotes") || "Tap to Speak"}</span>}
      </button>
    );
  }

  return (
    <div className={`voice-input-container ${variant} ${className}`}>
      <button
        type="button"
        className={`voice-input-btn ${isListening ? "listening" : ""} ${variant}`}
        onClick={handleToggle}
        disabled={disabled}
        title={
          isListening
            ? t("micStop") || "Stop listening"
            : t("micListeningIn", { language: currentLangObj.nativeLabel || currentLangObj.label }) || `Speak in ${currentLangObj.label}`
        }
        aria-label={isListening ? t("micStop") : t("micSpeakNow")}
      >
        {isListening ? (
          <>
            <span className="voice-pulse-ring" />
            <span className="voice-equalizer-bars">
              <span /><span /><span /><span />
            </span>
            <Square size={13} className="voice-stop-icon" />
            {variant !== "inline" && (
              <span className="listening-text">
                {label || t("micListening") || "Listening..."}
              </span>
            )}
          </>
        ) : (
          <>
            <Mic size={16} />
            {variant !== "inline" && (
              <span>
                {label || t("dictateNotes") || `Tap to Speak (${currentLangObj.nativeLabel || currentLangObj.code.toUpperCase()})`}
              </span>
            )}
          </>
        )}
      </button>

      {/* Live Interim Transcript Pill */}
      {showInterimPill && isListening && (
        <div className="voice-live-interim-pill" role="status" aria-live="polite">
          <div className="voice-live-indicator">
            <span className="voice-dot-live" />
            <span className="voice-lang-tag">
              {currentLangObj.nativeLabel} ({currentLangObj.code.toUpperCase()})
            </span>
          </div>
          <span className="voice-interim-text">
            {interimTranscript || t("micSpeakNow") || "Speak now..."}
          </span>
          <button
            type="button"
            className="voice-mini-stop-btn"
            onClick={stopListening}
            title={t("micStop")}
          >
            {t("micStop") || "Done"}
          </button>
        </div>
      )}

      {/* Error Message Tooltip / Banner */}
      {error && !isListening && (
        <div className="voice-error-toast" role="alert">
          <AlertCircle size={14} />
          <span>{error.message}</span>
        </div>
      )}
    </div>
  );
}
