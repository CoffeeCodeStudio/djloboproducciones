# 🚀 DJ Lobo Producciones – Web Application

Modern webbapp byggd av Coffee Code Studio som ersätter en 
legacy-site från 2015. Optimerad för hastighet, modern UX 
och sömlös medieintegration.

## 🔗 Länkar
- **Live:** https://djloboproducciones.com
- **Byggt av:** https://coffeecodestudio.se

## 🛠 Features
- **Radio-interface** — Live streaming via ZenoFM + Mixcloud
- **Admin-panel** — Säker panel för innehållshantering
- **Prislista** — Dynamisk prislista baserad på gästantal
- **Bokningsformulär** — Kontakt & bokning i ett
- **Google Calendar** — Kommande spelningar synkade automatiskt
- **Bildhantering** — Upload med inbyggd cropper
- **Mobiloptimerad** — Responsiv design för alla enheter

## ⚡ Tech Stack
- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (Auth, Database, Storage)
- **Hosting:** Lovable
- **Domän:** SVZ.RO
- **Workflow:** GitHub + Lovable AI

## 🏗 Stacking Context (Z-Index)
To ensure UI consistency, the following z-index scale is enforced:
- **100**: `PromoMiniCard` (Mini-Player) — Always on top of site content.
- **60**: `CookieConsent` — Essential legal overlay.
- **50**: `NowPlayingBar` & Navigation — Global site controls.
- **10**: `Footer` & Layout — Base page elements.

> ⚠️ Future overlays (e.g. DJ profile modals) must respect this scale and never exceed `100` unless they are critical full-screen alerts (`PromoPopup` uses Radix Dialog defaults).

## 🛠 Component Architecture

### React Portals
The `PromoMiniCard` uses `createPortal` to render directly into `document.body`. This is a deliberate architectural choice to:
1. Escape `overflow: hidden` on parent containers (avoids "Clipping Ancestors").
2. Ensure `position: fixed` is relative to the viewport, not a nested stacking context created by `transform` or `filter` ancestors.

### Media Playback Strategy
The platform supports three media sources for promos and hero content:
- **YouTube**: Embedded via `youtube-nocookie.com` with `autoplay=1&mute=1&controls=0&loop=1` for silent background-video style. Cookie-less domain keeps GDPR compliance.
- **Native Video (`<video>`)**: Uses `playsinline`, `muted`, and `loop` for mobile autoplay compatibility (iOS requires muted+playsinline).
- **Image Fallback**: Every video element receives a `poster` / fallback image so the UI never shows an empty black box during load or on autoplay failure.

## 🧠 Business Logic: Promo Visibility
The promo system (`PromoManager.tsx`) balances marketing visibility with user comfort using a layered storage strategy:

- **Priority Selection**: When multiple promos are active in Supabase, the one with the highest `priority` wins; ties break on most recent `created_at`. Only one promo is shown at a time.
- **24-Hour Cool-down**: Once a user closes the full-screen `PromoPopup`, a timestamp is saved to `localStorage` (`promo_seen_<id>`). The large modal won't reappear for 24 hours — instead the user sees the compact `PromoMiniCard`.
- **Session Dismissal**: Clicking `X` on the Mini-Player saves a flag to `sessionStorage` (`promo_mini_session_hidden_<id>`). The mini-player stays hidden until the browser tab/session closes.
- **Permanent Dismissal**: "Visa inte igen" writes to `localStorage` (`promo_permanent_dismissed_<id>`) — neither the popup nor the mini-player will ever show again for that promo ID.
- **Re-open Flow**: Clicking the Mini-Player re-opens the full popup; closing it returns to mini state instead of restarting the 24h timer.

## 💾 State Management
Hybrid persistence model — pick the right storage for the right lifetime:
- **`localStorage`**: Long-lived user preferences (promo cool-downs, permanent dismissals, cookie consent).
- **`sessionStorage`**: Per-session UI state (mini-player hide for current visit).
- **Zustand (`usePlayerStore`)**: In-memory global radio player state (current mix, play/pause).
- **TanStack Query**: Server state (promos, gallery, mixes, calendar) with `staleTime` tuned per resource.

## 💼 Coffee Code Studio
Levererat av Coffee Code Studio som en del av vårt 
"Digital Upgrade"-paket — från legacy till modern 
webbapplikation.

---
*Senast uppdaterad: Mars 2026*
