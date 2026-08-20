"use client";

import React from "react";
import { PROJECTS, ProjectItem } from "@/lib/data/projects";
import { BLOG_POSTS, BlogPost } from "@/lib/data/blogs";

interface DiscordThreadFeedProps {
  thread: {
    parent: string;
    slug: string;
    title?: string;
  };
  onClose: () => void;
}

export default function DiscordThreadFeed({
  thread,
  onClose,
}: DiscordThreadFeedProps) {
  // Normalize slug lookup
  const normalizeSlug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

  const project: ProjectItem | undefined =
    thread.parent === "projects"
      ? PROJECTS.find(
          (p) =>
            p.slug === thread.slug ||
            normalizeSlug(p.slug) === normalizeSlug(thread.slug) ||
            (thread.slug === "sb-norala" && p.slug === "norala-sb-portal") ||
            (thread.slug === "bettergov" && p.slug === "bettergov-ph") ||
            (thread.slug === "psysc-scorer" && p.slug === "pso-scoring-model") ||
            (thread.slug === "msl-bot" && p.slug === "msl-collegiate-cup-bot") ||
            (thread.slug === "ilocos-sur-bot" && p.slug === "ilocos-sur-esports-bot") ||
            (thread.slug === "oppo-bot" && p.slug === "oppo-legend-cup-bot") ||
            (thread.slug === "gi-calculator" && p.slug === "gi-damage-calculator") ||
            (thread.slug === "agent-framework" && p.slug === "ai-agent-framework")
        )
      : undefined;

  const blog: BlogPost | undefined =
    thread.parent === "blogs"
      ? BLOG_POSTS.find(
          (b) =>
            b.slug === thread.slug ||
            normalizeSlug(b.slug) === normalizeSlug(thread.slug)
        )
      : undefined;

  if (!project && !blog) {
    return (
      <div className="py-8 text-center text-gray-400">
        <p>Thread content not found.</p>
        <button
          onClick={onClose}
          className="mt-3 text-xs text-[#5865F2] hover:underline cursor-pointer"
        >
          Back to #{thread.parent}
        </button>
      </div>
    );
  }

  // Case Study View
  if (project) {
    return (
      <div className="space-y-6 max-w-3xl">
        {/* Thread Header Banner */}
        <div className="pt-2 pb-3 border-b border-[#3f4147]/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-gray-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <h1 className="text-xl font-bold text-white">{project.title}</h1>
            <span className="text-xs bg-[#2b2d31] text-[#949ba4] px-2 py-0.5 rounded border border-[#3f4147]">
              {project.categoryLabel}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-xs bg-[#4e5058] hover:bg-[#6d6f78] text-white px-3 py-1.5 rounded transition-colors cursor-pointer"
          >
            Back to #projects
          </button>
        </div>

        {/* Message 1: Overview */}
        <div className="flex gap-4 group hover:bg-[#2e3035] -mx-4 px-4 py-2 rounded transition-colors">
          <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center text-white font-bold shrink-0 mt-0.5 text-sm ring-1 ring-white/20">
            A
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-[#f2f3f5] hover:underline cursor-pointer text-[14px]">
                Aerol (Aedwon)
              </span>
              <span className="text-[11px] text-[#949ba4]">Today at 12:00 PM</span>
            </div>
            <p className="text-[14px] text-[#dbdee1] leading-relaxed mb-3">
              {project.tagline || project.summary}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs bg-[#2b2d31] p-3 rounded border border-[#3f4147]">
              <div>
                <div className="text-[10px] uppercase font-bold text-[#949ba4]">Role</div>
                <div className="text-white font-medium">{project.role}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-[#949ba4]">Timeline</div>
                <div className="text-white font-medium">{project.timeline}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-[#949ba4]">Category</div>
                <div className="text-white font-medium">{project.categoryLabel}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Message 2: The Spark (Problem Statement) */}
        <div className="flex gap-4 group hover:bg-[#2e3035] -mx-4 px-4 py-2 rounded transition-colors">
          <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center text-white font-bold shrink-0 mt-0.5 text-sm ring-1 ring-white/20">
            A
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-[#f2f3f5] hover:underline cursor-pointer text-[14px]">
                Aerol (Aedwon)
              </span>
              <span className="text-[11px] text-[#949ba4]">Today at 12:01 PM</span>
            </div>
            <h2 className="text-[15px] font-bold text-white mb-1.5">The Spark</h2>
            <p className="text-[14px] text-[#dbdee1] leading-relaxed">
              {project.problem}
            </p>
          </div>
        </div>

        {/* Message 3: Architecture Breakdown */}
        <div className="flex gap-4 group hover:bg-[#2e3035] -mx-4 px-4 py-2 rounded transition-colors">
          <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center text-white font-bold shrink-0 mt-0.5 text-sm ring-1 ring-white/20">
            A
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-[#f2f3f5] hover:underline cursor-pointer text-[14px]">
                Aerol (Aedwon)
              </span>
              <span className="text-[11px] text-[#949ba4]">Today at 12:02 PM</span>
            </div>
            <h2 className="text-[15px] font-bold text-white mb-2">
              Architecture Breakdown
            </h2>
            <div className="space-y-3">
              {project.architecture.map((arch, idx) => (
                <div
                  key={idx}
                  className="bg-[#2b2d31] p-3 rounded border-l-4 border-[#5865F2]"
                >
                  <h3 className="text-white font-bold text-sm mb-1">{arch.title}</h3>
                  <p className="text-xs text-[#b5bac1] leading-relaxed">
                    {arch.description}
                  </p>
                  {arch.codeSnippet && (
                    <pre className="mt-2 p-2.5 bg-[#1e1f22] rounded text-[11px] font-mono text-gray-200 overflow-x-auto border border-[#202225]">
                      <code>{arch.codeSnippet}</code>
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Message 4: Outcome & Metrics */}
        <div className="flex gap-4 group hover:bg-[#2e3035] -mx-4 px-4 py-2 rounded transition-colors">
          <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center text-white font-bold shrink-0 mt-0.5 text-sm ring-1 ring-white/20">
            A
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-[#f2f3f5] hover:underline cursor-pointer text-[14px]">
                Aerol (Aedwon)
              </span>
              <span className="text-[11px] text-[#949ba4]">Today at 12:03 PM</span>
            </div>
            <h2 className="text-[15px] font-bold text-white mb-1.5">
              Outcome &amp; Metrics
            </h2>
            <p className="text-[14px] text-[#dbdee1] leading-relaxed mb-3">
              {project.results}
            </p>

            {project.metrics && project.metrics.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {project.metrics.map((m, idx) => (
                  <div
                    key={idx}
                    className="bg-[#2b2d31] p-2.5 rounded border border-[#3f4147] text-center"
                  >
                    <div className="text-base font-bold text-[#5865F2]">
                      {m.value}
                    </div>
                    <div className="text-[10px] text-[#949ba4] mt-0.5">
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message 5: Tech Stack Chips */}
        <div className="flex gap-4 group hover:bg-[#2e3035] -mx-4 px-4 py-2 rounded transition-colors">
          <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center text-white font-bold shrink-0 mt-0.5 text-sm ring-1 ring-white/20">
            A
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-[#f2f3f5] hover:underline cursor-pointer text-[14px]">
                Aerol (Aedwon)
              </span>
              <span className="text-[11px] text-[#949ba4]">Today at 12:04 PM</span>
            </div>
            <h2 className="text-[15px] font-bold text-white mb-2">Tech Stack</h2>
            <div className="flex flex-wrap gap-1.5">
              {project.stack.map((t, idx) => (
                <span
                  key={idx}
                  className="bg-[#2b2d31] text-gray-200 text-xs px-2.5 py-1 rounded border border-[#3f4147] font-mono"
                >
                  {t.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Blog Article View
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="pt-2 pb-3 border-b border-[#3f4147]/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-gray-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <h1 className="text-xl font-bold text-white">{blog?.title}</h1>
        </div>
        <button
          onClick={onClose}
          className="text-xs bg-[#4e5058] hover:bg-[#6d6f78] text-white px-3 py-1.5 rounded transition-colors cursor-pointer"
        >
          Back to #blogs
        </button>
      </div>

      <div className="flex gap-4 group hover:bg-[#2e3035] -mx-4 px-4 py-2 rounded transition-colors">
        <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center text-white font-bold shrink-0 mt-0.5 text-sm ring-1 ring-white/20">
          A
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-[#f2f3f5] hover:underline cursor-pointer text-[14px]">
              Aerol (Aedwon)
            </span>
            <span className="text-[11px] text-[#949ba4]">
              {blog?.date} · {blog?.readTime}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {blog?.tags.map((tag, idx) => (
              <span
                key={idx}
                className="bg-[#2b2d31] text-[#949ba4] text-xs px-2 py-0.5 rounded border border-[#3f4147]"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="text-[14px] text-[#dbdee1] leading-relaxed whitespace-pre-line">
            {blog?.content}
          </div>
        </div>
      </div>
    </div>
  );
}
