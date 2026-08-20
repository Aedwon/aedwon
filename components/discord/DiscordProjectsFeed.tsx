"use client";

import React from "react";
import DiscordEmbedCard from "./DiscordEmbedCard";

interface DiscordProjectsFeedProps {
  onOpenThread?: (parent: string, slug: string, title?: string) => void;
}

export default function DiscordProjectsFeed({
  onOpenThread,
}: DiscordProjectsFeedProps) {
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
        <h1 className="text-2xl font-bold text-white mb-1">Welcome to #projects!</h1>
        <p className="text-sm text-[#949ba4]">
          Software builds, client-side tools, and platforms.
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

          <h2 className="text-[16px] font-bold text-white mb-4">
            Projects Catalog (12)
          </h2>

          <div className="space-y-4 max-w-2xl">
            {/* GROUP 1: Mobile & Offline (#10B981) */}
            <div className="space-y-3">
              <DiscordEmbedCard
                title="Pantas"
                borderColor="#10B981"
                summary="Mobile exam reviewer for Philippine civil service and university entrance tests, with adaptive spaced repetition and OMR answer sheets."
                stack="Flutter · Dart · Drift · SQLCipher · Riverpod · FSRS · Sanity · RevenueCat"
                onLinkClick={() => onOpenThread?.("projects", "pantas", "Pantas")}
              />

              <DiscordEmbedCard
                title="Kiosk Survey"
                borderColor="#10B981"
                summary="Touchscreen survey app for Android TV that operated for 8 continuous hours during a live event without internet, syncing queued submissions once reconnected."
                stack="Flutter · Dart · Android TV · SQLite"
                onLinkClick={() => onOpenThread?.("projects", "kiosk-survey", "Kiosk Survey")}
              />
            </div>

            {/* GROUP 2: Civic Tech (#06B6D4) */}
            <div className="space-y-3">
              <DiscordEmbedCard
                title="Norala SB Legislative Transparency Portal"
                borderColor="#06B6D4"
                summary="Full-text search engine for municipal ordinances and resolutions with full-text indexing, filtering by sponsor and committee, and automated PDF ingestion."
                stack="Next.js · TypeScript · Tailwind CSS · PostgreSQL · Meilisearch"
                onLinkClick={() => onOpenThread?.("projects", "sb-norala", "Norala SB Legislative Transparency Portal")}
              />

              <DiscordEmbedCard
                title="BetterGov PH"
                borderColor="#06B6D4"
                summary="Open source civic tech initiative building modern, accessible digital services for Philippine citizens."
                stack="Next.js · TypeScript · Tailwind CSS · Civic Tech"
                onLinkClick={() => onOpenThread?.("projects", "bettergov", "BetterGov PH")}
              />
            </div>

            {/* GROUP 3: Bots & Systems (#5865F2) */}
            <div className="space-y-3">
              <DiscordEmbedCard
                title="The MSL Network"
                borderColor="#5865F2"
                summary="Planned and built the Philippine student gaming community to 10,000+ members, using custom Discord bots for student verification and event quests."
                stack="Python · Discord.py · MySQL · Google Sheets API"
                onLinkClick={() => onOpenThread?.("projects", "msl-network", "The MSL Network")}
              />

              <DiscordEmbedCard
                title="MSL Collegiate Cup Tournament Bot"
                borderColor="#5865F2"
                summary="Tournament operations engine that automated match scheduling, bracket tracking, and score reporting across 180+ universities."
                stack="Python · Discord.py · Google Sheets API · SQLite"
                onLinkClick={() => onOpenThread?.("projects", "msl-bot", "MSL Collegiate Cup Tournament Bot")}
              />

              <DiscordEmbedCard
                title="PSO Automated Scorer & Ranking Engine"
                borderColor="#5865F2"
                summary="Real-time scoring and ranking system for the Philippine Science Olympiad national finals, reducing result tabulations from hours to seconds."
                stack="Python · Flask · WebSockets · Google Sheets API"
                onLinkClick={() => onOpenThread?.("projects", "psysc-scorer", "PSO Automated Scorer & Ranking Engine")}
              />

              <DiscordEmbedCard
                title="Ilocos Sur Festival Esports Bot"
                borderColor="#5865F2"
                summary="Custom Discord operations bot for provincial tournament management, handle check-ins, match pairing, and broadcast coordination."
                stack="Python · Discord.py · SQLite"
                onLinkClick={() => onOpenThread?.("projects", "ilocos-sur-bot", "Ilocos Sur Festival Esports Bot")}
              />

              <DiscordEmbedCard
                title="OPPO Smooth / Hyper Legend Cup Bot"
                borderColor="#5865F2"
                summary="Automated match coordination and verify roster eligibility for brand-sponsored national mobile gaming tournament."
                stack="Python · Discord.py · Google Sheets API"
                onLinkClick={() => onOpenThread?.("projects", "oppo-bot", "OPPO Smooth / Hyper Legend Cup Bot")}
              />
            </div>

            {/* GROUP 4: Web & Tools (#F59E0B) */}
            <div className="space-y-3">
              <DiscordEmbedCard
                title="QR Studio"
                borderColor="#F59E0B"
                summary="In-browser QR code builder with gradient styling and SVG export that runs entirely client-side without backend requests."
                stack="TypeScript · HTML5 Canvas · Vite · Tailwind CSS"
                onLinkClick={() => onOpenThread?.("projects", "qr-studio", "QR Studio")}
              />

              <DiscordEmbedCard
                title="KQM-Standard Genshin Team DPS Calculator"
                borderColor="#F59E0B"
                summary="Damage calculation engine implementing KeqingMains combat theory standards for team rotation simulation and DPS optimization."
                stack="Python · NumPy · SciPy"
                onLinkClick={() => onOpenThread?.("projects", "gi-calculator", "KQM-Standard Genshin Team DPS Calculator")}
              />

              <DiscordEmbedCard
                title="AI Agent Instruction & Skills Framework"
                borderColor="#F59E0B"
                summary="Curated repository of prompt engineering skills, agent instructions, and context protocols for high-precision coding assistants."
                stack="Markdown · Prompt Engineering · AI Workflows"
                onLinkClick={() => onOpenThread?.("projects", "agent-framework", "AI Agent Instruction & Skills Framework")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
