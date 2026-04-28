import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface WhiteScreenGuardProps {
  onSoftReset?: () => void;
}

/**
 * Reports "alive" to the white-screen detector in index.html as soon as the
 * app has mounted AND the browser has painted a frame. Also listens for the
 * detector's soft-recovery event and tries a non-destructive reset:
 *   1. Navigate to "/" (in case a route component crashed silently)
 *   2. Force a re-render via state-less location replace
 *
 * The hard reload is handled by the inline detector itself.
 */
const WhiteScreenGuard = ({ onSoftReset }: WhiteScreenGuardProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Report alive after first paint
  useEffect(() => {
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        try {
          (window as unknown as { __lovableReportAlive?: () => void })
            .__lovableReportAlive?.();
        } catch {
          /* ignore */
        }
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  // Soft recovery handler
  useEffect(() => {
    const handleRecover = () => {
      try {
        onSoftReset?.();
        navigate(location.pathname || "/", {
          replace: true,
          state: {
            __wsRecoverAt: Date.now(),
          },
        });
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("lovable:white-screen-recover", handleRecover);
    return () =>
      window.removeEventListener("lovable:white-screen-recover", handleRecover);
  }, [navigate, location.pathname, onSoftReset]);

  return null;
};

export default WhiteScreenGuard;
