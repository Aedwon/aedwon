"use client";

import React from "react";
import { AFFILIATION_GROUPS, type AffiliationBadge } from "@/lib/data/affiliations";

interface DiscordMemberSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpenSettings?: () => void;
}

function getDiscordLogoSrc(badge: AffiliationBadge): string {
  if (badge.name === "MOONTON") return "/logos/moonton-dark.svg";
  if (badge.name === "Dark League Studios") return "/logos/dls-dark.svg";
  if (badge.name === "Estudyante Esports") return "/logos/estudyante-esports-dark.svg";
  return badge.logo;
}

export default function DiscordMemberSidebar({
  isOpen = true,
  onOpenSettings,
}: DiscordMemberSidebarProps) {
  if (!isOpen) return null;

  const orgGroup = AFFILIATION_GROUPS.find((group) =>
    group.category.toLowerCase().includes("organization"),
  );
  const partnerGroup = AFFILIATION_GROUPS.find((group) =>
    group.category.toLowerCase().includes("partner"),
  );

  return (
    <aside
      id="member-sidebar"
      style={{ width: "240px", minWidth: "240px", maxWidth: "240px" }}
      className="h-screen bg-[#2b2d31] flex flex-col shrink-0 border-l border-[#1f2023]/60 overflow-y-auto px-3 py-3 space-y-4 custom-scroll z-20"
      aria-label="Member List"
    >
      <div>
        <div className="text-[11px] font-bold text-[#949ba4] uppercase tracking-wider mb-1 px-1">
          OWNER — 1
        </div>
        <button
          type="button"
          className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-[#35373c] cursor-pointer group text-left focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#5865F2]"
          onClick={onOpenSettings}
          aria-label="Open Aerol user settings"
        >
          <div className="relative shrink-0" aria-hidden="true">
            <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center text-white font-bold text-xs ring-2 ring-[#5865F2]">
              A
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#23a55a] rounded-full border-2 border-[#2b2d31]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-bold text-white truncate group-hover:text-[#5865F2] transition-colors">
              Aerol (Aedwon)
            </div>
            <div className="text-[11px] text-[#949ba4] truncate">Online</div>
          </div>
        </button>
      </div>

      <div>
        <div className="text-[11px] font-bold text-[#949ba4] uppercase tracking-wider mb-1.5 px-1">
          ORGANIZATIONS &amp; LGUS — {orgGroup?.items.length ?? 0}
        </div>
        <div className="space-y-1 text-xs">
          {orgGroup?.items.map((badge) => (
            <MemberBadge key={badge.name} badge={badge} />
          ))}
        </div>
      </div>

      <div>
        <div className="text-[11px] font-bold text-[#949ba4] uppercase tracking-wider mb-1.5 px-1">
          EVENT &amp; BRAND PARTNERS — {partnerGroup?.items.length ?? 0}
        </div>
        <div className="space-y-1 text-xs">
          {partnerGroup?.items.map((badge) => (
            <MemberBadge key={badge.name} badge={badge} />
          ))}
        </div>
      </div>
    </aside>
  );
}

function MemberBadge({ badge }: { badge: AffiliationBadge }) {
  return (
    <div
      className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-[#35373c] group"
      title={badge.tooltip}
    >
      <div className="relative shrink-0">
        <div className="w-8 h-8 rounded-full bg-[#1e1f22] p-1 flex items-center justify-center border border-white/5 overflow-hidden">
          <img
            src={getDiscordLogoSrc(badge)}
            alt={badge.name}
            className={`w-full h-full object-contain ${badge.adaptive ? "logo-adaptive" : ""}`}
            loading="lazy"
            decoding="async"
          />
        </div>
        <div
          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#23a55a] rounded-full border-2 border-[#2b2d31]"
          aria-hidden="true"
        />
      </div>
      <div className="truncate text-gray-200 font-medium group-hover:text-white">
        {badge.name}
      </div>
    </div>
  );
}
