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
    // Loop requires playlist=<id> on YouTube embeds
    return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&modestbranding=1&playsinline=1&rel=0`;
  } catch {
    return null;
  }
}

const PromoMiniCard = ({ promo, onClick, onDismiss }: PromoMiniCardProps) => {
  const ytEmbed = !promo.video_file_url && promo.youtube_url
    ? getYouTubeMiniEmbedUrl(promo.youtube_url)
    : null;
  const hasVideo = Boolean(promo.video_file_url);
  const hasYouTube = Boolean(ytEmbed);
  const hasImageOnly = !hasVideo && !hasYouTube && Boolean(promo.flyer_image_url);

  // Don't render if there's nothing to show
  if (!hasVideo && !hasYouTube && !hasImageOnly) return null;

  return (
    <div
      className="fixed z-40 bottom-20 right-4 sm:right-6 sm:bottom-24 w-[280px] max-w-[calc(100vw-2rem)] animate-in slide-in-from-bottom-5 fade-in duration-300"
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={`Öppna kampanj: ${promo.title}`}
        className="group relative block w-full aspect-video overflow-hidden rounded-xl border-2 border-primary/70 bg-black promo-neon-glow hover:scale-[1.03] transition-transform"
      >
        {hasVideo ? (
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
        )}
        {/* Subtle overlay so the X stays visible over bright media */}
        <span className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/20 pointer-events-none" />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        aria-label="Stäng"
        className="absolute -top-2 -right-2 z-10 w-7 h-7 rounded-full bg-background/80 backdrop-blur-md border-2 border-primary text-foreground shadow-[0_0_10px_hsl(var(--primary)/0.8)] hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all flex items-center justify-center"
      >
        <X className="w-3.5 h-3.5" strokeWidth={3} />
      </button>
    </div>
  );
};

export default PromoMiniCard;
