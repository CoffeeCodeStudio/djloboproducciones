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

### Flikar och åtgärder

Legend: **C** = Create · **R** = Read · **U** = Update · **D** = Delete · **—** = ej tillämpligt

| Flik | Komponent(er) | Tabell / källa | C | R | U | D | Övriga åtgärder | Krävd roll |
|------|---------------|----------------|:-:|:-:|:-:|:-:|------------------|------------|
| **Framsida** | `FramsidaTab` | `site_branding` (single row) | — | ✅ | ✅ | — | Upload hero/bg/OG till `branding`-bucket | `admin` |
| **Branding** | `BrandingTab` | `site_branding` | — | ✅ | ✅ | — | Logo-upload, HSL-färger, site-name, tagline | `admin` |
| **Bio** | `BioTab` | `site_branding.bio_text` | — | ✅ | ✅ | — | Rik-text editor | `admin` |
| **Spelningar** | `SpelningarTab` + `ScheduleTab` | `site_branding.google_calendar_id` + edge `google-calendar` | — | ✅ | ✅ | — | Sätt Calendar-id, manuell refresh | `admin` |
| **Mixar (manuell)** | `MixesTab` | `mixcloud_mixes` | ✅ | ✅ | ✅ | ✅ | Pin, dölj, omsortera (`sort_order`) | `admin` |
| **Mixar (auto)** | `MixcloudTab` | `mixcloud_mixes` + edge `fetch-mixcloud` | ✅ (sync) | ✅ | ✅ | ✅ | Trigga full re-sync från Mixcloud | `admin` |
| **Galleri** | `GalleryTab` + `ImageCropper` | `gallery_images` + `branding`-bucket | ✅ | ✅ | ✅ | ✅ | Upload + crop, drag-sort, foto/video-typ | `admin` |
| **Utrustning** | `EquipmentTab` | `equipment` (SV/EN/ES) | ✅ | ✅ | ✅ | ✅ | Ikon-val, sortering | `admin` |
| **Omdömen** | `TestimonialsTab` | (statisk i koden) | ✅ | ✅ | ✅ | ✅ | Kund-citat, namn, event-typ | `admin` |
| **Radio** | `RadioTab` | `site_branding` (radio-fält) | — | ✅ | ✅ | — | Stream-URL, sektionstitel, radio-bild | `admin` |
| **Kampanjer** | `PromosTab` + `PromoEditor` | `promos` | ✅ | ✅ | ✅ | ✅ | Toggla `is_active`, prio 0–10, Google Calendar-koppling, video/flyer-upload, förhandsgranska | `admin` |
| **Bokningar** | (i admin via `bookings`-vy) | `bookings` | — | ✅ | ✅ | ✅ | Granska inkomna, ändra `status` (pending → confirmed/declined) | `admin` |
| **Chatt-moderering** | (via Supabase) | `chat_messages` + `chat_bans` | ✅ (ban) | ✅ | ✅ | ✅ | Radera meddelanden, banna sessions-id | `admin` |
| **Användare** | `UsersTab` | `user_roles` + edge `list-admin-users` | ✅ | ✅ | — | ✅ | Lägg till/ta bort admin-roller | `admin` |
| **Hjälp** | `HelpTab` | (statisk) | — | ✅ | — | — | Länkar till `docs/` och guider | `admin` |

### RLS-modell

Alla skrivåtgärder i admin är skyddade av Row-Level Security policies som kräver `has_role(auth.uid(), 'admin')`. Mönstret är konsekvent över alla tabeller:

```sql
-- Exempel: equipment-tabellen
CREATE POLICY "Anyone can view equipment"
  ON equipment FOR SELECT USING (true);

CREATE POLICY "Admins can insert equipment"
  ON equipment FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update equipment"
  ON equipment FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete equipment"
  ON equipment FOR DELETE USING (has_role(auth.uid(), 'admin'));
```

| Tabell | Publik SELECT | Admin INSERT | Admin UPDATE | Admin DELETE | Notering |
|--------|:-:|:-:|:-:|:-:|----------|
| `site_branding` | ✅ | ✅ | ✅ | ✅ | Single-row config |
| `equipment` | ✅ | ✅ | ✅ | ✅ | Trespråkig |
| `gallery_images` | ✅ | ✅ | ✅ | ✅ | Foto/video |
| `mixcloud_mixes` | ✅ | ✅ | ✅ | ✅ | Auto + manuell |
| `promos` | ✅ (filtrerat på `is_active` + datum) | ✅ | ✅ | ✅ | RLS exponerar bara aktiva publikt |
| `bookings` | ❌ | ✅ (anon också, för formulär) | ✅ | ✅ | Admin ser allt, anon kan bara INSERT |
| `contact_submissions` | ❌ | ✅ (anon också) | ❌ | ❌ | Append-only |
| `chat_messages` | ✅ | ✅ (om ej bannad) | ✅ | ✅ | UPDATE/DELETE endast admin |
| `chat_bans` | admin only | ✅ | ✅ | ✅ | Sessions-baserad ban |
| `site_secrets` | admin only | ✅ | ✅ | ✅ | Inga publika reads |
| `user_roles` | egen rad ELLER admin | ✅ (admin) | ✅ (admin) | ✅ (admin) | RBAC-grunden |

### Roller

| Roll | Värde i `user_roles.role` | Kan |
|------|---------------------------|-----|
| **Admin** | `'admin'` | Allt i `/admin`, alla CRUD via RLS |
| **Moderator** | `'moderator'` | Reserverad för framtida bruk (chatt-mod) |
| **User** | `'user'` | Standard — endast publika reads |

> ⚠️ **Säkerhets-policy:** Roller lagras ALDRIG på `profiles` eller `users`. Endast i den separata `user_roles`-tabellen, kontrollerad via `has_role()` SECURITY DEFINER för att undvika RLS-rekursion och privilege escalation.

### Inloggning

Inloggning via `AdminLogin.tsx` (Supabase Auth, e-post + lösen). Password-reset via `/reset-password`. Sessioner hanteras automatiskt av `useAuth`-hooken som även verifierar admin-rollen innan `/admin` renderas — utan admin-roll redirectas användaren till login.

---

## 📡 Live-system: Radio, Chat & Kalender

### 🎙 Radio (ZenoFM live-stream)

**Stream-URL** (hårdkodad i `NowPlayingBar.tsx`):
```
https://stream.zeno.fm/gzzqvbuy0d7uv
```

Statusen drivs av en Zustand-store (`useStreamStatus`) med fyra lägen:

| Status | Trigger | UI-indikator |
|--------|---------|--------------|
| `offline` | Default + när användaren stoppar | Grå "OFF AIR" |
| `connecting` | `audio` `waiting`-event eller play-anrop | Pulserande "ANSLUTER…" |
| `live` | `audio` `playing`-event lyckas | Glödande röd "ON AIR" |
| `error` | `audio` `error`-event eller fetch-fel | "Kunde inte ansluta" |

**Hur det fungerar tekniskt:**
1. Klick på "Spela" i `NowPlayingBar` skapar ett `<audio>`-element och sätter `src = STREAM_URL`.
2. Webbläsarens egna events (`playing`, `waiting`, `error`) mappas direkt till status-store:n.
3. Det finns **ingen separat health-check eller polling** — status reflekterar enbart vad ljud-elementet rapporterar i realtid. ZenoFM:s server styr om streamen är levande.
4. Tabben i bakgrunden? Streamen pausas av webbläsaren själv enligt autoplay-policyn — inget vi kontrollerar.

**Fallback-beteende:**
- **Stream nere:** `error`-event → status blir `error`, knappen blir spelbar igen så användaren kan försöka manuellt.
- **Mix spelar istället:** `usePlayerStore.mode` växlar mellan `"radio"` och `"mix"` — Mixcloud-iframe tar över när en mix väljs, radio stoppas automatiskt.
- **Footer-länk:** Om mini-spelaren strular kan användaren alltid öppna ZenoFM direkt via Footer → "ZenoFM" (extern länk till `zeno.fm/radio/dj-lobo-radio-o85p/`).

**Konfiguration i admin (`/admin` → Radio-fliken):**
- `radio_section_title` — Rubriken på `/lyssna`-sidan
- `radio_image_url` — Bilden bakom spelaren
- Stream-URL själv är **hårdkodad i koden** — för att byta stream måste `STREAM_URL` i `NowPlayingBar.tsx` uppdateras (medvetet beslut för att förhindra felkonfiguration).

---

### 💬 LiveChat (endast `/lyssna`)

Realtime-chat byggd på Supabase Realtime + Postgres-tabellen `chat_messages`.

**Beteende:**
- Anonyma sessioner — varje besökare får ett UUID i `localStorage` (`chat_session_id`). **Ingen IP-tracking.**
- **Realtime-prenumeration:** `supabase.channel('chat_messages').on('postgres_changes', ...)` — nya meddelanden pushas direkt till alla anslutna klienter utan polling.
- **Profanity-filter:** `lib/profanityFilter.ts` blockerar olämpliga ord innan submit.
- **Rate limiting (klient):** `RATE_LIMIT_MS = 3000` — max 1 meddelande per 3 sekunder per session, med live-countdown i UI:t.
- **Rate limiting (server):** Trigger `check_chat_rate_limit()` blockerar >5 meddelanden per 30s från samma `session_id`.
- **Ban-system:** Admin lägger till `session_id` i `chat_bans`-tabellen → RLS-policyn `Non-banned users can send messages` använder `is_session_banned()` för att blockera INSERT.
- **Auto-purge:** Gamla meddelanden rensas via pg_cron (GDPR-kompliant retention).

**Cooldown-flöde:**
```
Skickar meddelande → setLastMessageTime(now)
                   ↓
Försök skicka nytt inom 3s
                   ↓
cooldownRemaining = 3000 - elapsed
                   ↓
setInterval(100ms) → räknar ner i UI tills 0
                   ↓
Knappen aktiveras igen
```

---

### 📅 Kalender-polling (Spelningar)

Två hooks med olika cache-strategier:

| Hook | Cache-källa | TTL | Polling | Använd av |
|------|-------------|-----|---------|-----------|
| `useUpcomingEvents` | TanStack Query (in-memory) | `staleTime: 5 min` | Endast vid mount/focus | Hemsidan |
| `useCalendarEvents` | `localStorage` (persistent) | 5 min | Endast vid mount + manuell `refetch()` | Övriga vyer |

**Beteende `useCalendarEvents` (steg-för-steg):**

1. **Mount:** Försöker läsa `dj-lobo-calendar-events` från `localStorage`. Hit < 5 min → visa direkt utan loading-spinner.
2. **Hämta calendar-id:** Slår upp `site_branding.google_calendar_id` (single-row select).
3. **Saknas id?** → `isPlaceholder = true`, visar fallback-UI ("Inga kommande spelningar").
4. **Edge function:** Anropar `supabase.functions.invoke('google-calendar', { body: {} })` som i sin tur kallar Google Calendar API v3 med `GOOGLE_CALENDAR_API_KEY`.
5. **Bearbetning:**
   - Filtrerar bort historik (`date >= today` med midnatt-jämförelse)
   - Sorterar ascending
   - Tar max 10 events
   - Formaterar i `Europe/Stockholm`-timezone (svensk dagnamn + 24h klockslag)
6. **Cache:** Skriver tillbaka till `localStorage` med ny tidsstämpel.
7. **Felhantering:** Vid fetch-fel — om cache finns, behåll den tyst. Om ingen cache → `error = true` + placeholder-UI.

**Polling-strategi:** **Ingen automatisk polling** — events laddas vid sidladdning och stannar fresh i 5 minuter. För nya event innan TTL går ut: `refetch()` exponeras från hooken.

**Stale-closure-skydd:** `eventsRef` (useRef) speglar `events`-state så `useCallback`-dependency arrayen kan vara `[]` utan att tappa nuvarande cache-status i felhanteringen.

---



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

## 🔒 Säkerhet — Skyddade fält & RLS-ansvar

Vissa fält får **aldrig** vara publikt läsbara. Tabellen nedan visar var känslig data hanteras, vilken roll som kan läsa den och var motsvarande RLS-policy ligger.

| Fält | Tabell | Får läsas av | Hur det skyddas | Policy-referens |
|---|---|---|---|---|
| `google_calendar_id` (personlig Gmail) | `site_secrets` | Endast `admin` (auth) + edge function via `service_role` | Flyttat från publika `site_branding`. Hämtas serverside i edge function. | [`Admins can read secrets`](#site_secrets-rls) |
| `session_id` (chat) | `chat_messages` | Aldrig exponeras klient-sidan | Klienten läser via vyn `chat_messages_public` (utan `session_id`). Bas­tabellen används bara av admin/server. | [`chat_messages_public` view](#chat-rls) |
| `email`, `phone`, `message` (bokningar) | `bookings` | Endast `admin` | Anon kan endast `INSERT`. `SELECT/UPDATE/DELETE` kräver `has_role(auth.uid(), 'admin')`. | [`Admins can view bookings`](#bookings-rls) |
| `email` (kontakt­inlämning) | `contact_submissions` | Endast `admin` | Anon kan endast `INSERT`. | [`Admins can view contact submissions`](#contact-rls) |
| `instagram_access_token` | `site_secrets` | Endast `admin` | Hela tabellen är admin-skyddad. | [`Admins can read secrets`](#site_secrets-rls) |
| `role` (rolltilldelning) | `user_roles` | Användaren själv (egen rad) + `admin` | `INSERT/UPDATE/DELETE` kräver `has_role(auth.uid(), 'admin')` via `Admins can manage roles`. Förhindrar privilegie­eskalering. | [`Admins can manage roles`](#user_roles-rls) |

### Ansvariga roller
- **`anon`** — får endast skicka in formulär (`bookings`, `contact_submissions`, `chat_messages`) och läsa publikt innehåll (`site_branding` utan kalender-ID, `equipment`, `gallery_images`, `mixcloud_mixes`, aktiva `promos`).
- **`authenticated` + `admin`** — full CRUD på allt admin-relaterat. Verifieras via `has_role(_user_id, _role)` (SECURITY DEFINER).
- **`service_role`** (edge functions) — kringgår RLS. Används i `google-calendar` för att läsa `site_secrets.google_calendar_id` utan att exponera det i klienten.

### RLS-policies (referens)
<a id="site_secrets-rls"></a>**`site_secrets`** — alla operationer kräver `has_role(auth.uid(), 'admin')`.
<a id="chat-rls"></a>**`chat_messages`** — `Anyone can read messages` returnerar `session_id` i bas­tabellen, så klienten ska alltid använda vyn `chat_messages_public` som utelämnar fältet. `INSERT` kräver att sessionen inte är bannad (`is_session_banned()`).
<a id="bookings-rls"></a>**`bookings`** — `Anyone can submit bookings` (INSERT, anon). `SELECT/UPDATE/DELETE` endast admin.
<a id="contact-rls"></a>**`contact_submissions`** — `Anyone can insert` (anon). `SELECT` endast admin. Inga `UPDATE/DELETE`-policies = oföränderlig logg.
<a id="user_roles-rls"></a>**`user_roles`** — `Users can view their own roles` (egen rad). `Admins can manage roles` (ALL) kräver admin för `INSERT/UPDATE/DELETE`.

> ⚠️ **Tumregel:** Om ett fält innehåller PII, en personlig identifierare eller en hemlighet — placera det i `site_secrets` eller en admin-skyddad tabell, och hämta det server-sidan via edge function.

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
