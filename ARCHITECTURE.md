# Architecture — DJ Lobo Producciones

## 1. Overview

- **Project**: DJ Lobo Producciones / DJ Lobo Radio
- **Purpose**: Marketing site, live radio stream, mix library, media gallery, booking portal and chat for Gothenburg-based DJ Lobo.
- **Live URL**: https://djloboproducciones.com (also `www.djloboproducciones.com`, fallback `lobo-radio-glow.lovable.app`)
- **Built by**: [Coffee Code Studio](https://coffeecodestudio.se) for DJ Lobo Producciones.

**Tech summary** — A React 18 + Vite + TypeScript single-page app styled with Tailwind v3 and shadcn/ui, deployed via Lovable hosting. Backend is Supabase (Lovable Cloud): Postgres with strict RLS, six Deno edge functions, Storage, and Auth with role-based access. Radio playback is a ZenoFM HLS stream; on-demand sets embed Mixcloud.

---

## 2. Tech Stack

| Package | Version | Purpose |
|---|---|---|
| react / react-dom | 18.3.1 | UI runtime |
| typescript | 5.8.3 | Type system |
| vite | 5.4.19 | Dev server + bundler |
| @vitejs/plugin-react-swc | 3.11.0 | React/SWC compiler |
| tailwindcss | 3.4.17 | Utility CSS |
| tailwindcss-animate | 1.0.7 | Animation utilities |
| @tailwindcss/typography | 0.5.16 | Prose styling |
| @radix-ui/* | various 1.x / 2.x | shadcn primitives |
| lucide-react | 0.462.0 | Icon set |
| framer-motion | 12.38.0 | Motion / transitions |
| canvas-confetti | 1.9.4 | Celebrations |
| react-router-dom | 7.12.0 | Client routing |
| @tanstack/react-query | 5.83.0 | Server state cache |
| zustand | 5.0.9 | Player state store |
| react-hook-form | 7.61.1 | Forms |
| @hookform/resolvers | 3.10.0 | Zod resolver bridge |
| zod | 3.25.76 | Schema validation |
| react-helmet-async | 3.0.0 | Per-route head meta |
| react-day-picker | 8.10.1 | Calendar picker |
| date-fns | 3.6.0 | Date formatting |
| embla-carousel-react | 8.6.0 | Carousels |
| recharts | 2.15.0 | Admin charts |
| sonner | 1.7.4 | Toasts |
| cmdk | 1.1.1 | Command palette |
| vaul | 0.9.9 | Drawer primitive |
| react-easy-crop | 5.5.6 | Image cropping (admin) |
| input-otp | 1.4.2 | OTP inputs |
| @supabase/supabase-js | 2.90.1 | Backend SDK |
| next-themes | 0.3.0 | Theme management |
| vitest | 3.2.4 | Unit tests |
| @testing-library/react | 16.0.0 | Component tests |
| jsdom | 20.0.3 | Test DOM |
| terser | 5.46.0 | Minifier |
| eslint | 9.32.0 | Linting |

---

## 3. Project Structure

```
src/
├── App.tsx                 Routes + providers (QueryClient, Tooltip, Toasters, Layout)
├── main.tsx                React root + HelmetProvider mount
├── index.css               Design tokens (HSL), neon utilities, glass-card
├── assets/                 Local pre-optimized images (WebP)
├── components/             Top-level UI sections + shell
│   ├── Layout.tsx          Persistent wrapper for /:lang routes
│   ├── Navbar.tsx          Site nav + language switcher
│   ├── Footer.tsx          Footer + Coffee Code Studio credit
│   ├── NeonWordmark.tsx    CSS-rendered brand wordmark
│   ├── HeroSection.tsx     Home hero
│   ├── NowPlayingBar.tsx   In-page player (radio + Mixcloud iframe)
│   ├── GlobalMiniPlayer.tsx Sticky bottom mini-player
│   ├── LiveChat.tsx        /lyssna chat (Realtime)
│   ├── PromoManager.tsx    Popup + mini-card promos
│   ├── Seo.tsx             Per-route Helmet + hreflang
│   ├── admin/              Admin tab components
│   ├── ui/                 shadcn primitives
│   └── dev/                Dev-only overlays
├── contexts/
│   ├── LanguageContext.tsx     sv / en / es runtime language
│   └── CookieConsentContext.tsx GDPR consent state
├── hooks/                  Data + UI hooks (Supabase fetchers, scroll reveal, presence…)
├── stores/
│   └── usePlayerStore.ts   Zustand store for active media source
├── pages/                  Route components (see §4)
├── lib/                    i18nRoutes, seoMeta, imageOptimizer, utils
├── integrations/supabase/  Auto-generated client + types (do NOT edit)
└── components/__tests__/   Vitest test suites

supabase/
├── functions/              Deno edge functions (see §6)
└── migrations/             SQL migrations
scripts/
└── generate-sitemap.ts     Pre-build sitemap writer
public/                     Static assets, robots.txt, sitemap.xml
```

---

## 4. Routing

All public app routes are language-prefixed (`/:lang/*`). Standalone routes live outside `LangGuard`.

| Path | Component | Purpose | Auth |
|---|---|---|---|
| `/admin` | `Admin` | Admin dashboard | yes (admin role) |
| `/reset-password` | `ResetPassword` | Supabase password recovery | token-based |
| `/blog/hyra-dj-brollop-goteborg` | `BlogHyraDjBrollopGoteborg` | SEO landing (sv, noindex) | no |
| `/:lang` | `Index` | Home (hero, schedule, mixes, gallery, booking) | no |
| `/:lang/lyssna` | `ListenPage` | Live radio + chat | no |
| `/:lang/mixar` | `MixesPage` | Mixcloud library grid | no |
| `/:lang/media` | `MediaPage` | Photo / video gallery | no |
| `/:lang/referenser` | `ReferencesPage` | Testimonials | no |
| `/:lang/prislista` | `PrislistaPage` | Pricing + booking form | no |
| `/:lang/privacy` | `PrivacyPolicy` | GDPR / privacy policy | no |
| `/:lang/terms` | `TermsOfService` | Terms of service | no |
| `/:lang/*` | `NotFound` | 404 inside localized tree | no |
| `/*` | `LegacyRedirect` | Bookmarks → preferred language | no |

`LangGuard` validates `:lang ∈ {sv, en, es}` and redirects when invalid. `Layout` wraps localized pages and renders `Navbar`, `Outlet`, `NowPlayingBar`, `FloatingChatButton` (on `/lyssna`), `PromoManager`, `CookieConsent`.

---

## 5. Database (Supabase)

All tables live in `public`. RLS is enabled on every table and column-level `GRANT`s are issued per migration policy.

| Table | Purpose | RLS | Notes |
|---|---|---|---|
| `bookings` | Booking-form submissions | yes | Insert by anon; read by admin only. |
| `chat_bans` | Banned chat sessions | yes | Checked by `is_session_banned()` SECURITY DEFINER. |
| `chat_messages` | /lyssna live chat | yes | 🟠 `session_id` column REVOKE'd from anon/authenticated; Realtime publication scoped to `(id, nickname, message, created_at)`. Rate-limited via trigger (5 msg / 30 s). |
| `contact_submissions` | Contact form payloads | yes | Insert by anon; read by admin. |
| `equipment` | Equipment inventory shown on site | yes | Public read; admin write. |
| `gallery_images` | Media gallery (photos + videos) | yes | Public read; admin write. Includes `media_type`, `video_url`, `sort_order`. |
| `mixcloud_mixes` | Synced Mixcloud library | yes | Populated by `fetch-mixcloud` edge function. Public read; service-role write. |
| `promos` | Promo banners (popup + mini-card) | yes | Public read of active rows; admin write. |
| `promo_events` | Promo analytics events | yes | 🟠 INSERT validated by `validate_promo_event_type()` trigger, but `session_id` is still client-supplied — spoofable. |
| `site_branding` | Editable copy + branding | yes | Public read; admin write. `updated_at` trigger. |
| `site_secrets` | App configuration (calendar id, etc.) | yes | Admin-only read/write. Edge functions use service role. |
| `user_roles` | RBAC mapping (`user_id` → `app_role`) | yes | Read for own user only; admin manages. Never stored on profiles. |

**SECURITY DEFINER functions**: `has_role`, `is_session_banned`, `check_chat_rate_limit`, `get_cron_jobs`, `validate_promo_event_type`, `validate_promo_sort_strategy`, `update_updated_at_column`, `update_site_branding_updated_at` — all pinned to `set search_path = public`.

---

## 6. Edge Functions

| Function | Trigger | Purpose | Auth |
|---|---|---|---|
| `fetch-mixcloud` | Cron + manual admin button | Pulls Mixcloud feed, upserts into `mixcloud_mixes`. | service role |
| `google-calendar` | Client (CalendarSection) | Returns upcoming events for /schedule. | 🟠 currently unauthenticated; cached, but quota-abusable |
| `send-contact-email` | Contact form POST | Sends contact mail via Resend. | none (validates payload) |
| `send-booking-notification` | Booking form POST | Emails admin + acknowledgement to client. | none (validates payload) |
| `list-admin-users` | Admin UI | Lists users with admin role. | admin (verifies `has_role`) |
| `check-cron-jobs` | Admin UI | Reads `cron.job` via `get_cron_jobs()`. | admin |

All functions read `SUPABASE_*` env vars provided by Lovable Cloud and `RESEND_API_KEY` / `GOOGLE_CALENDAR_API_KEY` from secrets.

---

## 7. Storage

| Bucket | Visibility | Stores | Upload policy |
|---|---|---|---|
| `branding` | public | Hero image, logos, OG image, optimized assets | Admin only (Storage RLS). Public `SELECT`. |

No other buckets — gallery items reference external URLs (Instagram, YouTube, direct CDN links) stored in `gallery_images`.

---

## 8. Authentication & RBAC

- Provider: **Supabase Auth** (email + password). No anonymous sign-ups; no auto-confirm email.
- Sign-in surface: `AdminLogin` mounted by `/admin` when no session.
- Password recovery: `/reset-password` consumes a Supabase recovery token.
- Session bootstrap: `useAuth` hook subscribes to `onAuthStateChange`.

**Role model** — enum `app_role` = `admin | moderator | user`. Roles live in `public.user_roles`, never on a profile/user row. Checks go through `public.has_role(uid, role)` SECURITY DEFINER, which is used in RLS policies across every admin-managed table.

**Open security items**
- 🟠 Leaked-password protection (HIBP) — verify enabled in Cloud → Users → Auth Settings.
- 🟠 No MFA enrolled for admin role.
- 🟠 `google-calendar` edge function lacks any auth or shared-secret check (Public Proxy Abuse).
- 🟠 `promo_events.session_id` is still client-controllable (analytics integrity, not data leak).
- 🟢 `chat_messages.session_id` column SELECT is REVOKE'd from anon/authenticated; Realtime publication scoped.

---

## 9. State Management

| Layer | Tool | Scope |
|---|---|---|
| Player state | **Zustand** `usePlayerStore` | Currently active media (`radio` / `mix`), play state, source URL, title, mini-player visibility. |
| Server state | **@tanstack/react-query** | All Supabase queries (`useBranding`, `useGallery`, `useCalendarEvents`, `useUpcomingEvents`, `usePromosAdmin`, `useStreamStatus`, etc.). Default `QueryClient` — consider raising `staleTime` for branding/calendar/mixes. |
| Language | **LanguageContext** | `sv | en | es`, persists to `localStorage` key `dj-lobo-language`. |
| Cookie consent | **CookieConsentContext** | GDPR consent state and category toggles. |
| Forms | **react-hook-form + zod** | Booking, contact, admin editors. |

---

## 10. Multilanguage

- Supported: **sv (default)**, **en**, **es**. Admin panel is Swedish-only by design.
- Detection order in `App.tsx`: localStorage → `navigator.languages` → `DEFAULT_LANG`.
- Route shape: every app route is `/:lang/...`; `LangGuard` validates and `LegacyRedirect` rewrites unprefixed bookmarks.
- `useLocalizedTo()` builds language-aware hrefs for `<Link>` components.
- `Seo` component emits per-route `<title>`, `<meta description>`, canonical, `og:*`, and `hreflang` alternates (`sv-SE`, `en-US`, `es-ES`, `x-default`).
- Route slugs are Swedish (`/mixar`, `/referenser`, `/prislista`) for all locales — accepted SEO trade-off; canonicals are stable per language.
- Per-page H1s and section translations live in component-local `translations` objects keyed by language.

---

## 11. Media & Player

### Dual player architecture

| Player | Component | Role |
|---|---|---|
| In-page player | `NowPlayingBar` | Mounted on `/lyssna` and similar pages; renders the radio HLS player **or** an inline Mixcloud iframe for a specific mix when selected. |
| Sticky mini-player | `GlobalMiniPlayer` | Persistent 64px bar fixed to viewport bottom across routes; controlled by `usePlayerStore`. Page padding is enforced as `pb-36` to prevent overlap. |

Both players consume `usePlayerStore` so selecting a mix anywhere (e.g. `MixCardGrid`) updates the active source globally.

### ZenoFM radio stream
- Stream metadata (URL, station mount, cover) lives in `site_branding`.
- `useStreamStatus` polls the ZenoFM status endpoint for now-playing title and listener count.
- Audio element is HLS-compatible; on iOS the player requires a user gesture before `audio.play()` resolves.

### Mixcloud / SoundCloud flow
- `fetch-mixcloud` edge function pulls the configured Mixcloud username's feed into `mixcloud_mixes`.
- `MixCardGrid` / `MixesPage` render cards; clicking a card sets `usePlayerStore` state and the chosen mix renders as a Mixcloud iframe (`https://www.mixcloud.com/widget/iframe/...`) inside `NowPlayingBar` / `MixcloudModal`.
- Autoplay workaround: iframe `src` includes `&autoplay=1` and is appended only after a user click to satisfy browser autoplay policies (per project memory).

---

## 12. Known Issues & Backlog

| # | Severity | Area | Finding | Reference |
|---|---|---|---|---|
| 1 | 🟢 Resolved | DB | `chat_messages.session_id` REVOKE'd from anon/authenticated; Realtime scoped | migration `20260607133553_*.sql` |
| 2 | 🟠 Security | DB | `promo_events.session_id` spoofable on INSERT (analytics integrity) | `promo_events` policy |
| 3 | 🟠 Security | Edge fn | `google-calendar` unauthenticated public proxy; quota abuse risk | `supabase/functions/google-calendar` |
| 4 | 🟠 Security | Auth | HIBP leaked-password check status unverified | Cloud → Users → Auth Settings |
| 5 | 🟠 Security | Auth | No MFA enrolled for admin role | `useAuth`, `AdminLogin` |
| 6 | 🟠 Security | Edge fn | Verify `has_role` guard on `list-admin-users`, `check-cron-jobs` | `supabase/functions/*` |
| 7 | 🟡 Bug | Deps | Test / build deps (`vitest`, `@testing-library/*`, `jsdom`, `terser`) listed under `dependencies` | `package.json` |
| 8 | 🟡 Perf | Admin | Verify lazy-loading of admin tabs in `pages/Admin.tsx` | `pages/Admin.tsx` |
| 9 | 🟡 Perf | Data | React Query default `staleTime: 0` over-fetches branding/calendar/mixes | `App.tsx` |
| 10 | 🟡 A11y | UI | Mixcloud iframe `title` attribute; neon contrast review on small body text | `MixcloudModal`, design tokens |
| 11 | 🟡 SEO | Meta | JSON-LD `LocalBusiness` / `MusicGroup` schema missing site-wide | `components/Seo.tsx`, `index.html` |
| 12 | ⚪ Minor | Code | Candidate dead code: `useDynamicFavicon`, `EmbedBlockedNotice`, `LazyYouTube` | `src/components`, `src/hooks` |
| 13 | ⚪ Minor | Deps | Vite 6, Sonner 2, date-fns 4, react-day-picker 9 available | `package.json` |
| 14 | ⚪ Minor | UX | iOS safe-area + keyboard overlap risk on chat / mini-player | `GlobalMiniPlayer`, `LiveChat` |
| 15 | ⚪ Minor | Config | Add `.env.example`; ensure no hardcoded Mixcloud/Calendar IDs | repo root |

---

## 13. Environment Variables

### Client (Vite — `.env`, auto-managed)

| Variable | Scope | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | client-safe | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | client-safe | Supabase anon publishable key |
| `VITE_SUPABASE_PROJECT_ID` | client-safe | Project ref |

### Server (Edge Function secrets)

| Secret | Scope | Purpose |
|---|---|---|
| `SUPABASE_URL` | server-only | Backend Supabase URL |
| `SUPABASE_ANON_KEY` | server-only | For user-context queries from functions |
| `SUPABASE_SERVICE_ROLE_KEY` | server-only | Privileged DB access in trusted functions |
| `SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_PUBLISHABLE_KEYS` | server-only | JWT verification keys |
| `SUPABASE_SECRET_KEYS` / `SUPABASE_JWKS` | server-only | Auth signing material |
| `SUPABASE_DB_URL` | server-only | Direct Postgres connection |
| `LOVABLE_API_KEY` | server-only | Lovable AI Gateway access |
| `RESEND_API_KEY` | server-only | Transactional email |
| `GOOGLE_CALENDAR_API_KEY` | server-only | Google Calendar read API |

No secrets are hardcoded in client code. Recipient/sender addresses (`noreply@djloboproducciones.com` → `djloboproducciones75@gmail.com`) and station IDs are stored in `site_branding` / `site_secrets`.

---

## 14. Deployment

- **Source of truth**: GitHub repository connected to Lovable.
- **Build pipeline**:
  1. Push to `main` → Lovable picks up change.
  2. `prebuild` runs `scripts/generate-sitemap.ts` → writes `public/sitemap.xml`.
  3. Vite builds; output deployed to Lovable hosting (also accessible via `lobo-radio-glow.lovable.app`).
  4. Optional mirror to Vercel for redundancy.
- **DNS / Domain**: `djloboproducciones.com` and `www.djloboproducciones.com` registered/managed at **Strato**; CNAME / A records point at Lovable.
- **SPA fallback**: Provided by Lovable hosting — no `_redirects` / `vercel.json` needed.
- **Backend**: Supabase project ref `gzdnxaseaimdobahilyc`. Edge functions auto-deploy on file change. Database migrations are applied through the Lovable migration flow.
- **Frontend vs backend**: Backend (functions, migrations) deploys immediately; frontend changes require clicking **Publish → Update** in the editor.

---

_Maintained by Coffee Code Studio — coffeecodestudio.se_
