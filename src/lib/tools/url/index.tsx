"use client";

import { useMemo, useState } from "react";
import {
  Button,
  CopyButton,
  ErrorNote,
  FieldRow,
  Textarea,
} from "@/components/ui";

export default function Component() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [component, setComponent] = useState(true);
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: "" };
    try {
      if (mode === "encode") {
        return {
          output: component ? encodeURIComponent(input) : encodeURI(input),
          error: "",
        };
      }
      return {
        output: component ? decodeURIComponent(input) : decodeURI(input),
        error: "",
      };
    } catch (e) {
      return { output: "", error: e instanceof Error ? e.message : "Invalid input" };
    }
  }, [input, mode, component]);

  return (
    <>
      <div className="flex flex-wrap gap-3 items-center">
        <div className="inline-flex rounded-md border bg-[color:var(--color-surface)] p-0.5">
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
        <label className="inline-flex items-center gap-2 text-sm text-[color:var(--color-muted)]">
          <input
            type="checkbox"
            checked={component}
            onChange={(e) => setComponent(e.target.checked)}
            className="accent-[color:var(--color-accent)]"
          />
          Component mode (encodes <code className="mono text-xs">/?:@&=+$#</code>)
        </label>
      </div>

      <FieldRow label="Input">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === "encode" ? "https://example.com/?q=hello world" : "https%3A%2F%2Fexample.com…"}
        />
      </FieldRow>

      <ErrorNote>{error}</ErrorNote>

      <FieldRow label="Result" actions={<CopyButton value={output} />}>
        <Textarea readOnly value={output} placeholder="Output appears here" />
      </FieldRow>
    </>
  );
}
