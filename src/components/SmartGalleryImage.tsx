import { useEffect, useRef, useState } from "react";

interface SmartGalleryImageProps {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
  /** @deprecated retained for backwards compatibility */
  containerRatio?: number;
  /** @deprecated retained for backwards compatibility */
  tolerance?: number;
}

/**
 * Gallery image: always fills its cell edge-to-edge using object-cover.
 */
const SmartGalleryImage = ({
  src,
  alt,
  fallback,
  className = "",
}: SmartGalleryImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      onLoad={() => setLoaded(true)}
      onError={(e) => {
        e.currentTarget.onerror = null;
        if (fallback) e.currentTarget.src = fallback;
      }}
      loading="lazy"
      className={[
        "w-full h-full object-cover transition-opacity duration-300",
        loaded ? "opacity-100" : "opacity-0",
        className,
      ].join(" ")}
    />
  );
};

export default SmartGalleryImage;
