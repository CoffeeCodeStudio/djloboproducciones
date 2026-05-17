/**
 * Hreflang / canonical / x-default audit.
 *
 * Strategy: render <Seo> for every (path × language) combination, then assert
 * on the tags it emits into <head>. This guarantees the SEO contract is
 * symmetric and language-prefixed without coupling the test to any page's
 * other markup or data dependencies.
 *
 * Separately, asserts that the no-index pages (NotFound, Admin, ResetPassword,
 * dev/*) intentionally do NOT import <Seo>, so they cannot accidentally start
 * advertising alternates.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import fs from "node:fs";
import path from "node:path";

import Seo from "@/components/Seo";
import { LanguageProvider, type Language } from "@/contexts/LanguageContext";
import { LANGS, DEFAULT_LANG, LOCALIZED_PATHS, localizedHref } from "@/lib/i18nRoutes";

const SITE = "https://djloboproducciones.com";
const HREFLANG: Record<Language, string> = {
  sv: "sv-SE",
  en: "en-US",
  es: "es-ES",
};

const renderSeo = (pagePath: string, lang: Language) => {
  // Route into the language-prefixed URL so LanguageProvider derives `lang`
  // from the URL segment (its canonical source).
  const initialEntry = localizedHref(pagePath, lang);
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <LanguageProvider>
          <Seo
            title={`Test ${lang} ${pagePath}`}
            description="Test description"
            path={pagePath}
          />
        </LanguageProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );
};

const headLinks = () =>
  Array.from(document.head.querySelectorAll("link")).map((el) => ({
    rel: el.getAttribute("rel"),
    hreflang: el.getAttribute("hreflang"),
    href: el.getAttribute("href"),
  }));

describe("Seo: canonical + hreflang + x-default", () => {
  beforeEach(() => {
    // Helmet appends to the real <head>; wipe between cases so each render
    // is isolated.
    document.head.querySelectorAll("link, meta, title").forEach((n) => n.remove());
  });
  afterEach(() => cleanup());

  for (const pagePath of LOCALIZED_PATHS) {
    for (const lang of LANGS) {
      const url = `${SITE}${localizedHref(pagePath, lang)}`;

      it(`${pagePath} @ ${lang}: canonical is self`, async () => {
        renderSeo(pagePath, lang);
        // Helmet flushes asynchronously
        await Promise.resolve();
        const canonicals = headLinks().filter((l) => l.rel === "canonical");
        expect(canonicals).toHaveLength(1);
        expect(canonicals[0].href).toBe(url);
      });

      it(`${pagePath} @ ${lang}: emits 3 hreflang alternates + x-default`, async () => {
        renderSeo(pagePath, lang);
        await Promise.resolve();
        const alts = headLinks().filter((l) => l.rel === "alternate");
        // 3 language alternates + 1 x-default
        expect(alts).toHaveLength(4);

        // Each language is represented exactly once with the right URL.
        for (const l of LANGS) {
          const match = alts.filter((a) => a.hreflang === HREFLANG[l]);
          expect(match, `expected one ${HREFLANG[l]} alternate`).toHaveLength(1);
          expect(match[0].href).toBe(`${SITE}${localizedHref(pagePath, l)}`);
        }

        // x-default points to the default language variant.
        const xDefault = alts.filter((a) => a.hreflang === "x-default");
        expect(xDefault).toHaveLength(1);
        expect(xDefault[0].href).toBe(`${SITE}${localizedHref(pagePath, DEFAULT_LANG)}`);
      });

      it(`${pagePath} @ ${lang}: alternate set includes self (bidirectional)`, async () => {
        renderSeo(pagePath, lang);
        await Promise.resolve();
        const alts = headLinks().filter(
          (l) => l.rel === "alternate" && l.hreflang !== "x-default",
        );
        expect(alts.some((a) => a.href === url)).toBe(true);
      });
    }
  }

  it("alternates are bidirectional across every page pair", async () => {
    // The contract: for any two URLs A and B that are language siblings of
    // the same path, A must list B as an alternate AND B must list A. We
    // render every URL, collect its alternates, then verify symmetry.
    const altMap = new Map<string, Set<string>>();

    for (const pagePath of LOCALIZED_PATHS) {
      for (const lang of LANGS) {
        document.head.querySelectorAll("link, meta, title").forEach((n) => n.remove());
        renderSeo(pagePath, lang);
        await Promise.resolve();
        const url = `${SITE}${localizedHref(pagePath, lang)}`;
        const alts = new Set(
          headLinks()
            .filter((l) => l.rel === "alternate" && l.hreflang !== "x-default")
            .map((l) => l.href!)
            .filter(Boolean),
        );
        altMap.set(url, alts);
        cleanup();
      }
    }

    for (const [url, alts] of altMap) {
      for (const target of alts) {
        if (target === url) continue;
        const back = altMap.get(target);
        expect(back, `${target} was advertised by ${url} but never rendered`).toBeDefined();
        expect(back!.has(url), `${target} does not list ${url} as an alternate`).toBe(true);
      }
    }
  });
});

describe("No-index pages: must NOT import Seo (no alternates)", () => {
  const noindexPages = [
    "src/pages/NotFound.tsx",
    "src/pages/Admin.tsx",
    "src/pages/ResetPassword.tsx",
    "src/pages/dev/DevZStack.tsx",
  ];

  for (const rel of noindexPages) {
    it(`${rel} does not import Seo`, () => {
      const abs = path.resolve(__dirname, "../../../", rel);
      const src = fs.readFileSync(abs, "utf8");
      expect(src).not.toMatch(/from\s+["']@\/components\/Seo["']/);
    });
  }
});
