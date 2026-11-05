import { PHOTOS_PER_RACK } from "../config.ts";
import { palettes } from "./palettes.ts";
import type { Photo, Rack } from "./types.ts";

const photos: Photo[] = palettes.map((entry) => ({
  id: entry.slug,
  title: entry.paletteTitle,
  alt: entry.alt,
  date: entry.date,
  location: entry.location.trim(),
  palette: [...entry.hexColors],
}));

/** Palettes in authored order, nine to a rack. Racks are browsing pages only. */
export const racks: Rack[] = [];
for (let offset = 0; offset < photos.length; offset += PHOTOS_PER_RACK) {
  racks.push({
    id: `rack-${racks.length + 1}`,
    photos: photos.slice(offset, offset + PHOTOS_PER_RACK),
  });
}
