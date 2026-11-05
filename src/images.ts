import { averageColor } from "./color.ts";
import type { Photo } from "./data/types.ts";

type Size = "thumb" | "full";

// WebP renditions generated from the JPEG originals by `npm run images`.
const imageUrls: Record<Size, Record<string, string>> = {
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

export function photoSource(photo: Photo, size: Size): string {
  const url = imageUrls[size][`./images/${size}/${photo.id}.webp`];
  if (!url)
    throw new Error(
      `Missing ${size} image for ${photo.id}; run npm run images`,
    );
  return url;
}

/** Background shown behind a photo until it paints. */
export function placeholder(photo: Photo): string {
  return averageColor(photo.palette);
}

const preloaded = new Set<string>();

/** Start fetching a photo's full-size image before its postcard opens. */
export function preloadFull(photo: Photo): void {
  if (preloaded.has(photo.id)) return;
  preloaded.add(photo.id);
  new Image().src = photoSource(photo, "full");
}
