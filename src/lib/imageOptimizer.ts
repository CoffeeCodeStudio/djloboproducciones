/**
 * Supabase Image Optimization with fallback.
 * Tries the /render/image/ endpoint for WebP + resize.
 * If the plan doesn't support it, components use onerror fallback to original URL.
 */

const SUPABASE_STORAGE_HOST = "supabase.co/storage";

function buildOptimizedUrl(
  url: string,
  width: number,
  quality: number = 70
): string {
  if (!url) return "";
  // Only transform Supabase storage URLs
  if (!url.includes(SUPABASE_STORAGE_HOST)) return url;
  // Don't double-transform
  if (url.includes("/render/image/")) return url;

  const renderUrl = url.replace("/object/public/", "/render/image/public/");
  const separator = renderUrl.includes("?") ? "&" : "?";
  return `${renderUrl}${separator}width=${width}&quality=${quality}&format=webp`;
}

/** Returns [optimizedUrl, originalUrl] for use with onerror fallback */
export function optimizeWithFallback(
  url: string | null | undefined,
  width: number = 800
): { src: string; fallback: string } {
  const original = url || "";
  const optimized = buildOptimizedUrl(original, width);
  return { src: optimized, fallback: original };
}

export function optimizeLogo(url: string | null | undefined) {
  return optimizeWithFallback(url, 200);
}

export function optimizeHero(url: string | null | undefined) {
  return optimizeWithFallback(url, 640);
}

export function optimizeProfile(url: string | null | undefined) {
  return optimizeWithFallback(url, 400);
}

export function optimizeGallery(url: string | null | undefined) {
  return optimizeWithFallback(url, 400);
}
