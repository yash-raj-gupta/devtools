"use client";

import { useMemo, useState } from "react";
import { CopyButton, FieldRow, Input } from "@/components/ui";

type RGB = { r: number; g: number; b: number; a: number };

function parseColor(input: string): RGB | null {
  const s = input.trim();
  if (!s) return null;

  const hex = s.match(/^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) h = h.split("").map((c) => c + c).join("");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return { r, g, b, a };
  }

  const rgb = s.match(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)(?:[\s,/]+(\d*\.?\d+))?\s*\)/i);
  if (rgb) {
    return {
      r: Math.min(255, +rgb[1]),
      g: Math.min(255, +rgb[2]),
      b: Math.min(255, +rgb[3]),
      a: rgb[4] !== undefined ? Math.min(1, +rgb[4]) : 1,
    };
  }

  const hsl = s.match(/hsla?\(\s*(\d*\.?\d+)[\s,]+(\d*\.?\d+)%[\s,]+(\d*\.?\d+)%(?:[\s,/]+(\d*\.?\d+))?\s*\)/i);
  if (hsl) {
    const { r, g, b } = hslToRgb(+hsl[1], +hsl[2] / 100, +hsl[3] / 100);
    return { r, g, b, a: hsl[4] !== undefined ? +hsl[4] : 1 };
  }

  return null;
}

function hslToRgb(h: number, s: number, l: number) {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else[r, g, b] = [c, 0, x];
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function rgbToHsl({ r, g, b }: RGB) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function toHex(c: RGB) {
  const h = (n: number) => n.toString(16).padStart(2, "0");
  const base = `#${h(c.r)}${h(c.g)}${h(c.b)}`;
  return c.a < 1 ? base + h(Math.round(c.a * 255)) : base;
}

export default function Component() {
  const [input, setInput] = useState("#4f46e5");
  const parsed = useMemo(() => parseColor(input), [input]);

  const hsl = parsed && rgbToHsl(parsed);
  const hex = parsed && toHex(parsed);
  const rgbStr = parsed
    ? parsed.a < 1
      ? `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${parsed.a})`
      : `rgb(${parsed.r}, ${parsed.g}, ${parsed.b})`
    : "";
  const hslStr = hsl
    ? parsed!.a < 1
      ? `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${parsed!.a})`
      : `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
    : "";

  return (
    <>
      <FieldRow label="Color (hex / rgb / hsl)">
        <Input
          mono
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="#4f46e5 or rgb(79, 70, 229) or hsl(243, 75%, 59%)"
        />
      </FieldRow>

      <div
        className="rounded-md border h-24 w-full"
        style={{ background: parsed ? rgbStr : "transparent" }}
      />

      {parsed ? (
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { label: "HEX", value: hex! },
            { label: "RGB", value: rgbStr },
            { label: "HSL", value: hslStr },
          ].map((v) => (
            <div key={v.label} className="rounded-md border p-3 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs uppercase tracking-wide text-[color:var(--color-muted)]">{v.label}</span>
                <CopyButton value={v.value} />
              </div>
              <div className="mono text-sm break-all">{v.value}</div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-red-500">Could not parse color.</p>
      )}
    </>
  );
}
