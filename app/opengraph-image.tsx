import { ImageResponse } from "next/og";
import { PERSON_NAME, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site-content";

export const alt = `${SITE_NAME} — ${PERSON_NAME}`;
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
          background: "#18181B",
          color: "#F4F4F5",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 30, color: "#A1A1AA" }}>
            {new URL(SITE_URL).host}
          </div>
          <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: -2 }}>
            {SITE_NAME}
          </div>
          <div style={{ fontSize: 42, color: "#D4D4D8" }}>{PERSON_NAME}</div>
        </div>
        <div
          style={{
            display: "flex",
            maxWidth: 930,
            fontSize: 28,
            lineHeight: 1.35,
            color: "#A1A1AA",
          }}
        >
          {SITE_DESCRIPTION}
        </div>
      </div>
    ),
    size,
  );
}
