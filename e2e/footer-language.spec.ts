import { test, expect, type Page } from "@playwright/test";
import { SOCIAL_LINK_GROUPS, SOCIAL_LINKS } from "../src/config/socialLinks";

type Lang = "sv" | "en";

const group = (key: string) => {
  const found = SOCIAL_LINK_GROUPS.find((g) => g.key === key);
  if (!found) throw new Error(`Missing footer group: ${key}`);
  return found;
};

const socialMedia = group("socialMedia");
const musicRadio = group("musicRadio");

/** Expected href per link key (ZenoFM can be overridden by branding, so we only check the host). */
const EXPECTED_HREF: Record<string, string | RegExp> = {
  facebookProducciones: SOCIAL_LINKS.facebookProducciones,
  instagram: /instagram\.com/,
  youtube: /youtube\.com/,
  mixcloud: SOCIAL_LINKS.mixcloud,
  "branding.zenoPlayer": /^https?:\/\//,
  facebook: SOCIAL_LINKS.facebook,
};

const socialGroupLinks = (page: Page) =>
  page.locator(
    'footer nav[aria-label="Sociala medier"] a, footer nav[aria-label="Social Media"] a, footer nav[aria-label="Musik & Radio"] a, footer nav[aria-label="Music & Radio"] a'
  );

const gotoLang = async (page: Page, lang: Lang) => {
  await page.goto(lang === "sv" ? "/sv" : "/en", { waitUntil: "domcontentloaded" });
  await page.locator("footer").scrollIntoViewIfNeeded();
};

const assertGroup = async (
  page: Page,
  lang: Lang,
  g: typeof socialMedia
) => {
  const nav = page.locator("footer").getByRole("navigation", { name: g.title[lang], exact: true });
  await expect(nav, `${g.key} nav should exist in ${lang}`).toBeVisible();

  await expect(
    page.locator("footer").getByRole("heading", { name: g.title[lang], exact: true })
  ).toBeVisible();

  const links = nav.getByRole("link");
  await expect(links).toHaveCount(g.links.length);
  await expect(links).toHaveText(g.links.map((l) => l.label[lang]));

  for (const [i, item] of g.links.entries()) {
    const link = links.nth(i);
    await expect(link).toHaveAttribute("aria-label", item.ariaLabel[lang]);
    await expect(link).toHaveAttribute("href", EXPECTED_HREF[item.linkKey]);
    await expect(link).toHaveAttribute("target", "_blank");
  }
};

test.describe("footer social groups per language", () => {
  for (const lang of ["sv", "en"] as const) {
    test(`shows the correct groups and links in ${lang}`, async ({ page }) => {
      await gotoLang(page, lang);
      await assertGroup(page, lang, socialMedia);
      await assertGroup(page, lang, musicRadio);
    });
  }

  test("switching sv -> en translates headings but keeps the same links", async ({ page }) => {
    await gotoLang(page, "sv");
    await expect(
      page.locator("footer").getByRole("heading", { name: "Sociala medier", exact: true })
    ).toBeVisible();
    await expect(
      page.locator("footer").getByRole("heading", { name: "Musik & Radio", exact: true })
    ).toBeVisible();

    const svHrefs = await socialGroupLinks(page).evaluateAll((els) =>
      els.map((el) => (el as HTMLAnchorElement).href)
    );

    await gotoLang(page, "en");
    await expect(
      page.locator("footer").getByRole("heading", { name: "Social Media", exact: true })
    ).toBeVisible();
    await expect(
      page.locator("footer").getByRole("heading", { name: "Music & Radio", exact: true })
    ).toBeVisible();
    await expect(
      page.locator("footer").getByRole("heading", { name: "Sociala medier", exact: true })
    ).toHaveCount(0);

    const enHrefs = await socialGroupLinks(page).evaluateAll((els) =>
      els.map((el) => (el as HTMLAnchorElement).href)
    );
    expect(enHrefs).toEqual(svHrefs);
  });
});
