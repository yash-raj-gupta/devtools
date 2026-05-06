"use client";

import { useState } from "react";
import {
  Button,
  CopyButton,
  ErrorNote,
  FieldRow,
  Input,
  SegmentedControl,
  Textarea,
} from "@/components/ui";

const ITER = 250_000;

function bytesToB64(bytes: Uint8Array) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}
function b64ToBytes(b64: string) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
async function deriveKey(passphrase: string, salt: Uint8Array) {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase) as BufferSource,
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations: ITER },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function encrypt(plain: string, passphrase: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    new TextEncoder().encode(plain) as BufferSource,
  );
  const all = new Uint8Array(salt.length + iv.length + ct.byteLength);
  all.set(salt, 0);
  all.set(iv, salt.length);
  all.set(new Uint8Array(ct), salt.length + iv.length);
  return bytesToB64(all);
}

async function decrypt(b64: string, passphrase: string) {
  const all = b64ToBytes(b64.trim());
  if (all.length < 16 + 12 + 16) throw new Error("Ciphertext is too short");
  const salt = all.slice(0, 16);
  const iv = all.slice(16, 28);
  const ct = all.slice(28);
  const key = await deriveKey(passphrase, salt);
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    ct as BufferSource,
  );
  return new TextDecoder().decode(pt);
}

export default function Component() {
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [pass, setPass] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function run() {
    setError("");
    setBusy(true);
    try {
      if (!pass) throw new Error("Passphrase is required");
      if (!input) throw new Error("Input is required");
      const out = mode === "encrypt"
        ? await encrypt(input, pass)
        : await decrypt(input, pass);
      setOutput(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Operation failed");
      setOutput("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <FieldRow label="Mode">
        <SegmentedControl
          value={mode}
          onChange={setMode}
          options={[
            { value: "encrypt", label: "Encrypt" },
            { value: "decrypt", label: "Decrypt" },
          ]}
        />
      </FieldRow>

      <FieldRow label="Passphrase">
        <Input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="A strong passphrase"
        />
      </FieldRow>

      <FieldRow
        label={mode === "encrypt" ? "Plaintext" : "Ciphertext (base64)"}
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === "encrypt" ? "Anything you want to keep private…" : "Paste ciphertext…"}
        />
      </FieldRow>

      <Button variant="accent" onClick={run} disabled={busy}>
        {busy ? "Working…" : mode === "encrypt" ? "Encrypt" : "Decrypt"}
      </Button>

      <ErrorNote>{error}</ErrorNote>

      <FieldRow
        label={mode === "encrypt" ? "Ciphertext (base64)" : "Plaintext"}
        actions={<CopyButton value={output} />}
      >
        <Textarea readOnly value={output} />
      </FieldRow>

      <p className="text-xs" style={{ color: "var(--muted)" }}>
        AES-256-GCM with PBKDF2-SHA256 ({ITER.toLocaleString()} iterations).
        Output bundles a fresh salt + IV per encryption.
      </p>
    </>
  );
}
