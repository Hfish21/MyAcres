"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Sprout } from "lucide-react";

import { useHomestead } from "@/components/homestead-provider";
import { Window } from "@/components/ui/window";
import { Button } from "@/components/ui/button";
import { PlantingTable } from "@/components/plantings/planting-table";
import { PlantingFilters, type StatusFilter } from "@/components/plantings/planting-filters";
import { PlantingDialog } from "@/components/plantings/planting-dialog";
import { PlantingDeleteDialog } from "@/components/plantings/planting-delete-dialog";
import type { Crop, Planting, PlantingInput, Space } from "@/lib/garden/schema";

export default function PlantingsPage() {
  const { store, dataVersion } = useHomestead();
  const allPlantings = store.plantings;
  const crops = store.crops;
  const spaces = store.spaces;

  const cropById = React.useCallback((id: string): Crop | undefined => store.cropById(id), [store]);
  const spaceById = React.useCallback((id: string): Space | undefined => store.spaceById(id), [store]);

  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<StatusFilter>("all");
  const [addOpen, setAddOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Planting | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Planting | null>(null);

  const canPlant = crops.length > 0 && spaces.length > 0;

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return allPlantings.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (q === "") return true;
      const crop = store.cropById(p.cropId);
      const space = store.spaceById(p.spaceId);
      return (
        (crop?.name ?? "").toLowerCase().includes(q) ||
        (crop?.variety ?? "").toLowerCase().includes(q) ||
        (space?.name ?? "").toLowerCase().includes(q)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPlantings, dataVersion, search, status, store]);

  function handleSave(input: PlantingInput) {
    if (editing) store.updatePlanting(editing.id, input);
    else store.addPlanting(input);
    setEditing(null);
  }

  function handleDelete() {
    if (deleteTarget) store.deletePlanting(deleteTarget.id);
    setDeleteTarget(null);
  }

  function plantingLabel(p: Planting | null): string {
    if (!p) return "";
    const crop = store.cropById(p.cropId);
    const space = store.spaceById(p.spaceId);
    return `${crop?.name ?? "crop"} in ${space?.name ?? "space"}`;
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <Window
        title="Garden — Plantings"
        icon={<Sprout />}
        count={allPlantings.length}
        bodyPadding="tight"
        titleBarActions={
          canPlant ? (
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus /> Add planting
            </Button>
          ) : undefined
        }
      >
        <div className="flex flex-col gap-4">
          {!canPlant ? (
            <div className="rounded-md border border-dashed border-line py-12 text-center text-sm text-ink-3">
              Add at least one{" "}
              <Link href="/" className="text-rust underline underline-offset-2">
                crop
              </Link>{" "}
              and one{" "}
              <Link href="/spaces" className="text-rust underline underline-offset-2">
                space
              </Link>{" "}
              before planting.
            </div>
          ) : allPlantings.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-line py-12 text-center">
              <p className="text-sm text-ink-3">No plantings yet — plant a crop in a space.</p>
              <Button size="sm" onClick={() => setAddOpen(true)}>
                <Plus /> Add planting
              </Button>
            </div>
          ) : (
            <>
              <PlantingFilters
                search={search}
                status={status}
                onSearch={setSearch}
                onStatus={setStatus}
              />
              {filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-ink-3">
                  No plantings match your filters.
                </p>
              ) : (
                <PlantingTable
                  plantings={filtered}
                  cropById={cropById}
                  spaceById={spaceById}
                  onEdit={setEditing}
                  onDelete={setDeleteTarget}
                />
              )}
            </>
          )}
        </div>
      </Window>

      <PlantingDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        crops={crops}
        spaces={spaces}
        onSave={handleSave}
      />
      <PlantingDialog
        open={!!editing}
        onOpenChange={(o) => {
          if (!o) setEditing(null);
        }}
        planting={editing}
        crops={crops}
        spaces={spaces}
        onSave={handleSave}
      />
      <PlantingDeleteDialog
        planting={deleteTarget}
        label={plantingLabel(deleteTarget)}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
