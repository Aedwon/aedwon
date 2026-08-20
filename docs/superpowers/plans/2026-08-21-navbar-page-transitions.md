# Navbar Sliding Motion & Page Transitions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate layout shift caused by vertical scrollbars and implement smooth sliding capsule indicator motion and spring page transitions using Framer Motion.

**Architecture:** 
1. Lock scrollbar gutter space on root `html` in `globals.css` using `scrollbar-gutter: stable; overflow-y: scroll;`.
2. Refactor `components/Navbar.tsx` segmented capsule to use Framer Motion `layoutId="navbar-active-pill"` with spring physics (`stiffness: 400, damping: 32`).
3. Create `components/PageTransition.tsx` with `<AnimatePresence mode="wait">` and wrap `<main>` in `app/layout.tsx` for fast 220ms upward spring route transitions.

**Tech Stack:** Next.js 16 (App Router), React 19, Framer Motion 12, Tailwind CSS 3, Vitest 4, Testing Library.

## Global Constraints
- Do not introduce external animation libraries beyond existing `framer-motion`.
- Maintain full compatibility with all theme modes (`default`, `neobrutalist`, `discord`) and color modes (`light`, `dark`).
- Respect `prefers-reduced-motion` media queries.

---

### Task 1: Root Layout Stability & Scrollbar Gutter Fix

**Files:**
- Modify: `app/globals.css:116-126`

**Interfaces:**
- Consumes: Theme variables in `app/globals.css`
- Produces: Persistent scrollbar gutter preventing horizontal viewport shifts

- [ ] **Step 1: Update globals.css with scrollbar-gutter and reduced-motion rules**

```css
/* In app/globals.css */

/* Global Reset & Base */
html {
  scrollbar-gutter: stable;
  overflow-y: scroll;
}

body {
  background-color: var(--bg-canvas);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", sans-serif;
  min-height: 100vh;
  transition: background-color 0.2s ease, color 0.2s ease;
  overflow-x: hidden;
}

/* Reduced Motion Accessibility */
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 2: Verify CSS syntax & build check**

Run: `npx vitest run`
Expected: All current tests pass.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "style: add scrollbar-gutter stability and reduced motion accessibility"
```

---

### Task 2: Navbar Sliding Pill Indicator with Framer Motion

**Files:**
- Modify: `components/Navbar.tsx:1-80`
- Test: `components/__tests__/navbar.test.tsx`

**Interfaces:**
- Consumes: `motion` from `framer-motion`, `usePathname` from `next/navigation`
- Produces: Smooth sliding pill background behind active navigation tabs

- [ ] **Step 1: Update unit tests for Navbar active indicator**

Update `components/__tests__/navbar.test.tsx` to verify layoutId rendering and active state styles:

```tsx
// components/__tests__/navbar.test.tsx
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "../Navbar";
import { ThemeProvider } from "../ThemeContext";

let mockPathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

describe("Navbar Component", () => {
  beforeEach(() => {
    mockPathname = "/";
  });

  it("renders the </aedwon> brand link to home", () => {
    render(
      <ThemeProvider>
        <Navbar />
      </ThemeProvider>
    );

    const brandLink = screen.getByText("</aedwon>");
    expect(brandLink).toBeDefined();
    expect(brandLink.closest("a")?.getAttribute("href")).toBe("/");
  });

  it("renders Home, Projects, and Blogs navigation links", () => {
    render(
      <ThemeProvider>
        <Navbar />
      </ThemeProvider>
    );

    expect(screen.getByText("Home")).toBeDefined();
    expect(screen.getByText("Projects")).toBeDefined();
    expect(screen.getByText("Blogs")).toBeDefined();
  });

  it("highlights the active route based on pathname", () => {
    mockPathname = "/projects";
    const { rerender } = render(
      <ThemeProvider>
        <Navbar />
      </ThemeProvider>
    );

    const projectsLink = screen.getByText("Projects");
    expect(projectsLink.className).toContain("text-[var(--text-primary)]");

    mockPathname = "/blogs";
    rerender(
      <ThemeProvider>
        <Navbar />
      </ThemeProvider>
    );
    const blogsLink = screen.getByText("Blogs");
    expect(blogsLink.className).toContain("text-[var(--text-primary)]");
  });

  it("toggles the theme popover menu when clicking the palette button", () => {
    render(
      <ThemeProvider>
        <Navbar />
      </ThemeProvider>
    );

    const themeButton = screen.getByLabelText("Theme settings");
    expect(themeButton).toBeDefined();

    expect(screen.queryByTestId("theme-popover")).toBeNull();

    fireEvent.click(themeButton);
    expect(screen.getByTestId("theme-popover")).toBeDefined();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByTestId("theme-popover")).toBeNull();
  });
});
```

- [ ] **Step 2: Update Navbar.tsx with Framer Motion layoutId pill**

```tsx
// components/Navbar.tsx
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

  return (
    <header className="sticky top-4 sm:top-6 z-40 flex justify-center mb-8 sm:mb-10 pointer-events-none transition-all">
      <div className="pointer-events-auto inline-flex items-center gap-3 sm:gap-4 px-3.5 sm:px-4 py-1.5 rounded-full bg-[var(--bg-card)]/80 backdrop-blur-xl border border-[var(--border-subtle)] shadow-[0_12px_36px_rgba(0,0,0,0.35)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.5)] transition-all">
        
        {/* Brand Mark */}
        <Link
          href="/"
          className="font-mono text-[13px] sm:text-[13.5px] font-semibold text-[var(--text-primary)] hover:opacity-85 active:scale-[0.95] transition-all cursor-pointer select-none pl-1"
        >
          &lt;/aedwon&gt;
        </Link>

        {/* Segmented Navigation Capsule with Sliding Pill */}
        <nav className="relative flex items-center bg-black/[0.04] dark:bg-black/35 p-0.5 rounded-full border border-black/[0.03] dark:border-white/[0.04]">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative px-3 py-1 rounded-full text-[12px] sm:text-[12.5px] select-none transition-colors duration-150 active:scale-[0.94]"
            >
              {item.isActive && (
                <motion.span
                  layoutId="navbar-active-pill"
                  className="absolute inset-0 rounded-full bg-[var(--bg-card)] border border-black/[0.04] dark:border-white/[0.08] shadow-xs"
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
                    ? "text-[var(--text-primary)] font-semibold"
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
            className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-center transition-all cursor-pointer border border-transparent hover:border-black/[0.06] dark:hover:border-white/[0.08] active:scale-[0.92]"
            aria-label="Theme settings"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>

          {popoverOpen && (
            <div
              data-testid="theme-popover"
              className="absolute top-[calc(100%+8px)] right-0 w-[146px] bg-[var(--bg-card)] shadow-2xl rounded-xl p-1.5 z-50 flex flex-col gap-1.5 border border-[var(--border-subtle)] animate-in fade-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Row 1: Mode (Icons Only) */}
              {theme !== "discord" ? (
                <div className="grid grid-cols-3 gap-0.5 bg-black/[0.04] dark:bg-black/30 p-0.5 rounded-[9px]">
                  <button
                    onClick={(e) => handleModeChange("system", e)}
                    data-tooltip="System"
                    className={`has-tooltip h-7 rounded-[7px] flex items-center justify-center transition-all cursor-pointer active:scale-[0.92] ${
                      mode === "system"
                        ? "bg-[var(--bg-card)] text-[var(--text-primary)] font-medium shadow-xs border border-black/[0.04] dark:border-white/[0.08]"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/[0.02] dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleModeChange("light", e)}
                    data-tooltip="Light"
                    className={`has-tooltip h-7 rounded-[7px] flex items-center justify-center transition-all cursor-pointer active:scale-[0.92] ${
                      mode === "light"
                        ? "bg-[var(--bg-card)] text-[var(--text-primary)] font-medium shadow-xs border border-black/[0.04] dark:border-white/[0.08]"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/[0.02] dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleModeChange("dark", e)}
                    data-tooltip="Dark"
                    className={`has-tooltip h-7 rounded-[7px] flex items-center justify-center transition-all cursor-pointer active:scale-[0.92] ${
                      mode === "dark"
                        ? "bg-[var(--bg-card)] text-[var(--text-primary)] font-medium shadow-xs border border-black/[0.04] dark:border-white/[0.08]"
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
              <div className="grid grid-cols-3 gap-0.5 bg-black/[0.04] dark:bg-black/30 p-0.5 rounded-[9px]">
                <button
                  onClick={() => setTheme("default")}
                  data-tooltip="Default"
                  className={`has-tooltip h-7 rounded-[7px] flex items-center justify-center transition-all cursor-pointer active:scale-[0.92] ${
                    theme === "default"
                      ? "bg-[var(--bg-card)] text-[var(--text-primary)] font-medium shadow-xs border border-black/[0.04] dark:border-white/[0.08]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/[0.02] dark:hover:bg-white/[0.04]"
                  }`}
                >
                  <Circle className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setTheme("neobrutalist")}
                  data-tooltip="Brutalist"
                  className={`has-tooltip h-7 rounded-[7px] flex items-center justify-center transition-all cursor-pointer active:scale-[0.92] ${
                    theme === "neobrutalist"
                      ? "bg-[var(--bg-card)] text-[var(--text-primary)] font-medium shadow-xs border border-black/[0.04] dark:border-white/[0.08]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/[0.02] dark:hover:bg-white/[0.04]"
                  }`}
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                </button>
                <button
                  onClick={() => setTheme("discord")}
                  data-tooltip="Discord"
                  className={`has-tooltip h-7 rounded-[7px] flex items-center justify-center transition-all cursor-pointer active:scale-[0.92] ${
                    theme === "discord"
                      ? "bg-[var(--bg-card)] text-[var(--text-primary)] font-medium shadow-xs border border-black/[0.04] dark:border-white/[0.08]"
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
```

- [ ] **Step 3: Run unit tests to verify implementation**

Run: `npx vitest run components/__tests__/navbar.test.tsx`
Expected: PASS with all 4 tests passing.

- [ ] **Step 4: Commit**

```bash
git add components/Navbar.tsx components/__tests__/navbar.test.tsx
git commit -m "feat(nav): add framer motion sliding pill indicator to navbar capsule"
```

---

### Task 3: Page Transition Component & Layout Integration

**Files:**
- Create: `components/PageTransition.tsx`
- Create: `components/__tests__/page-transition.test.tsx`
- Modify: `app/layout.tsx:1-58`

**Interfaces:**
- Consumes: `usePathname` from `next/navigation`, `AnimatePresence`, `motion` from `framer-motion`
- Produces: `<PageTransition>` component wrapping `<main>` in `app/layout.tsx`

- [ ] **Step 1: Write unit test for PageTransition**

Create `components/__tests__/page-transition.test.tsx`:

```tsx
// components/__tests__/page-transition.test.tsx
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PageTransition from "../PageTransition";

vi.mock("next/navigation", () => ({
  usePathname: () => "/test-route",
}));

describe("PageTransition Component", () => {
  it("renders child content smoothly", () => {
    render(
      <PageTransition>
        <div data-testid="test-content">Portfolio Content</div>
      </PageTransition>
    );

    expect(screen.getByTestId("test-content")).toBeDefined();
    expect(screen.getByText("Portfolio Content")).toBeDefined();
  });
});
```

- [ ] **Step 2: Create PageTransition.tsx component**

```tsx
// components/PageTransition.tsx
"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{
          duration: 0.22,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

- [ ] **Step 3: Integrate PageTransition into app/layout.tsx**

Update `app/layout.tsx` to wrap `{children}` inside `<PageTransition>`:

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeContext";
import DiscordLayout from "@/components/DiscordLayout";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

export const metadata: Metadata = {
  title: "Aerol (Aedwon) — Software Engineer & Builder",
  description: "Computer Science at UP Diliman on a DOST Merit Scholarship. Software builds, client-side tools, and platforms.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="default" data-mode="dark" suppressHydrationWarning>
      <head>
        {/* Anti-Flash Theme Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('aedwon-theme') || 'default';
                  const mode = localStorage.getItem('aedwon-mode') || 'dark';
                  const effectiveMode = mode === 'system' 
                    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                    : mode;
                  document.documentElement.setAttribute('data-theme', theme);
                  document.documentElement.setAttribute('data-mode', effectiveMode);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <DiscordLayout>
            <div
              id="portfolio-main-surface"
              className="max-w-[860px] mx-auto px-6 sm:px-8 pt-8 min-h-screen flex flex-col justify-between transition-transform"
            >
              <div>
                <Navbar />
                <main>
                  <PageTransition>{children}</PageTransition>
                </main>
              </div>
              <Footer />
            </div>
          </DiscordLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Run unit tests to verify PageTransition**

Run: `npx vitest run`
Expected: All tests pass across portfolio, navbar, and page-transition test suites.

- [ ] **Step 5: Commit**

```bash
git add components/PageTransition.tsx components/__tests__/page-transition.test.tsx app/layout.tsx
git commit -m "feat(transition): add PageTransition animated container for route transitions"
```

---

### Task 4: Verification & Build Check

**Files:**
- Verification only

- [ ] **Step 1: Run production build check**

Run: `npm run build`
Expected: Clean build with zero TypeScript or Lint errors.

- [ ] **Step 2: Run all test suites**

Run: `npx vitest run`
Expected: All test suites passing.

- [ ] **Step 3: Commit completion**

```bash
git commit --allow-empty -m "chore: complete navbar motion and page transitions implementation"
```
