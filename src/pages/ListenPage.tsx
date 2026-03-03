import { Radio, Headphones } from "lucide-react";
import SoundCloudMixes from "@/components/SoundCloudMixes";
import LiveChat from "@/components/LiveChat";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useLanguage } from "@/contexts/LanguageContext";

const translations = {
  sv: {
    liveTitle: "LIVE RADIO",
    liveSubtitle: "Lyssna på DJ Lobo Radio live – 80s & 90s hits dygnet runt",
    listenBelow: "Tryck play i spelaren längst ner för att starta streamen",
  },
  en: {
    liveTitle: "LIVE RADIO",
    liveSubtitle: "Listen to DJ Lobo Radio live – 80s & 90s hits 24/7",
    listenBelow: "Press play in the player bar below to start the stream",
  },
  es: {
    liveTitle: "RADIO EN VIVO",
    liveSubtitle: "Escucha DJ Lobo Radio en vivo – éxitos de los 80 y 90 las 24 horas",
    listenBelow: "Pulsa play en el reproductor de abajo para iniciar la transmisión",
  },
};

const ListenPage = () => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Live Radio Hero */}
      <section className="py-16 sm:py-24 text-center relative" aria-labelledby="live-radio-title">
        <div className="max-w-2xl mx-auto">
          {/* Animated radio icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center shadow-lg shadow-neon-pink/30 animate-pulse">
              <Radio className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
          </div>

          <h1
            id="live-radio-title"
            className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-neon-gradient mb-4 italic"
          >
            {t.liveTitle}
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg mb-4">
            {t.liveSubtitle}
          </p>
          <p className="text-sm text-muted-foreground/70 flex items-center justify-center gap-2">
            <Headphones className="w-4 h-4 text-neon-cyan" aria-hidden="true" />
            {t.listenBelow}
          </p>
        </div>
      </section>

      {/* SoundCloud Mixes */}
      <ErrorBoundary>
        <SoundCloudMixes />
      </ErrorBoundary>

      <LiveChat />
      <Footer />
    </div>
  );
};

export default ListenPage;
