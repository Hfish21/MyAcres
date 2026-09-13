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
import { rectDimsFromPolygon, rectPolygon } from "@/lib/garden/geometry";
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
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const selectClass =
  "h-11 w-full rounded-md border border-line bg-panel px-3 text-sm text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust";

const SPACE_TYPES: SpaceType[] = ["bed", "row", "container", "ground", "other"];
const LIGHTS: LightLevel[] = ["full-sun", "part-sun", "part-shade", "shade"];

interface FormState {
  name: string;
  type: SpaceType;
  length: string;
  width: string;
  capacityOverride: string;
  sun: LightLevel | "";
  trellis: boolean;
  notes: string;
}

function emptyForm(): FormState {
  return {
    name: "",
    type: "bed",
    length: "",
    width: "",
    capacityOverride: "",
    sun: "",
    trellis: false,
    notes: "",
  };
}

function fromSpace(s: Space): FormState {
  const dims = rectDimsFromPolygon(s.shape);
  return {
    name: s.name,
    type: s.type,
    length: String(dims.length),
    width: String(dims.width),
    capacityOverride: s.capacityOverride != null ? String(s.capacityOverride) : "",
    sun: s.sun ?? "",
    trellis: s.trellis ?? false,
    notes: s.notes ?? "",
  };
}

function num(s: string): number | undefined {
  if (s.trim() === "") return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

function Field({
  label,
  error,
  full,
  children,
}: {
  label: string;
  error?: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1", full && "sm:col-span-2")}>
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-barn">{error}</p> : null}
    </div>
  );
}

interface SpaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  space?: Space | null;
  onSave: (input: SpaceInput) => void;
}

export function SpaceDialog({ open, onOpenChange, space, onSave }: SpaceDialogProps) {
  const [form, setForm] = React.useState<FormState>(emptyForm);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (open) {
      setForm(space ? fromSpace(space) : emptyForm());
      setErrors({});
    }
  }, [open, space]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const length = num(form.length);
  const width = num(form.width);
  const previewArea =
    length && width && length > 0 && width > 0 ? length * width : null;
  const canSubmit =
    form.name.trim() !== "" && !!length && !!width && length > 0 && width > 0;

  function handleSubmit() {
    const nextErrors: Record<string, string> = {};
    if (!length || length <= 0) nextErrors.length = "Enter a length in feet";
    if (!width || width <= 0) nextErrors.width = "Enter a width in feet";
    const candidate = {
      name: form.name.trim(),
      type: form.type,
      shape: rectPolygon(length ?? 0, width ?? 0),
      capacityOverride: num(form.capacityOverride),
      sun: form.sun || undefined,
      trellis: form.trellis,
      notes: form.notes.trim() || undefined,
    };
    const result = spaceInputSchema.safeParse(candidate);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
    }
    if (!result.success || Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    onSave(result.data);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{space ? "Edit space" : "New space"}</DialogTitle>
          <DialogDescription>A bed, row, container, or patch of ground.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Name" error={errors.name} full>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="North Bed"
            />
          </Field>
          <Field label="Type">
            <select
              className={selectClass}
              value={form.type}
              onChange={(e) => set("type", e.target.value as SpaceType)}
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
              value={form.sun}
              onChange={(e) => set("sun", e.target.value as LightLevel | "")}
            >
              <option value="">—</option>
              {LIGHTS.map((l) => (
                <option key={l} value={l}>
                  {LIGHT_LABELS[l]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Length" error={errors.length}>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                inputMode="decimal"
                className="font-mono"
                value={form.length}
                onChange={(e) => set("length", e.target.value)}
              />
              <span className="shrink-0 text-sm text-ink-3">ft</span>
            </div>
          </Field>
          <Field label="Width" error={errors.width}>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                inputMode="decimal"
                className="font-mono"
                value={form.width}
                onChange={(e) => set("width", e.target.value)}
              />
              <span className="shrink-0 text-sm text-ink-3">ft</span>
            </div>
          </Field>
          <Field label="Capacity override" error={errors.capacityOverride}>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                inputMode="numeric"
                className="font-mono"
                placeholder="auto"
                value={form.capacityOverride}
                onChange={(e) => set("capacityOverride", e.target.value)}
              />
              <span className="shrink-0 text-sm text-ink-3">plants</span>
            </div>
          </Field>
          <Field label="Area" >
            <p className="flex h-11 items-center font-mono text-sm text-ink-2">
              {previewArea != null ? `${previewArea} sq ft` : "—"}
            </p>
          </Field>
          <Field label="Has trellis" full>
            <label className="flex items-center gap-3 text-sm text-ink-2">
              <Switch
                checked={form.trellis}
                onCheckedChange={(v) => set("trellis", v)}
              />
              Provides a trellis or vertical support
            </label>
          </Field>
          <Field label="Notes" full>
            <textarea
              className={cn(selectClass, "h-20 resize-y py-2")}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </Field>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {space ? "Save changes" : "Create space"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
