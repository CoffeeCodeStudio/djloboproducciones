import { useEffect, useRef, useState } from "react";
import { Music, Headphones } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useCookieConsent } from "@/contexts/CookieConsentContext";
import EmbedBlockedNotice from "@/components/EmbedBlockedNotice";

const translations = {
  sv: {
    title: "SENASTE MIXAR",
    subtitle: "Lyssna på DJ Lobos senaste sets",
    loading: "Laddar mix…",
    empty: "Inga mixar tillgängliga just nu."
  },
  en: {
    title: "LATEST MIXES",
    subtitle: "Listen to DJ Lobo's latest sets",
    loading: "Loading mix…",
    empty: "No mixes available right now."
  },
  es: {
    title: "ÚLTIMAS MEZCLAS",
    subtitle: "Escucha los últimos sets de DJ Lobo",
    loading: "Cargando mezcla…",
    empty: "No hay mezclas disponibles en este momento."
  }
};

interface Track {
  id: string;
  title: string;
  soundcloud_url: string;
}

interface LazyEmbedProps {
  title: string;
  embedUrl: string;
  loadingText: string;
}

const LazyEmbed = ({ title, embedUrl, loadingText }: LazyEmbedProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const { hasConsented } = useCookieConsent();

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
    <div
      ref={ref}
      className="rounded-xl border border-neon-cyan/20 bg-background/50 backdrop-blur-sm overflow-hidden transition-shadow"
      style={{ boxShadow: "0 0 20px -8px hsla(180, 100%, 50%, 0.12)" }}>
      
      <div className="px-4 py-3 border-b border-neon-cyan/10 flex items-center gap-2">
        <Music className="w-4 h-4 text-[#FFD700]" aria-hidden="true" />
        <span className="font-display text-sm font-bold text-[#FFD700] truncate">{title}</span>
      </div>
      <div className="aspect-video sm:aspect-[16/7] relative">
        {!hasConsented ? (
          <EmbedBlockedNotice className="absolute inset-0" />
        ) : visible ?
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          className="absolute inset-0 w-full h-full"
          allow="autoplay"
          loading="lazy"
          title={title} /> :

        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
            <Headphones className="w-5 h-5 mr-2 text-neon-cyan animate-pulse" />
            {loadingText}
          </div>
        }
      </div>
    </div>);

};

interface SoundCloudMixesProps {
  preview?: boolean;
}

const SoundCloudMixes = ({ preview = false }: SoundCloudMixesProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const { language } = useLanguage();
  const t = translations[language];
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTracks = async () => {
      const { data } = await supabase.
      from("soundcloud_mixes").
      select("id, title, soundcloud_url").
      order("sort_order", { ascending: true });
      setTracks(data || []);
      setLoading(false);
    };
    fetchTracks();
  }, []);

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

  const displayTracks = preview ? tracks.slice(0, 1) : tracks;

  if (!loading && tracks.length === 0) {
    return;




  }

  return (
    <section
      ref={sectionRef}
      id="mixes"
      className={preview ? "py-8 relative" : "py-12 sm:py-20 relative"}
      aria-labelledby="mixes-title">
      
      <div className={preview ? "max-w-3xl mx-auto" : "max-w-5xl mx-auto"}>
        <div className="text-center mb-6 sm:mb-10 scroll-reveal">
          <h2
            id="mixes-title"
            className="font-display text-2xl sm:text-4xl md:text-5xl font-bold text-neon-gradient mb-2 italic">
            
            {t.title}
          </h2>
          {!preview && <p className="text-muted-foreground text-sm sm:text-base">{t.subtitle}</p>}
        </div>

        {loading ?
        <div className="flex items-center justify-center py-12">
            <div className="loading-spinner" />
          </div> :

        <div className={`scroll-reveal ${preview ? "" : "grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"}`}>
            {displayTracks.map((track) =>
          <LazyEmbed
            key={track.id}
            title={track.title}
            embedUrl={track.soundcloud_url}
            loadingText={t.loading} />

          )}
          </div>
        }
      </div>
    </section>);

};

export default SoundCloudMixes;