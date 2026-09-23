import React, { createContext, useContext, useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const THEME_STORAGE_KEY = "carepath-theme";

const ThemeContext = createContext({
  theme: "light",
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {}
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === "dark" || saved === "light") return saved;
      if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    } catch {}
    return "light";
  });

  const isDark = theme === "dark";

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-theme", theme);
        document.body.setAttribute("data-theme", theme);
      }
    } catch (err) {
      console.warn("CarePath theme persistence failed:", err);
    }
  }, [theme]);

  // Sync with OS theme changes if user has not explicitly chosen
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      const userSaved = localStorage.getItem(THEME_STORAGE_KEY);
      if (!userSaved) {
        setThemeState(e.matches ? "dark" : "light");
      }
    };
    mediaQuery.addEventListener?.("change", handler);
    return () => mediaQuery.removeEventListener?.("change", handler);
  }, []);

  const setTheme = (newTheme) => {
    const validated = newTheme === "dark" ? "dark" : "light";
    setThemeState(validated);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}

export function ThemeToggle({ variant = "compact", className = "" }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();

  const titleText = isDark
    ? (t("switchToLightMode") || "Switch to Light Mode")
    : (t("switchToDarkMode") || "Switch to Dark Mode");

  const labelText = isDark
    ? (t("lightMode") || "Light")
    : (t("darkMode") || "Dark");

  return (
    <button
      type="button"
      className={`theme-toggle-btn ${variant === "compact" ? "compact" : ""} ${className}`}
      onClick={toggleTheme}
      title={titleText}
      aria-label={titleText}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "var(--bg-surface, #ffffff)",
        border: "1px solid var(--line, #e2e8f0)",
        borderRadius: 10,
        padding: variant === "compact" ? "5px 10px" : "7px 14px",
        fontSize: variant === "compact" ? 11.5 : 13,
        fontWeight: 600,
        color: "var(--ink, #1e293b)",
        cursor: "pointer",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        transition: "all 0.2s ease",
        height: variant === "compact" ? 31 : 38
      }}
    >
      {isDark ? (
        <Sun size={variant === "compact" ? 14 : 16} color="#fbbf24" style={{ flexShrink: 0 }} />
      ) : (
        <Moon size={variant === "compact" ? 14 : 16} color="#6366f1" style={{ flexShrink: 0 }} />
      )}
      <span style={{ lineHeight: 1 }}>{labelText}</span>
    </button>
  );
}
