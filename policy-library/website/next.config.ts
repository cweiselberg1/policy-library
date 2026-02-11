import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/policies', // Deploy under /policies on primary domain
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true, // Temporary: Skip TS errors until Supabase types are generated
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
