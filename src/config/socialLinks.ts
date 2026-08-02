/**
 * Central definition of all social media / external links used across the site.
 * Update links here — never hardcode them in components.
 */
export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/djloboradio",
  facebook: "https://www.facebook.com/profile.php?id=61592519669407",
  facebookProducciones: "https://www.facebook.com/DjloboProduccionesSweden/",
  youtube: "https://www.youtube.com/@djloboproducciones3211",
  mixcloud: "https://www.mixcloud.com/live/DjLobo75/",
  zenoPlayer: "https://zeno.fm/radio/dj-lobo-radio-o85p/",
} as const;

export type SocialLinkKey = keyof typeof SOCIAL_LINKS;
export type Language = "sv" | "en" | "es";

export type LocalizedText = Record<Language, string>;

export interface SocialLinkGroupItem {
  /** Key matching SOCIAL_LINKS or a dynamic source (e.g. branding). */
  linkKey: SocialLinkKey | "branding.zenoPlayer";
  /** Visible link label per language. */
  label: LocalizedText;
  /** Accessible name per language. */
  ariaLabel: LocalizedText;
  /** Icon identifier mapped by the consumer. */
  icon: "facebook" | "instagram" | "youtube" | "music" | "radio";
}

export interface SocialLinkGroup {
  key: string;
  /** Section heading per language. */
  title: LocalizedText;
  /** Tailwind color token used for hover/text accents. */
  color: "neon-pink" | "neon-cyan";
  links: SocialLinkGroupItem[];
}

/**
 * Single source of truth for the footer social link sections.
 * Headings, links, labels, icons and ARIA labels all live here.
 */
export const SOCIAL_LINK_GROUPS: SocialLinkGroup[] = [
  {
    key: "socialMedia",
    title: { sv: "Sociala medier", en: "Social Media", es: "Redes sociales" },
    color: "neon-pink",
    links: [
      {
        linkKey: "facebookProducciones",
        label: { sv: "Facebook", en: "Facebook", es: "Facebook" },
        ariaLabel: {
          sv: "DJ Lobo Producciones på Facebook",
          en: "DJ Lobo Producciones on Facebook",
          es: "DJ Lobo Producciones en Facebook",
        },
        icon: "facebook",
      },
      {
        linkKey: "instagram",
        label: { sv: "Instagram", en: "Instagram", es: "Instagram" },
        ariaLabel: {
          sv: "DJ Lobo på Instagram",
          en: "DJ Lobo on Instagram",
          es: "DJ Lobo en Instagram",
        },
        icon: "instagram",
      },
      {
        linkKey: "youtube",
        label: { sv: "YouTube", en: "YouTube", es: "YouTube" },
        ariaLabel: {
          sv: "DJ Lobo på YouTube",
          en: "DJ Lobo on YouTube",
          es: "DJ Lobo en YouTube",
        },
        icon: "youtube",
      },
    ],
  },
  {
    key: "musicRadio",
    title: { sv: "Musik & Radio", en: "Music & Radio", es: "Música y Radio" },
    color: "neon-cyan",
    links: [
      {
        linkKey: "mixcloud",
        label: { sv: "Mixcloud", en: "Mixcloud", es: "Mixcloud" },
        ariaLabel: {
          sv: "DJ Lobo på Mixcloud",
          en: "DJ Lobo on Mixcloud",
          es: "DJ Lobo en Mixcloud",
        },
        icon: "music",
      },
      {
        linkKey: "branding.zenoPlayer",
        label: { sv: "ZenoFM", en: "ZenoFM", es: "ZenoFM" },
        ariaLabel: {
          sv: "Lyssna på DJ Lobo Producciones via ZenoFM",
          en: "Listen to DJ Lobo Producciones on ZenoFM",
          es: "Escucha DJ Lobo Producciones en ZenoFM",
        },
        icon: "radio",
      },
      {
        linkKey: "facebook",
        label: { sv: "FB Radio", en: "FB Radio", es: "FB Radio" },
        ariaLabel: {
          sv: "DJ Lobo Radio på Facebook",
          en: "DJ Lobo Radio on Facebook",
          es: "DJ Lobo Radio en Facebook",
        },
        icon: "facebook",
      },
    ],
  },
];

const MAX_URL_LENGTH = 2048;

/**
 * True when the value is a well-formed absolute http(s) URL of sane length.
 * Rejects empty values, whitespace-only values, relative paths and any
 * non-http protocol (javascript:, data:, etc).
 */
export const isValidHttpUrl = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_URL_LENGTH) return false;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    return Boolean(url.hostname) && url.hostname.includes(".");
  } catch {
    return false;
  }
};

/**
 * Returns the candidate URL when it is well-formed, otherwise the fallback.
 * Use for any URL that can come from the database or user input.
 */
export const safeUrl = (candidate: unknown, fallback: string): string =>
  isValidHttpUrl(candidate) ? candidate.trim() : fallback;

/**
 * Builds an Instagram profile URL from a stored username/handle.
 * Falls back to the central Instagram link if the handle is empty or invalid.
 */
export const instagramProfileUrl = (
  handle: unknown,
  fallback: string = SOCIAL_LINKS.instagram
): string => {
  if (typeof handle !== "string") return fallback;
  const clean = handle.trim().replace(/^@/, "").replace(/\/+$/, "");
  if (!clean || clean.length > 30 || !/^[A-Za-z0-9._]+$/.test(clean)) return fallback;
  return `https://www.instagram.com/${encodeURIComponent(clean)}`;
};

/**
 * Builds a YouTube channel URL from a stored @handle or channel id.
 * Falls back to the central YouTube link when the value is invalid.
 */
export const youtubeChannelUrl = (
  value: unknown,
  fallback: string = SOCIAL_LINKS.youtube
): string => {
  if (typeof value !== "string") return fallback;
  const clean = value.trim().replace(/\/+$/, "");
  if (!clean || clean.length > 100 || !/^@?[A-Za-z0-9._-]+$/.test(clean)) return fallback;
  return clean.startsWith("@")
    ? `https://www.youtube.com/${encodeURIComponent(clean)}`
    : `https://www.youtube.com/channel/${encodeURIComponent(clean)}`;
};
