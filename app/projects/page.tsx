"use client";

import React, { useState } from "react";
import { PROJECTS } from "@/lib/data/projects";
import ProjectCard from "@/components/ProjectCard";

export default function ProjectsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All", count: PROJECTS.length },
    { id: "mobile", label: "Mobile & Offline", count: PROJECTS.filter((p) => p.category === "mobile").length },
    { id: "civic", label: "Civic Tech", count: PROJECTS.filter((p) => p.category === "civic").length },
    { id: "bots", label: "Bots & Systems", count: PROJECTS.filter((p) => p.category === "bots").length },
    { id: "web", label: "Web & Tools", count: PROJECTS.filter((p) => p.category === "web").length },
  ];

  const filteredProjects =
    activeCategory === "all"
      ? PROJECTS
      : PROJECTS.filter((p) => p.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[26px] sm:text-[28px] font-bold text-[var(--text-primary)] tracking-[-0.02em] leading-[1.3] mb-2 font-[var(--font-heading)]">
          Projects
        </h1>
        <p className="text-[15px] leading-[1.6] text-[var(--text-muted)] max-w-[720px]">
          Catalogue of software builds, offline-first mobile tools, civic infrastructure, and collegiate automation engines.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-2 flex-wrap pt-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-medium transition-all cursor-pointer ${
              activeCategory === cat.id
                ? "bg-[var(--text-primary)] text-[var(--bg-canvas)] font-semibold shadow-xs"
                : "bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-xs"
            }`}
          >
            {cat.label} ({cat.count})
          </button>
        ))}
      </div>

      {/* 12 Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </div>
  );
}
