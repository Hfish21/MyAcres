import type { Crop } from "./schema";

// Stable colors for plant dots on the layout canvas, so each crop reads
// distinctly (companions at a glance). Drawn from the Paper Desktop earth palette.
export const CROP_PALETTE = [
  "#5A6B3B", // olive
  "#9C4A2E", // rust
  "#C97A1A", // amber
  "#3E5A6B", // faded blue
  "#8B2E22", // barn red
  "#6B7E47", // light olive
  "#9A5B12", // deep amber
  "#7E6019", // ochre-ink
];

export function cropColorMap(crops: Crop[]): Map<string, string> {
  const m = new Map<string, string>();
  crops.forEach((c, i) => m.set(c.id, CROP_PALETTE[i % CROP_PALETTE.length]));
  return m;
}
