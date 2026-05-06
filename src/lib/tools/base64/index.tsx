"use client";

import { useMemo, useState } from "react";
import {
  Button,
  CopyButton,
  ErrorNote,
  FieldRow,
  Textarea,
} from "@/components/ui";

function encode(input: string, urlSafe: boolean) {
  const bytes = new TextEncoder().encode(input);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  let out = btoa(bin);
  if (urlSafe) out = out.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return out;
}

function decode(input: string) {
  let s = input.trim().replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4;
  if (pad) s += "=".repeat(4 - pad);
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export default function Component() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [urlSafe, setUrlSafe] = useState(false);
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: "" };
    try {
      return {
        output: mode === "encode" ? encode(input, urlSafe) : decode(input),
        error: "",
      };
    } catch (e) {
      return { output: "", error: e instanceof Error ? e.message : "Invalid input" };
    }
  }, [input, mode, urlSafe]);

  return (
    <>
      <div className="flex flex-wrap gap-2">
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
            checked={urlSafe}
            onChange={(e) => setUrlSafe(e.target.checked)}
            className="accent-[color:var(--color-accent)]"
          />
          URL-safe (base64url)
        </label>
      </div>

      <FieldRow
        label={mode === "encode" ? "Plain text" : "Base64 text"}
        actions={
          input && (
            <Button variant="ghost" size="sm" onClick={() => setInput("")}>
              Clear
            </Button>
          )
        }
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === "encode" ? "Type or paste anything…" : "Paste base64…"}
        />
      </FieldRow>

      <ErrorNote>{error}</ErrorNote>

      <FieldRow label="Result" actions={<CopyButton value={output} />}>
        <Textarea readOnly value={output} placeholder="Output appears here" />
      </FieldRow>
    </>
  );
}
