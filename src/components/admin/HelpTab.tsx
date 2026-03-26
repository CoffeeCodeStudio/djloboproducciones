import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  HelpCircle, Download, Home, ImageIcon, Radio, Star, Calendar, Palette,
  Mail, MessageSquare, Globe, ExternalLink, Clock, Users
} from "lucide-react";

const sections = [
  {
    icon: Home,
    title: "Framsida",
    description: "Ändra hero-bild, profilbild, tagline och bio-text.",
    steps: [
      "Gå till fliken Hem",
      "Klicka på bilderna för att byta dem (max 1 MB)",
      "Skriv ny tagline eller bio-text i textfälten",
      "Klicka Spara"
    ]
  },
  {
    icon: ImageIcon,
    title: "Media (Galleri)",
    description: "Hantera foton och videos som visas på /media-sidan.",
    steps: [
      "Gå till fliken Media",
      "Ladda upp foton (JPG/PNG, max 2 MB) eller lägg till YouTube-URL",
      "Toggla mellan Foto och Video-typ",
      "Dra för att ändra ordning, klicka 🗑️ för att ta bort"
    ]
  },
  {
    icon: Radio,
    title: "Radio",
    description: "Ändra radiobild och sektionsrubrik för DJ Lobo Radio.",
    steps: [
      "Gå till fliken Radio",
      "Byt radiobild och/eller sektionsrubrik",
      "Klicka Spara",
      "Själva radioströmmen hanteras via zeno.fm"
    ]
  },
  {
    icon: Star,
    title: "Omdömen",
    description: "Lägg till, redigera eller ta bort kundomdömen.",
    steps: [
      "Gå till fliken Omdömen",
      "Klicka Lägg till för nya omdömen",
      "Fyll i namn, text och betyg",
      "Klicka Spara"
    ]
  },
  {
    icon: Calendar,
    title: "Spelningar (Google Calendar)",
    description: "Kommande spelningar hämtas automatiskt från Google Calendar.",
    steps: [
      "Öppna Google Calendar (calendar.google.com)",
      "Logga in med djloboproducciones75@gmail.com",
      "Skapa ett nytt event med titel, plats och tid",
      "Eventet visas på hemsidan inom 5 minuter"
    ]
  },
  {
    icon: Palette,
    title: "Utseende",
    description: "Ändra logo, sidnamn och glow-färger.",
    steps: [
      "Gå till fliken Stil",
      "Ladda upp ny logo (max 1 MB)",
      "Ändra sidnamn, tagline eller färger",
      "Klicka Spara"
    ]
  },
];

const quickFacts = [
  { icon: Clock, label: "Uppdateringstid", value: "Ändringar syns direkt (kalender max 5 min)" },
  { icon: Mail, label: "Mejl skickas till", value: "djloboproducciones75@gmail.com" },
  { icon: Globe, label: "Språk", value: "Svenska, Engelska, Spanska" },
  { icon: Users, label: "Besökarchatt", value: "Live-chatt med moderering" },
];

const HelpTab = () => {
  return (
    <div className="space-y-6">
      {/* Header + PDF download */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Hjälp & Instruktioner
          </CardTitle>
          <CardDescription>
            Allt du behöver veta för att hantera din hemsida
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Här hittar du instruktioner för varje del av admin-panelen. Du kan också ladda ner en
            komplett PDF-guide med alla detaljer.
          </p>
          <Button asChild className="neon-glow-pink">
            <a href="/DJ_Lobo_Producciones_Guide.pdf" download>
              <Download className="w-4 h-4 mr-2" />
              Ladda ner fullständig guide (PDF)
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Quick facts */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-display text-lg">Snabbfakta</CardTitle>
        </CardHeader>
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

      {/* Section guides */}
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

      {/* FAQ */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-display text-lg">Vanliga frågor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { q: "Hur snabbt syns mina ändringar?", a: "Direkt — utom kalenderändringar som tar max 5 minuter." },
            { q: "Hur lägger jag till en spelning?", a: "Skapa ett event i Google Calendar med kontot djloboproducciones75@gmail.com. Det dyker upp automatiskt." },
            { q: "Vad händer när någon bokar via sidan?", a: "Du får ett mejl till djloboproducciones75@gmail.com. Svara direkt — det går till kundens e-post." },
            { q: "Kan jag ändra priserna?", a: "Priserna är hårdkodade i designen. Kontakta utvecklaren (Coffee Code Studio) för att ändra." },
            { q: "Vad är skillnaden på DJ Lobo Radio och DJ Lobo Producciones?", a: "'DJ Lobo Producciones' är verksamheten. 'DJ Lobo Radio' är enbart radiokanalen." },
          ].map((faq, i) => (
            <div key={i} className="border-b border-border/30 pb-3 last:border-0 last:pb-0">
              <p className="text-sm font-medium text-foreground mb-1">{faq.q}</p>
              <p className="text-sm text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Support */}
      <Card className="glass-card">
        <CardContent className="py-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Behöver du mer hjälp? Kontakta utvecklaren:
            </p>
            <a
              href="https://coffeecodestudio.se"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
            >
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
