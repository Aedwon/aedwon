# Minimalist Theme Redesign — Design Spec

**Date:** 2026-04-20
**Scope:** Redesign the default "Minimalist" theme and rewrite all copy across 5 pages + global chrome. Other themes (Neubrutalist, DiscordOS) are untouched except where theme interop demands shared scaffolding.
**Status:** Approved for implementation planning.

---

## 1. Context

The portfolio is a Next.js 16 / React 19 chameleon site with three themes swapped via a `data-theme` attribute on `<body>`. The site sells two offerings: web solutions and community systems. Current copy is generic, project content is fictional, and the Minimalist theme reads like a template rather than a studio.

This spec redesigns the Minimalist theme (the default visitors land on) as an editorial, document-like surface with a confident point of view, honest framing of real work, and consistent copy voice across all pages.

## 2. Brand hinge

### 2.1 Lead voice (homepage)

**"A brand sells twice: once to the stranger, once to the regular. I build for both sales."**

This is the organizing principle for the entire site. `/web-solutions` handles "the stranger sale" (acquisition, conversion, first impression). `/community-solutions` handles "the regular sale" (retention, ritual, return). Every page reinforces one or both halves.

### 2.2 Voice (copywriting)

Voice C — **POV statements lead**. Short declarative sentences. No "not this, that" negation patterns. No marketing fluff ("predictable growth," "proven methodology," "high-impact delivery"). Plain language with teeth. Examples live in the page-by-page sections below.

### 2.3 Content reality

All client-facing content is real or labeled as such:
- **No fake testimonials.** Testimonials section removed entirely until real ones exist.
- **Real community numbers.** Bot count, moderated member count, server count — placeholders in spec, real numbers at launch.
- **Honest project labels.** Each project card is tagged `LIVE` / `CONCEPT` / `INTERNAL TOOL` / `REDESIGN STUDY` so visitors know what they're looking at.
- **Honest availability labels.** `NOW BOOKING · TAKING ONE AT A TIME` replaces generic "currently available" language.

### 2.4 Brand identity

**Aedwon leads; "The Living Lab" retires on Minimalist.** Minimalist is the studio voice. Neubrutalist and Discord keep their existing identities; the colophon in the footer notes them as "three skins" of the same studio.

## 3. Audience

Ordered by priority:
1. **Web project buyers** — founders, event organizers, small agencies looking for a site that converts.
2. **Community project buyers** — game studios, brands, creators running Discord or similar.
3. **Both-at-once buyers** — people running a launch that needs both halves.
4. **Recruiters / collaborators** — secondary, not designed for but not turned away.
5. **Students / peers** — tertiary; colophon and source-available posture serves them.

## 4. Personality

Mix (50/25/25):
- **50% Editorial Craftsman** — editorial pacing, typographic rigor, confident blank space.
- **25% Systems Thinker** — structured § markers, modular tokens, explicit honesty labels.
- **25% Quiet Humorist** — occasional bite in copy ("I leave the doors open," "same two-day reply").

## 5. Global design system

### 5.1 Typography

Three families load via `next/font/google` in `app/layout.tsx`:

| Variable | Font | Usage in Minimalist |
|---|---|---|
| `--font-sans` | Inter | Body copy, UI labels, form fields |
| `--font-serif` | Source Serif 4 | Display (h1, h2, hero leads) |
| `--font-mono` | IBM Plex Mono | § markers, state labels, metadata |

Space Mono (currently loaded) remains available for Neubrutalist/Discord via their existing `--font-theme` overrides. Weights kept minimal: Inter (400/500/700), Source Serif 4 (400/700), IBM Plex Mono (400/500). No italics unless used.

Neubrutalist and Discord override `--font-theme` back to their current families — no font change for those themes.

### 5.2 Type scale

Modular 1.25 ratio, rem-based. Shared across all three themes (structural rhythm benefits all skins equally):

```css
--fs-micro: 0.6875rem;   /* 11px */
--fs-small: 0.875rem;    /* 14px */
--fs-body: 1rem;         /* 16px */
--fs-h3: 1.5rem;         /* 24px */
--fs-h2: 2.25rem;        /* 36px */
--fs-h1: 3.375rem;       /* 54px */
--fs-display: 5rem;      /* 80px */
```

### 5.3 Color (Minimalist only)

```css
--color-ink: #111111;             /* near-black, not pure */
--color-paper: #FAFAF7;           /* warm off-white */
--color-rule: color-mix(in srgb, var(--color-ink) 15%, transparent);
--color-accent: [MINIMALIST_ACCENT_HEX];  /* muted terracotta range, pinned pre-build */
```

`--color-accent` must clear 4.5:1 on `--color-paper` for body-text usage and 3:1 for large text / UI. Neubrutalist and Discord override all four tokens.

### 5.4 Rhythm

```css
--rule-hairline: 1px;
--space-baseline: 0.5rem;   /* 8px grid */
```

Vertical rhythm rounds to multiples of 8px. Section padding: 80px top/bottom at lg, 48px at md, 32px at sm.

### 5.5 Motion

Two layers of reduced-motion handling:

**CSS kill-switch** in `globals.css`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Framer Motion wrapper.** Build a `MotionWrapper` component that calls `useReducedMotion()` once; when true, sets `transition={{ duration: 0 }}` and strips entering transforms. Replace direct `motion.*` usage in existing components with this wrapper so reduced-motion is enforced in one place.

**Exception:** theme-switch color transitions (`duration-300`) are kept — color interpolation doesn't trigger vestibular symptoms.

### 5.6 CSS variable strategy

Preserve existing pattern: `:root` holds Minimalist defaults; `[data-theme='neubrutalist']` and `[data-theme='discord']` override. New Minimalist-specific tokens added to `:root`. Shared scale/rhythm tokens stay in `:root` for all themes. Theme-specific color, font, and shadow tokens are overridden per theme.

## 6. Global components

### 6.1 Navbar

Minimalist treatment:
- Fixed height 64px, `--color-paper` background with `--rule-hairline` bottom border.
- Logo/wordmark left: "Aedwon" in Source Serif, weight 700.
- Nav links: Inter 500, 14px, `--color-ink` at 70% opacity, 100% on hover.
- Right cluster: chameleon switcher toggle (see §6.3), then primary CTA link "Book a call →" routing to `/contact`.

### 6.2 Footer

Minimalist treatment:
- Top rule hairline, 64px top/bottom padding.
- Three columns at lg: colophon (left), site map (center), contact (right).
- Colophon copy:
  > *"Aedwon is a studio of one. This site has three skins — paper, sticker, server. [Switch it](#) — it remembers."*
- Contact column: `contact@aedwon.com` + three social links (existing).
- Bottom line: `© 2026 Aedwon · Built in Next 16 · Source available`

### 6.3 Chameleon switcher

- Moved from prominent button to small toggle icon in navbar top-right.
- Dropdown on click: three options with evocative labels (not design-movement jargon):
  - **Paper** (Minimalist — default)
  - **Sticker** (Neubrutalist)
  - **Server** (Discord)
- Selection persists to localStorage (existing behavior).
- Minimalist is the default on first visit.
- Single footer colophon callout links back to the switcher (see §6.2).

## 7. Page: Homepage (`/`)

### 7.1 Architecture

Replace current 8-section stack with:

```
§ 00 — Hero (lead POV)
§ 01 — Services status strip (state label)
§ 02 — Two-offer split (web / community)
§ 03 — Selected work (honest labels, mixed projects + community)
§ 04 — How I work (5-step summary, link to /process)
§ 05 — Who this is for (5 yeses, 4 nos — keep existing logic, rewrite copy)
§ 06 — FAQ (keep existing accordion, rewrite copy)
§ 07 — Start (CTA)
```

**Removed:** StatsBar (fake numbers), Testimonials (no real ones yet).

### 7.2 Copy

**§ 00 Hero:**
> *"A brand sells twice: once to the stranger, once to the regular. I build for both sales."*

Sub-copy:
> *"Web solutions that make strangers pick you. Community systems that make regulars stay. Both together, if that's what the work needs."*

**§ 01 State strip:**
> `● NOW BOOKING · TAKING ONE AT A TIME`

**§ 02 Two-offer split:**
Two cards side-by-side (stacked on mobile).

Left card:
> *"The stranger sale"*
> *"Sites, products, and landing pages that convert first-time visitors into customers."*
> → `/web-solutions`

Right card:
> *"The regular sale"*
> *"Bots, moderation, and rituals that make members come back in month eight."*
> → `/community-solutions`

**§ 05 Who this is for, §06 FAQ, §07 CTA copy:** rewritten in voice C, details in each component's follow-up pass during implementation.

## 8. Page: `/web-solutions`

### 8.1 Architecture

```
§ 01 — POSITION (hero + state label)
§ 02 — WORK (project grid with honest labels)
§ 03 — STANDARDS (what I commit to)
§ 04 — PRICING (3 tiers)
§ 05 — START (CTA)
```

### 8.2 Copy

**§ 01 POSITION hero:**
> *"The stranger sale."*
> *"A website has one job: make the right person pick you. I build sites that do that job honestly."*

State label (top-right): `NOW BOOKING · TAKING ONE AT A TIME`

**§ 02 WORK — project cards.** Each card: `[LABEL] · [STATUS] · [STACK]` + one-line description + link.

Real projects (placeholders filled pre-launch):
1. **MSL 2026** — `LIVE · REDESIGN` — Next — *"Redesign for Moonton Student Leaders PH."* → `msl2026.vercel.app`
2. **Lakambini Events** — `LIVE · REDESIGN` — Next — *"Redesign for Lakambini Events."* → `lakambini-redesign.vercel.app`
3. **QR Customizer** — `LIVE TOOL` — Next — `[1-LINE_WHAT_IT_DOES]`
4. `[ADDITIONAL_WEB_PROJECT · LABEL/STATUS/STACK/1-LINE]` — optional slot for another web-forward project from the user's portfolio.

**Not on this page:** TV Kiosk Survey, commands reference site, and other bot-adjacent artifacts live on `/community-solutions` §02 — they fit that page's "rooms full of real people" framing better.

**§ 03 STANDARDS:**
> *"I don't ship slow sites. Core Web Vitals in the green. Lighthouse 90+ on launch. When a new marketing script would break that, I'll say so — and you decide."*

Plus two supporting lines:
> *"Accessible by default — WCAG 2.1 AA on every page I touch."*
> *"Semantic HTML. Real headings. Alt text that says something."*

**§ 04 PRICING:**

| Tier | Price | Copy |
|---|---|---|
| **Audit** | `[AUDIT_PRICE]` | *Two weeks. I look at what you have. I write up what's broken, what's working, and what I'd build next. You get a plan you can give to anyone — me, a hire, or nobody.* |
| **Build** | `[BUILD_PRICE]`+ | *Fixed-scope build. One site, one funnel, one product. Discovery, spec, staging demos, deploy, 30-day post-launch support.* |
| **Care Plan** | `[CARE_PLAN_PRICE]`/mo | *Monthly maintenance. Updates, monitoring, small features. Month-to-month — if it's not earning its keep, cancel it.* |

**§ 05 START:**
> `§ 05 — START`
> *"If you've got a launch coming and you want it to land, we should talk."*
> → **Book a discovery call** [ARROW] → `/contact`
> `NOW BOOKING · TAKING ONE AT A TIME`

## 9. Page: `/community-solutions`

### 9.1 Architecture

```
§ 01 — POSITION (hero + state label)
§ 02 — WORK (bots + artifacts, honest labels)
§ 02.5 — CRAFT DEMO (existing dashboard, reframed)
§ 03 — WHAT I HANDLE (three pillars)
§ 04 — PRICING (3 tiers)
§ 05 — START (CTA)
```

### 9.2 Copy

**§ 01 POSITION hero:**
> *"Anyone can gather a crowd. Keeping it warm is a different job. That's my job."*

Sub-copy:
> *"`[BOT_COUNT]` bots in production. `[TOTAL_MEMBERS_MODERATED]`+ members moderated across `[SERVER_COUNT]` servers. The ones that stick have structure — roles, rituals, rules that carry their own weight."*

State label: `NOW BOOKING · TAKING ONE AT A TIME`

**§ 02 WORK — cards:**
1. `[MSL_NETWORK_BOT · NAME]` — `LIVE · [MEMBER_SCALE]` — Discord.js/Node — *"Cross-server identity & roles for Moonton Student Leaders PH."* `[1-LINE]`
2. `[ILOCOS_BOT · NAME]` — `LIVE · [MEMBER_SCALE]` — `[STACK]` — `[1-LINE]`
3. `[BOT_3 · NAME]` — `LIVE · [MEMBER_SCALE]` — `[STACK]` — `[1-LINE]`
4. `[BOT_4 · NAME]` — `LIVE · [MEMBER_SCALE]` — `[STACK]` — `[1-LINE]`
5. **Commands reference site** — `LIVE TOOL · INTERNAL` — Next — *"Public command docs for one of my bot stacks. Built so moderators stop DMing me."*
6. **Kiosk survey (offline-first)** — `LIVE · FIELD-TESTED` — Next/PWA — *"Tablet app for a live event. Same shape of problem as community software — systems for rooms full of real people."* → `kiosk-survey-three.vercel.app`

**§ 02.5 CRAFT DEMO — reframed existing dashboard.** Keep the current sentiment chart + metrics UI. Label it `LIVE · INTERNAL TOOL` or `CONCEPT · PROTOTYPE`. Add one line:
> *"This is the kind of panel I'd build you. Data here is illustrative."*

**§ 03 WHAT I HANDLE — three pillars:**

**Structure** — roles, permissions, onboarding flows, channel architecture, rituals that don't need me in the room.
**Software** — custom bots (moderation, leveling, economy, reporting), dashboards, integrations with the tools you already use.
**Steward** — day-to-day moderation, escalation playbooks, weekly health reports, event ops. I run it, or I train someone on your side to run it.

Closing line:
> *"Not every community needs all three. Most need two. We figure out which on the call."*

**§ 04 PRICING:**

| Tier | Price | Copy |
|---|---|---|
| **Audit** | `[AUDIT_PRICE]` | *Two weeks. I join, I watch, I write up what's broken and what to build. You get a plan you can give to anyone — me, a hire, or nobody.* |
| **Automaton** | `[AUTOMATON_PRICE]`+ | *Fixed-scope bot build. One specific job, done well. Think: onboarding flow, leveling system, moderation stack, reporting dashboard.* |
| **Operator** | `[OPERATOR_PRICE]`/mo | *I run the community with you. Bots, moderation, rituals, reports. Month-to-month, no lock-in — retention earns retention.* |

**§ 05 START:**
> `§ 05 — START`
> *"If your community is at the stage where the work of keeping it alive is starting to cost you sleep, that's the right time."*
> → **Book a discovery call** [ARROW] → `/contact`
> `NOW BOOKING · TAKING ONE AT A TIME`

## 10. Page: `/process`

### 10.1 Architecture

Preserve existing vertical timeline visual (alternating cards on a center line). Rewrite all copy, add § markers, rename step 05.

```
§ 00 — HERO
§ 01 — DIAGNOSTIC
§ 02 — BLUEPRINT
§ 03 — BUILD
§ 04 — LAUNCH
§ 05 — OPERATE  (renamed from "Growth Engine")
§ 06 — START
```

### 10.2 Copy

**§ 00 HERO:**
> *"Every project goes through five rooms. I leave the doors open."*

Sub-copy:
> *"Same five steps for web and community work. What differs is what's in the room, not the rooms themselves."*

**§ 01 DIAGNOSTIC** — *"We figure out what's actually broken."*
> Two weeks. I look at what you have — site, server, tools, data. I write up what's working, what isn't, and what I'd build next.
>
> **Outcome:** *You get a plan you can give to anyone — me, a hire, or nobody.*
>
> *Sold on its own, this step is what `/web-solutions` calls the **Audit** tier.*

**§ 02 BLUEPRINT** — *"We agree on the shape before I touch it."*
> One document. Scope, deliverables, timeline, price. Signed off before the first commit. No surprise line items later.
>
> **Outcome:** *You know exactly what you're paying for and when it arrives.*

**§ 03 BUILD** — *"I work in staging. You watch in public."*
> Weekly demos — screenshots, screen recordings, live links. You see progress before production does. Nothing goes live without you pressing the button.
>
> **Outcome:** *No "big reveal." No launch-day surprises. You've already seen it.*

**§ 04 LAUNCH** — *"We go live, and I stick around."*
> Deploy. Write the docs. Train whoever runs it after me. 30 days of post-launch support — bugs, questions, tweaks — included.
>
> **Outcome:** *The thing works, and the people who need to use it know how.*

**§ 05 OPERATE** — *"I keep running it, or I hand it off clean."*
> Month-to-month retainer, or a clean handoff with docs and training. Both are real options. The right one depends on who's doing the work in month three.
>
> **Outcome:** *No vendor lock-in. You stay in control of the decision, always.*

**§ 06 START:**
> *"Fifteen minutes on a call. I'll tell you honestly if I can help. If I can't, I'll tell you who might."*
> → **Book a discovery call** [ARROW] → `/contact`
> `NOW BOOKING · TAKING ONE AT A TIME`

### 10.3 Visual tweaks (Minimalist only)

- Center timeline line: hairline (1px, `--color-rule`) instead of current 30% opacity 0.5px.
- Step markers: bordered circles containing the § number (01–05), not the icon. Icon moves to the card header.
- Outcome box: switch from filled `bg-accent-secondary` to a 2px left-rule with no fill — consistent with other quiet callouts elsewhere.

## 11. Page: `/contact`

### 11.1 Architecture

Three doors, same offer:

```
§ 00 — HEADING + state label
§ 01 — BOOK A CALL (primary: Google Calendar link out)
§ 02 — OR WRITE IT OUT (form fallback)
§ 03 — OR JUST EMAIL (email fallback)
```

### 11.2 Copy

**§ 00:**
Heading: *"Start a Project"* (keep)
Sub-line: *"Pick a time, fill in the form, or drop an email. All three get a reply within two business days."*
State label: `● NOW BOOKING · TAKING ONE AT A TIME`

**§ 01 BOOK A CALL:**
> *"Fifteen minutes. I'll tell you honestly if I can help. If I can't, I'll tell you who might."*
> → **Pick a time** → `https://calendar.app.google/n45XYFRHnmzTC5Fr6`
> `NOW BOOKING · TAKING ONE AT A TIME`

Link out, do not embed — iframe is heavy and Google-branded.

**§ 02 OR WRITE IT OUT:**
> *"Prefer to think on the page? Fill this out — I reply within two business days."*

Form fields (Minimalist):

| Field | Label | Placeholder |
|---|---|---|
| Name | "Your name" | *(blank)* |
| Email | "Email" | `you@domain.com` |
| Project Type | "What's the project" | options: *"A web project"* / *"A community project"* / *"Both, or I'm not sure yet"* |
| Goal | "What are you trying to get to" | *"A sentence or a pitch deck — both work. Say it however comes easiest."* |
| Submit | — | **Send it →** (right-aligned text link, not full-width block) |

**§ 03 OR JUST EMAIL:**
> *"Email works too: `contact@aedwon.com`. Same two-day reply."*

### 11.3 Visual tweaks

- Labels: uppercase, `tracking-widest`, `--fs-micro` (11px) — matches § markers.
- Field rows: 32px gap (up from current 24px).
- Focus state: bottom border transitions from `--color-rule` (15%) to `--color-ink` (100%) over 200ms.
- Submit button: right-aligned text link with arrow, not full-width solid block. Keeps page gravity on content.

## 12. Accessibility

- **WCAG 2.1 AA** across all pages.
- **Contrast:** ink-on-paper at ~17:1 (AAA). Accent validated at ≥4.5:1 for body, ≥3:1 for large/UI before color is finalized.
- **Focus:** visible 2px solid `--color-ink` outline with 2px offset on all interactive elements.
- **Skip-to-main:** existing link in `layout.tsx:41-46` preserved.
- **Form labels:** `<label>` present for every input (existing). Add `aria-describedby` on the goal field linking to the two-day reply promise.
- **Type sizing:** all rem-based. No `px` body copy.
- **Heading hierarchy:** one `<h1>` per page. § markers styled as `<p>` or `<span>`, not headings.
- **Motion:** reduced-motion respected via CSS kill-switch + Framer Motion wrapper (see §5.5).

## 13. Removed / reframed sections

- **StatsBar** (`components/StatsBar.tsx`) — removed from homepage. Fake numbers.
- **Testimonials** (`components/Testimonials.tsx`) — removed entirely. Re-add when real ones exist.
- **Dashboard preview** on `/community-solutions` — kept, reframed with honest label + "data illustrative" line (see §9.2).
- **"Growth Engine"** step name — renamed to **OPERATE** on `/process`.
- **"Predictable Growth"** hero on `/process` — replaced.
- **"Currently Accepting New Clients"** label on `/contact` — replaced with `NOW BOOKING · TAKING ONE AT A TIME`.
- **"The Living Lab by Aedwon"** metadata title — updated to reflect Aedwon-as-studio framing (exact title pinned pre-build).

## 14. Placeholders to fill before launch

Listed by source. User will provide via separate content pass (potentially driven by a Gemini CLI prompt against the project files).

**Web projects (§8.2):**
- `[QR_CUSTOMIZER · 1-LINE_WHAT_IT_DOES]`
- `[ADDITIONAL_WEB_PROJECT]` — optional 4th slot (label, status, stack, 1-line) — keep blank if MSL/Lakambini/QR carry enough weight.

**Community (§9.2):**
- `[BOT_COUNT]`, `[TOTAL_MEMBERS_MODERATED]`, `[SERVER_COUNT]`
- For each of 4 bots: `NAME`, `MEMBER_SCALE`, `STACK`, `1-LINE`
  - `[MSL_NETWORK_BOT]`
  - `[ILOCOS_BOT]`
  - `[BOT_3]`
  - `[BOT_4]`

**Pricing:**
- `[AUDIT_PRICE]` (web tier + community tier — may differ)
- `[BUILD_PRICE]`
- `[CARE_PLAN_PRICE]`
- `[AUTOMATON_PRICE]`
- `[OPERATOR_PRICE]`

**Visual:**
- `[MINIMALIST_ACCENT_HEX]` — muted terracotta range, pinned and contrast-validated pre-build.

**Metadata:**
- Updated `<title>` and `<meta description>` in `layout.tsx`.

## 15. Out of scope

- Neubrutalist and DiscordOS visual redesigns (copy and tokens stay as they are).
- CMS integration — content stays in-repo for now.
- Analytics / conversion tracking.
- Blog / writing section.
- Newsletter signup.
- Dark mode for Minimalist (Minimalist is light-only by design — Neubrutalist/Discord provide alternative surfaces).

## 16. Portfolio self-presentation

Colophon-only (Option A). Footer line:
> *"This site is the studio. Built in Next 16, three skins, source available on GitHub."*

No dedicated card on `/web-solutions`. The site speaks for itself via being used.

## 17. Open questions (deferred — not blocking)

- Exact accent hex (`[MINIMALIST_ACCENT_HEX]`).
- Final per-bot content from user's Gemini CLI pass.
- Whether § 02.5 dashboard stays labeled `LIVE · INTERNAL TOOL` or `CONCEPT · PROTOTYPE` — pick when real usage clarifies.
- Whether the portfolio site itself gets a GitHub link in the footer colophon, or just the phrase "source available."
