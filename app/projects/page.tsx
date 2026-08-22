"use client";

import React, { useState } from "react";
import { ALL_PROJECTS } from "@/lib/data/project-registry";
import ProjectCard from "@/components/ProjectCard";

const CATEGORY_OPTIONS = [
  { id: "all", label: "All" },
  { id: "mobile", label: "Mobile & Offline" },
  { id: "civic", label: "Civic Tech" },
  { id: "bots", label: "Bots & Systems" },
  { id: "web", label: "Web & Tools" },
] as const;

export default function ProjectsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredProjects =
    activeCategory === "all"
      ? ALL_PROJECTS
      : ALL_PROJECTS.filter((project) => project.category === activeCategory);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] sm:text-[28px] font-bold text-[var(--text-primary)] tracking-[-0.02em] leading-[1.3] mb-2 font-[var(--font-heading)]">
          Projects
        </h1>
        <p className="text-[15px] leading-[1.6] text-[var(--text-muted)] max-w-[720px]">
          Catalogue of software builds, offline-first mobile tools, civic infrastructure, and collegiate automation engines.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap pt-1" aria-label="Project categories">
        {CATEGORY_OPTIONS.map((category) => {
          const count =
            category.id === "all"
              ? ALL_PROJECTS.length
              : ALL_PROJECTS.filter((project) => project.category === category.id).length;
          const isActive = activeCategory === category.id;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              aria-pressed={isActive}
              className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-[var(--text-primary)] text-[var(--bg-canvas)] font-semibold shadow-xs"
                  : "bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-xs"
              }`}
            >
              {category.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {filteredProjects.map((project) => {
          const isBetterGov = project.slug === "bettergov-ph";
          return (
            <ProjectCard
              key={project.slug}
              project={project}
              external={isBetterGov}
              href={isBetterGov ? project.liveUrl ?? project.githubUrl : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}
