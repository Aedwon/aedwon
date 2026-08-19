# Portfolio Copy Reference (Single Source of Truth)

> Working copy reference for Aerol's (Aedwon) personal portfolio.
> Grounded in real data from `CV Professional Aerol.pdf`, `github.com/Aedwon`, LinkedIn, and local workspaces in `Projects/`.
> Edit this document directly to refine text, project notes, and case study details.

---

## 1. Homepage (`/`)

### 1.1 Intro
```markdown
I'm Aerol. You might also know me in the gaming space as Aedwon.

I study Computer Science at UP Diliman, continuing my interests in tech and DOST Merit Scholarship from Philippine Science High School. I like building things :)
```

### 1.2 Featured Projects
*(Note: Tech stacks render as icons in the UI; descriptions are strictly 1-sentence summaries.)*

```markdown
Projects

• Pantas
  Summary: Mobile exam reviewer for Philippine civil service and university entrance tests, featuring adaptive spaced repetition and OMR-style mock exam sheets.
  Stack: [Flutter, Dart, SQLite, LocalStorage]
  Links: [Build notes →]

• The MSL Network & Bot
  Summary: Planned and built the Philippine student gaming hub from scratch to 5,000+ members, powered by custom Discord bots for Google Sheets verification and automated event quests.
  Stack: [Python, Discord.py, MySQL, Google Sheets API]
  Links: [Build notes →]

• PSYSC National Science Olympiad Scoring Engine
  Summary: Co-authored 500+ questions and developed the national scoring mechanics used to evaluate 4,000+ student competitors across regional and national elimination rounds.
  Stack: [Google Apps Script, Data Pipelines]
  Links: [Build notes →]

• Genshin DPS Calculator
  Summary: Client-side team rotation and damage calculator strictly enforcing KeqingMains (KQMS) calculation standards with zero server dependencies.
  Stack: [React 19, Zustand, TypeScript, Vite]
  Links: [Build notes →]

• Norala SB Transparency Portal
  Summary: Municipal legislative portal republishing public ordinances and resolutions for clean mobile reading in Norala, South Cotabato.
  Stack: [Next.js 16, Tailwind CSS v4, TypeScript, next-intl]
  Links: [Build notes →]

• Kiosk Survey
  Summary: Touchscreen survey app for Android TV that operated for 8 continuous hours during a live event without internet, syncing queued submissions once reconnected.
  Stack: [Flutter, Android TV, SQLite, Offline Queue]
  Links: [Build notes →]

• QR Studio
  Summary: In-browser QR code builder with gradient customization and SVG export that runs entirely client-side with no server uploads.
  Stack: [HTML5 Canvas, TypeScript]
  Links: [Build notes →]

• MSL Collegiate Cup Bot
  Summary: Tournament operations bot automating match check-ins and support tickets for 3,271 collegiate competitors across 180+ universities.
  Stack: [Python, Discord.py, Google Sheets API, Challonge API]
  Links: [Build notes →]

• Lakambini Events
  Summary: Event styling studio redesign cutting down booking friction so clients can find package details and pricing in fewer clicks.
  Stack: [Next.js 16, Tailwind CSS v4, TypeScript]
  Links: [Build notes →]

• WebP Unli
  Summary: Browser-based batch image converter that encodes images to WebP locally in the browser with no file size limits.
  Stack: [TypeScript, Canvas API]
  Links: [Build notes →]
```

### 1.3 Secondary Projects & Tooling
```markdown
Other work & experiments

• BetterGov PH: Open-source contributor to civic tech initiatives modernizing Philippine government web services.
• MCC S2 Match Explorer: Standings and match bracket viewer for the Moonton Collegiate Cup Season 2.
• MLBB Post-Game Extractor: Python script that parses scoreboard screenshots into structured match statistics.
• ISFE Bot: Tournament logistics bot syncing Discord registrations with Challonge brackets for Ilocos Sur Festival Esports.
```

### 1.4 Experience & Community Operations
```markdown
Experience

• Competitions Core & Regional Head, PSYSC (National Science Club Month & STEM Expo, 2024–Present): Co-authored 500+ questions and designed the automated scoring engine for the National Science Olympiad, evaluating 4,000+ competitors nationwide. Directed elimination rounds across Northern Luzon and NCR with a 30-person volunteer team, securing ₱800,000+ in corporate event sponsorships.
• Head of League Operations, MSL Collegiate Cup (2023–Present): Directed tournament operations for 3,000+ student players across 180+ universities. Wrote a custom Discord bot that automated match check-ins, cutting admin overhead by 90%.
• Discord Moderator, miHoYo (2021–2023): Moderated the official 100,000+ member Southeast Asia server for Genshin Impact.
• Co-Head for Logistics & Security, UP Fair 2024: Co-led venue logistics and crowd safety for a week-long music festival with 90,000+ attendees.
• National Admin for Partnerships, Moonton Student Leaders PH (2023–Present): Maintained a central database for 10,000+ student members and wrote Google Apps Scripts pipelines to automate reporting for 70+ partner organizations.
• Community Manager, Blue Protocol: Star Resonance (2022–2023): Handled public communications and dispute resolution across a 60,000+ member global server.

About

I've been a government STEM scholar since 2014, graduating with high honors from Philippine Science High School (PSHS-SRC) before studying Computer Science at UP Diliman as a DOST Merit Scholar.

I got into engineering by running tournaments and gaming communities. When updating brackets and verifying player rosters across spreadsheets became too slow by hand, I started writing bots and automation scripts to handle the work.

Today, I split my focus between building practical software (mobile reviewers and client-side utilities) and running community infrastructure for student gaming ecosystems across the country.
```

### 1.5 Contact
```markdown
Contact

If you want to talk about community systems, have an interesting software challenge, or just want to say hi:

• Email: aerol.balayon@gmail.com
• GitHub: github.com/Aedwon
• Discord: @aedwon
• LinkedIn: linkedin.com/in/aedwon
```

---

## 2. Case Study Outlines (`/work/[slug]`)

### 2.1 Pantas (`/work/pantas`)
- **Category:** Mobile App / EdTech
- **Stack:** Flutter, Dart, SQLite, LocalStorage
- **The Spark:** Civil Service Exam and UPCAT preparation often relies on bulky paper reviewers or poorly formatted PDF dumps. Built a mobile reviewer that adapts to what you get wrong.
- **Constraints & Research:** Mobile-first, low battery footprint, offline capability. Tested question parsing engines for math and science formulas.
- **Key Decisions:** Custom spaced repetition algorithm scheduling reviews right before the predicted forgetting curve. Added physical OMR-style answer sheets for realistic exam practice.
- **Outcome:** Support for Civil Service Exam & UPCAT with shareable 9:16 progress recap cards.

### 2.2 PSYSC National Science Olympiad Scoring Engine (`/work/psysc-olympiad`)
- **Category:** Academic Systems & Competition Ops
- **Stack:** Google Apps Script, Data Pipelines, Competition Mechanics
- **The Spark:** Evaluating 4,000+ students across multiple regional hubs manually created scoring delays and data entry risks during national eliminations.
- **Key Decisions:** Authored 500+ standardized questions across scientific disciplines and created an automated scoring model for tie-breakers and difficulty weights.
- **Outcome:** Smooth execution across Northern Luzon, NCR, and the National Finals with standardized evaluation.

### 2.3 The MSL Network & Bot (`/work/msl-network`)
- **Category:** High-Scale Community & Automation
- **Stack:** Python, Discord.py, MySQL, Google Sheets API
- **The Spark:** Built the community from scratch to unite competitive MLBB student players nationwide, requiring automated operations as headcount scaled into the thousands.
- **Key Decisions:** Designed channel architecture and onboarding rituals. Engineered a Discord bot bridging Google Sheets registration data with cached MySQL tables for instant student verification and seasonal quest leaderboards.
- **Outcome:** Grew to 5,000+ active members with automated daily operations and tournament support.

### 2.4 Genshin DPS Calculator (`/work/gi-calculator`)
- **Category:** Theorycrafting Tool
- **Stack:** React 19, Vite, Zustand, TypeScript
- **The Spark:** Existing web calculators are either overly simplistic or require complex desktop setups. Wanted a clean web tool strictly enforcing KeqingMains Calculation Standards (KQMS).
- **Key Decisions:** Client-side state management with Zustand, local persistence via `localStorage`, and JSON build import/export for sharing team configurations.
- **Outcome:** Rapid rotation simulations running with zero server costs.

### 2.5 Norala SB Transparency Portal (`/work/norala-sb`)
- **Category:** Civic Tech
- **Stack:** Next.js 16, Tailwind CSS v4, TypeScript, next-intl
- **The Spark:** Municipal ordinances and resolutions are often stored in physical filing cabinets that citizens cannot easily search.
- **Key Decisions:** Built as a free student proof-of-concept for LGU donation. Mobile-first search index and bilingual support.
- **Outcome:** Public legislative records accessible on mobile.

### 2.6 QR Studio (`/work/qr-studio`)
- **Category:** Client-Side Tool
- **Stack:** HTML5 Canvas, TypeScript
- **The Spark:** Most web QR code generators are bloated with ads, require accounts, or send sensitive data to backend servers.
- **Key Decisions:** Used HTML5 Canvas for real-time raster rendering and SVG generation for vector exports.
- **Outcome:** Fast, private, zero-backend tool.

### 2.7 Kiosk Survey (`/work/kiosk-survey`)
- **Category:** Offline Event Tool
- **Stack:** Flutter, Dart, Android TV, SQLite
- **The Spark:** Gathering live attendee feedback at event venues where mobile reception drops or Wi-Fi fails under crowd load.
- **Key Decisions:** Built for Android TV touchscreens. Local SQLite queue persisting every survey submission to the device immediately, syncing to cloud database in batches only when connection is detected.
- **Outcome:** Ran 8 continuous hours on-site with zero dropped submissions and zero crashes.
