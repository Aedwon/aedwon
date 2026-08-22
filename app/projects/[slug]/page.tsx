import React from "react";
import { notFound, redirect } from "next/navigation";
import {
  ALL_PROJECTS,
  PROJECT_ALIASES,
  getCaseStudyProjects,
  getNextProject,
  getProjectBySlug,
} from "@/lib/data/project-registry";
import ProjectCaseStudyClient from "@/components/ProjectCaseStudyClient";
import type { Metadata } from "next";

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
  const project = getProjectBySlug(slug);

  if (!project) notFound();

  if (project.slug !== slug) {
    redirect(`/projects/${project.slug}`);
  }

  if (project.slug === "bettergov-ph") {
    redirect(project.liveUrl ?? project.githubUrl ?? "/projects");
  }

  const nextProject = getNextProject(project.slug);
  if (!nextProject) notFound();

  return <ProjectCaseStudyClient project={project} nextProject={nextProject} />;
}

export const dynamicParams = false;

void ALL_PROJECTS;
