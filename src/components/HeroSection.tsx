import djLoboImage from "@/assets/dj-lobo-real.jpg";
import { Radio, Loader2, WifiOff, Headphones, CalendarDays } from "lucide-react";
import { useBranding } from "@/hooks/useBranding";
import { useStreamStatus } from "@/hooks/useStreamStatus";
import { useLanguage } from "@/contexts/LanguageContext";
import { optimizeProfile } from "@/lib/imageOptimizer";
import { Link } from "react-router-dom";

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
    bio: "Skapar magi på dansgolvet i Göteborg. Expert på 80-tal, 90-tal & Latin beats.",
    bookNow: "BOKA NU",
    listenMixes: "LYSSNA PÅ MIXAR",
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
    bio: "Creating magic on the dance floor in Gothenburg. Expert in 80s, 90s & Latin beats.",
    bookNow: "BOOK NOW",
    listenMixes: "LISTEN TO MIXES",
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
    bio: "Creando magia en la pista de baile en Gotemburgo. Experto en 80s, 90s y Latin beats.",
    bookNow: "RESERVAR",
    listenMixes: "ESCUCHAR MEZCLAS",
  },
};

const HeroSection = () => {
  const { branding } = useBranding();
  const { status } = useStreamStatus();
  const { language } = useLanguage();
  const t = translations[language];

  const scrollToBooking = () => {
    document.getElementById("boka")?.scrollIntoView({ behavior: "smooth" });
  };

  const profileOpt = optimizeProfile(branding?.profile_image_url);
  const profileImage = profileOpt.src || djLoboImage;
  const profileFallback = profileOpt.fallback || djLoboImage;
  const siteName = branding?.site_name || "DJ LOBO";

  return (
    <section
      className="h-[calc(100vh-5rem)] flex flex-col items-center justify-center px-4 sm:px-6 pt-16 pb-20 relative"
      aria-labelledby="hero-title"
    >
      {/* Stream Status Badge */}
      <div className="mb-3 sm:mb-5">
        <div
          className={`px-3 sm:px-5 py-1.5 sm:py-2 flex items-center gap-2 sm:gap-3 rounded-full border transition-all ${
            status === "live"
              ? "glass-card-pink on-air-pulse border-neon-pink/30"
              : status === "connecting"
              ? "glass-card border-neon-cyan/30"
              : status === "error"
              ? "glass-card border-red-500/30"
              : "glass-card border-muted"
          }`}
          role="status"
          aria-live="polite"
          aria-label={
            status === "live"
              ? t.onAirLabel
              : status === "connecting"
              ? t.connectingLabel
              : status === "error"
              ? t.errorLabel
              : t.offlineLabel
          }
        >
          {status === "live" ? (
            <>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-neon-pink rounded-full live-dot" aria-hidden="true" />
              <span className="font-display font-bold text-neon-pink tracking-wider text-xs sm:text-sm">{t.onAir}</span>
            </>
          ) : status === "connecting" ? (
            <>
              <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neon-cyan animate-spin" aria-hidden="true" />
              <span className="font-display font-bold text-neon-cyan tracking-wider text-xs sm:text-sm">{t.connecting}</span>
            </>
          ) : status === "error" ? (
            <>
              <WifiOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" aria-hidden="true" />
              <span className="font-display font-bold text-red-400 tracking-wider text-xs sm:text-sm">{t.offline}</span>
            </>
          ) : (
            <>
              <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" aria-hidden="true" />
              <span className="font-display font-bold text-muted-foreground tracking-wider text-xs sm:text-sm">{t.clickPlay}</span>
            </>
          )}
        </div>
      </div>

      {/* DJ Image */}
      <div className="relative mb-3 sm:mb-5">
        <div className="w-32 h-32 sm:w-44 sm:h-44 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-full overflow-hidden neon-border-gradient profile-neon-aura">
          <img
            src={profileImage}
            alt="DJ Lobo vid mixerbordet"
            className="w-full h-full object-cover rounded-full"
            fetchPriority="high"
            loading="eager"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = profileFallback; }}
          />
        </div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-neon-pink/30 to-neon-cyan/30 blur-3xl -z-10 scale-110" aria-hidden="true" />
      </div>

      {/* Title */}
      <h1
        id="hero-title"
        className="font-display text-3xl sm:text-5xl md:text-7xl font-black text-neon-gradient mb-2 sm:mb-3 tracking-wider text-high-contrast text-center"
      >
        {siteName.toUpperCase().replace(" RADIO", "")}
      </h1>

      {/* Bio */}
      <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-5 sm:mb-7 text-center max-w-xl px-4">
        {t.bio}
      </p>

      {/* Two CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
        <button
          onClick={scrollToBooking}
          className="book-now-button tap-target px-6 sm:px-8 py-3 sm:py-3.5 font-display font-bold tracking-wider text-sm sm:text-base rounded-full flex items-center gap-2 transition-all"
        >
          <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
          {t.bookNow}
        </button>

        <Link
          to="/radio"
          className="tap-target px-6 sm:px-8 py-3 sm:py-3.5 font-display font-bold tracking-wider text-sm sm:text-base rounded-full flex items-center gap-2 border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10 transition-all hover:scale-105 listen-pulse"
        >
          <Headphones className="w-4 h-4 sm:w-5 sm:h-5" />
          {t.listenMixes}
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;
