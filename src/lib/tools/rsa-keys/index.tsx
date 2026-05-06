"use client";

import { useState } from "react";
import {
  Button,
  CopyButton,
  ErrorNote,
  FieldRow,
  SegmentedControl,
  Textarea,
} from "@/components/ui";

function abToB64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function pem(label: string, b64: string) {
  const lines: string[] = [];
  for (let i = 0; i < b64.length; i += 64) lines.push(b64.slice(i, i + 64));
  return `-----BEGIN ${label}-----\n${lines.join("\n")}\n-----END ${label}-----`;
}

async function generate(bits: number) {
  const pair = await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: bits,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"],
  );
  const priv = await crypto.subtle.exportKey("pkcs8", pair.privateKey);
  const pub = await crypto.subtle.exportKey("spki", pair.publicKey);
  return {
    privatePem: pem("PRIVATE KEY", abToB64(priv)),
    publicPem: pem("PUBLIC KEY", abToB64(pub)),
  };
}

export default function Component() {
  const [bits, setBits] = useState<2048 | 3072 | 4096>(2048);
  const [busy, setBusy] = useState(false);
  const [pubKey, setPubKey] = useState("");
  const [privKey, setPrivKey] = useState("");
  const [error, setError] = useState("");

  async function run() {
    setBusy(true);
    setError("");
    try {
      const k = await generate(bits);
      setPubKey(k.publicPem);
      setPrivKey(k.privatePem);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <FieldRow label="Modulus length">
        <SegmentedControl<2048 | 3072 | 4096>
          value={bits}
          onChange={setBits}
          options={[
            { value: 2048, label: "2048" },
            { value: 3072, label: "3072" },
            { value: 4096, label: "4096" },
          ]}
        />
      </FieldRow>

      <Button variant="accent" onClick={run} disabled={busy}>
        {busy ? "Generating…" : "Generate keypair"}
      </Button>

      <ErrorNote>{error}</ErrorNote>

      <FieldRow label="Public key (SPKI / PEM)" actions={<CopyButton value={pubKey} />}>
        <Textarea readOnly value={pubKey} className="min-h-[120px]" />
      </FieldRow>

      <FieldRow label="Private key (PKCS#8 / PEM)" actions={<CopyButton value={privKey} />}>
        <Textarea readOnly value={privKey} className="min-h-[160px]" />
      </FieldRow>

      <p className="text-xs" style={{ color: "var(--muted)" }}>
        Private key never leaves the browser. Save it somewhere safe before
        leaving this page.
      </p>
    </>
  );
}
