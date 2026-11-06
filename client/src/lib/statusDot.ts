const GREEN = "34,197,94";

/**
 * Soft two-layer glow for the green "online / available" status dots.
 *
 * Static (no animation) on purpose: it stays inside the site motion rules
 * (no bounce / shine / count-up) and needs no reduced-motion handling, since
 * a box-shadow is not motion.
 *
 * Blur radii scale with the dot so the 6px, 7px and 8px variants read as one
 * system instead of three separately-tuned blobs.
 */
export function statusGlow(size = 7): string {
  const k = size / 7;
  return [
    `0 0 ${(2.2 * k).toFixed(2)}px rgba(${GREEN}, 0.9)`,
    `0 0 ${(6 * k).toFixed(2)}px rgba(${GREEN}, 0.4)`,
  ].join(", ");
}

/** Matching halo for the green label, so the dot + text read as one lit unit. */
export const statusTextGlow = `0 0 10px rgba(${GREEN}, 0.5)`;
