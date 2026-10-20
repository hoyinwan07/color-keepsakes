import { images } from "../../palette-data.ts";
import type { Hex } from "../../palette-data.ts";
export type { Hex } from "../../palette-data.ts";

export type Photo = {
  id: string;
  title: string;
  src: string; // Original filename in originals/; main.ts resolves its WebP renditions to Vite asset URLs.
  alt: string;
  date: string;
  location: string; // City or region only; may be empty.
  palette: [Hex, Hex, Hex, Hex, Hex];
};
export type Rack = { id: string; photos: Photo[] };

// Preserve the author's order and color values. Racks are browsing pages only.
const photos: Photo[] = images.map((entry) => ({
  id: entry.image.replace(/\.[^.]+$/, ""),
  title: entry.paletteTitle,
  src: entry.image,
  alt: entry.paletteTitle,
  date: entry.date,
  location: entry.location.trim(),
  palette: [...entry.hexColors],
}));

export const racks: Rack[] = [];
for (let offset = 0; offset < photos.length; offset += 9) {
  racks.push({
    id: `rack-${racks.length + 1}`,
    photos: photos.slice(offset, offset + 9),
  });
}
