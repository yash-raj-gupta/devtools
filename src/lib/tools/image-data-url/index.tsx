"use client";

import { useRef, useState } from "react";
import {
  Button,
  CopyButton,
  ErrorNote,
  FieldRow,
  SegmentedControl,
  Textarea,
} from "@/components/ui";

export default function Component() {
  const [mode, setMode] = useState<"toDataUrl" | "fromDataUrl">("toDataUrl");
  const [dataUrl, setDataUrl] = useState("");
  const [meta, setMeta] = useState<{ name: string; size: number; type: string } | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large (max 10 MB).");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      setDataUrl(typeof reader.result === "string" ? reader.result : "");
      setMeta({ name: file.name, size: file.size, type: file.type });
    };
    reader.onerror = () => setError("Failed to read file.");
    reader.readAsDataURL(file);
  }

  return (
    <>
      <SegmentedControl
        value={mode}
        onChange={setMode}
        options={[
          { value: "toDataUrl", label: "Image → Data URL" },
          { value: "fromDataUrl", label: "Data URL → Preview" },
        ]}
      />

      {mode === "toDataUrl" ? (
        <>
          <FieldRow label="Image">
            <div
              className="skeuo-inset p-6 grid place-items-center text-sm"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFile(e.dataTransfer.files?.[0]);
              }}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFile(e.target.files?.[0])}
                style={{ display: "none" }}
              />
              <div className="text-center" style={{ color: "var(--muted)" }}>
                Drag & drop an image here, or
                <div className="mt-2">
                  <Button onClick={() => inputRef.current?.click()}>Choose file</Button>
                </div>
                {meta && (
                  <div className="mt-3 mono text-xs" style={{ color: "var(--fg-soft)" }}>
                    {meta.name} · {meta.type || "image"} ·{" "}
                    {(meta.size / 1024).toFixed(1)} KB
                  </div>
                )}
              </div>
            </div>
          </FieldRow>
        </>
      ) : (
        <FieldRow label="Data URL">
          <Textarea
            value={dataUrl}
            onChange={(e) => setDataUrl(e.target.value)}
            placeholder="data:image/png;base64,iVBORw0KGgo…"
            className="min-h-[140px]"
          />
        </FieldRow>
      )}

      <ErrorNote>{error}</ErrorNote>

      {dataUrl && (
        <>
          <FieldRow label="Preview">
            <div className="skeuo-stage p-4 grid place-items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={dataUrl}
                alt="preview"
                style={{ maxWidth: "100%", maxHeight: 360 }}
              />
            </div>
          </FieldRow>
          <FieldRow label="Data URL" actions={<CopyButton value={dataUrl} />}>
            <Textarea readOnly mono value={dataUrl} className="min-h-[120px]" />
          </FieldRow>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Length: {dataUrl.length.toLocaleString()} chars
            {dataUrl.length > 100_000 && " · large data URLs may not work in all email clients or stylesheets"}
          </p>
        </>
      )}
    </>
  );
}
