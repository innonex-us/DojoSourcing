import type { NextConfig } from "next";

/**
 * Keep Next's default HTML-limited bots and add major AI crawlers so they
 * receive blocking metadata (complete <head>) instead of streamed tags.
 */
const htmlLimitedBots =
  /[\w-]+-Google|Google-[\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight|GPTBot|ChatGPT-User|Google-Extended|ClaudeBot|anthropic-ai|PerplexityBot|Amazonbot|Bytespider|CCBot|meta-externalagent|FacebookBot|cohere-ai|Applebot-Extended/i;

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  htmlLimitedBots,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
