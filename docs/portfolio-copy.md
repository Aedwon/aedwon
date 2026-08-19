# Portfolio Copy Reference (Single Source of Truth)

> Working copy reference for Aerol's (Aedwon) personal portfolio.
> Grounded in real data from `CV Professional Aerol.pdf`, `github.com/Aedwon`, and local workspaces in `Projects/`.
> Edit this document directly to refine text, project notes, and case study details.

---

## 1. Homepage (`/`)

### 1.1 Intro
```markdown
I'm Aerol (Aedwon).
I study Computer Science at UP Diliman and build tooling for student esports leagues. Most of my work is split between web apps in TypeScript and event automation in Python.
```

### 1.2 Featured Projects
```markdown
Projects

• Pantas
  Mobile exam prep app for the Philippine Civil Service Exam and UPCAT. Built with Flutter. Uses a custom spaced repetition schedule and physical OMR-style mock answer sheets.
  Links: [pantas.app ↗] · [Build notes →]

• Genshin DPS Calculator
  In-browser team rotation and damage calculator built with React 19 and Zustand. Enforces KeqingMains (KQMS) artifact substat standards with zero backend dependencies.
  Links: [Open tool ↗] · [Build notes →]

• Norala SB Transparency Portal
  Municipal legislative portal for the municipal council of Norala, South Cotabato. Republishes public ordinances and resolutions for phone-friendly reading.
  Links: [Demo ↗] · [Build notes →]

• QR Studio
  Client-side QR code generator with gradient rendering and SVG export. Runs entirely in the browser using HTML5 Canvas with no backend.
  Links: [Try tool ↗] · [Build notes →]

• Kiosk Survey
  Android TV touchscreen survey app built for on-site events. Kept running for an 8-hour live event without Wi-Fi, queuing survey submissions locally and syncing once network returned.
  Links: [Build notes →]

• MSL Network Discord Bot
  Verification and community automation bot for a 5,000+ member gaming hub. Connects Discord with Google Sheets for student verification and seasonal event leaderboards.
  Links: [Build notes →]

• MSL Collegiate Cup Bot
  Tournament management bot for 3,271 collegiate competitors across 180+ universities. Automates match check-ins and support tickets.
  Links: [Build notes →]

• Lakambini Events
  Web redesign for an event styling business. Rebuilt the booking path so clients find packages in fewer clicks.
  Links: [Live site ↗] · [Build notes →]

• WebP Unli
  Browser-based image converter for batch WebP encoding with zero server uploads.
  Links: [Tool ↗] · [Build notes →]
```

### 1.3 Secondary Projects & Tooling
```markdown
Other work & experiments

• BetterGov PH — Open-source contributor to civic tech initiatives modernizing Philippine government web services.
• MCC S2 Match Explorer — Standings and bracket viewer for the Moonton Collegiate Cup Season 2.
• MLBB Post-Game Extractor — Script that parses scoreboard screenshots into structured match statistics.
• ISFE Bot — Tournament logistics bot syncing Discord registrations with Challonge brackets for Ilocos Sur Festival Esports.
```

### 1.4 Experience & Community Operations
```markdown
Experience

• Head of League Operations, MSL Collegiate Cup — Directed tournament operations for 3,000+ student players across 180+ universities. Wrote a custom Discord bot that automated match check-ins, cutting admin overhead by 90%.
• Discord Moderator, miHoYo — Moderated the official 100,000+ member Southeast Asia server for Genshin Impact.
• Co-Head for Logistics & Security, UP Fair 2024 — Co-led venue logistics and crowd safety for a week-long festival with 90,000+ attendees.
• National Admin for Partnerships, Moonton Student Leaders PH — Maintained a centralized database for 10,000+ student members and wrote Google Apps Scripts pipelines to automate reporting for 70+ partner organizations.
• Community Manager, Blue Protocol: Star Resonance — Handled announcements, event cadences, and dispute mediation across a 60,000+ member global server.

About

I started organizing grassroots tournaments and managing gaming communities in high school. When updating brackets, verifying student IDs, and cross-referencing spreadsheets for hundreds of teams became too slow by hand, I taught myself Python to automate the work.

That led me to study Computer Science at UP Diliman as a DOST Scholar.

Outside of software, I run logistics and operations for on-ground events. I've co-led crowd security for UP Fair and managed project schedules for esports broadcasts.
```

### 1.5 Contact
```markdown
Contact

If you want to talk about community systems, have an interesting project, or just want to say hi:

• Email: aerol.balayon@gmail.com
• GitHub: github.com/Aedwon
• Discord: @aedwon
• LinkedIn: linkedin.com/in/aedwon
```

---

## 2. Case Study Outlines (`/work/[slug]`)

### 2.1 Pantas (`/work/pantas`)
- **Category:** Mobile App / EdTech
- **Stack:** Flutter, Dart, SQLite
- **The Spark:** Civil Service Exam and UPCAT preparation often relies on bulky paper reviewers or poorly formatted PDF dumps. Built a mobile reviewer that adapts to what you get wrong.
- **Constraints & Research:** Mobile-first, low battery footprint, offline capability. Tested question parsing engines for math and science formulas.
- **Key Decisions:** Custom spaced repetition algorithm scheduling reviews right before the predicted forgetting curve. Added physical OMR-style answer sheets for realistic exam practice.
- **Outcome:** Support for Civil Service Exam & UPCAT with shareable 9:16 progress recap cards.

### 2.2 Genshin DPS Calculator (`/work/gi-calculator`)
- **Category:** Theorycrafting Tool
- **Stack:** React 19, Vite, Zustand, TypeScript
- **The Spark:** Existing web calculators are either overly simplistic or require complex desktop setups. Wanted a clean web tool strictly enforcing KeqingMains Calculation Standards (KQMS).
- **Key Decisions:** Client-side state management with Zustand, local persistence via `localStorage`, and JSON build import/export for sharing team configurations.
- **Outcome:** Rapid rotation simulations running with zero server costs.

### 2.3 Norala SB Transparency Portal (`/work/norala-sb`)
- **Category:** Civic Tech
- **Stack:** Next.js 16, Tailwind CSS v4, `next-intl`
- **The Spark:** Municipal ordinances and resolutions are often stored in physical filing cabinets that citizens cannot easily search.
- **Key Decisions:** Built as a free student proof-of-concept for LGU donation. Mobile-first search index and bilingual support.
- **Outcome:** Public legislative records accessible on mobile.

### 2.4 QR Studio (`/work/qr-studio`)
- **Category:** Client-Side Tool
- **Stack:** HTML5 Canvas, JavaScript, TypeScript
- **The Spark:** Most web QR code generators are bloated with ads, require accounts, or send sensitive data to backend servers.
- **Key Decisions:** Used HTML5 Canvas for real-time raster rendering and SVG generation for vector exports.
- **Outcome:** Fast, private, zero-backend tool.

### 2.5 Kiosk Survey (`/work/kiosk-survey`)
- **Category:** Offline Event Tool
- **Stack:** Flutter / Dart, Android TV, SQLite
- **The Spark:** Gathering live attendee feedback at event venues where mobile reception drops or Wi-Fi fails under crowd load.
- **Key Decisions:** Built for Android TV touchscreens. Local SQLite queue persisting every survey submission to the device immediately, syncing to cloud database in batches only when connection is detected.
- **Outcome:** Ran 8 continuous hours on-site with zero dropped submissions and zero crashes.

### 2.6 MSL Network & Tournament Automation (`/work/msl-bots`)
- **Category:** High-Scale Community Systems
- **Stack:** Python, Discord.py, MySQL, Google Sheets API
- **The Spark:** Managing 3,000+ tournament players and 5,000+ community members manually creates massive administrative bottlenecks.
- **Key Decisions:** Discord bot bridging Google Sheets registration data with cached MySQL tables for fast role provisioning, automated match check-ins, and seasonal quest tracking.
- **Outcome:** 90% reduction in manual admin workload during live tournament operations.
