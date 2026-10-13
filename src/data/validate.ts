import type { Rack } from './racks.ts';
export function validateRacks(racks: Rack[]): void {
  const ids = new Set<string>();
  if (racks.length < 3) throw new Error('Provide at least three racks.');
  for (const rack of racks) {
    if (!rack.id || ids.has(rack.id)) throw new Error(`Duplicate or empty rack id: ${rack.id}`);
    ids.add(rack.id);
    if (rack.photos.length !== 12) throw new Error(`${rack.id}: expected exactly 12 photos`);
    rack.photos.forEach((photo, i) => {
      const label = `${rack.id}, photo ${i + 1}`;
      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(photo.date)) throw new Error(`${label}: invalid YYYY-MM date`);
      if (photo.palette.length !== 5) throw new Error(`${label}: expected exactly 5 colors`);
      photo.palette.forEach(hex => { if (!/^#[\da-f]{6}$/i.test(hex)) throw new Error(`${label}: invalid hex ${hex}`); });
    });
  }
}
