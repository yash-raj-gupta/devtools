"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Mode = "light" | "dark" | "system";
const STORAGE_KEY = "tb-theme";

function apply(mode: Mode) {
  const root = document.documentElement;
  if (mode === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", mode);
  }
}

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as Mode | null) ?? "system";
    setMode(saved);
    setMounted(true);
  }, []);

  function cycle() {
    const next: Mode = mode === "system" ? "light" : mode === "light" ? "dark" : "system";
    setMode(next);
    localStorage.setItem(STORAGE_KEY, next);
    apply(next);
  }

  const Icon = mode === "light" ? Sun : mode === "dark" ? Moon : Laptop;
  const label = mode === "light" ? "Light" : mode === "dark" ? "Dark" : "System";

  return (
    <button
      type="button"
      onClick={cycle}
      className="skeuo-btn skeuo-btn-sm"
      title={`Theme: ${label} (click to change)`}
      aria-label={`Theme: ${label}`}
      suppressHydrationWarning
    >
      <Icon className="size-3.5" />
      <span className="hidden sm:inline">{mounted ? label : "Theme"}</span>
    </button>
  );
}
