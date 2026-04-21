# § 00 — A STUDIO OF ONE

> **A brand sells twice: once to the stranger, once to the regular. I build for both sales.**

This is the portfolio of **Aedwon**, an independent designer and developer building high-performance web solutions and community systems. This project is a "chameleon" site—a single content source rendered through three distinct interactive design systems (skins).

---

## The Two Sales

### 01. The Stranger Sale (Web Solutions)
A website has one job: make the right person pick you. I build sites that do that job honestly.
*   **Performance:** Lighthouse 90+ on launch. Core Web Vitals in the green.
*   **Accessibility:** WCAG 2.1 AA compliant by default.
*   **Conversion:** Editorial-grade typography and clear, POV-led copy.

### 02. The Regular Sale (Community Solutions)
Anyone can gather a crowd. Keeping it warm is a different job.
*   **Structure:** Roles, permissions, and rituals that don't need me in the room.
*   **Software:** Custom Discord bots (moderation, leveling, reporting) and companion dashboards.
*   **Stewardship:** Systems for rooms full of real people, from gaming hubs to official brand servers.

---

## The Chameleon Architecture

The site demonstrates architectural versatility by allowing users to switch between three fully realized themes via a `data-theme` attribute:

1.  **Paper (Minimalist):** The default "studio voice." Editorial pacing, typographic rigor, and confident blank space. Focuses on clarity and directness.
2.  **Sticker (Neubrutalist):** A bold, high-contrast aesthetic with hard borders and vibrant colors. Optimized for creative impact.
3.  **Server (DiscordOS):** A pixel-perfect recreation of the Discord interface, transforming the portfolio into a familiar community environment.

---

## The Process

Every project goes through five rooms. I leave the doors open.

1.  **§ 01 Diagnostic:** Two weeks to figure out what's actually broken and write a plan.
2.  **§ 02 Blueprint:** One document covering scope, timeline, and price—signed before the first commit.
3.  **§ 03 Build:** Weekly staging demos. You watch progress in public; nothing goes live without your button press.
4.  **§ 04 Launch:** Deploy, document, and train. Includes 30 days of post-launch support.
5.  **§ 05 Operate:** Month-to-month retainer or a clean handoff. No vendor lock-in, ever.

---

## Technology Stack

Built for longevity, performance, and type-safety.

*   **Framework:** Next.js 16 (App Router, React 19)
*   **Language:** TypeScript (Strict)
*   **Styling:** Tailwind CSS (Modular variable-based themes)
*   **Animations:** Framer Motion (With global reduced-motion enforcement)
*   **Icons:** Lucide React
*   **Testing:** Vitest + React Testing Library

---

## Standards I Hold

*   **Honesty Labels:** Every project is tagged `LIVE`, `CONCEPT`, `INTERNAL TOOL`, or `REDESIGN STUDY`. No marketing fluff.
*   **Performance First:** If a feature breaks the 90+ Lighthouse score, it's a conversation, not a surprise.
*   **Source Available:** The code is open for peers to inspect, learn from, and critique.

---

## Getting Started

### Prerequisites
*   Node.js 20+
*   npm or yarn

### Installation
1.  Clone the repository:
    ```bash
    git clone https://github.com/aedwon/aedwon-portfolio-minimalist.git
    cd aedwon-portfolio-minimalist
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Run the test suite:
    ```bash
    npm test
    ```

---

## Colophon

Independent builder · Digital artisan.  
Built in Next 16 · Source available.  
© 2026 Aedwon. All rights reserved.
