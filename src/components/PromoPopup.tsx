import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Disc3, X } from "lucide-react";
import confetti from "canvas-confetti";
import { logger } from "@/lib/logger";
import {
  CONFETTI_CANVAS_Z_INDEX,
  PROMO_PARTICLE_LAYER_Z_INDEX,
  createConfettiThrottleState,
  resetOpenCycle,
  shouldFireConfetti,
} from "@/lib/confettiThrottle";
import type { Promo } from "@/hooks/useActivePromo";
import { trackPromoEvent } from "@/lib/promoAnalytics";

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

const COLORS = ["#ff00ff", "#00ffff", "#ff0080", "#9d4edd"];

// Lightweight "woosh/pop" via Web Audio API — no asset needed.
// Routes through an AnalyserNode so the EQ bars can react to the actual sound.
// Returns a getter that reports current intensity (0..1) for ~400ms after play.
function playOpenSound(): (() => number) | null {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Analyser shared by both sources so we can read combined intensity
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.6;
    const buffer = new Uint8Array(analyser.frequencyBinCount);

    // Quick pop: sine sweep 880Hz -> 220Hz
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.18);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.25, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    osc.connect(gain);
    gain.connect(analyser);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.24);

    // Soft noise "woosh" tail
    const bufferSize = Math.floor(ctx.sampleRate * 0.18);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.08, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 1200;
    noise.connect(filter).connect(noiseGain);
    noiseGain.connect(analyser);
    noiseGain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.2);

    let closed = false;
    setTimeout(() => {
      closed = true;
      ctx.close().catch(() => {});
    }, 500);

    // Intensity getter: averages the analyser frequency bins, normalized 0..1
    return () => {
      if (closed) return 0;
      try {
        analyser.getByteFrequencyData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) sum += buffer[i];
        return Math.min(1, sum / buffer.length / 180);
      } catch {
        return 0;
      }
    };
  } catch {
    return null;
  }
}

const SOUND_SESSION_KEY = "promo-popup-sound-played";
const MUTE_PREFERENCE_KEY = "promo-popup-muted";

const PromoPopup = ({ promo, open, onClose, onPermanentDismiss }: PromoPopupProps) => {
  const ytEmbed = promo.youtube_url ? getYouTubeEmbedUrl(promo.youtube_url) : null;
  const timersRef = useRef<number[]>([]);
  const throttleStateRef = useRef(createConfettiThrottleState());
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const ctaAnchorRef = useRef<HTMLDivElement | null>(null);
  // Live audio intensity getter (returns 0..1) — set when sound is played
  const intensityGetterRef = useRef<(() => number) | null>(null);
  const intensityActiveUntilRef = useRef<number>(0);
  // Refs for the 5 EQ bars so we can drive scaleY directly
  const eqBarRefs = useRef<Array<HTMLSpanElement | null>>([]);

  // Mute preference — persisted in localStorage, scoped to the promo popup only.
  // Does NOT affect any other audio in the app.
  const [muted, setMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(MUTE_PREFERENCE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const mutedRef = useRef(muted);
  useEffect(() => {
    mutedRef.current = muted;
    try {
      if (muted) localStorage.setItem(MUTE_PREFERENCE_KEY, "1");
      else localStorage.removeItem(MUTE_PREFERENCE_KEY);
    } catch {
      /* ignore */
    }
  }, [muted]);

  // Play "woosh/pop" on open — once per session for visitors,
  // every time when previewing from admin (promo.id === "preview").
  useEffect(() => {
    if (!open) return;
    if (mutedRef.current) return; // Respect popup-only mute preference
    const isPreview = promo.id === "preview";
    const trigger = () => {
      const getter = playOpenSound();
      if (getter) {
        intensityGetterRef.current = getter;
        // Reactive window: ~500ms while the woosh plays out
        intensityActiveUntilRef.current = performance.now() + 500;
      }
    };
    if (isPreview) {
      trigger();
      return;
    }
    try {
      if (!sessionStorage.getItem(SOUND_SESSION_KEY)) {
        trigger();
        sessionStorage.setItem(SOUND_SESSION_KEY, "1");
      }
    } catch {
      /* sessionStorage may be unavailable */
    }
  }, [open, promo.id]);

  // EQ driver: rAF loop that reads live audio intensity and drives bar scaleY.
  // While sound is active, bars react to the analyser. Otherwise, gentle idle pulse.
  useEffect(() => {
    if (!open) return;
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      // Static low height for reduced motion
      eqBarRefs.current.forEach((el) => {
        if (el) el.style.transform = "scaleY(0.4)";
      });
      return;
    }

    let raf = 0;
    // Per-bar phase offsets so idle motion isn't uniform
    const phaseOffsets = [0, 0.6, 1.2, 0.3, 0.9];
    // Per-bar intensity multipliers (mids/highs vary)
    const barWeights = [0.85, 1.1, 1.25, 1.0, 0.7];

    const tick = () => {
      const now = performance.now();
      const audioActive = now < intensityActiveUntilRef.current;
      const liveIntensity = audioActive && intensityGetterRef.current
        ? intensityGetterRef.current()
        : 0;

      eqBarRefs.current.forEach((el, i) => {
        if (!el) return;
        let scale: number;
        if (audioActive && liveIntensity > 0.01) {
          // Reactive: amplify per-bar weight + small idle jitter so each bar differs
          const jitter = 0.08 * Math.sin(now / 90 + phaseOffsets[i] * 4);
          scale = Math.max(0.25, Math.min(1, liveIntensity * barWeights[i] * 2.2 + jitter));
        } else {
          // Idle: gentle multi-frequency bounce so it never looks dead
          const t = now / 1000;
          const wave =
            0.55 +
            0.35 * Math.sin(t * 2.8 + phaseOffsets[i]) *
              Math.cos(t * 1.3 + phaseOffsets[i] * 0.7);
          scale = Math.max(0.22, Math.min(1, wave));
        }
        el.style.transform = `scaleY(${scale.toFixed(3)})`;
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      intensityGetterRef.current = null;
      intensityActiveUntilRef.current = 0;
    };
  }, [open]);

  // Auto-close after 8s. Pauses while the user hovers/focuses inside the dialog,
  // and skips entirely in admin preview mode. Manual close (X / overlay / Esc /
  // "Visa inte igen") still works at any time.
  const AUTO_CLOSE_MS = 8000;
  const [isPaused, setIsPaused] = useState(false);
  useEffect(() => {
    if (!open) return;
    if (promo.id === "preview") return; // Admin preview: no auto-dismiss
    if (isPaused) return;
    const t = window.setTimeout(() => {
      logger.log("[PromoPopup] auto-close fired", { promoId: promo.id, afterMs: AUTO_CLOSE_MS });
      // Signal to PromoManager that this close was automatic, not manual
      (window as unknown as { __promoCloseReason?: string }).__promoCloseReason = "auto";
      trackPromoEvent(promo.id, "closed", { close_reason: "auto", after_ms: AUTO_CLOSE_MS });
      onClose();
    }, AUTO_CLOSE_MS);
    return () => window.clearTimeout(t);
  }, [open, isPaused, promo.id, onClose]);


  // Auto-scroll the inner content so the title/CTA area is reachable
  // immediately on open (helps when media is tall).
  useEffect(() => {
    if (!open) return;
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(() => {
      const scroller = scrollRef.current;
      const anchor = ctaAnchorRef.current;
      if (!scroller || !anchor) return;
      // Scroll so the text/CTA anchor is visible near the bottom of the scroller
      anchor.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "end",
      });
    }, 350);
    return () => window.clearTimeout(t);
  }, [open]);

  // Mount a FRESH canvas + confetti instance every time the popup opens.
  // Tear it down on close so no stale DOM/timers can suppress later bursts.
  useEffect(() => {
    // Reset the per-open guard the moment the popup closes
    if (!open) {
      resetOpenCycle(throttleStateRef.current);
      return;
    }

    // Throttle: max one burst per cooldown, plus once-per-open-cycle guard
    const decision = shouldFireConfetti(throttleStateRef.current, Date.now());
    if (decision.fire === false) {
      if (decision.reason === "already-fired-this-open") {
        logger.log("[PromoPopup] Confetti blocked: already fired for this open cycle");
      } else {
        logger.log("[PromoPopup] Confetti blocked by throttle (3s cooldown)", {
          timeSinceLast: decision.timeSinceLast,
        });
      }
      return;
    }

    logger.log("[PromoPopup] Confetti firing now");

    // Create a dedicated full-screen canvas just for this open cycle
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.inset = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.pointerEvents = "none";
    // Sit clearly above Radix Dialog overlay/content and any modal
    canvas.style.zIndex = String(CONFETTI_CANVAS_Z_INDEX);
    canvas.setAttribute("data-promo-confetti", "true");
    document.body.appendChild(canvas);

    // Bind a fresh confetti instance to this canvas
    const myConfetti = confetti.create(canvas, {
      resize: true,
      useWorker: true,
    });

    // Detect reduced-motion preference
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const fireFull = () => {
      myConfetti({
        particleCount: 140,
        spread: 90,
        startVelocity: 45,
        origin: { y: 0.35, x: 0.5 },
        colors: COLORS,
      });
      const t2 = window.setTimeout(() => {
        myConfetti({
          particleCount: 80,
          spread: 120,
          startVelocity: 35,
          origin: { y: 0.4, x: 0.5 },
          colors: COLORS,
        });
      }, 180);
      timersRef.current.push(t2);
    };

    // Reduced-motion alternative: a single, gentle, low-particle "sparkle"
    // burst with low velocity and quick fade. No second wave, no fast spread.
    const fireSparkle = () => {
      myConfetti({
        particleCount: 24,
        spread: 50,
        startVelocity: 12,
        gravity: 0.5,
        ticks: 80,
        scalar: 0.8,
        origin: { y: 0.4, x: 0.5 },
        colors: COLORS,
      });
    };

    const fire = prefersReducedMotion ? fireSparkle : fireFull;

    const t1 = window.setTimeout(fire, 220);
    timersRef.current.push(t1);

    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
      try {
        myConfetti.reset();
      } catch {
        /* noop */
      }
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, [open]);

  const handleCta = () => {
    trackPromoEvent(promo.id, "cta_click", { url: promo.cta_url });
    if (promo.cta_url) {
      window.open(promo.cta_url, "_blank", "noopener,noreferrer");
    }
    onClose();
  };

  // Pre-compute drifting musical particles (notes + vinyls) — outside modal edges
  const particles = useMemo(() => {
    const symbols = ["♪", "♫", "♩", "♬", "𝄞", "●"];
    return Array.from({ length: 18 }).map((_, i) => {
      const symbol = symbols[i % symbols.length];
      const isVinyl = symbol === "●";
      return {
        key: i,
        symbol,
        isVinyl,
        left: Math.random() * 100,
        delay: Math.random() * 8,
        duration: 12 + Math.random() * 14,
        size: 14 + Math.random() * 22,
      };
    });
  }, []);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      {/* Ambient drifting musical particles — fixed full-screen, behind dialog content */}
      {open && (
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none overflow-hidden"
          style={{ zIndex: 40 }}
        >
          {particles.map((p) => (
            <span
              key={p.key}
              className="drift-particle"
              style={{
                left: `${p.left}%`,
                bottom: 0,
                fontSize: `${p.size}px`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                opacity: 0.3,
              }}
            >
              {p.isVinyl ? (
                <Disc3
                  size={p.size}
                  className="vinyl-spin"
                  style={{ color: "hsl(var(--neon-pink))" }}
                />
              ) : (
                p.symbol
              )}
            </span>
          ))}
        </div>
      )}

      <DialogContent
        data-zlayer="promo-popup-content"
        aria-labelledby="promo-popup-title"
        aria-describedby={promo.subtitle ? "promo-popup-desc" : undefined}
        className="p-0 overflow-visible w-[calc(100vw-1.5rem)] xs:w-[calc(100vw-2rem)] sm:w-auto max-w-[min(calc(100vw-1.5rem),28rem)] sm:max-w-md max-h-[80vh] sm:max-h-[90vh] mx-3 xs:mx-4 sm:mx-auto flex flex-col gap-0 glass-card border-2 border-primary/60 promo-neon-glow promo-popup-enter"
        style={{ zIndex: 9999, cursor: "auto" }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={(e) => {
          // Only unpause when focus actually leaves the dialog content
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setIsPaused(false);
          }
        }}
      >
        {/* Screen-reader-only title & description for accessibility */}
        <DialogTitle className="sr-only" id="promo-popup-title">
          {promo.title}
        </DialogTitle>
        {promo.subtitle && (
          <DialogDescription className="sr-only" id="promo-popup-desc">
            {promo.subtitle}
          </DialogDescription>
        )}
        {/* Ambient outer aura — pulsing radial glow behind the modal */}
        <span aria-hidden="true" className="promo-aura" />

        {/* Sound-wave ripples — 3 expanding neon rings behind the modal */}
        <span
          aria-hidden="true"
          className="promo-ripple"
          style={{
            width: "100%",
            height: "100%",
            borderColor: "hsla(var(--neon-pink), 0.7)",
            animationDelay: "0s",
          }}
        />
        <span
          aria-hidden="true"
          className="promo-ripple"
          style={{
            width: "100%",
            height: "100%",
            borderColor: "hsla(var(--neon-cyan), 0.6)",
            animationDelay: "1.1s",
          }}
        />
        <span
          aria-hidden="true"
          className="promo-ripple"
          style={{
            width: "100%",
            height: "100%",
            borderColor: "hsla(var(--neon-pink), 0.5)",
            animationDelay: "2.2s",
          }}
        />

        {/* Vinyl-record close button — spinning record with bold centered white X */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Stäng"
          className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 z-30 w-11 h-11 rounded-full bg-background/70 backdrop-blur-md border-2 border-primary shadow-[0_0_16px_hsl(var(--primary)/0.9)] hover:shadow-[0_0_28px_hsl(var(--primary))] hover:scale-110 active:scale-95 transition-all group flex items-center justify-center"
        >
          <Disc3
            className="absolute inset-0 m-auto h-9 w-9 vinyl-spin text-primary/80 group-hover:[animation-duration:1.2s]"
            aria-hidden="true"
          />
          <X
            className="relative h-5 w-5 text-white drop-shadow-[0_0_6px_hsl(var(--primary))] group-hover:scale-125 group-hover:drop-shadow-[0_0_10px_hsl(var(--neon-cyan))] transition-transform"
            strokeWidth={3.5}
          />
        </button>

        {/* Scrollable area: media + text */}
        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scroll-smooth rounded-[inherit]">
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

          {/* Text — glassmorphism container with neon border + live EQ */}
          <div
            ref={ctaAnchorRef}
            className="px-4 sm:px-6 pt-5 pr-12 sm:pr-6 pb-4 space-y-3 bg-black/60 backdrop-blur-xl border-t border-b border-primary/40"
          >
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <h2
                className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent leading-tight break-words min-w-0"
                style={{
                  textShadow: "0 2px 6px rgba(0,0,0,0.85)",
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.8))",
                }}
              >
                {promo.title}
              </h2>
              <div className="flex items-center gap-2 shrink-0">
                {/* 5-bar live EQ — driven by Web Audio analyser via rAF */}
                <div className="hidden sm:flex items-end gap-[3px] h-5 pt-2" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      ref={(el) => { eqBarRefs.current[i] = el; }}
                      className="eq-bar"
                      style={{
                        animation: "none",
                        transform: "scaleY(0.4)",
                        transition: "transform 60ms linear",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            {promo.subtitle && (
              <p className="text-sm text-foreground/90" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
                {promo.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Sticky footer: CTA always visible */}
        <div className="px-6 py-4 space-y-3 border-t border-border/40 bg-background/80 backdrop-blur-sm flex-shrink-0 rounded-b-[inherit]">
          {promo.cta_text && promo.cta_url && (
            <Button onClick={handleCta} className="w-full promo-cta-pulse" size="lg">
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
