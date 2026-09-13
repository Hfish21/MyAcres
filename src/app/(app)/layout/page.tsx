"use client";

import * as React from "react";
import { Map as MapIcon } from "lucide-react";

import { useHomestead } from "@/components/homestead-provider";
import { Window } from "@/components/ui/window";
import { cropColorMap } from "@/lib/garden/colors";
import { timelineWindow } from "@/lib/garden/insights";
import { translatePolygon } from "@/lib/garden/geometry";
import type { Point, Space, SpaceInput } from "@/lib/garden/schema";
import { GardenCanvas, type CanvasMode } from "@/components/layout/garden-canvas";
import { LayoutToolbar } from "@/components/layout/layout-toolbar";
import { DateScrubber } from "@/components/layout/date-scrubber";
import { SpaceDetailDialog } from "@/components/layout/space-detail-dialog";
import { SpaceDeleteDialog } from "@/components/spaces/space-delete-dialog";

function useIsDesktop(): boolean {
  const [desktop, setDesktop] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return desktop;
}

function metaOf(s: Space): SpaceInput {
  return {
    name: s.name,
    type: s.type,
    shape: s.shape,
    capacityOverride: s.capacityOverride,
    sun: s.sun,
    notes: s.notes,
  };
}

// Feet a pasted bed is nudged (down-right) off its source, cascading further on
// each repeat paste so a run of copies fans out instead of stacking exactly.
const PASTE_OFFSET_FT = 3;

// A name that doesn't collide with an existing bed: "X copy", then "X copy 2",
// "X copy 3", …
function uniqueCopyName(base: string, existing: string[]): string {
  const taken = new Set(existing);
  let candidate = `${base} copy`;
  let n = 2;
  while (taken.has(candidate)) candidate = `${base} copy ${n++}`;
  return candidate;
}

export default function LayoutPage() {
  const { store, dataVersion } = useHomestead();

  // Fresh array refs on every change so the canvas's memos recompute.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const spaces = React.useMemo(() => [...store.spaces], [store, dataVersion]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const plantings = React.useMemo(() => [...store.plantings], [store, dataVersion]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const crops = React.useMemo(() => [...store.crops], [store, dataVersion]);

  const cropColors = React.useMemo(() => cropColorMap(crops), [crops]);
  const win = React.useMemo(() => timelineWindow(plantings, crops), [plantings, crops]);

  const editable = useIsDesktop();
  const [mode, setMode] = React.useState<CanvasMode>("select");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [draftPoints, setDraftPoints] = React.useState<Point[]>([]);
  const [asOf, setAsOf] = React.useState<Date>(new Date());
  const [editing, setEditing] = React.useState<Space | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Space | null>(null);
  // In-memory clipboard: ephemeral by design (no persistence — ADR-0002).
  const [clipboard, setClipboard] = React.useState<SpaceInput | null>(null);
  const [pasteCount, setPasteCount] = React.useState(0);

  const effectiveMode: CanvasMode = editable ? mode : "select";
  const selectedSpace = spaces.find((s) => s.id === selectedId) ?? null;

  function changeMode(m: CanvasMode) {
    setMode(m);
    if (m === "draw") setSelectedId(null);
    if (m === "select") setDraftPoints([]);
  }

  function closeDraft() {
    if (draftPoints.length >= 3) {
      const created = store.addSpace({
        name: `Space ${store.spaces.length + 1}`,
        type: "bed",
        shape: { points: draftPoints },
      });
      setSelectedId(created.id);
      setEditing(created);
    }
    setDraftPoints([]);
    setMode("select");
  }

  function moveSpace(id: string, polygon: { points: Point[] }) {
    const s = store.spaceById(id);
    if (!s) return;
    store.updateSpace(id, { ...metaOf(s), shape: polygon });
  }

  // Copy the selected space to the in-memory clipboard. Does NOT create a bed.
  const copySelected = React.useCallback(() => {
    if (!selectedSpace) return;
    setClipboard(metaOf(selectedSpace));
    setPasteCount(0);
  }, [selectedSpace]);

  // Paste a new bed from the clipboard, offset (and cascaded on repeat) so it
  // doesn't sit on top of the source; select it for immediate further edits.
  const pasteClipboard = React.useCallback(() => {
    if (!clipboard) return;
    const n = pasteCount + 1;
    const offset = PASTE_OFFSET_FT * n;
    const created = store.addSpace({
      ...clipboard,
      name: uniqueCopyName(clipboard.name, store.spaces.map((s) => s.name)),
      shape: translatePolygon(clipboard.shape, offset, offset),
    });
    setPasteCount(n);
    setSelectedId(created.id);
  }, [clipboard, pasteCount, store]);

  // Cmd/Ctrl+C copies, Cmd/Ctrl+V pastes — only on the editable Layout surface
  // in Select mode, and never while typing or with a live text selection.
  React.useEffect(() => {
    if (!editable || mode !== "select") return;
    function onKey(e: KeyboardEvent) {
      if (!(e.metaKey || e.ctrlKey) || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const key = e.key.toLowerCase();
      if (key === "c" && selectedSpace) {
        if (window.getSelection()?.toString()) return; // let native copy win
        e.preventDefault();
        copySelected();
      } else if (key === "v" && clipboard) {
        e.preventDefault();
        pasteClipboard();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editable, mode, selectedSpace, clipboard, copySelected, pasteClipboard]);

  function confirmDelete() {
    if (deleteTarget) store.deleteSpace(deleteTarget.id);
    setSelectedId(null);
    setDeleteTarget(null);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 sm:p-6">
      <Window title="Garden — Layout" icon={<MapIcon />}>
        <div className="flex flex-col gap-4">
          {editable ? (
            <LayoutToolbar
              mode={mode}
              onMode={changeMode}
              canFinish={draftPoints.length >= 3}
              onFinish={closeDraft}
              onCancelDraw={() => setDraftPoints([])}
              hasSelection={!!selectedSpace}
              hasClipboard={!!clipboard}
              onEdit={() => selectedSpace && setEditing(selectedSpace)}
              onCopy={copySelected}
              onPaste={pasteClipboard}
              onDelete={() => selectedSpace && setDeleteTarget(selectedSpace)}
            />
          ) : (
            <p className="text-xs text-ink-3">
              Viewing your garden — open on a larger screen to draw and arrange.
            </p>
          )}

          {spaces.length === 0 && draftPoints.length === 0 ? (
            <p className="text-sm text-ink-3">
              {editable
                ? "Switch to Draw and click out the corners of your first bed."
                : "No spaces drawn yet."}
            </p>
          ) : null}

          <GardenCanvas
            spaces={spaces}
            plantings={plantings}
            crops={crops}
            cropColors={cropColors}
            asOfDate={asOf}
            mode={effectiveMode}
            editable={editable}
            selectedId={selectedId}
            draftPoints={draftPoints}
            onSelect={setSelectedId}
            onAddDraftPoint={(pt) => setDraftPoints((d) => [...d, pt])}
            onCloseDraft={closeDraft}
            onMoveSpace={moveSpace}
          />

          <DateScrubber
            start={win.start}
            end={win.end}
            value={asOf}
            onChange={setAsOf}
            crops={crops.filter((c) => plantings.some((p) => p.cropId === c.id))}
            cropColors={cropColors}
          />
        </div>
      </Window>

      <SpaceDetailDialog
        space={editing}
        onOpenChange={(o) => {
          if (!o) setEditing(null);
        }}
        onSave={(input) => {
          if (editing) store.updateSpace(editing.id, input);
          setEditing(null);
        }}
      />
      <SpaceDeleteDialog
        space={deleteTarget}
        plantingCount={deleteTarget ? store.plantingsForSpace(deleteTarget.id).length : 0}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
