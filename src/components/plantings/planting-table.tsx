"use client";

import { Check, MoreHorizontal, Pencil, Trash2, TriangleAlert } from "lucide-react";

import type { Crop, Planting, PlantingStatus, Space } from "@/lib/garden/schema";
import { PLANTING_STATUS_LABELS } from "@/lib/garden/labels";
import { capacity } from "@/lib/garden/geometry";
import { projectedDates, fmtDate } from "@/lib/garden/schedule";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const HEAD = "font-mono text-xs font-semibold tracking-wide text-ink-2 uppercase";

type BadgeVariant = "default" | "growing" | "ready" | "today" | "overdue" | "done";
const STATUS_VARIANT: Record<PlantingStatus, BadgeVariant> = {
  planned: "default",
  started: "today",
  transplanted: "today",
  growing: "growing",
  harvesting: "ready",
  done: "done",
  failed: "overdue",
};

function harvestWindow(crop: Crop | undefined, startDate: string): string {
  if (!crop) return "—";
  const s = projectedDates({ startDate }, crop);
  if (!s) return "—";
  return `${fmtDate(s.firstHarvest.earliest)} – ${fmtDate(
    s.harvestEnd?.latest ?? s.firstHarvest.latest,
  )}`;
}

interface PlantingTableProps {
  plantings: Planting[];
  cropById: (id: string) => Crop | undefined;
  spaceById: (id: string) => Space | undefined;
  onEdit: (planting: Planting) => void;
  onDelete: (planting: Planting) => void;
}

export function PlantingTable({
  plantings,
  cropById,
  spaceById,
  onEdit,
  onDelete,
}: PlantingTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className={HEAD}>Crop</TableHead>
          <TableHead className={`${HEAD} hidden sm:table-cell`}>Space</TableHead>
          <TableHead className={`${HEAD} hidden md:table-cell`}>Start</TableHead>
          <TableHead className={HEAD}>Status</TableHead>
          <TableHead className={`${HEAD} hidden lg:table-cell`}>Harvest</TableHead>
          <TableHead className={`${HEAD} text-right`}>Qty</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {plantings.map((p) => {
          const crop = cropById(p.cropId);
          const space = spaceById(p.spaceId);
          const cap = crop && space ? capacity(crop, space) : null;
          const over = cap != null && p.quantity > cap;
          const needsTrellis = !!crop?.needsTrellis;
          const trellisOk = needsTrellis && !!space?.trellis;
          return (
            <TableRow key={p.id} className="group">
              <TableCell className="py-3">
                <div className="font-medium text-ink">{crop?.name ?? "—"}</div>
                {crop?.variety ? (
                  <div className="text-xs text-ink-3">{crop.variety}</div>
                ) : null}
              </TableCell>
              <TableCell className="hidden text-sm text-ink-2 sm:table-cell">
                <div className="flex items-center gap-1.5">
                  <span>{space?.name ?? "—"}</span>
                  {needsTrellis ? (
                    <span
                      className={cn(
                        "inline-flex items-center",
                        trellisOk ? "text-olive-ink" : "text-ochre-ink",
                      )}
                      title={
                        trellisOk
                          ? "Needs trellis — space has one"
                          : "Needs trellis — space has none"
                      }
                    >
                      {trellisOk ? (
                        <Check className="size-3.5" />
                      ) : (
                        <TriangleAlert className="size-3.5" />
                      )}
                      <span className="sr-only">
                        {trellisOk
                          ? "Needs trellis — space has one"
                          : "Needs trellis — space has none"}
                      </span>
                    </span>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="hidden font-mono text-sm tabular-nums text-ink-2 md:table-cell">
                {p.startDate.slice(0, 10)}
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[p.status]}>
                  {PLANTING_STATUS_LABELS[p.status]}
                </Badge>
              </TableCell>
              <TableCell className="hidden font-mono text-sm text-ink lg:table-cell">
                {harvestWindow(crop, p.startDate)}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right font-mono tabular-nums",
                  over ? "text-ochre-ink" : "text-ink",
                )}
                title={cap != null ? `capacity ~${cap}` : undefined}
              >
                {p.quantity}
                {cap != null ? `/${cap}` : ""}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 opacity-0 group-hover:opacity-100 data-[popup-open]:opacity-100"
                      />
                    }
                  >
                    <MoreHorizontal />
                    <span className="sr-only">Actions</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(p)}>
                      <Pencil /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onClick={() => onDelete(p)}>
                      <Trash2 /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
