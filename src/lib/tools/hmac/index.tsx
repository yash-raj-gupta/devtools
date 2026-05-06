"use client";

import { useEffect, useState } from "react";
import {
  CopyButton,
  ErrorNote,
  FieldRow,
  Input,
  SegmentedControl,
  Textarea,
} from "@/components/ui";

const HASHES = ["SHA-256", "SHA-384", "SHA-512", "SHA-1"] as const;
type Algo = (typeof HASHES)[number];

async function hmacHex(secret: string, msg: string, algo: Algo): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: algo },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function Component() {
  const [secret, setSecret] = useState("");
  const [message, setMessage] = useState("");
  const [algo, setAlgo] = useState<Algo>("SHA-256");
  const [hex, setHex] = useState("");
  const [b64, setB64] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!secret || !message) {
      setHex("");
      setB64("");
      return;
    }
    hmacHex(secret, message, algo)
      .then((h) => {
        if (cancelled) return;
        setHex(h);
        const bytes = new Uint8Array(h.match(/.{2}/g)!.map((x) => parseInt(x, 16)));
        let bin = "";
        for (const b of bytes) bin += String.fromCharCode(b);
        setB64(btoa(bin));
        setError("");
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "HMAC failed");
      });
    return () => {
      cancelled = true;
    };
  }, [secret, message, algo]);

  return (
    <>
      <FieldRow label="Algorithm">
        <SegmentedControl<Algo>
          value={algo}
          onChange={setAlgo}
          options={HASHES.map((h) => ({ value: h, label: h.replace("SHA-", "") }))}
        />
      </FieldRow>

      <FieldRow label="Secret key">
        <Input
          mono
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Shared secret"
        />
      </FieldRow>

      <FieldRow label="Message">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="The data to authenticate"
        />
      </FieldRow>

      <ErrorNote>{error}</ErrorNote>

      <FieldRow label={`HMAC-${algo} (hex)`} actions={<CopyButton value={hex} />}>
        <Input mono readOnly value={hex} />
      </FieldRow>
      <FieldRow label={`HMAC-${algo} (base64)`} actions={<CopyButton value={b64} />}>
        <Input mono readOnly value={b64} />
      </FieldRow>
    </>
  );
}
