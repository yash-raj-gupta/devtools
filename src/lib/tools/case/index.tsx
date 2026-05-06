"use client";

import { useMemo, useState } from "react";
import { CopyButton, FieldRow, Textarea } from "@/components/ui";

function tokenize(s: string): string[] {
  return s
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean);
}

function camel(t: string[]) {
  return t
    .map((w, i) =>
      i === 0
        ? w.toLowerCase()
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
    )
    .join("");
}
function pascal(t: string[]) {
  return t.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
}
function snake(t: string[]) { return t.map((w) => w.toLowerCase()).join("_"); }
function kebab(t: string[]) { return t.map((w) => w.toLowerCase()).join("-"); }
function constant(t: string[]) { return t.map((w) => w.toUpperCase()).join("_"); }
function title(t: string[]) { return t.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" "); }
function sentence(t: string[]) {
  if (t.length === 0) return "";
  const arr = t.map((w) => w.toLowerCase());
  arr[0] = arr[0].charAt(0).toUpperCase() + arr[0].slice(1);
  return arr.join(" ");
}

export default function Component() {
  const [input, setInput] = useState("");

  const tokens = useMemo(() => tokenize(input), [input]);

  const variants = [
    { label: "camelCase", value: camel(tokens) },
    { label: "PascalCase", value: pascal(tokens) },
    { label: "snake_case", value: snake(tokens) },
    { label: "kebab-case", value: kebab(tokens) },
    { label: "CONSTANT_CASE", value: constant(tokens) },
    { label: "Title Case", value: title(tokens) },
    { label: "Sentence case", value: sentence(tokens) },
    { label: "lowercase", value: input.toLowerCase() },
    { label: "UPPERCASE", value: input.toUpperCase() },
  ];

  return (
    <>
      <FieldRow label="Input">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="any text — Hello world, helloWorld, hello_world…"
        />
      </FieldRow>

      <div className="grid sm:grid-cols-2 gap-3">
        {variants.map((v) => (
          <div
            key={v.label}
            className="rounded-md border bg-[color:var(--color-surface)] p-3 space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs uppercase tracking-wide text-[color:var(--color-muted)]">
                {v.label}
              </span>
              <CopyButton value={v.value} />
            </div>
            <div className="mono text-sm break-all min-h-5">{v.value || <span className="text-[color:var(--color-muted)]">—</span>}</div>
          </div>
        ))}
      </div>
    </>
  );
}
