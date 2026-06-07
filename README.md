# DJ Lobo Producciones

> Marketing site, live radio stream, mix library, media gallery and booking portal for Gothenburg-based DJ Lobo.

**Live:** [djloboproducciones.com](https://djloboproducciones.com)
**Built by:** [Coffee Code Studio](https://coffeecodestudio.se)

---

## Summary

A trilingual (Swedish / English / Spanish) single-page application powering DJ Lobo Producciones' public web presence and DJ Lobo Radio's live stream. Visitors can listen to the radio, browse Mixcloud sets, view event galleries, read pricing, chat live and request bookings. A built-in admin panel lets the owner manage every piece of content without code.

---

## Features

- 🎙️ **Live radio** — ZenoFM HLS stream with now-playing metadata and listener count
- 🎚️ **Mix library** — auto-synced Mixcloud feed with in-page playback
- 📷 **Media gallery** — photos and YouTube clips, filter + lightbox
- 📅 **Schedule** — upcoming events from Google Calendar
- 💬 **Live chat** — `/lyssna` chat with UUID-based rate limiting and ban system
- 💸 **Pricing & booking** — tiered packages + booking form with email notifications via Resend
- 🛠️ **Admin panel** — manage branding, hero, equipment, gallery, mixes, schedule, pricing, testimonials, promos, users
- 🌐 **Trilingual** — sv / en / es with persistent language preference and hreflang SEO
- 🎁 **Promos** — popup + mini-card promos with analytics events
- 🍪 **Cookie consent** — GDPR-aware, category-based
- ♿ **Accessibility-first** — skip link, semantic landmarks, sr-only H1s, keyboard navigation
- 🔍 **SEO** — per-route meta, canonical, OG/Twitter cards, sitemap, FAQ JSON-LD on blog landing

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React 18 + Vite 5 + TypeScript 5 |
| Styling | Tailwind CSS 3 + shadcn/ui (Radix) |
| Animation | framer-motion |
| Routing | react-router-dom 7 |
| Server state | @tanstack/react-query 5 |
| Client state | Zustand 5 |
| Forms | react-hook-form + zod |
| SEO | react-helmet-async |
| Backend | Supabase (Lovable Cloud) — Postgres, Auth, Storage, Edge Functions (Deno) |
| Email | Resend |
| Hosting | Lovable (with optional Vercel mirror), DNS at Strato |

Full version matrix lives in [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## Project Structure

```
src/
├── pages/              Route components (Home, ListenPage, MixesPage, MediaPage, Admin, …)
├── components/         UI sections, shell (Layout/Navbar/Footer), shadcn primitives, admin tabs
├── contexts/           LanguageContext, CookieConsentContext
├── hooks/              Data fetchers + UI hooks (useAuth, useBranding, useGallery, …)
├── stores/             Zustand stores (usePlayerStore)
├── lib/                i18nRoutes, seoMeta, imageOptimizer, utils
└── integrations/       Auto-generated Supabase client + types (do NOT edit)
supabase/
├── functions/          6 edge functions (fetch-mixcloud, google-calendar, send-*, admin tools)
└── migrations/         SQL migrations
scripts/                Pre-build helpers (sitemap generator)
public/                 Static assets, robots.txt, sitemap.xml
```

For a deep dive see [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## Getting Started

### Prerequisites

- **Node 18+** (or **Bun 1.x** — recommended; the project ships with a Bun lockfile)
- A connected **Supabase / Lovable Cloud** project

### Clone & install

```bash
git clone <repo-url> djlobo
cd djlobo
bun install      # or: npm install
```

### Environment variables

The client `.env` is auto-managed by Lovable Cloud. If you run locally outside Lovable, create a `.env` with:

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-key>
VITE_SUPABASE_PROJECT_ID=<project-ref>
```

Edge function secrets (set in Supabase, never committed):

```
SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
SUPABASE_PUBLISHABLE_KEY, SUPABASE_PUBLISHABLE_KEYS,
SUPABASE_SECRET_KEYS, SUPABASE_JWKS, SUPABASE_DB_URL,
LOVABLE_API_KEY, RESEND_API_KEY, GOOGLE_CALENDAR_API_KEY
```

### Run locally

```bash
bun run dev        # or: npm run dev
```

The `predev` hook regenerates `public/sitemap.xml`. Vite serves the SPA at the printed URL.

### Other scripts

```bash
bun run build      # production build (runs sitemap prebuild)
bun run lint       # ESLint
bunx vitest run    # unit tests
```

---

## Admin Panel

`/admin` is gated by Supabase Auth and the `admin` role in `public.user_roles`. Admins can manage:

- **Branding** — site copy, hero image, colors, social handles, contact info
- **Framsida (Home)** — hero CTAs, sections toggle
- **Mixcloud** — sync settings, manual refresh of `mixcloud_mixes`
- **Mixes** — featured ordering, descriptions
- **Schedule** — Google Calendar source + cache rules
- **Spelningar (gigs)** — upcoming event highlights
- **Gallery** — upload, crop, reorder photos and videos
- **Equipment** — public equipment list
- **Pricing** — package tiers + suffixes
- **Promos** — popup / mini-card with start/end dates and sort strategy
- **Testimonials** — references shown on `/referenser`
- **Bio** — about-section text per language
- **Users** — list admins, manage roles
- **Help** — internal docs / Coffee Code Studio contact

The admin theme is a strict dark navy/charcoal (no neon) and is intentionally Swedish-only.

---

## Deployment

| Step | Where |
|---|---|
| 1. Commit | GitHub `main` |
| 2. Build & host | Lovable picks up the commit and deploys to `lobo-radio-glow.lovable.app` |
| 3. (Optional) Mirror | Vercel can pull the same repo for redundancy |
| 4. Domain | Strato DNS points `djloboproducciones.com` / `www.djloboproducciones.com` at Lovable |
| 5. Backend | Supabase edge functions and migrations deploy immediately via Lovable Cloud |

**Frontend vs backend** — backend (DB / functions) deploys instantly on save; frontend changes only go live after clicking **Publish → Update** in the Lovable editor.

SPA deep links and refresh work out of the box on Lovable hosting — no `_redirects` / `vercel.json` config needed.

---

## Security Notes

The next maintainer should review the following open items (see `ARCHITECTURE.md` §12 for the full list):

- 🟠 **`promo_events.session_id`** is client-supplied — analytics data can be polluted. Consider deriving from `request.jwt.claims` or accepting `NULL` only.
- 🟠 **`google-calendar` edge function** is unauthenticated and uses the service role to read `site_secrets`. Quota-abusable. Add a server-side cache row, move `google_calendar_id` to a public config column, or gate the call with a shared-secret header.
- 🟠 **HIBP leaked-password check** — verify it's enabled in Lovable Cloud → Users → Auth Settings.
- 🟠 **MFA** — not enrolled for the admin role. Recommended for a single-admin production system.
- 🟠 **Edge function admin guards** — re-confirm `has_role('admin')` checks on `list-admin-users` and `check-cron-jobs`.
- 🟢 **`chat_messages.session_id`** — already REVOKE'd from anon/authenticated and Realtime publication scoped (resolved).

Roles are stored exclusively in `public.user_roles` and checked via the `has_role()` SECURITY DEFINER function — never on profiles or client storage.

---

## Built By

**[Coffee Code Studio](https://coffeecodestudio.se)** — Need a guide or have questions? Reach out at [coffeecodestudio.se](https://coffeecodestudio.se).
