import { forwardRef } from "react";
import { Instagram, Facebook, Youtube, Radio as RadioIcon, Music, Mail, Phone, MapPin, Cookie } from "lucide-react";
import { Link } from "react-router-dom";
import { useLocalizedTo } from "@/hooks/useLocalizedTo";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCookieConsent } from "@/contexts/CookieConsentContext";
import { useBranding } from "@/hooks/useBranding";
import NeonWordmark from "@/components/NeonWordmark";
import { SOCIAL_LINKS, SOCIAL_LINK_GROUPS, safeUrl } from "@/config/socialLinks";
import type { SocialLinkGroup, SocialLinkGroupItem } from "@/config/socialLinks";

const DEFAULT_SOCIAL_LINKS = {
  instagram: SOCIAL_LINKS.instagram,
  facebookRadio: SOCIAL_LINKS.facebook,
  facebookProd: SOCIAL_LINKS.facebookProducciones,
  youtube: SOCIAL_LINKS.youtube,
  zenoPlayer: SOCIAL_LINKS.zenoPlayer
};

const ICONS = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  music: Music,
  radio: RadioIcon,
} as const;

const COLOR_STYLES: Record<SocialLinkGroup["color"], { heading: string; hover: string; iconHover: string }> = {
  "neon-pink": {
    heading: "text-neon-pink",
    hover: "hover:text-neon-pink",
    iconHover: "group-hover:text-neon-pink",
  },
  "neon-cyan": {
    heading: "text-neon-cyan",
    hover: "hover:text-neon-cyan",
    iconHover: "group-hover:text-neon-cyan",
  },
};

const translations = {
  sv: {
    copyright: "© 2026 DJ Lobo Producciones. Alla rättigheter förbehållna.",
    privacyPolicy: "Integritetspolicy",
    terms: "Användarvillkor",
    cookieSettings: "Cookie-inställningar",
    contact: "Kontakt",
    about: "Om DJ Lobo",
    aboutText: "Professionell DJ i Göteborg med 20+ års erfarenhet. Expert på House, World Hits, 80-tal, 90-tal och Latin beats.",
    location: "Göteborg, Sverige",
    visitStudio: "Besök Coffee Code Studio"
  },
  en: {
    copyright: "© 2026 DJ Lobo Producciones. All rights reserved.",
    privacyPolicy: "Privacy Policy",
    terms: "Terms of Service",
    cookieSettings: "Cookie Settings",
    contact: "Contact",
    about: "About DJ Lobo",
    aboutText: "Professional DJ in Gothenburg with 20+ years of experience. Expert in House, World Hits, 80s, 90s and Latin beats.",
    location: "Gothenburg, Sweden",
    visitStudio: "Visit Coffee Code Studio"
  },
  es: {
    copyright: "© 2026 DJ Lobo Producciones. Todos los derechos reservados.",
    privacyPolicy: "Política de Privacidad",
    terms: "Términos de Servicio",
    cookieSettings: "Configuración de Cookies",
    contact: "Contacto",
    about: "Sobre DJ Lobo",
    aboutText: "DJ profesional en Gotemburgo con más de 20 años de experiencia. Experto en House, World Hits, 80s, 90s y Latin beats.",
    location: "Gotemburgo, Suecia",
    visitStudio: "Visitar Coffee Code Studio"
  }
};

const Footer = forwardRef<HTMLElement>((_, ref) => {
  const { language } = useLanguage();
  const lto = useLocalizedTo();
  const { branding } = useBranding();
  
  const { resetConsent } = useCookieConsent();
  const t = translations[language];

  const socialLinks = {
    instagram: safeUrl(DEFAULT_SOCIAL_LINKS.instagram, SOCIAL_LINKS.instagram),
    youtube: safeUrl(DEFAULT_SOCIAL_LINKS.youtube, SOCIAL_LINKS.youtube),
    facebookRadio: safeUrl(DEFAULT_SOCIAL_LINKS.facebookRadio, SOCIAL_LINKS.facebook),
    facebookProd: safeUrl(DEFAULT_SOCIAL_LINKS.facebookProd, SOCIAL_LINKS.facebookProducciones),
    zenoPlayer: safeUrl(branding?.radio_player_url, DEFAULT_SOCIAL_LINKS.zenoPlayer)
  };

  const resolveSocialUrl = (linkKey: SocialLinkGroupItem["linkKey"]): string => {
    switch (linkKey) {
      case "facebookProducciones":
        return socialLinks.facebookProd;
      case "facebook":
        return socialLinks.facebookRadio;
      case "instagram":
        return socialLinks.instagram;
      case "youtube":
        return socialLinks.youtube;
      case "mixcloud":
        return SOCIAL_LINKS.mixcloud;
      case "branding.zenoPlayer":
        return socialLinks.zenoPlayer;
      default:
        return safeUrl(linkKey, SOCIAL_LINKS[linkKey as keyof typeof SOCIAL_LINKS]);
    }
  };

  return (
    <footer ref={ref} className="py-12 sm:py-16 px-4 sm:px-6 pb-32 sm:pb-36 relative border-t border-neon-purple/20">
      <div className="max-w-7xl mx-auto">
        {/* Grid: About + Contact + Social */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:[grid-template-columns:1.5fr_1fr_1fr_1fr] gap-10 md:gap-8 mb-10">
          {/* Wordmark */}
          <div className="flex flex-col justify-start">
            <NeonWordmark size="footer" className="animate-fade-in" />
          </div>

          {/* Contact */}
          <div className="flex flex-col">
            <h3 className="font-display text-lg font-bold text-neon-gradient mb-4">{t.contact}</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-neon-cyan flex-shrink-0 mt-0.5" aria-hidden="true" />
                <a href="mailto:info@djloboproducciones.com" className="hover:text-neon-cyan transition-colors break-all" aria-label="Skicka e-post till info@djloboproducciones.com">info@djloboproducciones.com</a>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 text-neon-pink flex-shrink-0" aria-hidden="true" />
                <a href="tel:+46769125260" className="hover:text-neon-pink transition-colors" aria-label="Ring +46 76 912 52 60">+46 76 912 52 60</a>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-neon-purple flex-shrink-0" aria-hidden="true" />
                <span>{t.location}</span>
              </li>
            </ul>
          </div>

          {/* Social link groups rendered from config */}
          {SOCIAL_LINK_GROUPS.map((group) => {
            const colors = COLOR_STYLES[group.color];
            return (
              <div key={group.key} className="flex flex-col">
                <h3 className={`font-display text-lg font-bold ${colors.heading} mb-4`}>{group.title[language]}</h3>
                <nav aria-label={group.title[language]}>
                  <ul className="space-y-3">
                    {group.links.map((item) => {
                      const Icon = ICONS[item.icon];
                      return (
                        <li key={item.linkKey}>
                          <a
                            href={resolveSocialUrl(item.linkKey)}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={item.ariaLabel[language]}
                            className={`flex items-center gap-3 text-sm text-muted-foreground ${colors.hover} transition-colors group`}
                          >
                            <span className="w-9 h-9 glass-card rounded-full flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                              <Icon className={`w-4 h-4 text-muted-foreground ${colors.iconHover} transition-colors`} aria-hidden="true" />
                            </span>
                            <span>{item.label[language]}</span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>
            );
          })}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-neon-purple/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-xs">{t.copyright}</p>
          <nav aria-label="Juridiska länkar">
            <ul className="flex gap-4 text-xs items-center">
              <li><Link to={lto("/privacy")} className="text-neon-cyan hover:underline">{t.privacyPolicy}</Link></li>
              <li><Link to={lto("/terms")} className="text-neon-cyan hover:underline">{t.terms}</Link></li>
              <li>
                <button
                  onClick={resetConsent}
                  className="text-muted-foreground hover:text-neon-cyan transition-colors flex items-center gap-1"
                >
                  <Cookie className="w-3 h-3" aria-hidden="true" />
                  {t.cookieSettings}
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Coffee Code Studio Credit — improved contrast */}
        <div className="mt-8 pt-4 border-t border-muted/10 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Design & Development by{" "}
            <a
              href="https://coffeecodestudio.se"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Besök Coffee Code Studio"
              className="hover:text-foreground transition-colors underline decoration-dotted underline-offset-2">
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
