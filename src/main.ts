import './styles.css';
import { racks, type Photo, type Rack } from './data/racks';
import { validateRacks } from './data/validate';
if (import.meta.env.DEV) validateRacks(racks);
const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const mod = (n: number, length: number) => ((n % length) + length) % length;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const host = $('#racks');
const dialog = $<HTMLDialogElement>('#postcard-dialog');
const turns = racks.map(() => 0);
let active = 0;
let changing = false;
let fading = false;
let suppressClickUntil = 0;
let opener: HTMLButtonElement | null = null;
let drag: { id: number; start: number; last: number; time: number; velocity: number; distance: number; base: number; rack: HTMLElement } | null = null;
function el<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag); node.className = className;
  if (text) node.textContent = text;
  return node;
}
function fadeChange(node: HTMLElement, change: () => void): void {
  if (!reduced.matches) { change(); return; }
  node.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 90 }).finished.then(() => {
    change(); node.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 140 });
  });
}
function openPhoto(rack: Rack, photo: Photo, button: HTMLButtonElement): void {
  if (performance.now() < suppressClickUntil || changing) return;
  opener = button;
  const image = $<HTMLImageElement>('#dialog-photo'); image.src = photo.src; image.alt = photo.alt;
  $('#dialog-location').textContent = rack.location;
  $('#dialog-country').textContent = `// ${rack.country}`;
  const date = $<HTMLTimeElement>('#dialog-date'); date.textContent = photo.date; date.dateTime = photo.date;
  $('#swatches').replaceChildren(...photo.palette.map((hex, i) => {
    const swatch = el('span', 'swatch'); swatch.style.backgroundColor = hex;
    swatch.setAttribute('role', 'img'); swatch.setAttribute('aria-label', `Color ${i + 1} of 5: ${hex}`); swatch.title = hex;
    return swatch;
  }));
  dialog.showModal(); document.body.classList.add('modal-open'); $('#close-dialog').focus();
}
function makeRack(index: number, position: number): HTMLElement {
  const rack = racks[index];
  const item = el('article', 'rack-item'); item.dataset.index = String(index); item.dataset.position = String(position);
  const title = el('h2', 'rack-title'); title.append(el('span', '', 'postcards from'), el('strong', '', rack.location));
  item.append(title);
  const scene = el('div', 'rack-scene');
  const spindle = el('div', 'spindle'); spindle.style.transform = `rotateY(${-turns[index] * 120}deg)`;
  spindle.append(el('div', 'pole'));
  for (let col = 0; col < 3; col++) {
    const column = el('div', 'column'); column.style.transform = `rotateY(${col * 120}deg) translateZ(var(--radius))`;
    column.dataset.column = String(col);
    for (let row = 0; row < 4; row++) {
      const photo = rack.photos[col * 4 + row];
      const pocket = el('div', 'pocket'); const button = el('button', 'postcard'); button.type = 'button';
      button.setAttribute('aria-label', `Open postcard ${col * 4 + row + 1} from ${rack.location}: ${photo.alt}`);
      const img = el('img'); img.src = photo.src; img.alt = photo.alt; img.width = 600; img.height = 800; img.loading = 'lazy'; img.decoding = 'async'; img.draggable = false;
      button.append(img); button.addEventListener('click', () => openPhoto(rack, photo, button));
      pocket.append(button, el('span', 'wire-lip')); column.append(pocket);
    }
    spindle.append(column);
  }
  scene.append(spindle, el('div', 'rack-foot')); item.append(scene);
  const select = el('button', 'rack-select'); select.type = 'button'; select.setAttribute('aria-label', `View postcards from ${rack.location}`);
  select.addEventListener('click', () => changeRack(index)); item.append(select);
  scene.addEventListener('pointerdown', event => {
    if (index !== active || changing || event.button !== 0 || drag) return;
    drag = { id: event.pointerId, start: event.clientX, last: event.clientX, time: event.timeStamp, velocity: 0, distance: 0, base: turns[index] * -120, rack: spindle };
  });
  updateAccess(item); return item;
}
function updateAccess(item: HTMLElement): void {
  const index = Number(item.dataset.index); const isActive = index === active;
  const select = item.querySelector<HTMLButtonElement>('.rack-select')!;
  select.hidden = isActive; item.querySelector('.rack-scene')!.setAttribute('aria-hidden', String(!isActive));
  item.querySelectorAll<HTMLElement>('.column').forEach(column => {
    const available = isActive && Number(column.dataset.column) === mod(turns[index], 3);
    column.inert = !available; column.setAttribute('aria-hidden', String(!available));
  });
}
function render(): void {
  host.replaceChildren(...[-1, 0, 1].map(position => makeRack(mod(active + position, racks.length), position)));
  updateStatus();
}
function updateStatus(): void {
  $('#column-status').textContent = `${String(mod(turns[active], 3) + 1).padStart(2, '0')} / 03`;
  document.querySelectorAll<HTMLButtonElement>('.location-tab').forEach((button, i) => button.setAttribute('aria-current', String(i === active)));
}
function spin(step: number): void {
  if (changing || fading || drag || dialog.open) return;
  const item = host.querySelector<HTMLElement>('[data-position="0"]')!;
  const focusInCard = document.activeElement?.classList.contains('postcard');
  if (focusInCard) $(step > 0 ? '#spin-right' : '#spin-left').focus();
  turns[active] += step;
  fading = reduced.matches;
  fadeChange(item.querySelector('.spindle')!, () => {
    item.querySelector<HTMLElement>('.spindle')!.style.transform = `rotateY(${-turns[active] * 120}deg)`;
    updateAccess(item); updateStatus(); fading = false;
    $('#announcement').textContent = `${racks[active].location}, column ${mod(turns[active], 3) + 1} of 3`;
  });
}
function changeRack(next: number): void {
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
    [...host.children].forEach(child => {
      const item = child as HTMLElement;
      const old = Number(item.dataset.position);
      item.dataset.position = String(old - direction);
      updateAccess(item);
    });
    updateStatus();
  };
  fadeChange(host, change);
  window.setTimeout(() => {
    render(); changing = false;
    document.querySelector<HTMLButtonElement>(`.location-tab[data-index="${active}"]`)!.focus({ preventScroll: true });
    $('#announcement').textContent = `Postcards from ${racks[active].location}, ${racks[active].country}. Column ${mod(turns[active], 3) + 1} of 3.`;
  }, reduced.matches ? 250 : 720);
}
window.addEventListener('pointermove', event => {
  if (!drag || event.pointerId !== drag.id) return;
  drag.distance = event.clientX - drag.start;
  if (Math.abs(drag.distance) > 7) {
    drag.rack.classList.add('dragging');
    drag.rack.parentElement!.setPointerCapture(event.pointerId);
    const dt = event.timeStamp - drag.time;
    if (dt > 0) drag.velocity = (event.clientX - drag.last) / dt;
    if (!reduced.matches) drag.rack.style.transform = `rotateY(${drag.base + drag.distance * .55}deg)`;
    suppressClickUntil = performance.now() + 350;
  }
  drag.last = event.clientX; drag.time = event.timeStamp;
});
function endDrag(event: PointerEvent): void {
  if (!drag || event.pointerId !== drag.id) return;
  const previous = drag; drag = null; previous.rack.classList.remove('dragging');
  if (Math.abs(previous.distance) <= 7) return;
  const velocity = event.timeStamp - previous.time > 100 ? 0 : previous.velocity;
  const amount = event.type === 'pointercancel' ? 0 : previous.distance * .55 + velocity * 70;
  const steps = Math.abs(amount) > 18 ? Math.max(-2, Math.min(2, Math.round(-amount / 120) || (amount > 0 ? -1 : 1))) : 0;
  spin(steps);
}
window.addEventListener('pointerup', endDrag); window.addEventListener('pointercancel', endDrag);
$('#spin-left').addEventListener('click', () => spin(-1)); $('#spin-right').addEventListener('click', () => spin(1));
document.addEventListener('keydown', event => {
  if (dialog.open || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); spin(event.key === 'ArrowLeft' ? -1 : 1); }
});
$('#close-dialog').addEventListener('click', () => dialog.close());
// The close button is the dialog's only tab stop. Keep Tab inside the sheet
// rather than letting browser chrome take focus at the end of the native loop.
dialog.addEventListener('keydown', event => {
  if (event.key === 'Tab') { event.preventDefault(); $('#close-dialog').focus(); }
});
let backdropDown = false;
dialog.addEventListener('pointerdown', event => { backdropDown = event.target === dialog; });
dialog.addEventListener('click', event => { if (backdropDown && event.target === dialog) dialog.close(); });
dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); opener?.focus({ preventScroll: true }); });
racks.forEach((rack, i) => {
  const button = el('button', 'location-tab', rack.location); button.dataset.index = String(i); button.setAttribute('aria-label', `View postcards from ${rack.location}`);
  button.addEventListener('click', () => changeRack(i)); $('#locations').append(button);
});
$('footer span:last-child').textContent = `${racks.length * 12} MOMENTS / ${String(racks.length).padStart(2, '0')} PLACES`;
render();
