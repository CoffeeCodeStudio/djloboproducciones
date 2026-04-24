import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CalendarEvent {
  id: string;
  title: string;
  location: string;
  date: Date;
  endDate: Date;
  dateFormatted: string;
  timeFormatted: string;
}

const CACHE_KEY = "dj-lobo-calendar-events";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CachedData {
  events: Array<Omit<CalendarEvent, "date" | "endDate"> & { date: string; endDate: string }>;
  timestamp: number;
}

const getCachedEvents = (): CalendarEvent[] | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: CachedData = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return cached.events.map((e) => ({
      ...e,
      date: new Date(e.date),
      endDate: new Date(e.endDate),
    }));
  } catch {
    return null;
  }
};

const setCachedEvents = (events: CalendarEvent[]) => {
  try {
    const data: CachedData = {
      events: events.map((e) => ({
        ...e,
        date: e.date.toISOString(),
        endDate: e.endDate.toISOString(),
      })),
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable
  }
};

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>(() => getCachedEvents() || []);
  const [loading, setLoading] = useState(() => !getCachedEvents());
  const [isPlaceholder, setIsPlaceholder] = useState(false);
  const [error, setError] = useState(false);
  const eventsRef = useRef<CalendarEvent[]>(events);

  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("google-calendar", {
        body: {},
      });

      if (fnError) {
        console.error("[Calendar] Edge function error:", fnError);
        // Keep cached data if available, show error only if no cache
        if (eventsRef.current.length === 0) {
          setError(true);
          setIsPlaceholder(true);
        }
        setLoading(false);
        return;
      }

      // Edge function returns { error: 'No calendar configured' } as a 404 payload
      if (data?.error) {
        setEvents([]);
        setIsPlaceholder(true);
        setLoading(false);
        return;
      }

      if (data?.items && data.items.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const formatted: CalendarEvent[] = data.items
          .map((item: any) => {
            const startDate = new Date(item.start.dateTime || item.start.date);
            const dayNames = ["Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"];
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"];

            // Format in Stockholm timezone to avoid UTC shift
            const stockholmDate = new Date(startDate.toLocaleString("en-US", { timeZone: "Europe/Stockholm" }));

            return {
              id: item.id,
              title: item.summary || "Untitled Event",
              location: item.location || "",
              date: stockholmDate,
              dateFormatted: `${dayNames[stockholmDate.getDay()]} ${stockholmDate.getDate()} ${monthNames[stockholmDate.getMonth()]}`,
              timeFormatted: startDate.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Stockholm" }),
            } as CalendarEvent;
          })
          .filter((e: CalendarEvent) => e.date >= today)
          .sort((a: CalendarEvent, b: CalendarEvent) => a.date.getTime() - b.date.getTime())
          .slice(0, 10);

        if (formatted.length > 0) {
          setEvents(formatted);
          setCachedEvents(formatted);
          setIsPlaceholder(false);
        } else {
          setEvents([]);
          setIsPlaceholder(true);
        }
      } else {
        setEvents([]);
        setIsPlaceholder(true);
      }
    } catch (err) {
      console.error("[Calendar] Unexpected error:", err);
      if (eventsRef.current.length === 0) {
        setError(true);
        setIsPlaceholder(true);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, loading, isPlaceholder, error, refetch: fetchEvents };
};
