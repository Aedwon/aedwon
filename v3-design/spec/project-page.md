# Project page (spread B) + SystemViz: implementation spec

Sources (all paths relative to `reference/`):

| Abbrev | File |
|---|---|
| **PS** | `components/ProjectSpread.dc.html` (dark; the canonical component) |
| **PSL** | `components/ProjectSpreadLight.dc.html` (light; produced by `generators/light.py`) |
| **SV** | `components/SystemViz.dc.html` (Pantas's five live visuals) |
| **SP** | `generators/spread.py` (generator for PS; the "S2 / SEC2 / RAIL" blocks are what shipped) |
| **PJ** | `generators/projects.py` (content data) |
| **RM** | `components/Room.dc.html` (the host that opens the page; included only where it drives this page) |

Every number below comes from the files above. "line" refs use `FILE:line`.

---

## 0. Component contract

| Prop (PS:183) | Type / default | Used for |
|---|---|---|
| `project` | text, default `"qr"` | Initial project id. `findIndex(p.id === props.project)`; not found → index 0 (PS:193-194). |
| `openReq` | text, default `""` | Open request from the host, format `"<index>#<counter>"` (RM:176). See §3.1. |
| `onBack` | fn | Called by the Back button (PS:252). |
| `bare` | bool, default `false` | `true` hides the built-in nav (`visibility: hidden`) and makes the page background transparent (PS:227). The Room always passes `bare` (RM:47) and draws its own nav. |
| `layout` | enum placard/spread/sheet, default `spread` | **Ignored for rendering**: `const lay = 'b'` is hardcoded (PS:218). It only gates Esc (§4). |

Wrappers `Spread_pantas / Spread_msl / Spread_qr.dc.html`: each is a 1440×900 div, `background:#0a0a0c; font-family:Geist; color:#EDEDED`, containing `<dc-import name="ProjectSpread" project="pantas|msl|qr">`. No props other than `project`, not bare, so the built-in nav shows. Nothing else is in them. They are preview boards for three depths: case (pantas), writeup (msl), note (qr).

---

## 1. Layout (1440 × 900 frame)

Root (PS:40): `position:relative; 1440×900; overflow:hidden; background: pageBg (#0a0a0c, or transparent when bare); color:#EDEDED; font-family:'Geist', system-ui, sans-serif; -webkit-font-smoothing:antialiased`.
Fonts (PS:11): Geist 400/500/600/700/800, Geist Mono 400/500.

### 1.1 Block map

| Block | Position / size | z | Ref |
|---|---|---|---|
| Nav bar | `abs; left 0; right 0; top 0; height 84; padding 0 56`; flex space-between, centred vertically; bg `rgba(10,10,12,0.78)`; `backdrop-filter: saturate(180%) blur(20px)` | 5 | PS:42 |
| Left page | `abs; left 56; top 108; bottom 36` → **x 56–448, y 108–864, 392 × 756**; flex column | auto | PS:47 |
| Right page (scroller) | `abs; left 520; right 0; top 0; bottom 0` → **x 520–1440, 920 × 900**; `overflow-y:auto`; scrollbar hidden (`.ps{scrollbar-width:none}` + `::-webkit-scrollbar{width:0}`, PS:14) | auto | PS:75 |
| Right page content | `padding: 108px 56px 120px 0` → content column **x 520–1384, 864 px wide** | | PS:76 |
| Contents rail | `abs; right 0; top 50%; translate 0 -50%; padding 24px 22px 24px 60px`. Only rendered when `sections.length > 1` | 6 | PS:171 |

There is a 72 px gutter between the left page (ends x 448) and the right page (x 520). The right page scrolls under the translucent nav because its content starts 108 px down.

### 1.2 Nav (built in; hidden when `bare`) PS:43-44

| Element | Style |
|---|---|
| "Aedwon" | 16px / 600 / letter-spacing -0.02em, #EDEDED |
| Links group | flex, gap 36, 14px, colour #8A8A93. Items: `Wall` (#EDEDED, current), `Index`, a divider (1 × 16, #2a2a30), `About`, `Contact`. They are plain spans with no handlers. |

### 1.3 Left page (flex column, top to bottom) PS:48-72

| # | Element | Spacing | Typography / style |
|---|---|---|---|
| 1 | Back button `.tb` (`← Back to the wall`, or `← Back to the index` for posts) | `align-self:flex-start; height 32; margin-bottom 22` | 14px, colour #A1A1AA, hover #EDEDED (.2s ease). `.tb` = no border/bg/padding, inherit font, pointer (PS:21) |
| 2 | `h1` project name | margin 0 | **46px / 600 / -0.045em / line-height 1.02** |
| 3 | `p` description | `margin-top 16` | 16.5px / line-height 1.6 / #A1A1AA |
| 4 | Stack row (`aria-label="Built with …"`) | `margin-top 22; min-height 24`; flex, wrap, centred, **gap 18** | Logos (§1.4), then `stackText` span in Geist Mono 12.5px #8A8A93 |
| 5 | Details list | `margin-top 30; padding-top 22; border-top 1px #1c1c22`; column, **gap 12** | Row: flex, centred, **gap 14**; 14.5px / line-height 1.35 / #D4D4D8. Icon slot 18 × 18, colour #8A8A93. Then `<span class="sr">Label: </span>` (visually hidden) + value |
| 6 | Links row | `margin-top 26; min-height 22`; flex, centred, gap 18 | Up to 2 links (`slice(0,2)`, PS:234). `a.ul`: 15px #EDEDED, text `label + " ↗"`, underline offset 4px, underline colour #4a4a52 → #EDEDED on hover (.2s) |
| 7 | Prev / next row | `margin-top:auto` (sits on the bottom edge at y 864); flex space-between; gap 16; 14px | Two `.tb` buttons: `← {prev.name}` (text-align left) and `{next.name} →` (text-align right) |

Detail icon slot (PS:60): `span.tip` `display:flex; flex:none; 18×18; color #8A8A93`. It holds either
- an `svg` 18×18, viewBox 0 0 24 24, `fill:none; stroke:currentColor; stroke-width:1.6; round caps and joins`, with one path; or
- a status dot: `margin 5; 8×8; border-radius 99; background: dot; box-shadow: 0 0 0 3px ring`. The 5px margin centres it in the 18px slot.

### 1.4 Stack logos PS:53, PS:231

- Each logo is `span.tip[data-tip=title] > svg.lg[role=img][aria-label=title]`, with `--b: brandColour`.
- Size: `w2 = w × 22/18`, `h2 = h × 22/18`, rounded to 1 decimal. Default w = h = 18 → **22.0 × 22.0**. MySQL is the exception: w 46, h 13, viewBox `-0.2 12.6 22.4 6.2` → **56.2 × 15.9** (SP:13).
- Path fill is #8A8A93 at rest and `var(--b)` on hover of **that logo** (`.lg:hover path`), `transition: fill .3s ease` (PS:17-18). The `.stackrow:hover` selector exists, but no element carries `.stackrow` in spread B, so logos never light up as a group.
- Brand colours come from `this.LOGO` (PS:190). Any brand colour with relative luminance < 0.06 is replaced by #EDEDED (SP:6-12): SQLite, Markdown, pandas, NumPy, Next.js, GitHub.
- Only stack names that have a LOGO entry render as logos. Every other name goes into `stackText`, joined with `" · "` (PS:232). `p.stackText` overrides this if set. Pantas → logos Flutter, Dart, Firebase; stackText `"Drift · RevenueCat"`.
- Logo tooltip titles differ from the stack keys in places: `Tailwind` → "Tailwind CSS", `wasm-vips` → "WebAssembly", `Sheets` → "Google Sheets".

### 1.5 Tooltip (`.tip::after`) PS:28-30

`content: attr(data-tip)`; `position:absolute; left:50%; bottom: calc(100% + 10px)`; resting `translate: -50% 4px; opacity 0`; hover `translate: -50% 0; opacity 1`. `padding 5px 9px; border-radius 6; background #EDEDED; color #0a0a0c; font: 500 12px Geist; letter-spacing 0; white-space nowrap; pointer-events none; z-index 9`. Transition `opacity .15s ease, translate .25s cubic-bezier(.22,1,.36,1)`.

### 1.6 Right page flow (inside the 864-wide column)

| # | Block | Condition | Spacing / size | Ref |
|---|---|---|---|---|
| 1 | Hero stage | always | `height 520; radius 12; bg #131317; overflow hidden; position relative`. Inner wrapper `abs; left 50%; top 50%; width 520; translate -50% -50%; scale: s` | PS:78-79 |
| 2 | Two detail tiles | `depth === 'note'` | grid `1fr 1fr`, gap 16, `padding-top 16`; each `height 300; radius 12; bg #131317`, centred mono 12px #6b6f7c, text `[a detail]` / `[another detail]` | PS:125-130 |
| 3 | Case points | wrapper always present with `padding-top 48`; grid only when `depth === 'case'` | grid `repeat(3, minmax(0,1fr))`, gap 32. Each item: column, gap 10, `padding-top 16`, `border-top 1px #2a2a30`. Heading 17px/600; body 15px / 1.6 / #A1A1AA | PS:131-135 |
| 4 | Sections | for each `sections[i]` | `section#{uid}s{i}`: column, gap 16, `padding-top 56` | PS:137 |

Hero scale (PS:221-223): `s = min((864 − 140)/520, (520 − 80)/HH[media], 1.6).toFixed(4)`, where `HH = {phone 370, tv 330, web 325, discord 325, term 300, data 300, repo 260, paper 300}`.

| media | s | rendered size of the 520-wide mock |
|---|---|---|
| phone | 1.1892 | 618.4 × 440.0 |
| tv | 1.3333 | 693.3 × 440.0 |
| web / discord | 1.3538 | 704.0 × 440.0 |
| term / data / paper | 1.3923 | 724.0 × 417.7 |
| repo | 1.3923 | 724.0 × 362.0 |

The mock is scaled with the CSS `scale` property, transform-origin centre. Text inside scales with it.

Section content (PS:138-164):

| Part | Style |
|---|---|
| `h2` | 26px / 600 / -0.02em / #EDEDED, margin 0 |
| Paragraph group | column, gap 16, **max-width 680**, 17px / line-height 1.75 / #A1A1AA; each `p` margin 0 |
| Figure (`s.fig` set) | `figure` margin `10px 0 0` (plus the section's 16 gap), column gap 10. Box: `height 380; radius 12; bg #131317`, centred mono 12px #6b6f7c, `padding 0 24`, text = `s.fig`. Caption: 13.5px #8A8A93, literal `[Caption: what this shows.]` |
| Systems (`kind:'systems'`) | list `margin-top 8`, column. Each item: column, gap 14, `padding 40px 0`, `border-top 1px #1c1c22`. `h3` 21px / 600 / -0.02em / #EDEDED. Body column gap 12, max-width 680, 15.5px / 1.7 / #A1A1AA. Viz holder: `height: it.vh` (370px, or 410px for insights), `margin-top 8`, containing `SystemViz which=it.which` at full column width (**864px**) |
| Status (`kind:'status'`) | grid 3 × `minmax(0,1fr)`, gap `24px 32px`, 15px / 1.7, `margin-top 8`. Column: `padding-top 12; border-top 1px #2a2a30`; heading 14px #8A8A93 `padding-bottom 6`; items as block spans in #D4D4D8. Then `a.ul` link: `align-self flex-start; margin-top 8; 16px; #EDEDED` |

### 1.7 Hero mocks (inner 520-wide, before scaling)

| media | Spec | Ref |
|---|---|---|
| **phone** | Row 520 × 370, centred, gap 18. Three phones, each 156 × 330, `padding 5; box-sizing border-box; radius 28; bg #050506; border 1px #2e2e35`; translateY **+12 / −12 / +12** (the middle one is raised). Screen: radius 23, bg #131317, centred mono 12px #8A8A93 `[screen N]`. Notch: `abs; top 7; 44 × 13; centred (left 50%, margin-left −22); radius 99; #000` | PS:82 |
| **tv** | Column 520 × 330, centred. Panel 520 × 301, `padding 10; radius 10; bg #050506; border 1px #2e2e35`; screen radius 2, bg #131317, text `[{name} screen]`. Neck 26 × 12 #141418. Base 150 × 8, `radius 4px 4px 2px 2px`, #1c1c21 | PS:86 |
| **web** | 520 × 325, `radius 12; overflow hidden; border 1px #26262c; bg #0f0f12`; column. Bar: height 20, `padding 0 10`, gap 5, `border-bottom 1px #1c1c22`, three dots 6 × 6 #2c2c32. Body flex 1, bg #131317, mono 12px #8A8A93, `padding 0 16`, `[{name} screenshot]` | PS:90 |
| **discord** | 520 × 325, `radius 10; border 1px #26262c`; row. Server rail 48 wide, #0d0d10, column gap 8, `padding-top 12`: one 30 × 30 icon at radius 10 #2c2c34, then two 30 × 30 circles #1e1e24. Channels 124 wide, #121215, column gap 10, `padding 16px 12px`, bars: h 7 w 70% #2c2c34 (radius 4); h 6 w 80% #1f1f25; h 6 w 60% #2c2c34; h 6 w 75% #1f1f25; h 6 w 55% #1f1f25 (radius 3). Chat: flex 1, #17171b, `[{name} in Discord]` | PS:94 |
| **term** | 520 × 300, `radius 10; border 1px #26262c; bg #08080a`. Bar height 24, `border-bottom 1px #18181c`, three 6px dots #2c2c32. Body `padding 18px 20px`, mono 13px / 1.8 / #8A8A93: `$ [command]` / `[real output from the repo]` / `$ ▮` (`$` in #4ade80; cursor inline-block 8 × 15, `vertical-align -2px`, #8A8A93, **static, no blink**) | PS:98 |
| **repo** | 520 × 260, `radius 10; border 1px #26262c; bg #0f0f12; padding 26px 28px`; column gap 14. Title row: mono 14px #EDEDED, gap 10, 16px book icon (stroke #8A8A93, width 1.8), `v.repo`. Desc 15px / 1.6 / #A1A1AA. Footer `margin-top auto; padding-top 14; border-top 1px #1c1c22`, mono 12px #8A8A93 `[your PR or contribution]` | PS:102-106 |
| **data** | 520 × 300, `radius 10; border 1px #26262c; bg #131317`, `[{name} results]` | PS:110 |
| **paper** (posts) | 520 × 300, `padding 34px 36px 30px; radius 3; bg #ECEBE6; color #111113`; column gap 12. Date mono 12px #61616A. Title 25px / 700 / -0.03em / 1.12. Desc 14.5px / 1.55 / #3f3f46. `Read · {mins}` 13px #61616A with `margin-top:auto` | PS:114-119 |

### 1.8 Contents rail PS:171-177, PS:32-37

| Part | Spec |
|---|---|
| Hit area (`nav.rail`) | `right 0`, vertically centred on the **frame** (y 450, independent of scroll). Padding 24 / 22 / 24 / 60. Width = 60 + widest tick + 22 = **108 px** when a tick is active (26 px). Height = 48 + N·1.5 + (N−1)·12. Pantas has N = 7 → 130.5 px. |
| Ticks | column, `align-items:flex-end`, **gap 12**. Each tick: `height 1.5px; border-radius 1`. Inactive: **width 14px, #3a3a42**. Active: **width 26px, #EDEDED**. Transition `width .45s cubic-bezier(.34,1.56,.64,1), background-color .3s ease`. The right edge of the ticks sits at x 1418 (22 px from the frame edge). |
| Panel (`.railpanel`) | `abs; right 14; top 50%; translate 0 -50%; min-width 230; padding 10px 6px; radius 12; bg rgba(17,17,20,.92); border 1px #222228; backdrop-filter blur(20px); box-shadow 0 24px 60px rgba(0,0,0,.5)` |
| Panel rows (`button.rl`) | `display block; width 100%; padding 9px 14px; radius 8; 14px; text-align left; nowrap; colour var(--c)`: #EDEDED for the current section, #8A8A93 otherwise. Hover: bg #1a1a1f, colour #EDEDED; transition `background-color .15s ease, color .15s ease`. `aria-current="true"/"false"` |

---

## 2. Data model (PJ, compiled into `this.P` at PS:189)

`this.P` holds **20 entries** in this order: the 17 projects in wall order (pantas, msl, lakambini, agent, kiosk, pso, qr, webp, norala, cup, ilocos, oppo, kqm, aspire, opensre, dockroute, bettergov), then the 3 posts w1, w2, w3. **Prev/next and `openReq` indices refer to this 20-entry ring.**

### 2.1 Fields

| Field | Type | Used by |
|---|---|---|
| `id` | string | `project` prop lookup |
| `name` | string | h1, prev/next labels, mock labels |
| `type` | string | Selects the Platform-row icon (`TI[type]`) and is the Platform fallback |
| `media` | phone, tv, web, discord, term, data, repo, paper | Hero mock and its scale |
| `depth` | `case`, `writeup` or `note` | §2.2 |
| `desc` | string | Left-page description; repo and paper mocks |
| `stack` | string[] | Logos and stackText; aria-label |
| `stackText` | string, optional | Replaces the derived stack text |
| `links` | {label, href}[] | First 2 render as `label ↗` |
| `facts` | {k, v}[] | Details (§2.4) |
| `points` | {h, p}[] | Case points (case only) |
| `sections` | {kind, h, p[], fig?, items?, cols?, link?}[] | Story and rail |
| `repo` | string | Repo mock title |
| `post`, `topic`, `mins`, `date` | posts only | Back text, paper mock, details |

### 2.2 Depth levels

| depth | Right page shows | Projects |
|---|---|---|
| `note` | Hero + 2 detail tiles + 48 px spacer, plus sections if there are any. Open-source notes have 1 section ("What I contributed"), so no rail. | lakambini, qr, webp, kqm (no sections); aspire, opensre, dockroute, bettergov (1 section) |
| `writeup` | Hero + spacer + 3 sections: "The brief", "What I built" (paragraph 1 = `desc`, fig `[{name}, in use]`), "How it went" (PJ:82-85). Rail shows. | msl, agent, kiosk, pso, norala, cup, ilocos, oppo; the posts |
| `case` | Hero + 3 case points + 7 sections (text, text, text+fig, **systems**, text, **status**). Rail shows. | pantas |

### 2.3 Section kinds (`kind` defaults to `'text'`, PJ:114-116)

| kind | Extra fields | Render |
|---|---|---|
| `text` | `fig?` | h2 + paragraphs (+ figure) |
| `systems` | `items: [{h, which, vh, p[]}]` | h2 + paragraphs + list of SystemViz items. Pantas `which` in order: roadmap, study, content, insights, pro; `vh` = 370px for all except insights at 410px (PJ:100-104) |
| `status` | `cols: [{h, items[]}]`, `link {label, href}` | h2 + paragraphs + 3-column grid + link. Pantas link: `[Join the waitlist]` |

### 2.4 Details list (PS:237-245)

1. If the entry is **not** a post, the first row is **Platform**: value = the `Platform` fact's `v`, or else `p.type`. Icon = `ICON[TI[p.type]]`, the type icon, not a fact icon.
2. Then every fact in order, skipping `Platform`:
   - `Status` → a dot instead of an icon (§2.5).
   - Anything else → `FICON[FI[k] || 'target']`.

| Fact key `k` | FI icon | | Type (`TI`) | ICON |
|---|---|---|---|---|
| Published | calendar | | Mobile app | phone |
| Reading time | clock | | Android TV | tv |
| Topic | tag | | Discord bot | bot |
| Role | person | | Website redesign | redesign |
| Year | calendar | | Web tool | web |
| Timeline | calendar | | Civic tech | civic |
| Client | building | | Developer tooling | term |
| Scale | people | | Data system | data |
| Ran for | clock | | Open source | repo |
| Hosting | server | | Writing | pen (never shown: posts skip the Platform row) |
| Event | flag | | | |
| Contribution | commit | | | |
| For | target | | | |
| Runs | browser | | | |
| *(unknown)* | target | | | |

The path data is in PS:191 (FICON) and PS:192 (ICON). Copy it verbatim.

### 2.5 Status → dot rule (PS:241)

`s = v.toLowerCase()`; `live = /live|shipped|running/.test(s)`; `wip = /pre-launch|prototype|beta|progress/.test(s)`. live is tested first.

| Result | Dot (dark) | Ring (box-shadow 3px) | Dot (light, PSL:241) | Ring (light, unchanged) |
|---|---|---|---|---|
| live | #4ADE80 | rgba(74,222,128,.18) | #16A34A | rgba(74,222,128,.18) |
| wip | #F0B45A | rgba(240,180,90,.16) | #B7791F | rgba(240,180,90,.16) |
| other | #61616A | rgba(97,97,106,.2) | #8E8E95 | rgba(97,97,106,.2) |

Current data: Pantas "Pre-launch" → wip (amber). Norala "Prototype, unofficial" → wip. msl, agent, cup "[Status]" → grey.

### 2.6 Posts (w1–w3)

`post:true; type 'Writing'; media 'paper'; depth 'writeup'`. Facts: Published, Reading time (`mins + ' read'`), Topic. The compiled data in PS:189 has `stackText = topic` (for example "Pantas · offline-first"); **PJ:127 sets `stackText=''`**, so PS was built from a later data revision. **Follow PS.** Differences from projects:

| Item | Post behaviour |
|---|---|
| Back text | `← Back to the index` |
| Platform row | omitted |
| Detail icons | calendar, clock, tag |
| Logos | none; the mono text is the topic |
| Links | none (the row stays as a 22 px-high empty strip) |
| Hero | paper sheet |

---

## 3. Animation

### 3.0 Shared easing

| Name | Formula | Ref |
|---|---|---|
| `out` (PS) / `easeOut` (SV) | `1 − (1 − clamp01(x))³` (easeOutCubic) | PS:213, SV:272 |
| `easeInOut` (SV) | `x < .5 ? 4x³ : 1 − (−2x + 2)³ / 2` (easeInOutCubic, clamped) | SV:271 |
| smoothstep (RM) | `po² (3 − 2po)` | RM:128 |

PS re-renders every animation frame forever (`requestAnimationFrame` loop that calls `setState({tick+1})`, PS:203). All the JS-driven values below are recomputed each frame from `performance.now()`. In production, use a time-based tween with the same formula; a CSS transition with a cubic-bezier is not an exact match for easeOutCubic. If you must use CSS, the closest standard curve is `cubic-bezier(.33,1,.68,1)`.

### 3.1 Opening the page (`openReq`) PS:214-215, RM:97, 128, 174-177

Host side (Room):
- `openProject(i)`: `pn += 1`, then `projReq = i + '#' + pn`, then `pOpen = true` (RM:176).
- Per frame: `po += ±dt / (pOpen ? 0.55 : 0.42)`, clamped to 0–1, with dt in seconds capped at 0.05. Reduced motion jumps straight to 0 or 1.
- Eased value `po_e = smoothstep(po)`. The project layer gets `opacity = po_e` and `translateY = (1 − po_e) · 26px`. `visibility` is hidden when `po ≤ 0.001`. `pointer-events` is `auto` only while `pOpen`.
- The wall behind gets `scale(1 − 0.035·po_e)` and `opacity × (1 − po_e)`.
- Back (`onBack`) and Esc set `pOpen = false`, which plays the 0.42 s reverse.

Page side (PS:215), run inside render:
```
if (orq && orq !== this.lastReq) { this.lastReq = orq; const j = parseInt(orq.split('#')[0], 10);
  if (!isNaN(j) && j !== this.state.pi) { this.cur = 0; this.state.pi = j; this.state.swapAt = performance.now(); this.state.dir = 1; …scrollTop = 0; } }
```
- A new request string switches to project `j`, resets the active section to 0, scrolls the right page to 0 instantly, and starts the swap fade (§3.2), which runs in parallel with the host's 0.55 s rise.
- **If `j` equals the current project, nothing happens**: no fade, no scroll reset, and the active section is kept. Reopening the same project returns to where the reader left off.

### 3.2 Switching project (← →, prev/next buttons) PS:207-211, 219, 249

`go(d)`: `cur = 0`, `pi = (pi + d + n) % n` with n = 20, `swapAt = now`, `dir = d`, and the right page's `scrollTop = 0` **instantly**.

`f = out((now − swapAt) / 420)`, i.e. **420 ms easeOutCubic**. Reduced motion: `f = 1`.

| Target | Property | Value |
|---|---|---|
| Left page (whole column) | opacity | `f` (3 decimals) |
| Right page content wrapper | opacity | `f` |
| Right page content wrapper | `translate` Y | `(1 − f) · 14px` (rises 14 px into place) |
| (sheet layout only, unused) | `cf.x` | `(1 − f) · 28 · dir px` |

It is **not a true crossfade**. The old content is replaced at once, and the new content starts at opacity 0 and fades up. There is no fade-out. On mount `swapAt = −1e9`, so `f = 1` and there is no intro fade. The rail and nav are not faded.

### 3.3 Scroll-linked active section PS:246, 235

On every scroll event of the right page:
```
c = 0; for each section i: if (el.offsetTop − 260 <= scrollTop) c = i;
if (scrollTop + clientHeight >= scrollHeight − 4) c = last;
this.cur = c;
```
- `offsetTop` is measured relative to the scroller. The scroller is `position:absolute`, so it is the offsetParent. The 108 px padding is included.
- A section becomes current once its top is within 260 px below the scroller's top edge.
- Within 4 px of the bottom, the last section is forced current.
- `cur` is plain instance state, not React state. The next rAF frame repaints the ticks and rows. The tick width change then animates through its CSS transition (`.45s cubic-bezier(.34,1.56,.64,1)`, which overshoots) and the colour through `.3s ease`.

Nothing else is scroll-linked: no parallax, and no fading of the nav.

### 3.4 Jumping from the rail PS:225

Click a row → `scroller.scrollTo({ top: section.offsetTop − 100, behavior: reduced ? 'auto' : 'smooth' })`. The section lands with its 56 px padding-top starting 100 px below the scroller top, so the h2 sits about 156 px from the frame top, clear of the 84 px nav. The browser's native smooth scroll sets the duration. `cur` then updates through the scroll handler.

### 3.5 Rail open / close (CSS only) PS:32-35

| State | Ticks | Panel |
|---|---|---|
| Rest | opacity 1 | `opacity 0; pointer-events none; translate 12px -50%` |
| `.rail:hover` or `.rail:focus-within` | opacity 0 (`.2s ease`) | `opacity 1; pointer-events auto; translate 0 -50%` |
| Transitions | `opacity .2s ease` | `opacity .2s ease, translate .35s cubic-bezier(.22,1,.36,1)` |

The panel slides in 12 px from the right while the ticks fade out. The panel is a child of `nav.rail`, so hovering the panel keeps it open even outside the 108 px strip. Keyboard focus on any row also opens it.

### 3.6 Hover micro-interactions

| Element | Rest → hover | Timing | Ref |
|---|---|---|---|
| `.tb` (back, prev, next) | colour #A1A1AA → #EDEDED | .2s ease | PS:21-22 |
| `.ul` links | underline #4a4a52 → #EDEDED (offset 4px) | .2s ease | PS:15-16 |
| `.lg` logo | fill #8A8A93 → brand `--b` | .3s ease | PS:17-18 |
| `.tip` tooltip | opacity 0 → 1 (.15s ease); translate (−50%, 4px) → (−50%, 0) | .25s cubic-bezier(.22,1,.36,1) | PS:29-30 |
| `.rl` rail row | bg transparent → #1a1a1f; colour → #EDEDED | .15s ease | PS:36-37 |
| Focus ring | `a:focus-visible, button:focus-visible { outline: 2px solid #EDEDED; outline-offset: 3px }` | — | PS:26 |

Dead CSS that ships with no matching markup in B: `.toc`, `.cta`, `.nx .go`, `.stackrow`. Do not port it.

### 3.7 SystemViz loops (SV)

#### 3.7.1 Clock and common frame (SV:220-268)

- `elapsed` (ms) grows by `dt = min(now − last, 100)` every frame while not paused. The 100 ms cap means a background tab does not jump ahead.
- `n = phases.length`. Insights uses `n = 4`, but only for `cycleNo`, which is unused.
- `STEP`: study **3800**, insights 3400 (unused), pro **2800**, roadmap and content **2400** ms.
- `t = elapsed % (n·STEP)`; `a = floor(t / STEP)` is the phase index; `p = (t % STEP) / STEP` is progress within the phase (0–1).
- Reduced motion: `paused = true` and the rAF loop **never starts**. The still frame is `a = n − 1` (pro uses `a = 3`, "Up to date") with `p = 1`; insights uses `ti = total − 1`.

| which | Phases (`stepName`) | n | Cycle |
|---|---|---|---|
| roadmap | Read the inputs · Plan the stretch · Order topics · Size each day · Add reviews · Place the mock · Split into sittings · Freeze today | 8 | 19 200 ms |
| study | Try 1–4. Name is overridden: `Right, fast → Good` / `Right, slow → Hard` / `Wrong → Again` / `Right, fast → Good` | 4 | 15 200 ms |
| content | Written · Checked and blind-solved · Sent back, fixed · Approved · Figure added · Shipped in the app | 6 | 14 400 ms |
| insights | Fixed name `Example student · CSE mocks, 170 items each`; stepNum blank | own | 15 100 ms |
| pro | Signed in · Pro on this phone · Server confirms Pro · Up to date · A new answer · Pro ends | 6 | 16 800 ms |

**How it moves.** Each phase sets discrete target values (heights, colours, positions). The motion between them comes from **per-element CSS transitions**, listed below with exact curves. A few values are tweened per frame in JS: study's seconds counter, pro's dots, packets, pulse and tile counts, and insights' partial counts. These are marked **[JS]**. At the cycle wrap every target snaps back to phase 0 and the CSS transitions animate the reset.

Root (SV:16): `width 100%; bg #0c0c0e; colour #ededed; column; gap 16`. Viz area `position:relative; height vizH` (300px; 340px for insights).

Caption (SV:210-213): `border-top 1px #1f1f24; padding-top 12`; flex space-between, baseline.
- Left: stepNum (`"01 / 08"`, zero-padded, mono 11px #8a8a93), two NBSPs, then stepName in 13px #a1a1aa.
- Right: a `Pause`/`Play` button, `min-height 44`, 13px #a1a1aa, underlined at offset 4 with underline colour #4a4a52. It toggles `paused`.

Natural height = vizH + 16 + 57 = **373 px** (insights: **413 px**). The holders are 370 and 410 px, so the viz overflows them by 3 px (the holder does not clip).

#### 3.7.2 Roadmap (SV:21-54, 274-306)

Grid: 15 columns (`repeat(15, minmax(0,1fr))`), gap 5. Columns 1–14 are days i = 0–13; column 15 is "Exam". At 864 px wide each column is (864 − 70) / 15 = 52.93 px.

Days: `off = i % 7 === 6` → i = 6 and 13. Study days are all others. `ro` = the last 4 study days = **[9, 10, 11, 12]**. `learn = !off && !ro` → i ∈ {0–5, 7, 8}. Mock day = 11. Today = i 0.

| Row | Spec |
|---|---|
| Header row (h 22) | "weakest topics first →" in grid columns 1/10, 11px italic #a1a1aa, `align-self:end`. Bracket in columns **10 / 14**: `border 1px #8a8a93` on top, left and right; `height 6; margin-top 16`; label "review only" at `top −17`, centred, 11px italic #a1a1aa |
| Day columns (h 190) | `border 1px; radius 3; padding 3`; column, `justify-content:flex-end`, gap 3. Children top to bottom: mock, reviews, new, lessons |
| Exam column | `border-left 1px #ededed; padding-left 6`; "Exam" 11.5px/600, bottom-aligned |
| Day letters | mono 10px, centred; M T W T F S S × 2; today #ededed, others #8a8a93 |
| Legend | 11.5px #8a8a93, gap 6 × 18, `padding-top 4`. Swatches 9 × 9 radius 2: lessons #ededed; new questions #55555d; reviews outline 1px #a1a1aa |

Phase-gated targets (each comparison is `a >=` the phase index):

| From phase | Change | Transition |
|---|---|---|
| 1 Plan the stretch | Bracket `opacity 0→1`; `clip-path inset(-20px 50% 0 50%) → inset(-20px 0 0 0)` (draws outward from the centre) | `opacity .4s ease, clip-path .8s cubic-bezier(.65,0,.35,1)` |
| 2 Order topics | Label `opacity 0→1`, `translateX(-12px)→0` | `opacity .6s ease, transform .9s cubic-bezier(.22,1,.36,1)` |
| 3 Size each day | learn days: lessons **14px**, new **42px** (from 0) | height `.8s cubic-bezier(.22,1,.36,1)`, delay **i·45 ms** |
| 4 Add reviews | Every non-off day: reviews height `min(40, 12 + 3i)` px with `border 1px solid #a1a1aa` (otherwise `0 solid transparent`) | same, staggered |
| 5 Place the mock | Day 11: mock **32px**, #ededed, label "MOCK" 9px/600 #0c0c0e | same |
| 6 Split into sittings | Today's new block shows two 2px #0c0c0e dividers at top 33% and 66% (three sittings); a label above today, mono 10.5px #ededed, `translateY(-100%)`, `padding-bottom 4`: **"5 · 10 · 20"** | dividers: no transition |
| 7 Freeze today | Label → **"today · frozen"**; today's border → #ededed | `border-color .4s ease` |

Column borders: off days #18181b; others #26262c. Off days have `background: repeating-linear-gradient(135deg, #111114 0 4px, #0c0c0e 4px 8px)` and a centred "off" label in 10px italic #8a8a93. Mock bar: `border-radius 2; overflow hidden; centred text`. New block: #55555d, radius 2. Lessons: #ededed, radius 2.

#### 3.7.3 Study loop (SV:57-88, 308-375). STEP 3800 ms per try

Tries (SV:310-315):

| a | right | secs | rating | gap (days) | outcome text |
|---|---|---|---|---|---|
| 0 | ✓ | 12 | Good | 3 | Right, under 25 s. Back in 3 days. |
| 1 | ✓ | 38 | Hard | 4 | Right, but slow. Back a little sooner. |
| 2 | ✗ | 9 | Again | 1 | Wrong. Back tomorrow. |
| 3 | ✓ | 14 | Good | 5 | Right again. The gap grows. |

Within each try:

| p | ms | Event |
|---|---|---|
| 0 → 0.38 | 0 → 1444 | **[JS]** `secs = round(cur.secs · easeOut(p/0.38))` counts up. Timer fill width = `min(secs, 40)/40` (1 decimal, %). Fill and label colour: #ededed while secs ≤ 25, **#a1a1aa once > 25** |
| ≥ 0.38 | 1444 | `answered`: card border → green #4ade80 or red #f2555a (`.3s ease`). Chosen choice (index 1 if right, else 3): ring, dot and bar in the result colour, `scale(1.35)`, mark ✓ or ✗. If wrong, choice 1 also shows the correct answer: green ring and bar, ✓, dot transparent. Dot transition `background-color .25s ease, border-color .25s ease, transform .5s cubic-bezier(.34,1.56,.64,1)`; bar `background-color .3s ease` |
| ≥ 0.5 | 1900 | `rated`: the matching rating turns #ededed with a 1px #ededed underline (`color .3s, border-color .3s ease`). "Easy" is always #4a4a52; the others are #8a8a93 |
| ≥ 0.6 | 2280 | `placed`: outcome text `opacity 0→1`, `translateY 6px→0` (`opacity .45s ease, transform .6s cubic-bezier(.22,1,.36,1)`). The new interval arc and dot appear (below) |

Card (SV:58-68): `abs; left 0; top 0; width 44%; padding 14; border 1px; radius 8`; column gap 8. Default border #2a2a30.
- Timer row: flex gap 10. Track flex 1, `h 3; radius 2; #1f1f24`. 25 s marker at **left 62.5%** (= 25/40): `1 × 11` #6b6b73 at `top −4`, with label "25 s" at `top 9`, mono 9.5px #8a8a93. Seconds label `w 34`, right-aligned, mono 11.5px, text `{secs} s`.
- Placeholder lines: h 6, radius 3, #2a2a30, widths 90% (`margin-top 12`) and 60% (`margin-bottom 4`).
- Choices: flex gap 8. Dot 9 × 9 (radius 99, 1px ring). Bar h 5, radius 3, widths **70% / 55% / 80% / 45%**. Mark 11px in the ring colour. Unchosen ring #4a4a52, bar #2a2a30.

Ratings (SV:69-73): `abs; left 52%; top 0`; flex gap 14; mono 11.5px; `padding-bottom 3`.
Outcome (SV:74): `abs; left 52%; top 40`; 12.5px / 1.6 / #a1a1aa.

Timeline (SV:75-87):
- `days = [0, 3, 7, 8, 13]`; `x = d/15 · 100%` → **0, 20, 46.667, 53.333, 86.667 %**.
- Baseline: `top 240`, full width, 1px #3a3a42.
- Dots: 11 × 11 at `top 235`, `margin-left −5.5`, #ededed. On: opacity 1, scale 1, transition `opacity .2s ease .55s, transform .55s cubic-bezier(.34,1.56,.64,1) .55s`, so the dot lands as its arc finishes. Off: opacity 0, scale .2, `.3s ease`.
- Dot labels: `top 214`, `translate(-50%, ly)` with ly 0 when on and 6px when off; mono 10.5px #a1a1aa; text `now`, `+3d`, `+4d`, `+1d`, `+5d`. On transition: `opacity .4s ease .7s, transform .6s cubic-bezier(.22,1,.36,1) .7s`.
- Arcs, one per gap: `left x[i]; width w%; height h = min(80, 16 + 1.7w) px; top 240 − h`. Heights: **50, 61.33, 27.33, 72.67 px**. `border 1px #6b6b73`, no bottom border, `border-radius 50% 50% 0 0 / 100% 100% 0 0`. Reveal: `clip-path inset(0 100% 0 0) → inset(0 0 0 0)`, i.e. drawn left to right, over `.7s cubic-bezier(.65,0,.35,1)`. Hide: `.35s ease-in`.
- Visibility: point k is shown if `k == 0`, or `k−1 < a`, or (`k−1 == a` and placed). Earlier points stay visible; all except "now" retract at the cycle wrap.
- Axis ticks at `top 254`, mono 10px #8a8a93: `today` at 0 (no shift), `+5 d` at 33.3% and `+10 d` at 66.7% (both `translateX(-50%)`), `+15 d` at 100% (`translateX(-100%)`).
- Footer at `top 278`, 11px italic #8a8a93: "example intervals" on the left, "per-student tuning: planned" on the right.

#### 3.7.4 Content (SV:91-105, 377-415). STEP 2400 ms

Board: 4 columns at left 0 / 25 / 50 / 75 %, each `width 25%; height 300; padding-left 12`; `border-left 1px #1a1a1e` except the first. Headers "Written", "Checked", "Approved", "In the app", 12px. The active column is #ededed (others #8a8a93, `.3s`). `activeCol` by phase = **[0, 1, 1, 2, 2, 3]**.

Other elements:
- App frame: `left 75%; top −2; w 25%; h 286; radius 8; border 1px`, #ededed at a = 5, else transparent (`.5s ease`).
- Figure lane: `left 50%; top 236; width calc(25% − 12px); margin-left 6; h 30; border 1px dashed; radius 6`. Border #8a8a93 at a ∈ {3, 4}, else #26262c.
- Lane label "needs a figure": `top 272; margin-left 12`; 11px italic; #ededed at a ∈ {3, 4}, else #8a8a93.

Eight cards, i = 0–7. Sent back: `back = [2, 6]`; needs a figure: `fig = 4`. Column by phase:

| a | Column |
|---|---|
| 0 | all in col 0 |
| 1 | i ∈ {2, 6} stay in 0, others move to 1 |
| 2 | all in 1 |
| 3 | i = 4 goes to the lane, others to 2 |
| 4 | i = 4 stays in the lane while p < 0.4 (960 ms), then goes to 2 |
| 5 | all in col 3 |

Card geometry:
- `left = col·25%`, or 50% in the lane. `top = 30 + slot·25` px, where slot = the number of earlier cards (lower i) in the same column. Lane top 240.
- `width calc(25% − 24px); margin-left 12; height 22; radius 4; padding 0 8`; gap 6. Two inner lines, h 3, radius 2, widths 40% and 22%.

Card colours:

| State | Border | Background | Lines |
|---|---|---|---|
| red: back card and (a = 1, or a = 2 with p < 0.3 → first 720 ms) | #f2555a solid | transparent | #f2555a |
| lane | #8a8a93 **dashed** | transparent | #4a4a52 |
| approved (col ≥ 2) | #ededed | #ededed | #8a8a93 |
| default | #3a3a42 | #16161a | #4a4a52 |

Phase 0 entrance: card i is visible when `p > (i/8)·0.6`, i.e. at **i × 180 ms**. Hidden cards are opacity 0, scale 0.6; visible ones opacity 1, scale 1. From phase 1 on, all are visible.

Card transitions: `left .75s cubic-bezier(.34,1.25,.64,1) {i·50ms}, top .75s (same curve and delay), background-color .35s ease {delay}, border-color .35s ease {delay}, opacity .35s ease, transform .5s cubic-bezier(.34,1.56,.64,1)`.

#### 3.7.5 Insights (SV:108-165, 417-489). Own timeline, 15 100 ms

Constants: `MOCKS = [[70,60],[69,61],[70,60],[69,60],[70,61],[70,60],[69,60]]` (correct answers per half); `DAYS = [2,6,9,13,17,21,25]`; `HALF = 85`; `HABIT = [0.82, 0.71]`; `pre = 1800`, `mockDur = 1500`, `hold = 2800`; `total = 1800 + 7·1500 + 2800 = 15 100`.

Timeline:
- `ti = elapsed % 15100`.
- For `ti < 1800`: m = 0, q = 1.
- Otherwise `idx = floor((ti − 1800)/1500)`. If idx ≥ 7: m = 7, q = 1. Else m = idx + 1 and **[JS]** `q = easeInOut(((ti − 1800) % 1500) / 900)`, so each mock fills over its first 900 ms and holds for 600 ms.
- `done = q ≥ 1 ? m : m − 1`.
- `n = done·85`; `c = cumulative correct per half`; `p = c/n`; `half = 1.405·√(p(1−p)/n)` (about an 84% interval).
- `state`: 0 if done = 0; else pooled two-proportion `z = (p0 − p1) / √(pp(1−pp)·2/n)`, and `|z| ≥ 1.96` → 2, else 1.

Resulting values (computed from the code):

| done | at ti (ms) | p1st / p2nd | z | state | gap |
|---|---|---|---|---|---|
| 0 | 0–2700 | — | — | early | — |
| 1 | 2700 | .824 / .706 | 1.808 | forming | 12 |
| 2 | 4200 | .818 / .712 | 2.301 | **clear** | 11 |
| 3–7 | 5700 … 11700 | ≈ .82 / .71 | 2.92 → 4.44 | clear | 11 |

State text: `early`, `forming`, `clear`. The current one is #ededed with a 1px underline; the others are #8a8a93 (`.3s`). Reasons: "Finish one full length mock" / "Enough answers to judge, but the ranges still overlap." / "The ranges no longer overlap."

Layout (positions relative to the viz box):

| y | Element |
|---|---|
| 0 | "Stamina" 14px/600 + " first half vs. second half" 400 #8a8a93; on the right "Pro", mono 11px #8a8a93 |
| 28 | States (mono 11.5px, gap 10, `padding-bottom 2`) + reason 12.5px #a1a1aa; row gap `4px 14px`, wraps |
| 66 | Two columns at left **0%** and **54%**, width 46%, gap 16. Text block (min-width 92): label 12px #8a8a93; pct mono 26px -0.02em (`round(p·100)%`, or "—" when n = 0, i.e. completed mocks only); "answers so far: N" 10.5px. Dot grid: width 128, gap 3, 60 fixed slots of 7 × 7 (radius 99, 1px #a1a1aa). 13 fit per row, so 5 rows |
| 158 | "accuracy · range of what this could be" (left) / "┆ true habit (example)" (right), 11px #8a8a93 |
| 180 (h 52) | Lanes (side 0, 1). Label "1st"/"2nd" at `top side·26 + 2`, 10.5px, line-height 12. Habit: dashed 1px #8a8a93 line, h 18, at `top side·26 − 3`. Band: `top side·26 + 2; h 8; radius 2`, fill rgba(237,237,237,**.55**) for 1st and rgba(237,237,237,**.22**) for 2nd; opacity n ? 1 : 0. Midpoint mark: 2 × 14 #ededed, `margin-left −1`, at `top side·26 − 1` |
| 234 | Scale ticks 60% / 70% / 80% / 90%, mono 10px, `translateX(-50%)` |
| 260 | Sentence 13.5px #ededed: "↓ Accuracy drops **{gap}%** in the second half of a mock." The arrow and number are #f2555a. Visible only in state 2: `opacity 0→1`, `translateY 8px→0` (`.6s ease`, `.8s cubic-bezier(.22,1,.36,1)`) |
| 292 | "mocks taken" 11px. Line `left 84; right 0; top 299`, 1px #2a2a30. Track `left 84; right 0; h 40`. Squares 9 × 9, radius 2, at `left d/28·100%`, `top 3`, `margin-left −4.5`. Border #ededed if i < m, else #3a3a42. Fill #ededed if i < done. Scale 1.15 if i < m. "day 0", "day 14" (centred), "day 28" (right) at top 18, mono 10px |

Scale mapping: `X(v) = clamp((v − 0.6)/0.3 · 100, 0, 100)`; `x = calc(34px + (100% − 34px) · X/100)`; band width = `calc((100% − 34px) · (X(hi) − X(lo))/100)`.

Dot counts **[JS]**: `answers = done·85 + round(partial·85)` and `correct = c + round(partial · MOCKS[m−1][side])`, where `partial = q` while `m > done`. Visible dots = `round(answers/10)`; filled dots = `round(correct/10)`.

Transitions:
- Dots: `opacity .25s ease, transform .45s cubic-bezier(.34,1.56,.64,1), background-color .3s ease`. Hidden dots are scale .2, opacity 0.
- Bands: `left 1s cubic-bezier(.22,1,.36,1), width 1s (same), opacity .5s ease`. Midpoint marks: `left 1s, opacity .5s`.
- Mock squares: `background-color .3s, border-color .3s, transform .5s cubic-bezier(.34,1.56,.64,1)`.

The bands narrow toward the fixed habit lines as mocks accumulate. At the 15.1 s wrap everything resets: the bands fade out over .5 s and the dots shrink.

#### 3.7.6 Pro and backup (SV:168-205, 491-573). STEP 2800 ms

Booleans:

| Flag | True when |
|---|---|
| `signed` | `a > 0 \|\| p > 0.3` (at 840 ms into phase 0) |
| `proOn` | `(a > 1 \|\| (a == 1 && p > 0.72)) && !(a == 5 && p > 0.25)` |
| `flag` | `(a > 2 \|\| (a == 2 && p > 0.68)) && !(a == 5 && p > 0.25)` |
| `on` | `signed && proOn && flag` |

Checks row (top 0; flex wrap, gap `8px 26px`; 13px): "Signed in with Google" (signed), "Pro on this phone" (proOn), "Pro confirmed by server" (flag).
- Box: 16 × 16, radius 4, ✓ in 11px/700 #0c0c0e.
- Ok: bg and border #ededed, text #ededed, scale 1, mark ✓. Not ok: transparent, border #4a4a52, text #8a8a93, scale .9, no mark.
- Transitions: `background-color .25s, border-color .25s, transform .5s cubic-bezier(.34,1.56,.64,1)`; text `color .3s`.

Confirmation chain at y 34:
- RevenueCat box: `left calc(50% − 150px)`, 110 × 26, radius 6, mono 11px. Server box: `left calc(50% + 40px)`, same size. Between them, `left calc(50% − 40px) → right calc(50% − 40px)`, a 1px dashed #3a3a42 line at `top 47`.

| | Text | Border | Colour |
|---|---|---|---|
| RevenueCat | `rcSaid` → "RevenueCat · Pro", else "RevenueCat" | `rcBusy` #ededed / `rcSaid` #6b6b73 / else #2e2e35 | busy or said → #ededed, else #8a8a93 |
| Server | `svSet` → "server · pro ✓", else "server" | `svBusy` #ededed / `svSet` #6b6b73 / else #2e2e35 | same rule |

- `rcSaid = (a==1 && p>.35) || (a>=2 && !(a==5 && p>.25))`
- `rcBusy = (a==1 && .25<p<.5) || (a==2 && p<.1)`
- `svSet = (a==2 && p>.33) || (a>2 && !(a==5 && p>.25))`
- `svBusy = a==2 && .25<p<.45`
- Transitions: `border-color .3s, color .3s`.

Confirmation dot **[JS]**: 9 × 9 #ededed circle centred on (cpX, cpY) with `margin −4.5px 0 0 −4.5px`. Opacity toggles 0/1 with no transition.

| Phase | p range | Path | k |
|---|---|---|---|
| 1 | 0–.35 | toRc: `x = calc(52px + (50% − 147px)·k)`, `y = 72 − 25k` (phone → RC centre at 50% − 95, y 47) | `easeInOut(p/.35)` |
| 1 | .35–.72 | toRc reversed (RC → phone) | `1 − easeInOut((p − .35)/.37)` |
| 2 | 0–.33 | rcToSv: `x = calc(50% − 95px + 190k px)`, `y = 47` | `easeInOut(p/.33)` |
| 2 | .33–.68 | svToPhone: `x = calc(52px + (50% + 43px)·(1 − k))`, `y = 47 + 25k` | `easeInOut((p − .33)/.35)` |
| otherwise | | hidden | |

Boxes (each `padding 14px 12px`, column gap 12, `bg #0c0c0e`, label mono 10.5px #8a8a93, tile grid `repeat(3, 12px)` with gap 6 and 12 tiles of 12 × 12, radius 3):

| Box | left | top | w × h | radius | border |
|---|---|---|---|---|---|
| this phone | 0% | 72 | 104 × 160 | 16 | 1.5px #3a3a42 |
| backup | 50%, margin-left −62 | 92 | 124 × 120 | 10 | 1px, #8a8a93 when `on`, else #2e2e35 (`.4s`) |
| other phone | calc(100% − 104px) | 72 | 104 × 160 | 16 | 1.5px #3a3a42 |

Tile counts **[JS]**:
- `mine` = 9 if `a == 5 || (a == 4 && p > .08)`, else 8.
- `cloud`: a2 → `round(8·easeInOut((p − .72)/.26))`; a3 → 8; a4 → 9 if p > .75, else 8; a5 → 9; otherwise 0.
- `other`: a3 → `round(8·easeInOut((p − .1)/.5))`; a4 → 9 if p > .95, else 8; a5 → 9; otherwise 0.
- Filled tile: #ededed bg and border, scale 1. Empty: transparent, border #26262c, scale .85. Transitions `.3s, .3s, transform .5s cubic-bezier(.34,1.56,.64,1)`.

Sync lines at `top 152`: left segment `left 104 → right calc(50% + 62px)`; right segment `left calc(50% + 62px) → right 104`. `border-top: 1px {solid #8a8a93 when on | dashed #2e2e35}`. The colour transitions over .4 s; the style changes instantly.

Packets **[JS]**: 3 squares, 9 × 9, radius 2, #ededed, `top 148`, `margin-left −4.5`. Opacity is 1 only while 0 < k < 1. `leftSeg(k) = calc(104px + (50% − 166px)·k)`; `rightSeg(k) = calc(50% + 62px + (50% − 166px)·k)`. With `off = i·0.15`:

| Phase | Packets | k |
|---|---|---|
| a2 | i = 0, 1, 2 on the left segment | `easeInOut((p − .7 − off·.5)/.2)` → starts at p .70 / .775 / .85, each 560 ms. The last does not finish before the phase ends, so it disappears mid-line |
| a3 | i = 0, 1, 2 on the right segment | `easeInOut((p − off)/.4)` → starts at 0 / .15 / .3, each 1120 ms |
| a4 | i = 0 only | p < .75: leftSeg `easeInOut((p − .55)/.2)`; otherwise rightSeg `easeInOut((p − .75)/.2)` |

Status line at `top 248`, mono 12px: "backup: " (#8a8a93) + status text.

| Phase | Status text |
|---|---|
| default | `off` |
| a1, p > .72 | `activating…`, opacity = pulse |
| a2 | `activating…` (pulse) until p > .68, then `syncing` |
| a3 | `syncing` while p < .55, then `up to date ✓` |
| a4 | `syncing` while .55 < p < .95, else `up to date ✓` |
| a5 | `up to date ✓` until p > .25, then `off · data stays on this phone` |

Pulse **[JS]**: `0.55 + 0.45·cos(elapsed/180)`, period ≈ 1131 ms. Status colour is #8a8a93 when the text starts with "off", else #ededed.

Upload wait row at `top 274` (opacity 1 only when `a == 4 && p < .7`, `.3s` transition): track 104 × 3, radius 2, #1f1f24, overflow hidden. Fill #ededed, width `clamp01((p − .08)/.47)·100%` (full at p .55, about 1.3 s of real time). Label "uploads 5 s after the last change", 11.5px #8a8a93.

---

## 4. Interaction

| Input | Effect | Ref |
|---|---|---|
| `ArrowRight` / `ArrowLeft` (window keydown) | `go(+1)` / `go(−1)` around the 20-entry ring | PS:199 |
| `Escape` | In PS, only when `layout === 'sheet'`, so **no effect in spread B**. In the Room, Esc sets `pOpen = false` and closes the page (RM:82). | PS:200 |
| Back button | `props.onBack()` | PS:48, 252 |
| Prev / next buttons | `go(−1)` / `go(+1)`; labels are the neighbours' names (they wrap: Pantas's previous is w3) | PS:70-71 |
| Logos, detail icons | Hover only (tooltip, colour). Not clickable, not focusable. | |
| Links | Plain `<a href>`, same tab | PS:67, 163 |
| Rail | Hover or focus-within opens it; click a row to jump (§3.4) | PS:176 |
| SystemViz Pause / Play | Toggles that visual's clock | SV:212 |
| Focus | Native tab order: back, links, prev, next, scroller content links, rail rows (which open the panel through `:focus-within`). Focus ring 2px #EDEDED, offset 3. | PS:26 |
| a11y | Stack row `aria-label="Built with A, B, C"`; logos `role=img` with `aria-label`; detail labels in `.sr` text; rail `aria-label="On this page"`, ticks `aria-hidden`, rows `aria-current`; SystemViz visual area `aria-hidden="true"` (only the caption is exposed) | |
| Reduced motion | Swap fade off (f = 1); rail jump uses `behavior:'auto'`; SystemViz shows its still frame and starts paused; Room open/close is instant | PS:197, SV:224 |

---

## 5. Colours

### 5.1 Dark → light mapping (PS → PSL, every difference)

| Role | Dark | Light |
|---|---|---|
| Page bg (`pageBg`) | #0a0a0c | #F2F1ED |
| Base text / h1 / h2 / h3 / link | #EDEDED | #111114 |
| Nav bg | rgba(10,10,12,0.78) | rgba(242,241,237,0.78) |
| Nav muted / nav divider | #8A8A93 / #2a2a30 | #6A6A72 / #D6D4CD |
| Secondary text (desc, `.tb`, body, case-point body) | #A1A1AA | #56565E |
| Muted (stackText, icons, captions, status col heading, logo rest fill) | #8A8A93 | #6A6A72 |
| Detail values, status items | #D4D4D8 | #2E2E34 |
| Hover target colour (`.tb`, `.ul` underline, `.rl`) | #EDEDED | #111114 |
| Underline rest | #4a4a52 | #B3B1AB |
| Hairline (details top, systems rows) | #1c1c22 | #E6E4DE |
| Strong rule (case points, status cols) | #2a2a30 | #D6D4CD |
| Tooltip bg / text | #EDEDED / #0a0a0c | #111114 / #F2F1ED |
| Focus ring | #EDEDED | #111114 |
| Surfaces (hero stage, note tiles, figure box) | #131317 | #FFFFFF |
| Placeholder text in surfaces | #6b6f7c | #8A8A92 |
| Mock label text | #8A8A93 | #8E8E95 (Discord chat: #80848E) |
| Rail tick inactive / active | #3a3a42 / #EDEDED | #C4C2BC / #111114 |
| Rail row colour inactive / active | #8A8A93 / #EDEDED | #6A6A72 / #111114 |
| Rail panel bg / border / shadow | rgba(17,17,20,.92) / #222228 / `0 24px 60px rgba(0,0,0,.5)` | rgba(255,255,255,.92) / #E2E0DA / `0 24px 60px rgba(17,17,20,0.175)` |
| Rail row hover bg | #1a1a1f | #E9E7E2 |
| `.cta:hover` (unused) | #ffffff | #2A2A30 |
| Status dots | §2.5 | §2.5 (rings unchanged) |
| Logo brand colour for dark marks (SQLite, Markdown, pandas, NumPy, Next.js, GitHub) | #EDEDED | #111114 |

### 5.2 Light mocks (PSL lines 82-119)

All mock frames gain `box-shadow: 0 1px 2px rgba(17,17,20,.05), 0 16px 36px -18px rgba(17,17,20,.28)`.

| Mock | Light changes |
|---|---|
| Phone | Body #1B1B1F, border 1px #1B1B1F (was #050506 / #2e2e35); screen #FFFFFF; label #8E8E95 |
| TV | Panel #1B1B1F with border #1B1B1F; screen #FFFFFF; neck #2A2A2F; base #3A3A40 |
| Web | Frame #FFFFFF, border #E3E1DB; bar border #EEECE7; dots #E2E0DA; body #FAFAF8 |
| Discord | Border #E3E1DB; rail #E3E5E8; first icon #C4C8CE, circles #D3D6DB; channel list #F2F3F5; bars #C4C8CE / #DEE1E5 in the same alternation; chat #FFFFFF; label #80848E |
| Terminal | **Stays dark** (#08080a, same text); only the border changes to #1E1E22 |
| Repo | #FFFFFF, border #E3E1DB; title #111114, icon stroke #6A6A72, desc #56565E, footer rule #ECEAE5, footer text #6A6A72 |
| Data | #FFFFFF, border #E3E1DB |
| Paper | #FFFFFF with border 1px #E6E4DE (was #ECEBE6, no border) |

Everything else (sizes, timings, logic, markup) is identical. PSL has the same 260 lines.

### 5.3 SystemViz palette (dark only; there is no light SystemViz)

| Token | Hex | Used for |
|---|---|---|
| bg | #0c0c0e | Viz root; text on light blocks |
| fg | #ededed | Filled marks, active text |
| muted | #8a8a93 | Labels |
| soft | #a1a1aa | Secondary text, review outline |
| neutral greys | #6b6b73, #55555d, #4a4a52, #3a3a42, #2e2e35, #2a2a30, #26262c, #1f1f24, #1a1a1e, #18181b, #16161a, #111114 | Rules, outlines, empty states |
| green | #4ade80 | Right answer |
| red | #f2555a | Wrong answer, sent back, accuracy drop |

---

## 6. Gotchas that cause drift

1. **The swap is a cut plus a fade-in, not a crossfade** (§3.2). 420 ms easeOutCubic, opacity on both pages, a 14 px rise on the right page only. The scroll resets to 0 *instantly* before the fade.
2. **`openReq` for the already-open project is a no-op**: no fade, scroll and active section kept (PS:215). The index points into the 20-entry `P` (posts included), so the host's index must use the same order.
3. **The ring includes posts.** ← → from bettergov goes to w1 (a post), and Pantas's "previous" label shows w3's bracketed title.
4. **Arrow keys are bound on `window` for the component's whole lifetime.** The Room keeps ProjectSpread mounted even while hidden, so ← → change the hidden project too. Gate the keys on "page open" in production. Esc does nothing in PS (layout guard); the host closes the page.
5. **The active section is computed in render from a non-state field** (`this.cur`) and depends on the per-frame re-render. Store it in real state when porting. Threshold: `offsetTop − 260 ≤ scrollTop`; bottom snap within 4 px. The jump offset is −100 (not −260).
6. **The rail is centred on the frame, not on the scroller, and sits outside it.** The wheel does not scroll the page while the pointer is over the 108 px hit strip. The hit strip's width depends on the active tick (26 px).
7. **The tick width transition overshoots**: `cubic-bezier(.34,1.56,.64,1)` over .45 s. Colour uses a plain `.3s ease`.
8. **Hero scale is computed, not authored.** Use `min(724/520, 440/HH, 1.6)` with the table in §1.6, applied via `scale` from the centre. `HH` is the mock's height, not the stage's.
9. **Logo size is 22 × 22** (18 × 22/18), except MySQL at 56.2 × 15.9 with its own viewBox. The logos only colour individually on hover (the `.stackrow` group hover is dead).
10. **stackText**: non-logo stack names go into the mono text (Pantas: "Drift · RevenueCat"). Posts show their topic there (PS data), even though PJ:127 has `stackText=''`.
11. **Platform row**: it comes first, uses the *type* icon, and falls back to `p.type` when there is no Platform fact (PSO shows "Data system"; open source shows "Open source"). Posts have no Platform row.
12. **Status regex** is a substring test (`live` would match "delivered"); the `live` test runs before `wip`. Light mode changes the dot colours but keeps the dark-mode ring rgba values.
13. **Links are capped at 2** (`slice(0,2)`). An empty links row keeps its 22 px min-height. The case-points wrapper adds 48 px of padding even when empty, so it is always there.
14. **SystemViz timing is mostly CSS transitions** triggered by phase changes, with per-element delays (roadmap i·45 ms, content i·50 ms, study dot .55 s and label .7 s). Do not tween these in JS with different curves. The JS-tweened values are marked [JS].
15. **SystemViz clocks** are per-instance, start on mount, and keep running offscreen (no IntersectionObserver). They advance by `min(dt, 100ms)`. All five Pantas visuals start together when the page mounts.
16. **Reduced motion in SystemViz**: the loop never starts, so pressing "Play" does nothing (paused flips, but there is no rAF). Decide whether to keep this.
17. **The viz overflows its holder by 3 px** (373 vs 370; insights 413 vs 410) because the caption button has `min-height: 44`. The holder does not clip; keep that.
18. **Insights ignores STEP / n.** Its own 15.1 s timeline drives it, the step number is blank, and the step name is fixed. Its "clear" state arrives after mock 2 (z = 2.301) at ti = 4200 ms.
19. **Pro's "uploads 5 s" bar fills in about 1.3 s** (`(p − .08)/.47` of 2800 ms). This is intentional compression.
20. **SystemViz has no light version.** PSL still imports `SystemViz`, so in light mode the five visuals render as dark #0c0c0e panels on a #F2F1ED page. Replicate this, or flag it for a design decision.
21. **The light terminal mock stays dark** (only its border changes). The light paper mock gains a border.
22. **`layout`, `sh`, `close`, `reopen`, `cf.x`, `nxL`, `kindIcon`, `posText` and the `.toc/.cta/.nx` CSS are vestigial** (from the placard/sheet layouts in SP). They do not affect spread B.
23. **Fonts**: Geist and Geist Mono from Google Fonts. Letter-spacing values are in em (−0.045em on h1, −0.02em on h2/h3).
