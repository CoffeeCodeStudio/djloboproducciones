import { describe, it, expect } from "vitest";
import { SOCIAL_LINKS, SOCIAL_LINK_GROUPS } from "./socialLinks";

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
