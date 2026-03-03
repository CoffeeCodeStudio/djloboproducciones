import { Instagram, Youtube, Facebook, ExternalLink } from "lucide-react";
import SocialGallerySection from "@/components/SocialGallerySection";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useBranding } from "@/hooks/useBranding";
import { useLanguage } from "@/contexts/LanguageContext";

const translations = {
  sv: {
    followTitle: "FÖLJ DJ LOBO",
    followSubtitle: "Håll dig uppdaterad på alla plattformar",
    instagram: "Instagram",
    youtube: "YouTube",
    facebook: "Facebook",
  },
  en: {
    followTitle: "FOLLOW DJ LOBO",
    followSubtitle: "Stay updated on all platforms",
    instagram: "Instagram",
    youtube: "YouTube",
    facebook: "Facebook",
  },
  es: {
    followTitle: "SIGUE A DJ LOBO",
    followSubtitle: "Mantente actualizado en todas las plataformas",
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

const GalleryPage = () => {
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

  return (
    <div className="max-w-7xl mx-auto">
      {/* Social Links Bar */}
      <section className="pt-12 sm:pt-16 pb-6 text-center">
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-neon-gradient mb-3 italic">
          {t.followTitle}
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg mb-8">
          {t.followSubtitle}
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <a
            href={socialLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-5 py-3 glass-card rounded-xl border border-neon-pink/30 hover:border-neon-pink/60 hover:scale-105 transition-all group"
          >
            <Instagram className="w-5 h-5 text-neon-pink group-hover:drop-shadow-[0_0_8px_rgba(255,0,128,0.6)]" />
            <span className="font-medium text-sm">{t.instagram}</span>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
          </a>
          <a
            href={socialLinks.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-5 py-3 glass-card rounded-xl border border-red-500/30 hover:border-red-500/60 hover:scale-105 transition-all group"
          >
            <Youtube className="w-5 h-5 text-red-500 group-hover:drop-shadow-[0_0_8px_rgba(255,0,0,0.6)]" />
            <span className="font-medium text-sm">{t.youtube}</span>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
          </a>
          <a
            href={socialLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-5 py-3 glass-card rounded-xl border border-neon-cyan/30 hover:border-neon-cyan/60 hover:scale-105 transition-all group"
          >
            <Facebook className="w-5 h-5 text-neon-cyan group-hover:drop-shadow-[0_0_8px_rgba(0,255,255,0.6)]" />
            <span className="font-medium text-sm">{t.facebook}</span>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
          </a>
        </div>
      </section>

      {/* Gallery + Videos + Instagram */}
      <ErrorBoundary>
        <SocialGallerySection />
      </ErrorBoundary>

      {/* References / Testimonials */}
      <ErrorBoundary>
        <TestimonialsSection />
      </ErrorBoundary>

      <Footer />
    </div>
  );
};

export default GalleryPage;
