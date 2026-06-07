// Versioning + storage constants for the .homestead file (ADR-0008).

export const APP_VERSION = "0.1.0";

/** Core / envelope schema version (semver). */
export const SCHEMA_VERSION = "1.0.0";

/** Garden module schema version (semver), independent of the core version. */
export const GARDEN_MODULE_VERSION = "1.0.0";

export const FILE_FORMAT = "homestead" as const;
export const FILE_EXTENSION = ".homestead";

// IndexedDB autosave location.
export const IDB_NAME = "myacres";
export const IDB_STORE = "autosave";
export const IDB_KEY = "current";
