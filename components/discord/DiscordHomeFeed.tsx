"use client";

import React from "react";
import DiscordEmbedCard from "./DiscordEmbedCard";
import DiscordButton from "./DiscordButton";

interface DiscordHomeFeedProps {
  onOpenThread?: (parent: string, slug: string, title?: string) => void;
  onSwitchChannel?: (channel: string) => void;
}

export default function DiscordHomeFeed({
  onOpenThread,
  onSwitchChannel,
}: DiscordHomeFeedProps) {
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
        <h1 className="text-2xl font-bold text-white mb-1">Welcome to #home!</h1>
        <p className="text-sm text-[#949ba4]">This is the start of the #home channel.</p>
      </div>

      {/* 1. Intro Section (1:1 copy from HeroSection) */}
      <div className="flex gap-4 group hover:bg-[#2e3035] -mx-4 px-4 py-2 rounded transition-colors">
        <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center text-white font-bold shrink-0 mt-0.5 text-sm ring-1 ring-white/20">
          A
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-[#f2f3f5] hover:underline cursor-pointer text-[14px]">
              Aerol (Aedwon)
            </span>
            <span className="text-[11px] text-[#949ba4] font-medium ml-1">Today at 12:00 PM</span>
          </div>

          <h1 className="text-[16px] font-bold text-white mb-1.5">
            I'm Aerol. You might also know me as Aedwon.
          </h1>
          <p className="text-[14px] text-[#dbdee1] leading-relaxed">
            I studied Computer Science at UP Diliman on a DOST Merit Scholarship, following high school at Philippine Science High School. I like building things :)
          </p>

          <div className="flex items-center gap-1.5 mt-3 text-xs">
            <button className="bg-[#2b2d31] hover:bg-[#35373c] border border-[#3f4147] px-2 py-0.5 rounded flex items-center gap-1.5 text-gray-200 transition-colors cursor-pointer">
              <span>🔥</span> <span className="font-semibold text-[11px]">18</span>
            </button>
            <button className="bg-[#2b2d31] hover:bg-[#35373c] border border-[#3f4147] px-2 py-0.5 rounded flex items-center gap-1.5 text-gray-200 transition-colors cursor-pointer">
              <span>👀</span> <span className="font-semibold text-[11px]">12</span>
            </button>
            <button className="bg-[#2b2d31] hover:bg-[#35373c] border border-[#3f4147] px-2 py-0.5 rounded flex items-center gap-1.5 text-gray-200 transition-colors cursor-pointer">
              <span>🚀</span> <span className="font-semibold text-[11px]">9</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Featured Projects (1:1 copy from FeaturedProjects) */}
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

          <h2 className="text-[16px] font-bold text-white mb-3">Featured projects</h2>

          <div className="space-y-3">
            <DiscordEmbedCard
              title="Pantas"
              borderColor="#10B981"
              summary="Mobile exam reviewer for Philippine civil service and university entrance tests, with adaptive spaced repetition and OMR answer sheets."
              stack="Flutter · Dart · Drift · SQLCipher · Riverpod · FSRS · Sanity · RevenueCat"
              onLinkClick={() => onOpenThread?.("projects", "pantas", "Pantas")}
            />

            <DiscordEmbedCard
              title="The MSL Network"
              borderColor="#5865F2"
              summary="Planned and built the Philippine student gaming community to 10,000+ members, using custom Discord bots for student verification and event quests."
              stack="Python · Discord.py · MySQL · Google Sheets API"
              onLinkClick={() => onOpenThread?.("projects", "msl-network", "The MSL Network")}
            />

            <DiscordEmbedCard
              title="QR Studio"
              borderColor="#F59E0B"
              summary="In-browser QR code builder with gradient styling and SVG export that runs entirely client-side without backend requests."
              stack="TypeScript · HTML5 Canvas · Vite · Tailwind CSS"
              onLinkClick={() => onOpenThread?.("projects", "qr-studio", "QR Studio")}
            />

            <DiscordEmbedCard
              title="Kiosk Survey"
              borderColor="#10B981"
              summary="Touchscreen survey app for Android TV that operated for 8 continuous hours during a live event without internet, syncing queued submissions once reconnected."
              stack="Flutter · Dart · Android TV · SQLite"
              onLinkClick={() => onOpenThread?.("projects", "kiosk-survey", "Kiosk Survey")}
            />

            {/* Discord Action Row Link Button: See all projects */}
            <div className="pt-2">
              <DiscordButton onClick={() => onSwitchChannel?.("projects")}>
                See all projects
              </DiscordButton>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Open Source (1:1 copy from OpenSourceSection) */}
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

          <h2 className="text-[16px] font-bold text-white mb-2">Open source</h2>

          <DiscordEmbedCard
            title="BetterGov PH"
            borderColor="#06B6D4"
            summary="Contributor to civic tech initiatives modernizing Philippine government web services and open public data."
            stack="TypeScript · Next.js · Tailwind CSS"
            linkText="bettergov.ph ↗"
            linkHref="https://bettergov.ph"
            isExternal={true}
          />
        </div>
      </div>

      {/* 4. Experience (1:1 copy from ExperienceDossier) */}
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

          <h2 className="text-[16px] font-bold text-white mb-2">Experience</h2>

          <div className="space-y-2 max-w-2xl">
            {/* Org 1 */}
            <div className="bg-[#2b2d31] rounded-[4px] border-l-4 border-[#10B981] p-3.5 shadow-sm">
              <div className="flex justify-between items-baseline mb-1">
                <h4 className="text-white font-bold text-sm">
                  Philippine Society of Youth Science Clubs
                </h4>
              </div>
              <div className="space-y-2 text-xs text-[#b5bac1]">
                <div>
                  <div className="flex justify-between text-white font-medium">
                    <span>Marketing Associate</span>
                    <span className="text-gray-400 font-mono text-[11px]">Feb 2024 to Present</span>
                  </div>
                  <p className="text-[#b5bac1]">
                    Secured corporate sponsorships generating over ₱800,000 in funding for a national science competition.
                  </p>
                </div>
                <div>
                  <div className="flex justify-between text-white font-medium">
                    <span>Regional Head, Region I/II/NCR</span>
                    <span className="text-gray-400 font-mono text-[11px]">May 2024 to Sep 2024</span>
                  </div>
                  <p className="text-[#b5bac1]">
                    Directed regional elimination rounds and MathSciAKa workshops, coordinating 30+ volunteers.
                  </p>
                </div>
              </div>
            </div>

            {/* Org 2 */}
            <div className="bg-[#2b2d31] rounded-[4px] border-l-4 border-[#5865F2] p-3.5 shadow-sm">
              <div className="flex justify-between items-baseline mb-1">
                <h4 className="text-white font-bold text-sm">
                  Moonton Student Leaders Philippines
                </h4>
              </div>
              <div className="space-y-2 text-xs text-[#b5bac1]">
                <div>
                  <div className="flex justify-between text-white font-medium">
                    <span>
                      Tournament Director &amp; Head of League Operations, MSL Collegiate Cup
                    </span>
                    <span className="text-gray-400 font-mono text-[11px]">Nov 2023 to Jul 2025</span>
                  </div>
                  <p className="text-[#b5bac1]">
                    Directed tournament operations for 3,000+ collegiate competitors across 180+ universities, writing a custom Discord bot that automated match check-ins and cut admin overhead by 90%.
                  </p>
                </div>
              </div>
            </div>

            {/* Org 3 */}
            <div className="bg-[#2b2d31] rounded-[4px] border-l-4 border-[#8B5CF6] p-3.5 shadow-sm">
              <div className="flex justify-between items-baseline mb-1">
                <h4 className="text-white font-bold text-sm">Dark League Studios</h4>
              </div>
              <div className="space-y-2 text-xs text-[#b5bac1]">
                <div>
                  <div className="flex justify-between text-white font-medium">
                    <span>Project Manager</span>
                    <span className="text-gray-400 font-mono text-[11px]">Oct 2024 to Jun 2025</span>
                  </div>
                  <p className="text-[#b5bac1]">
                    Directed tournament operations for Estudyante Esports: The National Championships (₱1.5M+ funding across 4 game titles), managing publisher relations, venue vendors, and sponsor commitments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. About (1:1 copy from AboutSection) */}
      <div className="flex gap-4 group hover:bg-[#2e3035] -mx-4 px-4 py-2 rounded transition-colors">
        <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center text-white font-bold shrink-0 mt-0.5 text-sm ring-1 ring-white/20">
          A
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-[#f2f3f5] hover:underline cursor-pointer text-[14px]">
              Aerol (Aedwon)
            </span>
            <span className="text-[11px] text-[#949ba4]">Today at 12:05 PM</span>
          </div>

          <h2 className="text-[16px] font-bold text-white mb-2">About</h2>
          <div className="space-y-3 text-[14px] text-[#dbdee1] leading-relaxed">
            <p>
              I spend around 80% of any project on research and planning before writing code. I obsess over hyper-optimization, always evaluating whether an architecture or workflow is truly the most optimal choice for the problem.
            </p>
            <p>
              My daily stack for agentic engineering includes Claude Code, Codex, the using-superpowers skill framework, Matt Pocock's engineering skills, and Gemini's Deep Research.
            </p>
          </div>
        </div>
      </div>

      {/* 6. Footer System Message */}
      <div className="flex gap-4 group hover:bg-[#2e3035] -mx-4 px-4 py-2 rounded transition-colors">
        <div className="w-10 h-10 rounded-full bg-[#202225] flex items-center justify-center text-gray-400 font-mono text-xs font-bold shrink-0 mt-0.5 border border-white/5">
          &lt;/&gt;
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-300 text-[13px]">Portfolio</span>
            <span className="bg-[#5865F2] text-white text-[9px] font-bold px-1 rounded uppercase">
              BOT
            </span>
            <span className="text-[11px] text-[#949ba4]">Today at 12:06 PM</span>
          </div>
          <p className="text-xs text-[#949ba4] font-mono">
            © 2026 Aerol (Aedwon) · Built with Next.js &amp; React
          </p>
        </div>
      </div>
    </div>
  );
}
