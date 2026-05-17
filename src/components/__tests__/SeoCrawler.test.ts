/**
 * Page-contract crawler.
 *
 * Statically walks every public route declared in App.tsx and asserts that
 * the route's lazily-imported page component:
 *   1. Imports <Seo>.
 *   2. Renders <Seo ... path="X" /> where X exactly matches the route path
 *      (so the canonical/hreflang URLs cannot drift from the actual URL).
 *
 * Combined with Seo.test.tsx (which verifies <Seo> emits the right tags for
 * any (path × lang) pair), this gives end-to-end coverage: every indexable
 * URL the router serves is guaranteed to render canonical + hreflang
 * alternates + x-default pointing at the right /sv, /en, /es URLs.
 *
 * No-index routes (admin, reset-password, dev/*, NotFound) are checked the
 * opposite way: they must NOT import <Seo>.
 */
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

import { LANGS, DEFAULT_LANG, localizedHref } from "@/lib/i18nRoutes";

const ROOT = path.resolve(__dirname, "../../../");
const SITE = "https://djloboproducciones.com";
const HREFLANG: Record<string, string> = { sv: "sv-SE", en: "en-US", es: "es-ES" };

const readApp = () => fs.readFileSync(path.join(ROOT, "src/App.tsx"), "utf8");

/** Resolve the actual file on disk for a `./pages/Foo` lazy import. */
const resolvePageFile = (importPath: string): string => {
  const noPrefix = importPath.replace(/^\.\//, "");
  for (const ext of [".tsx", ".ts"]) {
    const p = path.join(ROOT, "src", noPrefix + ext);
    if (fs.existsSync(p)) return p;
  }
  throw new Error(`Could not resolve page file for ${importPath}`);
};

/**
 * Parse App.tsx and return:
 *   - indexable: routes nested under <Route path="/:lang"> (the localized app)
 *   - noindex:   standalone <Route path="/admin" ...> style routes
 */
const parseRoutes = () => {
  const src = readApp();

  // Map lazy import alias → page file. `const Foo = lazy(() => import("./pages/Foo"))`
  const lazyMap = new Map<string, string>();
  const lazyRe = /const\s+(\w+)\s*=\s*lazy\(\(\)\s*=>\s*import\(["']([^"']+)["']\)\)/g;
  for (const m of src.matchAll(lazyRe)) {
    lazyMap.set(m[1], resolvePageFile(m[2]));
  }

  // Pull every <Route ...> in source order, then split by whether it sits
  // inside the /:lang block.
  // Greedy-but-balanced: a Route tag may contain self-closing JSX inside
  // `element={<Foo />}`, so we allow one level of nested `<X .../>` between
  // the angle brackets.
  const allRoutes: { match: string; index: number }[] = [];
  const routeRe = /<Route\b(?:[^<>]|<\w+\b[^>]*\/>)*\/?>/g;
  for (const m of src.matchAll(routeRe)) {
    allRoutes.push({ match: m[0], index: m.index! });
  }

  const langBlockStart = src.indexOf('<Route path="/:lang"');
  const langBlockEnd = src.indexOf("</Routes>", langBlockStart);
  if (langBlockStart === -1 || langBlockEnd === -1) {
    throw new Error("Could not find /:lang block in App.tsx");
  }

  const indexable: { routePath: string; pageFile: string }[] = [];
  const noindex: { routePath: string; pageFile: string }[] = [];

  for (const { match, index } of allRoutes) {
    // Skip the /:lang wrapper and the Layout wrapper (no element page).
    if (/path="\/:lang"/.test(match)) continue;
    if (/path="\*"/.test(match)) continue; // NotFound + LegacyRedirect catch-alls

    const componentMatch = match.match(/element=\{<(\w+)\s*\/>\}/);
    if (!componentMatch) continue;
    const componentName = componentMatch[1];
    const pageFile = lazyMap.get(componentName);
    if (!pageFile) continue; // not a lazily-imported page (e.g. LangGuard)

    let routePath: string;
    const indexAttr = /\bindex\b/.test(match);
    const pathMatch = match.match(/path="([^"]+)"/);
    if (indexAttr) routePath = "/";
    else if (pathMatch) routePath = pathMatch[1].startsWith("/") ? pathMatch[1] : `/${pathMatch[1]}`;
    else continue;

    const inLangBlock = index > langBlockStart && index < langBlockEnd;
    (inLangBlock ? indexable : noindex).push({ routePath, pageFile });
  }

  return { indexable, noindex };
};

const { indexable, noindex } = parseRoutes();

describe("Page-contract crawler: indexable routes", () => {
  it("router declares the expected set of indexable routes", () => {
    // Sanity check so an accidentally-removed route is caught loudly.
    const paths = indexable.map((r) => r.routePath).sort();
    expect(paths).toEqual(
      ["/", "/lyssna", "/mixar", "/media", "/referenser", "/prislista", "/privacy", "/terms"].sort(),
    );
  });

  for (const { routePath, pageFile } of indexable) {
    describe(`route ${routePath} (${path.relative(ROOT, pageFile)})`, () => {
      const src = fs.readFileSync(pageFile, "utf8");

      it("imports <Seo>", () => {
        expect(src).toMatch(/from\s+["']@\/components\/Seo["']/);
      });

      it(`renders <Seo path="${routePath}" />`, () => {
        // Tolerate attribute order, line breaks, and other props around path=.
        const seoRe = /<Seo\b[\s\S]*?\/>/g;
        const seoUsages = Array.from(src.matchAll(seoRe));
        expect(seoUsages.length, "expected at least one <Seo /> usage").toBeGreaterThan(0);
        const matched = seoUsages.find((m) =>
          new RegExp(`path=["']${routePath.replace(/\//g, "\\/")}["']`).test(m[0]),
        );
        expect(matched, `no <Seo /> with path="${routePath}" in ${pageFile}`).toBeDefined();
      });

      // Cross-check: the URLs Seo would emit for this route match what we
      // expect for each language. Pure derivation — no rendering needed.
      for (const lang of LANGS) {
        it(`derives canonical ${lang} → ${localizedHref(routePath, lang)}`, () => {
          expect(`${SITE}${localizedHref(routePath, lang)}`).toBe(
            `${SITE}/${lang}${routePath === "/" ? "" : routePath}`,
          );
        });
      }

      it("x-default uses the default language prefix", () => {
        expect(localizedHref(routePath, DEFAULT_LANG).startsWith(`/${DEFAULT_LANG}`)).toBe(true);
      });
    });
  }

  it("every indexable route is reachable through all 3 hreflang variants", () => {
    // Cartesian sanity: 8 paths × 3 langs = 24 unique URLs, none collide.
    const urls = new Set<string>();
    for (const { routePath } of indexable) {
      for (const lang of LANGS) {
        urls.add(`${SITE}${localizedHref(routePath, lang)}`);
      }
    }
    expect(urls.size).toBe(indexable.length * LANGS.length);
    // And each language is represented exactly `indexable.length` times.
    for (const lang of LANGS) {
      const count = Array.from(urls).filter((u) =>
        u.startsWith(`${SITE}/${lang}`),
      ).length;
      expect(count, `expected ${indexable.length} ${HREFLANG[lang]} URLs`).toBe(indexable.length);
    }
  });
});

describe("Page-contract crawler: no-index routes", () => {
  it("router declares the expected no-index routes", () => {
    const paths = noindex.map((r) => r.routePath).sort();
    expect(paths).toEqual(["/admin", "/dev/zstack", "/reset-password"].sort());
  });

  for (const { routePath, pageFile } of noindex) {
    it(`route ${routePath} (${path.relative(ROOT, pageFile)}) does NOT import <Seo>`, () => {
      const src = fs.readFileSync(pageFile, "utf8");
      expect(src).not.toMatch(/from\s+["']@\/components\/Seo["']/);
    });
  }
});
