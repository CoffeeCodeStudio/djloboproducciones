import { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import confetti from "canvas-confetti";
import type { Promo } from "@/hooks/useActivePromo";

interface PromoPopupProps {
  promo: Promo;
  open: boolean;
  onClose: () => void;
  onPermanentDismiss: () => void;
}

function getYouTubeEmbedUrl(url: string): string | null {
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
    return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&rel=0`;
  } catch {
    return null;
  }
}

function fireConfetti() {
  const colors = ["#ff00ff", "#00ffff", "#ff0080", "#9d4edd"];
  // Two bursts for a richer effect
  confetti({
    particleCount: 140,
    spread: 90,
    startVelocity: 45,
    origin: { y: 0.35, x: 0.5 },
    colors,
    zIndex: 10000,
    disableForReducedMotion: true,
  });
  setTimeout(() => {
    confetti({
      particleCount: 80,
      spread: 120,
      startVelocity: 35,
      origin: { y: 0.4, x: 0.5 },
      colors,
      zIndex: 10000,
      disableForReducedMotion: true,
    });
  }, 180);
}

const PromoPopup = ({ promo, open, onClose, onPermanentDismiss }: PromoPopupProps) => {
  const ytEmbed = promo.youtube_url ? getYouTubeEmbedUrl(promo.youtube_url) : null;

  // Fire confetti EVERY time the popup opens (not just first time)
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => fireConfetti(), 220);
    return () => clearTimeout(t);
  }, [open]);

  const handleCta = () => {
    if (promo.cta_url) {
      window.open(promo.cta_url, "_blank", "noopener,noreferrer");
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="p-0 overflow-hidden max-w-md max-h-[90vh] flex flex-col gap-0 glass-card border-primary/40 promo-neon-glow"
      >
        {/* Floating Close button - always visible, distinct over any media */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Stäng"
          className="absolute -top-3 -right-3 sm:top-2 sm:right-2 z-30 rounded-full bg-background border-2 border-primary p-2 text-foreground shadow-[0_0_12px_hsl(var(--primary)/0.8)] hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Scrollable area: media + text */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {/* Media — contained, never pushes content off-screen */}
          {(promo.video_file_url || ytEmbed || promo.flyer_image_url) && (
            <div className="relative w-full bg-black flex items-center justify-center" style={{ maxHeight: "55vh" }}>
              {promo.video_file_url ? (
                <video
                  src={promo.video_file_url}
                  poster={promo.flyer_image_url ?? undefined}
                  controls
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-auto max-h-[55vh] object-contain"
                />
              ) : ytEmbed ? (
                <div className="relative w-full aspect-video">
                  <iframe
                    src={ytEmbed}
                    title={promo.title}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              ) : promo.flyer_image_url ? (
                <img
                  src={promo.flyer_image_url}
                  alt={promo.title}
                  className="w-full h-auto max-h-[55vh] object-contain"
                />
              ) : null}
            </div>
          )}

          {/* Text */}
          <div className="px-6 pt-5 pb-2 space-y-1">
            <h2 className="text-2xl font-bold neon-gradient bg-clip-text text-transparent">
              {promo.title}
            </h2>
            {promo.subtitle && (
              <p className="text-sm text-muted-foreground">{promo.subtitle}</p>
            )}
          </div>
        </div>

        {/* Sticky footer: CTA always visible */}
        <div className="px-6 py-4 space-y-3 border-t border-border/40 bg-background/80 backdrop-blur-sm flex-shrink-0">
          {promo.cta_text && promo.cta_url && (
            <Button onClick={handleCta} className="w-full" size="lg">
              {promo.cta_text}
            </Button>
          )}
          <div className="text-center">
            <button
              onClick={onPermanentDismiss}
              className="text-xs text-muted-foreground underline hover:text-foreground transition-colors"
            >
              Visa inte igen
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PromoPopup;
