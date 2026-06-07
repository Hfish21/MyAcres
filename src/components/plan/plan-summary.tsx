"use client";

import type { Crop, Planting, Space } from "@/lib/garden/schema";
import { lifecycleSegments } from "@/lib/garden/insights";
import { polygonArea } from "@/lib/garden/geometry";

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-md border border-line bg-panel p-3">
      <div className="font-mono text-2xl font-semibold tabular-nums text-ink">{value}</div>
      <div className="font-mono text-xs uppercase tracking-wide text-ink-3">{label}</div>
    </div>
  );
}

interface PlanSummaryProps {
  plantings: Planting[];
  crops: Crop[];
  spaces: Space[];
}

export function PlanSummary({ plantings, crops, spaces }: PlanSummaryProps) {
  const cropById = new Map(crops.map((c) => [c.id, c]));
  const today = new Date();

  const harvestingNow = plantings.filter((p) => {
    const crop = cropById.get(p.cropId);
    if (!crop) return false;
    const seg = lifecycleSegments(p, crop).find((s) => s.stage === "harvest");
    return seg ? today >= seg.start && today <= seg.end : false;
  }).length;

  const area = Math.round(spaces.reduce((sum, s) => sum + polygonArea(s.shape), 0));

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat value={plantings.length} label="Plantings" />
      <Stat value={harvestingNow} label="In harvest now" />
      <Stat value={spaces.length} label="Spaces" />
      <Stat value={`${area} sq ft`} label="Growing area" />
    </div>
  );
}
