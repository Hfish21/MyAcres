"use client";

import * as React from "react";
import { Plus, Box } from "lucide-react";

import { useHomestead } from "@/components/homestead-provider";
import { Window } from "@/components/ui/window";
import { Button } from "@/components/ui/button";
import { SpaceTable } from "@/components/spaces/space-table";
import { SpaceFilters, type SpaceTypeFilter } from "@/components/spaces/space-filters";
import { SpaceDialog } from "@/components/spaces/space-dialog";
import { SpaceDeleteDialog } from "@/components/spaces/space-delete-dialog";
import type { Space, SpaceInput } from "@/lib/garden/schema";

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-line py-12 text-center">
      <p className="text-sm text-ink-3">No spaces yet — add a bed, row, or container.</p>
      <Button size="sm" onClick={onAdd}>
        <Plus /> Add space
      </Button>
    </div>
  );
}

export default function SpacesPage() {
  const { store, dataVersion } = useHomestead();
  const allSpaces = store.spaces;

  const [search, setSearch] = React.useState("");
  const [type, setType] = React.useState<SpaceTypeFilter>("all");
  const [addOpen, setAddOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Space | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Space | null>(null);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return allSpaces.filter((s) => {
      const byType = type === "all" || s.type === type;
      const bySearch = q === "" || s.name.toLowerCase().includes(q);
      return byType && bySearch;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSpaces, dataVersion, search, type]);

  function handleSave(input: SpaceInput) {
    if (editing) store.updateSpace(editing.id, input);
    else store.addSpace(input);
    setEditing(null);
  }

  function handleDelete() {
    if (deleteTarget) store.deleteSpace(deleteTarget.id);
    setDeleteTarget(null);
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <Window
        title="Garden — Spaces"
        icon={<Box />}
        count={allSpaces.length}
        bodyPadding="tight"
        titleBarActions={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus /> Add space
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          <SpaceFilters
            search={search}
            type={type}
            onSearch={setSearch}
            onType={setType}
          />
          {allSpaces.length === 0 ? (
            <EmptyState onAdd={() => setAddOpen(true)} />
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-3">
              No spaces match your filters.
            </p>
          ) : (
            <SpaceTable spaces={filtered} onEdit={setEditing} onDelete={setDeleteTarget} />
          )}
        </div>
      </Window>

      <SpaceDialog open={addOpen} onOpenChange={setAddOpen} onSave={handleSave} />
      <SpaceDialog
        open={!!editing}
        onOpenChange={(o) => {
          if (!o) setEditing(null);
        }}
        space={editing}
        onSave={handleSave}
      />
      <SpaceDeleteDialog
        space={deleteTarget}
        plantingCount={deleteTarget ? store.plantingsForSpace(deleteTarget.id).length : 0}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
