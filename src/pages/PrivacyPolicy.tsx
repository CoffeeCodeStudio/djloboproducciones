import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const translations = {
  sv: {
    title: "Sekretesspolicy",
    lastUpdated: "Senast uppdaterad: Mars 2026",
    backToHome: "Tillbaka till startsidan",
    content: `Vi värnar om din integritet. Denna policy förklarar hur DJ Lobo Producciones hanterar data.

Vi samlar INTE in IP-adresser. För att förhindra missbruk i chatten använder vi anonyma sessions-ID som lagras lokalt i din webbläsare. Dessa kan inte kopplas till din identitet.

Vid bokning av DJ-tjänster sparar vi namn, e-post, telefonnummer och evenemangsdetaljer som du själv anger i vår databas. Denna data används enbart för att hantera din bokning och lagras i högst 24 månader, varefter den raderas automatiskt. Du kan begära radering av dina bokningsuppgifter när som helst.

När du skickar ett meddelande via kontaktformuläret vidarebefordras det till oss via e-post genom Resend, en USA-baserad e-postleverantör. Kontaktformulärdata lagras inte i någon databas utan existerar enbart i vårt e-postflöde. Din e-postadress lagras tillfälligt i upp till 1 timme för att förhindra spam, och raderas sedan automatiskt. Resend behandlar data i enlighet med sina integritetsvillkor.

Inbäddat innehåll från YouTube, Mixcloud och SoundCloud laddas först efter att du aktivt har accepterat cookies via vår samtyckesbanner. Dessa tredjepartstjänster kan sätta egna cookies när innehållet visas.

Vi använder automatiskt spamskydd för att skydda chatten.

Du har rätt att begära utdrag eller radering av data genom att kontakta oss på info@djloboproducciones.com.`,
  },
  en: {
    title: "Privacy Policy",
    lastUpdated: "Last updated: March 2026",
    backToHome: "Back to homepage",
    content: `We value your privacy. This policy explains how DJ Lobo Producciones handles data.

We do NOT collect IP addresses. To prevent abuse in the chat, we use anonymous session IDs stored locally in your browser. These cannot be linked to your identity.

When booking DJ services, we store the name, email, phone number, and event details that you provide in our database. This data is used solely to manage your booking and is retained for as long as necessary to fulfill the booking and any follow-ups. You may request deletion of your booking data at any time.

When you send a message through the contact form, it is forwarded to us via email through Resend, a US-based email delivery service. Contact form data is not stored in any database and only exists in our email flow. Resend processes data in accordance with their privacy terms.

Embedded content from YouTube, Mixcloud, and SoundCloud is only loaded after you actively accept cookies via our consent banner. These third-party services may set their own cookies when the content is displayed.

We use automatic spam protection to protect the chat.

You have the right to request access to or deletion of your data by contacting us at info@djloboproducciones.com.`,
  },
  es: {
    title: "Política de Privacidad",
    lastUpdated: "Última actualización: Marzo 2026",
    backToHome: "Volver a la página principal",
    content: `Valoramos su privacidad. Esta política explica cómo DJ Lobo Producciones maneja los datos.

NO recopilamos direcciones IP. Para prevenir abusos en el chat, utilizamos identificadores de sesión anónimos almacenados localmente en su navegador. Estos no pueden vincularse a su identidad.

Al reservar servicios de DJ, almacenamos el nombre, correo electrónico, número de teléfono y detalles del evento que usted proporciona en nuestra base de datos. Estos datos se utilizan únicamente para gestionar su reserva y se conservan el tiempo necesario para cumplir con la reserva y cualquier seguimiento. Puede solicitar la eliminación de sus datos de reserva en cualquier momento.

Cuando envía un mensaje a través del formulario de contacto, se reenvía a nosotros por correo electrónico mediante Resend, un servicio de entrega de correo electrónico con sede en EE.UU. Los datos del formulario de contacto no se almacenan en ninguna base de datos y solo existen en nuestro flujo de correo electrónico. Resend procesa los datos de acuerdo con sus términos de privacidad.

El contenido incrustado de YouTube, Mixcloud y SoundCloud solo se carga después de que usted acepte activamente las cookies a través de nuestro banner de consentimiento. Estos servicios de terceros pueden establecer sus propias cookies cuando se muestra el contenido.

Utilizamos protección automática contra spam para proteger el chat.

Usted tiene derecho a solicitar el acceso o la eliminación de sus datos contactándonos en info@djloboproducciones.com.`,
  },
};

const PrivacyPolicy = () => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <div className="light-leak-purple" aria-hidden="true"></div>
      <div className="light-leak-blue" aria-hidden="true"></div>

      <div className="relative z-10 px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-neon-cyan hover:underline mb-8 focus-neon rounded px-2 py-1"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.backToHome}
          </Link>

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
