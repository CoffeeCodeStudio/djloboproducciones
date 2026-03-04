import { ImageIcon, Play, LayoutGrid } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export type MediaFilter = "all" | "photo" | "video";

interface MediaFilterBarProps {
  active: MediaFilter;
  onChange: (filter: MediaFilter) => void;
  counts: { all: number; photo: number; video: number };
}

const translations = {
  sv: { all: "Visa Allt", photos: "Bilder", videos: "Videor" },
  en: { all: "Show All", photos: "Photos", videos: "Videos" },
  es: { all: "Mostrar Todo", photos: "Fotos", videos: "Videos" },
};

const MediaFilterBar = ({ active, onChange, counts }: MediaFilterBarProps) => {
  const { language } = useLanguage();
  const t = translations[language];

  const filters: { key: MediaFilter; label: string; icon: typeof LayoutGrid; count: number }[] = [
    { key: "all", label: t.all, icon: LayoutGrid, count: counts.all },
    { key: "photo", label: t.photos, icon: ImageIcon, count: counts.photo },
    { key: "video", label: t.videos, icon: Play, count: counts.video },
  ];

  return (
    <div className="flex justify-center gap-2 sm:gap-3 mb-8">
      {filters.map(({ key, label, icon: Icon, count }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`
            inline-flex items-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl font-medium text-sm sm:text-base
            transition-all duration-200 border min-w-[100px] justify-center
            ${active === key
              ? "bg-primary/15 border-primary/60 text-primary shadow-[0_0_15px_hsl(var(--primary)/0.2)]"
              : "glass-card border-border/40 text-muted-foreground hover:border-primary/30 hover:text-foreground"
            }
          `}
          aria-pressed={active === key}
        >
          <Icon className="w-4 h-4" />
          <span>{label}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${active === key ? "bg-primary/20" : "bg-muted/30"}`}>
            {count}
          </span>
        </button>
      ))}
    </div>
  );
};

export default MediaFilterBar;
