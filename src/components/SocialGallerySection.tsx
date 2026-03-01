import { useState } from "react";
import { Instagram, Facebook, Youtube, Play, ImageIcon, Headphones, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGallery } from "@/hooks/useGallery";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBranding } from "@/hooks/useBranding";
import MixcloudModal from "@/components/MixcloudModal";
import LazyYouTube from "@/components/LazyYouTube";
import { optimizeGallery } from "@/lib/imageOptimizer";

const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/djloboradio",
  facebook: "https://www.facebook.com/djloboradiodjs/",
  youtube: "https://www.youtube.com/@djloboproducciones3211",
  mixcloud: "https://www.mixcloud.com/DjLobo75/",
};

const translations = {
  sv: {
    connectTitle: "FÖLJ DJ LOBO",
    connectSubtitle: "Följ resan, fånga live-set och gå med i communityn",
    gallery: "Galleri",
    noImages: "Inga bilder i galleriet ännu",
    followInstagram: "Följ på Instagram",
    joinFacebook: "Gilla på Facebook",
    subscribeYoutube: "Prenumerera på YouTube",
    liveSets: "Live Sets & Videos",
    clickToWatch: "Klicka för att titta",
    latestVideo: "Senaste Videon",
    watchOnYoutube: "Se på YouTube",
    comingSoon: "Kommer Snart",
    exclusiveContent: "DJ Lobo exklusivt innehåll",
    featured: "Utvald",
    exclusive: "Exklusivt",
    seeAllVideos: "Se alla videos på YouTube",
    instagramPosts: "Instagram",
    viewOnInstagram: "Se på Instagram",
  },
  en: {
    connectTitle: "CONNECT WITH DJ LOBO",
    connectSubtitle: "Follow the journey, catch live sets, and join the community",
    gallery: "Gallery",
    noImages: "No images in gallery yet",
    followInstagram: "Follow on Instagram",
    joinFacebook: "Join on Facebook",
    subscribeYoutube: "Subscribe on YouTube",
    liveSets: "Live Sets & Videos",
    clickToWatch: "Click to watch",
    latestVideo: "Latest Video",
    watchOnYoutube: "Watch on YouTube",
    comingSoon: "Coming Soon",
    exclusiveContent: "DJ Lobo exclusive content",
    featured: "Featured",
    exclusive: "Exclusive",
    seeAllVideos: "See all videos on YouTube",
    instagramPosts: "Instagram",
    viewOnInstagram: "View on Instagram",
  },
  es: {
    connectTitle: "CONECTA CON DJ LOBO",
    connectSubtitle: "Sigue el viaje, mira sets en vivo y únete a la comunidad",
    gallery: "Galería",
    noImages: "No hay imágenes en la galería aún",
    followInstagram: "Seguir en Instagram",
    joinFacebook: "Únete en Facebook",
    subscribeYoutube: "Suscribirse en YouTube",
    liveSets: "Sets en Vivo & Videos",
    clickToWatch: "Clic para ver",
    latestVideo: "Último Video",
    watchOnYoutube: "Ver en YouTube",
    comingSoon: "Próximamente",
    exclusiveContent: "Contenido exclusivo de DJ Lobo",
    featured: "Destacado",
    exclusive: "Exclusivo",
    seeAllVideos: "Ver todos los videos en YouTube",
    instagramPosts: "Instagram",
    viewOnInstagram: "Ver en Instagram",
  },
};

// Helper to extract Instagram post ID from URL
const extractInstagramId = (url: string): string | null => {
  if (!url) return null;
  const match = url.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
};

const SocialGallerySection = () => {
  const { images, isLoading } = useGallery();
  const { language } = useLanguage();
  const { branding } = useBranding();
  const t = translations[language];
  
  // Mixcloud modal state
  const [mixcloudModalOpen, setMixcloudModalOpen] = useState(false);
  const [selectedMixcloudTitle, setSelectedMixcloudTitle] = useState("");
  
  // Featured video from branding (shown as main video)
  const featuredVideoId = branding?.youtube_video_id;

  // Get featured videos from branding (only show if they have values)
  const featuredVideos = [
    branding?.live_set_video_1,
    branding?.live_set_video_2,
    branding?.live_set_video_3,
    branding?.live_set_video_4,
    branding?.live_set_video_5,
  ].filter((id): id is string => !!id && id.trim() !== "");

  // Get Instagram post URLs from branding
  const instagramPosts = [
    branding?.instagram_post_1,
    branding?.instagram_post_2,
    branding?.instagram_post_3,
    branding?.instagram_post_4,
    branding?.instagram_post_5,
    branding?.instagram_post_6,
  ].filter((url): url is string => !!url && url.trim() !== "");

  const handleMixcloudClick = (title: string) => {
    setSelectedMixcloudTitle(title);
    setMixcloudModalOpen(true);
  };

  // Build dynamic social links
  const instagramLink = branding?.instagram_username 
    ? `https://www.instagram.com/${branding.instagram_username}`
    : SOCIAL_LINKS.instagram;
  
  const youtubeLink = branding?.youtube_channel_id
    ? `https://www.youtube.com/${branding.youtube_channel_id.startsWith('@') ? branding.youtube_channel_id : `channel/${branding.youtube_channel_id}`}`
    : SOCIAL_LINKS.youtube;

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6" aria-labelledby="social-gallery-heading">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 
            id="social-gallery-heading"
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-neon-gradient mb-4"
          >
            {t.connectTitle}
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            {t.connectSubtitle}
          </p>
        </div>

        {/* Photo Gallery Section */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-6">
            <h3 className="font-display text-xl sm:text-2xl font-bold text-neon-cyan flex items-center gap-3">
              <ImageIcon className="w-6 h-6" />
              {t.gallery}
            </h3>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square glass-card overflow-hidden animate-pulse bg-muted/20"
                />
              ))
            ) : images.length > 0 ? (
              images.map((image) => (
                <div
                  key={image.id}
                  className="aspect-square glass-card overflow-hidden group relative hover:border-neon-pink/50 transition-all duration-300"
                >
                  <img
                    src={optimizeGallery(image.image_url)}
                    alt={image.alt_text || "DJ Lobo gallery image"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    width={400}
                    height={400}
                  />
                  
                  {/* Hover overlay with neon glow */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      boxShadow: "inset 0 0 30px rgba(255, 0, 255, 0.2)",
                    }}
                  />
                </div>
              ))
            ) : (
              // Empty state
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t.noImages}</p>
              </div>
            )}
          </div>
        </div>

        {/* Latest Video Section - Uses youtube_video_id from branding */}
        <div className="mb-16">
          <h3 className="font-display text-xl sm:text-2xl font-bold text-neon-pink mb-6 flex items-center justify-center gap-3">
            <Youtube className="w-6 h-6" />
            {t.latestVideo}
          </h3>
          
          <div className="max-w-3xl mx-auto">
            <div className="glass-card overflow-hidden group hover:border-neon-pink/50 transition-all duration-300">
              {featuredVideoId ? (
                // Show actual YouTube video - lazy loaded
                <div className="aspect-video relative">
                  <LazyYouTube
                    videoId={featuredVideoId}
                    title="DJ Lobo - Latest Video"
                  />
                  
                  {/* Featured badge */}
                  <div className="absolute top-4 left-4 z-10 pointer-events-none">
                    <span className="px-3 py-1.5 rounded text-sm font-semibold flex items-center gap-1.5 bg-neon-pink/90 text-white">
                      <Play className="w-4 h-4" />
                      {t.featured}
                    </span>
                  </div>
                </div>
              ) : (
                // Placeholder when no video is set
                <div className="aspect-video relative">
                  <img
                    src="https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=1200&h=675&fit=crop"
                    alt="DJ Lobo - Coming Soon"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Coming Soon Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                    <div 
                      className="px-8 py-4 rounded-full bg-gradient-to-r from-neon-pink to-neon-cyan text-white font-bold text-lg uppercase tracking-wider mb-4"
                      style={{
                        boxShadow: "0 0 40px rgba(255, 0, 255, 0.5), 0 0 80px rgba(0, 255, 255, 0.3)",
                      }}
                    >
                      {t.comingSoon}
                    </div>
                    <p className="text-white/80 text-sm">{t.exclusiveContent}</p>
                  </div>

                  {/* Featured badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 rounded text-sm font-semibold flex items-center gap-1.5 bg-neon-pink/90 text-white">
                      <Play className="w-4 h-4" />
                      {t.featured}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Video Info */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-neon-pink flex items-center justify-center">
                    <Youtube className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-foreground">DJ Lobo Producciones</span>
                </div>
                <a
                  href={youtubeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-neon-cyan hover:underline flex items-center gap-1"
                >
                  {t.watchOnYoutube}
                  <Play className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Videos Grid - Only show if there are videos */}
        {featuredVideos.length > 0 && (
          <div className="mb-16">
            <h3 className="font-display text-xl sm:text-2xl font-bold text-neon-cyan mb-6 flex items-center gap-3">
              <Play className="w-6 h-6" />
              {t.liveSets}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVideos.map((videoId, index) => (
                <div
                  key={videoId}
                  className="glass-card overflow-hidden group transition-all duration-300 card-bpm-pulse video-card-hover hover:border-neon-cyan/50"
                >
                  {/* YouTube Embed - Lazy loaded */}
                  <div className="aspect-video relative">
                    <LazyYouTube
                      videoId={videoId}
                      title={`Featured Video ${index + 1}`}
                    />
                    
                    {/* Badge */}
                    <div className="absolute top-3 left-3 z-10 pointer-events-none">
                      <span className="px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 text-white bg-neon-pink/90">
                        <Play className="w-3 h-3" />
                        {t.exclusive}
                      </span>
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="p-4">
                    <h4 className="font-semibold text-foreground group-hover:text-neon-cyan transition-colors">
                      Live Set #{index + 1}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <Youtube className="w-3 h-3" />
                      DJ Lobo Producciones
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Link to full channel */}
            <div className="mt-8 text-center">
              <a
                href={youtubeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-neon-cyan hover:text-neon-pink transition-colors"
              >
                <Youtube className="w-5 h-5" />
                {t.seeAllVideos}
                <Play className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {/* Instagram Posts Section - Only show if there are posts */}
        {instagramPosts.length > 0 && (
          <div className="mb-16">
            <h3 className="font-display text-xl sm:text-2xl font-bold text-pink-500 mb-6 flex items-center gap-3">
              <Instagram className="w-6 h-6" />
              {t.instagramPosts}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {instagramPosts.map((postUrl, index) => {
                const postId = extractInstagramId(postUrl);
                
                return (
                  <a
                    key={index}
                    href={postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-square glass-card overflow-hidden group relative hover:border-pink-500/50 transition-all duration-300"
                  >
                    {/* Instagram embed image - using the embed URL pattern */}
                    <div className="w-full h-full bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 flex items-center justify-center">
                      <Instagram className="w-12 h-12 text-pink-500 group-hover:scale-110 transition-transform" />
                    </div>
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="text-center">
                        <ExternalLink className="w-8 h-8 text-white mx-auto mb-2" />
                        <span className="text-white text-xs">{t.viewOnInstagram}</span>
                      </div>
                    </div>
                    
                    {/* Post number badge */}
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-pink-500/90 text-white">
                        #{index + 1}
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
            
            {/* Link to Instagram profile */}
            <div className="mt-8 text-center">
              <a
                href={instagramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-pink-500 hover:text-neon-pink transition-colors"
              >
                <Instagram className="w-5 h-5" />
                {t.followInstagram}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {/* Show placeholder message if no videos or posts are configured */}
        {featuredVideos.length === 0 && instagramPosts.length === 0 && !featuredVideoId && (
          <div className="text-center py-12 glass-card mb-16">
            <Play className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h4 className="font-display text-xl font-bold text-muted-foreground mb-2">{t.comingSoon}</h4>
            <p className="text-sm text-muted-foreground">{t.exclusiveContent}</p>
          </div>
        )}
      </div>

      {/* Mixcloud Modal */}
      <MixcloudModal
        isOpen={mixcloudModalOpen}
        onClose={() => setMixcloudModalOpen(false)}
        title={selectedMixcloudTitle}
        mixcloudUrl={SOCIAL_LINKS.mixcloud}
      />
    </section>
  );
};

export default SocialGallerySection;