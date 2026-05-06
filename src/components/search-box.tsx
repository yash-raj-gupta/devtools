"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";

export function SearchBox() {
  const [q, setQ] = useState("");

  useEffect(() => {
    const term = q.trim().toLowerCase();
    const cards = document.querySelectorAll<HTMLElement>("[data-tool-card]");
    let anyMatch = false;
    cards.forEach((el) => {
      const hay = el.dataset.haystack ?? "";
      const match = !term || hay.includes(term);
      el.style.display = match ? "" : "none";
      if (match) anyMatch = true;
    });
    document.querySelectorAll<HTMLElement>("[data-tool-section]").forEach((sec) => {
      const visible = sec.querySelector<HTMLElement>(
        '[data-tool-card]:not([style*="display: none"])',
      );
      sec.style.display = visible ? "" : "none";
    });
    const empty = document.querySelector<HTMLElement>("[data-empty-state]");
    if (empty) empty.style.display = term && !anyMatch ? "" : "none";
  }, [q]);

  return (
    <div className="relative max-w-xl">
      <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-muted)]" />
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search tools — try 'json', 'hash', 'uuid'…"
        className="h-11 w-full rounded-lg border bg-[color:var(--color-surface)] pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]/40"
      />
    </div>
  );
}
