"use client";

import React from "react";

interface DiscordServerRailProps {
  onSelectChannel?: (channel: string) => void;
}

export default function DiscordServerRail({ onSelectChannel }: DiscordServerRailProps) {
  return (
    <nav
      style={{ width: "72px", minWidth: "72px", maxWidth: "72px" }}
      className="hidden sm:flex h-screen bg-[#1e1f22] flex-col items-center py-3 gap-2 shrink-0 z-40 border-r border-[#111214]/40"
      aria-label="Servers and profiles"
    >
      <button
        type="button"
        className="relative group cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C95FF] rounded-[24px]"
        onClick={() => onSelectChannel?.("home")}
        aria-label="Open home channel"
      >
        <span className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-[#313338] hover:bg-[#5865F2] flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200">
          <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.078.078 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
        </span>
      </button>

      <div className="w-8 h-[2px] bg-[#35363c] rounded-full my-0.5" aria-hidden="true" />

      <button
        type="button"
        className="relative group cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C95FF] rounded-[16px]"
        onClick={() => onSelectChannel?.("home")}
        title="aedwon.dev"
        aria-label="Open Aedwon home channel"
      >
        <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-2 h-10 bg-white rounded-r-full" aria-hidden="true" />
        <span className="w-12 h-12 rounded-[16px] bg-[#5865F2] flex items-center justify-center text-white font-bold text-lg shadow-lg transition-all duration-200">
          A
        </span>
      </button>

      <div className="w-8 h-[2px] bg-[#35363c] rounded-full my-0.5" aria-hidden="true" />

      <a
        href="mailto:aerol.balayon@gmail.com"
        className="relative group cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C95FF] rounded-[24px]"
        title="Email: aerol.balayon@gmail.com"
        aria-label="Email Aerol Balayon"
      >
        <div className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-[#2b2d31] hover:bg-[#ea4335] text-gray-300 hover:text-white flex items-center justify-center transition-all duration-200">
          <svg
            className="w-5 h-5 fill-none stroke-current stroke-2"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </div>
      </a>

      <a
        href="https://github.com/Aedwon"
        target="_blank"
        rel="noopener noreferrer"
        className="relative group cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C95FF] rounded-[24px]"
        title="GitHub: /Aedwon"
        aria-label="Open Aedwon on GitHub"
      >
        <div className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-[#2b2d31] hover:bg-[#24292e] text-gray-300 hover:text-white flex items-center justify-center transition-all duration-200">
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
        </div>
      </a>

      <a
        href="https://linkedin.com/in/aedwon"
        target="_blank"
        rel="noopener noreferrer"
        className="relative group cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C95FF] rounded-[24px]"
        title="LinkedIn: /in/aedwon"
        aria-label="Open Aedwon on LinkedIn"
      >
        <div className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-[#2b2d31] hover:bg-[#0077B5] text-gray-300 hover:text-white flex items-center justify-center font-bold text-xs transition-all duration-200">
          in
        </div>
      </a>

      <div className="w-8 h-[2px] bg-[#35363c] rounded-full my-0.5" aria-hidden="true" />

      <div
        className="w-12 h-12 rounded-[24px] bg-[#2b2d31] text-[#23a55a] flex items-center justify-center text-2xl font-light cursor-default transition-all duration-200"
        aria-hidden="true"
      >
        +
      </div>
    </nav>
  );
}
