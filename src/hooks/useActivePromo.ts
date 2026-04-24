import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  usePromoSortStrategy,
  type PromoSortStrategy,
} from "./usePromoSortStrategy";

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

const ROTATION_STORAGE_KEY = "promo_rotation_index";

/**
 * Apply the chosen sort strategy on the client. We always fetch the full set
 * (cheap — there are very few active promos at any time) and reorder locally
 * so the strategy can be changed without a DB roundtrip.
 */
function sortByStrategy(list: Promo[], strategy: PromoSortStrategy): Promo[] {
  const arr = [...list];
  switch (strategy) {
    case "priority":
      arr.sort(
        (a, b) =>
          b.priority - a.priority ||
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      return arr;

    case "nearest_end":
      arr.sort(
        (a, b) =>
          new Date(a.active_to).getTime() - new Date(b.active_to).getTime() ||
          b.priority - a.priority,
      );
      return arr;

    case "nearest_start":
      arr.sort(
        (a, b) =>
          new Date(b.active_from).getTime() -
            new Date(a.active_from).getTime() || b.priority - a.priority,
      );
      return arr;

    case "rotation": {
      // Stable round-robin across visits: rotate the array based on a
      // monotonically increasing index stored in localStorage.
      if (arr.length <= 1) return arr;
      // Always order by id first so rotation is deterministic regardless of
      // the DB's natural order.
      arr.sort((a, b) => a.id.localeCompare(b.id));
      let idx = 0;
      try {
        const raw = localStorage.getItem(ROTATION_STORAGE_KEY);
        idx = raw ? parseInt(raw, 10) : 0;
        if (Number.isNaN(idx) || idx < 0) idx = 0;
        localStorage.setItem(
          ROTATION_STORAGE_KEY,
          String((idx + 1) % arr.length),
        );
      } catch {
        /* ignore */
      }
      const offset = idx % arr.length;
      return [...arr.slice(offset), ...arr.slice(0, offset)];
    }
  }
}

/**
 * Returns ALL currently-active promos sorted according to the admin-selected
 * strategy in `site_branding.promo_sort_strategy`.
 *
 * `promo` is the first one (back-compat). `promos` is the full ordered list
 * so PromoManager can rotate to the next when one is closed/expires.
 */
export function useActivePromo() {
  const { strategy } = usePromoSortStrategy();

  const { data, isLoading } = useQuery({
    queryKey: ["active-promos", strategy],
    queryFn: async (): Promise<Promo[]> => {
      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from("promos")
        .select("*")
        .eq("is_active", true)
        .lte("active_from", nowIso)
        .gte("active_to", nowIso);

      if (error) throw error;
      return sortByStrategy((data ?? []) as Promo[], strategy);
    },
    staleTime: 60 * 1000,
    // Re-check periodically so an expiring promo gets dropped client-side too
    refetchInterval: 60 * 1000,
  });

  const promos = data ?? [];
  return { promo: promos[0] ?? null, promos, isLoading };
}
