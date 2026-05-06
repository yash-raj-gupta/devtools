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
    document
      .querySelectorAll<HTMLElement>("[data-tool-section]")
      .forEach((sec) => {
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
      <Search
        className="size-4 absolute left-3 top-1/2 -translate-y-1/2"
        style={{ color: "var(--muted)" }}
      />
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search tools — try 'json', 'qr', 'aes'…"
        className="skeuo-input h-11 pl-9"
      />
    </div>
  );
}
