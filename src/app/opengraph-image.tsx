import { ImageResponse } from "next/og";

export const alt = "Chatua – Odisha's Traditional Food";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "linear-gradient(90deg,#22130a 0%,#3a2410 60%,#7a5632 100%)", color: "#fbf3e4" }}>
        <div style={{ fontSize: 34, letterSpacing: 10, color: "#e6cc94" }}>CHATUA</div>
        <div style={{ fontSize: 76, fontFamily: "serif", lineHeight: 1.05, marginTop: 24, maxWidth: 820 }}>The Goodness of Grains, In Every Spoon.</div>
        <div style={{ fontSize: 30, marginTop: 28, color: "rgba(251,243,228,.75)" }}>Odisha&apos;s Traditional Food · Delivered across India</div>
      </div>
    ),
    size,
  );
}
