# 📋 DJ Lobo Producciones – Changelog

Detaljerad sammanställning av all utveckling (2026-01-11 → 2026-06-16, ~1437 meddelanden).

---

## 🚀 v0.1 – Initial Build (2026-01-11)

**20:45** – Pixel-perfekt klon av neon-retro-waves-templaten, brandad som "DJ LOBO RADIO".
- Skapade: `Header`, `HeroSection`, `AboutSection`, `ScheduleSection`, `NowPlayingBar`, `Footer`, `Index`
- Designsystem: neon pink/cyan-gradienter, glassmorphism, scroll-reveal-animationer, "light leaks" i hörnen
- Sticky bottom-player med play/pause, visualizer, volymkontroll

**20:46** – Externa integrationer:
- ZenoFM-ström kopplad (`https://stream.zeno.fm/gzzqvbuy0d7uv`)
- Mixcloud-embed (`DjLobo75`) + Google Calendar (`djloboradio2016@gmail.com`)
- Sociala länkar i footer (Instagram, Facebook, Mixcloud)

**20:47** – Bytte stockbild till riktig DJ Lobo-bild (`dj-lobo-real.jpg`)

**20:51** – Stor UX/Tillgänglighetsuppgradering (WCAG):
- `focus-neon`, `skip-link`, `tap-target` (≥44×44px), `prefers-reduced-motion`-stöd
- ARIA-labels på alla interaktiva element, `aria-hidden` på dekorativa ikoner
- Laddnings-state ("ANSLUTER…") i radiospelaren

**20:54** – 3-språks-väljare (🇸🇪 Svenska, 🇬🇧 English, 🇪🇸 Español) + säkerhetsskanning

**20:55** – Ljusare glassmorphism-bakgrund (8% → 12% lightness)

**20:58** – Bio uppdaterad: Latin-musik (salsa, reggaeton), Club Mamba, Kajuteriet Malmö, 20+ år

**21:00–21:30** – Bildbyten i About-sektionen, säkerhetshärdning av chat (admin-only DELETE/UPDATE, rate limiting, session-tracking för bans), logger-utility skapad

---

## 📱 v0.2 – Multi-Page & Mobile (2026-01-12)

- YouTube-integration låst till kanalen `@djloboproducciones3211`
- LiveChat-säkerhet: skapade DB-vyn `chat_messages_public` (gömmer `session_id` från publika queries)

---

## 🎨 v0.3 – Branding & Content (2026-01-30 → 2026-01-31)

- Resend-domän verifierad → `from: info@djloboproducciones.com`
- Kontaktformulärets mottagare: `djloboproducciones75@gmail.com`

---

## 🏗️ v0.4 – Site Restructure (2026-03-01 → 2026-03-04)

**03-01** – Performance/SEO-optimering:
- Favicon: 1.1 MB PNG → 32×32 `.ico`
- Storage-bilder: `/storage/v1/object/public/` → `/render/image/public/` (auto WebP + resize)
- Google Fonts: CSS `@import` → preload i `<head>` (eliminerat render-blocking)

**03-02 → 03-03** – Multi-page-arkitektur:
- Skapade `RadioPage`, `ReferencesPage`, `EquipmentPage`
- `Index` blev landningssida (Hero + Booking + utvalda sektioner)
- Skapade `/galleri` (SocialGallery + Testimonials), gamla `/referenser` redirectar

**03-02 19:53** – Hero-sektion: full-höjd utan scroll, `pb-32`/`pb-40` global padding för att inte täckas av sticky player

**03-03 10:21–10:45** – Admin-panel for Google Calendar: manuellt `google_calendar_id`-fält, `GOOGLE_CALENDAR_API_KEY` som secret

**03-04 12:07** – Media Gallery med filter (`Visa Allt | Bilder | Videor`) och lightbox

---

## 🔐 v0.5 – Auth & Admin (2026-03-07 → 2026-03-26)

**03-07 16:09–16:11** – Första volymkontroll-implementation för ZenoFM-ljud och Mixcloud-mixar

**03-17 18:26** – Säkerhetsfix: `google-calendar` edge function var open proxy → hämtar nu `google_calendar_id` server-side med service role key

**03-23 02:39–02:45** – GDPR-audit: confirmed `localStorage` (ingen cookie-banner krävs), förenklade CookieConsent

**03-24 → 03-26** – Booking System:
- Ny sida `/prislista` med bokningsformulär (flyttat från Spelningar)
- 2×2 pricing-grid (4 paket) med neon-styling och scroll-animationer
- Booking edge function: fixade `CHECK`-constraint på `bookings`-tabellen

**03-26 19:12 → 19:19** – Adminpanel:
- Supabase Auth (email + password), `useAuth.ts`, `has_role()` RBAC
- "Glömt lösenord"-flöde + `ResetPassword`-sida
- Edge function `list-admin-users` (visar emails istället för UUIDs)

---

## ⚖️ v0.6 – Legal Compliance (2026-03-28 → 2026-04-02)

**03-28 13:10–13:15** – GDPR-uppgradering:
- Uppdaterad Privacy Policy med tredjepartsöverföringar (USA), rättsliga grunder
- Genererade DPA/PUB-avtal

**04-02 16:42–16:47** – Full legal compliance-audit:
- Säkerhetsheaders i `public/_headers` (CSP, Permissions-Policy, X-Frame-Options)
- Organisationsnummer + ångerrätt-undantag dokumenterade
- Retentionstabell: bokningar 1h rate-limit, chat 90 dagar (auto-cron), cookies samtyckes-stamp

---

## 🎛️ v0.7 – Admin Power Tools (2026-04-21 → 2026-04-24)

**04-21 10:45 → 13:55** – Admin CRUD-flikar:
- `BrandingTab`, `BioTab`, `MixesTab`, `MixcloudTab`, `GalleryTab`, `PromoEditor`, `EquipmentTab`, `FramsidaTab`, `HelpTab`, `ImageCropper`
- LocalStorage/SessionStorage tillagt i Privacy Policy som "kakor"

**04-24 15:14–15:19** – Säkerhet & dokumentation:
- `google_calendar_id` flyttat från publika `site_branding` → admin-skyddad `site_secrets`
- README utökat med Admin CRUD-matrix och RLS-modell
- README:s system-docs för Radio/Chat/Calendar

---

## 🖼️ v0.8 – Visual Polish (2026-05-17 → 2026-05-19)

**05-17 22:13** – i18n-routing: alla länkar via `useLocalizedTo` (`/sv/`, `/en/`, `/es/`-prefix)

**05-19 20:41** – Media gallery: `aspect-[4/3]` → `aspect-[5/4]` (mindre crop på bilder)

---

## 📚 v0.9 – Documentation Sprint (2026-06-07)

**13:45 → 14:24** – Full teknisk dokumentation:
- README med 11 sidor, 39+16+49 komponenter, 6 edge functions, 12 DB-tabeller
- Routing-tabell, RLS-policies, edge function-tabell, storage-buckets
- Migration: `chat_messages` SELECT-policy flyttad till view-baserad istället för `USING(true)` på bas-tabellen

---

## 🎵 v1.0 – Player Bugfix Marathon (2026-06-16)

- **Bug 1** – Volume slider/mute uppdaterade `audio.volume` synkront i handler istället för via `useEffect`
- **Bug 2** – Radio startade inte — `handleRadioToggle` skriver `STREAM_URL` direkt, sätter `muted=false`, anropar `audio.play()` med catch som visar felmeddelande i UI
- **Fix** – `HeroSection` viewport: `h-[calc(100vh-5rem)]` → inline `style={{height:'calc(100dvh - 5rem)'}}`
- **21:22** – Mixcloud iframe: `allow="autoplay"` → `allow="autoplay; encrypted-media"`
- **21:40** – `public/_headers`: lagt till `encrypted-media=*` i `Permissions-Policy` (krävs för Mixcloud cross-origin DRM)
- **21:55** – Mixcloud Widget API implementerat korrekt: `mixWidgetRef`, `widget.ready`, `setVolume(0..1)` — eliminerade target-origin-felet

---

## 🔧 Tech Stack

| Lager | Teknologi |
|---|---|
| Frontend | React 18, Vite 5, TypeScript 5, Tailwind v3, shadcn/ui |
| Backend | Lovable Cloud / Supabase (`gzdnxaseaimdobahilyc`) |
| Auth | Supabase Auth + `has_role()` RBAC |
| Email | Resend (`noreply@djloboproducciones.com` → `djloboproducciones75@gmail.com`) |
| Audio | ZenoFM HLS-ström + Mixcloud Widget API |
| Kalender | Google Calendar API (server-side, cached) |
| Hosting | Lovable Cloud + Strato DNS → `djloboproducciones.com` |
| Språk | Svenska / English / Español (i18n-routing) |
