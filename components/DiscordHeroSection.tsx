"use client";

import React from "react";
import { PROJECTS } from "@/lib/data/projects";
import { EXPERIENCES } from "@/lib/data/experience";
import { Bot, Pin, ShieldCheck, Mail } from "lucide-react";
import Link from "next/link";

function DiscordMessage({
  author,
  avatar,
  timestamp,
  isPinned = false,
  children,
}: {
  author: string;
  avatar: string;
  timestamp: string;
  isPinned?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 py-2 hover:bg-[#32353b] px-2 rounded transition-colors group">
      <div className="shrink-0">
        <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center text-white font-bold">
          {avatar}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-white hover:underline cursor-pointer">{author}</span>
          {isPinned && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Pin className="w-3 h-3" /> Pinned
            </span>
          )}
          <span className="text-xs text-gray-500">{timestamp}</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function DiscordEmbed({
  color = "#5865F2",
  title,
  description,
  fields,
  footer,
  url,
}: {
  color?: string;
  title?: string;
  description?: string;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: string;
  url?: string;
}) {
  return (
    <div
      className="max-w-xl mt-2 rounded overflow-hidden shadow-sm"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="bg-[#2f3136] p-4">
        {title && (
          <div className="font-semibold text-white mb-1.5 flex items-center justify-between">
            <span>{title}</span>
            {url && (
              <Link href={url} className="text-xs text-[#5865F2] hover:underline font-mono">
                View Details →
              </Link>
            )}
          </div>
        )}
        {description && <div className="text-sm text-gray-300 mb-3 leading-relaxed">{description}</div>}
        {fields && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            {fields.map((field, i) => (
              <div key={i} className={field.inline ? "" : "col-span-2"}>
                <div className="text-xs font-semibold text-gray-400 uppercase">{field.name}</div>
                <div className="text-sm text-gray-300">{field.value}</div>
              </div>
            ))}
          </div>
        )}
        {footer && (
          <div className="text-xs text-gray-500 mt-3 pt-2 border-t border-[#42464d]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DiscordHeroSection() {
  return (
    <div className="flex flex-col space-y-6">
      {/* Welcome Banner */}
      <div className="bg-[#2f3136] rounded-lg p-4 border border-[#202225] flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[#5865F2] flex items-center justify-center text-white shrink-0">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Welcome to #home</h1>
          <p className="text-xs text-gray-400">
            This is the start of Aerol's portfolio server.
          </p>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="space-y-4">
        {/* Intro Message */}
        <DiscordMessage author="Aerol (Aedwon)" avatar="A" timestamp="Today at 12:00 PM" isPinned>
          <p className="text-gray-300">
            I studied Computer Science at UP Diliman on a DOST Merit Scholarship, following high school at Philippine Science High School. I like building things :)
          </p>
          <DiscordEmbed
            color="#5865F2"
            title="About Me"
            description="I spend around 80% of any project on research and planning before writing code. I obsess over hyper-optimization, always evaluating whether an architecture or workflow is truly the most optimal choice for the problem."
            footer="Daily Stack: Claude Code · Codex · using-superpowers · Gemini Deep Research"
          />
        </DiscordMessage>

        {/* Featured Projects Message */}
        <DiscordMessage author="Aerol (Aedwon)" avatar="A" timestamp="Today at 12:01 PM">
          <p className="text-gray-300 font-semibold mb-2">
            🚀 Featured Projects
          </p>
          {PROJECTS.filter((p) => p.featured).map((p) => (
            <DiscordEmbed
              key={p.slug}
              color={p.brandColor}
              title={p.title}
              url={`/projects/${p.slug}`}
              description={p.summary}
              fields={[
                { name: "Platform", value: p.platforms.map((pl) => pl.name).join(", "), inline: true },
                { name: "Tech Stack", value: p.stack.slice(0, 4).map((s) => s.name).join(", "), inline: true },
              ]}
              footer={`Role: ${p.role}`}
            />
          ))}
        </DiscordMessage>

        {/* Experience Message */}
        <DiscordMessage author="Aerol (Aedwon)" avatar="A" timestamp="Today at 12:02 PM">
          <p className="text-gray-300 font-semibold mb-2">
            💼 Experience Overview
          </p>
          <DiscordEmbed
            color="#34D399"
            title="Leadership & Engineering History"
            description="7 organizations across marketing, esports operations, logistics, and infrastructure:"
            fields={EXPERIENCES.map((e) => ({
              name: e.shortName,
              value: e.roles.map((r) => r.title).join(" · "),
            }))}
          />
        </DiscordMessage>

        {/* Reactions */}
        <div className="flex gap-2 pl-14">
          <button className="flex items-center gap-1.5 px-2.5 py-1 bg-[#2f3136] hover:bg-[#36393f] border border-[#42464d] rounded text-xs text-gray-300 cursor-pointer">
            <span>🔥</span> <span>18</span>
          </button>
          <button className="flex items-center gap-1.5 px-2.5 py-1 bg-[#2f3136] hover:bg-[#36393f] border border-[#42464d] rounded text-xs text-gray-300 cursor-pointer">
            <span>👀</span> <span>12</span>
          </button>
          <button className="flex items-center gap-1.5 px-2.5 py-1 bg-[#2f3136] hover:bg-[#36393f] border border-[#42464d] rounded text-xs text-gray-300 cursor-pointer">
            <span>🚀</span> <span>9</span>
          </button>
        </div>
      </div>
    </div>
  );
}
