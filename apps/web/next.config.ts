import type { NextConfig } from "next";

// Next.js Turbopack (hot-reloader-turbopack.js) checks !!process.env.DEBUG
// to decide whether to activate internal testMode ("Creating turbopack project ... testMode: true").
// If DEBUG is set to application-level booleans ("True" / "False" / "true" / "false") from .env,
// migrate it to APP_DEBUG and unset DEBUG so Next.js does not enter internal test harness mode.
if (process.env.DEBUG) {
  const normalized = process.env.DEBUG.toLowerCase().trim();
  if (normalized === "true" || normalized === "false" || normalized === "1" || normalized === "0") {
    if (!process.env.APP_DEBUG) {
      process.env.APP_DEBUG = normalized === "true" || normalized === "1" ? "True" : "False";
    }
    delete process.env.DEBUG;
  }
}

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
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
