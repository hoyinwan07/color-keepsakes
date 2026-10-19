// Generates the WebP files the site serves from the JPEG originals in originals/
// (git-ignored; keep your own backup). Run after adding or replacing a photo: npm run images
import { mkdir, readdir, rm } from 'node:fs/promises';
import sharp from 'sharp';

const source = 'originals';
// Rack cards show ~95×130 CSS px; cover that at 2× without cropping.
const thumb = { dir: 'src/images/thumb', resize: { width: 190, height: 260, fit: 'outside' }, quality: 75 } as const;
// The dialog photo is at most ~600 CSS px wide; 1200 covers it at 2×.
const full = { dir: 'src/images/full', resize: { width: 1200, withoutEnlargement: true }, quality: 80 } as const;

const originals = (await readdir(source).catch(() => [])).filter(name => name.endsWith('.jpg'));
// Guard the stale-file cleanup below from wiping every rendition when the originals are missing.
if (!originals.length) throw new Error(`No JPEGs found in ${source}/; nothing to generate.`);
for (const { dir } of [thumb, full]) {
  await mkdir(dir, { recursive: true });
  for (const name of await readdir(dir)) {
    if (!originals.includes(name.replace(/\.webp$/, '.jpg'))) await rm(`${dir}/${name}`);
  }
}
for (const name of originals) {
  const out = name.replace(/\.jpg$/, '.webp');
  for (const { dir, resize, quality } of [thumb, full]) {
    // Output carries no EXIF/XMP: sharp drops metadata unless asked to keep it.
    const info = await sharp(`${source}/${name}`).rotate().resize(resize).webp({ quality, effort: 6 }).toFile(`${dir}/${out}`);
    console.log(`${dir}/${out}: ${info.width}×${info.height}, ${(info.size / 1024).toFixed(0)} KB`);
  }
}
