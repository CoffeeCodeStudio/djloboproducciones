import { forwardRef } from "react";
import { Instagram, Facebook, Youtube, Radio as RadioIcon, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useBranding } from "@/hooks/useBranding";
import { useLanguage } from "@/contexts/LanguageContext";

const DEFAULT_SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/djloboradio",
  facebookRadio: "https://www.facebook.com/djloboradiodjs/",
  facebookProd: "https://www.facebook.com/DjloboProduccionesSweden/",
  youtube: "https://www.youtube.com/@djloboproducciones3211",
  zenoPlayer: "https://zeno.fm/radio/dj-lobo-radio-o85p/"
};
const LINKEDIN_URL = "https://www.linkedin.com/in/rami-e-453b77330/";

const translations = {
  sv: {
    copyright: "© 2026 DJ Lobo Producciones. All rights reserved.",
    privacyPolicy: "Integritetspolicy",
    terms: "Användarvillkor",
    contact: "Kontakt",
    about: "Om DJ Lobo",
    aboutText: "Professionell DJ i Göteborg med 20+ års erfarenhet. Expert på House, World Hits, 80-tal, 90-tal och Latin beats.",
    location: "Göteborg, Sverige",
    bookSection: "DJ Lobo Producciones",
    radioSection: "Följ Radion",
    visitStudio: "Besök Coffee Code Studio"
  },
  en: {
    copyright: "© 2026 DJ Lobo Producciones. All rights reserved.",
    privacyPolicy: "Privacy Policy",
    terms: "Terms of Service",
    contact: "Contact",
    about: "About DJ Lobo",
    aboutText: "Professional DJ in Gothenburg with 20+ years of experience. Expert in House, World Hits, 80s, 90s and Latin beats.",
    location: "Gothenburg, Sweden",
    bookSection: "DJ Lobo Producciones",
    radioSection: "Follow the Radio",
    visitStudio: "Visit Coffee Code Studio"
  },
  es: {
    copyright: "© 2026 DJ Lobo Producciones. Todos los derechos reservados.",
    privacyPolicy: "Política de Privacidad",
    terms: "Términos de Servicio",
    contact: "Contacto",
    about: "Sobre DJ Lobo",
    aboutText: "DJ profesional en Gotemburgo con más de 20 años de experiencia. Experto en House, World Hits, 80s, 90s y Latin beats.",
    location: "Gotemburgo, Suecia",
    bookSection: "DJ Lobo Producciones",
    radioSection: "Sigue la Radio",
    visitStudio: "Visitar Coffee Code Studio"
  }
};

const Footer = forwardRef<HTMLElement>((_, ref) => {
  const { language } = useLanguage();
  const { branding } = useBranding();
  const t = translations[language];

  const socialLinks = {
    instagram: branding?.instagram_username ?
    `https://www.instagram.com/${branding.instagram_username}` :
    DEFAULT_SOCIAL_LINKS.instagram,
    youtube: branding?.youtube_channel_id ?
    `https://www.youtube.com/${branding.youtube_channel_id.startsWith("@") ? branding.youtube_channel_id : `channel/${branding.youtube_channel_id}`}` :
    DEFAULT_SOCIAL_LINKS.youtube,
    facebookRadio: DEFAULT_SOCIAL_LINKS.facebookRadio,
    facebookProd: DEFAULT_SOCIAL_LINKS.facebookProd,
    zenoPlayer: DEFAULT_SOCIAL_LINKS.zenoPlayer
  };

  return (
    <footer ref={ref} className="py-12 sm:py-16 px-4 sm:px-6 pb-32 sm:pb-36 relative border-t border-neon-purple/20">
      <div className="max-w-7xl mx-auto">
        {/* Grid: About + Contact + Social */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-8 mb-10">
          {/* About */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              {branding?.logo_url ?
              <img
                alt="DJ Lobo Radio Logo"
                className="!h-16 sm:!h-24 w-auto object-contain rounded-xl drop-shadow-[0_0_15px_rgba(0,255,255,0.3)] bg-transparent animate-fade-in"
                src={branding.logo_url}
                loading="lazy"
                width={120}
                height={120} /> :


              <div className="h-16 sm:h-24 w-16 sm:w-24 flex items-center justify-center glass-card rounded-full">
                  <RadioIcon className="h-10 sm:h-16 w-10 sm:w-16 text-neon-cyan" />
                </div>
              }
            </div>
            
            
          </div>

          {/* Contact */}
          <div className="flex flex-col">
            <h3 className="font-display text-lg font-bold text-neon-gradient mb-4">{t.contact}</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-neon-cyan flex-shrink-0 mt-0.5" />
                <a href="mailto:info@djloboproducciones.com" className="hover:text-neon-cyan transition-colors break-all">info@djloboproducciones.com</a>
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

          {/* Section 1: Boka DJ Lobo */}
          <div className="flex flex-col">
            <h3 className="font-display text-lg font-bold text-neon-pink mb-4">{t.bookSection}</h3>
            <nav aria-label={t.bookSection}>
              <ul className="space-y-3">
                <li>
                  <a href={socialLinks.facebookProd} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-neon-pink transition-colors group">
                    <span className="w-9 h-9 glass-card rounded-full flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <Facebook className="w-4 h-4 text-muted-foreground group-hover:text-neon-pink transition-colors" />
                    </span>
                    <span>FB Producciones</span>
                  </a>
                </li>
                <li>
                  <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-neon-pink transition-colors group">
                    <span className="w-9 h-9 glass-card rounded-full flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <Instagram className="w-4 h-4 text-muted-foreground group-hover:text-neon-pink transition-colors" />
                    </span>
                    <span>Instagram</span>
                  </a>
                </li>
                <li>
                  <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-neon-pink transition-colors group">
                    <span className="w-9 h-9 glass-card rounded-full flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <Youtube className="w-4 h-4 text-muted-foreground group-hover:text-neon-pink transition-colors" />
                    </span>
                    <span>YouTube</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          {/* Section 2: Följ Radion */}
          <div className="flex flex-col">
            <h3 className="font-display text-lg font-bold text-neon-cyan mb-4">{t.radioSection}</h3>
            <nav aria-label={t.radioSection}>
              <ul className="space-y-3">
                <li>
                  <a href={socialLinks.facebookRadio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-neon-cyan transition-colors group">
                    <span className="w-9 h-9 glass-card rounded-full flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <Facebook className="w-4 h-4 text-muted-foreground group-hover:text-neon-cyan transition-colors" />
                    </span>
                    <span>FB Radio</span>
                  </a>
                </li>
                <li>
                  <a href={socialLinks.zenoPlayer} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-neon-cyan transition-colors group">
                    <span className="w-9 h-9 glass-card rounded-full flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <RadioIcon className="w-4 h-4 text-muted-foreground group-hover:text-neon-cyan transition-colors" />
                    </span>
                    <span>ZenoFM</span>
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

        {/* Coffee Code Studio Credit */}
        <div className="mt-8 pt-4 border-t border-muted/10 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground/50">
            Design & Development by{" "}
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-muted-foreground/70 transition-colors underline decoration-dotted underline-offset-2">
              
              Coffee Code Studio
            </a>
            {" "}☕
          </p>
        </div>
      </div>
    </footer>);

});

Footer.displayName = "Footer";

export default Footer;