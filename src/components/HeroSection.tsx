import { CalendarDays, Headphones } from "lucide-react";
import { useBranding } from "@/hooks/useBranding";
import { useLanguage } from "@/contexts/LanguageContext";
import { optimizeHero } from "@/lib/imageOptimizer";
import { Link } from "react-router-dom";

const translations = {
  sv: {
    title: "DJ LOBO",
    subtitle: "80-TAL · 90-TAL · LATIN BEATS",
    cta1: "SE SCHEMA",
    cta2: "BOKA SPELNING",
    tagline: "Göteborg's mest anlitade DJ för fester, bröllop och företagsevent",
  },
  en: {
    title: "DJ LOBO",
    subtitle: "80S · 90S · LATIN BEATS",
    cta1: "VIEW SCHEDULE",
    cta2: "BOOK EVENT",
    tagline: "Gothenburg's most sought-after DJ for parties, weddings, and corporate events",
  },
  es: {
    title: "DJ LOBO",
    subtitle: "80S · 90S · LATIN BEATS",
    cta1: "VER AGENDA",
    cta2: "RESERVAR",
    tagline: "El DJ más solicitado de Gotemburgo para fiestas, bodas y eventos corporativos",
  },
};

const HeroSection = () => {
  const { branding } = useBranding();
  const { language } = useLanguage();
  const t = translations[language];
  const heroOpt = optimizeHero(branding?.hero_image_url);
  const siteName = branding?.site_name || "DJ LOBO";

  const scrollToBooking = () => {
    // Navigate to spelningar page
    window.location.href = "/spelningar#boka";
  };

  return (
    <section
      className="h-[calc(100vh-5rem)] flex flex-col items-center justify-center px-4 sm:px-6 pt-4 pb-20 relative overflow-hidden"
      aria-labelledby="hero-title"
    >
      {/* Hero Background Image */}
      {branding?.hero_image_url && (
        <div className="absolute inset-0 -z-10">
          <img
            src={heroOpt.src}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover opacity-40"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = heroOpt.fallback; }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        </div>
      )}

      {/* Decorative neon orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-neon-pink/10 blur-[100px] -z-10 animate-pulse" aria-hidden="true" />
      <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full bg-neon-cyan/10 blur-[100px] -z-10 animate-pulse" style={{ animationDelay: "1s" }} aria-hidden="true" />

      {/* Title */}
      <h1
        id="hero-title"
        className="font-display text-[clamp(1.8rem,7vw,7rem)] font-black text-neon-gradient mb-3 sm:mb-4 tracking-wider text-high-contrast text-center px-2 leading-tight"
      >
        DJ LOBO PRODUCCIONES
      </h1>

      {/* Subtitle */}
      <p className="font-display text-sm sm:text-lg md:text-xl tracking-[0.3em] text-neon-cyan/80 mb-4 sm:mb-6 text-center">
        {t.subtitle}
      </p>

      {/* Tagline */}
      <p className="text-sm sm:text-base text-muted-foreground mb-8 sm:mb-10 text-center max-w-lg px-4">
        {t.tagline}
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
        <button
          onClick={scrollToBooking}
          className="book-now-button tap-target px-8 sm:px-10 py-3.5 sm:py-4 font-display font-bold tracking-wider text-sm sm:text-base rounded-full flex items-center gap-2.5 transition-all"
        >
          <CalendarDays className="w-5 h-5" />
          {t.cta2}
        </button>

        <Link
          to="/lyssna"
          className="permanent-neon-link tap-target px-8 sm:px-10 py-3.5 sm:py-4 font-display font-bold tracking-wider text-sm sm:text-base flex items-center gap-2.5 transition-all hover:scale-105"
        >
          <Headphones className="w-5 h-5" />
          DJ LOBO RADIO
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;
