# Personal Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the website from an agency service funnel into an authentic personal portfolio and builder archive for Aerol (Aedwon) with dynamic `/work/[slug]` case studies, preserving the 3-theme Chameleon system (Minimalist, Neubrutalist, Discord).

**Architecture:** Single source of truth in `lib/portfolio.ts` synchronizing with `docs/portfolio-copy.md`, powering a streamlined single-page hub on `/` and dynamic static-generated case study pages on `/work/[slug]`. Theme context (`ThemeContext.tsx`) controls rendering across Minimalist, Neubrutalist, and Discord OS layouts.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Lucide React, Vitest.

## Global Constraints

- Tone must strictly adhere to [`AGENTS.md`](file:///Users/aedwon/Documents/Projects/aedwon/AGENTS.md) and [`CLAUDE.md`](file:///Users/aedwon/Documents/Projects/aedwon/CLAUDE.md) (ban pattern of 3s, sycophancy, em-dash abuse, AI buzzwords).
- All copy must strictly match [`docs/portfolio-copy.md`](file:///Users/aedwon/Documents/Projects/aedwon/docs/portfolio-copy.md).
- Preserve existing theme switching functionality across Minimalist, Neubrutalist, and Discord OS.
- 100% type-safe, zero build errors on `npm run build`, all vitest suites passing.

---

### Task 1: Single Source of Truth (`lib/portfolio.ts`) & Contract Tests

**Files:**
- Create: `components/__tests__/portfolioData.test.ts`
- Modify: `lib/portfolio.ts`

**Interfaces:**
- Produces: `STATS`, `BRANDING`, `HERO`, `PROJECTS`, `SECONDARY_PROJECTS`, `EXPERIENCE`, `CASE_STUDIES`, `CONTACT_LINKS`

- [ ] **Step 1: Write test for portfolio data completeness and structure**

```typescript
// components/__tests__/portfolioData.test.ts
import { describe, it, expect } from "vitest";
import {
  HERO,
  PROJECTS,
  SECONDARY_PROJECTS,
  EXPERIENCE,
  CASE_STUDIES,
  CONTACT_LINKS,
} from "@/lib/portfolio";

describe("Portfolio Data Invariants", () => {
  it("has exact intro copy matching docs/portfolio-copy.md", () => {
    expect(HERO.intro).toContain("I'm Aerol. You might also know me in the gaming space as Aedwon.");
    expect(HERO.intro).toContain("UP Diliman");
    expect(HERO.intro).toContain("Philippine Science High School");
  });

  it("contains all featured projects with 1-sentence summaries and stack arrays", () => {
    expect(PROJECTS.length).toBeGreaterThanOrEqual(8);
    for (const project of PROJECTS) {
      expect(project.title).toBeDefined();
      expect(project.summary.length).toBeGreaterThan(10);
      expect(project.stack.length).toBeGreaterThan(0);
      expect(project.slug).toBeDefined();
    }
  });

  it("contains case study data for all featured projects", () => {
    expect(CASE_STUDIES.length).toBeGreaterThanOrEqual(6);
    for (const cs of CASE_STUDIES) {
      expect(cs.slug).toBeDefined();
      expect(cs.title).toBeDefined();
      expect(cs.sections.spark).toBeDefined();
      expect(cs.sections.keyDecisions).toBeDefined();
      expect(cs.sections.outcome).toBeDefined();
    }
  });

  it("has complete contact links", () => {
    expect(CONTACT_LINKS.email).toBe("aerol.balayon@gmail.com");
    expect(CONTACT_LINKS.github).toContain("github.com/Aedwon");
    expect(CONTACT_LINKS.linkedin).toContain("linkedin.com/in/aedwon");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/__tests__/portfolioData.test.ts`  
Expected: FAIL (missing exports / types in `portfolio.ts`)

- [ ] **Step 3: Update `lib/portfolio.ts` with complete data from `docs/portfolio-copy.md`**

Implement strongly typed `CaseStudy`, `Project`, `ExperienceItem`, and all data objects in `lib/portfolio.ts` reflecting the updated copy.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/__tests__/portfolioData.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/portfolio.ts components/__tests__/portfolioData.test.ts
git commit -m "feat: update portfolio.ts data model and contract tests"
```

---

### Task 2: Redesign Hero & Introduction Components

**Files:**
- Modify: `components/HeroSection.tsx`
- Modify: `components/DiscordHeroSection.tsx`
- Test: `components/__tests__/HeroSection.test.tsx`

**Interfaces:**
- Consumes: `HERO` from `lib/portfolio.ts`, `useTheme` from `components/ThemeContext.tsx`
- Produces: `HeroSection` component rendering the author's intro across Minimalist, Neubrutalist, and Discord themes.

- [ ] **Step 1: Write test for HeroSection rendering**

```typescript
// components/__tests__/HeroSection.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HeroSection from "@/components/HeroSection";
import { ThemeProvider } from "@/components/ThemeContext";

describe("HeroSection", () => {
  it("renders the personal greeting and background", () => {
    render(
      <ThemeProvider defaultTheme="minimalist">
        <HeroSection />
      </ThemeProvider>
    );
    expect(screen.getByText(/I'm Aerol/i)).toBeDefined();
    expect(screen.getByText(/UP Diliman/i)).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify failure or outdated assertions**

Run: `npx vitest run components/__tests__/HeroSection.test.tsx`

- [ ] **Step 3: Implement updated `HeroSection.tsx` and `DiscordHeroSection.tsx`**

Render the personal intro, PSHS & UP Diliman DOST scholar background, and quick action links (`#projects`, `#experience`, `/contact`) without sales tier CTAs.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/__tests__/HeroSection.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/HeroSection.tsx components/DiscordHeroSection.tsx components/__tests__/HeroSection.test.tsx
git commit -m "feat: redesign hero section with authentic personal intro"
```

---

### Task 3: Redesign Projects Grid & Secondary Tools Section

**Files:**
- Modify: `components/FeaturedProjects.tsx`
- Modify: `components/ProjectCard.tsx`
- Create: `components/SecondaryProjects.tsx`
- Modify: `components/BotCard.tsx`

**Interfaces:**
- Consumes: `PROJECTS`, `SECONDARY_PROJECTS` from `lib/portfolio.ts`, `useTheme` from `ThemeContext.tsx`
- Produces: `FeaturedProjects` and `SecondaryProjects` components with 1-sentence summaries, tech stack icon badges, live links, and case study routes (`/work/[slug]`).

- [ ] **Step 1: Write test for Projects list rendering**

```typescript
// components/__tests__/FeaturedProjects.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import FeaturedProjects from "@/components/FeaturedProjects";
import { ThemeProvider } from "@/components/ThemeContext";

describe("FeaturedProjects", () => {
  it("renders Pantas, MSL Network, and QR Studio cards", () => {
    render(
      <ThemeProvider defaultTheme="minimalist">
        <FeaturedProjects />
      </ThemeProvider>
    );
    expect(screen.getByText(/Pantas/i)).toBeDefined();
    expect(screen.getByText(/The MSL Network/i)).toBeDefined();
    expect(screen.getByText(/QR Studio/i)).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify**

Run: `npx vitest run components/__tests__/FeaturedProjects.test.tsx`

- [ ] **Step 3: Implement updated `FeaturedProjects.tsx`, `ProjectCard.tsx`, and `SecondaryProjects.tsx`**

- Render 1-sentence summaries.
- Render tech stack badges using Lucide / SVGs.
- Link out to `/work/[slug]` for deep dives and external URLs for live tools.
- Provide styling adaptations for Minimalist (editorial typography), Neubrutalist (solid borders & drop shadows), and Discord (embed blocks).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/__tests__/FeaturedProjects.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/FeaturedProjects.tsx components/ProjectCard.tsx components/SecondaryProjects.tsx components/BotCard.tsx components/__tests__/FeaturedProjects.test.tsx
git commit -m "feat: update projects grid with 1-sentence summaries and stack icons"
```

---

### Task 4: Implement Experience & About Sections

**Files:**
- Create: `components/ExperienceSection.tsx`
- Create: `components/AboutSection.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `EXPERIENCE`, `ABOUT` from `lib/portfolio.ts`
- Produces: Rendered Experience (PSYSC, MSL, miHoYo, UP Fair) and About sections on the homepage.

- [ ] **Step 1: Write test for Experience and About sections**

```typescript
// components/__tests__/ExperienceSection.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ExperienceSection from "@/components/ExperienceSection";
import { ThemeProvider } from "@/components/ThemeContext";

describe("ExperienceSection", () => {
  it("renders PSYSC Olympiad and MSL experience items", () => {
    render(
      <ThemeProvider defaultTheme="minimalist">
        <ExperienceSection />
      </ThemeProvider>
    );
    expect(screen.getByText(/PSYSC/i)).toBeDefined();
    expect(screen.getByText(/MSL Collegiate Cup/i)).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx vitest run components/__tests__/ExperienceSection.test.tsx`

- [ ] **Step 3: Implement `ExperienceSection.tsx`, `AboutSection.tsx`, and update `app/page.tsx`**

Assemble the clean single-page homepage: Hero -> Featured Projects -> Secondary Experiments -> Experience & Community Ops -> About -> Contact / Colophon.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/__tests__/ExperienceSection.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/ExperienceSection.tsx components/AboutSection.tsx app/page.tsx components/__tests__/ExperienceSection.test.tsx
git commit -m "feat: add experience and about sections to homepage"
```

---

### Task 5: Implement Dynamic Case Study Pages (`/work/[slug]`)

**Files:**
- Create: `app/work/[slug]/page.tsx`
- Create: `components/CaseStudyView.tsx`
- Test: `components/__tests__/CaseStudyView.test.tsx`

**Interfaces:**
- Consumes: `CASE_STUDIES` from `lib/portfolio.ts`, `useTheme` from `ThemeContext.tsx`
- Produces: Dynamic SSG route for `/work/[slug]` rendering Spark, Constraints, Architecture/Decisions, Hurdles, and Outcomes.

- [ ] **Step 1: Write test for CaseStudyView rendering**

```typescript
// components/__tests__/CaseStudyView.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CaseStudyView from "@/components/CaseStudyView";
import { CASE_STUDIES } from "@/lib/portfolio";
import { ThemeProvider } from "@/components/ThemeContext";

describe("CaseStudyView", () => {
  it("renders case study sections for Pantas", () => {
    const pantas = CASE_STUDIES.find((cs) => cs.slug === "pantas")!;
    render(
      <ThemeProvider defaultTheme="minimalist">
        <CaseStudyView caseStudy={pantas} />
      </ThemeProvider>
    );
    expect(screen.getByText(/Pantas/i)).toBeDefined();
    expect(screen.getByText(/The Spark/i)).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx vitest run components/__tests__/CaseStudyView.test.tsx`

- [ ] **Step 3: Implement `CaseStudyView.tsx` and `app/work/[slug]/page.tsx`**

- Add `generateStaticParams()` to pre-render all slugs at build time.
- Implement theme-adaptive styling:
  - Minimalist: Clean reading layout with serif titles, § section numbers, callouts.
  - Neubrutalist: Dossier card layout with high-contrast borders and badge chips.
  - Discord OS: Devlog channel format with message bubble blocks and author header.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/__tests__/CaseStudyView.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/work/[slug]/page.tsx components/CaseStudyView.tsx components/__tests__/CaseStudyView.test.tsx
git commit -m "feat: implement dynamic /work/[slug] case study route"
```

---

### Task 6: Streamline Navigation, Contact & Clean Up Legacy Routes

**Files:**
- Modify: `components/Navbar.tsx`
- Modify: `components/Footer.tsx`
- Modify: `app/contact/page.tsx`
- Remove / Redirect: `app/web-solutions/`, `app/community-solutions/`, `app/process/`

- [ ] **Step 1: Update Navbar & Footer links**

Update navigation links in `Navbar.tsx` and `Footer.tsx` to:
- `Home` (`/`)
- `Projects` (`/#projects`)
- `Experience` (`/#experience`)
- `About` (`/#about`)
- `Contact` (`/contact`)

- [ ] **Step 2: Update Contact page (`app/contact/page.tsx`)**

Streamline contact page to direct links (Email, GitHub, Discord, LinkedIn) and simple message form without sales budget / tier dropdowns.

- [ ] **Step 3: Remove or redirect legacy sales pages**

Clean up unused service components (`TwoOfferSplit`, `ServicesStatusStrip`, `HowItWorks`, `WhoThisIsFor`, `PricingTier`) and set up redirects in `next.config.ts` if needed.

- [ ] **Step 4: Commit**

```bash
git add components/Navbar.tsx components/Footer.tsx app/contact/page.tsx next.config.ts
git commit -m "refactor: streamline navigation and clean up legacy sales pages"
```

---

### Task 7: Full Verification & Build Quality Gate

**Files:**
- Test all components and integration

- [ ] **Step 1: Run all unit tests**

Run: `npx vitest run`  
Expected: All test suites pass.

- [ ] **Step 2: Run linter**

Run: `npm run lint`  
Expected: Zero lint warnings or errors.

- [ ] **Step 3: Run production build**

Run: `npm run build`  
Expected: Next.js static site generation succeeds for `/`, `/contact`, and all `/work/[slug]` routes.

- [ ] **Step 4: Commit final validation**

```bash
git commit --allow-empty -m "chore: verify build and test suite passing"
```
