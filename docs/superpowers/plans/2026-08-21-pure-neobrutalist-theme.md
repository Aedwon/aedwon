# Pure Neobrutalist Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the `neobrutalist` theme into an authentic, uncompromising Neobrutalism design system across all website pages and components.

**Architecture:** Implement high-contrast CSS custom properties in `app/globals.css` with saturated color blocks in light mode and obsidian-neon in dark mode. Enhance shared React components (`Navbar`, `HeroSection`, `ProjectCard`, `ExperienceDossier`, `AffiliationsGrid`, `Footer`, case study pages) with dedicated `[data-theme="neobrutalist"]` styling, hard 0px borders, tactile un-blurred drop shadows, and indexed monospace stamps.

**Tech Stack:** Next.js 15, React 19, Tailwind CSS, TypeScript, Vitest.

## Global Constraints

- Never break existing default Hiroki Osame or Discord theme modes.
- Light mode must maintain 14:1+ contrast ratio with black text on saturated color cards.
- Dark mode must maintain 7:1+ contrast ratio on obsidian charcoal cards with white text and neon highlights.
- Zero soft radial glow overlays or blur effects when `neobrutalist` is active.
- Hard drop shadows must use `0px` blur with tactile active click depression.

---

### Task 1: Core Neobrutalist Design Tokens & Global CSS System

**Files:**
- Modify: `app/globals.css:44-79`
- Create: `components/__tests__/theme-neobrutalist.test.tsx`

**Interfaces:**
- Consumes: `[data-theme="neobrutalist"][data-mode="light"]`, `[data-theme="neobrutalist"][data-mode="dark"]` attributes on `<html>` and `<body>`.
- Produces: CSS variables (`--bg-canvas`, `--bg-card`, `--card-shadow`, `--card-hover-shadow`, `--card-border`, `--border-subtle`, etc.) and `.neobrutalist-*` utility selectors.

- [ ] **Step 1: Write test for neobrutalist theme attributes & styling tokens**

```tsx
// components/__tests__/theme-neobrutalist.test.tsx
import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../ThemeContext";

function ThemeConsumer() {
  const { theme, setTheme, mode, setMode } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <span data-testid="current-mode">{mode}</span>
      <button onClick={() => setTheme("neobrutalist")}>Set Brutalist</button>
      <button onClick={() => setMode("light")}>Set Light</button>
      <button onClick={() => setMode("dark")}>Set Dark</button>
    </div>
  );
}

describe("Neobrutalist Theme Integration", () => {
  it("should switch theme to neobrutalist and set attributes on document", () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    const btn = screen.getByText("Set Brutalist");
    btn.click();

    expect(screen.getByTestId("current-theme").textContent).toBe("neobrutalist");
    expect(document.documentElement.getAttribute("data-theme")).toBe("neobrutalist");
  });
});
```

- [ ] **Step 2: Run test to verify it passes or fails**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: Update `app/globals.css` with complete Neobrutalist design tokens and utility overrides**

```css
/* Neobrutalist Theme - Dark Mode */
[data-theme="neobrutalist"][data-mode="dark"],
html[data-theme="neobrutalist"][data-mode="dark"] body {
  --bg-canvas: #0A0A0C;
  --bg-card: #18181B;
  --bg-card-hover: #27272A;
  --text-primary: #FFFFFF;
  --text-muted: #E4E4E7;
  --text-dim: #A1A1AA;
  --text-arrow: #FFE600;
  --card-radius: 0px;
  --card-shadow: 5px 5px 0px #FFE600;
  --card-hover-shadow: 7px 7px 0px #FFFFFF;
  --card-border: 2.5px solid #FFFFFF;
  --accent: #FFE600;
  --accent-contrast: #000000;
  --border-subtle: rgba(255, 255, 255, 0.25);
  --font-heading: ui-monospace, "SF Mono", Monaco, "Cascadia Code", Menlo, monospace;
}

/* Neobrutalist Theme - Light Mode */
[data-theme="neobrutalist"][data-mode="light"],
html[data-theme="neobrutalist"][data-mode="light"] body {
  --bg-canvas: #FEF08A;
  --bg-card: #FFFFFF;
  --bg-card-hover: #FEF9C3;
  --text-primary: #000000;
  --text-muted: #18181B;
  --text-dim: #3F3F46;
  --text-arrow: #000000;
  --card-radius: 0px;
  --card-shadow: 5px 5px 0px #000000;
  --card-hover-shadow: 7px 7px 0px #000000;
  --card-border: 3px solid #000000;
  --accent: #000000;
  --accent-contrast: #FFE600;
  --border-subtle: #000000;
  --font-heading: ui-monospace, "SF Mono", Monaco, "Cascadia Code", Menlo, monospace;
}

/* Neobrutalist Global Overrides */
[data-theme="neobrutalist"] ::selection {
  background: #FFE600;
  color: #000000;
}

[data-theme="neobrutalist"][data-mode="light"] ::selection {
  background: #000000;
  color: #FFE600;
}

/* Flatten glows in neobrutalist theme */
[data-theme="neobrutalist"] .glow-blue,
[data-theme="neobrutalist"] .glow-purple,
[data-theme="neobrutalist"] .glow-pink,
[data-theme="neobrutalist"] .glow-violet,
[data-theme="neobrutalist"] .glow-green,
[data-theme="neobrutalist"] .glow-amber,
[data-theme="neobrutalist"] .glow-cyan {
  background: var(--bg-card) !important;
}
```

- [ ] **Step 4: Run tests to verify correctness**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/globals.css components/__tests__/theme-neobrutalist.test.tsx
git commit -m "feat(theme): add pure neobrutalist design tokens and global overrides"
```

---

### Task 2: Pure Neobrutalist Navbar & Theme Switcher

**Files:**
- Modify: `components/Navbar.tsx`

**Interfaces:**
- Consumes: `useTheme()` hook, `theme === "neobrutalist"`.
- Produces: Sharp 0px capsule, heavy 3px black/white borders, 4px hard shadow, high-contrast square segmented navigation tabs, tactile popover buttons.

- [ ] **Step 1: Write test for Navbar under neobrutalist theme**

Add test in `components/__tests__/navbar.test.tsx` checking that `data-theme="neobrutalist"` navbar renders correctly.

- [ ] **Step 2: Update `components/Navbar.tsx`**

Implement brutalist classes for container (`rounded-none border-[3px] border-black dark:border-white shadow-[4px_4px_0px_#000000] dark:shadow-[4px_4px_0px_#FFE600]`), navigation pills (`rounded-none border-2 border-black active:translate-x-[1px] active:translate-y-[1px]`), active indicator (`bg-[#FFE600] text-black`), and theme popover (`rounded-none border-[2.5px] border-black dark:border-white shadow-[6px_6px_0px_#000000] dark:shadow-[6px_6px_0px_#FFE600]`).

- [ ] **Step 3: Run tests**

Run: `npm test`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add components/Navbar.tsx components/__tests__/navbar.test.tsx
git commit -m "feat(navbar): implement pure neobrutalist navbar and popover styling"
```

---

### Task 3: Hero Section Brutalist Status Badges & Heading

**Files:**
- Modify: `components/HeroSection.tsx`

**Interfaces:**
- Consumes: `useTheme()` hook.
- Produces: High-contrast status stamp strip (`[● STATUS: OPEN FOR WORK]`, `[UP DILIMAN CS]`, `[DOST SCHOLAR]`), bold uppercase monospace headline, and tactile keyword tags.

- [ ] **Step 1: Update `components/HeroSection.tsx`**

Render the tactile status badge strip when `theme === "neobrutalist"` or conditionally style the status pills. Ensure high contrast colors in both Light (lime `#BBF7D0`, pink `#FBCFE8`, orange `#FED7AA` with black text and black borders) and Dark modes (deep forest `#14532D`, berry `#831843`, copper `#7C2D12` with white text and crisp borders).

- [ ] **Step 2: Run tests**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add components/HeroSection.tsx
git commit -m "feat(hero): add brutalist status stamps and high-contrast typography"
```

---

### Task 4: Project Card Multi-Color Blocking & Tactile Physics

**Files:**
- Modify: `components/ProjectCard.tsx`
- Modify: `lib/data/projects.ts` (if needed for brutalist color tokens)

**Interfaces:**
- Consumes: `project: ProjectItem`, `useTheme()`.
- Produces: Saturated color fills (yellow, lime, cyan, orange, pink, lilac) in Light mode, obsidian zinc with neon borders/shadows in Dark mode, bordered art stage, mini brutalist stack chips, and active click depression physics.

- [ ] **Step 1: Write test for ProjectCard under neobrutalist theme**

Add test in `components/__tests__/theme-neobrutalist.test.tsx` rendering `ProjectCard` under neobrutalist theme mode and verifying color-block classes and border structure.

- [ ] **Step 2: Implement color-blocking and brutalist card container in `components/ProjectCard.tsx`**

1. Define the 6-color rotating palette in Light mode:
   - Yellow: `#FEF08A`
   - Lime: `#BBF7D0`
   - Cyan: `#BAE6FD`
   - Orange: `#FED7AA`
   - Pink: `#FBCFE8`
   - Lilac: `#DDD6FE`
2. In Dark mode, use `#18181B` with neon borders and matching neon flat drop shadows (`#FFE600`, `#4ADE80`, `#38BDF8`, `#FB7185`).
3. Add hard border between art stage and card body (`border-b-2 border-black dark:border-white/20`).
4. Update tech badges to square brutalist stamps (`rounded-none border-[1.5px] border-black bg-white font-mono text-[11px] font-bold`).
5. Add tactile active state: `active:translate-x-[3px] active:translate-y-[3px] active:shadow-[2px_2px_0px_#000000]`.

- [ ] **Step 3: Run tests**

Run: `npm test`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add components/ProjectCard.tsx components/__tests__/theme-neobrutalist.test.tsx
git commit -m "feat(projects): add multi-color blocking, brutalist art stages, and tactile physics"
```

---

### Task 5: Experience Dossier File-Folder Deck

**Files:**
- Modify: `components/ExperienceDossier.tsx`

**Interfaces:**
- Consumes: `EXPERIENCES` data, `useTheme()`.
- Produces: Physical file-folder tab deck on the left rail (`[01] UP Diliman`, `[02] Dark League`, etc.), 3px dividing border, inverted active tab state, and tabular role breakdown.

- [ ] **Step 1: Update `components/ExperienceDossier.tsx`**

When `neobrutalist` is active:
1. Apply `border-[3px] border-black dark:border-white shadow-[5px_5px_0px_#000000] dark:shadow-[5px_5px_0px_#FFE600] rounded-none`.
2. Render indexed tab tags (`[01]`, `[02]`, etc.) with `border-2 border-black dark:border-white/40`.
3. Highlight active tab with inverted background (`bg-[#FFE600] text-black font-bold shadow-[2px_2px_0px_#000000]`).
4. Role entries render with monospace date stamps (`[2024 — PRESENT]`) and high-contrast divider lines.

- [ ] **Step 2: Run tests**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add components/ExperienceDossier.tsx
git commit -m "feat(experience): implement brutalist file-folder tab deck and index stamps"
```

---

### Task 6: Affiliations Grid, Footer & Case Study / Blog Pages

**Files:**
- Modify: `components/AffiliationsGrid.tsx`
- Modify: `components/Footer.tsx`
- Modify: `app/projects/[slug]/page.tsx`
- Modify: `app/blogs/page.tsx`
- Modify: `app/blogs/[slug]/page.tsx`

**Interfaces:**
- Consumes: `useTheme()`, project/blog data.
- Produces: Bordered logo stamp cards, ASCII category banners (`/// BRAND PARTNERS & CLIENTS`), brutalist case study metadata strips, and terminal code blocks.

- [ ] **Step 1: Update `components/AffiliationsGrid.tsx`**

Wrap logo badges in bordered stamp cards (`border-2 border-black dark:border-white/40 bg-white/50 dark:bg-black/40 hover:shadow-[3px_3px_0px_#000000] dark:hover:shadow-[3px_3px_0px_#FFE600] rounded-none`).

- [ ] **Step 2: Update `components/Footer.tsx`**

Apply brutalist contact buttons, hard top border divider, and monospace system signature.

- [ ] **Step 3: Update `app/projects/[slug]/page.tsx` & `app/blogs/page.tsx`**

Add brutalist styling to case study metadata strip, back buttons, code blocks (`border-2 border-black shadow-[4px_4px_0px_#000000]`), and pagination cards.

- [ ] **Step 4: Run full test suite & visual check**

Run: `npm test`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add components/AffiliationsGrid.tsx components/Footer.tsx app/projects/[slug]/page.tsx app/blogs/page.tsx app/blogs/[slug]/page.tsx
git commit -m "feat(pages): apply neobrutalist aesthetics to affiliations, footer, and case study pages"
```

---

### Task 7: Full System Verification & Contrast Audit

**Files:**
- Test all pages and theme switches across light and dark modes.

- [ ] **Step 1: Run complete automated test suite**

Run: `npm test`
Expected: ALL 100% PASS

- [ ] **Step 2: Build verification**

Run: `npm run build`
Expected: Successful Next.js production bundle build with zero type or lint errors.

- [ ] **Step 3: Commit any final refinements**

```bash
git commit -m "chore(theme): verify neobrutalist theme build and test suite"
```
