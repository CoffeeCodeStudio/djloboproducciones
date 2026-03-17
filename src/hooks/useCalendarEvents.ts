import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CalendarEvent {
  id: string;
  title: string;
  location: string;
  date: Date;
  dateFormatted: string;
  timeFormatted: string;
}

const CACHE_KEY = "dj-lobo-calendar-events";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const FETCH_TIMEOUT = 8000; // 8 seconds

interface CachedData {
  events: Array<Omit<CalendarEvent, "date"> & { date: string }>;
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
    return cached.events.map((e) => ({ ...e, date: new Date(e.date) }));
  } catch {
    return null;
  }
};

const setCachedEvents = (events: CalendarEvent[]) => {
  try {
    const data: CachedData = {
      events: events.map((e) => ({ ...e, date: e.date.toISOString() })),
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

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      // Fetch calendar ID from branding
      const { data: branding, error: brandingError } = await supabase
        .from("site_branding")
        .select("google_calendar_id")
        .limit(1)
        .maybeSingle();

      if (brandingError || !branding?.google_calendar_id) {
        setEvents([]);
        setIsPlaceholder(true);
        setLoading(false);
        return;
      }

      // Fetch events with timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

      const { data, error: fnError } = await supabase.functions.invoke("google-calendar", {
        body: {},
      });

      clearTimeout(timeout);

      if (fnError) {
        console.error("[Calendar] Edge function error:", fnError);
        // Keep cached data if available, show error only if no cache
        if (events.length === 0) {
          setError(true);
          setIsPlaceholder(true);
        }
        setLoading(false);
        return;
      }

      if (data?.items && data.items.length > 0) {
        const formatted: CalendarEvent[] = data.items.slice(0, 10).map((item: any) => {
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
          };
        });

        setEvents(formatted);
        setCachedEvents(formatted);
        setIsPlaceholder(false);
      } else {
        setEvents([]);
        setIsPlaceholder(true);
      }
    } catch (err) {
      console.error("[Calendar] Unexpected error:", err);
      if (events.length === 0) {
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
