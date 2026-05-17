import { useEffect } from "react";

/**
 * Injects <meta name="robots" content="noindex, nofollow"> into <head>
 * for the lifetime of the calling component. Used on routes that must
 * never be indexed (e.g. /admin, /reset-password, /dev/*).
 *
 * Works regardless of which early-return branch a component renders,
 * because it runs in useEffect rather than the JSX tree.
 */
export function useNoindex() {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);
}
