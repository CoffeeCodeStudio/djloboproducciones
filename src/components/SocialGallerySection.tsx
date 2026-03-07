import { useState } from "react";
import { Instagram, Facebook, Youtube, ImageIcon } from "lucide-react";
import { useGallery } from "@/hooks/useGallery";
import { useLanguage } from "@/contexts/LanguageContext";
import MixcloudModal from "@/components/MixcloudModal";
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
    connectSubtitle: "Skapar magi på dansgolvet i Göteborg. Expert på House, World Hits, 80-tal, 90-tal & Latin beats.",
    gallery: "Galleri",
    noImages: "Inga bilder i galleriet ännu",
    followInstagram: "Följ på Instagram",
    joinFacebook: "Gilla på Facebook",
    joinFacebookRadio: "Följ oss på Facebook",
    subscribeYoutube: "Prenumerera på YouTube",
  },
  en: {
    connectTitle: "CONNECT WITH DJ LOBO",
    connectSubtitle: "Creating magic on the dance floor in Gothenburg. Expert in House, World Hits, 80s, 90s & Latin beats.",
    gallery: "Gallery",
    noImages: "No images in gallery yet",
    followInstagram: "Follow on Instagram",
    joinFacebook: "Join on Facebook",
    joinFacebookRadio: "Join us on Facebook",
    subscribeYoutube: "Subscribe on YouTube",
  },
  es: {
    connectTitle: "CONECTA CON DJ LOBO",
    connectSubtitle: "Creando magia en la pista de baile en Gotemburgo. Experto en House, World Hits, 80s, 90s & Latin beats.",
    gallery: "Galería",
    noImages: "No hay imágenes en la galería aún",
    followInstagram: "Seguir en Instagram",
    joinFacebook: "Únete en Facebook",
    joinFacebookRadio: "Únete en Facebook",
    subscribeYoutube: "Suscribirse en YouTube",
  },
};

const SocialGallerySection = () => {
  const { images, isLoading } = useGallery();
  const { language } = useLanguage();
  const t = translations[language];
  
  const [mixcloudModalOpen, setMixcloudModalOpen] = useState(false);
  const [selectedMixcloudTitle] = useState("");


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

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {isLoading ? (
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
                    src={optimizeGallery(image.image_url).src}
                    alt={image.alt_text || "DJ Lobo gallery image"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    width={400}
                    height={400}
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = optimizeGallery(image.image_url).fallback; }}
                  />
                  <div 
                    className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      boxShadow: "inset 0 0 30px rgba(255, 0, 255, 0.2)",
                    }}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t.noImages}</p>
              </div>
            )}
          </div>
        </div>

        {/* Social Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <a
            href={SOCIAL_LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-card font-display font-bold tracking-wider text-sm hover:scale-105 transition-all text-pink-500 hover:text-neon-pink"
          >
            <Instagram className="w-5 h-5" />
            {t.followInstagram}
          </a>
          <a
            href={SOCIAL_LINKS.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-card font-display font-bold tracking-wider text-sm hover:scale-105 transition-all text-neon-cyan hover:text-neon-pink"
          >
            <Facebook className="w-5 h-5" />
            {t.joinFacebookRadio}
          </a>
          <a
            href={SOCIAL_LINKS.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-card font-display font-bold tracking-wider text-sm hover:scale-105 transition-all text-red-500 hover:text-neon-pink"
          >
            <Youtube className="w-5 h-5" />
            {t.subscribeYoutube}
          </a>
        </div>
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
