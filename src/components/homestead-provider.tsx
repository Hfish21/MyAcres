"use client";

import * as React from "react";

import { getStore, type HomesteadStore } from "@/lib/homestead/store";
import { parseHomesteadFile } from "@/lib/homestead/envelope";
import {
  autoSave,
  loadAutoSave,
  openHomesteadFile,
  saveHomesteadFile,
} from "@/lib/homestead/file-io";

interface HomesteadContextValue {
  store: HomesteadStore;
  dirty: boolean;
  loading: boolean;
  fileLoaded: boolean;
  /** Increments on every store change — read it to re-derive from the store. */
  dataVersion: number;
  error: string | null;
  clearError: () => void;
  openFile: () => Promise<void>;
  saveFile: () => Promise<void>;
  newFile: () => void;
}

const HomesteadContext = React.createContext<HomesteadContextValue | null>(null);

export function useHomestead(): HomesteadContextValue {
  const ctx = React.useContext(HomesteadContext);
  if (!ctx) throw new Error("useHomestead must be used within a HomesteadProvider");
  return ctx;
}

export function HomesteadProvider({ children }: { children: React.ReactNode }) {
  const store = React.useMemo(() => getStore(), []);
  const [dirty, setDirty] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [fileLoaded, setFileLoaded] = React.useState(false);
  const [dataVersion, setDataVersion] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const autoSaveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Store mutations → re-render + debounced autosave.
  React.useEffect(() => {
    const unsub = store.subscribe(() => {
      setDirty(store.dirty);
      setDataVersion((n) => n + 1);
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        autoSave(store.serialize()).catch(() => {});
      }, 2000);
    });
    return () => {
      unsub();
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [store]);

  // On mount: restore autosave (validated) or start an empty homestead.
  React.useEffect(() => {
    let cancelled = false;
    loadAutoSave()
      .then((raw) => {
        if (cancelled) return;
        if (raw != null) {
          const result = parseHomesteadFile(raw);
          if (result.ok) {
            store.load(result.file);
          } else {
            // Corrupt cache — don't brick the app; start fresh.
            console.warn("Discarding invalid autosave:", result.error);
            store.clear();
          }
        } else {
          store.clear();
        }
        store.markClean();
        setDirty(false);
        setFileLoaded(true);
        setDataVersion((n) => n + 1);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [store]);

  const openFile = React.useCallback(async () => {
    setError(null);
    let raw: unknown | null;
    try {
      raw = await openHomesteadFile();
    } catch {
      setError("Couldn't read that file.");
      return;
    }
    if (raw == null) return; // user cancelled
    const result = parseHomesteadFile(raw);
    if (!result.ok) {
      setError(result.error); // fail-loud — live data untouched
      return;
    }
    store.load(result.file);
    store.markClean();
    setDirty(false);
    setFileLoaded(true);
    setDataVersion((n) => n + 1);
    autoSave(store.serialize()).catch(() => {});
  }, [store]);

  const saveFile = React.useCallback(async () => {
    setError(null);
    try {
      await saveHomesteadFile(store.serialize());
      store.markClean();
      setDirty(false);
    } catch {
      setError("Couldn't save the file.");
    }
  }, [store]);

  const newFile = React.useCallback(() => {
    if (
      store.dirty &&
      !window.confirm("Discard unsaved changes and start a new homestead?")
    ) {
      return;
    }
    store.clear();
    store.markClean();
    setDirty(false);
    setDataVersion((n) => n + 1);
    autoSave(store.serialize()).catch(() => {});
  }, [store]);

  const clearError = React.useCallback(() => setError(null), []);

  const value: HomesteadContextValue = {
    store,
    dirty,
    loading,
    fileLoaded,
    dataVersion,
    error,
    clearError,
    openFile,
    saveFile,
    newFile,
  };

  return (
    <HomesteadContext.Provider value={value}>
      {children}
    </HomesteadContext.Provider>
  );
}
