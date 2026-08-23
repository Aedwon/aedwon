import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  PROJECT_ALIASES,
  getCaseStudyProjects,
  getNextProject,
  getProjectBySlug,
} from "@/lib/data/project-registry";
import ProjectCaseStudyClient from "@/components/ProjectCaseStudyClient";
import BetterGovContributionPage from "@/components/BetterGovContributionPage";
import type { Metadata } from "next";

const UNDER_CONSTRUCTION_PROJECTS = new Set([
  "ai-agent-framework",
  "pso-scoring-model",
  "gi-damage-calculator",
]);

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
  if (!project) return { title: "Project Not Found" };

  const canonicalSlug = project.slug;
  const isUnderConstruction = UNDER_CONSTRUCTION_PROJECTS.has(canonicalSlug);
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

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
    },
  };
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
    redirect(`/projects/${project.slug}`);
  }

  if (project.slug === "bettergov-ph") {
    return <BetterGovContributionPage />;
  }

  if (UNDER_CONSTRUCTION_PROJECTS.has(project.slug)) {
    return (
      <div className="space-y-8 max-w-[760px] mx-auto">
        <div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-[13px] font-mono text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors"
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

  const nextProject = getNextProject(project.slug);
  if (!nextProject) notFound();

  return <ProjectCaseStudyClient project={project} nextProject={nextProject} />;
}

export const dynamicParams = false;
