import { Instagram, Youtube, Facebook, ExternalLink, Play, ImageIcon, Music } from "lucide-react";
import { useGallery } from "@/hooks/useGallery";
import { useBranding } from "@/hooks/useBranding";
import { useLanguage } from "@/contexts/LanguageContext";
import MixCardGrid from "@/components/MixCardGrid";
import LazyYouTube from "@/components/LazyYouTube";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { optimizeGallery } from "@/lib/imageOptimizer";

const translations = {
  sv: {
    pageTitle: "MEDIA",
    pageSubtitle: "Mixar, sociala medier och event highlights — allt på ett ställe",
    socialTitle: "FÖLJ DJ LOBO",
    eventHighlights: "EVENT HIGHLIGHTS",
    eventHighlightsDesc: "Ögonblicken som definierar upplevelsen — bröllop, företagsfester och klubbnätter.",
    noMedia: "Inga bilder eller videos ännu — lägg till via admin-panelen.",
    instagram: "Instagram",
    youtube: "YouTube",
    facebook: "Facebook",
  },
  en: {
    pageTitle: "MEDIA",
    pageSubtitle: "Mixes, social media and event highlights — all in one place",
    socialTitle: "FOLLOW DJ LOBO",
    eventHighlights: "EVENT HIGHLIGHTS",
    eventHighlightsDesc: "The moments that define the experience — weddings, corporate events and club nights.",
    noMedia: "No photos or videos yet — add them via the admin panel.",
    instagram: "Instagram",
    youtube: "YouTube",
    facebook: "Facebook",
  },
  es: {
    pageTitle: "MEDIA",
    pageSubtitle: "Mezclas, redes sociales y momentos destacados — todo en un solo lugar",
    socialTitle: "SIGUE A DJ LOBO",
    eventHighlights: "MOMENTOS DESTACADOS",
    eventHighlightsDesc: "Los momentos que definen la experiencia — bodas, eventos corporativos y noches de club.",
    noMedia: "No hay fotos ni videos todavía — agrégalos desde el panel de administración.",
    instagram: "Instagram",
    youtube: "YouTube",
    facebook: "Facebook",
  },
};

const DEFAULT_SOCIAL = {
  instagram: "https://www.instagram.com/djloboradio",
  youtube: "https://www.youtube.com/@djloboproducciones3211",
  facebook: "https://www.facebook.com/djloboradiodjs/",
};

type MediaItem =
  | { type: "photo"; id: string; src: string; fallback: string; alt: string }
  | { type: "video"; id: string; videoId: string; title: string };

const MediaPage = () => {
  const { images, isLoading } = useGallery();
  const { branding } = useBranding();
  const { language } = useLanguage();
  const t = translations[language];

  const socialLinks = {
    instagram: branding?.instagram_username
      ? `https://www.instagram.com/${branding.instagram_username}`
      : DEFAULT_SOCIAL.instagram,
    youtube: branding?.youtube_channel_id
      ? `https://www.youtube.com/${branding.youtube_channel_id.startsWith("@") ? branding.youtube_channel_id : `channel/${branding.youtube_channel_id}`}`
      : DEFAULT_SOCIAL.youtube,
    facebook: DEFAULT_SOCIAL.facebook,
  };

  const videoIds = [
    branding?.youtube_video_id,
    branding?.live_set_video_1,
    branding?.live_set_video_2,
    branding?.live_set_video_3,
    branding?.live_set_video_4,
    branding?.live_set_video_5,
  ].filter((id): id is string => !!id && id.trim() !== "");

  const mediaItems: MediaItem[] = [];
  const photos = (images || []).map((img) => {
    const opt = optimizeGallery(img.image_url);
    return { type: "photo" as const, id: img.id, src: opt.src, fallback: opt.fallback, alt: img.alt_text || "DJ Lobo event" };
  });
  const videos = videoIds.map((vid, i) => ({
    type: "video" as const,
    id: `vid-${vid}`,
    videoId: vid,
    title: i === 0 ? "Featured Video" : `Live Set #${i}`,
  }));

  let pi = 0, vi = 0;
  while (pi < photos.length || vi < videos.length) {
    if (pi < photos.length) mediaItems.push(photos[pi++]);
    if (pi < photos.length) mediaItems.push(photos[pi++]);
    if (vi < videos.length) mediaItems.push(videos[vi++]);
  }

  const hasMedia = mediaItems.length > 0;

  return (
    <div className="max-w-7xl mx-auto">

      {/* ═══ TOP: Mix Card Grid ═══ */}
      <ErrorBoundary>
        <MixCardGrid />
      </ErrorBoundary>

      {/* ═══ MIDDLE: Social Media Links ═══ */}
      <section className="py-10 sm:py-14 px-4" aria-labelledby="social-heading">
        <h2
          id="social-heading"
          className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-neon-gradient mb-8 text-center italic"
        >
          {t.socialTitle}
        </h2>
        <div className="flex justify-center gap-4 flex-wrap">
          <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 glass-card rounded-xl border border-primary/30 hover:border-primary/60 hover:scale-105 transition-all group">
            <Instagram className="w-5 h-5 text-primary group-hover:drop-shadow-[0_0_8px_hsl(var(--primary)/0.6)]" />
            <span className="font-medium text-sm">{t.instagram}</span>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
          </a>
          <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 glass-card rounded-xl border border-destructive/30 hover:border-destructive/60 hover:scale-105 transition-all group">
            <Youtube className="w-5 h-5 text-destructive group-hover:drop-shadow-[0_0_8px_hsl(var(--destructive)/0.6)]" />
            <span className="font-medium text-sm">{t.youtube}</span>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
          </a>
          <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 glass-card rounded-xl border border-secondary/30 hover:border-secondary/60 hover:scale-105 transition-all group">
            <Facebook className="w-5 h-5 text-secondary group-hover:drop-shadow-[0_0_8px_hsl(var(--secondary)/0.6)]" />
            <span className="font-medium text-sm">{t.facebook}</span>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
          </a>
        </div>
      </section>

      {/* ═══ BOTTOM: Event Highlights — photo/video grid ═══ */}
      <section className="py-12 sm:py-20 px-4 sm:px-6" aria-labelledby="event-highlights-heading">
        <div className="text-center mb-8 sm:mb-12">
          <h2 id="event-highlights-heading" className="font-display text-2xl sm:text-4xl md:text-5xl font-bold text-neon-gradient mb-3 italic">
            {t.eventHighlights}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            {t.eventHighlightsDesc}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square glass-card animate-pulse bg-muted/20 rounded-xl" />
            ))}
          </div>
        ) : hasMedia ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
            {mediaItems.map((item) =>
              item.type === "photo" ? (
                <div key={item.id} className="aspect-square glass-card overflow-hidden group relative rounded-xl hover:border-primary/50 transition-all duration-300">
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    width={400}
                    height={400}
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = item.fallback; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-background/60 text-foreground flex items-center gap-1 backdrop-blur-sm">
                      <ImageIcon className="w-3 h-3" /> Foto
                    </span>
                  </div>
                </div>
              ) : (
                <div key={item.id} className="aspect-square glass-card overflow-hidden rounded-xl hover:border-secondary/50 transition-all duration-300 relative">
                  <LazyYouTube videoId={item.videoId} title={item.title} className="rounded-xl" />
                  <div className="absolute top-2 left-2 z-10 pointer-events-none">
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-primary/90 text-primary-foreground flex items-center gap-1">
                      <Play className="w-3 h-3" /> Video
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="text-center py-12 glass-card rounded-xl">
            <Music className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">{t.noMedia}</p>
          </div>
        )}
      </section>

      {/* Testimonials */}
      <ErrorBoundary>
        <TestimonialsSection />
      </ErrorBoundary>

      <Footer />
    </div>
  );
};

export default MediaPage;
