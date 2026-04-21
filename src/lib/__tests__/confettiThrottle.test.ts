import { describe, it, expect } from "vitest";
import {
  CONFETTI_CANVAS_Z_INDEX,
  CONFETTI_COOLDOWN_MS,
  PROMO_PARTICLE_LAYER_Z_INDEX,
  createConfettiThrottleState,
  resetOpenCycle,
  shouldFireConfetti,
} from "../confettiThrottle";

/**
 * Deterministic harness simulating rapid open/close cycles of <PromoPopup>.
 * Drives a virtual clock so timing is reproducible.
 */
function simulate(
  events: Array<{ at: number; type: "open" | "close" }>,
  cooldown = CONFETTI_COOLDOWN_MS
) {
  const state = createConfettiThrottleState();
  const fired: number[] = [];
  for (const e of events) {
    if (e.type === "close") {
      resetOpenCycle(state);
      continue;
    }
    const decision = shouldFireConfetti(state, e.at, cooldown);
    if (decision.fire) fired.push(e.at);
  }
  return fired;
}

describe("confetti throttle", () => {
  it("fires once on first open", () => {
    expect(
      simulate([{ at: 0, type: "open" }])
    ).toEqual([0]);
  });

  it("blocks a second fire within the same open cycle", () => {
    // Same open cycle = no `close` between calls. Effect re-running while
    // already-fired must not fire again.
    const state = createConfettiThrottleState();
    expect(shouldFireConfetti(state, 0).fire).toBe(true);
    const second = shouldFireConfetti(state, 100);
    expect(second.fire).toBe(false);
    if (!second.fire) expect(second.reason).toBe("already-fired-this-open");
  });

  it("blocks rapid open/close/open inside the cooldown window", () => {
    const fired = simulate([
      { at: 0, type: "open" },
      { at: 50, type: "close" },
      { at: 100, type: "open" }, // within 3s cooldown — must NOT fire
      { at: 200, type: "close" },
      { at: 500, type: "open" }, // still within 3s — must NOT fire
    ]);
    expect(fired).toEqual([0]);
  });

  it("allows a new burst after the cooldown elapses", () => {
    const fired = simulate([
      { at: 0, type: "open" },
      { at: 100, type: "close" },
      { at: CONFETTI_COOLDOWN_MS, type: "open" }, // exactly at boundary — fires
    ]);
    expect(fired).toEqual([0, CONFETTI_COOLDOWN_MS]);
  });

  it("survives a stress run of 50 rapid toggles without exceeding cooldown rate", () => {
    const events: Array<{ at: number; type: "open" | "close" }> = [];
    for (let i = 0; i < 50; i++) {
      events.push({ at: i * 40, type: "open" });
      events.push({ at: i * 40 + 20, type: "close" });
    }
    // Append one more open well past cooldown
    events.push({ at: 50 * 40 + CONFETTI_COOLDOWN_MS + 1, type: "open" });

    const fired = simulate(events);
    // Adjacent fires must always be >= cooldown apart
    for (let i = 1; i < fired.length; i++) {
      expect(fired[i] - fired[i - 1]).toBeGreaterThanOrEqual(CONFETTI_COOLDOWN_MS);
    }
    // First fire is at t=0, then nothing until past cooldown
    expect(fired[0]).toBe(0);
    expect(fired.length).toBe(2);
  });

  it("respects a custom cooldown value", () => {
    const fired = simulate(
      [
        { at: 0, type: "open" },
        { at: 100, type: "close" },
        { at: 500, type: "open" }, // within 1000ms cooldown — blocked
        { at: 600, type: "close" },
        { at: 1000, type: "open" }, // at boundary — fires
      ],
      1000
    );
    expect(fired).toEqual([0, 1000]);
  });
});

describe("z-index layering", () => {
  it("confetti canvas sits above any plausible Radix dialog layer", () => {
    // Radix Dialog overlay/content typically use z-50; our canvas must dwarf it.
    expect(CONFETTI_CANVAS_Z_INDEX).toBeGreaterThan(1000);
  });

  it("ambient particle layer sits BELOW the dialog overlay (z-50)", () => {
    // Drifting particles must never visually cover modal content.
    expect(PROMO_PARTICLE_LAYER_Z_INDEX).toBeLessThan(50);
  });

  it("confetti canvas sits ABOVE the ambient particle layer", () => {
    expect(CONFETTI_CANVAS_Z_INDEX).toBeGreaterThan(PROMO_PARTICLE_LAYER_Z_INDEX);
  });
});
