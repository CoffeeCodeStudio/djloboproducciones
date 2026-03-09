import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const translations = {
  sv: {
    title: "Användarvillkor",
    lastUpdated: "Senast uppdaterad: Januari 2026",
    backToHome: "Tillbaka till startsidan",
    content: "Genom att använda DJ Lobo Radio godkänner du dessa villkor. Vår chatt är till för att sprida glädje; hotfullt eller olagligt innehåll tolereras inte. Vi förbehåller oss rätten att blockera IP-adresser som bryter mot reglerna. Vi ansvarar inte för tekniska avbrott. Frågor? Kontakta info@djloboproducciones.com.",
  },
  en: {
    title: "Terms of Service",
    lastUpdated: "Last updated: January 2026",
    backToHome: "Back to homepage",
    content: "By using DJ Lobo Radio, you agree to these terms. Our chat is for spreading joy; abusive or illegal content is not tolerated. We reserve the right to block IP addresses that violate these rules. We are not responsible for technical interruptions. Questions? Contact info@djloboproducciones.com.",
  },
  es: {
    title: "Términos de Servicio",
    lastUpdated: "Última actualización: Enero 2026",
    backToHome: "Volver a la página principal",
    content: "Al usar DJ Lobo Radio, usted acepta estos términos. Nuestro chat es para compartir alegría; no se tolera contenido abusivo o ilegal. Nos reservamos el derecho de bloquear direcciones IP que violen estas reglas. No nos hacemos responsables por interrupciones técnicas. ¿Preguntas? Contacte a info@djloboproducciones.com.",
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
