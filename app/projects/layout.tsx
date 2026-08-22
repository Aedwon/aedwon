import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects — Aerol (Aedwon)",
  description:
    "Software projects by Aerol Balayon (Aedwon), including offline-first mobile systems, Discord automation, civic technology, and browser tools.",
  alternates: { canonical: "/projects" },
  openGraph: {
    title: "Projects — Aerol (Aedwon)",
    description:
      "Software projects by Aerol Balayon (Aedwon), including offline-first mobile systems, Discord automation, civic technology, and browser tools.",
    url: "/projects",
    type: "website",
  },
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
