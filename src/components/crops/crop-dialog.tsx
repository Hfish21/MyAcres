"use client";

import * as React from "react";

import {
  cropInputSchema,
  PLANT_FAMILIES,
  SEASONS,
  type Crop,
  type CropInput,
  type PlantFamily,
  type PlantingMethod,
  type HarvestStyle,
  type LightLevel,
  type WaterLevel,
  type Season,
} from "@/lib/garden/schema";
import {
  FAMILY_LABELS,
  PLANTING_METHOD_LABELS,
  HARVEST_STYLE_LABELS,
  LIGHT_LABELS,
  WATER_LABELS,
  SEASON_LABELS,
} from "@/lib/garden/labels";
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
import { Checkbox } from "@/components/ui/checkbox";
import { RangeInput, type RangeValue } from "./range-input";
import { cn } from "@/lib/utils";

const EMPTY_RANGE: RangeValue = { min: "", max: "" };
const selectClass =
  "h-11 w-full rounded-md border border-line bg-panel px-3 text-sm text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust";

interface FormState {
  name: string;
  variety: string;
  family: PlantFamily;
  notes: string;
  plantingMethod: PlantingMethod;
  daysToGerminate: RangeValue;
  daysToTransplant: RangeValue;
  daysToMaturity: RangeValue;
  harvestStyle: HarvestStyle;
  harvestWindow: RangeValue;
  spacingInRow: string;
  spacingBetweenRows: string;
  light: LightLevel;
  season: Season[];
  tempRange: RangeValue;
  frostHardy: boolean;
  needsTrellis: boolean;
  water: WaterLevel;
  soilPh: RangeValue;
  yieldPerPlant: RangeValue;
  yieldUnit: string;
}

function toRangeValue(r?: { min: number; max: number }): RangeValue {
  return r ? { min: String(r.min), max: String(r.max) } : { ...EMPTY_RANGE };
}

function emptyForm(): FormState {
  return {
    name: "",
    variety: "",
    family: "solanaceae",
    notes: "",
    plantingMethod: "direct-sow",
    daysToGerminate: { ...EMPTY_RANGE },
    daysToTransplant: { ...EMPTY_RANGE },
    daysToMaturity: { ...EMPTY_RANGE },
    harvestStyle: "single",
    harvestWindow: { ...EMPTY_RANGE },
    spacingInRow: "",
    spacingBetweenRows: "",
    light: "full-sun",
    season: [],
    tempRange: { ...EMPTY_RANGE },
    frostHardy: false,
    needsTrellis: false,
    water: "medium",
    soilPh: { ...EMPTY_RANGE },
    yieldPerPlant: { ...EMPTY_RANGE },
    yieldUnit: "",
  };
}

function fromCrop(c: Crop): FormState {
  return {
    name: c.name,
    variety: c.variety ?? "",
    family: c.family,
    notes: c.notes ?? "",
    plantingMethod: c.plantingMethod,
    daysToGerminate: toRangeValue(c.daysToGerminate),
    daysToTransplant: toRangeValue(c.daysToTransplant),
    daysToMaturity: toRangeValue(c.daysToMaturity),
    harvestStyle: c.harvestStyle,
    harvestWindow: toRangeValue(c.harvestWindow),
    spacingInRow: String(c.spacingInRow),
    spacingBetweenRows: c.spacingBetweenRows != null ? String(c.spacingBetweenRows) : "",
    light: c.light,
    season: c.season,
    tempRange: toRangeValue(c.tempRange),
    frostHardy: c.frostHardy,
    needsTrellis: c.needsTrellis ?? false,
    water: c.water,
    soilPh: toRangeValue(c.soilPh),
    yieldPerPlant: toRangeValue(c.yieldPerPlant),
    yieldUnit: c.yieldUnit ?? "",
  };
}

function num(s: string): number | undefined {
  if (s.trim() === "") return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

function range(r: RangeValue): { min: number; max: number } | undefined {
  const min = num(r.min);
  const max = num(r.max);
  if (min === undefined && max === undefined) return undefined;
  return { min: min ?? 0, max: max ?? min ?? 0 };
}

/** A blank required range becomes {NaN,NaN} so Zod reports it instead of passing 0s. */
function requiredRange(r: RangeValue): { min: number; max: number } {
  return range(r) ?? { min: NaN, max: NaN };
}

function buildInput(form: FormState): unknown {
  return {
    name: form.name.trim(),
    variety: form.variety.trim() || undefined,
    family: form.family,
    notes: form.notes.trim() || undefined,
    plantingMethod: form.plantingMethod,
    daysToGerminate: requiredRange(form.daysToGerminate),
    daysToTransplant:
      form.plantingMethod === "transplant" ? range(form.daysToTransplant) : undefined,
    daysToMaturity: requiredRange(form.daysToMaturity),
    harvestStyle: form.harvestStyle,
    harvestWindow: range(form.harvestWindow),
    spacingInRow: num(form.spacingInRow) ?? NaN,
    spacingBetweenRows: num(form.spacingBetweenRows),
    light: form.light,
    season: form.season,
    tempRange: range(form.tempRange),
    frostHardy: form.frostHardy,
    needsTrellis: form.needsTrellis,
    water: form.water,
    soilPh: range(form.soilPh),
    yieldPerPlant: range(form.yieldPerPlant),
    yieldUnit: form.yieldUnit.trim() || undefined,
  };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-line pt-3 first:border-t-0 first:pt-0">
      <p className="mb-2 font-mono text-xs font-semibold tracking-wide text-ink-3 uppercase">
        {title}
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
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

interface CropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  crop?: Crop | null;
  onSave: (input: CropInput) => void;
}

export function CropDialog({ open, onOpenChange, crop, onSave }: CropDialogProps) {
  const [form, setForm] = React.useState<FormState>(emptyForm);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (open) {
      setForm(crop ? fromCrop(crop) : emptyForm());
      setErrors({});
    }
  }, [open, crop]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleSeason(s: Season) {
    setForm((f) => ({
      ...f,
      season: f.season.includes(s)
        ? f.season.filter((x) => x !== s)
        : [...f.season, s],
    }));
  }

  const canSubmit = form.name.trim() !== "" && form.season.length > 0;

  function handleSubmit() {
    const result = cropInputSchema.safeParse(buildInput(form));
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{crop ? "Edit crop" : "New crop"}</DialogTitle>
          <DialogDescription>A reusable profile for a produce type you grow.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <Section title="Identity">
            <Field label="Name" error={errors.name} full>
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Tomato"
              />
            </Field>
            <Field label="Variety">
              <Input
                value={form.variety}
                onChange={(e) => set("variety", e.target.value)}
                placeholder="Cherokee Purple"
              />
            </Field>
            <Field label="Family" error={errors.family}>
              <select
                className={selectClass}
                value={form.family}
                onChange={(e) => set("family", e.target.value as PlantFamily)}
              >
                {PLANT_FAMILIES.map((f) => (
                  <option key={f} value={f}>
                    {FAMILY_LABELS[f]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Notes" full>
              <textarea
                className={cn(selectClass, "h-20 resize-y py-2")}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </Field>
          </Section>

          <Section title="Lifecycle & timing">
            <Field label="Planting method">
              <select
                className={selectClass}
                value={form.plantingMethod}
                onChange={(e) => set("plantingMethod", e.target.value as PlantingMethod)}
              >
                {(["direct-sow", "transplant"] as PlantingMethod[]).map((m) => (
                  <option key={m} value={m}>
                    {PLANTING_METHOD_LABELS[m]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Harvest style">
              <select
                className={selectClass}
                value={form.harvestStyle}
                onChange={(e) => set("harvestStyle", e.target.value as HarvestStyle)}
              >
                {(["single", "continuous"] as HarvestStyle[]).map((h) => (
                  <option key={h} value={h}>
                    {HARVEST_STYLE_LABELS[h]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Days to germinate" error={errors.daysToGerminate}>
              <RangeInput
                value={form.daysToGerminate}
                onChange={(v) => set("daysToGerminate", v)}
                unit="days"
              />
            </Field>
            {form.plantingMethod === "transplant" ? (
              <Field label="Days to transplant" error={errors.daysToTransplant}>
                <RangeInput
                  value={form.daysToTransplant}
                  onChange={(v) => set("daysToTransplant", v)}
                  unit="days"
                />
              </Field>
            ) : null}
            <Field label="Days to maturity" error={errors.daysToMaturity}>
              <RangeInput
                value={form.daysToMaturity}
                onChange={(v) => set("daysToMaturity", v)}
                unit="days"
              />
            </Field>
            <Field label="Harvest window" error={errors.harvestWindow}>
              <RangeInput
                value={form.harvestWindow}
                onChange={(v) => set("harvestWindow", v)}
                unit="days"
              />
            </Field>
          </Section>

          <Section title="Spacing">
            <Field label="In-row spacing" error={errors.spacingInRow}>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  inputMode="numeric"
                  className="font-mono"
                  value={form.spacingInRow}
                  onChange={(e) => set("spacingInRow", e.target.value)}
                />
                <span className="shrink-0 text-sm text-ink-3">in</span>
              </div>
            </Field>
            <Field label="Between-row spacing" error={errors.spacingBetweenRows}>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  inputMode="numeric"
                  className="font-mono"
                  value={form.spacingBetweenRows}
                  onChange={(e) => set("spacingBetweenRows", e.target.value)}
                />
                <span className="shrink-0 text-sm text-ink-3">in</span>
              </div>
            </Field>
          </Section>

          <Section title="Requirements">
            <Field label="Light">
              <select
                className={selectClass}
                value={form.light}
                onChange={(e) => set("light", e.target.value as LightLevel)}
              >
                {(["full-sun", "part-sun", "part-shade", "shade"] as LightLevel[]).map((l) => (
                  <option key={l} value={l}>
                    {LIGHT_LABELS[l]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Water">
              <select
                className={selectClass}
                value={form.water}
                onChange={(e) => set("water", e.target.value as WaterLevel)}
              >
                {(["low", "medium", "high"] as WaterLevel[]).map((w) => (
                  <option key={w} value={w}>
                    {WATER_LABELS[w]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Season" error={errors.season} full>
              <div className="flex flex-wrap gap-4 pt-1">
                {SEASONS.map((s) => (
                  <label key={s} className="flex items-center gap-2 text-sm text-ink">
                    <Checkbox
                      checked={form.season.includes(s)}
                      onCheckedChange={() => toggleSeason(s)}
                    />
                    {SEASON_LABELS[s]}
                  </label>
                ))}
              </div>
            </Field>
            <Field label="Temp range" error={errors.tempRange}>
              <RangeInput
                value={form.tempRange}
                onChange={(v) => set("tempRange", v)}
                unit="°F"
              />
            </Field>
            <Field label="Soil pH" error={errors.soilPh}>
              <RangeInput value={form.soilPh} onChange={(v) => set("soilPh", v)} />
            </Field>
            <Field label="Frost hardy">
              <div className="flex h-11 items-center">
                <Switch
                  checked={form.frostHardy}
                  onCheckedChange={(v) => set("frostHardy", v)}
                />
              </div>
            </Field>
            <Field label="Needs a trellis">
              <label className="flex h-11 items-center gap-3 text-sm text-ink-2">
                <Switch
                  checked={form.needsTrellis}
                  onCheckedChange={(v) => set("needsTrellis", v)}
                />
                Needs vertical support
              </label>
            </Field>
          </Section>

          <Section title="Output">
            <Field label="Yield per plant" error={errors.yieldPerPlant}>
              <RangeInput
                value={form.yieldPerPlant}
                onChange={(v) => set("yieldPerPlant", v)}
              />
            </Field>
            <Field label="Yield unit">
              <Input
                value={form.yieldUnit}
                onChange={(e) => set("yieldUnit", e.target.value)}
                placeholder="lbs / count"
              />
            </Field>
          </Section>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {crop ? "Save changes" : "Create crop"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
