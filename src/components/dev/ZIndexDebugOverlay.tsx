import { useEffect, useState } from "react";
import { assertMiniPlayerLayering, Z_LAYERS, type MiniPlayerLayeringReport } from "@/lib/confettiThrottle";

/**
 * Dev-only on-screen overlay. Renders nothing in production builds and
 * nothing when the layering invariants pass. When `assertMiniPlayerLayering`
 * reports violations, it pins a high-contrast diagnostic panel to the
 * top-left so the issue is impossible to miss during development.
 */
const ZIndexDebugOverlay = () => {
  const [report, setReport] = useState<MiniPlayerLayeringReport | null>(null);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const r = assertMiniPlayerLayering();
    setReport(r);
    if (!r.ok) {
      // Surface in console too for CI / log capture.
      // eslint-disable-next-line no-console
      console.error("[z-index] mini-player layering assertion failed:", r.violations);
    }
  }, []);

  if (!import.meta.env.DEV) return null;
  if (!report || report.ok) return null;

  return (
    <div
      role="alert"
      style={{
        position: "fixed",
        top: "1rem",
        left: "1rem",
        zIndex: 2147483647, // top of stack — diagnostic must always be visible
        maxWidth: "min(420px, calc(100vw - 2rem))",
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
        <strong>Mini-player:</strong> {Z_LAYERS.promoMiniPlayer}
        <br />
        <strong>Modal (backdrop / content):</strong> {Z_LAYERS.promoPopupBackdrop} / {Z_LAYERS.promoPopupContent}
        <br />
        <strong>Footer chrome:</strong> footer={Z_LAYERS.footer}, nowPlaying={Z_LAYERS.nowPlayingBar}, miniPlayer={Z_LAYERS.globalMiniPlayer}, cookies={Z_LAYERS.cookieConsent}
      </div>

      <div style={{ borderTop: "1px solid hsl(0 84% 40%)", paddingTop: 6 }}>
        <strong>Violations:</strong>
        <ul style={{ margin: "4px 0 0 18px", padding: 0 }}>
          {report.violations.map((v) => (
            <li key={v}>{v}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ZIndexDebugOverlay;
