"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  ErrorNote,
  FieldRow,
  Label,
  SegmentedControl,
} from "@/components/ui";

type Mode = "compress" | "decompress";
type Algo = "gzip" | "deflate" | "deflate-raw";

const ALGO_EXT: Record<Algo, string> = {
  gzip: "gz",
  deflate: "zz",
  "deflate-raw": "raw",
};

// File extensions whose bytes are already entropy-coded — we warn the user
// that generic compression won't help.
const ALREADY_COMPRESSED = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "avif",
  "heic",
  "heif",
  "mp3",
  "mp4",
  "m4a",
  "m4v",
  "mov",
  "webm",
  "ogg",
  "opus",
  "flac",
  "zip",
  "gz",
  "br",
  "7z",
  "rar",
  "xz",
  "bz2",
  "tgz",
  "tar.gz",
  "pdf",
  "docx",
  "xlsx",
  "pptx",
  "odt",
  "epub",
]);

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function getExt(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith(".tar.gz")) return "tar.gz";
  const m = lower.match(/\.([^.]+)$/);
  return m ? m[1] : "";
}

async function transform(blob: Blob, algo: Algo, mode: Mode): Promise<Blob> {
  const stream =
    mode === "compress"
      ? blob.stream().pipeThrough(new CompressionStream(algo))
      : blob.stream().pipeThrough(new DecompressionStream(algo));
  return new Response(stream).blob();
}

function downloadName(srcName: string, algo: Algo, mode: Mode): string {
  if (mode === "compress") {
    return `${srcName}.${ALGO_EXT[algo]}`;
  }
  // Decompress — strip the algo extension if present.
  const ext = ALGO_EXT[algo];
  const re = new RegExp(`\\.${ext}$`, "i");
  if (re.test(srcName)) return srcName.replace(re, "");
  return `${srcName}.decoded`;
}

export default function Component() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>("compress");
  const [algo, setAlgo] = useState<Algo>("gzip");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    url: string;
    size: number;
    name: string;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (result) URL.revokeObjectURL(result.url);
    };
  }, [result]);

  // Auto-pick algorithm + mode when user drops a known-compressed file.
  const onFile = useCallback((f: File) => {
    setError("");
    setResult((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
    setFile(f);
    const ext = getExt(f.name);
    if (ext === "gz" || ext === "tar.gz") {
      setMode("decompress");
      setAlgo("gzip");
    } else if (ext === "zz") {
      setMode("decompress");
      setAlgo("deflate");
    } else {
      setMode("compress");
    }
  }, []);

  const onPick = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) onFile(f);
      e.target.value = "";
    },
    [onFile],
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const f = e.dataTransfer.files?.[0];
      if (f) onFile(f);
    },
    [onFile],
  );

  const run = useCallback(async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const blob = await transform(file, algo, mode);
      if (result) URL.revokeObjectURL(result.url);
      setResult({
        url: URL.createObjectURL(blob),
        size: blob.size,
        name: downloadName(file.name, algo, mode),
      });
    } catch (e) {
      setError(
        e instanceof Error
          ? mode === "decompress"
            ? `Couldn't decompress: ${e.message}. The file might not be ${algo}, or it's corrupted.`
            : e.message
          : "Operation failed.",
      );
    } finally {
      setBusy(false);
    }
  }, [file, algo, mode, result]);

  const ratio =
    result && file && mode === "compress"
      ? (result.size / file.size) * 100
      : null;
  const savings =
    result && file && mode === "compress" ? file.size - result.size : null;

  const ext = file ? getExt(file.name) : "";
  const showAlreadyCompressedWarning =
    file && mode === "compress" && ALREADY_COMPRESSED.has(ext);

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
          className="hidden"
          onChange={onPick}
        />
        {file ? (
          <div className="space-y-1">
            <div className="text-sm font-medium">{file.name}</div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>
              {fmtBytes(file.size)}
              {ext ? ` · .${ext}` : ""} · drop another to replace
            </div>
          </div>
        ) : (
          <div>
            <div className="text-sm font-medium">
              Drop any file here, or click to choose
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              Compresses with gzip / deflate using the browser&apos;s native
              <span className="mono"> CompressionStream</span>. Nothing leaves
              your machine.
            </div>
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label>Mode</Label>
          <div className="mt-1.5">
            <SegmentedControl<Mode>
              value={mode}
              onChange={setMode}
              options={[
                { value: "compress", label: "Compress" },
                { value: "decompress", label: "Decompress" },
              ]}
            />
          </div>
        </div>
        <div>
          <Label>Algorithm</Label>
          <div className="mt-1.5">
            <SegmentedControl<Algo>
              value={algo}
              onChange={setAlgo}
              options={[
                { value: "gzip", label: "gzip" },
                { value: "deflate", label: "deflate" },
                { value: "deflate-raw", label: "raw" },
              ]}
            />
          </div>
        </div>
      </div>

      {showAlreadyCompressedWarning && (
        <div
          className="rounded-md px-3 py-2 text-xs"
          style={{
            background: "color-mix(in srgb, #d4a017 18%, var(--surface))",
            color: "color-mix(in srgb, #b48000 80%, var(--fg))",
            border: "1px solid color-mix(in srgb, #d4a017 35%, var(--border))",
          }}
        >
          .{ext} files are already compressed — gzip will save little or
          nothing, and may end up <em>larger</em> after the gzip header.
          {ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "webp"
            ? " For images, try the Image Format Converter with a lower quality."
            : ""}
        </div>
      )}

      <ErrorNote>{error}</ErrorNote>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="accent"
          disabled={!file || busy}
          onClick={() => void run()}
        >
          {busy
            ? mode === "compress"
              ? "Compressing…"
              : "Decompressing…"
            : mode === "compress"
              ? `Compress with ${algo}`
              : `Decompress with ${algo}`}
        </Button>
        {result && (
          <a href={result.url} download={result.name} className="skeuo-btn">
            Download {result.name} · {fmtBytes(result.size)}
          </a>
        )}
      </div>

      {result && file && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="skeuo-panel p-3 text-center">
            <Label>Input</Label>
            <div
              className="mt-1 mono text-lg skeuo-emboss"
              style={{ color: "var(--fg)" }}
            >
              {fmtBytes(file.size)}
            </div>
          </div>
          <div className="skeuo-panel p-3 text-center">
            <Label>Output</Label>
            <div
              className="mt-1 mono text-lg skeuo-emboss"
              style={{ color: "var(--fg)" }}
            >
              {fmtBytes(result.size)}
            </div>
          </div>
          {mode === "compress" && ratio != null && (
            <>
              <div className="skeuo-panel p-3 text-center">
                <Label>Ratio</Label>
                <div
                  className="mt-1 mono text-lg skeuo-emboss"
                  style={{
                    color:
                      ratio < 100
                        ? "color-mix(in srgb, #2ecc71 70%, var(--fg))"
                        : "color-mix(in srgb, #c0392b 70%, var(--fg))",
                  }}
                >
                  {ratio.toFixed(1)}%
                </div>
              </div>
              <div className="skeuo-panel p-3 text-center">
                <Label>Savings</Label>
                <div
                  className="mt-1 mono text-lg skeuo-emboss"
                  style={{
                    color:
                      (savings ?? 0) > 0
                        ? "color-mix(in srgb, #2ecc71 70%, var(--fg))"
                        : "color-mix(in srgb, #c0392b 70%, var(--fg))",
                  }}
                >
                  {(savings ?? 0) >= 0 ? "−" : "+"}
                  {fmtBytes(Math.abs(savings ?? 0))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <p className="text-[11px]" style={{ color: "var(--muted)" }}>
        gzip and deflate work great on text — JSON, CSV, logs, source code, SQL
        dumps. They don&apos;t shrink already-encoded media (JPEG, PNG, MP4,
        ZIP). For lossy image compression, use the Image Format Converter.
      </p>
    </>
  );
}
