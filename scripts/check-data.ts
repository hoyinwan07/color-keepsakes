import { racks } from '../src/data/racks.ts';
import { validateRacks } from '../src/data/validate.ts';
validateRacks(racks);
const cases = [
  ['bad hex', (copy: typeof racks) => { copy[0].photos[0].palette[0] = '#NOTHEX'; }],
  ['four colors', (copy: typeof racks) => { copy[0].photos[0].palette.pop(); }],
  ['eight photos', (copy: typeof racks) => { copy[0].photos.pop(); }],
  ['bad date', (copy: typeof racks) => { copy[0].photos[0].date = '2024-13'; }],
] as const;
for (const [name, mutate] of cases) {
  const copy = structuredClone(racks); mutate(copy);
  let rejected = false;
  try { validateRacks(copy); } catch (error) { rejected = true; console.log(`PASS ${name}: ${(error as Error).message}`); }
  if (!rejected) throw new Error(`Validator accepted ${name}`);
}
const luminance = (hex: string) => {
  const rgb = hex.match(/[a-f\d]{2}/gi)!.map(c => parseInt(c, 16) / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
};
for (const background of ['#F7F4EC', '#EEEAE1']) {
  const contrast = (luminance(background) + .05) / (luminance('#424A35') + .05);
  if (contrast < 4.5) throw new Error('Accent fails AA');
  console.log(`PASS accent on ${background}: ${contrast.toFixed(2)}:1`);
}
