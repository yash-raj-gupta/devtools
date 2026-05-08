"use client";

import { useDeferredValue, useMemo, useState } from "react";
import {
  CopyButton,
  ErrorNote,
  FieldRow,
  Label,
  SegmentedControl,
  Textarea,
} from "@/components/ui";

type Mode = "stringify" | "parse";
type Quote = '"' | "'";

function toJsString(input: string, quote: Quote, wrap: boolean): string {
  // JSON.stringify handles all the heavy lifting (control chars, surrogate
  // pairs, unicode). For single-quote mode we swap the wrappers and re-escape
  // the inner quotes.
  const json = JSON.stringify(input);
  if (quote === '"') return wrap ? json : json.slice(1, -1);
  const inner = json
    .slice(1, -1)
    .replace(/\\"/g, '"')
    .replace(/'/g, "\\'");
  return wrap ? `'${inner}'` : inner;
}

function fromJsString(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  // If wrapped in single quotes, normalise to a JSON-parseable double-quoted
  // literal first.
  if (trimmed.startsWith("'") && trimmed.endsWith("'") && trimmed.length >= 2) {
    const inner = trimmed
      .slice(1, -1)
      .replace(/\\'/g, "'")
      .replace(/"/g, '\\"');
    return JSON.parse(`"${inner}"`);
  }

  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return JSON.parse(trimmed) as string;
  }

  // Unquoted — wrap and parse.
  return JSON.parse(`"${trimmed}"`) as string;
}

export default function Component() {
  const [mode, setMode] = useState<Mode>("stringify");
  const [input, setInput] = useState("");
  const [quote, setQuote] = useState<Quote>('"');
  const [wrap, setWrap] = useState(true);

  // Heavy work runs against the deferred value so typing stays responsive on
  // very large pastes.
  const deferred = useDeferredValue(input);

  const { output, error } = useMemo(() => {
    if (!deferred) return { output: "", error: "" };
    try {
      if (mode === "stringify") {
        return { output: toJsString(deferred, quote, wrap), error: "" };
      }
      return { output: fromJsString(deferred), error: "" };
    } catch (e) {
      return {
        output: "",
        error: e instanceof Error ? e.message : "Unable to process input.",
      };
    }
  }, [deferred, mode, quote, wrap]);

  const inputBytes = useMemo(
    () => new TextEncoder().encode(input).length,
    [input],
  );
  const outputBytes = useMemo(
    () => new TextEncoder().encode(output).length,
    [output],
  );

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl<Mode>
          value={mode}
          onChange={setMode}
          options={[
            { value: "stringify", label: "Stringify" },
            { value: "parse", label: "Parse" },
          ]}
        />
        {mode === "stringify" && (
          <>
            <SegmentedControl<Quote>
              value={quote}
              onChange={setQuote}
              options={[
                { value: '"', label: 'Double "' },
                { value: "'", label: "Single '" },
              ]}
            />
            <label className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-[color:var(--muted)]">
              <input
                type="checkbox"
                className="skeuo-check"
                checked={wrap}
                onChange={(e) => setWrap(e.target.checked)}
              />
              Wrap in quotes
            </label>
          </>
        )}
      </div>

      <FieldRow
        label={mode === "stringify" ? "Raw text" : "Quoted JS / JSON string"}
        hint={
          mode === "stringify"
            ? "Paste anything — multi-line, unicode, code, gigabytes of logs."
            : 'Paste a quoted literal like "hello\\nworld" — single quotes also work.'
        }
        actions={
          input ? (
            <span className="mono text-[11px] text-[color:var(--muted)]">
              {input.length.toLocaleString()} chars · {inputBytes.toLocaleString()} B
            </span>
          ) : null
        }
      >
        <Textarea
          className="min-h-[220px]"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            mode === "stringify"
              ? "Hello\nworld — paste any text here."
              : '"Hello\\nworld"'
          }
        />
      </FieldRow>

      <ErrorNote>{error}</ErrorNote>

      <FieldRow
        label={mode === "stringify" ? "Escaped string" : "Decoded text"}
        actions={
          <>
            {output ? (
              <span className="mono text-[11px] text-[color:var(--muted)]">
                {output.length.toLocaleString()} chars · {outputBytes.toLocaleString()} B
              </span>
            ) : null}
            <CopyButton value={output} />
          </>
        }
      >
        <Textarea readOnly className="min-h-[220px]" value={output} />
      </FieldRow>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="skeuo-panel p-3 text-center">
          <Label>Input chars</Label>
          <div className="mt-1 mono text-xl skeuo-emboss" style={{ color: "var(--fg)" }}>
            {input.length.toLocaleString()}
          </div>
        </div>
        <div className="skeuo-panel p-3 text-center">
          <Label>Input bytes</Label>
          <div className="mt-1 mono text-xl skeuo-emboss" style={{ color: "var(--fg)" }}>
            {inputBytes.toLocaleString()}
          </div>
        </div>
        <div className="skeuo-panel p-3 text-center">
          <Label>Output chars</Label>
          <div className="mt-1 mono text-xl skeuo-emboss" style={{ color: "var(--fg)" }}>
            {output.length.toLocaleString()}
          </div>
        </div>
        <div className="skeuo-panel p-3 text-center">
          <Label>Output bytes</Label>
          <div className="mt-1 mono text-xl skeuo-emboss" style={{ color: "var(--fg)" }}>
            {outputBytes.toLocaleString()}
          </div>
        </div>
      </div>
    </>
  );
}
