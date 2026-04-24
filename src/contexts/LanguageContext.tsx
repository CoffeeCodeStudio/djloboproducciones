import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Language = "sv" | "en" | "es";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "dj-lobo-language";
const VALID: Language[] = ["sv", "en", "es"];

/** Read the persisted language synchronously so the first paint matches. */
const getInitialLanguage = (): Language => {
  if (typeof window === "undefined") return "sv";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && (VALID as string[]).includes(stored)) return stored as Language;
  } catch {
    /* localStorage may be unavailable (SSR / private mode) */
  }
  return "sv";
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  // Keep <html lang="…"> in sync so screen-readers, browser translate prompts
  // and SEO crawlers see the active language.
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore quota / privacy errors — UI still reflects the change */
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
