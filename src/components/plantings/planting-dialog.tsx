"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import {
  plantingInputSchema,
  type Crop,
  type Space,
  type Planting,
  type PlantingInput,
  type PlantingStatus,
  type PlantingEvent,
} from "@/lib/garden/schema";
import { PLANTING_STATUS_LABELS } from "@/lib/garden/labels";
import { capacity } from "@/lib/garden/geometry";
import { projectedDates, fmtDate, fmtDateRange } from "@/lib/garden/schedule";
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

const STATUSES: PlantingStatus[] = [
  "planned",
  "started",
  "transplanted",
  "growing",
  "harvesting",
  "done",
  "failed",
];

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

interface FormState {
  cropId: string;
  spaceId: string;
  startDate: string;
  quantity: string;
  status: PlantingStatus;
  notes: string;
  events: PlantingEvent[];
}

function emptyForm(): FormState {
  return {
    cropId: "",
    spaceId: "",
    startDate: todayISO(),
    quantity: "",
    status: "planned",
    notes: "",
    events: [],
  };
}

function fromPlanting(p: Planting): FormState {
  return {
    cropId: p.cropId,
    spaceId: p.spaceId,
    startDate: p.startDate.slice(0, 10),
    quantity: String(p.quantity),
    status: p.status,
    notes: p.notes ?? "",
    events: [...p.events],
  };
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

interface PlantingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planting?: Planting | null;
  crops: Crop[];
  spaces: Space[];
  onSave: (input: PlantingInput) => void;
}

export function PlantingDialog({
  open,
  onOpenChange,
  planting,
  crops,
  spaces,
  onSave,
}: PlantingDialogProps) {
  const [form, setForm] = React.useState<FormState>(emptyForm);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [checkpointNote, setCheckpointNote] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setForm(planting ? fromPlanting(planting) : emptyForm());
      setErrors({});
      setCheckpointNote("");
    }
  }, [open, planting]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const crop = crops.find((c) => c.id === form.cropId);
  const space = spaces.find((s) => s.id === form.spaceId);
  const qty = Number(form.quantity) || 0;
  const cap = crop && space ? capacity(crop, space) : null;
  const over = cap != null && qty > cap;
  const schedule = crop ? projectedDates({ startDate: form.startDate }, crop) : null;

  const canSubmit =
    form.cropId !== "" &&
    form.spaceId !== "" &&
    form.startDate !== "" &&
    qty > 0;

  function addCheckpoint() {
    const note = checkpointNote.trim();
    if (!note) return;
    setForm((f) => ({
      ...f,
      events: [...f.events, { stage: f.status, date: todayISO(), note }],
    }));
    setCheckpointNote("");
  }

  function handleSubmit() {
    const candidate = {
      cropId: form.cropId,
      spaceId: form.spaceId,
      quantity: Number(form.quantity) || NaN,
      startDate: form.startDate,
      status: form.status,
      events: form.events,
      notes: form.notes.trim() || undefined,
    };
    const result = plantingInputSchema.safeParse(candidate);
    if (!result.success) {
      const next: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    onSave(result.data);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{planting ? "Edit planting" : "New planting"}</DialogTitle>
          <DialogDescription>A crop growing in a space, from a start date.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Crop" error={errors.cropId} full>
              <select
                className={selectClass}
                value={form.cropId}
                onChange={(e) => set("cropId", e.target.value)}
              >
                <option value="">Select a crop…</option>
                {crops.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.variety ? ` — ${c.variety}` : ""}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Space" error={errors.spaceId}>
              <select
                className={selectClass}
                value={form.spaceId}
                onChange={(e) => set("spaceId", e.target.value)}
              >
                <option value="">Select a space…</option>
                {spaces.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Quantity (plants)" error={errors.quantity}>
              <Input
                type="number"
                inputMode="numeric"
                className="font-mono"
                value={form.quantity}
                onChange={(e) => set("quantity", e.target.value)}
              />
            </Field>
            <Field label="Start date" error={errors.startDate}>
              <input
                type="date"
                className={selectClass}
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
              />
            </Field>
            <Field label="Status">
              <select
                className={selectClass}
                value={form.status}
                onChange={(e) => set("status", e.target.value as PlantingStatus)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {PLANTING_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Live capacity + projected schedule */}
          {crop && space ? (
            <div className="rounded-md border border-line bg-inset/50 p-3 text-sm">
              <p className="mb-1 font-mono text-xs font-semibold tracking-wide text-ink-3 uppercase">
                Capacity
              </p>
              {cap != null ? (
                <p className={cn("font-mono", over ? "text-ochre-ink" : "text-olive-ink")}>
                  {qty || 0} of ~{cap} — {over ? "over capacity" : "fits"}
                </p>
              ) : null}
            </div>
          ) : null}

          {crop && schedule ? (
            <div className="rounded-md border border-line bg-inset/50 p-3 text-sm">
              <p className="mb-1 font-mono text-xs font-semibold tracking-wide text-ink-3 uppercase">
                Projected schedule
              </p>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-ink-2">
                <dt>Germination</dt>
                <dd className="text-ink">{fmtDateRange(schedule.germination)}</dd>
                {schedule.transplant ? (
                  <>
                    <dt>Transplant</dt>
                    <dd className="text-ink">{fmtDateRange(schedule.transplant)}</dd>
                  </>
                ) : null}
                <dt>Harvest</dt>
                <dd className="text-ink">
                  {fmtDate(schedule.firstHarvest.earliest)} –{" "}
                  {fmtDate(schedule.harvestEnd?.latest ?? schedule.firstHarvest.latest)}
                </dd>
              </dl>
            </div>
          ) : null}

          <Field label="Notes" full>
            <textarea
              className={cn(selectClass, "h-16 resize-y py-2")}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </Field>

          {/* Lifecycle checkpoints (edit mode) */}
          {planting ? (
            <div className="border-t border-line pt-3">
              <p className="mb-2 font-mono text-xs font-semibold tracking-wide text-ink-3 uppercase">
                Lifecycle log
              </p>
              {form.events.length > 0 ? (
                <ul className="mb-2 flex flex-col gap-1 text-sm">
                  {form.events.map((ev, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="font-mono text-xs text-ink-3 uppercase">
                        {PLANTING_STATUS_LABELS[ev.stage]} · {ev.date}
                      </span>
                      <span className="text-ink">{ev.note}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mb-2 text-sm text-ink-3">No checkpoints yet.</p>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder={`Note at "${PLANTING_STATUS_LABELS[form.status]}" stage…`}
                  value={checkpointNote}
                  onChange={(e) => setCheckpointNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCheckpoint();
                    }
                  }}
                />
                <Button variant="secondary" onClick={addCheckpoint} disabled={!checkpointNote.trim()}>
                  <Plus /> Log
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {planting ? "Save changes" : "Create planting"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
