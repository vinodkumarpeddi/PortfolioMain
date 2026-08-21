import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: 180, height: 180, display: "flex", alignItems: "center", justifyContent: "center", background: "#e9a23b" }}>
        <svg width="180" height="180" viewBox="0 0 64 64" aria-hidden>
          <polygon points="11,13 24,13 32,37 40,13 53,13 38,52 26,52" fill="#120c05" />
          <polygon points="11,13 24,13 32,37 40,13 53,13 38,52 26,52" fill="#fbf4e6" transform="translate(0,-2)" />
        </svg>
      </div>
    ),
    size,
  );
}
