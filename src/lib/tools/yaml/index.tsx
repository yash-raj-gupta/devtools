"use client";

import { parse, stringify } from "yaml";
import { useMemo, useState } from "react";
import {
  CopyButton,
  ErrorNote,
  FieldRow,
  SegmentedControl,
  Textarea,
} from "@/components/ui";

export default function Component() {
  const [mode, setMode] = useState<"y2j" | "j2y">("y2j");
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      if (mode === "y2j") {
        return {
          output: JSON.stringify(parse(input), null, 2),
          error: "",
        };
      }
      return { output: stringify(JSON.parse(input)), error: "" };
    } catch (e) {
      return { output: "", error: e instanceof Error ? e.message : "Parse failed" };
    }
  }, [input, mode]);

  return (
    <>
      <SegmentedControl
        value={mode}
        onChange={setMode}
        options={[
          { value: "y2j", label: "YAML → JSON" },
          { value: "j2y", label: "JSON → YAML" },
        ]}
      />

      <FieldRow label={mode === "y2j" ? "YAML" : "JSON"}>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            mode === "y2j"
              ? "name: Toolbench\nversion: 1\nfeatures:\n  - fast\n  - private"
              : '{ "name": "Toolbench", "version": 1 }'
          }
          className="min-h-[180px]"
        />
      </FieldRow>

      <ErrorNote>{error}</ErrorNote>

      <FieldRow label="Result" actions={<CopyButton value={output} />}>
        <Textarea readOnly value={output} className="min-h-[180px]" />
      </FieldRow>
    </>
  );
}
