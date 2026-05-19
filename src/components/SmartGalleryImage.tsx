import { useEffect, useLayoutEffect, useRef, useState } from "react";

interface SmartGalleryImageProps {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
  /** Fallback container aspect ratio (w/h) used before measurement or if measuring fails */
  containerRatio?: number;
  /** Tolerance: how much an image's ratio can differ from the container before we switch to contain */
  tolerance?: number;
}

/**
 * Smart layout image:
 * - Measures the actual rendered cell via ResizeObserver to get the real aspect ratio
 * - Loads the image, measures its natural aspect ratio
 * - If the image roughly matches the cell ratio → object-cover (fills nicely)
 * - If the image is much taller or wider than the cell → object-contain
 *   with a blurred copy of the same image as background
 */
const SmartGalleryImage = ({
  src,
  alt,
  fallback,
  className = "",
  containerRatio = 4 / 3,
  tolerance = 0.35,
}: SmartGalleryImageProps) => {
  const [fit, setFit] = useState<"cover" | "contain">("cover");
  const [loaded, setLoaded] = useState(false);
  const [cellRatio, setCellRatio] = useState<number>(containerRatio);
  const imgRef = useRef<HTMLImageElement>(null);
  const sentinelRef = useRef<HTMLSpanElement>(null);

  // Measure the parent cell with ResizeObserver
  useLayoutEffect(() => {
    const sentinel = sentinelRef.current;
    const cell = sentinel?.parentElement;
    if (!cell || typeof ResizeObserver === "undefined") return;

    const update = (w: number, h: number) => {
      if (w > 0 && h > 0) {
        setCellRatio((prev) => {
          const next = w / h;
          return Math.abs(next - prev) > 0.01 ? next : prev;
        });
      }
    };

    update(cell.clientWidth, cell.clientHeight);

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        update(width, height);
      }
    });
    ro.observe(cell);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  // Recompute fit whenever cell ratio changes or image loads
  useEffect(() => {
    const el = imgRef.current;
    if (!el || !el.naturalWidth || !el.naturalHeight) return;
    const imgR = el.naturalWidth / el.naturalHeight;
    const diff = Math.abs(imgR - cellRatio) / cellRatio;
    setFit(diff > tolerance ? "contain" : "cover");
  }, [cellRatio, loaded, tolerance]);

  const handleLoad = () => {
    setLoaded(true);
  };

  return (
    <>
      {/* Zero-size sentinel to grab parent reference without altering layout */}
      <span ref={sentinelRef} className="hidden" aria-hidden />
      {fit === "contain" && (
        <div
          aria-hidden
          className="absolute inset-0 bg-center bg-cover scale-110 blur-xl opacity-50"
          style={{ backgroundImage: `url(${src})` }}
        />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={(e) => {
          e.currentTarget.onerror = null;
          if (fallback) e.currentTarget.src = fallback;
        }}
        loading="lazy"
        width={400}
        height={400}
        className={[
          "relative w-full h-full object-center transition-all duration-300",
          fit === "cover" ? "object-cover" : "object-contain",
          loaded ? "opacity-100" : "opacity-0",
          className,
        ].join(" ")}
      />
    </>
  );
};

export default SmartGalleryImage;
