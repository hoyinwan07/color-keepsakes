import type { Palette, Photo } from "./data/types.ts";
import { $, el } from "./dom.ts";
import { resetExportStatus } from "./export-ui.ts";
import { photoSource, placeholder } from "./images.ts";
import { mod } from "./math.ts";
import { state } from "./state.ts";

const dialog = $<HTMLDialogElement>("#postcard-dialog");
let opener: HTMLButtonElement | null = null;
let shown: Photo | null = null;

export const isDialogOpen = (): boolean => dialog.open;
export const shownPalette = (): Palette | null => shown?.palette ?? null;

export function openPhoto(photo: Photo, button: HTMLButtonElement): void {
  if (performance.now() < state.suppressClickUntil || state.changing) return;
  opener = button;
  shown = photo;
  resetExportStatus();
  loadDialogImage(photo);
  $("#dialog-title").textContent = photo.title;
  const date = $<HTMLTimeElement>("#dialog-date");
  date.textContent = photo.date;
  date.dateTime = photo.date;
  $("#dialog-location").hidden = !photo.location;
  $("#dialog-location-name").textContent = photo.location;
  renderSwatches(photo.palette);
  dialog.showModal();
  document.body.classList.add("modal-open");
  $("#close-dialog").focus();
}

function loadDialogImage(photo: Photo): void {
  const image = $<HTMLImageElement>("#dialog-photo");
  image.alt = photo.alt;
  image.style.backgroundColor = placeholder(photo);
  image.dataset.photo = photo.id;
  // Show the already-loaded thumbnail at once, then swap in the full image when it is decoded.
  const full = photoSource(photo, "full");
  const loader = new Image();
  loader.src = full;
  if (loader.complete) {
    image.src = full;
    return;
  }
  image.src = photoSource(photo, "thumb");
  loader
    .decode()
    .catch(() => {})
    .then(() => {
      if (image.dataset.photo === photo.id) image.src = full;
    });
}

function renderSwatches(palette: Palette): void {
  $("#swatches").replaceChildren(
    ...palette.map((hex, i) => {
      const item = el("span", "swatch-item");
      const swatch = el("span", "swatch");
      swatch.style.backgroundColor = hex;
      swatch.setAttribute("role", "img");
      swatch.setAttribute("aria-label", `Color ${i + 1} of 5: ${hex}`);
      swatch.title = hex;
      const label = el("span", "swatch-hex", hex);
      label.setAttribute("aria-hidden", "true"); // The swatch already announces its hex value.
      item.append(swatch, label);
      return item;
    }),
  );
}

export function initDialog(): void {
  $("#close-dialog").addEventListener("click", () => dialog.close());
  // Keep Tab cycling through the sheet's buttons rather than letting browser
  // chrome take focus at the end of the native loop.
  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    event.preventDefault();
    const stops = [...dialog.querySelectorAll<HTMLButtonElement>("button")];
    const current = stops.indexOf(document.activeElement as HTMLButtonElement);
    stops[mod(current + (event.shiftKey ? -1 : 1), stops.length)].focus();
  });
  // Close on a backdrop click, but not when a press started inside the sheet.
  let pressStartedOnBackdrop = false;
  dialog.addEventListener("pointerdown", (event) => {
    pressStartedOnBackdrop = event.target === dialog;
  });
  dialog.addEventListener("click", (event) => {
    if (pressStartedOnBackdrop && event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
    opener?.focus({ preventScroll: true });
  });
}
