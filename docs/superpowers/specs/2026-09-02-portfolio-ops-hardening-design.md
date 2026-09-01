# Portfolio OSS publishing hardening design

## Goal

Make automated open-source portfolio updates safe to run without routine human approval while preserving fast publication of meaningful upstream changes.

## Architecture

The OSS system is split into two loops. A daily contribution loop discovers and executes new external contributions. An hourly observer watches existing external PRs and reconciles meaningful state changes into the portfolio through an isolated branch/PR instead of writing directly to `main`.

Portfolio publishing is transactional. The observer records the authoritative upstream state, stages one coherent portfolio update, runs repository verification and Vercel preview validation, re-fetches the upstream evidence immediately before merge, and merges only when both the source fact and rendered output are still valid. Failures or missing evidence leave the last known-good production portfolio untouched.

## Portfolio repository changes

1. Remove the policy assumption that portfolio GitHub Actions minutes need conservation. Standard GitHub-hosted runners in this public repository may run normally. Avoid duplicate runs for operational clarity, not minute conservation.
2. Align CI and Vercel on Node 24.x by declaring the Node engine in `package.json` and updating the workflow runtime.
3. Add workflow concurrency keyed by ref so obsolete in-progress verification for the same branch is cancelled when a newer commit supersedes it.
4. Replace the lossy PR status model with structured lifecycle facts. Pull requests have independent PR state and review state, plus optional release metadata. Human-readable labels are derived from those facts.
5. Add dedicated invariants for contribution records: unique PR identity, URL/repository consistency, merged-before-release, approved-state rendering, and no duplicate PR numbers inside one upstream repository.
6. Keep `[skip vercel]` only as an explicit escape hatch. Portfolio data changes remain deployment-relevant. The automated publisher must not use `[skip ci]` or `[skip vercel]` for ordinary portfolio reconciliation.

## Automated publishing protocol

1. Discover external PR changes globally for author `Aedwon`.
2. Treat missing API data as unknown, never as evidence for downgrading a published state.
3. Batch all material portfolio state transitions found in one observer cycle.
4. Read current `AGENTS.md` and current portfolio data before editing.
5. Reuse one deterministic automation branch for the current reconciliation transaction when safe; never duplicate an already-staged transition.
6. Verify the diff contains only intended portfolio changes.
7. Require GitHub Actions verification on the staging PR. Do not use CI-skip commit messages.
8. Require the Vercel preview corresponding to the staging head SHA to reach a successful state, then smoke-test affected contribution/project pages.
9. Immediately before merge, re-fetch the upstream PR/release facts. If they changed, do not merge stale content; update or abandon the staged transaction.
10. Merge only after verification and revalidation pass. After merge, verify the production deployment Git SHA equals the merged portfolio SHA and smoke-test the affected public pages.
11. If verification fails for a contribution-caused reason, repair the staging branch. If failure is unrelated infrastructure, leave `main` unchanged and retry later without churning content.

## Scheduling

- Daily, around 08:00 Asia/Manila: new contribution discovery and autonomous execution, including OSS program eligibility checks.
- Hourly: existing PR follow-through plus transactional portfolio reconciliation.
- Notifications only for meaningful upstream developments, autonomous public contribution actions, portfolio publication, merge/release outcomes, or genuine user-only hard stops.

## Safety and idempotency

Every run compares upstream authoritative state, current `main`, and any existing staged portfolio transaction before writing. An already-applied state transition is a no-op. New assignees, competing PRs, scope changes, contribution policy changes, issue closure, release changes, or unavailable authoritative evidence invalidate stale decisions instead of being guessed through.
