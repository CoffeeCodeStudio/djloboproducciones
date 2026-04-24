import { useEffect, useState } from "react";
import { useActivePromo, type Promo } from "@/hooks/useActivePromo";
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

/**
 * Filters out promos that the user has dismissed (session or permanent) or
 * that we've explicitly skipped this session.
 */
const buildQueue = (promos: Promo[], skippedIds: Set<string>): Promo[] =>
  promos.filter((p) => {
    if (skippedIds.has(p.id)) return false;
    try {
      if (localStorage.getItem(PERMANENT_DISMISS_KEY(p.id))) return false;
      if (sessionStorage.getItem(MINI_SESSION_HIDDEN_KEY(p.id))) return false;
    } catch {
      /* ignore */
    }
    return true;
  });

const PromoManager = () => {
  const { promos } = useActivePromo();
  const [mode, setMode] = useState<"hidden" | "popup" | "mini">("hidden");
  const [reopenedFromMini, setReopenedFromMini] = useState(false);
  // The promo currently being displayed. Pinned so a newly-activated, higher
  // ranked promo cannot hijack the popup mid-show — it'll be picked up on
  // the next close/dismiss instead.
  const [activeId, setActiveId] = useState<string | null>(null);
  // IDs the user dismissed during this session — skip them when rotating.
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());

  const queue = buildQueue(promos, skippedIds);

  // Resolve the visible promo deterministically:
  //   1. If activeId still exists in the queue → keep showing it (don't hijack).
  //   2. Otherwise, pick the top of the queue (highest priority / most recent).
  const promo: Promo | null =
    (activeId && queue.find((p) => p.id === activeId)) || queue[0] || null;

  // Pin the active id whenever the visible promo changes.
  useEffect(() => {
    if (promo && promo.id !== activeId) {
      setActiveId(promo.id);
    } else if (!promo && activeId) {
      setActiveId(null);
    }
  }, [promo, activeId]);

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
      setActiveId(null);
      setReopenedFromMini(false);
      setMode("popup");
    };
    window.addEventListener("promo:reopen", handleReopen);
    return () => window.removeEventListener("promo:reopen", handleReopen);
  }, [promo]);

  if (!promo) return null;

  /**
   * Mark the current promo as handled and let the resolver pick the next one
   * from the freshly-sorted queue (deterministic: highest priority wins).
   */
  const advanceQueue = (dismissedId: string) => {
    setSkippedIds((prev) => {
      const next = new Set(prev);
      next.add(dismissedId);
      return next;
    });
    setActiveId(null);
    setReopenedFromMini(false);
  };

  /** True if there's at least one other promo waiting after `currentId`. */
  const hasNextAfter = (currentId: string) =>
    queue.some((p) => p.id !== currentId);

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
    if (hasNextAfter(promo.id)) {
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
    if (hasNextAfter(promo.id)) {
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
    if (hasNextAfter(promo.id)) {
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
