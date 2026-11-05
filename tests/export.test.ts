import assert from "node:assert/strict";
import { test } from "node:test";
import { paletteSnippet } from "../src/export.ts";

const palette = [
  "#AABBCC",
  "#112233",
  "#445566",
  "#778899",
  "#ddeeff",
] as const;

test("css snippet lists lower-cased custom properties", () => {
  assert.equal(
    paletteSnippet(palette, "css"),
    ":root {\n  --palette-1: #aabbcc;\n  --palette-2: #112233;\n  --palette-3: #445566;\n  --palette-4: #778899;\n  --palette-5: #ddeeff;\n}\n",
  );
});

test("tailwind snippet uses a v4 @theme block", () => {
  assert.match(
    paletteSnippet(palette, "tailwind"),
    /^@theme \{\n {2}--color-palette-1: #aabbcc;/,
  );
});

test("json snippet follows the design tokens format", () => {
  const parsed = JSON.parse(paletteSnippet(palette, "json"));
  assert.deepEqual(parsed.palette["1"], { $type: "color", $value: "#aabbcc" });
  assert.equal(Object.keys(parsed.palette).length, 5);
});

test("snippets never contain anything but color values", () => {
  for (const format of ["css", "tailwind", "json"] as const) {
    assert.doesNotMatch(paletteSnippet(palette, format), /http|title|photo/i);
  }
});

test("an invalid hex cannot reach the clipboard", () => {
  assert.throws(() =>
    paletteSnippet(
      ["#zzzzzz", "#000000", "#000000", "#000000", "#000000"],
      "css",
    ),
  );
});
