"use client";

import { useState } from "react";
import {
  Button,
  CopyButton,
  ErrorNote,
  FieldRow,
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

export default function Component() {
  const [busy, setBusy] = useState(false);
  const [pubKey, setPubKey] = useState("");
  const [privKey, setPrivKey] = useState("");
  const [error, setError] = useState("");

  async function run() {
    setBusy(true);
    setError("");
    try {
      const pair = (await crypto.subtle.generateKey({ name: "Ed25519" }, true, [
        "sign",
        "verify",
      ])) as CryptoKeyPair;
      const priv = await crypto.subtle.exportKey("pkcs8", pair.privateKey);
      const pub = await crypto.subtle.exportKey("spki", pair.publicKey);
      setPrivKey(pem("PRIVATE KEY", abToB64(priv)));
      setPubKey(pem("PUBLIC KEY", abToB64(pub)));
    } catch (e) {
      setError(
        (e instanceof Error ? e.message : "Failed") +
          " — your browser may not support Ed25519 yet (Chrome 113+, Safari 17+, Firefox 129+).",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="accent" onClick={run} disabled={busy}>
        {busy ? "Generating…" : "Generate Ed25519 keypair"}
      </Button>

      <ErrorNote>{error}</ErrorNote>

      <FieldRow label="Public key (SPKI / PEM)" actions={<CopyButton value={pubKey} />}>
        <Textarea readOnly value={pubKey} className="min-h-[100px]" />
      </FieldRow>

      <FieldRow label="Private key (PKCS#8 / PEM)" actions={<CopyButton value={privKey} />}>
        <Textarea readOnly value={privKey} className="min-h-[100px]" />
      </FieldRow>

      <p className="text-xs" style={{ color: "var(--muted)" }}>
        Ed25519 is faster and shorter than RSA, with comparable security to
        ~3000-bit RSA. Save your private key — it never leaves this browser.
      </p>
    </>
  );
}
