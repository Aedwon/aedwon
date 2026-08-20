# Project Case Study Standards & Storytelling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform all 12 project case study pages (`/projects/[slug]`) into authentic, unslopped engineering narratives following a tiered structure (Flagships vs Focused Tools) with problem context, architecture decisions, hurdles solved, and grounded numbers.

**Architecture:** Upgrade `ProjectItem` in `lib/data/projects.ts` to support structured narrative fields (`tier`, `hurdles`, `retrospective`, and rich `architecture` items). Update `app/projects/[slug]/page.tsx` to render the tiered layout seamlessly with clean typography, code snippets, and hurdle callouts. Sync living copy in `docs/portfolio-copy.md`.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide React, Vitest.

## Global Constraints

- Tone must strictly follow unslop standards in `AGENTS.md` and `docs/tone-reference.md` (no buzzwords, no Rule of 3s, no marketing preambles).
- Numbers must match primary sources (`CV Professional Aerol.pdf`, production logs).
- 100% type safe with zero lint warnings or compilation errors.

---

### Task 1: Update Project Data Schema & Comprehensive Content

**Files:**
- Create: `lib/data/__tests__/projects.test.ts`
- Modify: `lib/data/projects.ts`
- Modify: `docs/portfolio-copy.md`

**Interfaces:**
- Consumes: None
- Produces: Updated `ProjectItem`, `ProjectHurdle`, `ProjectArchitectureItem` in `lib/data/projects.ts`

- [ ] **Step 1: Write failing unit test for project schema and tier data**

```typescript
// lib/data/__tests__/projects.test.ts
import { describe, it, expect } from 'vitest';
import { PROJECTS, ProjectItem } from '../projects';

describe('PROJECTS Data Integrity', () => {
  it('should have 12 unique projects with valid slugs and tiers', () => {
    expect(PROJECTS.length).toBe(12);
    const slugs = new Set(PROJECTS.map((p) => p.slug));
    expect(slugs.size).toBe(12);

    PROJECTS.forEach((project: ProjectItem) => {
      expect(['flagship', 'focused']).toContain(project.tier);
      expect(project.problem).toBeTruthy();
      expect(project.architecture.length).toBeGreaterThan(0);
      expect(project.results).toBeTruthy();
    });
  });

  it('should have hurdles defined for flagship tier projects', () => {
    const flagships = PROJECTS.filter((p) => p.tier === 'flagship');
    expect(flagships.length).toBeGreaterThanOrEqual(4);
    flagships.forEach((p) => {
      expect(p.hurdles).toBeDefined();
      expect(p.hurdles!.length).toBeGreaterThan(0);
      p.hurdles!.forEach((h) => {
        expect(h.title).toBeTruthy();
        expect(h.issue).toBeTruthy();
        expect(h.solution).toBeTruthy();
      });
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/data/__tests__/projects.test.ts`  
Expected: FAIL (missing `tier` and `hurdles` on `ProjectItem`)

- [ ] **Step 3: Update `lib/data/projects.ts` with enhanced schema and unsloped copy for all 12 projects**

```typescript
export interface TechItem {
  name: string;
  category?: string;
  icon?: string;
}

export interface ProjectMetric {
  value: string;
  label: string;
}

export interface ProjectHurdle {
  title: string;
  issue: string;
  solution: string;
}

export interface ProjectArchitectureItem {
  title: string;
  description: string;
  tradeOff?: string;
  codeSnippet?: string;
  codeLanguage?: string;
}

export interface ProjectItem {
  slug: string;
  title: string;
  tagline: string;
  category: 'mobile' | 'web' | 'bots' | 'civic';
  categoryLabel: string;
  tier: 'flagship' | 'focused';
  role: string;
  timeline: string;
  featured: boolean;
  order: number;
  glowColor: 'blue' | 'purple' | 'pink' | 'violet' | 'green' | 'amber' | 'cyan';
  brandColor: string;
  icon: string;
  platforms: { name: string; icon: 'android' | 'apple' | 'web' | 'server' }[];
  stack: TechItem[];
  liveUrl?: string;
  githubUrl?: string;
  summary: string;
  problem: string;
  architecture: ProjectArchitectureItem[];
  hurdles?: ProjectHurdle[];
  results: string;
  metrics?: ProjectMetric[];
  retrospective?: string;
}
```

Populate all 12 projects with grounded, unsloped content:
- **Flagships (4):** `pantas`, `msl-network`, `norala-sb-portal`, `pso-scoring-model`.
- **Focused (8):** `qr-studio`, `kiosk-survey`, `bettergov-ph`, `msl-collegiate-cup-bot`, `ilocos-sur-esports-bot`, `oppo-legend-cup-bot`, `gi-damage-calculator`, `ai-agent-framework`.

- [ ] **Step 4: Update `docs/portfolio-copy.md` to match the updated case study narrative standard**

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run lib/data/__tests__/projects.test.ts`  
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add lib/data/projects.ts lib/data/__tests__/projects.test.ts docs/portfolio-copy.md
git commit -m "feat(data): upgrade project schema to support tiered unslop case studies"
```

---

### Task 2: Refactor `/projects/[slug]` Case Study Page Renderer

**Files:**
- Create: `app/projects/[slug]/__tests__/page.test.tsx`
- Modify: `app/projects/[slug]/page.tsx`

**Interfaces:**
- Consumes: `PROJECTS`, `ProjectItem` from `lib/data/projects.ts`
- Produces: Rendered Next.js page component `ProjectCaseStudyPage`

- [ ] **Step 1: Write failing component test for `/projects/[slug]`**

```typescript
// app/projects/[slug]/__tests__/page.test.tsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProjectCaseStudyPage from '../page';

describe('ProjectCaseStudyPage', () => {
  it('renders flagship project with hurdles and how it is built sections', async () => {
    const Component = await ProjectCaseStudyPage({
      params: Promise.resolve({ slug: 'pantas' }),
    });
    render(Component);

    expect(screen.getByText('Pantas')).toBeInTheDocument();
    expect(screen.getByText('Problem & Constraints')).toBeInTheDocument();
    expect(screen.getByText("How It's Built")).toBeInTheDocument();
    expect(screen.getByText('Hurdles & Solutions')).toBeInTheDocument();
    expect(screen.getByText('Results & Numbers')).toBeInTheDocument();
  });

  it('renders focused project with compact sections', async () => {
    const Component = await ProjectCaseStudyPage({
      params: Promise.resolve({ slug: 'qr-studio' }),
    });
    render(Component);

    expect(screen.getByText('QR Studio')).toBeInTheDocument();
    expect(screen.getByText('Why I Built This')).toBeInTheDocument();
    expect(screen.getByText('How It Works')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run app/projects/[slug]/__tests__/page.test.tsx`  
Expected: FAIL

- [ ] **Step 3: Update `app/projects/[slug]/page.tsx`**

Implement the tiered rendering:
- Header, Breadcrumb, and verified Style C Metadata Strip.
- Hero Stage (`ProjectArt` with ambient glow).
- Section 1:
  - If `tier === 'flagship'`: Heading `Problem & Constraints`
  - If `tier === 'focused'`: Heading `Why I Built This`
- Section 2:
  - If `tier === 'flagship'`: Heading `How It's Built` (renders architecture items, trade-off notes, and code snippets)
  - If `tier === 'focused'`: Heading `How It Works`
- Section 3 (Flagship tier only):
  - Heading `Hurdles & Solutions` (renders `{ title, issue, solution }` callout cards)
- Section 4:
  - Heading `Results & Numbers` (renders metrics pills, summary prose, and optional `retrospective` callout)
- Next Project footer card.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run app/projects/[slug]/__tests__/page.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/projects/[slug]/page.tsx app/projects/[slug]/__tests__/page.test.tsx
git commit -m "feat(projects): render tiered unslop case study anatomy on /projects/[slug]"
```

---

### Task 3: Full End-to-End Build & Visual Verification

**Files:**
- Verify: Entire repository builds cleanly

- [ ] **Step 1: Run full test suite**

Run: `npx vitest run`  
Expected: All tests pass

- [ ] **Step 2: Run Next.js production build**

Run: `npm run build`  
Expected: Build succeeds with 0 errors and all 12 static `/projects/[slug]` routes generated.

- [ ] **Step 3: Run linter**

Run: `npm run lint`  
Expected: Clean with 0 warnings/errors.

- [ ] **Step 4: Commit any final cleanup**

```bash
git commit --allow-empty -m "chore: verify build and static generation across all project case studies"
```
