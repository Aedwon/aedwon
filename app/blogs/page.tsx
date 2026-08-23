import React from "react";
import Link from "next/link";
import { BLOG_POSTS } from "@/lib/data/blogs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blogs — Aerol (Aedwon)",
  description: "Notes on software, products, and the way I build them.",
  alternates: { canonical: "/blogs" },
  openGraph: {
    title: "Blogs — Aerol (Aedwon)",
    description: "Notes on software, products, and the way I build them.",
    url: "/blogs",
    type: "website",
  },
};

export default function BlogsPage() {
  return (
    <div className="space-y-7 max-w-[760px] mx-auto">
      <div>
        <h1 className="text-[26px] sm:text-[28px] font-bold text-[var(--text-primary)] tracking-[-0.02em] leading-[1.3] mb-2 font-[var(--font-heading)]">
          Blogs
        </h1>
        <p className="text-[15px] leading-[1.6] text-[var(--text-muted)] max-w-[720px]">
          Notes on software, products, and the way I build them.
        </p>
      </div>

      <div className="divide-y divide-[var(--border-subtle)] pt-1">
        {BLOG_POSTS.map((post) => (
          <Link
            key={post.slug}
            href={`/blogs/${post.slug}`}
            className="group block py-6"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-5">
              <h2 className="text-[17px] sm:text-[18px] font-semibold leading-[1.4] text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors font-[var(--font-heading)]">
                {post.title}
              </h2>
              <span className="text-[12px] font-mono text-[var(--text-dim)] shrink-0 whitespace-nowrap">
                {post.date} · {post.readTime}
              </span>
            </div>
            <p className="mt-2 max-w-[700px] text-[13.5px] sm:text-[14px] text-[var(--text-muted)] leading-[1.65]">
              {post.summary}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span key={tag} className="text-[11.5px] font-mono text-[var(--text-dim)]">
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
