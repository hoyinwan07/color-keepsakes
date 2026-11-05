import type { Hex } from "./data/types.ts";

/** Average of a palette as a CSS color, used as a placeholder while a photo loads. */
export function averageColor(palette: readonly Hex[]): string {
  const channel = (start: number) =>
    Math.round(
      palette.reduce(
        (sum, hex) => sum + parseInt(hex.slice(start, start + 2), 16),
        0,
      ) / palette.length,
    );
  return `rgb(${channel(1)} ${channel(3)} ${channel(5)})`;
}
