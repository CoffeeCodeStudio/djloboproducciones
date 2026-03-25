import { useLanguage } from "@/contexts/LanguageContext";
import { Clock, Speaker } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const packages = [
  { key: "privatfest", price: "6 500", border: "neon-pink" },
  { key: "wedding", price: "10 000", border: "neon-cyan" },
  { key: "corporate", price: "12 000", border: "neon-pink" },
  { key: "student", price: "10 000", border: "neon-cyan" },
] as const;

const translations = {
  sv: {
    privatfest: "PRIVATFEST",
    wedding: "BRÖLLOP",
    corporate: "FÖRETAG",
    student: "STUDENT",
    currency: "kr",
    exclVat: "exkl. moms",
    hours: "4 timmar spelning",
    soundLight: "Ljud & ljus ingår",
    addon: "Tillägg: 1 000 kr/timme utöver 4h",
    info: "Transport tillkommer vid längre avstånd · Bokning minst 2 veckor i förväg · Vi spelar även utanför Göteborg",
    cta: "BOKA NU",
    ctaText: "Vi har alltid en lösning — tveka inte att kontakta oss",
  },
  en: {
    privatfest: "PRIVATE PARTY",
    wedding: "WEDDING",
    corporate: "CORPORATE",
    student: "STUDENT",
    currency: "SEK",
    exclVat: "excl. VAT",
    hours: "4 hours of performance",
    soundLight: "Sound & lights included",
    addon: "Extra: 1 000 SEK/hour beyond 4h",
    info: "Transport costs apply for longer distances · Book at least 2 weeks in advance · We also play outside Gothenburg",
    cta: "BOOK NOW",
    ctaText: "We always find a solution — don't hesitate to contact us",
  },
  es: {
    privatfest: "FIESTA PRIVADA",
    wedding: "BODA",
    corporate: "EMPRESA",
    student: "ESTUDIANTE",
    currency: "SEK",
    exclVat: "sin IVA",
    hours: "4 horas de actuación",
    soundLight: "Sonido e iluminación incluidos",
    addon: "Extra: 1 000 SEK/hora más allá de 4h",
    info: "Transporte adicional para largas distancias · Reserva con al menos 2 semanas de antelación · También tocamos fuera de Gotemburgo",
    cta: "RESERVAR",
    ctaText: "Siempre encontramos una solución — no dudes en contactarnos",
  },
};

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
        className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto"
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
            <h3 className="font-display uppercase text-neon-cyan text-lg sm:text-xl tracking-wider mb-3">
              {t[pkg.key]}
            </h3>
            <p className="font-display font-bold text-3xl sm:text-4xl text-yellow-400 mb-5">
              {pkg.price} <span className="text-base font-sans font-normal text-muted-foreground">{t.currency} {t.exclVat}</span>
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
