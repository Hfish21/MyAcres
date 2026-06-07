"use client";

import { useHomestead } from "@/components/homestead-provider";
import { TopBar } from "./top-bar";

// App chrome: a brief load gate, the top bar, a fail-loud error banner, and the
// page. No welcome/wizard screen — the app autostarts an empty homestead.

export function AppShell({ children }: { children: React.ReactNode }) {
  const { loading, error, clearError } = useHomestead();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-canvas">
        <div className="size-6 animate-spin rounded-full border-2 border-line border-t-rust" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <TopBar />
      {error ? (
        <div className="flex items-center justify-between gap-3 border-b border-barn/30 bg-barn/10 px-4 py-2 text-sm text-barn">
          <span>{error}</span>
          <button onClick={clearError} className="shrink-0 underline underline-offset-2">
            Dismiss
          </button>
        </div>
      ) : null}
      <main className="flex-1">{children}</main>
    </div>
  );
}
