/**
 * Verifies og:title and og:description (plus twitter equivalents and
 * og:locale) reflect the current language for every localized page.
 * Catches regressions where the static index.html OG tags leak through
 * for non-Swedish variants.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import Seo from "@/components/Seo";
import { LanguageProvider, type Language } from "@/contexts/LanguageContext";
import { LANGS, LOCALIZED_PATHS, localizedHref } from "@/lib/i18nRoutes";
import { getSeoMeta } from "@/lib/seoMeta";

const OG_LOCALE: Record<Language, string> = {
  sv: "sv_SE",
  en: "en_US",
  es: "es_ES",
};

const renderSeo = (pagePath: string, lang: Language) => {
  const meta = getSeoMeta(pagePath as Parameters<typeof getSeoMeta>[0], lang);
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[localizedHref(pagePath, lang)]}>
        <LanguageProvider>
          <Seo title={meta.title} description={meta.description} path={pagePath} />
        </LanguageProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );
};

const metaContent = (selector: string) =>
  document.head.querySelector<HTMLMetaElement>(selector)?.getAttribute("content");

describe("Seo: localized OG / Twitter tags", () => {
  beforeEach(() => {
    document.head.querySelectorAll("link, meta, title").forEach((n) => n.remove());
  });
  afterEach(() => cleanup());

  for (const pagePath of LOCALIZED_PATHS) {
    for (const lang of LANGS) {
      it(`${pagePath} @ ${lang}: og + twitter tags match localized meta`, async () => {
        renderSeo(pagePath, lang);
        await waitFor(() =>
          expect(document.head.querySelector('meta[property="og:title"]')).not.toBeNull(),
        );

        const expected = getSeoMeta(pagePath as Parameters<typeof getSeoMeta>[0], lang);

        expect(metaContent('meta[property="og:title"]')).toBe(expected.title);
        expect(metaContent('meta[property="og:description"]')).toBe(expected.description);
        expect(metaContent('meta[property="og:locale"]')).toBe(OG_LOCALE[lang]);
        expect(metaContent('meta[name="twitter:title"]')).toBe(expected.title);
        expect(metaContent('meta[name="twitter:description"]')).toBe(expected.description);
        expect(document.title).toBe(expected.title);
        expect(document.documentElement.getAttribute("lang")).toBe(lang);
      });
    }
  }
});
