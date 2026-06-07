// Runs before `vite dev` and `vite build` (predev/prebuild hooks).
// Writes public/sitemap.xml — one entry per route (default-language URL only).
// Language alternates are advertised via per-page <link rel="alternate" hreflang>
// tags emitted by src/components/Seo.tsx, not duplicated here.

import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://djloboproducciones.com";
const DEFAULT_LANG = "sv";

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

const localized = (path: string) =>
  `${BASE_URL}/${DEFAULT_LANG}${path === "/" ? "" : path}`;

interface ExtraEntry {
  loc: string;
  hreflang?: string;
  changefreq?: Route["changefreq"];
  priority?: string;
}

// Unlocalized / standalone routes (e.g. SEO landing pages with their own slug).
const extraEntries: ExtraEntry[] = [
  {
    loc: `${BASE_URL}/blog/hyra-dj-brollop-goteborg`,
    hreflang: "sv-SE",
    changefreq: "monthly",
    priority: "0.6",
  },
];

const buildSitemap = (): string => {
  const blocks = routes.map((r) =>
    [
      `  <url>`,
      `    <loc>${localized(r.path)}</loc>`,
      r.changefreq ? `    <changefreq>${r.changefreq}</changefreq>` : null,
      r.priority ? `    <priority>${r.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  const extras = extraEntries.map((e) =>
    [
      `  <url>`,
      `    <loc>${e.loc}</loc>`,
      e.hreflang
        ? `    <xhtml:link rel="alternate" hreflang="${e.hreflang}" href="${e.loc}" />`
        : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
    ...blocks,
    ...extras,
    `</urlset>`,
    ``,
  ].join("\n");
};

writeFileSync(resolve("public/sitemap.xml"), buildSitemap());
console.log(
  `sitemap.xml written (${routes.length + extraEntries.length} entries)`,
);
