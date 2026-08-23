import { notFound } from "next/navigation";
import type { Metadata } from "next";
import OpenSourceContributionPage from "@/components/OpenSourceContributionPage";
import {
  OPEN_SOURCE_PROJECTS,
  getOpenSourceProject,
} from "@/lib/data/open-source";

const CONTRIBUTION_PROJECTS = OPEN_SOURCE_PROJECTS.filter(
  (project) => project.id !== "bettergov-ph",
);

export const dynamicParams = false;

export function generateStaticParams() {
  return CONTRIBUTION_PROJECTS.map((project) => ({ slug: project.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getOpenSourceProject(slug);
  if (!project || project.id === "bettergov-ph") {
    return { title: "Contribution Not Found" };
  }

  const canonical = project.pageHref;
  const title = `${project.name} — Open Source Contribution | Aerol (Aedwon)`;

  return {
    title,
    description: project.summary,
    alternates: { canonical },
    openGraph: {
      title,
      description: project.summary,
      url: canonical,
      type: "article",
    },
  };
}

export default async function ContributionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getOpenSourceProject(slug);

  if (!project || project.id === "bettergov-ph") notFound();

  return <OpenSourceContributionPage project={project} />;
}
