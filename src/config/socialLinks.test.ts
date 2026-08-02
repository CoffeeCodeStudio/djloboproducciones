import { describe, it, expect } from "vitest";
import { SOCIAL_LINKS, SOCIAL_LINK_GROUPS, isValidHttpUrl, safeUrl } from "./socialLinks";

const groupByKey = (key: string) => {
  const group = SOCIAL_LINK_GROUPS.find((g) => g.key === key);
  if (!group) throw new Error(`Missing footer group: ${key}`);
  return group;
};

describe("footer social link groups", () => {
  it("has exactly the two expected groups in order", () => {
    expect(SOCIAL_LINK_GROUPS.map((g) => g.key)).toEqual(["socialMedia", "musicRadio"]);
    expect(groupByKey("socialMedia").title.sv).toBe("Sociala medier");
    expect(groupByKey("socialMedia").title.en).toBe("Social Media");
    expect(groupByKey("musicRadio").title.sv).toBe("Musik & Radio");
    expect(groupByKey("musicRadio").title.en).toBe("Music & Radio");
  });

  it("puts Facebook, Instagram and YouTube in Sociala medier", () => {
    const group = groupByKey("socialMedia");
    expect(group.links.map((l) => l.linkKey)).toEqual([
      "facebookProducciones",
      "instagram",
      "youtube",
    ]);
    expect(group.links.map((l) => l.label.sv)).toEqual(["Facebook", "Instagram", "YouTube"]);
  });

  it("puts Mixcloud, ZenoFM and FB Radio in Musik & Radio", () => {
    const group = groupByKey("musicRadio");
    expect(group.links.map((l) => l.linkKey)).toEqual([
      "mixcloud",
      "branding.zenoPlayer",
      "facebook",
    ]);
    expect(group.links.map((l) => l.label.sv)).toEqual(["Mixcloud", "ZenoFM", "FB Radio"]);
  });

  it("resolves static link keys to real URLs in SOCIAL_LINKS", () => {
    const staticKeys = SOCIAL_LINK_GROUPS.flatMap((g) =>
      g.links.map((l) => l.linkKey).filter((k) => !k.startsWith("branding."))
    );
    for (const key of staticKeys) {
      expect(SOCIAL_LINKS[key as keyof typeof SOCIAL_LINKS]).toMatch(/^https:\/\//);
    }
    expect(SOCIAL_LINKS.mixcloud).toBe("https://www.mixcloud.com/live/DjLobo75/");
    expect(SOCIAL_LINKS.facebook).toBe(
      "https://www.facebook.com/profile.php?id=61592519669407"
    );
  });

  it("never repeats the same link key inside one group", () => {
    for (const group of SOCIAL_LINK_GROUPS) {
      const keys = group.links.map((l) => l.linkKey);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it("has localized labels and aria-labels for sv, en and es", () => {
    for (const group of SOCIAL_LINK_GROUPS) {
      for (const lang of ["sv", "en", "es"] as const) {
        expect(group.title[lang]).toBeTruthy();
        for (const link of group.links) {
          expect(link.label[lang]).toBeTruthy();
          expect(link.ariaLabel[lang]).toBeTruthy();
        }
      }
    }
  });
});

const LANGS = ["sv", "en", "es"] as const;

describe("social link URL protocol validation", () => {
  it("every URL in SOCIAL_LINKS uses https and is a valid absolute URL", () => {
    for (const [key, url] of Object.entries(SOCIAL_LINKS)) {
      expect(isValidHttpUrl(url), `${key} should be a valid http(s) URL`).toBe(true);
      expect(new URL(url).protocol, `${key} should use https`).toBe("https:");
      expect(url.trim(), `${key} should not contain surrounding whitespace`).toBe(url);
    }
  });

  it("rejects non-http protocols and malformed values", () => {
    for (const bad of [
      "javascript:alert(1)",
      "data:text/html,<script>",
      "ftp://example.com",
      "/relative/path",
      "example.com",
      "",
      "   ",
      null,
      undefined,
      42,
    ]) {
      expect(isValidHttpUrl(bad as unknown), `${String(bad)} should be invalid`).toBe(false);
      expect(safeUrl(bad as unknown, SOCIAL_LINKS.instagram)).toBe(SOCIAL_LINKS.instagram);
    }
  });

  it("keeps a valid https URL untouched through safeUrl", () => {
    expect(safeUrl(SOCIAL_LINKS.mixcloud, SOCIAL_LINKS.instagram)).toBe(SOCIAL_LINKS.mixcloud);
    expect(safeUrl("  https://example.com/live  ", SOCIAL_LINKS.instagram)).toBe(
      "https://example.com/live"
    );
  });

  it("every static group link resolves to an https URL", () => {
    for (const group of SOCIAL_LINK_GROUPS) {
      for (const link of group.links) {
        if (link.linkKey.startsWith("branding.")) continue;
        const url = SOCIAL_LINKS[link.linkKey as keyof typeof SOCIAL_LINKS];
        expect(url, `${link.linkKey} must exist in SOCIAL_LINKS`).toBeDefined();
        expect(new URL(url).protocol).toBe("https:");
      }
    }
  });
});

describe("no duplicates per language context", () => {
  it.each(LANGS)("has unique link labels within each group (%s)", (lang) => {
    for (const group of SOCIAL_LINK_GROUPS) {
      const labels = group.links.map((l) => l.label[lang]);
      expect(new Set(labels).size, `duplicate label in ${group.key} (${lang})`).toBe(
        labels.length
      );
    }
  });

  it.each(LANGS)("has unique aria-labels across the whole footer (%s)", (lang) => {
    const ariaLabels = SOCIAL_LINK_GROUPS.flatMap((g) => g.links.map((l) => l.ariaLabel[lang]));
    expect(new Set(ariaLabels).size, `duplicate aria-label (${lang})`).toBe(ariaLabels.length);
  });

  it.each(LANGS)("has unique group titles (%s)", (lang) => {
    const titles = SOCIAL_LINK_GROUPS.map((g) => g.title[lang]);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("never renders the same URL twice across all groups", () => {
    const urls = SOCIAL_LINK_GROUPS.flatMap((g) =>
      g.links
        .filter((l) => !l.linkKey.startsWith("branding."))
        .map((l) => SOCIAL_LINKS[l.linkKey as keyof typeof SOCIAL_LINKS])
    );
    expect(new Set(urls).size, `duplicate URL: ${urls.join(", ")}`).toBe(urls.length);
  });

  it("keeps the two Facebook entries pointing at different pages", () => {
    expect(SOCIAL_LINKS.facebook).not.toBe(SOCIAL_LINKS.facebookProducciones);
  });
});
