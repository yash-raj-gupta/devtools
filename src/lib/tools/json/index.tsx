"use client";

import { useMemo, useState } from "react";
import {
  Button,
  CopyButton,
  ErrorNote,
  FieldRow,
  Textarea,
} from "@/components/ui";

export default function Component() {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState(2);

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      const parsed = JSON.parse(input);
      return {
        output: JSON.stringify(parsed, null, indent === 0 ? undefined : indent),
        error: "",
      };
    } catch (e) {
      return { output: "", error: e instanceof Error ? e.message : "Invalid JSON" };
    }
  }, [input, indent]);

  return (
    <>
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs uppercase tracking-wide text-[color:var(--color-muted)]">Indent</span>
        <div className="inline-flex rounded-md border bg-[color:var(--color-surface)] p-0.5">
          {[0, 2, 4].map((n) => (
            <Button
              key={n}
              variant={indent === n ? "default" : "ghost"}
              size="sm"
              onClick={() => setIndent(n)}
            >
              {n === 0 ? "Minify" : `${n} spaces`}
            </Button>
          ))}
        </div>
      </div>

      <FieldRow label="Input JSON">
        <Textarea
          className="min-h-[180px]"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='{"hello": "world", "n": 1}'
        />
      </FieldRow>

      <ErrorNote>{error}</ErrorNote>

      <FieldRow label="Formatted" actions={<CopyButton value={output} />}>
        <Textarea readOnly className="min-h-[180px]" value={output} />
      </FieldRow>
    </>
  );
}
