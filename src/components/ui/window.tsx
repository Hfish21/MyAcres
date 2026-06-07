"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

// The "Window" — Paper Desktop's centerpiece primitive (ADR-0007 §1).
// A flat, squared panel with a title bar: the dominant motif of the whole app,
// and the visual stand-in for the shell+module architecture (each section /
// module is a window). Kept deliberately minimal (ADR-0002) — no registry, no
// nesting logic, no drag. Just what the design language needs.

type BodyPadding = "default" | "tight" | "none";

const bodyPaddingClass: Record<BodyPadding, string> = {
  default: "p-4 sm:p-6",
  tight: "p-4",
  none: "p-0",
};

interface WindowProps {
  title: string;
  /** Optional left glyph in the title bar (decorative; aria-hidden). */
  icon?: React.ReactNode;
  /** Optional count suffix in the title bar, e.g. "· 12". */
  count?: number | string;
  /** Render a real, accessible collapse control. */
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  /** Right-aligned title-bar affordances (honesty rule: only real actions). */
  titleBarActions?: React.ReactNode;
  bodyPadding?: BodyPadding;
  className?: string;
  children: React.ReactNode;
}

function Window({
  title,
  icon,
  count,
  collapsible = false,
  defaultCollapsed = false,
  titleBarActions,
  bodyPadding = "default",
  className,
  children,
}: WindowProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const titleId = React.useId();

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "flex flex-col overflow-hidden rounded-md border border-line bg-panel",
        className,
      )}
    >
      {/* Title bar — flat tan strip, mono uppercase title (the one place mono leads). */}
      <div className="flex h-10 items-center gap-2 border-b border-line bg-titlebar px-3">
        {icon ? (
          <span aria-hidden className="flex shrink-0 items-center text-ink-2 [&_svg]:size-4">
            {icon}
          </span>
        ) : null}
        <h2
          id={titleId}
          className="truncate font-mono text-sm font-semibold tracking-wide text-ink-2 uppercase"
        >
          {title}
          {count !== undefined && count !== "" ? (
            <span className="ml-1 text-ink-3">· {count}</span>
          ) : null}
        </h2>
        <div className="ml-auto flex items-center gap-1">
          {titleBarActions}
          {collapsible ? (
            <button
              type="button"
              aria-expanded={!collapsed}
              aria-label={collapsed ? "Expand" : "Collapse"}
              onClick={() => setCollapsed((c) => !c)}
              className="flex size-7 items-center justify-center rounded-sm text-ink-2 transition-colors hover:bg-inset focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust"
            >
              <ChevronDown
                className={cn(
                  "size-4 transition-transform duration-150 ease-out motion-reduce:transition-none",
                  collapsed && "-rotate-90",
                )}
              />
            </button>
          ) : null}
        </div>
      </div>

      {/* Body — animates open/closed via grid-rows (honest, reduced-motion aware). */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-150 ease-out motion-reduce:transition-none",
          collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className={cn("bg-panel", bodyPaddingClass[bodyPadding])}>{children}</div>
        </div>
      </div>
    </section>
  );
}

export { Window };
