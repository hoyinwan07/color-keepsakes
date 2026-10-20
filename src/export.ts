import type { Hex } from "./data/racks";

export type ExportFormat = "css" | "tailwind" | "json";

// Snippets carry only the five color values under neutral names: no title, date,
// photo, URL, or author. Hex values are re-checked so nothing else can reach the clipboard.
export function paletteSnippet(
  palette: readonly Hex[],
  format: ExportFormat,
): string {
  const colors = palette.map((hex) => {
    if (!/^#[\da-f]{6}$/i.test(hex)) throw new Error(`Invalid hex ${hex}`);
    return hex.toLowerCase();
  });
  switch (format) {
    case "css":
      return `:root {\n${colors.map((hex, i) => `  --palette-${i + 1}: ${hex};`).join("\n")}\n}\n`;
    // Tailwind v4 theme variables; each becomes a utility such as bg-palette-1.
    case "tailwind":
      return `@theme {\n${colors.map((hex, i) => `  --color-palette-${i + 1}: ${hex};`).join("\n")}\n}\n`;
    // Design Tokens Community Group format, readable by Figma plugins and Style Dictionary.
    case "json":
      return `${JSON.stringify({ palette: Object.fromEntries(colors.map((hex, i) => [String(i + 1), { $type: "color", $value: hex }])) }, null, 2)}\n`;
  }
}

export const formatLabels: Record<ExportFormat, string> = {
  css: "CSS variables",
  tailwind: "Tailwind theme",
  json: "design tokens (JSON)",
};
