export type Hex = `#${string}`;
export type Photo = { src: string; alt: string; date: string; palette: [Hex, Hex, Hex, Hex, Hex] };
export type Rack = { id: string; location: string; country: string; photos: Photo[] };
// Hand-selected sample colors, never sampled or extracted from an image.
const eze: Photo['palette'] = ['#86949B', '#563216', '#FFF9E2', '#30341F', '#141414'];
const kyoto: Photo['palette'] = ['#B4BC9A', '#59644B', '#E8DCC6', '#A36B55', '#30382D'];
const lisbon: Photo['palette'] = ['#97B8C2', '#D59572', '#F2E6CC', '#586D6C', '#3F4C47'];
// Local SVG studies only. Replace each src with /photos/{location}/your-file.webp.
// The colors and compositions below are illustrative, not extracted photo palettes.
function study(n: number, palette: Photo['palette']): string {
  const [sky, stone, light, leaf] = palette;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800"><defs><linearGradient id="s" x2="0.7" y2="1"><stop stop-color="${sky}"/><stop offset="1" stop-color="${light}"/></linearGradient><linearGradient id="w" x2="1" y2="1"><stop stop-color="${stone}"/><stop offset="1" stop-color="${light}"/></linearGradient></defs><rect width="600" height="800" fill="url(#s)"/><circle cx="${400 - n * 9}" cy="170" r="76" fill="${light}" opacity=".8"/><path d="M0 500 Q150 ${250 + n * 11} 340 480 T650 360 V800 H0Z" fill="${leaf}" opacity=".55"/><path d="M0 330 L210 260 V800 H0Z M390 190 L600 290 V800 H390Z" fill="url(#w)"/><path d="M230 800 V510 A75 75 0 0 1 150 0 V800Z" fill="${leaf}"/><path d="M0 670 L600 440 V800 H0Z" fill="${light}" opacity=".25"/><path d="M30 0 Q100 130 80 310 M70 190 Q160 150 230 70" stroke="${leaf}" stroke-width="12" fill="none"/><g fill="${leaf}"><ellipse cx="100" cy="90" rx="70" ry="24" transform="rotate(35 100 90)"/><ellipse cx="140" cy="140" rx="70" ry="20" transform="rotate(-30 140 140)"/></g><text x="32" y="754" fill="${light}" font-family="monospace" font-size="18" letter-spacing="4">COLOR STUDY / ${String(n).padStart(2, '0')}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
function photo(n: number, place: string, date: string, palette: Photo['palette']): Photo {
  return { src: study(n, palette), alt: `${place} — illustrative architectural color study ${n}`, date, palette: [...palette] };
}
export const racks: Rack[] = [
  { id: 'eze', location: 'Eze', country: 'France', photos: [
    photo(1,'Eze','2024-07',eze),photo(2,'Eze','2024-07',eze),photo(3,'Eze','2024-07',eze),photo(4,'Eze','2024-07',eze),
    photo(5,'Eze','2024-07',eze),photo(6,'Eze','2024-07',eze),photo(7,'Eze','2024-07',eze),photo(8,'Eze','2024-07',eze),
    photo(9,'Eze','2024-07',eze),photo(10,'Eze','2024-07',eze),photo(11,'Eze','2024-07',eze),photo(12,'Eze','2024-07',eze)] },
  { id: 'kyoto', location: 'Kyoto', country: 'Japan', photos: [
    photo(1,'Kyoto','2025-04',kyoto),photo(2,'Kyoto','2025-04',kyoto),photo(3,'Kyoto','2025-04',kyoto),photo(4,'Kyoto','2025-04',kyoto),
    photo(5,'Kyoto','2025-04',kyoto),photo(6,'Kyoto','2025-04',kyoto),photo(7,'Kyoto','2025-04',kyoto),photo(8,'Kyoto','2025-04',kyoto),
    photo(9,'Kyoto','2025-04',kyoto),photo(10,'Kyoto','2025-04',kyoto),photo(11,'Kyoto','2025-04',kyoto),photo(12,'Kyoto','2025-04',kyoto)] },
  { id: 'lisbon', location: 'Lisbon', country: 'Portugal', photos: [
    photo(1,'Lisbon','2025-09',lisbon),photo(2,'Lisbon','2025-09',lisbon),photo(3,'Lisbon','2025-09',lisbon),photo(4,'Lisbon','2025-09',lisbon),
    photo(5,'Lisbon','2025-09',lisbon),photo(6,'Lisbon','2025-09',lisbon),photo(7,'Lisbon','2025-09',lisbon),photo(8,'Lisbon','2025-09',lisbon),
    photo(9,'Lisbon','2025-09',lisbon),photo(10,'Lisbon','2025-09',lisbon),photo(11,'Lisbon','2025-09',lisbon),photo(12,'Lisbon','2025-09',lisbon)] }
];
