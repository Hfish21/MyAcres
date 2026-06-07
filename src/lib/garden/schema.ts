import { z } from "zod";

import { GARDEN_MODULE_VERSION } from "@/lib/homestead/constants";

// The Crop model (ADR-0008 / agreed data model). Zod is the single source of
// truth; the TypeScript types below are derived via z.infer so they can't drift.

/** A reusable {min, max} pair used for all durations / yields. */
export const rangeSchema = z
  .object({ min: z.number(), max: z.number() })
  .refine((r) => r.max >= r.min, { message: "max must be ≥ min" });

export const PLANT_FAMILIES = [
  "solanaceae",
  "brassica",
  "cucurbit",
  "legume",
  "allium",
  "apiaceae",
  "leafy-greens",
  "other",
] as const;
export const familySchema = z.enum(PLANT_FAMILIES);

export const plantingMethodSchema = z.enum(["direct-sow", "transplant"]);
export const harvestStyleSchema = z.enum(["single", "continuous"]);
export const lightSchema = z.enum(["full-sun", "part-sun", "part-shade", "shade"]);
export const waterSchema = z.enum(["low", "medium", "high"]);

export const SEASONS = ["spring", "summer", "fall", "winter"] as const;
export const seasonSchema = z.enum(SEASONS);

export const cropSchema = z.object({
  id: z.string().uuid(),
  // identity
  name: z.string().min(1, "Name is required"),
  variety: z.string().optional(),
  family: familySchema,
  notes: z.string().optional(),
  // lifecycle & timing
  plantingMethod: plantingMethodSchema,
  daysToGerminate: rangeSchema,
  daysToTransplant: rangeSchema.optional(), // transplant method only
  daysToMaturity: rangeSchema,
  harvestStyle: harvestStyleSchema,
  harvestWindow: rangeSchema.optional(),
  // spacing (inches)
  spacingInRow: z.number().positive(),
  spacingBetweenRows: z.number().positive().optional(),
  // requirements
  light: lightSchema,
  season: z.array(seasonSchema).min(1, "Pick at least one season"),
  tempRange: rangeSchema.optional(), // °F
  frostHardy: z.boolean(),
  water: waterSchema,
  soilPh: rangeSchema.optional(),
  // output
  yieldPerPlant: rangeSchema.optional(),
  yieldUnit: z.string().optional(),
  // internal
  createdAt: z.string(),
  updatedAt: z.string(),
});

/** The editable shape (no server-managed fields) — used to validate the form. */
export const cropInputSchema = cropSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// --- Space: a growing area (ADR-0009) -------------------------------------

/** A point on the garden canvas, in feet. */
export const pointSchema = z.object({ x: z.number(), y: z.number() });
/** A space's footprint — a polygon in feet (a rectangle is 4 points). */
export const polygonSchema = z.object({ points: z.array(pointSchema).min(3) });

export const spaceTypeSchema = z.enum([
  "bed",
  "row",
  "container",
  "ground",
  "other",
]);

export const spaceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  type: spaceTypeSchema,
  shape: polygonSchema,
  capacityOverride: z.number().int().positive().optional(), // plants
  sun: lightSchema.optional(), // reuse the crop light enum
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export const spaceInputSchema = spaceSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// --- Planting: a crop growing in a space (ADR-0009) -----------------------

export const plantingStatusSchema = z.enum([
  "planned",
  "started",
  "transplanted",
  "growing",
  "harvesting",
  "done",
  "failed",
]);

/** A lifecycle checkpoint — what happened at a stage, with an optional note. */
export const plantingEventSchema = z.object({
  stage: plantingStatusSchema,
  date: z.string(),
  note: z.string().optional(),
});

export const plantingSchema = z.object({
  id: z.string().uuid(),
  cropId: z.string().uuid(),
  spaceId: z.string().uuid(),
  quantity: z.number().int().positive(),
  startDate: z.string(), // ISO date
  status: plantingStatusSchema,
  events: z.array(plantingEventSchema).default([]),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export const plantingInputSchema = plantingSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

/** The garden module's slice of the .homestead file. */
export const gardenModuleSchema = z.object({
  moduleVersion: z.string().default(GARDEN_MODULE_VERSION),
  data: z.object({
    crops: z.array(cropSchema).default([]),
    // Additive + backward-compatible: missing in older crop-only files → [].
    spaces: z.array(spaceSchema).default([]),
    plantings: z.array(plantingSchema).default([]),
  }),
});

export type Range = z.infer<typeof rangeSchema>;
export type PlantFamily = z.infer<typeof familySchema>;
export type PlantingMethod = z.infer<typeof plantingMethodSchema>;
export type HarvestStyle = z.infer<typeof harvestStyleSchema>;
export type LightLevel = z.infer<typeof lightSchema>;
export type WaterLevel = z.infer<typeof waterSchema>;
export type Season = z.infer<typeof seasonSchema>;
export type Crop = z.infer<typeof cropSchema>;
export type CropInput = z.infer<typeof cropInputSchema>;
export type Point = z.infer<typeof pointSchema>;
export type Polygon = z.infer<typeof polygonSchema>;
export type SpaceType = z.infer<typeof spaceTypeSchema>;
export type Space = z.infer<typeof spaceSchema>;
export type SpaceInput = z.infer<typeof spaceInputSchema>;
export type PlantingStatus = z.infer<typeof plantingStatusSchema>;
export type PlantingEvent = z.infer<typeof plantingEventSchema>;
export type Planting = z.infer<typeof plantingSchema>;
export type PlantingInput = z.infer<typeof plantingInputSchema>;
