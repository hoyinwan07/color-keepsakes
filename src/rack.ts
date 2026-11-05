import {
  ARROW_BAND_SLOP,
  COLUMNS_PER_RACK,
  RACK_GLIDE_MS,
  REDUCED_GLIDE_MS,
  ROWS_PER_COLUMN,
  TURN_DEG,
} from "./config.ts";
import { racks } from "./data/racks.ts";
import type { Photo } from "./data/types.ts";
import { isDialogOpen, openPhoto } from "./dialog.ts";
import { $, el } from "./dom.ts";
import { beginDrag } from "./drag.ts";
import { photoSource, placeholder, preloadFull } from "./images.ts";
import { mod } from "./math.ts";
import { narrow, reduced } from "./media.ts";
import { state } from "./state.ts";

const host = $("#racks");

const spindleTransform = (turn: number) => `rotateY(${-turn * TURN_DEG}deg)`;
const columnLabel = (rackIndex: number) =>
  mod(state.turns[rackIndex], COLUMNS_PER_RACK) + 1;

/** Run a change at once, or with a quick cross-fade when motion is reduced. */
function fadeChange(node: HTMLElement, change: () => void): void {
  if (!reduced.matches) {
    change();
    return;
  }
  node
    .animate([{ opacity: 1 }, { opacity: 0 }], { duration: 90 })
    .finished.then(() => {
      change();
      node.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 140 });
    });
}

function makePostcard(photo: Photo): HTMLElement {
  const pocket = el("div", "pocket");
  const button = el("button", "postcard");
  button.type = "button";
  button.setAttribute("aria-label", `Open palette: ${photo.title}`);
  const img = el("img");
  img.src = photoSource(photo, "thumb");
  img.alt = photo.alt;
  img.width = 600;
  img.height = 800;
  img.loading = "lazy";
  img.decoding = "async";
  img.draggable = false;
  img.style.backgroundColor = placeholder(photo);
  button.append(img);
  button.addEventListener("click", () => openPhoto(photo, button));
  for (const type of ["pointerenter", "pointerdown", "focus"])
    button.addEventListener(type, () => preloadFull(photo));
  pocket.append(button, el("span", "wire-lip"));
  return pocket;
}

function makeColumn(rackIndex: number, col: number): HTMLElement {
  const column = el("div", "column");
  column.style.transform = `rotateY(${col * TURN_DEG}deg) translateZ(var(--radius))`;
  column.dataset.column = String(col);
  for (let row = 0; row < ROWS_PER_COLUMN; row++) {
    const photo = racks[rackIndex].photos[col * ROWS_PER_COLUMN + row];
    column.append(makePostcard(photo));
  }
  return column;
}

function makeRack(index: number, position: number): HTMLElement {
  const item = el("article", "rack-item");
  item.dataset.index = String(index);
  item.dataset.position = String(position);
  item.setAttribute(
    "aria-label",
    `Palette rack ${index + 1} of ${racks.length}`,
  );
  const scene = el("div", "rack-scene");
  const spindle = el("div", "spindle");
  spindle.style.transform = spindleTransform(state.turns[index]);
  spindle.append(el("div", "pole"));
  for (let col = 0; col < COLUMNS_PER_RACK; col++)
    spindle.append(makeColumn(index, col));
  scene.append(spindle);
  item.append(scene);
  const select = el("button", "rack-select");
  select.type = "button";
  select.setAttribute("aria-label", `View palette rack ${index + 1}`);
  select.addEventListener("click", (event) => {
    // On phones the arrows overlap the neighboring racks; a tap that misses an arrow must not traverse.
    // Keyboard activation (detail 0) is always allowed.
    if (narrow.matches && event.detail > 0 && alignedWithArrows(event.clientY))
      return;
    changeRack(index);
  });
  item.append(select);
  scene.addEventListener("pointerdown", (event) =>
    beginDrag(event, index, scene, spindle),
  );
  updateAccess(item);
  return item;
}

/** Only the front rack's visible column is reachable by keyboard, pointer, and screen reader. */
function updateAccess(item: HTMLElement): void {
  const index = Number(item.dataset.index);
  const isActive = index === state.active;
  $<HTMLButtonElement>(".rack-select", item).hidden = isActive;
  $(".rack-scene", item).setAttribute("aria-hidden", String(!isActive));
  item.querySelectorAll<HTMLElement>(".column").forEach((column) => {
    const available =
      isActive &&
      Number(column.dataset.column) ===
        mod(state.turns[index], COLUMNS_PER_RACK);
    column.inert = !available;
    column.setAttribute("aria-hidden", String(!available));
  });
}

/** Rebuild the three visible racks (previous, active, next) around the active one. */
export function render(): void {
  host.replaceChildren(
    ...[-1, 0, 1].map((position) =>
      makeRack(mod(state.active + position, racks.length), position),
    ),
  );
  updateStatus();
}

function updateStatus(): void {
  const total = String(COLUMNS_PER_RACK).padStart(2, "0");
  $("#column-status").textContent =
    `${String(columnLabel(state.active)).padStart(2, "0")} / ${total}`;
  document
    .querySelectorAll<HTMLButtonElement>(".rack-tab")
    .forEach((button, i) =>
      button.setAttribute("aria-current", String(i === state.active)),
    );
}

/** Turn the front rack by whole columns (negative is toward the previous column). */
export function spin(step: number): void {
  if (state.changing || state.fading || state.drag || isDialogOpen()) return;
  const item = $('[data-position="0"]', host);
  const focusInCard = document.activeElement?.classList.contains("postcard");
  if (focusInCard) $(step > 0 ? "#spin-right" : "#spin-left").focus();
  state.turns[state.active] += step;
  state.fading = reduced.matches;
  fadeChange($(".spindle", item), () => {
    $(".spindle", item).style.transform = spindleTransform(
      state.turns[state.active],
    );
    updateAccess(item);
    updateStatus();
    state.fading = false;
    $("#announcement").textContent =
      `Rack ${state.active + 1}, column ${columnLabel(state.active)} of ${COLUMNS_PER_RACK}`;
  });
}

function alignedWithArrows(y: number): boolean {
  const { top, bottom } = $("#spin-left").getBoundingClientRect();
  return y >= top - ARROW_BAND_SLOP && y <= bottom + ARROW_BAND_SLOP;
}

/** Glide to another rack, building it first if it isn't one of the three on screen. */
function changeRack(next: number, keepFocus?: HTMLElement): void {
  if (next === state.active || state.changing || state.fading || state.drag)
    return;
  state.changing = true;
  const direction = next === mod(state.active + 1, racks.length) ? 1 : -1;
  if (!host.querySelector(`[data-index="${next}"]`)) {
    $(`[data-position="${direction}"]`, host).replaceWith(
      makeRack(next, direction),
    );
    // Establish the incoming position before starting its transform transition.
    void host.getBoundingClientRect();
  }
  // Preserve all three DOM nodes through the glide; then load only the new neighbors.
  const change = () => {
    state.active = next;
    [...host.children].forEach((child) => {
      const item = child as HTMLElement;
      item.dataset.position = String(Number(item.dataset.position) - direction);
      updateAccess(item);
    });
    updateStatus();
  };
  fadeChange(host, change);
  window.setTimeout(
    () => {
      render();
      state.changing = false;
      (
        keepFocus ??
        $<HTMLButtonElement>(`.rack-tab[data-index="${state.active}"]`)
      ).focus({ preventScroll: true });
      $("#announcement").textContent =
        `Palette rack ${state.active + 1} of ${racks.length}. Column ${columnLabel(state.active)} of ${COLUMNS_PER_RACK}.`;
    },
    reduced.matches ? REDUCED_GLIDE_MS : RACK_GLIDE_MS,
  );
}

/** Wire the arrows, traverse buttons, keyboard, and numbered rack tabs. */
export function initRackControls(): void {
  $("#spin-left").addEventListener("click", () => spin(-1));
  $("#spin-right").addEventListener("click", () => spin(1));
  for (const [id, step] of [
    ["#traverse-left", -1],
    ["#traverse-right", 1],
  ] as const) {
    const button = $<HTMLButtonElement>(id);
    button.addEventListener("click", () =>
      changeRack(mod(state.active + step, racks.length), button),
    );
  }
  document.addEventListener("keydown", (event) => {
    if (isDialogOpen() || event.altKey || event.ctrlKey || event.metaKey)
      return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      spin(event.key === "ArrowLeft" ? -1 : 1);
    }
  });
  racks.forEach((_, i) => {
    const button = el("button", "rack-tab", String(i + 1).padStart(2, "0"));
    button.dataset.index = String(i);
    button.setAttribute("aria-label", `View palette rack ${i + 1}`);
    button.addEventListener("click", () => changeRack(i));
    $("#rack-navigation").append(button);
  });
}
