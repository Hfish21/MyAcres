import type {
  PlantFamily,
  PlantingMethod,
  HarvestStyle,
  LightLevel,
  WaterLevel,
  Season,
} from "./schema";

// Human-readable labels for the Crop enums, shared by the table and the form so
// they stay consistent.

export const FAMILY_LABELS: Record<PlantFamily, string> = {
  solanaceae: "Solanaceae",
  brassica: "Brassica",
  cucurbit: "Cucurbit",
  legume: "Legume",
  allium: "Allium",
  apiaceae: "Apiaceae",
  "leafy-greens": "Leafy greens",
  other: "Other",
};

export const PLANTING_METHOD_LABELS: Record<PlantingMethod, string> = {
  "direct-sow": "Direct sow",
  transplant: "Transplant",
};

export const HARVEST_STYLE_LABELS: Record<HarvestStyle, string> = {
  single: "Single",
  continuous: "Continuous",
};

export const LIGHT_LABELS: Record<LightLevel, string> = {
  "full-sun": "Full sun",
  "part-sun": "Part sun",
  "part-shade": "Part shade",
  shade: "Shade",
};

export const WATER_LABELS: Record<WaterLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const SEASON_LABELS: Record<Season, string> = {
  spring: "Spring",
  summer: "Summer",
  fall: "Fall",
  winter: "Winter",
};

export const SEASON_ABBR: Record<Season, string> = {
  spring: "Sp",
  summer: "Su",
  fall: "Fa",
  winter: "Wi",
};
