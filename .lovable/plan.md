# URL-prefixed language routing (`/sv`, `/en`, `/es`)

Goal: every public page lives at `/{lang}/...` so we can emit valid `hreflang` alternates and per-URL canonicals.

## Routing changes (`src/App.tsx`)

Wrap the localized routes in a `:lang` param and keep `/admin`, `/reset-password`, `/dev/zstack` unprefixed.

```text
/admin                          (unchanged, noindex)
/reset-password                 (unchanged, noindex)
/dev/zstack                     (unchanged, noindex)
/:lang                          → Index
/:lang/lyssna                   → ListenPage
/:lang/mixar                    → MixesPage
/:lang/media                    → MediaPage
/:lang/referenser               → ReferencesPage
/:lang/prislista                → PrislistaPage
/:lang/privacy                  → PrivacyPolicy
/:lang/terms                    → TermsOfService
/:lang/*                        → NotFound

/                               → redirect to /sv (or detected lang)
/lyssna, /mixar, …              → 301-style <Navigate> to /sv/<path>
/radio, /mixes, /galleri, …     → existing legacy aliases, now redirect to /sv/<canonical>
```

A `<LangGuard>` element validates `:lang ∈ {sv,en,es}` and either renders `<Outlet/>` or redirects to `/sv/...`. It also calls `setLanguage(lang)` on mount so the URL is the source of truth.

## Language context (`src/contexts/LanguageContext.tsx`)

- Initial language: read from URL first, fall back to `localStorage`, then `sv`.
- `setLanguage(lang)` continues to persist to `localStorage` for cross-tab sync but ALSO navigates to the equivalent URL in the new language (swap the first path segment).
- Keep `<html lang>` effect.

## Language switcher

Find every call site of `setLanguage` and let the new context handle the navigation — no per-component changes needed. The switcher will start producing real URL transitions.

## SEO (`src/components/Seo.tsx`)

- `canonical` becomes `https://djloboproducciones.com{pathname}` (the active localized URL).
- Emit real `<link rel="alternate" hreflang="sv|en|es|x-default" href="…/{lang}{rest}" />` for each route by swapping the first segment.
- Drop the `og:locale:alternate` workaround (keep `og:locale` driven by active lang).

## Sitemap (`scripts/generate-sitemap.ts`)

Generate one `<url>` per (route × language) with full `xhtml:link` hreflang annotations and `x-default` → `/sv/...`. Add `xmlns:xhtml` to `<urlset>`.

## Robots / noindex

No changes — `/admin`, `/reset-password`, `/dev/zstack` stay unprefixed and keep their existing `Disallow` + `useNoindex()`.

## Internal links

Replace hard-coded `to="/lyssna"` etc. with a tiny helper `localizedHref(path, lang)` so the navbar, footer, CTAs, and any `<Link>` produce `/sv/lyssna` etc. I'll grep for `to="/` and update each match.

## Files touched

- `src/App.tsx` — new route tree + redirects + `LangGuard`.
- `src/contexts/LanguageContext.tsx` — URL-driven init + navigate on `setLanguage`.
- `src/components/Seo.tsx` — real hreflang + per-URL canonical.
- `src/lib/localizedHref.ts` — new helper.
- `src/components/**` — swap hard-coded internal `to="/..."` for localized hrefs (Navigation, Footer, hero CTAs, etc.).
- `scripts/generate-sitemap.ts` — multi-lang entries with hreflang.
- `public/robots.txt` — unchanged.

## Risks

- Inbound links to `/lyssna` keep working via the legacy `<Navigate>` redirects.
- Bookmarks survive (root + each legacy path redirects to the user's stored language, falling back to `sv`).
- Spanish (`es`) gets URLs too even though it's not in the original hreflang ask; this keeps the system consistent and future-proof.
