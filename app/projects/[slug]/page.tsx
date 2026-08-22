import React from "react";
import { notFound } from "next/navigation";
import { PORTFOLIO_PROJECTS } from "@/lib/data/project-overrides";
import ProjectCaseStudyClient from "@/components/ProjectCaseStudyClient";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return PORTFOLIO_PROJECTS.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = PORTFOLIO_PROJECTS.find((p) => p.slug === slug);
  if (!project) return { title: "Project Not Found" };
  return {
    title: `${project.title} — Case Study | Aerol (Aedwon)`,
    description: project.summary,
  };
}

export default async function ProjectCaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const projectIndex = PORTFOLIO_PROJECTS.findIndex((p) => p.slug === slug);

  if (projectIndex === -1) {
    notFound();
  }

  const project = PORTFOLIO_PROJECTS[projectIndex];
  const nextProject = PORTFOLIO_PROJECTS[(projectIndex + 1) % PORTFOLIO_PROJECTS.length];

  return (
    <ProjectCaseStudyClient project={project} nextProject={nextProject} />
  );
}
