"use client";

import React from "react";
import DiscordEmbedCard from "./DiscordEmbedCard";
import DiscordButton from "./DiscordButton";
import DiscordBotFooter from "./DiscordBotFooter";
import { EXPERIENCES } from "@/lib/data/experience";
import { getFeaturedProjects, getProjectBySlug } from "@/lib/data/project-registry";

interface DiscordHomeFeedProps {
  onOpenThread?: (parent: string, slug: string, title?: string) => void;
  onSwitchChannel?: (channel: string) => void;
}

const FEATURED_PROJECTS = getFeaturedProjects();
const BETTERGOV = getProjectBySlug("bettergov-ph");

const ENTITY_BORDER_COLORS: Record<string, string> = {
  psysc: "#10B981",
  moonton: "#5865F2",
  "up-fighting-maroons": "#8B5CF6",
  "up-oblation-esports": "#06B6D4",
  "dark-league-studios": "#EC4899",
  "up-fair": "#F59E0B",
  hoyoverse: "#3B82F6",
};

const PROJECT_BORDER_COLORS: Record<string, string> = {
  mobile: "#10B981",
  civic: "#06B6D4",
  bots: "#5865F2",
  web: "#F59E0B",
};

export default function DiscordHomeFeed({ onOpenThread, onSwitchChannel }: DiscordHomeFeedProps) {
  return (
    <div className="space-y-6">
      <div className="pt-4 pb-3 border-b border-[#3f4147]/40 mb-4">
        <div className="w-16 h-16 rounded-full bg-[#3f4248] flex items-center justify-center text-white text-3xl font-light mb-2">
          <svg className="w-9 h-9 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="4" x2="20" y1="9" y2="9" />
            <line x1="4" x2="20" y1="15" y2="15" />
            <line x1="10" x2="8" y1="3" y2="21" />
            <line x1="16" x2="14" y1="3" y2="21" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Welcome to #home!</h1>
        <p className="text-sm text-[#949ba4]">This is the start of the #home channel.</p>
      </div>

      <Message time="12:00 PM">
        <h1 className="text-[16px] font-bold text-white mb-1.5">I&apos;m Aerol. You might also know me as Aedwon.</h1>
        <p className="text-[14px] text-[#dbdee1] leading-relaxed">
          I studied Computer Science at UP Diliman on a DOST Merit Scholarship, following high school at Philippine Science High School. I like building things :)
        </p>
        <div className="flex items-center gap-1.5 mt-3 text-xs" aria-hidden="true">
          {[["🔥", "18"], ["👀", "12"], ["🚀", "9"]].map(([emoji, count]) => (
            <span key={emoji} className="bg-[#2b2d31] border border-[#3f4147] px-2 py-0.5 rounded flex items-center gap-1.5 text-gray-200">
              <span>{emoji}</span><span className="font-semibold text-[11px]">{count}</span>
            </span>
          ))}
        </div>
      </Message>

      <Message time="12:01 PM">
        <h2 className="text-[16px] font-bold text-white mb-3">Featured projects</h2>
        <div className="space-y-3">
          {FEATURED_PROJECTS.map((project) => (
            <DiscordEmbedCard
              key={project.slug}
              title={project.title}
              borderColor={PROJECT_BORDER_COLORS[project.category] ?? "#5865F2"}
              summary={project.summary}
              stack={project.stack.map((item) => item.name).join(" · ")}
              onLinkClick={() => onOpenThread?.("projects", project.slug, project.title)}
            />
          ))}
          <div className="pt-2">
            <DiscordButton onClick={() => onSwitchChannel?.("projects")}>See all projects</DiscordButton>
          </div>
        </div>
      </Message>

      {BETTERGOV && (
        <Message time="12:02 PM">
          <h2 className="text-[16px] font-bold text-white mb-2">Open source</h2>
          <DiscordEmbedCard
            title={BETTERGOV.title}
            borderColor="#06B6D4"
            summary={BETTERGOV.summary}
            stack={BETTERGOV.stack.map((item) => item.name).join(" · ")}
            linkText="bettergov.ph ↗"
            linkHref={BETTERGOV.liveUrl}
            isExternal
          />
        </Message>
      )}

      <Message time="12:04 PM">
        <h2 className="text-[16px] font-bold text-white mb-3">Experience</h2>
        <div className="space-y-3 max-w-2xl">
          {EXPERIENCES.map((entity) => (
            <div
              key={entity.id}
              style={{ borderLeftColor: ENTITY_BORDER_COLORS[entity.id] || "#5865F2" }}
              className="bg-[#2b2d31] rounded-[4px] border-l-4 p-4 shadow-sm space-y-3"
            >
              <div className="border-b border-[#3f4147]/50 pb-1.5">
                <h3 className="text-white font-bold text-[14.5px]">{entity.name}</h3>
              </div>
              <div className="space-y-3 text-xs text-[#b5bac1]">
                {entity.roles.map((role) => (
                  <div key={`${role.title}-${role.period}`} className="space-y-1">
                    <div className="flex justify-between items-baseline gap-2 text-white font-medium">
                      <span className="font-semibold text-[13px] text-gray-100">{role.title}</span>
                      <span className="text-gray-400 font-mono text-[11px] shrink-0">{role.period}</span>
                    </div>
                    <p className="text-[#b5bac1] text-[12px] leading-relaxed">{role.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Message>

      <Message time="12:05 PM">
        <h2 className="text-[16px] font-bold text-white mb-2">About</h2>
        <div className="space-y-3 text-[14px] text-[#dbdee1] leading-relaxed">
          <p>I spend around 80% of any project on research and planning before writing code. I obsess over hyper-optimization, always evaluating whether an architecture or workflow is truly the most optimal choice for the problem.</p>
          <p>My daily stack for agentic engineering includes Claude Code, Codex, the using-superpowers skill framework, Matt Pocock&apos;s engineering skills, and Gemini&apos;s Deep Research.</p>
        </div>
      </Message>

      <DiscordBotFooter />
    </div>
  );
}

function Message({ children, time }: { children: React.ReactNode; time: string }) {
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
