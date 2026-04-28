import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

const CHUNK_RELOAD_FLAG = "__lovable_chunk_reload__";

/**
 * Returns true if the error looks like a stale dynamic-import / chunk-load
 * failure. These typically happen after a deploy when the user's tab still
 * references old hashed chunk URLs that no longer exist.
 */
const isChunkLoadError = (error: unknown): boolean => {
  if (!error) return false;
  const msg =
    (error as Error)?.message?.toLowerCase?.() ??
    String(error).toLowerCase();
  return (
    msg.includes("failed to fetch dynamically imported module") ||
    msg.includes("loading chunk") ||
    msg.includes("loading css chunk") ||
    msg.includes("importing a module script failed")
  );
};

/**
 * Try to extract the failing module URL from a chunk-load error message.
 * Vite/browsers usually include the URL in the message, e.g.:
 *   "Failed to fetch dynamically imported module: https://.../Admin-abc123.js"
 */
const extractFailingUrl = (error: unknown): string | null => {
  if (!error) return null;
  const msg = (error as Error)?.message ?? String(error);
  const match = msg.match(/https?:\/\/[^\s'")]+/);
  return match ? match[0] : null;
};

/** Structured chunk-error log — one line, easy to grep after deploys. */
const logChunkError = (
  error: unknown,
  ctx: { source: string; recovery: "auto-reload" | "skipped-already-reloaded" | "none" }
) => {
  const err = error as Error | undefined;
  const url = extractFailingUrl(error);
  // eslint-disable-next-line no-console
  console.error("[chunk-load-error]", {
    source: ctx.source,
    recovery: ctx.recovery,
    message: err?.message ?? String(error),
    failingUrl: url,
    pageUrl: typeof window !== "undefined" ? window.location.href : null,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    timestamp: new Date().toISOString(),
    stack: err?.stack,
  });
};

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (isChunkLoadError(error)) {
      let alreadyReloaded = false;
      try {
        alreadyReloaded = !!sessionStorage.getItem(CHUNK_RELOAD_FLAG);
      } catch {
        /* ignore */
      }

      logChunkError(error, {
        source: "ErrorBoundary",
        recovery: alreadyReloaded ? "skipped-already-reloaded" : "auto-reload",
      });

      if (!alreadyReloaded) {
        try {
          sessionStorage.setItem(CHUNK_RELOAD_FLAG, "1");
        } catch {
          /* ignore */
        }
        setTimeout(() => {
          try {
            window.location.reload();
          } catch {
            /* ignore */
          }
        }, 50);
      }
      return;
    }

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error("[ErrorBoundary] caught:", {
        message: error.message,
        stack: error.stack,
        componentStack: info.componentStack,
        pageUrl: window.location.href,
        timestamp: new Date().toISOString(),
      });
    } else {
      // eslint-disable-next-line no-console
      console.error("[ErrorBoundary]", error.message, "at", window.location.href);
    }
  }

  private handleReload = () => {
    try {
      sessionStorage.removeItem(CHUNK_RELOAD_FLAG);
    } catch {
      /* ignore */
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const chunkError = isChunkLoadError(this.state.error);
      return (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 py-12 px-6 text-center">
          <p className="text-foreground text-base">
            {chunkError
              ? "En ny version av sidan finns. Laddar om…"
              : "Något gick fel."}
          </p>
          {!chunkError && (
            <p className="text-muted-foreground text-sm max-w-md">
              Försök ladda om sidan. Om felet kvarstår, gå tillbaka till
              startsidan.
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={this.handleReload}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
            >
              Ladda om
            </button>
            {!chunkError && (
              <a
                href="/"
                className="px-4 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted transition"
              >
                Till startsidan
              </a>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
