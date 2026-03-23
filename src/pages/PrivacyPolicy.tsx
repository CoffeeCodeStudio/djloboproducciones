import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const translations = {
  sv: {
    title: "Sekretesspolicy",
    lastUpdated: "Senast uppdaterad: Mars 2026",
    backToHome: "Tillbaka till startsidan",
    content: "Vi värnar om din integritet. Denna policy förklarar hur vi hanterar data på DJ Lobo Radio.\n\nVi samlar INTE in IP-adresser. För att förhindra missbruk i chatten använder vi anonyma sessions-ID som lagras lokalt i din webbläsare. Dessa kan inte kopplas till din identitet.\n\nVid bokning av DJ-tjänster sparar vi namn, e-post, telefonnummer och evenemangsdetaljer som du själv anger. Denna data används enbart för att hantera din bokning.\n\nNär du skickar ett meddelande via kontaktformuläret vidarebefordras det till oss via e-post genom en tredjepartstjänst (Resend). Datan lagras inte i någon databas utan existerar enbart i vårt e-postflöde.\n\nVi använder automatiskt spamskydd för att skydda chatten.\n\nDu har rätt att begära utdrag eller radering av data genom att kontakta oss på info@djloboproducciones.com.",
  },
  en: {
    title: "Privacy Policy",
    lastUpdated: "Last updated: March 2026",
    backToHome: "Back to homepage",
    content: "We value your privacy. This policy explains how we handle data at DJ Lobo Radio.\n\nWe do NOT collect IP addresses. To prevent abuse in the chat, we use anonymous session IDs stored locally in your browser. These cannot be linked to your identity.\n\nWhen booking DJ services, we store the name, email, phone number, and event details that you provide. This data is used solely to manage your booking.\n\nWe use automatic rate limiting to protect the chat from spam.\n\nYou have the right to request access to or deletion of your data by contacting us at info@djloboproducciones.com.",
  },
  es: {
    title: "Política de Privacidad",
    lastUpdated: "Última actualización: Marzo 2026",
    backToHome: "Volver a la página principal",
    content: "Valoramos su privacidad. Esta política explica cómo manejamos los datos en DJ Lobo Radio.\n\nNO recopilamos direcciones IP. Para prevenir abusos en el chat, utilizamos identificadores de sesión anónimos almacenados localmente en su navegador. Estos no pueden vincularse a su identidad.\n\nAl reservar servicios de DJ, almacenamos el nombre, correo electrónico, número de teléfono y detalles del evento que usted proporciona. Estos datos se utilizan únicamente para gestionar su reserva.\n\nUtilizamos limitación automática de frecuencia (rate limiting) para proteger el chat contra spam.\n\nUsted tiene derecho a solicitar el acceso o la eliminación de sus datos contactándonos en info@djloboproducciones.com.",
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
            {t.content.split('\n').map((paragraph, i) => (
              <p key={i} className="text-foreground text-base leading-relaxed mb-3 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
