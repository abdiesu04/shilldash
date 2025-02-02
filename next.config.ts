import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    PUBLIC_API_KEY: process.env.PUBLIC_API_KEY,
    COINGECKO_API_KEY: process.env.COINGECKO_API_KEY
  }
};

export default nextConfig;
