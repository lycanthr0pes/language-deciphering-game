import type { NextConfig } from "next";

const basePath =
  process.env.NODE_ENV === "production"
    ? "/~apc/r8/K"
    : "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;