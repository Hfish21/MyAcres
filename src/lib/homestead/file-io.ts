import type { HomesteadFile } from "./envelope";
import { FILE_EXTENSION, IDB_KEY, IDB_NAME, IDB_STORE } from "./constants";

// Portable-file I/O for the .homestead file (ADR-0003). File System Access API
// where available, with a download / <input type=file> fallback. Plus an
// IndexedDB autosave so work isn't lost between sessions.

function suggestedName(): string {
  return `myacres-${new Date().toISOString().slice(0, 10)}${FILE_EXTENSION}`;
}

const PICKER_TYPES = [
  {
    description: "MyAcres Homestead File",
    accept: { "application/json": [FILE_EXTENSION, ".json"] },
  },
];

interface SaveFilePickerWindow {
  showSaveFilePicker: (opts: unknown) => Promise<{
    createWritable: () => Promise<{
      write: (data: Blob) => Promise<void>;
      close: () => Promise<void>;
    }>;
  }>;
}

interface OpenFilePickerWindow {
  showOpenFilePicker: (opts: unknown) => Promise<
    Array<{ getFile: () => Promise<File> }>
  >;
}

/** Save the serialized homestead to a file the user picks (or downloads). */
export async function saveHomesteadFile(data: HomesteadFile): Promise<void> {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });

  if ("showSaveFilePicker" in window) {
    try {
      const handle = await (window as unknown as SaveFilePickerWindow).showSaveFilePicker({
        suggestedName: suggestedName(),
        types: PICKER_TYPES,
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      // fall through to download
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = suggestedName();
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Open a file and return the raw parsed JSON (unknown). Validation happens in
 * the provider via Zod — this function never trusts the contents.
 * Returns null if the user cancels.
 */
export async function openHomesteadFile(): Promise<unknown | null> {
  if ("showOpenFilePicker" in window) {
    try {
      const [handle] = await (window as unknown as OpenFilePickerWindow).showOpenFilePicker({
        types: PICKER_TYPES,
        multiple: false,
      });
      const file = await handle.getFile();
      return JSON.parse(await file.text());
    } catch (e) {
      if ((e as Error).name === "AbortError") return null;
      throw e;
    }
  }

  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = `${FILE_EXTENSION},.json`;
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      try {
        resolve(JSON.parse(await file.text()));
      } catch (e) {
        reject(e);
      }
    };
    input.click();
  });
}

// --- IndexedDB autosave ---------------------------------------------------

function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function autoSave(data: HomesteadFile): Promise<void> {
  const db = await openIDB();
  const tx = db.transaction(IDB_STORE, "readwrite");
  tx.objectStore(IDB_STORE).put(data, IDB_KEY);
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function loadAutoSave(): Promise<unknown | null> {
  try {
    const db = await openIDB();
    const tx = db.transaction(IDB_STORE, "readonly");
    const req = tx.objectStore(IDB_STORE).get(IDB_KEY);
    const result = await new Promise<unknown | null>((resolve, reject) => {
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return result;
  } catch {
    return null;
  }
}
