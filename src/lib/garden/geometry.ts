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

/** Grid points inside a polygon at the given spacing (ft), row-major, capped at `max`. */
export function packPositions(poly: Polygon, spacingFt: number, max: number): Point[] {
  const s = Math.max(0.3, spacingFt);
  const bb = boundingBox(poly);
  const out: Point[] = [];
  for (let y = bb.minY + s / 2; y <= bb.maxY && out.length < max; y += s) {
    for (let x = bb.minX + s / 2; x <= bb.maxX && out.length < max; x += s) {
      if (pointInPolygon({ x, y }, poly)) out.push({ x, y });
    }
  }
  return out;
}

/** Side length (ft) of a crop's per-plant footprint — used to space dots. */
export function plantSpacingFt(crop: Crop): number {
  const between = crop.spacingBetweenRows ?? crop.spacingInRow;
  return Math.sqrt((crop.spacingInRow * between) / 144);
}
