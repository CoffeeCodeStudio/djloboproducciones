import { useState, useEffect } from "react";
import { Menu, Radio, Globe, ChevronDown, Home, Star, Film, Disc3, BadgeDollarSign, Megaphone } from "lucide-react";
import { useActivePromo } from "@/hooks/useActivePromo";
import { trackPromoEvent } from "@/lib/promoAnalytics";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { Link, useLocation } from "react-router-dom";
import { useLocalizedTo } from "@/hooks/useLocalizedTo";
import { stripLang } from "@/lib/i18nRoutes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NeonWordmark from "@/components/NeonWordmark";

interface NavItem {
  id: string;
  href: string;
  label: { sv: string; en: string; es: string };
  icon: React.ElementType;
  highlight?: boolean;
}

const navItems: NavItem[] = [
  { id: "hem", href: "/", label: { sv: "Hem", en: "Home", es: "Inicio" }, icon: Home },
  { id: "mixar", href: "/mixar", label: { sv: "Mixar & Sets", en: "Mixes & Sets", es: "Mezclas & Sets" }, icon: Disc3 },
  { id: "media", href: "/media", label: { sv: "Media", en: "Media", es: "Media" }, icon: Film },
  { id: "radio", href: "/lyssna", label: { sv: "Radio", en: "Radio", es: "Radio" }, icon: Radio, highlight: true },
  { id: "referenser", href: "/referenser", label: { sv: "Omdömen", en: "Reviews", es: "Reseñas" }, icon: Star },

  {
    id: "prislista",
    href: "/prislista",
    label: { sv: "Prislista", en: "Pricing", es: "Precios" },
    icon: BadgeDollarSign,
  },
];

interface LanguageOption {
  code: Language;
  flag: string;
  label: string;
}
const languages: LanguageOption[] = [
  { code: "sv", flag: "🇸🇪", label: "Svenska" },
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "es", flag: "🇪🇸", label: "Español" },
];

const Navbar = () => {
  const { language, setLanguage } = useLanguage();
  const lto = useLocalizedTo();
  const { promo } = useActivePromo();
  
  const location = useLocation();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const currentLang = languages.find((l) => l.code === language)!;

  const handlePromoReopen = () => {
    if (promo) {
      trackPromoEvent(promo.id, "reopen_click");
      // Persist intent so the popup re-opens automatically after a page refresh
      // while this promo is still active. PromoManager consumes & clears the key.
      try {
        localStorage.setItem(`promo_force_reopen_${promo.id}`, "1");
      } catch {
        /* ignore */
      }
    }
    window.dispatchEvent(new CustomEvent("promo:reopen"));
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest(".lang-dropdown")) setIsLangOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (item: NavItem) => {
    const here = stripLang(location.pathname);
    if (item.href === "/") return here === "/";
    return here === item.href || here.startsWith(`${item.href}/`);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "py-1 bg-background/80 backdrop-blur-xl border-b border-neon-purple/30 shadow-lg shadow-neon-purple/10"
            : "py-2 bg-transparent"
        }`}
        role="navigation"
        aria-label="Huvudnavigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              to={lto("/")}
              className="focus-neon rounded-lg hover:scale-105 transition-transform flex-shrink-0"
              aria-label="DJ Lobo Producciones - Hem"
            >
              <NeonWordmark size="nav" className="animate-[fade-in_0.8s_ease-out]" />
            </Link>

            {/* Desktop Navigation — 5 items, RADIO centered */}
            <div className="hidden md:flex items-center gap-0.5 lg:gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={lto(item.href)}
                  className={`px-2.5 lg:px-4 py-2 text-xs lg:text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 lg:gap-2 ${
                    isActive(item)
                      ? "text-neon-cyan bg-neon-cyan/10 shadow-[0_0_10px_rgba(0,255,255,0.3)]"
                      : item.highlight
                        ? "text-neon-pink hover:bg-neon-pink/10 font-bold"
                        : "text-foreground/80 hover:text-neon-cyan hover:bg-neon-cyan/5"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label[language]}
                </Link>
              ))}
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Promo reopen button — only when an active promo exists */}
              {promo && (
                <button
                  onClick={handlePromoReopen}
                  aria-label={language === "sv" ? "Visa aktuellt erbjudande" : language === "es" ? "Mostrar promoción actual" : "Show current promo"}
                  title={language === "sv" ? "Visa aktuellt erbjudande" : language === "es" ? "Mostrar promoción actual" : "Show current promo"}
                  className="tap-target glass-card p-2 rounded-lg focus-neon hover:border-neon-pink/50 transition-colors group relative"
                >
                  <Megaphone className="w-4 h-4 text-neon-pink group-hover:scale-110 transition-transform" />
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-neon-pink animate-pulse" aria-hidden="true" />
                </button>
              )}

              {/* Language Selector */}
              <div className="relative lang-dropdown">
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  aria-label={`Välj språk. Nuvarande: ${currentLang.label}`}
                  aria-expanded={isLangOpen}
                  className="tap-target glass-card px-2 sm:px-3 py-2 flex items-center gap-1.5 hover:border-neon-cyan/50 transition-colors focus-neon rounded-lg"
                >
                  <Globe className="w-4 h-4 text-foreground" aria-hidden="true" />
                  <span className="text-sm font-medium" aria-hidden="true">
                    {currentLang.flag}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 text-muted-foreground transition-transform ${isLangOpen ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>
                {isLangOpen && (
                  <ul
                    role="listbox"
                    aria-label="Välj språk"
                    className="absolute right-0 mt-2 w-40 rounded-lg overflow-hidden py-1 shadow-lg border border-neon-cyan/20 z-[60] bg-background/95 backdrop-blur-xl"
                  >
                    {languages.map((lang) => (
                      <li
                        key={lang.code}
                        role="option"
                        aria-selected={language === lang.code}
                        tabIndex={0}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLangOpen(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setLanguage(lang.code);
                            setIsLangOpen(false);
                          }
                        }}
                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors focus-neon ${language === lang.code ? "bg-neon-cyan/10 text-neon-cyan" : "hover:bg-muted/50 text-foreground"}`}
                      >
                        <span aria-hidden="true">{lang.flag}</span>
                        <span className="text-sm font-medium">{lang.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Mobile Menu Dropdown */}
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button
                    className="md:hidden tap-target glass-card p-2 rounded-lg focus-neon hover:border-neon-purple/50 transition-colors"
                    aria-label="Öppna meny"
                  >
                    <Menu className="w-6 h-6 text-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 glass-card border-neon-purple/30 bg-background/95 backdrop-blur-xl"
                >
                  {navItems.map((item) => (
                    <DropdownMenuItem key={item.id} asChild>
                      <Link
                        to={lto(item.href)}
                        className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium cursor-pointer ${
                          item.highlight
                            ? "text-neon-pink font-bold"
                            : isActive(item)
                              ? "text-neon-cyan"
                              : "text-foreground/90"
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label[language]}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      <div className="h-14 sm:h-16" />
    </>
  );
};

export default Navbar;
