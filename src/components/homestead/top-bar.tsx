import { FileControls } from "./file-controls";

// Slim top bar — wordmark + file controls. Becomes the module strip when a
// second module arrives (ADR-0005).

export function TopBar() {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-line bg-titlebar px-4">
      <span className="font-mono text-sm font-semibold tracking-wide text-ink uppercase">
        MyAcres
      </span>
      <FileControls />
    </header>
  );
}
