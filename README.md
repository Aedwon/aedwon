# Aerol Balayon (@Aedwon)

<p align="left">
  <a href="https://aedwon.com"><img src="https://img.shields.io/badge/Portfolio-aedwon.com-18181B?style=flat-square&logo=safari&logoColor=white" alt="Portfolio" /></a>
  <a href="https://linkedin.com/in/aedwon"><img src="https://img.shields.io/badge/LinkedIn-aedwon-0A66C2?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn" /></a>
  <a href="https://discord.com/users/aedwon"><img src="https://img.shields.io/badge/Discord-@aedwon-5865F2?style=flat-square&logo=discord&logoColor=white" alt="Discord" /></a>
  <a href="mailto:aerol.balayon@gmail.com"><img src="https://img.shields.io/badge/Email-aerol.balayon@gmail.com-EA4335?style=flat-square&logo=gmail&logoColor=white" alt="Email" /></a>
</p>

I studied Computer Science at the University of the Philippines Diliman on a DOST-SEI Merit Scholarship, following high school at Philippine Science High School.

I build offline-first mobile applications, community operations bots, and civic tech tooling.

---

## Core Technical Stack

<table>
  <tr>
    <td width="25%"><b>Mobile & Offline</b></td>
    <td>
      <img src="https://img.shields.io/badge/Flutter-02569B?style=flat-square&logo=flutter&logoColor=white" alt="Flutter" />
      <img src="https://img.shields.io/badge/Dart-0175C2?style=flat-square&logo=dart&logoColor=white" alt="Dart" />
      <img src="https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white" alt="SQLite" />
      <img src="https://img.shields.io/badge/SQLCipher-256--bit_AES-2D3748?style=flat-square" alt="SQLCipher" />
      <img src="https://img.shields.io/badge/Android_TV-3DDC84?style=flat-square&logo=android&logoColor=white" alt="Android TV" />
    </td>
  </tr>
  <tr>
    <td width="25%"><b>Backend & Systems</b></td>
    <td>
      <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python" />
      <img src="https://img.shields.io/badge/Discord.py-5865F2?style=flat-square&logo=discord&logoColor=white" alt="Discord.py" />
      <img src="https://img.shields.io/badge/Asyncio-Queues-0288D1?style=flat-square" alt="Asyncio" />
      <img src="https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white" alt="MySQL" />
      <img src="https://img.shields.io/badge/Linux_VPS-KVM2-FCC624?style=flat-square&logo=linux&logoColor=black" alt="Linux VPS" />
    </td>
  </tr>
  <tr>
    <td width="25%"><b>Frontend & Web</b></td>
    <td>
      <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
      <img src="https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js" />
      <img src="https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React" />
      <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
      <img src="https://img.shields.io/badge/HTML5_Canvas-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML5 Canvas" />
      <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
    </td>
  </tr>
  <tr>
    <td width="25%"><b>Workflows & QA</b></td>
    <td>
      <img src="https://img.shields.io/badge/Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white" alt="Vitest" />
      <img src="https://img.shields.io/badge/TDD_Workflows-059669?style=flat-square" alt="TDD" />
      <img src="https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white" alt="Git" />
      <img src="https://img.shields.io/badge/FSRS--6_Spaced_Repetition-4F46E5?style=flat-square" alt="FSRS-6" />
    </td>
  </tr>
</table>

---

## Featured Systems & Projects

### 1. [Pantas](https://pantas.app) · Flagship Mobile App
> Lead Architect & Developer · 2024 to Present · Flutter, Dart, Drift (SQLite), SQLCipher, Riverpod, FSRS-6

Mobile exam reviewer for Philippine Civil Service and UPCAT entrance tests that functions 100% offline.
- **On-Device Memory Decay:** Implemented the FSRS-6 spaced repetition algorithm in pure Dart with on-device parameter optimization, fitting student retention models locally after 200 reviews without sending logs to cloud servers.
- **Encrypted Local Persistence:** Uses Drift SQLite with 256-bit AES SQLCipher for RA 10173 compliance, delivering sub-15ms query times across 2,216+ question items and an OMR canvas bubble sheet.
- **Offline-First Entitlements:** Uses a fail-open caching policy so verified Pro users never lose access during long offline commutes.

---

### 2. [The MSL Network & League Infrastructure](https://github.com/Aedwon) · Community Platform
> Platform Architect & Operations Lead · 2022 to Present · Python, Discord.py, MySQL, Linux KVM2 VPS, Asyncio

Automated student verification and tournament engine scaling the collegiate gaming community to 10,000+ verified members across 180+ Philippine universities.
- **Automated Verification:** Validates student credentials against campus registrar records, assigning university-specific permissions and competitive divisions.
- **Rate-Limit Resilient Architecture:** Handles tournament check-in spikes across 800+ simultaneous players using token bucket rate limiters and queued role workers, cutting admin overhead by 90%.

<p align="center">
  <img src="./public/projects/msl-network-discord.webp" width="90%" alt="MSL Network Discord Interface" />
</p>

---

### 3. [Norala SB Legislative Transparency Portal](https://github.com/Aedwon) · Civic Tech
> Creator & Full-Stack Architect · 2024 · TypeScript, Next.js, SQLite FTS5, Tailwind CSS, PWA

Municipal digital portal indexing enacted local ordinances and resolutions for the Municipality of Norala, South Cotabato.
- **Sub-Second Full-Text Search:** Uses SQLite FTS5 to index decades of legislative records for fast keyword retrieval on mobile devices.
- **Offline PWA Support:** Caches recent gazette entries via Workbox service workers to ensure readability in rural areas with spotty cellular coverage.

---

### 4. PSO Automated Scorer & Ranking Model · Competition Systems
> Lead Scoring Architect · 2024 · Python, NumPy, Pandas, Google Sheets API

Automated scoring pipeline built for the Philippine Society of Youth Science Clubs (PSYSC), evaluating 4,000+ high school competitors in the National Science Club Month Science Olympiad.
- **Vectorized Matrix Evaluation:** Vectorized NumPy operations grading regional cluster answer keys and applying tier penalties in seconds.
- **Deterministic Multi-Key Ranking:** Automated tiebreaker resolution sorting total scores, difficulty-weighted tiers, and submission timestamps with 100% accuracy.

---

### 5. [QR Studio](https://github.com/Aedwon) · In-Browser Tooling
> Creator · 2024 · TypeScript, HTML5 Canvas, Vite, Tailwind CSS

In-browser QR code builder with gradient pattern customization and vector SVG export.
- **Zero-Network Architecture:** Encodes payload bits and generates Reed-Solomon error correction matrices entirely in memory.
- **Zero Data Leakage:** Generates print-ready vector files with 0ms network latency and zero tracking requests.

<p align="center">
  <img src="./public/projects/qr-studio.webp" width="90%" alt="QR Studio Vector Generator" />
</p>

---

### 6. Kiosk Survey · Offline Venue Systems
> Lead Developer · 2023 to 2024 · Flutter, Dart, SQLite, Android TV OS

Touchscreen survey system built for interactive event booths under severe venue cellular congestion.
- **Zero-Loss Journaling:** Attendees submit responses directly to a local SQLite journal on Android TV hardware.
- **Atomic Batch Sync:** Operates continuously for 8 hours without internet connectivity, flushing queued records atomically once a network connection is detected.

<p align="center">
  <img src="./public/projects/kiosk-survey.webp" width="90%" alt="Kiosk Survey Android TV Terminal" />
</p>

---

### 7. [BetterGov PH](https://bettergov.ph) · Open Source Contributor
> Contributor · 2024 to Present · TypeScript, Next.js, Tailwind CSS

Contributing to civic technology initiatives modernizing Philippine government web portals and public open data accessibility.

---

## Organizations & Brand Partners

Entities and brands I have built software or directed operations for:

### Organizations & LGUs
<p align="left">
  <img src="./public/logos/up-diliman.svg" height="42" alt="UP Diliman" />&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./public/logos/dost.svg" height="42" alt="DOST-SEI" />&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./public/logos/pshs.svg" height="42" alt="PSHS" />&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./public/logos/psysc.svg" height="42" alt="PSYSC" />&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./public/logos/moonton.svg" height="42" alt="MOONTON Games" />&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./public/logos/dls.svg" height="42" alt="Dark League Studios" />&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./public/logos/hoyoverse.svg" height="42" alt="HoYoverse / miHoYo" />&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./public/logos/ilocos-sur.webp" height="42" alt="Provincial Government of Ilocos Sur" />&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./public/logos/lgu-norala.webp" height="42" alt="Municipality of Norala" />
</p>

### Event & Brand Partners
<p align="left">
  <img src="./public/logos/riot-games.svg" height="34" alt="Riot Games" />&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./public/logos/ayala-malls.svg" height="34" alt="Ayala Malls" />&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./public/logos/sm-supermalls.svg" height="34" alt="SM Supermalls" />&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./public/logos/smart.svg" height="34" alt="Smart Communications" />&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./public/logos/converge.svg" height="34" alt="Converge ICT" />&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./public/logos/msi.svg" height="34" alt="MSI" />&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./public/logos/oppo.svg" height="34" alt="OPPO" />&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./public/logos/zowie.svg" height="34" alt="BenQ ZOWIE" />&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./public/logos/hotel101.webp" height="34" alt="Hotel101" />&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./public/logos/chronos.webp" height="34" alt="Chronos Athletics" />
</p>

---

<details>
<summary><b>About This Repository & Local Setup</b></summary>

<br />

This repository contains the source code for my personal portfolio website ([aedwon.com](https://aedwon.com)).

### Tech Stack
- **Framework:** Next.js 16 (App Router)
- **UI & State:** React 19, Tailwind CSS, Framer Motion
- **Testing:** Vitest, React Testing Library
- **Icons & Assets:** Lucide React, Simple Icons

### Getting Started

```bash
# Clone the repository
git clone https://github.com/Aedwon/aedwon.git
cd aedwon

# Install dependencies
npm install

# Start local development server
npm run dev

# Run test suite
npm test

# Build production bundle
npm run build
```

</details>

---

<p align="center">
  <sub>Aerol Balayon (@Aedwon) · Built with Next.js & Tailwind CSS</sub>
</p>
