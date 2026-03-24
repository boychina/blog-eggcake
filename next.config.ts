import path from "node:path";
import type { NextConfig } from "next";

const isExportMode = process.env.NEXT_OUTPUT_MODE === "export";
const basePath = process.env.NEXT_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: isExportMode ? "export" : undefined,
  basePath: basePath || undefined,
  trailingSlash: isExportMode ? true : undefined,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname),
    };
    return config;
  },
};

export default nextConfig;
