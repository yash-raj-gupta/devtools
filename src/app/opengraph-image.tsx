import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Curated short names for the chip wall.
const FEATURED_CHIPS: string[] = [
  "Base64",
  "JWT",
  "Hash",
  "UUID",
  "JSON",
  "Regex",
  "AES",
  "QR Code",
  "Markdown",
  "Diff",
  "Cron",
  "Image → PDF",
  "PDF → Images",
  "Spreadsheet",
  "Compress",
];

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 64,
          // Dark-theme palette from globals.css ([data-theme="dark"]).
          background:
            "radial-gradient(ellipse at 25% 20%, #3a2a18 0%, #1d160d 50%, #0e0a06 100%)",
          color: "#f0e3c0",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        {/* Subtle diagonal grain — barely-there warm streaks on dark. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            background:
              "repeating-linear-gradient(135deg, rgba(212,160,106,0.045) 0 14px, rgba(212,160,106,0) 14px 32px)",
          }}
        />

        {/* Soft warm glow top-left to lift the brand corner. */}
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -120,
            width: 520,
            height: 520,
            display: "flex",
            background:
              "radial-gradient(circle, rgba(212,160,106,0.18) 0%, rgba(212,160,106,0) 65%)",
          }}
        />

        {/* ── Header ────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 80,
                height: 80,
                borderRadius: 18,
                background:
                  "linear-gradient(180deg, #e8be8a 0%, #d4a06a 50%, #8a5424 100%)",
                boxShadow:
                  "inset 0 3px 0 rgba(255,250,225,0.4), inset 0 -3px 0 rgba(15,10,4,0.55), 0 6px 20px rgba(0,0,0,0.45)",
                border: "1px solid #6a3d12",
              }}
            >
              <span
                style={{
                  display: "flex",
                  fontSize: 56,
                  fontWeight: 800,
                  color: "#1d160d",
                  lineHeight: 1,
                  marginTop: -4,
                }}
              >
                T
              </span>
            </div>
            <span
              style={{
                display: "flex",
                fontSize: 50,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "#f0e3c0",
              }}
            >
              {siteConfig.name}
            </span>
          </div>
          <span
            style={{
              display: "flex",
              fontSize: 22,
              color: "#a89572",
              fontFamily: "system-ui, sans-serif",
              fontWeight: 500,
              letterSpacing: "0.02em",
            }}
          >
            {siteConfig.host}
          </span>
        </div>

        {/* ── Hero ──────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 56,
            gap: 18,
          }}
        >
          <span
            style={{
              display: "flex",
              fontSize: 86,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              color: "#f5e8c4",
            }}
          >
            A workshop of small,
          </span>
          <span
            style={{
              display: "flex",
              fontSize: 86,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              color: "#d4a06a",
            }}
          >
            sharp tools.
          </span>
          <span
            style={{
              display: "flex",
              fontSize: 26,
              color: "#c0aa7e",
              fontFamily: "system-ui, sans-serif",
              lineHeight: 1.4,
              marginTop: 6,
            }}
          >
            Encode, hash, generate, convert, compress — all in your browser.
          </span>
        </div>

        {/* ── Tool chip wall ────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            marginTop: 36,
          }}
        >
          {FEATURED_CHIPS.map((name) => (
            <div
              key={name}
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: 22,
                fontFamily: "system-ui, sans-serif",
                fontWeight: 500,
                color: "#f0e3c0",
                padding: "9px 18px",
                borderRadius: 999,
                background:
                  "linear-gradient(180deg, rgba(58,42,24,0.95) 0%, rgba(31,22,12,0.95) 100%)",
                border: "1px solid rgba(138,106,62,0.55)",
                boxShadow:
                  "inset 0 1px 0 rgba(232,190,138,0.18), 0 2px 6px rgba(0,0,0,0.35)",
              }}
            >
              {name}
            </div>
          ))}
        </div>

        {/* ── Footer features ───────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: "auto",
            paddingTop: 28,
            fontFamily: "system-ui, sans-serif",
            fontSize: 22,
            color: "#a89572",
            fontWeight: 500,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                display: "flex",
                width: 11,
                height: 11,
                borderRadius: 999,
                background: "#3ddc84",
                boxShadow: "0 0 0 4px rgba(61,220,132,0.18)",
              }}
            />
            <span style={{ display: "flex", color: "#d0bf95" }}>
              Runs in your browser
            </span>
          </div>
          <span
            style={{ display: "flex", color: "#5a4426", margin: "0 16px" }}
          >
            ·
          </span>
          <span style={{ display: "flex" }}>No tracking</span>
          <span
            style={{ display: "flex", color: "#5a4426", margin: "0 16px" }}
          >
            ·
          </span>
          <span style={{ display: "flex" }}>No uploads</span>
          <span
            style={{ display: "flex", color: "#5a4426", margin: "0 16px" }}
          >
            ·
          </span>
          <span style={{ display: "flex" }}>No signup</span>
        </div>
      </div>
    ),
    size,
  );
}
