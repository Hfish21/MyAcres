"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import type { Crop, Range } from "@/lib/garden/schema";
import {
  FAMILY_LABELS,
  LIGHT_LABELS,
  PLANTING_METHOD_LABELS,
  SEASON_ABBR,
} from "@/lib/garden/labels";
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

function fmtRange(r?: Range): string {
  if (!r) return "—";
  return r.min === r.max ? String(r.min) : `${r.min}–${r.max}`;
}

const HEAD = "font-mono text-xs font-semibold tracking-wide text-ink-2 uppercase";

interface CropTableProps {
  crops: Crop[];
  onEdit: (crop: Crop) => void;
  onDelete: (crop: Crop) => void;
}

export function CropTable({ crops, onEdit, onDelete }: CropTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className={HEAD}>Crop</TableHead>
          <TableHead className={`${HEAD} hidden sm:table-cell`}>Family</TableHead>
          <TableHead className={`${HEAD} hidden md:table-cell`}>Method</TableHead>
          <TableHead className={`${HEAD} text-right`}>DTM</TableHead>
          <TableHead className={`${HEAD} hidden text-right lg:table-cell`}>Spacing</TableHead>
          <TableHead className={`${HEAD} hidden lg:table-cell`}>Light</TableHead>
          <TableHead className={`${HEAD} hidden md:table-cell`}>Season</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {crops.map((c) => (
          <TableRow key={c.id} className="group">
            <TableCell className="py-3">
              <div className="font-medium text-ink">{c.name}</div>
              {c.variety ? <div className="text-xs text-ink-3">{c.variety}</div> : null}
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              <Badge>{FAMILY_LABELS[c.family]}</Badge>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <Badge variant="done">{PLANTING_METHOD_LABELS[c.plantingMethod]}</Badge>
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums text-ink">
              {fmtRange(c.daysToMaturity)}
            </TableCell>
            <TableCell className="hidden text-right font-mono tabular-nums text-ink lg:table-cell">
              {c.spacingInRow}&quot;
            </TableCell>
            <TableCell className="hidden text-sm text-ink-2 lg:table-cell">
              {LIGHT_LABELS[c.light]}
            </TableCell>
            <TableCell className="hidden font-mono text-xs text-ink-2 md:table-cell">
              {c.season.map((s) => SEASON_ABBR[s]).join(" ")}
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
                  <DropdownMenuItem onClick={() => onEdit(c)}>
                    <Pencil /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={() => onDelete(c)}>
                    <Trash2 /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
