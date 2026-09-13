"use client";

import { Pencil, Copy, ClipboardPaste, Trash2, SquarePen, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CanvasMode } from "./garden-canvas";

interface LayoutToolbarProps {
  mode: CanvasMode;
  onMode: (m: CanvasMode) => void;
  canFinish: boolean;
  onFinish: () => void;
  onCancelDraw: () => void;
  hasSelection: boolean;
  hasClipboard: boolean;
  onEdit: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDelete: () => void;
}

export function LayoutToolbar({
  mode,
  onMode,
  canFinish,
  onFinish,
  onCancelDraw,
  hasSelection,
  hasClipboard,
  onEdit,
  onCopy,
  onPaste,
  onDelete,
}: LayoutToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex overflow-hidden rounded-md border border-line">
        {(["select", "draw"] as CanvasMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onMode(m)}
            className={cn(
              "flex h-9 items-center gap-1.5 px-3 text-sm capitalize transition-colors",
              mode === m ? "bg-rust text-canvas" : "bg-panel text-ink-2 hover:bg-inset",
            )}
          >
            {m === "draw" ? <Pencil className="size-4" /> : null}
            {m}
          </button>
        ))}
      </div>

      {mode === "draw" ? (
        <>
          <Button size="sm" variant="secondary" onClick={onFinish} disabled={!canFinish}>
            <Check /> Finish
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancelDraw}>
            <X /> Cancel
          </Button>
          <span className="text-xs text-ink-3">Click the grid to drop corners; close near the first.</span>
        </>
      ) : (
        <>
          <Button size="sm" variant="secondary" onClick={onEdit} disabled={!hasSelection}>
            <SquarePen /> Edit
          </Button>
          <Button size="sm" variant="secondary" onClick={onCopy} disabled={!hasSelection}>
            <Copy /> Copy
          </Button>
          <Button size="sm" variant="secondary" onClick={onPaste} disabled={!hasClipboard}>
            <ClipboardPaste /> Paste
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete} disabled={!hasSelection}>
            <Trash2 /> Delete
          </Button>
        </>
      )}
    </div>
  );
}
