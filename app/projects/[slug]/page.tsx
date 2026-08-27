import React from "react";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import {
  PROJECT_ALIASES,
  UNDER_CONSTRUCTION_PROJECT_SLUGS,
  getCaseStudyProjects,
  getNextProject,
  getProjectBySlug,
  isProjectIndexable,
} from "@/lib/data/project-registry";
import ProjectCaseStudyClient from "@/components/ProjectCaseStudyClient";
import BetterGovContributionPage from "@/components/BetterGovContributionPage";
import type { Metadata } from "next";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  buildPageMetadata,
  PERSON_JSON_LD_REF,
  serializeJsonLd,
} from "@/lib/seo";

export async function generateStaticParams() {
  const canonical = getCaseStudyProjects().map((project) => ({ slug: project.slug }));
  const aliases = Object.keys(PROJECT_ALIASES).map((slug) => ({ slug }));
  return [...canonical, ...aliases];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Project Not Found", robots: { index: false } };

  const canonicalSlug = project.slug;
  const isUnderConstruction = !isProjectIndexable(canonicalSlug);
  const isOpenSourceContribution = canonicalSlug === "bettergov-ph";
  const title = isUnderConstruction
    ? `${project.title} — Under Construction | Aerol (Aedwon)`
    : isOpenSourceContribution
      ? `${project.title} — Open Source Contributions | Aerol (Aedwon)`
      : `${project.title} — Case Study | Aerol (Aedwon)`;
  const description = isUnderConstruction
    ? `The case study for ${project.title} is still under construction.`
    : project.summary;
  const canonical = `/projects/${canonicalSlug}`;

  return buildPageMetadata({
    title,
    description,
    path: canonical,
    type: "article",
    robots: isUnderConstruction ? { index: false, follow: true } : undefined,
  });
}

export default async function ProjectCaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) notFound();

  if (project.slug !== slug) {
    permanentRedirect(`/projects/${project.slug}`);
  }

  if (UNDER_CONSTRUCTION_PROJECT_SLUGS.has(project.slug)) {
    return (
      <div className="space-y-8 max-w-[760px] mx-auto">
        <div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-[13px] font-mono text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            ← Back to all projects
          </Link>
        </div>

        <header className="space-y-5">
          <h1 className="text-[28px] sm:text-[32px] font-bold text-[var(--text-primary)] tracking-[-0.02em] font-[var(--font-heading)]">
            {project.title}
          </h1>

          <section className="space-y-3 py-8 border-y border-[var(--border-subtle)]">
            <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-dim)]">
              Case study
            </p>
            <h2 className="text-[20px] sm:text-[22px] font-semibold text-[var(--text-primary)] font-[var(--font-heading)]">
              Under construction
            </h2>
            <p className="max-w-[620px] text-[15px] leading-[1.7] text-[var(--text-muted)]">
              The case study for this project is still being prepared. There isn&apos;t a public demo or write-up to show here yet. This page will be updated when the supporting material is ready.
            </p>
          </section>
        </header>
      </div>
    );
  }

  const canonicalPath = `/projects/${project.slug}`;
  const isBetterGov = project.slug === "bettergov-ph";
  const workJsonLd = isBetterGov
    ? {
        "@type": "CreativeWork",
        "@id": `${absoluteUrl(canonicalPath)}#contribution-record`,
        name: `${project.title} contribution record`,
        description: project.summary,
        url: absoluteUrl(canonicalPath),
        creator: PERSON_JSON_LD_REF,
        about: {
          "@type": "SoftwareSourceCode",
          name: project.title,
          url: project.liveUrl,
        },
        sameAs: project.githubUrl ? [project.githubUrl] : undefined,
        inLanguage: "en",
      }
    : {
        "@type": project.githubUrl ? "SoftwareSourceCode" : "CreativeWork",
        "@id": `${absoluteUrl(canonicalPath)}#project`,
        name: project.title,
        description: project.summary,
        url: absoluteUrl(canonicalPath),
        creator: PERSON_JSON_LD_REF,
        codeRepository: project.githubUrl || undefined,
        sameAs: [project.liveUrl, project.githubUrl].filter(Boolean),
        keywords: project.stack.map((item) => item.name),
        inLanguage: "en",
      };
  const jsonLd = serializeJsonLd({
    "@context": "https://schema.org",
    "@graph": [
      workJsonLd,
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Projects", path: "/projects" },
        { name: project.title, path: canonicalPath },
      ]),
    ],
  });

  if (isBetterGov) {
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
        <BetterGovContributionPage />
      </>
    );
  }

  const nextProject = getNextProject(project.slug);
  if (!nextProject) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <ProjectCaseStudyClient project={project} nextProject={nextProject} />
    </>
  );
}

export const dynamicParams = false;
