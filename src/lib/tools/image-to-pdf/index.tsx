"use client";

import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  ErrorNote,
  FieldRow,
  Label,
  Range,
  SegmentedControl,
} from "@/components/ui";

type PageSize = "A4" | "Letter" | "Auto";
type Orientation = "portrait" | "landscape" | "auto";

const PAGE_DIM_PT: Record<Exclude<PageSize, "Auto">, [number, number]> = {
  A4: [595.28, 841.89],
  Letter: [612, 792],
};

interface Item {
  id: string;
  file: File;
  url: string;
  width: number;
  height: number;
}

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

async function loadImage(url: string) {
  const img = new Image();
  img.src = url;
  await img.decode();
  return img;
}

export default function Component() {
  const [items, setItems] = useState<Item[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>("A4");
  const [orientation, setOrientation] = useState<Orientation>("auto");
  const [margin, setMargin] = useState(24);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [outSize, setOutSize] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Free URLs we own when items change.
  useEffect(() => {
    return () => {
      items.forEach((it) => URL.revokeObjectURL(it.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (outUrl) URL.revokeObjectURL(outUrl);
    };
  }, [outUrl]);

  const addFiles = useCallback(async (files: FileList | File[]) => {
    setError("");
    const next: Item[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const url = URL.createObjectURL(file);
      try {
        const img = await loadImage(url);
        next.push({
          id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
          file,
          url,
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      } catch {
        URL.revokeObjectURL(url);
      }
    }
    if (!next.length) {
      setError("None of those files looked like decodable images.");
      return;
    }
    setItems((prev) => [...prev, ...next]);
  }, []);

  const onPick = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) void addFiles(e.target.files);
      e.target.value = "";
    },
    [addFiles],
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (e.dataTransfer.files) void addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const it = prev.find((p) => p.id === id);
      if (it) URL.revokeObjectURL(it.url);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const move = useCallback((id: string, dir: -1 | 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx < 0) return prev;
      const j = idx + dir;
      if (j < 0 || j >= prev.length) return prev;
      const copy = prev.slice();
      [copy[idx], copy[j]] = [copy[j], copy[idx]];
      return copy;
    });
  }, []);

  const clearAll = useCallback(() => {
    items.forEach((it) => URL.revokeObjectURL(it.url));
    setItems([]);
    if (outUrl) URL.revokeObjectURL(outUrl);
    setOutUrl(null);
    setOutSize(0);
  }, [items, outUrl]);

  const generate = useCallback(async () => {
    if (!items.length) return;
    setBusy(true);
    setError("");
    try {
      const { default: jsPDF } = await import("jspdf");

      // Determine first page's orientation/dimensions to seed the doc.
      const firstOrient =
        orientation === "auto"
          ? items[0].width >= items[0].height
            ? "landscape"
            : "portrait"
          : orientation;

      const doc = new jsPDF({
        unit: "pt",
        format: pageSize === "Auto" ? [items[0].width, items[0].height] : pageSize,
        orientation: firstOrient,
        compress: true,
      });

      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const orient =
          orientation === "auto"
            ? it.width >= it.height
              ? "landscape"
              : "portrait"
            : orientation;

        if (i > 0) {
          doc.addPage(
            pageSize === "Auto" ? [it.width, it.height] : pageSize,
            orient,
          );
        }

        const [pageW, pageH] =
          pageSize === "Auto"
            ? [it.width, it.height]
            : orient === "landscape"
              ? [PAGE_DIM_PT[pageSize][1], PAGE_DIM_PT[pageSize][0]]
              : PAGE_DIM_PT[pageSize];

        const m = pageSize === "Auto" ? 0 : margin;
        const availW = pageW - m * 2;
        const availH = pageH - m * 2;
        const scale = Math.min(availW / it.width, availH / it.height);
        const drawW = it.width * scale;
        const drawH = it.height * scale;
        const x = (pageW - drawW) / 2;
        const y = (pageH - drawH) / 2;

        // Re-encode source as a data URL via canvas so jsPDF can embed.
        const img = await loadImage(it.url);
        const canvas = document.createElement("canvas");
        canvas.width = it.width;
        canvas.height = it.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas 2D context unavailable.");
        ctx.drawImage(img, 0, 0);
        // Use JPEG for non-PNG sources to keep file size sane; keep PNG for
        // anything with potential transparency / sharp edges.
        const isPng = it.file.type === "image/png";
        const dataUrl = canvas.toDataURL(
          isPng ? "image/png" : "image/jpeg",
          isPng ? undefined : 0.92,
        );
        doc.addImage(
          dataUrl,
          isPng ? "PNG" : "JPEG",
          x,
          y,
          drawW,
          drawH,
          undefined,
          "FAST",
        );
      }

      const blob = doc.output("blob") as Blob;
      if (outUrl) URL.revokeObjectURL(outUrl);
      setOutUrl(URL.createObjectURL(blob));
      setOutSize(blob.size);
    } catch (e) {
      setError(e instanceof Error ? e.message : "PDF generation failed.");
    } finally {
      setBusy(false);
    }
  }, [items, pageSize, orientation, margin, outUrl]);

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
          multiple
          className="hidden"
          onChange={onPick}
        />
        <div className="text-sm font-medium">
          Drop images here, or click to add
        </div>
        <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
          One PDF page per image. Add as many as you need.
        </div>
      </div>

      {items.length > 0 && (
        <FieldRow
          label={`Pages (${items.length})`}
          actions={
            <button
              type="button"
              className="skeuo-btn skeuo-btn-sm skeuo-btn-ghost"
              onClick={clearAll}
            >
              Clear all
            </button>
          }
        >
          <ul className="space-y-2">
            {items.map((it, i) => (
              <li
                key={it.id}
                className="flex items-center gap-3 skeuo-panel p-2 min-w-0"
              >
                <span className="mono text-xs w-6 text-center" style={{ color: "var(--muted)" }}>
                  {i + 1}
                </span>
                <div className="size-12 shrink-0 rounded-md overflow-hidden bg-[color:var(--surface-lo)] grid place-items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={it.url}
                    alt=""
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{it.file.name}</div>
                  <div className="text-[11px]" style={{ color: "var(--muted)" }}>
                    {it.width}×{it.height} · {fmtBytes(it.file.size)}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="skeuo-btn skeuo-btn-sm"
                    onClick={() => move(it.id, -1)}
                    disabled={i === 0}
                    aria-label="Move up"
                  >
                    <ChevronUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    className="skeuo-btn skeuo-btn-sm"
                    onClick={() => move(it.id, 1)}
                    disabled={i === items.length - 1}
                    aria-label="Move down"
                  >
                    <ChevronDown className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    className="skeuo-btn skeuo-btn-sm"
                    onClick={() => remove(it.id)}
                    aria-label="Remove"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </FieldRow>
      )}

      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <Label>Page size</Label>
          <div className="mt-1.5">
            <SegmentedControl<PageSize>
              value={pageSize}
              onChange={setPageSize}
              options={[
                { value: "A4", label: "A4" },
                { value: "Letter", label: "Letter" },
                { value: "Auto", label: "Image" },
              ]}
            />
          </div>
        </div>
        <div>
          <Label>Orientation</Label>
          <div className="mt-1.5">
            <SegmentedControl<Orientation>
              value={orientation}
              onChange={setOrientation}
              options={[
                { value: "auto", label: "Auto" },
                { value: "portrait", label: "Portrait" },
                { value: "landscape", label: "Landscape" },
              ]}
            />
          </div>
        </div>
        <div>
          <Label>Margin — {pageSize === "Auto" ? "0 (auto-fit)" : `${margin}pt`}</Label>
          <div className="mt-1.5">
            <Range
              min={0}
              max={72}
              step={4}
              value={margin}
              disabled={pageSize === "Auto"}
              onChange={(e) => setMargin(parseInt(e.target.value, 10))}
            />
          </div>
        </div>
      </div>

      <ErrorNote>{error}</ErrorNote>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="accent"
          disabled={!items.length || busy}
          onClick={() => void generate()}
        >
          {busy ? "Generating…" : "Build PDF"}
        </Button>
        {outUrl && (
          <a href={outUrl} download="images.pdf" className="skeuo-btn">
            Download PDF · {fmtBytes(outSize)}
          </a>
        )}
      </div>
    </>
  );
}
