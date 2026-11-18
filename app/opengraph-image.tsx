import { ImageResponse } from "next/og";
import { SITE } from "./lib/site";

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background: "linear-gradient(145deg, #091122 0%, #111d38 55%, #1e3a8a 100%)",
          color: "#e6ecf5",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: 22,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#dc2626",
            fontWeight: 700,
          }}
        >
          Dojo Design & Sourcing
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              maxWidth: 980,
              color: "#ffffff",
            }}
          >
            Your End-to-End Apparel Partner
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.35,
              maxWidth: 900,
              color: "#8fa3c7",
            }}
          >
            3D design · tech packs · factory production · AQL QC · cargo · ocean freight
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 20,
            color: "#8fa3c7",
          }}
        >
          <span>Bangladesh · Global</span>
          <span>dojosourcing.com</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
