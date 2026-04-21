/**
 * Deterministic throttle helper for the PromoPopup confetti burst.
 *
 * Two independent guards:
 *  1. `firedForThisOpen` — at most ONE burst per open cycle (reset on close)
 *  2. `cooldownMs` — even across open/close cycles, bursts are at least
 *     `cooldownMs` apart (default 3000ms)
 *
 * Pure: no DOM, no timers — safe to unit-test under any clock.
 */

export const CONFETTI_COOLDOWN_MS = 3000;

/** Z-index for the dedicated confetti canvas appended to <body>. */
export const CONFETTI_CANVAS_Z_INDEX = 99999;

/** Z-index for the ambient drifting-particle layer inside PromoPopup. */
export const PROMO_PARTICLE_LAYER_Z_INDEX = 40;

export interface ConfettiThrottleState {
  firedForThisOpen: boolean;
  lastFiredAt: number;
}

export function createConfettiThrottleState(): ConfettiThrottleState {
  return { firedForThisOpen: false, lastFiredAt: 0 };
}

export type ConfettiDecision =
  | { fire: true }
  | { fire: false; reason: "already-fired-this-open" | "cooldown"; timeSinceLast: number };

/**
 * Decide whether a confetti burst should fire when the popup transitions
 * to `open === true`. Mutates `state` only when it returns `{ fire: true }`.
 *
 * Call `resetOpenCycle(state)` whenever the popup transitions to closed.
 */
export function shouldFireConfetti(
  state: ConfettiThrottleState,
  now: number,
  cooldownMs: number = CONFETTI_COOLDOWN_MS
): ConfettiDecision {
  if (state.firedForThisOpen) {
    return {
      fire: false,
      reason: "already-fired-this-open",
      timeSinceLast: now - state.lastFiredAt,
    };
  }
  // `lastFiredAt === 0` means we have never fired — always allow the first burst.
  if (state.lastFiredAt !== 0) {
    const elapsed = now - state.lastFiredAt;
    if (elapsed < cooldownMs) {
      return { fire: false, reason: "cooldown", timeSinceLast: elapsed };
    }
  }
  state.firedForThisOpen = true;
  state.lastFiredAt = now;
  return { fire: true };
}

/** Call when the popup closes so the next open is eligible to fire again. */
export function resetOpenCycle(state: ConfettiThrottleState): void {
  state.firedForThisOpen = false;
}
