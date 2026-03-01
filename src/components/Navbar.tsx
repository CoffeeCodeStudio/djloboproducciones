import { useState, useEffect } from "react";
import { Menu, X, Radio, Globe, ChevronDown } from "lucide-react";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { useBranding } from "@/hooks/useBranding";

interface NavItem {
  id: string;
  label: {
    sv: string;
    en: string;
    es: string;
  };
}

const navItems: NavItem[] = [
  { id: "hem", label: { sv: "Hem", en: "Home", es: "Inicio" } },
  { id: "boka", label: { sv: "Boka spelning", en: "Book Event", es: "Reservar" } },
  { id: "mixar", label: { sv: "Mina Mixar", en: "My Mixes", es: "Mis Mezclas" } },
  { id: "referenser", label: { sv: "Mina Referenser", en: "References", es: "Referencias" } },
  { id: "spelningar", label: { sv: "Mina Spelningar", en: "My Events", es: "Mis Eventos" } },
  { id: "utrustning", label: { sv: "Min utrustning", en: "My Equipment", es: "Mi Equipo" } },
  { id: "kontakt", label: { sv: "Kontakt", en: "Contact", es: "Contacto" } },
  { id: "om-oss", label: { sv: "Om oss", en: "About", es: "Sobre nosotros" } },
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
  const { branding } = useBranding();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hem");

  const currentLang = languages.find((l) => l.code === language)!;

  // Handle scroll for sticky effect and active section tracking
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Track active section
      const sections = navItems.map((item) => item.id);
      for (const sectionId of sections.reverse()) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".lang-dropdown")) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const scrollToSection = (sectionId: string) => {
    setIsMenuOpen(false);
    
    if (sectionId === "hem") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - navHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "py-2 bg-background/80 backdrop-blur-xl border-b border-neon-purple/30 shadow-lg shadow-neon-purple/10"
            : "py-3 bg-transparent"
        }`}
        role="navigation"
        aria-label="Huvudnavigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button
              onClick={() => scrollToSection("hem")}
              className="glass-card p-1.5 sm:p-2 focus-neon rounded-lg hover:scale-105 transition-transform"
              aria-label="DJ Lobo Radio - Hem"
            >
              {branding?.logo_url ? (
                <img
                  alt="DJ Lobo Radio Logo"
                  className="h-10 sm:h-12 w-auto object-contain"
                  src={branding.logo_url}
                  fetchPriority="high"
                  loading="eager"
                />
              ) : (
                <div className="h-10 sm:h-12 w-10 sm:w-12 flex items-center justify-center">
                  <Radio className="h-8 sm:h-10 w-8 sm:w-10 text-neon-cyan" />
                </div>
              )}
            </button>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeSection === item.id
                      ? "text-neon-cyan bg-neon-cyan/10 shadow-[0_0_10px_rgba(0,255,255,0.3)]"
                      : "text-foreground/80 hover:text-neon-cyan hover:bg-neon-cyan/5"
                  }`}
                >
                  {item.label[language]}
                </button>
              ))}
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-2 sm:gap-3">
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
                    className={`w-3 h-3 text-muted-foreground transition-transform ${
                      isLangOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {isLangOpen && (
                  <ul
                    role="listbox"
                    aria-label="Välj språk"
                    className="absolute right-0 mt-2 w-40 glass-card rounded-lg overflow-hidden py-1 shadow-lg border border-neon-cyan/20 z-[60]"
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
                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors focus-neon ${
                          language === lang.code
                            ? "bg-neon-cyan/10 text-neon-cyan"
                            : "hover:bg-muted/50 text-foreground"
                        }`}
                      >
                        <span aria-hidden="true">{lang.flag}</span>
                        <span className="text-sm font-medium">{lang.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden tap-target glass-card p-2 rounded-lg focus-neon hover:border-neon-purple/50 transition-colors"
                aria-label={isMenuOpen ? "Stäng meny" : "Öppna meny"}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-neon-cyan" />
                ) : (
                  <Menu className="w-6 h-6 text-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
          isMenuOpen ? "visible" : "invisible"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-background/90 backdrop-blur-xl transition-opacity duration-300 ${
            isMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Menu Content */}
        <div
          className={`absolute top-0 right-0 h-full w-full max-w-sm bg-background/95 backdrop-blur-2xl border-l border-neon-purple/30 shadow-2xl transition-transform duration-300 ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full pt-20 pb-8 px-6">
            {/* Nav Items */}
            <nav className="flex-1 space-y-2">
              {navItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full text-left px-4 py-4 text-lg font-medium rounded-xl transition-all duration-200 ${
                    activeSection === item.id
                      ? "text-neon-cyan bg-neon-cyan/10 border border-neon-cyan/30 shadow-[0_0_15px_rgba(0,255,255,0.2)]"
                      : "text-foreground/90 hover:text-neon-cyan hover:bg-neon-cyan/5 border border-transparent"
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  {item.label[language]}
                </button>
              ))}
            </nav>

            {/* Bottom decoration */}
            <div className="mt-auto pt-6 border-t border-neon-purple/20">
              <p className="text-sm text-muted-foreground text-center">
                {branding?.site_name || "DJ Lobo Radio"}
              </p>
              <div className="flex justify-center gap-1 mt-2">
                <span className="w-2 h-2 rounded-full bg-neon-pink animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" style={{ animationDelay: "0.2s" }} />
                <span className="w-2 h-2 rounded-full bg-neon-purple animate-pulse" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed navbar */}
      <div className="h-16 sm:h-20" />
    </>
  );
};

export default Navbar;
