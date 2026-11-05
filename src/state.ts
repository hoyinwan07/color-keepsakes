import { racks } from "./data/racks.ts";

/** A pointer drag that is turning the active rack. */
export type Drag = {
  pointerId: number;
  startX: number;
  lastX: number;
  lastTime: number;
  /** Horizontal speed in px/ms from the latest move. */
  velocity: number;
  /** Total horizontal travel since the press. */
  distance: number;
  /** The spindle's rotation (deg) when the press began. */
  baseAngle: number;
  scene: HTMLElement;
  spindle: HTMLElement;
};

/** Browsing state shared by the rack, drag, and dialog modules. */
export const state = {
  /** Index of the rack in front. */
  active: 0,
  /** Columns each rack has been turned, so a rack keeps its place when revisited. */
  turns: racks.map(() => 0),
  /** True while racks glide to a new position. */
  changing: false,
  /** True while a reduced-motion cross-fade is in progress. */
  fading: false,
  /** Clicks before this time (performance.now) are ignored after a drag. */
  suppressClickUntil: 0,
  drag: null as Drag | null,
};
