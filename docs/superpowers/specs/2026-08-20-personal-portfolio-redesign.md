# Design Specification: Personal Portfolio Redesign

> **Date:** 2026-08-20  
> **Status:** Draft for Review  
> **Topic:** Transition from Agency Pitch to Personal Builder Archive & Chameleon Showcase  
> **Reference Specs:** [`docs/tone-reference.md`](file:///Users/aedwon/Documents/Projects/aedwon/docs/tone-reference.md), [`docs/portfolio-copy.md`](file:///Users/aedwon/Documents/Projects/aedwon/docs/portfolio-copy.md), [`AGENTS.md`](file:///Users/aedwon/Documents/Projects/aedwon/AGENTS.md)

---

## 1. Executive Summary & Goals

### 1.1 The Shift
Transform the personal website from a commercial agency sales funnel (service tiers, audit packages, conversion hooks) into an **authentic, grounded personal repository of Aerol (Aedwon)**. The site highlights full-stack web engineering, offline-first applications, civic technology, and high-scale gaming community tooling.

### 1.2 Core Objectives
1. **Human & Grounded Voice:** Ban AI clichés (tricolons / pattern of 3s, false parallelism, em-dash crutches, buzzwords). Follow Hiroki Osame's direct, numbers-backed engineering tone.
2. **Comprehensive Project Catalog:** Showcase real projects from GitHub and local workspaces (Pantas, Genshin DPS Calculator, Norala SB Portal, QR Studio, Kiosk Survey, MSL Bots, WebP Unli, Lakambini Events).
3. **Structured Case Studies:** Add a dynamic `/work/[slug]` route detailing real-world problems, constraints, architecture decisions, hurdles, and learnings.
4. **Preserve Chameleon Concept:** Retain the 3-in-1 theme system (Minimalist, Neubrutalist, Discord) powered by a single source of truth (`lib/portfolio.ts`).

---

## 2. Information Architecture & Routing

```
/ (Personal Hub)
├── Hero / Introduction
├── Featured Projects Grid
├── Secondary Tools & Experiments
├── Experience & Community Ops Highlights
├── About / Journey
└── Contact Links / Colophon

/work/[slug] (Dynamic Project Case Studies)
├── /work/pantas
├── /work/qr-studio
├── /work/gi-calculator
├── /work/norala-sb
├── /work/kiosk-survey
├── /work/msl-bots
├── /work/webp-unli
└── /work/lakambini

/contact (Streamlined Direct Reach-out)
```

*Note: Legacy sales routes (`/web-solutions`, `/community-solutions`, `/process`) will be deprecated/removed in favor of the unified personal hub and `/work/[slug]`.*

---

## 3. Data Structure (`lib/portfolio.ts`)

All content remains centralized in TypeScript types to prevent theme drift.

```typescript
export type CaseStudy = {
  slug: string;
  title: string;
  tagline: string;
  category: "mobile" | "client-tool" | "civic-tech" | "community-infra" | "web";
  role: string;
  timeline: string;
  stack: string[];
  links: { label: string; url: string }[];
  metrics?: { label: string; value: string }[];
  sections: {
    spark: string;
    constraints: string[];
    architecture: string;
    hurdles: string;
    outcome: string;
  };
};

export type ProjectSummary = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  href: string;
  externalUrl?: string;
  featured: boolean;
};
```

---

## 4. Chameleon Theme Adaptations

### 4.1 Minimalist Skin (Editorial / Technical Journal)
- **Palette:** Muted terracotta accent (`#C05621` / `#A04010`), warm paper background, dark ink text.
- **Typography:** Serif headings, monospace accents, § section numbering.
- **Layout:** Generous whitespace, clean typographic lists, essay-style case study reading view.

### 4.2 Neubrutalist Skin (Tactile Sticker Workshop)
- **Palette:** High-contrast retro tones with solid black borders (`3px solid #000`) and hard drop shadows (`4px 4px 0px #000`).
- **Typography:** Bold sans-serif with monospace tags and badge chips.
- **Layout:** Bento-style project cards, tactile push-button interactions, callout boxes for hurdles and learnings.

### 4.3 Discord OS Skin (Server & Devlog Terminal)
- **Palette:** Authentic Discord dark theme palette (`#313338`, `#2B2D31`, `#1E1F22`, blurple `#5865F2`).
- **Layout:** Server shell with sidebar navigation channels (`#who-i-am`, `#featured-projects`, `#experiments`, `#experience`).
- **Case Studies:** Rendered as dedicated devlog / forum channels (`#case-studies > pantas`) with message bubbles, bot embed cards, and timestamped author blocks.

---

## 5. Living Copy Strategy

All active copy, project descriptions, and case study notes will be maintained directly in [`docs/portfolio-copy.md`](file:///Users/aedwon/Documents/Projects/aedwon/docs/portfolio-copy.md) and governed by [`AGENTS.md`](file:///Users/aedwon/Documents/Projects/aedwon/AGENTS.md).

---

## 6. Verification Plan

### 6.1 Automated Checks
- `npm run build` — Validate Next.js App Router compilation and type safety across all dynamic routes.
- `npm run lint` — Verify linting passes with zero errors.
- `npx vitest run` — Run component and data consistency tests.

### 6.2 Manual Theme Audits
- Verify seamless theme switching across Minimalist, Neubrutalist, and Discord OS skins on `/` and `/work/[slug]`.
- Verify responsive mobile layout and accessibility contrast ratios.
