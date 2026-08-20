"use client";

import React from "react";
import { BLOG_POSTS } from "@/lib/data/blogs";
import DiscordEmbedCard from "./DiscordEmbedCard";

import DiscordBotFooter from "./DiscordBotFooter";

interface DiscordBlogsFeedProps {
  onOpenThread?: (parent: string, slug: string, title?: string) => void;
}

export default function DiscordBlogsFeed({
  onOpenThread,
}: DiscordBlogsFeedProps) {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="pt-4 pb-3 border-b border-[#3f4147]/40 mb-4">
        <div className="w-16 h-16 rounded-full bg-[#3f4248] flex items-center justify-center text-white text-3xl font-light mb-2">
          <svg
            className="w-9 h-9 text-gray-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" x2="20" y1="9" y2="9" />
            <line x1="4" x2="20" y1="15" y2="15" />
            <line x1="10" x2="8" y1="3" y2="21" />
            <line x1="16" x2="14" y1="3" y2="21" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Welcome to #blogs!</h1>
        <p className="text-sm text-[#949ba4]">
          Technical notes, architecture retrospectives, and engineering writeups.
        </p>
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
            <span className="text-[11px] text-[#949ba4]">Today at 12:00 PM</span>
          </div>

          <h2 className="text-[16px] font-bold text-white mb-4">Articles</h2>

          <div className="space-y-4 max-w-2xl">
            {BLOG_POSTS.map((post) => (
              <DiscordEmbedCard
                key={post.slug}
                title={post.title}
                borderColor="#5865F2"
                summary={`${post.date} · ${post.readTime} — ${post.summary}`}
                stack={post.tags.join(" · ")}
                linkText="Read article →"
                onLinkClick={() => onOpenThread?.("blogs", post.slug, post.title)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer System Message */}
      <DiscordBotFooter />
    </div>
  );
}
