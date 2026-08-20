# Design Specification: Project Case Study Standards & Storytelling

> **Date:** 2026-08-21  
> **Status:** Approved Spec  
> **Topic:** Structure, Storytelling Framework, and Unslop Standards for `/projects/[slug]` Case Study Pages  
> **Reference Specs:** [`docs/tone-reference.md`](file:///Users/aedwon/Documents/Projects/aedwon/docs/tone-reference.md), [`docs/portfolio-copy.md`](file:///Users/aedwon/Documents/Projects/aedwon/docs/portfolio-copy.md), [`AGENTS.md`](file:///Users/aedwon/Documents/Projects/aedwon/AGENTS.md)

---

## 1. Executive Summary & Goals

### 1.1 Objective
Establish an authentic, engineering-first standard for all project case study pages (`/projects/[slug]`). Case studies will move away from generic feature summaries and sales-driven overviews to focus on real-world constraints, technical trade-offs, engineering hurdles, and concrete results.

### 1.2 Unslop Principles
1. **First-Person & Human:** Written directly in plain, technical English as if speaking to peer engineers.
2. **Grounding:** Every domain concept, technical acronym, or constraint is introduced and explained before being built upon.
3. **Friction & Failed Attempts:** Highlights real obstacles (e.g. spotty 3G data during commutes, memory constraints on Android TV, Discord API rate limit spikes during national tournament check-ins) rather than presenting sanitized success stories.
4. **Concrete Numbers:** Replaces abstract descriptors with verified ground truth stats (e.g. sub-15ms query times, 10,000+ member platforms, 4,000+ competitors ranked with zero delays).
5. **Zero Marketing Fluff:** Bans AI buzzwords (*seamless, robust, leverage, tapestry, delve, elevate*), symmetric 3-item bullet groups, and performative hedging.

---

## 2. Tiered Narrative Taxonomy

Projects are classified into two tiers to match narrative depth with system complexity:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Flagship Projects (Full 4-Part Arc)                      │
│    • Pantas (Mobile & Offline Exam Reviewer)                │
│    • The MSL Network (Collegiate Esports Platform & Bots)   │
│    • Norala SB Portal (Legislative Transparency PWA)        │
│    • PSO Automated Scorer (Science Olympiad Tabulation)     │
├─────────────────────────────────────────────────────────────┤
│ 2. Focused Tools & Case Studies (Compact 2/3-Part Arc)      │
│    • QR Studio (Zero-Backend Canvas QR Generator)           │
│    • Kiosk Survey (Offline Android TV Kiosk)                │
│    • BetterGov PH (Open Source Civic Tech Contribution)     │
│    • MSL Collegiate Cup Bot (Tournament Operations Engine)  │
│    • Ilocos Sur Esports Bot (Provincial Challonge Sync)     │
│    • OPPO Legend Cup Bot (Brand Tournament Roster Engine)   │
│    • GI Damage Calculator (KQM Formula Optimization Engine) │
│    • AI Agent Framework (Local Skill Architecture)          │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Standardized Page Anatomy

### 3.1 Visual & Structural Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│ Back Link: ← Back to all projects                           │
├─────────────────────────────────────────────────────────────┤
│ Header: Title, Live Link ↗, GitHub ↗, Tagline               │
├─────────────────────────────────────────────────────────────┤
│ Metadata Strip: Role | Platform Badges | Tech Stack Badges  │
├─────────────────────────────────────────────────────────────┤
│ Hero Stage: ProjectArt & Ambient Glow                       │
├─────────────────────────────────────────────────────────────┤
│ Flagship Tier Sections:                                     │
│   1. Problem & Constraints                                  │
│   2. How It's Built (Architecture, Trade-offs, Code)        │
│   3. Hurdles & Solutions (Edge Cases, Bugs, Scaling)        │
│   4. Results & Numbers (Grounded Metrics, Retrospective)    │
│                                                             │
│ Focused Tier Sections:                                      │
│   1. Why I Built This (Problem & Practical Gap)             │
│   2. How It Works (Client-Side / Local System Design)       │
│   3. Results (Metrics Strip & Performance Latency)          │
├─────────────────────────────────────────────────────────────┤
│ Next Project Footer Card                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Section Breakdown & Content Rules

### 4.1 Problem & Constraints (or "Why I Built This")
- **Focus:** The real operational environment and why standard tools fell short.
- **Rules:** Explicitly name physical constraints (e.g. low-bandwidth cellular reception in provincial regions, 500-page paper exam manuals, zero cloud infrastructure budget, 2-hour scoring windows).

### 4.2 How It's Built
- **Focus:** System design, component breakdown, and intentional technology choices.
- **Rules:** Explain why tool A was chosen over tool B (e.g. Drift SQLite with SQLCipher over Supabase for 100% offline security). Include real code snippets or schemas where relevant.

### 4.3 Hurdles & Solutions (Flagship Tier)
- **Focus:** The hardest technical barriers encountered during implementation.
- **Rules:** Detail the bug or bottleneck (e.g. database schema migrations on encrypted local storage, async race conditions in Discord tournament check-ins) and how it was solved.

### 4.4 Results & Numbers
- **Focus:** Real-world metrics and retrospective takeaways.
- **Rules:** Use verified numbers from primary sources (`CV Professional Aerol.pdf`, production logs). Include a brief 1-2 sentence retrospective note on what would be improved today.

---

## 5. Data Schema Definition (`lib/data/projects.ts`)

```typescript
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

  // Structured Storytelling Fields
  problem: string;
  architecture: ProjectArchitectureItem[];
  hurdles?: ProjectHurdle[];
  results: string;
  metrics?: ProjectMetric[];
  retrospective?: string;
}
```

---

## 6. Implementation Plan & Target Files

1. **`lib/data/projects.ts`**: Update `ProjectItem` interface and populate unsloped copy, hurdles, and retrospectives for all 12 projects.
2. **`docs/portfolio-copy.md`**: Sync copy reference file with full case study narrative blocks.
3. **`app/projects/[slug]/page.tsx`**: Update rendering logic to display Hurdles & Solutions, trade-off callouts, code snippets, and Retrospective notes cleanly.
4. **Verification**: Run `npm run build` and `npx vitest run` to ensure zero compilation or type regressions.
