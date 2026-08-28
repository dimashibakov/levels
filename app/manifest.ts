import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LEVELS",
    short_name: "LEVELS",
    description: "A straight, private read on how you're holding.",
    theme_color: "#5B52D9",
    background_color: "#B9DDF3",
    display: "standalone",
    start_url: "/",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
