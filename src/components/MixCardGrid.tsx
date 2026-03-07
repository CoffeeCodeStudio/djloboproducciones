import { useEffect, useState } from "react";
import { Play, Disc3, Music, Pin, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePlayerStore, MixTrack } from "@/stores/usePlayerStore";
import { useLanguage } from "@/contexts/LanguageContext";

const translations = {
  sv: {
    title: "MIXAR & SETS",
    subtitle: "Lyssna på DJ Lobos senaste mixar från SoundCloud & Mixcloud",
    empty: "Inga mixar tillgängliga just nu.",
    pinned: "Pinnad",
  },
  en: {
    title: "MIXES & SETS",
    subtitle: "Listen to DJ Lobo's latest mixes from SoundCloud & Mixcloud",
    empty: "No mixes available right now.",
    pinned: "Pinned",
  },
  es: {
    title: "MEZCLAS Y SETS",
    subtitle: "Escucha las últimas mezclas de DJ Lobo en SoundCloud y Mixcloud",
    empty: "No hay mezclas disponibles en este momento.",
    pinned: "Fijado",
  },
};

interface UnifiedMix {
  id: string;
  title: string;
  url: string;
  embedUrl: string;
  coverArt?: string;
  source: "mixcloud" | "soundcloud";
  pinned: boolean;
  sortOrder: number;
  createdTime?: string;
}

const formatMixDate = (dateStr: string | undefined, lang: string): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString(
    lang === "sv" ? "sv-SE" : lang === "es" ? "es-ES" : "en-GB",
    { day: "numeric", month: "long", year: "numeric" }
  );
};

const DEFAULT_COVERS = [
  "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=400&h=400&fit=crop",
];

const MixCardGrid = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [mixes, setMixes] = useState<UnifiedMix[]>([]);
  const [loading, setLoading] = useState(true);
  const { playMix, currentTrack } = usePlayerStore();

  useEffect(() => {
    const fetchAll = async () => {
      const [scRes, mcRes] = await Promise.all([
        supabase
          .from("soundcloud_mixes")
          .select("id, title, soundcloud_url, cover_art_url, pinned, hidden, sort_order")
          .eq("hidden", false)
          .order("sort_order", { ascending: true }),
        supabase
          .from("mixcloud_mixes")
          .select("id, title, mixcloud_url, cover_art_url, pinned, hidden, sort_order, mixcloud_created_time")
          .eq("hidden", false)
          .order("sort_order", { ascending: true }),
      ]);

      const scMixes: UnifiedMix[] = (scRes.data || []).map((m, i) => ({
        id: m.id,
        title: m.title,
        url: m.soundcloud_url,
        embedUrl: m.soundcloud_url,
        coverArt: m.cover_art_url || DEFAULT_COVERS[i % DEFAULT_COVERS.length],
        source: "soundcloud" as const,
        pinned: m.pinned ?? false,
        sortOrder: m.sort_order,
      }));

      const mcMixes: UnifiedMix[] = (mcRes.data || []).map((m, i) => ({
        id: m.id,
        title: m.title,
        url: m.mixcloud_url,
        embedUrl: m.mixcloud_url,
        coverArt: m.cover_art_url || DEFAULT_COVERS[(i + 2) % DEFAULT_COVERS.length],
        source: "mixcloud" as const,
        pinned: m.pinned ?? false,
        sortOrder: m.sort_order,
        createdTime: (m as any).mixcloud_created_time || undefined,
      }));

      // Combine: pinned first, then by created_time (newest first), fallback to sort_order
      const all = [...scMixes, ...mcMixes].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        // Sort by createdTime descending (newest first)
        if (a.createdTime && b.createdTime) {
          return new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime();
        }
        if (a.createdTime && !b.createdTime) return -1;
        if (!a.createdTime && b.createdTime) return 1;
        return a.sortOrder - b.sortOrder;
      });

      setMixes(all);
      setLoading(false);
    };

    fetchAll();
  }, []);

  const handlePlay = (mix: UnifiedMix) => {
    const track: MixTrack = {
      id: mix.id,
      title: mix.title,
      coverArt: mix.coverArt,
      embedUrl: mix.embedUrl,
      source: mix.source,
      originalUrl: mix.url,
    };
    playMix(track);
  };

  if (!loading && mixes.length === 0) {
    return (
      <section className="py-12 text-center">
        <Music className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">{t.empty}</p>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-20 relative" aria-labelledby="mix-grid-title">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <h2
            id="mix-grid-title"
            className="font-display text-2xl sm:text-4xl md:text-5xl font-bold text-neon-gradient mb-3 italic"
          >
            {t.title}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl animate-pulse bg-muted/20" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {mixes.map((mix) => {
              const isActive = currentTrack?.id === mix.id;

              return (
                <button
                  key={mix.id}
                  onClick={() => handlePlay(mix)}
                  className={`group relative aspect-square rounded-2xl overflow-hidden transition-all duration-300 text-left border ${
                    isActive
                      ? "border-primary shadow-[0_0_30px_-5px_hsl(var(--primary)/0.5)] scale-[1.02]"
                      : "border-border/30 hover:border-primary/50 hover:shadow-[0_0_24px_-6px_hsl(var(--primary)/0.3)] hover:scale-[1.03]"
                  }`}
                >
                  {/* Cover art */}
                  <img
                    src={mix.coverArt}
                    alt={mix.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />

                  {/* Glassmorphism overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />

                  {/* Pinned badge */}
                  {mix.pinned && (
                    <div className="absolute top-2 left-2 z-10">
                      <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-primary/90 text-primary-foreground flex items-center gap-1 backdrop-blur-sm">
                        <Pin className="w-3 h-3" />
                        {t.pinned}
                      </span>
                    </div>
                  )}

                  {/* Source badge */}
                  <div className="absolute top-2 right-2 z-10">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold backdrop-blur-sm flex items-center gap-1 ${
                      mix.source === "mixcloud"
                        ? "bg-accent/80 text-accent-foreground"
                        : "bg-secondary/80 text-secondary-foreground"
                    }`}>
                      <Disc3 className="w-3 h-3" />
                      {mix.source === "mixcloud" ? "Mixcloud" : "SoundCloud"}
                    </span>
                  </div>

                  {/* Neon play button */}
                  <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}>
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
                      isActive
                        ? "bg-primary shadow-[0_0_20px_hsl(var(--primary)/0.6)]"
                        : "bg-primary/90 shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
                    }`}>
                      {isActive ? (
                        <Disc3 className="w-7 h-7 text-primary-foreground animate-spin" style={{ animationDuration: "2s" }} />
                      ) : (
                        <Play className="w-7 h-7 text-primary-foreground ml-1" />
                      )}
                    </div>
                  </div>

                  {/* Title bar */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                    <p className="font-display text-sm sm:text-base font-bold text-foreground leading-tight line-clamp-2 drop-shadow-lg">
                      {mix.title}
                    </p>
                    {mix.createdTime && (
                      <p className="flex items-center gap-1 mt-1 text-[10px] sm:text-xs text-muted-foreground drop-shadow-lg">
                        <Calendar className="w-3 h-3" aria-hidden="true" />
                        {formatMixDate(mix.createdTime, language)}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default MixCardGrid;
