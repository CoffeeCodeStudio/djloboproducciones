// Runs before `vite dev` and `vite build` (predev/prebuild hooks).
// Writes public/sitemap.xml with one <url> per (route × language) and
// emits xhtml:link hreflang annotations for every language variant.

import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://djloboproducciones.com";

type Lang = "sv" | "en" | "es";
const LANGS: Lang[] = ["sv", "en", "es"];
const HREFLANG: Record<Lang, string> = {
  sv: "sv-SE",
  en: "en-US",
  es: "es-ES",
};
const DEFAULT_LANG: Lang = "sv";

interface Route {
  /** Path without language prefix, leading slash. "/" is the home. */
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const routes: Route[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/lyssna", changefreq: "daily", priority: "0.9" },
  { path: "/mixar", changefreq: "weekly", priority: "0.8" },
  { path: "/media", changefreq: "weekly", priority: "0.7" },
  { path: "/referenser", changefreq: "monthly", priority: "0.7" },
  { path: "/prislista", changefreq: "monthly", priority: "0.9" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
];

const localized = (path: string, lang: Lang) =>
  `${BASE_URL}/${lang}${path === "/" ? "" : path}`;

const buildSitemap = (): string => {
  const blocks: string[] = [];
  for (const route of routes) {
    for (const lang of LANGS) {
      const loc = localized(route.path, lang);
      const alternates = LANGS.map(
        (l) =>
          `    <xhtml:link rel="alternate" hreflang="${HREFLANG[l]}" href="${localized(route.path, l)}" />`,
      );
      alternates.push(
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${localized(route.path, DEFAULT_LANG)}" />`,
      );
      blocks.push(
        [
          `  <url>`,
          `    <loc>${loc}</loc>`,
          ...alternates,
          route.changefreq ? `    <changefreq>${route.changefreq}</changefreq>` : null,
          route.priority ? `    <priority>${route.priority}</priority>` : null,
          `  </url>`,
        ]
          .filter(Boolean)
          .join("\n"),
      );
    }
  }

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
    ...blocks,
    `</urlset>`,
    ``,
  ].join("\n");
};

writeFileSync(resolve("public/sitemap.xml"), buildSitemap());
const entries = routes.length * LANGS.length;
console.log(`sitemap.xml written (${entries} entries, ${routes.length} routes × ${LANGS.length} languages)`);
