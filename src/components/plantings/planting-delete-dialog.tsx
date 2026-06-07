"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Planting } from "@/lib/garden/schema";

interface PlantingDeleteDialogProps {
  planting: Planting | null;
  label: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function PlantingDeleteDialog({
  planting,
  label,
  onOpenChange,
  onConfirm,
}: PlantingDeleteDialogProps) {
  return (
    <Dialog open={!!planting} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete planting</DialogTitle>
          <DialogDescription>Remove the planting of {label}?</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
