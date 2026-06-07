"use client";

import type { Crop, Planting, Space } from "@/lib/garden/schema";
import {
  upcomingMilestones,
  MILESTONE_LABELS,
  type MilestoneKind,
} from "@/lib/garden/insights";
import { fmtDate } from "@/lib/garden/schedule";
import { Badge } from "@/components/ui/badge";

type BadgeVariant = "today" | "growing" | "ready";
const KIND_VARIANT: Record<MilestoneKind, BadgeVariant> = {
  sow: "today",
  transplant: "growing",
  harvest: "ready",
};

interface UpNextProps {
  plantings: Planting[];
  crops: Crop[];
  spaces: Space[];
  limit?: number;
}

export function UpNext({ plantings, crops, spaces, limit = 8 }: UpNextProps) {
  const spaceById = new Map(spaces.map((s) => [s.id, s]));
  const milestones = upcomingMilestones(plantings, crops).slice(0, limit);

  if (milestones.length === 0) {
    return <p className="py-6 text-center text-sm text-ink-3">Nothing coming up.</p>;
  }

  return (
    <ul className="flex flex-col">
      {milestones.map((m, i) => {
        const space = spaceById.get(m.planting.spaceId);
        return (
          <li
            key={i}
            className="flex items-center gap-3 border-b border-line/50 py-2 last:border-b-0"
          >
            <span className="w-12 shrink-0 font-mono text-xs tabular-nums text-ink-2">
              {fmtDate(m.date)}
            </span>
            <Badge variant={m.overdue ? "overdue" : KIND_VARIANT[m.kind]}>
              {MILESTONE_LABELS[m.kind]}
            </Badge>
            <span className="truncate text-sm text-ink">
              {m.crop.name}
              {m.crop.variety ? <span className="text-ink-3"> · {m.crop.variety}</span> : null}
            </span>
            <span className="ml-auto shrink-0 truncate text-xs text-ink-3">
              {space?.name}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
