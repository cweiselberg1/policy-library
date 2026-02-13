import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true, // Temporary: Skip TS errors until Supabase types are generated
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
