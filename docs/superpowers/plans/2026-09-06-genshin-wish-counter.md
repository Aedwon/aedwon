# Genshin Wish Counter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a read-only personal Genshin wish-statistics page to the portfolio Projects section without exposing authkeys or adding visitor import functionality.

**Architecture:** Add a dedicated static App Router route at `/projects/genshin-wish-counter`, a small normalized wish-data module, and a pure statistics calculator. Register the project through the existing project registry so the normal Projects grid links to the dedicated route. The route renders an empty state until real wish records are supplied.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Lucide React, Vitest

**Spec:** `docs/superpowers/specs/2026-09-06-genshin-wish-counter-design.md`

## Global Constraints

- Keep the page read-only for visitors.
- Never commit or render a HoYoVerse `authkey` or captured wish-history URL.
- Do not publish fabricated personal statistics.
- Use existing portfolio CSS variables and shell.
- Use only existing open-source icon dependencies and CSS/SVG primitives; no Genshin promotional or character artwork.
- Do not add a database or public import endpoint.

---

### Task 1: Wish statistics calculator

**Files:**
- Create: `lib/genshin-wish-stats.ts`
- Create: `lib/__tests__/genshin-wish-stats.test.ts`

**Interfaces:**
- Consumes: normalized `GenshinWishRecord[]`
- Produces: `calculateWishStats(records, bannerType)` and `WishStats | null`

- [ ] **Step 1: Write the failing unit tests** for no-data behavior, current pity, 4-star pity, total wishes, 5-star average pity, and guarantee state.
- [ ] **Step 2: Run the focused test** with `npm test -- lib/__tests__/genshin-wish-stats.test.ts` and verify the module-not-found failure.
- [ ] **Step 3: Implement the minimal pure calculator** in `lib/genshin-wish-stats.ts`.
- [ ] **Step 4: Run the focused test again** and verify it passes.

### Task 2: Canonical project record

**Files:**
- Create: `lib/data/genshin-wish-counter.ts`
- Modify: `lib/data/project-registry.ts`

**Interfaces:**
- Produces: `GENSHIN_WISH_COUNTER_PROJECT: ProjectItem`
- Registry exposes it through `ALL_PROJECTS` and `getProjectBySlug()`.

- [ ] **Step 1: Add a registry test** proving `getProjectBySlug("genshin-wish-counter")` resolves and is categorized under `web`.
- [ ] **Step 2: Run the registry test** and verify it fails before registration.
- [ ] **Step 3: Add the focused project record and registry integration** without changing the generic case-study renderer.
- [ ] **Step 4: Run the registry test** and verify it passes.

### Task 3: Dedicated read-only project page

**Files:**
- Create: `lib/data/genshin-wishes.ts`
- Create: `components/GenshinWishCounterPage.tsx`
- Create: `app/projects/genshin-wish-counter/page.tsx`
- Create: `app/__tests__/genshin-wish-counter-page.test.tsx`

**Interfaces:**
- `GENSHIN_WISHES: GenshinWishRecord[]` is the static public history source and starts empty until real data is imported.
- `GenshinWishCounterPage` receives the static records and derives display statistics through `calculateWishStats`.

- [ ] **Step 1: Write a page test** asserting the route exposes the title, back link, read-only empty state, and no import controls.
- [ ] **Step 2: Run the focused page test** and verify it fails because the route/component does not exist.
- [ ] **Step 3: Implement the route and component** using existing typography, card, border, spacing, and focus variables. Use CSS/SVG decorative primitives only.
- [ ] **Step 4: Run the focused page test** and verify it passes.

### Task 4: Portfolio copy and final verification

**Files:**
- Modify: `docs/portfolio-copy.md`

**Interfaces:**
- Keeps canonical authored copy aligned with the registered project record.

- [ ] **Step 1: Add concise factual project copy** matching the registry entry and current no-data state.
- [ ] **Step 2: Run `npm test`** and verify the full test suite passes.
- [ ] **Step 3: Run `npm run lint`** and verify zero lint errors.
- [ ] **Step 4: Run `npm run build`** and verify the production build succeeds.
- [ ] **Step 5: Review the diff** for leaked authkeys, captured URLs, fabricated wish statistics, or franchise artwork before merge.