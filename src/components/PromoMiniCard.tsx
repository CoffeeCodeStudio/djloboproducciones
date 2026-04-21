import { X } from "lucide-react";
import type { Promo } from "@/hooks/useActivePromo";

interface PromoMiniCardProps {
  promo: Promo;
  onClick: () => void;
  onDismiss: () => void;
}

const PromoMiniCard = ({ promo, onClick, onDismiss }: PromoMiniCardProps) => {
  return (
    <div
      className="fixed z-40 bottom-20 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-24 sm:max-w-[320px] animate-in slide-in-from-bottom-5 fade-in duration-300"
    >
      <button
        onClick={onClick}
        className="glass-card w-full text-left rounded-xl border border-primary/30 p-3 flex items-center gap-3 hover:-translate-y-1 transition-transform shadow-lg"
        aria-label={`Öppna kampanj: ${promo.title}`}
      >
        {promo.flyer_image_url ? (
          <img
            src={promo.flyer_image_url}
            alt=""
            className="w-10 h-10 rounded object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded bg-primary/20 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0 pr-6">
          <p className="font-bold text-sm truncate text-foreground">{promo.title}</p>
          {promo.subtitle && (
            <p className="text-xs text-muted-foreground truncate">{promo.subtitle}</p>
          )}
        </div>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        className="absolute top-1 right-1 p-1 rounded-full bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Stäng"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default PromoMiniCard;
