import CalendarSection from "@/components/CalendarSection";
import EquipmentSection from "@/components/EquipmentSection";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useLanguage } from "@/contexts/LanguageContext";

const translations = {
  sv: {
    pageTitle: "SPELNINGAR",
    pageSubtitle: "Kommande event och vår utrustning",
  },
  en: {
    pageTitle: "SHOWS",
    pageSubtitle: "Upcoming events and our equipment",
  },
  es: {
    pageTitle: "SHOWS",
    pageSubtitle: "Próximos eventos y nuestro equipo",
  },
};

const SpelningarPage = () => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="max-w-7xl mx-auto">

      {/* Calendar / Schedule */}
      <ErrorBoundary>
        <CalendarSection />
      </ErrorBoundary>

      {/* Equipment — bottom section */}
      <ErrorBoundary>
        <EquipmentSection />
      </ErrorBoundary>

      <Footer />
    </div>
  );
};

export default SpelningarPage;
