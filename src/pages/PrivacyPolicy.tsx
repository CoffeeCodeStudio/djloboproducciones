import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const translations = {
  sv: {
    title: "Sekretesspolicy",
    lastUpdated: "Senast uppdaterad: Mars 2026",
    backToHome: "Tillbaka till startsidan",
    content: `DJ Lobo Producciones ("vi", "oss") värnar om din integritet. Denna policy förklarar vilka personuppgifter vi samlar in, varför, och hur de hanteras — i enlighet med EU:s dataskyddsförordning (GDPR).

1. PERSONUPPGIFTSANSVARIG
Ansvarig för behandlingen av personuppgifter är DJ Lobo Producciones. Kontakt: info@djloboproducciones.com.

2. VILKA UPPGIFTER SAMLAR VI IN OCH VARFÖR?

a) Bokning av DJ-tjänster
Uppgifter: Namn, e-post, telefonnummer, evenemangsdetaljer (datum, plats, typ).
Laglig grund: Fullgörande av avtal (GDPR art. 6.1 b).
Lagringstid: Bokningsdata lagras i högst 24 månader efter bokningstillfället och raderas sedan automatiskt. Denna tid motiveras av möjligheten till återkommande bokningar och eventuell reklamationshantering.

b) Kontaktformulär
Uppgifter: Namn, e-post, meddelande.
Laglig grund: Berättigat intresse (GDPR art. 6.1 f) — att kunna besvara förfrågningar.
Lagringstid: Meddelanden vidarebefordras via e-post och lagras INTE i någon databas. Din e-postadress sparas tillfälligt i upp till 1 timme i en separat tabell för att förhindra spam, och raderas sedan automatiskt.

c) Cookies och inbäddat innehåll
Laglig grund: Samtycke (GDPR art. 6.1 a).
Inbäddat innehåll från YouTube, Mixcloud och SoundCloud laddas först efter att du aktivt har accepterat cookies via vår samtyckesbanner. Dessa tredjepartstjänster kan sätta egna cookies. YouTube-embeds använder den integritetsförbättrade domänen youtube-nocookie.com.

d) Livechatt
Vi samlar INTE in IP-adresser. För att förhindra missbruk i chatten använder vi anonyma sessions-ID som lagras lokalt i din webbläsare. Dessa kan inte kopplas till din identitet. Vi använder automatiskt spamskydd.

3. TREDJEPARTSLEVERANTÖRER

Vi använder följande tjänsteleverantörer som kan behandla personuppgifter:

• Supabase Inc. (USA, med EU-region Irland) — Databas och autentisering. Överföring till USA skyddas av EU:s standardavtalsklausuler (SCC).
• Resend Inc. (USA) — E-postleverans för kontaktformulär och bokningsbekräftelser. Överföring till USA skyddas av SCC.
• Google LLC (USA) — Mottagande av e-post via Gmail. Vi är medvetna om att detta är en svaghet och planerar att migrera till en kontrollerad inbox med personuppgiftsbiträdesavtal (DPA).
• Lovable Technologies (EU/Sverige) — Webbhosting och AI-assisterad utveckling.

4. ÖVERFÖRING TILL TREDJELAND

Viss databehandling sker i USA (Supabase, Resend, Google). Dessa överföringar sker med stöd av EU:s standardavtalsklausuler (SCC) i enlighet med GDPR kapitel V.

5. DINA RÄTTIGHETER

Enligt GDPR har du rätt att:
• Begära tillgång till dina personuppgifter (art. 15)
• Begära rättelse av felaktiga uppgifter (art. 16)
• Begära radering av dina uppgifter (art. 17)
• Begära begränsning av behandling (art. 18)
• Invända mot behandling baserad på berättigat intresse (art. 21)
• Begära dataportabilitet (art. 20)
• Återkalla samtycke för cookies när som helst

Kontakta oss på info@djloboproducciones.com för att utöva dina rättigheter. Du har även rätt att lämna klagomål till Integritetsskyddsmyndigheten (IMY).`,
  },
  en: {
    title: "Privacy Policy",
    lastUpdated: "Last updated: March 2026",
    backToHome: "Back to homepage",
    content: `DJ Lobo Producciones ("we", "us") values your privacy. This policy explains what personal data we collect, why, and how it is handled — in accordance with the EU General Data Protection Regulation (GDPR).

1. DATA CONTROLLER
The controller responsible for data processing is DJ Lobo Producciones. Contact: info@djloboproducciones.com.

2. WHAT DATA DO WE COLLECT AND WHY?

a) Booking DJ services
Data: Name, email, phone number, event details (date, location, type).
Legal basis: Performance of a contract (GDPR Art. 6.1 b).
Retention: Booking data is stored for a maximum of 24 months after the booking date and then automatically deleted. This period is justified by the possibility of recurring bookings and potential claims handling.

b) Contact form
Data: Name, email, message.
Legal basis: Legitimate interest (GDPR Art. 6.1 f) — to respond to inquiries.
Retention: Messages are forwarded via email and are NOT stored in any database. Your email address is temporarily stored for up to 1 hour in a separate table to prevent spam, and is then automatically deleted.

c) Cookies and embedded content
Legal basis: Consent (GDPR Art. 6.1 a).
Embedded content from YouTube, Mixcloud, and SoundCloud is only loaded after you actively accept cookies via our consent banner. These third-party services may set their own cookies. YouTube embeds use the privacy-enhanced domain youtube-nocookie.com.

d) Live chat
We do NOT collect IP addresses. To prevent abuse in the chat, we use anonymous session IDs stored locally in your browser. These cannot be linked to your identity. We use automatic spam protection.

3. THIRD-PARTY PROVIDERS

We use the following service providers that may process personal data:

• Supabase Inc. (USA, with EU region Ireland) — Database and authentication. Transfers to the USA are protected by EU Standard Contractual Clauses (SCC).
• Resend Inc. (USA) — Email delivery for contact forms and booking confirmations. Transfers to the USA are protected by SCC.
• Google LLC (USA) — Receiving email via Gmail. We are aware this is a weakness and plan to migrate to a controlled inbox with a Data Processing Agreement (DPA).
• Lovable Technologies (EU/Sweden) — Web hosting and AI-assisted development.

4. TRANSFERS TO THIRD COUNTRIES

Some data processing takes place in the USA (Supabase, Resend, Google). These transfers are conducted under EU Standard Contractual Clauses (SCC) in accordance with GDPR Chapter V.

5. YOUR RIGHTS

Under the GDPR, you have the right to:
• Request access to your personal data (Art. 15)
• Request correction of inaccurate data (Art. 16)
• Request deletion of your data (Art. 17)
• Request restriction of processing (Art. 18)
• Object to processing based on legitimate interest (Art. 21)
• Request data portability (Art. 20)
• Withdraw consent for cookies at any time

Contact us at info@djloboproducciones.com to exercise your rights. You also have the right to file a complaint with the Swedish Authority for Privacy Protection (IMY).`,
  },
  es: {
    title: "Política de Privacidad",
    lastUpdated: "Última actualización: Marzo 2026",
    backToHome: "Volver a la página principal",
    content: `DJ Lobo Producciones ("nosotros") valora su privacidad. Esta política explica qué datos personales recopilamos, por qué y cómo se gestionan, de conformidad con el Reglamento General de Protección de Datos de la UE (RGPD).

1. RESPONSABLE DEL TRATAMIENTO
El responsable del tratamiento de datos personales es DJ Lobo Producciones. Contacto: info@djloboproducciones.com.

2. ¿QUÉ DATOS RECOPILAMOS Y POR QUÉ?

a) Reserva de servicios de DJ
Datos: Nombre, correo electrónico, número de teléfono, detalles del evento (fecha, ubicación, tipo).
Base legal: Ejecución de un contrato (RGPD art. 6.1 b).
Retención: Los datos de reserva se almacenan durante un máximo de 24 meses después de la fecha de reserva y luego se eliminan automáticamente. Este período se justifica por la posibilidad de reservas recurrentes y gestión de reclamaciones.

b) Formulario de contacto
Datos: Nombre, correo electrónico, mensaje.
Base legal: Interés legítimo (RGPD art. 6.1 f) — para responder a consultas.
Retención: Los mensajes se reenvían por correo electrónico y NO se almacenan en ninguna base de datos. Su dirección de correo electrónico se almacena temporalmente durante un máximo de 1 hora en una tabla separada para prevenir spam, y luego se elimina automáticamente.

c) Cookies y contenido incrustado
Base legal: Consentimiento (RGPD art. 6.1 a).
El contenido incrustado de YouTube, Mixcloud y SoundCloud solo se carga después de que usted acepte activamente las cookies a través de nuestro banner de consentimiento. Estos servicios de terceros pueden establecer sus propias cookies. Los embeds de YouTube utilizan el dominio mejorado de privacidad youtube-nocookie.com.

d) Chat en vivo
NO recopilamos direcciones IP. Para prevenir abusos en el chat, utilizamos identificadores de sesión anónimos almacenados localmente en su navegador. Estos no pueden vincularse a su identidad. Utilizamos protección automática contra spam.

3. PROVEEDORES DE TERCEROS

Utilizamos los siguientes proveedores de servicios que pueden tratar datos personales:

• Supabase Inc. (EE.UU., con región UE Irlanda) — Base de datos y autenticación. Las transferencias a EE.UU. están protegidas por las Cláusulas Contractuales Tipo (CCT) de la UE.
• Resend Inc. (EE.UU.) — Entrega de correo electrónico para formularios de contacto y confirmaciones de reserva. Las transferencias a EE.UU. están protegidas por CCT.
• Google LLC (EE.UU.) — Recepción de correo electrónico a través de Gmail. Somos conscientes de que esto es una debilidad y planeamos migrar a una bandeja de entrada controlada con un Acuerdo de Procesamiento de Datos (DPA).
• Lovable Technologies (UE/Suecia) — Alojamiento web y desarrollo asistido por IA.

4. TRANSFERENCIAS A TERCEROS PAÍSES

Parte del tratamiento de datos tiene lugar en EE.UU. (Supabase, Resend, Google). Estas transferencias se realizan bajo las Cláusulas Contractuales Tipo (CCT) de la UE de conformidad con el capítulo V del RGPD.

5. SUS DERECHOS

Según el RGPD, usted tiene derecho a:
• Solicitar acceso a sus datos personales (art. 15)
• Solicitar la corrección de datos inexactos (art. 16)
• Solicitar la eliminación de sus datos (art. 17)
• Solicitar la limitación del tratamiento (art. 18)
• Oponerse al tratamiento basado en interés legítimo (art. 21)
• Solicitar la portabilidad de datos (art. 20)
• Retirar el consentimiento para cookies en cualquier momento

Contáctenos en info@djloboproducciones.com para ejercer sus derechos. También tiene derecho a presentar una reclamación ante la Autoridad Sueca de Protección de la Privacidad (IMY).`,
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
