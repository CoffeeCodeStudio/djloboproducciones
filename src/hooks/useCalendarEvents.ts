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
        const now = new Date();

        // Single source of truth for Stockholm-local field extraction. Using
        // Intl.DateTimeFormat keeps the underlying Date in real UTC (so
        // getTime() comparisons remain DST-safe everywhere downstream) while
        // letting us read the wall-clock day/month/weekday/time as they appear
        // in Sweden — including correct shifts across CET ↔ CEST.
        const TZ = "Europe/Stockholm";
        const dayNamesByLocale: Record<string, string[]> = {
          sv: ["Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"],
        };
        const monthNamesByLocale: Record<string, string[]> = {
          sv: ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"],
        };
        const partsFmt = new Intl.DateTimeFormat("en-US", {
          timeZone: TZ,
          weekday: "short",
          year: "numeric",
          month: "numeric",
          day: "numeric",
        });
        const timeFmt = new Intl.DateTimeFormat("sv-SE", {
          timeZone: TZ,
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23",
        });
        const weekdayIndex: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

        const formatted: CalendarEvent[] = data.items
          .map((item: any) => {
            const startDate = new Date(item.start.dateTime || item.start.date);
            // Fall back to start if Calendar didn't provide an end (all-day quirks).
            const endDate = new Date(item.end?.dateTime || item.end?.date || startDate);

            const parts = partsFmt.formatToParts(startDate);
            const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
            const stockholmDay = parseInt(get("day"), 10);
            const stockholmMonthIdx = parseInt(get("month"), 10) - 1;
            const stockholmWeekday = weekdayIndex[get("weekday")] ?? 0;

            return {
              id: item.id,
              title: item.summary || "Untitled Event",
              location: item.location || "",
              // Keep real UTC Date — comparisons (LIVE detection, sorting)
              // must never operate on a fake "shifted" Date.
              date: startDate,
              endDate,
              dateFormatted: `${dayNamesByLocale.sv[stockholmWeekday]} ${stockholmDay} ${monthNamesByLocale.sv[stockholmMonthIdx]}`,
              timeFormatted: timeFmt.format(startDate),
            } as CalendarEvent;
          })
          // Keep events that have not yet ended — covers currently-LIVE sets.
          .filter((e: CalendarEvent) => e.endDate >= now)
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
