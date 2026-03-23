import { useState, useEffect } from "react";
import { Info, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

const translations = {
  sv: {
    message: "Denna sajt använder lokal lagring i din webbläsare för att spara inställningar. Inbäddade videor från YouTube och Mixcloud kan använda sina egna cookies.",
    learnMore: "Läs vår sekretesspolicy",
  },
  en: {
    message: "This site uses local storage in your browser to save settings. Embedded videos from YouTube and Mixcloud may use their own cookies.",
    learnMore: "Read our privacy policy",
  },
  es: {
    message: "Este sitio utiliza almacenamiento local en tu navegador para guardar configuraciones. Los videos incrustados de YouTube y Mixcloud pueden usar sus propias cookies.",
    learnMore: "Leer nuestra política de privacidad",
  },
};

const NOTICE_DISMISSED_KEY = "dj-lobo-storage-notice-dismissed";

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    const dismissed = localStorage.getItem(NOTICE_DISMISSED_KEY);
    if (!dismissed) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(NOTICE_DISMISSED_KEY, "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-20 sm:bottom-24 left-4 right-4 z-50 animate-fade-in"
      role="status"
      aria-label="Information om datalagring"
    >
      <div className="max-w-lg mx-auto glass-card rounded-xl p-4 shadow-lg border border-white/10">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-neon-cyan flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground/90 mb-2">
              {t.message}
            </p>
            <Link
              to="/privacy"
              className="text-xs text-neon-cyan hover:underline"
            >
              {t.learnMore}
            </Link>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="Stäng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
