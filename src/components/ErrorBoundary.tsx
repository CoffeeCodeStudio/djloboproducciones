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

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught:", error, info);
    }

    // Auto-recover from stale chunk errors by reloading once per session.
    if (isChunkLoadError(error)) {
      try {
        if (!sessionStorage.getItem(CHUNK_RELOAD_FLAG)) {
          sessionStorage.setItem(CHUNK_RELOAD_FLAG, "1");
          // Small delay so React commits the error state first.
          setTimeout(() => {
            try {
              window.location.reload();
            } catch {
              /* ignore */
            }
          }, 50);
        }
      } catch {
        /* ignore */
      }
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
