import type { Config } from "tailwindcss";
import chatuaPreset from "./src/styles/tailwind.preset";

// Tokens live in the preset (copied from starter/tailwind.preset.ts) and src/styles/tokens.css.
const config: Config = {
  presets: [chatuaPreset as Config],
  content: ["./src/**/*.{ts,tsx}"],
};
export default config;
