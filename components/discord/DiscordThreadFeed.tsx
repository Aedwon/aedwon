"use client";

import React from "react";
import { getProjectBySlug, type RegisteredProject } from "@/lib/data/project-registry";
import { BLOG_POSTS, type BlogPost } from "@/lib/data/blogs";
import DiscordBotFooter from "./DiscordBotFooter";
import CodeBlock from "@/components/CodeBlock";

interface DiscordThreadFeedProps {
  thread: {
    parent: string;
    slug: string;
    title?: string;
  };
  onClose: () => void;
}

function normalizeSlug(slug: string): string {
  return slug.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export default function DiscordThreadFeed({ thread, onClose }: DiscordThreadFeedProps) {
  const project = thread.parent === "projects" ? getProjectBySlug(thread.slug) : undefined;
  const blog =
    thread.parent === "blogs"
      ? BLOG_POSTS.find(
          (post) =>
            post.slug === thread.slug ||
            normalizeSlug(post.slug) === normalizeSlug(thread.slug),
        )
      : undefined;

  if (!project && !blog) {
    return (
      <div className="py-8 text-center text-gray-400">
        <p>Thread content not found.</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 text-xs text-[#5865F2] hover:underline cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5865F2]"
        >
          ← Back
        </button>
      </div>
    );
  }

  if (blog) {
    return <BlogThread blog={blog} onClose={onClose} />;
  }

  return <ProjectThread project={project!} onClose={onClose} />;
}

function ProjectThread({ project, onClose }: { project: RegisteredProject; onClose: () => void }) {
  return (
    <div className="space-y-6 max-w-3xl">
      <ThreadHeader title={project.title} label={project.tagline} onClose={onClose} parent="projects" />

      <DiscordMessage time="12:00 PM">
        <p className="text-[14px] text-[#dbdee1] leading-relaxed">{project.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.stack.slice(0, 6).map((item) => (
            <span key={item.name} className="bg-[#2b2d31] text-gray-300 text-xs px-2.5 py-1 rounded border border-[#3f4147] font-mono">
              {item.name}
            </span>
          ))}
        </div>
      </DiscordMessage>

      {project.caseStudy?.sections.map((section, idx) => (
        <DiscordMessage key={section.title} time={`12:${String(2 + idx).padStart(2, "0")} PM`}>
          <h2 className="text-[15px] font-bold text-white mb-2">{section.title}</h2>
          <div className="text-[14px] text-[#dbdee1] leading-relaxed space-y-3">
            {section.paragraphs?.map((paragraph, paragraphIndex) => (
              <p key={paragraphIndex}>{paragraph}</p>
            ))}
            {section.bullets?.length ? (
              <ul className="list-disc pl-5 space-y-1">
                {section.bullets.map((bullet, bulletIndex) => (
                  <li key={bulletIndex}>{bullet}</li>
                ))}
              </ul>
            ) : null}
            {section.code ? <CodeBlock code={section.code.code} language={section.code.language} filename={section.code.filename} /> : null}
          </div>
        </DiscordMessage>
      ))}

      <DiscordMessage time="12:06 PM">
        <h2 className="text-[15px] font-bold text-white mb-2">Tech stack</h2>
        <div className="flex flex-wrap gap-1.5">
          {project.stack.map((item) => (
            <span key={item.name} className="bg-[#2b2d31] text-gray-200 text-xs px-2.5 py-1 rounded border border-[#3f4147] font-mono">
              {item.name}
            </span>
          ))}
        </div>
      </DiscordMessage>

      <DiscordBotFooter />
    </div>
  );
}

function BlogThread({ blog, onClose }: { blog: BlogPost; onClose: () => void }) {
  return (
    <div className="space-y-6 max-w-3xl">
      <ThreadHeader title={blog.title} onClose={onClose} parent="blogs" />
      <DiscordMessage time="12:00 PM">
        <div className="text-[11px] text-[#949ba4] mb-3">{blog.date} · {blog.readTime}</div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {blog.tags.map((tag) => (
            <span key={tag} className="bg-[#2b2d31] text-[#949ba4] text-xs px-2 py-0.5 rounded border border-[#3f4147]">#{tag}</span>
          ))}
        </div>
        <p className="text-[14px] text-[#dbdee1] leading-relaxed">{blog.summary}</p>
        <a
          href={`/blogs/${blog.slug}`}
          className="mt-4 inline-flex text-[13px] font-medium text-[#8ea1e1] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5865F2]"
        >
          Open full article →
        </a>
      </DiscordMessage>
      <DiscordBotFooter />
    </div>
  );
}

function ThreadHeader({ title, label, onClose, parent }: { title: string; label?: string; onClose: () => void; parent: "projects" | "blogs" }) {
  return (
    <div className="pt-2 pb-3 border-b border-[#3f4147]/40 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <svg className="w-5 h-5 text-gray-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs text-[#949ba4] shrink-0">{parent === "projects" ? "projects" : "blogs"}</span>
            <span className="text-xs text-[#949ba4] shrink-0">›</span>
            <h1 className="text-sm font-semibold text-white truncate">{title}</h1>
          </div>
          {label ? <p className="text-[11px] text-[#949ba4] truncate mt-0.5">{label}</p> : null}
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close thread"
        className="shrink-0 p-1.5 rounded text-[#949ba4] hover:text-white hover:bg-[#35373c] cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5865F2]"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m18 6-12 12" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </div>
  );
}

function DiscordMessage({ children, time }: { children: React.ReactNode; time: string }) {
  return (
    <div className="flex gap-3 group">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5865F2] to-[#7289da] flex items-center justify-center shrink-0 text-white font-bold text-xs">
        A
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm font-medium text-white">Aedwon</span>
          <span className="text-[10px] text-[#949ba4]">Today at {time}</span>
        </div>
        {children}
      </div>
    </div>
  );
}
