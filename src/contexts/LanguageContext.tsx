import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useLocation, useNavigate, useInRouterContext } from "react-router-dom";

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
  const inRouter = useInRouterContext();

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
    if (typeof window !== "undefined") {
      const parts = window.location.pathname.split("/");
      if (parts[1] && (VALID as string[]).includes(parts[1])) {
        parts[1] = lang;
      } else {
        parts.splice(1, 0, lang);
      }
      const next = parts.join("/").replace(/\/+$/, "") || `/${lang}`;
      if (next !== window.location.pathname) {
        // Use history API directly so this works even outside <Router>.
        window.history.pushState({}, "", `${next}${window.location.search}${window.location.hash}`);
        // Notify React Router (and anything else listening) of the change.
        window.dispatchEvent(new PopStateEvent("popstate"));
      }
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {inRouter ? <RouterUrlSync language={language} setLanguageState={setLanguageState} /> : null}
      {children}
    </LanguageContext.Provider>
  );
};

/** Router-aware child: mirrors the URL's lang segment into state. Only mounted
 *  when a <Router> ancestor exists, so LanguageProvider stays safe to render
 *  outside one (error boundaries, fallback UIs, etc.). */
const RouterUrlSync = ({
  language,
  setLanguageState,
}: {
  language: Language;
  setLanguageState: (l: Language) => void;
}) => {
  const location = useLocation();
  // Imported for side-effect parity with previous version; navigate isn't
  // strictly needed here but kept to keep the hook order stable if reintroduced.
  useNavigate();
  useEffect(() => {
    const seg = location.pathname.split("/")[1];
    if (seg && (VALID as string[]).includes(seg) && seg !== language) {
      setLanguageState(seg as Language);
    }
  }, [location.pathname, language, setLanguageState]);
  return null;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
