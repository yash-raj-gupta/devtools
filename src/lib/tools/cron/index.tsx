"use client";

import cronstrue from "cronstrue";
import { useMemo, useState } from "react";
import { CopyButton, ErrorNote, FieldRow, Input } from "@/components/ui";

const PRESETS: { label: string; expr: string }[] = [
  { label: "Every minute", expr: "* * * * *" },
  { label: "Every 5 minutes", expr: "*/5 * * * *" },
  { label: "Hourly", expr: "0 * * * *" },
  { label: "Daily 9am", expr: "0 9 * * *" },
  { label: "Mon–Fri 9am", expr: "0 9 * * 1-5" },
  { label: "First of month", expr: "0 0 1 * *" },
];

export default function Component() {
  const [expr, setExpr] = useState("0 9 * * 1-5");

  const { description, error } = useMemo(() => {
    if (!expr.trim()) return { description: "", error: "" };
    try {
      return {
        description: cronstrue.toString(expr, { use24HourTimeFormat: false }),
        error: "",
      };
    } catch (e) {
      return {
        description: "",
        error: e instanceof Error ? e.message : "Invalid cron expression",
      };
    }
  }, [expr]);

  return (
    <>
      <FieldRow
        label="Cron expression"
        hint="Five-field cron (minute, hour, day-of-month, month, day-of-week)."
      >
        <Input
          mono
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          placeholder="0 9 * * 1-5"
        />
      </FieldRow>

      <ErrorNote>{error}</ErrorNote>

      {description && (
        <div className="skeuo-plate p-4 text-base font-medium tracking-tight">
          {description}
        </div>
      )}

      <FieldRow label="Common presets">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.expr}
              type="button"
              className="skeuo-btn skeuo-btn-sm"
              onClick={() => setExpr(p.expr)}
            >
              <span className="mono opacity-70">{p.expr}</span>
              <span className="opacity-90">— {p.label}</span>
            </button>
          ))}
        </div>
      </FieldRow>

      <FieldRow label="Copy expression" actions={<CopyButton value={expr} />}>
        <Input mono readOnly value={expr} />
      </FieldRow>
    </>
  );
}
