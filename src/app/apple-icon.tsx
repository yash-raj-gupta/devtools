import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(180deg, #e8c478 0%, #b87333 55%, #7a4818 100%)",
          borderRadius: 38,
          boxShadow:
            "inset 0 6px 0 rgba(255,250,225,0.4), inset 0 -6px 0 rgba(40,25,5,0.4)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 132,
            height: 132,
            borderRadius: 22,
            background:
              "linear-gradient(180deg, #d8a55c 0%, #b87333 55%, #7a4818 100%)",
          }}
        >
          <span
            style={{
              fontSize: 110,
              fontWeight: 800,
              fontFamily: "serif",
              color: "#3a230d",
              lineHeight: 1,
              transform: "translateY(-2px)",
              textShadow:
                "0 -1px 0 rgba(255,250,225,0.4), 0 2px 0 rgba(40,25,5,0.45)",
            }}
          >
            T
          </span>
        </div>
      </div>
    ),
    size,
  );
}
