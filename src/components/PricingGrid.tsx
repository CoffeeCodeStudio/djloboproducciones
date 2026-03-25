import { useLanguage } from "@/contexts/LanguageContext";
import { Clock, Speaker, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const packages = [
  { key: "basic", price: "6 000", border: "neon-pink" },
  { key: "standard", price: "8 000", border: "neon-cyan" },
  { key: "premium", price: "12 000", border: "neon-pink" },
] as const;

const translations = {
  sv: {
    basic: "BASIC",
    standard: "STANDARD",
    premium: "PREMIUM",
    basicGuests: "Upp till 60 personer",
    standardGuests: "Upp till 80 personer",
    premiumGuests: "100–150 personer",
    from: "Från",
    currency: "kr",
    exclVat: "exkl. moms",
    hours: "4 timmar spelning",
    soundLight: "Ljud & ljus ingår",
    addon: "Tillägg: 1 000 kr/timme utöver 4h",
    largeEvent: "150+ personer — Kontakta oss för offert",
    info: "Transport tillkommer vid längre avstånd · Bokning minst 2 veckor i förväg · Vi spelar även utanför Göteborg",
    cta: "BOKA NU",
    ctaText: "Vi har alltid en lösning — tveka inte att kontakta oss",
  },
  en: {
    basic: "BASIC",
    standard: "STANDARD",
    premium: "PREMIUM",
    basicGuests: "Up to 60 guests",
    standardGuests: "Up to 80 guests",
    premiumGuests: "100–150 guests",
    from: "From",
    currency: "SEK",
    exclVat: "excl. VAT",
    hours: "4 hours of performance",
    soundLight: "Sound & lights included",
    addon: "Extra: 1 000 SEK/hour beyond 4h",
    largeEvent: "150+ guests — Contact us for a quote",
    info: "Transport costs apply for longer distances · Book at least 2 weeks in advance · We also play outside Gothenburg",
    cta: "BOOK NOW",
    ctaText: "We always find a solution — don't hesitate to contact us",
  },
  es: {
    basic: "BÁSICO",
    standard: "ESTÁNDAR",
    premium: "PREMIUM",
    basicGuests: "Hasta 60 personas",
    standardGuests: "Hasta 80 personas",
    premiumGuests: "100–150 personas",
    from: "Desde",
    currency: "SEK",
    exclVat: "sin IVA",
    hours: "4 horas de actuación",
    soundLight: "Sonido e iluminación incluidos",
    addon: "Extra: 1 000 SEK/hora más allá de 4h",
    largeEvent: "150+ personas — Contáctenos para una cotización",
    info: "Transporte adicional para largas distancias · Reserva con al menos 2 semanas de antelación · También tocamos fuera de Gotemburgo",
    cta: "RESERVAR",
    ctaText: "Siempre encontramos una solución — no dudes en contactarnos",
  },
};

const guestKeys = {
  basic: "basicGuests",
  standard: "standardGuests",
  premium: "premiumGuests",
} as const;

const PricingGrid = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const gridRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (gridRef.current) observer.observe(gridRef.current);
    return () => observer.disconnect();
  }, []);

  const scrollToBooking = () => {
    document.getElementById("boka")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="px-4 sm:px-6 pb-12">
      <div
        ref={gridRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
      >
        {packages.map((pkg, i) => (
          <div
            key={pkg.key}
            className={`glass-card rounded-xl p-6 sm:p-8 border-2 transition-all duration-500 ${
              pkg.border === "neon-pink"
                ? "border-neon-pink/60 shadow-[0_0_15px_hsl(300_100%_50%/0.2)] hover:shadow-[0_0_30px_hsl(300_100%_50%/0.4)]"
                : "border-neon-cyan/60 shadow-[0_0_15px_hsl(180_100%_50%/0.2)] hover:shadow-[0_0_30px_hsl(180_100%_50%/0.4)]"
            } ${
              visible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{
              transitionDelay: visible ? `${i * 120}ms` : "0ms",
            }}
          >
            <h3 className="font-display uppercase text-neon-cyan text-lg sm:text-xl tracking-wider mb-1">
              {t[pkg.key]}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
              <Users className="w-3.5 h-3.5" />
              {t[guestKeys[pkg.key]]}
            </p>
            <p className="font-display font-bold text-2xl sm:text-3xl text-yellow-400 mb-5 whitespace-nowrap">
              <span className="text-sm font-sans font-normal text-muted-foreground">{t.from} </span>
              {pkg.price} <span className="text-sm font-sans font-normal text-muted-foreground">{t.currency} {t.exclVat}</span>
            </p>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-3 text-foreground/90">
                <Clock className="w-4 h-4 text-neon-pink flex-shrink-0" />
                <span className="text-sm">{t.hours}</span>
              </div>
              <div className="flex items-center gap-3 text-foreground/90">
                <Speaker className="w-4 h-4 text-neon-cyan flex-shrink-0" />
                <span className="text-sm">{t.soundLight}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">{t.addon}</p>
          </div>
        ))}
      </div>

      {/* Large event option */}
      <div className={`text-center mt-8 max-w-5xl mx-auto transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`} style={{ transitionDelay: visible ? "360ms" : "0ms" }}>
        <p className="font-display text-base sm:text-lg tracking-wide text-neon-cyan/90 border border-neon-cyan/30 rounded-lg py-3 px-6 inline-block bg-neon-cyan/5">
          {t.largeEvent}
        </p>
      </div>

      <div className="text-center mt-10 max-w-3xl mx-auto space-y-4">
        <p className="text-xs sm:text-sm text-muted-foreground">{t.info}</p>
        <p className="italic text-foreground/80 text-sm sm:text-base">
          {t.ctaText}
        </p>
        <Button
          onClick={scrollToBooking}
          className="px-8 py-3 text-lg font-display font-semibold rounded-full bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-purple hover:to-neon-pink transition-all duration-300"
        >
          {t.cta}
        </Button>
      </div>
    </div>
  );
};

export default PricingGrid;
