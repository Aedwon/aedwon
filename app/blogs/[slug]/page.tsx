import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS } from "@/lib/data/blogs";
import { BlogContent } from "@/components/blog-content";
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

  const title = `${post.title} — Aerol (Aedwon)`;
  const canonical = `/blogs/${post.slug}`;

  return {
    title,
    description: post.summary,
    alternates: { canonical },
    openGraph: {
      title,
      description: post.summary,
      url: canonical,
      type: "article",
      publishedTime: new Date(post.date).toISOString(),
    },
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
    <div className="max-w-[760px] mx-auto">
      <Link
        href="/blogs"
        className="inline-flex items-center gap-1.5 text-[13px] font-mono text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors mb-8"
      >
        ← Back to all blogs
      </Link>

      <article>
        <header className="pb-7 mb-9 border-b border-[var(--border-subtle)]">
          <h1 className="max-w-[720px] text-[28px] sm:text-[34px] font-bold text-[var(--text-primary)] tracking-[-0.025em] leading-[1.22] font-[var(--font-heading)]">
            {post.title}
          </h1>
          <p className="mt-4 max-w-[680px] text-[14.5px] sm:text-[15px] leading-[1.65] text-[var(--text-muted)]">
            {post.summary}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] font-mono text-[var(--text-dim)]">
            <span>{post.date}</span>
            <span aria-hidden="true">·</span>
            <span>{post.readTime}</span>
            <span aria-hidden="true">·</span>
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded border border-[var(--border-subtle)] px-2 py-0.5 text-[var(--text-muted)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </header>

        <BlogContent blocks={post.blocks} />
      </article>

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
