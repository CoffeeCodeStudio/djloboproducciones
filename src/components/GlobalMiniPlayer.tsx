import { usePlayerStore } from "@/stores/usePlayerStore";
import { X, Disc3, Music } from "lucide-react";
import { useRef, useEffect, useCallback } from "react";
import { useCookieConsent } from "@/contexts/CookieConsentContext";
import { logger } from "@/lib/logger";

const GlobalMiniPlayer = () => {
  const { currentTrack, isPlaying, stop } = usePlayerStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { hasConsented } = useCookieConsent();

  // Stop playback if consent is revoked
  useEffect(() => {
    if (!hasConsented && currentTrack) {
      stop();
    }
  }, [hasConsented, currentTrack, stop]);

  const getEmbedUrl = () => {
    if (!currentTrack) return "";
    const path = currentTrack.originalUrl
      .replace(/https?:\/\/(www\.)?mixcloud\.com/, "")
      .replace(/\/$/, "");
    return `https://www.mixcloud.com/widget/iframe/?dark=1&hide_cover=1&mini=1&autoplay=1&feed=${encodeURIComponent(path + "/")}`;
  };

  // Log widget ready/play events via postMessage
  const handleWidgetMessage = useCallback((event: MessageEvent) => {
    try {
      // Mixcloud sends JSON strings
      if (typeof event.data === "string" && event.data.includes("mixcloud")) {
        console.info("[GlobalMiniPlayer] Mixcloud widget event:", event.data);
      }
      // Mixcloud sends objects too

    } catch { /* ignore non-widget messages */ }
  }, []);

  useEffect(() => {
    window.addEventListener("message", handleWidgetMessage);
    return () => window.removeEventListener("message", handleWidgetMessage);
  }, [handleWidgetMessage]);

  // Log track changes and embed URL
  useEffect(() => {
    if (currentTrack) {
      console.info("[GlobalMiniPlayer] Track changed:", {
        id: currentTrack.id,
        title: currentTrack.title,
        source: currentTrack.source,
      });
    }
  }, [currentTrack?.id]);

  if (!currentTrack) return null;

  const embedUrl = getEmbedUrl();
  console.info("[GlobalMiniPlayer] Embed URL:", embedUrl);

  return (
    <div data-zlayer="global-mini-player" className="fixed bottom-0 left-0 right-0 z-50 h-16 sm:h-[4.5rem]">
      {/* Glass backdrop */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-xl border-t border-primary/30 shadow-[0_-4px_30px_-4px_hsl(var(--primary)/0.25)]" />

      <div className="relative h-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4">
        {/* Cover art thumbnail */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden shrink-0 border border-primary/20">
          {currentTrack.coverArt ? (
            <img
              src={currentTrack.coverArt}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Music className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate leading-tight">
            {currentTrack.title}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Disc3
              className="w-3 h-3 text-primary animate-spin shrink-0"
              style={{ animationDuration: "3s" }}
            />
            <span className="capitalize">{currentTrack.source}</span>
            {isPlaying && <span className="text-primary">• Spelar</span>}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={stop}
          className="tap-target p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive shrink-0"
          aria-label="Stäng spelare"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Hidden iframe for audio playback — visually hidden but in-DOM so autoplay works */}
      {hasConsented && (
        <iframe
          ref={iframeRef}
          key={currentTrack.id}
          src={embedUrl}
          width="300"
          height="150"
          className="absolute opacity-0 pointer-events-none"
          style={{ position: 'absolute', bottom: 0, left: 0, zIndex: -1 }}
          allow="autoplay; encrypted-media"
          title={`Spelar: ${currentTrack.title}`}
        />
      )}
    </div>
  );
};

export default GlobalMiniPlayer;
