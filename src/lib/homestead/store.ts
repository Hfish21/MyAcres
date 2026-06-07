import type { Crop, CropInput } from "@/lib/garden/schema";
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
        data: { crops: this.crops },
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

  deleteCrop(id: string): boolean {
    const i = this.crops.findIndex((c) => c.id === id);
    if (i === -1) return false;
    this.crops.splice(i, 1);
    this._notify();
    return true;
  }
}

let _store: HomesteadStore | null = null;

export function getStore(): HomesteadStore {
  return (_store ??= new HomesteadStore());
}
