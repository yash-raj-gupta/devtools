"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";
import {
  Button,
  CopyButton,
  ErrorNote,
  FieldRow,
  Input,
  Label,
  SegmentedControl,
  Textarea,
} from "@/components/ui";

type EC = "L" | "M" | "Q" | "H";

export default function Component() {
  const [text, setText] = useState("https://toolbench.app");
  const [size, setSize] = useState(320);
  const [ec, setEc] = useState<EC>("M");
  const [fg, setFg] = useState("#1d160d");
  const [bg, setBg] = useState("#fdf8ec");
  const [dataUrl, setDataUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!text) {
      setDataUrl("");
      setError("");
      return;
    }
    QRCode.toDataURL(text, {
      width: size,
      margin: 2,
      errorCorrectionLevel: ec,
      color: { dark: fg, light: bg },
    })
      .then((url) => {
        if (!cancelled) {
          setDataUrl(url);
          setError("");
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to render QR");
          setDataUrl("");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [text, size, ec, fg, bg]);

  return (
    <>
      <FieldRow label="Content">
        <Textarea
          mono={false}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="A URL, plain text, vCard, Wi-Fi config…"
          className="min-h-[100px]"
        />
      </FieldRow>

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label>Size: {size}px</Label>
          <input
            type="range"
            min={128}
            max={640}
            step={16}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="skeuo-range"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Error correction</Label>
          <SegmentedControl<EC>
            value={ec}
            onChange={setEc}
            options={[
              { value: "L", label: "L" },
              { value: "M", label: "M" },
              { value: "Q", label: "Q" },
              { value: "H", label: "H" },
            ]}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Colors</Label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={fg}
              onChange={(e) => setFg(e.target.value)}
              className="h-9 w-12 rounded skeuo-inset border-0 cursor-pointer"
              title="Foreground"
            />
            <input
              type="color"
              value={bg}
              onChange={(e) => setBg(e.target.value)}
              className="h-9 w-12 rounded skeuo-inset border-0 cursor-pointer"
              title="Background"
            />
          </div>
        </div>
      </div>

      <ErrorNote>{error}</ErrorNote>

      <div className="flex flex-col items-center gap-3">
        <div className="skeuo-stage p-5">
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={dataUrl}
              alt="QR code"
              width={size}
              height={size}
              style={{ width: size, height: size, imageRendering: "pixelated" }}
            />
          ) : (
            <div
              style={{ width: size, height: size, color: "var(--muted)" }}
              className="grid place-items-center text-sm"
            >
              Empty
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          <a
            href={dataUrl || "#"}
            download="qrcode.png"
            className={`skeuo-btn ${dataUrl ? "" : "opacity-50 pointer-events-none"}`}
          >
            Download PNG
          </a>
          <CopyButton value={dataUrl} />
        </div>
      </div>
    </>
  );
}
