# Phone site: implementation spec (390 × 844)

Source of truth: `reference/components/Mobile.dc.html` (cited as **M:line**) and `reference/components/BookPage.dc.html` (**BP:line**). `generators/mobile.py` produced M. Its script is identical apart from the inlined data (M:347 projects, M:348–396 volumes, M:398 wall order). Generator line = M line − 152 for script lines ≥ M:399. Every number below comes from those files. Where the source does something odd, this spec says so (marked **[as-built]**) instead of fixing it.

Wrappers (entry points / initial props):

| Board | Props | Notes |
|---|---|---|
| MobileWall | `screen="wall"` | |
| MobileIndex | `screen="index"` | |
| MobileProject | `screen="project" project="pantas"` | `from` starts as `'wall'` |
| MobileProjectQR | `screen="project" project="qr"` | |
| MobileShelf | `screen="shelf"` | |
| MobileBook | `screen="book" vol={0}` | starts on shelf, **auto-opens** Vol. 01 after 700 ms (canvas-only, §5) |
| MobileContact | `screen="book" vol={5}` | auto-opens Vol. 06 |

Notation: `cl(x)=clamp(x,0,1)`. All times are in ms from `performance.now()`.

---

## 0. Easing functions (verbatim)

```js
// M:434 (renderVals) and M:428 (camX)
const cl   = (x) => Math.max(0, Math.min(1, x));
const out  = (x) => 1 - Math.pow(1 - cl(x), 3);                        // easeOutCubic
const ease = (x) => { x = cl(x); return x < 0.5 ? 4 * x * x * x
                                       : 1 - Math.pow(-2 * x + 2, 3) / 2; }; // easeInOutCubic
// pan (M:430) inlines easeOutCubic: e = 1 - Math.pow(1 - t, 3)
```

CSS easings used:

| Name used here | Value | Where |
|---|---|---|
| spring | `cubic-bezier(.34,1.3,.64,1)` | tab underline .55s (M:338), type underline .5s (M:106) |
| out-expo-ish | `cubic-bezier(.22,1,.36,1)` | nav slide .4s (M:336), contents sheet .4s (M:245), book lift .38s (M:281), sim keyboard .32s (M:321) |
| BookPage spring | `cubic-bezier(.34,1.56,.64,1)` | link arrow .3s, button press scale .3s, copy swap .45s (BP:17,18,124) |
| ease | `ease` | `.tbtn` colour .25s (M:15), rail .25s (M:91), book head/controls opacity .25s (M:280,314), BookPage link bg .2s, field border .2s, shelve .15s/.25s (BP:14,21,28) |

---

## 1. Layout per screen

### 1.0 Global frame (M:27)

| Property | Value |
|---|---|
| Root | `position:relative; 390×844; overflow:hidden` |
| Text | `color:#EDEDED; font-family:'Geist',system-ui,sans-serif; -webkit-font-smoothing:antialiased` |
| Background | `#0a0a0c` + `radial-gradient(circle, rgba(237,237,237,0.075) 1px, transparent 1.6px)`, `background-size:26px 26px`, `background-position:0 0` (`dotsY` is always `'0px'`, M:494) |
| Fonts | Geist 400/500/600/700/800 and Geist Mono 400/500 (Google Fonts, M:11) |
| Paint order (DOM) | screen content → top bar (M:330) → bottom nav (M:336). Top bar and nav paint over everything. |

Global CSS (M:13–24):

| Class | Rule |
|---|---|
| `.ms` | `scrollbar-width:none; -webkit-overflow-scrolling:touch`, webkit scrollbar 0×0 |
| `.tbtn` | `border:none; background:none; padding:0; font-family:inherit; cursor:pointer; color:var(--c,#A1A1AA); transition:color .25s ease` |
| `.lg path` | `fill:#8A8A93` (all stack logos monochrome) |
| `.field` | `width:100%; box-sizing:border-box; height:44px; border:none; border-bottom:1px solid #26262c; background:transparent; color:#EDEDED; font-size:16px; padding:0 0 0 30px; outline:none`. `:focus` sets border-bottom `#EDEDED`; `::placeholder` is `#61616A` |
| focus ring | `a:focus-visible, button:focus-visible { outline:2px solid #EDEDED; outline-offset:2px }` |
| `.face` | `position:absolute; backface-visibility:hidden; -webkit-backface-visibility:hidden` |
| `.shade` | `position:absolute; inset:0; background:#000; pointer-events:none` |
| `.edgeV` | `background-color:#E4E2DB; background-image:repeating-linear-gradient(to right,#E4E2DB 0px,#E4E2DB 2px,#cfcdc5 2px,#cfcdc5 3px)` |
| `.tile` | defined but **unused** on the phone |

### 1.1 Top bar (M:330–332)

| Property | Value |
|---|---|
| Box | `absolute; left/right 0; top 0; height 56px; padding 0 10px 0 22px; flex, align center, space-between` |
| Background | `rgba(10,10,12,.8)` + `backdrop-filter: blur(16px)` (with -webkit-) |
| Wordmark | "Aedwon", 16px / 600, letter-spacing −0.02em |
| Back button | only on `project` or `book`. Label "Back" (project) or "Close" (book). `height 44px; padding 0 12px; font-size 15px; --c #EDEDED` |

### 1.2 Bottom nav (M:336–338)

| Property | Value |
|---|---|
| Box | `<nav aria-label="Main">`, `absolute; bottom 0; height 74px; padding 0 12px 14px; box-sizing border-box; flex; align center; justify-content space-around` |
| Look | bg `rgba(10,10,12,.86)`, `border-top:1px solid #1c1c22`, blur 16px |
| Hide | `translate: 0 {barY}`: `100%` on project/book, else `0px`; `transition: translate .4s cubic-bezier(.22,1,.36,1)` |
| Tabs | Wall · Index · About · Contact. Each `82×48`, 14.5px, `--c` `#EDEDED` if current else `#8A8A93` |
| Travelling line | `absolute; left 0; top 46px; 26×1.5px; #EDEDED; translate:{tabX} 0; transition: translate .55s cubic-bezier(.34,1.3,.64,1)` |
| tabX (M:527) | `(12 + (366/4)*tabIdx + (366/4 - 26)/2).toFixed(1)` gives **44.8 / 136.3 / 227.8 / 319.3 px**. This centres the line under each tab: space-around puts tab centres at 57.75 + 91.5·i |

### 1.3 Wall: vertical drum picker (M:30–97)

Layers, back to front:

1. **Drum** (M:31): `absolute; inset 0; perspective 900px; perspective-origin 50% 340px; pointer-events:none; aria-hidden`.
   - Tiles, one per wall item (17), M:33: `absolute; left 45px; top {y}; width 300px; height {h}; translate: 0 -50%; transform: rotateX({rx}deg) scale({sc}); opacity; visibility; z-index; border-radius 10px; overflow hidden`.
   - Tile media, M:34: `relative; 300×{h}; overflow hidden` → inner `absolute; left 50%; top 50%; width 520px; translate -50% -50%; scale {s}` holding the 520-wide illustration block (contents in `generators/tileblocks.html`).
2. **Scroller** (M:82): `.ms`, `absolute; inset 0; overflow-y:auto; scroll-snap-type: y mandatory; scroll-padding-bottom: 164px`. It draws nothing. Contents: spacer `250px` (M:83), then 17 transparent `<button>` hit targets `display:block; 300×180; margin 0 auto; scroll-snap-align:center; scroll-snap-stop:always` (M:85), then spacer `414px` (M:87).
   - Geometry check: snapport = 844 − 164 = 680 → centre y = 340 (the same as the drum centre and perspective origin). Item k centre in content = 250 + 180k + 90 = 340 + 180k, so the snapped scrollTop is 180k. Content height = 250 + 17·180 + 414 = 3724, so max scrollTop = 2880 = 16·180.
3. **Rail** (M:90–91): `absolute; right 10px; top 272px; flex column; align-items flex-end; gap 6px; pointer-events none`. 17 bars `height 1.5px`, width `14px` (focused) or `6px`, colour `#EDEDED` or `#3a3a42`, `transition: width .25s ease, background-color .25s ease`.
4. **Caption** (M:93–96): `aria-live="polite"; absolute; left/right 22px; bottom 96px; flex column; gap 4px; pointer-events none; opacity {cap.op}`.
   - line 1: `"NN / 17"`, Geist Mono 11.5px `#8A8A93`
   - line 2: name, 24px / 600 / −0.03em
   - line 3: type, 14px `#A1A1AA`

Tile height `h` and media scale `s` (M:495, `med(q,300,220)`). `HH` (M:436) = phone 370, tv 330, web 325, discord 325, term 300, data 300, repo 260, paper 300:

| media | h = round(HH·min(300/520, 220/HH)) | s = min(300/520, 220/HH) |
|---|---|---|
| phone | 213px | 0.5769 |
| tv | 190px | 0.5769 |
| web / discord | 187px | 0.5769 |
| term / data / paper | 173px | 0.5769 |
| repo | 150px | 0.5769 |

Wall order (M:398) uses project indices `[0,2,4,13,1,8,14,3,10,7,15,9,12,5,16,11,6]`: Pantas › Lakambini › Kiosk Survey › Microsoft Aspire › MSL Network Bot › Norala SB Portal › OpenSRE › AI Agent Config › Ilocos Sur Esports Bot › WebP Unli › DockRoute › MSL Collegiate Cup Bot › KQM Team DPS Calculator › PSO Scorer › BetterGov PH › OPPO Cup Bot › QR Studio. The three Writing posts (indices 17–19) are **not** on the wall.

### 1.4 Index (M:101–167)

Scroller: `.ms; absolute; inset 0; overflow-y auto`. Inner padding `76px 22px 110px`.

| Block | Spec |
|---|---|
| Type row (M:104) | `role="group" aria-label="Show a type"; relative; flex; justify-content:space-between; height 48px` |
| Type button (M:105) | 7 buttons, `46×48`, flex centre, gap 3px. Icon svg 22×22 (viewBox 24, stroke currentColor, width 1.6, round caps/joins). Count `<sup>` Geist Mono 10px, `vertical-align:10px`. `--c` is `#EDEDED` when active, else `#5a5a63`. Button pitch = 46 + (346 − 7·46)/6 = 50px |
| Kinds (M:347 `KINDS`) | All (`all` icon, count 20) · Apps (Mobile app, Android TV: 2) · Bots (Discord bot: 4) · Web (Website redesign, Web tool, Civic tech: 5) · Tools (Developer tooling, Data system: 2) · Open source (4) · Writing (3) |
| Type underline (M:106) | `absolute; left 0; bottom 2px; 22×1.5px; #EDEDED; translate:{kindX} 0; transition: translate .5s cubic-bezier(.34,1.3,.64,1)`. `kindX = idx·((346−46)/6) + 15` (M:501): **15, 65, 115, 165, 215, 265, 315 px** |
| Heading row (M:108) | `flex; align baseline; space-between; margin-top 18px`. Left: kind name ("All projects" or the kind label), 26px / 600 / −0.035em. Right: count, Geist Mono 11.5px `#8A8A93`, reading `"20"` or `"{vis} / 20"` |
| Find field (M:112) | `<label>` relative, `margin-top 10px`. Visually hidden text "Find a project". Search icon 18×18, stroke `#8A8A93`, width 1.6, `absolute; left 0; top 13px`. `<input class="field" type="search" placeholder="Find a project">` |
| Row list (M:113) | flex column, `margin-top 8px` |
| Row (M:115) | `<button>` `--c #EDEDED; display:grid; grid-template-columns: 64px minmax(0,1fr) 24px; gap 14px; align-items center; min-height 60px; border-bottom 1px solid #1c1c22; text-align left` |
| Row thumb | `64×40; overflow hidden; border-radius 4px; background #131317`, media scale `min(64/520, 40/HH)`: phone 0.1081, tv 0.1212, others 0.1231 |
| Row text (M:160) | Name 16px / 500, nowrap ellipsis. Second line 12.5px `#8A8A93`, ellipsis, = `q.topic \|\| q.stackText \|\| stack.join(' · ')`, so **Writing posts show their topic** (e.g. "Pantas · offline-first") |
| Row icon (M:161) | 18×18 type icon, stroke `#8A8A93`, from `ICON[TI[type]]` |

### 1.5 Project page (M:170–249)

Scroller `.ms`, `absolute; inset 0; overflow-y auto; background #0a0a0c` (this hides the dot pattern). Content column `padding 72px 22px 120px; flex column; opacity {cf}` (fade-in, §3.4).

| # | Block | Spec |
|---|---|---|
| 1 | h1 (M:173) | 34px / 600 / −0.04em / lh 1.05 |
| 2 | desc (M:174) | `margin 12px 0 0`; 15.5px / lh 1.6 / `#A1A1AA` |
| 3 | stack row (M:175–177) | `flex wrap; align center; gap 16px; margin-top 18px`. Logo SVGs (`role="img" aria-label`, default 18×18 viewBox `0 0 24 24`; MySQL is 46×13, viewBox `-0.2 12.6 22.4 6.2`), fill `#8A8A93`. Then a text run in Geist Mono 12px `#8A8A93` = `p.stackText` or the stack names that have no logo, joined `' · '` |
| 4 | details (M:179–180) | `grid; 1 col; gap 11px; margin-top 22px; padding-top 18px; border-top 1px solid #1c1c22`. Row: `flex; align center; gap 10px; 13.5px; #D4D4D8`. Icon 16×16, stroke `#8A8A93`. Hidden "{label}: " prefix for screen readers. Value nowrap ellipsis |
| 4a | details order (M:507) | If not a post: first a **Platform** row (fact value or `p.type`, type icon). Then each fact in order except Platform. **Status** shows an 8px dot (`margin 4px; radius 99px`) instead of an icon: `#4ADE80` if /live\|shipped/, `#F0B45A` if /pre-launch\|prototype\|beta/, else `#61616A`. Other facts use icons via `FI` (Published/Year/Timeline → calendar, Reading time/Ran for → clock, Topic → tag, Role → person, Client → building, Scale → people, Hosting → server, Event → flag, Contribution → commit, For → target, Runs → browser; unknown → target) |
| 5 | link (M:182) | first link only: `margin-top 18px; 15px; #EDEDED; underline; offset 4px; decoration #4a4a52`, text "{label} ↗" |
| 6 | hero (M:183) | wrapper `margin-top 26px; border-radius 10px; background #131317` (no overflow clip **[as-built]**: the media corners stay square). Media box `346 × heroH`. `heroH = round(HH·min(346/520,240/HH) + 28)`: phone 268, tv 248, web/discord 244, term/data/paper 228, repo 201. Scale is phone 0.6486, others 0.6654 |
| 7 | case points (M:227) | only when `depth==='case'` (Pantas): `gap 18px; margin-top 28px`. Each: `padding-top 12px; border-top 1px solid #2a2a30; gap 6px`. Head 16px / 600; body 14.5px / lh 1.6 / `#A1A1AA` |
| 8 | sections (M:229–234) | `<section id>`: `flex column; gap 12px; padding-top 40px`. h2 22px / 600 / −0.02em. Paragraphs 16px / lh 1.7 / `#A1A1AA`. Figure placeholder: `height 220px; radius 10px; bg #131317`; Geist Mono 11px `#6b6f7c`, centred, `padding 0 16px` |
| 8a | systems (Pantas "How Pantas works") | per item: `padding-top 22px; border-top #1c1c22; gap 10px`; h3 18px / 600; paragraphs 15px / lh 1.65 / `#A1A1AA`; viz box `346 × mh`, overflow hidden, holding `<SystemViz which>` at 600px wide × `vh`, `transform-origin:0 0; scale:0.5767`. `mh = (parseInt(vh)*0.5767).toFixed(0)`: 370 → 213px, 410 → 236px. Items: Adaptive roadmap / Study loop / Content (370), Insights (410), Pro and backup (370) |
| 8b | status columns | `padding-top 10px; border-top #2a2a30; 14.5px; lh 1.7`. Heading 13px `#8A8A93`, `padding-bottom 4px`. Items `#D4D4D8` |
| 9 | Next project (M:237) | `margin-top 56px; padding-top 18px; border-top 1px solid #1f1f24; gap 6px; left-aligned`. "Next project" 13px `#8A8A93`, then "{name} →" 24px / 600 / −0.03em |

Contents control (only when the project has more than one section, M:241–247):

| Element | Spec |
|---|---|
| Square button | `aria-label="Contents" aria-expanded`; `absolute; right 18px; bottom 26px; 48×48; radius 12px; bg rgba(17,17,20,.9); border 1px solid #26262c; blur 16px; flex column centre; gap 4px` |
| Ticks | one per section, `height 1.5px; radius 1px`; width `20px`/`12px`, colour `#EDEDED`/`#4a4a52` (current/other) |
| Bottom sheet | `aria-hidden`; `absolute; left/right/bottom 0; padding 18px 12px 30px; radius 16px 16px 0 0; bg rgba(17,17,20,.97); border-top 1px solid #26262c; blur 20px; translate: 0 {0px \| 110%}; transition: translate .4s cubic-bezier(.22,1,.36,1)` |
| Sheet rows | `display block; width 100%; min-height 48px; padding 0 12px; 16px; left`; `--c` `#EDEDED` (current) or `#8A8A93` |

### 1.6 About: the stack of six volumes (M:252–266)

Wrapper `absolute; inset 0; opacity {stk.op}`.

| Element | Spec |
|---|---|
| "Six volumes" | `top 214px`, centred, Geist Mono 11.5px `#8A8A93` |
| Shelf board | line `left/right 18px; top 652px; height 2px; #34343b`, then `top 654px; height 12px; #141418` |
| Hint | "Tap a volume to open it", `top 690px`, centred, 14px `#8A8A93` |
| Spine button (M:256) | `aria-label="Volume NN: Title"`; `absolute; left/top/width/height from stackRect; box-sizing border-box; padding 0 16px; flex; align center; gap 14px; radius 3px; background tone; --c ink; box-shadow: inset 0 1px 0 rgba(255,255,255,.08), inset 0 -5px 10px rgba(0,0,0,.22); translate {tx} 0; opacity {op}` |
| Spine content (M:257–261) | [col 30px: "VOL." Geist Mono 8.5px / .14em / op .7, number 18px / 800 / −0.04em / lh 1.05] · divider `1px × 46%` currentColor op .28 · title (flex 1, `{fs}` 800 / .01em, ellipsis) · divider · "AEDWON" Geist Mono 8.5px / .22em / op .7 |

`stackRect(i)` (M:432): `H=[67,54,61,77,51,45]`, `W=[326,312,334,304,320,298]`, `O=[-4,6,-2,3,-6,2]`, `y0 = 652 − ΣH = 297`, `x = 195 − W/2 + O`.

| Vol | Title | tone / ink | x | y | w | h | title fs |
|---|---|---|---|---|---|---|---|
| 01 | Aerol | `#EDEDED` / `#0a0a0c` | 28 | 297 | 326 | 67 | 17px |
| 02 | How I work | `#26262c` / `#EDEDED` | 45 | 364 | 312 | 54 | 17px |
| 03 | Guilds | `#15151a` / `#EDEDED` | 26 | 418 | 334 | 61 | 17px |
| 04 | Training arc | `#202026` / `#EDEDED` | 46 | 479 | 304 | 77 | 17px |
| 05 | Off the clock | `#18181d` / `#EDEDED` | 29 | 556 | 320 | 51 | 17px |
| 06 | Next volume | `#EDEDED` / `#0a0a0c` | 48 | 607 | 298 | 45 | 15px (h < 50) |

(`V[].D` values 84/68/76/96/64/56 are not used on the phone.)

### 1.7 Book: reading screen (M:278–326)

Outer wrapper (M:279): `absolute; inset 0; opacity {bk.op}; translate 0 {bk.drop}` (closing anim).

| Element | Spec |
|---|---|
| Running head (M:280) | `top 64px`, centred, Geist Mono 12px `#8A8A93`, "Vol. 01 · Aerol"; `opacity {ctlOp}; transition opacity .25s ease` |
| Stage (M:281) | `absolute; left 0; top 0; 390×700; perspective 1700px; perspective-origin 195px 335px; translate 0 {bk.dy}; transition: translate .38s cubic-bezier(.22,1,.36,1); touch-action: pan-y`; pointer handlers for swipe |
| Book (M:282) | `absolute; left {camX − 340}px; top 92px; 680×486; transform-style: preserve-3d` |
| Left edge (M:284) | `.edgeV`; `left {−lEdgeW}; top 3px; width lEdgeW; height 480px; visibility lVis; radius 2px 0 0 2px` |
| Right edge (M:285) | `.edgeV`; `left 680px; top 3px; width rEdgeW; height 480px; radius 0 2px 2px 0` |
| Left page (M:286) | `left 0; 340×486; overflow hidden; radius 3px 0 0 3px; visibility lVis; box-shadow 0 24px 60px rgba(0,0,0,.45)`. Inside: a 420×600 BookPage, `transform-origin 0 0; scale 0.8095` (= 340/420), `side="left"` |
| Right page (M:287) | `left 340px; 340×486`; radius `0 3px 3px 0`; same shadow and scale; `side="right"`. Contains the right-hand cast shadow span (M:288) |
| Left cast shadow (M:289) | in book coords, see §3.7 |
| Leaf (M:291) | `absolute; left 340px; top 0; 420×600; transform-origin 0 0; scale 0.8095; preserve-3d; pointer-events none; visibility leafVis; aria-hidden` (six strips, §3.6) |
| Controls (M:314–317) | `absolute; left/right 20px; top 612px; flex; space-between; opacity ctlOp; pointer-events ctlPe; transition opacity .25s ease`. ← and → are `48×48`, 20px, `aria-label` "Previous page"/"Next page", `--c` `#3a3a42` when at the end, else `#EDEDED`. Centre text "{n} / {total}" Geist Mono 12px `#A1A1AA` |
| Sim keyboard (M:321–325) | see §4.4 |

Camera: `sx('L') = 365`, `sx('R') = 25` (M:420). Book `left = camX − 340`:

| side | camX | book left | left page on screen | right page on screen |
|---|---|---|---|---|
| L | 365 | 25px | x 25 → 365 (full) | x 365 → 705 (25px sliver at the right edge) |
| R | 25 | −315px | x −315 → 25 (25px sliver at the left edge) | x 25 → 365 (full) |

Cover face (used both in the morph and on the closed leaf), e.g. M:271: `420×600; box-sizing border-box; padding 44px 40px; background tone; color ink; flex column`. Spine line `absolute; left 14px; top/bottom 0; width 1px; currentColor; opacity .14`. "AEDWON" Geist Mono 12px / .22em / op .7. Number `margin-top:auto`, 150px / 800 / −0.075em / lh .86. Title `{cfs}` / 800 / −0.045em / lh 1.02 / `overflow-wrap:anywhere`, where `cfs = title.length > 9 ? '54px' : '64px'`.

**BookPage** (unscaled 420×600, BP:33): `padding 44px 40px 52px; background #ECEBE6; color #111113; flex column; gap 16px; overflow hidden`.

| Kind | Layout (BP lines) |
|---|---|
| contents (36–45) | Title 40px / 800 / −0.045em / lh 1. Rows are buttons `.bp-link`: `flex; baseline; gap 10px; padding 11px 6px; margin 0 -6px; border-top 1px solid #d3d1c9; 15.5px`. Title on the left, page number in Geist Mono 11.5px `#61616A`, then "→" (`.bp-ar`). Hover: bg `rgba(17,17,19,.06)`, arrow `translate 3px 0` |
| big (48–51) | `margin-top auto`, `{bigSize}` / 800 / −0.065em / lh .88. Body 18px / lh 1.5 / `#3f3f46` |
| text (54–58) | Title `{titleSize}` / 800 / −0.045em / lh 1.02. Body 17px / lh 1.6 / `#3f3f46`. Optional meta `margin-top auto`, Geist Mono 11.5px `#61616A` |
| photo (61–64) | `flex 1`, 1.5px dashed `#b6b4ac`, `rotate -1deg`; caption Geist Mono 11.5px |
| list (67–72) | Title 30px / 800 / −0.04em. Rows `padding 12px 0; border-top #d3d1c9; 16px`; right column Geist Mono 11.5px `#61616A` |
| org (75–83) | Logo slot 64px tall, dashed. Org name 32px / 800. Roles gap 14px; each `padding-top 12px; border-top`; title 15.5px / 700; dates Geist Mono 11px; desc 14px / lh 1.5 |
| guild (86–91) | Title 34px / 800. Grid `repeat(cols)`, `grid-auto-rows minmax(0,1fr)`, gap 10px, cells dashed |
| read (94–98) | Cover slot 200px wide, 2/3, `rotate 1.5deg`; "[title]" 24px / 800; text 15px |
| titleit (101–107) | `margin-top auto`, gap 14px. Vol number 150px / 800 / −0.075em / lh .86. `<input class="bp-ttl" maxlength="28" placeholder="Title this volume" aria-label="Title this volume">` (40px / 800 / −0.045em, 1.5px dashed `#a9a79f` underline; solid `#111113` on focus). Byline 15px `#61616A`: "by {name.trim() \|\| 'you'} and Aerol" |
| write (110–118) | "Chapter 1" 30px / 800. Three labelled fields `.bp-fld` (18px / lh 1.5, `padding 3px 0 6px`, 1.5px `#c9c7bf` underline, `#111113` on focus): "Your name" (autocomplete name, placeholder "Maria Santos"), "Where I can reach you" (type email), "What we'd build" (textarea, `flex 1`, `line-height 30px`, ruled background `repeating-linear-gradient(to bottom, transparent 0, transparent 29px, #d3d1c9 29px, #d3d1c9 30px)`, focus bg `rgba(17,17,19,.035)`). Button "Close and shelve": `height 52px; radius 10px; #111113 bg; #ECEBE6 text; 15px / 600`, `opacity 1` when ready else `0.35`, `aria-disabled` |
| contact (121–127) | "Or the quick way" 30px / 800. Text 17px "…I'm in Manila; it's {clock} here." Email button `height 56px`, Geist Mono 14px; on tap it copies `aerol.balayon@gmail.com`, then the label slides `translate 0 → -100%` and "Copied ✓" slides `100% → 0%` over `.45s cubic-bezier(.34,1.56,.64,1)`, and it resets after 1800 ms. GitHub and LinkedIn are 52px outlined links (1.5px `#111113`). `.bp-btn:active { scale:.96 }` |
| end (130–135) | "— END OF VOLUME NN —" Geist Mono 12px / .2em, centred `margin auto 0`; optional "Vol. NN · Title →" button when `nextTitle` |
| folio (138) | `absolute; left/right 40px; bottom 20px`; Geist Mono 10.5px `#8b8a84`. Left page reads "`{folio}   {running}`", right page "`{running}   {folio}`" (3 spaces), justified to the outer edge |
| gutter (140) | `46px` strip on the spine side, `linear-gradient(to left` (left page) or `to right` (right page) `, rgba(0,0,0,.16), rgba(0,0,0,0))` |

Volume page lists (M:385–396). Page 0 is the contents page (inside the cover); Vol. 06 has none. If the count is odd, an end page is appended. A folio (`'01'`…) is set for i > 0 except end pages.

| Vol | pages (`all`) | spreads |
|---|---|---|
| 01 | contents, Hello, A photo, High school, College, Why "Aedwon" | 3 |
| 02 | contents, Research first, The optimal choice, Daily kit | 2 |
| 03 | contents + 5 guild pages | 3 |
| 04 | contents + 7 org pages | 4 |
| 05 | contents, Manhwa, Manga, Isekai and fantasy anime | 2 |
| 06 | titleit, write, contact, end | 2 |

So no volume except 06 gets an end page, and Vol. 06's end has no next button. The "next volume" button can't be reached with this data **[as-built]**.

---

## 2. State model

### 2.1 State fields (M:402) and instance fields

| Field | Initial | Meaning |
|---|---|---|
| `tick` | 0 | bumped every rAF to force a re-render (M:408) |
| `screen` | `props.screen` (`'book'` maps to `'shelf'`) | `wall \| index \| project \| shelf \| book` |
| `from` | `'wall'` if starting on project, else `'shelf'` | where project Back returns |
| `pi` | index of `props.project` (fallback 0) | current project |
| `filt` | null | Index kind (null = All, else 0..5 into KINDS[1..6]) |
| `q` | '' | Index search text |
| `vol` | `props.vol \|\| 0` | current volume |
| `sp` | 0 | spread; −1 = closed cover. Spread s = pages 2s (left) and 2s+1 (right) |
| `side` | 'L' | which page the camera sits on |
| `turn` | null | `{from, to, t0, dur, then, x0}` |
| `pan` | null | `{from, t0}` |
| `opening` | null | `{i, t0}` |
| `closing` | null | `{t0}` |
| `kb` | false | keyboard up (book only) |
| `tocOpen` | false | project contents sheet |
| `cur` | 0 | current project section |
| `focus` | 0 | unused |
| `swapAt` | −1e9 | project fade-in start |
| `form` | `{name:'',mail:'',msg:'',title:''}` | Vol. 06 form; it survives closing the book |
| `back0` | undefined | stack fade-in start after closing |
| `this.wf` | undefined | wall fractional index = `scrollTop/180` (not React state, M:497) |
| `this.kbField`, `this.kbDy`, `this.sw` | | keyboard field rect, current lift, swipe start |
| `this.reduced` | matchMedia once on mount (M:407) | |

`busy() = !!(turn || opening || closing || kb)` (M:419). It gates `next`, `prev` and `goPage`, but **not** `panTo`.

### 2.2 Navigation

| Action | Effect (code) |
|---|---|
| `go(screen, extra)` (M:416) | `setState({screen, tocOpen:false, ...extra})` |
| Tab Wall / Index / About | `go('wall')` / `go('index')` / `go('shelf')` |
| Tab Contact | `openVol(5)` (opens Vol. 06 with the full animation) |
| Wall tap on the focused tile, or Index row, or Next project | `openProject(i)` (M:417): `go('project', {pi:i, from: screen==='project' ? from : screen, swapAt: now, cur:0})` and reset the project scroller to `scrollTop=0` |
| Next project | `(pi+1) % 20` in **P order** (includes Writing posts), not wall order |
| Back (project) | `go(from)` (wall or index) |
| Close (book) / "Close and shelve" | `closeBook()` (M:427): `closing={t0}; kb=false;` then `document.activeElement.blur()` |
| Spine tap | `openVol(i)` (M:426): ignored if already opening; sets `screen:'shelf', vol:i, opening:{i,t0}, closing:null, kb:false` |
| end page next-vol | `if vol<5: setState({screen:'shelf'}); openVol(vol+1)` (M:517), with no closing fade |

`tabIdx` (M:488): wall 0, index 1, project (`from==='index'` ? 1 : 0), shelf 2, book (`vol===5` ? 3 : 2). Contact from Wall therefore moves the line to About during the 640 ms morph (the screen is still `shelf`). It switches to 3 on the book screen, by which time the nav is sliding away.

`barY`: `100%` on project and book (nav hidden), else `0px`. The Back button shows on the same two screens.

### 2.3 Book state machine

Per-frame resolution happens at the top of `renderVals` (M:438–442), before anything is drawn:

| Condition | Resolution |
|---|---|
| `turn && (reduced \|\| now−t0 > dur)` | `sp=to; side = to>from ? 'L' : 'R'; pan=null`. If `then && then !== side`: `pan={from: sx(side), t0: now}; side = then` |
| `pan && now−t0 > 450` | `pan=null` |
| `opening && (reduced \|\| now−t0 > 640)` | `screen='book'; vol=i; sp=−1; side='R'; pan=null; turn = reduced ? null : {from:−1, to:0, t0:now, dur:1050, x0:25}`. Reduced: `sp=0; side='L'` |
| `closing && (reduced \|\| now−t0 > 320)` | `closing=null; screen='shelf'; back0=now` |

| Op | Code |
|---|---|
| `next()` (M:423) | if busy, return. If side L: `panTo('R')`. Else if `sp < spreads−1`: `turn(sp+1)` |
| `prev()` (M:424) | if busy, return. If side R: `panTo('L')`. Else if `sp > 0`: `turn(sp−1)`. You can't turn back onto the cover |
| `goPage(i)` (M:425), from the contents page | if busy, return. `s=floor(i/2)`, `side = i%2 ? 'R' : 'L'`. If `s===sp`: `panTo(side)`, else `turn(s, side)`, which can jump several spreads with a single leaf |
| `panTo(side)` (M:421) | no-op if same side; else `side=side; pan={from: camX(), t0: now}` |
| `turn(to, then)` (M:422) | `turn={from:sp, to, t0:now, dur: sp<0 ? 1050 : 900, then, x0: camX()}` |

Page indicator (M:467): during a turn, `pgi = fwd ? 2·to + (then==='R'?1:0) : 2·to + (then==='L'?0:1)`; otherwise `max(0,sp)·2 + (side==='R'?1:0)`. It shows `"{pgi+1} / {all.length}"`, so it reads the destination as soon as the turn starts. `atFirst = sp<=0 && side==='L'`, `atLast = sp>=spreads−1 && side==='R'` (arrow colour `#3a3a42`; the buttons stay enabled).

---

## 3. Animations (exact math)

### 3.1 Wall drum (M:495)

Inputs: `wf = clamp(this.wf||0, 0, 16)` (M:491), `focus = round(wf)`. For tile k: `d = k − wf`, `ad = |d|`.

```js
ang = Math.max(-2.6, Math.min(2.6, d)) * 30;            // degrees
y   = (340 + 390 * Math.sin(ang * Math.PI / 180)).toFixed(1) + 'px';   // drum radius 390, centre 340
rx  = (-ang).toFixed(2);                                 // transform: rotateX(rx deg)
sc  = (1 - 0.08 * ad).toFixed(4);                        // transform: ... scale(sc)
op  = Math.max(0, 1 - 0.5 * ad).toFixed(3);
vis = ad < 2 ? 'visible' : 'hidden';
z   = 20 - Math.round(ad * 4);
```

| d | y | rotateX | scale | opacity | z | visible |
|---|---|---|---|---|---|---|
| 0 | 340.0 | 0° | 1.0000 | 1.000 | 20 | yes |
| ±0.5 | 440.9 / 239.1 | ∓15° | 0.9600 | 0.750 | 18 | yes |
| ±1 | 535.0 / 145.0 | ∓30° | 0.9200 | 0.500 | 16 | yes |
| ±1.5 | 615.8 / 64.2 | ∓45° | 0.8800 | 0.250 | 14 | yes |
| ±2 | 677.7 / 2.3 | ∓60° | 0.8400 | 0 | 12 | no |
| ≥ ±2.6 | 721.5 / −41.5 | ∓78° (clamped) | keeps falling | 0 | | no |

Tile CSS order matters: `translate: 0 -50%` (individual property) is applied **before** `transform: rotateX() scale()`, with the default `transform-origin: 50% 50%` and the parent's `perspective: 900px; perspective-origin: 50% 340px`. No CSS transition: the drum is driven every frame from scrollTop.

Caption opacity (M:499): `max(0.25, 1 − 1.5·|wf − focus|)`. Its text switches at `round(wf)`. Rail widths and colours switch at `focus` and use their CSS .25s transition.

### 3.2 Tab underline and type underline

Both are CSS `translate` transitions: tabs `.55s cubic-bezier(.34,1.3,.64,1)`, kinds `.5s cubic-bezier(.34,1.3,.64,1)` (overshoot). Positions are in §1.2 and §1.4. Tab and kind label colours: `.tbtn` `color .25s ease`.

### 3.3 Nav slide, contents sheet

Nav: `translate 0 ↔ 100%`, `.4s cubic-bezier(.22,1,.36,1)`. Sheet: `translate 110% ↔ 0`, `.4s cubic-bezier(.22,1,.36,1)`.

### 3.4 Project fade-in (M:489)

`cf = reduced ? 1 : out((now − swapAt)/380)`, the opacity of the content column. It restarts on every `openProject` (including Next project). No translate.

### 3.5 Opening a volume (M:482–487, 513, 441)

`ot = now − opening.t0`; `r = stackRect(i)`; target `T = {x:25, y:92, w:340, h:486}` (exactly where the closed cover sits in the book at camX 25).

| Window | What moves | Formula |
|---|---|---|
| 0–140 | chosen spine slides right ("pull") | `pull = out(ot/140)`; spine `translate: 14·pull px 0`. Other spines don't move |
| 100–400 | whole stack (all spines, labels, board) fades | `stk.op = 1 − out((ot − 100)/300)` |
| at 140 | hand-off | chosen spine `opacity 0` when `ot > 140`; morph box mounts (`mo.on = ot > 140`) at `(r.x+14, r.y, r.w, r.h)`, the exact pulled-out spine rect |
| 140–640 | morph box grows | `mk = ease((ot − 140)/500)` (easeInOutCubic). `x,y,w,h = lerp(start, T, mk)` (linear lerp of eased mk), `.toFixed(1)` px |
| | cover content scale | `cs = lerp(r.w, 340, mk)/420` (= current width / 420; at the end 0.8095, the page scale) |
| | spine label fades out | `sop = 1 − cl(mk/0.3)` (gone by mk 0.3) |
| | cover content fades in | `cop = cl((mk − 0.55)/0.45)` (from mk .55 to 1) |
| | shadow | `box-shadow: 0 24px 60px rgba(0,0,0, 0.45·mk)` (ends equal to the page shadow .45) |
| first frame > 640 | becomes the book | screen `book`, `sp −1, side R`, cover turn `{−1 → 0, dur 1050, x0 25}` starts at that frame's `now` |
| 640–1690 | cover opens and camera pans to the left page | §3.6 with `cov = true` |

Morph box DOM (M:270–272): `absolute; left/top/width/height; radius 3px; overflow hidden; background tone; color ink; box-shadow`.
- Cover layer: `absolute; left 0; bottom 0; 420×600; transform-origin 0 100%` (bottom-left anchored); `scale cs; opacity cop`. The box clips it, so early on only the bottom of the cover (title) would show.
- Spine layer: `absolute; inset 0; padding 0 16px; flex; align center; gap 14px; opacity sop`. Number 18px / 800, title 17px / 800 nowrap. Simpler than the shelf spine: no VOL./AEDWON/dividers.

### 3.6 Page turn and cover turn: six-strip curl (M:451–456)

```js
e    = ease((now - tr.t0) / tr.dur);          // dur: 900 page, 1050 cover
fwd  = tr.to > tr.from;  a = fwd ? from : to;  b = fwd ? to : from;
cov  = a < 0;                                  // the cover is turning
ang  = fwd ? -180 * e : -180 * (1 - e);        // hinge angle, deg (0 = lying on right page, -180 = on left page)
lift = Math.sin(Math.PI * e);                  // 0 → 1 → 0
bend = lift * (cov ? 3 : 6.5) * (fwd ? 1 : -1);// per-joint curl, deg
// strip k = 1..6
g_k  = (ang + (k - 1) * bend) * Math.PI / 180;            // cumulative angle of strip k
t1   = `translateZ(${(lift*8).toFixed(2)}px) rotateY(${ang.toFixed(3)}deg)`;
t_k  = `rotateY(${bend.toFixed(3)}deg)`;  // k = 2..6, nested, so the rotations add up
front shade s_k_a = (0.42 * (1 - Math.cos(g_k)) / 2).toFixed(3);   // 0 flat-right → .42 flat-left
back  shade s_k_b = (0.06 + 0.26 * (1 + Math.cos(g_k)) / 2).toFixed(3); // .32 flat-right → .06 flat-left
```

Contents during a turn (M:454): `A` (leaf front) = `cov ? blank : page(2a+1)`, `B` (leaf back) = `page(2b)`, `L` (static left) = `cov ? blank : page(2a)`, `R` (static right) = `page(2b+1)`, `lVis = cov ? hidden : visible`, `leafVis = visible`. When `cov`, the front faces render the **cover**, not A.

When idle (M:460–462): `closed = sp<0`. `isCover=closed`, `B=page(0)`, `L = closed ? blank : page(2sp)`, `R = page(2·max(0,sp)+1)`, `lVis = closed ? hidden : visible`, `leafVis = closed ? visible : hidden`. All `t_k = 'none'` and shades are 0.

Leaf DOM (M:291–310):
- Container: `left 340px` (the spine), 420×600, `transform-origin 0 0; scale 0.8095; preserve-3d`.
- Strip 1: `left 0`, 70×600, `transform-origin 0 50%; preserve-3d; transform t1`.
- Strips 2–6 are **each nested inside the previous strip** at `left 70px`, with the same origin. This is what makes the angles cumulative.
- Each strip has two `.face` children with `inset: 0 -1px 0 0` (1px overlap to the right to hide seams) and `overflow hidden`:
  - Front: content at `left −(k−1)·70px` (0, −70, −140, −210, −280, −350), so each strip shows its 70px slice of a full 420×600 page (BookPage `side="right"`, or the cover). Then `.shade` at opacity `s_k_a`.
  - Back: `transform: rotateY(180deg)`, content at `left −(6−k)·70px` (−350, −280, −210, −140, −70, 0, mirrored), BookPage `side="left"`, then `.shade` at opacity `s_k_b`.
- Leaf pages get no `on-*` handlers (non-interactive).

Derived values at mid-turn (e = 0.5, page): ang −90°, lift 1, translateZ 8px (pre-scale, so 6.48 screen px), bend 6.5°, strip angles −90/−83.5/−77/−70.5/−64/−57.5, total tip curl 32.5° (15° for the cover).

### 3.7 Cast shadow of the turning leaf (M:457–458)

```js
c = Math.cos(ang * Math.PI / 180) * 340;   // projected x of the leaf tip from the spine (book px)
if (c > 0)  castR = (lift*0.9).toFixed(3), castRW = Math.round(c + 50) + 'px';
else        castL = cov ? 0 : (lift*0.9).toFixed(3), castLW = Math.round(-c + 50) + 'px',
            castLX = Math.round(340 + c - 50) + 'px';
```

| Shadow | Element | Gradient |
|---|---|---|
| on the right page (leaf over the right half, ang > −90°) | span inside the right page div (M:288): `left 0; top/bottom 0; width castRW; opacity castR` | `linear-gradient(90deg, rgba(0,0,0,.30), rgba(0,0,0,0))`: dark at the spine |
| on the left page (ang ≤ −90°) | span in book coords (M:289): `left castLX; top 0; width castLW; height 486px; opacity castL` | `linear-gradient(270deg, rgba(0,0,0,.30), rgba(0,0,0,0))`: dark at the spine side (right end) |

Both are 0 when not turning. During the cover turn the left-page shadow is suppressed (the left page is hidden).

### 3.8 Camera: camX (M:428–431)

```js
if (turn) { e = ease((now - turn.t0)/turn.dur); fwd = turn.to > turn.from;
            return turn.x0 + ((fwd ? 365 : 25) - turn.x0) * e; }   // same easing and duration as the leaf
if (pan)  { t = cl((now - pan.t0)/450); e = 1 - Math.pow(1 - t, 3);
            return pan.from + (sx(side) - pan.from) * e; }          // 450 ms easeOutCubic
return sx(side);                                                      // L 365, R 25
```

- Forward turn: the camera moves to 365 (it rides with the leaf onto its back, the new left page). Backward: to 25.
- `x0` / `pan.from` are sampled from `camX()` when the move starts, so interrupting is continuous.
- After a turn with `then` on the other side, a 450 ms pan starts from `sx(side)`.
- Rendered as `left: (camX − 340).toFixed(1) px` on the 680-wide book (no CSS transition).

Example: from reading the right page of spread 0 (camX 25), Next turns spread 0 → 1 over 900 ms while the camera goes 25 → 365. The leaf's back (page 2) ends exactly under the camera.

### 3.9 Page-block thickness (M:465–466)

```js
readF  = Math.max(0, sp) / Math.max(1, spreads - 1);
lEdgeW = (2 + 4*readF).toFixed(1) + 'px';  lEdgeL = -(2 + 4*readF) px;   // grows 2 → 6
rEdgeW = (6 - 4*readF).toFixed(1) + 'px';                                // shrinks 6 → 2
```

It changes only when `sp` commits (at the end of a turn), with no transition, so it steps **[as-built]**. Vol. 04 (4 spreads) gives 2.0/6.0 → 3.3/4.7 → 4.7/3.3 → 6.0/2.0. The left edge is hidden with the left page while closed.

### 3.10 Closing (M:476–477, 442, 483–484)

`cO = out((now − closing.t0)/320)`. Book wrapper `opacity 1 − cO`, `translate 0 (14·cO)px`. After 320 ms: screen `shelf`, `back0 = now`. Stack `opacity = out((now − back0)/380)` (fades in over 380 ms). The book does **not** fly back into the stack.

### 3.11 Keyboard lift

Book stage `translate 0 {dy}` with CSS `.38s cubic-bezier(.22,1,.36,1)`. The sim keyboard uses `translate 0 ↔ 100%` with `.32s cubic-bezier(.22,1,.36,1)`. Formula in §4.4.

### 3.12 Other

- BookPage copy button: two labels, `translate 0/−100%` and `100%/0`, `.45s cubic-bezier(.34,1.56,.64,1)`, auto-revert 1800 ms.
- Press scale `.96` (`.bp-btn:active`, .3s spring).
- Link arrow nudge 3px on hover.
- The head and controls use `opacity .25s` (only while mounted; see §6).

### 3.13 Reduced motion (`prefers-reduced-motion: reduce`, read once on mount)

| Affected (instant) | Still animates **[as-built]** |
|---|---|
| page/cover turn completes on its first frame | pan 450 ms (including the post-turn `then` pan) |
| opening completes on its first frame → `sp 0, side L`, no cover turn, no pull/morph | stack fade-in 380 ms after closing |
| closing completes on its first frame | all CSS transitions (tab/kind underline, nav, sheet, keyboard, lift, colours, BookPage springs) |
| project fade-in (`cf = 1`) | project TOC jump uses `behavior:'smooth'` unconditionally (M:444) |
| wall tap/focus scroll uses `behavior:'auto'` | |

---

## 4. Interaction

### 4.1 Wall

| Input | Behaviour (M:496–497) |
|---|---|
| Scroll | native, `scroll-snap-type: y mandatory`, `scroll-snap-align: center`, `scroll-snap-stop: always` (one item per flick), `scroll-padding-bottom: 164px`. `onScroll: wf = scrollTop/180` |
| Tap tile k | if `k === round(wf)`: `openProject(i)`. Otherwise `scroller.scrollTo({top: k*180, behavior: reduced ? 'auto' : 'smooth'})`, which brings the neighbour to the centre without opening it |
| Keyboard focus on hit k | if not focused: same scrollTo (so Tab walks the drum). Enter on the focused item opens it |

### 4.2 Index

Tapping a kind sets `filt` (All → null). The search box filters live on `name + ' ' + type + ' ' + stack.join(' ')`, lowercased, using `indexOf(q.trim().toLowerCase())`. It does **not** search `topic`. Both filters apply together. Tapping a row calls `openProject`.

### 4.3 Project

- Contents button toggles `tocOpen`.
- A sheet row calls `scroller.scrollTo({top: section.offsetTop − 70, behavior:'smooth'})` and closes the sheet.
- `onScroll`: `cur` = the last section with `offsetTop − 300 <= scrollTop` (`offsetTop` relative to the absolutely positioned scroller).
- `go()` always closes the sheet.

### 4.4 Book

**Swipe** (M:515–516), on the 390×700 stage, `touch-action: pan-y`:
- pointerdown: if `e.target.tagName` is INPUT, TEXTAREA, BUTTON or A, ignore it (`sw=null`). Otherwise record clientX/Y.
- pointerup: `dx, dy`. If `|dx| > 40 && |dx| > 1.4·|dy|`: dx < 0 → `next()`, else `prev()`.
- Uses raw client px, not scaled by the canvas.
- The tag test checks only the direct target: a tap on a `<span>` inside a contents button still records a start **[as-built]**.

**Arrows**: ← `prev()`, → `next()`. **Contents rows**: `goPage(t.page)` with `stopPropagation`.

**Keyboard handling** (M:411–412, 470–475, 479):

| Step | Code |
|---|---|
| focusin (document) | only if the target is inside this root, is INPUT/TEXTAREA, and screen is `book`. `clearTimeout(kbT)`; `k = root.width/390`; `kbField = {top: (r.top − root.top)/k − kbDy, bottom: (r.bottom − root.top)/k − kbDy}` (un-lifted coordinates); `kb = true` |
| focusout | `kbT = setTimeout(() => kb=false, 120)`. Moving between fields cancels it in the next focusin, so the keyboard stays up |
| real keyboard height | `realKb = visualViewport ? max(0, innerHeight − vv.height − vv.offsetTop)/k : 0` (every frame) |
| choose | `useSim = realKb < 80`; `kbH = kb ? (useSim ? 291 : realKb) : 0` |
| lift | `dy = min(0, 844 − kbH − 18 − f.bottom)`; then `if (f.top + dy < 70) dy = min(0, 70 − f.top)`. The field bottom sits 18px above the keyboard, but the field top never goes above y 70 (top bar 56 + 14). `kbDy = dy` |
| while kb | `ctlOp 0`, `ctlPe 'none'` (head + arrows hidden); `busy()` true, so no turns, swipes or contents jumps |
| close / open | `closeBook()` and `openVol()` force `kb=false`; `closeBook()` also blurs |

Sim keyboard (M:321–325): `absolute; bottom 0; height 291px; padding 10px 3px 0; bg #1e1e21; flex column; gap 11px; translate 0 {0px if kb && useSim else 100%}; visibility {useSim ? visible : hidden}`.
- Row 1: 10 keys, gap 6.
- Row 2: 9 keys, padding 0 18px.
- Row 3: 44px mod + 7 keys (inner padding 0 8px) + 44px mod.
- Row 4: 92px + space (flex) + 92px.
- Keys are `height 42px; radius 5px`, `#46464b` (letters) or `#313135` (mods).

**Vol. 06 form** (M:519–521, BP:113–116, 160):
- `setField(k, val)` stores name/mail/msg/title.
- `ready = name.trim() && msg.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail.trim())`.
- "Close and shelve" calls `shelve` → `form.msg = ''` then `closeBook()`. It runs **even when not ready**, since only `aria-disabled` and opacity .35 mark it **[as-built]**. Nothing is sent.
- The form (name/mail/title) persists across closes.

### 4.5 Accessibility labels (all from source)

| Element | Attribute |
|---|---|
| Drum, rail, morph, leaf, edges, cast shadows, sim keyboard | `aria-hidden="true"` |
| Wall hit | `aria-label="{name}, {type}"` |
| Wall caption | `aria-live="polite"` |
| Kind group | `role="group" aria-label="Show a type"`; buttons `aria-pressed` 'true'/'false', `aria-label` kind name |
| Find | visually hidden label text "Find a project" (clip technique, M:112) |
| Stack logos | `role="img" aria-label={logo title}` |
| Detail rows | visually hidden "{Label}: " prefix |
| Contents | `aria-label="Contents" aria-expanded`; sheet `aria-hidden` 'true'/'false' |
| Spines | `aria-label="Volume NN: Title"` |
| Book arrows | "Previous page" / "Next page" |
| Nav | `<nav aria-label="Main">`; tabs `aria-current="page"` (else `"false"`) |
| BookPage | title input `aria-label="Title this volume"`; other fields wrapped in `<label>`; shelve `aria-disabled`; "Copied ✓" `aria-live="polite"`; arrows `aria-hidden` |

---

## 5. Design-canvas stand-ins vs production

| Stand-in (canvas) | Production behaviour |
|---|---|
| Simulated keyboard drawn when `realKb < 80` (M:471, 479) | Remove it. Use `visualViewport` height only; keep the lift formula with the real `kbH` and the real viewport height in place of `844`. Note the threshold would also show the fake keyboard on a hardware-keyboard device |
| `screen="book"` boards auto-open the volume after 700 ms (M:404, 409) | Deep link to a volume: decide between showing the shelf or opening directly; not specified by source |
| Props `screen` / `project` / `vol` | Routes |
| `uid` + `document.querySelector('[data-mob=…]')` / `[data-mscroll=…]` / `getElementById(uid+'s'+i)` | refs |
| `k = root.width/390` canvas scale correction (M:411, 470) | 1 at native size; keep it if the frame is ever scaled |
| rAF loop calling `setState` every frame forever (M:408) | Run rAF only while a turn, pan, opening, closing, stack fade or project fade is active, or drive the drum from scroll events. The math must stay frame-time based (`performance.now()`), not tick based |
| `this.state.x = …` mutations inside render (M:439–442) | Do these in a reducer or effect at frame time, with the same order: turn → pan → opening → closing |
| Clock `toLocaleTimeString('en-US', {timeZone:'Asia/Manila', hour:'numeric', minute:'2-digit'})` (M:518) | same (live) |
| "Close and shelve" only clears the message | real submit (endpoint not in source) |
| GitHub/LinkedIn hrefs `https://github.com/`, `https://linkedin.com/`; bracketed placeholder copy | real content |
| Fixed 390×844 artboard; absolute positions (stack at 297–652, book top 92, controls 612, caption bottom 96) | Source defines only 390×844. Other viewport sizes are not specified |

---

## 6. Gotchas that cause drift

1. **Individual transform properties.** The source mixes `translate:` / `scale:` with `transform:` (wall tiles, pages, leaf, morph cover). The browser applies them as translate → rotate → scale → transform. If you collapse them into one `transform`, write it as `translate(...) rotateX(...) scale(...)` in that order. The page scale `0.8095` uses `transform-origin: 0 0`; the morph cover uses `0 100%`.
2. **preserve-3d flattening.** `transform-style: preserve-3d` must stay on the book (M:282), the leaf container and **every strip** (M:291–307). Do not put `overflow:hidden`, `opacity < 1`, `filter`, `clip-path` or `will-change: opacity` on the leaf container or any strip, or the curl collapses into a flat plane. `overflow:hidden` is allowed only on the `.face` elements (leaves of the 3D tree). The closing fade puts `opacity` on the outer wrapper (M:279), which is an ancestor of the perspective element and is fine. Don't move it lower.
3. **Strip nesting.** Strips 2–6 are children of the previous strip at `left:70px`, which makes each `rotateY(bend)` relative. Siblings with absolute angles would need `ang + (k−1)·bend` per strip and different origins.
4. **Seams.** Faces use `inset: 0 -1px 0 0` (71px wide over 70px strips). Without the 1px overlap, hairline gaps flicker at strip joints during the curl.
5. **Back-face slicing is mirrored.** Back content offsets are `−(6−k)·70`, not `−(k−1)·70`. The back face is `rotateY(180deg)` and shows a `side="left"` page.
6. **`translateZ(lift*8px)`** lives on strip 1 *inside* the 0.8095-scaled leaf, so it renders at about 6.5px. It prevents z-fighting with the static right page at the start and end. Keep it.
7. **Camera and leaf share one clock and one easing.** camX during a turn uses the same `ease(t/dur)` as the leaf. Using a CSS transition for `left` would desync them. Pan is a separate easeOutCubic over 450 ms.
8. **Turn duration.** Cover 1050 ms, pages 900 ms. `turn()` picks 1050 when `sp < 0`; the opening hard-codes `dur: 1050, x0: 25`.
9. **Morph hand-off.** Morph start `x = r.x + 14` matches the fully pulled spine at exactly 140 ms. The morph end `{25,92,340,486}` equals the closed cover at camX 25 in the book (book top 92, spine at 340, 340 wide). The leaf is 600·0.8095 = 485.7 tall vs 486 for the morph. The end shadow (.45) equals the page shadow. Change any of these and the swap pops.
10. **Mount-time transitions don't play.** The book head and controls have `transition: opacity .25s` but mount with opacity 1 when the screen becomes `book`, so they appear instantly. Likewise the TOC sheet and wall rail start in their final state.
11. **iOS focus zoom.** iOS zooms on focus when an input's font-size is < 16px. The Index field is exactly `16px` for this reason. The book fields are `18px` (the title is 40px) in CSS but render at ×0.8095 (about 14.6px). Verify on device that no zoom occurs, and keep `font-size ≥ 16px` on the unscaled element whatever you do. Without a zoom-locking meta, an accidental zoom breaks the visualViewport lift maths.
12. **visualViewport maths.** `innerHeight − vv.height − vv.offsetTop` must be re-read every frame (the keyboard animates). `kbField` is captured once on focusin, minus the current `kbDy`. If focus moves while the .38s lift transition is mid-flight, the measured rect includes a partial translate and the result is slightly off **[as-built]**.
13. **Focus off-camera.** Tabbing to a field on the page the camera is not on (e.g. title on the left → name on the right in Vol. 06) does not pan **[as-built]**. Inputs in leaf faces are rendered too; they are hidden by `visibility` only when the leaf is hidden.
14. **Wall scroll restore.** `this.wf` persists when you leave the wall, but the scroller remounts at `scrollTop 0`. Returning from a project shows the previous project centred until the first scroll event snaps `wf` back near 0 **[as-built, likely bug]**. Production should restore `scrollTop = wf·180` on mount (or store wf in state).
15. **TOC sheet covers its own toggle.** The sheet (bottom 0, 18 + 48·n + 30 px tall; 336px for Pantas) overlays the 48px square at bottom 26. There is no scrim and no outside-tap close; it closes on a row tap, Back, or any `go()` **[as-built]**. Its buttons stay in the tab order while translated off-screen (only `aria-hidden`).
16. **Edge thickness steps** at the end of each turn (no interpolation) **[as-built]**.
17. **Rounding.** Values are stringified with `toFixed` (y 1 dp, rx 2, scale 4, opacity 3, angles 3, translateZ 2, book left 1). The tile height uses `Math.round`. Match these if you snapshot-test against the canvas.
18. **`c > 0` branch.** At exactly ang = −90°, `cos` is 6e−17 > 0, so the right-page shadow (width 50) is used for that frame.
19. **Next project order** is P order (20 items, including the three Writing posts), not wall order.
20. **Media blocks** are 520px-wide illustrations scaled by `min(W/520, H/HH[media])` and centred with `translate −50% −50%` from `left/top 50%`; the heights per media are in §1.3. The tile and row containers clip with `overflow:hidden`; the hero does not round-clip.
