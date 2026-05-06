"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  ErrorNote,
  FieldRow,
  Textarea,
} from "@/components/ui";

function b64urlDecode(s: string): string {
  let p = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = p.length % 4;
  if (pad) p += "=".repeat(4 - pad);
  const bin = atob(p);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function pretty(s: string) {
  try {
    return JSON.stringify(JSON.parse(s), null, 2);
  } catch {
    return s;
  }
}

export default function Component() {
  const [token, setToken] = useState("");

  const { header, payload, signature, error, expInfo } = useMemo(() => {
    if (!token.trim())
      return { header: "", payload: "", signature: "", error: "", expInfo: "" };
    try {
      const parts = token.trim().split(".");
      if (parts.length !== 3) throw new Error("JWT must have 3 dot-separated parts");
      const h = pretty(b64urlDecode(parts[0]));
      const p = pretty(b64urlDecode(parts[1]));

      let info = "";
      try {
        const obj = JSON.parse(p) as { exp?: number; iat?: number };
        if (obj.exp) {
          const ms = obj.exp * 1000;
          const d = new Date(ms);
          info = ms < Date.now()
            ? `Expired ${d.toLocaleString()}`
            : `Expires ${d.toLocaleString()}`;
        }
      } catch {
        // ignore
      }

      return { header: h, payload: p, signature: parts[2], error: "", expInfo: info };
    } catch (e) {
      return {
        header: "",
        payload: "",
        signature: "",
        error: e instanceof Error ? e.message : "Invalid JWT",
        expInfo: "",
      };
    }
  }, [token]);

  return (
    <>
      <FieldRow label="JWT" hint="No verification — signature is shown but not validated.">
        <Textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="eyJhbGciOi…"
        />
      </FieldRow>

      <ErrorNote>{error}</ErrorNote>

      <FieldRow label="Header" actions={<CopyButton value={header} />}>
        <Textarea readOnly className="min-h-[80px]" value={header} />
      </FieldRow>

      <FieldRow label="Payload" actions={<CopyButton value={payload} />}>
        <Textarea readOnly className="min-h-[140px]" value={payload} />
      </FieldRow>

      {expInfo && (
        <p className="text-xs text-[color:var(--color-muted)]">{expInfo}</p>
      )}

      {signature && (
        <FieldRow label="Signature (base64url)" actions={<CopyButton value={signature} />}>
          <Textarea readOnly className="min-h-[64px]" value={signature} />
        </FieldRow>
      )}
    </>
  );
}
