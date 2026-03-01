/**
 * Appends Supabase Storage image transformation parameters to URLs.
 * Uses the standard public URL since image transformations require a paid plan.
 * Returns the original URL unchanged to ensure images always display.
 */

export function optimizeStorageUrl(
  url: string | null | undefined,
  _options?: { width?: number; quality?: number; format?: string }
): string {
  if (!url) return "";
  return url;
}

export function optimizeLogo(url: string | null | undefined): string {
  return optimizeStorageUrl(url);
}

export function optimizeHero(url: string | null | undefined): string {
  return optimizeStorageUrl(url);
}

export function optimizeProfile(url: string | null | undefined): string {
  return optimizeStorageUrl(url);
}

export function optimizeGallery(url: string | null | undefined): string {
  return optimizeStorageUrl(url);
}
