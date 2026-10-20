import type { Crop, PlantFamily } from "./schema";

// Crop colours are grouped by plant family: each family owns a hue, and the crops
// within it get lightness steps around a shared midpoint. So related crops read as
// related on the canvas (all brassicas cool green, all nightshades rust-red) while
// each still stays distinguishable. Saturation is held at 48% to sit in the Paper
// Desktop earth palette.
const FAMILY_HUE: Record<PlantFamily, number> = {
  solanaceae: 8,
  apiaceae: 30,
  cucurbit: 45,
  allium: 90,
  "leafy-greens": 135,
  brassica: 178,
  other: 212,
  legume: 280,
};

export function cropColorMap(crops: Crop[]): Map<string, string> {
  const byFamily = new Map<PlantFamily, Crop[]>();
  for (const c of crops) {
    const list = byFamily.get(c.family) ?? [];
    list.push(c);
    byFamily.set(c.family, list);
  }
  const out = new Map<string, string>();
  for (const [family, list] of byFamily) {
    list.sort((a, b) => a.id.localeCompare(b.id));
    const n = list.length;
    const step = Math.min(9, 22 / Math.max(1, n)); // spread narrows as the family grows
    list.forEach((c, i) => {
      const l = Math.max(32, Math.min(62, n === 1 ? 46 : 46 + (i - (n - 1) / 2) * step));
      out.set(c.id, `hsl(${FAMILY_HUE[family]} 48% ${l.toFixed(0)}%)`);
    });
  }
  return out;
}

/** The family's anchor colour (its midpoint lightness) — for family chips and badges. */
export function familyColor(family: PlantFamily): string {
  return `hsl(${FAMILY_HUE[family]} 48% 46%)`;
}

/** A crop's display name, with its variety when it has one. */
export function cropLabel(crop: Crop): string {
  return crop.variety ? `${crop.name} · ${crop.variety}` : crop.name;
}
