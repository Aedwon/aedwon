"use client";

import React from "react";
import { useTheme } from "./ThemeContext";
import {
  Home,
  Hash,
  ChevronDown,
  Settings,
  Mic,
  Headphones,
  BookOpen,
  FolderGit2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const CHANNELS = [
  {
    category: "PORTFOLIO",
    items: [
      { id: "home", icon: Home, href: "/", label: "home" },
      { id: "projects", icon: FolderGit2, href: "/projects", label: "projects" },
      { id: "blogs", icon: BookOpen, href: "/blogs", label: "blogs" },
    ],
  },
];

export default function DiscordLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const pathname = usePathname();

  // Only wrap in Discord shell when theme is discord
  if (theme !== "discord") {
    return <>{children}</>;
  }

  const activeChannelName =
    pathname === "/"
      ? "home"
      : pathname.slice(1).replace("/", "-");

  return (
    <>
      {/* Server Sidebar */}
      <div className="hidden md:flex fixed top-0 left-0 w-[72px] h-screen bg-[#202225] flex-col items-center py-3 gap-2 z-40">
        <Link href="/">
          <div
            className={`w-12 h-12 rounded-[24px] hover:rounded-[16px] transition-all duration-200 flex items-center justify-center cursor-pointer ${
              pathname === "/"
                ? "bg-[#5865F2] rounded-[16px] text-white"
                : "bg-[#36393f] hover:bg-[#5865F2] text-gray-300 hover:text-white"
            }`}
          >
            <span className="font-mono font-bold text-sm">&lt;/&gt;</span>
          </div>
        </Link>

        <div className="w-8 h-0.5 bg-[#36393f] rounded-full my-1" />

        <div className="w-12 h-12 rounded-[16px] transition-all duration-200 flex items-center justify-center cursor-pointer bg-[#5865F2] text-white font-bold text-lg">
          A
        </div>

        <div className="w-12 h-12 rounded-[24px] hover:rounded-[16px] transition-all duration-200 flex items-center justify-center cursor-pointer bg-[#36393f] hover:bg-[#3ba55c] group text-[#3ba55c] group-hover:text-white text-2xl font-light">
          +
        </div>
      </div>

      {/* Main Layout Area */}
      <div className="flex fixed top-0 left-0 md:left-[72px] right-0 bottom-0 overflow-hidden bg-[#36393f]">
        {/* Channel Sidebar */}
        <div className="hidden md:flex w-60 bg-[#2f3136] flex-col shrink-0">
          {/* Server Title Header */}
          <div className="h-12 border-b border-[#202225] px-4 flex items-center justify-between font-bold text-white shadow-sm">
            <span>Aedwon's Server</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>

          {/* Channels List */}
          <div className="flex-1 overflow-y-auto pt-4 px-2">
            {CHANNELS.map((section) => (
              <div key={section.category} className="mb-4">
                <div className="flex items-center gap-1 px-1 mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide cursor-pointer hover:text-gray-300">
                  <ChevronDown className="w-3 h-3" />
                  {section.category}
                </div>
                {section.items.map((channel) => (
                  <Link key={channel.id} href={channel.href}>
                    <div
                      className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm mb-0.5 ${
                        pathname === channel.href ||
                        (channel.href !== "/" && pathname.startsWith(channel.href))
                          ? "bg-[#42464d] text-white"
                          : "text-gray-400 hover:text-gray-200 hover:bg-[#36393f]"
                      }`}
                    >
                      <channel.icon className="w-4 h-4 opacity-70" />
                      <span className="truncate">#{channel.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ))}
          </div>

          {/* User Profile Bottom Panel */}
          <div className="h-[52px] bg-[#292b2f] px-2 flex items-center gap-2">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center text-white font-bold text-sm">
                A
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#3ba55c] rounded-full border-[3px] border-[#292b2f]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">Aerol (Aedwon)</div>
              <div className="text-xs text-gray-400 truncate">Online · CS @ UP Diliman</div>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1.5 hover:bg-[#36393f] rounded cursor-pointer">
                <Mic className="w-4 h-4 text-gray-400" />
              </button>
              <button className="p-1.5 hover:bg-[#36393f] rounded cursor-pointer">
                <Headphones className="w-4 h-4 text-gray-400" />
              </button>
              <button className="p-1.5 hover:bg-[#36393f] rounded cursor-pointer">
                <Settings className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#36393f]">
          {/* Channel Header */}
          <div className="h-12 px-4 flex items-center gap-2 border-b border-[#202225] shadow-sm shrink-0 min-w-0">
            <Hash className="w-5 h-5 text-gray-400 shrink-0" />
            <span className="font-bold text-white whitespace-nowrap">{activeChannelName}</span>
            <div className="w-px h-6 bg-[#42464d] mx-2 shrink-0" />
            <span className="text-sm text-gray-400 truncate flex-1 min-w-0">
              {pathname === "/" && "Aerol (Aedwon) — Computer Science @ UP Diliman, DOST Scholar"}
              {pathname.startsWith("/projects") && "Software builds, client-side tools, and platforms"}
              {pathname.startsWith("/blogs") && "Technical notes and architecture writeups"}
            </span>
          </div>

          {/* Scrollable Main Area */}
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
            <div className="max-w-4xl mx-auto">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
}
