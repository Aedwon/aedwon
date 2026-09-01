# Portfolio OSS Publishing Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make automated OSS portfolio reconciliation safe, transactional, and self-verifying while keeping contribution discovery daily and existing-PR observation hourly.

**Architecture:** New-contribution discovery and existing-PR reconciliation are separate scheduled loops. Portfolio updates stage through pull requests, while repository changes add a structured contribution lifecycle model plus invariants, align CI with production Node, and isolate PR verification from production verification.

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
- Modify: `lib/agent-content.ts`
- Modify: `lib/__tests__/agent-content.test.ts`

**Interfaces:**
- Produces `PullRequestState = "draft" | "open" | "merged" | "closed"`.
- Produces `PullRequestReviewState = "pending" | "approved" | "changes_requested" | "not_applicable"`.
- Produces `getPullRequestStatusLabel(pr: UpstreamPullRequest): string` for UI and agent-facing Markdown rendering.
- Produces `validateOpenSourceProjects(projects): string[]` for registry invariants.

- [x] **Step 1: Write failing lifecycle invariant tests**

Added Vitest coverage for approved open PRs, merged PRs, released merged PRs, impossible release state, duplicate repository/PR identities, URL identity consistency, and the live registry itself.

- [x] **Step 2: Verify RED before implementation**

GitHub Actions run 205 produced four expected failures while the pre-existing suite had 80 passing tests. A later regression run exposed the remaining `pr.status` consumer in agent-facing Markdown, and a final review test proved malformed open-plus-release data would overclaim a release before the fail-closed fix.

- [x] **Step 3: Implement the structured model**

Replaced presentation-only PR `status` with `state`, `reviewState`, and optional `release`. Migrated Aspire, OpenSRE, DockRoute, and BetterGov without changing their truthful public meaning.

- [x] **Step 4: Derive labels everywhere**

The contribution UI and agent-facing Markdown now use the same lifecycle helper. Release labels are emitted only for merged PRs, so inconsistent release metadata fails toward the lower supported claim.

- [x] **Step 5: Verify lifecycle tests GREEN**

The lifecycle and live-registry invariant tests passed in subsequent workflow runs; later RED cycles were isolated to newly added CI-contract assertions.

### Task 2: CI/runtime parity and deterministic verification topology

**Files:**
- Modify: `package.json`
- Modify: `.github/workflows/verify.yml`
- Modify: `lib/data/__tests__/open-source.test.ts`

**Interfaces:**
- Node runtime contract: `>=24 <25`.
- GitHub maintained actions: `actions/checkout@v7` and `actions/setup-node@v7`.
- Feature and automation branches verify through `pull_request` only.
- `main` verifies through `push`.
- Concurrency group: `portfolio-${{ github.workflow }}-${{ github.event.pull_request.number || github.ref_name }}` with `cancel-in-progress: true`.

- [x] **Step 1: Add repository tests for runtime and workflow contracts**

The test reads `package.json` and `.github/workflows/verify.yml` and asserts Node 24 parity, current GitHub-maintained action majors, PR-only branch verification, production push verification, and isolated concurrency.

- [x] **Step 2: Verify RED states before each hardening change**

The initial runtime contract failed because the package engine was absent and the workflow selected Node 22. A later run failed on the deprecated v4 action contract. Observed workflow behavior also showed that branch-push and PR events could both be scheduled, motivating the simpler PR-only branch topology.

- [x] **Step 3: Implement runtime/action parity and verification topology**

Added `"engines": { "node": ">=24 <25" }`, selected Node 24 in Actions, upgraded checkout/setup-node to v7 after checking their current upstream releases, removed feature-branch push verification, and isolated PR-number concurrency from `main` concurrency.

- [ ] **Step 4: Verify the final CI contract GREEN on the final PR head**

The final pull-request workflow run is the acceptance gate for this step.

### Task 3: Full repository verification and publication

- [x] **Step 1: Run full tests on an implementation head**

A complete repository run passed after the agent-Markdown migration. The final PR run must pass again on the final head.

- [x] **Step 2: Run lint on an implementation head**

Lint passed in both branch and PR verification before the final workflow-topology refinement.

- [x] **Step 3: Run production build on Node 24**

The production Next.js build passed on Node 24, matching the Vercel project runtime.

- [x] **Step 4: Inspect the staged diff**

Manual connected review found and fixed the legacy Markdown status consumer, fail-open release rendering, duplicate workflow-trigger topology, and deprecated GitHub action majors. No dependency lockfile or unrelated content churn was introduced.

- [x] **Step 5: Open staging PR**

PR #22, `Harden OSS portfolio publishing and verification`, stages the change from `codex/portfolio-ops-hardening-r1` into `main`. Merge remains conditional on the final GitHub verification and matching Vercel preview being green on the exact final head.
