"use client";

import React from "react";
import Link from "next/link";
import { getFeaturedProjects } from "@/lib/data/project-registry";
import ProjectCard from "./ProjectCard";
import { useTheme } from "./ThemeContext";

const FEATURED_PROJECTS = getFeaturedProjects();

export default function FeaturedProjects() {
  const { isNeobrutalist } = useTheme();

  return (
    <section id="projects">
      <div className="flex justify-between items-baseline mb-4">
        <h2
          className={`text-[18px] ${
            isNeobrutalist
              ? "font-black text-black"
              : "font-semibold text-[var(--text-primary)] font-[var(--font-heading)]"
          }`}
        >
          Featured projects
        </h2>
        <Link
          href="/projects"
          className={`text-[13px] inline-flex items-center gap-1 group transition-colors ${
            isNeobrutalist
              ? "text-black font-black hover:underline"
              : "text-[var(--text-dim)] hover:text-[var(--text-primary)] font-mono"
          }`}
        >
          See all projects <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FEATURED_PROJECTS.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </section>
  );
}
