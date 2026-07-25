import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        destination: "https://beritapatroli.co.id/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
