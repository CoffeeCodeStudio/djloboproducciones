import { usePlayerStore } from "@/stores/usePlayerStore";
import { X, ChevronDown, ChevronUp, Disc3, Music } from "lucide-react";
import { useRef, useEffect } from "react";
import { useCookieConsent } from "@/contexts/CookieConsentContext";
import EmbedBlockedNotice from "@/components/EmbedBlockedNotice";

const GlobalMiniPlayer = () => {
  const { currentTrack, isPlaying, isMinimized, stop, toggleMinimize } = usePlayerStore();
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
    if (currentTrack.source === "mixcloud") {
      const path = currentTrack.originalUrl
        .replace(/https?:\/\/(www\.)?mixcloud\.com/, "")
        .replace(/\/$/, "");
      return `https://www.mixcloud.com/widget/iframe/?dark=1&hide_cover=1&mini=1&autoplay=1&feed=${encodeURIComponent(path + "/")}`;
    }
    if (currentTrack.embedUrl.includes("w.soundcloud.com")) {
      return currentTrack.embedUrl.replace("auto_play=false", "auto_play=true");
    }
    const encoded = encodeURIComponent(currentTrack.originalUrl.trim());
    return `https://w.soundcloud.com/player/?url=${encoded}&color=%2300e5ff&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`;
  };

  if (!currentTrack) return null;

  const embedUrl = getEmbedUrl();

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
        isMinimized ? "h-14 sm:h-16" : "h-[220px] sm:h-[240px] md:h-[280px]"
      }`}
    >
      {/* Glass backdrop */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-xl border-t border-primary/30 shadow-[0_-4px_30px_-4px_hsl(var(--primary)/0.25)]" />

      <div className="relative h-full flex flex-col overflow-hidden">
        {/* Control bar */}
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 shrink-0 min-h-[3rem] sm:min-h-[3.5rem]">
          {/* Cover art thumbnail */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden shrink-0 border border-primary/20">
            {currentTrack.coverArt ? (
              <img
                src={currentTrack.coverArt}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Music className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Track info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-foreground truncate leading-tight">
              {currentTrack.title}
            </p>
            <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
              <Disc3 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary animate-spin shrink-0" style={{ animationDuration: "3s" }} />
              <span className="capitalize">{currentTrack.source}</span>
              {isPlaying && <span className="text-primary">• Spelar</span>}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-0 shrink-0">
            <button
              onClick={toggleMinimize}
              className="tap-target p-1.5 sm:p-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
              aria-label={isMinimized ? "Expandera spelare" : "Minimera spelare"}
            >
              {isMinimized ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
            <button
              onClick={stop}
              className="tap-target p-1.5 sm:p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
              aria-label="Stäng spelare"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Embed iframe — hidden when minimized */}
        {!isMinimized && (
          <div className="flex-1 px-3 sm:px-4 pb-2 sm:pb-3 min-h-0">
            {hasConsented ? (
              <iframe
                ref={iframeRef}
                src={embedUrl}
                width="100%"
                height="100%"
                className="rounded-lg border border-primary/10"
                allow="autoplay"
                title={`Spelar: ${currentTrack.title}`}
              />
            ) : (
              <EmbedBlockedNotice className="h-full rounded-lg" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalMiniPlayer;
