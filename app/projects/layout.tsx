import { buildPageMetadata } from "@/lib/seo";

const title = "Projects — Aerol (Aedwon)";
const description =
  "Software projects by Aerol Balayon (Aedwon), including offline-first mobile systems, Discord automation, civic technology, and browser tools.";

export const metadata = buildPageMetadata({
  title,
  description,
  path: "/projects",
});

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
