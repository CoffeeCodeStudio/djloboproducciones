import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  location?: string;
}

export function useUpcomingEvents() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["upcoming-calendar-events"],
    queryFn: async (): Promise<CalendarEvent[]> => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke("google-calendar", {
          body: {},
        });

        if (fnError || !data?.items) return [];

        const now = new Date();

        return (data.items as any[])
          .map((item) => {
            const start = item.start?.dateTime || item.start?.date;
            const end = item.end?.dateTime || item.end?.date;
            if (!start) return null;
            return {
              id: item.id,
              summary: item.summary || "Untitled Event",
              start,
              end: end || start,
              location: item.location,
            } as CalendarEvent;
          })
          // Keep events that have not yet ended (covers currently-LIVE sets).
          .filter((e): e is CalendarEvent => e !== null && new Date(e.end) >= now)
          .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    events: data ?? [],
    isLoading,
    error: (error as Error) ?? null,
  };
}
