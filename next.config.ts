import type { NextConfig } from "next";

const blogShortLinks = {
  factory: "/blogs/a-perfect-factory-can-still-make-something-nobody-wants",
} as const;

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "aedwon.com" }],
        destination: "https://www.aedwon.com/:path*",
        permanent: true,
      },
      ...Object.entries(blogShortLinks).map(([key, destination]) => ({
        source: `/b/${key}`,
        destination,
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
