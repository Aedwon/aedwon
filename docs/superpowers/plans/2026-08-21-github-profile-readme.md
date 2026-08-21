# GitHub Profile & Repository README Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a high-signal, developer-focused GitHub profile and repository README for `Aedwon/aedwon` featuring visual badges, real project media, concrete metrics, and unslop technical copy.

**Architecture:** A single Markdown document (`README.md`) that serves as both the GitHub profile README (`github.com/Aedwon`) and the repository codebase guide. Uses flat-square badge shields, relative asset paths from `./public/`, structured project entries with metrics, an HTML logo showcase grid, and a collapsible `<details>` block for codebase setup.

**Tech Stack:** GitHub Flavored Markdown, HTML5 (`<details>`, `<img>`), Shields.io badges, local SVG/WebP assets.

## Global Constraints

- Tone: Authentic, grounded technical builder (Hiroki Osame model in `docs/tone-reference.md`).
- Writing guardrails: Zero AI buzzwords (*delve, tapestry, navigate, robust, seamless, leverage, holistic, bespoke, curated, meticulous, vibrant, revolutionize*).
- Asymmetry: Break Rule-of-Three triplets.
- Em-dash cap: Maximum 1-2 across the entire document.
- Asset paths: Use clean relative paths (e.g., `./public/logos/...` or `./public/projects/...`) so images render correctly on GitHub.

---

### Task 1: Verify Local Asset Paths and Prepare Media References

**Files:**
- Reference: `public/logos/`, `public/projects/`, `lib/data/affiliations.ts`

**Interfaces:**
- Consumes: Assets in `public/logos/` and `public/projects/`
- Produces: Confirmed list of existing image file paths for README references

- [ ] **Step 1: Check existence of all referenced project images and partner logos**

Run:
```bash
ls -la public/projects/msl-network-discord.webp public/projects/qr-studio.webp public/projects/kiosk-survey.webp
ls -la public/logos/up-diliman.svg public/logos/pshs.svg public/logos/dost.svg public/logos/psysc.svg public/logos/moonton.svg public/logos/dls.svg public/logos/hoyoverse.svg public/logos/riot-games.svg public/logos/ayala-malls.svg public/logos/sm-supermalls.svg public/logos/smart.svg public/logos/converge.svg public/logos/msi.svg public/logos/oppo.svg public/logos/zowie.svg public/logos/ilocos-sur.webp public/logos/lgu-norala.webp public/logos/up-fair.webp public/logos/hotel101.webp public/logos/chronos.webp
```
Expected: All files exist and are readable.

- [ ] **Step 2: Commit asset verification status if any staging is needed**

Run:
```bash
git status
```

---

### Task 2: Implement the Complete `README.md`

**Files:**
- Modify: `README.md`
- Reference: `docs/superpowers/specs/2026-08-21-github-profile-readme-design.md`

**Interfaces:**
- Consumes: Design spec in `docs/superpowers/specs/2026-08-21-github-profile-readme-design.md` and copy in `docs/portfolio-copy.md`
- Produces: Complete `README.md`

- [ ] **Step 1: Write the complete README.md content**

Write `README.md` with:
1. Header & Identity: Bio, scholarship background, and flat-square social shields (Portfolio, LinkedIn, Discord, Email).
2. Core Technical Stack: Four grouped categories (Mobile & Offline, Backend & Systems, Frontend & Web, Engineering Workflows) with flat-square shields.
3. Featured Systems & Projects:
   - **Pantas** (Lead Architect & Developer) · `[Flutter]` `[Dart]` `[Drift/SQLite]` `[SQLCipher]` `[FSRS-6]`
   - **The MSL Network & League Infrastructure** · `[Python]` `[Discord.py]` `[MySQL]` `[Asyncio]` `[VPS]` + preview screenshot
   - **Norala SB Legislative Transparency Portal** · `[TypeScript]` `[Next.js]` `[SQLite FTS5]` `[Tailwind CSS]` `[PWA]`
   - **PSO Automated Scoring & Ranking Engine** · `[Python]` `[NumPy]` `[Pandas]`
   - **QR Studio** · `[TypeScript]` `[HTML5 Canvas]` `[Vite]` `[Tailwind CSS]` + preview screenshot
   - **Kiosk Survey** · `[Flutter]` `[Dart]` `[Android TV]` `[SQLite]` + preview screenshot
   - **BetterGov PH** · `[TypeScript]` `[Next.js]` `[Tailwind CSS]`
4. Affiliations & Brand Partners: Structured HTML image grid featuring organization and brand logos.
5. Collapsible Codebase Documentation: `<details><summary><b>About This Repository & Local Setup</b></summary>...</details>` with commands for `npm install`, `npm run dev`, `npm test`, and `npm run build`.

- [ ] **Step 2: Verify README content against all guardrails**

Check for:
- Zero banned buzzwords
- Max 1-2 em-dashes
- Accurate metrics matching `docs/portfolio-copy.md`

- [ ] **Step 3: Commit `README.md`**

```bash
git add README.md
git commit -m "docs: write high-signal github profile and repo readme"
```

---

### Task 3: Verification and Quality Assurance

**Files:**
- Verify: `README.md`

**Interfaces:**
- Consumes: `README.md`
- Produces: Verified markdown document ready for GitHub profile and repo visitors

- [ ] **Step 1: Run automated tests to ensure repo test suite still passes**

Run: `npm test`
Expected: All tests pass.

- [ ] **Step 2: Lint and type check check**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 3: Confirm git log and clean working tree**

Run: `git status`
Expected: Clean working tree.
