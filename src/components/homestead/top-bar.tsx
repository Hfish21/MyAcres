"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { FileControls } from "./file-controls";

// Slim top bar — wordmark + module nav + file controls. The nav is the future
// module strip (ADR-0005); kept to a static list for now (ADR-0002).

const NAV = [
  { href: "/", label: "Plan" },
  { href: "/layout", label: "Layout" },
  { href: "/crops", label: "Crops" },
  { href: "/spaces", label: "Spaces" },
  { href: "/plantings", label: "Plantings" },
];

export function TopBar() {
  const pathname = usePathname();

  return (
    <header className="flex h-12 shrink-0 items-center gap-4 border-b border-line bg-titlebar px-4">
      <span className="font-mono text-sm font-semibold tracking-wide text-ink uppercase">
        MyAcres
      </span>
      <nav className="flex items-center gap-1">
        {NAV.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-2.5 py-1 text-sm transition-colors",
                active
                  ? "bg-rust/10 font-medium text-rust"
                  : "text-ink-2 hover:bg-inset",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="ml-auto">
        <FileControls />
      </div>
    </header>
  );
}
