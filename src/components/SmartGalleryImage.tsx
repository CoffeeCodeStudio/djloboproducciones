import { useEffect, useRef, useState } from "react";

interface SmartGalleryImageProps {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
  /** Approximate container aspect ratio (w/h) — used to decide cover vs contain */
  containerRatio?: number;
  /** Tolerance: how much an image's ratio can differ from container before we switch to contain */
  tolerance?: number;
}

/**
 * Smart layout image:
 * - Loads the image, measures its natural aspect ratio
 * - If the image roughly matches the container ratio → object-cover (fills nicely)
 * - If the image is much taller or wider than the container → object-contain
 *   with a blurred copy of the same image as background, so the cell still feels full
 *   but the photo isn't aggressively cropped / over-zoomed.
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
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  const handleLoad = () => {
    const el = imgRef.current;
    if (!el) return;
    const r = el.naturalWidth / el.naturalHeight;
    if (!isFinite(r) || r <= 0) {
      setFit("cover");
    } else {
      const diff = Math.abs(r - containerRatio) / containerRatio;
      setFit(diff > tolerance ? "contain" : "cover");
    }
    setLoaded(true);
  };

  return (
    <>
      {/* Blurred background fills the cell when we letterbox with contain */}
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
