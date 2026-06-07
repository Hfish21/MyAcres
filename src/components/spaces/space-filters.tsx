"use client";

import { X } from "lucide-react";

import { type SpaceType } from "@/lib/garden/schema";
import { SPACE_TYPE_LABELS } from "@/lib/garden/labels";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type SpaceTypeFilter = SpaceType | "all";

const TYPES: SpaceType[] = ["bed", "row", "container", "ground", "other"];

interface SpaceFiltersProps {
  search: string;
  type: SpaceTypeFilter;
  onSearch: (value: string) => void;
  onType: (value: SpaceTypeFilter) => void;
}

export function SpaceFilters({ search, type, onSearch, onType }: SpaceFiltersProps) {
  const active = search.trim() !== "" || type !== "all";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        className="w-full sm:w-56"
        placeholder="Search spaces…"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />
      <select
        className="h-11 rounded-md border border-line bg-panel px-3 text-sm text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust"
        value={type}
        onChange={(e) => onType(e.target.value as SpaceTypeFilter)}
      >
        <option value="all">All types</option>
        {TYPES.map((t) => (
          <option key={t} value={t}>
            {SPACE_TYPE_LABELS[t]}
          </option>
        ))}
      </select>
      {active ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onSearch("");
            onType("all");
          }}
        >
          <X /> Clear
        </Button>
      ) : null}
    </div>
  );
}
