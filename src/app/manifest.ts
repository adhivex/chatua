import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Chatua – Odisha's Traditional Food",
    short_name: "Chatua",
    description: "Traditional Odisha grain food, delivered across India.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f0e4",
    theme_color: "#f7f0e4",
    icons: [
      { src: "/icon", sizes: "64x64", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
