import type { NextConfig } from "next";

const backendApiUrl = process.env.INTERNAL_API_URL || "http://backend:8000/api";
const backendStorageUrl = process.env.INTERNAL_STORAGE_URL || "http://backend:8000/storage";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendApiUrl}/:path*`,
      },
      {
        source: "/storage/:path*",
        destination: `${backendStorageUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
