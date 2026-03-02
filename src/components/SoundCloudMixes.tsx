import { useEffect, useRef, useState } from "react";
import { Music, Headphones } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const translations = {
  sv: {
    title: "SENASTE MIXAR",
    subtitle: "Lyssna på DJ Lobos senaste sets",
    loading: "Laddar mix…",
  },
  en: {
    title: "LATEST MIXES",
    subtitle: "Listen to DJ Lobo's latest sets",
    loading: "Loading mix…",
  },
  es: {
    title: "ÚLTIMAS MEZCLAS",
    subtitle: "Escucha los últimos sets de DJ Lobo",
    loading: "Cargando mezcla…",
  },
};

// Placeholder SoundCloud track URLs – replace with real ones
const SOUNDCLOUD_TRACKS = [
  {
    id: "1",
    title: "Latin House Mix 2025",
    embedUrl: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/placeholder1&color=%2300e5ff&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true",
  },
  {
    id: "2",
    title: "80s & 90s Retro Set",
    embedUrl: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/placeholder2&color=%2300e5ff&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true",
  },
  {
    id: "3",
    title: "Reggaeton Party Mix",
    embedUrl: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/placeholder3&color=%2300e5ff&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true",
  },
  {
    id: "4",
    title: "Deep House Sunset Session",
    embedUrl: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/placeholder4&color=%2300e5ff&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true",
  },
];

interface LazyEmbedProps {
  title: string;
  embedUrl: string;
  loadingText: string;
}

const LazyEmbed = ({ title, embedUrl, loadingText }: LazyEmbedProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="rounded-xl border border-neon-cyan/20 bg-background/50 backdrop-blur-sm overflow-hidden transition-shadow" style={{ boxShadow: '0 0 20px -8px hsla(180, 100%, 50%, 0.12)' }}>
      <div className="px-4 py-3 border-b border-neon-cyan/10 flex items-center gap-2">
        <Music className="w-4 h-4 text-[#FFD700]" aria-hidden="true" />
        <span className="font-display text-sm font-bold text-[#FFD700] truncate">{title}</span>
      </div>
      <div className="aspect-video sm:aspect-[16/7] relative">
        {visible ? (
          <iframe
            src={embedUrl}
            width="100%"
            height="100%"
            className="absolute inset-0 w-full h-full"
            allow="autoplay"
            loading="lazy"
            title={title}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
            <Headphones className="w-5 h-5 mr-2 text-neon-cyan animate-pulse" />
            {loadingText}
          </div>
        )}
      </div>
    </div>
  );
};

interface SoundCloudMixesProps {
  /** Show only the first mix (for homepage preview) */
  preview?: boolean;
}

const SoundCloudMixes = ({ preview = false }: SoundCloudMixesProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const { language } = useLanguage();
  const t = translations[language];

  const tracks = preview ? SOUNDCLOUD_TRACKS.slice(0, 1) : SOUNDCLOUD_TRACKS;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".scroll-reveal").forEach((el, i) => {
              setTimeout(() => el.classList.add("revealed"), i * 100);
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
      id="mixes"
      className={preview ? "py-8 relative" : "py-12 sm:py-20 relative"}
      aria-labelledby="mixes-title"
    >
      <div className={preview ? "max-w-3xl mx-auto" : "max-w-5xl mx-auto"}>
        {/* Header */}
        <div className="text-center mb-6 sm:mb-10 scroll-reveal">
          <h2
            id="mixes-title"
            className="font-display text-2xl sm:text-4xl md:text-5xl font-bold text-neon-gradient mb-2 italic"
          >
            {t.title}
          </h2>
          {!preview && (
            <p className="text-muted-foreground text-sm sm:text-base">{t.subtitle}</p>
          )}
        </div>

        {/* Grid */}
        <div className={`scroll-reveal ${preview ? "" : "grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"}`}>
          {tracks.map((track) => (
            <LazyEmbed
              key={track.id}
              title={track.title}
              embedUrl={track.embedUrl}
              loadingText={t.loading}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SoundCloudMixes;
