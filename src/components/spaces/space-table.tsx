"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import type { Space } from "@/lib/garden/schema";
import { SPACE_TYPE_LABELS, LIGHT_LABELS } from "@/lib/garden/labels";
import { rectDimsFromPolygon, polygonArea } from "@/lib/garden/geometry";
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

const HEAD = "font-mono text-xs font-semibold tracking-wide text-ink-2 uppercase";

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

interface SpaceTableProps {
  spaces: Space[];
  onEdit: (space: Space) => void;
  onDelete: (space: Space) => void;
}

export function SpaceTable({ spaces, onEdit, onDelete }: SpaceTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className={HEAD}>Space</TableHead>
          <TableHead className={`${HEAD} hidden sm:table-cell`}>Type</TableHead>
          <TableHead className={`${HEAD} text-right`}>Size</TableHead>
          <TableHead className={`${HEAD} hidden text-right md:table-cell`}>Area</TableHead>
          <TableHead className={`${HEAD} hidden lg:table-cell`}>Sun</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {spaces.map((s) => {
          const d = rectDimsFromPolygon(s.shape);
          return (
            <TableRow key={s.id} className="group">
              <TableCell className="py-3 font-medium text-ink">{s.name}</TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge>{SPACE_TYPE_LABELS[s.type]}</Badge>
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums text-ink">
                {round(d.length)}×{round(d.width)} ft
              </TableCell>
              <TableCell className="hidden text-right font-mono tabular-nums text-ink md:table-cell">
                {round(polygonArea(s.shape))} sq ft
              </TableCell>
              <TableCell className="hidden text-sm text-ink-2 lg:table-cell">
                {s.sun ? LIGHT_LABELS[s.sun] : "—"}
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
                    <DropdownMenuItem onClick={() => onEdit(s)}>
                      <Pencil /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onClick={() => onDelete(s)}>
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
