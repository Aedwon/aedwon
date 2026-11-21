# Workflow page

Date: 2026-11-21
Status: first version approved for build. Aedwon reviews it on localhost.

## Part 1. For Aedwon's approval

### Purpose

A page at `workflow.aedwon.site` that shows friends, technical or not, how Aedwon works with AI agents. A friend who finds a part useful can copy its prompt and paste it into their own tool.

### Decisions

Each decision carries one of his three labels.

| Topic | Decision | Label |
| --- | --- | --- |
| Address | `workflow.aedwon.site`, served from this repo and its Vercel project. | Locked by Aedwon |
| Complexity | Balanced, built as a small first version. | Locked by Aedwon |
| Who can find it | Unlisted. No link from the portfolio, no sitemap entry, and search engines are told not to index it. | Locked by Aedwon |
| Where the text lives | In this public repo. He accepts that the text is readable on GitHub. | Locked by Aedwon |
| The words | The "Page copy" tab of the Claude doc "Workflow page copy", as he approved it on 2026-11-21. The build copies it word for word. | Locked by Aedwon |
| Shape of a part | What he does, his reason in his own voice, then the prompt. No labels in front of lines. | Locked by Aedwon |
| Order | Setup first, then one task in the order work happens, then where to paste, then the work examples. | Locked by Aedwon |
| Private names | "A study app" and "a Discord bot". No emails, account names, prices, client names or personal matters. | Locked by Aedwon |
| Design system | The "Workflow page design system" board, built from the portfolio's tokens. Off-white base, near-black ink, ink as the only accent, thin solid lines, flat surfaces. | Locked by Aedwon |
| Typeface | Goeist, a rounded take on Geist, self-hosted under the SIL Open Font License. | Locked by Aedwon |
| Accessibility | WCAG 2.0 AA. | Locked by Aedwon |
| Review | He reviews the built page on localhost. No separate Claude Design port for this page. | Locked by Aedwon |
| Copy for my agent | One button copies every prompt at once. The same text is served as plain text. | Locked by Aedwon |
| Snapshot | The page shows the date of its last update. It is refreshed by hand on the 15th and the last day of each month, through a pull request he approves. | Locked by Aedwon |
| Commit hashes and branch names in the "before" reply | Replaced with neutral stand-ins, because the repo is public. | Decided on delegation |

### What a visitor sees, in order

- The title, one line, and the snapshot date.
- Mindset and Treatment.
- Setup: Company policy, Project playbook, The org chart, Codex, Tools.
- A task, in the order work happens: Top-down approach, Scope before work, Standards before work, Decision record, Proof before "done", Outside audit, Who may sign what, Process improvement.
- Where to paste.
- Work examples: Before and after, One task, How the rules grew.

### Two pictures, kept apart

- **Who works for whom.** Aedwon talks to one lead. The two rule files feed the lead. The advisor sits above the lead. The lead hands work to implementers and bulk workers, and they report to the lead. An auditor from another vendor sits outside the chain.
- **What happens to a task.** He asks the lead. The lead brainstorms with him until his intent is clear. The lead offers three sizes with time, and he picks. The lead writes the spec, and he approves the plain-language part. The lead writes the plan. The lead hands work to workers, and they report back with proof. The lead commits and asks him before anything destructive or public. He checks what a visitor would see. An audit is optional. The lead can call it at any level, from the plan of plans to an implementation plan to the finished build, and the auditor reports to the lead.

He confirmed both in words on 2026-11-21.

### What a visitor can do in the first version

- Read every part. One pattern reveals a part's detail, and it is the same everywhere.
- Copy a part's prompt with one button that confirms the copy.
- Copy every prompt at once with "Copy for my agent".
- Read both replies of the before and after in full.
- Use it on a phone, with a keyboard, and with reduced motion.

### Left for later

- An animated replay of one task through the picture.
- A control that rebuilds the picture at each date in "How the rules grew".
- A switch between Claude and Gemini model names. The copy already lists both.
- A scheduled job on his Mac that prepares each snapshot.
- Hooking up the subdomain in Vercel and DNS. That is an outside change and needs his approval when the page is accepted.

### Standards applied

[Web interface design](~/Documents/Projects/agent-standards/web-interface-design.md), read through this repo's `docs/design-principles.md`, whose "His taste" section wins where the two differ. The rules that matter most here are text contrast (WCAG 2.0 AA, 1.4.3), color never the only cue (1.4.1), visible keyboard focus (2.4.7), one disclosure pattern for items of the same kind, motion with a purpose and a short duration, and every drawn connection matching the facts.

### How we will know it is done

- Every sentence, prompt and quote on the page matches the approved copy. A test compares them.
- Each Copy button puts the exact prompt text on the clipboard.
- The page tells search engines not to index it, and it is absent from the sitemap.
- The plain-text version holds every prompt.
- The design check reports no errors on the page.
- Both pictures match the sentences above.
- Aedwon accepts it on localhost.
- One friend who does not know his setup finds and copies a prompt without help.

## Part 2. For agents

Read `AGENTS.md`, `docs/process-improvement.md` and `docs/design-principles.md` first.

### Facts about the repo

- Next 16.1.1, React 19.2.3, App Router, Tailwind 3.4.1, Vitest 4.1.4 on jsdom. CI job `verify` runs `npm ci`, `npm test`, `npm run lint`, `npm run build`, then curls agent endpoints, sitemap, robots and `noindex` pages. CI runs Node 24. Four test files fail locally on Node 26 for an unrelated reason.
- `app/logo-cropper/` and `app/logo-sizing/` are the pattern for a standalone page with its own `layout.tsx` and `robots: { index: false, follow: false }`.
- The root `app/layout.tsx` applies to every route. It loads Geist fonts, `globals.css`, JSON-LD, and a canonical of `/`.
- `app/sitemap.ts` is a hand-built list. `lib/agent-content.ts` hardcodes which paths have a Markdown version.
- `framer-motion` 12.23.26 is installed and unused.
- Every file in `content/projects/` must be a valid project, so page content goes elsewhere.

### Build

- Route: `app/workflow/`, with its own layout, following the logo-cropper pattern. Reviewed at `/workflow` on localhost. The host rewrite for the subdomain comes later.
- Unlisted: `noindex` metadata, a canonical that overrides the root layout's, and no entry in the sitemap or `llms.txt`. Add the page to the CI `noindex` curl check.
- Content: `content/workflow/page.json`, with a typed loader and a validator under `lib/workflow/` and a test that the file is valid. Fit the shape to the approved copy.
- Tokens: start from the design system's `tokens.css`. Self-host the Goeist variable font with `next/font/local`, and keep its license file beside it.
- Both pictures are drawn from data in the content file, never by hand, so a drawn connection cannot drift from the facts.
- Copy for my agent: one plain-text document built from the content file, copied by the button and served as `text/plain` at a fixed path under the route.
- Motion: only the design system's short durations. No looping motion, no entrance sequence. Honor `prefers-reduced-motion`.
- Tests: content validates, rendered text equals content text, Copy buttons copy the exact prompt, the agent text holds every prompt, `noindex` is present, the sitemap omits the page.
- Before showing: run the design check on the page and fix its errors, as required step 4 says.

### Out of scope

- Any change to the portfolio's own pages.
- Making the page public.
- New tooling. Building a script or check needs his approval first.
