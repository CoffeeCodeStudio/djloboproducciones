import { useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import confetti from "canvas-confetti";
import { logger } from "@/lib/logger";
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

const COLORS = ["#ff00ff", "#00ffff", "#ff0080", "#9d4edd"];

// Lightweight "woosh/pop" via Web Audio API — no asset needed.
function playOpenSound() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Quick pop: sine sweep 880Hz -> 220Hz
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.18);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.25, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    osc.connect(gain).connect(ctx.destination);
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
    noise.connect(filter).connect(noiseGain).connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.2);

    setTimeout(() => ctx.close().catch(() => {}), 400);
  } catch {
    /* noop */
  }
}

const SOUND_SESSION_KEY = "promo-popup-sound-played";

const PromoPopup = ({ promo, open, onClose, onPermanentDismiss }: PromoPopupProps) => {
  const ytEmbed = promo.youtube_url ? getYouTubeEmbedUrl(promo.youtube_url) : null;
  const timersRef = useRef<number[]>([]);
  const lastFiredAtRef = useRef<number>(0);
  const firedForThisOpenRef = useRef<boolean>(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const ctaAnchorRef = useRef<HTMLDivElement | null>(null);

  // Play "woosh/pop" on open — once per session for visitors,
  // every time when previewing from admin (promo.id === "preview").
  useEffect(() => {
    if (!open) return;
    const isPreview = promo.id === "preview";
    if (isPreview) {
      playOpenSound();
      return;
    }
    try {
      if (!sessionStorage.getItem(SOUND_SESSION_KEY)) {
        playOpenSound();
        sessionStorage.setItem(SOUND_SESSION_KEY, "1");
      }
    } catch {
      /* sessionStorage may be unavailable */
    }
  }, [open, promo.id]);

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
      firedForThisOpenRef.current = false;
      return;
    }

    // Throttle: max one confetti burst per 3 seconds, regardless of open toggles
    const now = Date.now();
    if (firedForThisOpenRef.current) {
      logger.log("[PromoPopup] Confetti blocked: already fired for this open cycle");
      return;
    }
    if (now - lastFiredAtRef.current < 3000) {
      logger.log("[PromoPopup] Confetti blocked by throttle (3s cooldown)", {
        timeSinceLast: now - lastFiredAtRef.current,
      });
      return;
    }

    logger.log("[PromoPopup] Confetti firing now");

    firedForThisOpenRef.current = true;
    lastFiredAtRef.current = now;

    // Create a dedicated full-screen canvas just for this open cycle
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.inset = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.pointerEvents = "none";
    // Sit clearly above Radix Dialog overlay/content (which use z-50)
    canvas.style.zIndex = "2147483646";
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
    if (promo.cta_url) {
      window.open(promo.cta_url, "_blank", "noopener,noreferrer");
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="p-0 overflow-hidden max-w-md max-h-[90vh] flex flex-col gap-0 glass-card border-2 border-primary/60 promo-neon-glow"
        style={{ zIndex: 100 }}
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
        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto scroll-smooth">
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

          {/* Text — auto-scroll target so it's visible right above the sticky CTA */}
          <div ref={ctaAnchorRef} className="px-6 pt-5 pb-2 space-y-1">
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
