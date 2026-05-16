import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

// --- Global chunk-load logger -------------------------------------------------
// Catches stale dynamic-import / chunk failures that don't reach an
// ErrorBoundary (e.g. preloads, top-level imports, route prefetch). Logs a
// single grep-friendly line: [chunk-load-error] { ...context }
const CHUNK_PATTERNS = [
  "failed to fetch dynamically imported module",
  "loading chunk",
  "loading css chunk",
  "importing a module script failed",
];

const looksLikeChunkError = (msg: string | undefined | null): boolean => {
  if (!msg) return false;
  const m = msg.toLowerCase();
  return CHUNK_PATTERNS.some((p) => m.includes(p));
};

const extractUrl = (msg: string | undefined | null): string | null => {
  if (!msg) return null;
  const match = msg.match(/https?:\/\/[^\s'")]+/);
  return match ? match[0] : null;
};

const logGlobalChunkError = (source: string, error: unknown, extra?: Record<string, unknown>) => {
  const err = error as Error | undefined;
  const message = err?.message ?? String(error);
  // eslint-disable-next-line no-console
  console.error("[chunk-load-error]", {
    source,
    message,
    failingUrl: extractUrl(message),
    pageUrl: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    stack: err?.stack,
    ...extra,
  });
};

window.addEventListener("error", (event) => {
  if (looksLikeChunkError(event.message)) {
    logGlobalChunkError("window.error", event.error ?? event.message, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  }
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  const msg =
    typeof reason === "string"
      ? reason
      : (reason as Error)?.message ?? String(reason);
  if (looksLikeChunkError(msg)) {
    logGlobalChunkError("unhandledrejection", reason);
  }
});

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>,
);
