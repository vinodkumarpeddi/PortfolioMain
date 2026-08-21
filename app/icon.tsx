import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/* The tab mark: the brand's V, cream on amber. One heavy shape, because a 16px tab icon has
   room for exactly one. */
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center", background: "#e9a23b", borderRadius: 14 }}>
        <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden>
          <polygon points="11,13 24,13 32,37 40,13 53,13 38,52 26,52" fill="#120c05" />
          <polygon points="11,13 24,13 32,37 40,13 53,13 38,52 26,52" fill="#fbf4e6" transform="translate(0,-2)" />
        </svg>
      </div>
    ),
    size,
  );
}
