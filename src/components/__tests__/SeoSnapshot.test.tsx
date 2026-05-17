/**
 * Snapshot tests for canonical + hreflang + x-default markup.
 *
 * Renders <Seo> for every (path × language) combination and snapshots the
 * serialized <link rel="canonical"> and <link rel="alternate"> tags emitted
 * into <head>. Any drift in URL shape, hreflang code, ordering, or x-default
 * target will surface as a snapshot diff.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import Seo from "@/components/Seo";
import { LanguageProvider, type Language } from "@/contexts/LanguageContext";
import { LANGS, LOCALIZED_PATHS, localizedHref } from "@/lib/i18nRoutes";

const renderSeo = (pagePath: string, lang: Language) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[localizedHref(pagePath, lang)]}>
        <LanguageProvider>
          <Seo
            title={`Title ${lang} ${pagePath}`}
            description={`Description ${lang} ${pagePath}`}
            path={pagePath}
          />
        </LanguageProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );

/**
 * Serialize the canonical + alternate link tags in head, in document order,
 * to a stable, diff-friendly string. Only these tags are snapshotted — other
 * head markup (title, og:*, twitter:*) is asserted elsewhere and would add
 * noise to a hreflang regression check.
 */
const serializeLinkTags = (): string =>
  Array.from(document.head.querySelectorAll("link"))
    .filter((el) => {
      const rel = el.getAttribute("rel");
      return rel === "canonical" || rel === "alternate";
    })
    .map((el) => {
      const rel = el.getAttribute("rel");
      const hreflang = el.getAttribute("hreflang");
      const href = el.getAttribute("href");
      return hreflang
        ? `<link rel="${rel}" hreflang="${hreflang}" href="${href}" />`
        : `<link rel="${rel}" href="${href}" />`;
    })
    .join("\n");

describe("Seo snapshot: canonical + hreflang markup", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
  });
  afterEach(() => {
    cleanup();
    document.head.innerHTML = "";
  });

  for (const pagePath of LOCALIZED_PATHS) {
    for (const lang of LANGS) {
      it(`emits stable link markup for ${pagePath} [${lang}]`, async () => {
        renderSeo(pagePath, lang);
        await waitFor(() =>
          expect(
            document.head.querySelector('link[rel="canonical"]'),
          ).not.toBeNull(),
        );
        expect(serializeLinkTags()).toMatchSnapshot();
      });
    }
  }
});
