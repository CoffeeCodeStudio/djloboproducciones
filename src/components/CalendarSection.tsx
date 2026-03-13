import { useEffect, useRef, useState } from "react";
import { MapPin, Clock, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";

const MINIMUM_LOADING_TIME = 3000; // 3 seconds

const translations = {
  sv: {
    title: "KOMMANDE SPELNINGAR",
    subtitle: "Missa inte dessa spelningar",
    noEvents: "Inga kommande spelningar just nu",
    locationTBA: "Plats meddelas",
    errorMessage: "Kunde inte ladda spelningar just nu",
    retry: "Försök igen",
  },
  en: {
    title: "UPCOMING EVENTS",
    subtitle: "Don't miss these shows",
    noEvents: "No upcoming shows right now",
    locationTBA: "Location TBA",
    errorMessage: "Could not load shows right now",
    retry: "Try again",
  },
  es: {
    title: "PRÓXIMOS EVENTOS",
    subtitle: "No te pierdas estos shows",
    noEvents: "No hay shows próximos",
    locationTBA: "Lugar por confirmar",
    errorMessage: "No se pudieron cargar los shows",
    retry: "Reintentar",
  },
};

const DJLoadingAnimation = () => (
  <div className="flex flex-col items-center justify-center py-12 gap-4">
    {/* DJ Silhouette SVG */}
    <div className="relative w-24 h-24 animate-pulse">
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Turntable base */}
        <ellipse cx="60" cy="95" rx="50" ry="8" className="fill-neon-purple/20" />
        {/* Left turntable */}
        <circle cx="35" cy="85" r="18" className="stroke-neon-pink/60" strokeWidth="2" fill="none">
          <animateTransform attributeName="transform" type="rotate" values="0 35 85;360 35 85" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="35" cy="85" r="3" className="fill-neon-pink/80" />
        {/* Right turntable */}
        <circle cx="85" cy="85" r="18" className="stroke-neon-purple/60" strokeWidth="2" fill="none">
          <animateTransform attributeName="transform" type="rotate" values="360 85 85;0 85 85" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="85" cy="85" r="3" className="fill-neon-purple/80" />
        {/* Mixer */}
        <rect x="45" y="75" width="30" height="15" rx="2" className="fill-neon-purple/30 stroke-neon-pink/40" strokeWidth="1" />
        {/* DJ Body */}
        <path d="M60 72 C60 72 48 55 48 45 C48 35 52 28 60 28 C68 28 72 35 72 45 C72 55 60 72 60 72Z" className="fill-neon-purple/40" />
        {/* Head */}
        <circle cx="60" cy="25" r="10" className="fill-neon-purple/50" />
        {/* Headphones */}
        <path d="M49 22 C49 14 71 14 71 22" className="stroke-neon-pink/70" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <rect x="46" y="20" width="5" height="8" rx="2" className="fill-neon-pink/60" />
        <rect x="69" y="20" width="5" height="8" rx="2" className="fill-neon-pink/60" />
        {/* Arms reaching to turntables */}
        <path d="M52 50 L38 75" className="stroke-neon-purple/50" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M68 50 L82 75" className="stroke-neon-purple/50" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      {/* Neon glow rings */}
      <div className="absolute inset-0 rounded-full bg-neon-pink/10 animate-ping" style={{ animationDuration: '2s' }} />
      <div className="absolute inset-2 rounded-full bg-neon-purple/10 animate-ping" style={{ animationDuration: '2.5s' }} />
    </div>
    <p className="text-sm font-display tracking-wider text-neon-pink/80 animate-pulse">
      Laddar spelningar...
    </p>
  </div>
);

const CalendarSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { language } = useLanguage();
  const t = translations[language];
  const { events, loading: apiLoading, error, refetch } = useCalendarEvents();
  const [isLoading, setIsLoading] = useState(true);

  // Force minimum loading time of 3 seconds
  useEffect(() => {
    const minimumLoadingPromise = new Promise((resolve) =>
      setTimeout(resolve, MINIMUM_LOADING_TIME)
    );

    const checkLoading = async () => {
      await Promise.all([minimumLoadingPromise]);
      setIsLoading(false);
    };

    checkLoading();
  }, []);

  // Update loading state when API completes
  useEffect(() => {
    if (!apiLoading) {
      // isLoading will be set to false when minimum time passes
    }
  }, [apiLoading]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".scroll-reveal").forEach((el, i) => {
              setTimeout(() => el.classList.add("revealed"), i * 80);
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="calendar"
      className="py-12 sm:py-16 relative"
      aria-labelledby="calendar-title"
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-10 scroll-reveal">
          <h2
            id="calendar-title"
            className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-neon-gradient mb-2 italic"
          >
            {t.title}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">{t.subtitle}</p>
        </div>

        {/* Event list container */}
        <div className="scroll-reveal rounded-2xl border border-neon-cyan/20 bg-background/40 backdrop-blur-md overflow-hidden" style={{ boxShadow: '0 0 30px -10px hsla(180, 100%, 50%, 0.15)' }}>
          {/* Loading animation */}
          {isLoading && events.length === 0 && (
            <DJLoadingAnimation />
          )}

          {/* Error state */}
          {!isLoading && error && events.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <AlertCircle className="w-8 h-8 text-muted-foreground/50" />
              <p className="text-muted-foreground text-sm">{t.errorMessage}</p>
              <button
                onClick={refetch}
                className="text-xs text-neon-cyan hover:underline transition-colors"
              >
                {t.retry}
              </button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && events.length === 0 && (
            <p className="text-center text-muted-foreground py-12 text-sm">
              {t.noEvents}
            </p>
          )}

          {/* Events */}
          {events.length > 0 && (
            <ul role="list" className="divide-y divide-neon-cyan/10">
              {events.map((event, i) => {
                const day = event.date.getDate();
                const month = event.date.toLocaleString(language === "sv" ? "sv-SE" : language === "es" ? "es-ES" : "en-US", { month: "short" }).toUpperCase();

                return (
                  <li
                    key={event.id}
                    className="scroll-reveal group flex items-center gap-4 px-4 sm:px-6 py-4 hover:bg-white/[0.03] transition-colors"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    {/* Date block */}
                    <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-[#FFD700]/20 to-[#FF8C00]/10 border border-[#FFD700]/30 flex flex-col items-center justify-center">
                      <span className="text-[10px] sm:text-xs font-bold tracking-widest text-[#FFD700]/80">
                        {month}
                      </span>
                      <span className="text-xl sm:text-2xl font-display font-black text-[#FFD700]">
                        {day}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-sm sm:text-base font-bold text-[#FFD700] truncate">
                        {event.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs sm:text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-neon-cyan" aria-hidden="true" />
                          {event.timeFormatted}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-neon-cyan" aria-hidden="true" />
                            {event.location || t.locationTBA}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};

export default CalendarSection;
