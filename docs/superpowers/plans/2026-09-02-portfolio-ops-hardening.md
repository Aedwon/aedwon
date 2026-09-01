# Portfolio OSS Publishing Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make automated OSS portfolio reconciliation safe, transactional, and self-verifying while keeping contribution discovery daily and existing-PR observation hourly.

**Architecture:** New-contribution discovery and existing-PR reconciliation are separate scheduled loops. Repository changes add a structured contribution lifecycle model plus invariants, align CI with production Node, and cancel obsolete same-branch verification runs.

**Tech Stack:** Next.js 16, TypeScript, Vitest, GitHub Actions, Vercel

**Spec:** `docs/superpowers/specs/2026-09-02-portfolio-ops-hardening-design.md`

## Global Constraints

- Do not use `[skip ci]` for normal automated portfolio updates.
- Keep `[skip vercel]` as an explicit escape hatch only; normal OSS portfolio data changes must deploy.
- Missing upstream evidence is unknown, not evidence for a state downgrade.
- Production `main` must remain untouched until staging verification succeeds.
- Automated portfolio copy continues to follow `AGENTS.md`.

---

### Task 1: Structured OSS lifecycle model and invariants

**Files:**
- Create: `lib/data/__tests__/open-source.test.ts`
- Modify: `lib/data/open-source.ts`
- Modify: `components/OpenSourceContributionPage.tsx`

**Interfaces:**
- Produces `PullRequestState = "draft" | "open" | "merged" | "closed"`.
- Produces `PullRequestReviewState = "pending" | "approved" | "changes_requested" | "not_applicable"`.
- Produces `getPullRequestStatusLabel(pr: UpstreamPullRequest): string` for UI rendering.

- [ ] **Step 1: Write failing lifecycle invariant tests**

Add Vitest tests proving that approved open PRs render `Approved`, merged PRs render `Merged`, released merged PRs render `Released · <version>`, a released open PR is rejected by validation, duplicate repository/PR identities are rejected, and PR URLs must match the declared repository and number.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- lib/data/__tests__/open-source.test.ts`
Expected: FAIL because structured lifecycle helpers and validation do not exist.

- [ ] **Step 3: Implement the minimal structured model**

Replace presentation-only `status` with `state`, `reviewState`, and optional `release`. Add pure helpers that derive the visible status string and validate the static registry. Migrate existing Aspire, OpenSRE, DockRoute, and BetterGov records without changing their truthful public meaning.

- [ ] **Step 4: Update the contribution page to use the derived label**

Change the PR status rendering to call `getPullRequestStatusLabel(pr)`.

- [ ] **Step 5: Run the focused tests and verify GREEN**

Run: `npm test -- lib/data/__tests__/open-source.test.ts`
Expected: PASS.

### Task 2: CI/runtime parity and stale-run cancellation

**Files:**
- Modify: `package.json`
- Modify: `.github/workflows/verify.yml`

**Interfaces:**
- Node runtime contract: `>=24 <25`.
- Workflow concurrency group: `portfolio-${{ github.workflow }}-${{ github.ref }}` with `cancel-in-progress: true`.

- [ ] **Step 1: Add a repository test for runtime/workflow contracts**

Extend `lib/data/__tests__/open-source.test.ts` or create a small configuration contract test that reads `package.json` and `.github/workflows/verify.yml`, asserting Node 24 is declared consistently and concurrency cancellation exists.

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- lib/data/__tests__/open-source.test.ts`
Expected: FAIL on the current Node 22 workflow/no package engine/no concurrency contract.

- [ ] **Step 3: Make the minimal config changes**

Add `"engines": { "node": ">=24 <25" }` to `package.json`; change setup-node to `24`; add top-level workflow concurrency keyed by workflow and ref with cancellation enabled.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `npm test -- lib/data/__tests__/open-source.test.ts`
Expected: PASS.

### Task 3: Full repository verification and PR

**Files:**
- Review all changed files from Tasks 1-2.

- [ ] **Step 1: Run full tests**
Run: `npm test`
Expected: PASS.

- [ ] **Step 2: Run lint**
Run: `npm run lint`
Expected: PASS.

- [ ] **Step 3: Run production build**
Run: `npm run build`
Expected: PASS on Node 24.

- [ ] **Step 4: Inspect final diff**
Confirm no unrelated copy, generated files, lockfile churn, or weakened checks.

- [ ] **Step 5: Open a PR from `codex/portfolio-ops-hardening-r1` to `main`**
Require normal GitHub Actions and Vercel preview verification. Do not merge until both are verified and the final diff is reviewed.
