"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";

// Coffee dark-mode toggle (ADR-0007 §2.4). Persists the choice to localStorage;
// first-run defaults to the OS preference. The actual class is applied pre-paint
// by the inline script in layout.tsx (THEME_INIT_SCRIPT) to avoid a flash — this
// control just flips it and remembers the choice.

export const THEME_STORAGE_KEY = "myacres-theme";

// Runs before paint (injected in <head>): set .dark from saved choice, else OS pref.
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export function ThemeToggle() {
  const [dark, setDark] = React.useState(false);

  // Sync from the class the init script already set (avoids a hydration mismatch
  // on the icon — we render nothing meaningful until mounted).
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // ignore (private mode / storage disabled) — the class still flips for the session
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to coffee dark mode"}
      title={dark ? "Light mode" : "Coffee dark mode"}
      className="flex size-8 items-center justify-center rounded-md border border-transparent text-ink-2 transition-colors hover:bg-inset hover:text-ink"
    >
      {mounted && dark ? (
        <Sun className="size-4" aria-hidden />
      ) : (
        <Moon className="size-4" aria-hidden />
      )}
    </button>
  );
}
