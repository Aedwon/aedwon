import React from "react";
import { notFound, redirect } from "next/navigation";
import { PORTFOLIO_PROJECTS } from "@/lib/data/project-overrides";
import ProjectCaseStudyClient from "@/components/ProjectCaseStudyClient";
import type { Metadata } from "next";

const CASE_STUDY_PROJECTS = PORTFOLIO_PROJECTS.filter(
  (project) => project.slug !== "bettergov-ph",
);

export async function generateStaticParams() {
  return CASE_STUDY_PROJECTS.map((p) => ({
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
  const project = PORTFOLIO_PROJECTS.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  if (project.slug === "bettergov-ph") {
    redirect(project.liveUrl ?? project.githubUrl ?? "/projects");
  }

  const projectIndex = CASE_STUDY_PROJECTS.findIndex((p) => p.slug === slug);
  const nextProject =
    CASE_STUDY_PROJECTS[(projectIndex + 1) % CASE_STUDY_PROJECTS.length];

  return (
    <ProjectCaseStudyClient project={project} nextProject={nextProject} />
  );
}
