"use client";

import { useMemo, useState } from "react";
import { ErrorNote, FieldRow, Input, Textarea } from "@/components/ui";

const FLAGS = ["g", "i", "m", "s", "u", "y"] as const;

export default function Component() {
  const [pattern, setPattern] = useState<string>("\\b\\w+\\b");
  const [flags, setFlags] = useState<string>("g");
  const [text, setText] = useState<string>("Hello world, this is a regex tester.");

  const { matches, error, highlighted } = useMemo(() => {
    if (!pattern) return { matches: [], error: "", highlighted: text };
    try {
      const re = new RegExp(pattern, flags);
      const arr: { match: string; index: number; groups?: string[] }[] = [];
      if (flags.includes("g")) {
        for (const m of text.matchAll(re)) {
          arr.push({ match: m[0], index: m.index ?? 0, groups: m.slice(1) });
        }
      } else {
        const m = text.match(re);
        if (m) arr.push({ match: m[0], index: m.index ?? 0, groups: m.slice(1) });
      }

      // Build highlighted text
      let html = "";
      let last = 0;
      for (const m of arr) {
        html += escapeHtml(text.slice(last, m.index));
        html += `<mark class="bg-[color:var(--color-accent)]/20 rounded px-0.5">${escapeHtml(m.match)}</mark>`;
        last = m.index + m.match.length;
      }
      html += escapeHtml(text.slice(last));

      return { matches: arr, error: "", highlighted: html };
    } catch (e) {
      return { matches: [], error: e instanceof Error ? e.message : "Invalid regex", highlighted: escapeHtml(text) };
    }
  }, [pattern, flags, text]);

  return (
    <>
      <div className="grid sm:grid-cols-[1fr,auto] gap-2">
        <FieldRow label="Pattern">
          <div className="flex items-center gap-2 rounded-md border bg-[color:var(--color-surface)] px-3 h-9">
            <span className="text-[color:var(--color-muted)] mono">/</span>
            <input
              className="mono flex-1 bg-transparent outline-none text-sm"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              spellCheck={false}
            />
            <span className="text-[color:var(--color-muted)] mono">/{flags}</span>
          </div>
        </FieldRow>
        <div className="space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-[color:var(--color-muted)]">Flags</span>
          <div className="inline-flex flex-wrap gap-1">
            {FLAGS.map((f) => (
              <label
                key={f}
                className={`mono text-xs border rounded px-2 h-9 inline-flex items-center cursor-pointer ${
                  flags.includes(f)
                    ? "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] border-transparent"
                    : "bg-[color:var(--color-surface)]"
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={flags.includes(f)}
                  onChange={(e) =>
                    setFlags((cur) => (e.target.checked ? cur + f : cur.replace(f, "")))
                  }
                />
                {f}
              </label>
            ))}
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

      <FieldRow label={`Matches (${matches.length})`}>
        <div
          className="rounded-md border bg-[color:var(--color-surface)] px-3 py-2.5 text-sm whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </FieldRow>

      {matches.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-[color:var(--color-muted)]">Match details</span>
          <div className="rounded-md border divide-y">
            {matches.map((m, i) => (
              <div key={i} className="px-3 py-2 text-sm flex justify-between gap-3">
                <span className="mono">{m.match}</span>
                <span className="text-[color:var(--color-muted)] text-xs">@{m.index}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
