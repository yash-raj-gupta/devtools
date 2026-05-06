"use client";

import { useEffect, useRef, useState } from "react";
import { ErrorNote, FieldRow, Textarea } from "@/components/ui";

const FLAGS = ["g", "i", "m", "s", "u", "y"] as const;
const TIMEOUT_MS = 350;

type Match = { match: string; index: number; groups: string[] };

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default function Component() {
  const [pattern, setPattern] = useState<string>("\\b\\w+\\b");
  const [flags, setFlags] = useState<string>("g");
  const [text, setText] = useState<string>(
    "Hello world, this is a regex tester.",
  );

  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState<string>("");
  const [truncated, setTruncated] = useState<boolean>(false);

  // Each render that needs a regex run terminates the prior worker (which
  // kills any in-flight catastrophic backtracking) and spawns a fresh one.
  const workerRef = useRef<Worker | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    workerRef.current?.terminate();
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!pattern) {
      setMatches([]);
      setError("");
      setTruncated(false);
      return;
    }

    const worker = new Worker("/regex-worker.js");
    workerRef.current = worker;

    timerRef.current = setTimeout(() => {
      worker.terminate();
      workerRef.current = null;
      setMatches([]);
      setTruncated(false);
      setError(
        `Regex took longer than ${TIMEOUT_MS}ms — likely catastrophic backtracking. Simplify the pattern.`,
      );
    }, TIMEOUT_MS);

    worker.onmessage = (e: MessageEvent) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      const data = e.data as
        | { ok: true; matches: Match[]; truncated?: boolean }
        | { ok: false; error: string };
      if (data.ok) {
        setMatches(data.matches);
        setError("");
        setTruncated(Boolean(data.truncated));
      } else {
        setMatches([]);
        setTruncated(false);
        setError(data.error);
      }
      worker.terminate();
      if (workerRef.current === worker) workerRef.current = null;
    };

    worker.onerror = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setMatches([]);
      setTruncated(false);
      setError("Regex worker crashed");
      worker.terminate();
      if (workerRef.current === worker) workerRef.current = null;
    };

    worker.postMessage({ pattern, flags, text });
  }, [pattern, flags, text]);

  // Build highlighted markup from matches the worker handed back. Pre-escape
  // all text so the regex tester itself can never inject HTML — only our
  // own <mark> tags exist in the output.
  let highlighted = "";
  let last = 0;
  for (const m of matches) {
    highlighted += escapeHtml(text.slice(last, m.index));
    highlighted += `<mark class="bg-[color:var(--accent)]/25 rounded px-0.5">${escapeHtml(m.match)}</mark>`;
    last = m.index + m.match.length;
  }
  highlighted += escapeHtml(text.slice(last));

  return (
    <>
      <div className="grid sm:grid-cols-[1fr,auto] gap-2">
        <FieldRow label="Pattern">
          <div className="flex items-center gap-2 rounded-md border bg-[color:var(--surface-lo)] px-3 h-9 skeuo-inset">
            <span className="mono" style={{ color: "var(--muted)" }}>
              /
            </span>
            <input
              className="mono flex-1 bg-transparent outline-none text-sm"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              spellCheck={false}
            />
            <span className="mono" style={{ color: "var(--muted)" }}>
              /{flags}
            </span>
          </div>
        </FieldRow>
        <div className="space-y-1.5">
          <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[color:var(--muted)] skeuo-emboss">
            Flags
          </span>
          <div className="inline-flex flex-wrap gap-1">
            {FLAGS.map((f) => {
              const on = flags.includes(f);
              return (
                <label
                  key={f}
                  className="mono text-xs border rounded px-2 h-9 inline-flex items-center cursor-pointer"
                  style={
                    on
                      ? {
                          background:
                            "linear-gradient(to bottom, var(--accent-hi), var(--accent) 60%, var(--accent-deep))",
                          color: "var(--accent-fg)",
                          borderColor: "var(--accent-deep)",
                        }
                      : undefined
                  }
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={on}
                    onChange={(e) =>
                      setFlags((cur) =>
                        e.target.checked ? cur + f : cur.replace(f, ""),
                      )
                    }
                  />
                  {f}
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <ErrorNote>{error}</ErrorNote>

      <FieldRow label="Test text">
        <Textarea
          mono={false}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[120px]"
        />
      </FieldRow>

      <FieldRow
        label={`Matches (${matches.length}${truncated ? "+" : ""})`}
        hint={
          truncated
            ? "Output capped at 10,000 matches — tighten the pattern to see all of them."
            : undefined
        }
      >
        <div
          className="rounded-md border bg-[color:var(--surface-lo)] px-3 py-2.5 text-sm whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </FieldRow>

      {matches.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[color:var(--muted)] skeuo-emboss">
            Match details
          </span>
          <div className="rounded-md border divide-y">
            {matches.slice(0, 200).map((m, i) => (
              <div
                key={i}
                className="px-3 py-2 text-sm flex justify-between gap-3"
              >
                <span className="mono">{m.match}</span>
                <span
                  className="text-xs"
                  style={{ color: "var(--muted)" }}
                >
                  @{m.index}
                </span>
              </div>
            ))}
            {matches.length > 200 && (
              <div
                className="px-3 py-2 text-xs"
                style={{ color: "var(--muted)" }}
              >
                +{matches.length - 200} more not shown
              </div>
            )}
          </div>
        </div>
      )}

      <p className="text-xs" style={{ color: "var(--muted)" }}>
        Patterns run in a Web Worker with a {TIMEOUT_MS}ms timeout — runaway
        regexes are killed before they can freeze the page.
      </p>
    </>
  );
}
