# Design principles

## What this file is for

Read this before you brief, build or review any design for this repo. It records what Aedwon prefers, drawn from six of his shipped projects (the portfolio v3, Pantas design system 4, Kanlungan, Marwie Control, QR Studio, Genshin Guides). It also holds the standards he named, his copy rules and the design check. The check measures a rendered page for symptoms of patterns he rejects. It cannot judge taste, so his eye still decides.

For sourced detail on industry principles, `~/Documents/Projects/agent-standards/web-interface-design.md` is optional reading. Where that file and this one give different numbers, "His taste" below wins for this repo.

## His taste

Counts are out of the six projects. A rule here is a recurring choice.

| Area | Rule | Projects |
|---|---|---|
| Base and ink | Warm or neutral off-white light base with near-black ink. Never pure white on pure black. | 5 of 6 |
| Light and dark | One system translated into the other, not two looks. | 4 |
| Accent | One brand accent. Other hues only for status. The portfolio has none. | 5 |
| Surfaces | Flat at rest. No card inside a card (his words, 2026-10-28). Separate groups inside a card with a rule line. | 5 |
| Shadow | None on resting cards. Soft, neutral and low-contrast only on things that float. No colored glow. | 5 |
| Gradients | None as a wash or surface. Written bans in four projects. | 4 |
| Borders | 1px or 0.5px solid hairlines. 2px only for focus, selection and validation. | 5 |
| Corner radius | 8 to 18px on working surfaces. Large radii only on floating things. Full round only for tags, dots, avatars and switches. | 4 |
| Type | One sans family at weights 400 to 700. Headings heavier and tighter-tracked. Sentence case labels, no uppercase labels. | 6 |
| Monospace | Rare. Data only in the portfolio, forbidden in Genshin Guides, unused in the other four. | 1 allows |
| Motion | UI motion 120 to 300 ms with one decelerating ease-out family. Hover is a color change. Press scales to 0.97. Long motion only for one authored moment. Nothing loops at rest. | 6 |
| Reduced motion | Handled in the spec. | 6 |
| Disclosure | Detail appears on the row you are on (hover or focus), with a phone fallback. Read content opens in place, not in a modal. | 3 firmly, 2 partly |
| Text amount | Minimal. Each fact once. No hint text, no helper captions. | 4, plus his words |
| Focus | Visible 2px outline (3px in Marwie), offset 2 to 3px, accent or ink color. | 5 |
| Spacing | A short named scale on a 4px base. | 3 |

Where they differ:

- Kanlungan uses 2px radius on everything and bans pills and circles. It is an editorial studio, and the reason is the brand.
- Pantas uses Title Case on buttons. The three others that state a case rule use sentence case.
- Pantas and the portfolio use Geist. He rejected Geist with Instrument Serif on 2026-11-17 ("others will spot the overused fonts"). Those two were approved earlier, and nothing records whether they are exempt. Do not assume they are.
- Genshin Guides allows decorative borders that follow a character's element. They are slide frames in the product the guide shows, not interface chrome.
- Density differs by product. Marwie is compact (34 to 40px rows) and Kanlungan is airy (128px sections).
- Hard offset shadows, thick borders and color blocks were approved once, in the superseded neobrutalist portfolio theme from August 2026. Treat it as retired.

## Standards he named

- WCAG 2.0 AA is the accessibility bar. He stated it on 2026-11-08 (Pantas) and 2026-11-21.
- Apple's Human Interface Guidelines supply interaction and usability principles, not Apple's look. No frosted glass, traffic lights or iOS controls.

The WCAG 2.0 AA numbers that matter here (success criterion 1.4.3):

- Text contrast is at least 4.5 to 1. Ratios are not rounded, so 4.499 to 1 fails.
- Large text needs at least 3 to 1. Large means 24 CSS px regular, or about 18.66 CSS px at weight 700 or more.
- Color is never the only cue (1.4.1). Text resizes to 200 percent (1.4.4). Moving content over five seconds can be paused (2.2.2). Focus is visible (2.4.7).

## Copy rules

- No eyebrow labels and no eyebrow pills above headings ("i dont like eyebrows", 2026-11-17).
- No numbering on sections, parts or headings unless the content is a real ordered list ("i also hate numbering in sections that are not even listing something", 2026-11-21).
- No redundancy. Each fact appears once, including a second identical button or link.
- No hint text or helper captions such as "Scroll", "Drag" or "Hover to see".
- Nothing a visitor does not need ("no redundancies, no unnecessary text or info", 2026-11-17).

## How to use the check

```
node scripts/design-check/cli.mjs <file-or-url> [--tokens <css file>] [--json] [--allow-network]
```

Set `DESIGN_CHECK_CHROMIUM` to a Chromium binary, or Playwright's default is used. The script opens the page at 1440 by 900 and 390 by 844, waits up to six seconds for motion to settle, and prints findings by rule. It exits 1 if any error exists, 0 otherwise, and 2 if it cannot open the page. Local files load with outside requests blocked, so web fonts fall back. The browser run is not part of CI.

Errors: `contrast`, `overflow-x`, `eyebrow`, `heading-numbering`, `glow` (colored or blurred shadow, not a zero-blur ring), and an unknown exemption id. Warnings: `gradient-surface`, `infinite-animation`, `min-text-size`, `budget-font-sizes`, `budget-font-families`, `budget-radii`, `budget-border-widths`, `budget-shadows`, `accent-hues`, `accent-bar`, `border-dashed`, `pill-shape`, `mono-outside-code`, `light-weight`, `duration-band`, `entrance-length`, `hover-scale`, `target-size`, `target-size-touch`. Fix every error before he sees a sample. Do not tune a threshold to get a pass. Most thresholds are suggestions, not sourced. They sit at the top of `scripts/design-check/rules.mjs`, marked "suggested".

`--tokens` takes a CSS file. A color defined under a custom property whose name contains `status`, `success`, `warn`, `danger`, `error`, `done`, `progress` or `failed` stays out of the `accent-hues` count. Without it, status colors cannot be told apart from accents.

To exempt part of a page, put `data-design-check-ignore="rule-id other-rule-id"` on an element. It exempts that element and its descendants from those rules only. The report lists every exemption with its rule id, element and covered count. An unknown rule id is an error. An exemption needs a reason a reviewer would accept, such as a specimen board showing three typefaces side by side. "The check failed" is not a reason.

Limits:

- It measures the page at rest. A panel that opens on click is not seen. Open the page in that state through a URL.
- Stylesheet rules count only when their selector matches something and their media query is active. Loops declared only in hover or state rules are not counted.
- It cannot judge hierarchy, tone, imagery, copy or whether a design impresses.
- Contrast skips text over photos and uses the worst gradient stop. Text and targets on a scaled fixed stage are measured as rendered.

## By-eye questions

- First read: what do I read first, and is it the page's purpose?
- One focal element: squint at a screenshot. Is the first-glance target the intended one?
- Color is not the only cue: in grayscale, can every state pair still be told apart?
- Motion has a purpose: what does the viewer learn from it that a static state would not show?
- Reduced motion: with it on, is every step still reachable and readable?
- Consistent disclosure: does every item of the same kind hide and reveal detail the same way?
- Every drawn connection matches the facts: write each connection as a sentence of who calls whom, then compare it with the picture.
