import type { Language } from "@/contexts/LanguageContext";

export const LANGS: Language[] = ["sv", "en", "es"];
export const DEFAULT_LANG: Language = "sv";

/**
 * Best-effort browser language detection. Mirrors what an
 * `Accept-Language` header would give a server: walks navigator.languages
 * in priority order and returns the first supported language, else
 * DEFAULT_LANG. Pure SPA — there's no real HTTP redirect, this runs
 * client-side and the result drives the client-side <Navigate>.
 */
export const detectBrowserLang = (): Language => {
  if (typeof navigator === "undefined") return DEFAULT_LANG;
  const candidates = (navigator.languages && navigator.languages.length
    ? navigator.languages
    : [navigator.language]
  )
    .filter(Boolean)
    .map((l) => l.toLowerCase().split("-")[0]);
  for (const c of candidates) {
    if ((LANGS as string[]).includes(c)) return c as Language;
  }
  return DEFAULT_LANG;
};

/** All public, localized route paths (without the /:lang prefix, leading slash). */
export const LOCALIZED_PATHS = [
  "/",
  "/lyssna",
  "/mixar",
  "/media",
  "/referenser",
  "/prislista",
  "/privacy",
  "/terms",
] as const;

/** Legacy unprefixed path → canonical unprefixed path. */
export const LEGACY_PATH_MAP: Record<string, string> = {
  "/radio": "/lyssna",
  "/mixes": "/media",
  "/galleri": "/media",
  "/utrustning": "/",
  "/spelningar": "/",
};

export const isLang = (v: string | undefined): v is Language =>
  !!v && (LANGS as string[]).includes(v);

/** Prepend the active language to an in-app path. "/" → "/sv", "/lyssna" → "/sv/lyssna". */
export const localizedHref = (path: string, lang: Language): string => {
  // Preserve hash / query as-is on the trailing portion.
  const [pathname, ...rest] = path.split(/(?=[?#])/);
  const tail = rest.join("");
  if (!pathname || pathname === "/") return `/${lang}${tail}`;
  // Strip an accidentally-included lang prefix to keep things idempotent.
  const stripped = stripLang(pathname);
  return `/${lang}${stripped === "/" ? "" : stripped}${tail}`;
};

/** Remove a leading /:lang segment from a pathname. Returns "/" or "/rest". */
export const stripLang = (pathname: string): string => {
  const m = pathname.match(/^\/([^/]+)(\/.*)?$/);
  if (m && isLang(m[1])) return m[2] ?? "/";
  return pathname || "/";
};

/** Read the lang prefix of a pathname, or null if none. */
export const getLangFromPath = (pathname: string): Language | null => {
  const m = pathname.match(/^\/([^/]+)/);
  return m && isLang(m[1]) ? (m[1] as Language) : null;
};

/** Swap (or add) the lang prefix on a pathname, preserving the rest of the path. */
export const swapLang = (pathname: string, lang: Language): string => {
  return localizedHref(stripLang(pathname), lang);
};
