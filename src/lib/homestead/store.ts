import type {
  Crop,
  CropInput,
  Space,
  SpaceInput,
  Planting,
  PlantingInput,
} from "@/lib/garden/schema";
import {
  APP_VERSION,
  FILE_FORMAT,
  GARDEN_MODULE_VERSION,
  SCHEMA_VERSION,
} from "./constants";
import { createEmptyHomestead, type HomesteadFile } from "./envelope";

// In-memory store for the homestead. Crop-centric on the surface (what the UI
// wants); the namespaced .homestead envelope is wrapped/unwrapped only here.
// Mutations notify subscribers and mark the store dirty (drives autosave).

export class HomesteadStore {
  crops: Crop[] = [];
  spaces: Space[] = [];
  plantings: Planting[] = [];

  private _createdAt = new Date().toISOString();
  // Future modules / core blocks we don't understand yet — preserved verbatim
  // so opening a file in an older build never drops data (ADR-0008).
  private _unknownModules: Record<string, unknown> = {};
  private _dirty = false;
  private _listeners = new Set<() => void>();

  constructor() {
    this.load(createEmptyHomestead());
  }

  get dirty(): boolean {
    return this._dirty;
  }

  subscribe(listener: () => void): () => void {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  markClean(): void {
    this._dirty = false;
  }

  private _notify(): void {
    this._dirty = true;
    for (const fn of this._listeners) fn();
  }

  // --- load / serialize (the only places that know the envelope shape) ---

  /** Replace state from a validated file. Does not notify; the caller (provider)
   *  bumps its dataVersion after load. Leaves the store clean. */
  load(file: HomesteadFile): void {
    this.crops = file.modules.garden?.data.crops ?? [];
    this.spaces = file.modules.garden?.data.spaces ?? [];
    this.plantings = file.modules.garden?.data.plantings ?? [];
    this._createdAt = file.meta.createdAt;
    const modules = file.modules as Record<string, unknown>;
    this._unknownModules = {};
    for (const key of Object.keys(modules)) {
      if (key !== "garden") this._unknownModules[key] = modules[key];
    }
    this._dirty = false;
  }

  serialize(): HomesteadFile {
    const modules = {
      garden: {
        moduleVersion: GARDEN_MODULE_VERSION,
        data: {
          crops: this.crops,
          spaces: this.spaces,
          plantings: this.plantings,
        },
      },
      ...this._unknownModules,
    } as HomesteadFile["modules"];

    return {
      fileFormat: FILE_FORMAT,
      schemaVersion: SCHEMA_VERSION,
      meta: {
        createdAt: this._createdAt,
        updatedAt: new Date().toISOString(),
        appVersionLastWritten: APP_VERSION,
      },
      modules,
    };
  }

  clear(): void {
    this.load(createEmptyHomestead());
  }

  // --- crop CRUD ---

  cropById(id: string): Crop | undefined {
    return this.crops.find((c) => c.id === id);
  }

  addCrop(input: CropInput): Crop {
    const now = new Date().toISOString();
    const crop: Crop = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    this.crops.push(crop);
    this._notify();
    return crop;
  }

  updateCrop(id: string, input: CropInput): Crop | undefined {
    const crop = this.cropById(id);
    if (!crop) return undefined;
    Object.assign(crop, input, { updatedAt: new Date().toISOString() });
    this._notify();
    return crop;
  }

  /** Deletes a crop AND cascades to any plantings that reference it (no orphans). */
  deleteCrop(id: string): boolean {
    const i = this.crops.findIndex((c) => c.id === id);
    if (i === -1) return false;
    this.crops.splice(i, 1);
    this.plantings = this.plantings.filter((p) => p.cropId !== id);
    this._notify();
    return true;
  }

  // --- space CRUD ---

  spaceById(id: string): Space | undefined {
    return this.spaces.find((s) => s.id === id);
  }

  addSpace(input: SpaceInput): Space {
    const now = new Date().toISOString();
    const space: Space = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    this.spaces.push(space);
    this._notify();
    return space;
  }

  updateSpace(id: string, input: SpaceInput): Space | undefined {
    const space = this.spaceById(id);
    if (!space) return undefined;
    Object.assign(space, input, { updatedAt: new Date().toISOString() });
    this._notify();
    return space;
  }

  /** Deletes a space AND cascades to any plantings in it (no orphans). */
  deleteSpace(id: string): boolean {
    const i = this.spaces.findIndex((s) => s.id === id);
    if (i === -1) return false;
    this.spaces.splice(i, 1);
    this.plantings = this.plantings.filter((p) => p.spaceId !== id);
    this._notify();
    return true;
  }

  // --- planting CRUD ---

  plantingById(id: string): Planting | undefined {
    return this.plantings.find((p) => p.id === id);
  }

  plantingsForCrop(cropId: string): Planting[] {
    return this.plantings.filter((p) => p.cropId === cropId);
  }

  plantingsForSpace(spaceId: string): Planting[] {
    return this.plantings.filter((p) => p.spaceId === spaceId);
  }

  addPlanting(input: PlantingInput): Planting {
    const now = new Date().toISOString();
    const planting: Planting = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    this.plantings.push(planting);
    this._notify();
    return planting;
  }

  updatePlanting(id: string, input: PlantingInput): Planting | undefined {
    const planting = this.plantingById(id);
    if (!planting) return undefined;
    Object.assign(planting, input, { updatedAt: new Date().toISOString() });
    this._notify();
    return planting;
  }

  deletePlanting(id: string): boolean {
    const i = this.plantings.findIndex((p) => p.id === id);
    if (i === -1) return false;
    this.plantings.splice(i, 1);
    this._notify();
    return true;
  }
}

let _store: HomesteadStore | null = null;

export function getStore(): HomesteadStore {
  return (_store ??= new HomesteadStore());
}
