import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/day",
  assetPrefix: "/day/",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
