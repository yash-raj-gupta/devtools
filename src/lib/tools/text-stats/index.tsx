"use client";

import { useMemo, useState } from "react";
import { FieldRow, Label, Textarea } from "@/components/ui";

function stats(text: string) {
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = text === "" ? 0 : text.split(/\r?\n/).length;
  const sentences = text.trim() ? (text.match(/[^.!?]+[.!?]+/g) ?? [text]).length : 0;
  const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(Boolean).length : 0;
  const avgWord = words ? +(charsNoSpaces / words).toFixed(2) : 0;
  const readingMinutes = +(words / 200).toFixed(1); // ~200 wpm
  return {
    chars,
    charsNoSpaces,
    words,
    lines,
    sentences,
    paragraphs,
    avgWord,
    readingMinutes,
  };
}

const FIELDS: { key: keyof ReturnType<typeof stats>; label: string }[] = [
  { key: "chars", label: "Characters" },
  { key: "charsNoSpaces", label: "Chars (no spaces)" },
  { key: "words", label: "Words" },
  { key: "lines", label: "Lines" },
  { key: "sentences", label: "Sentences" },
  { key: "paragraphs", label: "Paragraphs" },
  { key: "avgWord", label: "Avg word length" },
  { key: "readingMinutes", label: "Reading time (min)" },
];

export default function Component() {
  const [text, setText] = useState("");
  const s = useMemo(() => stats(text), [text]);

  return (
    <>
      <FieldRow label="Text">
        <Textarea
          mono={false}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste anything — an article, your README, a tweet draft…"
          className="min-h-[200px]"
        />
      </FieldRow>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {FIELDS.map((f) => (
          <div key={f.key} className="skeuo-panel p-3 text-center">
            <Label>{f.label}</Label>
            <div className="mt-1 mono text-xl skeuo-emboss" style={{ color: "var(--fg)" }}>
              {s[f.key]}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
