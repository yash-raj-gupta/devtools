"use client";

import { useMemo, useState } from "react";
import { Button, CopyButton, FieldRow, Input, Label, Textarea } from "@/components/ui";

const WORDS = (
  "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt " +
  "ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco " +
  "laboris nisi ut aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate " +
  "velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident"
).split(" ");

function word() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function sentence() {
  const len = 6 + Math.floor(Math.random() * 12);
  const arr = Array.from({ length: len }, word);
  arr[0] = arr[0].charAt(0).toUpperCase() + arr[0].slice(1);
  return arr.join(" ") + ".";
}

function paragraph() {
  const n = 3 + Math.floor(Math.random() * 5);
  return Array.from({ length: n }, sentence).join(" ");
}

export default function Component() {
  const [unit, setUnit] = useState<"paragraphs" | "sentences" | "words">("paragraphs");
  const [count, setCount] = useState(3);
  const [seed, setSeed] = useState(0);

  const text = useMemo(() => {
    void seed;
    if (unit === "paragraphs") return Array.from({ length: count }, paragraph).join("\n\n");
    if (unit === "sentences") return Array.from({ length: count }, sentence).join(" ");
    return Array.from({ length: count }, word).join(" ");
  }, [unit, count, seed]);

  return (
    <>
      <div className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1.5">
          <Label>Unit</Label>
          <div className="inline-flex rounded-md border bg-[color:var(--color-surface)] p-0.5">
            {(["paragraphs", "sentences", "words"] as const).map((u) => (
              <Button
                key={u}
                variant={unit === u ? "default" : "ghost"}
                size="sm"
                onClick={() => setUnit(u)}
              >
                {u}
              </Button>
            ))}
          </div>
        </div>
        <div className="w-28 space-y-1.5">
          <Label>Count</Label>
          <Input
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
          />
        </div>
        <Button variant="accent" onClick={() => setSeed((s) => s + 1)}>Regenerate</Button>
      </div>

      <FieldRow label="Output" actions={<CopyButton value={text} />}>
        <Textarea readOnly mono={false} className="min-h-[220px]" value={text} />
      </FieldRow>
    </>
  );
}
