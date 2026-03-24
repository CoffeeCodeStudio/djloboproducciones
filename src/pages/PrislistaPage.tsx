import BookingSection from "@/components/BookingSection";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

const translations = {
  sv: {
    pageTitle: "PRISLISTA",
    pageSubtitle: "Priser och bokning för alla typer av event",
  },
  en: {
    pageTitle: "PRICING",
    pageSubtitle: "Pricing and booking for all types of events",
  },
  es: {
    pageTitle: "PRECIOS",
    pageSubtitle: "Precios y reservas para todo tipo de eventos",
  },
};

const PrislistaPage = () => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="text-center pt-8 pb-4">
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-neon-gradient tracking-wider">
          {t.pageTitle}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          {t.pageSubtitle}
        </p>
      </div>

      {/* Booking Form */}
      <div id="boka">
        <BookingSection />
      </div>

      <Footer />
    </div>
  );
};

export default PrislistaPage;
