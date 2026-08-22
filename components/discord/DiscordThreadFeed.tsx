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
          Back to #{thread.parent}
        </button>
      </div>
    );
  }

  if (project) return <ProjectThread project={project} onClose={onClose} />;
  return <BlogThread blog={blog!} onClose={onClose} />;
}

function ProjectThread({ project, onClose }: { project: RegisteredProject; onClose: () => void }) {
  const hasArticle = Boolean(project.articleSections?.length);

  return (
    <div className="space-y-6 max-w-3xl">
      <ThreadHeader title={project.title} label={project.categoryLabel} onClose={onClose} parent="projects" />

      <DiscordMessage time="12:00 PM">
        <p className="text-[14px] text-[#dbdee1] leading-relaxed mb-3">{project.tagline}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs bg-[#2b2d31] p-3 rounded border border-[#3f4147]">
          <Metadata label="Role" value={project.role} />
          <Metadata label="Timeline" value={project.timeline} />
          <Metadata label="Category" value={project.categoryLabel} />
        </div>
      </DiscordMessage>

      {hasArticle ? (
        project.articleSections!.map((section, index) => (
          <DiscordMessage key={section.title} time={`12:0${index + 1} PM`}>
            <h2 className="text-[15px] font-bold text-white mb-2">{section.title}</h2>
            <div className="space-y-2.5">
              {section.paragraphs.map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex} className="text-[14px] text-[#dbdee1] leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
            {section.codeSnippet && (
              <CodeBlock code={section.codeSnippet} language={section.codeLanguage || "text"} className="!my-3" />
            )}
          </DiscordMessage>
        ))
      ) : (
        <>
          <DiscordMessage time="12:01 PM">
            <h2 className="text-[15px] font-bold text-white mb-1.5">Problem and constraints</h2>
            <p className="text-[14px] text-[#dbdee1] leading-relaxed">{project.problem}</p>
          </DiscordMessage>

          {project.architecture.length > 0 && (
            <DiscordMessage time="12:02 PM">
              <h2 className="text-[15px] font-bold text-white mb-2">Architecture</h2>
              <div className="space-y-3">
                {project.architecture.map((item) => (
                  <div key={item.title} className="bg-[#2b2d31] p-3 rounded border-l-4 border-[#5865F2]">
                    <h3 className="text-white font-bold text-sm mb-1">{item.title}</h3>
                    <p className="text-xs text-[#b5bac1] leading-relaxed">{item.description}</p>
                    {item.tradeOff && (
                      <p className="text-xs text-[#b5bac1] leading-relaxed mt-1.5">
                        <strong className="text-white">Trade-off:</strong> {item.tradeOff}
                      </p>
                    )}
                    {item.codeSnippet && (
                      <CodeBlock code={item.codeSnippet} language={item.codeLanguage || "text"} className="!my-2" />
                    )}
                  </div>
                ))}
              </div>
            </DiscordMessage>
          )}

          {project.hurdles && project.hurdles.length > 0 && (
            <DiscordMessage time="12:03 PM">
              <h2 className="text-[15px] font-bold text-white mb-2">Hurdles and solutions</h2>
              <div className="space-y-3">
                {project.hurdles.map((hurdle) => (
                  <div key={hurdle.title} className="bg-[#2b2d31] p-3 rounded border border-[#3f4147] space-y-1">
                    <h3 className="text-white font-bold text-sm">{hurdle.title}</h3>
                    <p className="text-xs text-[#b5bac1] leading-relaxed"><strong className="text-white">Problem:</strong> {hurdle.issue}</p>
                    <p className="text-xs text-[#b5bac1] leading-relaxed"><strong className="text-white">Resolution:</strong> {hurdle.solution}</p>
                  </div>
                ))}
              </div>
            </DiscordMessage>
          )}
        </>
      )}

      <DiscordMessage time="12:05 PM">
        <h2 className="text-[15px] font-bold text-white mb-1.5">Outcome</h2>
        <p className="text-[14px] text-[#dbdee1] leading-relaxed mb-3">{project.results}</p>
        {project.metrics && project.metrics.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {project.metrics.map((metric) => (
              <div key={`${metric.value}-${metric.label}`} className="bg-[#2b2d31] p-2.5 rounded border border-[#3f4147] text-center">
                <div className="text-base font-bold text-[#5865F2]">{metric.value}</div>
                <div className="text-[10px] text-[#949ba4] mt-0.5">{metric.label}</div>
              </div>
            ))}
          </div>
        )}
      </DiscordMessage>

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
        <div className="text-[14px] text-[#dbdee1] leading-relaxed whitespace-pre-line">{blog.content}</div>
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
        <h1 className="text-xl font-bold text-white truncate">{title}</h1>
        {label && <span className="hidden sm:inline text-xs bg-[#2b2d31] text-[#949ba4] px-2 py-0.5 rounded border border-[#3f4147]">{label}</span>}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="text-xs bg-[#4e5058] hover:bg-[#6d6f78] text-white px-3 py-1.5 rounded transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5865F2]"
      >
        Back to #{parent}
      </button>
    </div>
  );
}

function DiscordMessage({ children, time }: { children: React.ReactNode; time: string }) {
  return (
    <div className="flex gap-4 group hover:bg-[#2e3035] -mx-4 px-4 py-2 rounded transition-colors">
      <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center text-white font-bold shrink-0 mt-0.5 text-sm ring-1 ring-white/20">A</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-[#f2f3f5] text-[14px]">Aerol (Aedwon)</span>
          <span className="text-[11px] text-[#949ba4]">Today at {time}</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function Metadata({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase font-bold text-[#949ba4]">{label}</div>
      <div className="text-white font-medium">{value}</div>
    </div>
  );
}
