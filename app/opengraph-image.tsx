import { ImageResponse } from "next/og";
import { profile } from "@/data/profile";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = `${profile.name} — Software Engineer`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const dragon = `data:image/png;base64,${(await readFile(join(process.cwd(), "public/brand/dragon-512.png"))).toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "#0a0a0c",
          color: "#f1efe9",
          fontFamily: "sans-serif",
          backgroundImage:
            "linear-gradient(to right, rgba(241,239,233,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(241,239,233,0.06) 1px, transparent 1px)",
          backgroundSize: "96px 96px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 22, letterSpacing: 3, color: "#a4a29b" }}>
          <img src={dragon} width={64} height={64} alt="" />
          <span>{profile.name.toUpperCase()}</span>
          <span style={{ color: "#66655f" }}>/</span>
          <span>SOFTWARE ENGINEER</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 148, fontWeight: 700, letterSpacing: -8, lineHeight: 0.9 }}>
          <span>SYSTEMS</span>
          <span style={{ color: "#a4a29b" }}>THAT</span>
          <span style={{ display: "flex" }}>
            HOLD<span style={{ color: "#e9a23b" }}>.</span>
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#a4a29b" }}>
          <span>Full-stack products · backend systems · distributed systems</span>
          <span style={{ color: "#66655f" }}>vinodkumarpeddi.vercel.app</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
