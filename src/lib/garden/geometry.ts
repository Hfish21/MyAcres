import type { Crop, Point, Polygon, Space } from "./schema";

// Geometry + capacity helpers (ADR-0009). Coordinates are in feet, so areas
// come out in square feet.

/** Area of a polygon (shoelace formula), in square feet. */
export function polygonArea(poly: Polygon): number {
  const pts = poly.points;
  let sum = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    sum += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
  }
  return Math.abs(sum) / 2;
}

/** A rectangle footprint (4 points at the origin) from feet dimensions. */
export function rectPolygon(lengthFt: number, widthFt: number): Polygon {
  return {
    points: [
      { x: 0, y: 0 },
      { x: lengthFt, y: 0 },
      { x: lengthFt, y: widthFt },
      { x: 0, y: widthFt },
    ],
  };
}

/** Bounding length × width of a polygon, in feet — for editing a rectangle. */
export function rectDimsFromPolygon(poly: Polygon): { length: number; width: number } {
  const xs = poly.points.map((p) => p.x);
  const ys = poly.points.map((p) => p.y);
  return {
    length: Math.max(...xs) - Math.min(...xs),
    width: Math.max(...ys) - Math.min(...ys),
  };
}

/** How many of `crop` fit in `space` — from spacing (inches) vs area (sq ft). */
export function capacity(crop: Crop, space: Space): number {
  if (space.capacityOverride != null) return space.capacityOverride;
  const between = crop.spacingBetweenRows ?? crop.spacingInRow;
  const areaPerPlantSqFt = (crop.spacingInRow * between) / 144; // in² → ft²
  if (areaPerPlantSqFt <= 0) return 0;
  return Math.floor(polygonArea(space.shape) / areaPerPlantSqFt);
}

// --- canvas geometry (the layout editor) ----------------------------------

/** Snap a value to the nearest grid step (default 1 ft). */
export function snap(v: number, step = 1): number {
  return Math.round(v / step) * step;
}

export interface BBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export function boundingBox(poly: Polygon): BBox {
  const xs = poly.points.map((p) => p.x);
  const ys = poly.points.map((p) => p.y);
  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
  };
}

// Default trellis direction for a space: run it along the bed's long axis.
// Used both as the canvas fallback and as the dialog's initial pick.
export function autoTrellisDirection(poly: Polygon): "horizontal" | "vertical" {
  const bb = boundingBox(poly);
  return bb.maxY - bb.minY >= bb.maxX - bb.minX ? "vertical" : "horizontal";
}

export function translatePolygon(poly: Polygon, dx: number, dy: number): Polygon {
  return { points: poly.points.map((p) => ({ x: p.x + dx, y: p.y + dy })) };
}

/** Ray-casting point-in-polygon test. */
export function pointInPolygon(pt: Point, poly: Polygon): boolean {
  const pts = poly.points;
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i].x,
      yi = pts[i].y,
      xj = pts[j].x,
      yj = pts[j].y;
    const intersect =
      yi > pt.y !== yj > pt.y &&
      pt.x < ((xj - xi) * (pt.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * `count` evenly spread points inside `rect`, kept to those inside `clip`. Columns
 * come from the plant spacing (ft); rows grow until the grid fits the rect height,
 * and a short last row is centred.
 */
export function distributeInRect(
  rect: BBox,
  clip: Polygon,
  spacingFt: number,
  count: number,
): Point[] {
  if (count <= 0) return [];
  const s = Math.max(0.3, spacingFt);
  const w = Math.max(0, rect.maxX - rect.minX);
  const h = Math.max(0, rect.maxY - rect.minY);
  if (w <= 0 || h <= 0) return [];
  let cols = Math.max(1, Math.min(count, Math.round(w / s)));
  let rows = Math.ceil(count / cols);
  while (rows * s > h && cols < count) {
    cols += 1;
    rows = Math.ceil(count / cols);
  }
  const cw = w / cols;
  const rh = h / rows;
  const out: Point[] = [];
  for (let r = 0; r < rows && out.length < count; r++) {
    const inRow = Math.min(cols, count - r * cols);
    const offset = ((cols - inRow) / 2) * cw;
    const y = rect.minY + (r + 0.5) * rh;
    for (let c = 0; c < inRow && out.length < count; c++) {
      const pt = { x: rect.minX + offset + (c + 0.5) * cw, y };
      if (pointInPolygon(pt, clip)) out.push(pt);
    }
  }
  return out;
}

/** Which way crop blocks stack: "y" = horizontal bands top-to-bottom, "x" = vertical strips. */
export type BlockAxis = "x" | "y";

/**
 * Split a bed's bounding box into one block per item, sized by weight, stacked
 * along `axis` (default: the bed's long axis). The last block absorbs rounding.
 */
export function partitionBlocks<T>(
  poly: Polygon,
  items: Array<{ item: T; weight: number }>,
  axis?: BlockAxis,
): Array<{ item: T; rect: BBox; axis: BlockAxis }> {
  const bb = boundingBox(poly);
  const live = items.filter((i) => i.weight > 0);
  const total = live.reduce((s, i) => s + i.weight, 0);
  if (total <= 0 || live.length === 0) return [];
  const w = bb.maxX - bb.minX;
  const h = bb.maxY - bb.minY;
  const ax: BlockAxis = axis ?? (h >= w ? "y" : "x");
  const span = ax === "y" ? h : w;
  const out: Array<{ item: T; rect: BBox; axis: BlockAxis }> = [];
  let at = ax === "y" ? bb.minY : bb.minX;
  live.forEach((it, idx) => {
    const size =
      idx === live.length - 1 ? (ax === "y" ? bb.maxY : bb.maxX) - at : span * (it.weight / total);
    const rect =
      ax === "y"
        ? { minX: bb.minX, maxX: bb.maxX, minY: at, maxY: at + size }
        : { minX: at, maxX: at + size, minY: bb.minY, maxY: bb.maxY };
    out.push({ item: it.item, rect, axis: ax });
    at += size;
  });
  return out;
}

/** Side length (ft) of a crop's per-plant footprint — used to space dots. */
export function plantSpacingFt(crop: Crop): number {
  const between = crop.spacingBetweenRows ?? crop.spacingInRow;
  return Math.sqrt((crop.spacingInRow * between) / 144);
}
