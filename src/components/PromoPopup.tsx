import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

const PromoPopup = ({ promo, open, onClose, onPermanentDismiss }: PromoPopupProps) => {
  const ytEmbed = promo.youtube_url ? getYouTubeEmbedUrl(promo.youtube_url) : null;

  const handleCta = () => {
    if (promo.cta_url) {
      window.open(promo.cta_url, "_blank", "noopener,noreferrer");
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="p-0 overflow-hidden max-w-md glass-card border-primary/40">
        {/* Media */}
        <div className="relative w-full aspect-square overflow-hidden bg-black">
          {promo.video_file_url ? (
            <video
              src={promo.video_file_url}
              poster={promo.flyer_image_url ?? undefined}
              controls
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : ytEmbed ? (
            <div className="absolute inset-0 w-full h-full">
              <iframe
                src={ytEmbed}
                title={promo.title}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          ) : promo.flyer_image_url ? (
            <img
              src={promo.flyer_image_url}
              alt={promo.title}
              className="w-full h-full object-cover object-center"
            />
          ) : null}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold neon-gradient bg-clip-text text-transparent">
              {promo.title}
            </h2>
            {promo.subtitle && (
              <p className="text-sm text-muted-foreground">{promo.subtitle}</p>
            )}
          </div>

          {promo.cta_text && promo.cta_url && (
            <Button onClick={handleCta} className="w-full" size="lg">
              {promo.cta_text}
            </Button>
          )}

          <div className="text-center pt-1">
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
