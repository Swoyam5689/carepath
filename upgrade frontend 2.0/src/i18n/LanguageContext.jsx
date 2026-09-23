import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { SUPPORTED_LANGUAGES, TRANSLATIONS, formatTranslation, toBhashiniLocale, fromBhashiniLocale } from "./languages.js";
import { Globe, Check } from "lucide-react";

const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {},
  t: (key, params) => key,
  languages: SUPPORTED_LANGUAGES,
  bhashiniLocale: "en-IN"
});

export const STORAGE_KEY = "carepath_preferred_language";

export function LanguageProvider({ children, userPreferredLanguage, onLanguagePersist }) {
  const [language, setLanguageState] = useState(() => {
    // Priority:
    // 1. Authenticated user's preference if provided
    // 2. Local browser storage
    // 3. System browser language
    // 4. English default
    if (userPreferredLanguage && TRANSLATIONS[userPreferredLanguage]) {
      return userPreferredLanguage;
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && TRANSLATIONS[saved]) {
      return saved;
    }
    const browserLang = navigator.language?.slice(0, 2);
    if (browserLang && TRANSLATIONS[browserLang]) {
      return browserLang;
    }
    return "en";
  });

  // Keep in sync if authenticated user profile updates
  useEffect(() => {
    if (userPreferredLanguage && TRANSLATIONS[userPreferredLanguage] && userPreferredLanguage !== language) {
      setLanguageState(userPreferredLanguage);
      localStorage.setItem(STORAGE_KEY, userPreferredLanguage);
    }
  }, [userPreferredLanguage]);

  const setLanguage = useCallback((code) => {
    if (!TRANSLATIONS[code]) return;
    setLanguageState(code);
    localStorage.setItem(STORAGE_KEY, code);
    if (onLanguagePersist) {
      onLanguagePersist(code);
    }
    // Update HTML lang attribute for accessibility and screen readers
    document.documentElement.lang = code;
  }, [onLanguagePersist]);

  // Translation lookup with fallback to English
  const t = useCallback((key, params = {}) => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    const fallbackDict = TRANSLATIONS.en;
    const template = langDict[key] ?? fallbackDict[key] ?? key;
    return formatTranslation(template, params);
  }, [language]);

  const bhashiniLocale = toBhashiniLocale(language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: SUPPORTED_LANGUAGES, bhashiniLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

// Universal persistent language selector component
export function LanguageSelector({ variant = "default", className = "" }) {
  const { language, setLanguage, languages, t } = useLanguage();
  const [open, setOpen] = useState(false);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (!e.target.closest(".language-selector-wrapper")) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const current = languages.find((l) => l.code === language) || languages[0] || {};
  const currentNative = current.nativeLabel || current.nativeName || current.label || current.name || "English";
  const currentEnglish = current.label || current.name || "English";

  return (
    <div className={`language-selector-wrapper ${className}`} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        className={`language-selector-btn ${variant === "compact" ? "compact" : ""}`}
        onClick={() => setOpen(!open)}
        aria-label={t("changeLanguage") ? `${t("changeLanguage")}: ${currentNative}` : `Change language. Current: ${currentEnglish}`}
        aria-expanded={open}
        aria-haspopup="listbox"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          background: variant === "subtle" ? "var(--bg-subtle, rgba(255,255,255,0.85))" : "var(--bg-surface, #ffffff)",
          border: "1px solid var(--line, #e2e8f0)",
          borderRadius: 10,
          padding: variant === "compact" ? "5px 9px" : "7px 13px",
          fontSize: variant === "compact" ? 11 : 13,
          fontWeight: 600,
          color: "var(--ink, #1e293b)",
          cursor: "pointer",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          transition: "all 0.15s ease"
        }}
      >
        <Globe size={variant === "compact" ? 13 : 15} color="var(--green, #0d9488)" />
        <span>{current.flag ? `${current.flag} ` : ""}{currentNative}</span>
        <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 400 }}>({currentEnglish})</span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("selectLanguage") || "Select preferred language"}
          className="language-dropdown-menu"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            background: "var(--bg-surface, #ffffff)",
            border: "1px solid var(--line, #e2e8f0)",
            borderRadius: 12,
            padding: "6px",
            listStyle: "none",
            margin: 0,
            boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
            minWidth: 190,
            zIndex: 1000,
            animation: "fadeIn 0.15s ease"
          }}
        >
          {languages.map((item) => {
            const isSelected = item.code === language;
            const itemNative = item.nativeLabel || item.nativeName || item.label || item.name;
            const itemEnglish = item.label || item.name;
            return (
              <li
                key={item.code}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  setLanguage(item.code);
                  setOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? "var(--green, #0d9488)" : "var(--ink, #1e293b)",
                  background: isSelected ? "var(--green-soft, #f0fdfa)" : "transparent",
                  cursor: "pointer",
                  transition: "background 0.1s ease"
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "var(--bg-subtle, #f8fafc)";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "transparent";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {item.flag && <span style={{ fontSize: 14 }}>{item.flag}</span>}
                  <div>
                    <span style={{ display: "block", fontWeight: 600 }}>{itemNative}</span>
                    <span style={{ fontSize: 10, color: "#64748b" }}>{itemEnglish}</span>
                  </div>
                </div>
                {isSelected && <Check size={14} color="var(--green, #0d9488)" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
