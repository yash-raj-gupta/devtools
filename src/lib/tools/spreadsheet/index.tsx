"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Checkbox,
  ErrorNote,
  FieldRow,
  Label,
  SegmentedControl,
  Select,
} from "@/components/ui";

type Cell = string;
type Sheet = { name: string; rows: Cell[][] };
type OutFormat = "csv" | "tsv" | "json" | "xlsx" | "html" | "pdf";

const OUT_LABEL: Record<OutFormat, string> = {
  csv: "CSV",
  tsv: "TSV",
  json: "JSON",
  xlsx: "XLSX",
  html: "HTML",
  pdf: "PDF",
};

const OUT_EXT: Record<OutFormat, string> = {
  csv: "csv",
  tsv: "tsv",
  json: "json",
  xlsx: "xlsx",
  html: "html",
  pdf: "pdf",
};

const OUT_MIME: Record<OutFormat, string> = {
  csv: "text/csv",
  tsv: "text/tab-separated-values",
  json: "application/json",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  html: "text/html",
  pdf: "application/pdf",
};

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

// ── CSV parsing (RFC 4180-ish, supports quoted fields with embedded
// delimiters and newlines). ────────────────────────────────────────────
function parseCsv(text: string, delim = ","): Cell[][] {
  const rows: Cell[][] = [];
  let row: Cell[] = [];
  let cur = "";
  let inQuote = false;
  let i = 0;
  // Strip BOM
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  while (i < text.length) {
    const ch = text[i];
    if (inQuote) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i += 2;
          continue;
        }
        inQuote = false;
        i++;
        continue;
      }
      cur += ch;
      i++;
      continue;
    }
    if (ch === '"') {
      inQuote = true;
      i++;
      continue;
    }
    if (ch === delim) {
      row.push(cur);
      cur = "";
      i++;
      continue;
    }
    if (ch === "\n" || ch === "\r") {
      row.push(cur);
      rows.push(row);
      row = [];
      cur = "";
      if (ch === "\r" && text[i + 1] === "\n") i++;
      i++;
      continue;
    }
    cur += ch;
    i++;
  }
  if (cur.length > 0 || row.length > 0) {
    row.push(cur);
    rows.push(row);
  }
  return rows;
}

function detectDelimiter(text: string): string {
  const sample = text.slice(0, 4096).split(/\r?\n/).slice(0, 20).join("\n");
  const candidates = [",", "\t", ";", "|"];
  let best = ",";
  let bestScore = -1;
  for (const d of candidates) {
    const counts = sample.split(/\r?\n/).map((l) => l.split(d).length - 1);
    if (!counts.length) continue;
    const max = Math.max(...counts);
    if (max < 1) continue;
    const consistent = counts.filter((c) => c === max).length;
    const score = max * 10 + consistent;
    if (score > bestScore) {
      bestScore = score;
      best = d;
    }
  }
  return best;
}

function csvEscape(value: string, delim: string): string {
  if (
    value.includes(delim) ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r")
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function rowsToCsv(rows: Cell[][], delim: string): string {
  return rows.map((r) => r.map((c) => csvEscape(c, delim)).join(delim)).join("\n");
}

function rowsToJson(rows: Cell[][], hasHeader: boolean): string {
  if (!rows.length) return "[]";
  if (!hasHeader) return JSON.stringify(rows, null, 2);
  const [head, ...body] = rows;
  const objs = body.map((r) => {
    const o: Record<string, string> = {};
    head.forEach((h, i) => {
      o[h || `col${i + 1}`] = r[i] ?? "";
    });
    return o;
  });
  return JSON.stringify(objs, null, 2);
}

function rowsToHtml(rows: Cell[][], hasHeader: boolean, sheetName: string): string {
  const escape = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  const head = hasHeader && rows.length ? rows[0] : null;
  const body = hasHeader ? rows.slice(1) : rows;
  return [
    "<!doctype html>",
    `<html><head><meta charset="utf-8"><title>${escape(sheetName)}</title>`,
    "<style>",
    "body{font:14px system-ui,sans-serif;margin:24px;color:#222}",
    "table{border-collapse:collapse;width:100%}",
    "th,td{border:1px solid #ccc;padding:6px 10px;text-align:left;vertical-align:top}",
    "th{background:#f4f4f4}",
    "tr:nth-child(even) td{background:#fafafa}",
    "</style></head><body>",
    `<h1>${escape(sheetName)}</h1>`,
    "<table>",
    head
      ? `<thead><tr>${head.map((h) => `<th>${escape(h)}</th>`).join("")}</tr></thead>`
      : "",
    "<tbody>",
    ...body.map(
      (r) => `<tr>${r.map((c) => `<td>${escape(c)}</td>`).join("")}</tr>`,
    ),
    "</tbody></table></body></html>",
  ].join("\n");
}

// ── Component ──────────────────────────────────────────────────────────
const PREVIEW_ROWS = 50;
const PREVIEW_COLS = 12;

export default function Component() {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [hasHeader, setHasHeader] = useState(true);
  const [out, setOut] = useState<OutFormat>("csv");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [outBlob, setOutBlob] = useState<{ url: string; size: number } | null>(
    null,
  );
  const [sourceName, setSourceName] = useState("data");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (outBlob) URL.revokeObjectURL(outBlob.url);
    };
  }, [outBlob]);

  // Drop preview output whenever input or output format changes.
  useEffect(() => {
    if (outBlob) {
      URL.revokeObjectURL(outBlob.url);
      setOutBlob(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheets, activeSheet, out, hasHeader]);

  const loadFile = useCallback(async (file: File) => {
    setError("");
    setBusy(true);
    setSourceName(file.name.replace(/\.[^.]+$/, ""));
    try {
      const lower = file.name.toLowerCase();
      const isCsv =
        file.type === "text/csv" ||
        lower.endsWith(".csv") ||
        lower.endsWith(".tsv") ||
        lower.endsWith(".txt");

      if (isCsv) {
        const text = await file.text();
        const delim = detectDelimiter(text);
        const rows = parseCsv(text, delim);
        setSheets([{ name: "Sheet1", rows }]);
        setActiveSheet(0);
      } else if (
        lower.endsWith(".xlsx") ||
        lower.endsWith(".xlsm") ||
        lower.endsWith(".xltx")
      ) {
        const ExcelJS = (await import("exceljs")).default;
        const wb = new ExcelJS.Workbook();
        const buf = await file.arrayBuffer();
        await wb.xlsx.load(buf);
        const out: Sheet[] = wb.worksheets.map((ws) => {
          const colCount = ws.columnCount || 0;
          const rowCount = ws.rowCount || 0;
          const rows: Cell[][] = [];
          for (let r = 1; r <= rowCount; r++) {
            const row = ws.getRow(r);
            const arr: Cell[] = [];
            for (let c = 1; c <= colCount; c++) {
              arr.push(cellToString(row.getCell(c).value));
            }
            // Trim trailing empties on the row.
            while (arr.length && arr[arr.length - 1] === "") arr.pop();
            rows.push(arr);
          }
          // Trim trailing fully-empty rows.
          while (rows.length && rows[rows.length - 1].every((c) => c === ""))
            rows.pop();
          return { name: ws.name || `Sheet${rows.length}`, rows };
        });
        setSheets(out.length ? out : [{ name: "Sheet1", rows: [] }]);
        setActiveSheet(0);
      } else {
        setError(
          "Unsupported file. Drop a .csv, .tsv, .xlsx, .xlsm, or .xltx — or paste CSV.",
        );
        setBusy(false);
        return;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't read that file.");
    } finally {
      setBusy(false);
    }
  }, []);

  const onPick = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) void loadFile(f);
      e.target.value = "";
    },
    [loadFile],
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const f = e.dataTransfer.files?.[0];
      if (f) void loadFile(f);
    },
    [loadFile],
  );

  const current = sheets[activeSheet];
  const previewRows = useMemo(
    () => current?.rows.slice(0, PREVIEW_ROWS) ?? [],
    [current],
  );
  const previewColCount = useMemo(
    () =>
      Math.min(
        PREVIEW_COLS,
        previewRows.reduce((m, r) => Math.max(m, r.length), 0),
      ),
    [previewRows],
  );

  const generate = useCallback(async () => {
    if (!current) return;
    setBusy(true);
    setError("");
    try {
      const filename = `${sourceName || "data"}.${OUT_EXT[out]}`;
      let blob: Blob;
      if (out === "csv") {
        blob = new Blob([rowsToCsv(current.rows, ",")], {
          type: OUT_MIME.csv,
        });
      } else if (out === "tsv") {
        blob = new Blob([rowsToCsv(current.rows, "\t")], {
          type: OUT_MIME.tsv,
        });
      } else if (out === "json") {
        blob = new Blob([rowsToJson(current.rows, hasHeader)], {
          type: OUT_MIME.json,
        });
      } else if (out === "html") {
        blob = new Blob([rowsToHtml(current.rows, hasHeader, current.name)], {
          type: OUT_MIME.html,
        });
      } else if (out === "xlsx") {
        const ExcelJS = (await import("exceljs")).default;
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet(current.name);
        current.rows.forEach((r) => ws.addRow(r));
        if (hasHeader && current.rows.length) {
          ws.getRow(1).font = { bold: true };
        }
        const buf = await wb.xlsx.writeBuffer();
        blob = new Blob([buf], { type: OUT_MIME.xlsx });
      } else {
        // pdf
        const { default: jsPDF } = await import("jspdf");
        const autoTableMod = await import("jspdf-autotable");
        const autoTable = autoTableMod.default;
        const doc = new jsPDF({
          unit: "pt",
          format: "a4",
          orientation: "landscape",
          compress: true,
        });
        const head =
          hasHeader && current.rows.length ? [current.rows[0]] : undefined;
        const body = hasHeader ? current.rows.slice(1) : current.rows;
        autoTable(doc, {
          head,
          body,
          styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
          headStyles: { fillColor: [40, 40, 40], textColor: 255 },
          margin: { top: 36, right: 24, bottom: 36, left: 24 },
        });
        blob = doc.output("blob") as Blob;
      }

      if (outBlob) URL.revokeObjectURL(outBlob.url);
      const url = URL.createObjectURL(blob);
      setOutBlob({ url, size: blob.size });

      // Trigger download.
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed.");
    } finally {
      setBusy(false);
    }
  }, [current, out, hasHeader, sourceName, outBlob]);

  return (
    <>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="skeuo-inset rounded-lg p-6 text-center cursor-pointer"
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.tsv,.txt,.xlsx,.xlsm,.xltx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          onChange={onPick}
        />
        {sheets.length ? (
          <div className="space-y-1">
            <div className="text-sm font-medium">{sourceName}</div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>
              {sheets.length} sheet{sheets.length === 1 ? "" : "s"} ·{" "}
              {sheets.reduce((n, s) => n + s.rows.length, 0)} rows total · drop
              another to replace
            </div>
          </div>
        ) : (
          <div>
            <div className="text-sm font-medium">
              Drop a CSV / TSV / XLSX here, or click to choose
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              Legacy .xls is not supported — convert it to .xlsx first.
            </div>
          </div>
        )}
      </div>

      {sheets.length > 1 && (
        <FieldRow label="Sheet">
          <Select
            value={activeSheet}
            onChange={(e) => setActiveSheet(parseInt(e.target.value, 10))}
          >
            {sheets.map((s, i) => (
              <option key={i} value={i}>
                {s.name} ({s.rows.length} rows)
              </option>
            ))}
          </Select>
        </FieldRow>
      )}

      {current && current.rows.length > 0 && (
        <FieldRow label="Preview" hint={`First ${Math.min(PREVIEW_ROWS, current.rows.length)} rows × ${previewColCount} columns`}>
          <div className="skeuo-inset rounded-md overflow-auto max-h-[320px]">
            <table className="w-full text-xs mono">
              {hasHeader && previewRows.length > 0 && (
                <thead className="sticky top-0 bg-[color:var(--surface)]">
                  <tr>
                    {previewRows[0]
                      .slice(0, previewColCount)
                      .map((h, i) => (
                        <th
                          key={i}
                          className="text-left px-2 py-1.5 border-b border-[color:var(--border)] font-semibold"
                        >
                          {h || <span style={{ color: "var(--muted)" }}>(empty)</span>}
                        </th>
                      ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {(hasHeader ? previewRows.slice(1) : previewRows).map(
                  (r, i) => (
                    <tr key={i}>
                      {Array.from({ length: previewColCount }).map((_, j) => (
                        <td
                          key={j}
                          className="px-2 py-1 border-b border-[color:var(--border)] align-top"
                          style={{
                            color: r[j] ? "var(--fg)" : "var(--muted)",
                          }}
                        >
                          {r[j] ?? ""}
                        </td>
                      ))}
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </FieldRow>
      )}

      {sheets.length > 0 && (
        <>
          <FieldRow label="Output format">
            <SegmentedControl<OutFormat>
              value={out}
              onChange={setOut}
              options={[
                { value: "csv", label: "CSV" },
                { value: "tsv", label: "TSV" },
                { value: "json", label: "JSON" },
                { value: "xlsx", label: "XLSX" },
                { value: "html", label: "HTML" },
                { value: "pdf", label: "PDF" },
              ]}
            />
          </FieldRow>

          <label className="flex items-center gap-2 text-xs">
            <Checkbox
              checked={hasHeader}
              onChange={(e) => setHasHeader(e.target.checked)}
            />
            <span style={{ color: "var(--muted)" }}>
              Treat first row as header (affects JSON keys, HTML/PDF table head)
            </span>
          </label>
        </>
      )}

      <ErrorNote>{error}</ErrorNote>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="accent"
          disabled={!current || busy}
          onClick={() => void generate()}
        >
          {busy ? "Converting…" : `Convert to ${OUT_LABEL[out]}`}
        </Button>
        {outBlob && (
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            Last output: {fmtBytes(outBlob.size)} (saved to your downloads)
          </span>
        )}
      </div>
    </>
  );
}

// ── ExcelJS cell coercion ─────────────────────────────────────────────
type RichTextValue = { richText: { text: string }[] };
type FormulaValue = { result?: unknown };
type HyperlinkValue = { text?: unknown; hyperlink?: string };

function cellToString(v: unknown): string {
  if (v == null) return "";
  if (v instanceof Date) {
    // ISO without ms for cleaner CSV output.
    return v.toISOString().replace(/\.\d{3}Z$/, "Z");
  }
  if (typeof v === "object") {
    if ("richText" in (v as object)) {
      return (v as RichTextValue).richText.map((t) => t.text).join("");
    }
    if ("result" in (v as object)) {
      return cellToString((v as FormulaValue).result);
    }
    if ("text" in (v as object)) {
      return String((v as HyperlinkValue).text ?? "");
    }
    if ("error" in (v as object)) {
      return String((v as { error: unknown }).error);
    }
  }
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  return String(v);
}
