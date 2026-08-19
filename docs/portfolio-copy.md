# Portfolio Copy Reference (Single Source of Truth)

> Working copy reference for Aerol's (Aedwon) personal portfolio.
> Grounded in real primary data from `CV Professional Aerol.pdf`, LinkedIn, `github.com/Aedwon`, and local workspaces in `Projects/`.
> Edit this document directly to refine text, project notes, and case study details.

---

## 1. Homepage (`/`)

### 1.1 Intro
```markdown
I'm Aerol. You might also know me as Aedwon.

I study Computer Science at UP Diliman on a DOST Merit Scholarship, following high school at Philippine Science High School. I like building things :)
```

### 1.2 Featured Projects
*(Note: Exactly 4 featured projects. Arrows placed on bottom-right of card. Top-right link routes to all builds. Case study links route to `/work/[slug]`.)*

```markdown
Featured projects [See all projects →]

• Pantas
  Summary: Mobile exam reviewer for Philippine civil service and university entrance tests, with adaptive spaced repetition and OMR answer sheets.
  Stack: [Flutter, Dart, SQLite]
  Link: [View case study →]

• The MSL Network
  Summary: Planned and built the Philippine student gaming community to 10,000+ members, using custom Discord bots for student verification and event quests.
  Stack: [Python, Discord.py, MySQL, Google Sheets API]
  Link: [View case study →]

• QR Studio
  Summary: In-browser QR code builder with gradient styling and SVG export that runs entirely client-side without backend requests.
  Stack: [TypeScript, HTML5 Canvas, Vite, Tailwind CSS]
  Link: [View case study →]

• Kiosk Survey
  Summary: Touchscreen survey app for Android TV that operated for 8 continuous hours during a live event without internet, syncing queued submissions once reconnected.
  Stack: [Flutter, Dart, Android TV, SQLite]
  Link: [View case study →]
```

### 1.3 Open Source
*(Note: Positioned directly under Featured Projects and above Affiliations. Matched card anatomy.)*

```markdown
Open source

• BetterGov PH
  Summary: Contributor to civic tech initiatives modernizing Philippine government web services and open public data.
  Stack: [TypeScript, Next.js, Tailwind CSS]
  Link: [bettergov.ph ↗]
```

### 1.4 Affiliations & Partners
*(Note: Rendered as two clean rows of avatar badges with hover tooltips.)*

```markdown
Affiliations & Partners

Entities and brand partners I've built software or run operations for:

Organizations & LGUs
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
• Provincial Government of Ilocos Sur
• Municipality of Norala, South Cotabato

Event & Brand Partners
• Ayala Malls (Circuit Makati)
• SM Supermalls (SM City Manila & SM City Butuan)
• Smart Communications (Smart Giga Arena)
• Converge ICT Solutions
• MSI (Micro-Star International)
• Hotel101 Group
• OPPO
• BenQ ZOWIE
• Chronos Athletics
```

### 1.5 Experience (Tabbed Entity Dossier)
*(Note: Rendered as an interactive tabbed inspector on the left and a clean impact pane on the right. No tag pills.)*

```markdown
Experience

1. Philippine Society of Youth Science Clubs (PSYSC)
   Role: Marketing Associate & Science Olympiad Core
   Timeline: Feb 2024 — Present
   Impact: Secured corporate sponsorships generating ₱800,000+ in funding for national youth science initiatives. Engineered the automated scoring model evaluating 4,000+ student competitors across regional and national elimination rounds.

2. Moonton Student Leaders Philippines
   Role: Tournament Director & Head of Partnerships
   Timeline: Sep 2020 — May 2026
   Impact: Founded The MSL Network (10,000+ student members) and directed tournament operations for 3,271 collegiate competitors across 180+ universities. Built custom Discord check-in bots that cut manual admin overhead by 90%.

3. Dark League Studios
   Role: Project Manager
   Timeline: Sep 2024 — Jun 2025
   Impact: Led on-site broadcast and tournament operations for Estudyante Esports National Championships, PBA Esports Bakbakan, OPPO Smooth Legend Cup, and ZOWIE Perfect Play Night.

4. UP Fighting Maroons (UP Esports Varsity Team)
   Role: Vice Chairman & Head of Marketing
   Timeline: Aug 2024 — May 2025
   Impact: Secured varsity brand sponsorships with Converge, MSI, Hotel101, and Chronos Athletics while directing collegiate varsity esports operations.

5. UP Fair 2024 (UP Diliman)
   Role: Co-Head for Logistics & Security
   Timeline: 2024
   Impact: Co-led venue logistics, procurement, and crowd safety for a week-long music festival with 90,000+ attendees.

6. miHoYo (HoYoverse)
   Role: Discord Moderator, Genshin Impact SEA
   Timeline: Oct 2023 — Dec 2024
   Impact: Moderated the official 100,000+ member Southeast Asia Discord server for Genshin Impact.
```

### 1.6 About
```markdown
About

I've been a government STEM scholar since 2014, graduating with high honors from Philippine Science High School before studying Computer Science at UP Diliman on a DOST Merit Scholarship.

I got into engineering by running tournaments and gaming communities. When updating brackets across spreadsheets became too slow by hand, I started writing bots and automation scripts to handle the work.

Today, I split my time between writing software (mobile reviewers and web tools) and running community infrastructure for student gaming leagues.
```

### 1.7 Contact
```markdown
Contact

Get in touch for software projects, community infrastructure, or a quick hello:

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
- **Key Decisions:** Custom spaced repetition algorithm scheduling reviews right before the predicted forgetting curve. Added physical OMR answer sheets for realistic exam practice.
- **Outcome:** Support for Civil Service Exam and UPCAT with shareable 9:16 progress recap cards.

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
