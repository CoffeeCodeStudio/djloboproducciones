import { useState, useEffect } from "react";
import { Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCookieConsent } from "@/contexts/CookieConsentContext";
import { Link } from "react-router-dom";

const translations = {
  sv: {
    title: "Cookiemedgivande",
    message: "Denna sajt använder cookies från tredjeparter (YouTube, Mixcloud, SoundCloud) för att visa inbäddat innehåll. Genom att acceptera tillåter du dessa tjänster att sätta cookies i din webbläsare.",
    accept: "Acceptera",
    decline: "Avvisa",
    learnMore: "Läs vår sekretesspolicy",
  },
  en: {
    title: "Cookie Consent",
    message: "This site uses third-party cookies (YouTube, Mixcloud, SoundCloud) to display embedded content. By accepting, you allow these services to set cookies in your browser.",
    accept: "Accept",
    decline: "Decline",
    learnMore: "Read our privacy policy",
  },
  es: {
    title: "Consentimiento de cookies",
    message: "Este sitio utiliza cookies de terceros (YouTube, Mixcloud, SoundCloud) para mostrar contenido incrustado. Al aceptar, permites que estos servicios establezcan cookies en tu navegador.",
    accept: "Aceptar",
    decline: "Rechazar",
    learnMore: "Leer nuestra política de privacidad",
  },
};

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { language } = useLanguage();
  const { consent, acceptCookies, declineCookies } = useCookieConsent();
  const t = translations[language];

  useEffect(() => {
    if (consent === "pending") {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [consent]);

  if (consent !== "pending" || !isVisible) return null;

  return (
    <div
      className="fixed bottom-20 sm:bottom-24 left-4 right-4 z-50 animate-fade-in"
      role="dialog"
      aria-label={t.title}
    >
      <div className="max-w-lg mx-auto glass-card rounded-xl p-5 shadow-lg border border-white/10">
        <div className="flex items-start gap-3 mb-4">
          <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-foreground mb-1">{t.title}</h2>
            <p className="text-xs text-foreground/80 leading-relaxed">
              {t.message}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/privacy"
            className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors"
          >
            {t.learnMore}
          </Link>
          <div className="flex gap-2">
            <button
              onClick={() => { declineCookies(); setIsVisible(false); }}
              className="px-4 py-2 text-xs font-medium rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
            >
              {t.decline}
            </button>
            <button
              onClick={() => { acceptCookies(); setIsVisible(false); }}
              className="px-4 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {t.accept}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
