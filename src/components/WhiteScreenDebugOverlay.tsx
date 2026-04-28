import { useEffect, useState } from "react";

interface WsEvent {
  kind: string;
  t: number;
  reason?: string;
  softTimeout?: number;
  hardTimeout?: number;
}

const KIND_COLORS: Record<string, string> = {
  boot: "#64748b",
  alive: "#10b981",
  "soft-recover": "#f59e0b",
  "hard-reload": "#ef4444",
  "hard-skip": "#8b5cf6",
};

const KIND_LABELS: Record<string, string> = {
  boot: "BOOT",
  alive: "ALIVE",
  "soft-recover": "SOFT RECOVER",
  "hard-reload": "HARD RELOAD",
  "hard-skip": "HARD SKIPPED",
};

const isEnabled = (): boolean => {
  try {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    if (params.get("wsdebug") === "1") return true;
    if (localStorage.getItem("wsdebug") === "1") return true;
  } catch {
    /* ignore */
  }
  return false;
};

/**
 * In-app debug overlay for the white-screen detector.
 * Enable with `?wsdebug=1` in the URL or `localStorage.wsdebug = "1"`.
 * Renders a fixed bottom-right panel showing detector lifecycle events
 * (boot / alive / soft-recover / hard-reload).
 */
const WhiteScreenDebugOverlay = () => {
  const [enabled] = useState(isEnabled);
  const [events, setEvents] = useState<WsEvent[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // Replay buffered events that fired before this component mounted.
    try {
      const buf = (window as unknown as { __lovableWsEvents?: WsEvent[] })
        .__lovableWsEvents;
      if (Array.isArray(buf) && buf.length > 0) {
        setEvents([...buf]);
      }
    } catch {
      /* ignore */
    }

    const handler = (e: Event) => {
      const detail = (e as CustomEvent<WsEvent>).detail;
      if (!detail) return;
      setEvents((prev) => [...prev, detail].slice(-20));
    };
    window.addEventListener("lovable:white-screen-event", handler);
    return () =>
      window.removeEventListener("lovable:white-screen-event", handler);
  }, [enabled]);

  if (!enabled) return null;

  const fmtT = (ms: number) =>
    ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;

  return (
    <div
      style={{
        position: "fixed",
        right: 12,
        bottom: 12,
        zIndex: 2147483647,
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontSize: 11,
        lineHeight: 1.4,
        color: "#e2e8f0",
        background: "rgba(15, 23, 42, 0.92)",
        border: "1px solid rgba(148, 163, 184, 0.3)",
        borderRadius: 8,
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(6px)",
        maxWidth: 320,
        minWidth: 220,
        pointerEvents: "auto",
      }}
      role="status"
      aria-live="polite"
      aria-label="White screen detector debug"
    >
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 10px",
          background: "transparent",
          border: "none",
          color: "#e2e8f0",
          cursor: "pointer",
          fontSize: 11,
          fontWeight: 600,
        }}
      >
        <span>WS-Detector ({events.length})</span>
        <span style={{ opacity: 0.6 }}>{collapsed ? "▸" : "▾"}</span>
      </button>
      {!collapsed && (
        <div
          style={{
            maxHeight: 220,
            overflowY: "auto",
            padding: "4px 10px 8px",
            borderTop: "1px solid rgba(148, 163, 184, 0.2)",
          }}
        >
          {events.length === 0 ? (
            <div style={{ opacity: 0.6, padding: "4px 0" }}>
              Inga händelser ännu.
            </div>
          ) : (
            events.map((ev, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 6,
                  padding: "2px 0",
                }}
              >
                <span
                  style={{
                    color: KIND_COLORS[ev.kind] || "#cbd5e1",
                    fontWeight: 700,
                    minWidth: 92,
                  }}
                >
                  {KIND_LABELS[ev.kind] || ev.kind.toUpperCase()}
                </span>
                <span style={{ opacity: 0.6, minWidth: 52 }}>
                  +{fmtT(ev.t)}
                </span>
                {ev.reason && (
                  <span style={{ opacity: 0.85 }}>{ev.reason}</span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default WhiteScreenDebugOverlay;
