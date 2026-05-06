"use client";

import { useMemo, useState } from "react";
import {
  Button,
  CopyButton,
  FieldRow,
  Textarea,
} from "@/components/ui";

const NAMED: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&apos;": "'",
  "&#39;": "'",
  "&nbsp;": " ",
};

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function unescapeHtml(s: string) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&[a-z]+;/gi, (m) => NAMED[m] ?? m);
}

export default function Component() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");

  const output = useMemo(() => {
    if (!input) return "";
    return mode === "encode" ? escapeHtml(input) : unescapeHtml(input);
  }, [input, mode]);

  return (
    <>
      <div className="inline-flex rounded-md border bg-[color:var(--color-surface)] p-0.5 w-fit">
        <Button
          variant={mode === "encode" ? "default" : "ghost"}
          size="sm"
          onClick={() => setMode("encode")}
        >
          Encode
        </Button>
        <Button
          variant={mode === "decode" ? "default" : "ghost"}
          size="sm"
          onClick={() => setMode("decode")}
        >
          Decode
        </Button>
      </div>

      <FieldRow label={mode === "encode" ? "HTML / text" : "Encoded HTML"}>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === "encode" ? "<div>hello & welcome</div>" : "&lt;div&gt;hello &amp; welcome&lt;/div&gt;"}
        />
      </FieldRow>

      <FieldRow label="Result" actions={<CopyButton value={output} />}>
        <Textarea readOnly value={output} />
      </FieldRow>
    </>
  );
}
