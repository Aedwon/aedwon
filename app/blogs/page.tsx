import React from "react";
import Link from "next/link";
import { BLOG_POSTS } from "@/lib/data/blogs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blogs — Aerol (Aedwon)",
  description: "Technical notes on offline software architecture, tournament systems, and agentic workflows.",
  alternates: { canonical: "/blogs" },
  openGraph: {
    title: "Blogs — Aerol (Aedwon)",
    description: "Technical notes on offline software architecture, tournament systems, and agentic workflows.",
    url: "/blogs",
    type: "website",
  },
};

export default function BlogsPage() {
  return (
    <div className="space-y-6 max-w-[760px] mx-auto">
      <div>
        <h1 className="text-[26px] sm:text-[28px] font-bold text-[var(--text-primary)] tracking-[-0.02em] leading-[1.3] mb-2 font-[var(--font-heading)]">
          Blogs
        </h1>
        <p className="text-[15px] leading-[1.6] text-[var(--text-muted)] max-w-[720px]">
          Notes on offline systems, tournament platform engineering, and agentic workflows.
        </p>
      </div>

      <div className="divide-y divide-[var(--border-subtle)] pt-2">
        {BLOG_POSTS.map((post) => (
          <Link
            key={post.slug}
            href={`/blogs/${post.slug}`}
            className="group block py-5 transition-all"
          >
            <div className="flex justify-between items-baseline gap-4 mb-1.5">
              <h2 className="text-[16px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors font-[var(--font-heading)]">
                {post.title}
              </h2>
              <span className="text-[12px] font-mono text-[var(--text-dim)] shrink-0 whitespace-nowrap">
                {post.date} · {post.readTime}
              </span>
            </div>
            <p className="text-[13.5px] text-[var(--text-muted)] leading-[1.55]">
              {post.summary}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
