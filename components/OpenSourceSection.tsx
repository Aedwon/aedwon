"use client";

import React from "react";
import ProjectCard from "./ProjectCard";
import { PROJECTS } from "@/lib/data/projects";

export default function OpenSourceSection() {
  const betterGovProject = PROJECTS.find((p) => p.slug === "bettergov-ph") || {
    slug: "bettergov-ph",
    title: "BetterGov PH",
    tagline: "Open-source civic tech initiative modernizing Philippine government digital infrastructure.",
    category: "civic" as const,
    categoryLabel: "Civic Tech",
    role: "Open Source Contributor",
    timeline: "2024 to Present",
    featured: false,
    order: 5,
    glowColor: "green" as const,
    brandColor: "#34D399",
    icon: "shield-check",
    platforms: [{ name: "Web", icon: "web" as const }],
    stack: [
      { name: "TypeScript", icon: "typescript" },
      { name: "Next.js", icon: "nextjs" },
      { name: "Tailwind CSS", icon: "tailwind" },
    ],
    liveUrl: "https://bettergov.ph",
    summary:
      "Contributor to civic tech initiatives modernizing Philippine government web services and open public data.",
    problem: "",
    architecture: [],
    results: "",
  };

  return (
    <section id="open-source">
      <h2 className="text-[18px] font-semibold text-[var(--text-primary)] mb-4 font-[var(--font-heading)]">
        Open source
      </h2>

      <div className="max-w-[420px]">
        <ProjectCard
          project={betterGovProject}
          external={true}
          href="https://bettergov.ph"
        />
      </div>
    </section>
  );
}
