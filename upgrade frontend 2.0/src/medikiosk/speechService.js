/**
 * MediKiosk Voice & Speech Service
 * 
 * Provides dual-mode voice interaction:
 * 1. Speech Recognition (Web Speech API / SpeechRecognition) with auto-language detection
 * 2. Speech Synthesis (Text-to-Speech) for low-literacy & elderly patients across 6 languages:
 *    - English (en / en-IN / en-US / en-GB)
 *    - Hindi (hi / hi-IN)
 *    - Bengali (bn / bn-IN / bn-BD)
 *    - Marathi (mr / mr-IN)
 *    - Telugu (te / te-IN)
 *    - Tamil (ta / ta-IN / ta-LK)
 * 3. Asynchronous voice loading with onvoiceschanged event handling.
 * 4. Strict voice selection: NEVER speaks Indic text with an English voice.
 * 5. Non-intrusive fallback notification callback when device lacks voices for a language.
 * 6. Pluggable Cloud TTS Fallback interface (Bhashini Indic-TTS & Google Cloud TTS).
 */

// Centralized Language to Locale & Voice Configuration
export const TTS_LANGUAGE_CONFIG = {
  en: { base: "en", lang: "en-IN", fallbacks: ["en-US", "en-GB", "en"], label: "English" },
  hi: { base: "hi", lang: "hi-IN", fallbacks: ["hi"], label: "Hindi" },
  bn: { base: "bn", lang: "bn-IN", fallbacks: ["bn", "bn-BD"], label: "Bengali" },
  mr: { base: "mr", lang: "mr-IN", fallbacks: ["mr"], label: "Marathi" },
  te: { base: "te", lang: "te-IN", fallbacks: ["te"], label: "Telugu" },
  ta: { base: "ta", lang: "ta-IN", fallbacks: ["ta", "ta-LK"], label: "Tamil" }
};

// Legacy LOCALE_MAP for SpeechRecognition backward compatibility
export const LOCALE_MAP = {
  "en": "en-IN",
  "en-IN": "en-IN",
  "hi": "hi-IN",
  "hi-IN": "hi-IN",
  "ta": "ta-IN",
  "ta-IN": "ta-IN",
  "te": "te-IN",
  "te-IN": "te-IN",
  "bn": "bn-IN",
  "bn-IN": "bn-IN",
  "mr": "mr-IN",
  "mr-IN": "mr-IN",
  "gu": "gu-IN",
  "gu-IN": "gu-IN",
  "kn": "kn-IN",
  "kn-IN": "kn-IN"
};

/**
 * Resolves any language code or locale string (e.g. 'hi', 'hi-IN', 'hi_IN', 'en-US')
 * to its corresponding TTS configuration.
 */
export function resolveTtsConfig(langCode) {
  if (!langCode) return TTS_LANGUAGE_CONFIG.en;
  const normalized = String(langCode).trim().toLowerCase().replace(/_/g, "-");
  const base = normalized.split("-")[0];

  if (TTS_LANGUAGE_CONFIG[base]) {
    return TTS_LANGUAGE_CONFIG[base];
  }

  for (const key of Object.keys(TTS_LANGUAGE_CONFIG)) {
    const cfg = TTS_LANGUAGE_CONFIG[key];
    if (cfg.lang.toLowerCase() === normalized || cfg.fallbacks.some((f) => f.toLowerCase() === normalized)) {
      return cfg;
    }
  }

  return TTS_LANGUAGE_CONFIG.en;
}

class SpeechService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.currentLanguage = "en-IN";
    this.onTranscriptCallback = null;
    this.onErrorCallback = null;
    this.onStateChangeCallback = null;
    this.onVoiceUnavailableCallback = null;
    this.cachedVoices = [];
    this.currentAudio = null;
    this.synth = typeof window !== "undefined" ? window.speechSynthesis : null;

    this.initRecognition();
    this.initVoices();
  }

  initRecognition() {
    if (typeof window === "undefined") return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Web Speech API (SpeechRecognition) is not supported in this browser. Touch fallback will be active.");
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = LOCALE_MAP[this.currentLanguage] || "en-IN";

      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.onStateChangeCallback) this.onStateChangeCallback(true);
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (this.onTranscriptCallback) {
          this.onTranscriptCallback({
            final: finalTranscript.trim(),
            interim: interimTranscript.trim()
          });
        }
      };

      this.recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          this.stopListening();
        }
        if (this.onErrorCallback) this.onErrorCallback(event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.onStateChangeCallback) this.onStateChangeCallback(false);
      };
    } catch (err) {
      console.warn("Could not initialize SpeechRecognition:", err);
    }
  }

  initVoices() {
    if (!this.synth) return;
    try {
      const existing = this.synth.getVoices();
      if (existing && existing.length > 0) {
        this.cachedVoices = existing;
      }
      if (typeof this.synth.addEventListener === "function") {
        this.synth.addEventListener("voiceschanged", () => {
          this.cachedVoices = this.synth.getVoices() || [];
        });
      } else {
        this.synth.onvoiceschanged = () => {
          this.cachedVoices = this.synth.getVoices() || [];
        };
      }
    } catch (err) {
      console.warn("Could not attach voiceschanged listener:", err);
    }
  }

  /**
   * Asynchronously retrieves voices from window.speechSynthesis,
   * waiting for the 'voiceschanged' event if the voice list is initially empty.
   */
  async getVoicesAsync(timeoutMs = 1200) {
    if (!this.synth) return [];

    const current = this.synth.getVoices();
    if (current && current.length > 0) {
      this.cachedVoices = current;
      return current;
    }

    if (this.cachedVoices && this.cachedVoices.length > 0) {
      return this.cachedVoices;
    }

    return new Promise((resolve) => {
      let resolved = false;

      const handleVoicesChanged = () => {
        if (resolved) return;
        const voices = this.synth.getVoices() || [];
        if (voices.length > 0) {
          resolved = true;
          this.cachedVoices = voices;
          if (typeof this.synth.removeEventListener === "function") {
            this.synth.removeEventListener("voiceschanged", handleVoicesChanged);
          }
          resolve(voices);
        }
      };

      if (typeof this.synth.addEventListener === "function") {
        this.synth.addEventListener("voiceschanged", handleVoicesChanged);
      } else {
        this.synth.onvoiceschanged = handleVoicesChanged;
      }

      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          const voices = (this.synth && this.synth.getVoices()) || [];
          this.cachedVoices = voices;
          resolve(voices);
        }
      }, timeoutMs);
    });
  }

  /**
   * Finds the most suitable SpeechSynthesisVoice for the target language.
   * Hierarchy:
   * 1. Exact match on voice.lang (e.g. 'hi-IN' or 'hi_IN')
   * 2. Prefix match on language subtag (e.g. voice.lang starts with 'hi-' or equals 'hi')
   * 3. Configured fallbacks (e.g. 'bn-BD', 'en-US', etc.)
   * 4. Returns null if no matching voice found.
   * CRITICAL: NEVER returns an English voice for non-English text!
   */
  findVoiceForLanguage(langCode, voices = []) {
    if (!voices || voices.length === 0) return null;

    const config = resolveTtsConfig(langCode);
    const targetLang = config.lang.toLowerCase().replace(/_/g, "-");
    const baseLang = config.base.toLowerCase();

    // 1. Exact match on voice.lang (e.g. "hi-in" or "hi_in")
    let voice = voices.find((v) => {
      const vLang = (v.lang || "").toLowerCase().replace(/_/g, "-");
      return vLang === targetLang;
    });
    if (voice) return voice;

    // 2. Prefix match on base language subtag (e.g. "hi" or "hi-...")
    voice = voices.find((v) => {
      const vLang = (v.lang || "").toLowerCase().replace(/_/g, "-");
      return vLang === baseLang || vLang.startsWith(`${baseLang}-`);
    });
    if (voice) return voice;

    // 3. Check against configured fallbacks
    for (const fb of config.fallbacks) {
      const fbNorm = fb.toLowerCase().replace(/_/g, "-");
      voice = voices.find((v) => {
        const vLang = (v.lang || "").toLowerCase().replace(/_/g, "-");
        return vLang === fbNorm || vLang.startsWith(`${fbNorm}-`);
      });
      if (voice) return voice;
    }

    // 4. Return null if no matching voice is found
    return null;
  }

  /**
   * Set callback for when a requested language voice is unavailable on the user's device.
   */
  setOnVoiceUnavailable(callback) {
    this.onVoiceUnavailableCallback = callback;
  }

  setLanguage(langCode) {
    this.stopSpeaking();
    const config = resolveTtsConfig(langCode);
    this.currentLanguage = config.lang;

    if (this.recognition) {
      this.recognition.lang = config.lang;
    }
  }

  startListening(onTranscript, onError, onStateChange) {
    this.onTranscriptCallback = onTranscript;
    this.onErrorCallback = onError;
    this.onStateChangeCallback = onStateChange;

    if (!this.recognition) {
      if (onError) onError("browser-unsupported");
      return false;
    }

    try {
      if (this.isListening) {
        this.recognition.stop();
      }
      const config = resolveTtsConfig(this.currentLanguage);
      this.recognition.lang = config.lang;
      this.recognition.start();
      return true;
    } catch (err) {
      console.warn("Failed to start speech recognition:", err);
      if (onError) onError("start-failed");
      return false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn("Error stopping speech recognition:", err);
      }
    }
    this.isListening = false;
    if (this.onStateChangeCallback) this.onStateChangeCallback(false);
  }

  /**
   * Reads text aloud using Web Speech Synthesis or Cloud Indic TTS fallback.
   * Guarantees:
   * - Voices are loaded asynchronously.
   * - Native voices used when installed (e.g. English, Hindi).
   * - Seamlessly falls back to Cloud Indic TTS if device lacks native voice (e.g. Telugu, Marathi, Bengali, Tamil).
   * - Text is NEVER spoken using an incompatible English voice.
   */
  async speak(text, langCode = this.currentLanguage, optionsOrOnEnd = null) {
    if (!text || !String(text).trim()) {
      return { success: false, reason: "empty-text" };
    }

    const options = typeof optionsOrOnEnd === "function" ? { onEnd: optionsOrOnEnd } : (optionsOrOnEnd || {});
    const config = resolveTtsConfig(langCode);

    try {
      // Cancel any ongoing speech and audio before starting a new one
      this.stopSpeaking();

      // Check if native voice is available
      const voices = await this.getVoicesAsync();
      const matchingVoice = this.findVoiceForLanguage(langCode, voices);

      if (!matchingVoice) {
        console.info(
          `[SpeechService] Device lacks native voice for ${config.label} (${config.lang}). Synthesizing via Cloud Indic TTS...`
        );

        const apiBase = (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) || "http://localhost:4000";
        const ttsUrl = `${apiBase}/api/tts?lang=${encodeURIComponent(config.base)}&text=${encodeURIComponent(text.slice(0, 350))}`;

        try {
          const audio = new Audio(ttsUrl);
          this.currentAudio = audio;

          audio.onended = () => {
            this.currentAudio = null;
            if (typeof options.onEnd === "function") options.onEnd();
          };

          audio.onerror = (audioErr) => {
            console.warn("[SpeechService] Cloud audio playback error:", audioErr);
            this.currentAudio = null;
            if (typeof options.onError === "function") options.onError(audioErr);
          };

          await audio.play();
          return {
            success: true,
            voice: `Cloud Indic Voice (${config.label})`,
            lang: config.lang,
            mode: "cloud-tts"
          };
        } catch (audioErr) {
          console.warn("[SpeechService] Cloud audio playback failed:", audioErr);
          // Only trigger the fallback notice if even cloud playback failed
          const availableLocales = [...new Set(voices.map((v) => v.lang))];
          const fallbackInfo = {
            language: config.base,
            locale: config.lang,
            label: config.label,
            availableLocales
          };
          if (typeof options.onFallback === "function") {
            options.onFallback(fallbackInfo);
          }
          if (typeof this.onVoiceUnavailableCallback === "function") {
            this.onVoiceUnavailableCallback(fallbackInfo);
          }
          return {
            success: false,
            reason: "voice-unavailable",
            language: config.base,
            label: config.label
          };
        }
      }

      // Voice found: configure utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = matchingVoice;
      utterance.lang = matchingVoice.lang || config.lang;
      utterance.rate = options.rate ?? 0.92; // Slightly slower for clinical clarity
      utterance.pitch = options.pitch ?? 1.0;

      if (typeof options.onEnd === "function") {
        utterance.onend = options.onEnd;
      }
      if (typeof options.onError === "function") {
        utterance.onerror = (e) => {
          console.warn("[SpeechService] Utterance error:", e);
          options.onError(e);
        };
      }

      if (this.synth) {
        this.synth.speak(utterance);
      }
      return {
        success: true,
        voice: matchingVoice.name,
        lang: matchingVoice.lang,
        label: config.label
      };
    } catch (err) {
      console.warn("[SpeechService] Speech synthesis failed:", err);
      return { success: false, reason: "execution-error", error: err };
    }
  }

  stopSpeaking() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (err) {
        console.warn("[SpeechService] Error stopping audio:", err);
      }
      this.currentAudio = null;
    }
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (err) {
        console.warn("[SpeechService] Error stopping speech synthesis:", err);
      }
    }
  }

  isSupported() {
    return typeof window !== "undefined" && !!(window.speechSynthesis || window.SpeechRecognition || window.webkitSpeechRecognition);
  }
}

export const speechService = new SpeechService();

/**
 * Pluggable Cloud TTS Fallback Service
 * 
 * Provides an integration interface for cloud-based TTS services when
 * the client browser / OS lacks installed native voices for Indic languages.
 * Supported backends:
 * 1. Bhashini Indic-TTS (National Language Translation Mission / AI4Bharat)
 * 2. Google Cloud Text-to-Speech (Neural2 / Wavenet Indic voices)
 */
export const cloudTtsService = {
  /**
   * Synthesize speech using external cloud TTS API.
   * Returns an audio URL or base64 data URI that can be played via HTML5 Audio.
   */
  async synthesize({ text, language = "hi", provider = "bhashini" }) {
    const config = resolveTtsConfig(language);

    console.info(
      `[CloudTTS] Requesting ${provider} synthesis for ${config.label} (${config.lang}): "${text.slice(0, 35)}..."`
    );

    // In a live production deployment, execute:
    // Bhashini: POST https://dhruva-api.bhashini.gov.in/services/inference/pipeline
    // Google Cloud: POST https://texttospeech.googleapis.com/v1/text:synthesize
    return {
      success: true,
      provider,
      language: config.lang,
      audioUrl: null, // Stream or Blob URL in live deployment
      note: "Cloud TTS fallback ready for Bhashini/Google Cloud API key integration."
    };
  }
};

/**
 * Pluggable Bhashini (National Language Translation Mission) Indic ASR/TTS Mock Layer.
 * In a production hospital kiosk, replace these methods with real REST calls to
 * https://dhruva-api.bhashini.gov.in/services/inference/pipeline
 */
export async function mockBhashiniTranscribe(audioBlob, sourceLanguage = "hi") {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        transcript: "मुझे दो दिनों से सीने में भारी दर्द और पसीना आ रहा है।",
        confidence: 0.94,
        sourceLanguage,
        service: "Bhashini-AI4Bharat-IndicConformer-Demo"
      });
    }, 600);
  });
}
