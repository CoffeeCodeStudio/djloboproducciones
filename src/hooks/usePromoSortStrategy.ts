import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type PromoSortStrategy =
  | "priority"
  | "nearest_end"
  | "nearest_start"
  | "rotation";

export const PROMO_SORT_STRATEGY_LABELS: Record<PromoSortStrategy, string> = {
  priority: "Prioritet (manuell)",
  nearest_end: "Närmast slut först",
  nearest_start: "Närmast start först",
  rotation: "Rotation (round-robin)",
};

export const PROMO_SORT_STRATEGY_DESCRIPTIONS: Record<PromoSortStrategy, string> = {
  priority:
    "Använd priority-värdet på varje kampanj. Högsta prioritet vinner; nyast som tiebreaker.",
  nearest_end:
    "Visar kampanjen vars 'aktiv till' är närmast i tid – skapar urgency för slutdatum.",
  nearest_start:
    "Visar den senast aktiverade kampanjen först – nyligen startade kampanjer prioriteras.",
  rotation:
    "Roterar mellan aktiva kampanjer per besök så att alla får visning över tid.",
};

const DEFAULT_STRATEGY: PromoSortStrategy = "nearest_start";

export function usePromoSortStrategy() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["promo-sort-strategy"],
    queryFn: async (): Promise<PromoSortStrategy> => {
      const { data, error } = await supabase
        .from("site_branding")
        .select("promo_sort_strategy")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      const value = (data as { promo_sort_strategy?: string } | null)
        ?.promo_sort_strategy;
      if (
        value === "priority" ||
        value === "nearest_end" ||
        value === "nearest_start" ||
        value === "rotation"
      ) {
        return value;
      }
      return DEFAULT_STRATEGY;
    },
    staleTime: 5 * 60 * 1000,
  });

  const update = useMutation({
    mutationFn: async (strategy: PromoSortStrategy) => {
      // Get the singleton row id first
      const { data: row, error: rowErr } = await supabase
        .from("site_branding")
        .select("id")
        .limit(1)
        .maybeSingle();
      if (rowErr) throw rowErr;
      if (!row) throw new Error("Inga branding-inställningar hittades.");

      const { error } = await supabase
        .from("site_branding")
        .update({ promo_sort_strategy: strategy } as never)
        .eq("id", row.id);
      if (error) throw error;
      return strategy;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promo-sort-strategy"] });
      queryClient.invalidateQueries({ queryKey: ["active-promos"] });
      toast({ title: "Sorteringsstrategi sparad" });
    },
    onError: (err: Error) => {
      toast({
        title: "Kunde inte spara",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  return {
    strategy: data ?? DEFAULT_STRATEGY,
    isLoading,
    setStrategy: update.mutate,
    isSaving: update.isPending,
  };
}
