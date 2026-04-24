import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Promo {
  id: string;
  title: string;
  subtitle: string | null;
  flyer_image_url: string | null;
  youtube_url: string | null;
  video_file_url: string | null;
  cta_text: string | null;
  cta_url: string | null;
  source: "calendar" | "manual";
  google_event_id: string | null;
  active_from: string;
  active_to: string;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Returns ALL currently-active promos sorted by:
 *   priority DESC → active_from DESC (just startat först) → created_at DESC
 *
 * `promo` is the first one (back-compat). `promos` is the full ordered list
 * so PromoManager can rotate to the next when one is closed/expires.
 */
export function useActivePromo() {
  const { data, isLoading } = useQuery({
    queryKey: ["active-promos"],
    queryFn: async (): Promise<Promo[]> => {
      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from("promos")
        .select("*")
        .eq("is_active", true)
        .lte("active_from", nowIso)
        .gte("active_to", nowIso)
        .order("priority", { ascending: false })
        .order("active_from", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as Promo[];
    },
    staleTime: 60 * 1000,
    // Re-check periodically so an expiring promo gets dropped client-side too
    refetchInterval: 60 * 1000,
  });

  const promos = data ?? [];
  return { promo: promos[0] ?? null, promos, isLoading };
}
