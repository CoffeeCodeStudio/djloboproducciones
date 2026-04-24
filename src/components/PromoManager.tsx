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
  const { promo } = useActivePromo();
  const [mode, setMode] = useState<"hidden" | "popup" | "mini">("hidden");
  const [reopenedFromMini, setReopenedFromMini] = useState(false);

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

      // Hard dismiss ("Visa inte igen") — never show either variant
      if (localStorage.getItem(PERMANENT_DISMISS_KEY(id))) {
        setMode("hidden");
        return;
      }

      // Session-only hide (Mini X) — gone until next browser session
      if (sessionStorage.getItem(MINI_SESSION_HIDDEN_KEY(id))) {
        setMode("hidden");
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
      setReopenedFromMini(false);
      setMode("popup");
    };
    window.addEventListener("promo:reopen", handleReopen);
    return () => window.removeEventListener("promo:reopen", handleReopen);
  }, [promo]);

  if (!promo) return null;

  const handlePopupClose = () => {
    try {
      // Mark Large as seen with a fresh 24h window
      localStorage.setItem(SEEN_KEY(promo.id), Date.now().toString());
    } catch {
      /* ignore */
    }
    if (reopenedFromMini) {
      // User expanded from Mini and closed again — return to Mini view
      setReopenedFromMini(false);
      setMode("mini");
    } else {
      // First-time Large was shown — switch to Mini for subsequent visits in the 24h window
      setMode("mini");
    }
  };

  const handleMiniDismiss = () => {
    try {
      sessionStorage.setItem(MINI_SESSION_HIDDEN_KEY(promo.id), "1");
    } catch {
      /* ignore */
    }
    setMode("hidden");
  };

  const handleMiniClick = () => {
    setReopenedFromMini(true);
    setMode("popup");
  };

  const handlePermanentDismiss = () => {
    try {
      localStorage.setItem(PERMANENT_DISMISS_KEY(promo.id), "1");
    } catch {
      /* ignore */
    }
    setMode("hidden");
  };

  return (
    <>
      {mode === "popup" && (
        <PromoPopup
          promo={promo}
          open
          onClose={handlePopupClose}
          onPermanentDismiss={handlePermanentDismiss}
        />
      )}
      {mode === "mini" && (
        <PromoMiniCard
          promo={promo}
          onClick={handleMiniClick}
          onDismiss={handleMiniDismiss}
        />
      )}
    </>
  );
};

export default PromoManager;
