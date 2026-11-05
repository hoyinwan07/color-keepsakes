import assert from "node:assert/strict";
import { test } from "node:test";
import { flickAmount, stepsFromAmount } from "../src/gesture.ts";

test("a tiny drag snaps back", () => {
  assert.equal(stepsFromAmount(0), 0);
  assert.equal(stepsFromAmount(18), 0);
  assert.equal(stepsFromAmount(-18), 0);
});

test("a short deliberate drag turns one column opposite to the drag", () => {
  assert.equal(stepsFromAmount(30), -1);
  assert.equal(stepsFromAmount(-30), 1);
});

test("a medium drag rounds to the nearest column", () => {
  assert.equal(stepsFromAmount(130), -1);
  assert.equal(stepsFromAmount(-130), 1);
  assert.equal(stepsFromAmount(200), -2);
});

test("a hard flick never turns more than two columns", () => {
  assert.equal(stepsFromAmount(900), -2);
  assert.equal(stepsFromAmount(-900), 2);
});

const near = (actual: number, expected: number) =>
  assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} is not ${expected}`);

test("flick amount adds release velocity to the dragged distance", () => {
  near(flickAmount(100, 0), 55);
  near(flickAmount(100, 1), 125);
  near(flickAmount(-100, -1), -125);
});
