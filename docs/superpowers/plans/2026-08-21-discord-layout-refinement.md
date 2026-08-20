# Discord Layout Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the full-viewport Discord client theme with 1:1 copy fidelity, route-based channel feeds (`#home`, `#projects`, `#blogs`), single-thread case studies, member sidebar with logo avatars, and integrated User Settings theme switcher.

**Architecture:** A 4-column 100vh client shell (`DiscordLayout.tsx`) that activates when `theme === "discord"`. Subcomponents handle the 72px Server Rail, 240px Channel Sidebar with single-thread state, flex-1 Message Feed with custom embed components and chat bar, and 240px toggleable Member List. Full copy parity with `docs/portfolio-copy.md`.

**Tech Stack:** Next.js 15, React 19, Tailwind CSS, TypeScript, Vitest / React Testing Library.

## Global Constraints
- Exact copy matching `docs/portfolio-copy.md`.
- No emojis outside chat messages; vector SVG icons for all chrome.
- Viewport must fill 100vh with no browser scrollbars or faux window chrome.
- Only one active thread (project or blog) allowed at a time.
- All org/partner logos rendered from `public/logos/`.

---

### Task 1: Discord Subcomponents — Server Rail & Member Sidebar

**Files:**
- Create: `components/discord/DiscordServerRail.tsx`
- Create: `components/discord/DiscordMemberSidebar.tsx`
- Test: `components/__tests__/DiscordChrome.test.tsx`

**Interfaces:**
- `DiscordServerRail`: renders 72px left bar with DM Home, server badge `A`, Email, GitHub, LinkedIn, Add Server.
- `DiscordMemberSidebar`: props `{ isOpen: boolean; onClose: () => void }`, renders 21 entity avatars grouped under `OWNER`, `ORGANIZATIONS & LGUS`, `EVENT & BRAND PARTNERS`.

- [ ] **Step 1: Write failing test for Server Rail and Member Sidebar**

```tsx
// components/__tests__/DiscordChrome.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import React from "react";
import DiscordServerRail from "../discord/DiscordServerRail";
import DiscordMemberSidebar from "../discord/DiscordMemberSidebar";

describe("Discord Chrome Components", () => {
  it("renders server rail with external links", () => {
    render(<DiscordServerRail />);
    expect(screen.getByTitle(/Email: aerol.balayon@gmail.com/i)).toBeInTheDocument();
    expect(screen.getByTitle(/GitHub: \/Aedwon/i)).toBeInTheDocument();
    expect(screen.getByTitle(/LinkedIn: \/in\/aedwon/i)).toBeInTheDocument();
  });

  it("renders member list with 21 organizations and partners", () => {
    render(<DiscordMemberSidebar isOpen={true} />);
    expect(screen.getByText(/OWNER — 1/i)).toBeInTheDocument();
    expect(screen.getByText(/ORGANIZATIONS & LGUS — 12/i)).toBeInTheDocument();
    expect(screen.getByText(/EVENT & BRAND PARTNERS — 9/i)).toBeInTheDocument();
    expect(screen.getByText("PSYSC")).toBeInTheDocument();
    expect(screen.getByText("Ayala Malls")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- components/__tests__/DiscordChrome.test.tsx`
Expected: FAIL (modules not found)

- [ ] **Step 3: Implement DiscordServerRail and DiscordMemberSidebar**

Create `components/discord/DiscordServerRail.tsx` and `components/discord/DiscordMemberSidebar.tsx` with high-fidelity vector icons, SVG logos from `/logos/`, online indicators, and 1:1 entity naming.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- components/__tests__/DiscordChrome.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/discord/ components/__tests__/DiscordChrome.test.tsx
git commit -m "feat(discord): add server rail and member sidebar components"
```

---

### Task 2: Discord Channel Sidebar & Thread Engine

**Files:**
- Create: `components/discord/DiscordChannelSidebar.tsx`
- Create: `components/discord/DiscordUserSettingsModal.tsx`
- Test: `components/__tests__/DiscordSidebar.test.tsx`

**Interfaces:**
- `DiscordChannelSidebar`: props `{ activePath: string; activeThread: { parent: string; slug: string } | null; onOpenSettings: () => void }`. Renders `#home`, `#projects`, `#blogs`, dynamic single-thread spine (`└`), and bottom user panel.
- `DiscordUserSettingsModal`: props `{ isOpen: boolean; onClose: () => void }`. Theme switcher with instant preview.

- [ ] **Step 1: Write failing test for Channel Sidebar & Thread rendering**

```tsx
// components/__tests__/DiscordSidebar.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import DiscordChannelSidebar from "../discord/DiscordChannelSidebar";

describe("DiscordChannelSidebar", () => {
  it("renders channel list and active thread spine when thread is provided", () => {
    render(
      <DiscordChannelSidebar
        activePath="/projects"
        activeThread={{ parent: "projects", slug: "pantas" }}
        onOpenSettings={vi.fn()}
      />
    );
    expect(screen.getByText("#home")).toBeInTheDocument();
    expect(screen.getByText("#projects")).toBeInTheDocument();
    expect(screen.getByText("#blogs")).toBeInTheDocument();
    expect(screen.getByText("pantas")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- components/__tests__/DiscordSidebar.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement DiscordChannelSidebar and DiscordUserSettingsModal**

Implement the 240px sidebar with Discord spine CSS (`thread-spine`), bottom User Panel with online dot, mic/headphone icons, settings gear, and theme modal.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- components/__tests__/DiscordSidebar.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/discord/DiscordChannelSidebar.tsx components/discord/DiscordUserSettingsModal.tsx components/__tests__/DiscordSidebar.test.tsx
git commit -m "feat(discord): add channel sidebar with thread support and settings modal"
```

---

### Task 3: Discord Message Streams — Home, Projects, Blogs & Thread Views

**Files:**
- Create: `components/discord/DiscordHomeFeed.tsx`
- Create: `components/discord/DiscordProjectsFeed.tsx`
- Create: `components/discord/DiscordBlogsFeed.tsx`
- Create: `components/discord/DiscordThreadFeed.tsx`
- Create: `components/discord/DiscordEmbedCard.tsx`
- Create: `components/discord/DiscordButton.tsx`
- Test: `components/__tests__/DiscordFeeds.test.tsx`

**Interfaces:**
- `DiscordEmbedCard`: renders Discord embed with custom border color (`#10B981`, `#06B6D4`, `#5865F2`, `#F59E0B`), title, summary, stack, and link button.
- `DiscordButton`: renders `#4e5058` link button with popout arrow icon.
- `DiscordHomeFeed`: 1:1 Intro, 4 Featured Projects with Discord Link Button, Open Source, Experience Dossier, About, Bot Footer.
- `DiscordProjectsFeed`: 12 projects grouped contiguously by category with matching embed border colors.
- `DiscordBlogsFeed`: Technical blog posts.
- `DiscordThreadFeed`: Detailed Case Study / Article view.

- [ ] **Step 1: Write failing test for Discord message feeds**

```tsx
// components/__tests__/DiscordFeeds.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import React from "react";
import DiscordHomeFeed from "../discord/DiscordHomeFeed";
import DiscordProjectsFeed from "../discord/DiscordProjectsFeed";

describe("Discord Message Feeds", () => {
  it("renders home feed with intro and 4 featured projects", () => {
    render(<DiscordHomeFeed />);
    expect(screen.getByText(/I'm Aerol. You might also know me as Aedwon./i)).toBeInTheDocument();
    expect(screen.getByText("Pantas")).toBeInTheDocument();
    expect(screen.getByText("See all projects")).toBeInTheDocument();
  });

  it("renders all 12 projects grouped in projects feed", () => {
    render(<DiscordProjectsFeed />);
    expect(screen.getByText("1. Pantas")).toBeInTheDocument();
    expect(screen.getByText("4. BetterGov PH")).toBeInTheDocument();
    expect(screen.getByText("12. AI Agent Instruction & Skills Framework")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- components/__tests__/DiscordFeeds.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement feed components and embeds**

Write `DiscordEmbedCard.tsx`, `DiscordButton.tsx`, `DiscordHomeFeed.tsx`, `DiscordProjectsFeed.tsx`, `DiscordBlogsFeed.tsx`, `DiscordThreadFeed.tsx` with 100% copy parity from `docs/portfolio-copy.md`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- components/__tests__/DiscordFeeds.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/discord/ components/__tests__/DiscordFeeds.test.tsx
git commit -m "feat(discord): add message stream feeds and embed card components"
```

---

### Task 4: Discord Shell Integration & Viewport Overhaul

**Files:**
- Modify: `components/DiscordLayout.tsx`
- Modify: `app/layout.tsx`
- Test: `components/__tests__/DiscordLayout.test.tsx`

**Interfaces:**
- `DiscordLayout`: integrates Server Rail, Channel Sidebar, Chat Surface with Header/Breadcrumbs, Message Stream, Chat Input Bar, Member Sidebar, and User Settings modal. Takes over the 100vh viewport seamlessly when `theme === "discord"`.

- [ ] **Step 1: Write integration test for DiscordLayout**

```tsx
// components/__tests__/DiscordLayout.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import DiscordLayout from "../DiscordLayout";
import { ThemeProvider } from "../ThemeContext";

describe("DiscordLayout Full Shell", () => {
  it("renders complete 4-column client shell when theme is discord", () => {
    localStorage.setItem("aedwon-theme", "discord");
    render(
      <ThemeProvider>
        <DiscordLayout>
          <div>Inner Content</div>
        </DiscordLayout>
      </ThemeProvider>
    );
    expect(screen.getByText("Aerol (Aedwon)")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Message #home/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails or needs updates**

Run: `npm run test -- components/__tests__/DiscordLayout.test.tsx`
Expected: FAIL

- [ ] **Step 3: Update DiscordLayout.tsx and app/layout.tsx**

Replace `DiscordLayout.tsx` with the unified 4-column client shell matching `layout-v14.html`. Ensure standard navbar and footer are bypassed in Discord mode while remaining fully functional in Default and Neobrutalist themes.

- [ ] **Step 4: Run all tests to verify full pass**

Run: `npm run test`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add components/DiscordLayout.tsx app/layout.tsx components/__tests__/DiscordLayout.test.tsx
git commit -m "feat(discord): complete 1:1 Discord desktop client layout shell"
```

---

### Task 5: End-to-End Verification & Walkthrough

**Files:**
- Create: `app/__tests__/DiscordRouting.test.tsx`

- [ ] **Step 1: Write end-to-end routing and thread interaction test**
- [ ] **Step 2: Run test suite & build check (`npm run build`)**
- [ ] **Step 3: Verify visually in browser across routes (`/`, `/projects`, `/projects/pantas`, `/blogs`)**
- [ ] **Step 4: Commit and finalize walkthrough**
