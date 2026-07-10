import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  HelpCircle, Home, ImageIcon, Radio, Star, Calendar, Palette,
  Mail, Globe, ExternalLink, Clock, Users, Crop, Megaphone, DollarSign
} from "lucide-react";

const sections = [
  {
    icon: Home,
    title: "Hem",
    description: "Startsidans hero-bild, profilbild, sajtnamn, tagline och bio-text.",
    steps: [
      "Öppna fliken Hem",
      "Klicka på Ladda upp-knappen för att byta bild (max 2 MB)",
      "Skriv nytt sajtnamn, tagline eller bio-text i textfälten",
      "Klicka Spara",
    ],
  },
  {
    icon: ImageIcon,
    title: "Media",
    description: "Foton och videor som visas på /media-sidan.",
    steps: [
      "Öppna fliken Media",
      "Klicka på Ladda upp-knappen för att lägga till foto (max 2 MB) — eller klistra in en YouTube-länk",
      "Välj typ: Foto eller Video",
      "Dra kort för att ändra ordning, klicka på papperskorgen för att ta bort",
    ],
  },
  {
    icon: Megaphone,
    title: "Reklam",
    description: "Popup-erbjudanden och kampanjer som visas för besökare.",
    steps: [
      "Öppna fliken Reklam",
      "Klicka Lägg till kampanj",
      "Fyll i rubrik, text, bild och länk – välj när kampanjen ska visas",
      "Aktivera med knappen och klicka Spara",
    ],
  },
  {
    icon: Radio,
    title: "Radio",
    description: "Radio-länkar, radiobild och sektionsrubrik.",
    steps: [
      "Öppna fliken Radio → Inställningar",
      "Byt stream-URL eller spelar-länk om du bytt tjänst (annars lämna som det är)",
      "Klicka på Ladda upp-knappen för att byta radiobild (max 2 MB)",
      "Skriv ny rubrik för radiosidan och klicka Spara",
    ],
  },
  {
    icon: DollarSign,
    title: "Priser",
    description: "Redigera de tre prispaketen och gemensamma texter.",
    steps: [
      "Öppna fliken Priser",
      "Ändra pris, paketnamn eller beskrivning direkt i fälten – för alla tre språk",
      "Klicka Spara under respektive paket",
      "Justera gemensamma texter (info-rad och CTA) längst ner om du vill",
    ],
  },
  {
    icon: Star,
    title: "Omdömen",
    description: "Kundomdömen som visas på hemsidan.",
    steps: [
      "Öppna fliken Omdömen",
      "Klicka Lägg till för nytt omdöme",
      "Fyll i namn, text och betyg",
      "Klicka Spara",
    ],
  },
  {
    icon: Calendar,
    title: "Event",
    description: "Kommande spelningar hämtas automatiskt från Google Kalender.",
    steps: [
      "Öppna calendar.google.com och logga in med djloboproducciones75@gmail.com",
      "Skapa ett nytt event med titel, plats och tid",
      "Eventet visas på hemsidan inom 5 minuter",
    ],
  },
  {
    icon: Palette,
    title: "Stil",
    description: "Logotyp, färger och bakgrund för hela sajten.",
    steps: [
      "Öppna fliken Stil",
      "Klicka på Ladda upp-knappen för ny logotyp (max 2 MB)",
      "Ändra färger via färgväljarna",
      "Klicka Spara",
    ],
  },
  {
    icon: Users,
    title: "Konto",
    description: "Hantera admin-användare och byt ditt lösenord.",
    steps: [
      "Öppna fliken Konto",
      "Bjud in nya administratörer med e-post",
      "Ta bort användare med papperskorgen",
      "Klicka på ditt eget namn för att byta lösenord",
    ],
  },
  {
    icon: Crop,
    title: "Beskär bilden",
    description: "Så fungerar beskäraren som öppnas efter uppladdning.",
    steps: [
      "När du väljer en bild öppnas en beskärare",
      "Dra bilden och zooma för att välja utsnittet",
      "Ramen visar exakt hur bilden kommer att synas på sajten",
      "Klicka Använd beskärning – bilden sparas direkt",
    ],
  },
];

const quickFacts = [
  { icon: Clock, label: "Uppdateringstid", value: "Direkt (kalendern max 5 min)" },
  { icon: Mail, label: "Mejl skickas till", value: "djloboproducciones75@gmail.com" },
  { icon: Globe, label: "Språk", value: "Svenska, engelska, spanska" },
  { icon: Users, label: "Besökarchatt", value: "Live med moderering" },
];

const HelpTab = () => {
  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Hjälp & instruktioner
          </CardTitle>
          <CardDescription>Allt du behöver för att sköta din hemsida själv.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Här får du enkla steg för varje del av admin-panelen. Behöver du hjälp?
            Kontakta{" "}
            <a href="https://coffeecodestudio.se" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
              Coffee Code Studio
            </a>.
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader><CardTitle className="font-display text-lg">Snabbfakta</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickFacts.map((fact) => (
              <div key={fact.label} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                <fact.icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">{fact.label}</p>
                  <p className="text-sm font-medium text-foreground">{fact.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => (
          <Card key={section.title} className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <section.icon className="w-4 h-4 text-primary" />
                {section.title}
              </CardTitle>
              <CardDescription className="text-xs">{section.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-1.5">
                {section.steps.map((step, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="text-primary font-bold flex-shrink-0">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle className="font-display text-lg">Vanliga frågor</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { q: "Hur snabbt syns mina ändringar?", a: "Direkt – utom kalendern som uppdateras inom 5 minuter." },
            { q: "Hur lägger jag till en spelning?", a: "Skapa ett event i Google Kalender med kontot djloboproducciones75@gmail.com. Det syns automatiskt på sajten." },
            { q: "Vad händer när någon bokar via sidan?", a: "Du får ett mejl till djloboproducciones75@gmail.com. Svara direkt – det går till kunden." },
            { q: "Kan jag ändra priserna?", a: "Ja, öppna fliken Priser. Där kan du ändra pris, namn och beskrivning för alla paket." },
            { q: "Kan jag byta ZenoFM-länken?", a: "Ja, öppna fliken Radio → Inställningar och skriv in den nya länken." },
            { q: "Filen är för stor – vad gör jag?", a: "Max filstorlek är 2 MB för de flesta bilder. Använd t.ex. tinypng.com eller squoosh.app för att krympa bilden först." },
            { q: "Kan jag byta API-nyckel för Google Kalender?", a: "Kontakta Coffee Code Studio så hjälper vi till att byta nyckeln." },
            { q: "Vad är skillnaden på DJ Lobo Radio och DJ Lobo Producciones?", a: "DJ Lobo Producciones är verksamheten. DJ Lobo Radio är enbart radiokanalen." },
          ].map((faq, i) => (
            <div key={i} className="border-b border-border/30 pb-3 last:border-0 last:pb-0">
              <p className="text-sm font-medium text-foreground mb-1">{faq.q}</p>
              <p className="text-sm text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="py-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Behöver du mer hjälp? Kontakta:</p>
            <a href="https://coffeecodestudio.se" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium">
              <ExternalLink className="w-4 h-4" />
              Coffee Code Studio
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpTab;
