"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarDays, Clock, Grid3x3, Scale, Sprout } from "lucide-react";

import { useHomestead } from "@/components/homestead-provider";
import { Window } from "@/components/ui/window";
import { PlanSummary } from "@/components/plan/plan-summary";
import { UpNext } from "@/components/plan/up-next";
import { HarvestCoverage } from "@/components/plan/harvest-coverage";
import { GardenTimeline } from "@/components/plan/garden-timeline";
import { CropCoverageGrid } from "@/components/plan/crop-coverage-grid";
import { FoodProduction } from "@/components/plan/food-production";
import { SpaceUtilization } from "@/components/plan/space-utilization";

// The Plan view — the app's home. A visual, derived overview of the garden over
// time: what's planted, when each thing happens, and where the supply gaps are.
// Read-only (visualize, don't prescribe).

export default function PlanPage() {
  const { store } = useHomestead();
  const plantings = store.plantings;
  const crops = store.crops;
  const spaces = store.spaces;

  // Shared month selection: the harvest-coverage strip and the crop grid set it;
  // the timeline draws a marker line at the selected month. null = none.
  const [selectedMonth, setSelectedMonth] = React.useState<string | null>(null);

  if (plantings.length === 0) {
    return (
      <div className="mx-auto max-w-5xl p-4 sm:p-6">
        <Window title="Garden — Plan" icon={<Sprout />}>
          <div className="rounded-md border border-dashed border-line py-12 text-center text-sm text-ink-3">
            Your garden plan appears here once you have plantings. Add{" "}
            <Link href="/plantings" className="text-rust underline underline-offset-2">
              a planting
            </Link>{" "}
            to begin.
          </div>
        </Window>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 sm:p-6">
      <PlanSummary plantings={plantings} crops={crops} spaces={spaces} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Window title="Garden — Up Next" icon={<Clock />}>
          <UpNext plantings={plantings} crops={crops} spaces={spaces} />
        </Window>
        <Window title="Garden — Harvest Coverage" icon={<CalendarDays />}>
          <HarvestCoverage
            plantings={plantings}
            crops={crops}
            spaces={spaces}
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
          />
        </Window>
      </div>

      <Window title="Garden — Timeline" icon={<Sprout />} bodyPadding="tight">
        <GardenTimeline
          plantings={plantings}
          crops={crops}
          spaces={spaces}
          selectedMonth={selectedMonth}
        />
      </Window>

      <Window title="Garden — Food Production" icon={<Scale />} bodyPadding="tight">
        <FoodProduction plantings={plantings} crops={crops} />
      </Window>

      <Window title="Garden — Harvest by Crop" icon={<Grid3x3 />} bodyPadding="tight">
        <CropCoverageGrid
          plantings={plantings}
          crops={crops}
          selectedMonth={selectedMonth}
          onSelectMonth={setSelectedMonth}
        />
      </Window>

      <Window title="Garden — Space Utilization" icon={<Sprout />} bodyPadding="tight">
        <SpaceUtilization plantings={plantings} crops={crops} spaces={spaces} />
      </Window>
    </div>
  );
}
