"use client";

import * as React from "react";
import { Plus, Sprout } from "lucide-react";

import { useHomestead } from "@/components/homestead-provider";
import { Window } from "@/components/ui/window";
import { Button } from "@/components/ui/button";
import { CropTable } from "@/components/crops/crop-table";
import { CropFilters, type FamilyFilter } from "@/components/crops/crop-filters";
import { CropDialog } from "@/components/crops/crop-dialog";
import { CropDeleteDialog } from "@/components/crops/crop-delete-dialog";
import type { Crop, CropInput } from "@/lib/garden/schema";

// The crop library dashboard — MyAcres' first feature, and the app's home.

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-line py-12 text-center">
      <p className="text-sm text-ink-3">No crops yet — add your first crop profile.</p>
      <Button size="sm" onClick={onAdd}>
        <Plus /> Add crop
      </Button>
    </div>
  );
}

export default function HomePage() {
  const { store, dataVersion } = useHomestead();
  const allCrops = store.crops;

  const [search, setSearch] = React.useState("");
  const [family, setFamily] = React.useState<FamilyFilter>("all");
  const [addOpen, setAddOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Crop | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Crop | null>(null);

  // The store mutates its array in place (stable reference), so `dataVersion`
  // is the signal that re-derives the filtered list after a change.
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return allCrops.filter((c) => {
      const byFamily = family === "all" || c.family === family;
      const bySearch =
        q === "" ||
        c.name.toLowerCase().includes(q) ||
        (c.variety ?? "").toLowerCase().includes(q);
      return byFamily && bySearch;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allCrops, dataVersion, search, family]);

  function handleSave(input: CropInput) {
    if (editing) store.updateCrop(editing.id, input);
    else store.addCrop(input);
    setEditing(null);
  }

  function handleDelete() {
    if (deleteTarget) store.deleteCrop(deleteTarget.id);
    setDeleteTarget(null);
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <Window
        title="Garden — Crops"
        icon={<Sprout />}
        count={allCrops.length}
        bodyPadding="tight"
        titleBarActions={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus /> Add crop
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          <CropFilters
            search={search}
            family={family}
            onSearch={setSearch}
            onFamily={setFamily}
          />
          {allCrops.length === 0 ? (
            <EmptyState onAdd={() => setAddOpen(true)} />
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-3">
              No crops match your filters.
            </p>
          ) : (
            <CropTable crops={filtered} onEdit={setEditing} onDelete={setDeleteTarget} />
          )}
        </div>
      </Window>

      <CropDialog open={addOpen} onOpenChange={setAddOpen} onSave={handleSave} />
      <CropDialog
        open={!!editing}
        onOpenChange={(o) => {
          if (!o) setEditing(null);
        }}
        crop={editing}
        onSave={handleSave}
      />
      <CropDeleteDialog
        crop={deleteTarget}
        plantingCount={deleteTarget ? store.plantingsForCrop(deleteTarget.id).length : 0}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
