# Discord Theme Layout & Architecture Design Specification

**Date:** 2026-08-21  
**Status:** Approved by User  
**Prototype Reference:** `layout-v14.html`  
**Ground Truth Content Reference:** [`docs/portfolio-copy.md`](file:///Users/aedwon/Documents/Projects/aedwon/docs/portfolio-copy.md)

---

## 1. Executive Summary

This design specification details the 1:1 implementation of the **Discord Theme** for Aerol's (Aedwon) portfolio. The layout transforms the entire portfolio viewport into an authentic, client-accurate Discord desktop experience. Content across all channels strictly mirrors the single source of truth (`docs/portfolio-copy.md`) without synthetic copy or omitted data.

---

## 2. Layout Structure & Viewport Architecture

The interface uses a 4-column horizontal layout taking over 100vh of the viewport without browser scrollbars or faux window chrome:

```
+------------------+----------------------+------------------------------------------------+----------------------+
| 1. Server Rail   | 2. Channel Sidebar   | 3. Main Chat Surface                           | 4. Member Sidebar    |
| (72px fixed)     | (240px fixed)        | (flex-1 dynamic)                               | (240px toggleable)   |
|                  |                      |                                                |                      |
| [DM Home Icon]   | [Server Name Drop]   | [Header: #channel-name + breadcrumbs + search] | [OWNER — 1]          |
| [Active Server A]| [CHANNELS Category]  |                                                |   • Aerol (Aedwon)   |
| [Email Server]   |   # home             | [Message Feed (Scrollable)]:                   |                      |
| [GitHub Server]  |   # projects         |   • Intro message                              | [ORGANIZATIONS — 12] |
| [LinkedIn Server]|     └ active thread  |   • Embed cards (color-coded by category)      |   • 12 org logos     |
| [+] Add Server   |   # blogs            |   • Trailing Bot footer message                |                      |
|                  |                      |                                                | [EVENT PARTNERS — 9] |
|                  | [Bottom User Panel]  | [Chat Input Bar: "Message #channel"]           |   • 9 partner logos  |
|                  |   • Avatar + Name    |   [+ Attach] [Gift] [GIF] [Stickers] [Emoji]   |                      |
|                  |   • Mic/Headphone/⚙  |                                                |                      |
+------------------+----------------------+------------------------------------------------+----------------------+
```

### Color Palette Tokens:
- **Server Rail:** `#1e1f22` (border: `#111214`)
- **Channel Sidebar & Member Sidebar:** `#2b2d31` (border: `#1f2023`)
- **Main Chat Surface:** `#313338`
- **Chat Input Bar:** `#383a40`
- **Embed Card Background:** `#2b2d31` (border-left: 4px solid category accent)
- **Discord Blurple:** `#5865F2`
- **Online Indicator:** `#23a55a`

---

## 3. Column Components & Behavior

### Column 1: Server Rail (`72px`, `#1e1f22`)
- **DM Home Icon:** Top Discord controller icon switching to `#home`.
- **Divider Pill:** 32px × 2px rounded separator.
- **Active Server Badge `A`:** 48px rounded square with white left indicator pill representing `aedwon.dev`.
- **External Resource Server Badges:**
  - **Email:** `mailto:aerol.balayon@gmail.com` with envelope icon.
  - **GitHub:** `https://github.com/Aedwon` with GitHub Octocat vector SVG.
  - **LinkedIn:** `https://linkedin.com/in/aedwon` with LinkedIn `in` logo badge.
- **Add Server `+`:** Decorative green interactive Discord button.

### Column 2: Channel Sidebar (`240px`, `#2b2d31`)
- **Server Header:** `Aerol (Aedwon)` with dropdown chevron. Clicking triggers the Theme Switcher modal.
- **Channel List:**
  - `#home`: Routes to `/` content stream.
  - `#projects`: Routes to `/projects` catalog stream.
  - `#blogs`: Routes to `/blogs` notes stream.
- **Active Threads (Single-Thread Model):**
  - When a user views a project or blog post case study, a thread item is created directly below its parent channel with the `└` spine connector:
    ```
    # projects
      └  pantas [✕]
    ```
  - Only **one** thread can be active at a time. Opening another project or blog replaces the active thread. Closing the thread returns the view to the parent channel.
- **Bottom User Panel (`52px`, `#232428`):**
  - Circular avatar `A` with online status indicator.
  - Name: `Aerol (Aedwon)`, Subtext: `Online`.
  - Action buttons: Mute, Deafen, and **Settings Gear** (Theme Switcher launcher).

### Column 3: Main Chat Surface (`flex-1`, `#313338`)
- **Header Bar (`48px`):**
  - Left: `# [channel-name]` or breadcrumbs when in a thread (`# projects / <thread-icon> [slug]`).
  - Right (flushed): Threads, Notification Bell, Pinned Messages, Member List Toggle, and Search input.
- **Scrollable Message Feeds:**
  - **`#home` Feed:**
    1. Channel welcome header.
    2. Intro message from Aerol with reaction pills (`🔥 18`, `👀 12`, `🚀 9`).
    3. Featured Projects: 4 embed cards (Pantas, The MSL Network, QR Studio, Kiosk Survey) with a Discord Action Row Link Button (`[ See all projects ↗ ]`).
    4. Open Source: BetterGov PH embed card.
    5. Experience Dossier: Grouped organization embeds.
    6. About: 2 narrative paragraphs.
    7. Trailing Bot Footer: `<Portfolio BOT>` message: `© 2026 Aerol (Aedwon) · Built with Next.js & React`.
  - **`#projects` Feed:**
    - All 12 projects grouped contiguously by category with shared embed border colors:
      - **Mobile & Offline (`#10B981`):** Pantas, Kiosk Survey
      - **Civic Tech (`#06B6D4`):** Norala SB Legislative Transparency Portal, BetterGov PH
      - **Bots & Systems (`#5865F2`):** The MSL Network, MSL Collegiate Cup Tournament Bot, PSO Automated Scorer & Ranking Engine, Ilocos Sur Festival Esports Bot, OPPO Smooth / Hyper Legend Cup Bot
      - **Web & Tools (`#F59E0B`):** QR Studio, KQM-Standard Genshin Team DPS Calculator, AI Agent Instruction & Skills Framework
    - Each embed card contains strictly: Title, Summary, Stack chips, and `View case study →` button (which opens the thread).
  - **`#blogs` Feed:**
    - Technical articles with read time, tags, and summary.
  - **Active Thread View:**
    - Full case study/article view formatted as Discord messages with The Spark, Architecture Breakdown, Outcome & Metrics, and Tech Stack.
- **Bottom Chat Input Bar (`68px`):**
  - Pill container with `+` attach button, dynamic placeholder (`Message #[channel-or-thread]`), and Nitro, GIF, Sticker, Emoji buttons.

### Column 4: Member Sidebar (`240px`, `#2b2d31`)
- Toggleable via header action icon.
- Grouped by roles:
  - `OWNER — 1`: Aerol (Aedwon) with purple avatar and online dot.
  - `ORGANIZATIONS & LGUS — 12`: PSYSC, MOONTON Games, Dark League Studios, miHoYo, UP Diliman, UP Fighting Maroons, UP Fair, UP Kugihan, DOST-SEI, PSHS, Ilocos Sur, Norala (with circular logo avatars from `public/logos/`).
  - `EVENT & BRAND PARTNERS — 9`: Ayala Malls, SM Supermalls, Smart Communications, Converge ICT Solutions, MSI, Hotel101 Group, OPPO, BenQ ZOWIE, Chronos Athletics (with circular logo avatars).

---

## 4. Theme Switching & Persistence

- Selecting a theme in the User Settings modal instantly updates the theme context and persists to `localStorage`.
- All three themes (Default, Pure Neobrutalist, Discord) maintain 100% copy parity from `docs/portfolio-copy.md`.

---

## 5. Verification Plan

1. **Visual Parity:** Verify viewport matches `layout-v14.html` 1:1 on 100vh desktop layouts.
2. **Channel Switching:** Verify switching between `#home`, `#projects`, and `#blogs` changes the message stream and updates the URL/breadcrumbs.
3. **Thread Integration:** Verify opening a project or blog opens an indented thread in the sidebar, switches the feed to the case study, and allows closing back to the parent channel.
4. **Member List Toggle:** Verify toggling the member list expands/collapses the right sidebar without layout shift.
5. **Theme Parity:** Verify switching back and forth between Default, Neobrutalist, and Discord preserves content and functionality without errors.
