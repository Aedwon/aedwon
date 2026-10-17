import { notFound } from "next/navigation";
import type { Metadata } from "next";
import OpenSourceContributionPage from "@/components/OpenSourceContributionPage";
import {
  OPEN_SOURCE_PROJECTS,
  getOpenSourceProject,
} from "@/lib/data/open-source";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  buildPageMetadata,
  PERSON_JSON_LD_REF,
  serializeJsonLd,
} from "@/lib/seo";

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
    return { title: "Contribution Not Found", robots: { index: false } };
  }

  const title = `${project.name} — Open Source Contribution | Aerol (Aedwon)`;

  return buildPageMetadata({
    title,
    description: project.summary,
    path: project.pageHref,
    type: "article",
  });
}

export default async function ContributionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getOpenSourceProject(slug);

  if (!project || project.id === "bettergov-ph") notFound();

  const jsonLd = serializeJsonLd({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": `${absoluteUrl(project.pageHref)}#contribution-record`,
        name: `${project.name} contribution record`,
        description: project.summary,
        url: absoluteUrl(project.pageHref),
        creator: PERSON_JSON_LD_REF,
        about: {
          "@type": "SoftwareSourceCode",
          name: project.name,
          codeRepository: project.repositoryUrl,
          url: project.projectUrl || project.repositoryUrl,
        },
        sameAs: project.pullRequests.map((pullRequest) => pullRequest.url),
        inLanguage: "en",
      },
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Projects", path: "/projects" },
        { name: project.name, path: project.pageHref },
      ]),
    ],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <OpenSourceContributionPage project={project} />
    </>
  );
}
