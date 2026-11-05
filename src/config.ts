// A rack is a three-sided spindle; each side is a column of three postcards.
export const COLUMNS_PER_RACK = 3;
export const ROWS_PER_COLUMN = 3;
export const PHOTOS_PER_RACK = COLUMNS_PER_RACK * ROWS_PER_COLUMN;

/** Degrees the spindle turns to bring the next column to the front. */
export const TURN_DEG = 360 / COLUMNS_PER_RACK;

/** Matches the CSS mobile breakpoint in styles. */
export const MOBILE_QUERY = "(max-width: 600px)";

/** Gliding to a neighboring rack; just longer than the 700ms CSS transition. */
export const RACK_GLIDE_MS = 720;
/** The same change with reduced motion: a short cross-fade instead of a glide. */
export const REDUCED_GLIDE_MS = 250;

/** Extra px above and below the spin arrows that still count as aiming at them. */
export const ARROW_BAND_SLOP = 8;

/** Pointer travel (px) before a press becomes a drag. */
export const DRAG_THRESHOLD = 7;
/** Degrees of spindle rotation per px of pointer travel while dragging. */
export const DRAG_RATIO = 0.55;
/** How long (ms) clicks are ignored after a drag, so releasing doesn't open a card. */
export const CLICK_SUPPRESS_MS = 350;
/** A release more than this long (ms) after the last move carries no flick. */
export const FLICK_MAX_IDLE_MS = 100;
/** How strongly release velocity (px/ms) adds to the drag. */
export const FLICK_GAIN = 70;
/** Drags shorter than this (in rotation-equivalent px) snap back. */
export const MIN_SPIN_AMOUNT = 18;
/** The most columns one flick can turn. */
export const MAX_FLICK_STEPS = 2;

/** How long (ms) the "Copied as…" message stays visible. */
export const EXPORT_STATUS_MS = 4000;
