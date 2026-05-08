"use client";

import { Download } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  ErrorNote,
  FieldRow,
  Label,
  Range,
  SegmentedControl,
} from "@/components/ui";

type Format = "image/png" | "image/jpeg";

const FORMAT_LABEL: Record<Format, string> = {
  "image/png": "PNG",
  "image/jpeg": "JPEG",
};

const FORMAT_EXT: Record<Format, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
};

interface PageOut {
  index: number;
  url: string;
  blob: Blob;
}

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export default function Component() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<Format>("image/png");
  const [scale, setScale] = useState(2);
  const [quality, setQuality] = useState(0.9);
  const [pages, setPages] = useState<PageOut[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      pages.forEach((p) => URL.revokeObjectURL(p.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = useCallback(() => {
    setPages((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.url));
      return [];
    });
    setProgress({ done: 0, total: 0 });
    setError("");
  }, []);

  const onPick = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) {
        if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
          setError("That doesn't look like a PDF.");
          return;
        }
        reset();
        setFile(f);
      }
      e.target.value = "";
    },
    [reset],
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const f = e.dataTransfer.files?.[0];
      if (f) {
        if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
          setError("That doesn't look like a PDF.");
          return;
        }
        reset();
        setFile(f);
      }
    },
    [reset],
  );

  const render = useCallback(async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    // Free previous output before generating new ones.
    pages.forEach((p) => URL.revokeObjectURL(p.url));
    setPages([]);

    try {
      const pdfjs = await import("pdfjs-dist");
      // Same-origin worker — bundler emits this as a static asset.
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();

      const buf = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: buf }).promise;
      setProgress({ done: 0, total: pdf.numPages });
      const out: PageOut[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas 2D context unavailable.");
        // White matte for JPEG (PDFs assume white).
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // pdfjs typings vary across versions — pass through what it expects.
        await page.render({
          canvasContext: ctx,
          viewport,
          canvas,
        } as unknown as Parameters<typeof page.render>[0]).promise;

        const blob = await new Promise<Blob | null>((res) =>
          canvas.toBlob(
            res,
            format,
            format === "image/jpeg" ? quality : undefined,
          ),
        );
        if (!blob) throw new Error(`Browser couldn't encode page ${i}.`);
        out.push({
          index: i,
          url: URL.createObjectURL(blob),
          blob,
        });
        setProgress({ done: i, total: pdf.numPages });
      }

      setPages(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't render the PDF.");
    } finally {
      setBusy(false);
    }
  }, [file, scale, format, quality, pages]);

  const baseName = file?.name.replace(/\.pdf$/i, "") ?? "page";

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
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={onPick}
        />
        {file ? (
          <div className="space-y-1">
            <div className="text-sm font-medium">{file.name}</div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>
              {fmtBytes(file.size)} · click or drop to replace
            </div>
          </div>
        ) : (
          <div>
            <div className="text-sm font-medium">
              Drop a PDF here, or click to choose
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              Each page is rendered to an image right in your browser.
            </div>
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <Label>Format</Label>
          <div className="mt-1.5">
            <SegmentedControl<Format>
              value={format}
              onChange={setFormat}
              options={[
                { value: "image/png", label: "PNG" },
                { value: "image/jpeg", label: "JPEG" },
              ]}
            />
          </div>
        </div>
        <div>
          <Label>Scale — {scale}× ({Math.round(scale * 72)} dpi)</Label>
          <div className="mt-1.5">
            <Range
              min={1}
              max={4}
              step={0.5}
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
            />
          </div>
        </div>
        {format === "image/jpeg" && (
          <div>
            <Label>JPEG quality — {Math.round(quality * 100)}%</Label>
            <div className="mt-1.5">
              <Range
                min={0.3}
                max={1}
                step={0.05}
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
              />
            </div>
          </div>
        )}
      </div>

      <ErrorNote>{error}</ErrorNote>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="accent"
          disabled={!file || busy}
          onClick={() => void render()}
        >
          {busy
            ? `Rendering ${progress.done}/${progress.total}…`
            : "Render pages"}
        </Button>
        {pages.length > 0 && (
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            {pages.length} page{pages.length === 1 ? "" : "s"} · click any
            thumbnail to download
          </span>
        )}
      </div>

      {pages.length > 0 && (
        <FieldRow label={`Pages (${pages.length})`}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {pages.map((p) => (
              <a
                key={p.index}
                href={p.url}
                download={`${baseName}-${String(p.index).padStart(3, "0")}.${FORMAT_EXT[format]}`}
                className="skeuo-panel p-2 space-y-1.5 hover:brightness-110 transition group"
                title={`Download page ${p.index}`}
              >
                <div className="rounded-md overflow-hidden bg-[color:var(--surface-lo)] grid place-items-center min-h-[120px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.url}
                    alt={`Page ${p.index}`}
                    className="max-w-full max-h-[200px] object-contain"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="mono">Page {p.index}</span>
                  <span
                    className="inline-flex items-center gap-1 opacity-70 group-hover:opacity-100"
                    style={{ color: "var(--muted)" }}
                  >
                    <Download className="size-3" />
                    {fmtBytes(p.blob.size)}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </FieldRow>
      )}
    </>
  );
}
