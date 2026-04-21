import { useEffect, useState } from "react";
import { useActivePromo } from "@/hooks/useActivePromo";
import PromoPopup from "./PromoPopup";
import PromoMiniCard from "./PromoMiniCard";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

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
      if (localStorage.getItem(`promo_permanent_dismissed_${id}`)) {
        setMode("hidden");
        return;
      }
      const seen = localStorage.getItem(`promo_seen_${id}`);
      if (seen) {
        const miniDismissed = localStorage.getItem(`promo_mini_dismissed_${id}`);
        if (miniDismissed) {
          const ts = parseInt(miniDismissed, 10);
          if (!isNaN(ts) && Date.now() - ts < SEVEN_DAYS_MS) {
            setMode("hidden");
            return;
          }
        }
        setMode("mini");
      } else {
        setMode("popup");
      }
    } catch {
      setMode("popup");
    }
  }, [promo]);

  if (!promo) return null;

  const handlePopupClose = () => {
    try {
      if (reopenedFromMini) {
        localStorage.setItem(`promo_mini_dismissed_${promo.id}`, Date.now().toString());
        setReopenedFromMini(false);
        setMode("hidden");
      } else {
        localStorage.setItem(`promo_seen_${promo.id}`, "1");
        setMode("mini");
      }
    } catch {
      setMode("hidden");
    }
  };

  const handleMiniDismiss = () => {
    try {
      localStorage.setItem(`promo_mini_dismissed_${promo.id}`, Date.now().toString());
    } catch {}
    setMode("hidden");
  };

  const handleMiniClick = () => {
    setReopenedFromMini(true);
    setMode("popup");
  };

  const handlePermanentDismiss = () => {
    try {
      localStorage.setItem(`promo_permanent_dismissed_${promo.id}`, "1");
    } catch {}
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
