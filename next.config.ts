import type { NextConfig } from "next";
import lingoCompiler from "lingo.dev/compiler";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
};

const withLingo = lingoCompiler.next({
  sourceRoot: "app",
  lingoDir: "lingo",
  sourceLocale: "en",
  targetLocales: [
    "ar",
    // , "zh-Hans-CN", "zh-Hant-TW"
  ],
  rsc: true,
  useDirective: false,
  debug: false,
  models: {
    "*:*": "google:gemini-2.5-flash",
  },
});

// export default withLingo(nextConfig);
export default nextConfig;
