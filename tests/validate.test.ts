import assert from "node:assert/strict";
import { test } from "node:test";
import { racks } from "../src/data/racks.ts";
import { validateRacks } from "../src/data/validate.ts";

type Racks = typeof racks;

const rejects = (name: string, mutate: (copy: Racks) => void) =>
  test(`validateRacks rejects ${name}`, () => {
    const copy = structuredClone(racks);
    mutate(copy);
    assert.throws(() => validateRacks(copy));
  });

test("validateRacks accepts the shipped data", () => {
  assert.doesNotThrow(() => validateRacks(racks));
});

rejects("a malformed hex color", (copy) => {
  copy[0].photos[0].palette[0] = "#NOTHEX";
});
rejects("a four-color palette", (copy) => {
  copy[0].photos[0].palette.pop();
});
rejects("a rack with eight photos", (copy) => {
  copy[0].photos.pop();
});
rejects("an invalid date", (copy) => {
  copy[0].photos[0].date = "2024-13";
});
rejects("a duplicate photo id", (copy) => {
  copy[0].photos[1].id = copy[0].photos[0].id;
});
