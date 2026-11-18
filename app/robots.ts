import type { MetadataRoute } from "next";
import { SITE_URL } from "./lib/site";

/** Search + AI crawlers explicitly welcomed; API routes stay private. */
const AI_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "Google-Extended",
  "ClaudeBot",
  "anthropic-ai",
  "PerplexityBot",
  "Applebot-Extended",
  "Amazonbot",
  "Bytespider",
  "CCBot",
  "meta-externalagent",
  "FacebookBot",
  "cohere-ai",
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/llms.txt", "/llms-full.txt", "/humans.txt"],
        disallow: ["/api/"],
      },
      {
        userAgent: [...AI_BOTS],
        allow: ["/", "/llms.txt", "/llms-full.txt", "/showcase"],
        disallow: ["/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
