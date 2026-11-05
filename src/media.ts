import { MOBILE_QUERY } from "./config.ts";

export const reduced = matchMedia("(prefers-reduced-motion: reduce)");
export const narrow = matchMedia(MOBILE_QUERY);
