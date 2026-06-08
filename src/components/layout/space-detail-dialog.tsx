"use client";

import * as React from "react";

import {
  spaceInputSchema,
  type Space,
  type SpaceInput,
  type SpaceType,
  type LightLevel,
} from "@/lib/garden/schema";
import { SPACE_TYPE_LABELS, LIGHT_LABELS } from "@/lib/garden/labels";
import { polygonArea } from "@/lib/garden/geometry";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const selectClass =
  "h-11 w-full rounded-md border border-line bg-panel px-3 text-sm text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust";
const SPACE_TYPES: SpaceType[] = ["bed", "row", "container", "ground", "other"];
const LIGHTS: LightLevel[] = ["full-sun", "part-sun", "part-shade", "shade"];

function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1", full && "sm:col-span-2")}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

interface SpaceDetailDialogProps {
  space: Space | null;
  onOpenChange: (open: boolean) => void;
  onSave: (input: SpaceInput) => void;
}

export function SpaceDetailDialog({ space, onOpenChange, onSave }: SpaceDetailDialogProps) {
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<SpaceType>("bed");
  const [sun, setSun] = React.useState<LightLevel | "">("");
  const [capacityOverride, setCapacityOverride] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (space) {
      setName(space.name);
      setType(space.type);
      setSun(space.sun ?? "");
      setCapacityOverride(space.capacityOverride != null ? String(space.capacityOverride) : "");
      setNotes(space.notes ?? "");
      setError(null);
    }
  }, [space]);

  function handleSave() {
    if (!space) return;
    const co = capacityOverride.trim() === "" ? undefined : Number(capacityOverride);
    const candidate = {
      name: name.trim(),
      type,
      shape: space.shape, // shape comes from the canvas, unchanged here
      capacityOverride: co,
      sun: sun || undefined,
      notes: notes.trim() || undefined,
    };
    const result = spaceInputSchema.safeParse(candidate);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Please check the fields.");
      return;
    }
    onSave(result.data);
    onOpenChange(false);
  }

  return (
    <Dialog open={!!space} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Space details</DialogTitle>
          <DialogDescription>
            {space ? `${Math.round(polygonArea(space.shape))} sq ft` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Name" full>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="North Bed" />
          </Field>
          <Field label="Type">
            <select
              className={selectClass}
              value={type}
              onChange={(e) => setType(e.target.value as SpaceType)}
            >
              {SPACE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {SPACE_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Sun">
            <select
              className={selectClass}
              value={sun}
              onChange={(e) => setSun(e.target.value as LightLevel | "")}
            >
              <option value="">—</option>
              {LIGHTS.map((l) => (
                <option key={l} value={l}>
                  {LIGHT_LABELS[l]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Capacity override" full>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                inputMode="numeric"
                className="font-mono"
                placeholder="auto"
                value={capacityOverride}
                onChange={(e) => setCapacityOverride(e.target.value)}
              />
              <span className="shrink-0 text-sm text-ink-3">plants</span>
            </div>
          </Field>
          <Field label="Notes" full>
            <textarea
              className={cn(selectClass, "h-16 resize-y py-2")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>
        </div>

        {error ? <p className="text-xs text-barn">{error}</p> : null}

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={handleSave} disabled={name.trim() === ""}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
