"use client";

import { FilePlus2, FolderOpen, Save } from "lucide-react";

import { useHomestead } from "@/components/homestead-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// New / Open / Save the portable .homestead file, plus a Saved/Unsaved chip.

export function FileControls() {
  const { dirty, openFile, saveFile, newFile } = useHomestead();

  return (
    <div className="flex items-center gap-1.5">
      <Badge variant={dirty ? "warning" : "done"}>{dirty ? "Unsaved" : "Saved"}</Badge>
      <Button variant="ghost" size="icon" onClick={newFile} title="New homestead" className="size-9">
        <FilePlus2 />
        <span className="sr-only">New homestead</span>
      </Button>
      <Button variant="ghost" size="icon" onClick={openFile} title="Open .homestead file" className="size-9">
        <FolderOpen />
        <span className="sr-only">Open file</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={saveFile}
        title={dirty ? "Save file (unsaved changes)" : "Save file"}
        className={cn("size-9", dirty && "text-rust")}
      >
        <Save />
        <span className="sr-only">Save file</span>
      </Button>
    </div>
  );
}
