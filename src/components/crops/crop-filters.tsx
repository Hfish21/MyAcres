"use client";

import { X } from "lucide-react";

import { PLANT_FAMILIES, type PlantFamily } from "@/lib/garden/schema";
import { FAMILY_LABELS } from "@/lib/garden/labels";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type FamilyFilter = PlantFamily | "all";

interface CropFiltersProps {
  search: string;
  family: FamilyFilter;
  onSearch: (value: string) => void;
  onFamily: (value: FamilyFilter) => void;
}

export function CropFilters({ search, family, onSearch, onFamily }: CropFiltersProps) {
  const active = search.trim() !== "" || family !== "all";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        className="w-full sm:w-56"
        placeholder="Search crops…"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />
      <select
        className="h-11 rounded-md border border-line bg-panel px-3 text-sm text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust"
        value={family}
        onChange={(e) => onFamily(e.target.value as FamilyFilter)}
      >
        <option value="all">All families</option>
        {PLANT_FAMILIES.map((f) => (
          <option key={f} value={f}>
            {FAMILY_LABELS[f]}
          </option>
        ))}
      </select>
      {active ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onSearch("");
            onFamily("all");
          }}
        >
          <X /> Clear
        </Button>
      ) : null}
    </div>
  );
}
