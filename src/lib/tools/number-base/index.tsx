"use client";

import { useMemo, useState } from "react";
import { CopyButton, ErrorNote, FieldRow, Input, Label } from "@/components/ui";

const BASES = [
  { name: "Binary", base: 2 },
  { name: "Octal", base: 8 },
  { name: "Decimal", base: 10 },
  { name: "Hexadecimal", base: 16 },
] as const;

export default function Component() {
  const [value, setValue] = useState("42");
  const [base, setBase] = useState(10);

  const { results, error } = useMemo(() => {
    if (!value.trim()) {
      return {
        results: { 2: "", 8: "", 10: "", 16: "" } as Record<number, string>,
        error: "",
      };
    }
    try {
      const cleaned = value.replace(/^0[bxo]/i, "").replace(/_/g, "");
      const n = Number.parseInt(cleaned, base);
      if (Number.isNaN(n))
        throw new Error(`"${value}" is not a valid base-${base} number`);
      const obj: Record<number, string> = {};
      for (const { base: b } of BASES) obj[b] = n.toString(b);
      return { results: obj, error: "" };
    } catch (e) {
      return {
        results: { 2: "", 8: "", 10: "", 16: "" } as Record<number, string>,
        error: e instanceof Error ? e.message : "Parse failed",
      };
    }
  }, [value, base]);

  return (
    <>
      <FieldRow label="Number">
        <Input
          mono
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="42, 0x2a, 0b101010, 052…"
        />
      </FieldRow>

      <FieldRow label="Input base">
        <div className="flex flex-wrap gap-2">
          {BASES.map((b) => (
            <button
              key={b.base}
              type="button"
              className="skeuo-btn skeuo-btn-sm"
              data-on={base === b.base}
              onClick={() => setBase(b.base)}
              style={{
                background:
                  base === b.base
                    ? "linear-gradient(to bottom, var(--accent-hi), var(--accent) 60%, var(--accent-deep))"
                    : undefined,
                color: base === b.base ? "var(--accent-fg)" : undefined,
                borderColor: base === b.base ? "var(--accent-deep)" : undefined,
              }}
            >
              {b.name} ({b.base})
            </button>
          ))}
        </div>
      </FieldRow>

      <ErrorNote>{error}</ErrorNote>

      <div className="space-y-3">
        {BASES.map((b) => (
          <div key={b.base} className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label>
                {b.name} (base {b.base})
              </Label>
              <CopyButton value={results[b.base]} />
            </div>
            <Input
              mono
              readOnly
              value={
                b.base === 16
                  ? results[b.base].toUpperCase()
                  : results[b.base]
              }
            />
          </div>
        ))}
      </div>
    </>
  );
}
