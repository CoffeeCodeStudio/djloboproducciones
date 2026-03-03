import { useLanguage } from "@/contexts/LanguageContext";
import { Star, Quote, Building2, Music, PartyPopper, GraduationCap, Heart, Users } from "lucide-react";

interface Testimonial {
  quote: {
    sv: string;
    en: string;
    es: string;
  };
  author: string;
  company?: string;
  eventType: {
    sv: string;
    en: string;
    es: string;
  };
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    quote: {
      sv: "DJ Lobo skapade den perfekta stämningen på vårt bröllop. Alla gäster dansade hela natten!",
      en: "DJ Lobo created the perfect atmosphere at our wedding. All guests danced all night!",
      es: "DJ Lobo creó el ambiente perfecto en nuestra boda. ¡Todos los invitados bailaron toda la noche!",
    },
    author: "Maria & Erik",
    eventType: { sv: "Bröllop", en: "Wedding", es: "Boda" },
    rating: 5,
  },
  {
    quote: {
      sv: "Professionell och flexibel. Anpassade musiken perfekt till vår företagsfest.",
      en: "Professional and flexible. Perfectly adapted the music to our corporate event.",
      es: "Profesional y flexible. Adaptó perfectamente la música a nuestro evento corporativo.",
    },
    author: "Anna Lindqvist",
    company: "Volvo Cars",
    eventType: { sv: "Företagsevent", en: "Corporate Event", es: "Evento Corporativo" },
    rating: 5,
  },
  {
    quote: {
      sv: "Bästa DJ:n vi haft på någon av våra fester! Energin var fantastisk.",
      en: "Best DJ we've had at any of our parties! The energy was amazing.",
      es: "¡El mejor DJ que hemos tenido en cualquiera de nuestras fiestas! La energía fue increíble.",
    },
    author: "Johan Andersson",
    eventType: { sv: "Privatfest", en: "Private Party", es: "Fiesta Privada" },
    rating: 5,
  },
  {
    quote: {
      sv: "DJ Lobo fick hela studentfesten att lyfta. Kommer definitivt boka igen!",
      en: "DJ Lobo made the entire graduation party take off. Will definitely book again!",
      es: "DJ Lobo hizo que toda la fiesta de graduación despegara. ¡Definitivamente reservaré de nuevo!",
    },
    author: "Studentkommittén 2024",
    eventType: { sv: "Studentfest", en: "Graduation", es: "Graduación" },
    rating: 5,
  },
];

interface ClientLogo {
  name: string;
  icon: React.ElementType;
}

const clientLogos: ClientLogo[] = [
  { name: "Företagsevent", icon: Building2 },
  { name: "Bröllop", icon: Heart },
  { name: "Nattklubbar", icon: Music },
  { name: "Festivaler", icon: PartyPopper },
  { name: "Studentevent", icon: GraduationCap },
  { name: "Privatfester", icon: Users },
];

const translations = {
  sv: {
    title: "Omdömen",
    subtitle: "Vad våra kunder säger om oss",
    trustedBy: "Erfarenhet från många olika eventtyper",
    bookNow: "Boka nu",
  },
  en: {
    title: "My References",
    subtitle: "What our clients say about us",
    trustedBy: "Experience from many different event types",
    bookNow: "Book now",
  },
  es: {
    title: "Mis Referencias",
    subtitle: "Lo que dicen nuestros clientes sobre nosotros",
    trustedBy: "Experiencia en muchos tipos de eventos diferentes",
    bookNow: "Reservar ahora",
  },
};

const TestimonialsSection = () => {
  const { language } = useLanguage();
  const t = translations[language];

  const scrollToBooking = () => {
    document.getElementById("boka")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="referenser"
      className="py-16 sm:py-24"
      aria-labelledby="testimonials-title"
    >
      <div className="text-center mb-12">
        <h2
          id="testimonials-title"
          className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-neon-gradient mb-4"
        >
          {t.title}
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t.subtitle}
        </p>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="glass-card p-6 sm:p-8 rounded-xl hover:border-neon-pink/50 transition-all duration-300 group relative overflow-hidden"
          >
            {/* Quote icon */}
            <Quote className="absolute top-4 right-4 w-12 h-12 text-neon-purple/10 group-hover:text-neon-pink/20 transition-colors" />
            
            {/* Rating */}
            <div className="flex gap-1 mb-4">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5 text-neon-cyan fill-neon-cyan"
                />
              ))}
            </div>

            {/* Quote */}
            <blockquote className="text-foreground/90 text-lg mb-6 italic">
              "{testimonial.quote[language]}"
            </blockquote>

            {/* Author */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">
                  {testimonial.author}
                </p>
                {testimonial.company && (
                  <p className="text-sm text-muted-foreground">
                    {testimonial.company}
                  </p>
                )}
              </div>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-neon-purple/10 text-neon-purple border border-neon-purple/30">
                {testimonial.eventType[language]}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Event Types */}
      <div className="text-center">
        <p className="text-muted-foreground mb-6">{t.trustedBy}</p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          {clientLogos.map((client, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-2 px-4 py-3 glass-card rounded-xl hover:border-neon-cyan/30 transition-colors group"
            >
              <client.icon className="w-8 h-8 text-muted-foreground group-hover:text-neon-cyan transition-colors" />
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                {client.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <div className="mt-12 text-center">
        <button
          onClick={scrollToBooking}
          className="book-now-button px-8 py-4 text-lg font-semibold rounded-full bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-purple hover:to-neon-pink transition-all duration-300 shadow-lg shadow-neon-pink/30 hover:shadow-neon-purple/50 hover:scale-105"
        >
          {t.bookNow}
        </button>
      </div>
    </section>
  );
};

export default TestimonialsSection;
