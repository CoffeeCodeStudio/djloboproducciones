import { useEffect, useState } from "react";
import { useActivePromo } from "@/hooks/useActivePromo";
import { trackPromoEvent } from "@/lib/promoAnalytics";
import PromoPopup from "./PromoPopup";
import PromoMiniCard from "./PromoMiniCard";

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
// Session-only key for Mini "hide" (cleared when the tab/browser session ends)
const MINI_SESSION_HIDDEN_KEY = (id: string) => `promo_mini_session_hidden_${id}`;
const SEEN_KEY = (id: string) => `promo_seen_${id}`;
const PERMANENT_DISMISS_KEY = (id: string) => `promo_permanent_dismissed_${id}`;
// Set when user clicks the navbar megaphone — survives page refresh
// so the popup re-opens automatically while the promo is still active.
const FORCE_REOPEN_KEY = (id: string) => `promo_force_reopen_${id}`;

const PromoManager = () => {
  const { promos } = useActivePromo();
  const [mode, setMode] = useState<"hidden" | "popup" | "mini">("hidden");
  const [reopenedFromMini, setReopenedFromMini] = useState(false);
  // Index into the active promos list — advances as user dismisses one.
  const [currentIndex, setCurrentIndex] = useState(0);
  // IDs the user dismissed during this session — skip them when rotating.
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());

  // Build the queue: ordered active promos minus anything dismissed this session
  // or hard-dismissed via localStorage.
  const queue = promos.filter((p) => {
    if (skippedIds.has(p.id)) return false;
    try {
      if (localStorage.getItem(PERMANENT_DISMISS_KEY(p.id))) return false;
      if (sessionStorage.getItem(MINI_SESSION_HIDDEN_KEY(p.id))) return false;
    } catch {
      /* ignore */
    }
    return true;
  });

  const promo = queue[currentIndex] ?? queue[0] ?? null;

  // If the current promo disappears from the queue (expired, dismissed, etc.)
  // reset the index so we show the next available one.
  useEffect(() => {
    if (currentIndex >= queue.length && queue.length > 0) {
      setCurrentIndex(0);
    }
  }, [queue.length, currentIndex]);

  useEffect(() => {
    if (!promo) {
      setMode("hidden");
      return;
    }

    const id = promo.id;
    try {
      // Force reopen flag (set by navbar megaphone) — overrides all dismiss
      // states so the popup re-appears after refresh while promo is active.
      if (localStorage.getItem(FORCE_REOPEN_KEY(id))) {
        localStorage.removeItem(FORCE_REOPEN_KEY(id));
        localStorage.removeItem(PERMANENT_DISMISS_KEY(id));
        localStorage.removeItem(SEEN_KEY(id));
        sessionStorage.removeItem(MINI_SESSION_HIDDEN_KEY(id));
        setMode("popup");
        return;
      }

      // Has the user seen the Large version recently (24h)?
      const seenRaw = localStorage.getItem(SEEN_KEY(id));
      const seenAt = seenRaw ? parseInt(seenRaw, 10) : NaN;
      const seenRecently = !isNaN(seenAt) && Date.now() - seenAt < TWENTY_FOUR_HOURS_MS;

      setMode(seenRecently ? "mini" : "popup");
    } catch {
      setMode("popup");
    }
  }, [promo]);

  // Log analytics whenever the visible mode changes
  useEffect(() => {
    if (!promo) return;
    if (mode === "popup") trackPromoEvent(promo.id, "shown");
    else if (mode === "mini") trackPromoEvent(promo.id, "mini_shown");
  }, [mode, promo]);

  // Listen for manual reopen requests (e.g. from Navbar megaphone button)
  useEffect(() => {
    const handleReopen = () => {
      if (!promo) return;
      try {
        localStorage.removeItem(PERMANENT_DISMISS_KEY(promo.id));
        localStorage.removeItem(SEEN_KEY(promo.id));
        sessionStorage.removeItem(MINI_SESSION_HIDDEN_KEY(promo.id));
      } catch {
        /* ignore */
      }
      // Restart from the top of the queue when user manually reopens
      setSkippedIds(new Set());
      setCurrentIndex(0);
      setReopenedFromMini(false);
      setMode("popup");
    };
    window.addEventListener("promo:reopen", handleReopen);
    return () => window.removeEventListener("promo:reopen", handleReopen);
  }, [promo]);

  if (!promo) return null;

  // Advance to the next promo in the queue (if any). Returns true if rotated.
  const advanceQueue = (dismissedId: string) => {
    setSkippedIds((prev) => {
      const next = new Set(prev);
      next.add(dismissedId);
      return next;
    });
    // Next promo will be picked up automatically because `queue` is recomputed
    // and currentIndex stays at 0 (since the dismissed one is filtered out).
    setCurrentIndex(0);
    setReopenedFromMini(false);
  };

  const handlePopupClose = () => {
    // PromoPopup sets this flag right before firing onClose for auto-close,
    // so we know whether to log "manual" or skip (auto already logged).
    const w = window as unknown as { __promoCloseReason?: string };
    const wasAuto = w.__promoCloseReason === "auto";
    w.__promoCloseReason = undefined;
    if (!wasAuto) {
      trackPromoEvent(promo.id, "closed", { close_reason: "manual" });
    }
    try {
      // Mark Large as seen with a fresh 24h window
      localStorage.setItem(SEEN_KEY(promo.id), Date.now().toString());
    } catch {
      /* ignore */
    }

    // If there are more promos waiting, rotate to the next one as a popup.
    const hasNext = queue.length > 1;
    if (hasNext) {
      advanceQueue(promo.id);
      setMode("popup");
      return;
    }

    if (reopenedFromMini) {
      setReopenedFromMini(false);
      setMode("mini");
    } else {
      setMode("mini");
    }
  };

  const handleMiniDismiss = () => {
    trackPromoEvent(promo.id, "mini_dismissed");
    try {
      sessionStorage.setItem(MINI_SESSION_HIDDEN_KEY(promo.id), "1");
    } catch {
      /* ignore */
    }
    // Rotate to next queued promo if any; otherwise hide.
    const hasNext = queue.length > 1;
    if (hasNext) {
      advanceQueue(promo.id);
      setMode("popup");
    } else {
      setMode("hidden");
    }
  };

  const handleMiniClick = () => {
    setReopenedFromMini(true);
    setMode("popup");
  };

  const handlePermanentDismiss = () => {
    trackPromoEvent(promo.id, "permanent_dismiss");
    try {
      localStorage.setItem(PERMANENT_DISMISS_KEY(promo.id), "1");
    } catch {
      /* ignore */
    }
    const hasNext = queue.length > 1;
    if (hasNext) {
      advanceQueue(promo.id);
      setMode("popup");
    } else {
      setMode("hidden");
    }
  };

  return (
    <>
      {mode === "popup" && (
        <PromoPopup
          key={promo.id}
          promo={promo}
          open
          onClose={handlePopupClose}
          onPermanentDismiss={handlePermanentDismiss}
        />
      )}
      {mode === "mini" && (
        <PromoMiniCard
          key={promo.id}
          promo={promo}
          onClick={handleMiniClick}
          onDismiss={handleMiniDismiss}
        />
      )}
    </>
  );
};

export default PromoManager;
