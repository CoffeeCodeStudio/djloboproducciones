import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useCookieConsent } from "@/contexts/CookieConsentContext";
import EmbedBlockedNotice from "@/components/EmbedBlockedNotice";

interface MediaLightboxProps {
  open: boolean;
  onClose: () => void;
  type: "photo" | "video";
  src: string; // image URL or YouTube video ID
  alt?: string;
  isYouTube?: boolean;
}

const MediaLightbox = ({ open, onClose, type, src, alt, isYouTube }: MediaLightboxProps) => {
  const { hasConsented } = useCookieConsent();
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] p-0 bg-background/95 backdrop-blur-xl border-primary/20 overflow-hidden [&>button]:hidden">
        {/* Custom close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-50 w-9 h-9 rounded-full bg-background/80 border border-primary/30 flex items-center justify-center hover:bg-background hover:border-primary/60 transition-all"
          aria-label="Stäng"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>

        {type === "photo" ? (
          <img
            src={src}
            alt={alt || "Gallery image"}
            className="w-full max-h-[85vh] object-contain"
          />
        ) : isYouTube ? (
          <div className="aspect-video w-full">
            <iframe
              src={`https://www.youtube.com/embed/${src}?rel=0&modestbranding=1&autoplay=1`}
              title={alt || "Video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        ) : (
          <div className="aspect-video w-full">
            <video
              src={src}
              controls
              autoPlay
              className="w-full h-full bg-black"
            >
              Din webbläsare stöder inte videouppspelning.
            </video>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MediaLightbox;
