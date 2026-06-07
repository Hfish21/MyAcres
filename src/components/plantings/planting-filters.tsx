"use client";

import { X } from "lucide-react";

import { type PlantingStatus } from "@/lib/garden/schema";
import { PLANTING_STATUS_LABELS } from "@/lib/garden/labels";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type StatusFilter = PlantingStatus | "all";

const STATUSES: PlantingStatus[] = [
  "planned",
  "started",
  "transplanted",
  "growing",
  "harvesting",
  "done",
  "failed",
];

interface PlantingFiltersProps {
  search: string;
  status: StatusFilter;
  onSearch: (value: string) => void;
  onStatus: (value: StatusFilter) => void;
}

export function PlantingFilters({
  search,
  status,
  onSearch,
  onStatus,
}: PlantingFiltersProps) {
  const active = search.trim() !== "" || status !== "all";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        className="w-full sm:w-56"
        placeholder="Search by crop or space…"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />
      <select
        className="h-11 rounded-md border border-line bg-panel px-3 text-sm text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust"
        value={status}
        onChange={(e) => onStatus(e.target.value as StatusFilter)}
      >
        <option value="all">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {PLANTING_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      {active ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onSearch("");
            onStatus("all");
          }}
        >
          <X /> Clear
        </Button>
      ) : null}
    </div>
  );
}
