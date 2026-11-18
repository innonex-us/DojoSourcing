import type { MetadataRoute } from "next";
import { SITE } from "./lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.shortName,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#091122",
    theme_color: "#091122",
    lang: SITE.language,
    categories: ["business", "shopping", "productivity"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/dojo-crane-mark.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/dojo-sourcing-logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
