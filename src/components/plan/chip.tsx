"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

// A pill toggle for filter rows (season, family, names) on the Plan views.
export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide transition-colors",
        active
          ? "border-rust bg-rust/10 text-rust"
          : "border-line text-ink-3 hover:border-ink-3 hover:text-ink-2",
      )}
    >
      {children}
    </button>
  );
}
