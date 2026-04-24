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

export function useActivePromo() {
  const { data, isLoading } = useQuery({
    queryKey: ["active-promo"],
    queryFn: async (): Promise<Promo | null> => {
      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from("promos")
        .select("*")
        .eq("is_active", true)
        .lte("active_from", nowIso)
        .gte("active_to", nowIso)
        .order("priority", { ascending: false })
        .order("active_from", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;
      return (data?.[0] as Promo | undefined) ?? null;
    },
    staleTime: 60 * 1000,
  });

  return { promo: data ?? null, isLoading };
}
