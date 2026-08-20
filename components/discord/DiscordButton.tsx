"use client";

import React from "react";

interface DiscordButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function DiscordButton({
  children,
  onClick,
  className = "",
}: DiscordButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`bg-[#4e5058] hover:bg-[#6d6f78] active:bg-[#4752c4] text-white font-medium text-sm leading-4 px-4 py-2 rounded flex items-center justify-center gap-2 transition-colors cursor-pointer border-none ${className}`}
    >
      <span>{children}</span>
      <svg
        className="w-4 h-4 text-gray-300"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" x2="21" y1="14" y2="3" />
      </svg>
    </button>
  );
}
