import { forwardRef } from "react";

type Size = "nav" | "footer";

interface NeonWordmarkProps {
  size?: Size;
  className?: string;
  "aria-label"?: string;
}

/**
 * Neon-text replacement for the previous /logo-neon.png banner.
 * Used in Navbar and Footer. Pure CSS — no image asset.
 */
const NeonWordmark = forwardRef<HTMLDivElement, NeonWordmarkProps>(
  ({ size = "nav", className = "", ...rest }, ref) => {
    const isNav = size === "nav";
    const mainSize = isNav
      ? "text-lg sm:text-2xl"
      : "text-2xl sm:text-3xl";
    const subSize = isNav
      ? "text-[8px] sm:text-[10px]"
      : "text-[10px] sm:text-xs";

    return (
      <div
        ref={ref}
        className={`font-display font-black uppercase leading-none select-none ${className}`}
        aria-label={rest["aria-label"] ?? "DJ Lobo Producciones"}
      >
        <div
          className={`${mainSize} tracking-[0.18em] bg-clip-text text-transparent bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink`}
          style={{
            filter:
              "drop-shadow(0 0 6px hsl(var(--neon-cyan) / 0.55)) drop-shadow(0 0 14px hsl(var(--neon-purple) / 0.45)) drop-shadow(0 0 22px hsl(var(--neon-pink) / 0.25))",
          }}
        >
          DJ&nbsp;LOBO
        </div>
        <div
          className={`${subSize} tracking-[0.5em] mt-1 text-neon-cyan/80`}
          style={{
            filter: "drop-shadow(0 0 4px hsl(var(--neon-cyan) / 0.6))",
          }}
        >
          PRODUCCIONES
        </div>
      </div>
    );
  }
);

NeonWordmark.displayName = "NeonWordmark";

export default NeonWordmark;
