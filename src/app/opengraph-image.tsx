import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";
import { tools } from "@/lib/tools/registry";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// A curated set of well-known tool names so the card teaches at a glance
// what's inside. Pulled from the live registry (best-effort; falls back to
// a static list if anything is renamed).
const FEATURED_NAMES = (() => {
  const want = [
    "base64",
    "jwt",
    "hash",
    "uuid",
    "json",
    "regex",
    "qrcode",
    "aes",
    "markdown",
    "cron",
    "diff",
    "image-compress",
    "image-to-pdf",
    "spreadsheet",
  ];
  const out: string[] = [];
  for (const slug of want) {
    const t = tools.find((x) => x.slug === slug);
    if (!t) continue;
    // Trim verbose names down to a short chip.
    out.push(
      t.name
        .replace(/\s*Encode\s*\/\s*Decode$/i, "")
        .replace(/\s*Generator$/i, "")
        .replace(/\s*Decoder$/i, "")
        .replace(/\s*Tester$/i, "")
        .replace(/\s*Format\s*&\s*Validate$/i, "")
        .replace(/\s*Preview$/i, "")
        .replace(/\s*Converter$/i, "")
        .replace(/\s*Compressor$/i, "")
        .trim(),
    );
  }
  return out.length ? out : ["Base64", "JWT", "Hash", "UUID", "JSON", "Regex"];
})();

export default function OG() {
  const count = siteConfig.toolCount;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 56,
          background:
            "radial-gradient(ellipse at 30% 20%, #fff5db 0%, #ecdfb6 45%, #c8b07f 100%)",
          color: "#2b2014",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        {/* subtle diagonal stripe pattern band, evokes wood grain */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "repeating-linear-gradient(135deg, rgba(122,72,24,0.04) 0 14px, rgba(122,72,24,0) 14px 32px)",
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
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 72,
                height: 72,
                borderRadius: 16,
                background:
                  "linear-gradient(180deg, #f0d28a 0%, #c98c3e 50%, #7a4818 100%)",
                boxShadow:
                  "inset 0 3px 0 rgba(255,250,225,0.55), inset 0 -3px 0 rgba(40,25,5,0.4), 0 4px 14px rgba(60,35,10,0.25)",
                border: "1px solid #6a3d12",
              }}
            >
              <span
                style={{
                  display: "flex",
                  fontSize: 50,
                  fontWeight: 800,
                  color: "#3a230d",
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
                fontSize: 44,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "#2b2014",
              }}
            >
              {siteConfig.name}
            </span>
          </div>
          <span
            style={{
              display: "flex",
              fontSize: 22,
              color: "#7d6a4a",
              fontFamily: "system-ui, sans-serif",
              fontWeight: 500,
              letterSpacing: "0.02em",
            }}
          >
            {siteConfig.host}
          </span>
        </div>

        {/* ── Hero row ──────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 40,
            marginTop: 36,
          }}
        >
          {/* Brass number plate */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: 280,
              height: 220,
              borderRadius: 22,
              background:
                "linear-gradient(180deg, #f3d68f 0%, #d49a47 45%, #8a5424 100%)",
              boxShadow:
                "inset 0 4px 0 rgba(255,250,225,0.6), inset 0 -4px 0 rgba(40,25,5,0.45), 0 12px 28px -6px rgba(60,35,10,0.45)",
              border: "2px solid #6a3d12",
            }}
          >
            <span
              style={{
                display: "flex",
                fontSize: 168,
                fontWeight: 800,
                color: "#2b1a08",
                lineHeight: 0.9,
                letterSpacing: "-0.04em",
                textShadow: "0 2px 0 rgba(255,250,225,0.4)",
              }}
            >
              {count}
            </span>
            <span
              style={{
                display: "flex",
                fontSize: 26,
                fontWeight: 600,
                color: "#3a230d",
                fontFamily: "system-ui, sans-serif",
                letterSpacing: "0.18em",
                marginTop: 6,
              }}
            >
              TOOLS
            </span>
          </div>

          {/* Headline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              flex: 1,
            }}
          >
            <span
              style={{
                display: "flex",
                fontSize: 64,
                fontWeight: 700,
                letterSpacing: "-0.025em",
                lineHeight: 1.05,
                color: "#2b2014",
              }}
            >
              A workshop of
              <br />
              small, sharp tools.
            </span>
            <span
              style={{
                display: "flex",
                fontSize: 24,
                color: "#5a4426",
                fontFamily: "system-ui, sans-serif",
                lineHeight: 1.4,
                marginTop: 4,
              }}
            >
              Encode, hash, generate, convert, compress —
              <br />
              all in your browser, no signup.
            </span>
          </div>
        </div>

        {/* ── Tool chip wall ────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            marginTop: 32,
          }}
        >
          {FEATURED_NAMES.map((name) => (
            <div
              key={name}
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: 20,
                fontFamily: "system-ui, sans-serif",
                fontWeight: 500,
                color: "#3a230d",
                padding: "8px 16px",
                borderRadius: 999,
                background:
                  "linear-gradient(180deg, rgba(255,248,224,0.85) 0%, rgba(232,210,150,0.85) 100%)",
                border: "1px solid rgba(122,72,24,0.35)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,250,225,0.7), 0 1px 2px rgba(60,35,10,0.15)",
              }}
            >
              {name}
            </div>
          ))}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 20,
              fontFamily: "system-ui, sans-serif",
              fontWeight: 600,
              color: "#7a4818",
              padding: "8px 16px",
              borderRadius: 999,
              background: "transparent",
              border: "1px dashed rgba(122,72,24,0.5)",
            }}
          >
            +{Math.max(0, count - FEATURED_NAMES.length)} more
          </div>
        </div>

        {/* ── Footer features ───────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "auto",
            paddingTop: 24,
            fontFamily: "system-ui, sans-serif",
            fontSize: 22,
            color: "#5a4426",
            fontWeight: 500,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  display: "flex",
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: "#2ecc71",
                  boxShadow: "0 0 0 3px rgba(46,204,113,0.18)",
                }}
              />
              Runs in your browser
            </span>
            <span style={{ display: "flex", color: "#a08a5e" }}>·</span>
            <span style={{ display: "flex" }}>No tracking</span>
            <span style={{ display: "flex", color: "#a08a5e" }}>·</span>
            <span style={{ display: "flex" }}>No uploads</span>
            <span style={{ display: "flex", color: "#a08a5e" }}>·</span>
            <span style={{ display: "flex" }}>No signup</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
