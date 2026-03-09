import { Radio, Headphones, Loader2, WifiOff } from "lucide-react";
import djLoboImage from "@/assets/dj-lobo-real.jpg";
import SoundCloudMixes from "@/components/SoundCloudMixes";
import LiveChat from "@/components/LiveChat";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBranding } from "@/hooks/useBranding";
import { useStreamStatus } from "@/hooks/useStreamStatus";
import { optimizeProfile } from "@/lib/imageOptimizer";

const translations = {
  sv: {
    onAir: "ON AIR",
    connecting: "ANSLUTER...",
    offline: "OFFLINE",
    clickPlay: "KLICKA PLAY ▶",
    bio: "Skapar magi på dansgolvet i Göteborg. Expert på 80-tal, 90-tal & Latin beats.",
    listenBelow: "Tryck play i spelaren längst ner för att starta streamen"
  },
  en: {
    onAir: "ON AIR",
    connecting: "CONNECTING...",
    offline: "OFFLINE",
    clickPlay: "CLICK PLAY ▶",
    bio: "Creating magic on the dance floor in Gothenburg. Expert in 80s, 90s & Latin beats.",
    listenBelow: "Press play in the player bar below to start the stream"
  },
  es: {
    onAir: "ON AIR",
    connecting: "CONECTANDO...",
    offline: "FUERA DE LÍNEA",
    clickPlay: "PULSA PLAY ▶",
    bio: "Creando magia en la pista de baile en Gotemburgo. Experto en 80s, 90s y Latin beats.",
    listenBelow: "Pulsa play en el reproductor de abajo para iniciar la transmisión"
  }
};

const ListenPage = () => {
  const { language } = useLanguage();
  const { branding } = useBranding();
  const { status } = useStreamStatus();
  const t = translations[language];

  const radioOpt = optimizeProfile((branding as any)?.radio_image_url || branding?.profile_image_url);
  const profileImage = radioOpt.src || djLoboImage;
  const profileFallback = radioOpt.fallback || djLoboImage;
  const siteName = branding?.site_name || "DJ LOBO";
  const radioSectionTitle = branding?.radio_section_title || "Live Radio";

  return (
    <div className="max-w-7xl mx-auto">
      {/* Radio Section Title */}
      <div className="text-center pt-8 pb-4">
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-neon-gradient tracking-wider">
          {radioSectionTitle.toUpperCase()}
        </h1>
      </div>

      {/* DJ Profile + Stream Status */}
      <section className="py-8 sm:py-12 flex flex-col items-center text-center relative" aria-labelledby="listen-title">
        {/* Stream Status Badge */}
        <div className="mb-4 sm:mb-6">
          <div
            className={`px-4 sm:px-5 py-1.5 sm:py-2 flex items-center gap-2 sm:gap-3 rounded-full border transition-all ${
            status === "live" ?
            "glass-card-pink on-air-pulse border-neon-pink/30" :
            status === "connecting" ?
            "glass-card border-neon-cyan/30" :
            status === "error" ?
            "glass-card border-red-500/30" :
            "glass-card border-muted"}`
            }
            role="status"
            aria-live="polite">
            
            {status === "live" ?
            <>
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-neon-pink rounded-full live-dot" aria-hidden="true" />
                <span className="font-display font-bold text-neon-pink tracking-wider text-xs sm:text-sm">{t.onAir}</span>
              </> :
            status === "connecting" ?
            <>
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neon-cyan animate-spin" aria-hidden="true" />
                <span className="font-display font-bold text-neon-cyan tracking-wider text-xs sm:text-sm">{t.connecting}</span>
              </> :
            status === "error" ?
            <>
                <WifiOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" aria-hidden="true" />
                <span className="font-display font-bold text-red-400 tracking-wider text-xs sm:text-sm">{t.offline}</span>
              </> :

            <>
                <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" aria-hidden="true" />
                <span className="font-display font-bold text-muted-foreground tracking-wider text-xs sm:text-sm">{t.clickPlay}</span>
              </>
            }
          </div>
        </div>

        {/* DJ Profile Image with neon aura */}
        <div className="relative mb-4 sm:mb-6">
          <div className="w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-full overflow-hidden neon-border-gradient profile-neon-aura">
            <img
              src={profileImage}
              srcSet={radioOpt.srcSet}
              sizes="(max-width: 640px) 144px, (max-width: 768px) 192px, 224px"
              alt="DJ Lobo vid mixerbordet"
              className="w-full h-full object-cover rounded-full"
              loading="eager"
              fetchPriority="high"
              width={224}
              height={224}
              onError={(e) => {e.currentTarget.onerror = null;e.currentTarget.src = profileFallback;}} />
          </div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-neon-pink/30 to-neon-cyan/30 blur-3xl -z-10 scale-110" aria-hidden="true" />
        </div>

        {/* Name */}
        




        

        {/* Bio */}
        

        

        {/* Listen hint */}
        <p className="text-xs sm:text-sm text-muted-foreground/60 flex items-center gap-2">
          <Headphones className="w-4 h-4 text-neon-cyan" aria-hidden="true" />
          {t.listenBelow}
        </p>
      </section>

      {/* SoundCloud Mixes */}
      <ErrorBoundary>
        <SoundCloudMixes />
      </ErrorBoundary>

      <LiveChat />
      <Footer />
    </div>);

};

export default ListenPage;