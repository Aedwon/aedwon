"use client";

import React from "react";

interface ActiveThread {
  parent: string;
  slug: string;
}

interface DiscordChannelSidebarProps {
  activeChannel: string;
  activeThread?: ActiveThread | null;
  onSelectChannel: (channel: string) => void;
  onCloseThread?: () => void;
  onOpenSettings: () => void;
}

export default function DiscordChannelSidebar({
  activeChannel,
  activeThread = null,
  onSelectChannel,
  onCloseThread,
  onOpenSettings,
}: DiscordChannelSidebarProps) {
  const isProjectsActive = activeChannel === "projects";
  const isBlogsActive = activeChannel === "blogs";
  const isHomeActive = activeChannel === "home";

  return (
    <aside
      style={{ width: "240px", minWidth: "240px", maxWidth: "240px" }}
      className="h-screen bg-[#2b2d31] flex flex-col shrink-0 border-r border-[#1f2023]/60 z-30"
      aria-label="Channels"
    >
      {/* Server Header */}
      <div
        className="h-12 border-b border-[#1f2023] px-4 flex items-center justify-between font-bold text-white shadow-sm cursor-pointer hover:bg-[#35373c]/50 transition-colors"
        onClick={onOpenSettings}
      >
        <span className="truncate">Aerol (Aedwon)</span>
        <svg
          className="w-4 h-4 text-gray-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>

      {/* Channels Navigation */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 custom-scroll">
        <div>
          <div className="flex items-center gap-1 px-1.5 mb-1 text-[11px] font-bold text-[#949ba4] uppercase tracking-wider cursor-pointer hover:text-gray-200">
            <svg
              className="w-3 h-3 text-[#949ba4]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
            <span>CHANNELS</span>
          </div>

          <div className="space-y-0.5">
            {/* #home */}
            <div>
              <button
                id="nav-home"
                onClick={() => onSelectChannel("home")}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer text-left ${
                  isHomeActive && !activeThread
                    ? "bg-[#3f4248] text-white"
                    : "hover:bg-[#35373c] text-[#949ba4] hover:text-[#dbdee1]"
                }`}
              >
                <svg
                  className="w-4 h-4 text-gray-400 shrink-0"
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
                <span>home</span>
              </button>
            </div>

            {/* #projects */}
            <div>
              <button
                id="nav-projects"
                onClick={() => onSelectChannel("projects")}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer text-left ${
                  isProjectsActive && !activeThread
                    ? "bg-[#3f4248] text-white"
                    : "hover:bg-[#35373c] text-[#949ba4] hover:text-[#dbdee1]"
                }`}
              >
                <svg
                  className="w-4 h-4 text-gray-400 shrink-0"
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
                <span>projects</span>
              </button>

              {/* Single Thread item under #projects */}
              {activeThread && activeThread.parent === "projects" && (
                <div className="relative pl-6 pr-1 pt-1">
                  <div
                    style={{
                      position: "absolute",
                      left: "18px",
                      top: "-10px",
                      width: "14px",
                      height: "24px",
                      borderLeft: "2px solid #4e5058",
                      borderBottom: "2px solid #4e5058",
                      borderBottomLeftRadius: "6px",
                      pointerEvents: "none",
                    }}
                  />
                  <div className="w-full flex items-center justify-between px-2 py-1 rounded text-xs font-medium bg-[#3f4248] text-white">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <svg
                        className="w-3.5 h-3.5 text-gray-300 shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      <span className="truncate font-medium">
                        {activeThread.slug}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCloseThread?.();
                      }}
                      className="text-gray-400 hover:text-white p-0.5 text-[10px] cursor-pointer"
                      title="Close Thread"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* #blogs */}
            <div>
              <button
                id="nav-blogs"
                onClick={() => onSelectChannel("blogs")}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer text-left ${
                  isBlogsActive && !activeThread
                    ? "bg-[#3f4248] text-white"
                    : "hover:bg-[#35373c] text-[#949ba4] hover:text-[#dbdee1]"
                }`}
              >
                <svg
                  className="w-4 h-4 text-gray-400 shrink-0"
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
                <span>blogs</span>
              </button>

              {/* Single Thread item under #blogs */}
              {activeThread && activeThread.parent === "blogs" && (
                <div className="relative pl-6 pr-1 pt-1">
                  <div
                    style={{
                      position: "absolute",
                      left: "18px",
                      top: "-10px",
                      width: "14px",
                      height: "24px",
                      borderLeft: "2px solid #4e5058",
                      borderBottom: "2px solid #4e5058",
                      borderBottomLeftRadius: "6px",
                      pointerEvents: "none",
                    }}
                  />
                  <div className="w-full flex items-center justify-between px-2 py-1 rounded text-xs font-medium bg-[#3f4248] text-white">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <svg
                        className="w-3.5 h-3.5 text-gray-300 shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      <span className="truncate font-medium">
                        {activeThread.slug}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCloseThread?.();
                      }}
                      className="text-gray-400 hover:text-white p-0.5 text-[10px] cursor-pointer"
                      title="Close Thread"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom User Panel (52px) */}
      <footer className="h-[52px] bg-[#232428] px-2 flex items-center justify-between shrink-0 border-t border-[#1f2023]">
        <div
          className="flex items-center gap-2 p-1 rounded-md hover:bg-[#313338] cursor-pointer min-w-0 flex-1"
          onClick={onOpenSettings}
        >
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center text-white font-bold text-xs ring-2 ring-purple-400">
              A
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#23a55a] rounded-full border-2 border-[#232428]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-bold text-white truncate leading-tight">
              Aerol (Aedwon)
            </div>
            <div className="text-[11px] text-[#949ba4] truncate leading-tight">
              Online
            </div>
          </div>
        </div>

        <div className="flex items-center text-[#b5bac1]">
          <button
            className="p-1.5 hover:bg-[#313338] hover:text-white rounded transition-colors cursor-pointer"
            title="Mute"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          </button>
          <button
            className="p-1.5 hover:bg-[#313338] hover:text-white rounded transition-colors cursor-pointer"
            title="Deafen"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
            </svg>
          </button>
          <button
            className="p-1.5 hover:bg-[#313338] hover:text-white rounded transition-colors cursor-pointer"
            onClick={onOpenSettings}
            title="User Settings (Theme Switcher)"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      </footer>
    </aside>
  );
}
