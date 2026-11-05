import {
  DRAG_RATIO,
  FLICK_GAIN,
  MAX_FLICK_STEPS,
  MIN_SPIN_AMOUNT,
  TURN_DEG,
} from "./config.ts";

/** How far a release should rotate the rack, from drag distance and release velocity. */
export function flickAmount(distance: number, velocity: number): number {
  return distance * DRAG_RATIO + velocity * FLICK_GAIN;
}

/**
 * Columns to turn for a release. Dragging right turns toward the previous
 * column (negative); a short drag snaps back (0); a flick turns at most
 * MAX_FLICK_STEPS.
 */
export function stepsFromAmount(amount: number): number {
  if (Math.abs(amount) <= MIN_SPIN_AMOUNT) return 0;
  const direction = amount > 0 ? -1 : 1;
  const steps = Math.round(-amount / TURN_DEG) || direction;
  return Math.max(-MAX_FLICK_STEPS, Math.min(MAX_FLICK_STEPS, steps));
}
