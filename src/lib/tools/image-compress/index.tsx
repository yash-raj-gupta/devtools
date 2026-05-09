"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  Checkbox,
  ErrorNote,
  FieldRow,
  Input,
  Label,
  SegmentedControl,
} from "@/components/ui";

type Target = "image/jpeg" | "image/webp";
type Unit = "KB" | "MB";

const TARGET_LABEL: Record<Target, string> = {
  "image/jpeg": "JPEG",
  "image/webp": "WebP",
};

const TARGET_EXT: Record<Target, string> = {
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const UNIT_BYTES: Record<Unit, number> = {
  KB: 1024,
  MB: 1024 * 1024,
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
  hasAlpha: boolean;
}

interface Result {
  url: string;
  blob: Blob;
  width: number;
  height: number;
  quality: number;
  iterations: number;
  hitTarget: boolean;
  resizedFrom?: { width: number; height: number };
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.src = url;
  await img.decode();
  return img;
}

// Probe the source for transparency by sampling a downscaled copy.
async function detectAlpha(img: HTMLImageElement): Promise<boolean> {
  const w = Math.min(64, img.naturalWidth);
  const h = Math.min(64, img.naturalHeight);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) return false;
  ctx.drawImage(img, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) return true;
  }
  return false;
}

function drawTo(
  img: HTMLImageElement,
  width: number,
  height: number,
  fillWhite: boolean,
): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable.");
  if (fillWhite) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);
  return c;
}

async function encode(
  canvas: HTMLCanvasElement,
  type: Target,
  quality: number,
): Promise<Blob> {
  const blob: Blob | null = await new Promise((res) =>
    canvas.toBlob(res, type, quality),
  );
  if (!blob) throw new Error(`Browser refused to encode ${TARGET_LABEL[type]}.`);
  return blob;
}

// Find the best quality ≤ target via binary search. Returns `null` if even
// the lowest quality exceeds the target.
async function searchQuality(
  canvas: HTMLCanvasElement,
  type: Target,
  budget: number,
): Promise<{ blob: Blob; quality: number; iterations: number } | null> {
  const QMIN = 0.05;
  const QMAX = 0.98;
  const ITERS = 8;

  // First check if minimum quality already busts the budget.
  let lo = QMIN;
  let hi = QMAX;
  let bestUnder: { blob: Blob; quality: number } | null = null;
  let iterations = 0;

  // Early-out at the top: if max quality already fits, take it.
  iterations++;
  const topBlob = await encode(canvas, type, hi);
  if (topBlob.size <= budget) {
    return { blob: topBlob, quality: hi, iterations };
  }

  // Early-out at the bottom: if even min quality is too big, give up.
  iterations++;
  const bottomBlob = await encode(canvas, type, lo);
  if (bottomBlob.size > budget) {
    return null;
  }
  bestUnder = { blob: bottomBlob, quality: lo };

  for (let i = 0; i < ITERS - 2; i++) {
    iterations++;
    const mid = (lo + hi) / 2;
    const blob = await encode(canvas, type, mid);
    if (blob.size <= budget) {
      bestUnder = { blob, quality: mid };
      lo = mid;
    } else {
      hi = mid;
    }
    if (hi - lo < 0.02) break;
  }

  return bestUnder ? { ...bestUnder, iterations } : null;
}

export default function Component() {
  const [source, setSource] = useState<SourceImg | null>(null);
  const [target, setTarget] = useState<Target>("image/jpeg");
  const [budgetN, setBudgetN] = useState(200);
  const [unit, setUnit] = useState<Unit>("KB");
  const [autoResize, setAutoResize] = useState(true);
  const [maxDim, setMaxDim] = useState(2400);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (source) URL.revokeObjectURL(source.url);
    };
  }, [source]);

  useEffect(() => {
    return () => {
      if (result) URL.revokeObjectURL(result.url);
    };
  }, [result]);

  const loadFile = useCallback(async (file: File) => {
    setError("");
    setResult(null);
    if (!file.type.startsWith("image/")) {
      setError("That doesn't look like an image.");
      return;
    }
    const url = URL.createObjectURL(file);
    let img: HTMLImageElement;
    try {
      img = await loadImage(url);
    } catch {
      URL.revokeObjectURL(url);
      setError("Couldn't decode that image. Try a different file.");
      return;
    }
    const hasAlpha = await detectAlpha(img);
    setSource({
      file,
      url,
      width: img.naturalWidth,
      height: img.naturalHeight,
      hasAlpha,
    });
    // Sensible default: WebP if transparent, JPEG if not.
    setTarget(hasAlpha ? "image/webp" : "image/jpeg");
  }, []);

  const onPick = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) void loadFile(f);
      e.target.value = "";
    },
    [loadFile],
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const f = e.dataTransfer.files?.[0];
      if (f) void loadFile(f);
    },
    [loadFile],
  );

  const compress = useCallback(async () => {
    if (!source) return;
    setBusy(true);
    setError("");
    if (result) {
      URL.revokeObjectURL(result.url);
      setResult(null);
    }
    try {
      const budget = budgetN * UNIT_BYTES[unit];
      if (!Number.isFinite(budget) || budget <= 1024) {
        setError("Pick a budget of at least 1 KB.");
        setBusy(false);
        return;
      }

      const img = await loadImage(source.url);
      const fillWhite = target === "image/jpeg";
      let totalIters = 0;
      let resizedFrom: Result["resizedFrom"];

      // Apply user-set dimension cap up-front (if it's smaller than the
      // image). Then if quality alone can't fit the budget and auto-resize
      // is on, halve until it does (or we hit a 256px floor).
      let curW = img.naturalWidth;
      let curH = img.naturalHeight;
      if (maxDim > 0 && (curW > maxDim || curH > maxDim)) {
        const s = maxDim / Math.max(curW, curH);
        curW = Math.round(curW * s);
        curH = Math.round(curH * s);
        resizedFrom = {
          width: img.naturalWidth,
          height: img.naturalHeight,
        };
      }

      const MIN_FLOOR = 256;
      let attempt: { blob: Blob; quality: number; iterations: number } | null =
        null;

      while (true) {
        const canvas = drawTo(img, curW, curH, fillWhite);
        const got = await searchQuality(canvas, target, budget);
        totalIters += got?.iterations ?? 0;
        if (got) {
          attempt = got;
          break;
        }
        if (!autoResize || Math.max(curW, curH) <= MIN_FLOOR) break;
        // Couldn't fit at this size — halve and retry.
        if (!resizedFrom) {
          resizedFrom = {
            width: img.naturalWidth,
            height: img.naturalHeight,
          };
        }
        const next = Math.max(MIN_FLOOR, Math.floor(Math.max(curW, curH) / 2));
        const s = next / Math.max(curW, curH);
        curW = Math.max(1, Math.round(curW * s));
        curH = Math.max(1, Math.round(curH * s));
      }

      if (!attempt) {
        // Couldn't hit the budget. Fall back to lowest-quality full-size
        // attempt so the user still has something to look at.
        const canvas = drawTo(img, curW, curH, fillWhite);
        const fallback = await encode(canvas, target, 0.05);
        totalIters += 1;
        const url = URL.createObjectURL(fallback);
        setResult({
          url,
          blob: fallback,
          width: curW,
          height: curH,
          quality: 0.05,
          iterations: totalIters,
          hitTarget: false,
          resizedFrom,
        });
        setError(
          `Couldn't hit ${budgetN} ${unit}. Best we could do is ${fmtBytes(
            fallback.size,
          )}. ${
            !autoResize
              ? "Enable auto-resize, or"
              : "Try a smaller max dimension, or"
          } a higher budget.`,
        );
      } else {
        const url = URL.createObjectURL(attempt.blob);
        setResult({
          url,
          blob: attempt.blob,
          width: curW,
          height: curH,
          quality: attempt.quality,
          iterations: totalIters,
          hitTarget: true,
          resizedFrom,
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Compression failed.");
    } finally {
      setBusy(false);
    }
  }, [source, target, budgetN, unit, autoResize, maxDim, result]);

  const downloadName = source
    ? `${source.file.name.replace(/\.[^.]+$/, "")}-compressed.${TARGET_EXT[target]}`
    : `compressed.${TARGET_EXT[target]}`;

  const willLoseAlpha = source?.hasAlpha && target === "image/jpeg";

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
          <div className="space-y-1">
            <div className="text-sm font-medium">{source.file.name}</div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>
              {source.width}×{source.height} · {fmtBytes(source.file.size)}
              {source.hasAlpha ? " · has transparency" : ""} · drop another to
              replace
            </div>
          </div>
        ) : (
          <div>
            <div className="text-sm font-medium">
              Drop an image here, or click to choose
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              Set a target size, hit Compress — we&apos;ll find the highest
              quality that fits.
            </div>
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <FieldRow label="Target size">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              step={1}
              value={budgetN}
              onChange={(e) => setBudgetN(parseFloat(e.target.value || "0"))}
              mono
              className="flex-1"
            />
            <SegmentedControl<Unit>
              value={unit}
              onChange={setUnit}
              options={[
                { value: "KB", label: "KB" },
                { value: "MB", label: "MB" },
              ]}
            />
          </div>
        </FieldRow>
        <FieldRow label="Output format">
          <SegmentedControl<Target>
            value={target}
            onChange={setTarget}
            options={[
              { value: "image/jpeg", label: "JPEG" },
              { value: "image/webp", label: "WebP" },
            ]}
          />
        </FieldRow>
      </div>

      <FieldRow
        label="Max dimension (longest edge, px)"
        hint="Caps the image up-front. If quality alone can't hit the budget and auto-resize is on, we'll halve from here until it fits (floor 256 px)."
      >
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-xs">
            <Checkbox
              checked={autoResize}
              onChange={(e) => setAutoResize(e.target.checked)}
            />
            <span style={{ color: "var(--muted)" }}>
              Auto-resize if needed
            </span>
          </label>
          <Input
            type="number"
            min={256}
            step={64}
            value={maxDim}
            onChange={(e) => setMaxDim(parseInt(e.target.value || "0", 10))}
            mono
            className="max-w-[140px]"
          />
        </div>
      </FieldRow>

      {willLoseAlpha && (
        <div
          className="rounded-md px-3 py-2 text-xs"
          style={{
            background: "color-mix(in srgb, #d4a017 18%, var(--surface))",
            color: "color-mix(in srgb, #b48000 80%, var(--fg))",
            border: "1px solid color-mix(in srgb, #d4a017 35%, var(--border))",
          }}
        >
          This image has transparency. JPEG flattens it onto a white
          background — pick <strong>WebP</strong> if you need to keep the
          alpha channel.
        </div>
      )}

      <ErrorNote>{error}</ErrorNote>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="accent"
          disabled={!source || busy}
          onClick={() => void compress()}
        >
          {busy ? "Compressing…" : `Compress to ≤ ${budgetN} ${unit}`}
        </Button>
        {result && (
          <a href={result.url} download={downloadName} className="skeuo-btn">
            Download {downloadName}
          </a>
        )}
      </div>

      {(source || result) && (
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
          {result && (
            <div className="skeuo-panel p-3 space-y-2 min-w-0">
              <Label>
                Compressed ({TARGET_LABEL[target]}
                {result.hitTarget ? "" : " · target missed"})
              </Label>
              <div className="rounded-md overflow-hidden bg-[color:var(--surface-lo)] grid place-items-center min-h-[160px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.url}
                  alt="compressed"
                  className="max-w-full max-h-[300px] object-contain"
                />
              </div>
              <div className="text-xs mono" style={{ color: "var(--muted)" }}>
                {result.width}×{result.height} · {fmtBytes(result.blob.size)}
                {source && (
                  <span
                    className="ml-2"
                    style={{
                      color:
                        result.blob.size <= source.file.size
                          ? "color-mix(in srgb, #2ecc71 70%, var(--fg))"
                          : "color-mix(in srgb, #c0392b 70%, var(--fg))",
                    }}
                  >
                    {result.blob.size <= source.file.size ? "−" : "+"}
                    {Math.abs(
                      Math.round(
                        ((result.blob.size - source.file.size) /
                          source.file.size) *
                          100,
                      ),
                    )}
                    %
                  </span>
                )}
              </div>
              <div
                className="text-[11px] mono"
                style={{ color: "var(--muted)" }}
              >
                Quality {Math.round(result.quality * 100)}% ·{" "}
                {result.iterations} encode{result.iterations === 1 ? "" : "s"}
                {result.resizedFrom &&
                  ` · resized from ${result.resizedFrom.width}×${result.resizedFrom.height}`}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
