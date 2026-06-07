// Clean starting slate. The Paper Desktop design system (Window, tokens, base
// components) lives in src/components — features get built into this home from
// here, one at a time. No placeholder data, no controls that do nothing.

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-6 text-center">
      <h1 className="text-3xl font-bold text-ink">MyAcres</h1>
      <p className="mt-2 max-w-xs text-sm text-ink-3">
        Your homestead, in one place.
      </p>
    </main>
  );
}
