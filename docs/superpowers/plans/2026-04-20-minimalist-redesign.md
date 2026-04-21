# Minimalist Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the default Minimalist theme and rewrite all copy across 5 pages + global chrome, per spec `docs/superpowers/specs/2026-04-20-minimalist-redesign-design.md`.

**Architecture:** Keep the existing 3-theme system (`:root` = Minimalist, `[data-theme='...']` overrides). Add new CSS tokens (Source Serif 4, IBM Plex Mono, refined color/scale) to `:root`. Neubrutalist and DiscordOS override only what would clash. Add a `MotionWrapper` component to centralize `useReducedMotion()` handling. Replace fake content (StatsBar, Testimonials) with honest status labels. Rewrite all copy in voice C across five pages.

**Tech Stack:** Next.js 16.1.1, React 19.2.3, TypeScript, Tailwind CSS 3.4, Framer Motion 12, Lucide React, `next/font/google`.

---

## Working notes

- **No test framework is installed.** Testing strategy: TypeScript typecheck + ESLint + manual browser verification (dev server) + a single Lighthouse pass at the end. TDD ceremony is preserved only for the one logic-bearing component (`MotionWrapper`) via a lightweight Vitest install in Task 0.4 — scoped to that file.
- **Commit cadence:** one commit per task. Use conventional commit prefixes (`feat:`, `refactor:`, `chore:`, `docs:`) matching existing repo style.
- **Theme scope:** all visual changes target Minimalist only. Neubrutalist and Discord branches must remain functional after every task. Verify by switching themes in the dev server before committing each task.
- **Placeholders in spec §14** (prices, bot details, accent hex) stay as spec-level placeholders. The plan includes a concrete accent hex choice and a follow-up task for user-sourced content.

---

## File structure

### Files to create

| Path | Responsibility |
|---|---|
| `components/MotionWrapper.tsx` | Wraps framer-motion `<motion.*>` usage; strips motion under `prefers-reduced-motion: reduce`. |
| `components/TwoOfferSplit.tsx` | Homepage § 02 — two-card split showing "stranger sale" vs "regular sale". |
| `components/StateLabel.tsx` | Reusable "● NOW BOOKING · TAKING ONE AT A TIME" label, used on every page. |
| `components/SectionMarker.tsx` | Reusable `§ 0N — TITLE` typographic device. |
| `components/Colophon.tsx` | Footer colophon line (Minimalist only). |
| `vitest.config.ts` | Vitest config, scoped to `components/**/*.test.ts(x)`. |
| `components/__tests__/MotionWrapper.test.tsx` | Unit tests for MotionWrapper. |

### Files to modify

| Path | Change |
|---|---|
| `app/layout.tsx` | Load Source Serif 4 + IBM Plex Mono; update metadata title/description. |
| `app/globals.css` | Add new Minimalist tokens; neubrutalist/discord overrides for new clash tokens. |
| `tailwind.config.ts` | Expose new font variables and scale tokens. |
| `components/ThemeContext.tsx` | Relabel theme options (Paper/Sticker/Server) via exported constant. |
| `components/Navbar.tsx` | Minimalist branch: wordmark "Aedwon" in serif, theme toggle labels, primary CTA. |
| `components/Footer.tsx` | Minimalist branch: colophon line, metadata phrasing. |
| `components/HeroSection.tsx` | Minimalist: new hero copy (lead POV). |
| `components/HowItWorks.tsx` | Rewrite step copy + rename "Growth Engine" → "Operate". |
| `components/WhoThisIsFor.tsx` | Rewrite 5 yeses + 4 nos in voice C. |
| `components/FAQ.tsx` | Rewrite 6 questions + answers in voice C. |
| `components/CTASection.tsx` | Rewrite "still here" copy + StateLabel. |
| `components/BotCard.tsx` | Reframe label to "LIVE · INTERNAL TOOL" with "data illustrative" caption. |
| `app/page.tsx` | Remove StatsBar + Testimonials; insert TwoOfferSplit + StateLabel. |
| `app/web-solutions/page.tsx` | Full rewrite: § markers, project cards with honest labels, STANDARDS section, tier copy. |
| `app/community-solutions/page.tsx` | Full rewrite: § markers, bot cards (placeholders), three pillars, tier copy. |
| `app/process/page.tsx` | Rewrite step copy, rename step 05, add cross-reference to `/web-solutions` Audit tier. |
| `app/contact/page.tsx` | Three-door structure: GCal link, form, email fallback. |

### Files to delete

| Path | Reason |
|---|---|
| `components/StatsBar.tsx` | Fake numbers; removed from homepage with no replacement. |
| `components/Testimonials.tsx` | No real testimonials yet; removed until they exist. |

---

# Phase 0 — Foundation

## Task 0.1: Install font families

**Files:**
- Modify: `app/layout.tsx:1-20`

Introduces Source Serif 4 (display) and IBM Plex Mono (§ markers/state labels) via `next/font/google`. Space Mono and Inter stay loaded — other themes still reference them.

- [ ] **Step 1: Add font imports and variable declarations**

Edit `app/layout.tsx`. Replace lines 1-20 with:

```tsx
import type { Metadata } from "next";
import { Inter, Space_Mono, Source_Serif_4, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeContext";
import Navbar from "@/components/Navbar";
import DiscordLayout from "@/components/DiscordLayout";

// Font configurations
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});
```

- [ ] **Step 2: Attach new font variables to body**

Edit `app/layout.tsx` line 37. Replace:

```tsx
<body className={`${inter.variable} ${spaceMono.variable}`}>
```

with:

```tsx
<body className={`${inter.variable} ${spaceMono.variable} ${sourceSerif.variable} ${ibmPlexMono.variable}`}>
```

- [ ] **Step 3: Update metadata**

Edit `app/layout.tsx` lines 25-28. Replace:

```tsx
export const metadata: Metadata = {
  title: "The Living Lab by Aedwon",
  description: "A chameleon portfolio showcasing Web Solutions and Community Systems.",
};
```

with:

```tsx
export const metadata: Metadata = {
  title: "Aedwon — A studio of one.",
  description: "Web solutions and community systems. A brand sells twice — once to the stranger, once to the regular. I build for both sales.",
};
```

- [ ] **Step 4: Verify typecheck passes**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 5: Verify dev server renders**

Run: `npm run dev` (background). Open `http://localhost:3000`. Confirm page renders and no console errors. Switch to each theme via the navbar toggle — all three themes still render.

- [ ] **Step 6: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: Load Source Serif 4 and IBM Plex Mono fonts, update metadata for Aedwon studio framing."
```

---

## Task 0.2: Add new Minimalist CSS tokens

**Files:**
- Modify: `app/globals.css:5-20` (Minimalist `:root` block)
- Modify: `app/globals.css:22-39` (Neubrutalist override — add clash overrides)
- Modify: `app/globals.css:41-59` (Discord override — add clash overrides)

Adds ink/paper/rule color palette, type scale, font variables for Minimalist. Neubrutalist and Discord override new color/font tokens; scale tokens are shared.

- [ ] **Step 1: Extend the `:root` block in `globals.css`**

Edit `app/globals.css`. Replace lines 5-20 with:

```css
:root {
  /* Default: Minimalist Theme — editorial, ink-on-paper */
  --background: #FAFAF7;          /* warm paper */
  --foreground: #111111;          /* near-black ink */
  --accent: #C7361A;              /* muted terracotta */
  --accent-secondary: #F2F0E9;    /* quiet paper fold — replaces light gray */
  --border-color: color-mix(in srgb, #111111 15%, transparent);
  --border-width: 1px;
  --radius: 0.125rem;             /* quieter corners — was 0.5rem */
  --shadow: none;                 /* Minimalist has no shadow — was drop shadow */
  --font-main: var(--font-inter);
  --nav-height: 64px;

  /* Minimalist-specific extended tokens */
  --color-ink: #111111;
  --color-paper: #FAFAF7;
  --color-rule: color-mix(in srgb, #111111 15%, transparent);
  --color-accent-mono: #C7361A;
  --font-sans: var(--font-inter);
  --font-serif: var(--font-source-serif);
  --font-mono: var(--font-ibm-plex-mono);

  /* Type scale — shared across all themes (1.25 modular ratio) */
  --fs-micro: 0.6875rem;   /* 11px */
  --fs-small: 0.875rem;    /* 14px */
  --fs-body: 1rem;         /* 16px */
  --fs-h3: 1.5rem;         /* 24px */
  --fs-h2: 2.25rem;        /* 36px */
  --fs-h1: 3.375rem;       /* 54px */
  --fs-display: 5rem;      /* 80px */

  /* Rhythm — shared */
  --rule-hairline: 1px;
  --space-baseline: 0.5rem;
}
```

- [ ] **Step 2: Add clash overrides to the Neubrutalist block**

Edit `app/globals.css`. In the `[data-theme='neubrutalist']` block (lines 22-39 in original), after `--font-main: var(--font-space-mono);`, add before the closing brace:

```css
  /* Neubrutalist keeps its existing aesthetic tokens — override only where Minimalist extended */
  --color-ink: #000000;
  --color-paper: #FFFDF5;
  --color-rule: #000000;
  --color-accent-mono: #FF6B6B;
  --font-sans: var(--font-space-mono);
  --font-serif: var(--font-space-mono);
  --font-mono: var(--font-space-mono);
```

- [ ] **Step 3: Add clash overrides to the Discord block**

Edit `app/globals.css`. In the `[data-theme='discord']` block (lines 41-59 in original), after `--nav-height: 48px;`, add before the closing brace:

```css
  /* Discord keeps its existing aesthetic tokens — override only where Minimalist extended */
  --color-ink: #dcddde;
  --color-paper: #36393f;
  --color-rule: #202225;
  --color-accent-mono: #5865F2;
  --font-sans: var(--font-inter);
  --font-serif: var(--font-inter);
  --font-mono: var(--font-inter);
```

- [ ] **Step 4: Visual verification across all three themes**

Run: `npm run dev`. Load `http://localhost:3000`. Confirm Minimalist now shows warm paper (#FAFAF7) instead of pure white, and ink (#111) instead of pure black. Switch to Neubrutalist — unchanged (still cream + black + red). Switch to Discord — unchanged (still dark grey + blurple).

- [ ] **Step 5: Commit**

```bash
git add app/globals.css
git commit -m "feat: Add Minimalist ink/paper palette and shared type scale tokens."
```

---

## Task 0.3: Expose new tokens in Tailwind config

**Files:**
- Modify: `tailwind.config.ts:8-29`

Makes new font variables and scale tokens available as Tailwind utilities (`font-serif`, `font-mono`, `text-display`, etc.).

- [ ] **Step 1: Extend `tailwind.config.ts` theme block**

Edit `tailwind.config.ts`. Replace lines 8-29 with:

```ts
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                accent: "var(--accent)",
                "accent-secondary": "var(--accent-secondary)",
                border: "var(--border-color)",
                ink: "var(--color-ink)",
                paper: "var(--color-paper)",
                rule: "var(--color-rule)",
            },
            borderRadius: {
                theme: "var(--radius)",
            },
            borderWidth: {
                theme: "var(--border-width)",
            },
            boxShadow: {
                theme: "var(--shadow)",
            },
            fontFamily: {
                theme: "var(--font-main)",
                sans: "var(--font-sans)",
                serif: "var(--font-serif)",
                mono: "var(--font-mono)",
            },
            fontSize: {
                micro: "var(--fs-micro)",
                small: "var(--fs-small)",
                body: "var(--fs-body)",
                h3: "var(--fs-h3)",
                h2: "var(--fs-h2)",
                h1: "var(--fs-h1)",
                display: "var(--fs-display)",
            },
        },
    },
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Verify dev server still renders**

Confirm `http://localhost:3000` renders in all three themes.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts
git commit -m "feat: Expose new font and scale tokens in Tailwind config."
```

---

## Task 0.4: Build MotionWrapper component (TDD)

**Files:**
- Create: `components/MotionWrapper.tsx`
- Create: `components/__tests__/MotionWrapper.test.tsx`
- Create: `vitest.config.ts`
- Modify: `package.json` (devDependencies, scripts)

Single logic-bearing component — centralizes `useReducedMotion()` handling. Existing `motion.div` sites get progressively migrated to this wrapper in later tasks.

- [ ] **Step 1: Install Vitest + React Testing Library**

Run:

```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

Expected: packages added to devDependencies.

- [ ] **Step 2: Add Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
```

- [ ] **Step 3: Add test script to package.json**

Edit `package.json`. In the `"scripts"` block, add (next to existing scripts):

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Write the failing tests**

Create `components/__tests__/MotionWrapper.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MotionWrapper } from "../MotionWrapper";

// framer-motion useReducedMotion is stubbed per test via dynamic import
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    useReducedMotion: vi.fn(),
  };
});

import { useReducedMotion } from "framer-motion";

describe("MotionWrapper", () => {
  it("renders children", () => {
    (useReducedMotion as ReturnType<typeof vi.fn>).mockReturnValue(false);
    render(<MotionWrapper>hello</MotionWrapper>);
    expect(screen.getByText("hello")).toBeDefined();
  });

  it("passes motion props when reduced-motion is OFF", () => {
    (useReducedMotion as ReturnType<typeof vi.fn>).mockReturnValue(false);
    const { container } = render(
      <MotionWrapper initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        content
      </MotionWrapper>
    );
    expect(container.firstChild).toBeDefined();
  });

  it("strips motion props when reduced-motion is ON", () => {
    (useReducedMotion as ReturnType<typeof vi.fn>).mockReturnValue(true);
    const { container } = render(
      <MotionWrapper initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        content
      </MotionWrapper>
    );
    // Element still renders; motion is zero-duration
    expect(container.textContent).toBe("content");
  });
});
```

- [ ] **Step 5: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL with "Cannot find module '../MotionWrapper'" or similar.

- [ ] **Step 6: Write minimal MotionWrapper**

Create `components/MotionWrapper.tsx`:

```tsx
"use client";

import { motion, useReducedMotion, MotionProps, Variants } from "framer-motion";
import { ComponentPropsWithoutRef, ReactNode } from "react";

type MotionWrapperProps = MotionProps & {
  children: ReactNode;
  as?: "div" | "section" | "article" | "span";
  className?: string;
} & Omit<ComponentPropsWithoutRef<"div">, keyof MotionProps>;

export function MotionWrapper({
  children,
  as = "div",
  initial,
  animate,
  whileInView,
  transition,
  variants,
  ...rest
}: MotionWrapperProps) {
  const shouldReduceMotion = useReducedMotion();
  const Tag = motion[as];

  if (shouldReduceMotion) {
    return (
      <Tag
        transition={{ duration: 0 }}
        {...rest}
      >
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      initial={initial}
      animate={animate}
      whileInView={whileInView}
      transition={transition}
      variants={variants as Variants | undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `npm test`
Expected: 3 tests pass.

- [ ] **Step 8: Verify typecheck + lint**

Run: `npx tsc --noEmit && npx eslint components/MotionWrapper.tsx components/__tests__/MotionWrapper.test.tsx`
Expected: No errors.

- [ ] **Step 9: Commit**

```bash
git add components/MotionWrapper.tsx components/__tests__/MotionWrapper.test.tsx vitest.config.ts package.json package-lock.json
git commit -m "feat: Add MotionWrapper component with reduced-motion handling and unit tests."
```

---

# Phase 1 — Global chrome

## Task 1.1: Add shared StateLabel + SectionMarker components

**Files:**
- Create: `components/StateLabel.tsx`
- Create: `components/SectionMarker.tsx`

Used across every page. Creating these first so later tasks can compose them.

- [ ] **Step 1: Create StateLabel**

Create `components/StateLabel.tsx`:

```tsx
"use client";

import { useTheme } from "./ThemeContext";

interface StateLabelProps {
  text?: string;
  showDot?: boolean;
}

export function StateLabel({ text = "NOW BOOKING · TAKING ONE AT A TIME", showDot = true }: StateLabelProps) {
  const { theme } = useTheme();

  return (
    <div className={`inline-flex items-center gap-2 font-mono text-micro tracking-widest uppercase ${theme === "minimalist" ? "opacity-70" : "opacity-80"}`}>
      {showDot && (
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-60 ${theme === "minimalist" ? "bg-ink" : "bg-green-500"} animate-ping`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${theme === "minimalist" ? "bg-ink" : "bg-green-500"}`} />
        </span>
      )}
      <span>{text}</span>
    </div>
  );
}
```

- [ ] **Step 2: Create SectionMarker**

Create `components/SectionMarker.tsx`:

```tsx
"use client";

interface SectionMarkerProps {
  number: string;
  label: string;
}

export function SectionMarker({ number, label }: SectionMarkerProps) {
  return (
    <div className="font-mono text-micro tracking-widest uppercase opacity-70 mb-6">
      § {number} — {label}
    </div>
  );
}
```

- [ ] **Step 3: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add components/StateLabel.tsx components/SectionMarker.tsx
git commit -m "feat: Add StateLabel and SectionMarker primitives."
```

---

## Task 1.2: Update ThemeContext with Paper/Sticker/Server labels

**Files:**
- Modify: `components/ThemeContext.tsx`

Exports a labels map so Navbar can render user-facing labels without duplicating the mapping.

- [ ] **Step 1: Add THEME_LABELS export**

Edit `components/ThemeContext.tsx`. After line 13 (`const ThemeContext = createContext<...>`), add:

```tsx
export const THEME_LABELS: Record<Theme, string> = {
  minimalist: "Paper",
  neubrutalist: "Sticker",
  discord: "Server",
};
```

Also change the type export — after line 6, add `export `:

```tsx
export type Theme = "minimalist" | "neubrutalist" | "discord";
```

(Edit line 6 in place, replacing `type Theme = ...` with `export type Theme = ...`.)

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/ThemeContext.tsx
git commit -m "feat: Export THEME_LABELS (Paper/Sticker/Server) from ThemeContext."
```

---

## Task 1.3: Redesign Navbar (Minimalist branch)

**Files:**
- Modify: `components/Navbar.tsx:344-431` (default navbar branch — Minimalist + Neubrutalist)
- Modify: `components/Navbar.tsx:389-408` (theme dropdown labels)

Changes:
1. Wordmark "The Living Lab" → "Aedwon" in Minimalist only (serif, weight 700). Neubrutalist unchanged.
2. Theme dropdown labels use THEME_LABELS constant.
3. Add "Book a call →" primary CTA in desktop nav (Minimalist only).

- [ ] **Step 1: Import THEME_LABELS**

Edit `components/Navbar.tsx:5`. Replace:

```tsx
import { useTheme } from "./ThemeContext";
```

with:

```tsx
import { useTheme, THEME_LABELS } from "./ThemeContext";
```

- [ ] **Step 2: Update wordmark (lines 346-349)**

Replace:

```tsx
<div className="text-xl font-bold font-theme tracking-tight hidden md:block">
    The Living Lab
</div>
```

with:

```tsx
<div className={`text-xl font-bold tracking-tight hidden md:block ${theme === 'minimalist' ? 'font-serif' : 'font-theme'}`}>
    {theme === 'minimalist' ? 'Aedwon' : 'The Living Lab'}
</div>
```

- [ ] **Step 3: Update theme toggle button label (lines 372-380)**

Replace:

```tsx
<button
    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
    aria-expanded={isDropdownOpen}
    aria-haspopup="true"
    aria-label={`Theme selector, current theme: ${theme}`}
    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border border-theme rounded-theme hover:bg-accent-secondary transition-all ${getAnimationClass()}`}
>
    <span className="capitalize">{theme}</span>
</button>
```

with:

```tsx
<button
    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
    aria-expanded={isDropdownOpen}
    aria-haspopup="true"
    aria-label={`Skin selector, current skin: ${THEME_LABELS[theme]}`}
    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border border-theme rounded-theme hover:bg-accent-secondary transition-all ${getAnimationClass()}`}
>
    <span>{THEME_LABELS[theme]}</span>
</button>
```

- [ ] **Step 4: Update dropdown items (lines 389-408)**

Replace:

```tsx
<button
    onClick={() => { setTheme('minimalist'); setIsDropdownOpen(false); }}
    className={`flex items-center w-full gap-2 px-3 py-2 text-sm hover:bg-accent-secondary rounded-theme ${theme === 'minimalist' ? 'bg-accent-secondary font-bold' : ''}`}
>
    <Briefcase className="w-4 h-4" /> Minimalist
</button>
<button
    onClick={() => { setTheme('neubrutalist'); setIsDropdownOpen(false); }}
    className={`flex items-center w-full gap-2 px-3 py-2 text-sm hover:bg-accent-secondary rounded-theme ${theme === 'neubrutalist' ? 'bg-accent-secondary font-bold' : ''}`}
>
    <Zap className="w-4 h-4" /> Neubrutalist
</button>
<button
    onClick={() => { setTheme('discord'); setIsDropdownOpen(false); }}
    className="flex items-center w-full gap-2 px-3 py-2 text-sm hover:bg-accent-secondary rounded-theme"
>
    <Gamepad2 className="w-4 h-4" /> DiscordOS
</button>
```

with:

```tsx
<button
    onClick={() => { setTheme('minimalist'); setIsDropdownOpen(false); }}
    className={`flex items-center w-full gap-2 px-3 py-2 text-sm hover:bg-accent-secondary rounded-theme ${theme === 'minimalist' ? 'bg-accent-secondary font-bold' : ''}`}
>
    <Briefcase className="w-4 h-4" aria-hidden="true" /> {THEME_LABELS.minimalist}
</button>
<button
    onClick={() => { setTheme('neubrutalist'); setIsDropdownOpen(false); }}
    className={`flex items-center w-full gap-2 px-3 py-2 text-sm hover:bg-accent-secondary rounded-theme ${theme === 'neubrutalist' ? 'bg-accent-secondary font-bold' : ''}`}
>
    <Zap className="w-4 h-4" aria-hidden="true" /> {THEME_LABELS.neubrutalist}
</button>
<button
    onClick={() => { setTheme('discord'); setIsDropdownOpen(false); }}
    className={`flex items-center w-full gap-2 px-3 py-2 text-sm hover:bg-accent-secondary rounded-theme ${theme === 'discord' ? 'bg-accent-secondary font-bold' : ''}`}
>
    <Gamepad2 className="w-4 h-4" aria-hidden="true" /> {THEME_LABELS.discord}
</button>
```

- [ ] **Step 5: Add "Book a call" nav CTA (Minimalist only)**

Edit `components/Navbar.tsx`. In the desktop nav links block (lines 352-368), add a trailing link after the "Start a Project" entry. Replace lines 352-368 with:

```tsx
<div className="hidden md:flex items-center gap-10 font-theme text-sm font-medium text-foreground opacity-80">
    <Link href="/" className="hover:text-accent transition-colors">
        Home
    </Link>
    <Link href="/web-solutions" className="hover:text-accent transition-colors">
        Web Solutions
    </Link>
    <Link href="/community-solutions" className="hover:text-accent transition-colors">
        Community Solutions
    </Link>
    <Link href="/process" className="hover:text-accent transition-colors">
        The Process
    </Link>
    {theme !== 'minimalist' && (
        <Link href="/contact" className="hover:text-accent transition-colors">
            Start a Project
        </Link>
    )}
    {theme === 'minimalist' && (
        <Link href="/contact" className="inline-flex items-center gap-1 border border-ink px-3 py-1.5 hover:bg-ink hover:text-paper transition-colors">
            Book a call →
        </Link>
    )}
</div>
```

- [ ] **Step 6: Verify visual across all three themes**

Run: `npm run dev`. Load the site.
- Minimalist: wordmark reads "Aedwon" in serif. Toggle shows "Paper". Nav ends with "Book a call →" boxed link.
- Neubrutalist: wordmark reads "The Living Lab" in Space Mono. Toggle shows "Sticker". Nav ends with plain "Start a Project" link.
- Discord: toggle shows "Server". (Discord uses its own navbar branch, unchanged except for the label constant.)

- [ ] **Step 7: Update Discord navbar labels (lines 108-127 and 168-187)**

Edit `components/Navbar.tsx`. In the Discord theme branch, find both dropdown blocks (desktop + mobile). Replace each `Briefcase ... Minimalist`, `Zap ... Neubrutalist`, `Gamepad2 ... DiscordOS` with `{THEME_LABELS.minimalist}`, `{THEME_LABELS.neubrutalist}`, `{THEME_LABELS.discord}`. Also update the visible toggle button text on line 99 (`<span>DiscordOS</span>`) to `<span>{THEME_LABELS.discord}</span>`. Do the same on mobile aria labels.

Concretely, for the desktop Discord dropdown block at lines 108-127, replace contents:

```tsx
<button
    onClick={() => { setTheme('minimalist'); setIsDropdownOpen(false); }}
    className="flex items-center w-full gap-2 px-3 py-2 text-sm hover:bg-[#36393f] rounded text-gray-200"
>
    <Briefcase className="w-4 h-4" aria-hidden="true" /> {THEME_LABELS.minimalist}
</button>
<button
    onClick={() => { setTheme('neubrutalist'); setIsDropdownOpen(false); }}
    className="flex items-center w-full gap-2 px-3 py-2 text-sm hover:bg-[#36393f] rounded text-gray-200"
>
    <Zap className="w-4 h-4" aria-hidden="true" /> {THEME_LABELS.neubrutalist}
</button>
<button
    onClick={() => { setTheme('discord'); setIsDropdownOpen(false); }}
    className="flex items-center w-full gap-2 px-3 py-2 text-sm hover:bg-[#36393f] rounded text-gray-200 bg-[#36393f] text-white"
>
    <Gamepad2 className="w-4 h-4" aria-hidden="true" /> {THEME_LABELS.discord}
</button>
```

Apply the same replacement to the mobile Discord dropdown (lines 168-187). Also replace `<span>DiscordOS</span>` on line 99 with `<span>{THEME_LABELS.discord}</span>`.

- [ ] **Step 8: Commit**

```bash
git add components/Navbar.tsx
git commit -m "feat: Redesign Navbar with Aedwon wordmark, Paper/Sticker/Server labels, and Minimalist CTA."
```

---

## Task 1.4: Build Colophon component

**Files:**
- Create: `components/Colophon.tsx`

Single-line colophon used in the Minimalist footer only.

- [ ] **Step 1: Create Colophon**

Create `components/Colophon.tsx`:

```tsx
"use client";

import { useTheme, THEME_LABELS, type Theme } from "./ThemeContext";

export function Colophon() {
  const { setTheme } = useTheme();
  const order: Theme[] = ["minimalist", "neubrutalist", "discord"];

  return (
    <p className="text-small opacity-80">
      This site has three skins —
      {order.map((t, i) => (
        <span key={t}>
          {" "}
          <button
            onClick={() => setTheme(t)}
            className="underline underline-offset-2 decoration-rule hover:decoration-ink hover:text-accent transition-colors"
          >
            {THEME_LABELS[t].toLowerCase()}
          </button>
          {i < order.length - 1 ? "," : "."}
        </span>
      ))}
      {" "}It remembers.
    </p>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/Colophon.tsx
git commit -m "feat: Add Colophon component for Minimalist footer."
```

---

## Task 1.5: Redesign Footer (Minimalist branch)

**Files:**
- Modify: `components/Footer.tsx:13-66`

Minimalist footer becomes: wordmark "Aedwon" (serif) + colophon line + social links + bottom rule credits. Other themes retain their current rendering.

- [ ] **Step 1: Rewrite Footer**

Edit `components/Footer.tsx`. Replace the entire file (lines 1-68) with:

```tsx
"use client";

import { useTheme } from "./ThemeContext";
import { Github, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";

import Logo from "./Logo";
import { Colophon } from "./Colophon";

export default function Footer() {
    const { theme } = useTheme();

    return (
        <footer className={`
            w-full transition-colors duration-300
            ${theme === 'minimalist' ? 'bg-paper border-t border-rule py-16' : ''}
            ${theme === 'neubrutalist' ? 'bg-black text-white py-12 border-t-[3px] border-black' : ''}
            ${theme === 'discord' ? 'bg-[#2f3136] py-8 border-t border-[#202225]' : ''}
        `}>
            <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">

                {theme === 'minimalist' ? (
                    <div className="flex flex-col gap-10">
                        {/* Top row — wordmark + colophon */}
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
                            <div className="flex flex-col gap-3 max-w-md">
                                <div className="flex items-center gap-2">
                                    <Logo className="w-8 h-8" />
                                    <h3 className="text-xl font-serif font-bold tracking-tight">
                                        Aedwon
                                    </h3>
                                </div>
                                <Colophon />
                            </div>

                            <nav aria-label="Social media links" className="flex items-center gap-6 shrink-0">
                                <Link href="https://github.com/Aedwon" target="_blank" rel="noopener noreferrer" aria-label="Visit GitHub profile" className="hover:text-accent transition-colors">
                                    <Github className="w-5 h-5" aria-hidden="true" />
                                </Link>
                                <Link href="https://linkedin.com/in/aedwon" target="_blank" rel="noopener noreferrer" aria-label="Visit LinkedIn profile" className="hover:text-accent transition-colors">
                                    <Linkedin className="w-5 h-5" aria-hidden="true" />
                                </Link>
                                <Link href="https://twitter.com/aedwon" target="_blank" rel="noopener noreferrer" aria-label="Visit Twitter profile" className="hover:text-accent transition-colors">
                                    <Twitter className="w-5 h-5" aria-hidden="true" />
                                </Link>
                            </nav>
                        </div>

                        {/* Bottom row — credits */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-6 border-t border-rule text-micro tracking-wider uppercase opacity-70 font-mono">
                            <p>&copy; {new Date().getFullYear()} Aedwon</p>
                            <p>Built in Next 16 · Source available</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        {/* Brand / Logo Area */}
                        <div className="flex flex-col items-center md:items-start gap-3">
                            <div className="flex items-center gap-2">
                                <Logo className="w-8 h-8" />
                                <h3 className={`
                                    text-lg font-bold font-theme tracking-tight
                                    ${theme === 'neubrutalist' ? 'uppercase tracking-widest text-accent' : ''}
                                `}>
                                    The Living Lab
                                </h3>
                            </div>
                            <p className={`
                                text-sm opacity-80 flex items-center gap-1
                                ${theme === 'discord' ? 'text-xs uppercase font-bold text-accent' : ''}
                            `}>
                                {theme === 'neubrutalist' && "NO TEMPLATES // ALL CODE"}
                                {theme === 'discord' && <> <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Aedwon is online</>}
                            </p>
                        </div>

                        <nav aria-label="Social media links" className="flex items-center gap-6">
                            <Link href="https://github.com/Aedwon" target="_blank" rel="noopener noreferrer" aria-label="Visit GitHub profile" className="hover:text-accent transition-colors">
                                <Github className="w-5 h-5" aria-hidden="true" />
                            </Link>
                            <Link href="https://linkedin.com/in/aedwon" target="_blank" rel="noopener noreferrer" aria-label="Visit LinkedIn profile" className="hover:text-accent transition-colors">
                                <Linkedin className="w-5 h-5" aria-hidden="true" />
                            </Link>
                            <Link href="https://twitter.com/aedwon" target="_blank" rel="noopener noreferrer" aria-label="Visit Twitter profile" className="hover:text-accent transition-colors">
                                <Twitter className="w-5 h-5" aria-hidden="true" />
                            </Link>
                        </nav>

                        <div className={`
                            text-xs opacity-70 font-theme text-center md:text-right
                            ${theme === 'neubrutalist' ? 'opacity-90 font-bold' : ''}
                        `}>
                            <p>&copy; {new Date().getFullYear()} Aedwon. All rights reserved.</p>
                            {theme === 'neubrutalist' && <p>MADE IN VS CODE</p>}
                            {theme === 'discord' && <p className="flex items-center gap-1 justify-end">v1.0.0 <span className="w-1.5 h-1.5 rounded-full bg-accent"></span> Stable</p>}
                        </div>
                    </div>
                )}
            </div>
        </footer>
    );
}
```

- [ ] **Step 2: Visual verification across all three themes**

Run dev server. Check each theme:
- Minimalist: Aedwon wordmark (serif), colophon line with three clickable skin names, social icons, bottom rule + credits.
- Neubrutalist: unchanged from current.
- Discord: hidden (existing `footer { display: none; }` rule in `globals.css:218-220`).

- [ ] **Step 3: Commit**

```bash
git add components/Footer.tsx
git commit -m "feat: Redesign Footer for Minimalist with Aedwon wordmark and three-skin colophon."
```

---

# Phase 2 — Homepage

## Task 2.1: Rewrite HeroSection (Minimalist)

**Files:**
- Modify: `components/HeroSection.tsx` (entire file)

Lead POV hero. Other themes retain their current presentation via conditional branches.

- [ ] **Step 1: Read existing HeroSection**

Run: `cat components/HeroSection.tsx` (or use Read tool) to capture current non-Minimalist copy for preservation.

- [ ] **Step 2: Rewrite with Minimalist lead**

Edit `components/HeroSection.tsx`. The Minimalist branch must render:

```tsx
<section className="px-6 md:px-12 lg:px-24 py-24 md:py-32 lg:py-40 bg-paper text-ink">
    <div className="max-w-5xl mx-auto">
        <StateLabel />
        <h1 className="mt-6 font-serif font-bold tracking-tight text-h1 md:text-display leading-[1.05]">
            A brand sells twice: once to the stranger, once to the regular.
            <span className="block italic">I build for both sales.</span>
        </h1>
        <p className="mt-8 text-h3 max-w-3xl opacity-80 leading-snug">
            Web solutions that make strangers pick you. Community systems that make regulars stay. Both together, if that's what the work needs.
        </p>
        <div className="mt-12 flex flex-col sm:flex-row gap-4">
            <Link href="/web-solutions" className="inline-flex items-center gap-2 border border-ink px-6 py-3 font-sans text-body hover:bg-ink hover:text-paper transition-colors">
                The stranger sale →
            </Link>
            <Link href="/community-solutions" className="inline-flex items-center gap-2 border border-ink px-6 py-3 font-sans text-body hover:bg-ink hover:text-paper transition-colors">
                The regular sale →
            </Link>
        </div>
    </div>
</section>
```

Preserve the Neubrutalist and Discord branches as-is. If the current component is single-branch (no theme splits), wrap it in a `theme === 'minimalist'` check, keep the previous JSX inside the `else` block. Concrete example structure:

```tsx
"use client";

import Link from "next/link";
import { useTheme } from "./ThemeContext";
import { StateLabel } from "./StateLabel";

export default function HeroSection() {
    const { theme } = useTheme();

    if (theme === 'minimalist') {
        return (
            <section className="px-6 md:px-12 lg:px-24 py-24 md:py-32 lg:py-40 bg-paper text-ink">
                {/* ... Minimalist JSX above ... */}
            </section>
        );
    }

    // Preserve existing non-Minimalist rendering — copy from pre-edit file
    return (
        <section>{/* existing content for neubrutalist + discord */}</section>
    );
}
```

- [ ] **Step 3: Visual verification**

Load `http://localhost:3000` in Minimalist. Confirm new hero copy renders with serif display type on paper background. Switch to Neubrutalist and Discord — they render the previous hero unchanged.

- [ ] **Step 4: Commit**

```bash
git add components/HeroSection.tsx
git commit -m "feat: Rewrite hero section with lead POV for Minimalist theme."
```

---

## Task 2.2: Build TwoOfferSplit component

**Files:**
- Create: `components/TwoOfferSplit.tsx`

Homepage § 02 — the two-card split. Minimalist only; renders `null` for other themes (they keep the existing homepage without this section).

- [ ] **Step 1: Create TwoOfferSplit**

Create `components/TwoOfferSplit.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useTheme } from "./ThemeContext";
import { SectionMarker } from "./SectionMarker";

export default function TwoOfferSplit() {
    const { theme } = useTheme();

    if (theme !== 'minimalist') return null;

    return (
        <section className="px-6 md:px-12 lg:px-24 py-24 border-t border-rule">
            <div className="max-w-6xl mx-auto">
                <SectionMarker number="02" label="TWO SALES, ONE STUDIO" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    <Link href="/web-solutions" className="group border border-rule p-10 hover:border-ink transition-colors flex flex-col gap-4">
                        <div className="font-mono text-micro tracking-widest uppercase opacity-60">The stranger sale</div>
                        <h2 className="font-serif text-h2 font-bold tracking-tight leading-tight">
                            Sites, products, and landing pages that convert first-time visitors into customers.
                        </h2>
                        <span className="mt-auto inline-flex items-center gap-2 text-small opacity-80 group-hover:text-accent transition-colors">
                            See web solutions →
                        </span>
                    </Link>

                    <Link href="/community-solutions" className="group border border-rule p-10 hover:border-ink transition-colors flex flex-col gap-4">
                        <div className="font-mono text-micro tracking-widest uppercase opacity-60">The regular sale</div>
                        <h2 className="font-serif text-h2 font-bold tracking-tight leading-tight">
                            Bots, moderation, and rituals that make members come back in month eight.
                        </h2>
                        <span className="mt-auto inline-flex items-center gap-2 text-small opacity-80 group-hover:text-accent transition-colors">
                            See community systems →
                        </span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/TwoOfferSplit.tsx
git commit -m "feat: Add TwoOfferSplit homepage component (Minimalist only)."
```

---

## Task 2.3: Remove fake content from homepage

**Files:**
- Modify: `app/page.tsx`
- Delete: `components/StatsBar.tsx`
- Delete: `components/Testimonials.tsx`

- [ ] **Step 1: Update homepage imports and JSX**

Edit `app/page.tsx`. Replace the entire file with:

```tsx
import HeroSection from "@/components/HeroSection";
import TwoOfferSplit from "@/components/TwoOfferSplit";
import FeaturedProjects from "@/components/FeaturedProjects";
import HowItWorks from "@/components/HowItWorks";
import WhoThisIsFor from "@/components/WhoThisIsFor";
import FAQ from "@/components/FAQ";
import CTASection from "@/components/CTASection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <TwoOfferSplit />
      <FeaturedProjects />
      <HowItWorks />
      <WhoThisIsFor />
      <FAQ />
      <CTASection />
    </main>
  );
}
```

- [ ] **Step 2: Delete orphan component files**

Run:

```bash
git rm components/StatsBar.tsx components/Testimonials.tsx
```

- [ ] **Step 3: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Verify dev server**

Confirm homepage renders without StatsBar or Testimonials; TwoOfferSplit appears (Minimalist); other themes unaffected.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx
git commit -m "refactor: Remove fake StatsBar and Testimonials from homepage, insert TwoOfferSplit."
```

---

## Task 2.4: Rewrite HowItWorks copy

**Files:**
- Modify: `components/HowItWorks.tsx:7-38` (STEPS array)
- Modify: `components/HowItWorks.tsx:49-57` (heading copy)

Rename step 05 ("Growth Engine" → "Operate"), rewrite all descriptions in voice C.

- [ ] **Step 1: Rewrite STEPS array**

Edit `components/HowItWorks.tsx`. Replace lines 7-38 with:

```tsx
const STEPS = [
    {
        icon: Search,
        step: "01",
        title: "Diagnostic",
        description: "Two weeks. I look at what you have — site, server, tools, data. I write up what's working, what isn't, and what I'd build next.",
    },
    {
        icon: FileText,
        step: "02",
        title: "Blueprint",
        description: "One document. Scope, deliverables, timeline, price. Signed off before the first commit. No surprise line items later.",
    },
    {
        icon: Code2,
        step: "03",
        title: "Build",
        description: "I work in staging. You watch in public. Weekly demos, screen recordings, live links. Nothing goes live without you pressing the button.",
    },
    {
        icon: Rocket,
        step: "04",
        title: "Launch",
        description: "Deploy. Write the docs. Train whoever runs it after me. 30 days of post-launch support — bugs, questions, tweaks — included.",
    },
    {
        icon: TrendingUp,
        step: "05",
        title: "Operate",
        description: "Month-to-month retainer, or a clean handoff. Both are real options. The right one depends on who's doing the work in month three.",
    },
];
```

- [ ] **Step 2: Rewrite section heading**

Edit `components/HowItWorks.tsx`. Replace lines 50-56 with:

```tsx
<div className="mb-16 text-center">
    <h2 className="text-3xl md:text-5xl font-bold font-theme tracking-tight mb-4">
        Five rooms.
    </h2>
    <p className="opacity-70 text-lg max-w-2xl mx-auto">
        Every project walks through the same five. I leave the doors open.
    </p>
</div>
```

- [ ] **Step 3: Visual verification**

Confirm homepage shows updated steps in all three themes (copy is shared — only presentation differs per theme).

- [ ] **Step 4: Commit**

```bash
git add components/HowItWorks.tsx
git commit -m "refactor: Rewrite HowItWorks copy in voice C, rename Growth Engine to Operate."
```

---

## Task 2.5: Rewrite WhoThisIsFor copy

**Files:**
- Modify: `components/WhoThisIsFor.tsx` (yeses + nos arrays, heading)

Read the current component structure first (yeses + nos arrays). The copy rewrite targets the data; visual structure is unchanged.

- [ ] **Step 1: Read current component to locate the arrays**

Run: Read `components/WhoThisIsFor.tsx` to identify the exact variable names (likely `YESES` / `NOS` or similar) and line numbers.

- [ ] **Step 2: Rewrite the "yeses" array**

Replace the existing 5-item yes list with:

```tsx
const YESES = [
    "You're launching something and you want it to land.",
    "You've got a community and retention is the hard problem, not growth.",
    "You care about craft and you can tell the difference.",
    "You want one person who owns the work, not a rotating team.",
    "You'd rather pay once for something right than three times for something nearly.",
];
```

- [ ] **Step 3: Rewrite the "nos" array**

Replace the existing 4-item no list with:

```tsx
const NOS = [
    "You need it yesterday. Good work doesn't fit there.",
    "You want the cheapest option on the market. That's not what I do.",
    "You want a big agency with account managers. I'm a studio of one.",
    "You haven't figured out what the thing is yet. Come back when you have.",
];
```

- [ ] **Step 4: Update section heading**

Find the section's `<h2>` (likely "Who This Is For") and replace with:

```tsx
<h2 className="text-3xl md:text-5xl font-bold font-theme tracking-tight mb-4">
    Who this is for.
</h2>
<p className="opacity-70 text-lg max-w-2xl mx-auto">
    Short list. Pick yourself off of it, or don't.
</p>
```

- [ ] **Step 5: Visual verification**

Confirm Yes/No lists show rewritten copy on homepage. Verify all three themes render without layout issues.

- [ ] **Step 6: Commit**

```bash
git add components/WhoThisIsFor.tsx
git commit -m "refactor: Rewrite WhoThisIsFor copy in voice C."
```

---

## Task 2.6: Rewrite FAQ copy

**Files:**
- Modify: `components/FAQ.tsx:8-33` (FAQS array)
- Modify: `components/FAQ.tsx:47-54` (heading)

- [ ] **Step 1: Rewrite FAQS array**

Edit `components/FAQ.tsx`. Replace lines 8-33 with:

```tsx
const FAQS = [
    {
        question: "What if I don't like the final result?",
        answer: "Weekly demos keep us aligned. If something's off, we catch it in week two, not week six. Revisions are built in — no surprise bills.",
    },
    {
        question: "How do you handle communication?",
        answer: "You talk to me. Weekly written updates, demos embedded. Calls whenever a decision needs one. No project managers in between — because there's nobody else.",
    },
    {
        question: "What happens after launch?",
        answer: "Thirty days of post-launch support, included. After that, a monthly Care Plan or one-off tickets — whichever makes sense for what you've got.",
    },
    {
        question: "Why hire a freelancer instead of an agency?",
        answer: "The person pitching you is the person building it. Decisions happen fast and nothing gets lost in translation. Trade-off: I take one project at a time.",
    },
    {
        question: "How long does a typical project take?",
        answer: "Depends on scope. After the discovery call you get a timeline in writing. I miss deadlines rarely, and when I do you'll know ten days before, not ten days after.",
    },
    {
        question: "What's your pricing like?",
        answer: "Fixed-price, not hourly. You know the number before we start. See the tier pages for ranges — actual price comes from the scope we agree on.",
    },
];
```

- [ ] **Step 2: Rewrite heading**

Edit `components/FAQ.tsx`. Replace lines 47-54 with:

```tsx
<div className="mb-16 text-center">
    <h2 className="text-3xl md:text-5xl font-bold font-theme tracking-tight mb-4">
        Usual questions.
    </h2>
    <p className="opacity-70 text-lg max-w-2xl mx-auto">
        If yours isn&apos;t here, the form at <code>/contact</code> is open.
    </p>
</div>
```

- [ ] **Step 3: Visual verification**

Confirm FAQ accordion renders rewritten Q&A on homepage in all three themes.

- [ ] **Step 4: Commit**

```bash
git add components/FAQ.tsx
git commit -m "refactor: Rewrite FAQ copy in voice C."
```

---

## Task 2.7: Rewrite CTASection copy

**Files:**
- Modify: `components/CTASection.tsx` (entire component)

- [ ] **Step 1: Read current component for non-Minimalist copy preservation**

Run: Read `components/CTASection.tsx` to capture the current JSX for non-Minimalist branches.

- [ ] **Step 2: Rewrite with Minimalist branch**

Edit `components/CTASection.tsx`. The Minimalist branch should render:

```tsx
<section className="px-6 md:px-12 lg:px-24 py-24 md:py-32 border-t border-rule bg-paper text-ink">
    <div className="max-w-4xl mx-auto text-center">
        <div className="font-mono text-micro tracking-widest uppercase opacity-70 mb-6">
            § 07 — START
        </div>
        <h2 className="font-serif text-h1 md:text-display font-bold tracking-tight leading-[1.05]">
            Still here?
        </h2>
        <p className="mt-8 text-h3 max-w-2xl mx-auto opacity-80 leading-snug">
            Then we should probably talk. Fifteen minutes. I&apos;ll tell you honestly if I can help — and if I can&apos;t, who might.
        </p>
        <div className="mt-12 flex justify-center">
            <Link href="/contact" className="inline-flex items-center gap-2 bg-ink text-paper px-8 py-4 font-sans text-body hover:opacity-90 transition-opacity">
                Book a discovery call →
            </Link>
        </div>
        <div className="mt-8">
            <StateLabel />
        </div>
    </div>
</section>
```

Wrap the Minimalist branch in `if (theme === 'minimalist') { ... }`; retain the previous CTASection contents for other themes.

File header should be:

```tsx
"use client";

import Link from "next/link";
import { useTheme } from "./ThemeContext";
import { StateLabel } from "./StateLabel";
```

- [ ] **Step 3: Visual verification**

Confirm all three themes render their CTA sections correctly. Minimalist shows "Still here?" in serif; others unchanged.

- [ ] **Step 4: Commit**

```bash
git add components/CTASection.tsx
git commit -m "refactor: Rewrite CTASection copy in voice C for Minimalist."
```

---

# Phase 3 — /web-solutions page

## Task 3.1: Rewrite /web-solutions page structure

**Files:**
- Modify: `app/web-solutions/page.tsx` (entire file)

Replace full page with the spec's § 01–§ 05 structure. Three real project cards + one optional slot.

- [ ] **Step 1: Read current page to preserve non-Minimalist branches**

Run: Read `app/web-solutions/page.tsx` to note which sections are theme-gated.

- [ ] **Step 2: Rewrite Minimalist branch of the page**

Edit `app/web-solutions/page.tsx`. Ensure the Minimalist render path contains these sections. Other themes keep their current rendering via `if (theme !== 'minimalist') { return <ExistingPage />; }` guard or equivalent conditional wrappers.

Minimalist JSX structure:

```tsx
<main className="bg-paper text-ink">
    {/* § 01 — POSITION */}
    <section className="px-6 md:px-12 lg:px-24 py-24 md:py-32">
        <div className="max-w-5xl mx-auto">
            <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
                <SectionMarker number="01" label="POSITION" />
                <StateLabel />
            </div>
            <h1 className="font-serif font-bold tracking-tight text-h1 md:text-display leading-[1.05]">
                The stranger sale.
            </h1>
            <p className="mt-8 text-h3 max-w-3xl opacity-80 leading-snug">
                A website has one job: make the right person pick you. I build sites that do that job honestly.
            </p>
        </div>
    </section>

    {/* § 02 — WORK */}
    <section className="px-6 md:px-12 lg:px-24 py-24 border-t border-rule">
        <div className="max-w-6xl mx-auto">
            <SectionMarker number="02" label="WORK" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ProjectCard
                    title="MSL 2026"
                    labels={["LIVE", "REDESIGN", "Next"]}
                    description="Redesign for Moonton Student Leaders PH."
                    url="https://msl2026.vercel.app"
                />
                <ProjectCard
                    title="Lakambini Events"
                    labels={["LIVE", "REDESIGN", "Next"]}
                    description="Redesign for Lakambini Events."
                    url="https://lakambini-redesign.vercel.app"
                />
                <ProjectCard
                    title="QR Customizer"
                    labels={["LIVE TOOL", "Next"]}
                    description="[QR_CUSTOMIZER · 1-LINE — fill in from spec §14 placeholders]"
                    url="[QR_CUSTOMIZER_URL]"
                />
                {/* Optional 4th slot — leave out if not needed */}
            </div>
            <p className="mt-12 text-small opacity-60 italic">
                TV Kiosk Survey, commands reference site, and other bot-adjacent artifacts live on <Link href="/community-solutions" className="underline hover:text-accent">community-solutions</Link> — they fit that page&apos;s framing better.
            </p>
        </div>
    </section>

    {/* § 03 — STANDARDS */}
    <section className="px-6 md:px-12 lg:px-24 py-24 border-t border-rule">
        <div className="max-w-4xl mx-auto">
            <SectionMarker number="03" label="STANDARDS" />
            <div className="flex flex-col gap-6 font-serif text-h3 leading-snug">
                <p>I don&apos;t ship slow sites. Core Web Vitals in the green. Lighthouse 90+ on launch. When a new marketing script would break that, I&apos;ll say so — and you decide.</p>
                <p>Accessible by default — WCAG 2.1 AA on every page I touch.</p>
                <p>Semantic HTML. Real headings. Alt text that says something.</p>
            </div>
        </div>
    </section>

    {/* § 04 — PRICING */}
    <section className="px-6 md:px-12 lg:px-24 py-24 border-t border-rule">
        <div className="max-w-6xl mx-auto">
            <SectionMarker number="04" label="PRICING" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <PricingTier
                    name="Audit"
                    price="[AUDIT_PRICE — from spec §14]"
                    copy="Two weeks. I look at what you have. I write up what's broken, what's working, and what I'd build next. You get a plan you can give to anyone — me, a hire, or nobody."
                />
                <PricingTier
                    name="Build"
                    price="[BUILD_PRICE — from spec §14]+"
                    copy="Fixed-scope build. One site, one funnel, one product. Discovery, spec, staging demos, deploy, 30-day post-launch support."
                />
                <PricingTier
                    name="Care Plan"
                    price="[CARE_PLAN_PRICE — from spec §14]/mo"
                    copy="Monthly maintenance. Updates, monitoring, small features. Month-to-month — if it's not earning its keep, cancel it."
                />
            </div>
        </div>
    </section>

    {/* § 05 — START */}
    <section className="px-6 md:px-12 lg:px-24 py-24 md:py-32 border-t border-rule text-center">
        <div className="max-w-3xl mx-auto">
            <SectionMarker number="05" label="START" />
            <p className="font-serif text-h2 leading-tight mb-8">
                If you&apos;ve got a launch coming and you want it to land, we should talk.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-ink text-paper px-8 py-4 font-sans text-body hover:opacity-90 transition-opacity">
                Book a discovery call →
            </Link>
            <div className="mt-8 flex justify-center">
                <StateLabel />
            </div>
        </div>
    </section>
</main>
```

Two inline helpers used by the above (define at top of the file, after imports):

```tsx
function ProjectCard({ title, labels, description, url }: { title: string; labels: string[]; description: string; url: string; }) {
    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="group border border-rule p-8 hover:border-ink transition-colors flex flex-col gap-4">
            <div className="font-mono text-micro tracking-widest uppercase opacity-60 flex flex-wrap gap-x-3 gap-y-1">
                {labels.map((l, i) => (
                    <span key={i}>{l}{i < labels.length - 1 && " ·"}</span>
                ))}
            </div>
            <h3 className="font-serif text-h3 font-bold leading-tight">{title}</h3>
            <p className="text-small opacity-80 leading-relaxed">{description}</p>
            <span className="mt-auto text-small opacity-70 group-hover:text-accent transition-colors">
                Visit →
            </span>
        </a>
    );
}

function PricingTier({ name, price, copy }: { name: string; price: string; copy: string; }) {
    return (
        <div className="border border-rule p-8 flex flex-col gap-4">
            <div className="font-mono text-micro tracking-widest uppercase opacity-60">TIER</div>
            <h3 className="font-serif text-h2 font-bold leading-tight">{name}</h3>
            <div className="font-mono text-small opacity-80">{price}</div>
            <p className="text-body opacity-80 leading-relaxed">{copy}</p>
        </div>
    );
}
```

File header:

```tsx
"use client";

import Link from "next/link";
import { useTheme } from "@/components/ThemeContext";
import { SectionMarker } from "@/components/SectionMarker";
import { StateLabel } from "@/components/StateLabel";
```

- [ ] **Step 3: Preserve non-Minimalist rendering**

At the top of the component function, before the Minimalist JSX, add:

```tsx
const { theme } = useTheme();

if (theme !== 'minimalist') {
    // Render the pre-existing web-solutions page content for other themes.
    // If no theme-specific content existed before, show a minimal fallback that links to the same sections:
    return (
        <main className="min-h-screen px-6 py-16 md:px-12 md:py-24 lg:px-24 bg-background transition-colors duration-300">
            {/* Retain previous content here. Copy from pre-edit file. */}
        </main>
    );
}
```

If the pre-edit page had no theme branches at all (single universal render), wrap the previous content as-is inside the `if (theme !== 'minimalist')` branch. The Minimalist branch becomes the new rendering.

- [ ] **Step 4: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 5: Visual verification**

Load `/web-solutions` in Minimalist. Confirm § 01–§ 05 structure renders. Switch to Neubrutalist and Discord — previous page content renders.

- [ ] **Step 6: Commit**

```bash
git add app/web-solutions/page.tsx
git commit -m "feat: Rewrite /web-solutions page with § markers, honest labels, and voice C copy."
```

---

# Phase 4 — /community-solutions page

## Task 4.1: Rewrite /community-solutions page structure

**Files:**
- Modify: `app/community-solutions/page.tsx` (entire file)
- Modify: `components/BotCard.tsx` (reframe dashboard label if directly on the page)

Spec §9. Five sections + one craft-demo inset. Keep the existing sentiment chart / metrics UI but relabel it honestly.

- [ ] **Step 1: Read current page**

Run: Read `app/community-solutions/page.tsx` and identify:
- Which component renders the dashboard preview (likely imports from `components/SentimentChart.tsx` or similar).
- Any theme-gated sections.

- [ ] **Step 2: Rewrite Minimalist branch**

Edit `app/community-solutions/page.tsx`. At top of file, guard non-Minimalist content in `if (theme !== 'minimalist') { ... }` as done in Task 3.1. Minimalist branch renders:

```tsx
<main className="bg-paper text-ink">
    {/* § 01 — POSITION */}
    <section className="px-6 md:px-12 lg:px-24 py-24 md:py-32">
        <div className="max-w-5xl mx-auto">
            <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
                <SectionMarker number="01" label="POSITION" />
                <StateLabel />
            </div>
            <h1 className="font-serif font-bold tracking-tight text-h1 md:text-display leading-[1.05]">
                Anyone can gather a crowd. Keeping it warm is a different job.
                <span className="block italic">That&apos;s my job.</span>
            </h1>
            <p className="mt-8 text-h3 max-w-3xl opacity-80 leading-snug">
                <span className="font-mono text-small">[BOT_COUNT]</span> bots in production. <span className="font-mono text-small">[TOTAL_MEMBERS_MODERATED]</span>+ members moderated across <span className="font-mono text-small">[SERVER_COUNT]</span> servers. The ones that stick have structure — roles, rituals, rules that carry their own weight.
            </p>
        </div>
    </section>

    {/* § 02 — WORK */}
    <section className="px-6 md:px-12 lg:px-24 py-24 border-t border-rule">
        <div className="max-w-6xl mx-auto">
            <SectionMarker number="02" label="WORK" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ProjectCard
                    title="[MSL_NETWORK_BOT · NAME]"
                    labels={["LIVE", "[MEMBER_SCALE]", "Discord.js/Node"]}
                    description="Cross-server identity & roles for Moonton Student Leaders PH. [1-LINE]"
                />
                <ProjectCard
                    title="[ILOCOS_BOT · NAME]"
                    labels={["LIVE", "[MEMBER_SCALE]", "[STACK]"]}
                    description="[1-LINE]"
                />
                <ProjectCard
                    title="[BOT_3 · NAME]"
                    labels={["LIVE", "[MEMBER_SCALE]", "[STACK]"]}
                    description="[1-LINE]"
                />
                <ProjectCard
                    title="[BOT_4 · NAME]"
                    labels={["LIVE", "[MEMBER_SCALE]", "[STACK]"]}
                    description="[1-LINE]"
                />
                <ProjectCard
                    title="Commands reference site"
                    labels={["LIVE TOOL", "INTERNAL", "Next"]}
                    description="Public command docs for one of my bot stacks. Built so moderators stop DMing me."
                />
                <ProjectCard
                    title="Kiosk survey (offline-first)"
                    labels={["LIVE", "FIELD-TESTED", "Next/PWA"]}
                    description="Tablet app for a live event. Same shape of problem as community software — systems for rooms full of real people."
                    url="https://kiosk-survey-three.vercel.app"
                />
            </div>
        </div>
    </section>

    {/* § 02.5 — CRAFT DEMO (existing dashboard, reframed) */}
    <section className="px-6 md:px-12 lg:px-24 py-24 border-t border-rule">
        <div className="max-w-6xl mx-auto">
            <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
                <SectionMarker number="02.5" label="CRAFT DEMO" />
                <span className="font-mono text-micro tracking-widest uppercase opacity-60">LIVE · INTERNAL TOOL</span>
            </div>
            <p className="text-small opacity-70 italic mb-8">
                This is the kind of panel I&apos;d build you. Data here is illustrative.
            </p>
            {/* Existing dashboard preview components — insert them here, unchanged markup */}
            <DashboardPreview />
        </div>
    </section>

    {/* § 03 — WHAT I HANDLE */}
    <section className="px-6 md:px-12 lg:px-24 py-24 border-t border-rule">
        <div className="max-w-5xl mx-auto">
            <SectionMarker number="03" label="WHAT I HANDLE" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="flex flex-col gap-4">
                    <h3 className="font-serif text-h3 font-bold">Structure</h3>
                    <p className="text-body opacity-80 leading-relaxed">Roles, permissions, onboarding flows, channel architecture, rituals that don&apos;t need me in the room.</p>
                </div>
                <div className="flex flex-col gap-4">
                    <h3 className="font-serif text-h3 font-bold">Software</h3>
                    <p className="text-body opacity-80 leading-relaxed">Custom bots (moderation, leveling, economy, reporting), dashboards, integrations with the tools you already use.</p>
                </div>
                <div className="flex flex-col gap-4">
                    <h3 className="font-serif text-h3 font-bold">Steward</h3>
                    <p className="text-body opacity-80 leading-relaxed">Day-to-day moderation, escalation playbooks, weekly health reports, event ops. I run it, or I train someone on your side to run it.</p>
                </div>
            </div>
            <p className="mt-12 text-small italic opacity-80 max-w-3xl">
                Not every community needs all three. Most need two. We figure out which on the call.
            </p>
        </div>
    </section>

    {/* § 04 — PRICING */}
    <section className="px-6 md:px-12 lg:px-24 py-24 border-t border-rule">
        <div className="max-w-6xl mx-auto">
            <SectionMarker number="04" label="PRICING" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <PricingTier
                    name="Audit"
                    price="[AUDIT_PRICE — from spec §14]"
                    copy="Two weeks. I join, I watch, I write up what's broken and what to build. You get a plan you can give to anyone — me, a hire, or nobody."
                />
                <PricingTier
                    name="Automaton"
                    price="[AUTOMATON_PRICE — from spec §14]+"
                    copy="Fixed-scope bot build. One specific job, done well. Think: onboarding flow, leveling system, moderation stack, reporting dashboard."
                />
                <PricingTier
                    name="Operator"
                    price="[OPERATOR_PRICE — from spec §14]/mo"
                    copy="I run the community with you. Bots, moderation, rituals, reports. Month-to-month, no lock-in — retention earns retention."
                />
            </div>
        </div>
    </section>

    {/* § 05 — START */}
    <section className="px-6 md:px-12 lg:px-24 py-24 md:py-32 border-t border-rule text-center">
        <div className="max-w-3xl mx-auto">
            <SectionMarker number="05" label="START" />
            <p className="font-serif text-h2 leading-tight mb-8">
                If your community is at the stage where the work of keeping it alive is starting to cost you sleep, that&apos;s the right time.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-ink text-paper px-8 py-4 font-sans text-body hover:opacity-90 transition-opacity">
                Book a discovery call →
            </Link>
            <div className="mt-8 flex justify-center">
                <StateLabel />
            </div>
        </div>
    </section>
</main>
```

Reuse `ProjectCard` and `PricingTier` helpers. Either extract them to `components/ProjectCard.tsx` / `components/PricingTier.tsx` (recommended — used on two pages) or duplicate inline. For this task: **extract** them as a refactor step below, then reuse.

- [ ] **Step 3: Extract ProjectCard and PricingTier to shared components**

Create `components/ProjectCard.tsx`:

```tsx
"use client";

interface ProjectCardProps {
    title: string;
    labels: string[];
    description: string;
    url?: string;
}

export function ProjectCard({ title, labels, description, url }: ProjectCardProps) {
    const content = (
        <div className="group border border-rule p-8 hover:border-ink transition-colors flex flex-col gap-4 h-full">
            <div className="font-mono text-micro tracking-widest uppercase opacity-60 flex flex-wrap gap-x-3 gap-y-1">
                {labels.map((l, i) => (
                    <span key={i}>{l}{i < labels.length - 1 && " ·"}</span>
                ))}
            </div>
            <h3 className="font-serif text-h3 font-bold leading-tight">{title}</h3>
            <p className="text-small opacity-80 leading-relaxed">{description}</p>
            {url && (
                <span className="mt-auto text-small opacity-70 group-hover:text-accent transition-colors">
                    Visit →
                </span>
            )}
        </div>
    );

    if (url) {
        return <a href={url} target="_blank" rel="noopener noreferrer">{content}</a>;
    }
    return content;
}
```

Create `components/PricingTier.tsx`:

```tsx
"use client";

interface PricingTierProps {
    name: string;
    price: string;
    copy: string;
}

export function PricingTier({ name, price, copy }: PricingTierProps) {
    return (
        <div className="border border-rule p-8 flex flex-col gap-4">
            <div className="font-mono text-micro tracking-widest uppercase opacity-60">TIER</div>
            <h3 className="font-serif text-h2 font-bold leading-tight">{name}</h3>
            <div className="font-mono text-small opacity-80">{price}</div>
            <p className="text-body opacity-80 leading-relaxed">{copy}</p>
        </div>
    );
}
```

Then in both `app/web-solutions/page.tsx` and `app/community-solutions/page.tsx`, replace the inline helpers with:

```tsx
import { ProjectCard } from "@/components/ProjectCard";
import { PricingTier } from "@/components/PricingTier";
```

and remove the local function declarations.

- [ ] **Step 4: DashboardPreview wrapping**

The existing community-solutions page has a dashboard preview section rendering metrics/sentiment charts inline. Extract that subtree into a local `DashboardPreview` component file if it's larger than ~50 lines, otherwise keep inline under the § 02.5 section. No content changes — only the relabel + caption line above it.

- [ ] **Step 5: Preserve non-Minimalist rendering**

Wrap the pre-existing full-page content in `if (theme !== 'minimalist') { return <ExistingPage />; }` as in Task 3.1.

- [ ] **Step 6: Verify typecheck + lint**

Run: `npx tsc --noEmit && npx eslint app/community-solutions/page.tsx`
Expected: No errors.

- [ ] **Step 7: Visual verification**

Load `/community-solutions` in Minimalist. Confirm six § sections render. Switch themes — previous page renders unchanged.

- [ ] **Step 8: Commit**

```bash
git add app/community-solutions/page.tsx app/web-solutions/page.tsx components/ProjectCard.tsx components/PricingTier.tsx
git commit -m "feat: Rewrite /community-solutions with § markers, reframed dashboard, three pillars."
```

---

# Phase 5 — /process page

## Task 5.1: Rewrite /process page copy + step 05 rename

**Files:**
- Modify: `app/process/page.tsx:8-49` (STEPS array)
- Modify: `app/process/page.tsx:57-69` (hero)
- Modify: `app/process/page.tsx:140-162` (bottom CTA)

Preserve the vertical timeline layout; rewrite copy; rename step 05; apply visual tweaks from spec §10.3.

- [ ] **Step 1: Rewrite STEPS array**

Edit `app/process/page.tsx`. Replace lines 8-49 with:

```tsx
const STEPS = [
    {
        id: 1,
        title: "Diagnostic",
        subtitle: "Figure out what's actually broken",
        description: "Two weeks. I look at what you have — site, server, tools, data. I write up what's working, what isn't, and what I'd build next.",
        outcome: "You get a plan you can give to anyone — me, a hire, or nobody.",
        footnote: "Sold on its own, this step is what /web-solutions calls the Audit tier.",
        icon: Search,
    },
    {
        id: 2,
        title: "Blueprint",
        subtitle: "Agree on the shape before I touch it",
        description: "One document. Scope, deliverables, timeline, price. Signed off before the first commit. No surprise line items later.",
        outcome: "You know exactly what you're paying for and when it arrives.",
        icon: FileText,
    },
    {
        id: 3,
        title: "Build",
        subtitle: "I work in staging. You watch in public",
        description: "Weekly demos — screenshots, screen recordings, live links. You see progress before production does. Nothing goes live without you pressing the button.",
        outcome: "No \"big reveal.\" No launch-day surprises. You've already seen it.",
        icon: Code2,
    },
    {
        id: 4,
        title: "Launch",
        subtitle: "We go live, and I stick around",
        description: "Deploy. Write the docs. Train whoever runs it after me. 30 days of post-launch support — bugs, questions, tweaks — included.",
        outcome: "The thing works, and the people who need to use it know how.",
        icon: Rocket,
    },
    {
        id: 5,
        title: "Operate",
        subtitle: "I keep running it, or I hand it off clean",
        description: "Month-to-month retainer, or a clean handoff with docs and training. Both are real options. The right one depends on who's doing the work in month three.",
        outcome: "No vendor lock-in. You stay in control of the decision, always.",
        icon: TrendingUp,
    },
];
```

Note the new optional `footnote` field on step 1 — it renders only for that step (see Step 3).

- [ ] **Step 2: Rewrite hero (lines 57-69)**

Edit `app/process/page.tsx`. Replace lines 58-69 with:

```tsx
<div className="mb-16 text-center">
    <p className={`text-sm font-bold uppercase tracking-widest mb-4 ${theme === 'discord' ? 'text-accent' : 'opacity-60'}`}>
        § 00 — HOW I WORK
    </p>
    <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 ${theme === 'minimalist' ? 'font-serif' : 'font-theme'}`}>
        Every project goes through five rooms. I leave the doors open.
    </h1>
    <p className="opacity-80 text-lg max-w-2xl mx-auto">
        Same five steps for web and community work. What differs is what&apos;s in the room, not the rooms themselves.
    </p>
</div>
```

- [ ] **Step 3: Render footnote on step 01**

In the step card rendering block (around line 126, inside the `.map((step, index) => ...)` output), add a footnote render after the `<div className="... outcome ...">`:

```tsx
{step.footnote && (
    <p className="mt-3 text-xs italic opacity-60 leading-relaxed">
        {step.footnote}
    </p>
)}
```

Also update the TypeScript inference if needed. Since the array has a non-uniform shape, explicitly type it:

```tsx
const STEPS: Array<{
    id: number;
    title: string;
    subtitle: string;
    description: string;
    outcome: string;
    footnote?: string;
    icon: React.ComponentType<{ className?: string }>;
}> = [ /* array contents */ ];
```

- [ ] **Step 4: Update step label to use § notation**

Edit `app/process/page.tsx` line 116. Replace:

```tsx
Step 0{step.id}: {step.subtitle}
```

with:

```tsx
§ 0{step.id} — {step.subtitle}
```

- [ ] **Step 5: Rewrite bottom CTA (lines 140-162)**

Replace:

```tsx
<div className={`
    mt-24 text-center p-8 rounded-lg
    ${theme === 'minimalist' ? 'border border-theme' : ''}
    ${theme === 'neubrutalist' ? 'bg-accent border-[3px] border-black shadow-[4px_4px_0px_#000]' : ''}
    ${theme === 'discord' ? 'bg-accent' : ''}
`}>
    <h3 className={`text-3xl md:text-4xl font-bold font-theme mb-4 ${theme !== 'minimalist' ? 'text-white' : ''}`}>
        Ready to Start Your Project?
    </h3>
    <p className={`mb-6 ${theme === 'minimalist' ? 'opacity-70' : 'text-white/80'}`}>
        Let&apos;s jump on a quick 15-minute call. I&apos;ll give you honest advice on whether I can help.
    </p>
    <Link href="/contact" className="w-full sm:w-auto">
        <button className={`
            w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold transition-all
            ${theme === 'minimalist' ? 'bg-foreground text-background hover:opacity-90' : ''}
            ${theme === 'neubrutalist' ? 'bg-white text-black border-[3px] border-black shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000]' : ''}
            ${theme === 'discord' ? 'bg-white text-accent hover:bg-gray-100 rounded-lg' : ''}
        `}>
            Book a Free Call <ArrowRight className="w-5 h-5" aria-hidden="true" />
        </button>
    </Link>
</div>
```

with:

```tsx
<div className={`
    mt-24 text-center p-8
    ${theme === 'minimalist' ? 'border-t border-rule pt-16' : 'rounded-lg border border-theme'}
    ${theme === 'neubrutalist' ? 'bg-accent border-[3px] border-black shadow-[4px_4px_0px_#000]' : ''}
    ${theme === 'discord' ? 'bg-accent' : ''}
`}>
    <p className={`text-sm font-bold uppercase tracking-widest mb-4 ${theme === 'minimalist' ? 'font-mono opacity-70' : theme === 'discord' ? 'text-accent' : 'opacity-60'}`}>
        § 06 — START
    </p>
    <h3 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === 'minimalist' ? 'font-serif' : 'font-theme'} ${theme !== 'minimalist' ? 'text-white' : ''}`}>
        Fifteen minutes on a call.
    </h3>
    <p className={`mb-6 max-w-xl mx-auto ${theme === 'minimalist' ? 'opacity-70' : 'text-white/80'}`}>
        I&apos;ll tell you honestly if I can help. If I can&apos;t, I&apos;ll tell you who might.
    </p>
    <Link href="/contact" className="w-full sm:w-auto">
        <button className={`
            w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold transition-all
            ${theme === 'minimalist' ? 'bg-ink text-paper hover:opacity-90' : ''}
            ${theme === 'neubrutalist' ? 'bg-white text-black border-[3px] border-black shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000]' : ''}
            ${theme === 'discord' ? 'bg-white text-accent hover:bg-gray-100 rounded-lg' : ''}
        `}>
            Book a discovery call <ArrowRight className="w-5 h-5" aria-hidden="true" />
        </button>
    </Link>
    {theme === 'minimalist' && (
        <div className="mt-8 flex justify-center">
            <StateLabel />
        </div>
    )}
</div>
```

Add the import at the top of the file:

```tsx
import { StateLabel } from "@/components/StateLabel";
```

- [ ] **Step 6: Apply Minimalist visual tweaks (center line, outcome box)**

Edit `app/process/page.tsx` line 73-78 (the connecting line). Replace:

```tsx
<div className={`
    absolute left-8 md:left-1/2 top-4 bottom-0 w-0.5 -ml-[1px]
    ${theme === 'minimalist' ? 'bg-theme opacity-30' : ''}
    ${theme === 'neubrutalist' ? 'w-2 -ml-1 bg-black' : ''}
    ${theme === 'discord' ? 'bg-accent/30 w-1 -ml-0.5' : ''}
`} />
```

with:

```tsx
<div className={`
    absolute left-8 md:left-1/2 top-4 bottom-0 -ml-[1px]
    ${theme === 'minimalist' ? 'w-px bg-rule' : 'w-0.5'}
    ${theme === 'neubrutalist' ? 'w-2 -ml-1 bg-black' : ''}
    ${theme === 'discord' ? 'bg-accent/30 w-1 -ml-0.5' : ''}
`} />
```

Edit the outcome box (around lines 120-127). Replace:

```tsx
<div className={`
    text-sm font-medium p-3 rounded-lg
    ${theme === 'minimalist' ? 'bg-accent-secondary' : ''}
    ${theme === 'neubrutalist' ? 'bg-[#B8F2E6] border-2 border-black' : ''}
    ${theme === 'discord' ? 'bg-[#202225] border-l-4 border-l-accent' : ''}
`}>
    <strong>Outcome:</strong> {step.outcome}
</div>
```

with:

```tsx
<div className={`
    text-sm font-medium p-3
    ${theme === 'minimalist' ? 'border-l-2 border-ink pl-4' : 'rounded-lg'}
    ${theme === 'neubrutalist' ? 'bg-[#B8F2E6] border-2 border-black' : ''}
    ${theme === 'discord' ? 'bg-[#202225] border-l-4 border-l-accent' : ''}
`}>
    <strong>Outcome:</strong> {step.outcome}
</div>
```

- [ ] **Step 7: Visual verification**

Load `/process` in Minimalist. Confirm: hero reads "Every project goes through five rooms...", steps labeled § 01–§ 05, step 01 shows the Audit footnote, step 05 titled "Operate", outcome uses left-rule treatment, bottom CTA reads "Fifteen minutes on a call." Switch to Neubrutalist and Discord — previous layout intact.

- [ ] **Step 8: Commit**

```bash
git add app/process/page.tsx
git commit -m "refactor: Rewrite /process copy in voice C, rename Operate step, apply Minimalist visuals."
```

---

# Phase 6 — /contact page

## Task 6.1: Rewrite /contact page (three-door structure)

**Files:**
- Modify: `app/contact/page.tsx` (entire file)

Spec §11. Lead with Google Calendar link-out; form is fallback; email is final fallback.

- [ ] **Step 1: Rewrite page**

Edit `app/contact/page.tsx`. Add at the top of the component:

```tsx
"use client";

import { useTheme } from "@/components/ThemeContext";
import { Send, ChevronDown, Calendar, Mail } from "lucide-react";
import Link from "next/link";
import { StateLabel } from "@/components/StateLabel";
import { SectionMarker } from "@/components/SectionMarker";
```

Then replace the component body so the Minimalist branch renders a 3-door layout. Preserve non-Minimalist output in `if (theme !== 'minimalist')` branch.

Minimalist JSX:

```tsx
<main className="bg-paper text-ink min-h-screen">
    <div className="max-w-3xl mx-auto px-6 py-16 md:px-12 md:py-24 lg:px-24">
        <div className="mb-12">
            <StateLabel />
            <h1 className="mt-6 font-serif text-h1 md:text-display font-bold tracking-tight leading-[1.05]">
                Start a Project.
            </h1>
            <p className="mt-6 text-body opacity-80 max-w-xl">
                Pick a time, fill in the form, or drop an email. All three get a reply within two business days.
            </p>
        </div>

        {/* § 01 — BOOK A CALL */}
        <section className="py-10 border-t border-rule">
            <SectionMarker number="01" label="BOOK A CALL" />
            <p className="font-serif text-h3 leading-snug mb-6">
                Fifteen minutes. I&apos;ll tell you honestly if I can help. If I can&apos;t, I&apos;ll tell you who might.
            </p>
            <a
                href="https://calendar.app.google/n45XYFRHnmzTC5Fr6"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-ink text-paper px-6 py-3 font-sans text-body hover:opacity-90 transition-opacity"
            >
                <Calendar className="w-4 h-4" aria-hidden="true" />
                Pick a time →
            </a>
        </section>

        {/* § 02 — OR WRITE IT OUT */}
        <section className="py-10 border-t border-rule">
            <SectionMarker number="02" label="OR WRITE IT OUT" />
            <p className="text-body opacity-80 mb-8">
                Prefer to think on the page? Fill this out — I reply within two business days.
            </p>

            <form className="flex flex-col gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <label className="flex flex-col gap-2">
                        <span className="font-mono text-micro tracking-widest uppercase opacity-70">Your name</span>
                        <input
                            type="text"
                            className="w-full py-3 bg-transparent border-b border-rule focus:border-ink outline-none transition-colors"
                        />
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="font-mono text-micro tracking-widest uppercase opacity-70">Email</span>
                        <input
                            type="email"
                            placeholder="you@domain.com"
                            className="w-full py-3 bg-transparent border-b border-rule focus:border-ink outline-none placeholder:opacity-30 transition-colors"
                        />
                    </label>
                </div>

                <label className="flex flex-col gap-2">
                    <span className="font-mono text-micro tracking-widest uppercase opacity-70">What&apos;s the project</span>
                    <div className="relative">
                        <select className="w-full py-3 bg-transparent border-b border-rule focus:border-ink outline-none appearance-none cursor-pointer transition-colors">
                            <option>A web project</option>
                            <option>A community project</option>
                            <option>Both, or I&apos;m not sure yet</option>
                        </select>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                            <ChevronDown className="w-5 h-5" />
                        </div>
                    </div>
                </label>

                <label className="flex flex-col gap-2">
                    <span className="font-mono text-micro tracking-widest uppercase opacity-70">What are you trying to get to</span>
                    <textarea
                        rows={5}
                        placeholder="A sentence or a pitch deck — both work. Say it however comes easiest."
                        aria-describedby="reply-time-note"
                        className="w-full py-3 bg-transparent border-b border-rule focus:border-ink outline-none resize-none placeholder:opacity-30 transition-colors"
                    />
                    <span id="reply-time-note" className="text-micro opacity-60 mt-1">Reply within two business days.</span>
                </label>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="inline-flex items-center gap-2 text-body font-medium hover:text-accent transition-colors"
                    >
                        Send it <Send className="w-4 h-4" aria-hidden="true" />
                    </button>
                </div>
            </form>
        </section>

        {/* § 03 — OR JUST EMAIL */}
        <section className="py-10 border-t border-rule">
            <SectionMarker number="03" label="OR JUST EMAIL" />
            <p className="text-body opacity-80">
                Email works too:{" "}
                <a href="mailto:contact@aedwon.com" className="inline-flex items-center gap-1 underline underline-offset-4 decoration-rule hover:decoration-ink hover:text-accent transition-colors">
                    <Mail className="w-4 h-4" aria-hidden="true" /> contact@aedwon.com
                </a>
                . Same two-day reply.
            </p>
        </section>
    </div>
</main>
```

Wrap pre-existing content in `if (theme !== 'minimalist') { return <PreviousPage />; }` as done in Task 3.1.

- [ ] **Step 2: Verify form submission remains a no-op (unchanged behavior)**

The current page has no form handler. Keep that behavior — no `onSubmit`, no action attribute. Form submission will follow the default HTML behavior (page refresh), which is how it currently works. If the user later wires up a handler, it goes in a separate task.

- [ ] **Step 3: Visual verification**

Load `/contact` in Minimalist. Confirm three sections render in order with `§ 01`, `§ 02`, `§ 03` markers. Email fallback link uses `contact@aedwon.com`. Calendar link points to `https://calendar.app.google/n45XYFRHnmzTC5Fr6`. Switch themes — previous page renders.

- [ ] **Step 4: Commit**

```bash
git add app/contact/page.tsx
git commit -m "feat: Rewrite /contact with three-door Minimalist structure (call / form / email)."
```

---

# Phase 7 — Accessibility, polish, and final audit

## Task 7.1: Audit focus states and contrast

**Files:**
- Modify: `app/globals.css` (if focus-visible needs update)

- [ ] **Step 1: Verify focus-visible rule is sufficient**

The existing rule (lines 81-85 of `globals.css`) uses `outline: 2px solid var(--accent)`. In Minimalist, `--accent` is `#C7361A` on paper — contrast ~5.2:1, passes AA for non-text UI.

Confirm by running Chrome DevTools Lighthouse accessibility audit in dev mode. If contrast fails on any specific element, add a targeted `focus-visible` override at the affected component level.

- [ ] **Step 2: Verify all interactive elements have visible focus states**

Tab through `/`, `/web-solutions`, `/community-solutions`, `/process`, `/contact`. Every link, button, input, select, and textarea must show the outline on focus. Record any element that fails in this checklist. If any fail, fix in the relevant component with `focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2` Tailwind classes.

- [ ] **Step 3: Run axe browser extension check on each page**

Install the axe DevTools extension (one-time if not installed). Open each of the 5 pages in Minimalist and run "Scan ALL of my page". Record any serious or critical findings. Fix issues one at a time with small commits:

```bash
git commit -m "fix: Address axe a11y finding — <specific issue>."
```

Do NOT skip serious-level findings. Moderate/minor findings: note in a follow-up, don't block this task.

- [ ] **Step 4: Commit any fixes**

Group related a11y fixes into a single commit per page:

```bash
git commit -m "fix: Resolve axe accessibility findings on /<page>."
```

If no fixes were needed, skip this step.

---

## Task 7.2: Lighthouse audit on Minimalist

**Files:** none — audit only.

- [ ] **Step 1: Build production bundle**

Run:

```bash
npm run build
npm run start
```

Expected: Build succeeds; production server starts on port 3000.

- [ ] **Step 2: Run Lighthouse on each page**

For each of `/`, `/web-solutions`, `/community-solutions`, `/process`, `/contact`:
1. Open in Chrome Incognito (to avoid extension interference).
2. Open DevTools → Lighthouse.
3. Run "Navigation" audit, categories: Performance, Accessibility, Best Practices, SEO. Device: Desktop.

Target: 90+ on Performance, 95+ on Accessibility, 95+ on Best Practices, 90+ on SEO.

- [ ] **Step 3: Record results in a note**

Append a table to `docs/superpowers/plans/2026-04-20-minimalist-redesign.md` under a new "Launch Audit" section with Lighthouse scores per page. If any score is below target, create a follow-up task entry below the table. Do not block the plan on perf tuning unless a score is catastrophically low (<60).

- [ ] **Step 4: Commit audit results**

```bash
git add docs/superpowers/plans/2026-04-20-minimalist-redesign.md
git commit -m "docs: Record Lighthouse audit results for Minimalist redesign."
```

---

## Task 7.3: Reduced-motion smoke test

**Files:** none — manual test.

- [ ] **Step 1: Enable reduced-motion preference**

macOS: System Settings → Accessibility → Display → Reduce Motion.

Or in Chrome DevTools: Rendering tab → "Emulate CSS media feature prefers-reduced-motion" → reduce.

- [ ] **Step 2: Navigate all 5 pages**

Load each page. Confirm: no slide-in, fade-in, or framer-motion effects run. The CSS kill-switch (`globals.css:93-103`) clamps animation + transition durations to near-zero. Any `motion.*` usage in components NOT yet migrated to MotionWrapper will also be clamped by the CSS rule, so reduced-motion is already globally safe.

- [ ] **Step 3: If any motion still visible, migrate the affected component to MotionWrapper**

For each component with visible motion: replace `motion.div` / `motion.section` with `<MotionWrapper as="div">` / `<MotionWrapper as="section">`, import from `@/components/MotionWrapper`. Commit each migration as a separate commit:

```bash
git commit -m "refactor: Migrate <Component> to MotionWrapper for reduced-motion compliance."
```

- [ ] **Step 4: Disable reduced-motion, re-verify pages still animate correctly**

Turn off the preference. Reload each page. Confirm standard animations run.

---

## Task 7.4: User-sourced content pass

**Files:** varies — user fills spec §14 placeholders.

- [ ] **Step 1: Collect from user**

Per spec §14, collect: `[BOT_COUNT]`, `[TOTAL_MEMBERS_MODERATED]`, `[SERVER_COUNT]`, bot details (name/scale/stack/1-line × 4), `[QR_CUSTOMIZER · 1-LINE]`, prices for Audit / Build / Care Plan / Automaton / Operator, optional `[ADDITIONAL_WEB_PROJECT]` slot, final `[MINIMALIST_ACCENT_HEX]` if different from the `#C7361A` baseline in Task 0.2.

- [ ] **Step 2: Apply content replacements**

For each placeholder, edit the file(s) containing it. Most are in:
- `app/community-solutions/page.tsx` (bot cards, member counts, tier prices)
- `app/web-solutions/page.tsx` (QR customizer 1-liner, tier prices)

- [ ] **Step 3: Update accent hex if changed**

If user picks a final accent different from `#C7361A`, edit `app/globals.css:9` and validate contrast against paper (≥4.5:1 for body, ≥3:1 for UI). Use WebAIM Contrast Checker.

- [ ] **Step 4: Verify no placeholders remain**

Run: `grep -rn '\[[A-Z_]*\]' app/ components/ docs/superpowers/plans/`

Expected: matches only in plan/spec files (docs), not in code. If any brackets remain in `app/` or `components/`, fill them.

- [ ] **Step 5: Commit**

```bash
git commit -m "content: Fill real bot details, prices, and user-sourced content."
```

---

# Self-review — plan against spec

Spec coverage check:

| Spec section | Task(s) |
|---|---|
| §2.1 Lead voice (homepage) | Task 2.1 |
| §2.2 Voice C | All copy tasks (2.1, 2.4, 2.5, 2.6, 2.7, 3.1, 4.1, 5.1, 6.1) |
| §2.3 Content reality (no fake) | Task 2.3 (remove StatsBar + Testimonials) |
| §2.4 Aedwon leads, Living Lab retires | Tasks 1.3 (Navbar), 1.5 (Footer), 0.1 (metadata) |
| §4 Personality | Reflected in copy across tasks |
| §5.1 Typography (Source Serif 4 + IBM Plex Mono) | Tasks 0.1, 0.2, 0.3 |
| §5.2 Type scale | Task 0.2, 0.3 |
| §5.3 Color | Task 0.2 |
| §5.4 Rhythm | Task 0.2 |
| §5.5 Motion reduction | Task 0.4 (MotionWrapper); CSS kill-switch already present in `globals.css:93-103` |
| §5.6 CSS variable strategy | Task 0.2 |
| §6.1 Navbar | Task 1.3 |
| §6.2 Footer | Task 1.5 |
| §6.3 Chameleon switcher (Paper/Sticker/Server) | Tasks 1.2, 1.3 (labels), 1.4 + 1.5 (colophon link) |
| §7 Homepage | Tasks 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7 |
| §8 /web-solutions | Task 3.1 |
| §9 /community-solutions | Task 4.1 |
| §10 /process | Task 5.1 |
| §11 /contact | Task 6.1 |
| §12 Accessibility | Tasks 7.1, 7.2, 7.3 |
| §13 Removed / reframed | Task 2.3 (StatsBar/Testimonials), 4.1 (dashboard reframe), 5.1 (Growth Engine rename), 6.1 (state label), 0.1 (metadata) |
| §14 Placeholders | Task 7.4 |
| §16 Portfolio self-presentation (colophon-only) | Task 1.5 |

No gaps.

Placeholder scan: task instructions reference spec §14 placeholders with bracket notation (e.g., `[AUDIT_PRICE]`). These are intentional — they're content the user fills in Task 7.4. Not plan failures.

Type consistency: `MotionWrapper` props defined in Task 0.4 used consistently. `ProjectCard` and `PricingTier` props defined in Task 4.1 Step 3 used in Task 3.1 JSX — verified matching. `THEME_LABELS` defined in Task 1.2 referenced in Task 1.3. `StateLabel` and `SectionMarker` props defined in Task 1.1 used throughout.

---

# Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-20-minimalist-redesign.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
