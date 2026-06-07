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
import type { Space } from "@/lib/garden/schema";

interface SpaceDeleteDialogProps {
  space: Space | null;
  plantingCount: number;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function SpaceDeleteDialog({
  space,
  plantingCount,
  onOpenChange,
  onConfirm,
}: SpaceDeleteDialogProps) {
  return (
    <Dialog open={!!space} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete space</DialogTitle>
          <DialogDescription>
            Delete “{space?.name}”?
            {plantingCount > 0
              ? ` This also removes ${plantingCount} planting${plantingCount === 1 ? "" : "s"} in it.`
              : ""}
          </DialogDescription>
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
