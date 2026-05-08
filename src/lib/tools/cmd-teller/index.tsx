"use client";

import { useMemo, useState } from "react";
import { CopyButton, FieldRow, Input, Label } from "@/components/ui";
import { CMDS, type CmdCategory, type CmdEntry } from "./data";

const CATEGORIES: CmdCategory[] = [
  "Files",
  "Search",
  "Process",
  "Network",
  "Disk",
  "Archive",
  "Permissions",
  "Git",
  "Package",
];

const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "to",
  "of",
  "in",
  "on",
  "for",
  "and",
  "or",
  "with",
  "i",
  "want",
  "need",
  "how",
  "do",
  "can",
  "me",
  "please",
  "command",
  "cmd",
  "terminal",
  "shell",
]);

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .split(/[^a-z0-9+_.-]+/)
    .filter((t) => t.length > 0 && !STOPWORDS.has(t));
}

function score(entry: CmdEntry, tokens: string[]): number {
  if (!tokens.length) return 0;
  const intent = entry.intent.toLowerCase();
  const haystackCmds = entry.commands
    .map((c) => `${c.cmd} ${c.note ?? ""}`.toLowerCase())
    .join(" ");
  const kw = entry.keywords.map((k) => k.toLowerCase());

  let total = 0;
  let matched = 0;
  for (const t of tokens) {
    let local = 0;
    if (kw.includes(t)) local += 4;
    else if (kw.some((k) => k.includes(t))) local += 2;
    if (intent.includes(t)) local += 3;
    if (haystackCmds.includes(t)) local += 1;
    if (local > 0) matched += 1;
    total += local;
  }
  if (matched === tokens.length) total += 5; // all tokens matched
  return total;
}

function search(query: string): CmdEntry[] {
  const tokens = tokenize(query);
  if (!tokens.length) return [];
  return CMDS.map((e) => ({ e, s: score(e, tokens) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 12)
    .map((x) => x.e);
}

const CATEGORY_TINT: Record<CmdCategory, string> = {
  Files: "#3b82f6",
  Search: "#8b5cf6",
  Process: "#f97316",
  Network: "#06b6d4",
  Disk: "#10b981",
  Archive: "#eab308",
  Permissions: "#ef4444",
  Git: "#f43f5e",
  Package: "#22c55e",
};

function CategoryBadge({ category }: { category: CmdCategory }) {
  const tint = CATEGORY_TINT[category];
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em]"
      style={{
        background: `color-mix(in srgb, ${tint} 18%, var(--surface))`,
        color: `color-mix(in srgb, ${tint} 75%, var(--fg))`,
        border: `1px solid color-mix(in srgb, ${tint} 35%, var(--border))`,
      }}
    >
      {category}
    </span>
  );
}

function ResultCard({ entry }: { entry: CmdEntry }) {
  return (
    <div className="skeuo-panel p-4 space-y-3 min-w-0 max-w-full">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-medium tracking-tight min-w-0">
          {entry.intent}
        </div>
        <CategoryBadge category={entry.category} />
      </div>
      <div className="space-y-2">
        {entry.commands.map((c, i) => (
          <div
            key={`${entry.id}-${i}`}
            className="flex items-center gap-2 rounded-md skeuo-plate px-3 py-2 min-w-0"
          >
            <code className="mono text-sm flex-1 min-w-0 overflow-x-auto whitespace-nowrap">
              {c.cmd}
            </code>
            {c.note && (
              <span className="text-[11px] hidden sm:inline shrink-0 max-w-[40%] truncate" style={{ color: "color-mix(in srgb, var(--accent-fg) 70%, transparent)" }}>
                {c.note}
              </span>
            )}
            <CopyButton value={c.cmd} />
          </div>
        ))}
      </div>
    </div>
  );
}

const EXAMPLES = [
  "list all files",
  "reset last commit",
  "find process on port 3000",
  "search text in files",
  "make file executable",
  "undo git commit",
  "kill process by pid",
  "create new branch",
  "copy file over ssh",
  "extract a tar.gz",
];

export default function Component() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CmdCategory | "All">("All");

  const results = useMemo(() => search(query), [query]);

  const browseList = useMemo(() => {
    if (activeCategory === "All") return CMDS;
    return CMDS.filter((e) => e.category === activeCategory);
  }, [activeCategory]);

  const showSearch = query.trim().length > 0;

  return (
    <>
      <FieldRow
        label="What do you want to do?"
        hint="Plain English works — try “reset last commit” or “list all files”."
      >
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. list all files, reset commit, find process on port 3000"
          autoFocus
        />
      </FieldRow>

      {!showSearch && (
        <FieldRow label="Try one">
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                className="skeuo-btn skeuo-btn-sm"
                onClick={() => setQuery(ex)}
              >
                {ex}
              </button>
            ))}
          </div>
        </FieldRow>
      )}

      {showSearch ? (
        <div className="space-y-3">
          <Label>
            {results.length > 0
              ? `${results.length} match${results.length === 1 ? "" : "es"}`
              : "No matches"}
          </Label>
          {results.length === 0 ? (
            <div className="skeuo-plate p-4 text-sm text-[color:var(--muted)]">
              No commands found for that query. Try simpler keywords like “list
              files” or “reset commit”.
            </div>
          ) : (
            <div className="flex flex-col gap-3 min-w-0">
              {results.map((entry) => (
                <ResultCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <FieldRow label="Browse by category">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="skeuo-btn skeuo-btn-sm"
                data-on={activeCategory === "All"}
                onClick={() => setActiveCategory("All")}
              >
                All
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className="skeuo-btn skeuo-btn-sm"
                  data-on={activeCategory === cat}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </FieldRow>

          <div className="flex flex-col gap-3 min-w-0">
            {browseList.map((entry) => (
              <ResultCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
