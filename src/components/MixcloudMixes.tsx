import { useEffect, useRef, useState } from "react";
import { Disc3, Headphones } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useCookieConsent } from "@/contexts/CookieConsentContext";
import EmbedBlockedNotice from "@/components/EmbedBlockedNotice";

const translations = {
  sv: {
    title: "MIXCLOUD SETS",
    subtitle: "DJ Lobos senaste DJ-sets från Mixcloud",
    loading: "Laddar set…",
    empty: "Inga Mixcloud-sets tillgängliga just nu.",
  },
  en: {
    title: "MIXCLOUD SETS",
    subtitle: "DJ Lobo's latest DJ sets from Mixcloud",
    loading: "Loading set…",
    empty: "No Mixcloud sets available right now.",
  },
  es: {
    title: "SETS DE MIXCLOUD",
    subtitle: "Los últimos DJ sets de DJ Lobo en Mixcloud",
    loading: "Cargando set…",
    empty: "No hay sets de Mixcloud disponibles.",
  },
};

interface MixcloudTrack {
  id: string;
  title: string;
  mixcloud_url: string;
}

interface LazyMixcloudEmbedProps {
  title: string;
  mixcloudUrl: string;
  loadingText: string;
}

/**
 * Convert a Mixcloud profile/show URL into the widget embed URL.
 * Supports both full show URLs and feed URLs.
 */
const buildMixcloudEmbedUrl = (url: string): string => {
  // Already an embed URL
  if (url.includes("mixcloud.com/widget/iframe")) return url;
  // Extract path after mixcloud.com
  const path = url.replace(/https?:\/\/(www\.)?mixcloud\.com/, "").replace(/\/$/, "");
  return `https://www.mixcloud.com/widget/iframe/?dark=1&hide_cover=1&mini=1&feed=${encodeURIComponent(path + "/")}`;
};

const LazyMixcloudEmbed = ({ title, mixcloudUrl, loadingText }: LazyMixcloudEmbedProps) => {
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

  const embedUrl = buildMixcloudEmbedUrl(mixcloudUrl);

  return (
    <div
      ref={ref}
      className="rounded-xl border border-primary/20 bg-background/50 backdrop-blur-sm overflow-hidden transition-shadow hover:shadow-[0_0_24px_-6px_hsl(var(--primary)/0.3)]"
    >
      <div className="px-4 py-3 border-b border-primary/10 flex items-center gap-2">
        <Disc3 className="w-4 h-4 text-primary animate-spin-slow" aria-hidden="true" />
        <span className="font-display text-sm font-bold text-primary truncate">{title}</span>
      </div>
      <div className="h-[120px] relative">
        {!hasConsented ? (
          <EmbedBlockedNotice className="absolute inset-0" />
        ) : visible ? (
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
            <Headphones className="w-5 h-5 mr-2 text-primary animate-pulse" />
            {loadingText}
          </div>
        )}
      </div>
    </div>
  );
};

const MixcloudMixes = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { language } = useLanguage();
  const t = translations[language];
  const [tracks, setTracks] = useState<MixcloudTrack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTracks = async () => {
      const { data } = await supabase
        .from("mixcloud_mixes")
        .select("id, title, mixcloud_url")
        .order("sort_order", { ascending: true });
      setTracks(data || []);
      setLoading(false);
    };
    fetchTracks();
  }, []);

  if (!loading && tracks.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      id="mixcloud"
      className="py-12 sm:py-20 relative"
      aria-labelledby="mixcloud-title"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-6 sm:mb-10">
          <h2
            id="mixcloud-title"
            className="font-display text-2xl sm:text-4xl md:text-5xl font-bold text-neon-gradient mb-2 italic"
          >
            {t.title}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">{t.subtitle}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="loading-spinner" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {tracks.map((track) => (
              <LazyMixcloudEmbed
                key={track.id}
                title={track.title}
                mixcloudUrl={track.mixcloud_url}
                loadingText={t.loading}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default MixcloudMixes;
