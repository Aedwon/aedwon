"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Circle, Monitor, Moon, Palette, Square, Sun } from "lucide-react";
import { useTheme, type ThemeMode, type ThemeStyle } from "./ThemeContext";
import { prewarmThemeTarget } from "@/lib/utils/asset-prewarmer";

const POPOVER_ID = "theme-settings-popover";

export default function Navbar() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const {
    theme,
    mode,
    resolvedMode,
    isNeobrutalist,
    supportsColorMode,
    setTheme,
    setMode,
  } = useTheme();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [pillPosition, setPillPosition] = useState<{ left: number; width: number } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  const navItems = useMemo(
    () => [
      { label: "Home", href: "/", isActive: pathname === "/" },
      { label: "Projects", href: "/projects", isActive: pathname.startsWith("/projects") },
      { label: "Blogs", href: "/blogs", isActive: pathname.startsWith("/blogs") },
    ],
    [pathname],
  );

  const updatePillPosition = useCallback(() => {
    const activeItem = navItems.find((item) => item.isActive);
    const activeElement = activeItem ? tabRefs.current[activeItem.href] : null;
    if (!activeElement) return;

    const next = { left: activeElement.offsetLeft, width: activeElement.offsetWidth };
    setPillPosition((current) =>
      current?.left === next.left && current.width === next.width ? current : next,
    );
  }, [navItems]);

  useEffect(() => {
    updatePillPosition();
    const nav = navRef.current;
    if (!nav || typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updatePillPosition);
      return () => window.removeEventListener("resize", updatePillPosition);
    }

    const observer = new ResizeObserver(updatePillPosition);
    observer.observe(nav);
    Object.values(tabRefs.current).forEach((element) => element && observer.observe(element));
    void document.fonts?.ready.then(updatePillPosition);
    return () => observer.disconnect();
  }, [updatePillPosition]);

  useEffect(() => {
    if (!popoverOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setPopoverOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPopoverOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [popoverOpen]);

  const prewarmMode = useCallback((targetMode: "light" | "dark") => {
    prewarmThemeTarget(targetMode === "light" ? "default-light" : "default-dark");
  }, []);

  const handleModeChange = (newMode: ThemeMode, event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMode(newMode, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  };

  const handleThemeChange = (newTheme: ThemeStyle) => {
    setTheme(newTheme);
    if (newTheme === "neobrutalist") prewarmThemeTarget("neobrutalist");
    if (newTheme === "default") prewarmMode(resolvedMode);
  };

  const modeButtonClass = (selected: boolean) =>
    `has-tooltip h-7 rounded-[7px] flex items-center justify-center transition-all cursor-pointer active:scale-[0.92] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--text-primary)] ${
      selected
        ? "bg-[var(--bg-card)] text-[var(--text-primary)] font-medium shadow-xs border border-black/[0.04] dark:border-white/[0.08]"
        : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/[0.02] dark:hover:bg-white/[0.04]"
    }`;

  const themeButtonClass = (selected: boolean) =>
    `has-tooltip h-7 flex items-center justify-center transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--text-primary)] ${
      isNeobrutalist
        ? "rounded-none active:translate-x-[1px] active:translate-y-[1px]"
        : "rounded-[7px] active:scale-[0.92]"
    } ${
      selected
        ? isNeobrutalist
          ? "bg-[#FFE600] text-black font-bold border border-black shadow-[1px_1px_0px_#000]"
          : "bg-[var(--bg-card)] text-[var(--text-primary)] font-medium shadow-xs border border-black/[0.04] dark:border-white/[0.08]"
        : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/[0.02] dark:hover:bg-white/[0.04]"
    }`;

  return (
    <header className="sticky top-4 sm:top-6 z-40 flex justify-center mb-8 sm:mb-10 pointer-events-none">
      <div
        className={`pointer-events-auto inline-flex items-center gap-3 sm:gap-4 px-3.5 sm:px-4 py-1.5 transition-all ${
          isNeobrutalist
            ? "rounded-none bg-[var(--bg-card)] border-[3px] border-black shadow-[4px_4px_0px_#000000]"
            : "rounded-full bg-[var(--bg-card)]/80 backdrop-blur-xl border border-[var(--border-subtle)] shadow-[0_12px_36px_rgba(0,0,0,0.35)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.5)]"
        }`}
      >
        <Link
          href="/"
          className={`text-[13px] sm:text-[13.5px] select-none transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)] ${
            isNeobrutalist
              ? "font-black bg-[#FFE600] text-black px-2 py-0.5 border-2 border-black shadow-[2px_2px_0px_#000000]"
              : "font-mono font-semibold text-[var(--text-primary)] hover:opacity-85 active:scale-[0.95] pl-1"
          }`}
        >
          &lt;/aedwon&gt;
        </Link>

        <nav
          ref={navRef}
          aria-label="Primary navigation"
          className={`relative flex items-center p-0.5 ${
            isNeobrutalist
              ? "bg-black/[0.08] rounded-none border-2 border-black"
              : "bg-black/[0.04] dark:bg-black/35 rounded-full border border-black/[0.03] dark:border-white/[0.04]"
          }`}
        >
          {pillPosition && (
            <motion.div
              data-testid="navbar-active-pill"
              aria-hidden="true"
              className={`absolute top-0.5 bottom-0.5 pointer-events-none ${
                isNeobrutalist
                  ? "rounded-none bg-[#FFE600] border-2 border-black shadow-[2px_2px_0px_#000000]"
                  : "rounded-full bg-[var(--bg-card)] border border-black/[0.04] dark:border-white/[0.08] shadow-xs"
              }`}
              initial={false}
              animate={{ x: pillPosition.left, width: pillPosition.width }}
              transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 32 }}
              style={{ left: 0 }}
            />
          )}

          {navItems.map((item) => (
            <Link
              key={item.href}
              ref={(element) => {
                tabRefs.current[item.href] = element;
              }}
              href={item.href}
              aria-current={item.isActive ? "page" : undefined}
              className={`relative px-3 py-1 text-[12px] sm:text-[12.5px] select-none transition-colors duration-150 active:scale-[0.94] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--text-primary)] ${
                isNeobrutalist ? "rounded-none font-mono" : "rounded-full"
              }`}
            >
              <span
                className={`relative z-10 transition-colors duration-150 ${
                  item.isActive
                    ? isNeobrutalist
                      ? "text-black font-bold"
                      : "text-[var(--text-primary)] font-semibold"
                    : isNeobrutalist
                      ? "text-[var(--text-primary)] hover:text-black font-bold"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium"
                }`}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="relative" ref={popoverRef}>
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setPopoverOpen((open) => !open)}
            onMouseEnter={() => supportsColorMode && prewarmMode(resolvedMode === "dark" ? "light" : "dark")}
            onFocus={() => supportsColorMode && prewarmMode(resolvedMode === "dark" ? "light" : "dark")}
            className={`w-7 h-7 sm:w-7.5 sm:h-7.5 flex items-center justify-center transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)] ${
              isNeobrutalist
                ? "rounded-none bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] font-bold"
                : "rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-transparent hover:border-black/[0.06] dark:hover:border-white/[0.08] active:scale-[0.92]"
            }`}
            aria-label="Theme settings"
            aria-expanded={popoverOpen}
            aria-controls={POPOVER_ID}
          >
            <Palette className="w-3.5 h-3.5" aria-hidden="true" />
          </button>

          {popoverOpen && (
            <div
              id={POPOVER_ID}
              data-testid="theme-popover"
              role="dialog"
              aria-label="Theme settings"
              className={`absolute top-[calc(100%+8px)] right-0 w-[146px] bg-[var(--bg-card)] p-1.5 z-50 flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-150 ${
                isNeobrutalist
                  ? "rounded-none border-[2.5px] border-black shadow-[5px_5px_0px_#000000]"
                  : "rounded-xl border border-[var(--border-subtle)] shadow-2xl"
              }`}
            >
              {supportsColorMode && (
                <div className="grid grid-cols-3 gap-0.5 bg-black/[0.04] dark:bg-black/30 p-0.5 rounded-[9px]" aria-label="Color mode">
                  <button type="button" aria-label="Use system color mode" aria-pressed={mode === "system"} data-tooltip="System" className={modeButtonClass(mode === "system")} onClick={(event) => handleModeChange("system", event)}>
                    <Monitor className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <button type="button" aria-label="Use light mode" aria-pressed={mode === "light"} data-tooltip="Light" className={modeButtonClass(mode === "light")} onMouseEnter={() => prewarmMode("light")} onFocus={() => prewarmMode("light")} onClick={(event) => handleModeChange("light", event)}>
                    <Sun className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <button type="button" aria-label="Use dark mode" aria-pressed={mode === "dark"} data-tooltip="Dark" className={modeButtonClass(mode === "dark")} onMouseEnter={() => prewarmMode("dark")} onFocus={() => prewarmMode("dark")} onClick={(event) => handleModeChange("dark", event)}>
                    <Moon className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              )}

              <div className={`grid grid-cols-3 gap-0.5 p-0.5 ${isNeobrutalist ? "bg-black/[0.08] rounded-none border border-black" : "bg-black/[0.04] dark:bg-black/30 rounded-[9px]"}`} aria-label="Presentation style">
                <button type="button" aria-label="Use default presentation" aria-pressed={theme === "default"} data-tooltip="Default" className={themeButtonClass(theme === "default")} onMouseEnter={() => prewarmMode(resolvedMode)} onFocus={() => prewarmMode(resolvedMode)} onClick={() => handleThemeChange("default")}>
                  <Circle className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button type="button" aria-label="Use neobrutalist presentation" aria-pressed={theme === "neobrutalist"} data-tooltip="Brutalist" className={themeButtonClass(theme === "neobrutalist")} onMouseEnter={() => prewarmThemeTarget("neobrutalist")} onFocus={() => prewarmThemeTarget("neobrutalist")} onClick={() => handleThemeChange("neobrutalist")}>
                  <Square className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                </button>
                <button type="button" aria-label="Use Discord presentation" aria-pressed={theme === "discord"} data-tooltip="Discord" className={themeButtonClass(theme === "discord")} onClick={() => handleThemeChange("discord")}>
                  <DiscordIcon />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function DiscordIcon() {
  return (
    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.123-.092.247-.19.372-.292a.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.078.078 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}
