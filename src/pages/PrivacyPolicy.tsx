import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const translations = {
  sv: {
    title: "Sekretesspolicy",
    lastUpdated: "Senast uppdaterad: Januari 2026",
    backToHome: "Tillbaka till startsidan",
    content: "Vi värnar om din integritet. Denna policy förklarar hur vi hanterar data på DJ Lobo Radio. Vi samlar endast in IP-adresser för säkerhetsändamål, såsom att förhindra missbruk i chatten. Vi sparar ingen annan personlig information. Du har rätt att begära utdrag eller radering av data genom att kontakta oss på info@djloboproducciones.com.",
  },
  en: {
    title: "Privacy Policy",
    lastUpdated: "Last updated: January 2026",
    backToHome: "Back to homepage",
    content: "We value your privacy. This policy explains how we handle data at DJ Lobo Radio. We only collect IP addresses for security purposes, such as preventing abuse in the chat. We do not store any other personal information. You have the right to request access to or deletion of your data by contacting us at info@djloboproducciones.com.",
  },
  es: {
    title: "Política de Privacidad",
    lastUpdated: "Última actualización: Enero 2026",
    backToHome: "Volver a la página principal",
    content: "Valoramos su privacidad. Esta política explica cómo manejamos los datos en DJ Lobo Radio. Solo recopilamos direcciones IP por motivos de seguridad, como evitar abusos en el chat. No almacenamos ninguna otra información personal. Usted tiene derecho a solicitar el acceso o la eliminación de sus datos contactándonos en info@djloboproducciones.com.",
  },
};

const PrivacyPolicy = () => {
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
              <Shield className="w-8 h-8 text-neon-cyan" />
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

export default PrivacyPolicy;
