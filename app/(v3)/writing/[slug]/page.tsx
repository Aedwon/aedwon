import Site from "@/components/design-v3/Site";
import { PROJECTS } from "@/lib/design-v3/data/projects";

export function generateStaticParams() {
  return PROJECTS.filter((p) => p.type === "Writing").map((p) => ({ slug: p.id }));
}

export default async function WritingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <Site initialPath={`/writing/${slug}`} />;
}
