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
    <section id="utrustning" aria-labelledby="equipment-title">
      <div className="text-center mb-8">
        <h2 id="equipment-title" className="text-3xl sm:text-4xl font-display font-bold text-neon-gradient mb-2">
          {t.title}
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">{t.subtitle}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl animate-pulse bg-muted/20" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => {
            const IconComp = ICON_MAP[item.icon] || Disc3;
            return (
              <div
                key={item.id}
                className="glass-card p-3 sm:p-4 rounded-xl aspect-square flex items-center justify-center hover:border-neon-cyan/50 transition-all duration-300 group hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,255,255,0.15)]"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-neon-purple/10 flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-neon-cyan/10 transition-colors">
                    <IconComp className="w-5 h-5 sm:w-6 sm:h-6 text-neon-purple group-hover:text-neon-cyan transition-colors" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 text-xs sm:text-sm group-hover:text-neon-cyan transition-colors leading-tight">
                    {String(item[titleKey])}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">
                    {String(item[descKey])}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default EquipmentSection;
