import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export type Language = "sv" | "en" | "es";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "dj-lobo-language";
const VALID: Language[] = ["sv", "en", "es"];

/**
 * Read the initial language. URL prefix wins (it's the canonical source for
 * SEO and bookmarks); then localStorage; then browser Accept-Language;
 * finally "sv".
 */
const getInitialLanguage = (): Language => {
  if (typeof window === "undefined") return "sv";
  const seg = window.location.pathname.split("/")[1];
  if (seg && (VALID as string[]).includes(seg)) return seg as Language;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && (VALID as string[]).includes(stored)) return stored as Language;
  } catch {
    /* localStorage may be unavailable (SSR / private mode) */
  }
  if (typeof navigator !== "undefined") {
    const candidates = (navigator.languages?.length
      ? navigator.languages
      : [navigator.language]
    )
      .filter(Boolean)
      .map((l) => l.toLowerCase().split("-")[0]);
    for (const c of candidates) {
      if ((VALID as string[]).includes(c)) return c as Language;
    }
  }
  return "sv";
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const location = useLocation();
  const navigate = useNavigate();

  // URL is the source of truth: when the path's lang segment changes
  // (e.g. user clicks a link to /en/lyssna), mirror it into state.
  useEffect(() => {
    const seg = location.pathname.split("/")[1];
    if (seg && (VALID as string[]).includes(seg) && seg !== language) {
      setLanguageState(seg as Language);
    }
  }, [location.pathname, language]);

  // Keep <html lang="…"> in sync.
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  // Cross-tab sync.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      if ((VALID as string[]).includes(e.newValue) && e.newValue !== language) {
        setLanguageState(e.newValue as Language);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore quota / privacy errors */
    }
    // Swap the language segment in the current URL so search engines and
    // shared links reflect the active language.
    const parts = location.pathname.split("/");
    if (parts[1] && (VALID as string[]).includes(parts[1])) {
      parts[1] = lang;
    } else {
      parts.splice(1, 0, lang);
    }
    const next = parts.join("/").replace(/\/+$/, "") || `/${lang}`;
    if (next !== location.pathname) {
      navigate(`${next}${location.search}${location.hash}`, { replace: false });
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
