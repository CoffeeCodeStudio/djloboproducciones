import djLoboAboutImage from "@/assets/dj-lobo-about.jpg";
import { Music, Headphones, Zap, Disc } from "lucide-react";
import { useBranding } from "@/hooks/useBranding";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollReveal } from "@/hooks/useScrollReveal";


const translations = {
  sv: {
    title: "OM DJ LOBO",
    bio1: "DJ Lobo har arbetat som professionell DJ i över",
    years: "20 år",
    bio1b: ". Med rötter i Göteborg har han gjort hundratals spelningar på nattklubbar, företagsevent, bröllop och privatfester – från Club Mamba till Salsa Latino Night på Kajuteriet Malmö.",
    bio2: "Hans unika mix av",
    classics: "80- och 90-talsklassiker",
    combined: "kombinerat med het",
    latin: "latinmusik",
    bio2b: "skapar en oförglömlig atmosfär. Oavsett om det är synth-pop, eurodance, salsa eller reggaeton – DJ Lobo tar dig på en musikalisk resa!",
    yearsLabel: "År",
    eventsLabel: "Spelningar",
    feature1Title: "80 & 90-tal",
    feature1Desc: "Hits från en era som aldrig dör",
    feature2Title: "Latin Vibes",
    feature2Desc: "Rytmer som får golvet att röra sig",
    feature3Title: "Club & Spelningar",
    feature3Desc: "Vi sätter stämningen — du njuter",
  },
  en: {
    title: "ABOUT DJ LOBO",
    bio1: "DJ Lobo has been working as a professional DJ for over",
    years: "20 years",
    bio1b: ". With roots in Gothenburg, he has performed hundreds of gigs at nightclubs, corporate events, weddings and private parties – from Club Mamba to Salsa Latino Night at Kajuteriet Malmö.",
    bio2: "His unique mix of",
    classics: "80s and 90s classics",
    combined: "combined with hot",
    latin: "Latin music",
    bio2b: "creates an unforgettable atmosphere. Whether it's synth-pop, eurodance, salsa or reggaeton – DJ Lobo takes you on a musical journey!",
    yearsLabel: "Years",
    eventsLabel: "Events",
    feature1Title: "80s & 90s",
    feature1Desc: "Hits from an era that never dies",
    feature2Title: "Latin Vibes",
    feature2Desc: "Rhythms that move the floor",
    feature3Title: "Club & Events",
    feature3Desc: "We set the mood — you enjoy",
  },
  es: {
    title: "SOBRE DJ LOBO",
    bio1: "DJ Lobo ha trabajado como DJ profesional durante más de",
    years: "20 años",
    bio1b: ". Con raíces en Gotemburgo, ha realizado cientos de actuaciones en discotecas, eventos corporativos, bodas y fiestas privadas – desde Club Mamba hasta Salsa Latino Night en Kajuteriet Malmö.",
    bio2: "Su mezcla única de",
    classics: "clásicos de los 80 y 90",
    combined: "combinada con ardiente",
    latin: "música latina",
    bio2b: "crea una atmósfera inolvidable. Ya sea synth-pop, eurodance, salsa o reggaeton – ¡DJ Lobo te lleva en un viaje musical!",
    yearsLabel: "Años",
    eventsLabel: "Eventos",
    feature1Title: "80s & 90s",
    feature1Desc: "Hits de una era que nunca muere",
    feature2Title: "Latin Vibes",
    feature2Desc: "Ritmos que hacen mover el piso",
    feature3Title: "Club & Eventos",
    feature3Desc: "Nosotros ponemos el ambiente — tú disfrutas",
  },
};

const AboutSection = () => {
  const sectionRef = useScrollReveal<HTMLElement>();
  const { branding } = useBranding();
  const { language } = useLanguage();
  const t = translations[language];

  // Use profile image for About section — stable reference to avoid blinking
  const profileUrl = branding?.profile_image_url;
  const aboutImage = profileUrl || djLoboAboutImage;
  const aboutFallback = djLoboAboutImage;

  // Reveal handled by the shared hook below — kept declarations above so the
  // refactor is a drop-in replacement.

  const stats = [
    { value: "20+", label: t.yearsLabel, ariaLabel: "Över 20 års erfarenhet" },
    { value: "1000+", label: t.eventsLabel, ariaLabel: "Över 1000 spelningar" },
  ];

  const features = [
    {
      icon: Music,
      title: t.feature1Title,
      description: t.feature1Desc,
      gradient: "icon-gradient-pink",
      glowColor: "hsla(var(--neon-pink), 0.45)",
      iconColor: "text-neon-pink",
    },
    {
      icon: Disc,
      title: t.feature2Title,
      description: t.feature2Desc,
      gradient: "icon-gradient-cyan",
      glowColor: "hsla(var(--neon-cyan), 0.45)",
      iconColor: "text-neon-cyan",
    },
    {
      icon: Headphones,
      title: t.feature3Title,
      description: t.feature3Desc,
      gradient: "icon-gradient-purple",
      glowColor: "hsla(var(--neon-purple), 0.45)",
      iconColor: "text-neon-purple",
    },
  ];

  // Dynamic bio text from database
  const dynamicBio = branding?.bio_text;

  return (
    <section 
      ref={sectionRef} 
      id="about" 
      className="py-16 sm:py-24 px-4 sm:px-6 relative"
      aria-labelledby="about-title"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 sm:gap-16 items-center">
          {/* Left Column - Text */}
          <div className="scroll-reveal">
            <h2 
              id="about-title"
              className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-neon-gradient mb-6 sm:mb-8"
            >
              {t.title}
            </h2>

            {dynamicBio && language === "sv" ? (
              <div className="text-muted-foreground text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed whitespace-pre-line">
                {dynamicBio}
              </div>
            ) : (
              <>
                <p className="text-muted-foreground text-base sm:text-lg mb-4 leading-relaxed">
                  {t.bio1} <span className="text-neon-pink font-semibold">{t.years}</span>{t.bio1b}
                </p>
                <p className="text-muted-foreground text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed">
                  {t.bio2} <span className="text-neon-cyan font-semibold">{t.classics}</span> {t.combined}{" "}
                  <span className="text-neon-pink font-semibold">{t.latin}</span> {t.bio2b}
                </p>
              </>
            )}

            {/* Stats */}
            <dl className="flex justify-center gap-12 sm:gap-16 mt-6 sm:mt-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center scroll-reveal">
                  <dt className="sr-only">{stat.ariaLabel}</dt>
                  <dd>
                    <div className="font-display text-3xl sm:text-4xl font-bold text-neon-gradient">
                      {stat.value}
                    </div>
                    <div className="text-muted-foreground text-xs sm:text-sm mt-1">
                      {stat.label}
                    </div>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Right Column - Image */}
          <div>
            <div className="scroll-reveal glass-card overflow-hidden w-full max-w-md aspect-[3/4] mx-auto">
              <img
                src={aboutImage}
                alt="DJ Lobo spelar latinmusik live"
                className="w-full h-full object-cover object-top block"
                loading="lazy"
                width={400}
                height={533}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = aboutFallback; }}
              />
            </div>
          </div>
        </div>

        {/* Feature Cards - full width below */}
        <ul className="grid grid-cols-3 gap-2 sm:gap-4 mt-10 sm:mt-16" role="list">
          {features.map((feature, index) => (
            <li
              key={index}
              className="scroll-reveal glass-card p-3 sm:p-4 text-center"
            >
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${feature.gradient} flex items-center justify-center mx-auto mb-2 sm:mb-3`}
                aria-hidden="true"
              >
                <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="font-semibold text-xs sm:text-sm mb-1">{feature.title}</h3>
              <p className="text-muted-foreground text-[10px] sm:text-xs">
                {feature.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default AboutSection;
