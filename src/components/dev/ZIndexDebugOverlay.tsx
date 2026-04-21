import { useEffect, useState } from "react";
import { assertMiniPlayerLayering, Z_LAYERS, type MiniPlayerLayeringReport } from "@/lib/confettiThrottle";

interface RuntimeCheck {
  /** Selector → resolved z-index (or null if not currently mounted). */
  measured: Record<string, number | null>;
  /** Violations discovered by comparing actual computed values. */
  violations: string[];
}

interface ClippingAncestor {
  tag: string;
  classes: string;
  overflow: string;
  reason: string;
}

interface OverflowReport {
  /** Ancestors that clip the mini-player or establish a containing block + clip. */
  clipping: ClippingAncestor[];
}

/**
 * Reads the computed z-index of an element matching `selector`.
 * Walks up the DOM if the immediate match has `z-index: auto` so we
 * surface the effective stacking context for the visible chrome.
 */
function readComputedZ(selector: string): number | null {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return null;
  let cursor: HTMLElement | null = el;
  while (cursor) {
    const z = getComputedStyle(cursor).zIndex;
    const parsed = parseInt(z, 10);
    if (!Number.isNaN(parsed)) return parsed;
    cursor = cursor.parentElement;
  }
  return null;
}

/**
 * Runtime DOM check: reads actual computed z-index values from rendered
 * elements and verifies the mini-player wins against footer chrome and
 * loses to the PromoPopup modal. Skips checks for elements not currently
 * mounted (e.g. modal closed).
 */
function runRuntimeZIndexCheck(): RuntimeCheck {
  const targets: Record<string, string> = {
    miniPlayer: '[data-zlayer="promo-mini-player"]',
    nowPlayingBar: '[data-zlayer="now-playing-bar"]',
    globalMiniPlayer: '[data-zlayer="global-mini-player"]',
    cookieConsent: '[data-zlayer="cookie-consent"]',
    footer: "footer",
    promoPopupContent: '[role="dialog"][data-state="open"]',
  };

  const measured: Record<string, number | null> = {};
  for (const [name, sel] of Object.entries(targets)) {
    measured[name] = readComputedZ(sel);
  }

  const violations: string[] = [];
  const mp = measured.miniPlayer;

  if (mp == null) {
    // Mini-player not currently rendered — nothing to assert.
    return { measured, violations };
  }

  // Mini-player must beat each footer-chrome layer (when present).
  (["nowPlayingBar", "globalMiniPlayer", "cookieConsent", "footer"] as const).forEach((k) => {
    const v = measured[k];
    if (v != null && mp <= v) {
      violations.push(`mini-player computed z (${mp}) must be > ${k} computed z (${v})`);
    }
  });

  // Mini-player must lose to the open PromoPopup modal (when present).
  if (measured.promoPopupContent != null && mp >= measured.promoPopupContent) {
    violations.push(
      `mini-player computed z (${mp}) must be < promoPopupContent computed z (${measured.promoPopupContent})`
    );
  }

  return { measured, violations };
}

/**
 * Walks ancestors of the mini-player and reports any that would clip it.
 * A `position: fixed` element is normally viewport-relative, BUT any
 * ancestor with `transform`, `filter`, `perspective`, `backdrop-filter`,
 * `contain: paint/layout/strict`, or `will-change: transform` becomes its
 * containing block — and if that ancestor also has `overflow: hidden`/clip,
 * the mini-player gets clipped.
 *
 * We also report any direct ancestor with `overflow: hidden` regardless of
 * containing-block status, since that's the most common foot-gun.
 */
function checkOverflowClipping(): OverflowReport {
  const el = document.querySelector<HTMLElement>('[data-zlayer="promo-mini-player"]');
  if (!el) return { clipping: [] };

  const clipping: ClippingAncestor[] = [];
  let cursor: HTMLElement | null = el.parentElement;

  while (cursor && cursor !== document.documentElement) {
    const cs = getComputedStyle(cursor);
    const overflow = `${cs.overflowX}/${cs.overflowY}`;
    const clipsOverflow =
      cs.overflowX === "hidden" ||
      cs.overflowY === "hidden" ||
      cs.overflowX === "clip" ||
      cs.overflowY === "clip";

    if (clipsOverflow) {
      const establishesContainingBlock =
        cs.transform !== "none" ||
        cs.filter !== "none" ||
        cs.perspective !== "none" ||
        (cs.willChange && /transform|filter|perspective/.test(cs.willChange)) ||
        cs.contain === "paint" ||
        cs.contain === "layout" ||
        cs.contain === "strict" ||
        cs.contain.includes("paint");

      const reason = establishesContainingBlock
        ? "establishes containing block + clips overflow → fixed child WILL be clipped"
        : "ancestor clips overflow (low risk for fixed child unless containing block)";

      clipping.push({
        tag: cursor.tagName.toLowerCase(),
        classes: cursor.className?.toString().slice(0, 80) ?? "",
        overflow,
        reason,
      });
    }
    cursor = cursor.parentElement;
  }

  return { clipping };
}

/**
 * Dev-only on-screen overlay. Combines:
 *  1. Static layer-map assertion (`assertMiniPlayerLayering` from constants)
 *  2. Live DOM runtime check via `getComputedStyle` (re-runs every 1.5s)
 * Renders nothing in production or when both checks pass.
 */
const ZIndexDebugOverlay = () => {
  const [staticReport, setStaticReport] = useState<MiniPlayerLayeringReport | null>(null);
  const [runtime, setRuntime] = useState<RuntimeCheck | null>(null);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const r = assertMiniPlayerLayering();
    setStaticReport(r);
    if (!r.ok) {
      // eslint-disable-next-line no-console
      console.error("[z-index] static layering assertion failed:", r.violations);
    }

    // Poll the DOM every 1.5s — cheap, only runs in dev.
    const tick = () => {
      const rt = runRuntimeZIndexCheck();
      setRuntime(rt);
      if (rt.violations.length > 0) {
        // eslint-disable-next-line no-console
        console.error("[z-index] runtime DOM check failed:", rt.violations, rt.measured);
      }
    };
    tick();
    const id = window.setInterval(tick, 1500);
    return () => window.clearInterval(id);
  }, []);

  if (!import.meta.env.DEV) return null;

  const staticBad = staticReport && !staticReport.ok;
  const runtimeBad = runtime && runtime.violations.length > 0;
  if (!staticBad && !runtimeBad) return null;

  return (
    <div
      role="alert"
      style={{
        position: "fixed",
        top: "1rem",
        left: "1rem",
        zIndex: 2147483647,
        maxWidth: "min(440px, calc(100vw - 2rem))",
        padding: "12px 14px",
        background: "hsl(0 84% 12% / 0.96)",
        color: "hsl(0 0% 100%)",
        border: "2px solid hsl(0 84% 60%)",
        borderRadius: "8px",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: "12px",
        lineHeight: 1.45,
        boxShadow: "0 8px 24px hsl(0 0% 0% / 0.6)",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6, letterSpacing: "0.04em" }}>
        ⚠ Z-INDEX LAYERING FAILED (dev only)
      </div>

      <div style={{ marginBottom: 8 }}>
        <strong>Constants:</strong> mini={Z_LAYERS.promoMiniPlayer}, modal=
        {Z_LAYERS.promoPopupContent}, footer={Z_LAYERS.footer}, nowPlaying=
        {Z_LAYERS.nowPlayingBar}, miniPlayer={Z_LAYERS.globalMiniPlayer}, cookies=
        {Z_LAYERS.cookieConsent}
      </div>

      {runtime && (
        <div style={{ marginBottom: 8 }}>
          <strong>Runtime computed:</strong>
          <ul style={{ margin: "4px 0 0 18px", padding: 0 }}>
            {Object.entries(runtime.measured).map(([k, v]) => (
              <li key={k}>
                {k}: {v == null ? "—" : v}
              </li>
            ))}
          </ul>
        </div>
      )}

      {staticBad && (
        <div style={{ borderTop: "1px solid hsl(0 84% 40%)", paddingTop: 6, marginBottom: 6 }}>
          <strong>Static violations:</strong>
          <ul style={{ margin: "4px 0 0 18px", padding: 0 }}>
            {staticReport!.violations.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
        </div>
      )}

      {runtimeBad && (
        <div style={{ borderTop: "1px solid hsl(0 84% 40%)", paddingTop: 6 }}>
          <strong>Runtime violations:</strong>
          <ul style={{ margin: "4px 0 0 18px", padding: 0 }}>
            {runtime!.violations.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ZIndexDebugOverlay;
