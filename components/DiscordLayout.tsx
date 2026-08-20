"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "./ThemeContext";
import DiscordServerRail from "./discord/DiscordServerRail";
import DiscordChannelSidebar from "./discord/DiscordChannelSidebar";
import DiscordMemberSidebar from "./discord/DiscordMemberSidebar";
import DiscordHomeFeed from "./discord/DiscordHomeFeed";
import DiscordProjectsFeed from "./discord/DiscordProjectsFeed";
import DiscordBlogsFeed from "./discord/DiscordBlogsFeed";
import DiscordThreadFeed from "./discord/DiscordThreadFeed";
import DiscordUserSettingsModal from "./discord/DiscordUserSettingsModal";

interface ActiveThread {
  parent: string;
  slug: string;
  title?: string;
}

export default function DiscordLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const pathname = usePathname() || "/";
  const router = useRouter();

  // Channel & Thread State
  const [activeChannel, setActiveChannel] = useState<string>("home");
  const [activeThread, setActiveThread] = useState<ActiveThread | null>(null);
  const [isMemberListOpen, setIsMemberListOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");

  // Sync state with URL pathname on load or route changes
  useEffect(() => {
    if (!pathname) return;

    if (pathname.startsWith("/projects/")) {
      const slug = pathname.replace("/projects/", "").replace(/\/$/, "");
      setActiveChannel("projects");
      setActiveThread({ parent: "projects", slug });
    } else if (pathname.startsWith("/blogs/")) {
      const slug = pathname.replace("/blogs/", "").replace(/\/$/, "");
      setActiveChannel("blogs");
      setActiveThread({ parent: "blogs", slug });
    } else if (pathname.startsWith("/projects")) {
      setActiveChannel("projects");
      setActiveThread(null);
    } else if (pathname.startsWith("/blogs")) {
      setActiveChannel("blogs");
      setActiveThread(null);
    } else {
      setActiveChannel("home");
      setActiveThread(null);
    }
  }, [pathname]);

  // When theme is NOT discord, render standard site layout
  if (theme !== "discord") {
    return <>{children}</>;
  }

  const handleSelectChannel = (channel: string) => {
    setActiveChannel(channel);
    setActiveThread(null);
    if (channel === "home") router.push("/");
    else if (channel === "projects") router.push("/projects");
    else if (channel === "blogs") router.push("/blogs");
  };

  const handleOpenThread = (parent: string, slug: string, title?: string) => {
    setActiveChannel(parent);
    setActiveThread({ parent, slug, title });
    router.push(`/${parent}/${slug}`);
  };

  const handleCloseThread = () => {
    const parent = activeThread?.parent || activeChannel || "home";
    setActiveThread(null);
    if (parent === "projects") router.push("/projects");
    else if (parent === "blogs") router.push("/blogs");
    else router.push("/");
  };

  const activeHeaderTitle = activeThread ? activeThread.slug : activeChannel;
  const chatPlaceholder = activeThread
    ? `Message #${activeThread.slug}`
    : `Message #${activeChannel}`;

  return (
    <div
      id="discord-client-root"
      className="fixed inset-0 overflow-hidden bg-[#313338] text-white flex z-50 select-none font-sans text-sm antialiased"
    >
      {/* 1. Server Rail (72px) */}
      <DiscordServerRail
        activeChannel={activeChannel}
        onSelectChannel={handleSelectChannel}
      />

      {/* 2. Channel Sidebar (240px) */}
      <DiscordChannelSidebar
        activeChannel={activeChannel}
        activeThread={activeThread}
        onSelectChannel={handleSelectChannel}
        onCloseThread={handleCloseThread}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* 3. Main Center Surface (flex-1) */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#313338] relative overflow-hidden">
        {/* Top Header Bar (48px) */}
        <header className="h-12 border-b border-[#1f2023] px-4 flex items-center justify-between shrink-0 bg-[#313338] z-10 shadow-sm">
          {/* Left: Breadcrumbs / Title */}
          <div className="flex items-center gap-2 min-w-0">
            {activeThread ? (
              <div className="flex items-center gap-1.5 text-sm">
                <button
                  onClick={handleCloseThread}
                  className="text-gray-400 hover:text-white font-medium flex items-center gap-1 cursor-pointer"
                >
                  <span className="text-gray-400">#</span>
                  <span>{activeThread.parent}</span>
                </button>
                <span className="text-gray-500">/</span>
                <div className="flex items-center gap-1 text-white font-semibold">
                  <svg
                    className="w-4 h-4 text-gray-300 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span className="truncate">{activeThread.slug}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-gray-400 shrink-0"
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
                <span className="font-bold text-white text-[15px]">
                  {activeChannel}
                </span>
                <span className="text-xs text-[#949ba4] border-l border-gray-600 pl-2 hidden sm:inline truncate">
                  {activeChannel === "home" && "Computer Science @ UP Diliman · Software Engineer"}
                  {activeChannel === "projects" && "Software builds, client-side tools, and platforms"}
                  {activeChannel === "blogs" && "Technical notes and architecture writeups"}
                </span>
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 text-[#b5bac1]">
            <button
              className="p-1 hover:text-white transition-colors cursor-pointer hidden md:block"
              title="Threads"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </button>
            <button
              className="p-1 hover:text-white transition-colors cursor-pointer hidden md:block"
              title="Notification Settings"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
            </button>
            <button
              className="p-1 hover:text-white transition-colors cursor-pointer hidden md:block"
              title="Pinned Messages"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" x2="12" y1="17" y2="22" />
                <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
              </svg>
            </button>
            <button
              className={`p-1 transition-colors cursor-pointer ${
                isMemberListOpen ? "text-white" : "text-[#b5bac1] hover:text-white"
              }`}
              onClick={() => setIsMemberListOpen(!isMemberListOpen)}
              title="Member List"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </button>

            {/* Search Input Box */}
            <div className="relative hidden lg:block">
              <input
                type="text"
                placeholder="Search"
                aria-label="Search channel"
                className="bg-[#1e1f22] text-xs text-gray-200 placeholder-gray-400 px-2 py-1 pr-6 rounded focus:outline-none focus:ring-1 focus:ring-[#5865F2] w-36 transition-all"
              />
              <svg
                className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
          </div>
        </header>

        {/* Scrollable Message Feed Surface */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 custom-scroll select-text">
          {activeThread ? (
            <DiscordThreadFeed
              thread={activeThread}
              onClose={handleCloseThread}
            />
          ) : activeChannel === "home" ? (
            <DiscordHomeFeed
              onOpenThread={handleOpenThread}
              onSwitchChannel={handleSelectChannel}
            />
          ) : activeChannel === "projects" ? (
            <DiscordProjectsFeed onOpenThread={handleOpenThread} />
          ) : activeChannel === "blogs" ? (
            <DiscordBlogsFeed onOpenThread={handleOpenThread} />
          ) : (
            <DiscordHomeFeed
              onOpenThread={handleOpenThread}
              onSwitchChannel={handleSelectChannel}
            />
          )}
        </div>

        {/* Bottom Chat Input Bar (68px) */}
        <div className="px-4 pb-4 pt-1 shrink-0 bg-[#313338]">
          <div className="bg-[#383a40] rounded-lg px-4 py-2.5 flex items-center gap-3 shadow-inner">
            {/* Attachment Button */}
            <button
              className="w-6 h-6 rounded-full bg-[#4e5058] hover:bg-[#6d6f78] text-white flex items-center justify-center text-sm font-bold transition-colors cursor-pointer shrink-0"
              title="Add attachment"
            >
              +
            </button>

            {/* Input Element */}
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder={chatPlaceholder}
              aria-label="Send message"
              className="bg-transparent flex-1 text-sm text-gray-200 placeholder-[#949ba4] focus:outline-none min-w-0"
            />

            {/* Nitro, GIF, Stickers, Emoji Pickers */}
            <div className="flex items-center gap-2 text-[#b5bac1] shrink-0">
              <button
                className="p-1 hover:text-white transition-colors cursor-pointer hidden sm:block"
                title="Upgrade Nitro"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>
              <button
                className="p-1 hover:text-white transition-colors cursor-pointer text-xs font-bold bg-[#4e5058]/50 px-1.5 py-0.5 rounded hidden sm:block"
                title="GIF"
              >
                GIF
              </button>
              <button
                className="p-1 hover:text-white transition-colors cursor-pointer hidden sm:block"
                title="Stickers"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </button>
              <button
                className="p-1 hover:text-white transition-colors cursor-pointer"
                title="Emoji Picker"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" x2="9.01" y1="9" y2="9" />
                  <line x1="15" x2="15.01" y1="9" y2="9" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 4. Member Sidebar (240px) */}
      <DiscordMemberSidebar
        isOpen={isMemberListOpen}
        onClose={() => setIsMemberListOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* 5. User Settings & Theme Switcher Modal */}
      <DiscordUserSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
