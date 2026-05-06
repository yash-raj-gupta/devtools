"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, CopyButton, FieldRow, Input, Label } from "@/components/ui";

const SETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>/?",
};

function pick(set: string) {
  const r = new Uint32Array(1);
  crypto.getRandomValues(r);
  return set[r[0] % set.length];
}

function generate(length: number, opts: { lower: boolean; upper: boolean; digits: boolean; symbols: boolean }) {
  const pool =
    (opts.lower ? SETS.lower : "") +
    (opts.upper ? SETS.upper : "") +
    (opts.digits ? SETS.digits : "") +
    (opts.symbols ? SETS.symbols : "");
  if (!pool) return "";
  const required: string[] = [];
  if (opts.lower) required.push(pick(SETS.lower));
  if (opts.upper) required.push(pick(SETS.upper));
  if (opts.digits) required.push(pick(SETS.digits));
  if (opts.symbols) required.push(pick(SETS.symbols));
  const remaining = Math.max(0, length - required.length);
  const rest: string[] = [];
  for (let i = 0; i < remaining; i++) rest.push(pick(pool));
  const all = [...required, ...rest];
  // Fisher–Yates with crypto
  for (let i = all.length - 1; i > 0; i--) {
    const r = new Uint32Array(1);
    crypto.getRandomValues(r);
    const j = r[0] % (i + 1);
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all.join("").slice(0, length);
}

function entropy(length: number, pool: number) {
  if (!pool || !length) return 0;
  return Math.round(length * Math.log2(pool));
}

export default function Component() {
  const [length, setLength] = useState(20);
  const [opts, setOpts] = useState({ lower: true, upper: true, digits: true, symbols: true });
  const [pwd, setPwd] = useState("");

  const regenerate = useCallback(() => setPwd(generate(length, opts)), [length, opts]);

  useEffect(() => {
    regenerate();
  }, [regenerate]);

  const poolSize =
    (opts.lower ? SETS.lower.length : 0) +
    (opts.upper ? SETS.upper.length : 0) +
    (opts.digits ? SETS.digits.length : 0) +
    (opts.symbols ? SETS.symbols.length : 0);

  const bits = entropy(length, poolSize);
  const strength =
    bits >= 128 ? "Excellent" : bits >= 80 ? "Strong" : bits >= 60 ? "Decent" : "Weak";
  const strengthColor =
    bits >= 128
      ? "text-emerald-500"
      : bits >= 80
        ? "text-emerald-500"
        : bits >= 60
          ? "text-amber-500"
          : "text-red-500";

  return (
    <>
      <FieldRow label="Generated password" actions={<CopyButton value={pwd} />}>
        <Input mono readOnly value={pwd} className="text-base h-11" />
      </FieldRow>
      <p className={`text-xs ${strengthColor}`}>
        ~{bits} bits of entropy · {strength}
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Length: {length}</Label>
          <input
            type="range"
            min={6}
            max={64}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-[color:var(--color-accent)]"
          />
        </div>
        <div className="space-y-2">
          <Label>Character sets</Label>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {(
              [
                ["lower", "a–z"],
                ["upper", "A–Z"],
                ["digits", "0–9"],
                ["symbols", "!@#$"],
              ] as const
            ).map(([k, l]) => (
              <label key={k} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={opts[k]}
                  onChange={(e) => setOpts((o) => ({ ...o, [k]: e.target.checked }))}
                  className="accent-[color:var(--color-accent)]"
                />
                {l}
              </label>
            ))}
          </div>
        </div>
      </div>

      <Button variant="accent" onClick={regenerate}>Regenerate</Button>
    </>
  );
}
