# DJ Lobo Producciones

[![Live](https://img.shields.io/badge/live-djloboproducciones.com-ff00ff?style=flat-square)](https://djloboproducciones.com)
[![React](https://img.shields.io/badge/React-18.3-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-backend-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com)
[![Lovable Cloud](https://img.shields.io/badge/hosted-Lovable%20Cloud-7c3aed?style=flat-square)](https://lovable.dev)
[![Coffee Code Studio](https://img.shields.io/badge/built%20by-Coffee%20Code%20Studio-00ffff?style=flat-square)](https://coffeecodestudio.se)

Production website for **DJ Lobo Producciones** — a Gothenburg-based professional DJ. The site combines a public marketing front (hero, bio, gear, mixes, gallery, testimonials, pricing) with a 24/7 live radio stream, a moderated live chat, an integrated booking pipeline, and a full Swedish-language admin panel for content management.

---

## Features

- 🎙️ **Live radio stream** via ZenoFM with persistent now-playing bar
- 🎚️ **Mixcloud + SoundCloud mixes** with card-based player and admin auto-sync
- 📸 **Media gallery** with lightbox supporting photos and YouTube videos
- 📅 **Show schedule** powered by the Google Calendar API (5-min cached edge function)
- 💌 **Booking & contact forms** delivered via Resend to `djloboproducciones75@gmail.com`
- 💬 **Live chat** on `/lyssna` with UUID-based session rate limiting and admin ban system
- 📣 **Promo / announcement system** with full-screen popup and bottom mini card, plus analytics
- 🛠️ **Admin panel** with 9 management tabs (front page, gallery, promos, radio, testimonials, shows, branding, help, users)
- 🌍 **Multilanguage** Swedish (default), English, Spanish — fully localized DB content
- 🍪 **GDPR cookie consent gate** on all third-party embeds (Mixcloud, SoundCloud, YouTube, ZenoFM)
- 🎨 **Dynamic branding** — logo, colors, bio, hero copy, and social links all editable from the admin panel
- 🔎 **SEO built in** — `react-helmet-async`, auto-generated `sitemap.xml`, hreflang, JSON-LD FAQ schema
- 📱 **Mobile-first responsive** with safe-area-aware bottom mini player

---

## Tech Stack

| Category | Technology |
|---|---|
| Frontend | React 18.3, TypeScript 5.8, Vite 5.4 |
| Routing | react-router-dom 7 |
| Styling | Tailwind CSS 3.4, tailwindcss-animate, shadcn/ui (Radix primitives) |
| Animation | framer-motion 12 |
| State | Zustand 5 (player), @tanstack/react-query 5 (server state) |
| Forms | react-hook-form 7 + zod 3 |
| Backend | Supabase (Postgres + Auth + Storage + Edge Functions) |
| Email | Resend |
| Calendar | Google Calendar API |
| Audio | ZenoFM (radio), Mixcloud / SoundCloud iframes (mixes) |
| Hosting | Lovable Cloud |
| Tests | Vitest + @testing-library/react |

---

## Project Structure

```
src/
├── components/      Public sections, layout, and admin tab panels
│   ├── admin/       Admin-only management tabs
│   └── ui/          shadcn/ui primitives
├── contexts/        LanguageContext, CookieConsentContext
├── hooks/           useBranding, useMixes, useGallery, useSchedule, useAuth, ...
├── stores/          usePlayerStore (Zustand dual-mode player)
├── lib/             i18n routing, promo analytics, logger, utils
├── integrations/    Auto-generated Supabase client + types (do not edit)
└── pages/           12 route components

supabase/
├── functions/       6 edge functions
└── migrations/      SQL history
```

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full directory tree and deep-dive.

---

## Local Development

### Prerequisites
- Node 18+ or Bun
- A Supabase project (the production ref is `gzdnxaseaimdobahilyc`)

### Setup
```bash
git clone <repo-url>
cd djloboproducciones
bun install        # or: npm install
```

Create `.env` at the repo root (values from Lovable → Project Settings → Cloud):

```
VITE_SUPABASE_URL="https://<project-ref>.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="<anon-key>"
VITE_SUPABASE_PROJECT_ID="<project-ref>"
```

> Server-side secrets (`RESEND_API_KEY`, `GOOGLE_CALENDAR_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `LOVABLE_API_KEY`) live in Supabase Edge Function Secrets — **never** committed to the repo.

### Run
```bash
bun run dev        # http://localhost:5173 — also regenerates sitemap.xml
bun run build      # production build
bun run lint       # eslint
bunx vitest run    # tests
```

---

## Admin Access

- URL: [`/admin`](https://djloboproducciones.com/admin) (Swedish UI only).
- Sign in with an account that has the `admin` role in the `user_roles` table.
- Roles: `admin` (full access), `moderator` (reserved), `user` (default).
- New admins are provisioned by an existing admin from the **Användare** tab (calls the `list-admin-users` edge function with a service-role grant).
- Roles are checked server-side via the `public.has_role(user_id, role)` `SECURITY DEFINER` function — never trust client-only checks.

---

## Deployment

- **Auto-deploy** on every save in Lovable → Lovable Cloud → `djloboproducciones.com`.
- **Domain:** Strato DNS points the apex and `www` records at Lovable.
- **Sitemap:** regenerated automatically by `scripts/generate-sitemap.ts` (via the `predev` / `prebuild` hooks).
- **No manual build step required.**

---

## Security Notes

The following items are **open** and should be addressed by the next maintainer:

1. 🟠 **HIBP** (HaveIBeenPwned) password compromise check is **not enabled** in Supabase Auth settings.
2. 🟠 **MFA** is **not enforced** for admin accounts.
3. 🟠 `send-booking-notification` and `send-contact-email` edge functions are **open endpoints** (rate-limited but no JWT or origin guard). Consider adding a shared secret header or origin check before launch.
4. 🟠 The `branding` storage bucket allows **listing all files** (Supabase linter `0025_public_bucket_allows_listing`). Tighten the `storage.objects` SELECT policy if file enumeration is sensitive.
5. ✅ `chat_messages.session_id` column-level access is locked down (verified via `has_column_privilege`).

See **§13 Known Issues & Backlog** in [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full list.

---

## Architecture

For the full technical deep-dive — database schema, edge functions, RBAC model, player architecture, i18n, admin tabs, environment variables, and backlog — see [**`ARCHITECTURE.md`**](./ARCHITECTURE.md).

---

## Built By

**[Coffee Code Studio](https://coffeecodestudio.se)** — delivered as part of the **Digital Upgrade** package.
