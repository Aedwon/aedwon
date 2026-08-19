# Portfolio Copy Reference (Single Source of Truth)

> Working copy reference for Aerol's (Aedwon) personal portfolio.
> Grounded in real primary data from `CV Professional Aerol.pdf`, LinkedIn, `github.com/Aedwon`, and local workspaces in `Projects/`.
> Edit this document directly to refine text, project notes, and case study details.

---

## 1. Homepage (`/`)

### 1.1 Intro
```markdown
I'm Aerol. You might also know me as Aedwon.

I study Computer Science at UP Diliman, continuing my interests in tech and DOST Merit Scholarship from Philippine Science High School. I like building things :)
```

### 1.2 Affiliations & Organizations
*(Note: Placed right above Projects. Rendered as a dedicated logo gallery with hover tooltips.)*

```markdown
Affiliations

Organizations and student leagues I've built tools or run operations for:

• Philippine Society of Youth Science Clubs (PSYSC)
• MOONTON Games (Moonton Student Leaders)
• Dark League Studios
• miHoYo (HoYoverse)
• University of the Philippines Diliman
• UP Fighting Maroons (UP Esports Varsity Team)
• UP Fair
• UP Kugihan
• Department of Science and Technology (DOST-SEI)
• Philippine Science High School (PSHS)
```

### 1.3 Featured Projects
*(Note: Exactly 4 featured projects. Arrows placed on bottom-right of card. Top-right link routes to all builds. Case study links route to `/work/[slug]`.)*

```markdown
Featured projects [See all projects →]

• Pantas
  Summary: Mobile exam reviewer for Philippine civil service and university entrance tests, featuring adaptive spaced repetition and OMR-style mock exam sheets.
  Stack: [Flutter, Dart, SQLite]
  Link: [View case study →]

• The MSL Network
  Summary: Planned and built the Philippine student gaming hub to 10,000+ members, powered by custom Discord bots for Google Sheets verification and automated event quests.
  Stack: [Python, Discord.py, MySQL, Google Sheets API]
  Link: [View case study →]

• QR Studio
  Summary: In-browser QR code builder with gradient customization and SVG export that runs entirely client-side with no server uploads.
  Stack: [TypeScript, HTML5 Canvas, Vite, Tailwind CSS]
  Link: [View case study →]

• Kiosk Survey
  Summary: Touchscreen survey app for Android TV that operated for 8 continuous hours during a live event without internet, syncing queued submissions once reconnected.
  Stack: [Flutter, Dart, Android TV, SQLite]
  Link: [View case study →]
```

### 1.4 Open Source Contributions & Additional Projects
```markdown
Open source contributions

• BetterGov PH: Open-source contributor to civic tech initiatives modernizing Philippine government web services and public data access.
• MLBB Post-Game Extractor: Python script that parses scoreboard screenshots into structured match statistics.
• MCC S2 Match Explorer: Standings and match bracket viewer for the Moonton Collegiate Cup Season 2.
• ISFE Bot: Tournament logistics bot syncing Discord registrations with Challonge brackets for Ilocos Sur Festival Esports.
```

### 1.5 Experience & Community Operations
```markdown
Experience

Philippine Society of Youth Science Clubs (PSYSC)
• Marketing Associate (Feb 2024 – Present): Secured corporate sponsorships generating ₱800,000+ in funding for national science initiatives.
• Science Olympiad Core, National Science Club Month 2024 (May 2024 – Jul 2024): Co-authored 500+ questions and engineered the automated scoring model evaluating 4,000+ competitors across regional and national elimination rounds.
• Competitions Core, STEM Expo 2024 (Mar 2024 – Jun 2024): Managed logistical schedules and bracket workflows across 5 distinct STEM contest categories.

Moonton Student Leaders Philippines (Sep 2020 – May 2026)
• Tournament Director, MSL Collegiate Cup (Feb 2024 – May 2026): Directed tournament operations for 3,271 collegiate competitors across 180+ universities, writing a custom Discord bot that automated match check-ins and cut admin overhead by 90%.
• Head of Partnerships & Network Development (Jan 2024 – May 2026): Founded The MSL Network (10,000+ members), acquired 15 collegiate esports organization partners, and delivered nationwide MOONTON campus marketing campaigns across Luzon, Visayas, and Mindanao.
• Database Manager & Administrative Assistant (Feb 2022 – Aug 2022): Built automated data compilation workflows cutting processing time by 90% and pioneered execution policies for the Scholarship Program Department.

Dark League Studios
• Project Manager (Sep 2024 – Jun 2025): Led on-site tournament operations for the inaugural season of Estudyante Esports National Championships, PBA Esports Bakbakan (Dota 2 and Tekken 8), and the OPPO Smooth Legend Cup Philippine Leg.

UP Fighting Maroons (UP Esports Varsity Team) & UP Diliman
• Vice Chairman & Head of Marketing, UP Fighting Maroons Esports (Aug 2024 – May 2025): Secured brand sponsorships with Converge, MSI, and Hotel101 while directing varsity team operations.
• Co-Head for Logistics & Security, UP Fair 2024 (2024): Co-led venue logistics, procurement, and crowd safety for a week-long festival with 90,000+ attendees.

miHoYo
• Discord Moderator, Genshin Impact SEA (Oct 2023 – Dec 2024): Moderated the official 100,000+ member Southeast Asia server for Genshin Impact.
```

### 1.6 About
```markdown
About

I've been a government STEM scholar since 2014, graduating with high honors from Philippine Science High School (PSHS-SRC) before studying Computer Science at UP Diliman as a DOST Merit Scholar.

I got into engineering by running tournaments and gaming communities. When updating brackets and verifying player rosters across spreadsheets became too slow by hand, I started writing bots and automation scripts to handle the work.

Today, I split my focus between building practical software (mobile reviewers and client-side utilities) and running community infrastructure for student gaming ecosystems across the country.
```

### 1.7 Contact
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
- **Stack:** Flutter, Dart, SQLite
- **The Spark:** Civil Service Exam and UPCAT preparation often relies on bulky paper reviewers or poorly formatted PDF dumps. Built a mobile reviewer that adapts to what you get wrong.
- **Constraints & Research:** Mobile-first, low battery footprint, offline capability. Tested question parsing engines for math and science formulas.
- **Key Decisions:** Custom spaced repetition algorithm scheduling reviews right before the predicted forgetting curve. Added physical OMR-style answer sheets for realistic exam practice.
- **Outcome:** Support for Civil Service Exam & UPCAT with shareable 9:16 progress recap cards.

### 2.2 The MSL Network (`/work/msl-network`)
- **Category:** High-Scale Community & Automation
- **Stack:** Python, Discord.py, MySQL, Google Sheets API
- **The Spark:** Built the community from scratch to unite competitive MLBB student players nationwide, requiring automated operations as headcount scaled past 10,000 members.
- **Key Decisions:** Designed channel architecture and onboarding rituals. Engineered a Discord bot bridging Google Sheets registration data with cached MySQL tables for instant student verification and seasonal quest leaderboards.
- **Outcome:** Grew to 10,000+ active members with automated daily operations and tournament support.

### 2.3 QR Studio (`/work/qr-studio`)
- **Category:** Client-Side Tool
- **Stack:** TypeScript, HTML5 Canvas, Vite, Tailwind CSS
- **The Spark:** Most web QR code generators are bloated with ads, require accounts, or send sensitive data to backend servers.
- **Key Decisions:** Used HTML5 Canvas for real-time raster rendering and SVG generation for vector exports.
- **Outcome:** Fast, private, zero-backend tool.

### 2.4 Kiosk Survey (`/work/kiosk-survey`)
- **Category:** Offline Event Tool
- **Stack:** Flutter, Dart, Android TV, SQLite
- **The Spark:** Gathering live attendee feedback at event venues where mobile reception drops or Wi-Fi fails under crowd load.
- **Key Decisions:** Built for Android TV touchscreens. Local SQLite queue persisting every survey submission to the device immediately, syncing to cloud database in batches only when connection is detected.
- **Outcome:** Ran 8 continuous hours on-site with zero dropped submissions and zero crashes.
