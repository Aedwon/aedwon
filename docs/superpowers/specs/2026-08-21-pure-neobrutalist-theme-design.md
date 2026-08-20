# Pure Neobrutalist Theme Design Specification

**Date:** 2026-08-21  
**Status:** Approved  
**Author:** Aerol (Aedwon) & Antigravity  

---

## 1. Overview & Objective

Transform the current placeholder `neobrutalist` theme in the portfolio into an authentic, uncompromising Neobrutalism design system across all pages, components, and interactive states.

### Core Neobrutalist Principles
1. **Raw Structural Outlines:** Hard `0px` border-radii, thick solid outlines (`2.5px` to `3px`), zero soft blur gradients, zero radial glow filters.
2. **Physical Drop Shadows & Tactile Physics:** Flat, un-blurred offset box-shadows (`4px 4px 0px #000`, `6px 6px 0px #000`) with physical click depression (`active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000]`).
3. **High-Contrast Legibility & Color Blocking:** Saturated color-blocked surfaces in Light mode (yellow, lime, cyan, coral, lilac) paired with pure black text (`#000000`) for 14:1+ WCAG contrast. Deep obsidian charcoal surfaces in Dark mode paired with crisp white/neon outlines and neon hard-cast drop shadows.
4. **Monospace & Industrial Hierarchy:** Heavy monospace typography (`ui-monospace`, `SF Mono`, `Menlo`), indexed status tags (`[01]`, `[STATUS: ACTIVE]`, `// SYS.BUILD`), and stamp badges.

---

## 2. Token Architecture & Theme Variables

### Light Mode (`[data-theme="neobrutalist"][data-mode="light"]`)
* `--bg-canvas`: `#FEF08A` (saturated canary yellow)
* `--bg-card`: `#FFFFFF`
* `--bg-card-hover`: `#FEF9C3`
* `--text-primary`: `#000000`
* `--text-muted`: `#18181B`
* `--text-dim`: `#3F3F46`
* `--text-arrow`: `#000000`
* `--card-radius`: `0px`
* `--card-shadow`: `5px 5px 0px #000000`
* `--card-hover-shadow`: `7px 7px 0px #000000`
* `--card-border`: `3px solid #000000`
* `--accent`: `#000000`
* `--accent-contrast`: `#FFE600`
* `--border-subtle`: `#000000`
* `--font-heading`: `ui-monospace, "SF Mono", Monaco, "Cascadia Code", monospace`

### Dark Mode (`[data-theme="neobrutalist"][data-mode="dark"]`)
* `--bg-canvas`: `#0A0A0C` (pitch obsidian black)
* `--bg-card`: `#18181B` (zinc-900)
* `--bg-card-hover`: `#27272A`
* `--text-primary`: `#FFFFFF`
* `--text-muted`: `#E4E4E7`
* `--text-dim`: `#A1A1AA`
* `--text-arrow`: `#FFE600`
* `--card-radius`: `0px`
* `--card-shadow`: `5px 5px 0px #FFE600`
* `--card-hover-shadow`: `7px 7px 0px #FFFFFF`
* `--card-border`: `2.5px solid #FFFFFF`
* `--accent`: `#FFE600`
* `--accent-contrast`: `#000000`
* `--border-subtle`: `rgba(255, 255, 255, 0.2)`
* `--font-heading`: `ui-monospace, "SF Mono", Monaco, "Cascadia Code", monospace`

---

## 3. Component Specifications

### 3.1 Navbar & Theme Popover (`components/Navbar.tsx`)
* **Chassis:** When `[data-theme="neobrutalist"]` is active:
  * Replaces rounded pill with sharp rectangle (`rounded-none`).
  * `border: 3px solid var(--border-subtle)`.
  * `box-shadow: 4px 4px 0px #000000` (dark mode: `4px 4px 0px #FFE600`).
* **Navigation Links:**
  * Segmented box with `2px solid #000000` borders.
  * Active item rendered as a solid high-contrast badge (`bg-[#FFE600]` with black border and black text in light mode; `bg-[#FFFFFF]` with black text in dark mode).
* **Theme Popover:**
  * Sharp `0px` corners, solid `2.5px` border, hard shadow offset.
  * Grid buttons use tactile square press states with heavy borders.

### 3.2 Hero Section (`components/HeroSection.tsx`)
* **Status Sticker Strip:**
  * Render three tactile status stamps:
    * `[● STATUS: OPEN FOR WORK]` (Lime: `#BBF7D0` / dark: `#14532D`)
    * `[UP DILIMAN CS]` (Pink: `#FBCFE8` / dark: `#831843`)
    * `[DOST SCHOLAR]` (Orange: `#FED7AA` / dark: `#7C2D12`)
  * Solid `2px` black/white border, flat `2px 2px 0px` hard shadow.
* **Heading & Bio:**
  * Heavy uppercase headline: `AEROL (AEDWON) — SOFTWARE ENGINEER & BUILDER`.
  * High contrast body text with monospace cadence and highlighted keywords.

### 3.3 Project Cards (`components/ProjectCard.tsx`)
* **Color Rotation:**
  * Light Mode: Saturated color fills per project index:
    * Card 0: Yellow (`#FEF08A`)
    * Card 1: Lime (`#BBF7D0`)
    * Card 2: Cyan (`#BAE6FD`)
    * Card 3: Orange (`#FED7AA`)
    * Card 4: Pink (`#FBCFE8`)
    * Card 5: Lilac (`#DDD6FE`)
  * Dark Mode: Zinc surfaces (`#18181B`) with neon accent borders (yellow, lime, cyan, rose) and matching neon offset shadows.
* **Art Stage:**
  * Sits in a bordered stage box (`border-b: 3px solid #000000` in light; `border-b: 2.5px solid #FFFFFF` in dark).
  * High-contrast SVG line art with bold stroke width (`2.25px`).
* **Stack Badges:**
  * Mini rectangular chips (`rounded-none`, `border: 1.5px solid #000000`, `font-mono font-bold`).
* **Click Physics:**
  * `hover:-translate-y-1 hover:shadow-[7px_7px_0px_#000000]`
  * `active:translate-x-[3px] active:translate-y-[3px] active:shadow-[2px_2px_0px_#000000]`.

### 3.4 Experience Dossier (`components/ExperienceDossier.tsx`)
* **File Tab Rail (Left):**
  * Index badges (`[01] UP Diliman`, `[02] Dark League`, `[03] Philippine Sci`, `[04] Freelance`).
  * Thick dividing borders (`3px solid #000000` / `2.5px solid #FFFFFF`).
  * Active tab has an inverted background (`#FFE600` in light mode, `#FFFFFF` with black text in dark mode) and `2px 2px 0px` shadow.
* **Content Viewport (Right):**
  * Tabular role breakdown with crisp date stamps (`[2024 — PRESENT]`).
  * Remove radial glows, replace gradient masks with clean scroll bars or hard borders.

### 3.5 Affiliations & Partner Grid (`components/AffiliationsGrid.tsx`)
* **Sticker Stamp Tiles:**
  * Partner logos sit inside sharp bordered boxes (`border: 2px solid #000000` / `#FFFFFF`).
  * Hard offset shadows on hover.
  * Category headers styled as ASCII technical banners (`/// BRAND PARTNERS & CLIENTS`).

### 3.6 Case Studies & Blog Post Pages (`app/projects/[slug]`, `app/blogs/`)
* **Metadata Rail:** Brutalist tag pills for Role, Platform, and Tech Stack.
* **Code Snippets:** Enclosed in high-contrast command boxes with thick black borders, header bar, and hard shadows.
* **Navigation Links:** Tactile arrow buttons (`← BACK TO ALL PROJECTS`, `NEXT PROJECT →`).

---

## 4. Verification & Testing Plan

1. **Theme Switch Verification:**
   * Toggle between Default, Neobrutalist, and Discord styles.
   * Toggle between Light, Dark, and System modes inside Neobrutalist.
2. **Contrast & Legibility Verification:**
   * Audit all text across Light mode (yellow, lime, cyan cards) with a minimum 7:1 contrast ratio.
   * Audit all text across Dark mode (zinc-900 surfaces, white headings, neon accents) with a minimum 7:1 contrast ratio.
3. **Interactive States & Physics:**
   * Test hover lift, active press indentation, and tooltip visibility on all cards, tabs, and navbar elements.
4. **Automated Test Suite:**
   * Run `npm test` / Vitest tests to guarantee no regressions in existing theme switching logic and routing.
