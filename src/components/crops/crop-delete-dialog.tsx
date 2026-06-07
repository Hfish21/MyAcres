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
import type { Crop } from "@/lib/garden/schema";

interface CropDeleteDialogProps {
  crop: Crop | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function CropDeleteDialog({ crop, onOpenChange, onConfirm }: CropDeleteDialogProps) {
  const label = crop ? `${crop.name}${crop.variety ? ` — ${crop.variety}` : ""}` : "";

  return (
    <Dialog open={!!crop} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete crop</DialogTitle>
          <DialogDescription>
            Delete “{label}”? This removes the crop profile.
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
