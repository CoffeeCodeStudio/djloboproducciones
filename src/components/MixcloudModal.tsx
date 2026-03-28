import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCookieConsent } from "@/contexts/CookieConsentContext";
import EmbedBlockedNotice from "@/components/EmbedBlockedNotice";

const translations = {
  sv: {
    listenNow: "Lyssna Nu",
    close: "Stäng",
  },
  en: {
    listenNow: "Listen Now",
    close: "Close",
  },
  es: {
    listenNow: "Escuchar Ahora",
    close: "Cerrar",
  },
};

interface MixcloudModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  mixcloudUrl: string;
}

const MixcloudModal = ({ isOpen, onClose, title, mixcloudUrl }: MixcloudModalProps) => {
  const { language } = useLanguage();
  const { hasConsented } = useCookieConsent();
  const t = translations[language];
  const t = translations[language];

  // Convert profile URL to embed format
  const embedUrl = `https://www.mixcloud.com/widget/iframe/?hide_cover=1&dark=1&feed=${encodeURIComponent(mixcloudUrl.replace("https://www.mixcloud.com", ""))}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] glass-card border-neon-cyan/30 p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <DialogTitle className="font-display text-lg text-neon-gradient">
            {t.listenNow}: {title}
          </DialogTitle>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-muted/50 transition-colors"
            aria-label={t.close}
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </DialogHeader>
        
        <div className="w-full aspect-video bg-black/50">
          {hasConsented ? (
            <iframe
              width="100%"
              height="100%"
              src={embedUrl}
              frameBorder="0"
              allow="autoplay"
              title={`Mixcloud Player - ${title}`}
              className="w-full h-full min-h-[400px]"
            />
          ) : (
            <EmbedBlockedNotice className="w-full h-full min-h-[400px]" />
          )}
        </div>

        <div className="p-4 text-center">
          <a
            href={mixcloudUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-neon-cyan hover:text-neon-pink transition-colors text-sm"
          >
            Öppna i Mixcloud →
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MixcloudModal;