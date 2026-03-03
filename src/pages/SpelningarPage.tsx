import BookingSection from "@/components/BookingSection";
import CalendarSection from "@/components/CalendarSection";
import EquipmentSection from "@/components/EquipmentSection";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useLanguage } from "@/contexts/LanguageContext";

const translations = {
  sv: {
    pageTitle: "SPELNINGAR",
    pageSubtitle: "Kommande event, boka din spelning och se vår utrustning",
  },
  en: {
    pageTitle: "SHOWS",
    pageSubtitle: "Upcoming events, book your show and see our equipment",
  },
  es: {
    pageTitle: "SHOWS",
    pageSubtitle: "Próximos eventos, reserva tu show y conoce nuestro equipo",
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


      {/* Booking Form */}
      <div id="boka">
        <BookingSection />
      </div>

      {/* Equipment — bottom section */}
      <ErrorBoundary>
        <EquipmentSection />
      </ErrorBoundary>

      <Footer />
    </div>
  );
};

export default SpelningarPage;
