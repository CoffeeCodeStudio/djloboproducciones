/**
 * Appends Supabase Storage image transformation parameters to URLs.
 * Only transforms URLs from our Supabase storage bucket.
 */

const SUPABASE_STORAGE_HOST = "gzdnxaseaimdobahilyc.supabase.co/storage";

export function optimizeStorageUrl(
  url: string | null | undefined,
  options: { width?: number; quality?: number; format?: string } = {}
): string {
  if (!url) return "";
  
  // Only transform Supabase storage URLs
  if (!url.includes(SUPABASE_STORAGE_HOST)) return url;
  
  // Don't double-transform
  if (url.includes("?width=") || url.includes("&width=")) return url;

  const { width = 800, quality = 70, format = "webp" } = options;
  
  // Replace /object/public/ with /render/image/public/ for transformations
  const renderUrl = url.replace("/object/public/", "/render/image/public/");
  
  return `${renderUrl}?width=${width}&quality=${quality}&format=${format}`;
}

export function optimizeLogo(url: string | null | undefined): string {
  return optimizeStorageUrl(url, { width: 120, quality: 75, format: "webp" });
}

export function optimizeHero(url: string | null | undefined): string {
  return optimizeStorageUrl(url, { width: 640, quality: 75, format: "webp" });
}

export function optimizeProfile(url: string | null | undefined): string {
  return optimizeStorageUrl(url, { width: 400, quality: 75, format: "webp" });
}

export function optimizeGallery(url: string | null | undefined): string {
  return optimizeStorageUrl(url, { width: 400, quality: 70, format: "webp" });
}
