// Placeholder app mark (gold "C" on espresso) until the owner supplies a logo file.
export function BrandMark({ size }: { size: number }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#22130a", borderRadius: size * 0.22 }}>
      <div style={{ fontSize: size * 0.62, fontWeight: 700, color: "#e6cc94", fontFamily: "serif", lineHeight: 1, marginTop: -size * 0.04 }}>C</div>
    </div>
  );
}
