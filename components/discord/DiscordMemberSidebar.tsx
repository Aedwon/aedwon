"use client";

import React from "react";
import { AFFILIATION_GROUPS, AffiliationBadge } from "@/lib/data/affiliations";

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
  onClose,
  onOpenSettings,
}: DiscordMemberSidebarProps) {
  if (!isOpen) return null;

  const orgGroup = AFFILIATION_GROUPS.find(
    (g) => g.category.toLowerCase().includes("organization")
  );
  const partnerGroup = AFFILIATION_GROUPS.find(
    (g) => g.category.toLowerCase().includes("partner")
  );

  return (
    <aside
      id="member-sidebar"
      style={{ width: "240px", minWidth: "240px", maxWidth: "240px" }}
      className="h-screen bg-[#2b2d31] flex flex-col shrink-0 border-l border-[#1f2023]/60 overflow-y-auto px-3 py-3 space-y-4 custom-scroll z-20"
      aria-label="Member List"
    >
      {/* Role: OWNER */}
      <div>
        <div className="text-[11px] font-bold text-[#949ba4] uppercase tracking-wider mb-1 px-1">
          OWNER — 1
        </div>
        <div
          className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-[#35373c] cursor-pointer group"
          onClick={onOpenSettings}
        >
          <div className="relative shrink-0">
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
        </div>
      </div>

      {/* Role: ORGANIZATIONS & LGUS */}
      <div>
        <div className="text-[11px] font-bold text-[#949ba4] uppercase tracking-wider mb-1.5 px-1">
          ORGANIZATIONS &amp; LGUS — {orgGroup?.items.length || 13}
        </div>
        <div className="space-y-1 text-xs">
          {orgGroup?.items.map((badge, idx) => {
            const logoSrc = getDiscordLogoSrc(badge);
            return (
              <div
                key={idx}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-[#35373c] cursor-pointer group"
                title={badge.tooltip}
              >
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-full bg-[#1e1f22] p-1 flex items-center justify-center border border-white/5 overflow-hidden">
                    <img
                      src={logoSrc}
                      alt={badge.name}
                      className={`w-full h-full object-contain ${
                        badge.adaptive ? "logo-adaptive" : ""
                      }`}
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#23a55a] rounded-full border-2 border-[#2b2d31]" />
                </div>
                <div className="truncate text-gray-200 font-medium group-hover:text-white">
                  {badge.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Role: EVENT & BRAND PARTNERS */}
      <div>
        <div className="text-[11px] font-bold text-[#949ba4] uppercase tracking-wider mb-1.5 px-1">
          EVENT &amp; BRAND PARTNERS — {partnerGroup?.items.length || 10}
        </div>
        <div className="space-y-1 text-xs">
          {partnerGroup?.items.map((badge, idx) => {
            const logoSrc = getDiscordLogoSrc(badge);
            return (
              <div
                key={idx}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-[#35373c] cursor-pointer group"
                title={badge.tooltip}
              >
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-full bg-[#1e1f22] p-1 flex items-center justify-center border border-white/5 overflow-hidden">
                    <img
                      src={logoSrc}
                      alt={badge.name}
                      className={`w-full h-full object-contain ${
                        badge.adaptive ? "logo-adaptive" : ""
                      }`}
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#23a55a] rounded-full border-2 border-[#2b2d31]" />
                </div>
                <div className="truncate text-gray-200 font-medium group-hover:text-white">
                  {badge.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
