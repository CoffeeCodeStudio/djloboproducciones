import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { Promo } from "@/hooks/useActivePromo";

interface PromoMiniCardProps {
  promo: Promo;
  onClick: () => void;
  onDismiss: () => void;
}

function getYouTubeMiniEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    let id: string | null = null;
    if (u.hostname.includes("youtu.be")) {
      id = u.pathname.slice(1);
    } else if (u.hostname.includes("youtube.com")) {
      id = u.searchParams.get("v");
      if (!id && u.pathname.startsWith("/embed/")) {
        id = u.pathname.split("/embed/")[1];
      }
    }
    if (!id) return null;
    return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&modestbranding=1&playsinline=1&rel=0`;
  } catch {
    return null;
  }
}

const PromoMiniCard = ({ promo, onClick, onDismiss }: PromoMiniCardProps) => {
  const [visible, setVisible] = useState(true);
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 767px)").matches : false
  );
  const [mobileSlot, setMobileSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Watch for the in-grid mobile slot to mount/unmount as user navigates
  useEffect(() => {
    if (!isMobile) {
      setMobileSlot(null);
      return;
    }
    const find = () => setMobileSlot(document.getElementById("promo-mobile-slot"));
    find();
    const observer = new MutationObserver(find);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [isMobile]);

  const ytEmbed = !promo.video_file_url && promo.youtube_url
    ? getYouTubeMiniEmbedUrl(promo.youtube_url)
    : null;
  const hasVideo = Boolean(promo.video_file_url);
  const hasYouTube = Boolean(ytEmbed);
  const hasImageOnly = !hasVideo && !hasYouTube && Boolean(promo.flyer_image_url);

  if (!hasVideo && !hasYouTube && !hasImageOnly) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVisible(false);
  };

  if (typeof document === "undefined") return null;

  const mediaNode = hasVideo ? (
    <video
      src={promo.video_file_url ?? undefined}
      poster={promo.flyer_image_url ?? undefined}
      autoPlay
      muted
      loop
      playsInline
      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
    />
  ) : hasYouTube ? (
    <iframe
      src={ytEmbed!}
      title=""
      aria-hidden="true"
      allow="autoplay; encrypted-media; picture-in-picture"
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  ) : (
    <img
      src={promo.flyer_image_url!}
      alt=""
      className="absolute inset-0 w-full h-full object-cover promo-ken-burns pointer-events-none"
    />
  );

  // Mobile inline banner — full width inside the grid
  if (isMobile && mobileSlot) {
    return createPortal(
      <AnimatePresence onExitComplete={onDismiss}>
        {visible && (
          <motion.div
            key="promo-mini-mobile"
            data-zlayer="promo-mini-banner"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ type: "spring", stiffness: 240, damping: 26 }}
            className="relative w-full"
          >
            <button
              type="button"
              onClick={onClick}
              aria-label={`Öppna kampanj: ${promo.title}`}
              className="group relative block w-full aspect-video overflow-hidden rounded-xl border-2 border-primary/70 bg-black/40 backdrop-blur-md promo-neon-glow cursor-pointer"
            >
              {mediaNode}
              <span
                className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/20 pointer-events-none"
                style={{ backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)" }}
              />
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Stäng kampanj"
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-md border-2 border-primary text-white shadow-[0_0_12px_hsl(var(--primary)/0.9)] hover:bg-primary transition-all flex items-center justify-center cursor-pointer"
              style={{ zIndex: 110 }}
            >
              <X className="w-4 h-4" strokeWidth={3.5} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>,
      mobileSlot
    );
  }

  // Desktop floating mini card
  if (isMobile) return null; // mobile but no slot on this page → hide

  return createPortal(
    <AnimatePresence onExitComplete={onDismiss}>
      {visible && (
        <motion.div
          key="promo-mini"
          data-zlayer="promo-mini-player"
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 500, opacity: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 26 }}
          className="w-[280px] max-w-[calc(100vw-2rem)] pointer-events-auto"
          style={{
            position: "fixed",
            right: "max(1rem, env(safe-area-inset-right))",
            bottom: "calc(5rem + max(1rem, env(safe-area-inset-bottom)))",
            zIndex: 100,
          }}
        >
          <button
            type="button"
            onClick={onClick}
            aria-label={`Öppna kampanj: ${promo.title}`}
            className="group relative block w-full aspect-video overflow-hidden rounded-xl border-2 border-primary/70 bg-black/40 backdrop-blur-md promo-neon-glow hover:scale-[1.03] transition-transform pointer-events-auto cursor-pointer"
          >
            {mediaNode}
            <span
              className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/20 opacity-100 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none will-change-[opacity]"
              style={{
                backdropFilter: "blur(2px)",
                WebkitBackdropFilter: "blur(2px)",
              }}
            />
            <span className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none will-change-[opacity]" />
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Stäng mini-spelare"
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-md border-2 border-primary text-white shadow-[0_0_12px_hsl(var(--primary)/0.9)] hover:bg-primary hover:scale-110 transition-all flex items-center justify-center pointer-events-auto cursor-pointer"
            style={{ zIndex: 110 }}
          >
            <X className="w-4 h-4" strokeWidth={3.5} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default PromoMiniCard;
