import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import CalendarSection from "@/components/CalendarSection";
import EquipmentSection from "@/components/EquipmentSection";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useLanguage } from "@/contexts/LanguageContext";

const qualityTranslations = {
  sv: { quality: "Kvalitetsutrustning", qualityDesc: "All utrustning underhålls regelbundet för optimal prestanda" },
  en: { quality: "Quality Equipment", qualityDesc: "All equipment is regularly maintained for optimal performance" },
  es: { quality: "Equipo de Calidad", qualityDesc: "Todo el equipo se mantiene regularmente para un rendimiento óptimo" },
};

const Index = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div id="hem">
        <HeroSection />
      </div>
      <ErrorBoundary>
        <AboutSection />
      </ErrorBoundary>

      {/* Calendar & Equipment side-by-side */}
      <div className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
          <ErrorBoundary>
            <CalendarSection />
          </ErrorBoundary>
          <ErrorBoundary>
            <EquipmentSection />
          </ErrorBoundary>
        </div>

        {/* Quality Badge — centered under both sections */}
        <div className="mt-10 flex justify-center">
          <div className="glass-card-neon px-4 sm:px-6 py-3 sm:py-4 rounded-full flex items-center gap-3 max-w-full">
            <div className="w-3 h-3 rounded-full bg-neon-cyan animate-pulse shrink-0" />
            <div className="min-w-0 text-center">
              <span className="font-semibold text-neon-cyan text-sm sm:text-base">Kvalitetsutrustning</span>
              <span className="text-muted-foreground ml-2 text-xs sm:text-sm">— All utrustning underhålls regelbundet för optimal prestanda</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Index;
