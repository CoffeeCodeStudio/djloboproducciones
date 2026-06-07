import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Headphones,
  Lightbulb,
  Music,
  Heart,
  ArrowRight,
} from "lucide-react";
import Footer from "@/components/Footer";
import NeonWordmark from "@/components/NeonWordmark";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";

const TITLE = "Hyra DJ till Bröllop i Göteborg | DJ Lobo Producciones";
const DESCRIPTION =
  "Boka en professionell bröllops-DJ i Göteborg. DJ Lobo har 20+ års erfarenhet av bröllop, företagsevent och privatfester. Kontakta oss för offert.";
const CANONICAL = "https://djloboproducciones.com/blog/hyra-dj-brollop-goteborg";

const FAQS: { q: string; a: string }[] = [
  {
    q: "Vad kostar det att hyra en DJ till bröllop i Göteborg?",
    a: "Priset för en bröllops-DJ i Göteborg varierar beroende på speltid, ljud- och ljuspaket samt resväg. DJ Lobo har transparenta paket från bas till premium — se aktuella priser på prislistan eller kontakta oss för en personlig offert.",
  },
  {
    q: "Hur lång tid i förväg bör jag boka bröllops-DJ?",
    a: "Vi rekommenderar att boka 6–12 månader i förväg, särskilt för helger under högsäsong (maj–september). Populära datum försvinner snabbt — hör av dig så tidigt som möjligt för att säkra ditt datum.",
  },
  {
    q: "Vilken musik spelar DJ Lobo på bröllop?",
    a: "DJ Lobo har bred repertoar: latin, house, världshits, 80- och 90-tal, svenska klassiker och dagens topplistor. Vi går igenom önskelistor och stämning innan kvällen så att varje moment — från brudvals till dansgolv — får rätt sound.",
  },
  {
    q: "Ingår ljud och ljus när jag bokar DJ Lobo?",
    a: "Ja, professionellt ljudsystem ingår i alla paket. Stämningsljus och rörliga ljuseffekter ingår i premiumpaketen och kan läggas till på övriga paket. Vi anpassar tekniken efter lokalens storlek.",
  },
];

const FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const INCLUDED: { icon: typeof Music; title: string; desc: string }[] = [
  {
    icon: Music,
    title: "Erfaren DJ med 20+ års erfarenhet",
    desc: "Hundratals bröllop, företagsevent och privatfester runt om i Göteborg.",
  },
  {
    icon: Headphones,
    title: "Professionellt ljudsystem",
    desc: "Kristallklart ljud anpassat efter lokalens storlek.",
  },
  {
    icon: Lightbulb,
    title: "Stämningsljus och effekter",
    desc: "Färgsatt belysning och rörliga ljus som lyfter dansgolvet.",
  },
  {
    icon: Heart,
    title: "Personlig musikplanering",
    desc: "Genomgång av önskelåtar, brudvals, första dansen och no-play-lista.",
  },
  {
    icon: CalendarDays,
    title: "Flexibel speltid",
    desc: "Från ceremoni och middag till efterfest — vi anpassar oss efter ert schema.",
  },
  {
    icon: CheckCircle2,
    title: "Backup-utrustning på plats",
    desc: "Reservgear ingår alltid så att musiken aldrig tystnar.",
  },
];

const BlogHyraDjBrollopGoteborg = () => {
  const { setLanguage } = useLanguage();

  // Force Swedish on this page, regardless of stored preference.
  useEffect(() => {
    setLanguage("sv");
  }, [setLanguage]);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
      <Helmet>
        <html lang="sv" />
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:type" content="article" />
        <meta property="og:locale" content="sv_SE" />
        <script type="application/ld+json">{JSON.stringify(FAQ_JSONLD)}</script>
      </Helmet>

      <div className="mesh-gradient-bg" aria-hidden="true" />

      {/* Slim header — no nav, no language switcher */}
      <header className="relative z-10 px-4 sm:px-6 py-5 border-b border-border/30">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/sv" aria-label="Till startsidan">
            <NeonWordmark size="nav" />
          </Link>
          <Link
            to="/sv/prislista#boka"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-display font-bold tracking-wider text-sm book-now-button"
          >
            Boka nu
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <main id="main-content" className="px-4 sm:px-6 pb-36 relative z-10">
        <article className="max-w-3xl mx-auto py-12 sm:py-16">
          {/* Hero / H1 */}
          <header className="text-center mb-12 sm:mb-16">
            <p className="font-display tracking-[0.3em] text-xs sm:text-sm text-neon-cyan/80 mb-4">
              GUIDE • BRÖLLOP I GÖTEBORG
            </p>
            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-black text-neon-gradient leading-tight tracking-wider">
              Hyra DJ till Bröllop i Göteborg
            </h1>
            <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Allt du behöver veta innan du bokar bröllops-DJ — från musikval
              och pris till tidsplanering och teknik.
            </p>
          </header>

          {/* Section 1 */}
          <section className="mb-14">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-neon-gradient mb-5">
              Varför är musik så viktigt på bröllopet?
            </h2>
            <div className="space-y-4 text-foreground/90 leading-relaxed">
              <p>
                Musiken är den röda tråden som bär hela bröllopsdagen — från
                den känslosamma ceremonin och middagens stämning till den
                fartfyllda efterfesten. Rätt låt i rätt ögonblick förvandlar
                minnen till något ni och era gäster kommer att prata om i
                åratal.
              </p>
              <p>
                En erfaren bröllops-DJ läser av rummet, växlar mellan genrer
                och bjuder in alla generationer på dansgolvet. I Göteborg där
                gäster ofta kommer från olika kulturer är det avgörande att
                kunna mixa svenska klassiker, latin, house och världshits utan
                att tappa energin.
              </p>
              <p>
                DJ Lobo har spelat på allt från intima lantliga bröllop i
                Bohuslän till storslagna fester i hjärtat av Göteborg —
                och vet exakt vad som krävs för att hålla dansgolvet fullt
                hela natten.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-14">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-neon-gradient mb-6">
              Vad ingår när du bokar DJ Lobo?
            </h2>
            <ul className="grid sm:grid-cols-2 gap-4">
              {INCLUDED.map(({ icon: Icon, title, desc }) => (
                <li
                  key={title}
                  className="glass-card rounded-xl p-5 border border-primary/20 hover:border-primary/50 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-neon-cyan" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base mb-1">
                        {title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-snug">
                        {desc}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 3 */}
          <section className="mb-14">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-neon-gradient mb-5">
              Priser för bröllops-DJ i Göteborg
            </h2>
            <p className="text-foreground/90 leading-relaxed mb-5">
              DJ Lobo erbjuder transparenta paket som täcker alla typer av
              bröllop — från intima sällskap till stora festkvällar. Priserna
              beror på speltid, ljud- och ljuspaket samt resväg utanför
              Göteborg.
            </p>
            <div className="glass-card rounded-xl p-6 border border-secondary/30">
              <p className="text-sm text-muted-foreground mb-4">
                Se aktuella paket, vad som ingår och få en personlig offert
                på prislistan.
              </p>
              <Link
                to="/sv/prislista"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-display font-bold tracking-wider text-sm border border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10 transition-all"
              >
                Se prislistan
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>

          {/* Section 4 — FAQ */}
          <section className="mb-14">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-neon-gradient mb-6">
              Vanliga frågor
            </h2>
            <div className="glass-card rounded-xl px-5 sm:px-6 border border-primary/20">
              <Accordion type="single" collapsible className="w-full">
                {FAQS.map((f, i) => (
                  <AccordionItem
                    key={f.q}
                    value={`faq-${i}`}
                    className="border-border/40 last:border-b-0"
                  >
                    <AccordionTrigger className="text-left font-display text-base sm:text-lg hover:no-underline hover:text-neon-cyan">
                      {f.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-foreground/85 text-sm sm:text-base leading-relaxed">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>

          {/* Section 5 — CTA */}
          <section className="mt-16">
            <div className="glass-card rounded-2xl p-8 sm:p-12 text-center border border-neon-pink/30 relative overflow-hidden">
              <div
                className="absolute inset-0 -z-10 opacity-40"
                style={{
                  background:
                    "radial-gradient(circle at 30% 20%, hsl(var(--neon-pink) / 0.25), transparent 60%), radial-gradient(circle at 70% 80%, hsl(var(--neon-cyan) / 0.2), transparent 60%)",
                }}
                aria-hidden="true"
              />
              <h2 className="font-display text-2xl sm:text-4xl font-black text-neon-gradient mb-4">
                Boka DJ Lobo till ditt bröllop
              </h2>
              <p className="text-foreground/90 max-w-xl mx-auto mb-7 text-sm sm:text-base">
                Berätta om er dag — datum, lokal och drömlåtar — så återkommer
                vi med en skräddarsydd offert inom 24 timmar.
              </p>
              <Link
                to="/sv/prislista#boka"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-display font-bold tracking-wider text-sm sm:text-base book-now-button"
              >
                <CalendarDays className="w-5 h-5" />
                Boka spelning
              </Link>
            </div>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default BlogHyraDjBrollopGoteborg;
