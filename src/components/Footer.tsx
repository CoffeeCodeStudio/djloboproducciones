import { Instagram, Facebook, Youtube, ExternalLink, Radio, Mail, Phone, MapPin } from "lucide-react";
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
    contact: "Kontakt",
    about: "Om DJ Lobo",
    aboutText: "Professionell DJ i Göteborg med 20+ års erfarenhet. Expert på 80-tal, 90-tal och latinmusik.",
    location: "Göteborg, Sverige",
    followInstagram: "Följ på Instagram",
    followFacebook: "Följ på Facebook",
    subscribeYoutube: "Prenumerera på YouTube",
    listenZeno: "Lyssna på Zeno.fm",
    visitStudio: "Besök Coffee Code Studio",
  },
  en: {
    description: "Bringing the best of 80s and 90s music to your ears. Tune in and let the nostalgia flow.",
    copyright: "© 2026 DJ Lobo Radio. All rights reserved.",
    privacyPolicy: "Privacy Policy",
    terms: "Terms of Service",
    contact: "Contact",
    about: "About DJ Lobo",
    aboutText: "Professional DJ in Gothenburg with 20+ years of experience. Expert in 80s, 90s and Latin music.",
    location: "Gothenburg, Sweden",
    followInstagram: "Follow on Instagram",
    followFacebook: "Follow on Facebook",
    subscribeYoutube: "Subscribe on YouTube",
    listenZeno: "Listen on Zeno.fm",
    visitStudio: "Visit Coffee Code Studio",
  },
  es: {
    description: "Trayendo lo mejor de la música de los 80s y 90s a tus oídos. Sintoniza y deja que fluya la nostalgia.",
    copyright: "© 2026 DJ Lobo Radio. Todos los derechos reservados.",
    privacyPolicy: "Política de Privacidad",
    terms: "Términos de Servicio",
    contact: "Contacto",
    about: "Sobre DJ Lobo",
    aboutText: "DJ profesional en Gotemburgo con más de 20 años de experiencia. Experto en música de los 80, 90 y latina.",
    location: "Gotemburgo, Suecia",
    followInstagram: "Seguir en Instagram",
    followFacebook: "Seguir en Facebook",
    subscribeYoutube: "Suscribirse en YouTube",
    listenZeno: "Escuchar en Zeno.fm",
    visitStudio: "Visitar Coffee Code Studio",
  }
};

const Footer = () => {
  const { language } = useLanguage();
  const { branding } = useBranding();
  const t = translations[language];

  const socialLinks = {
    instagram: branding?.instagram_username
      ? `https://www.instagram.com/${branding.instagram_username}`
      : DEFAULT_SOCIAL_LINKS.instagram,
    youtube: branding?.youtube_channel_id
      ? `https://www.youtube.com/${branding.youtube_channel_id.startsWith("@") ? branding.youtube_channel_id : `channel/${branding.youtube_channel_id}`}`
      : DEFAULT_SOCIAL_LINKS.youtube,
    facebook: DEFAULT_SOCIAL_LINKS.facebook,
    zenoPlayer: DEFAULT_SOCIAL_LINKS.zenoPlayer,
  };

  return (
    <footer className="py-12 sm:py-16 px-4 sm:px-6 pb-32 sm:pb-36 relative border-t border-neon-purple/20">
      <div className="max-w-7xl mx-auto">
        {/* Grid: About + Contact + Social */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              {branding?.logo_url ? (
                <img alt="DJ Lobo Radio Logo" className="h-12 w-auto object-contain" src={optimizeLogo(branding.logo_url).src} loading="lazy" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = optimizeLogo(branding.logo_url).fallback; }} />
              ) : (
                <div className="h-12 w-12 flex items-center justify-center glass-card rounded-full">
                  <Radio className="h-8 w-8 text-neon-cyan" />
                </div>
              )}
            </div>
            <h3 className="font-display text-lg font-bold text-neon-gradient mb-2">{t.about}</h3>
            <p className="text-muted-foreground/80 text-sm leading-relaxed">{t.aboutText}</p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-lg font-bold text-neon-gradient mb-4">{t.contact}</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-neon-cyan flex-shrink-0" />
                <a href="mailto:info@djloboproducciones.com" className="hover:text-neon-cyan transition-colors">info@djloboproducciones.com</a>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 text-neon-pink flex-shrink-0" />
                <a href="tel:+46769125260" className="hover:text-neon-pink transition-colors">+46 76 912 52 60</a>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-neon-purple flex-shrink-0" />
                <span>{t.location}</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-display text-lg font-bold text-neon-gradient mb-4">Social</h3>
            <nav aria-label="Sociala medier">
              <ul className="flex gap-3">
                <li>
                  <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label={t.followInstagram} className="tap-target w-11 h-11 glass-card rounded-full flex items-center justify-center transition-all group focus-neon hover:scale-110">
                    <Instagram className="w-5 h-5 text-muted-foreground group-hover:text-neon-pink transition-colors" />
                  </a>
                </li>
                <li>
                  <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label={t.followFacebook} className="tap-target w-11 h-11 glass-card rounded-full flex items-center justify-center transition-all group focus-neon hover:scale-110">
                    <Facebook className="w-5 h-5 text-muted-foreground group-hover:text-neon-cyan transition-colors" />
                  </a>
                </li>
                <li>
                  <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" aria-label={t.subscribeYoutube} className="tap-target w-11 h-11 glass-card rounded-full flex items-center justify-center transition-all group focus-neon hover:scale-110">
                    <Youtube className="w-5 h-5 text-muted-foreground group-hover:text-neon-pink transition-colors" />
                  </a>
                </li>
                <li>
                  <a href={socialLinks.zenoPlayer} target="_blank" rel="noopener noreferrer" aria-label={t.listenZeno} className="tap-target w-11 h-11 glass-card rounded-full flex items-center justify-center transition-all group focus-neon hover:scale-110">
                    <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-neon-cyan transition-colors" />
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-neon-purple/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground/70 text-xs">{t.copyright}</p>
          <nav aria-label="Juridiska länkar">
            <ul className="flex gap-4 text-xs">
              <li><Link to="/privacy" className="text-neon-cyan hover:underline">{t.privacyPolicy}</Link></li>
              <li><Link to="/terms" className="text-neon-cyan hover:underline">{t.terms}</Link></li>
            </ul>
          </nav>
        </div>

        {/* Coffee Code Studio */}
        <div className="mt-6 text-center">
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg glass-card hover:scale-105 transition-all focus-neon" aria-label={t.visitStudio}>
            <span className="text-neon-cyan font-bold text-lg" style={{ textShadow: "0 0 15px rgba(0,255,255,0.8)" }}>&lt;</span>
            <span className="text-xl" style={{ filter: "drop-shadow(0 0 10px rgba(0,255,255,0.6))" }}>☕️</span>
            <span className="text-neon-cyan font-bold text-lg" style={{ textShadow: "0 0 15px rgba(0,255,255,0.8)" }}>&gt;</span>
            <span className="ml-1 font-semibold tracking-wide text-foreground text-sm">Coffee Code Studio</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
