import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  Disc3, Headphones, Music2, Radio, Speaker, Mic2, MonitorSpeaker, Podcast,
  Music, Volume2, Wifi, Zap, Lightbulb, Camera, type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Disc3, Headphones, Music2, Radio, Speaker, Mic2, MonitorSpeaker, Podcast,
  Music, Volume2, Wifi, Zap, Lightbulb, Camera,
};

interface EquipmentRow {
  id: string;
  title_sv: string;
  title_en: string;
  title_es: string;
  description_sv: string;
  description_en: string;
  description_es: string;
  icon: string;
  sort_order: number;
}

const translations = {
  sv: {
    title: "Min Utrustning",
    subtitle: "Professionell utrustning för alla typer av evenemang",
    quality: "Kvalitetsutrustning",
    qualityDesc: "All utrustning underhålls regelbundet för optimal prestanda",
  },
  en: {
    title: "My Equipment",
    subtitle: "Professional equipment for all types of events",
    quality: "Quality Equipment",
    qualityDesc: "All equipment is regularly maintained for optimal performance",
  },
  es: {
    title: "Mi Equipo",
    subtitle: "Equipo profesional para todo tipo de eventos",
    quality: "Equipo de Calidad",
    qualityDesc: "Todo el equipo se mantiene regularmente para un rendimiento óptimo",
  },
};

const EquipmentSection = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [items, setItems] = useState<EquipmentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("equipment")
        .select("*")
        .order("sort_order", { ascending: true });
      setItems(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const titleKey = `title_${language}` as keyof EquipmentRow;
  const descKey = `description_${language}` as keyof EquipmentRow;

  return (
    <section id="utrustning" className="py-16 sm:py-24" aria-labelledby="equipment-title">
      <div className="text-center mb-12">
        <h2 id="equipment-title" className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-neon-gradient mb-4">
          {t.title}
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t.subtitle}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl animate-pulse bg-muted/20" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {items.map((item) => {
            const IconComp = ICON_MAP[item.icon] || Disc3;
            return (
              <div
                key={item.id}
                className="glass-card p-4 sm:p-6 rounded-xl hover:border-neon-cyan/50 transition-all duration-300 group hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,255,255,0.15)]"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-neon-purple/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-neon-cyan/10 transition-colors">
                    <IconComp className="w-6 h-6 sm:w-8 sm:h-8 text-neon-purple group-hover:text-neon-cyan transition-colors" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base group-hover:text-neon-cyan transition-colors">
                    {String(item[titleKey])}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {String(item[descKey])}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quality Badge */}
      <div className="mt-12 flex justify-center px-4">
        <div className="glass-card-neon px-4 sm:px-6 py-3 sm:py-4 rounded-full flex items-center gap-3 max-w-full">
          <div className="w-3 h-3 rounded-full bg-neon-cyan animate-pulse shrink-0" />
          <div className="min-w-0">
            <span className="font-semibold text-neon-cyan text-sm sm:text-base">{t.quality}</span>
            <span className="text-muted-foreground ml-2 text-xs sm:text-sm">— {t.qualityDesc}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EquipmentSection;
