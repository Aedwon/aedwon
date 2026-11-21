# Design principles

## 1. What this file is for

Read this before you brief, build or review any design for this repo. It records what Aedwon prefers (from his own shipped projects), the standards he named, and the industry principles that apply to interactive pages and diagrams. Each principle names the anti-pattern it rules out and the check that covers it. The check is a script that measures a rendered page (`scripts/design-check/`). It finds symptoms and cannot judge taste, so his eye still decides.

His preferences come from a study of six projects with real design work (the portfolio v3, Pantas design system 4, Kanlungan, Marwie Control, QR Studio, Genshin Guides). The principles come from sources linked in section 4.

## 2. His taste

Counts are out of the six projects. A rule here is a recurring choice, not a law of nature. Where his projects differ, the difference is noted.

| Area | Rule | Projects |
|---|---|---|
| Base and ink | Warm or neutral off-white light base with near-black ink. Never pure white on pure black. | 5 of 6 |
| Light and dark | One system translated into the other, not two looks. | 4 |
| Accent | One brand accent. Other hues only for status. The portfolio has none. | 5 |
| Surfaces | Flat at rest. Cards sit on a page color. No card inside a card (his words, 2026-10-28). Separate groups inside a card with a rule line. | 5 |
| Shadow | None on resting cards. Soft, neutral and low-contrast only on things that float. No colored glow. | 5 |
| Gradients | None as a wash or surface. Written bans in four projects. | 4 |
| Borders | 1px or 0.5px solid hairlines. 2px only for focus, selection and validation. | 5 |
| Corner radius | 8 to 18px on working surfaces. Large radii only on floating things. Full round only for tags, dots, avatars and switches. | 4 |
| Type | One sans family at weights 400 to 700. Headings heavier and tighter-tracked than body. Sentence case labels. | 6 (sentence case in 4) |
| Monospace | Rare. Data only in the portfolio, forbidden in Genshin Guides, unused in the other four. | 1 allows |
| Motion | UI motion 120 to 300 ms with one decelerating ease-out family. Hover is a color change. Press scales to 0.97. Long motion only for one authored moment. Nothing loops unless a board marks it. | 6 |
| Reduced motion | Handled in the spec. | 6 |
| Disclosure | Detail appears on the row you are on (hover or focus), with a phone fallback. Read content opens in place, not in a modal. | 3 firmly, 2 partly |
| Text amount | Minimal. Each fact once. No hint text, no helper captions. | 4, plus his words |
| Focus | Visible 2px outline (3px in Marwie), offset 2 to 3px, accent or ink color. | 5 |
| Spacing | A short named scale on a 4px base, checked by script. | 3 |

Where they differ:

- Kanlungan uses 2px radius on everything and bans pills and circles. It is an editorial studio, and the reason is the brand.
- Pantas uses Title Case on buttons. The other three that state a case rule use sentence case.
- Pantas and the portfolio use Geist. He rejected Geist with Instrument Serif on 2026-11-17 ("others will spot the overused fonts"). Those two were approved earlier, and nothing records whether they are exempt. Do not assume they are.
- Genshin Guides allows decorative borders that follow a character's element. They are slide frames inside the product the guide shows, not interface chrome. He approved that option.
- Density differs by product. Marwie is compact (34 to 40px rows) and Kanlungan is airy (128px sections). Pick by product type.
- Hard offset shadows, thick borders and color blocks were approved once, in the superseded neobrutalist portfolio theme from August 2026. The v3 rebuild replaced it. Treat it as retired.

## 3. Standards he named

- **WCAG 2.0 AA** is the accessibility bar. He stated it on 2026-11-08 (Pantas, with Apple's guidelines) and again on 2026-11-21 ("i also follow WCAG 2.0 AA").
- **Apple's Human Interface Guidelines** supply interaction and usability principles. They do not supply Apple's look. Two of his projects say so ("Use Apple's interface principles, not Apple's visual design"). No frosted glass, traffic lights or iOS controls.

The numbers that matter here, all from WCAG 2.0 AA success criterion 1.4.3:

- Text contrast is at least 4.5 to 1.
- Large text needs at least 3 to 1. Large means 18 point or larger regular weight (24 CSS px), or 14 point or larger bold (about 18.66 CSS px, weight 700 or more).
- Ratios are not rounded. 4.499 to 1 fails.

Also in 2.0 AA and relevant to pages like these: color is never the only cue (1.4.1), text resizes to 200 percent without loss (1.4.4), moving content longer than five seconds can be paused (2.2.2), nothing flashes more than three times a second (2.3.1), keyboard focus is visible (2.4.7), and controls expose name, role and state (4.1.2). The design check also enforces two numbers from later versions, as a stricter bar. These are the 24 px target floor (WCAG 2.2) and horizontal reflow (WCAG 2.1). See section 8.

## 4. Principles

The check column holds a rule id from `scripts/design-check/rules.mjs`, or "by eye" with the question to ask.

### Layout and hierarchy

| Id | Principle | Source | Rules out | Check |
|---|---|---|---|---|
| L1 | Order content by importance. The first thing read is the page's purpose. | [Apple HIG, Layout](https://developer.apple.com/design/human-interface-guidelines/layout) | A decorative header or legend that outranks the content | By eye: what do I read first, and is it the right thing? |
| L4 | One focal element at a time, and few big elements. | [NN/G, Visual hierarchy](https://www.nngroup.com/articles/visual-hierarchy-ux-definition/) | Every node the same size and weight, so the eye has no entry | By eye: squint at a screenshot. Is the first-glance target the intended one? |
| L5 | The layout adapts to width. No sideways page scroll. | [WCAG, Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) | A fixed-size stage that only fits one width | `overflow-x` |

### Typography

| Id | Principle | Source | Rules out | Check |
|---|---|---|---|---|
| T1 | A short type scale, each size with one job. | [NN/G, Visual hierarchy](https://www.nngroup.com/articles/visual-hierarchy-ux-definition/), [Apple HIG, Typography](https://developer.apple.com/design/human-interface-guidelines/typography) | One-off sizes per component, half-pixel sizes next to each other | `budget-font-sizes` |
| T2 | Text is large enough to read. | [Butterick, Point size](https://practicaltypography.com/point-size.html), Apple HIG, Typography | 10 to 11 px gray microcopy | `min-text-size` |
| T5 | Few typefaces. | Apple HIG, Typography | Display, body, accent and mono faces competing | `budget-font-families` |
| T6 | Avoid light weights. | Apple HIG, Typography | 300-weight gray labels | `light-weight` |
| T7 | Do not use uppercase or wide tracking as the hierarchy device. | [NN/G, Visual hierarchy](https://www.nngroup.com/articles/visual-hierarchy-ux-definition/) | Small uppercase labels above headings | `uppercase-label`, `eyebrow` |

### Color and contrast

| Id | Principle | Source | Rules out | Check |
|---|---|---|---|---|
| C1 | Text meets 4.5 to 1 (3 to 1 for large text) against its real background. | [WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) | Gray on gray secondary text | `contrast` |
| C3 | Never rely on color alone. | [Apple HIG, Color](https://developer.apple.com/design/human-interface-guidelines/color), WCAG 1.4.1 | States that differ only by hue or opacity | By eye: view a grayscale screenshot. Can every state pair still be told apart? |
| C4 | A small palette. Neutrals, one accent, status colors. | [NN/G, Visual hierarchy](https://www.nngroup.com/articles/visual-hierarchy-ux-definition/) | A different hue per node type | `accent-hues` |

### Borders, surfaces and depth

| Id | Principle | Source | Rules out | Check |
|---|---|---|---|---|
| S1 | A container means "these belong together". Use one only for a real group. | [Laws of UX, Common region](https://lawsofux.com/law-of-common-region/) | A bordered card around every sentence, boxes inside boxes | `card-in-card` |
| S2 | A small, closed set of borders and radii. Nothing is arbitrary. | [Rams, Good design](https://www.vitsoe.com/us/about/good-design) | Each component inventing its own width, style and radius. Thick, dashed and left-bar borders. Pills on controls. | `budget-border-widths`, `budget-border-styles`, `budget-radii`, `border-thick`, `border-dashed`, `accent-bar`, `pill-shape` |
| S3 | Depth signals layering, not decoration. Only floating things get shadow. | [Apple HIG, Materials](https://developer.apple.com/design/human-interface-guidelines/materials) | Glow, gradient washes, a shadow on every card | `glow`, `budget-shadows`, `gradient-surface` |

### Motion

| Id | Principle | Source | Rules out | Check |
|---|---|---|---|---|
| M1 | Motion has a purpose tied to a user action. | [Apple HIG, Motion](https://developer.apple.com/design/human-interface-guidelines/motion) | Ambient loops, pulsing dots and rings | `infinite-animation`. By eye: what does the viewer learn from this that a static state would not show? |
| M2 | Most animation runs 100 to 500 ms. | [NN/G, Animation duration](https://www.nngroup.com/articles/animation-duration/) | 600 to 1200 ms reveals | `duration-band` |
| M5 | A multi-part reveal finishes quickly. | [Carbon, Choreography](https://carbondesignsystem.com/elements/motion/choreography/) | Forty parts each delayed 100 ms | `entrance-length` |
| M6 | With reduced motion on, travel and scale go away. State changes still work. | [WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), Apple HIG, Accessibility | Motion as the only carrier of information | By eye: emulate reduced motion. Is every step still reachable and readable? |
| M8 | Never make people wait for motion. | Apple HIG, Motion | Controls disabled until an animation ends | By eye: click Next in the middle of an animation. Does it respond at once? |
| M9 | Frequent interactions get small, short motion. | Apple HIG, Motion | Lift-and-scale hover on every part | `hover-scale` |

### Interaction and progressive disclosure

| Id | Principle | Source | Rules out | Check |
|---|---|---|---|---|
| I1 | Show the core up front. Defer the rest on request. Apply this everywhere. | [NN/G, Progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/) | All explanations, commands and legends visible at once | By eye: which facts does a first-time visitor need, and are exactly those visible? |
| I2 | One disclosure rule for every item of the same kind, at most two levels. | NN/G, Progressive disclosure | Some nodes open a panel while their neighbors show detail inline | `disclosure-inconsistent` (partial). By eye for the rest, see section 7. |
| I3 | Put what most people need up front and the rare options behind a step. | NN/G, Progressive disclosure | Hiding the main payoff, or showing every rare option | By eye: list the top three visitor tasks. Is each one action away? Is anything visible that none of them needs? |
| I4 | Triggers are labeled and announce their state. | NN/G, Progressive disclosure, [WCAG 4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) | Icon-only triggers with no name | By eye: does each trigger have a name and `aria-expanded` that matches what you see? |
| I7 | The user can always back out. | [NN/G, Ten heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/) | A panel with no close, focus lost after closing | By eye: does Escape close the panel and return focus to its trigger? |
| I10 | Targets are big enough. | [WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), Apple HIG, Accessibility | 16 px icon buttons packed together | `target-size`, `target-size-touch` |

### Diagrams and information design

| Id | Principle | Source | Rules out | Check |
|---|---|---|---|---|
| D1 | Every drawn element carries information. | [InfoVis:Wiki, Data-ink ratio](https://infovis-wiki.net/wiki/Data-Ink_Ratio) | Glows, textures and ornaments inside the diagram | `glow`, `gradient-surface`. By eye: delete one element at a time. Does the diagram lose meaning? |
| D4b | Every drawn connection matches the facts, and every fact is drawn. | Rams, Good design (honest, thorough) | Hand-drawn connections that drift from the source (the earlier wrong-map failure) | By eye, until a build step draws from the data file: list each connection as a sentence of who calls whom, then compare it with the picture. |

### Accessibility

| Id | Principle | Source | Rules out | Check |
|---|---|---|---|---|
| A1 | Keyboard focus is visible and the order follows reading order. | [WCAG 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) | `outline: none` with no replacement | By eye: tab through the page. Can I always see where I am? |

### Tokens and system consistency

| Id | Principle | Source | Rules out | Check |
|---|---|---|---|---|
| K1 | Raw values live in the token file. Components use the tokens. | [Primer, Token names](https://primer.style/product/primitives/token-names/) | Hex colors and magic pixel values in component CSS | `token-colors`, `token-radii`, `token-font-sizes`, `token-spacing` (run with `--tokens`) |

## 5. Copy rules

From his words, as recorded in the project rules. Copy follows `AGENTS.md` for voice. These rules cover what the copy may contain.

- No eyebrow labels and no eyebrow pills above headings ("i dont like eyebrows", 2026-11-17). The `eyebrow` rule checks it.
- No numbering on sections, parts or headings unless the content is a real ordered list ("i also hate numbering in sections that are not even listing something", 2026-11-21). The `heading-numbering` rule checks it.
- No redundancy. Each fact appears once, including a second identical button or link.
- No hint text or helper captions such as "Scroll", "Drag" or "Hover to see".
- Nothing a visitor does not need ("no redundancies, no unnecessary text or info", 2026-11-17).

No script can tell a needed sentence from filler. Count the words a visitor reads, as required step 1 in `docs/process-improvement.md` says.

## 6. Things that read as generic AI output

This section is opinion. It comes from practitioner essays and a vendor post, not from standards. The tells agree with each other. The fixes do not always. Use the script as a smoke detector.

| Tell | Script rule |
|---|---|
| Default or overused fonts (Inter, Roboto, Geist with Instrument Serif) | None. By eye, and his rule 6. |
| Purple or indigo gradients, gradient washes behind a page | `gradient-surface`, `accent-hues` |
| Colored glow and soft shadow on everything | `glow`, `budget-shadows` |
| A hue for every kind of node | `accent-hues` |
| Pill buttons and pill labels | `pill-shape` |
| Eyebrow labels, uppercase tracked labels | `eyebrow`, `uppercase-label` |
| Numbered sections and digit badges | `heading-numbering` |
| A colored bar on one edge of a rounded block | `accent-bar` |
| Thick or dashed borders as decoration | `border-thick`, `border-dashed` |
| Many near-identical radii and sizes | `budget-radii`, `budget-font-sizes` |
| Monospace for ordinary descriptions | `mono-outside-code` |
| Slow staggered entrances, pulsing rings, looping glows | `entrance-length`, `duration-band`, `infinite-animation` |
| Lift and scale on hover | `hover-scale` |
| A box around every item, boxes in boxes | `card-in-card` |
| Everything visible at once, or inconsistent hiding | `disclosure-inconsistent` (partial), otherwise by eye |
| Three equal icon cards in a row | None. By eye. |
| Same radius, padding and size on every item, so nothing leads | None. By eye. |
| Missing states (copy failure, first step, last step) | None. By eye. |
| Headlines that could belong to any product | None. By eye: could another product's name go here? |

Ask two questions by eye. Does this look like it came from somewhere? Would anyone notice if this element disappeared?

## 7. How to use the check

```
node scripts/design-check/cli.mjs <file-or-url> [--tokens <css file>] [--json] [--allow-network]
```

Set `DESIGN_CHECK_CHROMIUM` to a Chromium binary. Without it, Playwright's own default browser is used. The script opens the page at 1440 by 900 and 390 by 844, waits for entrance animations (up to six seconds), and prints findings grouped by rule. It exits 1 if any rule reports an error, 0 if only warnings or nothing, and 2 if it could not open the page. Local files are loaded with outside network requests blocked, so web fonts fall back. Pass `--allow-network` to load them. The browser run is not part of CI.

A failure means a measurable symptom of a banned pattern is present. Fix the cause. Do not tune a threshold to get a pass. A warning is a suggestion. Run the check on every sample before he sees it, as required step 8 in `docs/process-improvement.md` says.

Limits:

- It measures the page at rest. A panel that opens on click is not seen. To check it, open the page in that state through a URL.
- It cannot judge hierarchy, tone, imagery, copy or whether a design impresses. His eye decides.
- `disclosure-inconsistent` finds same-class elements where some hide text until interaction and others show longer text at rest, or where only some are interactive. It cannot see detail revealed by script on click. Whether the split between initial and secondary content is right is left to the eye (I1, I3).
- Reduced motion, focus order, keyboard behavior, state names and diagram accuracy are not measured. They are by eye.
- Contrast skips text over photos and uses the worst gradient stop for gradients. A translucent layer over a busy canvas is approximated.
- On pages that scale a fixed stage to fit, rendered text and targets shrink. The script measures them as rendered.

## 8. Where sources disagree, and which numbers are suggestions

The sourced numbers are text contrast 4.5 to 1 and 3 to 1 (WCAG 1.4.3), the large text sizes (same), the 24 px target floor (WCAG 2.5.8), the 100 to 500 ms animation range (NN/G), the 70 ms floor and 700 ms ceiling (Carbon's shortest and longest tokens), and the 44 px touch size (Apple's default control size, used here as a floor, which is my choice).

The suggested numbers, which no source gives:

| Rule | Threshold |
|---|---|
| `min-text-size` | 12 px as rendered |
| `budget-font-sizes` | warn above 8 sizes, error above 10 (10 is his Kanlungan scale), warn on 2 or more sizes within 0.5 px |
| `budget-font-families` | 2 text families plus 1 monospace |
| `budget-radii` | warn above 5, error above 8 or 2 or more values 1 px apart |
| `budget-border-widths` | warn above 3 widths, error above 4 |
| `budget-shadows` | warn above 3, error above 5 |
| `glow` | a chromatic shadow with chroma of 0.12 or more, or a neutral blur of 24 px or more on a resting element |
| `accent-hues` | hue clusters 30 degrees wide, a hue counts when 2 or more elements use it |
| `entrance-length` | warn above 600 ms, error above 1500 ms after load |
| `hover-scale` | scale above 1.02, or hover movement above 2 px |
| `uppercase-label` | tracking of 0.08 em or more |
| `eyebrow` | 5 words or fewer, 40 characters or fewer, within 32 px of the heading |
| `disclosure-inconsistent` | at least 3 siblings of one kind, a 20 character difference |

Disagreements:

- His own shipped systems exceed some budgets. The portfolio has nine radii and Kanlungan has ten type sizes. These budgets would warn on them. They are set loose on purpose. The near-duplicate tests (values 1 px or half a pixel apart) catch noise better than raw counts.
- NN/G says use at most three type sizes. Apple defines many. The budget sits between.
- WCAG 2.5.8 requires 24 px targets. Apple's iOS default is 44. The check errors at 24 and warns at 44 on the phone layout.
- WCAG 2.0 AA does not include 2.5.8, 2.3.3, 1.4.10 or 1.4.11. They come from WCAG 2.1 and 2.2. The check applies them as a stricter bar. Drop them if he asks for 2.0 only.
- NN/G says animation runs 100 to 500 ms. Carbon allows 700. Material allows up to 1000. The check warns from 500 and errors above 700. Long motion is allowed once, for one named signature animation (a `signature` class or `data-signature` attribute).
- Consistency against variety. Rams and NN/G want identical treatment of identical things. The slop essays warn against the same radius and padding everywhere. These fit when consistency applies within a role and hierarchy supplies variety between roles.
- Minimal does not mean bare. Keep the cues that carry reading, such as group boundaries.
- Material Design 3 pages could not be fetched, so none of its rules are cited here.
