import { useEffect, useState } from "react";
import { useUpcomingEvents, type CalendarEvent } from "./useUpcomingEvents";

export interface ScheduleNowState {
  /** Event whose [start, end] window contains "now". */
  current: CalendarEvent | null;
  /** Next future event (start > now). */
  next: CalendarEvent | null;
  /** Progress through `current` set, 0..1 (0 if no current). */
  progress: number;
  /** Milliseconds remaining until `next` starts (0 if none). */
  msToNext: number;
  /** Milliseconds remaining until `current` ends (0 if none). */
  msToCurrentEnd: number;
  isLoading: boolean;
}

/**
 * Derives the "now playing" / "up next" view from the Google Calendar feed.
 *
 * Re-evaluates every 30s so the NowPlayingBar progress bar advances and
 * the bar transitions cleanly when a set starts or ends, without the
 * visual jitter of a per-second tick.
 */
export function useScheduleNow(): ScheduleNowState {
  const { events, isLoading } = useUpcomingEvents();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    // 1s tick keeps the progress bar and "ends in" countdown visually
    // accurate to the wall clock without being expensive — the rest of
    // the bar only re-renders cheap text/width nodes.
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const now = Date.now();
  // Reference `tick` so eslint/react understand we want re-render on interval.
  void tick;

  let current: CalendarEvent | null = null;
  let next: CalendarEvent | null = null;

  for (const ev of events) {
    const start = new Date(ev.start).getTime();
    const end = new Date(ev.end).getTime();
    if (start <= now && now <= end) {
      // Pick the one ending soonest if multiple overlap.
      if (!current || end < new Date(current.end).getTime()) current = ev;
    } else if (start > now) {
      if (!next || start < new Date(next.start).getTime()) next = ev;
    }
  }

  let progress = 0;
  let msToCurrentEnd = 0;
  if (current) {
    const start = new Date(current.start).getTime();
    const end = new Date(current.end).getTime();
    const total = Math.max(1, end - start);
    progress = Math.min(1, Math.max(0, (now - start) / total));
    msToCurrentEnd = Math.max(0, end - now);
  }

  const msToNext = next ? Math.max(0, new Date(next.start).getTime() - now) : 0;

  return { current, next, progress, msToNext, msToCurrentEnd, isLoading };
}

/**
 * "om 2 h", "om 35 min", "om 1 d 3 h" — coarse, minute-floor relative
 * formatter for Swedish UI.
 */
export function formatRelativeShort(ms: number): string {
  if (ms <= 0) return "nu";
  const totalMin = Math.floor(ms / 60000);
  if (totalMin < 1) return "<1 min";
  if (totalMin < 60) return `${totalMin} min`;
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  if (hours < 24) return mins ? `${hours} h ${mins} min` : `${hours} h`;
  const days = Math.floor(hours / 24);
  const remH = hours % 24;
  return remH ? `${days} d ${remH} h` : `${days} d`;
}
