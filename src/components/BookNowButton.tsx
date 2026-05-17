import { Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { useLocalizedTo } from "@/hooks/useLocalizedTo";

const translations = {
  sv: {
    bookNow: "BOKA DJ LOBO",
    ariaLabel: "Boka DJ Lobo för ditt event",
  },
  en: {
    bookNow: "BOOK DJ LOBO",
    ariaLabel: "Book DJ Lobo for your event",
  },
  es: {
    bookNow: "RESERVA DJ LOBO",
    ariaLabel: "Reserva DJ Lobo para tu evento",
  },
};

const BookNowButton = () => {
  const { language } = useLanguage();
  const lto = useLocalizedTo();
  const t = translations[language];

  return (
    <Link
      to={lto("/#bokning")}
      aria-label={t.ariaLabel}
      className="book-now-button group relative inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-full font-display font-bold tracking-wider text-xs sm:text-base transition-all duration-300 overflow-hidden whitespace-nowrap"
    >
      {/* Shine effect overlay */}
      <span className="book-now-shine absolute inset-0 pointer-events-none" aria-hidden="true" />
      
      {/* Button content */}
      <Calendar className="w-3.5 h-3.5 sm:w-5 sm:h-5 relative z-10 flex-shrink-0" aria-hidden="true" />
      <span className="relative z-10 hidden xs:inline">{t.bookNow}</span>
      <span className="relative z-10 xs:hidden">{language === "en" ? "BOOK" : language === "es" ? "RESERVA" : "BOKA"}</span>
    </Link>
  );
};

export default BookNowButton;