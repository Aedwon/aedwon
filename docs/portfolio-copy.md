# Portfolio Copy Reference (Single Source of Truth)

> Working copy reference for Aedwon's personal portfolio. 
> Edit this document directly to refine content, project summaries, and case study notes.

---

## 1. Homepage (`/`)

### 1.1 Intro / Hero
```markdown
I'm Aerol (Aedwon).
I study Computer Science at UP Diliman and build software for gaming communities, civic tech, and offline environments.
```

### 1.2 Featured Projects
```markdown
Projects

• Pantas
  Flutter mobile reviewer for Philippine exam prep (Civil Service & UPCAT). Features a custom spaced repetition engine, OMR-style mock exam sheets, and 9:16 progress recap cards.
  Links: [pantas.app ↗] · [Build notes →]

• QR Studio
  In-browser QR code builder. Generates styled vector/PNG QR codes with gradients and embedded logos client-side with zero server uploads.
  Links: [Try tool ↗] · [Build notes →]

• Genshin DPS Calculator
  Client-side team rotation calculator built with React 19 and Zustand. Enforces KeqingMains (KQMS) calculation standards for artifact substats with zero backend dependencies.
  Links: [Open tool ↗] · [Build notes →]

• Norala SB Transparency Portal
  Searchable legislative portal built for the municipal council of Norala, South Cotabato. Republishes public ordinances and resolutions in a mobile-first interface.
  Links: [Demo ↗] · [Build notes →]

• Kiosk Survey
  Touchscreen survey app for Android TV. Ran through an 8-hour live event without Wi-Fi, queuing survey submissions locally and syncing once network was restored.
  Links: [Build notes →]

• MSL Network Discord Bot
  Automated onboarding and management for a 5,000+ member gaming community. Verifies student identity via Google Sheets, automates event queues, and tracks seasonal points.
  Links: [Build notes →]

• WebP Unli
  Batch image converter that encodes images to WebP locally in the browser with no file size limits or server processing.
  Links: [Tool ↗] · [Build notes →]

• Lakambini Events
  Website redesign for an event styling business. Rebuilt the booking flow so clients can see pricing and contact details in fewer clicks.
  Links: [Live site ↗] · [Build notes →]
```

### 1.3 Secondary Projects & Tooling
```markdown
Other work & experiments

• BetterGov PH — Open-source contributor to civic tech initiatives modernizing Philippine government web services.
• MCC S2 Match Explorer — Standings and bracket explorer for the Moonton Collegiate Cup.
• MLBB Post-Game Extractor — Parses scoreboard screenshots into structured match statistics.
• ISFE Bot — Tournament logistics bot for Ilocos Sur Festival Esports.
```

### 1.4 Background & Experience
```markdown
Experience & Community Systems

• Head of League Operations, MSL Collegiate Cup — Managed operations for 3,000+ student competitors across 180+ universities. Built the Discord bot that automated match check-ins, cutting admin overhead by 90%.
• Discord Moderator, miHoYo — Moderated official community server with 100,000+ members.
• Co-Head for Logistics & Security, UP Fair 2024 — Co-led venue logistics, procurement, and crowd safety for a week-long festival with 90,000+ attendees.
• Database Manager, Moonton Student Leaders PH — Maintained the nationwide member database for 10,000+ students and automated reporting via Google Apps Scripts for 70+ partner organizations.

About

I started out organizing grassroots tournaments and managing gaming servers in high school. When updating brackets, handling player verifications, and cross-referencing spreadsheets for hundreds of teams became impossible to do by hand, I started writing Python scripts and bots to automate the repetitive work. 

That push led me toward software engineering and studying Computer Science at UP Diliman as a DOST Scholar. 

Besides coding, I also work on event operations. I've co-led logistics and security for UP Fair and managed project timelines for esports broadcasts.
```

### 1.5 Contact
```markdown
Contact

If you want to talk about community systems, have an interesting project, or just want to say hi:

• Email: aerol.balayon@gmail.com
• GitHub: @Aedwon
• Discord: @aedwon
• LinkedIn: linkedin.com/in/aerol-balayon
```

---

## 2. Case Study Content Outlines (`/work/[slug]`)

### 2.1 Pantas (`/work/pantas`)
- **Category:** Mobile App / EdTech
- **Stack:** Flutter, Dart, SQLite, Local Storage
- **The Spark:** Prepping for Philippine civil service and university entrance exams often relies on bulky paper reviewers or poorly formatted PDF dumps. Built a mobile reviewer that adapts to what you get wrong.
- **Constraints & Research:** Mobile-first, low battery footprint, offline capability. Tested question parsing engines for complex math and science formulas.
- **Key Decisions:** Built a custom spaced repetition algorithm scheduling reviews right before the predicted forgetting curve. Added physical OMR-style answer sheets for realistic exam practice.
- **Outcome:** Support for Civil Service Exam & UPCAT with shareable 9:16 progress recap cards.

### 2.2 QR Studio (`/work/qr-studio`)
- **Category:** Client-Side Tool
- **Stack:** HTML5 Canvas, JavaScript, TypeScript
- **The Spark:** Most web QR code generators are bloated with ads, require accounts, or send sensitive data to backend servers.
- **Constraints & Research:** Must run 100% in the client browser with zero network requests after initial load.
- **Key Decisions:** Used HTML5 Canvas for real-time raster rendering and SVG generation for vector exports. Added custom color ramps and logo centering logic.
- **Outcome:** Fast, private, zero-backend tool.

### 2.3 Genshin DPS Calculator (`/work/gi-calculator`)
- **Category:** Theorycrafting Tool
- **Stack:** React 19, Vite, Zustand, TypeScript
- **The Spark:** Existing web calculators are either overly simplistic or require complex desktop setups. Wanted a clean web tool strictly enforcing KeqingMains Calculation Standards (KQMS).
- **Key Decisions:** Client-side state management with Zustand, local persistence via `localStorage`, and JSON build import/export for sharing team configurations.
- **Outcome:** Rapid rotation simulations running with zero server costs.

### 2.4 Norala SB Transparency Portal (`/work/norala-sb`)
- **Category:** Civic Tech
- **Stack:** Next.js 16, Tailwind CSS v4, `next-intl`
- **The Spark:** Municipal ordinances and resolutions are often stored in scanned PDFs or filing cabinets that citizens cannot easily search.
- **Key Decisions:** Built as a free student proof-of-concept for LGU donation. Mobile-first search index and bilingual support.
- **Outcome:** Fast, accessible public legislative records accessible on mobile.

### 2.5 Kiosk Survey (`/work/kiosk-survey`)
- **Category:** Offline Event Tool
- **Stack:** Flutter / Dart, Android TV, SQLite
- **The Spark:** Gathering live attendee feedback at event venues where mobile reception drops or Wi-Fi drops under crowd load.
- **Key Decisions:** Built for Android TV touchscreens. Local SQLite queue persisting every survey submission to the device immediately, syncing to cloud database in batches only when connection is detected.
- **Outcome:** Ran 8 continuous hours on-site with zero dropped submissions and zero crashes.

### 2.6 MSL Network & Tournament Automation (`/work/msl-bots`)
- **Category:** High-Scale Community Systems
- **Stack:** Python, Discord.py, MySQL, Google Sheets API
- **The Spark:** Managing 3,000+ tournament players and 5,000+ community members manually creates massive administrative bottlenecks.
- **Key Decisions:** Discord bot bridging Google Sheets registration data with cached MySQL tables for fast role provisioning, automated match check-ins, and seasonal quest tracking.
- **Outcome:** 90% reduction in manual admin workload during live tournament operations.
