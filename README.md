# Aerol Balayon

I'm Aerol. You might also know me as Aedwon.

I studied Computer Science at UP Diliman on a DOST Merit Scholarship after Philippine Science High School. Most of my recent work has been in offline-first apps and community infrastructure.

[aedwon.com](https://aedwon.com) · [LinkedIn](https://linkedin.com/in/aedwon) · [Discord](https://discord.com/users/aedwon) · [Email](mailto:aerol.balayon@gmail.com)

## Selected work

### [Pantas](https://pantas.app)

Pantas is an Android-first exam reviewer for Philippine civil service and university entrance preparation. Study state lives in a local Drift database encrypted with SQLCipher, so quizzes and review scheduling do not depend on a network connection.

Practice answers feed into an FSRS-6 scheduler and are written to a review log for future scheduling. The current build uses the published FSRS-6 default weights. Personalized on-device parameter fitting is designed but not implemented yet.

Pantas is still in active pre-launch development. The local study and scheduling paths are implemented. Firebase-backed account sync and the mock-exam content path are not currently usable in the running build.

### [MSL Network Bot](https://github.com/Aedwon/Discord-Bot)

The MSL Network Bot is a single-server Discord bot that connects MLBB account verification with XP, Event Points, events, quests, moderation, and reporting.

Verification data is stored in MySQL and cached in memory for activity checks. A separate MSL cross-reference is refreshed from the public roster every six hours and uses the UID/server pair for eligibility checks. Event workflows attach to Discord Scheduled Events instead of maintaining a second calendar.

The bot started in 2026. Its Discord cogs share services and an async MySQL pool, while a small set of web admin tools use the same database.

<p align="center">
  <img src="./public/projects/msl-network-discord.webp" width="90%" alt="MSL Network Discord interface" />
</p>

### [QR Studio](https://github.com/Aedwon/QR-Code-Maker)

QR Studio is an in-browser QR code builder with gradient styling and SVG export. Encoding and rendering happen client-side, so creating a code does not require a backend request.

It uses TypeScript and HTML5 Canvas for the editor and exports vector output for print use.

<p align="center">
  <img src="./public/projects/qr-studio.webp" width="90%" alt="QR Studio editor" />
</p>

### [Kiosk Survey](https://github.com/Aedwon/kiosk-survey)

Kiosk Survey is a touchscreen survey app built for Android TV at events where cellular service can be unreliable. Responses are written to SQLite locally and queued until the device reconnects.

The system ran for eight continuous hours during a live event without internet and synced queued submissions after connectivity returned.

<p align="center">
  <img src="./public/projects/kiosk-survey.webp" width="90%" alt="Kiosk Survey Android TV interface" />
</p>

## Open source

### [BetterGov PH](https://bettergov.ph)

I contribute to BetterGov PH, which works on Philippine government web services and public data access.

## This repository

This repository contains the source for [aedwon.com](https://aedwon.com). The site uses Next.js 16, React 19, Tailwind CSS, and Framer Motion. Tests use Vitest and React Testing Library.

<details>
<summary><b>Local development</b></summary>

```bash
git clone https://github.com/Aedwon/aedwon.git
cd aedwon
npm install
npm run dev
npm test
npm run build
```

</details>
