import { ShieldAlert } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCookieConsent } from "@/contexts/CookieConsentContext";

const translations = {
  sv: {
    blocked: "Externt innehåll blockerat",
    description: "Du måste acceptera cookies för att visa inbäddat innehåll från tredjeparter.",
    accept: "Acceptera cookies",
  },
  en: {
    blocked: "External content blocked",
    description: "You must accept cookies to view embedded third-party content.",
    accept: "Accept cookies",
  },
  es: {
    blocked: "Contenido externo bloqueado",
    description: "Debes aceptar las cookies para ver el contenido incrustado de terceros.",
    accept: "Aceptar cookies",
  },
};

interface EmbedBlockedNoticeProps {
  className?: string;
}

const EmbedBlockedNotice = ({ className = "" }: EmbedBlockedNoticeProps) => {
  const { language } = useLanguage();
  const { acceptCookies } = useCookieConsent();
  const t = translations[language];

  return (
    <div className={`flex flex-col items-center justify-center gap-3 p-6 text-center bg-muted/30 rounded-xl border border-border ${className}`}>
      <ShieldAlert className="w-8 h-8 text-muted-foreground" />
      <p className="text-sm font-medium text-foreground">{t.blocked}</p>
      <p className="text-xs text-muted-foreground max-w-xs">{t.description}</p>
      <button
        onClick={acceptCookies}
        className="mt-1 px-4 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        {t.accept}
      </button>
    </div>
  );
};

export default EmbedBlockedNotice;
