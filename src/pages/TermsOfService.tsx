import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const translations = {
  sv: {
    title: "Användarvillkor",
    lastUpdated: "Senast uppdaterad: Mars 2026",
    backToHome: "Tillbaka till startsidan",
    content: "Genom att använda DJ Lobo Radio godkänner du dessa villkor.\n\nVår chatt är till för att sprida glädje — hotfullt, kränkande eller olagligt innehåll tolereras inte. Vi förbehåller oss rätten att stänga av sessioner som bryter mot reglerna. Automatisk hastighetsbegränsning (max 5 meddelanden per 30 sekunder) gäller för alla användare.\n\nBokningsformuläret ska användas i god tro. Falska bokningar är inte tillåtna.\n\nVi ansvarar inte för tekniska avbrott eller innehåll från tredjepartstjänster (YouTube, Mixcloud, ZenoFM).\n\nFrågor? Kontakta info@djloboproducciones.com.",
  },
  en: {
    title: "Terms of Service",
    lastUpdated: "Last updated: March 2026",
    backToHome: "Back to homepage",
    content: "By using DJ Lobo Radio, you agree to these terms.\n\nOur chat is for spreading joy — abusive, offensive, or illegal content is not tolerated. We reserve the right to suspend sessions that violate these rules. Automatic rate limiting (max 5 messages per 30 seconds) applies to all users.\n\nThe booking form must be used in good faith. Fake bookings are not permitted.\n\nWe are not responsible for technical interruptions or content from third-party services (YouTube, Mixcloud, ZenoFM).\n\nQuestions? Contact info@djloboproducciones.com.",
  },
  es: {
    title: "Términos de Servicio",
    lastUpdated: "Última actualización: Marzo 2026",
    backToHome: "Volver a la página principal",
    content: "Al usar DJ Lobo Radio, usted acepta estos términos.\n\nNuestro chat es para compartir alegría — no se tolera contenido abusivo, ofensivo o ilegal. Nos reservamos el derecho de suspender sesiones que violen estas reglas. La limitación automática de frecuencia (máx. 5 mensajes por 30 segundos) se aplica a todos los usuarios.\n\nEl formulario de reserva debe usarse de buena fe. Las reservas falsas no están permitidas.\n\nNo nos hacemos responsables por interrupciones técnicas o contenido de servicios de terceros (YouTube, Mixcloud, ZenoFM).\n\n¿Preguntas? Contacte a info@djloboproducciones.com.",
  },
};

const TermsOfService = () => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Light leak backgrounds */}
      <div className="light-leak-purple" aria-hidden="true"></div>
      <div className="light-leak-blue" aria-hidden="true"></div>

      <div className="relative z-10 px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Back link */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-neon-cyan hover:underline mb-8 focus-neon rounded px-2 py-1"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.backToHome}
          </Link>

          {/* Header */}
          <div className="glass-card p-6 sm:p-8 rounded-2xl mb-8">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-8 h-8 text-neon-cyan" />
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{t.title}</h1>
            </div>
            <p className="text-foreground/70 text-sm mb-6">{t.lastUpdated}</p>
            <p className="text-foreground text-base leading-relaxed">{t.content}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
