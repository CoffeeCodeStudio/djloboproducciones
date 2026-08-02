/**
 * Central definition of all social media links used across the site.
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
