"use client";

import { diffLines } from "diff";
import { useMemo, useState } from "react";
import { FieldRow, Textarea } from "@/components/ui";

export default function Component() {
  const [a, setA] = useState("hello\nworld\nthis is fun");
  const [b, setB] = useState("hello\nworld!\nthis is fun\nand new");

  const parts = useMemo(() => diffLines(a, b), [a, b]);

  const adds = parts.filter((p) => p.added).reduce((n, p) => n + p.count!, 0);
  const dels = parts.filter((p) => p.removed).reduce((n, p) => n + p.count!, 0);

  return (
    <>
      <div className="grid sm:grid-cols-2 gap-4">
        <FieldRow label="Original (a)">
          <Textarea
            value={a}
            onChange={(e) => setA(e.target.value)}
            className="min-h-[200px]"
          />
        </FieldRow>
        <FieldRow label="Changed (b)">
          <Textarea
            value={b}
            onChange={(e) => setB(e.target.value)}
            className="min-h-[200px]"
          />
        </FieldRow>
      </div>

      <div className="flex gap-3 text-xs" style={{ color: "var(--muted)" }}>
        <span>
          <span style={{ color: "#0a8a3a", fontWeight: 600 }}>+{adds}</span> added
        </span>
        <span>
          <span style={{ color: "#c0392b", fontWeight: 600 }}>−{dels}</span> removed
        </span>
      </div>

      <FieldRow label="Diff">
        <div className="skeuo-inset p-3 mono text-sm whitespace-pre-wrap break-words leading-relaxed">
          {parts.length === 0 || (parts.length === 1 && !parts[0].added && !parts[0].removed) ? (
            <span style={{ color: "var(--muted)" }}>(identical)</span>
          ) : (
            parts.map((p, i) => (
              <span
                key={i}
                style={{
                  display: "block",
                  background: p.added
                    ? "color-mix(in srgb, #0a8a3a 18%, transparent)"
                    : p.removed
                      ? "color-mix(in srgb, #c0392b 18%, transparent)"
                      : "transparent",
                  color: p.added
                    ? "#0a6a2c"
                    : p.removed
                      ? "#9b2d20"
                      : "var(--fg)",
                  paddingLeft: "0.5rem",
                  borderLeft: p.added
                    ? "3px solid #0a8a3a"
                    : p.removed
                      ? "3px solid #c0392b"
                      : "3px solid transparent",
                }}
              >
                {(p.added ? "+ " : p.removed ? "- " : "  ") +
                  p.value.replace(/\n$/, "").replace(/\n/g, "\n  ")}
              </span>
            ))
          )}
        </div>
      </FieldRow>
    </>
  );
}
