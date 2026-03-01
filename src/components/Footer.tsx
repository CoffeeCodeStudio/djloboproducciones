import { Instagram, Facebook, Youtube, ExternalLink, Radio } from "lucide-react";
import { Link } from "react-router-dom";
import { useBranding } from "@/hooks/useBranding";
import { useLanguage } from "@/contexts/LanguageContext";
import { optimizeLogo } from "@/lib/imageOptimizer";
const DEFAULT_SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/djloboradio",
  facebook: "https://www.facebook.com/djloboradiodjs/",
  youtube: "https://www.youtube.com/@djloboproducciones3211",
  zenoPlayer: "https://zeno.fm/radio/dj-lobo-radio-o85p/"
};
const LINKEDIN_URL = "https://www.linkedin.com/in/rami-e-453b77330/";
const translations = {
  sv: {
    description: "Bringing the best of 80s and 90s music to your ears. Tune in and let the nostalgia flow.",
    copyright: "© 2026 DJ Lobo Radio. All rights reserved.",
    privacyPolicy: "Integritetspolicy",
    terms: "Användarvillkor",
    followInstagram: "Följ DJ Lobo på Instagram (öppnas i nytt fönster)",
    followFacebook: "Följ DJ Lobo på Facebook (öppnas i nytt fönster)",
    subscribeYoutube: "Prenumerera på DJ Lobo på YouTube (öppnas i nytt fönster)",
    listenZeno: "Lyssna på DJ Lobo Radio på Zeno.fm (öppnas i nytt fönster)",
    visitStudio: "Besök Coffee Code Studio på LinkedIn (öppnas i nytt fönster)"
  },
  en: {
    description: "Bringing the best of 80s and 90s music to your ears. Tune in and let the nostalgia flow.",
    copyright: "© 2026 DJ Lobo Radio. All rights reserved.",
    privacyPolicy: "Privacy Policy",
    terms: "Terms of Service",
    followInstagram: "Follow DJ Lobo on Instagram (opens in new window)",
    followFacebook: "Follow DJ Lobo on Facebook (opens in new window)",
    subscribeYoutube: "Subscribe to DJ Lobo on YouTube (opens in new window)",
    listenZeno: "Listen to DJ Lobo Radio on Zeno.fm (opens in new window)",
    visitStudio: "Visit Coffee Code Studio on LinkedIn (opens in new window)"
  },
  es: {
    description: "Trayendo lo mejor de la música de los 80s y 90s a tus oídos. Sintoniza y deja que fluya la nostalgia.",
    copyright: "© 2026 DJ Lobo Radio. Todos los derechos reservados.",
    privacyPolicy: "Política de Privacidad",
    terms: "Términos de Servicio",
    followInstagram: "Seguir a DJ Lobo en Instagram (abre en nueva ventana)",
    followFacebook: "Seguir a DJ Lobo en Facebook (abre en nueva ventana)",
    subscribeYoutube: "Suscribirse a DJ Lobo en YouTube (abre en nueva ventana)",
    listenZeno: "Escuchar DJ Lobo Radio en Zeno.fm (abre en nueva ventana)",
    visitStudio: "Visitar Coffee Code Studio en LinkedIn (abre en nueva ventana)"
  }
};
const Footer = () => {
  const {
    language
  } = useLanguage();
  const { branding } = useBranding();
  const t = translations[language];
  
  // Build dynamic social links from branding
  const socialLinks = {
    instagram: branding?.instagram_username 
      ? `https://www.instagram.com/${branding.instagram_username}` 
      : DEFAULT_SOCIAL_LINKS.instagram,
    youtube: branding?.youtube_channel_id 
      ? `https://www.youtube.com/${branding.youtube_channel_id.startsWith('@') ? branding.youtube_channel_id : `channel/${branding.youtube_channel_id}`}` 
      : DEFAULT_SOCIAL_LINKS.youtube,
    facebook: DEFAULT_SOCIAL_LINKS.facebook,
    zenoPlayer: DEFAULT_SOCIAL_LINKS.zenoPlayer,
  };
  return <footer className="py-12 sm:py-16 px-4 sm:px-6 pb-32 sm:pb-36 relative">
      <div className="max-w-7xl mx-auto text-center">
        {/* Logo */}
        <div className="flex items-center justify-center mb-4 sm:mb-6">
            {branding?.logo_url ? (
              <img alt="DJ Lobo Radio Logo" className="h-16 sm:h-20 w-auto object-contain" src={optimizeLogo(branding.logo_url).src} loading="lazy" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = optimizeLogo(branding.logo_url).fallback; }} />
            ) : (
            <div className="h-16 sm:h-20 w-16 sm:w-20 flex items-center justify-center glass-card rounded-full">
              <Radio className="h-10 sm:h-12 w-10 sm:w-12 text-neon-cyan" />
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-muted-foreground/80 max-w-md mx-auto mb-6 sm:mb-8 text-sm sm:text-base px-2">
          {t.description}
        </p>

        {/* Social Links */}
        <nav aria-label="Sociala medier">
          <ul className="flex justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <li>
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label={t.followInstagram} className="tap-target w-12 h-12 glass-card rounded-full flex items-center justify-center transition-all duration-300 group focus-neon hover:scale-110" style={{
              boxShadow: "0 0 15px rgba(253, 29, 29, 0.3)"
            }}>
                <Instagram className="w-5 h-5 text-muted-foreground group-hover:text-[#E1306C] transition-colors" aria-hidden="true" />
              </a>
            </li>
            <li>
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label={t.followFacebook} className="tap-target w-12 h-12 glass-card rounded-full flex items-center justify-center transition-all duration-300 group focus-neon hover:scale-110" style={{
              boxShadow: "0 0 15px rgba(24, 119, 242, 0.3)"
            }}>
                <Facebook className="w-5 h-5 text-muted-foreground group-hover:text-[#1877F2] transition-colors" aria-hidden="true" />
              </a>
            </li>
            <li>
              <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" aria-label={t.subscribeYoutube} className="tap-target w-12 h-12 glass-card rounded-full flex items-center justify-center transition-all duration-300 group focus-neon hover:scale-110" style={{
              boxShadow: "0 0 15px rgba(255, 0, 0, 0.3)"
            }}>
                <Youtube className="w-5 h-5 text-muted-foreground group-hover:text-[#FF0000] transition-colors" aria-hidden="true" />
              </a>
            </li>
            <li>
              <a href={socialLinks.zenoPlayer} target="_blank" rel="noopener noreferrer" aria-label={t.listenZeno} className="tap-target w-12 h-12 glass-card rounded-full flex items-center justify-center transition-all duration-300 group focus-neon hover:scale-110" style={{
              boxShadow: "0 0 15px rgba(0, 255, 255, 0.3)"
            }}>
                <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-neon-cyan transition-colors" aria-hidden="true" />
              </a>
            </li>
          </ul>
        </nav>

        {/* Copyright */}
        <p className="text-muted-foreground/70 text-xs sm:text-sm mb-3 sm:mb-4">
          {t.copyright}
        </p>

        {/* Legal Links */}
        <nav aria-label="Juridiska länkar">
          <ul className="flex justify-center gap-3 sm:gap-4 text-xs sm:text-sm">
            <li>
              <Link to="/privacy" className="text-neon-cyan hover:underline focus-neon rounded px-1">
                {t.privacyPolicy}
              </Link>
            </li>
            <li aria-hidden="true">
              <span className="text-muted-foreground">•</span>
            </li>
            <li>
              <Link to="/terms" className="text-neon-cyan hover:underline focus-neon rounded px-1">
                {t.terms}
              </Link>
            </li>
          </ul>
        </nav>

        {/* Coffee Code Studio Signature - Always visible */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg glass-card hover:scale-105 transition-all duration-300 focus-neon" aria-label={t.visitStudio} style={{
          boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)"
        }}>
            <span className="text-neon-cyan font-bold text-lg" style={{
            textShadow: "0 0 15px rgba(0, 255, 255, 0.8)"
          }}>
              &lt;
            </span>
            <span className="text-xl" style={{
            filter: "drop-shadow(0 0 10px rgba(0, 255, 255, 0.6))"
          }}>
              ☕️
            </span>
            <span className="text-neon-cyan font-bold text-lg" style={{
            textShadow: "0 0 15px rgba(0, 255, 255, 0.8)"
          }}>
              &gt;
            </span>
            <span className="ml-1 font-semibold tracking-wide text-white text-sm sm:text-base" style={{
            textShadow: "0 0 12px rgba(0, 255, 255, 0.5)"
          }}>
              Coffee Code Studio
            </span>
          </a>
        </div>
      </div>
    </footer>;
};
export default Footer;