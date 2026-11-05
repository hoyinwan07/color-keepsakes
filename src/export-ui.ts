import { EXPORT_STATUS_MS } from "./config.ts";
import type { Palette } from "./data/types.ts";
import { $ } from "./dom.ts";
import { formatLabels, paletteSnippet, type ExportFormat } from "./export.ts";

let statusTimer = 0;

export function resetExportStatus(): void {
  window.clearTimeout(statusTimer);
  $("#export-status").textContent = "";
}

/**
 * Wire the "copy palette as…" buttons. Clipboard access is write-only and
 * triggered by a click; nothing is read back or sent anywhere.
 */
export function initExport(getPalette: () => Palette | null): void {
  document
    .querySelectorAll<HTMLButtonElement>(".export-button")
    .forEach((button) =>
      button.addEventListener("click", async () => {
        const palette = getPalette();
        if (!palette) return;
        const format = button.dataset.format as ExportFormat;
        const status = $("#export-status");
        window.clearTimeout(statusTimer);
        try {
          await navigator.clipboard.writeText(paletteSnippet(palette, format));
          status.textContent = `Copied as ${formatLabels[format]}`;
        } catch {
          status.textContent =
            "Your browser blocked copying. The hex values are listed above.";
        }
        statusTimer = window.setTimeout(() => {
          status.textContent = "";
        }, EXPORT_STATUS_MS);
      }),
    );
}
