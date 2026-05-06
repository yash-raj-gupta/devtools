"use client";

import { useState } from "react";
import { Button, CopyButton, FieldRow, Input, Textarea } from "@/components/ui";

function generate(n: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < n; i++) out.push(crypto.randomUUID());
  return out;
}

export default function Component() {
  const [count, setCount] = useState(5);
  const [list, setList] = useState<string[]>(() => generate(5));

  const text = list.join("\n");

  return (
    <>
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5 w-32">
          <span className="text-xs font-medium uppercase tracking-wide text-[color:var(--color-muted)]">
            How many
          </span>
          <Input
            type="number"
            min={1}
            max={1000}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
          />
        </div>
        <Button variant="accent" onClick={() => setList(generate(count))}>
          Generate
        </Button>
        <Button variant="outline" onClick={() => setList(generate(count))}>
          Regenerate
        </Button>
      </div>

      <FieldRow label="UUIDs (v4)" actions={<CopyButton value={text} />}>
        <Textarea readOnly className="min-h-[180px]" value={text} />
      </FieldRow>
    </>
  );
}
