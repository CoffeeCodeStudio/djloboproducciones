import { useEffect, useRef } from "react";
import djLoboAboutImage from "@/assets/dj-lobo-about.jpg";
import { Music, Headphones, Zap, Disc } from "lucide-react";
import { useBranding } from "@/hooks/useBranding";
import { useLanguage } from "@/contexts/LanguageContext";
import { optimizeHero } from "@/lib/imageOptimizer";

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
    feature1Desc: "Synth-pop, eurodance och discoklassiker",
    feature2Title: "Latin Vibes",
    feature2Desc: "Salsa, reggaeton och tropical hits",
    feature3Title: "Club & Spelningar",
    feature3Desc: "Bröllop, företag och privatfester",
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
    feature1Desc: "Synth-pop, eurodance and disco classics",
    feature2Title: "Latin Vibes",
    feature2Desc: "Salsa, reggaeton and tropical hits",
    feature3Title: "Club & Events",
    feature3Desc: "Weddings, corporate and private parties",
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
    feature1Desc: "Synth-pop, eurodance y clásicos disco",
    feature2Title: "Latin Vibes",
    feature2Desc: "Salsa, reggaeton y tropical hits",
    feature3Title: "Club & Eventos",
    feature3Desc: "Bodas, empresas y fiestas privadas",
  },
};

const AboutSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { branding } = useBranding();
  const { language } = useLanguage();
  const t = translations[language];

  // Use dynamic hero image if available, otherwise use the default
  const heroOpt = optimizeHero(branding?.hero_image_url);
  const heroImage = heroOpt.src || djLoboAboutImage;
  const heroFallback = heroOpt.fallback || djLoboAboutImage;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".scroll-reveal").forEach((el, i) => {
              setTimeout(() => {
                el.classList.add("revealed");
              }, i * 100);
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const stats = [
    { value: "20+", label: t.yearsLabel, ariaLabel: "Över 20 års erfarenhet" },
    { value: "500+", label: t.eventsLabel, ariaLabel: "Över 500 spelningar" },
  ];

  const features = [
    {
      icon: Music,
      title: t.feature1Title,
      description: t.feature1Desc,
      gradient: "icon-gradient-pink",
    },
    {
      icon: Disc,
      title: t.feature2Title,
      description: t.feature2Desc,
      gradient: "icon-gradient-cyan",
    },
    {
      icon: Headphones,
      title: t.feature3Title,
      description: t.feature3Desc,
      gradient: "icon-gradient-purple",
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

            {dynamicBio ? (
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

          {/* Right Column - Image and Features */}
          <div className="space-y-4 sm:space-y-6">
            {/* DJ Image */}
            <div className="scroll-reveal glass-card overflow-hidden">
              <img
                src={heroImage}
                alt="DJ Lobo spelar latinmusik live"
                className="w-full h-64 sm:h-80 object-contain"
                loading="lazy"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = heroFallback; }}
              />
            </div>

            {/* Feature Cards */}
            <ul className="grid grid-cols-3 gap-2 sm:gap-4" role="list">
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
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
