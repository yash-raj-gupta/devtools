"use client";

import { useEffect, useState } from "react";
import { CopyButton, FieldRow, Input, Textarea } from "@/components/ui";

const ALGOS = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const;
type Algo = (typeof ALGOS)[number];

async function digest(algo: Algo, input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest(algo, data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function Component() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<Record<Algo, string>>({
    "SHA-1": "",
    "SHA-256": "",
    "SHA-384": "",
    "SHA-512": "",
  });

  useEffect(() => {
    let cancelled = false;
    if (!input) {
      setResults({ "SHA-1": "", "SHA-256": "", "SHA-384": "", "SHA-512": "" });
      return;
    }
    (async () => {
      const entries = await Promise.all(
        ALGOS.map(async (a) => [a, await digest(a, input)] as const),
      );
      if (cancelled) return;
      setResults(Object.fromEntries(entries) as Record<Algo, string>);
    })();
    return () => {
      cancelled = true;
    };
  }, [input]);

  return (
    <>
      <FieldRow label="Input">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Anything you want to hash"
        />
      </FieldRow>

      <div className="space-y-3">
        {ALGOS.map((a) => (
          <div key={a} className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-[color:var(--color-muted)]">
                {a}
              </span>
              <CopyButton value={results[a]} />
            </div>
            <Input mono readOnly value={results[a]} placeholder="—" />
          </div>
        ))}
      </div>
    </>
  );
}
