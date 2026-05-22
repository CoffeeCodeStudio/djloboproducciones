import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Loader2,
  Radio,
  Disc3,
  Music,
  ListMusic,
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useStreamStatus } from "@/hooks/useStreamStatus";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { useLocalizedTo } from "@/hooks/useLocalizedTo";
import { logger } from "@/lib/logger";
import { useScheduleNow, formatRelativeShort } from "@/hooks/useScheduleNow";

const STREAM_URL = "https://stream.zeno.fm/gzzqvbuy0d7uv";

const translations = {
  sv: {
    radioLive: "RADIO LOBO — LIVE",
    radioIdle: "RADIO LOBO",
    connecting: "ANSLUTER...",
    liveRadio: "Live Radio",
    minaMixar: "Mina Mixar",
    pauseRadio: "Pausa radio",
    playRadio: "Spela radio",
    unmute: "Slå på ljud",
    mute: "Tysta",
    volume: "Volym",
    player: "Spelare",
    playing: "Spelar",
    expand: "Expandera",
    minimize: "Minimera",
    close: "Stäng",
    nowSet: "NU",
    nextSet: "NÄSTA",
    inTime: "om",
    endsIn: "slutar om",
  },
  en: {
    radioLive: "RADIO LOBO — LIVE",
    radioIdle: "RADIO LOBO",
    connecting: "CONNECTING...",
    liveRadio: "Live Radio",
    minaMixar: "My Mixes",
    pauseRadio: "Pause radio",
    playRadio: "Play radio",
    unmute: "Unmute",
    mute: "Mute",
    volume: "Volume",
    player: "Player",
    playing: "Playing",
    expand: "Expand",
    minimize: "Minimize",
    close: "Close",
    nowSet: "NOW",
    nextSet: "NEXT",
    inTime: "in",
    endsIn: "ends in",
  },
  es: {
    radioLive: "RADIO LOBO — EN VIVO",
    radioIdle: "RADIO LOBO",
    connecting: "CONECTANDO...",
    liveRadio: "Radio en Vivo",
    minaMixar: "Mis Mezclas",
    pauseRadio: "Pausar radio",
    playRadio: "Reproducir radio",
    unmute: "Activar sonido",
    mute: "Silenciar",
    volume: "Volumen",
    player: "Reproductor",
    playing: "Reproduciendo",
    expand: "Expandir",
    minimize: "Minimizar",
    close: "Cerrar",
    nowSet: "AHORA",
    nextSet: "SIGUIENTE",
    inTime: "en",
    endsIn: "termina en",
  },
};

const NowPlayingBar = () => {
  const {
    mode,
    currentTrack,
    isPlaying,
    isMinimized,
    playRadio,
    playMix,
    pause,
    resume,
    stop,
    toggleMinimize,
  } = usePlayerStore();

  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mixIframeRef = useRef<HTMLIFrameElement>(null);
  const { status, setStatus } = useStreamStatus();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const lto = useLocalizedTo();
  const t = translations[language];
  const schedule = useScheduleNow();

  // Visualizer is phase-locked to the current set: animation-duration is
  // derived from the set length (clamped) and animation-delay is the
  // negative offset of "how long we're already into the set", so the bars
  // appear to have been running since the set started instead of resetting
  // every render. When idle we fall back to a calm 1.2s loop.
  const visualizerStyle: React.CSSProperties = (() => {
    if (!schedule.current) {
      return { animationDuration: "1.2s", animationDelay: "0s" };
    }
    const start = new Date(schedule.current.start).getTime();
    const end = new Date(schedule.current.end).getTime();
    const setMs = Math.max(60_000, end - start);
    // Map a 30-min set → ~0.7s, 2h+ set → ~0.45s. Stays musical.
    const durationSec = Math.max(0.45, Math.min(1.2, 1800_000 / setMs));
    const elapsedSec = Math.max(0, (Date.now() - start) / 1000);
    return {
      animationDuration: `${durationSec.toFixed(2)}s`,
      // Negative delay → CSS treats the animation as already in progress,
      // so reloads / re-renders don't snap the bars back to frame 0.
      animationDelay: `-${(elapsedSec % durationSec).toFixed(2)}s`,
    };
  })();

  const isRadio = mode === "radio";
  const isMix = mode === "mix";
  const isActive = mode !== null;

  // Sync HTML audio element with radio mode
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isRadio && isPlaying) {
      setIsLoading(true);
      setStatus("connecting");
      audio.src = STREAM_URL;
      audio.load();
      audio.play().then(() => {
        setIsLoading(false);
        setStatus("live");
      }).catch((err) => {
        logger.error("Radio play error:", err);
        setIsLoading(false);
        setStatus("error", "Kunde inte ansluta");
      });
    } else if (!isRadio || !isPlaying) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      if (status === "live" || status === "connecting") {
        setStatus("offline");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRadio, isPlaying]);

  // Volume sync for radio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Mix playback is handled entirely by the iframe's autoplay=1 URL param.
  // No Mixcloud Widget API needed.


  // Audio element event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlaying = () => { setIsLoading(false); setStatus("live"); };
    const onWaiting = () => { setIsLoading(true); setStatus("connecting"); };
    const onError = () => { setIsLoading(false); setStatus("error"); };
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("error", onError);
    };
  }, [setStatus]);

  // Add/remove body padding when player is active
  useEffect(() => {
    if (isActive) {
      document.body.style.paddingBottom = "60px";
    } else {
      document.body.style.paddingBottom = "";
    }
    return () => {
      document.body.style.paddingBottom = "";
    };
  }, [isActive]);

  const handleRadioToggle = () => {
    if (isRadio && isPlaying) {
      stop();
      setStatus("offline");
    } else {
      playRadio();
    }
  };

  const handleMixesClick = () => {
    navigate(lto("/mixar"));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
    if (isMuted && Number(e.target.value) > 0) setIsMuted(false);
  };

  // Build Mixcloud embed URL
  const getMixEmbedUrl = () => {
    if (!currentTrack) return "";
    const path = currentTrack.originalUrl
      .replace(/https?:\/\/(www\.)?mixcloud\.com/, "")
      .replace(/\/$/, "");
    return `https://www.mixcloud.com/widget/iframe/?dark=1&hide_cover=0&mini=1&autoplay=1&feed=${encodeURIComponent(path + "/")}`;
  };

  const showExpandedMix = isMix && currentTrack && !isMinimized;

  return (
    <div
      data-zlayer="now-playing-bar"
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
        showExpandedMix ? "h-[200px] sm:h-[220px] md:h-[260px]" : "h-auto"
      }`}
      role="region"
      aria-label={t.player}
    >
      {/* Hidden audio element for radio */}
      <audio ref={audioRef} preload="none" />

      {/* Solid dark backdrop */}
      <div className="absolute inset-0 bg-background border-t border-border/50" />

      <div className="relative h-full flex flex-col">
        {/* === SCHEDULE STRIP — current/next set with progress === */}
        {(schedule.current || schedule.next) && (
          <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 pt-1 pb-0.5 border-b border-border/30 shrink-0">
            <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs">
              {schedule.current && (
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span className="font-display font-bold tracking-wider text-primary shrink-0">
                    {t.nowSet}
                  </span>
                  <span className="truncate text-foreground font-medium">
                    {schedule.current.summary}
                  </span>
                  <div className="hidden sm:block flex-1 max-w-[120px] h-1 bg-muted/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                      style={{ width: `${(schedule.progress * 100).toFixed(2)}%` }}
                    />
                  </div>
                  <span className="text-muted-foreground shrink-0 tabular-nums">
                    {t.endsIn} {formatRelativeShort(schedule.msToCurrentEnd)}
                  </span>
                </div>
              )}
              {schedule.next && !schedule.current && (
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span className="font-display font-bold tracking-wider text-secondary shrink-0">
                    {t.nextSet}
                  </span>
                  <span className="truncate text-foreground font-medium">
                    {schedule.next.summary}
                  </span>
                  <span className="text-muted-foreground shrink-0 tabular-nums">
                    {t.inTime} {formatRelativeShort(schedule.msToNext)}
                  </span>
                </div>
              )}
              {schedule.current && schedule.next && (
                <div className="hidden md:flex items-center gap-1.5 shrink-0 text-muted-foreground">
                  <span className="font-display font-bold tracking-wider text-secondary">
                    {t.nextSet}
                  </span>
                  <span className="truncate max-w-[160px] text-foreground/80">
                    {schedule.next.summary}
                  </span>
                  <span className="tabular-nums">
                    · {t.inTime} {formatRelativeShort(schedule.msToNext)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main control bar — mobile: taller, reorganized layout */}
        <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-3 shrink-0">

          {/* === PLAY/PAUSE button (LEFT on mobile) === */}
          {isRadio && (
            <button
              onClick={handleRadioToggle}
              disabled={isLoading}
              className="tap-target w-11 h-11 sm:w-11 sm:h-11 rounded-full bg-gradient-to-r from-destructive to-destructive/80 flex items-center justify-center hover:scale-110 transition-transform focus-neon disabled:opacity-70 shrink-0"
              aria-label={isPlaying ? t.pauseRadio : t.playRadio}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" />
              )}
            </button>
          )}

          {/* === NOW PLAYING INFO (center, flexible) === */}
          <div className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3">
            {/* Cover art / Radio icon — smaller on mobile */}
            {isMix && currentTrack?.coverArt ? (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden shrink-0 border border-primary/20">
                <img src={currentTrack.coverArt} alt={currentTrack.title} className="w-full h-full object-cover" />
              </div>
            ) : isRadio ? (
              <div className="hidden sm:flex w-10 h-10 rounded-lg shrink-0 bg-destructive/10 border border-destructive/20 items-center justify-center">
                <Radio className="w-5 h-5 text-destructive" />
              </div>
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg shrink-0 bg-muted flex items-center justify-center">
                <Music className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              </div>
            )}

            {/* Title + status */}
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-foreground truncate leading-tight">
                {isRadio
                  ? isPlaying
                    ? t.radioLive
                    : t.radioIdle
                  : isMix && currentTrack
                  ? currentTrack.title
                  : "DJ Lobo Producciones"}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                {isRadio && isPlaying && !isLoading && (
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive" />
                    </span>
                    <span className="text-destructive font-bold">LIVE</span>
                    {/* Mini visualizer — hide on very small screens */}
                    <div className="hidden xs:flex items-end gap-px h-3" aria-hidden="true">
                      {[1, 2, 3, 4].map((bar, i) => (
                        <div
                          key={bar}
                          className="w-0.5 bg-destructive rounded-full visualizer-bar"
                          style={{
                            ...visualizerStyle,
                            // Per-bar phase offset on top of the schedule-locked
                            // delay so bars don't move in lockstep.
                            animationDelay: `calc(${visualizerStyle.animationDelay} - ${i * 0.08}s)`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {isRadio && isLoading && (
                  <div className="flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                    <span>{t.connecting}</span>
                  </div>
                )}
                {isMix && currentTrack && (
                  <div className="flex items-center gap-1.5">
                    <Disc3 className="w-3 h-3 text-primary animate-spin shrink-0" style={{ animationDuration: "3s" }} />
                    <span className="capitalize">{currentTrack.source}</span>
                    {isPlaying && <span className="text-primary">• {t.playing}</span>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* === Mix player controls === */}
          {isMix && currentTrack && (
            <div className="flex items-center gap-0 shrink-0">
              <button
                onClick={toggleMinimize}
                className="tap-target p-1.5 sm:p-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                aria-label={isMinimized ? t.expand : t.minimize}
              >
                {isMinimized ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
              <button
                onClick={stop}
                className="tap-target p-1.5 sm:p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                aria-label={t.close}
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          )}

          {/* === SWITCHER: Radio / Mixes (RIGHT on mobile) === */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Radio switcher — only show if NOT already in radio mode (avoid double radio btn) */}
            {!isRadio && (
              <button
                onClick={handleRadioToggle}
                className="tap-target flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-sm font-display font-bold tracking-wide transition-all duration-200 glass-card text-muted-foreground hover:text-foreground hover:border-destructive/30"
                aria-label={t.playRadio}
              >
                <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t.liveRadio}</span>
              </button>
            )}

            {/* Mixes button */}
            <button
              onClick={handleMixesClick}
              className={`tap-target flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-sm font-display font-bold tracking-wide transition-all duration-200 ${
                isMix
                  ? "bg-primary/20 text-primary border border-primary/40 shadow-[0_0_12px_hsl(var(--primary)/0.3)]"
                  : "glass-card text-muted-foreground hover:text-foreground hover:border-primary/30"
              }`}
              aria-label={t.minaMixar}
            >
              <ListMusic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{t.minaMixar}</span>
            </button>
          </div>

          {/* === Volume (all modes) — hidden on xs === */}
          {(isRadio || (isMix && currentTrack)) && (
            <div className="hidden xs:flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                onClick={() => setIsMuted(!isMuted)}
                aria-label={isMuted ? t.unmute : t.mute}
                className="tap-target p-1 sm:p-1.5 text-muted-foreground hover:text-foreground transition-colors focus-neon rounded-lg"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </button>
              <div className="relative w-12 sm:w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-destructive to-primary rounded-full transition-all"
                  style={{ width: `${isMuted ? 0 : volume}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  aria-label={`${t.volume}: ${volume}%`}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* === Expanded mix iframe === */}
        {showExpandedMix && (
          <div className="flex-1 px-2 sm:px-4 pb-2 sm:pb-3 min-h-0">
            <iframe
              ref={mixIframeRef}
              src={getMixEmbedUrl()}
              width="100%"
              height="100%"
              className="rounded-lg border border-primary/10"
              allow="autoplay"
              title={currentTrack.title}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NowPlayingBar;
