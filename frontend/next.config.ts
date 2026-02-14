import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Ini wajib untuk Cloud Run
};

export default nextConfig;