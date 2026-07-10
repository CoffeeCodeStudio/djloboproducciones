import { useLanguage } from "@/contexts/LanguageContext";
import { Clock, Speaker, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface PackageRow {
  id: string;
  key: string;
  sort_order: number;
  price: string;
  name_sv: string; name_en: string; name_es: string;
  guests_sv: string; guests_en: string; guests_es: string;
  hours_sv: string; hours_en: string; hours_es: string;
  sound_light_sv: string; sound_light_en: string; sound_light_es: string;
  addon_sv: string; addon_en: string; addon_es: string;
}
interface SettingsRow {
  large_event_sv: string; large_event_en: string; large_event_es: string;
  info_sv: string; info_en: string; info_es: string;
  cta_text_sv: string; cta_text_en: string; cta_text_es: string;
}

const staticT = {
  sv: { from: "Från", currency: "kr", exclVat: "exkl. moms", cta: "BOKA NU" },
  en: { from: "From", currency: "SEK", exclVat: "excl. VAT", cta: "BOOK NOW" },
  es: { from: "Desde", currency: "SEK", exclVat: "sin IVA", cta: "RESERVAR" },
} as const;

const borders = ["neon-pink", "neon-cyan", "neon-pink"] as const;

const PricingGrid = () => {
  const { language } = useLanguage();
  const t = staticT[language];
  const gridRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [settings, setSettings] = useState<SettingsRow | null>(null);

  useEffect(() => {
    (async () => {
      const [pkgRes, setRes] = await Promise.all([
        supabase.from("pricing_packages" as any).select("*").eq("active", true).order("sort_order"),
        supabase.from("pricing_settings" as any).select("*").limit(1).maybeSingle(),
      ]);
      if (pkgRes.data) setPackages(pkgRes.data as any);
      if (setRes.data) setSettings(setRes.data as any);
    })();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (gridRef.current) observer.observe(gridRef.current);
    return () => observer.disconnect();
  }, []);

  const scrollToBooking = () => document.getElementById("boka")?.scrollIntoView({ behavior: "smooth" });

  const pick = (row: any, field: string) => row?.[`${field}_${language}`] ?? "";

  return (
    <div className="px-4 sm:px-6 pb-12">
      <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {packages.map((pkg, i) => {
          const border = borders[i] || "neon-cyan";
          return (
            <div
              key={pkg.id}
              className={`glass-card rounded-xl p-6 sm:p-8 border-2 transition-all duration-500 ${
                border === "neon-pink"
                  ? "border-neon-pink/60 shadow-[0_0_15px_hsl(300_100%_50%/0.2)] hover:shadow-[0_0_30px_hsl(300_100%_50%/0.4)]"
                  : "border-neon-cyan/60 shadow-[0_0_15px_hsl(180_100%_50%/0.2)] hover:shadow-[0_0_30px_hsl(180_100%_50%/0.4)]"
              } ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: visible ? `${i * 120}ms` : "0ms" }}
            >
              <h3 className="font-display uppercase text-neon-cyan text-lg sm:text-xl tracking-wider mb-1">
                {pick(pkg, "name")}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
                <Users className="w-3.5 h-3.5" />
                {pick(pkg, "guests")}
              </p>
              <p className="font-display font-bold text-2xl sm:text-3xl text-yellow-400 mb-5 whitespace-nowrap">
                <span className="text-sm font-sans font-normal text-muted-foreground">{t.from} </span>
                {pkg.price} <span className="text-sm font-sans font-normal text-muted-foreground">{t.currency} {t.exclVat}</span>
              </p>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3 text-foreground/90">
                  <Clock className="w-4 h-4 text-neon-pink flex-shrink-0" />
                  <span className="text-sm">{pick(pkg, "hours")}</span>
                </div>
                <div className="flex items-center gap-3 text-foreground/90">
                  <Speaker className="w-4 h-4 text-neon-cyan flex-shrink-0" />
                  <span className="text-sm">{pick(pkg, "sound_light")}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">{pick(pkg, "addon")}</p>
            </div>
          );
        })}
      </div>

      {settings && (
        <div className={`text-center mt-8 max-w-5xl mx-auto transition-all duration-500 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`} style={{ transitionDelay: visible ? "360ms" : "0ms" }}>
          <p className="font-display text-base sm:text-lg tracking-wide text-neon-cyan/90 border border-neon-cyan/30 rounded-lg py-3 px-6 inline-block bg-neon-cyan/5">
            {pick(settings, "large_event")}
          </p>
        </div>
      )}

      <div className="text-center mt-10 max-w-3xl mx-auto space-y-4">
        {settings && <p className="text-xs sm:text-sm text-muted-foreground">{pick(settings, "info")}</p>}
        {settings && <p className="italic text-foreground/80 text-sm sm:text-base">{pick(settings, "cta_text")}</p>}
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
