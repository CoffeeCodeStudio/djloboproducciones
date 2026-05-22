import type { Language } from "@/contexts/LanguageContext";

export interface LocalizedMeta {
  title: string;
  description: string;
}

type MetaKey =
  | "/"
  | "/lyssna"
  | "/mixar"
  | "/media"
  | "/referenser"
  | "/prislista"
  | "/privacy"
  | "/terms"
  | "notfound";

/**
 * Per-route, per-language SEO copy.
 * Titles kept under 60 chars; descriptions 50–160 chars.
 */
export const SEO_META: Record<MetaKey, Record<Language, LocalizedMeta>> = {
  "/": {
    sv: {
      title: "DJ Lobo – Boka DJ i Göteborg | Latin, 80- & 90-tal",
      description:
        "DJ Lobo Producciones – Boka DJ i Göteborg. 20+ års erfarenhet av Latin beats, salsa, reggaeton, 80-tal och 90-tal. Bröllop, företagsevent och fester.",
    },
    en: {
      title: "DJ Lobo – Book a DJ in Gothenburg | Latin, 80s & 90s",
      description:
        "DJ Lobo Producciones – Book a DJ in Gothenburg. 20+ years of Latin beats, salsa, reggaeton, 80s and 90s for weddings, corporate events and parties.",
    },
    es: {
      title: "DJ Lobo – Reserva un DJ en Gotemburgo | Latin, 80s y 90s",
      description:
        "DJ Lobo Producciones – Reserva un DJ en Gotemburgo. Más de 20 años de Latin beats, salsa, reggaeton, 80s y 90s para bodas, eventos y fiestas.",
    },
  },
  "/lyssna": {
    sv: {
      title: "Lyssna Live – DJ Lobo Radio | Latin, 80- & 90-tal",
      description:
        "Lyssna på DJ Lobo Radio live dygnet runt. Latin beats, salsa, reggaeton, 80-tal och 90-tal — direkt från Göteborg.",
    },
    en: {
      title: "Listen Live – DJ Lobo Radio | Latin, 80s & 90s",
      description:
        "Tune into DJ Lobo Radio live 24/7. Latin beats, salsa, reggaeton, 80s and 90s streaming straight from Gothenburg.",
    },
    es: {
      title: "Escucha en Vivo – DJ Lobo Radio | Latin, 80s y 90s",
      description:
        "Escucha DJ Lobo Radio en vivo las 24 horas. Latin beats, salsa, reggaeton, 80s y 90s en directo desde Gotemburgo.",
    },
  },
  "/mixar": {
    sv: {
      title: "Mixar – DJ Lobo | Latin, 80-tal, 90-tal & House",
      description:
        "Lyssna på inspelade DJ-mixar från DJ Lobo — Latin beats, salsa, reggaeton, 80-tal, 90-tal och house. Uppdateras kontinuerligt via Mixcloud.",
    },
    en: {
      title: "Mixes – DJ Lobo | Latin, 80s, 90s & House",
      description:
        "Stream recorded DJ mixes from DJ Lobo — Latin beats, salsa, reggaeton, 80s, 90s and house. New sets added regularly on Mixcloud.",
    },
    es: {
      title: "Mezclas – DJ Lobo | Latin, 80s, 90s y House",
      description:
        "Escucha las mezclas grabadas de DJ Lobo — Latin beats, salsa, reggaeton, 80s, 90s y house. Nuevos sets publicados regularmente en Mixcloud.",
    },
  },
  "/media": {
    sv: {
      title: "Media – DJ Lobo | Bilder & Videos från spelningar",
      description:
        "Bildgalleri och videoklipp från DJ Lobos spelningar — bröllop, företagsfester och klubbnätter i Göteborg.",
    },
    en: {
      title: "Media – DJ Lobo | Photos & Videos from Live Sets",
      description:
        "Photo gallery and video clips from DJ Lobo's live sets — weddings, corporate parties and club nights in Gothenburg.",
    },
    es: {
      title: "Media – DJ Lobo | Fotos y Vídeos de Eventos",
      description:
        "Galería de fotos y vídeos de los eventos de DJ Lobo — bodas, fiestas de empresa y noches de club en Gotemburgo.",
    },
  },
  "/referenser": {
    sv: {
      title: "Referenser & Omdömen – DJ Lobo Producciones",
      description:
        "Läs vad tidigare kunder säger om DJ Lobo. Bröllop, företagsevent och privatfester i Göteborg och hela Sverige.",
    },
    en: {
      title: "References & Reviews – DJ Lobo Producciones",
      description:
        "Read what past clients say about DJ Lobo. Weddings, corporate events and private parties across Gothenburg and Sweden.",
    },
    es: {
      title: "Referencias y Reseñas – DJ Lobo Producciones",
      description:
        "Lee lo que dicen clientes anteriores sobre DJ Lobo. Bodas, eventos de empresa y fiestas privadas en Gotemburgo y toda Suecia.",
    },
  },
  "/prislista": {
    sv: {
      title: "Prislista & Bokning – DJ Lobo Producciones",
      description:
        "Paket och priser för bröllop, företagsevent och privatfester. Skicka bokningsförfrågan direkt till DJ Lobo i Göteborg.",
    },
    en: {
      title: "Pricing & Booking – DJ Lobo Producciones",
      description:
        "Packages and pricing for weddings, corporate events and private parties. Send your booking request directly to DJ Lobo in Gothenburg.",
    },
    es: {
      title: "Precios y Reservas – DJ Lobo Producciones",
      description:
        "Paquetes y precios para bodas, eventos de empresa y fiestas privadas. Envía tu solicitud de reserva directamente a DJ Lobo en Gotemburgo.",
    },
  },
  "/privacy": {
    sv: {
      title: "Sekretesspolicy – DJ Lobo Producciones",
      description:
        "Information om hur DJ Lobo Producciones hanterar personuppgifter enligt GDPR — bokningar, chatt och cookies.",
    },
    en: {
      title: "Privacy Policy – DJ Lobo Producciones",
      description:
        "How DJ Lobo Producciones handles personal data under GDPR — bookings, chat and cookies.",
    },
    es: {
      title: "Política de Privacidad – DJ Lobo Producciones",
      description:
        "Cómo DJ Lobo Producciones gestiona los datos personales según el RGPD — reservas, chat y cookies.",
    },
  },
  "/terms": {
    sv: {
      title: "Användarvillkor – DJ Lobo Producciones",
      description:
        "Villkor för bokning, chatt och tredjepartstjänster på djloboproducciones.com.",
    },
    en: {
      title: "Terms of Service – DJ Lobo Producciones",
      description:
        "Terms for booking, chat and third-party services on djloboproducciones.com.",
    },
    es: {
      title: "Términos de Servicio – DJ Lobo Producciones",
      description:
        "Términos para reservas, chat y servicios de terceros en djloboproducciones.com.",
    },
  },
  notfound: {
    sv: {
      title: "Sidan hittades inte (404) – DJ Lobo Producciones",
      description:
        "Sidan du letar efter finns inte. Gå tillbaka till startsidan för att hitta spelningar, mixar och bokning.",
    },
    en: {
      title: "Page Not Found (404) – DJ Lobo Producciones",
      description:
        "The page you're looking for doesn't exist. Return to the homepage to find live sets, mixes and bookings.",
    },
    es: {
      title: "Página no encontrada (404) – DJ Lobo Producciones",
      description:
        "La página que buscas no existe. Vuelve al inicio para encontrar sesiones en vivo, mezclas y reservas.",
    },
  },
};

export const getSeoMeta = (key: MetaKey, lang: Language): LocalizedMeta =>
  SEO_META[key][lang];
