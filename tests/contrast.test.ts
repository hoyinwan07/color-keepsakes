import assert from "node:assert/strict";
import { test } from "node:test";

const luminance = (hex: string) => {
  const [r, g, b] = hex
    .match(/[a-f\d]{2}/gi)!
    .map((channel) => parseInt(channel, 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return r * 0.2126 + g * 0.7152 + b * 0.0722;
};

const contrast = (foreground: string, background: string) =>
  (luminance(background) + 0.05) / (luminance(foreground) + 0.05);

// Text color against both page backgrounds must meet WCAG AA for body text.
for (const background of ["#F7F4EC", "#F6F1EA"]) {
  test(`accent text on ${background} meets AA (4.5:1)`, () => {
    assert.ok(contrast("#424A35", background) >= 4.5);
  });
}
