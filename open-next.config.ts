import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Pages are request-rendered for locale cookies. Only build-time assets are cached;
// there is no ISR or runtime cache containing IBANs, prompts, or API responses.
const config = {
  ...defineCloudflareConfig({ incrementalCache: staticAssetsIncrementalCache }),
  buildCommand: "npx next build --webpack",
};

export default config;
