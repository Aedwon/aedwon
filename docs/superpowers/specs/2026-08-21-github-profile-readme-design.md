# GitHub Profile & Repository README Design Specification

- **Date:** 2026-08-21
- **Target File:** `README.md`
- **Reference Copy:** `docs/portfolio-copy.md`, `docs/tone-reference.md`, `AGENTS.md`
- **Persona & Tone:** Grounded technical builder, authentic, unslop standard (Hiroki Osame model).

---

## 1. Overview & Dual Purpose

This repository (`Aedwon/aedwon`) serves as:
1. **GitHub Profile README:** Rendered on `github.com/Aedwon`.
2. **Portfolio Codebase Documentation:** Source code repository for Aerol's personal portfolio website built with Next.js 16 and React 19.

The README must convey technical competence, clear problem-solving, real metrics, and clean visual structure without relying on generic AI buzzwords or fluff.

---

## 2. Structure & Visual Sections

### 2.1 Header & Identity
- **Title:** `# Aerol Balayon (@Aedwon)`
- **Bio:** Computer Science student at University of the Philippines Diliman on a DOST-SEI Merit Scholarship, Philippine Science High School alum.
- **Focus:** Offline-first mobile applications, community automation bots, and civic tech.
- **Social & Platform Badges (Flat-Square Shields with Brand Icons):**
  - Portfolio (`aedwon.com`)
  - LinkedIn (`linkedin.com/in/aedwon`)
  - Discord (`@aedwon`)
  - Email (`aerol.balayon@gmail.com`)

### 2.2 Core Technical Stack (Visual Badges)
Grouped cleanly into four distinct disciplines with official brand icons:
- **Mobile & Offline:** Flutter, Dart, SQLite, SQLCipher, Android
- **Backend & Systems:** Python, Discord.py, MySQL, Linux, Google Cloud
- **Frontend & Web:** TypeScript, Next.js, React, Tailwind CSS, Vite, HTML5 Canvas
- **Engineering Workflows:** Claude Code, Vitest, Git

### 2.3 Featured Systems & Projects
Each project item includes title, role tag, stack badges, technical summary with concrete numbers, and preview media where available:

1. **Pantas (Flagship)**
   - *Role:* Lead Architect & Developer
   - *Platform:* Flutter, Dart, Drift (SQLite), SQLCipher, Riverpod, FSRS-6
   - *Summary:* Mobile reviewer for Philippine civil service and university entrance exams running 100% offline. Custom pure Dart FSRS-6 spaced repetition algorithm with on-device parameter optimization, 256-bit AES database encryption (RA 10173 compliant), and custom OMR bubble sheet engine with sub-15ms queries across 2,200+ items.
   - *Links:* Case Study / [pantas.app](https://pantas.app)

2. **The MSL Network & League Infrastructure (Flagship)**
   - *Role:* Platform Architect & Lead Developer
   - *Platform:* Python, Discord.py, MySQL, Asyncio, Hostinger VPS
   - *Summary:* Automated tournament verification and operations bot for 10,000+ collegiate players across 180+ Philippine universities. Features token bucket rate limiters, asynchronous role hierarchy workers, and MySQL connection pooling, cutting tournament check-in overhead by 90%.
   - *Media:* `./public/projects/msl-network-discord.webp`

3. **Norala SB Legislative Portal (Flagship)**
   - *Role:* Creator & Full-Stack Architect
   - *Platform:* TypeScript, Next.js, SQLite FTS5, Tailwind CSS, PWA
   - *Summary:* Legislative transparency portal providing citizens sub-second full-text search across municipal ordinances and resolutions, with contrast-normalized OCR and offline PWA caching via Workbox.

4. **PSO Automated Scoring & Ranking Engine (Flagship)**
   - *Role:* Lead Scoring Architect
   - *Platform:* Python, NumPy, Pandas, Google Sheets API
   - *Summary:* Vectorized matrix scoring pipeline for 4,000+ national science competition competitors across regional cluster elimination rounds, featuring deterministic multi-key tiebreaker resolution and 100% tabulation accuracy.

5. **QR Studio**
   - *Role:* Creator & Frontend Engineer
   - *Platform:* TypeScript, HTML5 Canvas, Vite, Tailwind CSS
   - *Summary:* In-browser QR code builder with gradient styling and SVG export that runs entirely client-side with 0ms network latency and zero server requests.
   - *Media:* `./public/projects/qr-studio.webp`

6. **Kiosk Survey**
   - *Role:* Lead Developer
   - *Platform:* Flutter, Dart, Android TV, SQLite
   - *Summary:* Touchscreen survey application for Android TV operating continuously for 8 hours on-site during a high-density live event without internet, syncing queued JSON responses atomically upon reconnection.
   - *Media:* `./public/projects/kiosk-survey.webp`

7. **BetterGov PH (Open Source)**
   - *Role:* Open Source Contributor
   - *Platform:* TypeScript, Next.js, Tailwind CSS
   - *Summary:* Contributor to civic tech initiatives modernizing Philippine government web services and open public data accessibility.
   - *Links:* [bettergov.ph](https://bettergov.ph) · [github.com/bettergovph](https://github.com/bettergovph)

### 2.4 Affiliations, Institutions & Brand Partners
Logo showcase referencing SVG and webp assets from `./public/logos/`:
- **Organizations & LGUs:** UP Diliman, DOST-SEI, Philippine Science High School, PSYSC, MOONTON Games (MSL), Dark League Studios, miHoYo (HoYoverse), Provincial Government of Ilocos Sur, Municipality of Norala.
- **Event & Brand Partners:** Riot Games, Ayala Malls, SM Supermalls, Smart Communications, Converge ICT, MSI, Hotel101, OPPO, BenQ ZOWIE, Chronos Athletics.

### 2.5 Codebase & Local Development (Collapsible `<details>`)
Folded reference section for visitors exploring the repository source code:
- **Stack:** Next.js 16 (App Router), React 19, Tailwind CSS, Framer Motion, Vitest.
- **Commands:**
  ```bash
  # Install dependencies
  npm install

  # Run local development server
  npm run dev

  # Run unit & component tests
  npm test

  # Build production bundle
  npm run build
  ```

---

## 3. Writing Guardrail Compliance
- **No Sycophancy / Affirmation Fillers:** Direct, matter-of-fact tone.
- **No Rule-of-Three Symmetry:** Asymmetric bullet groupings (e.g. 4 core disciplines, 7 projects, 2 logo groups).
- **Banned AI Vocabulary:** Zero occurrences of *delve, tapestry, testament, navigate, robust, seamless, leverage, holistic, bespoke, curated, meticulous, vibrant, foster, elevate, revolutionize, passionate*.
- **Em-Dashes:** Maximum 1-2 across the entire document.
