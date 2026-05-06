"use client";

import { useMemo, useState } from "react";
import {
  Button,
  CopyButton,
  ErrorNote,
  FieldRow,
  Textarea,
} from "@/components/ui";

function textToHex(s: string) {
  const bytes = new TextEncoder().encode(s);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join(" ");
}

function hexToText(s: string) {
  const cleaned = s.replace(/[^0-9a-f]/gi, "");
  if (cleaned.length % 2 !== 0) throw new Error("Hex string has odd length");
  const bytes = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < cleaned.length; i += 2) {
    bytes[i / 2] = parseInt(cleaned.slice(i, i + 2), 16);
  }
  return new TextDecoder().decode(bytes);
}

export default function Component() {
  const [mode, setMode] = useState<"toHex" | "toText">("toHex");
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: "" };
    try {
      return {
        output: mode === "toHex" ? textToHex(input) : hexToText(input),
        error: "",
      };
    } catch (e) {
      return { output: "", error: e instanceof Error ? e.message : "Invalid input" };
    }
  }, [input, mode]);

  return (
    <>
      <div className="inline-flex rounded-md border bg-[color:var(--color-surface)] p-0.5 w-fit">
        <Button
          variant={mode === "toHex" ? "default" : "ghost"}
          size="sm"
          onClick={() => setMode("toHex")}
        >
          Text → Hex
        </Button>
        <Button
          variant={mode === "toText" ? "default" : "ghost"}
          size="sm"
          onClick={() => setMode("toText")}
        >
          Hex → Text
        </Button>
      </div>

      <FieldRow label={mode === "toHex" ? "Text" : "Hex bytes"}>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === "toHex" ? "Hello" : "48 65 6c 6c 6f"}
        />
      </FieldRow>

      <ErrorNote>{error}</ErrorNote>

      <FieldRow label="Result" actions={<CopyButton value={output} />}>
        <Textarea readOnly value={output} />
      </FieldRow>
    </>
  );
}
