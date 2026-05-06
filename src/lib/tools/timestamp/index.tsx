"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, CopyButton, FieldRow, Input } from "@/components/ui";

export default function Component() {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const [ts, setTs] = useState(String(Math.floor(Date.now() / 1000)));
  const [iso, setIso] = useState(new Date().toISOString().slice(0, 19));

  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  const fromTs = useMemo(() => {
    const n = Number(ts);
    if (!ts || Number.isNaN(n)) return { utc: "", local: "", error: "Enter a number" };
    const ms = ts.length > 10 ? n : n * 1000;
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return { utc: "", local: "", error: "Invalid timestamp" };
    return { utc: d.toUTCString(), local: d.toString(), error: "" };
  }, [ts]);

  const fromIso = useMemo(() => {
    if (!iso) return { unix: "", error: "" };
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return { unix: "", error: "Invalid date" };
    return { unix: String(Math.floor(d.getTime() / 1000)), error: "" };
  }, [iso]);

  return (
    <>
      <div className="rounded-md border bg-[color:var(--color-surface)] p-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-[color:var(--color-muted)]">Now</div>
          <div className="mono text-lg">{now}</div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setTs(String(now))}>
            Use as input
          </Button>
          <CopyButton value={String(now)} />
        </div>
      </div>

      <FieldRow label="Unix timestamp → date" hint="Accepts seconds (10 digits) or milliseconds (13 digits).">
        <Input mono value={ts} onChange={(e) => setTs(e.target.value)} placeholder="1700000000" />
      </FieldRow>
      {fromTs.error ? (
        <p className="text-xs text-red-500">{fromTs.error}</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-[color:var(--color-muted)] mb-1">UTC</div>
            <div className="mono text-sm">{fromTs.utc}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-[color:var(--color-muted)] mb-1">Local</div>
            <div className="mono text-sm">{fromTs.local}</div>
          </div>
        </div>
      )}

      <hr className="border-[color:var(--color-border)]" />

      <FieldRow label="Date → Unix timestamp" hint="ISO 8601, e.g. 2026-05-06T12:00:00">
        <Input mono value={iso} onChange={(e) => setIso(e.target.value)} placeholder="2026-05-06T12:00:00" />
      </FieldRow>
      {fromIso.error ? (
        <p className="text-xs text-red-500">{fromIso.error}</p>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <div className="mono text-sm">{fromIso.unix}</div>
          <CopyButton value={fromIso.unix} />
        </div>
      )}
    </>
  );
}
