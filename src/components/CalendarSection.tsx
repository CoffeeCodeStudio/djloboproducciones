import { useEffect, useState } from "react";
import { MapPin, Clock, AlertCircle, Radio } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { useScrollReveal } from "@/hooks/useScrollReveal";



const translations = {
  sv: {
    title: "KOMMANDE SPELNINGAR",
    subtitle: "Missa inte dessa spelningar",
    noEvents: "Inga kommande spelningar just nu",
    locationTBA: "Plats meddelas",
    errorMessage: "Kunde inte ladda spelningar just nu",
    retry: "Försök igen",
    live: "LIVE NU",
    liveCountOne: "1 set spelas just nu",
    liveCountMany: (n: number) => `${n} set spelas just nu`,
  },
  en: {
    title: "UPCOMING EVENTS",
    subtitle: "Don't miss these shows",
    noEvents: "No upcoming shows right now",
    locationTBA: "Location TBA",
    errorMessage: "Could not load shows right now",
    retry: "Try again",
    live: "LIVE NOW",
    liveCountOne: "1 set playing now",
    liveCountMany: (n: number) => `${n} sets playing now`,
  },
  es: {
    title: "PRÓXIMOS EVENTOS",
    subtitle: "No te pierdas estos shows",
    noEvents: "No hay shows próximos",
    locationTBA: "Lugar por confirmar",
    errorMessage: "No se pudieron cargar los shows",
    retry: "Reintentar",
    live: "EN VIVO",
    liveCountOne: "1 set en vivo ahora",
    liveCountMany: (n: number) => `${n} sets en vivo ahora`,
  },
};

const DJLoadingAnimation = ({ loadingText }: { loadingText: string }) => (
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
      {loadingText}
    </p>
  </div>
);

const CalendarSection = () => {
  const sectionRef = useScrollReveal<HTMLElement>();
  const { language } = useLanguage();
  const t = translations[language];
  const { events, loading: apiLoading, error, refetch } = useCalendarEvents();
  // Tick every 30s so LIVE badges flip on/off automatically as time passes,
  // even if the calendar feed is still cached.
  const [nowTick, setNowTick] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 30 * 1000);
    return () => clearInterval(id);
  }, []);

  // Surface ALL concurrently-live sets — overlapping bookings (e.g. radio
  // residency + venue gig) should each get a LIVE badge, not just the first
  // one. We re-order so live sets stack on top, with the one ending soonest
  // first, then upcoming sets in normal chronological order.
  const orderedEvents = (() => {
    const live: typeof events = [];
    const upcoming: typeof events = [];
    for (const ev of events) {
      const startMs = ev.date.getTime();
      const endMs = ev.endDate.getTime();
      if (startMs <= nowTick && endMs >= nowTick) live.push(ev);
      else upcoming.push(ev);
    }
    live.sort((a, b) => a.endDate.getTime() - b.endDate.getTime());
    upcoming.sort((a, b) => a.date.getTime() - b.date.getTime());
    return [...live, ...upcoming];
  })();
  const liveCount = orderedEvents.reduce(
    (n, ev) => (ev.date.getTime() <= nowTick && ev.endDate.getTime() >= nowTick ? n + 1 : n),
    0,
  );

  // Reveal handled by the shared hook below for parity with Hero/About.

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
          {liveCount > 0 && (
            <div
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-destructive/40 bg-destructive/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-destructive"
              role="status"
              aria-live="polite"
            >
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive/70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
              </span>
              {liveCount === 1 ? t.liveCountOne : t.liveCountMany(liveCount)}
            </div>
          )}
        </div>

        {/* Event list container */}
        <div className="scroll-reveal rounded-2xl border border-neon-cyan/20 bg-background/40 backdrop-blur-md overflow-hidden" style={{ boxShadow: '0 0 30px -10px hsla(180, 100%, 50%, 0.15)' }}>
          {/* Loading animation */}
          {apiLoading && events.length === 0 && (
            <DJLoadingAnimation loadingText={language === "en" ? "Loading shows..." : language === "es" ? "Cargando shows..." : "Laddar spelningar..."} />
          )}

          {/* Error state */}
          {!apiLoading && error && events.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
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
          {!apiLoading && !error && events.length === 0 && (
            <p className="text-center text-muted-foreground py-12 text-sm">
              {t.noEvents}
            </p>
          )}

          {/* Events */}
          {orderedEvents.length > 0 && (
            <ul role="list" className="divide-y divide-neon-cyan/10">
              {orderedEvents.map((event, i) => {
                // Read day/month in Stockholm wall-clock so the chip never
                // drifts a day around midnight or across DST transitions.
                const dayMonthFmt = new Intl.DateTimeFormat(
                  language === "sv" ? "sv-SE" : language === "es" ? "es-ES" : "en-US",
                  { timeZone: "Europe/Stockholm", day: "numeric", month: "short" }
                );
                const parts = dayMonthFmt.formatToParts(event.date);
                const day = parts.find((p) => p.type === "day")?.value ?? event.date.getUTCDate();
                const month = (parts.find((p) => p.type === "month")?.value ?? "").toUpperCase();
                const isLive =
                  event.date.getTime() <= nowTick && event.endDate.getTime() >= nowTick;

                return (
                  <li
                    key={event.id}
                    aria-current={isLive ? "true" : undefined}
                    className={`scroll-reveal group flex items-center gap-4 px-4 sm:px-6 py-4 transition-colors ${
                      isLive
                        ? "bg-destructive/10 hover:bg-destructive/15"
                        : "hover:bg-white/[0.03]"
                    }`}
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    {/* Date block — LIVE state recolors to destructive */}
                    <div
                      className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex flex-col items-center justify-center border ${
                        isLive
                          ? "bg-gradient-to-br from-destructive/30 to-destructive/10 border-destructive/50"
                          : "bg-gradient-to-br from-[#FFD700]/20 to-[#FF8C00]/10 border-[#FFD700]/30"
                      }`}
                    >
                      {isLive ? (
                        <Radio className="w-6 h-6 text-destructive animate-pulse" aria-hidden="true" />
                      ) : (
                        <>
                          <span className="text-[10px] sm:text-xs font-bold tracking-widest text-[#FFD700]/80">
                            {month}
                          </span>
                          <span className="text-xl sm:text-2xl font-display font-black text-[#FFD700]">
                            {day}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`font-display text-sm sm:text-base font-bold truncate ${
                          isLive ? "text-destructive" : "text-[#FFD700]"
                        }`}>
                          {event.title}
                        </h3>
                        {isLive && (
                          <span
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-destructive/20 border border-destructive/40 text-[10px] font-display font-bold tracking-wider text-destructive"
                            aria-label={t.live}
                          >
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-destructive" />
                            </span>
                            {t.live}
                          </span>
                        )}
                      </div>
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
