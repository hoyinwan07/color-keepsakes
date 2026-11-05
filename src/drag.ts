import {
  CLICK_SUPPRESS_MS,
  DRAG_RATIO,
  DRAG_THRESHOLD,
  FLICK_MAX_IDLE_MS,
  TURN_DEG,
} from "./config.ts";
import { flickAmount, stepsFromAmount } from "./gesture.ts";
import { reduced } from "./media.ts";
import { state } from "./state.ts";

/** Start turning the active rack with the pointer. */
export function beginDrag(
  event: PointerEvent,
  rackIndex: number,
  scene: HTMLElement,
  spindle: HTMLElement,
): void {
  if (
    rackIndex !== state.active ||
    state.changing ||
    event.button !== 0 ||
    state.drag
  )
    return;
  state.drag = {
    pointerId: event.pointerId,
    startX: event.clientX,
    lastX: event.clientX,
    lastTime: event.timeStamp,
    velocity: 0,
    distance: 0,
    baseAngle: state.turns[rackIndex] * -TURN_DEG,
    scene,
    spindle,
  };
}

function moveDrag(event: PointerEvent): void {
  const { drag } = state;
  if (!drag || event.pointerId !== drag.pointerId) return;
  drag.distance = event.clientX - drag.startX;
  if (Math.abs(drag.distance) > DRAG_THRESHOLD) {
    drag.spindle.classList.add("dragging");
    drag.scene.setPointerCapture(event.pointerId);
    const elapsed = event.timeStamp - drag.lastTime;
    if (elapsed > 0) drag.velocity = (event.clientX - drag.lastX) / elapsed;
    if (!reduced.matches)
      drag.spindle.style.transform = `rotateY(${drag.baseAngle + drag.distance * DRAG_RATIO}deg)`;
    state.suppressClickUntil = performance.now() + CLICK_SUPPRESS_MS;
  }
  drag.lastX = event.clientX;
  drag.lastTime = event.timeStamp;
}

/** Listen for pointer movement and release; `spin` turns the rack by whole columns. */
export function initDrag(spin: (steps: number) => void): void {
  const endDrag = (event: PointerEvent) => {
    const { drag } = state;
    if (!drag || event.pointerId !== drag.pointerId) return;
    state.drag = null;
    drag.spindle.classList.remove("dragging");
    if (Math.abs(drag.distance) <= DRAG_THRESHOLD) return;
    const idle = event.timeStamp - drag.lastTime;
    const velocity = idle > FLICK_MAX_IDLE_MS ? 0 : drag.velocity;
    const cancelled = event.type === "pointercancel";
    spin(stepsFromAmount(cancelled ? 0 : flickAmount(drag.distance, velocity)));
  };
  window.addEventListener("pointermove", moveDrag);
  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);
}
