import assert from "node:assert/strict";
import { test } from "node:test";
import { averageColor } from "../src/color.ts";
import { mod } from "../src/math.ts";

test("averageColor averages each channel across the palette", () => {
  assert.equal(averageColor(["#000000", "#ffffff"]), "rgb(128 128 128)");
  assert.equal(
    averageColor(["#ff0000", "#00ff00", "#0000ff"]),
    "rgb(85 85 85)",
  );
});

test("mod wraps negative and oversized indexes", () => {
  assert.equal(mod(-1, 3), 2);
  assert.equal(mod(3, 3), 0);
  assert.equal(mod(7, 3), 1);
});
