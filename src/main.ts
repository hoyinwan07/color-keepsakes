import "./styles.css";
import { racks } from "./data/racks.ts";
import type { Photo } from "./data/types.ts";
import { validateRacks } from "./data/validate.ts";
import { formatLabels, paletteSnippet, type ExportFormat } from "./export.ts";
if (import.meta.env.DEV) validateRacks(racks);
const $ = <T extends HTMLElement>(selector: string) =>
  document.querySelector<T>(selector)!;
const mod = (n: number, length: number) => ((n % length) + length) % length;
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const narrow = matchMedia("(max-width: 600px)"); // Matches the CSS mobile breakpoint.
const arrowBandSlop = 8; // Extra px above and below the arrows that still count as aiming for them.
// WebP renditions generated from the JPEG originals by `npm run images`.
const imageUrls = {
  thumb: import.meta.glob<string>("./images/thumb/*.webp", {
    eager: true,
    query: "?url",
    import: "default",
  }),
  full: import.meta.glob<string>("./images/full/*.webp", {
    eager: true,
    query: "?url",
    import: "default",
  }),
};
function photoSource(photo: Photo, size: keyof typeof imageUrls): string {
  const url = imageUrls[size][`./images/${size}/${photo.id}.webp`];
  if (!url)
    throw new Error(
      `Missing ${size} image for ${photo.id}; run npm run images`,
    );
  return url;
}
// Average of the palette, shown behind each photo until it paints.
function placeholder(photo: Photo): string {
  const channel = (i: number) =>
    Math.round(
      photo.palette.reduce(
        (sum, hex) => sum + parseInt(hex.slice(i, i + 2), 16),
        0,
      ) / photo.palette.length,
    );
  return `rgb(${channel(1)} ${channel(3)} ${channel(5)})`;
}
const preloaded = new Set<string>();
function preloadFull(photo: Photo): void {
  if (preloaded.has(photo.id)) return;
  preloaded.add(photo.id);
  new Image().src = photoSource(photo, "full");
}
const host = $("#racks");
const dialog = $<HTMLDialogElement>("#postcard-dialog");
const turns = racks.map(() => 0);
let active = 0;
let changing = false;
let fading = false;
let suppressClickUntil = 0;
let opener: HTMLButtonElement | null = null;
let shown: Photo | null = null;
let statusTimer = 0;
let drag: {
  id: number;
  start: number;
  last: number;
  time: number;
  velocity: number;
  distance: number;
  base: number;
  rack: HTMLElement;
} | null = null;
function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = "",
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  if (text) node.textContent = text;
  return node;
}
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
function openPhoto(photo: Photo, button: HTMLButtonElement): void {
  if (performance.now() < suppressClickUntil || changing) return;
  opener = button;
  shown = photo;
  window.clearTimeout(statusTimer);
  $("#export-status").textContent = "";
  const image = $<HTMLImageElement>("#dialog-photo");
  image.alt = photo.alt;
  image.style.backgroundColor = placeholder(photo);
  image.dataset.photo = photo.id;
  // Show the already-loaded thumbnail at once, then swap in the full image when it is decoded.
  const full = photoSource(photo, "full");
  const loader = new Image();
  loader.src = full;
  if (loader.complete) image.src = full;
  else {
    image.src = photoSource(photo, "thumb");
    loader
      .decode()
      .catch(() => {})
      .then(() => {
        if (image.dataset.photo === photo.id) image.src = full;
      });
  }
  $("#dialog-title").textContent = photo.title;
  const date = $<HTMLTimeElement>("#dialog-date");
  date.textContent = photo.date;
  date.dateTime = photo.date;
  $("#dialog-location").hidden = !photo.location;
  $("#dialog-location-name").textContent = photo.location;
  $("#swatches").replaceChildren(
    ...photo.palette.map((hex, i) => {
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
  dialog.showModal();
  document.body.classList.add("modal-open");
  $("#close-dialog").focus();
}
function makeRack(index: number, position: number): HTMLElement {
  const rack = racks[index];
  const item = el("article", "rack-item");
  item.dataset.index = String(index);
  item.dataset.position = String(position);
  item.setAttribute(
    "aria-label",
    `Palette rack ${index + 1} of ${racks.length}`,
  );
  const scene = el("div", "rack-scene");
  const spindle = el("div", "spindle");
  spindle.style.transform = `rotateY(${-turns[index] * 120}deg)`;
  spindle.append(el("div", "pole"));
  for (let col = 0; col < 3; col++) {
    const column = el("div", "column");
    column.style.transform = `rotateY(${col * 120}deg) translateZ(var(--radius))`;
    column.dataset.column = String(col);
    for (let row = 0; row < 3; row++) {
      const photo = rack.photos[col * 3 + row];
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
      column.append(pocket);
    }
    spindle.append(column);
  }
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
  scene.addEventListener("pointerdown", (event) => {
    if (index !== active || changing || event.button !== 0 || drag) return;
    drag = {
      id: event.pointerId,
      start: event.clientX,
      last: event.clientX,
      time: event.timeStamp,
      velocity: 0,
      distance: 0,
      base: turns[index] * -120,
      rack: spindle,
    };
  });
  updateAccess(item);
  return item;
}
function updateAccess(item: HTMLElement): void {
  const index = Number(item.dataset.index);
  const isActive = index === active;
  const select = item.querySelector<HTMLButtonElement>(".rack-select")!;
  select.hidden = isActive;
  item
    .querySelector(".rack-scene")!
    .setAttribute("aria-hidden", String(!isActive));
  item.querySelectorAll<HTMLElement>(".column").forEach((column) => {
    const available =
      isActive && Number(column.dataset.column) === mod(turns[index], 3);
    column.inert = !available;
    column.setAttribute("aria-hidden", String(!available));
  });
}
function render(): void {
  host.replaceChildren(
    ...[-1, 0, 1].map((position) =>
      makeRack(mod(active + position, racks.length), position),
    ),
  );
  updateStatus();
}
function updateStatus(): void {
  $("#column-status").textContent =
    `${String(mod(turns[active], 3) + 1).padStart(2, "0")} / 03`;
  document
    .querySelectorAll<HTMLButtonElement>(".rack-tab")
    .forEach((button, i) =>
      button.setAttribute("aria-current", String(i === active)),
    );
}
function spin(step: number): void {
  if (changing || fading || drag || dialog.open) return;
  const item = host.querySelector<HTMLElement>('[data-position="0"]')!;
  const focusInCard = document.activeElement?.classList.contains("postcard");
  if (focusInCard) $(step > 0 ? "#spin-right" : "#spin-left").focus();
  turns[active] += step;
  fading = reduced.matches;
  fadeChange(item.querySelector(".spindle")!, () => {
    item.querySelector<HTMLElement>(".spindle")!.style.transform =
      `rotateY(${-turns[active] * 120}deg)`;
    updateAccess(item);
    updateStatus();
    fading = false;
    $("#announcement").textContent =
      `Rack ${active + 1}, column ${mod(turns[active], 3) + 1} of 3`;
  });
}
function alignedWithArrows(y: number): boolean {
  const { top, bottom } = $("#spin-left").getBoundingClientRect();
  return y >= top - arrowBandSlop && y <= bottom + arrowBandSlop;
}
function changeRack(next: number, keepFocus?: HTMLElement): void {
  if (next === active || changing || fading || drag) return;
  changing = true;
  const direction = next === mod(active + 1, racks.length) ? 1 : -1;
  if (!host.querySelector(`[data-index="${next}"]`)) {
    const replaced = host.querySelector(`[data-position="${direction}"]`)!;
    replaced.replaceWith(makeRack(next, direction));
    // Establish the incoming position before starting its transform transition.
    void host.getBoundingClientRect();
  }
  // Preserve all three DOM nodes through the glide; then load only the new neighbors.
  const change = () => {
    active = next;
    [...host.children].forEach((child) => {
      const item = child as HTMLElement;
      const old = Number(item.dataset.position);
      item.dataset.position = String(old - direction);
      updateAccess(item);
    });
    updateStatus();
  };
  fadeChange(host, change);
  window.setTimeout(
    () => {
      render();
      changing = false;
      (
        keepFocus ??
        document.querySelector<HTMLButtonElement>(
          `.rack-tab[data-index="${active}"]`,
        )!
      ).focus({ preventScroll: true });
      $("#announcement").textContent =
        `Palette rack ${active + 1} of ${racks.length}. Column ${mod(turns[active], 3) + 1} of 3.`;
    },
    reduced.matches ? 250 : 720,
  );
}
window.addEventListener("pointermove", (event) => {
  if (!drag || event.pointerId !== drag.id) return;
  drag.distance = event.clientX - drag.start;
  if (Math.abs(drag.distance) > 7) {
    drag.rack.classList.add("dragging");
    drag.rack.parentElement!.setPointerCapture(event.pointerId);
    const dt = event.timeStamp - drag.time;
    if (dt > 0) drag.velocity = (event.clientX - drag.last) / dt;
    if (!reduced.matches)
      drag.rack.style.transform = `rotateY(${drag.base + drag.distance * 0.55}deg)`;
    suppressClickUntil = performance.now() + 350;
  }
  drag.last = event.clientX;
  drag.time = event.timeStamp;
});
function endDrag(event: PointerEvent): void {
  if (!drag || event.pointerId !== drag.id) return;
  const previous = drag;
  drag = null;
  previous.rack.classList.remove("dragging");
  if (Math.abs(previous.distance) <= 7) return;
  const velocity =
    event.timeStamp - previous.time > 100 ? 0 : previous.velocity;
  const amount =
    event.type === "pointercancel"
      ? 0
      : previous.distance * 0.55 + velocity * 70;
  const steps =
    Math.abs(amount) > 18
      ? Math.max(
          -2,
          Math.min(2, Math.round(-amount / 120) || (amount > 0 ? -1 : 1)),
        )
      : 0;
  spin(steps);
}
window.addEventListener("pointerup", endDrag);
window.addEventListener("pointercancel", endDrag);
$("#spin-left").addEventListener("click", () => spin(-1));
$("#spin-right").addEventListener("click", () => spin(1));
for (const [id, step] of [
  ["#traverse-left", -1],
  ["#traverse-right", 1],
] as const) {
  const button = $<HTMLButtonElement>(id);
  button.addEventListener("click", () =>
    changeRack(mod(active + step, racks.length), button),
  );
}
document.addEventListener("keydown", (event) => {
  if (dialog.open || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    spin(event.key === "ArrowLeft" ? -1 : 1);
  }
});
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
// Write-only clipboard access, triggered by a click; nothing is read back or sent anywhere.
dialog.querySelectorAll<HTMLButtonElement>(".export-button").forEach((button) =>
  button.addEventListener("click", async () => {
    if (!shown) return;
    const format = button.dataset.format as ExportFormat;
    const status = $("#export-status");
    window.clearTimeout(statusTimer);
    try {
      await navigator.clipboard.writeText(
        paletteSnippet(shown.palette, format),
      );
      status.textContent = `Copied as ${formatLabels[format]}`;
    } catch {
      status.textContent =
        "Your browser blocked copying. The hex values are listed above.";
    }
    statusTimer = window.setTimeout(() => {
      status.textContent = "";
    }, 4000);
  }),
);
let backdropDown = false;
dialog.addEventListener("pointerdown", (event) => {
  backdropDown = event.target === dialog;
});
dialog.addEventListener("click", (event) => {
  if (backdropDown && event.target === dialog) dialog.close();
});
dialog.addEventListener("close", () => {
  document.body.classList.remove("modal-open");
  opener?.focus({ preventScroll: true });
});
racks.forEach((_, i) => {
  const button = el("button", "rack-tab", String(i + 1).padStart(2, "0"));
  button.dataset.index = String(i);
  button.setAttribute("aria-label", `View palette rack ${i + 1}`);
  button.addEventListener("click", () => changeRack(i));
  $("#rack-navigation").append(button);
});
$("footer span:last-child").textContent =
  `${racks.reduce((total, rack) => total + rack.photos.length, 0)} PHOTO-INSPIRED PALETTES`;
render();
