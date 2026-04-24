import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export type PromoEventType =
  | "shown"
  | "closed"
  | "cta_click"
  | "permanent_dismiss"
  | "mini_shown"
  | "mini_dismissed"
  | "reopen_click";

const SESSION_KEY = "promo_analytics_session_id";

function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

/**
 * Fire-and-forget logger for promo analytics events.
 * Never throws — failures are logged but never block UX.
 * Skips logging entirely for the admin "preview" promo.
 */
export function trackPromoEvent(
  promoId: string,
  eventType: PromoEventType,
  metadata?: Record<string, unknown>
): void {
  if (!promoId || promoId === "preview") return;

  void supabase
    .from("promo_events")
    .insert({
      promo_id: promoId,
      event_type: eventType,
      session_id: getSessionId(),
      metadata: metadata ?? null,
    })
    .then(({ error }) => {
      if (error) logger.warn("[promoAnalytics] Failed to log event", { eventType, error });
    });
}
