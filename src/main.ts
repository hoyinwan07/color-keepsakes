import "./styles.css";
import { racks } from "./data/racks.ts";
import { validateRacks } from "./data/validate.ts";
import { initDialog, shownPalette } from "./dialog.ts";
import { $ } from "./dom.ts";
import { initDrag } from "./drag.ts";
import { initExport } from "./export-ui.ts";
import { initRackControls, render, spin } from "./rack.ts";

if (import.meta.env.DEV) validateRacks(racks);

initDrag(spin);
initDialog();
initExport(shownPalette);
initRackControls();
$("footer span:last-child").textContent =
  `${racks.reduce((total, rack) => total + rack.photos.length, 0)} PHOTO-INSPIRED PALETTES`;
render();
