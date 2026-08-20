"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useTheme } from "./ThemeContext";
import {
  Palette,
  Monitor,
  Sun,
  Moon,
  Circle,
  Square,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { theme, mode, setTheme, setMode } = useTheme();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleModeChange = (
    newMode: "system" | "light" | "dark",
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const origin = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    setMode(newMode, origin);
  };

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setPopoverOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { label: "Home", href: "/", isActive: pathname === "/" },
    { label: "Projects", href: "/projects", isActive: pathname.startsWith("/projects") },
    { label: "Blogs", href: "/blogs", isActive: pathname.startsWith("/blogs") },
  ];

  const isNeobrutalist = theme === "neobrutalist";

  return (
    <header className="sticky top-4 sm:top-6 z-40 flex justify-center mb-8 sm:mb-10 pointer-events-none">
      <div
        className={`pointer-events-auto inline-flex items-center gap-3 sm:gap-4 px-3.5 sm:px-4 py-1.5 transition-all ${
          isNeobrutalist
            ? "rounded-none bg-[var(--bg-card)] border-[3px] border-black dark:border-white shadow-[4px_4px_0px_#000000] dark:shadow-[4px_4px_0px_#FFE600]"
            : "rounded-full bg-[var(--bg-card)]/80 backdrop-blur-xl border border-[var(--border-subtle)] shadow-[0_12px_36px_rgba(0,0,0,0.35)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.5)]"
        }`}
      >
        
        {/* Brand Mark */}
        <Link
          href="/"
          className={`font-mono text-[13px] sm:text-[13.5px] font-semibold text-[var(--text-primary)] hover:opacity-85 active:scale-[0.95] transition-all cursor-pointer select-none pl-1 ${
            isNeobrutalist ? "font-bold tracking-tight" : ""
          }`}
        >
          &lt;/aedwon&gt;
        </Link>

        {/* Segmented Navigation Capsule with Sliding Pill */}
        <nav
          className={`relative flex items-center p-0.5 ${
            isNeobrutalist
              ? "bg-black/[0.08] dark:bg-black/60 rounded-none border-2 border-black dark:border-white/50"
              : "bg-black/[0.04] dark:bg-black/35 rounded-full border border-black/[0.03] dark:border-white/[0.04]"
          }`}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative px-3 py-1 text-[12px] sm:text-[12.5px] select-none transition-colors duration-150 active:scale-[0.94] ${
                isNeobrutalist
                  ? "rounded-none font-mono"
                  : "rounded-full"
              }`}
            >
              {item.isActive && (
                <motion.span
                  layoutId="navbar-active-pill"
                  className={`absolute inset-0 ${
                    isNeobrutalist
                      ? "rounded-none bg-[#FFE600] dark:bg-white text-black border-2 border-black shadow-[2px_2px_0px_#000000]"
                      : "rounded-full bg-[var(--bg-card)] border border-black/[0.04] dark:border-white/[0.08] shadow-xs"
                  }`}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 32,
                  }}
                />
              )}
              <span
                className={`relative z-10 transition-colors duration-150 ${
                  item.isActive
                    ? isNeobrutalist
                      ? "text-black font-bold"
                      : "text-[var(--text-primary)] font-semibold"
                    : isNeobrutalist
                    ? "text-[var(--text-primary)] hover:text-black dark:hover:text-white font-bold"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium"
                }`}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Chameleon Trigger & Icons-Only Popover */}
        <div className="relative" ref={popoverRef}>
          <button
            onClick={() => setPopoverOpen(!popoverOpen)}
            className={`w-7 h-7 sm:w-7.5 sm:h-7.5 flex items-center justify-center transition-all cursor-pointer ${
              isNeobrutalist
                ? "rounded-none bg-[#FFE600] text-black border-2 border-black dark:border-white shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#FFE600] active:translate-x-[1px] active:translate-y-[1px] font-bold"
                : "rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-transparent hover:border-black/[0.06] dark:hover:border-white/[0.08] active:scale-[0.92]"
            }`}
            aria-label="Theme settings"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>

          {popoverOpen && (
            <div
              data-testid="theme-popover"
              className={`absolute top-[calc(100%+8px)] right-0 w-[146px] bg-[var(--bg-card)] p-1.5 z-50 flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-150 ${
                isNeobrutalist
                  ? "rounded-none border-[2.5px] border-black dark:border-white shadow-[5px_5px_0px_#000000] dark:shadow-[5px_5px_0px_#FFE600]"
                  : "rounded-xl border border-[var(--border-subtle)] shadow-2xl"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Row 1: Mode (Icons Only) */}
              {theme !== "discord" ? (
                <div
                  className={`grid grid-cols-3 gap-0.5 p-0.5 ${
                    isNeobrutalist
                      ? "bg-black/[0.08] dark:bg-black/50 rounded-none border border-black dark:border-white/30"
                      : "bg-black/[0.04] dark:bg-black/30 rounded-[9px]"
                  }`}
                >
                  <button
                    onClick={(e) => handleModeChange("system", e)}
                    data-tooltip="System"
                    className={`has-tooltip h-7 flex items-center justify-center transition-all cursor-pointer ${
                      isNeobrutalist ? "rounded-none active:translate-x-[1px] active:translate-y-[1px]" : "rounded-[7px] active:scale-[0.92]"
                    } ${
                      mode === "system"
                        ? isNeobrutalist
                          ? "bg-[#FFE600] text-black font-bold border border-black shadow-[1px_1px_0px_#000]"
                          : "bg-[var(--bg-card)] text-[var(--text-primary)] font-medium shadow-xs border border-black/[0.04] dark:border-white/[0.08]"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/[0.02] dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleModeChange("light", e)}
                    data-tooltip="Light"
                    className={`has-tooltip h-7 flex items-center justify-center transition-all cursor-pointer ${
                      isNeobrutalist ? "rounded-none active:translate-x-[1px] active:translate-y-[1px]" : "rounded-[7px] active:scale-[0.92]"
                    } ${
                      mode === "light"
                        ? isNeobrutalist
                          ? "bg-[#FFE600] text-black font-bold border border-black shadow-[1px_1px_0px_#000]"
                          : "bg-[var(--bg-card)] text-[var(--text-primary)] font-medium shadow-xs border border-black/[0.04] dark:border-white/[0.08]"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/[0.02] dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleModeChange("dark", e)}
                    data-tooltip="Dark"
                    className={`has-tooltip h-7 flex items-center justify-center transition-all cursor-pointer ${
                      isNeobrutalist ? "rounded-none active:translate-x-[1px] active:translate-y-[1px]" : "rounded-[7px] active:scale-[0.92]"
                    } ${
                      mode === "dark"
                        ? isNeobrutalist
                          ? "bg-[#FFE600] text-black font-bold border border-black shadow-[1px_1px_0px_#000]"
                          : "bg-[var(--bg-card)] text-[var(--text-primary)] font-medium shadow-xs border border-black/[0.04] dark:border-white/[0.08]"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/[0.02] dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="py-1.5 px-2 bg-black/20 rounded-[8px] text-center text-[10.5px] font-mono text-[var(--text-dim)]">
                  Dark mode only
                </div>
              )}

              {/* Row 2: Theme Style (Icons Only) */}
              <div
                className={`grid grid-cols-3 gap-0.5 p-0.5 ${
                  isNeobrutalist
                    ? "bg-black/[0.08] dark:bg-black/50 rounded-none border border-black dark:border-white/30"
                    : "bg-black/[0.04] dark:bg-black/30 rounded-[9px]"
                }`}
              >
                <button
                  onClick={() => setTheme("default")}
                  data-tooltip="Default"
                  className={`has-tooltip h-7 flex items-center justify-center transition-all cursor-pointer ${
                    isNeobrutalist ? "rounded-none active:translate-x-[1px] active:translate-y-[1px]" : "rounded-[7px] active:scale-[0.92]"
                  } ${
                    theme === "default"
                      ? isNeobrutalist
                        ? "bg-[#FFE600] text-black font-bold border border-black shadow-[1px_1px_0px_#000]"
                        : "bg-[var(--bg-card)] text-[var(--text-primary)] font-medium shadow-xs border border-black/[0.04] dark:border-white/[0.08]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/[0.02] dark:hover:bg-white/[0.04]"
                  }`}
                >
                  <Circle className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setTheme("neobrutalist")}
                  data-tooltip="Brutalist"
                  className={`has-tooltip h-7 flex items-center justify-center transition-all cursor-pointer ${
                    isNeobrutalist ? "rounded-none active:translate-x-[1px] active:translate-y-[1px]" : "rounded-[7px] active:scale-[0.92]"
                  } ${
                    theme === "neobrutalist"
                      ? isNeobrutalist
                        ? "bg-[#FFE600] text-black font-bold border border-black shadow-[1px_1px_0px_#000]"
                        : "bg-[var(--bg-card)] text-[var(--text-primary)] font-medium shadow-xs border border-black/[0.04] dark:border-white/[0.08]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/[0.02] dark:hover:bg-white/[0.04]"
                  }`}
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                </button>
                <button
                  onClick={() => setTheme("discord")}
                  data-tooltip="Discord"
                  className={`has-tooltip h-7 flex items-center justify-center transition-all cursor-pointer ${
                    isNeobrutalist ? "rounded-none active:translate-x-[1px] active:translate-y-[1px]" : "rounded-[7px] active:scale-[0.92]"
                  } ${
                    theme === "discord"
                      ? isNeobrutalist
                        ? "bg-[#FFE600] text-black font-bold border border-black shadow-[1px_1px_0px_#000]"
                        : "bg-[var(--bg-card)] text-[var(--text-primary)] font-medium shadow-xs border border-black/[0.04] dark:border-white/[0.08]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/[0.02] dark:hover:bg-white/[0.04]"
                  }`}
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.078.078 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
