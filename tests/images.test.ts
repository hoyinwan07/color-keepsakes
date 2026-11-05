import assert from "node:assert/strict";
import { existsSync, readdirSync } from "node:fs";
import { test } from "node:test";
import { palettes } from "../src/data/palettes.ts";

test("every palette has a thumbnail and a full-size image", () => {
  for (const { slug } of palettes) {
    for (const size of ["thumb", "full"]) {
      assert.ok(
        existsSync(`src/images/${size}/${slug}.webp`),
        `missing src/images/${size}/${slug}.webp; run npm run images`,
      );
    }
  }
});

test("no image in src/images is unused", () => {
  const slugs = new Set(palettes.map((entry) => entry.slug));
  for (const size of ["thumb", "full"]) {
    for (const file of readdirSync(`src/images/${size}`)) {
      assert.ok(
        slugs.has(file.replace(/\.webp$/, "")),
        `unused ${size}/${file}`,
      );
    }
  }
});
