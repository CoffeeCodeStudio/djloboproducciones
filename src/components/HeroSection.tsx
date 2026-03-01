import djLoboImage from "@/assets/dj-lobo-real.jpg";
import { Radio, MessageCircle, Loader2, WifiOff } from "lucide-react";
import { useBranding } from "@/hooks/useBranding";
import { usePresence } from "@/hooks/usePresence";
import { useStreamStatus } from "@/hooks/useStreamStatus";
import { useLanguage } from "@/contexts/LanguageContext";
import { optimizeProfile } from "@/lib/imageOptimizer";

const translations = {
  sv: {
    onAir: "ON AIR",
    connecting: "ANSLUTER...",
    offline: "OFFLINE",
    clickPlay: "KLICKA PLAY ▶",
    onAirLabel: "DJ Lobo är på luften just nu",
    connectingLabel: "Ansluter till streamen",
    errorLabel: "Kunde inte ansluta till streamen",
    offlineLabel: "Klicka på play för att lyssna",
    fansChatting: "fans chattar",
    fansChatLabel: "fans chattar just nu, klicka för att gå till chatten",
    seeSchedule: "SE SCHEMA",
    scrollToSchedule: "Scrolla ner till schemat",
    tagline: "Din port till",
    retroVibes: "RETRO RADIO VIBES",
  },
  en: {
    onAir: "ON AIR",
    connecting: "CONNECTING...",
    offline: "OFFLINE",
    clickPlay: "CLICK PLAY ▶",
    onAirLabel: "DJ Lobo is on air right now",
    connectingLabel: "Connecting to stream",
    errorLabel: "Could not connect to stream",
    offlineLabel: "Click play to listen",
    fansChatting: "fans chatting",
    fansChatLabel: "fans chatting right now, click to go to chat",
    seeSchedule: "SEE SCHEDULE",
    scrollToSchedule: "Scroll down to schedule",
    tagline: "Your gateway to",
    retroVibes: "RETRO RADIO VIBES",
  },
  es: {
    onAir: "ON AIR",
    connecting: "CONECTANDO...",
    offline: "FUERA DE LÍNEA",
    clickPlay: "PULSA PLAY ▶",
    onAirLabel: "DJ Lobo está en vivo ahora",
    connectingLabel: "Conectando al stream",
    errorLabel: "No se pudo conectar al stream",
    offlineLabel: "Pulsa play para escuchar",
    fansChatting: "fans chateando",
    fansChatLabel: "fans chateando ahora, haz clic para ir al chat",
    seeSchedule: "VER HORARIO",
    scrollToSchedule: "Desplázate hasta el horario",
    tagline: "Tu puerta a los",
    retroVibes: "RETRO RADIO VIBES",
  },
};

const HeroSection = () => {
  const { branding } = useBranding();
  const { listenerCount } = usePresence();
  const { status } = useStreamStatus();
  const { language } = useLanguage();
  const t = translations[language];
  
  const scrollToSchedule = () => {
    document.getElementById("schedule")?.scrollIntoView({ behavior: "smooth" });
  };

  // Use dynamic profile image if available, otherwise use the default
  const profileImage = optimizeProfile(branding?.profile_image_url) || djLoboImage;
  const siteName = branding?.site_name || "DJ LOBO";

  return (
    <section 
      className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-20 pb-32 relative"
      aria-labelledby="hero-title"
    >
      {/* Stream Status Badge + Live Chat Counter */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* Stream Status Badge */}
        <div 
          className={`px-4 sm:px-6 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 rounded-full border transition-all ${
            status === 'live' 
              ? 'glass-card-pink on-air-pulse border-neon-pink/30' 
              : status === 'connecting'
              ? 'glass-card border-neon-cyan/30'
              : status === 'error'
              ? 'glass-card border-red-500/30'
              : 'glass-card border-muted'
          }`}
          role="status"
          aria-live="polite"
          aria-label={
            status === 'live' ? t.onAirLabel :
            status === 'connecting' ? t.connectingLabel :
            status === 'error' ? t.errorLabel :
            t.offlineLabel
          }
        >
          {status === 'live' ? (
            <>
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-neon-pink rounded-full live-dot" aria-hidden="true" />
              <span className="font-display font-bold text-neon-pink tracking-wider text-sm sm:text-base">
                {t.onAir}
              </span>
            </>
          ) : status === 'connecting' ? (
            <>
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-neon-cyan animate-spin" aria-hidden="true" />
              <span className="font-display font-bold text-neon-cyan tracking-wider text-sm sm:text-base">
                {t.connecting}
              </span>
            </>
          ) : status === 'error' ? (
            <>
              <WifiOff className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" aria-hidden="true" />
              <span className="font-display font-bold text-red-400 tracking-wider text-sm sm:text-base">
                {t.offline}
              </span>
            </>
          ) : (
            <>
              <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" aria-hidden="true" />
              <span className="font-display font-bold text-muted-foreground tracking-wider text-sm sm:text-base">
                {t.clickPlay}
              </span>
            </>
          )}
        </div>

        {/* Live Chat Counter - FOMO indicator */}
        {listenerCount > 0 && (
          <button
            onClick={() => document.getElementById("live-chat-section")?.scrollIntoView({ behavior: "smooth" })}
            className="glass-card px-4 sm:px-5 py-2 sm:py-3 flex items-center gap-2 hover:border-neon-cyan/50 transition-all hover:scale-105 cursor-pointer group"
            aria-label={`${listenerCount} ${t.fansChatLabel}`}
          >
            <MessageCircle className="w-4 h-4 text-neon-cyan group-hover:animate-bounce" aria-hidden="true" />
            <span className="text-sm sm:text-base">
              <span className="font-bold text-neon-cyan">{listenerCount}</span>
              <span className="text-muted-foreground ml-1.5 hidden sm:inline">{t.fansChatting}</span>
              <span className="text-muted-foreground ml-1.5 sm:hidden">💬</span>
            </span>
          </button>
        )}
      </div>

      {/* DJ Image with neon border and 124 BPM pulse */}
      <div className="relative mb-6 sm:mb-8">
        <div className="w-52 h-52 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full overflow-hidden neon-border-gradient profile-bpm-pulse bpm-pulse-124">
          <img
            src={profileImage}
            alt="DJ Lobo vid mixerbordet med hörlurar"
            className="w-full h-full object-cover rounded-full"
            fetchPriority="high"
            loading="eager"
          />
        </div>
        {/* Pulsing glow effect behind image synced to 124 BPM */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-neon-pink/30 to-neon-cyan/30 blur-3xl -z-10 scale-110 bpm-pulse-124" aria-hidden="true"></div>
      </div>

      {/* Title */}
      <h1 
        id="hero-title"
        className="font-display text-5xl sm:text-6xl md:text-8xl font-black text-neon-gradient mb-3 sm:mb-4 tracking-wider text-high-contrast"
      >
        {siteName.toUpperCase().replace(" RADIO", "")}
      </h1>

      {/* Tagline */}
      <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-2 text-center">
        {t.tagline} <span className="text-neon-pink font-semibold">80s</span>,{" "}
        <span className="text-neon-cyan font-semibold">90s</span> &{" "}
        <span className="text-neon-pink font-semibold">Latin</span>
      </p>

      {/* Radio vibes */}
      <div className="flex items-center gap-2 sm:gap-3 text-neon-cyan mb-6 sm:mb-8" aria-hidden="true">
        <Radio className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="font-display text-xs sm:text-sm tracking-widest">
          {t.retroVibes}
        </span>
        <Radio className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>

      {/* CTA Button */}
      <button
        onClick={scrollToSchedule}
        aria-label={t.scrollToSchedule}
        className="tap-target glass-card px-6 sm:px-8 py-3 sm:py-4 font-display font-bold tracking-wider hover:bg-muted/50 hover:border-neon-cyan/50 transition-all hover:scale-105 focus-neon rounded-lg"
      >
        {t.seeSchedule}
      </button>
    </section>
  );
};

export default HeroSection;
