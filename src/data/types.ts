export type Hex = `#${string}`;
export type Palette = [Hex, Hex, Hex, Hex, Hex];

/** One hand-authored entry in `palettes.ts`. */
export type PaletteEntry = {
  paletteTitle: string;
  /** Shown after the date in the postcard dialog. Keep it to a city or region. */
  location: string;
  /** Month the photo was taken, as YYYY-MM. */
  date: string;
  /** Photo filename without extension; also the photo's id. */
  slug: string;
  /** Describes the photo for screen readers. */
  alt: string;
  hexColors: Palette;
};

export type Photo = {
  id: string;
  title: string;
  alt: string;
  date: string;
  /** City or region only; may be empty. */
  location: string;
  palette: Palette;
};

export type Rack = { id: string; photos: Photo[] };
