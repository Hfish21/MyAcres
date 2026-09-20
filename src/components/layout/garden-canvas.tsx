"use client";

import * as React from "react";

import type { Crop, LightLevel, Planting, Point, Polygon, Space } from "@/lib/garden/schema";
import { LIGHT_LABELS } from "@/lib/garden/labels";
import {
  boundingBox,
  packPositions,
  plantSpacingFt,
  polygonArea,
  snap,
  translatePolygon,
} from "@/lib/garden/geometry";
import { stageOn } from "@/lib/garden/insights";
import type { LifecycleStage } from "@/lib/garden/insights";
import { cn } from "@/lib/utils";

export type CanvasMode = "select" | "draw";

const CLOSE_DIST = 1.2; // ft — click this close to the first vertex to close

// Sun/shade shading: a translucent shadow overlay over each bed's fill, graded by
// its stored `sun` level, so it literally reads as "where the shade falls" — more
// sun = less overlay. `full-sun` is open to the sky (no overlay); `shade` is the
// darkest. Undefined sun is handled separately (a faint hatch, never a solid tint —
// so it never implies data that isn't there). The three `shade-*` tokens are
// theme-aware (defined in both the light and coffee-dark blocks, ADR-0007 §2), with
// a wider alpha spread after dark so the steps stay distinguishable there too.
// Literal class strings (not interpolated) so Tailwind's scanner emits them.
export const SUN_FILL_CLASS: Record<LightLevel, string | null> = {
  "full-sun": null,
  "part-sun": "fill-shade-1",
  "part-shade": "fill-shade-2",
  shade: "fill-shade-3",
};
const SUN_SWATCH_CLASS: Record<LightLevel, string | null> = {
  "full-sun": null,
  "part-sun": "bg-shade-1",
  "part-shade": "bg-shade-2",
  shade: "bg-shade-3",
};

// Legend order (brightest → darkest) plus the "not set" affordance.
export const SUN_LEGEND_ORDER: LightLevel[] = [
  "full-sun",
  "part-sun",
  "part-shade",
  "shade",
];

// A compact, mono-labelled legend for the sun/shade scale — only rendered when the
// toggle is on. Paper Desktop: flat swatches, thin borders, mono uppercase labels.
export function SunLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-md border border-line bg-panel px-3 py-2">
      <span className="font-mono text-[11px] uppercase tracking-wide text-ink-2">Sun</span>
      {SUN_LEGEND_ORDER.map((level) => (
        <span key={level} className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="relative size-3.5 shrink-0 overflow-hidden rounded-[3px] border border-line bg-panel"
          >
            {SUN_SWATCH_CLASS[level] ? (
              <span className={cn("absolute inset-0", SUN_SWATCH_CLASS[level])} />
            ) : null}
          </span>
          <span className="font-mono text-[11px] uppercase tracking-wide text-ink-3">
            {LIGHT_LABELS[level]}
          </span>
        </span>
      ))}
      <span className="flex items-center gap-1.5">
        <span
          aria-hidden
          className="size-3.5 shrink-0 rounded-[3px] border border-line"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, var(--color-ink-3) 0 1px, transparent 1px 4px)",
            opacity: 0.5,
          }}
        />
        <span className="font-mono text-[11px] uppercase tracking-wide text-ink-3">Not set</span>
      </span>
    </div>
  );
}

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

// Shrink a polygon toward its centroid so packed dots keep a margin off the
// border (purely cosmetic — gives each bed some breathing room).
function insetPolygon(poly: Polygon, ratio: number): Polygon {
  const c = centroid(poly);
  return {
    points: poly.points.map((p) => ({
      x: c.x + (p.x - c.x) * ratio,
      y: c.y + (p.y - c.y) * ratio,
    })),
  };
}

// A "nice" round length for the scale bar, ~1/6 of the visible width.
function niceScale(target: number): number {
  const steps = [1, 2, 5, 10, 20, 25, 50, 100, 200];
  let best = 1;
  for (const s of steps) if (s <= target) best = s;
  return best;
}

function fmtFt(n: number): string {
  return Number.isInteger(n) ? `${n}` : n.toFixed(1);
}

// One leaf, normalized: base at the origin, tip straight up at (0,-1). The plant
// glyph is a fan of three of these, rotated, so it reads as foliage (not a stem
// with two "arms").
const LEAF = "M0,0 C-0.3,-0.34 -0.26,-0.78 0,-1 C0.26,-0.78 0.3,-0.34 0,0 Z";

// A single plant, drawn by lifecycle stage so the bed visibly matures as the
// scrubber moves: establish = a small seed, growing = a leafy three-leaf sprout
// (crop colour), harvest = the sprout with an amber "ready" fruit nestled in it.
function PlantGlyph({
  x,
  y,
  r,
  color,
  stage,
}: {
  x: number;
  y: number;
  r: number;
  color: string;
  stage: LifecycleStage;
}) {
  if (stage === "establish") {
    return (
      <circle
        cx={x}
        cy={y}
        r={r * 0.5}
        fill={color}
        opacity={0.8}
        className="stroke-canvas"
        strokeWidth={0.04}
      />
    );
  }
  const s = r * (stage === "harvest" ? 1.12 : 0.92);
  return (
    <g transform={`translate(${x}, ${y + s * 0.45}) scale(${s})`} opacity={0.95}>
      <path d={LEAF} fill={color} transform="rotate(-42)" opacity={0.9} />
      <path d={LEAF} fill={color} transform="rotate(42)" opacity={0.9} />
      <path d={LEAF} fill={color} />
      {stage === "harvest" ? (
        <circle cx={0} cy={-0.46} r={0.46} className="fill-ripe stroke-canvas" strokeWidth={0.09} />
      ) : null}
    </g>
  );
}

// A trellis indicator: a single dashed line running the length of the bed, down
// its center. The dashes read as thatching/netting, it spans the whole space so
// it clearly belongs to that bed, and it renders beneath the plant glyphs so it
// never fights the produce dots or the nameplates. Flat rust, non-scaling stroke
// (Paper Desktop). Deliberately simple: we track only that a trellis exists.
function TrellisMarker({
  minX,
  minY,
  maxX,
  maxY,
  direction,
}: {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  direction?: "horizontal" | "vertical";
}) {
  const w = maxX - minX;
  const h = maxY - minY;
  if (w <= 0 || h <= 0) return null;
  // Explicit direction wins; otherwise run the line along the long axis.
  const vertical = direction ? direction === "vertical" : h >= w;
  const inset = Math.min(0.3, (vertical ? h : w) * 0.12); // pull the ends off the border
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const [lx1, ly1, lx2, ly2] = vertical
    ? [cx, minY + inset, cx, maxY - inset]
    : [minX + inset, cy, maxX - inset, cy];
  return (
    <line
      pointerEvents="none"
      className="stroke-rust"
      x1={lx1}
      y1={ly1}
      x2={lx2}
      y2={ly2}
      strokeWidth={1.25}
      strokeDasharray="4 3"
      opacity={0.5}
      vectorEffect="non-scaling-stroke"
    />
  );
}

// A small measurement label drawn on the canvas (in feet units). `area` is the
// headline running total (solid rust); `edge` labels are quieter (panel + rust).
function MeasureChip({
  x,
  y,
  text,
  size,
  variant,
}: {
  x: number;
  y: number;
  text: string;
  size: number;
  variant: "edge" | "area";
}) {
  const pad = size * 0.45;
  const w = text.length * size * 0.62 + pad * 2;
  const h = size + pad * 1.3;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        rx={0.25}
        className={variant === "area" ? "fill-rust stroke-rust" : "fill-panel stroke-rust"}
        fillOpacity={variant === "area" ? 0.95 : 0.96}
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
      <text
        x={0}
        y={0}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size}
        className={cn("font-mono", variant === "area" ? "fill-canvas" : "fill-rust")}
        fontWeight={variant === "area" ? 600 : 400}
      >
        {text}
      </text>
    </g>
  );
}

interface GardenCanvasProps {
  spaces: Space[];
  plantings: Planting[];
  crops: Crop[];
  cropColors: Map<string, string>;
  asOfDate: Date;
  mode: CanvasMode;
  editable: boolean;
  showAllNames: boolean;
  showSun: boolean;
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
  showAllNames,
  showSun,
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
  const [hoverId, setHoverId] = React.useState<string | null>(null);
  const [drag, setDrag] = React.useState<{ id: string; start: Point; orig: Polygon } | null>(null);
  const [dragPreview, setDragPreview] = React.useState<{ id: string; polygon: Polygon } | null>(
    null,
  );

  // viewBox in feet: frame the actual content with a small margin (extra room up
  // top for the bed nameplates). Falls back to a sensible empty frame.
  const view = React.useMemo(() => {
    const pts = [...spaces.flatMap((s) => s.shape.points), ...draftPoints];
    if (pts.length < 2) {
      return { minX: 0, minY: 0, w: 32, h: 20 };
    }
    const bb = boundingBox({ points: pts });
    const mx = 2.5; // side / bottom margin
    const mt = 3.5; // top margin — leaves room for nameplates above each bed
    const minX = bb.minX - mx;
    const minY = bb.minY - mt;
    const w = bb.maxX - bb.minX + mx * 2;
    const h = bb.maxY - bb.minY + mt + mx;
    return { minX, minY, w, h };
  }, [spaces, draftPoints]);

  // Label / scale sizing scales gently with the framed area so it reads at any
  // zoom, but stays compact so nameplates don't overpower small beds.
  const labelSize = Math.min(0.74, Math.max(0.42, view.w / 72));
  const scaleLen = niceScale(view.w / 6);

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

  function plantsFor(
    space: Space,
  ): Array<{ pt: Point; color: string; r: number; stage: LifecycleStage }> {
    const items = plantings
      .filter((p) => p.spaceId === space.id)
      .map((p) => ({ p, crop: cropById.get(p.cropId), stage: undefined as LifecycleStage | null | undefined }))
      .filter((x): x is { p: Planting; crop: Crop; stage: undefined } => !!x.crop)
      .map((x) => ({ ...x, stage: stageOn(x.p, x.crop, asOfDate) }))
      .filter((x): x is { p: Planting; crop: Crop; stage: LifecycleStage } => x.stage !== null);
    if (items.length === 0) return [];
    const avgSpacing =
      items.reduce((s, x) => s + plantSpacingFt(x.crop), 0) / items.length;
    const total = items.reduce((s, x) => s + x.p.quantity, 0);
    // Pack into a slightly inset bed so plants don't crowd the border.
    const grid = packPositions(insetPolygon(shapeOf(space), 0.86), avgSpacing, total);
    const r = Math.min(0.46, Math.max(0.18, avgSpacing * 0.37)); // ~15% larger glyphs
    const out: Array<{ pt: Point; color: string; r: number; stage: LifecycleStage }> = [];
    let i = 0;
    for (const { p, crop, stage } of items) {
      const n = Math.min(p.quantity, grid.length - i);
      const color = cropColors.get(crop.id) ?? "#5A6B3B";
      for (let k = 0; k < n; k++) {
        out.push({ pt: grid[i++], color, r, stage });
      }
      if (i >= grid.length) break;
    }
    return out;
  }

  const draftWithHover =
    hover && mode === "draw" ? [...draftPoints, hover] : draftPoints;

  return (
    <div className="overflow-hidden rounded-md border border-line bg-canvas">
      <svg
        ref={svgRef}
        viewBox={`${view.minX} ${view.minY} ${view.w} ${view.h}`}
        className={cn(
          "block h-auto max-h-[72vh] w-full touch-none select-none",
          mode === "draw" && editable && "cursor-crosshair",
        )}
        onPointerDown={handleBackgroundDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onDoubleClick={() => editable && mode === "draw" && onCloseDraft()}
      >
        <defs>
          <pattern id="dotgrid" width="1" height="1" patternUnits="userSpaceOnUse">
            <circle cx="0" cy="0" r="0.045" className="fill-line" opacity="0.55" />
          </pattern>
          <pattern id="dotgrid5" width="5" height="5" patternUnits="userSpaceOnUse">
            <circle cx="0" cy="0" r="0.1" className="fill-ink-3" opacity="0.45" />
          </pattern>
          {/* Diagonal hatch for beds with no sun level set — reads as "unknown",
              distinct from any solid shade, so it never implies data isn't there. */}
          <pattern
            id="sunhatch"
            width="0.7"
            height="0.7"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="0.7"
              className="stroke-ink-3"
              strokeWidth={0.08}
              opacity={0.4}
            />
          </pattern>
        </defs>

        <rect x={view.minX} y={view.minY} width={view.w} height={view.h} fill="url(#dotgrid)" />
        <rect x={view.minX} y={view.minY} width={view.w} height={view.h} fill="url(#dotgrid5)" />

        {spaces.map((space) => {
          const poly = shapeOf(space);
          const bb = boundingBox(poly);
          const selected = space.id === selectedId;
          const hovered = space.id === hoverId && !selected;
          // Labels de-clutter the canvas: hidden by default, revealed on hover,
          // always shown for the selected bed, or all-on via the toolbar toggle.
          const showLabel = showAllNames || selected || space.id === hoverId;
          const plants = plantsFor(space);

          // Nameplate floats just above the bed's top-left corner: name over a
          // muted area line, stacked so the pill stays narrow (won't run into a
          // neighbouring bed).
          const name = space.name;
          const areaLabel = `${Math.round(polygonArea(poly))} sq ft`;
          const areaSize = labelSize * 0.8;
          const pad = labelSize * 0.45;
          const lineGap = labelSize * 0.35;
          const nameW = name.length * labelSize * 0.56;
          const areaW = areaLabel.length * areaSize * 0.6; // mono is a touch wider
          const pillW = Math.max(nameW, areaW) + pad * 2;
          const pillH = labelSize + areaSize + lineGap + pad * 2;
          const pillY = bb.minY - pillH - 0.2;
          const nameY = pillY + pad + labelSize / 2;
          const areaY = nameY + labelSize / 2 + lineGap + areaSize / 2;

          return (
            <g key={space.id} style={{ pointerEvents: mode === "draw" ? "none" : "auto" }}>
              <polygon
                points={pointsStr(poly)}
                className={cn(
                  selected ? "fill-rust/8 stroke-rust" : "fill-panel stroke-line",
                  hovered && "fill-inset stroke-ink-3",
                  editable && mode === "select" && "cursor-move",
                )}
                fillOpacity={selected ? 1 : 0.9}
                strokeWidth={selected ? 2 : 1.25}
                vectorEffect="non-scaling-stroke"
                onPointerDown={(e) => handleSpaceDown(e, space)}
                onPointerEnter={() => setHoverId(space.id)}
                onPointerLeave={() => setHoverId((id) => (id === space.id ? null : id))}
              />
              {/* Sun/shade overlay: a shadow graded by the bed's sun level (drawn
                  under the trellis, plants, and nameplate so it never fights them).
                  full-sun = no overlay; unset = faint hatch (not a solid tint). */}
              {showSun && space.sun === undefined ? (
                <polygon pointerEvents="none" points={pointsStr(poly)} fill="url(#sunhatch)" />
              ) : null}
              {showSun && space.sun !== undefined && SUN_FILL_CLASS[space.sun] ? (
                <polygon
                  pointerEvents="none"
                  points={pointsStr(poly)}
                  className={SUN_FILL_CLASS[space.sun]!}
                />
              ) : null}
              {space.trellis ? (
                <TrellisMarker
                  minX={bb.minX}
                  minY={bb.minY}
                  maxX={bb.maxX}
                  maxY={bb.maxY}
                  direction={space.trellisDirection}
                />
              ) : null}
              {plants.map((d, i) => (
                <PlantGlyph
                  key={i}
                  x={d.pt.x}
                  y={d.pt.y}
                  r={d.r}
                  color={d.color}
                  stage={d.stage}
                />
              ))}

              {/* Nameplate (name pill + area), kept clear of the plantings.
                  Hidden by default; fades in on hover / selection / show-all. */}
              <g
                pointerEvents="none"
                className="transition-opacity duration-150"
                opacity={showLabel ? 1 : 0}
              >
                <rect
                  x={bb.minX}
                  y={pillY}
                  width={pillW}
                  height={pillH}
                  rx={0.35}
                  className={cn(
                    "fill-panel",
                    selected ? "stroke-rust" : "stroke-line",
                  )}
                  fillOpacity={0.96}
                  strokeWidth={selected ? 1.5 : 1}
                  vectorEffect="non-scaling-stroke"
                />
                <text
                  x={bb.minX + pad}
                  y={nameY}
                  dominantBaseline="central"
                  fontSize={labelSize}
                  fontWeight={600}
                  className="fill-ink"
                >
                  {name}
                </text>
                <text
                  x={bb.minX + pad}
                  y={areaY}
                  dominantBaseline="central"
                  fontSize={areaSize}
                  className="fill-ink-3 font-mono"
                >
                  {areaLabel}
                </text>
              </g>
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

            {/* live dimensions: each edge's length + the running area */}
            {(() => {
              const pts = draftWithHover;
              const mSize = Math.max(0.5, labelSize * 0.82);
              const chips: React.ReactNode[] = [];
              for (let i = 0; i < pts.length - 1; i++) {
                const a = pts[i];
                const b = pts[i + 1];
                const len = dist(a, b);
                if (len < 0.6) continue;
                chips.push(
                  <MeasureChip
                    key={`edge-${i}`}
                    x={(a.x + b.x) / 2}
                    y={(a.y + b.y) / 2}
                    text={`${fmtFt(len)} ft`}
                    size={mSize}
                    variant="edge"
                  />,
                );
              }
              if (pts.length >= 3) {
                const c = centroid({ points: pts });
                chips.push(
                  <MeasureChip
                    key="area"
                    x={c.x}
                    y={c.y}
                    text={`≈ ${Math.round(polygonArea({ points: pts }))} sq ft`}
                    size={mSize}
                    variant="area"
                  />,
                );
              }
              return chips;
            })()}
          </g>
        ) : null}

        {/* Scale bar — anchored bottom-left, communicates the grid is in feet */}
        <g
          pointerEvents="none"
          transform={`translate(${view.minX + 1.2}, ${view.minY + view.h - 1.2})`}
          className="stroke-ink-3"
        >
          <line x1={0} y1={0} x2={scaleLen} y2={0} strokeWidth={1} vectorEffect="non-scaling-stroke" />
          <line x1={0} y1={-0.3} x2={0} y2={0.3} strokeWidth={1} vectorEffect="non-scaling-stroke" />
          <line
            x1={scaleLen}
            y1={-0.3}
            x2={scaleLen}
            y2={0.3}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
          <text
            x={scaleLen / 2}
            y={-0.55}
            textAnchor="middle"
            fontSize={labelSize * 0.8}
            className="fill-ink-3 font-mono"
            strokeWidth={0}
          >
            {scaleLen} ft
          </text>
        </g>
      </svg>
    </div>
  );
}
