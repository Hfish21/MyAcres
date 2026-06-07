import type { Crop, Polygon, Space } from "./schema";

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
