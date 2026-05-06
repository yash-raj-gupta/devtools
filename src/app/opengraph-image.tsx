import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  const subtitle = `${siteConfig.toolCount} fast, privacy-friendly developer utilities — encode, hash, generate, convert. All in your browser.`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background:
            "radial-gradient(ellipse at top, #fff8e4, #ede2c2 55%, #d6c89c 100%)",
          color: "#2b2014",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 96,
              height: 96,
              borderRadius: 22,
              background:
                "linear-gradient(180deg, #e8c478 0%, #b87333 55%, #7a4818 100%)",
              boxShadow:
                "inset 0 4px 0 rgba(255,250,225,0.5), inset 0 -4px 0 rgba(40,25,5,0.4)",
            }}
          >
            <span
              style={{
                display: "flex",
                fontSize: 70,
                fontWeight: 800,
                color: "#3a230d",
                lineHeight: 1,
              }}
            >
              T
            </span>
          </div>
          <span
            style={{
              display: "flex",
              fontSize: 56,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#2b2014",
            }}
          >
            {siteConfig.name}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
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
              color: "#2b2014",
              maxWidth: 980,
            }}
          >
            A workshop of small, sharp tools.
          </span>
          <span
            style={{
              display: "flex",
              fontSize: 32,
              color: "#5a4426",
              fontFamily: "system-ui, sans-serif",
              maxWidth: 980,
              lineHeight: 1.35,
            }}
          >
            {subtitle}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "system-ui, sans-serif",
            fontSize: 24,
            color: "#7d6a4a",
          }}
        >
          <span style={{ display: "flex" }}>
            No tracking · No uploads · No signup
          </span>
          <span style={{ display: "flex", color: "#8a5424", fontWeight: 600 }}>
            {siteConfig.host}
          </span>
        </div>
      </div>
    ),
    size,
  );
}
