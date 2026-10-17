# Aedwon — v3 design handoff

The approved design ("Aedwon — Final" in Claude Design), packaged so it can be rebuilt 1:1. Content can change; **layout, colours and especially motion must not drift.**

## Source of truth, in order
1. `reference/components/*.dc.html` — the working prototype. Every animation is real code here (rAF loops in each `class Component`). When in doubt, port the math from these files line by line.
2. `spec/*.md` — the same behaviour written out with exact numbers and file:line references, plus a "gotchas" list per area.
3. `recordings/*.mp4` — screen captures of each interaction, for visual comparison only (the code wins over the video).

## Read in this order
| File | Covers |
|---|---|
| `spec/room.md` | The page shell: camera between Wall and shelf, nav underline, points background, scroll-peek, project layer, theme switch |
| `spec/wall-index.md` | Wall, Index, the Fold transition, filter/sort/find (swap motion), preview, frozen header, writing posts (Index only, TOPIC column) |
| `spec/project-page.md` | Project/post page (left page fixed, right page scrolls, edge contents), Pantas system visuals |
| `spec/about-books.md` | About shelf, 3D volumes, opening, six-strip page turn, Vol. 06 = Contact form |
| `spec/phone.md` | Phone site (390×844): picker wall, stacked volumes, spread reading with camera, keyboard handling |
| `spec/moments.md` | First load and 404 |
| `spec/tokens.md` | Colour tokens dark + light (role-based, not inverted), type, radii, shadows |
| `spec/content.md` | Content model; which strings are [placeholders] |

## Reading the .dc.html files
Markup inside `<x-dc>` with `{{ value }}` holes; `<sc-for list as>` = map, `<sc-if value>` = conditional; `<dc-import name="X" some-prop>` = child component (kebab → camelCase props). The script's `renderVals()` returns the hole values; most motion is recomputed every frame from a clock or spring. Treat each file as a React component written in a template language. `reference/generators/` holds the Python scripts that produced some files (mobile.py, spread.py, light.py, data in projects.py) — easier to read than the generated output.

## Rules for the port
- Design frames: desktop 1440×900, phone 390×844. Scale, don't re-lay-out. The breakpoint between them is not designed — pick one and keep each layout intact.
- Reproduce springs/easings with the exact constants and integration given (dt capped at 0.05s where the code does).
- Never apply `opacity`, `filter` or `mask` on an element inside a `preserve-3d` chain (it flattens the 3D) — see gotchas.
- Reduced motion: every transition jumps to its end state.
- Light mode is a role-based palette (`spec/tokens.md`, `generators/light.py`), never a filter.
- Open decisions flagged in the specs as "[as-built]" or "decide": breakpoint, points under reduced motion, ← → including posts, light versions of the 404/first load/system visuals, iOS input zoom check.

## Not in scope here (later)
Contact delivery (form service + spam protection), real screenshots/copy, résumé link, SEO/OG images, performance pass (one shared rAF, pause when idle/hidden), Index tool filters and shareable filter URLs.
