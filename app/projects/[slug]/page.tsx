import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PROJECTS } from "@/lib/data/projects";
import { TechIcon } from "@/components/TechIcons";
import { ProjectArt } from "@/components/ProjectCard";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return PROJECTS.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);
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
  const projectIndex = PROJECTS.findIndex((p) => p.slug === slug);

  if (projectIndex === -1) {
    notFound();
  }

  const project = PROJECTS[projectIndex];
  const nextProject = PROJECTS[(projectIndex + 1) % PROJECTS.length];

  const getPlatformIcon = (icon: string) => {
    switch (icon) {
      case "android":
        return (
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.996-3.4572c.1556-.2696.0633-.6139-.2063-.7695-.2695-.1555-.6138-.0632-.7694.2063l-2.0231 3.5042c-1.464-.6684-3.0976-1.0408-4.8787-1.0408s-3.4147.3724-4.8787 1.0408L5.0992 5.3012c-.1556-.2695-.4999-.3618-.7694-.2063-.2696.1556-.3619.4999-.2063.7695l1.996 3.4572C2.6884 11.161.3262 14.8878.0001 19.3458h23.9998c-.3261-4.458-2.6883-8.1848-6.1194-10.0244" />
          </svg>
        );
      case "apple":
        return (
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.92.04-2.02.62-2.66 1.37-.56.65-.96 1.7-0.84 2.72.93.07 1.97-.49 2.58-1.24z" />
          </svg>
        );
      case "server":
        return (
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M4 4h16c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 10h16c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2zm2-7h.01M6 17h.01" />
          </svg>
        );
      case "web":
        return (
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1a2 2 0 0 0 2 2v1.93zm6.9-2.54A7.95 7.95 0 0 0 19 12c0-1.63-.49-3.14-1.33-4.4L13 12v3a2 2 0 0 0 2 2h1.4c.54 0 1.05.2 1.5.4z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-[760px] mx-auto">
      {/* Breadcrumb */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-[13px] font-mono text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors mb-2"
      >
        ← Back to all projects
      </Link>

      {/* Header */}
      <header className="space-y-3">
        <div className="flex justify-between items-baseline flex-wrap gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-[28px] sm:text-[32px] font-bold text-[var(--text-primary)] tracking-[-0.02em] font-[var(--font-heading)]">
              {project.title}
            </h1>
            <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.06] border border-[var(--border-subtle)] text-[var(--text-dim)]">
              {project.tier === "flagship" ? "Flagship" : "Focused Tool"}
            </span>
          </div>

          <div className="flex gap-3 text-[13px] font-mono">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline inline-flex items-center gap-1"
              >
                {new URL(project.liveUrl).hostname} ↗
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--text-dim)] hover:text-[var(--text-primary)] hover:underline inline-flex items-center gap-1"
              >
                GitHub ↗
              </a>
            )}
          </div>
        </div>

        <p className="text-[15.5px] leading-[1.6] text-[var(--text-muted)]">
          {project.tagline}
        </p>

        {/* VERIFIED STYLE C METADATA STRIP */}
        <div className="grid grid-cols-1 sm:grid-cols-[180px_160px_1fr] gap-4 py-4 border-y border-[var(--border-subtle)] items-center my-6">
          {/* 1. Role */}
          <div>
            <span className="text-[10.5px] font-mono uppercase tracking-wider text-[var(--text-dim)] block mb-1">
              Role
            </span>
            <span className="text-[13.5px] font-medium text-[var(--text-primary)]">
              {project.role}
            </span>
          </div>

          {/* 2. Platform */}
          <div>
            <span className="text-[10.5px] font-mono uppercase tracking-wider text-[var(--text-dim)] block mb-1">
              Platform
            </span>
            <div className="flex gap-1.5 items-center flex-wrap">
              {project.platforms.map((pl, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 text-[12px] text-[var(--text-primary)] bg-black/[0.02] dark:bg-white/[0.04] px-2 py-0.5 rounded border border-[var(--border-subtle)]"
                >
                  {getPlatformIcon(pl.icon)}
                  <span>{pl.name}</span>
                </span>
              ))}
            </div>
          </div>

          {/* 3. Tech Stack (Exhaustive Icons with Tooltips) */}
          <div>
            <span className="text-[10.5px] font-mono uppercase tracking-wider text-[var(--text-dim)] block mb-1">
              Tech Stack
            </span>
            <div className="flex gap-1.5 items-center flex-wrap">
              {project.stack.map((t, idx) => (
                <div
                  key={idx}
                  data-tooltip={t.name}
                  className="has-tooltip w-7 h-7 rounded-md bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] border border-black/[0.04] dark:border-white/[0.06] hover:border-black/[0.1] dark:hover:border-white/[0.16] flex items-center justify-center transition-all hover:-translate-y-0.5"
                >
                  <TechIcon name={t.name} colored={true} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Ambient Visual Hero Stage */}
      <div
        className={`h-[160px] rounded-[var(--card-radius)] flex items-center justify-center my-6 shadow-[var(--card-shadow)] glow-${project.glowColor}`}
      >
        <ProjectArt slug={project.slug} brandColor={project.brandColor} />
      </div>

      {/* Grounded Narrative Prose */}
      <article className="space-y-10 text-[14.5px] sm:text-[15px] leading-[1.7] text-[var(--text-muted)] pt-2">
        {/* Section 1: Problem & Constraints (or Why I Built This) */}
        <section className="space-y-3">
          <h2 className="text-[17px] font-semibold text-[var(--text-primary)] tracking-[-0.01em] font-[var(--font-heading)]">
            {project.tier === "flagship" ? "Problem & Constraints" : "Why I Built This"}
          </h2>
          <p className="leading-relaxed">{project.problem}</p>
        </section>

        {/* Section 2: How It's Built (or How It Works) */}
        <section className="space-y-4">
          <h2 className="text-[17px] font-semibold text-[var(--text-primary)] tracking-[-0.01em] font-[var(--font-heading)]">
            {project.tier === "flagship" ? "How It's Built" : "How It Works"}
          </h2>
          <div className="space-y-5">
            {project.architecture.map((arch, idx) => (
              <div key={idx} className="space-y-2.5">
                <h3 className="text-[14.5px] font-semibold text-[var(--text-primary)]">
                  {idx + 1}. {arch.title}
                </h3>
                <p className="leading-relaxed">{arch.description}</p>
                
                {arch.tradeOff && (
                  <div className="text-[13px] bg-black/[0.02] dark:bg-white/[0.03] p-3 rounded-lg border-l-2 border-[var(--accent)] text-[var(--text-muted)] italic my-2">
                    <span className="font-semibold text-[var(--text-primary)] not-italic mr-1.5">Trade-off:</span>
                    {arch.tradeOff}
                  </div>
                )}

                {arch.codeSnippet && (
                  <pre className="bg-black/50 dark:bg-black/70 p-4 rounded-xl font-mono text-[12.5px] text-gray-200 overflow-x-auto my-3 border border-[var(--border-subtle)] leading-relaxed">
                    <code>{arch.codeSnippet}</code>
                  </pre>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Hurdles & Solutions (Flagship Tier Only) */}
        {project.tier === "flagship" && project.hurdles && project.hurdles.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-[17px] font-semibold text-[var(--text-primary)] tracking-[-0.01em] font-[var(--font-heading)]">
              Hurdles &amp; Solutions
            </h2>
            <div className="space-y-3.5">
              {project.hurdles.map((hurdle, idx) => (
                <div
                  key={idx}
                  className="bg-[var(--bg-card)] p-4 rounded-[var(--card-radius)] border border-[var(--border-subtle)] space-y-2 shadow-xs"
                >
                  <h3 className="text-[14px] font-semibold text-[var(--text-primary)]">
                    {hurdle.title}
                  </h3>
                  <div className="text-[13.5px] space-y-1.5">
                    <p className="text-[var(--text-muted)]">
                      <strong className="text-[var(--text-primary)] font-medium">Issue:</strong> {hurdle.issue}
                    </p>
                    <p className="text-[var(--text-muted)]">
                      <strong className="text-[var(--text-primary)] font-medium">Solution:</strong> {hurdle.solution}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 4: Results & Numbers */}
        <section className="space-y-4">
          <h2 className="text-[17px] font-semibold text-[var(--text-primary)] tracking-[-0.01em] font-[var(--font-heading)]">
            Results &amp; Numbers
          </h2>
          <p className="leading-relaxed">{project.results}</p>

          {/* Metrics Pills */}
          {project.metrics && project.metrics.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {project.metrics.map((m, idx) => (
                <div
                  key={idx}
                  className="bg-[var(--bg-card)] p-3.5 rounded-[var(--card-radius)] border border-[var(--border-subtle)] text-center shadow-xs"
                >
                  <div className="text-[18px] font-bold text-[var(--accent)] font-mono">
                    {m.value}
                  </div>
                  <div className="text-[11.5px] text-[var(--text-muted)] mt-1">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Retrospective Note */}
          {project.retrospective && (
            <div className="mt-4 p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-[var(--border-subtle)] text-[13.5px] leading-relaxed">
              <span className="font-semibold text-[var(--text-primary)] block mb-1">
                Retrospective Note
              </span>
              <p className="text-[var(--text-muted)]">{project.retrospective}</p>
            </div>
          )}
        </section>
      </article>

      {/* Next Project Footer */}
      <div className="mt-14 pt-8 border-t border-[var(--border-subtle)]">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-dim)] block mb-2.5">
          Next Project
        </span>
        <Link
          href={`/projects/${nextProject.slug}`}
          className="group block bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] p-5 rounded-[var(--card-radius)] border border-[var(--border-subtle)] transition-all shadow-sm"
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="text-[15.5px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                {nextProject.title} →
              </div>
              <p className="text-[13px] text-[var(--text-muted)] mt-1">
                {nextProject.summary}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--text-arrow)] group-hover:translate-x-1 group-hover:text-[var(--text-primary)] transition-all shrink-0 ml-4" />
          </div>
        </Link>
      </div>
    </div>
  );
}
