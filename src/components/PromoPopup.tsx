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
      <DialogContent className="max-w-[500px] p-0 overflow-hidden glass-card border-primary/40">
        {/* Media */}
        {promo.video_file_url ? (
          <video
            src={promo.video_file_url}
            poster={promo.flyer_image_url ?? undefined}
            controls
            autoPlay
            muted
            playsInline
            className="w-full aspect-video bg-black object-contain"
          />
        ) : ytEmbed ? (
          <div className="w-full aspect-video bg-black">
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
            className="w-full max-h-[60vh] object-contain bg-black"
          />
        ) : null}

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
