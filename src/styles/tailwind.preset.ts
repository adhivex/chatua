// Chatua Tailwind preset — v3 (from starter/tailwind.preset.ts). Additions are marked; see docs/DECISIONS.md.
import type { Config } from "tailwindcss";

const chatuaPreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        cream: "#f7f0e4", paper: "#fffaf1", card: "#fffdf8", sand: "#efe4d1", line: "#e7dbc6",
        clay: { DEFAULT: "#b4421a", dark: "#8e3210", soft: "#f6e1d2", wash: "#fbeee3" },
        gold: { DEFAULT: "#c8a05a", light: "#e6cc94", wash: "#fff7e8", tint: "#fbf0dc" },
        espresso: "#22130a", ink: "#2a1a10", muted: "#76624f", leaf: "#2c7a47",
        // additions
        ivory: "#fbf3e4", field: "#fbf5ea", selected: "#fffaf0", danger: "#b3321f", backdrop: "#d8c6aa",
        hairline: "rgba(200,160,90,.3)", "hairline-strong": "rgba(200,160,90,.35)",
      },
      fontFamily: {
        head: ["var(--font-head)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: { card: "20px", btn: "14px", input: "12px", sheet: "30px" },
      boxShadow: {
        soft: "0 1px 2px rgba(60,35,15,.05), 0 10px 26px -10px rgba(60,35,15,.2)",
        lift: "0 2px 4px rgba(60,35,15,.06), 0 22px 44px -14px rgba(60,35,15,.32)",
      },
      maxWidth: { shell: "460px" },
      backgroundImage: {
        primary: "linear-gradient(180deg,#c64f22,#a43914)",
        gold: "linear-gradient(180deg,#e6cc94,#c8a05a)",
      },
    },
  },
};
export default chatuaPreset;
