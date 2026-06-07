import { z } from "zod";

import { gardenModuleSchema } from "@/lib/garden/schema";
import {
  APP_VERSION,
  FILE_FORMAT,
  GARDEN_MODULE_VERSION,
  SCHEMA_VERSION,
} from "./constants";

// The .homestead file envelope (ADR-0008). A single JSON object: a format
// marker, a core schema version, meta, and module-namespaced data. Unknown
// modules (future namespaces) are preserved via `.passthrough()`.

export const homesteadFileSchema = z
  .object({
    fileFormat: z.literal(FILE_FORMAT),
    schemaVersion: z.string(),
    meta: z.object({
      createdAt: z.string(),
      updatedAt: z.string(),
      appVersionLastWritten: z.string(),
    }),
    modules: z.object({ garden: gardenModuleSchema.optional() }).passthrough(),
  })
  .passthrough();

export type HomesteadFile = z.infer<typeof homesteadFileSchema>;

export function createEmptyHomestead(): HomesteadFile {
  const now = new Date().toISOString();
  return {
    fileFormat: FILE_FORMAT,
    schemaVersion: SCHEMA_VERSION,
    meta: { createdAt: now, updatedAt: now, appVersionLastWritten: APP_VERSION },
    modules: {
      garden: {
        moduleVersion: GARDEN_MODULE_VERSION,
        data: { crops: [], spaces: [], plantings: [] },
      },
    },
  };
}

export type ParseResult =
  | { ok: true; file: HomesteadFile }
  | { ok: false; error: string };

function majorOf(version: string): number {
  return Number(version.split(".")[0]) || 0;
}

/**
 * Forward-only migrations keyed by schemaVersion. v1.0.0 is the floor, so this
 * is currently the identity. Add steps (e.g. `1.0.0 → 1.1.0`) here as the schema
 * grows; back up before migrating once real migrations exist (ADR-0008).
 */
function migrate(raw: unknown): unknown {
  return raw;
}

/**
 * Validate + migrate an untrusted object into a HomesteadFile. Fails loud (never
 * partially loads): the caller leaves live data untouched on `{ ok: false }`.
 */
export function parseHomesteadFile(raw: unknown): ParseResult {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, error: "This file isn't a MyAcres homestead file." };
  }
  const obj = raw as Record<string, unknown>;
  if (obj.fileFormat !== FILE_FORMAT) {
    return { ok: false, error: "This file isn't a MyAcres homestead file." };
  }
  const version = typeof obj.schemaVersion === "string" ? obj.schemaVersion : "0.0.0";
  if (majorOf(version) > majorOf(SCHEMA_VERSION)) {
    return {
      ok: false,
      error: `This file was written by a newer version of MyAcres (schema ${version}). Update the app to open it.`,
    };
  }

  const result = homesteadFileSchema.safeParse(migrate(raw));
  if (!result.success) {
    const issue = result.error.issues[0];
    const where = issue?.path.length ? issue.path.join(".") : "file";
    return {
      ok: false,
      error: `Invalid homestead file (${where}: ${issue?.message ?? "validation failed"}).`,
    };
  }
  return { ok: true, file: result.data };
}
