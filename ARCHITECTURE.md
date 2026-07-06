# DJ Lobo Producciones — Architecture

## 1. Overview

| | |
|---|---|
| **Project** | DJ Lobo Producciones |
| **Live URL** | https://djloboproducciones.com |
| **Built by** | [Coffee Code Studio](https://coffeecodestudio.se) |
| **Purpose** | Professional DJ website with admin panel, live radio stream, booking system, media gallery, live chat, and promo system |
| **Hosting** | Lovable Cloud (auto-deploy from main) |
| **Backend** | Supabase (project ref `gzdnxaseaimdobahilyc`) |

Built as part of the Coffee Code Studio **Digital Upgrade** package.

---

## 2. Tech Stack

| Package | Version | Purpose |
|---|---|---|
| react / react-dom | 18.3.1 | UI runtime |
| react-router-dom | 7.12.0 | Client-side routing |
| typescript | 5.8.3 | Type system |
| vite | 5.4.19 | Build tool / dev server |
| @vitejs/plugin-react-swc | 3.11.0 | React + SWC compiler |
| tailwindcss | 3.4.17 | Utility CSS |
| @tailwindcss/typography | 0.5.16 | Prose styles |
| tailwindcss-animate | 1.0.7 | Animation utilities |
| framer-motion | 12.38.0 | Animations |
| @radix-ui/* (~30 pkgs) | latest | Headless UI primitives |
| lucide-react | 0.462.0 | Icon set |
| class-variance-authority | 0.7.1 | Variant styling |
| @tanstack/react-query | 5.83.0 | Server state / caching |
| zustand | 5.0.9 | Client state (player) |
| @supabase/supabase-js | 2.90.1 | Backend SDK |
| react-hook-form | 7.61.1 | Forms |
| @hookform/resolvers | 3.10.0 | Form schema bridge |
| zod | 3.25.76 | Schema validation |
| react-helmet-async | 3.0.0 | `<head>` management / SEO |
| date-fns | 3.6.0 | Date utilities |
| sonner | 1.7.4 | Toasts |
| embla-carousel-react | 8.6.0 | Carousels |
| react-easy-crop | 5.5.6 | Admin image cropper |
| canvas-confetti | 1.9.4 | Booking confirmation FX |
| recharts | 2.15.0 | Admin charts |
| cmdk | 1.1.1 | Command palette |
| vitest | 3.2.4 | Unit tests |
| @testing-library/react | 16.0.0 | Component tests |
| eslint | 9.32.0 | Linting |

---

## 3. Project Structure

```
src/
├── App.tsx                  Router, providers, lang guard
├── main.tsx                 Entry
├── index.css                Design tokens + globals
├── components/
│   ├── admin/               Admin-only tab panels (9 tabs + helpers)
│   ├── ui/                  shadcn/ui primitives
│   ├── Layout.tsx           Persistent layout (Navbar + Footer + Outlet)
│   ├── Navbar.tsx           Public nav with language switcher
│   ├── Footer.tsx           Public footer + designer credit
│   ├── HeroSection.tsx      Home hero w/ localized H1
│   ├── AboutSection.tsx     Bio (db-sourced sv/en/es)
│   ├── CalendarSection.tsx  Show schedule (Google Calendar)
│   ├── EquipmentSection.tsx Gear list
│   ├── MixesSection.tsx     Mixcloud cards
│   ├── TestimonialsSection.tsx
│   ├── GallerySection.tsx   Photo + YouTube grid
│   ├── LiveChat.tsx         /lyssna chat
│   ├── NowPlayingBar.tsx    Dual-mode radio/mix player
│   ├── GlobalMiniPlayer.tsx Bottom mini player (h-16)
│   ├── PromoModal.tsx       Promo popup
│   ├── PromoMiniCard.tsx    Mini promo card
│   ├── ErrorBoundary.tsx
│   ├── WhiteScreenGuard.tsx Soft-reset on render fail
│   └── WhiteScreenDebugOverlay.tsx
├── contexts/
│   ├── LanguageContext.tsx  sv / en / es
│   └── CookieConsentContext.tsx
├── hooks/                   useBranding, useMixes, useGallery, useSchedule, useBio, useEquipment, usePromos, useTestimonials, useAuth, etc.
├── stores/
│   └── usePlayerStore.ts    Zustand (radio + mix mode)
├── lib/
│   ├── i18nRoutes.ts        Lang detection + legacy redirects
│   ├── promoAnalytics.ts    promo_events writer
│   ├── logger.ts            console wrapper
│   └── utils.ts             cn(), formatters
├── integrations/supabase/   Auto-generated client + types
└── pages/                   Route components (12)
```

```
supabase/
├── functions/               Edge functions (6)
├── migrations/              SQL history
└── config.toml              Function config
```

---

## 4. Routing

All public routes are localized under `/:lang/*`. `LangGuard` validates the segment and `LegacyRedirect` rewrites unprefixed paths into the user's preferred language.

| Path | Component | Purpose | Auth |
|---|---|---|---|
| `/:lang` | `Index` | Home (hero, about, equipment, mixes, gallery, testimonials) | No |
| `/:lang/lyssna` | `ListenPage` | Live radio + chat | No |
| `/:lang/mixar` | `MixesPage` | Mixcloud / SoundCloud library | No |
| `/:lang/media` | `MediaPage` | Photo + YouTube gallery | No |
| `/:lang/referenser` | `ReferencesPage` | Testimonials | No |
| `/:lang/prislista` | `PrislistaPage` | Pricing + booking form | No |
| `/:lang/privacy` | `PrivacyPolicy` | GDPR policy | No |
| `/:lang/terms` | `TermsOfService` | ToS | No |
| `/:lang/*` | `NotFound` | 404 | No |
| `/admin` | `Admin` | Admin panel (unlocalized, Swedish-only) | **Yes (admin role)** |
| `/reset-password` | `ResetPassword` | Auth recovery | No |
| `/blog/hyra-dj-brollop-goteborg` | `BlogHyraDjBrollopGoteborg` | SEO landing (sv only, `noindex` for now) | No |

---

## 5. Database

All tables in the `public` schema. RLS enabled on every table.

| Table | Purpose | RLS | Notes |
|---|---|---|---|
| `bookings` | Submitted booking requests from `/prislista` | ✅ | Insert open to anon; admin reads |
| `chat_bans` | Banned chat sessions (UUID-based, no IP) | ✅ | Admin manage; `is_session_banned()` helper |
| `chat_messages` | `/lyssna` live chat | ✅ | `session_id` column-level REVOKE from anon/authenticated; public read via `chat_messages_public` view |
| `contact_submissions` | Quick contact / lead capture | ✅ | Insert open; admin reads |
| `equipment` | Gear list (i18n columns sv/en/es) | ✅ | Public read; admin writes |
| `gallery_images` | Photo + YouTube grid items | ✅ | Public read; admin writes |
| `mixcloud_mixes` | Mix metadata (auto-synced + manual) | ✅ | Public read of non-hidden; admin writes |
| `promo_events` | Promo popup analytics | ✅ | Insert restricted: validated `event_type`, existing `promo_id`, and `session_id` must be NULL or 8–64 char `[A-Za-z0-9_-]+` |
| `promos` | Promo / announcement records | ✅ | Public read of active; admin writes |
| `site_branding` | Logo, colors, bio, copy, social links | ✅ | Public read; admin writes |
| `site_secrets` | Google Calendar ID and similar | ✅ | Admin-only; edge functions use service_role |
| `user_roles` | RBAC (`admin`, `moderator`, `user`) | ✅ | Authenticated select; service_role manages; never on profile table |

**Storage:** Single `branding` bucket (public read). See §7.

---

## 6. Edge Functions

| Function | Trigger | Purpose | Auth |
|---|---|---|---|
| `fetch-mixcloud` | Cron (daily) + admin manual | Pulls latest mixes from Mixcloud API → `mixcloud_mixes` | Service role internal |
| `google-calendar` | Client (CalendarSection) | Proxies upcoming events from Google Calendar API; 5-min in-memory cache to blunt quota abuse | Open (cached) |
| `send-booking-notification` | Client (PrislistaPage submit) | Resend → `djloboproducciones75@gmail.com` | Open (rate-limited) |
| `send-contact-email` | Client (contact form) | Resend → `djloboproducciones75@gmail.com` | Open (rate-limited) |
| `list-admin-users` | Admin UsersTab | Lists admins via service_role | **Admin JWT required** |
| `check-cron-jobs` | Admin diagnostic | Reads `cron.job` via `get_cron_jobs()` | **Admin JWT required** |

---

## 7. Storage

| Bucket | Visibility | Contents | Upload policy |
|---|---|---|---|
| `branding` | Public read | Logo, hero image, gallery photos, promo flyers | Admin-only insert/update/delete via RLS on `storage.objects` |

---

## 8. Authentication & RBAC

- **Provider:** Supabase Auth (email/password). No anonymous sign-ups.
- **Client:** `src/integrations/supabase/client.ts` (auto-generated, do not edit).
- **Session storage:** `localStorage`, auto-refresh on.
- **Roles:** stored in dedicated `user_roles` table with enum `app_role` = `admin | moderator | user`. **Never** stored on a profile table (prevents privilege escalation).
- **Role check:** `public.has_role(_user_id uuid, _role app_role)` — `SECURITY DEFINER`, `SET search_path = public`. Used in RLS policies to avoid recursive checks.
- **Admin gate:** `/admin` route mounts `Admin.tsx`, which checks `has_role(auth.uid(), 'admin')` before rendering tabs. UI is Swedish-only.

### Open security items

| # | Item | Status |
|---|---|---|
| 1 | **HIBP** (HaveIBeenPwned) password compromise check | ❌ Not enabled in Supabase Auth |
| 2 | **MFA** for admin accounts | ❌ Not enforced |
| 3 | **Edge function JWT guards** on `send-booking-notification` and `send-contact-email` | ⚠️ Open endpoints (rate-limited only) |
| 4 | **Storage `branding` bucket** allows listing all files | ⚠️ Public bucket linter warning |
| 5 | `chat_messages.session_id` | ✅ Locked down via column-level REVOKE |

---

## 9. State Management

### Zustand — `usePlayerStore`
- **Modes:** `radio` (ZenoFM HTML5 audio) and `mix` (Mixcloud/SoundCloud iframe embed).
- **State:** `mode`, `isPlaying`, `currentMix`, `volume`, `setMode()`, `playMix()`, `stop()`.
- Drives both `NowPlayingBar` (full controls) and `GlobalMiniPlayer` (bottom h-16 strip).

### React Query
| Query | Stale time |
|---|---|
| `useBranding` | 5 min |
| `useBio` | 5 min |
| `useEquipment` | 5 min |
| `useMixes` | 2 min |
| `useGallery` | 5 min |
| `useTestimonials` | 5 min |
| `usePromos` | 1 min |
| `useSchedule` (Google Calendar) | 5 min + 800ms minimum loading animation |

### Contexts
- `LanguageContext` — `sv` (default) / `en` / `es`, persisted in `localStorage` key `dj-lobo-language`.
- `CookieConsentContext` — gates all third-party embeds (Mixcloud, SoundCloud, YouTube, ZenoFM).

---

## 10. Multilanguage (i18n)

- **Route structure:** `/:lang/*` with `LangGuard`. Invalid lang segments redirect to preferred language.
- **Supported:** Swedish (default), English, Spanish.
- **Detection order:** localStorage → `navigator.languages` → `sv`.
- **Helpers:** `LanguageContext`, `useLocalizedTo()` hook, `localizedHref()`.
- **Route slugs are Swedish for all languages** (`/en/mixar`, `/es/referenser`). Known SEO trade-off — accepted for URL stability.
- **Content sourcing:** DB-backed (bio, equipment, mixes, gallery, promos) uses `*_sv`, `*_en`, `*_es` columns. Static UI strings live in component `translations` objects.
- **Admin UI:** Swedish-only.

---

## 11. Media & Player Architecture

### NowPlayingBar (dual mode)
- **Radio mode:** `<audio>` element streaming `https://stream.zeno.fm/gzzqvbuy0d7uv` (ZenoFM). Volume + play/pause.
- **Mix mode:** Mixcloud or SoundCloud iframe embed (autoplay hack via reload-with-`autoplay=1` query). Track metadata from `mixcloud_mixes`.

### GlobalMiniPlayer
- Persistent `h-16` bar at viewport bottom on all public routes.
- Enforced by global `pb-36` (144px) padding on main containers.
- Excluded from `/admin`, `/reset-password`, and `/blog/*`.

### Cookie consent gate
- All Mixcloud / SoundCloud / YouTube / ZenoFM embeds blocked until user accepts cookies.
- Placeholder shows brand-styled accept prompt.

### Mixcloud auto-sync
- `fetch-mixcloud` edge function runs on cron + admin "Sync now" button.
- Writes new mixes into `mixcloud_mixes` (source = `mixcloud`), preserves admin overrides (`pinned`, `hidden`, custom cover).

---

## 12. Admin Panel

Mounted at `/admin`. Dark navy/charcoal theme (no neon). All tabs are Swedish-only.

| Tab key | Component | Manages |
|---|---|---|
| `framsida` | `FramsidaTab` | Hero copy, bio, equipment cards (front page sections) |
| `media` | `GalleryTab` | Photo + YouTube gallery items |
| `reklam` | `PromosTab` (+ `PromoEditor`) | Promo / announcement records, scheduling, sort strategy |
| `radio` | `RadioTab` | ZenoFM stream URL, chat moderation, ban list |
| `omdomen` | `TestimonialsTab` | Testimonials |
| `spelningar` | `SpelningarTab` | Upcoming shows (Google Calendar integration) |
| `utseende` | `BrandingTab` | Logo, colors, social links, OG image |
| `hjalp` | `HelpTab` | Built-in admin guide (link to Coffee Code Studio for help) |
| `anvandare` | `UsersTab` | Admin user management (via `list-admin-users` edge function) |

Helper components (not tabs): `BioTab`, `EquipmentTab`, `MixcloudTab`, `MixesTab` (composed inside `FramsidaTab` / `SpelningarTab`), `ImageCropper`, `PromoEditor`.

---

## 13. Known Issues & Backlog

| # | Severity | Area | Finding | File / location |
|---|---|---|---|---|
| 1 | 🟠 Security | Auth | HIBP password compromise check not enabled | Supabase Auth settings |
| 2 | 🟠 Security | Auth | MFA not enforced for admin accounts | Supabase Auth settings |
| 3 | 🟠 Security | Edge fn | `send-booking-notification` lacks JWT/origin guard | `supabase/functions/send-booking-notification/index.ts` |
| 4 | 🟠 Security | Edge fn | `send-contact-email` lacks JWT/origin guard | `supabase/functions/send-contact-email/index.ts` |
| 5 | 🟠 Security | Storage | `branding` bucket allows listing all files | Storage policy on `storage.objects` |
| 6 | 🟡 Code quality | SEO | `/blog/hyra-dj-brollop-goteborg` is `noindex` (intentional until launch) | `src/pages/BlogHyraDjBrollopGoteborg.tsx` |
| 7 | 🟡 Code quality | i18n | Route slugs are Swedish for all languages | `src/lib/i18nRoutes.ts` |
| 8 | 🟡 Code quality | A11y | Several decorative icons missing `aria-hidden` | Various sections |
| 9 | 🟡 Code quality | Perf | Hero image not preloaded (`<link rel="preload">`) | `index.html` |
| 10 | 🟡 Code quality | Perf | Some `useEffect` deps could be memoized to reduce re-renders | `NowPlayingBar.tsx`, `CalendarSection.tsx` |
| 11 | ⚪ Minor | SEO | No GSC verification meta tag committed | `index.html` |
| 12 | ⚪ Minor | SEO | No blog index page; single article only | `src/pages/` |
| 13 | ⚪ Minor | Tests | No e2e tests; unit coverage minimal | `src/**/*.test.tsx` |
| 14 | ⚪ Minor | DX | `lovable-tagger` only active in dev (expected) | `vite.config.ts` |
| 15 | 🟢 Works | RLS | `chat_messages.session_id` column-level REVOKE verified | `supabase/migrations/` |

---

## 14. Environment Variables

### Client (Vite, prefixed `VITE_`, public)
| Variable | Scope | Purpose | Secret |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Client | Supabase project URL | No |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Client | Anon key for client SDK | No (publishable) |
| `VITE_SUPABASE_PROJECT_ID` | Client | Project ref (used to construct edge fn URLs) | No |

### Edge function secrets (server-only)
| Variable | Scope | Purpose | Secret |
|---|---|---|---|
| `SUPABASE_URL` | Edge fn | Auto-injected | No |
| `SUPABASE_ANON_KEY` | Edge fn | Auto-injected | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge fn | Bypass RLS for admin ops | **Yes** |
| `SUPABASE_DB_URL` | Edge fn | Direct DB connection | **Yes** |
| `SUPABASE_JWKS` | Edge fn | JWT verification | **Yes** |
| `SUPABASE_PUBLISHABLE_KEYS` | Edge fn | Auto-injected | No |
| `SUPABASE_SECRET_KEYS` | Edge fn | Auto-injected | **Yes** |
| `LOVABLE_API_KEY` | Edge fn | Lovable AI Gateway | **Yes** |
| `GOOGLE_CALENDAR_API_KEY` | Edge fn | Google Calendar API access | **Yes** |
| `RESEND_API_KEY` | Edge fn | Transactional email (Resend) | **Yes** |

No hardcoded secrets in the codebase.

---

## 15. Deployment

- **Platform:** Lovable Cloud — auto-deploys on every save.
- **Domain:** `djloboproducciones.com` via Strato DNS → Lovable.
- **Supabase project ref:** `gzdnxaseaimdobahilyc`.
- **GitHub repo:** `CoffeeCodeStudio/djloboproducciones` (confirm exact name in Lovable Project Settings → GitHub).
- **Build:** `vite build` (sitemap auto-generated by `scripts/generate-sitemap.ts` via `prebuild`).
- **No manual build step required** — push to main / save in Lovable → deploy.

---

**Built by [Coffee Code Studio](https://coffeecodestudio.se)** — Digital Upgrade package.
