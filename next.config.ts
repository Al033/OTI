import type { NextConfig } from "next";
import path from "node:path";

const config: NextConfig = {
  typedRoutes: true,
  serverExternalPackages: ["postgres"],
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default config;
