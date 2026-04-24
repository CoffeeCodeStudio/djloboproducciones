import { useEffect, useRef } from "react";

/**
 * Section-level scroll reveal hook.
 *
 * Mount once on a section root and any descendant marked with `.scroll-reveal`
 * will fade/slide in with a consistent stagger when the section enters the
 * viewport. Designed to give Hero, About and Schedule the same premium feel
 * without each component re-implementing the IntersectionObserver dance.
 *
 * Defaults are tuned across the landing page:
 *  - threshold 0.15  → fires once a meaningful slice of the section is visible
 *  - rootMargin -10% bottom → starts a touch before the section is fully on
 *    screen so the animation finishes around the time the user reaches it
 *  - 90ms stagger → noticeable but not sluggish
 *  - once = true   → premium single-play; no replay on scroll-back
 *
 * Honors `prefers-reduced-motion` via the global `.scroll-reveal` CSS rule
 * (which disables the transition entirely), so we still add `revealed` to
 * keep the final state deterministic.
 */
export interface ScrollRevealOptions {
  /** IntersectionObserver threshold (0–1). */
  threshold?: number;
  /** IntersectionObserver rootMargin string. */
  rootMargin?: string;
  /** Delay between successive `.scroll-reveal` children, in ms. */
  staggerMs?: number;
  /** Stop observing after the first reveal. */
  once?: boolean;
}

export function useScrollReveal<T extends HTMLElement = HTMLElement>(
  options: ScrollRevealOptions = {},
) {
  const {
    threshold = 0.15,
    rootMargin = "0px 0px -10% 0px",
    staggerMs = 90,
    once = true,
  } = options;

  const ref = useRef<T | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    // SSR / older browsers fallback: just reveal everything immediately.
    if (typeof IntersectionObserver === "undefined") {
      root.querySelectorAll<HTMLElement>(".scroll-reveal").forEach((el) => {
        el.classList.add("revealed");
      });
      return;
    }

    const timeouts: number[] = [];

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const items = entry.target.querySelectorAll<HTMLElement>(
            ".scroll-reveal:not(.revealed)",
          );
          items.forEach((el, i) => {
            const id = window.setTimeout(
              () => el.classList.add("revealed"),
              i * staggerMs,
            );
            timeouts.push(id);
          });

          if (once) observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(root);

    return () => {
      observer.disconnect();
      timeouts.forEach((id) => window.clearTimeout(id));
    };
  }, [threshold, rootMargin, staggerMs, once]);

  return ref;
}
