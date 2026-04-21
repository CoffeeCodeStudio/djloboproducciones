import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Promo } from "./useActivePromo";

export type PromoInput = Omit<Promo, "id" | "created_at" | "updated_at">;

export function usePromosAdmin() {
  const queryClient = useQueryClient();

  const { data: promos = [], isLoading } = useQuery({
    queryKey: ["admin-promos"],
    queryFn: async (): Promise<Promo[]> => {
      const { data, error } = await supabase
        .from("promos")
        .select("*")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as Promo[];
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-promos"] });
    queryClient.invalidateQueries({ queryKey: ["active-promo"] });
  };

  const createPromo = useMutation({
    mutationFn: async (input: Partial<PromoInput>) => {
      const { data, error } = await supabase
        .from("promos")
        .insert(input as any)
        .select()
        .single();
      if (error) throw error;
      return data as Promo;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Kampanj tillagd!");
    },
    onError: (err: any) => {
      toast.error("Kunde inte lägga till kampanj", { description: err.message });
    },
  });

  const updatePromo = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PromoInput> }) => {
      const { data, error } = await supabase
        .from("promos")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Promo;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Kampanj uppdaterad!");
    },
    onError: (err: any) => {
      toast.error("Kunde inte uppdatera kampanj", { description: err.message });
    },
  });

  const deletePromo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("promos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Kampanj borttagen!");
    },
    onError: (err: any) => {
      toast.error("Kunde inte ta bort kampanj", { description: err.message });
    },
  });

  const togglePromoActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("promos")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      invalidate();
      toast.success(variables.is_active ? "Kampanj aktiverad!" : "Kampanj inaktiverad!");
    },
    onError: (err: any) => {
      toast.error("Kunde inte ändra status", { description: err.message });
    },
  });

  const duplicatePromo = useMutation({
    mutationFn: async (id: string) => {
      const { data: original, error: fetchError } = await supabase
        .from("promos")
        .select("*")
        .eq("id", id)
        .single();
      if (fetchError) throw fetchError;

      const { id: _id, created_at: _c, updated_at: _u, ...rest } = original as Promo;
      const copy = {
        ...rest,
        title: `${rest.title} (Kopia)`,
        is_active: false,
      };

      const { data, error } = await supabase
        .from("promos")
        .insert(copy as any)
        .select()
        .single();
      if (error) throw error;
      return data as Promo;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Kampanj duplicerad!");
    },
    onError: (err: any) => {
      toast.error("Kunde inte duplicera kampanj", { description: err.message });
    },
  });

  return {
    promos,
    isLoading,
    createPromo,
    updatePromo,
    deletePromo,
    togglePromoActive,
    duplicatePromo,
  };
}
