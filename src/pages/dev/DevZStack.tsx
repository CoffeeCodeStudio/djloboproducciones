import { useState } from "react";
import { Navigate } from "react-router-dom";
import PromoMiniCard from "@/components/PromoMiniCard";
import PromoPopup from "@/components/PromoPopup";
import CookieConsent from "@/components/CookieConsent";
import NowPlayingBar from "@/components/NowPlayingBar";
import Footer from "@/components/Footer";
import ZIndexDebugOverlay from "@/components/dev/ZIndexDebugOverlay";
import { Button } from "@/components/ui/button";
import { Z_LAYERS } from "@/lib/confettiThrottle";
import type { Promo } from "@/hooks/useActivePromo";
import { useNoindex } from "@/hooks/useNoindex";

/**
 * Dev-only visual stacking story. Mounts the mini-player, footer,
 * cookie consent, NowPlayingBar, and PromoPopup together so the stacking
 * order can be visually confirmed without running a full Storybook setup.
 *
 * Route: /dev/zstack — production builds redirect to / (404).
 */

const FIXTURE_PROMO: Promo = {
  id: "dev-fixture",
  title: "Dev Stacking Demo",
  subtitle: "Verifies mini-player vs modal vs footer layering",
  flyer_image_url: "/placeholder.svg",
  video_file_url: null,
  youtube_url: null,
  cta_text: "Sample CTA",
  cta_url: "#",
  active_from: new Date(Date.now() - 86400000).toISOString(),
  active_to: new Date(Date.now() + 86400000).toISOString(),
  is_active: true,
  pinned_to_top: false,
  priority: 1,
  source: "manual",
  google_event_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const LayerLegend = () => (
  <div className="rounded-lg border border-border bg-card p-4 text-sm">
    <h2 className="mb-3 font-semibold">Expected stacking order (low → high)</h2>
    <ol className="space-y-1 font-mono text-xs">
      <li>footer · z={Z_LAYERS.footer}</li>
      <li>NowPlayingBar · z={Z_LAYERS.nowPlayingBar}</li>
      <li>GlobalMiniPlayer · z={Z_LAYERS.globalMiniPlayer}</li>
      <li>CookieConsent · z={Z_LAYERS.cookieConsent}</li>
      <li className="font-bold text-primary">
        PromoMiniCard · z={Z_LAYERS.promoMiniPlayer} ← must beat all above
      </li>
      <li>PromoPopup backdrop · z={Z_LAYERS.promoPopupBackdrop}</li>
      <li>PromoPopup content · z={Z_LAYERS.promoPopupContent}</li>
      <li>Confetti canvas · z={Z_LAYERS.confettiCanvas}</li>
    </ol>
  </div>
);

const DevZStack = () => {
  const [showMini, setShowMini] = useState(true);
  const [showPopup, setShowPopup] = useState(false);

  // Block this route in production builds.
  if (!import.meta.env.DEV) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl space-y-6 px-6 py-12 pb-48">
        <header>
          <h1 className="text-2xl font-bold">/dev/zstack — Layering Story</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Dev-only route. All chrome layers are mounted simultaneously so the
            visual stacking order can be confirmed against the constants below.
            The dev <code className="rounded bg-muted px-1">ZIndexDebugOverlay</code> in
            the top-left will surface any violations in red.
          </p>
        </header>

        <LayerLegend />

        <div className="flex flex-wrap gap-3">
          <Button
            variant={showMini ? "default" : "outline"}
            onClick={() => setShowMini((v) => !v)}
          >
            {showMini ? "Hide" : "Show"} Mini-Player
          </Button>
          <Button
            variant={showPopup ? "default" : "outline"}
            onClick={() => setShowPopup((v) => !v)}
          >
            {showPopup ? "Close" : "Open"} PromoPopup
          </Button>
        </div>

        <div className="rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground">
          <p className="mb-2 font-semibold text-foreground">What to verify visually:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Mini-player is fully visible above the NowPlayingBar / footer</li>
            <li>Cookie consent banner does not cover the mini-player's X button</li>
            <li>Opening the PromoPopup hides the mini-player behind the modal backdrop</li>
            <li>Closing the popup restores the mini-player to the foreground</li>
          </ul>
        </div>
      </div>

      {/* All real chrome — mounted with their actual styles */}
      <Footer />
      <NowPlayingBar />
      <CookieConsent />

      {showMini && (
        <PromoMiniCard
          promo={FIXTURE_PROMO}
          onClick={() => setShowPopup(true)}
          onDismiss={() => setShowMini(false)}
        />
      )}

      {showPopup && (
        <PromoPopup
          promo={FIXTURE_PROMO}
          open
          onClose={() => setShowPopup(false)}
          onPermanentDismiss={() => setShowPopup(false)}
        />
      )}

      {/* Always show the dev overlay here so any violation is loud */}
      <ZIndexDebugOverlay />
    </div>
  );
};

export default DevZStack;
