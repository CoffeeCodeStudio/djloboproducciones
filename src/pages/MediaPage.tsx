import { useState } from "react";
import { Instagram, Youtube, Facebook, ExternalLink, Play, ImageIcon, Music } from "lucide-react";
import { useGallery, extractYouTubeId } from "@/hooks/useGallery";
import { useBranding } from "@/hooks/useBranding";
import { useLanguage } from "@/contexts/LanguageContext";
import MixCardGrid from "@/components/MixCardGrid";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import MediaFilterBar, { type MediaFilter } from "@/components/MediaFilterBar";
import MediaLightbox from "@/components/MediaLightbox";
import { optimizeGallery } from "@/lib/imageOptimizer";

const translations = {
  sv: {
    socialTitle: "FÖLJ DJ LOBO",
    eventHighlights: "EVENT HIGHLIGHTS",
    eventHighlightsDesc: "Ögonblicken som definierar upplevelsen — bröllop, företagsfester och klubbnätter.",
    noMedia: "Inga bilder eller videos ännu — lägg till via admin-panelen.",
    instagram: "Instagram",
    youtube: "YouTube",
    facebook: "Facebook",
  },
  en: {
    socialTitle: "FOLLOW DJ LOBO",
    eventHighlights: "EVENT HIGHLIGHTS",
    eventHighlightsDesc: "The moments that define the experience — weddings, corporate events and club nights.",
    noMedia: "No photos or videos yet — add them via the admin panel.",
    instagram: "Instagram",
    youtube: "YouTube",
    facebook: "Facebook",
  },
  es: {
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

const MediaPage = () => {
  const { images, isLoading } = useGallery();
  const { branding } = useBranding();
  const { language } = useLanguage();
  const t = translations[language];

  const [filter, setFilter] = useState<MediaFilter>("all");
  const [lightbox, setLightbox] = useState<{
    open: boolean;
    type: "photo" | "video";
    src: string;
    alt?: string;
    isYouTube?: boolean;
  }>({ open: false, type: "photo", src: "" });

  const socialLinks = {
    instagram: branding?.instagram_username
      ? `https://www.instagram.com/${branding.instagram_username}`
      : DEFAULT_SOCIAL.instagram,
    youtube: branding?.youtube_channel_id
      ? `https://www.youtube.com/${branding.youtube_channel_id.startsWith("@") ? branding.youtube_channel_id : `channel/${branding.youtube_channel_id}`}`
      : DEFAULT_SOCIAL.youtube,
    facebook: DEFAULT_SOCIAL.facebook,
  };

  // Build unified media items from gallery_images (which now have media_type)
  const allItems = (images || []).map((img) => {
    const isVideo = img.media_type === "video";
    const opt = optimizeGallery(img.image_url);
    const ytId = isVideo && img.video_url ? extractYouTubeId(img.video_url) : null;

    return {
      id: img.id,
      mediaType: isVideo ? ("video" as const) : ("photo" as const),
      src: opt.src,
      fallback: opt.fallback,
      alt: img.alt_text || "DJ Lobo event",
      videoUrl: img.video_url,
      youtubeId: ytId,
    };
  });

  const filtered = filter === "all" ? allItems : allItems.filter((i) => i.mediaType === filter);

  const counts = {
    all: allItems.length,
    photo: allItems.filter((i) => i.mediaType === "photo").length,
    video: allItems.filter((i) => i.mediaType === "video").length,
  };

  const openLightbox = (item: (typeof allItems)[0]) => {
    if (item.mediaType === "video" && item.youtubeId) {
      setLightbox({ open: true, type: "video", src: item.youtubeId, alt: item.alt, isYouTube: true });
    } else if (item.mediaType === "video" && item.videoUrl) {
      setLightbox({ open: true, type: "video", src: item.videoUrl, alt: item.alt, isYouTube: false });
    } else {
      setLightbox({ open: true, type: "photo", src: item.fallback, alt: item.alt });
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Mix Card Grid */}
      <ErrorBoundary>
        <MixCardGrid />
      </ErrorBoundary>

      {/* Social Links */}
      <section className="py-10 sm:py-14 px-4" aria-labelledby="social-heading">
        <h2 id="social-heading" className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-neon-gradient mb-8 text-center italic">
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

      {/* Event Highlights with Filter */}
      <section className="py-12 sm:py-20 px-4 sm:px-6" aria-labelledby="event-highlights-heading">
        <div className="text-center mb-8 sm:mb-12">
          <h2 id="event-highlights-heading" className="font-display text-2xl sm:text-4xl md:text-5xl font-bold text-neon-gradient mb-3 italic">
            {t.eventHighlights}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            {t.eventHighlightsDesc}
          </p>
        </div>

        {/* Filter Bar */}
        <MediaFilterBar active={filter} onChange={setFilter} counts={counts} />

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square glass-card animate-pulse bg-muted/20 rounded-xl" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
            {filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => openLightbox(item)}
                className="aspect-square glass-card overflow-hidden group relative rounded-xl border border-border/30 hover:border-primary/50 transition-all duration-300 cursor-pointer text-left"
              >
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

                {/* Type badge */}
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-background/60 text-foreground flex items-center gap-1 backdrop-blur-sm">
                    {item.mediaType === "video" ? <Play className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                    {item.mediaType === "video" ? "Video" : "Foto"}
                  </span>
                </div>

                {/* Play overlay for videos */}
                {item.mediaType === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/80 flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all shadow-lg shadow-primary/30">
                      <Play className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground ml-1" />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass-card rounded-xl">
            <Music className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">{t.noMedia}</p>
          </div>
        )}
      </section>

      {/* Lightbox */}
      <MediaLightbox
        open={lightbox.open}
        onClose={() => setLightbox((p) => ({ ...p, open: false }))}
        type={lightbox.type}
        src={lightbox.src}
        alt={lightbox.alt}
        isYouTube={lightbox.isYouTube}
      />

      <ErrorBoundary>
        <TestimonialsSection />
      </ErrorBoundary>

      <Footer />
    </div>
  );
};

export default MediaPage;
