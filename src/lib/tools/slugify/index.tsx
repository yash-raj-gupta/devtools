"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  Checkbox,
  FieldRow,
  Input,
  SegmentedControl,
  Textarea,
} from "@/components/ui";

function slugify(input: string, sep: string, lowercase: boolean, max: number) {
  let s = input.normalize("NFKD").replace(/[̀-ͯ]/g, "");
  if (lowercase) s = s.toLowerCase();
  s = s.replace(/[^a-zA-Z0-9]+/g, sep);
  s = s.replace(new RegExp(`^${escapeRegExp(sep)}+|${escapeRegExp(sep)}+$`, "g"), "");
  s = s.replace(new RegExp(`${escapeRegExp(sep)}{2,}`, "g"), sep);
  if (max > 0 && s.length > max) s = s.slice(0, max).replace(new RegExp(`${escapeRegExp(sep)}+$`), "");
  return s;
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function Component() {
  const [input, setInput] = useState("Héllo, World! — A great day");
  const [sep, setSep] = useState<"-" | "_">("-");
  const [lower, setLower] = useState(true);
  const [max, setMax] = useState(0);

  const output = useMemo(() => slugify(input, sep, lower, max), [input, sep, lower, max]);

  return (
    <>
      <FieldRow label="Text">
        <Textarea
          mono={false}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Any title — accents, punctuation, mixed case…"
          className="min-h-[100px]"
        />
      </FieldRow>

      <div className="grid sm:grid-cols-3 gap-3">
        <FieldRow label="Separator">
          <SegmentedControl<"-" | "_">
            value={sep}
            onChange={setSep}
            options={[
              { value: "-", label: "hyphen -" },
              { value: "_", label: "underscore _" },
            ]}
          />
        </FieldRow>
        <FieldRow label="Case">
          <label className="inline-flex items-center gap-2 text-sm" style={{ color: "var(--fg-soft)" }}>
            <Checkbox checked={lower} onChange={(e) => setLower(e.target.checked)} />
            Lowercase
          </label>
        </FieldRow>
        <FieldRow label="Max length (0 = none)">
          <Input
            type="number"
            min={0}
            max={300}
            value={max}
            onChange={(e) => setMax(Number(e.target.value) || 0)}
          />
        </FieldRow>
      </div>

      <FieldRow label="Slug" actions={<CopyButton value={output} />}>
        <Input mono readOnly value={output} />
      </FieldRow>
    </>
  );
}
