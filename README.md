# 🚀 DJ Lobo Producciones – Web Application

Modern webbapp byggd av **Coffee Code Studio** som ersätter en legacy-site från 2015. Optimerad för hastighet, modern UX och sömlös medieintegration. Trespråkig (SV/EN/ES) med ett fullt utbyggt admin-system.

## 🔗 Länkar
- **Live:** https://djloboproducciones.com
- **Byggt av:** https://coffeecodestudio.se

---

## 🗺 Sidstruktur (Routes)

Publika sidor (delar `Layout.tsx` med Navbar, NowPlayingBar, PromoManager, CookieConsent):
| Route | Sida | Innehåll |
|-------|------|----------|
| `/` | **Hem** (`Index.tsx`) | Hero, About, Spelningar (Google Calendar), Equipment, Testimonials, Contact |
| `/lyssna` | **Live Radio** (`ListenPage.tsx`) | ZenoFM-stream + LiveChat (Supabase Realtime) |
| `/mixar` | **Mixar & Sets** (`MixesPage.tsx`) | Mixcloud-grid med inline mobil-promo |
| `/media` | **Media** (`MediaPage.tsx`) | Galleri, lightbox, filterbar (foto/video) |
| `/referenser` | **Omdömen** (`ReferencesPage.tsx`) | Kundtestimonials |
| `/prislista` | **Prislista** (`PrislistaPage.tsx`) | PricingGrid + BookingSection (kontakt/bokning) |
| `/privacy`, `/terms` | Juridiska sidor | GDPR, integritet, ÅRL |

Standalone (utan Layout): `/admin`, `/reset-password`, `/dev/zstack`.

Legacy-redirects: `/radio → /lyssna`, `/mixes|/galleri → /media`, `/spelningar → /`, `/utrustning → /spelningar`.

---

## 🛠 Kärnfunktioner

### 📻 Radio-spelare (Global)
- **`NowPlayingBar`** + **`GlobalMiniPlayer`** — Persistent spelare som överlever sidnavigering tack vare `Layout.tsx`.
- **State:** Zustand (`usePlayerStore`) hanterar mode (`radio` / `mix`), aktuellt spår, play/pause/minimize.
- **Källor:** ZenoFM live-stream + Mixcloud iframe-spelare.
- **`useStreamStatus`** kollar om streamen är live och visar ON AIR-indikator.

### 🎧 Mixar (Mixcloud)
- **`MixCardGrid`** + **`MixcloudMixes`** + **`MixcloudModal`** — Grid med kort, klick öppnar embedded spelare eller startar i mini-spelaren.
- **Sortering:** Pinnade först, sedan efter `mixcloud_created_time`. Dolda mixar filtreras bort.
- **Edge function `fetch-mixcloud`** — Synkar mixar automatiskt från Mixcloud-API.
- **Mobil:** Promo-banner injiceras efter 4:e mixen (`#promo-mobile-slot`).

### 📅 Schemaläggning (Spelningar)
- **`useUpcomingEvents`** — Kommande event på hemsidan (sorterade ascending, framtida endast).
- **`useCalendarEvents`** — Full event-lista, filtrerar bort historik, sorterar efter datum.
- **Edge function `google-calendar`** — Hämtar events från `djloboproducciones75@gmail.com` via Google Calendar API.
- **Caching:** TanStack Query med konfigurerad `staleTime`. Minimum loading-animation för UX.

### 📣 Promo / Kampanj-system
Trestegs visningslogik styrd av `PromoManager.tsx`:

1. **`PromoPopup`** — Stor popup vid första besöket. Stöder bild, MP4-loop eller YouTube-embed.
2. **`PromoMiniCard`** — Efter stängning visas mini-version i 24 timmar:
   - **Desktop (≥768px):** Flytande kort nere till höger (via `createPortal` till `document.body`).
   - **Mobil (<768px):** Helbredds-banner inuti mix-griden efter 4:e mixen (portalas till `#promo-mobile-slot` med `MutationObserver`-detektering).
3. **"Visa inte igen"** — Permanent dismiss via `localStorage`.

**Datakällor:**
- Tabell: `promos` (RLS: publika ser bara aktiva inom datumintervall).
- Hooks: `useActivePromo` (publik), `usePromosAdmin` (admin).
- Editor: `PromoEditor.tsx` med Google Calendar-koppling (auto: 14 dagar före → 1 dag efter event) eller manuell datum-picker. Prio 0–10 vid överlapp.
- Detaljerad guide: `docs/PROMO_EDITOR_GUIDE.md`.

#### 🧪 Konkret exempel — Hur PromoManager väljer promo

**Scenario:** Tre kampanjer ligger aktiva i `promos`-tabellen samtidigt. En besökare öppnar sajten den 3 april 2026.

| # | Titel | `is_active` | `active_from` → `active_to` | `priority` |
|---|-------|-------------|-----------------------------|------------|
| A | "Sommarturné 2026" | ✅ | 1 jun → 31 aug | 8 |
| B | "Påskfest på Trädgår'n" | ✅ | 1 apr → 5 apr | 10 |
| C | "Bröllopssäsong" | ✅ | 1 mar → 30 sep | 5 |

**Steg 1 — Filtrering (RLS):**
Policyn `Anyone can read active promos` släpper bara igenom rader där `is_active = true AND now() BETWEEN active_from AND active_to`. Den 3 april returneras därför **B** och **C** (A startar först 1 juni).

**Steg 2 — Prioritetsval (`useActivePromo`):**
Hooken sorterar resterande rader på `priority DESC, created_at DESC` och plockar den första. → **B "Påskfest" vinner** (priority 10 > 5).

**Steg 3 — Visningsläge (`PromoManager.tsx`):**
Manager läser `localStorage` + `sessionStorage` för promo-id `B`:

```
┌─ Permanent dismissad?  (localStorage: promo_permanent_dismissed_B)
│    JA  → mode = "hidden"           ⛔ inget visas
│    NEJ ↓
├─ Session-dold (Mini X)?  (sessionStorage: promo_mini_session_hidden_B)
│    JA  → mode = "hidden"           ⛔ inget visas (denna webbläsar-session)
│    NEJ ↓
├─ Sedd inom 24h?  (localStorage: promo_seen_B = timestamp)
│    JA  → mode = "mini"             📌 PromoMiniCard
│    NEJ → mode = "popup"            🎬 PromoPopup (full)
```

**Steg 4 — Användarens väg över tre dagar:**

```
1. Första besöket (måndag 09:00)
   └─ Inget i storage → POPUP visas
      └─ Användaren stänger med X
         └─ promo_seen_B = 1712131200000 sparas
         └─ mode växlar till "mini"

2. Återbesök samma dag (måndag 14:00)  ─ 5h senare
   └─ promo_seen_B finns och < 24h → MINI-CARD visas
      • Desktop: flytande kort nere till höger
      • Mobil:   banner inuti mix-griden efter 4:e mixen

3. Användaren klickar X på mini-cardet
   └─ promo_mini_session_hidden_B = "1" i sessionStorage
   └─ Inget visas resten av sessionen

4. Ny webbläsar-session (tisdag 08:00) ─ 23h senare
   └─ sessionStorage rensad, men promo_seen_B finns kvar
   └─ MINI-CARD visas igen (24h ej passerade)

5. Återbesök onsdag 10:00  ─ >24h sedan popup
   └─ promo_seen_B är för gammal → POPUP visas igen
      └─ Användaren klickar "Visa inte igen"
         └─ promo_permanent_dismissed_B = "1" i localStorage
         └─ Promo B visas ALDRIG mer för denna webbläsare
```

**Steg 5 — Re-open från mini:**
Klick på mini-cardet sätter `reopenedFromMini = true` och öppnar popupen igen. När användaren stänger den återgår läget till `mini` (utan att starta om 24h-timern).

**Storage-nycklar (sammanfattning):**

| Nyckel | Storage | Lifetime | Effekt |
|--------|---------|----------|--------|
| `promo_seen_<id>` | localStorage | 24h | Växlar popup → mini |
| `promo_mini_session_hidden_<id>` | sessionStorage | Tab-session | Döljer mini tills tab stängs |
| `promo_permanent_dismissed_<id>` | localStorage | Permanent | Döljer både popup och mini för alltid |

### 💼 Booking-flow
- **`BookNowButton`** — Smart CTA: scrollar till `#boka` på `/prislista`, annars navigerar dit med hash.
- **`BookingSection`** — Toggle mellan **Kontakt** (snabb fråga) och **Bokning** (fullt formulär: event, datum, plats, gäster).
- **Trespråkig:** SV/EN/ES via `LanguageContext`.
- **Edge function `send-booking-notification`** — Resend e-post från `noreply@djloboproducciones.com` → `djloboproducciones75@gmail.com`.
- **Lagring:** `bookings`-tabellen (admin kan se/uppdatera/radera, anon kan submit).

#### 🗺 Flödeskarta — Bokning från klick till bekräftelse

```
┌──────────────────────────────────────────────────────────────────────────┐
│  1. ANVÄNDAREN KLICKAR "BOKA NU"                                         │
│     Komponent: BookNowButton.tsx                                         │
│     • På /prislista  → smooth scroll till #boka                          │
│     • Annan sida     → navigate("/prislista#boka") + scroll vid mount    │
└──────────────────────────────┬───────────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  2. ANVÄNDAREN VÄLJER LÄGE I FORMULÄRET                                  │
│     Komponent: BookingSection.tsx (id="boka")                            │
│     • Toggle: [ Kontakt ]  ⇄  [ Bokning ]                                │
│     • Trespråkig (SV/EN/ES) via LanguageContext                          │
│                                                                          │
│     Kontakt-läge        →  ContactSection.tsx (kort meddelande)          │
│     Bokning-läge        →  Fullt formulär: namn, e-post, telefon,        │
│                            event_type, event_date, location, message     │
└──────────────────────────────┬───────────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  3. SUBMIT — DATA SPARAS I DATABASEN                                     │
│     Tabell: public.bookings                                              │
│     • RLS: "Anyone can submit bookings" (anon + auth → INSERT)           │
│     • status defaultar till 'pending'                                    │
│     • Kolumner: name, email, phone, event_type, event_date,              │
│       location, message, status, created_at, updated_at                  │
└──────────────────────────────┬───────────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  4. EDGE FUNCTION TRIGGAS                                                │
│     supabase.functions.invoke('send-booking-notification')               │
│     Funktion: supabase/functions/send-booking-notification/index.ts      │
│     • Resend-API via RESEND_API_KEY                                      │
│     • From: noreply@djloboproducciones.com                               │
│     • To:   djloboproducciones75@gmail.com (DJ Lobo)                     │
│     • Innehåll: alla bokningsfält + tidsstämpel                          │
│                                                                          │
│     (Snabb-kontakt går via send-contact-email på samma sätt)             │
└──────────────────────────────┬───────────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  5. ANVÄNDAR-FEEDBACK                                                    │
│     • Toast-bekräftelse via sonner ("Tack! Vi hör av oss snart")         │
│     • Formuläret rensas och stängs                                       │
│     • Vid fel → felmeddelande + bokningen ligger kvar i DB som pending   │
└──────────────────────────────┬───────────────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  6. DJ LOBO HANTERAR I ADMIN                                             │
│     Sida: /admin (kräver admin-roll via user_roles + has_role())         │
│     • Får mejl i inkorgen → öppnar admin-panelen                         │
│     • Granskar inkomna bokningar i bookings-tabellen                     │
│     • Uppdaterar status: pending → confirmed / declined                  │
│     • RLS: "Admins can update/view/delete bookings"                      │
│     • Svarar kunden manuellt via e-post / telefon                        │
└──────────────────────────────────────────────────────────────────────────┘
```

**Berörda artefakter:**
| Lager | Resurs |
|-------|--------|
| Frontend | `BookNowButton.tsx`, `BookingSection.tsx`, `ContactSection.tsx` |
| Databas | Tabell `bookings` (RLS: anon INSERT, admin SELECT/UPDATE/DELETE) |
| Edge functions | `send-booking-notification`, `send-contact-email` |
| Secrets | `RESEND_API_KEY` |
| E-post | Resend → `djloboproducciones75@gmail.com` |
| Admin | `/admin` (RBAC via `user_roles` + `has_role()` SECURITY DEFINER) |

### 💬 LiveChat (endast `/lyssna`)
- **Supabase Realtime** på `chat_messages`.
- UUID-baserad sessions-id (ingen IP-tracking) — ban-system via `chat_bans` + `is_session_banned()` SQL-funktion.
- **`profanityFilter.ts`** + rate limiting per session.
- **`FloatingChatButton`** — Endast synlig på `/lyssna`.

### 🖼 Media & Galleri
- **`SocialGallerySection`** + **`MediaLightbox`** + **`MediaFilterBar`** — Filtrerbar (foto/video).
- **`useGallery`** — Hämtar från `gallery_images`, sorterar efter `sort_order`.
- **`imageOptimizer.ts`** — Supabase image transformations + WebP, lazy-loading överallt.

---

## 🔐 Admin-panel (`/admin`)

Strikt mörk navy/charcoal-tema (NO neon — separat från publika sajten). Skyddad via Supabase RBAC (`user_roles` + `has_role()` SECURITY DEFINER).

| Flik | Komponent | Funktion |
|------|-----------|----------|
| **Framsida** | `FramsidaTab` | Hero-bild, bakgrund, OG-image |
| **Branding** | `BrandingTab` | Logotyp, färger (HSL), site-name, taglines |
| **Bio** | `BioTab` | About-text |
| **Spelningar** | `SpelningarTab` + `ScheduleTab` | Google Calendar-id |
| **Mixar** | `MixesTab` + `MixcloudTab` | Manuell + auto-sync, pin/dölj |
| **Galleri** | `GalleryTab` + `ImageCropper` | Upload, beskärning, sort |
| **Utrustning** | `EquipmentTab` | Trespråkig CRUD |
| **Omdömen** | `TestimonialsTab` | Kundcitat |
| **Radio** | `RadioTab` | Stream-inställningar, sektionstitel |
| **Kampanjer** | `PromosTab` + `PromoEditor` | Hela promo-systemet |
| **Användare** | `UsersTab` | Roll-hantering (kallar `list-admin-users`) |
| **Hjälp** | `HelpTab` | Länkar till dokumentation |

Inloggning via `AdminLogin.tsx` (Supabase Auth, e-post + lösen, password-reset via `/reset-password`).

---

## 🧠 Hooks-översikt

| Hook | Syfte |
|------|-------|
| `useAuth` | Supabase session + admin-roll |
| `useBranding` | `site_branding` (cached) |
| `useActivePromo` | Aktiv promo för publika sajten |
| `usePromosAdmin` | CRUD för admin |
| `useUpcomingEvents` | Hemsidans nästa event (sorterad asc, framtida) |
| `useCalendarEvents` | Full event-lista med stale-closure-säker fetch |
| `useGallery` | Galleri-bilder |
| `useStreamStatus` | Live/offline-detektering |
| `usePresence` | Realtime online-räknare |
| `useDynamicFavicon` | Statisk 512x512 favicon (ingen dynamisk ändring) |
| `use-mobile` | Breakpoint-detektering (768px) |

---

## ⚡ Tech Stack
- **Frontend:** React 18 + TypeScript + Vite 5
- **Styling:** Tailwind CSS v3 + shadcn/ui + semantiska HSL-tokens
- **State:** Zustand (player) + TanStack Query (server state) + React Context (language, cookie consent)
- **Backend:** Lovable Cloud (Supabase Auth, Postgres, Storage, Realtime, Edge Functions)
- **E-post:** Resend (`noreply@djloboproducciones.com`)
- **Hosting:** Lovable + custom domain
- **Workflow:** GitHub + Lovable AI

---

## ⚙️ Edge Functions (`supabase/functions/`)

| Function | Syfte |
|----------|-------|
| `fetch-mixcloud` | Synkar mixar från Mixcloud-API till `mixcloud_mixes` |
| `google-calendar` | Hämtar kommande spelningar från Google Calendar |
| `send-booking-notification` | Skickar bokningsmejl via Resend |
| `send-contact-email` | Skickar kontaktmejl via Resend |
| `list-admin-users` | Listar användare för admin-panelen |
| `check-cron-jobs` | Diagnostik för pg_cron retention-jobb |

---

## 🏗 Stacking Context (Z-Index)
För UI-konsistens:
- **100**: `PromoMiniCard` (Mini-Player) — Alltid över sidans innehåll
- **60**: `CookieConsent` — Juridisk overlay
- **50**: `NowPlayingBar` & Navigation — Globala kontroller
- **10**: `Footer` & Layout — Bas-element

> ⚠️ Framtida overlays får inte överstiga `100` om de inte är fullskärms-alerts (`PromoPopup` använder Radix Dialog defaults).

Debug-tool: `/dev/zstack` + `ZIndexDebugOverlay.tsx`.

---

## 🛠 Arkitektur-beslut

### React Portals
`PromoMiniCard` och `PromoPopup` använder `createPortal` för att:
1. Slippa `overflow: hidden` på parent-containers
2. Garantera att `position: fixed` är relativ till viewport, inte transformade ancestors
3. Mobil-banner portalas dynamiskt till mix-griden via `MutationObserver`

### Persistent Layout
`Layout.tsx` hålls monterad mellan route-byten — nödvändigt för att radio-spelaren inte ska stängas av vid navigering.

### Media-strategi
- **YouTube:** `youtube-nocookie.com` med `autoplay=1&mute=1&controls=0&loop=1` (GDPR-säker)
- **Native `<video>`:** `playsinline + muted + loop` (iOS-kompatibel autoplay)
- **Image fallback:** Alla videor har `poster` för att aldrig visa svart ruta

---

## 💾 State Management — Hybrid-modell

| Storage | Användning |
|---------|-----------|
| `localStorage` | Promo-cooldowns (24h), permanent dismiss, cookie-samtycke |
| `sessionStorage` | Mini-player session-hide |
| Zustand (`usePlayerStore`) | Global radio-/mix-spelare i minne |
| TanStack Query | Server-state med tunad `staleTime` per resurs |
| React Context | Språkval (SV/EN/ES), cookie consent |

---

## ⚖️ Compliance & Privacy
- **Storage Transparency:** Endast funktionell UI-state lagras klient-sidan — ingen PII.
  - `promo_seen_<id>`, `promo_mini_session_hidden_<id>`, `promo_permanent_dismissed_<id>`, `cookie_consent`
- **Privacy-by-Design:** YouTube via `youtube-nocookie.com` — inga marknadsföringscookies förrän användaren spelar upp.
- **Third-party gating:** Mixcloud + YouTube iframes laddas EJ förrän cookie-banner accepterats.
- **GDPR:** Server-data (bookings, contact, chat) auto-rensas via `pg_cron`.
- **No Analytics SDKs:** Inga Google Analytics, Meta Pixel eller liknande.
- **CSP:** Strikta HTTP-headers via `public/_headers`.

---

## 🌍 Internationalisering
- **3 språk:** Svenska (default), English, Español
- **Källa:** `LanguageContext.tsx` + per-komponent `translations`-objekt
- **Tone:** Informellt "tú" på spanska, "Göteborgs" på svenska
- **DB-data:** Equipment har `*_sv`, `*_en`, `*_es`-kolumner

---

## 💼 Coffee Code Studio
Levererat av **Coffee Code Studio** som en del av vårt **"Digital Upgrade"-paket** — från legacy till modern webbapplikation. Footer-signatur: *"Design & Development by Coffee Code Studio ☕"*.

---
*Senast uppdaterad: April 2026*
