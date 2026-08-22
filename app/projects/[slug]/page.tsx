import React from "react";
import { notFound } from "next/navigation";
import { ALL_PROJECTS } from "@/lib/data/project-registry";
import ProjectCaseStudyClient from "@/components/ProjectCaseStudyClient";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return ALL_PROJECTS.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = ALL_PROJECTS.find((p) => p.slug === slug);
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
  const projectIndex = ALL_PROJECTS.findIndex((p) => p.slug === slug);

  if (projectIndex === -1) {
    notFound();
  }

  const project = ALL_PROJECTS[projectIndex];
  const nextProject = ALL_PROJECTS[(projectIndex + 1) % ALL_PROJECTS.length];

  return (
    <ProjectCaseStudyClient project={project} nextProject={nextProject} />
  );
}
