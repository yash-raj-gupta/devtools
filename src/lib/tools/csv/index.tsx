"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  ErrorNote,
  FieldRow,
  SegmentedControl,
  Textarea,
} from "@/components/ui";

function parseCsv(input: string): string[][] {
  const out: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (inQuotes) {
      if (c === '"') {
        if (input[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += c;
      }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") {
        row.push(cur);
        cur = "";
      } else if (c === "\n" || c === "\r") {
        if (c === "\r" && input[i + 1] === "\n") i++;
        row.push(cur);
        cur = "";
        out.push(row);
        row = [];
      } else {
        cur += c;
      }
    }
  }
  if (cur || row.length) {
    row.push(cur);
    out.push(row);
  }
  return out.filter((r) => !(r.length === 1 && r[0] === ""));
}

function csvField(s: string) {
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function jsonToCsv(json: unknown): string {
  if (!Array.isArray(json)) throw new Error("Expected an array of objects");
  if (json.length === 0) return "";
  const headers = Array.from(
    new Set(json.flatMap((row) => Object.keys(row as Record<string, unknown>))),
  );
  const rows = json.map((r) =>
    headers
      .map((h) => {
        const v = (r as Record<string, unknown>)[h];
        if (v === null || v === undefined) return "";
        if (typeof v === "object") return csvField(JSON.stringify(v));
        return csvField(String(v));
      })
      .join(","),
  );
  return [headers.map(csvField).join(","), ...rows].join("\n");
}

function csvToJson(input: string) {
  const rows = parseCsv(input);
  if (rows.length === 0) return [];
  const [headers, ...rest] = rows;
  return rest.map((r) =>
    Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ""])),
  );
}

export default function Component() {
  const [mode, setMode] = useState<"c2j" | "j2c">("c2j");
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      return {
        output:
          mode === "c2j"
            ? JSON.stringify(csvToJson(input), null, 2)
            : jsonToCsv(JSON.parse(input)),
        error: "",
      };
    } catch (e) {
      return { output: "", error: e instanceof Error ? e.message : "Parse failed" };
    }
  }, [input, mode]);

  return (
    <>
      <SegmentedControl
        value={mode}
        onChange={setMode}
        options={[
          { value: "c2j", label: "CSV → JSON" },
          { value: "j2c", label: "JSON → CSV" },
        ]}
      />

      <FieldRow label={mode === "c2j" ? "CSV" : "JSON (array of objects)"}>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            mode === "c2j"
              ? "name,age\nAlice,30\nBob,25"
              : '[{"name":"Alice","age":30}]'
          }
          className="min-h-[180px]"
        />
      </FieldRow>

      <ErrorNote>{error}</ErrorNote>

      <FieldRow label="Result" actions={<CopyButton value={output} />}>
        <Textarea readOnly value={output} className="min-h-[180px]" />
      </FieldRow>

      <p className="text-xs" style={{ color: "var(--muted)" }}>
        Headers are inferred from the first row (CSV) or the union of object
        keys (JSON). Quoted fields with commas, newlines and escaped quotes are
        handled.
      </p>
    </>
  );
}
