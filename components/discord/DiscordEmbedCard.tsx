"use client";

import React from "react";

interface DiscordEmbedCardProps {
  title: string;
  summary: string;
  stack?: string;
  borderColor?: string;
  linkText?: string;
  linkHref?: string;
  onLinkClick?: () => void;
  isExternal?: boolean;
}

export default function DiscordEmbedCard({
  title,
  summary,
  stack,
  borderColor = "#5865F2",
  linkText = "View case study →",
  linkHref,
  onLinkClick,
  isExternal = false,
}: DiscordEmbedCardProps) {
  return (
    <div
      style={{ borderLeftColor: borderColor }}
      className="bg-[#2b2d31] rounded-[4px] border-l-4 p-4 shadow-sm max-w-2xl"
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-white font-bold text-base">{title}</h3>
        {linkHref && isExternal ? (
          <a
            href={linkHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#5865F2] hover:underline font-mono"
          >
            {linkText}
          </a>
        ) : onLinkClick ? (
          <button
            onClick={onLinkClick}
            className="text-xs text-[#5865F2] hover:underline font-mono cursor-pointer"
          >
            {linkText}
          </button>
        ) : null}
      </div>

      <p className="text-xs text-[#b5bac1] leading-relaxed mb-3">{summary}</p>

      {stack && (
        <div className="pt-2 border-t border-[#3f4147]/60 text-xs">
          <div className="font-bold text-[#949ba4] uppercase text-[10px] mb-1">
            Stack
          </div>
          <div className="text-gray-200 font-mono text-[11px]">{stack}</div>
        </div>
      )}
    </div>
  );
}
