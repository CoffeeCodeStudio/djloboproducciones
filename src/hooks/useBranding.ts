import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SiteBranding {
  id: string;
  hero_image_url: string | null;
  logo_url: string | null;
  background_image_url: string | null;
  profile_image_url: string | null;
  primary_glow_color: string | null;
  secondary_glow_color: string | null;
  accent_color: string | null;
  site_name: string | null;
  tagline: string | null;
  bio_text: string | null;
  youtube_video_id: string | null;
  youtube_channel_id: string | null;
  instagram_username: string | null;
  og_image_url: string | null;
  radio_image_url: string | null;
  radio_section_title: string | null;
  live_set_video_1: string | null;
  live_set_video_2: string | null;
  live_set_video_3: string | null;
  live_set_video_4: string | null;
  live_set_video_5: string | null;
  instagram_post_1: string | null;
  instagram_post_2: string | null;
  instagram_post_3: string | null;
  instagram_post_4: string | null;
  instagram_post_5: string | null;
  instagram_post_6: string | null;
  updated_at: string;
}

const DEFAULT_BRANDING: Partial<SiteBranding> = {
  primary_glow_color: "300 100% 50%",
  secondary_glow_color: "180 100% 50%",
  accent_color: "270 100% 60%",
  site_name: "DJ Lobo Radio",
  tagline: "Bringing the best of 80s and 90s music",
};

const LOGO_CACHE_KEY = "djlobo_logo_url";

export const useBranding = () => {
  const cachedLogo = typeof window !== "undefined" ? localStorage.getItem(LOGO_CACHE_KEY) : null;
  const [branding, setBranding] = useState<SiteBranding | null>(
    cachedLogo ? { logo_url: cachedLogo } as any : null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBranding = async () => {
    // Only set loading to true if we don't have a cached version to avoid UI flashes
    if (!cachedLogo) {
      setLoading(true);
    }
    const { data, error } = await supabase
      .from("site_branding")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) {
      setError(error.message);
    } else if (data) {
      setBranding(data);
      if (data.logo_url) {
        localStorage.setItem(LOGO_CACHE_KEY, data.logo_url);
      }
    }
    setLoading(false);
  };

  const updateBranding = async (updates: Partial<SiteBranding>) => {
    if (!branding?.id) {
      console.error("[Branding] No branding record found for update");
      return { error: "No branding record found" };
    }

    console.log("[Branding] Saving updates:", Object.keys(updates));
    const { error } = await supabase
      .from("site_branding")
      .update(updates)
      .eq("id", branding.id);

    if (error) {
      console.error("[Branding] Save failed:", error.message);
    } else {
      console.log("[Branding] ✅ Save successful");
      setBranding((prev) => prev ? { ...prev, ...updates } : null);
    }

    return { error: error?.message || null };
  };

  const uploadImage = async (
    file: File,
    imageType: "hero" | "logo" | "background" | "profile" | "radio"
  ): Promise<{ url: string | null; error: string | null }> => {
    // Validate size with clear message
    if (file.size > 5 * 1024 * 1024) {
      return { url: null, error: `Filen är för stor (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 5 MB.` };
    }
    if (!file.type.startsWith("image/")) {
      return { url: null, error: "Filen är inte en bild. Välj en JPG, PNG eller WebP-fil." };
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${imageType}-${Date.now()}.${fileExt}`;
    const filePath = `${imageType}/${fileName}`;

    console.log(`[Branding] Uploading ${imageType} to: ${filePath}`);
    const { error: uploadError } = await supabase.storage
      .from("branding")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      const msg = uploadError.message.includes("Payload too large")
        ? "Filen är för stor för servern. Försök med en mindre bild."
        : uploadError.message.includes("network")
        ? "Anslutningen bröts. Kontrollera din internetanslutning och försök igen."
        : `Uppladdningsfel: ${uploadError.message}`;
      return { url: null, error: msg };
    }

    const { data } = supabase.storage.from("branding").getPublicUrl(filePath);
    const publicUrl = data.publicUrl;
    console.log(`[Branding] ✅ Upload complete. Public URL: ${publicUrl}`);

    // Save to upload history
    await supabase.from("image_upload_history" as any).insert({
      category: imageType,
      image_url: publicUrl,
      storage_path: filePath,
    } as any);

    return { url: publicUrl, error: null };
  };

  useEffect(() => {
    fetchBranding();
  }, []);

  // Apply branding colors to CSS variables + OG image meta tag
  useEffect(() => {
    if (branding) {
      const root = document.documentElement;
      if (branding.primary_glow_color) {
        root.style.setProperty("--neon-pink", branding.primary_glow_color);
        root.style.setProperty("--primary", branding.primary_glow_color);
      }
      if (branding.secondary_glow_color) {
        root.style.setProperty("--neon-cyan", branding.secondary_glow_color);
        root.style.setProperty("--secondary", branding.secondary_glow_color);
      }
      if (branding.accent_color) {
        root.style.setProperty("--neon-purple", branding.accent_color);
        root.style.setProperty("--accent", branding.accent_color);
      }
      // Dynamic OG image
      if ((branding as any).og_image_url) {
        let ogMeta = document.querySelector('meta[property="og:image"]') as HTMLMetaElement;
        if (!ogMeta) {
          ogMeta = document.createElement("meta");
          ogMeta.setAttribute("property", "og:image");
          document.head.appendChild(ogMeta);
        }
        ogMeta.content = (branding as any).og_image_url;
      }
    }
  }, [branding]);

  return {
    branding: branding ? { ...DEFAULT_BRANDING, ...branding } : null,
    loading,
    error,
    updateBranding,
    uploadImage,
    refetch: fetchBranding,
  };
};
