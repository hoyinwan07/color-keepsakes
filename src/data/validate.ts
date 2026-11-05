import { PHOTOS_PER_RACK } from "../config.ts";
import type { Rack } from "./types.ts";

const HEX = /^#[\da-f]{6}$/i;
const YEAR_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

export function validateRacks(racks: Rack[]): void {
  const rackIds = new Set<string>();
  const photoIds = new Set<string>();
  if (racks.length < 3) throw new Error("Provide at least three racks.");
  for (const rack of racks) {
    if (!rack.id || rackIds.has(rack.id))
      throw new Error(`Duplicate or empty rack id: ${rack.id}`);
    rackIds.add(rack.id);
    if (rack.photos.length !== PHOTOS_PER_RACK)
      throw new Error(`${rack.id}: expected exactly ${PHOTOS_PER_RACK} photos`);
    rack.photos.forEach((photo, i) => {
      if (!photo.id || photoIds.has(photo.id))
        throw new Error(`Duplicate or empty photo id: ${photo.id}`);
      photoIds.add(photo.id);
      const label = `${rack.id}, photo ${i + 1}`;
      if (!YEAR_MONTH.test(photo.date))
        throw new Error(`${label}: invalid YYYY-MM date`);
      if (photo.palette.length !== 5)
        throw new Error(`${label}: expected exactly 5 colors`);
      for (const hex of photo.palette) {
        if (!HEX.test(hex)) throw new Error(`${label}: invalid hex ${hex}`);
      }
    });
  }
}
