import { useEffect, useRef, useState } from "react";

interface Props {
  src: string;
  expectedSize: number;
}

interface Check {
  label: string;
  ok: boolean;
  detail: string;
}

/**
 * Dev-only widget aktiverad via ?debug=image på /lyssna.
 * Verifierar pixelperfekt match mellan sparad 1:1-fil och cirkeln i UI:t.
 *
 *  ✓ Naturliga pixlar är exakt kvadratiska (w === h)
 *  ✓ Container är exakt expectedSize × expectedSize
 *  ✓ Renderat <img> är exakt expectedSize × expectedSize
 *  ✓ Natural ≥ expectedSize (ingen uppskalning som zoomar)
 */
const RadioImagePixelCheck = ({ src, expectedSize }: Props) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [checks, setChecks] = useState<Check[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      // Hitta cirkelbilden i DOM (sätts av ListenPage)
      const img = document.querySelector<HTMLImageElement>(
        'img[data-radio-profile="true"]'
      );
      if (!img) return;
      imgRef.current = img;

      const probe = new Image();
      probe.crossOrigin = "anonymous";
      const natural = await new Promise<{ w: number; h: number } | null>((resolve) => {
        probe.onload = () => resolve({ w: probe.naturalWidth, h: probe.naturalHeight });
        probe.onerror = () => resolve(null);
        probe.src = src;
      });
      if (cancelled || !natural) return;

      const container = img.parentElement as HTMLElement | null;
      const cRect = container?.getBoundingClientRect();
      const iRect = img.getBoundingClientRect();

      const round = (n: number) => Math.round(n * 100) / 100;

      const next: Check[] = [
        {
          label: "Källfil är 1:1",
          ok: natural.w === natural.h,
          detail: `${natural.w} × ${natural.h} px`,
        },
        {
          label: `Container = ${expectedSize}×${expectedSize}`,
          ok:
            !!cRect &&
            Math.abs(cRect.width - expectedSize) < 0.5 &&
            Math.abs(cRect.height - expectedSize) < 0.5,
          detail: cRect ? `${round(cRect.width)} × ${round(cRect.height)} px` : "saknas",
        },
        {
          label: `<img> = ${expectedSize}×${expectedSize}`,
          ok:
            Math.abs(iRect.width - expectedSize) < 0.5 &&
            Math.abs(iRect.height - expectedSize) < 0.5,
          detail: `${round(iRect.width)} × ${round(iRect.height)} px`,
        },
        {
          label: "Natural ≥ render (ingen uppskalning)",
          ok: natural.w >= expectedSize && natural.h >= expectedSize,
          detail: `${natural.w}px käll vs ${expectedSize}px render`,
        },
        {
          label: "Render-ratio = 1.000",
          ok: Math.abs(iRect.width / Math.max(1, iRect.height) - 1) < 0.005,
          detail: (iRect.width / Math.max(1, iRect.height)).toFixed(4),
        },
      ];

      setChecks(next);

      const allOk = next.every((c) => c.ok);
      console[allOk ? "log" : "warn"](
        `[RadioImagePixelCheck] ${allOk ? "✅ pixelperfekt" : "⚠️ avvikelse"}`,
        next
      );
    };

    // Vänta in att bilden har layout
    const t = setTimeout(run, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [src, expectedSize]);

  if (!checks) return null;

  const allOk = checks.every((c) => c.ok);

  return (
    <div
      className="fixed bottom-24 right-4 z-[9999] max-w-xs rounded-lg border border-border bg-background/95 p-3 text-xs shadow-2xl backdrop-blur"
      role="status"
      aria-label="Radiobild pixelverifiering"
    >
      <p
        className={`mb-2 font-mono text-[11px] uppercase tracking-wider ${
          allOk ? "text-emerald-500" : "text-amber-500"
        }`}
      >
        {allOk ? "✓ Pixelperfekt" : "⚠ Avvikelse upptäckt"}
      </p>
      <ul className="space-y-1">
        {checks.map((c) => (
          <li key={c.label} className="flex items-start gap-2">
            <span className={c.ok ? "text-emerald-500" : "text-red-500"}>
              {c.ok ? "✓" : "✗"}
            </span>
            <span className="flex-1">
              <span className="block">{c.label}</span>
              <span className="block font-mono text-[10px] text-muted-foreground">
                {c.detail}
              </span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[10px] text-muted-foreground">
        Stäng: ta bort <code>?debug=image</code> från URL:en
      </p>
    </div>
  );
};

export default RadioImagePixelCheck;
