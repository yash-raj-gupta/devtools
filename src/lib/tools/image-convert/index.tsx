"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  Checkbox,
  ErrorNote,
  FieldRow,
  Input,
  Label,
  Range,
  SegmentedControl,
} from "@/components/ui";

type Format = "image/png" | "image/jpeg" | "image/webp";

const FORMAT_LABEL: Record<Format, string> = {
  "image/png": "PNG",
  "image/jpeg": "JPEG",
  "image/webp": "WebP",
};

const FORMAT_EXT: Record<Format, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

interface SourceImg {
  file: File;
  url: string;
  width: number;
  height: number;
}

interface OutputImg {
  url: string;
  blob: Blob;
  width: number;
  height: number;
}

export default function Component() {
  const [source, setSource] = useState<SourceImg | null>(null);
  const [target, setTarget] = useState<Format>("image/png");
  const [quality, setQuality] = useState(0.9);
  const [resize, setResize] = useState(false);
  const [maxW, setMaxW] = useState(1600);
  const [output, setOutput] = useState<OutputImg | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Revoke blob URLs we own when they change.
  useEffect(() => {
    return () => {
      if (source) URL.revokeObjectURL(source.url);
    };
  }, [source]);
  useEffect(() => {
    return () => {
      if (output) URL.revokeObjectURL(output.url);
    };
  }, [output]);

  const loadFile = useCallback(async (file: File) => {
    setError("");
    setOutput(null);
    if (!file.type.startsWith("image/")) {
      setError("That doesn't look like an image.");
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    try {
      await img.decode();
    } catch {
      URL.revokeObjectURL(url);
      setError("Couldn't decode that image. Try a different file.");
      return;
    }
    setSource({
      file,
      url,
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
  }, []);

  const onPick = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void loadFile(file);
      e.target.value = "";
    },
    [loadFile],
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) void loadFile(file);
    },
    [loadFile],
  );

  const convert = useCallback(async () => {
    if (!source) return;
    setBusy(true);
    setError("");
    try {
      const img = new Image();
      img.src = source.url;
      await img.decode();

      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (resize && maxW > 0 && (w > maxW || h > maxW)) {
        const scale = maxW / Math.max(w, h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas 2D context unavailable.");
      // White matte for JPEG (no transparency).
      if (target === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
      }
      ctx.drawImage(img, 0, 0, w, h);

      const blob: Blob | null = await new Promise((res) =>
        canvas.toBlob(
          res,
          target,
          target === "image/png" ? undefined : quality,
        ),
      );
      if (!blob) throw new Error("Browser refused to encode this format.");

      // Free previous output URL before replacing.
      if (output) URL.revokeObjectURL(output.url);
      const url = URL.createObjectURL(blob);
      setOutput({ url, blob, width: w, height: h });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed.");
    } finally {
      setBusy(false);
    }
  }, [source, target, quality, resize, maxW, output]);

  const filename = source
    ? `${source.file.name.replace(/\.[^.]+$/, "")}.${FORMAT_EXT[target]}`
    : `output.${FORMAT_EXT[target]}`;

  return (
    <>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="skeuo-inset rounded-lg p-6 text-center cursor-pointer"
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPick}
        />
        {source ? (
          <div className="space-y-2">
            <div className="text-sm font-medium">{source.file.name}</div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>
              {source.width}×{source.height} · {fmtBytes(source.file.size)} ·{" "}
              {source.file.type || "unknown"}
            </div>
            <div className="text-[11px]" style={{ color: "var(--muted)" }}>
              Click or drop another image to replace.
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="text-sm font-medium">
              Drop an image here, or click to choose
            </div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>
              PNG, JPEG, WebP, GIF, BMP, AVIF — anything your browser can render.
            </div>
          </div>
        )}
      </div>

      <FieldRow label="Convert to">
        <SegmentedControl<Format>
          value={target}
          onChange={setTarget}
          options={[
            { value: "image/png", label: "PNG" },
            { value: "image/jpeg", label: "JPEG" },
            { value: "image/webp", label: "WebP" },
          ]}
        />
      </FieldRow>

      {target !== "image/png" && (
        <FieldRow
          label={`Quality — ${Math.round(quality * 100)}%`}
          hint={
            target === "image/jpeg"
              ? "JPEG is lossy. Lower quality = smaller file."
              : "WebP is lossy at < 100, near-lossless above."
          }
        >
          <Range
            min={0.1}
            max={1}
            step={0.05}
            value={quality}
            onChange={(e) => setQuality(parseFloat(e.target.value))}
          />
        </FieldRow>
      )}

      <FieldRow label="Resize (longest edge, px)">
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-xs">
            <Checkbox
              checked={resize}
              onChange={(e) => setResize(e.target.checked)}
            />
            <span style={{ color: "var(--muted)" }}>
              Downscale if larger than
            </span>
          </label>
          <Input
            type="number"
            min={32}
            step={32}
            value={maxW}
            disabled={!resize}
            onChange={(e) => setMaxW(parseInt(e.target.value || "0", 10))}
            mono
            className="max-w-[140px]"
          />
        </div>
      </FieldRow>

      <ErrorNote>{error}</ErrorNote>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="accent"
          disabled={!source || busy}
          onClick={() => void convert()}
        >
          {busy
            ? "Converting…"
            : `Convert to ${FORMAT_LABEL[target]}`}
        </Button>
        {output && (
          <a
            href={output.url}
            download={filename}
            className="skeuo-btn"
          >
            Download {filename}
          </a>
        )}
      </div>

      {(source || output) && (
        <div className="grid sm:grid-cols-2 gap-3">
          {source && (
            <div className="skeuo-panel p-3 space-y-2 min-w-0">
              <Label>Source</Label>
              <div className="rounded-md overflow-hidden bg-[color:var(--surface-lo)] grid place-items-center min-h-[160px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={source.url}
                  alt="source"
                  className="max-w-full max-h-[300px] object-contain"
                />
              </div>
              <div className="text-xs mono" style={{ color: "var(--muted)" }}>
                {source.width}×{source.height} · {fmtBytes(source.file.size)}
              </div>
            </div>
          )}
          {output && (
            <div className="skeuo-panel p-3 space-y-2 min-w-0">
              <Label>Output ({FORMAT_LABEL[target]})</Label>
              <div className="rounded-md overflow-hidden bg-[color:var(--surface-lo)] grid place-items-center min-h-[160px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={output.url}
                  alt="output"
                  className="max-w-full max-h-[300px] object-contain"
                />
              </div>
              <div className="text-xs mono" style={{ color: "var(--muted)" }}>
                {output.width}×{output.height} · {fmtBytes(output.blob.size)}
                {source && (
                  <span
                    className="ml-2"
                    style={{
                      color:
                        output.blob.size <= source.file.size
                          ? "color-mix(in srgb, #2ecc71 70%, var(--fg))"
                          : "color-mix(in srgb, #c0392b 70%, var(--fg))",
                    }}
                  >
                    {output.blob.size <= source.file.size ? "−" : "+"}
                    {Math.abs(
                      Math.round(
                        ((output.blob.size - source.file.size) /
                          source.file.size) *
                          100,
                      ),
                    )}
                    %
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
