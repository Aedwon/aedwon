"use client";

import React, { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "./ThemeContext";
import {
  getDiscordChannelPath,
  getDiscordRouteState,
  getDiscordThreadPath,
  type DiscordChannel,
} from "@/lib/discord-routing";
import DiscordServerRail from "./discord/DiscordServerRail";
import DiscordChannelSidebar from "./discord/DiscordChannelSidebar";
import DiscordMemberSidebar from "./discord/DiscordMemberSidebar";
import DiscordHomeFeed from "./discord/DiscordHomeFeed";
import DiscordProjectsFeed from "./discord/DiscordProjectsFeed";
import DiscordBlogsFeed from "./discord/DiscordBlogsFeed";
import DiscordThreadFeed from "./discord/DiscordThreadFeed";
import DiscordUserSettingsModal from "./discord/DiscordUserSettingsModal";

const MOBILE_CHANNELS: DiscordChannel[] = ["home", "projects", "blogs"];

export default function DiscordLayout({ children }: { children: React.ReactNode }) {
  const { isDiscord } = useTheme();
  const pathname = usePathname() || "/";
  const router = useRouter();
  const [isMemberListOpen, setIsMemberListOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { activeChannel, activeThread } = useMemo(
    () => getDiscordRouteState(pathname),
    [pathname],
  );

  const handleSelectChannel = useCallback(
    (channel: string) => {
      if (channel !== "home" && channel !== "projects" && channel !== "blogs") return;
      router.push(getDiscordChannelPath(channel as DiscordChannel));
    },
    [router],
  );

  const handleOpenThread = useCallback(
    (parent: string, slug: string) => {
      if (parent !== "projects" && parent !== "blogs") return;
      router.push(getDiscordThreadPath({ parent, slug }));
    },
    [router],
  );

  const handleCloseThread = useCallback(() => {
    router.push(getDiscordChannelPath(activeThread?.parent ?? activeChannel));
  }, [activeChannel, activeThread, router]);

  const handleOpenSettings = useCallback(() => setIsSettingsOpen(true), []);
  const handleCloseSettings = useCallback(() => setIsSettingsOpen(false), []);

  if (!isDiscord) return <>{children}</>;

  const chatPlaceholder = activeThread
    ? `Message #${activeThread.slug}`
    : `Message #${activeChannel}`;
  const routeAnnouncement = activeThread
    ? `Viewing ${activeThread.slug} in ${activeThread.parent}`
    : `Viewing ${activeChannel} channel`;

  return (
    <div
      id="discord-client-root"
      className="fixed inset-0 overflow-hidden bg-[#313338] text-white flex z-50 select-none font-sans text-sm antialiased"
    >
      <DiscordServerRail onSelectChannel={handleSelectChannel} />

      <DiscordChannelSidebar
        activeChannel={activeChannel}
        activeThread={activeThread}
        onSelectChannel={handleSelectChannel}
        onCloseThread={handleCloseThread}
        onOpenSettings={handleOpenSettings}
      />

      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 flex flex-col min-w-0 bg-[#313338] relative overflow-hidden"
      >
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {routeAnnouncement}
        </p>

        <header className="h-12 border-b border-[#1f2023] px-3 sm:px-4 flex items-center justify-between shrink-0 bg-[#313338] z-10 shadow-sm">
          <div className="flex items-center gap-2 min-w-0">
            {activeThread ? (
              <div className="flex items-center gap-1.5 text-sm min-w-0">
                <button
                  type="button"
                  onClick={handleCloseThread}
                  className="text-[#B5BAC1] hover:text-white font-medium flex items-center gap-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C95FF]"
                  aria-label={`Back to ${activeThread.parent}`}
                >
                  <span aria-hidden="true">#</span>
                  <span>{activeThread.parent}</span>
                </button>
                <span className="text-[#B5BAC1]" aria-hidden="true">/</span>
                <div className="flex items-center gap-1 text-white font-semibold min-w-0">
                  <ThreadIcon />
                  <span className="truncate">{activeThread.slug}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                <ChannelIcon />
                <span className="font-bold text-white text-[15px]">{activeChannel}</span>
                <span className="text-xs text-[#B5BAC1] border-l border-gray-600 pl-2 hidden sm:inline truncate">
                  {activeChannel === "home" && "Computer Science @ UP Diliman · Software Engineer"}
                  {activeChannel === "projects" && "Software builds, client-side tools, and platforms"}
                  {activeChannel === "blogs" && "Technical notes and architecture writeups"}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-[#b5bac1]">
            <div className="hidden md:flex items-center gap-3" aria-hidden="true">
              <ThreadIcon />
              <BellIcon />
              <PinIcon />
            </div>
            <button
              type="button"
              className="sm:hidden p-1.5 rounded text-[#B5BAC1] hover:text-white hover:bg-[#35373c] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C95FF]"
              onClick={handleOpenSettings}
              aria-label="Open theme settings"
            >
              <SettingsIcon />
            </button>
            <button
              type="button"
              className={`hidden lg:inline-flex p-1 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8C95FF] ${
                isMemberListOpen ? "text-white" : "text-[#b5bac1] hover:text-white"
              }`}
              onClick={() => setIsMemberListOpen((open) => !open)}
              aria-expanded={isMemberListOpen}
              aria-controls="member-sidebar"
              aria-label="Toggle member list"
            >
              <MembersIcon />
            </button>
            <div
              className="hidden lg:flex w-36 items-center justify-between rounded bg-[#1e1f22] px-2 py-1 text-xs text-[#B5BAC1]"
              aria-hidden="true"
            >
              <span>Search</span>
              <SearchIcon />
            </div>
          </div>
        </header>

        <nav
          aria-label="Discord channels"
          className="sm:hidden grid grid-cols-3 gap-1 border-b border-[#1f2023] bg-[#2b2d31] p-1.5 shrink-0"
        >
          {MOBILE_CHANNELS.map((channel) => {
            const current = activeChannel === channel && !activeThread;
            return (
              <button
                key={channel}
                type="button"
                onClick={() => handleSelectChannel(channel)}
                aria-current={current ? "page" : undefined}
                className={`min-h-9 rounded px-2 text-xs font-semibold capitalize cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#8C95FF] ${
                  current
                    ? "bg-[#3f4248] text-white"
                    : "text-[#B5BAC1] hover:bg-[#35373c] hover:text-white"
                }`}
              >
                {channel}
              </button>
            );
          })}
        </nav>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 custom-scroll select-text">
          {activeThread ? (
            <DiscordThreadFeed thread={activeThread} onClose={handleCloseThread} />
          ) : activeChannel === "home" ? (
            <DiscordHomeFeed
              onOpenThread={handleOpenThread}
              onSwitchChannel={handleSelectChannel}
            />
          ) : activeChannel === "projects" ? (
            <DiscordProjectsFeed onOpenThread={handleOpenThread} />
          ) : (
            <DiscordBlogsFeed onOpenThread={handleOpenThread} />
          )}
        </div>

        <div className="px-4 pb-4 pt-1 shrink-0 bg-[#313338]" aria-hidden="true">
          <div className="bg-[#383a40] rounded-lg px-4 py-2.5 flex items-center gap-3 shadow-inner text-[#B5BAC1]">
            <span className="w-6 h-6 rounded-full bg-[#4e5058] text-white flex items-center justify-center text-sm font-bold shrink-0">+</span>
            <span className="flex-1 text-sm truncate">{chatPlaceholder}</span>
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold">
              <span>GIF</span>
              <span>☺</span>
            </div>
          </div>
        </div>
      </main>

      <DiscordMemberSidebar
        isOpen={isMemberListOpen}
        onClose={() => setIsMemberListOpen(false)}
        onOpenSettings={handleOpenSettings}
      />

      <DiscordUserSettingsModal
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
      />
    </div>
  );
}

function ChannelIcon() {
  return (
    <svg className="w-5 h-5 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="4" x2="20" y1="9" y2="9" />
      <line x1="4" x2="20" y1="15" y2="15" />
      <line x1="10" x2="8" y1="3" y2="21" />
      <line x1="16" x2="14" y1="3" y2="21" />
    </svg>
  );
}

function ThreadIcon() {
  return (
    <svg className="w-5 h-5 text-gray-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="17" y2="22" />
      <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
    </svg>
  );
}

function MembersIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.12.6.65 1 1.26 1H21a2 2 0 1 1 0 4h-.34c-.61 0-1.14.4-1.26 1Z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
