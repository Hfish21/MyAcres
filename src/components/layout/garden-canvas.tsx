"use client";

import * as React from "react";

import type { Crop, Planting, Point, Polygon, Space } from "@/lib/garden/schema";
import {
  boundingBox,
  packPositions,
  plantSpacingFt,
  polygonArea,
  snap,
  translatePolygon,
} from "@/lib/garden/geometry";
import { plantingActiveOn } from "@/lib/garden/insights";
import { cn } from "@/lib/utils";

export type CanvasMode = "select" | "draw";

const CLOSE_DIST = 1.2; // ft — click this close to the first vertex to close

function pointsStr(poly: Polygon): string {
  return poly.points.map((p) => `${p.x},${p.y}`).join(" ");
}
function centroid(poly: Polygon): Point {
  const n = poly.points.length;
  const sum = poly.points.reduce((a, p) => ({ x: a.x + p.x, y: a.y + p.y }), { x: 0, y: 0 });
  return { x: sum.x / n, y: sum.y / n };
}
function dist(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

interface GardenCanvasProps {
  spaces: Space[];
  plantings: Planting[];
  crops: Crop[];
  cropColors: Map<string, string>;
  asOfDate: Date;
  mode: CanvasMode;
  editable: boolean;
  selectedId: string | null;
  draftPoints: Point[];
  onSelect: (id: string | null) => void;
  onAddDraftPoint: (pt: Point) => void;
  onCloseDraft: () => void;
  onMoveSpace: (id: string, polygon: Polygon) => void;
}

export function GardenCanvas({
  spaces,
  plantings,
  crops,
  cropColors,
  asOfDate,
  mode,
  editable,
  selectedId,
  draftPoints,
  onSelect,
  onAddDraftPoint,
  onCloseDraft,
  onMoveSpace,
}: GardenCanvasProps) {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const cropById = React.useMemo(() => new Map(crops.map((c) => [c.id, c])), [crops]);
  const [hover, setHover] = React.useState<Point | null>(null);
  const [drag, setDrag] = React.useState<{ id: string; start: Point; orig: Polygon } | null>(null);
  const [dragPreview, setDragPreview] = React.useState<{ id: string; polygon: Polygon } | null>(
    null,
  );

  // viewBox in feet: include the origin + content + a generous min area & margin.
  const view = React.useMemo(() => {
    const pts = [...spaces.flatMap((s) => s.shape.points), ...draftPoints];
    const m = 4;
    let minX = 0,
      minY = 0,
      maxX = 36,
      maxY = 24;
    if (pts.length) {
      const bb = boundingBox({ points: pts });
      minX = Math.min(minX, bb.minX);
      minY = Math.min(minY, bb.minY);
      maxX = Math.max(maxX, bb.maxX);
      maxY = Math.max(maxY, bb.maxY);
    }
    minX -= m;
    minY -= m;
    maxX += m;
    maxY += m;
    return { minX, minY, w: maxX - minX, h: maxY - minY };
  }, [spaces, draftPoints]);

  function toFeet(e: React.PointerEvent): Point | null {
    const svg = svgRef.current;
    if (!svg) return null;
    const m = svg.getScreenCTM();
    if (!m) return null;
    const p = svg.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    const f = p.matrixTransform(m.inverse());
    return { x: snap(f.x), y: snap(f.y) };
  }

  function handleBackgroundDown(e: React.PointerEvent) {
    if (!editable) return;
    const pt = toFeet(e);
    if (!pt) return;
    if (mode === "draw") {
      if (draftPoints.length >= 3 && dist(pt, draftPoints[0]) <= CLOSE_DIST) {
        onCloseDraft();
      } else {
        onAddDraftPoint(pt);
      }
    } else {
      onSelect(null); // clicked empty space → deselect
    }
  }

  function handleSpaceDown(e: React.PointerEvent, space: Space) {
    if (!editable || mode !== "select") return;
    e.stopPropagation();
    const pt = toFeet(e);
    if (!pt) return;
    onSelect(space.id);
    setDrag({ id: space.id, start: pt, orig: space.shape });
    svgRef.current?.setPointerCapture(e.pointerId);
  }

  function handleMove(e: React.PointerEvent) {
    const pt = toFeet(e);
    if (!pt) return;
    if (drag) {
      const dx = snap(pt.x - drag.start.x);
      const dy = snap(pt.y - drag.start.y);
      setDragPreview({ id: drag.id, polygon: translatePolygon(drag.orig, dx, dy) });
    } else if (mode === "draw" && draftPoints.length > 0) {
      setHover(pt);
    }
  }

  function handleUp() {
    if (drag && dragPreview) onMoveSpace(drag.id, dragPreview.polygon);
    setDrag(null);
    setDragPreview(null);
  }

  function shapeOf(space: Space): Polygon {
    return dragPreview?.id === space.id ? dragPreview.polygon : space.shape;
  }

  function dotsFor(space: Space): Array<{ pt: Point; color: string; r: number }> {
    const items = plantings
      .filter((p) => p.spaceId === space.id)
      .map((p) => ({ p, crop: cropById.get(p.cropId) }))
      .filter((x): x is { p: Planting; crop: Crop } => !!x.crop)
      .filter((x) => plantingActiveOn(x.p, x.crop, asOfDate));
    if (items.length === 0) return [];
    const avgSpacing =
      items.reduce((s, x) => s + plantSpacingFt(x.crop), 0) / items.length;
    const total = items.reduce((s, x) => s + x.p.quantity, 0);
    const grid = packPositions(shapeOf(space), avgSpacing, total);
    const r = Math.min(0.38, Math.max(0.14, avgSpacing * 0.3));
    const dots: Array<{ pt: Point; color: string; r: number }> = [];
    let i = 0;
    for (const { p, crop } of items) {
      const n = Math.min(p.quantity, grid.length - i);
      for (let k = 0; k < n; k++) {
        dots.push({ pt: grid[i++], color: cropColors.get(crop.id) ?? "#5A6B3B", r });
      }
      if (i >= grid.length) break;
    }
    return dots;
  }

  const draftWithHover =
    hover && mode === "draw" ? [...draftPoints, hover] : draftPoints;

  return (
    <div className="overflow-hidden rounded-md border border-line bg-canvas">
      <svg
        ref={svgRef}
        viewBox={`${view.minX} ${view.minY} ${view.w} ${view.h}`}
        className={cn(
          "block h-auto w-full touch-none select-none",
          mode === "draw" && editable && "cursor-crosshair",
        )}
        onPointerDown={handleBackgroundDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onDoubleClick={() => editable && mode === "draw" && onCloseDraft()}
      >
        <defs>
          <pattern id="dotgrid" width="1" height="1" patternUnits="userSpaceOnUse">
            <circle cx="0" cy="0" r="0.05" className="fill-line" opacity="0.6" />
          </pattern>
          <pattern id="dotgrid5" width="5" height="5" patternUnits="userSpaceOnUse">
            <circle cx="0" cy="0" r="0.1" className="fill-ink-3" opacity="0.5" />
          </pattern>
        </defs>

        <rect x={view.minX} y={view.minY} width={view.w} height={view.h} fill="url(#dotgrid)" />
        <rect x={view.minX} y={view.minY} width={view.w} height={view.h} fill="url(#dotgrid5)" />

        {spaces.map((space) => {
          const poly = shapeOf(space);
          const c = centroid(poly);
          const selected = space.id === selectedId;
          const dots = dotsFor(space);
          return (
            <g key={space.id} style={{ pointerEvents: mode === "draw" ? "none" : "auto" }}>
              <polygon
                points={pointsStr(poly)}
                className={cn(
                  "fill-panel",
                  selected ? "stroke-rust" : "stroke-line",
                  editable && mode === "select" && "cursor-move",
                )}
                fillOpacity={0.85}
                strokeWidth={selected ? 2 : 1.5}
                vectorEffect="non-scaling-stroke"
                onPointerDown={(e) => handleSpaceDown(e, space)}
              />
              {dots.map((d, i) => (
                <circle key={i} cx={d.pt.x} cy={d.pt.y} r={d.r} fill={d.color} opacity={0.9} />
              ))}
              <text
                x={c.x}
                y={c.y}
                textAnchor="middle"
                fontSize={0.95}
                fontWeight={600}
                pointerEvents="none"
                className="fill-ink"
              >
                {space.name}
              </text>
              <text
                x={c.x}
                y={c.y + 1.1}
                textAnchor="middle"
                fontSize={0.7}
                pointerEvents="none"
                className="fill-ink-3"
              >
                {Math.round(polygonArea(poly))} sq ft
              </text>
            </g>
          );
        })}

        {/* draft polygon being drawn */}
        {draftPoints.length > 0 ? (
          <g style={{ pointerEvents: "none" }}>
            <polyline
              points={pointsStr({ points: draftWithHover })}
              className={cn(
                "stroke-rust",
                draftPoints.length >= 3 ? "fill-rust/10" : "fill-none",
              )}
              strokeWidth={1.5}
              strokeDasharray="4 3"
              vectorEffect="non-scaling-stroke"
            />
            {draftPoints.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={0.25}
                className={i === 0 ? "fill-rust" : "fill-rust/60"}
              />
            ))}
          </g>
        ) : null}
      </svg>
    </div>
  );
}
