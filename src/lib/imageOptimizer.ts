/**
 * Supabase Image Optimization with fallback and srcset support.
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
  if (!url.includes(SUPABASE_STORAGE_HOST)) return url;
  if (url.includes("/render/image/")) return url;

  const renderUrl = url.replace("/object/public/", "/render/image/public/");
  const separator = renderUrl.includes("?") ? "&" : "?";
  return `${renderUrl}${separator}width=${width}&quality=${quality}&format=webp`;
}

export interface OptimizedImage {
  src: string;
  fallback: string;
  srcSet?: string;
}

/** Returns optimized URL with srcset for responsive loading */
export function optimizeWithFallback(
  url: string | null | undefined,
  width: number = 800,
  srcSetWidths?: number[]
): OptimizedImage {
  const original = url || "";
  const optimized = buildOptimizedUrl(original, width);
  const result: OptimizedImage = { src: optimized, fallback: original };

  if (srcSetWidths && original.includes(SUPABASE_STORAGE_HOST)) {
    result.srcSet = srcSetWidths
      .map((w) => `${buildOptimizedUrl(original, w)} ${w}w`)
      .join(", ");
  }

  return result;
}

/** Logo: small, with srcset for 1x/2x */
export function optimizeLogo(url: string | null | undefined): OptimizedImage {
  return optimizeWithFallback(url, 120, [80, 120, 240]);
}

/** Hero background: large */
export function optimizeHero(url: string | null | undefined): OptimizedImage {
  return optimizeWithFallback(url, 1280, [640, 960, 1280, 1920]);
}

/** Profile image: medium, with srcset for responsive sizes */
export function optimizeProfile(url: string | null | undefined): OptimizedImage {
  return optimizeWithFallback(url, 400, [144, 224, 320, 400]);
}

/** Gallery thumbnails */
export function optimizeGallery(url: string | null | undefined): OptimizedImage {
  return optimizeWithFallback(url, 400, [200, 400]);
}
