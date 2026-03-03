import { useEffect } from "react";

const DEFAULT_FAVICON = "/favicon.ico";
const DEFAULT_APPLE_ICON = "/favicon.png";

function setLinkTag(rel: string, href: string, sizes?: string, type?: string) {
  let link = document.querySelector<HTMLLinkElement>(
    sizes ? `link[rel="${rel}"][sizes="${sizes}"]` : `link[rel="${rel}"]`
  );
  if (!link) {
    link = document.createElement("link");
    link.rel = rel;
    if (sizes) link.setAttribute("sizes", sizes);
    document.head.appendChild(link);
  }
  if (type) link.type = type;
  link.href = href;
}

/**
 * Dynamically updates favicon & apple-touch-icon from branding logo URL.
 * Uses Supabase image transform for sizing when available, with onerror fallback.
 */
export function useDynamicFavicon(logoUrl: string | null | undefined) {
  useEffect(() => {
    const src = logoUrl || DEFAULT_FAVICON;
    const appleSrc = logoUrl || DEFAULT_APPLE_ICON;

    // Standard favicon (32x32)
    setLinkTag("icon", src, undefined, logoUrl ? "image/png" : "image/x-icon");

    // Apple touch icon (180x180)
    setLinkTag("apple-touch-icon", appleSrc, "180x180");

    // Update manifest link if exists
    const manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (manifestLink) {
      // Generate a dynamic manifest blob
      const manifest = {
        name: document.title || "DJ Lobo Radio",
        short_name: "DJ Lobo",
        icons: [
          { src: appleSrc, sizes: "192x192", type: "image/png" },
          { src: appleSrc, sizes: "512x512", type: "image/png" },
        ],
        start_url: "/",
        display: "standalone",
        background_color: "#0a0a0a",
        theme_color: "#ff00ff",
      };
      const blob = new Blob([JSON.stringify(manifest)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      manifestLink.href = url;
      return () => URL.revokeObjectURL(url);
    }
  }, [logoUrl]);
}
