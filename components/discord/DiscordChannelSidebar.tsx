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

const CHANNELS = ["home", "projects", "blogs"] as const;

export default function DiscordChannelSidebar({
  activeChannel,
  activeThread = null,
  onSelectChannel,
  onCloseThread,
  onOpenSettings,
}: DiscordChannelSidebarProps) {
  return (
    <aside
      style={{ width: "240px", minWidth: "240px", maxWidth: "240px" }}
      className="hidden sm:flex h-screen bg-[#2b2d31] flex-col shrink-0 border-r border-[#1f2023]/60 z-30"
      aria-label="Channels"
    >
      <button
        type="button"
        className="h-12 border-b border-[#1f2023] px-4 flex items-center justify-between font-bold text-white shadow-sm cursor-pointer hover:bg-[#35373c]/50 transition-colors text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#8C95FF]"
        onClick={onOpenSettings}
        aria-label="Open theme settings"
      >
        <span className="truncate">Aerol (Aedwon)</span>
        <ChevronIcon />
      </button>

      <nav
        aria-label="Portfolio channels"
        className="flex-1 overflow-y-auto px-2 py-3 space-y-4 custom-scroll"
      >
        <div>
          <div className="px-1.5 mb-1 text-[11px] font-bold text-[#B5BAC1] uppercase tracking-wider">
            Channels
          </div>

          <div className="space-y-0.5">
            {CHANNELS.map((channel) => {
              const isActive = activeChannel === channel && !activeThread;
              const showsThread = activeThread?.parent === channel;

              return (
                <div key={channel}>
                  <button
                    id={`nav-${channel}`}
                    type="button"
                    onClick={() => onSelectChannel(channel)}
                    aria-current={isActive ? "page" : undefined}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#8C95FF] ${
                      isActive
                        ? "bg-[#3f4248] text-white"
                        : "hover:bg-[#35373c] text-[#B5BAC1] hover:text-[#dbdee1]"
                    }`}
                  >
                    <ChannelIcon />
                    <span>{channel}</span>
                  </button>

                  {showsThread && activeThread ? (
                    <div className="relative pl-6 pr-1 pt-1">
                      <div
                        className="absolute left-[18px] -top-[10px] w-[14px] h-6 border-l-2 border-b-2 border-[#4e5058] rounded-bl-md pointer-events-none"
                        aria-hidden="true"
                      />
                      <div className="w-full flex items-center justify-between px-2 py-1 rounded text-xs font-medium bg-[#3f4248] text-white">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <ThreadIcon />
                          <span className="truncate font-medium">{activeThread.slug}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onCloseThread?.();
                          }}
                          className="text-[#B5BAC1] hover:text-white p-1 rounded text-[10px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#8C95FF]"
                          title="Close Thread"
                          aria-label={`Close ${activeThread.slug} thread`}
                        >
                          <span aria-hidden="true">✕</span>
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </nav>

      <footer className="h-[52px] bg-[#232428] px-2 flex items-center justify-between shrink-0 border-t border-[#1f2023]">
        <button
          type="button"
          className="flex items-center gap-2 p-1 rounded-md hover:bg-[#313338] cursor-pointer min-w-0 flex-1 text-left focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#8C95FF]"
          onClick={onOpenSettings}
          aria-label="Open Aerol user settings"
        >
          <span className="relative shrink-0" aria-hidden="true">
            <span className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center text-white font-bold text-xs ring-2 ring-purple-400">
              A
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#23a55a] rounded-full border-2 border-[#232428]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="text-[13px] font-bold text-white truncate leading-tight block">
              Aerol (Aedwon)
            </span>
            <span className="text-[11px] text-[#B5BAC1] truncate leading-tight block">
              Online
            </span>
          </span>
        </button>

        <div className="flex items-center text-[#b5bac1]">
          <span className="p-1.5 rounded" aria-hidden="true">
            <MicrophoneIcon />
          </span>
          <span className="p-1.5 rounded" aria-hidden="true">
            <HeadphonesIcon />
          </span>
          <button
            type="button"
            className="p-1.5 hover:bg-[#313338] hover:text-white rounded transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#8C95FF]"
            onClick={onOpenSettings}
            title="User Settings (Theme Switcher)"
            aria-label="Open user settings and theme switcher"
          >
            <SettingsIcon />
          </button>
        </div>
      </footer>
    </aside>
  );
}

function ChannelIcon() {
  return (
    <svg className="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="4" x2="20" y1="9" y2="9" />
      <line x1="4" x2="20" y1="15" y2="15" />
      <line x1="10" x2="8" y1="3" y2="21" />
      <line x1="16" x2="14" y1="3" y2="21" />
    </svg>
  );
}

function ThreadIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function MicrophoneIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}

function HeadphonesIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
