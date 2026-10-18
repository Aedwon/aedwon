import type { NextConfig } from "next";

// The two posts now live in the v3 Writing index (content/projects/factory.json and spec.json).
// Old /blogs addresses and the /b/ short links all land on /writing.
const blogPosts = {
  "a-perfect-factory-can-still-make-something-nobody-wants": "factory",
  "the-next-model-wont-fix-your-specification": "spec",
} as const;

const blogShortLinks = {
  factory: "/writing/factory",
  spec: "/writing/spec",
} as const;

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "aedwon.site" }],
        destination: "https://www.aedwon.site/:path*",
        permanent: true,
      },
      {
        source: "/resume",
        destination:
          "https://drive.google.com/file/d/1F2tjvYSaHlApExmlhdLqtmnN9JdSPb_B/view?usp=drivesdk",
        permanent: false,
      },
      { source: "/blogs", destination: "/index", permanent: true },
      ...Object.entries(blogPosts).map(([slug, id]) => ({
        source: `/blogs/${slug}`,
        destination: `/writing/${id}`,
        permanent: true,
      })),
      ...Object.entries(blogShortLinks).map(([key, destination]) => ({
        source: `/b/${key}`,
        destination,
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
