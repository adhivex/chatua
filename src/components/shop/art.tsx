// Drawn placeholder illustrations ported from the prototype (mound, grainsBig, food, temple).
// Deterministic for a given seed, so server and client render identical markup.
// Used only when a product or page has no real photo.
import { useId } from "react";
import type { FoodKind, MoundExtra } from "@/lib/placeholder";

function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
const f1 = (n: number) => Number(n.toFixed(1));
const safeId = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, "");

type SvgProps = { className?: string; label?: string };
const a11y = (label?: string) => (label ? { role: "img" as const, "aria-label": label } : { "aria-hidden": true as const });

export function MoundArt({ tone, extra, seed, w = 300, h = 260, className, label }: { tone: string; extra: MoundExtra; seed: number; w?: number; h?: number } & SvgProps) {
  const g = safeId(useId());
  const r = rng(seed * 97 + 13);
  const bokeh = Array.from({ length: 9 }, (_, i) => (
    <circle key={i} cx={f1(r() * w)} cy={f1(r() * h * 0.55)} r={f1(14 + r() * 26)} fill="#e9c58a" opacity={f1(0.08 + r() * 0.14)} />
  ));
  const grainCols = ["#b98a4e", "#d9ad6b", "#8c6a3a", "#e7c88e"];
  const grains = Array.from({ length: 70 }, (_, i) => {
    const x = f1(r() * w), y = f1(h * 0.62 + r() * h * 0.34), rot = (r() * 180) | 0;
    return <ellipse key={i} cx={x} cy={y} rx="3.2" ry="1.7" transform={`rotate(${rot} ${x} ${y})`} fill={grainCols[(r() * 4) | 0]} opacity=".85" />;
  });
  const specks = Array.from({ length: 46 }, (_, i) => {
    const a = r() * Math.PI, rad = r() * 70;
    const x = w / 2 + Math.cos(a) * rad * 1.25, y = h * 0.46 - Math.sin(a) * rad * 0.55 + r() * 8;
    return <circle key={i} cx={f1(x)} cy={f1(y)} r={f1(0.7 + r() * 1.2)} fill="#fff" opacity={Number((0.08 + r() * 0.18).toFixed(2))} />;
  });
  let ex: React.ReactNode = null;
  if (extra === "seeds") {
    const cols = ["#5a3a1c", "#7a4f25", "#3e2a15"];
    ex = Array.from({ length: 34 }, (_, i) => {
      const x = f1(w / 2 - 62 + r() * 124), y = f1(h * 0.4 + r() * 34), c = cols[(r() * 3) | 0], rot = (r() * 180) | 0;
      return <ellipse key={i} cx={x} cy={y} rx="2.6" ry="1.5" fill={c} transform={`rotate(${rot} ${x} ${y})`} />;
    });
  } else if (extra === "green") {
    ex = Array.from({ length: 26 }, (_, i) => <circle key={i} cx={f1(w / 2 - 58 + r() * 116)} cy={f1(h * 0.4 + r() * 32)} r="2" fill="#7c9a4b" />);
  } else if (extra === "jaggery") {
    ex = (
      <g transform={`translate(${w * 0.08} ${h * 0.66})`}>
        <rect x="0" y="0" width="38" height="30" rx="4" fill="#8a4b18" transform="rotate(-8 19 15)" />
        <rect x="34" y="10" width="34" height="28" rx="4" fill="#a45c1f" transform="rotate(6 51 24)" />
        <rect x="12" y="26" width="30" height="24" rx="4" fill="#74400f" opacity=".9" />
        <path d="M6 6l22-2" stroke="#d99a55" strokeWidth="2" opacity=".5" />
      </g>
    );
  }
  const dome = `M${w * 0.2} ${h * 0.58} C${w * 0.26} ${h * 0.28} ${w * 0.4} ${h * 0.2} ${w * 0.5} ${h * 0.2} C${w * 0.6} ${h * 0.2} ${w * 0.74} ${h * 0.28} ${w * 0.8} ${h * 0.58} Z`;
  const dome2 = `M${w * 0.2} ${h * 0.6} C${w * 0.26} ${h * 0.28} ${w * 0.4} ${h * 0.2} ${w * 0.5} ${h * 0.2} C${w * 0.6} ${h * 0.2} ${w * 0.74} ${h * 0.28} ${w * 0.8} ${h * 0.6} Q${w / 2} ${h * 0.67} ${w * 0.2} ${h * 0.6}Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" className={className} {...a11y(label)}>
      <defs>
        <linearGradient id={`${g}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a5632" />
          <stop offset=".6" stopColor="#4a301a" />
          <stop offset="1" stopColor="#2d1c0e" />
        </linearGradient>
        <radialGradient id={`${g}m`} cx=".5" cy=".3" r=".8">
          <stop offset="0" stopColor="#fff" stopOpacity=".35" />
          <stop offset="1" stopColor={tone} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${g}w`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6b3f1d" />
          <stop offset=".5" stopColor="#9b6633" />
          <stop offset="1" stopColor="#5a3315" />
        </linearGradient>
        <radialGradient id={`${g}v`} cx=".5" cy=".52" r=".78">
          <stop offset=".5" stopColor="#140a03" stopOpacity="0" />
          <stop offset="1" stopColor="#140a03" stopOpacity=".62" />
        </radialGradient>
        <radialGradient id={`${g}l`} cx=".28" cy=".12" r=".7">
          <stop offset="0" stopColor="#ffd9a0" stopOpacity=".34" />
          <stop offset="1" stopColor="#ffd9a0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={w} height={h} fill={`url(#${g}b)`} />
      {bokeh}
      {grains}
      {extra === "jaggery" && ex}
      <ellipse cx={w / 2} cy={h * 0.84} rx={w * 0.4} ry={h * 0.07} fill="#000" opacity=".25" />
      <path d={`M${w * 0.12} ${h * 0.58} Q${w * 0.14} ${h * 0.86} ${w * 0.5} ${h * 0.88} Q${w * 0.86} ${h * 0.86} ${w * 0.88} ${h * 0.58} Z`} fill={`url(#${g}w)`} />
      <path d={`M${w * 0.2} ${h * 0.66} Q${w * 0.5} ${h * 0.74} ${w * 0.8} ${h * 0.66}`} stroke="#c48b4f" strokeWidth="2" fill="none" opacity=".5" />
      <path d={dome} fill={tone} />
      <path d={dome} fill={`url(#${g}m)`} />
      <ellipse cx={w / 2} cy={h * 0.58} rx={w * 0.38} ry={h * 0.06} fill="#3a2410" opacity=".55" />
      <path d={`M${w * 0.12} ${h * 0.58} Q${w / 2} ${h * 0.5} ${w * 0.88} ${h * 0.58} Q${w * 0.5} ${h * 0.66} ${w * 0.12} ${h * 0.58}Z`} fill="#6f4420" />
      <path d={dome2} fill={tone} />
      <path d={dome2} fill={`url(#${g}m)`} />
      {specks}
      {extra !== "jaggery" && ex}
      <rect width={w} height={h} fill={`url(#${g}l)`} />
      <rect width={w} height={h} fill={`url(#${g}v)`} />
    </svg>
  );
}

export function GrainsArt({ seed, className, label }: { seed: number } & SvgProps) {
  const r = rng(seed);
  const cols = ["#c9923f", "#7a4a1e", "#e0c27d", "#4b6b2a", "#a2542a", "#f0dcae", "#3a2a18"];
  return (
    <svg viewBox="0 0 300 160" preserveAspectRatio="xMidYMid slice" className={className} {...a11y(label)}>
      <rect width="300" height="160" fill="#6a4524" />
      {Array.from({ length: 260 }, (_, i) => {
        const x = Math.round(r() * 300), y = Math.round(r() * 160);
        const rx = f1(3 + r() * 3), ry = f1(1.8 + r() * 1.5), rot = (r() * 180) | 0, c = cols[(r() * cols.length) | 0];
        return <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} transform={`rotate(${rot} ${x} ${y})`} fill={c} />;
      })}
      <ellipse cx="60" cy="40" rx="44" ry="30" fill="#000" opacity=".12" />
      <ellipse cx="240" cy="120" rx="52" ry="34" fill="#000" opacity=".12" />
    </svg>
  );
}

export function FoodArt({ kind, className, label }: { kind: FoodKind } & SvgProps) {
  const bg = kind === "drink" ? "#a77a48" : kind === "bowl" ? "#c5a06a" : "#b78a55";
  return (
    <svg viewBox="0 0 120 110" preserveAspectRatio="xMidYMid slice" className={className} {...a11y(label)}>
      <rect width="120" height="110" fill={bg} />
      {kind === "drink" && (
        <>
          <rect x="38" y="22" width="44" height="70" rx="8" fill="#fbf3e6" />
          <rect x="38" y="40" width="44" height="52" rx="6" fill="#e7cfa6" />
          <ellipse cx="60" cy="22" rx="22" ry="5" fill="#fffaf0" />
          <rect x="42" y="28" width="6" height="56" rx="3" fill="#fff" opacity=".4" />
          <ellipse cx="60" cy="98" rx="38" ry="6" fill="#000" opacity=".2" />
          <circle cx="96" cy="86" r="8" fill="#d6a762" />
        </>
      )}
      {kind === "bowl" && (
        <>
          <ellipse cx="60" cy="68" rx="46" ry="30" fill="#7a4a22" />
          <ellipse cx="60" cy="62" rx="40" ry="24" fill="#f2e2c0" />
          <circle cx="48" cy="58" r="8" fill="#f0c860" />
          <circle cx="64" cy="54" r="8" fill="#f6d77c" />
          <circle cx="74" cy="64" r="6" fill="#e0a04a" />
          <circle cx="52" cy="70" r="5" fill="#8a5a2c" />
          <circle cx="80" cy="56" r="4" fill="#b8793a" />
        </>
      )}
      {kind === "ladoo" && (
        <>
          <ellipse cx="60" cy="92" rx="48" ry="8" fill="#000" opacity=".2" />
          <circle cx="40" cy="66" r="22" fill="#d6a05a" />
          <circle cx="76" cy="62" r="24" fill="#c98f46" />
          <circle cx="58" cy="44" r="20" fill="#dcab63" />
          <g fill="#8a5a2a" opacity=".6">
            <circle cx="34" cy="60" r="1.8" />
            <circle cx="48" cy="72" r="1.8" />
            <circle cx="70" cy="56" r="1.8" />
            <circle cx="84" cy="68" r="1.8" />
            <circle cx="54" cy="40" r="1.8" />
          </g>
        </>
      )}
    </svg>
  );
}

export function TempleArt({ className, label }: SvgProps) {
  const g = safeId(useId());
  return (
    <svg viewBox="0 0 300 180" preserveAspectRatio="xMidYMid slice" className={className} {...a11y(label)}>
      <defs>
        <linearGradient id={`${g}sk`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6c58a" />
          <stop offset=".6" stopColor="#f8a56b" />
          <stop offset="1" stopColor="#d9714a" />
        </linearGradient>
      </defs>
      <rect width="300" height="180" fill={`url(#${g}sk)`} />
      <circle cx="215" cy="70" r="26" fill="#fff0c9" opacity=".85" />
      <g transform="translate(70 0)">
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M${88 + i * 4} ${150 - i * 11} h${124 - i * 8} l-3 -9 h-${118 - i * 8}z`} fill={i % 2 ? "#7d4a2a" : "#6a3b20"} />
        ))}
        <path d="M150 55 q-14 -22 0 -40 q14 18 0 40z" fill="#5c3018" />
        <rect x="132" y="120" width="36" height="30" fill="#4d2812" />
        <path d="M138 150v-16a12 12 0 0 1 24 0v16z" fill="#f4b76f" opacity=".55" />
      </g>
      <g fill="#3d5b2a">
        <path d="M20 180 Q22 120 28 80" stroke="#4a3320" strokeWidth="4" fill="none" />
        <path d="M28 80 q-22 -2 -30 14 M28 80 q22 -6 36 6 M28 80 q-12 -18 -2 -26 M28 80 q16 -14 30 -8" />
        <path d="M280 180 Q276 130 270 96" stroke="#4a3320" strokeWidth="4" fill="none" />
        <path d="M270 96 q-20 -2 -28 12 M270 96 q20 -4 30 8 M270 96 q-10 -16 0 -22" />
      </g>
      <rect y="150" width="300" height="30" fill="#6f7a3a" opacity=".8" />
    </svg>
  );
}

export function Sprig({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 30 16" fill="#3a8a3f" className={className} aria-hidden="true">
      <path
        d="M15 15C15 9 14 5 10 2c-1 4 1 8 5 13zM15 15c0-5 2-9 6-12 0 4-2 8-6 12zM15 15C9 12 5 11 1 11c3 3 8 5 14 4zM15 15c6-3 10-4 14-4-3 3-8 5-14 4z"
        opacity=".9"
      />
    </svg>
  );
}
