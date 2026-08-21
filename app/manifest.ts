import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aedwon",
    short_name: "Aedwon",
    description: "Computer Science at UP Diliman on a DOST Merit Scholarship. Software builds, client-side tools, and platforms.",
    start_url: "/",
    display: "standalone",
    background_color: "#18181B",
    theme_color: "#18181B",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
