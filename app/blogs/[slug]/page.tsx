import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS } from "@/lib/data/blogs";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: `${post.title} — Aerol (Aedwon)`,
    description: post.summary,
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-[760px] mx-auto">
      {/* Breadcrumb */}
      <Link
        href="/blogs"
        className="inline-flex items-center gap-1.5 text-[13px] font-mono text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors mb-2"
      >
        ← Back to all blogs
      </Link>

      {/* Article Header */}
      <header className="space-y-3 pb-6 border-b border-[var(--border-subtle)]">
        <h1 className="text-[26px] sm:text-[30px] font-bold text-[var(--text-primary)] tracking-[-0.02em] leading-[1.3] font-[var(--font-heading)]">
          {post.title}
        </h1>
        <div className="flex items-center gap-3 text-[12.5px] font-mono text-[var(--text-dim)]">
          <span>{post.date}</span>
          <span>·</span>
          <span>{post.readTime}</span>
          <span>·</span>
          <div className="flex gap-1.5">
            {post.tags.map((tag, idx) => (
              <span key={idx} className="bg-white/[0.04] px-2 py-0.5 rounded text-[var(--text-muted)]">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Article Prose */}
      <article className="space-y-6 text-[15px] leading-[1.75] text-[var(--text-muted)] pt-2 whitespace-pre-line font-sans">
        {post.content.trim()}
      </article>

      {/* Back to all blogs footer */}
      <div className="mt-14 pt-8 border-t border-[var(--border-subtle)]">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-1.5 text-[13.5px] font-mono text-[var(--accent)] hover:underline"
        >
          ← Read more articles on /blogs
        </Link>
      </div>
    </div>
  );
}
