/** Modulo that stays non-negative, for wrapping indexes around a list. */
export const mod = (n: number, length: number): number =>
  ((n % length) + length) % length;
