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
    promoPopupContent: '[data-zlayer="promo-popup-content"]',
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
  const [overflow, setOverflow] = useState<OverflowReport | null>(null);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const r = assertMiniPlayerLayering();
    setStaticReport(r);
    if (!r.ok) {
      // eslint-disable-next-line no-console
      console.error("[z-index] static layering assertion failed:", r.violations);
    }

    const runChecks = () => {
      const rt = runRuntimeZIndexCheck();
      setRuntime(rt);
      if (rt.violations.length > 0) {
        // eslint-disable-next-line no-console
        console.error("[z-index] runtime DOM check failed:", rt.violations, rt.measured);
      }

      const ov = checkOverflowClipping();
      setOverflow(ov);
      if (ov.clipping.some((c) => c.reason.includes("WILL be clipped"))) {
        // eslint-disable-next-line no-console
        console.error(
          "[z-index] mini-player has clipping ancestor — fixed positioning is being trapped:",
          ov.clipping
        );
      }
    };

    // Coalesce bursts of mutations into one rAF-scheduled check so quick
    // mount/unmount flashes still register but we don't thrash the DOM.
    let scheduled = false;
    const scheduleRun = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        runChecks();
      });
    };

    // Initial check.
    runChecks();

    // Event-driven triggers (replaces 1.5s polling):
    //  1. MutationObserver — fires whenever any element with [data-zlayer]
    //     is added/removed or its style/class changes (covers PromoPopup
    //     open/close and mini-player mount/unmount precisely).
    //  2. visibilitychange — re-check when tab returns from background.
    //  3. resize — viewport changes can swap responsive z-index classes.
    const observer = new MutationObserver((mutations) => {
      const relevant = mutations.some((m) => {
        if (m.type === "attributes") {
          const target = m.target as HTMLElement;
          return target.hasAttribute?.("data-zlayer");
        }
        // childList: any added/removed node tagged with data-zlayer
        const nodes = [...m.addedNodes, ...m.removedNodes];
        return nodes.some((n) => {
          if (!(n instanceof HTMLElement)) return false;
          return n.hasAttribute("data-zlayer") || n.querySelector?.("[data-zlayer]");
        });
      });
      if (relevant) scheduleRun();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class", "data-state", "data-zlayer"],
    });

    const onVisibility = () => {
      if (document.visibilityState === "visible") scheduleRun();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", scheduleRun, { passive: true });

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", scheduleRun);
    };
  }, []);

  if (!import.meta.env.DEV) return null;

  const staticBad = staticReport && !staticReport.ok;
  const runtimeBad = runtime && runtime.violations.length > 0;
  const overflowBad = overflow && overflow.clipping.length > 0;
  if (!staticBad && !runtimeBad && !overflowBad) return null;

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
          <strong>Expected vs measured z-index:</strong>
          <table
            style={{
              width: "100%",
              marginTop: 4,
              borderCollapse: "collapse",
              fontSize: 11,
            }}
          >
            <thead>
              <tr style={{ textAlign: "left", opacity: 0.85 }}>
                <th style={{ padding: "2px 6px 2px 0" }}>Layer</th>
                <th style={{ padding: "2px 6px", textAlign: "right" }}>Expected</th>
                <th style={{ padding: "2px 6px", textAlign: "right" }}>Measured</th>
                <th style={{ padding: "2px 0 2px 6px", textAlign: "right" }}>Δ</th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["miniPlayer", "promoMiniPlayer"],
                  ["nowPlayingBar", "nowPlayingBar"],
                  ["globalMiniPlayer", "globalMiniPlayer"],
                  ["cookieConsent", "cookieConsent"],
                  ["footer", "footer"],
                  ["promoPopupContent", "promoPopupContent"],
                ] as Array<[string, keyof typeof Z_LAYERS]>
              ).map(([measuredKey, constKey]) => {
                const expected = Z_LAYERS[constKey];
                const measured = runtime.measured[measuredKey];
                const delta = measured == null ? null : measured - expected;
                const mismatch = delta != null && delta !== 0;
                return (
                  <tr
                    key={measuredKey}
                    style={{
                      background: mismatch ? "hsl(0 84% 30% / 0.5)" : undefined,
                      borderTop: "1px solid hsl(0 84% 40% / 0.4)",
                    }}
                  >
                    <td style={{ padding: "2px 6px 2px 0" }}>
                      {measuredKey}
                      <span style={{ opacity: 0.6 }}> ({constKey})</span>
                    </td>
                    <td style={{ padding: "2px 6px", textAlign: "right" }}>{expected}</td>
                    <td style={{ padding: "2px 6px", textAlign: "right" }}>
                      {measured == null ? "—" : measured}
                    </td>
                    <td
                      style={{
                        padding: "2px 0 2px 6px",
                        textAlign: "right",
                        fontWeight: mismatch ? 700 : 400,
                      }}
                    >
                      {delta == null ? "—" : delta === 0 ? "✓" : delta > 0 ? `+${delta}` : delta}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
        <div style={{ borderTop: "1px solid hsl(0 84% 40%)", paddingTop: 6, marginBottom: 6 }}>
          <strong>Runtime violations:</strong>
          <ul style={{ margin: "4px 0 0 18px", padding: 0 }}>
            {runtime!.violations.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
        </div>
      )}

      {overflowBad && (
        <div style={{ borderTop: "1px solid hsl(0 84% 40%)", paddingTop: 6 }}>
          <strong>Clipping ancestors of mini-player:</strong>
          <ul style={{ margin: "4px 0 0 18px", padding: 0 }}>
            {overflow!.clipping.map((c, i) => (
              <li key={i} style={{ marginBottom: 4 }}>
                &lt;{c.tag}&gt; overflow={c.overflow}
                {c.classes && (
                  <span style={{ opacity: 0.75 }}> · class="{c.classes}"</span>
                )}
                <br />
                <span style={{ opacity: 0.85 }}>↳ {c.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ZIndexDebugOverlay;
