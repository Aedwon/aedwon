# WallIndex2: Wall, Fold and Index implementation spec

Source: `reference/components/WallIndex2.dc.html` (680 lines). Line references are `L<n>` in that file unless another file is named.
The light variant is `WallIndex2Light.dc.html`; see section 5.

**Approved configuration** (as Room mounts it, `Room.dc.html:26`):

```html
<dc-import name="WallIndex2" bare="{{ true }}" on-open="{{ openProject }}" dim="{{ cam.dim }}" wall-color="{{ amb.wall }}"
  shadow="{{ amb.shadow }}" on-focus="{{ onFocus }}" view="wall" motion="swap" view-req="{{ viewReq }}" on-peek="{{ onPeek }}" hint-size="1440px,900px">
```

So: `bare = true`, `view = "wall"` (start on the wall), `motion = "swap"`, `mode` = default `"follow"`. Document scope:

- **Not approved, mentioned only:** `motion: "slide"` and `"cascade"`, `mode: "soft"` and `"overview"`. See 3.13.
- **Dead code, kept for faithfulness:** `shadow` is never used (`this.props.shadow && false`, L555). `pvp = 0`, `lift = 0` (L541, L545). The `ghost` / `pv` spring has no consumer in the template. `ixMask` and `tileMask` are always `'none'` (L631).

All coordinates are in a fixed **1440 × 900** frame. The host scales the frame. Pointer math converts client pixels with `scale() = 1440 / root.getBoundingClientRect().width` (L394).

---

## 1. Structure, layout and z-order

### 1.1 Root (L52)

| Property | Value |
|---|---|
| size | `width: 1440px; height: 900px; position: relative; overflow: hidden` |
| background | `rootBg` = `bare ? 'transparent' : '#0a0a0c'` (L629). Transparent in Room |
| color / font | `#EDEDED`; `'Geist', system-ui, sans-serif`; `-webkit-font-smoothing: antialiased` |
| 3D | `perspective: 2200px; perspective-origin: 50% 45%`. The origin is (720, 405) |
| touch-action | `idx ? 'pan-y' : 'none'` (L632) |
| user-select | `idx ? 'auto' : 'none'` |
| cursor | `idx ? 'auto' : (drag.moved ? 'grabbing' : 'default')` (L633). There is no `grab` cursor at rest |
| events | `onPointerDown/Move/Up/Leave/Cancel` (Leave and Cancel both map to `up`), `onMouseMove=lean`, `onMouseLeave=unlean`. A non-passive `wheel` listener is added in `componentDidMount` (L360) |

`idx` is `this.state.view === 1`. It flips immediately on a request. The animated value is `this.k` (see 3.1).

### 1.2 Z-order

There are no z-index values. Paint order is DOM order, and every layer is `position: absolute`:

| # | Layer | Lines | Box | pointer-events |
|---|---|---|---|---|
| 1 | `.ix` index scroller (group headings, rows, empty text) | L55–83 | `inset: 0`, `overflow-y: auto`, `scroll-padding-top: 180px`, scrollbar hidden (L44–45) | `ixPe = k > 0.5 ? 'auto' : 'none'` (L634) |
| 2 | Preview panel | L86–138 | `left: 1060px; width: 300px; top: 0` | `none` |
| 3 | Tiles layer (`transform-style: preserve-3d`) | L141–187 | `inset: 0` | layer `none`; each tile `t.pe` |
| 4 | Frozen header band | L190–229 | `left: 0; top: 0; width: 1040px; height: 240px` | `ixPe` |
| 5 | Caption (wall) | L232–236 | `left: 56px; bottom: 52px` | `none` |
| 6 | Tick rail | L239–246 | `right: 40px; top: 50%; translate: 0 -50%` | `rail.pe` |
| 7 | Zoom button (overview mode only, not rendered in the approved path) | L249–251 | `right: 40px; bottom: 40px` | — |
| 8 | Own nav (`visibility: hidden` when `bare`, so hidden in Room) | L254–266 | `top: 0; height: 84px` | — |

**Key consequence:** the tiles (layer 3) paint **above** the rows (layer 1) and **below** the frozen band (layer 4). In Index the tiles *are* the row thumbnails, sitting in the empty first grid column. When the list scrolls, the thumbnails slide under the band like the rows do.

### 1.3 Index rows (L68)

| Property | Value |
|---|---|
| element | `<a class="row">`, absolute, `left: 100px; width: 920px; top: 0; height: 60px; padding: 0 20px; border-radius: 8px` |
| grid | `grid-template-columns: 80px minmax(0, 1fr) 170px 230px 24px; column-gap: 32px; align-items: center` |
| transform | `translate(r.x, r.y) perspective(700px) rotateX(r.rx)` with `x = '0px'` and `rx = '0deg'` always. Only `y` varies |
| transform-origin | `50% 0` |
| bottom hairline | span `left: 20px; right: 20px; bottom: 0; height: 1px; background: #1c1c22; transform-origin: 0 50%; scale: r.line 1` (L77) |

Column x positions, absolute in the frame. The content box runs x = 120…1000 (100 + 20 padding). The 1fr column is 880 − (80+170+230+24) − 4·32 = **248px**.

| Column | Width | x start | x end | Content |
|---|---|---|---|---|
| 1 thumbnail (empty `<span>`, L69) | 80 | 120 | 200 | tile lands here, centre x = **160** |
| 2 name | 248 | 232 | 480 | 17px/500, ellipsis |
| 3 type | 170 | 512 | 682 | 20px icon + mono label (hover reveal) |
| 4 stack | 230 | 714 | 944 | logos (gap 14) + mono text |
| 5 arrow | 24 | 976 | 1000 | `→`, right-aligned |

The column heads (L219) use the **same grid** at `left: 120px; width: 880px; top: 196px; height: 30px`, so they align exactly. The empty-state text (L81) sits at `left: 232px; top: 262px`, which is the name column.

Vertical metrics:

| Constant | Value | Source |
|---|---|---|
| `R0` (first row top, in scroll content) | 240 | L506 |
| row pitch | 60 (`yy += 60`) | L442 |
| group heading height | 58 (`yy += 58`) | L442 |
| gap before 2nd+ group heading | 22 (`if (yy > 0) yy += 22`) | L442 |
| scroll content height `ixH` | `R0 + ixTotal + 140` | L603 |
| row centre used for thumbnail / preview | `R0 + rs[i].y + 30 - scrollY` | L540, L588 |

Group heading (L60–63): `left: 120px; width: 880px; height: 58px; padding: 0 0 12px 112px` with flex `align-items: flex-end`. The text therefore starts at x = 232, the name column. Its underline runs from `left: 112px` to `right: 0` (`#2a2a31`, 1px) with `scale: g.op 1`.

### 1.4 Frozen header band (L190–228)

| Element | Position | Notes |
|---|---|---|
| band | `left 0, top 0, 1040×240`, `background: bandBg` (= wallColor), `opacity: hdr` | the wall colour, so it reads as cut from the wall |
| inner wrapper | `inset: 0; translate: 0 hdrY` | drift |
| type filter row | `left: 120px; right: 40px; top: 112px; height: 56px; opacity: hdr` | **opacity applied twice, so effective hdr²** |
| kind buttons | flex `gap: 14px`, each `64×56`, so the pitch is **78px** | 7 buttons (All + 6 kinds) take x = 0…532 inside the row |
| kind underline | `left: 0; top: 50px; width: 26px; height: 1.5px; #EDEDED; radius 1px; translate: kindX 0` | `kindX = (filt == null ? 0 : filt + 1) * 78 + 'px'` (L602) |
| kind name slot | `left: 548px; top: 0; 260×56; overflow: hidden` | the labels stack here, one visible |
| query display | `inset: 0`, flex baseline, gap 20 | replaces the filter row while typing |
| "type to find" hint | `right: 0; top: 22px` | mono 12 `#61616A` |
| column heads | `left: 120px; width: 880px; top: 196px; height: 30px; opacity: hdr` | **effective hdr²** |
| fade strip | `left 0, right 0, top: 240px, height: 20px; background: linear-gradient(wc, wc00)` (L630) | below the band, also translated by hdrY |

### 1.5 Preview panel (L86–138)

| Property | Value |
|---|---|
| outer | `left: 1060px; width: 300px; top: 0; transform: translateY(pvp.y) scale(pvp.s); transform-origin: 0 50%; opacity: pvp.op`, `aria-hidden` |
| media box | `300 × ph`, `transition: height .35s cubic-bezier(.22,1,.36,1)`, `ph = Math.round(H[media] * 0.5769)` (L586) |
| each media | absolute, width 520, `transform-origin: 0 0; scale: 0.5769` (300/520), `opacity: v.pop`, `visibility: v.vis` |
| caption | `margin-top: 18px`, column, `gap: 6px`: name 20/600 −0.02em, then line 14px/1.5 `#A1A1AA` |

### 1.6 Media tile templates and the H table

Each tile is a 520-wide block. Its height is the template's height, which is the **H table** (L281):

```js
this.H = { phone: 370, tv: 330, web: 325, discord: 325, term: 300, data: 300, repo: 260, paper: 300 };
```

| media | H | Template (tile L145–184, preview copy L91–130) |
|---|---|---|
| phone | 370 | 3 phones `156×330`, gap 18, centred. Shell `padding 5, radius 28, #050506, border 1px #2e2e35`. Outer two `translate: 0 12px`, middle `0 -12px`. Screen `radius 23, #131317`, placeholder `[screen n]` mono 12 `#8A8A93`. Notch `44×13` at top 7, radius 99, `#000` |
| tv | 330 | screen `520×301, padding 10, radius 10, #050506, border #2e2e35`, inner radius 2 `#131317` `[name screen]`. Neck `26×12 #141418`. Foot `150×8, radius 4 4 2 2, #1c1c21` |
| web | 325 | `radius 12, overflow hidden, border 1px #26262c, bg #0f0f12`. Bar 20h, padding 0 10, gap 5, 3 dots `6×6 #2c2c32`, `border-bottom #1c1c22`. Body `#131317` `[name screenshot]` |
| discord | 325 | `radius 10, border #26262c`. Server rail 48w `#0d0d10` (pad-top 12, gap 8; 30×30 icons: first radius 10 `#2c2c34`, others round `#1e1e24`). Channel list 124w `#121215` (pad 16 12, gap 10; bars 7/6 h at 70/80/60/75/55 %, `#2c2c34` / `#1f1f25`). Main `#17171b` `[name in Discord]` |
| term | 300 | `radius 10, border #26262c, bg #08080a`. Bar 24h with dots, `border-bottom #18181c`. Body `padding 18 20`, mono 13, lh 1.8, `#8A8A93`, `$` in `#4ade80`, block cursor `8×15 #8A8A93` |
| repo | 260 | `radius 10, border #26262c, bg #0f0f12, padding 26 28, column gap 14`. Book icon 16 stroke `#8A8A93` + `p[3]` mono 14 `#EDEDED`. Desc `p[6]` 15/1.6 `#A1A1AA`. Footer `[your PR or contribution]` mono 12 `#8A8A93` with `border-top #1c1c22`, `margin-top: auto; padding-top 14` |
| data | 300 | `radius 10, border #26262c, bg #131317`, `[name results]` |
| paper | 300 | `padding 34 36 30, radius 3, bg #ECEBE6, color #111113, column gap 12`. Date mono 12 `#61616A`. Title 25/700 −0.03em lh 1.12. Desc 14.5/1.55 `#3f3f46`. `Read · {mins}` 13 `#61616A` (margin-top auto) |

Thumbnail scale when a tile becomes a row thumbnail (L539): `sl = Math.min(80 / 520, 50 / hh)`. The tile fits in an 80×50 box.

| media | sl | thumb w × h (at vs = 1) |
|---|---|---|
| phone | 50/370 = 0.13514 | 70.3 × 50 |
| tv | 50/330 = 0.15152 | 78.8 × 50 |
| web, discord | 80/520 = 0.15385 | 80 × 50 |
| term, data, paper | 0.15385 | 80 × 46.2 |
| repo | 0.15385 | 80 × 40 |

### 1.7 Caption (L232–236)

`left: 56px; bottom: 52px`, column, `gap: 6px`, `aria-live="polite"`:

- counter: mono 12.5 `#8A8A93`, for example `"01 / 17"`
- name: 30/600, −0.03em
- type: 15px `#A1A1AA`

### 1.8 Tick rail (L239–246)

- Rail: `right: 40px`, vertically centred, flex column aligned right.
- One button per wall project, 17 in total (`P.slice(0, NW)`). Each button is `56w × 44h`, so the rail is 748px tall and spans y = 76…824.
- Line: `height: 1.5px; radius 1px; width: k.w; background: k.c`.
- Name label: `right: 64px`, 13px `#EDEDED`, starts at `opacity: 0; translate: 6px 0`.

### 1.9 Nav (hidden under `bare`, L254–266)

Documented for completeness:

- Bar: 84px tall, `padding 0 56px`, `rgba(10,10,12,0.72)` with `backdrop-filter: saturate(180%) blur(20px)`, `opacity: ui`.
- Brand "Aedwon" 16/600.
- View toggle: two `64×44` buttons. Indicator `28×1.5` at `bottom: 6px`, `translate: idx ? '82px' : '18px'`, `transition: translate .55s cubic-bezier(.34,1.56,.64,1)`.
- 1px × 16px divider `#2a2a30`. About/Contact `.nlink` links. Gap 36, 14px text.

---

## 2. Data model and layout math

### 2.1 `P` (L282–303)

Each entry is `[id, name, type, stack, media, href, desc?]`:

| i | id | name | type (p[2]) | stack (p[3]) | media (p[4]) | href | p[6] |
|---|---|---|---|---|---|---|---|
| 0 | pantas | Pantas | Mobile app | Flutter · Firebase · SQLite | phone | Pantas.dc.html | — |
| 1 | msl | MSL Network Bot | Discord bot | Python · MySQL | discord | # | — |
| 2 | lakambini | Lakambini | Website redesign | [stack] | web | # | — |
| 3 | agent | AI Agent Config | Developer tooling | Python · Markdown · YAML | term | # | — |
| 4 | kiosk | Kiosk Survey | Android TV | Flutter · Firebase | tv | # | — |
| 5 | pso | PSO Scorer | Data system | Python · pandas · NumPy | data | # | — |
| 6 | qr | QR Studio | Web tool | TypeScript · Vite · Tailwind | web | # | — |
| 7 | webp | WebP Unli | Web tool | Next.js · TypeScript · wasm-vips | web | # | — |
| 8 | norala | Norala SB Portal | Civic tech | Next.js · TypeScript · Tailwind | web | # | — |
| 9 | cup | MSL Collegiate Cup Bot | Discord bot | Python · Sheets | discord | # | — |
| 10 | ilocos | Ilocos Sur Esports Bot | Discord bot | Python · MySQL | discord | # | — |
| 11 | oppo | OPPO Cup Bot | Discord bot | Python · MySQL | discord | # | — |
| 12 | kqm | KQM Team DPS Calculator | Web tool | JavaScript · Vite | web | # | — |
| 13 | aspire | Microsoft Aspire | Open source | microsoft/aspire | repo | https://github.com/microsoft/aspire | yes |
| 14 | opensre | OpenSRE | Open source | Tracer-Cloud/opensre | repo | github… | yes |
| 15 | dockroute | DockRoute | Open source | Dockroute/Dockroute | repo | github… | yes |
| 16 | bettergov | BetterGov PH | Open source | bettergovph/bettergov | repo | github… | yes |
| 17 | w1 | [On building Pantas offline-first] | Writing | Pantas · offline-first | paper | # | — |
| 18 | w2 | [What 8 hours without internet taught me] | Writing | Kiosk Survey · events | paper | # | — |
| 19 | w3 | [Scoring 4,000 Olympiad competitors] | Writing | PSO Scorer · data | paper | # | — |

Derived values:

- `N = 20`.
- `NW = P.filter(p => p[4] !== 'paper').length = 17` (L305). Writing appears in the Index only. The posts **must stay last** in `P`, because the rail uses `P.slice(0, NW)`.
- `POST` (L306): `{w1:{date:'[Month DD, YYYY]', mins:'[6] min'}, w2:{…'[4] min'}, w3:{…'[5] min'}}`.
- `DESC` (L307) is a 20-entry array indexed by `i`, used for the preview line: `DESC[pl] || P[pl][6] || '[What ' + name + ' does, in one line.]'` (L611).
- The tile/preview `desc` field is `p[6] || ''` (L553). **The paper template therefore shows an empty description**, because posts have no `p[6]`. The `DESC` text is only used in the preview caption line.

### 2.2 KIND, icons and logos

`KIND` (L309–316):

| gi | label | types | count | KINDICON |
|---|---|---|---|---|
| 0 | Apps | Mobile app, Android TV | 2 | phone |
| 1 | Bots | Discord bot | 4 | bot |
| 2 | Web | Website redesign, Web tool, Civic tech | 5 | web |
| 3 | Tools | Developer tooling, Data system | 2 | term |
| 4 | Open source | Open source | 4 | repo |
| 5 | Writing | Writing | 3 | pen |

Lookups:

- `kindOf[i] = KIND.findIndex(g => g.types.indexOf(P[i][2]) >= 0)` (L333).
- The "All" button uses icon `all` and count `N = 20` (L583).

Icons and stack parsing:

- `ICON` (L318) holds 24-viewBox stroke paths. `TYPEICON` (L319) maps each type to an icon key.
- All icons render with `fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap/linejoin="round"`.
- `LOGO` (L322) holds Simple Icons paths: `{t, d, c (brand colour), vb, w, h}`. All are 18×18 with `0 0 24 24`, except **MySQL**, which is `w 46, h 13, vb "-0.2 12.6 22.4 6.2"`.
- `stackOf` (L323–328) works like this:

```js
if (p[4] === 'repo') return { logos: [this.LOGO.GitHub], text: p[3] };
if (p[3].indexOf('[') === 0) return { logos: [], text: p[3] };
const parts = p[3].split(' · ');
return { logos: parts.map((n) => this.LOGO[n]).filter(Boolean), text: parts.filter((n) => !this.LOGO[n]).join(' · ') };
```

Every named tech has a logo, so most rows show logos only. Lakambini shows `[stack]`. Repos show the GitHub mark plus the path. Posts show `"Pantas · offline-first"` and similar as text.

### 2.3 Index ordering, filtering and layout (L433–443)

```js
const hay = (i) => (P[i][1] + ' ' + P[i][2] + ' ' + P[i][3] + ' ' + KIND[kindOf[i]].label).toLowerCase();
const match = (i) => (this.filt == null || kindOf[i] === this.filt) && (!q || hay(i).indexOf(q) >= 0);
const order = P.map((_, i) => i);
if (this.sort === 'name') order.sort((a, b) => P[a][1].localeCompare(P[b][1]));
if (this.sort === 'type') order.sort((a, b) => kindOf[a] - kindOf[b] || a - b);
const vis = order.filter(match); this.visNow = vis;
...
vis.forEach((i) => { if (this.sort === 'type' && kindOf[i] !== lastK) { lastK = kindOf[i]; if (yy > 0) yy += 22; gy[lastK] = yy; gOn[lastK] = vis.filter((j) => kindOf[j] === lastK).length; yy += 58; } ty[i] = yy; yy += 60; });
```

Notes:

- `sort` is one of `'featured'` (P order, the default), `'name'` or `'type'`.
- `q = this.q.trim().toLowerCase()`.
- The change signature is `sig = sort + '|' + filt + '|' + q` (L444). **Every keystroke is a re-sort event.**

### 2.4 Wall layout (L336–347)

```js
const cols = [[0, 13, 1, 7, 15, 5], [2, 14, 3, 9, 16, 6], [4, 8, 10, 12, 11]], gap = 48;
cols.forEach((list, c) => {
  const total = list.reduce((a, i) => a + this.H[this.P[i][4]], 0) + gap * (list.length - 1);
  let y = 450 - total / 2 + [70, 20, 0][c];
  list.forEach((i) => { const h = this.H[this.P[i][4]]; this.bp[i] = { x: 720 + (c - 1) * 568, y: y + h / 2 }; y += h + gap; });
});
for (let i = 0; i < this.N; i++) if (!this.bp[i]) this.bp[i] = { x: 720, y: 99999 };
const ys = this.bp.filter((b) => b.y < 90000).map((b) => b.y);
this.minY = Math.min(...ys) + 60; this.maxY = Math.max(...ys) - 60; this.midY = (this.minY + this.maxY) / 2;
this.O = [720, 470]; this.ax0 = 34; this.az0 = -18;
this.cy = this.minY + 140; this.tCy = this.cy; this.vel = 0;
```

Computed values. `bp` is the tile **centre** in wall-plane coordinates.

| col | x | total | start y | tiles (i: media, centre y) |
|---|---|---|---|---|
| 0 | 152 | 2080 | −520 | 0 phone −335 · 13 repo 28 · 1 discord 368.5 · 7 web 741.5 · 15 repo 1082 · 5 data 1410 |
| 1 | 720 | 2035 | −547.5 | 2 web −385 · 14 repo −44.5 · 3 term 283.5 · 9 discord 644 · 16 repo 984.5 · 6 web 1325 |
| 2 | 1288 | 1822 | −461 | 4 tv −296 · 8 web 79.5 · 10 discord 452.5 · 12 web 825.5 · 11 discord 1198.5 |

| Constant | Value |
|---|---|
| `minY` | −385 + 60 = **−325** |
| `maxY` | 1410 − 60 = **1350** |
| `midY` | **512.5** |
| initial `cy = tCy` | minY + 140 = **−185** |
| projection origin `O` | (720, 470) |
| base tilt | `ax0 = 34°`, `az0 = −18°` |
| posts (17–19) | `bp = {x: 720, y: 99999}`. Unused: the tile pose overrides them to (160, 2400), opacity 0 |

---

## 3. Animations

### 3.0 Loop and integration conventions (L363–391)

One `requestAnimationFrame` loop recomputes everything, then calls `setState({tick})`:

```js
const dt = Math.min(0.05, (now - this.last) / 1000); this.last = now;
```

- **dt is clamped to 50ms.**
- All springs use **semi-implicit Euler**. Velocity is updated first, then position uses the new velocity: `v += ((target - x) * K - v * D) * dt; x += v * dt;`.
- Unit mass. Damping ratio ζ = D / (2√K).
- "Exp-approach" means `x += (t - x) * Math.min(1, dt * rate)`.
- Clock: `T = reduced ? 99 : (now - t0) / 1000`, where `t0` is reset at mount (L357, L428).

Helpers (L422–425), used everywhere:

```js
const cl = (x) => Math.max(0, Math.min(1, x));
const ease = (x) => { x = cl(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }; // easeInOutCubic
const out = (x) => 1 - Math.pow(1 - cl(x), 3);                                                       // easeOutCubic
const lerp = (a, b, t) => a + (b - a) * t;
```

Reduced motion is `matchMedia('(prefers-reduced-motion: reduce)')`, read once at mount. When it is set:

- `k` snaps to `kt`.
- The camera follow factor is 1.
- `zl` snaps.
- `T = 99`, so every intro is complete.
- `dts = 0`, so row, preview and visibility springs snap.
- Tile springs `su` reset every frame (L536).

### 3.1 View progress `k` (Wall = 0, Index = 1): linear, 1.5s (L366–368)

```js
const dir = Math.sign(this.kt - this.k);
if (this.reduced) this.k = this.kt;
else if (dir) { this.k += dir * dt / 1.5; if ((dir > 0 && this.k > this.kt) || (dir < 0 && this.k < this.kt)) this.k = this.kt; }
```

`k` is **linear in time**: 1.5s for a full fold either way. All fold easing is derived from `k`. Below, "t" means seconds since `k` started moving, so `k = t / 1.5`.

### 3.2 Requests: `viewReq`, `toIndex`, `toWall` (L623, L638, L641)

`viewReq` is a string such as `'index#7'`, `'wall#8'`, `'index!#9'` or `'wall!#10'`. Room appends `'#' + counter` so a repeat request is a new value (`Room.dc.html:119`). Room adds `!` when the camera is away (`Room.dc.html:120`). L623:

```js
if (vr && vr !== this.lastReq) { this.lastReq = vr; const v0 = vr.split('#')[0], want = v0.replace('!', '') === 'index' ? 1 : 0;
  if (want !== this.kt || (want === 1 && this.leaving)) { const instant = v0.indexOf('!') >= 0; this.leaving = false;
    if (want === 0 && this.kt === 1 && this.k > 0.5 && !instant) this.leaving = true; else this.kt = want;
    this.ih = null; this.vel = 0;
    if (instant) { this.kt = want; this.k = want; this.su = {}; this.hr = want; }
    this.setState({ view: want, hover: null }); } }
```

- **To Index:** `kt = 1` at once. The fold starts the same frame.
- **To Wall from Index (k > 0.5, not instant):** `leaving = true`. `kt` stays 1 until the header has faded (3.6), then `kt = 0`.
- **`!` (instant):** the view switches with no fold. `su = {}` resets the tile springs and `hr` snaps.

### 3.3 Wall pose and camera (L507–513)

```js
const pp = ease(k / 0.8);
const dm = Math.max(0, Math.min(1, +this.props.dim || 0)), dme = dm * dm * (3 - 2 * dm);
const ax = lerp(this.ax0 - this.ms.y * 3 + (1 - zl) * -10, 0, pp) + 46 * dme,
      ay = lerp(this.ms.x * 3, 0, pp),
      az = lerp(this.az0 + (1 - zl) * 8, 0, pp),
      S  = lerp(lerp(0.52, 0.9, zl), 1, pp);
const rot = (x, y, z) => { const x1 = cz * x - sz * y, y1 = sz * x + cz * y; const x2 = cy_ * x1 + sy * z, z2 = -sy * x1 + cy_ * z; return [x2, cx * y1 - sx * z2, sx * y1 + cx * z2]; };
const camY = lerp(this.midY, this.cy, zl);
```

In the approved path `zl = 1` (zoom is overview-only). At rest on the wall that gives **ax = 34° − 3·ms.y, ay = 3·ms.x, az = −18°, S = 0.9**, and camY = cy.

- **Flatten:** `pp` eases in-out-cubic over k ∈ [0, 0.8], which is t ∈ [0, 1.2s]. At pp = 1 the angles are 0 and S = 1.
- **`dim` prop** (Room, walking down to the shelf): adds up to **+46° of X tilt**, smoothstepped. It also fades out the caption and rail through `chromeK = 1 - cl(dim * 6)` (L594).
- **`rot`** applies Z, then Y, then X to a point. The CSS on each tile mirrors this with `rotateX(ax) rotateY(ay) rotateZ(az + r)`.

**Mouse lean (parallax).** `lean` sets `m` to the pointer position in −1…1 over the root (L645). `unlean` resets it to 0. Smoothing is **per frame, not per dt** (L365):

```js
this.ms.x += (this.m.x - this.ms.x) * 0.05; this.ms.y += (this.m.y - this.ms.y) * 0.05;
```

The effect is ±3° of ay and ∓3° of ax. It fades to 0 with `pp` in Index.

### 3.4 Wall scrolling: wheel, drag, inertia, bounds (L369–378, L397–407, L647–674)

The camera target is `tCy`, which follows input. The displayed camera is `cy`.

**Wheel on the wall** (L405–406). `preventDefault`, then:

```js
let d = e.deltaY + e.deltaX; if (e.deltaMode === 1) d *= 16;
this.tCy += d * 1.15; this.vel = 0;
```

The wheel does **not** clamp `tCy`; the bounds spring below pulls it back. If `zoomOut` is set the wheel returns early (overview only).

**Drag** (wall only: `kt === 0 && k <= 0.01`, primary button, not on `button` or `.nlink`):

- Down records `{sx, sy (frame px), c0: tCy, moved: false, lt, lp: tCy, v: 0}`.
- The drag starts after **6px** of travel (`Math.hypot(dx, dy) > 6`). At that point `hover` clears.
- Movement maps along the tilted columns:

```js
const a = 18 * Math.PI / 180;
const along = (Math.sin(a) * dx + Math.cos(a) * dy) / (0.9 * Math.cos(34 * Math.PI / 180));
let c = d.c0 - along;
if (c < this.minY) c = this.minY - (this.minY - c) * 0.35;      // rubber band 0.35
if (c > this.maxY) c = this.maxY + (c - this.maxY) * 0.35;
const now = performance.now(); d.v = d.v * 0.6 + ((c - d.lp) / Math.max(0.001, (now - d.lt) / 1000)) * 0.4; d.lp = c; d.lt = now;
this.tCy = c;
```

- On **up** (also pointerleave and pointercancel), if the pointer moved: `suppress = true` until `setTimeout 0` (this eats the click), and `vel = clamp(d.v, -3000, 3000)` (px/s, wall units).

**Inertia and bounds, each frame when not dragging** (L370–373):

```js
this.tCy += this.vel * dt; this.vel *= Math.pow(0.03, dt);         // friction: vel ×0.03 per second
const c = Math.max(this.minY, Math.min(this.maxY, this.tCy));
if (c !== this.tCy) { this.tCy += (c - this.tCy) * Math.min(1, dt * 10); this.vel *= 0.8; }  // ×0.8 PER FRAME
```

**Camera follow** (L377–378):

```js
const f = this.reduced ? 1 : 1 - Math.pow(this.drag ? 1e-6 : 3e-4, dt);
this.cy += (this.tCy - this.cy) * f;
```

This is framerate-independent exponential smoothing. The remaining gap after 1s is 3e-4 when free and 1e-6 while dragging, which feels tighter. At 60fps that is f ≈ 0.126 per frame free and f ≈ 0.206 dragging.

**`glideTo(i)`** (tick click, L420): `tCy = clamp(bp[i].y, minY, maxY); vel = 0`. The camera eases there through the follow above.

**Tile intro on mount** (L524). Per tile, with T in seconds since mount:

```js
const intro = out((T - 0.15 - (i % 4) * 0.12 - Math.floor(i / 4) * 0.15) / 1.3);
```

Tile i starts at `0.15 + (i%4)·0.12 + floor(i/4)·0.15` s and runs 1.3s easeOutCubic. During the intro it rises from `+140px` (wall y) and fades: `op = ops[i] * intro`.

### 3.5 Focus, hover, scaling and dimming (wall, `mode = 'follow'`)

```js
const focus = h != null ? h : (mo === 'follow' || zoomedOut ? null : near);   // L520
const dimTo = mo === 'follow' ? 0.5 : 0.62;                                    // L527
const opT = onWall && focus != null && !(this.drag && this.drag.moved) ? (isF ? 1 : dimTo) : 1;
this.ops[i] = this.ops[i] == null ? opT : this.ops[i] + (opT - this.ops[i]) * Math.min(1, (dt || 1) * 8);
const hv = onWall && isF && !(this.drag && this.drag.moved) ? 1.035 : 1;
this.hs[i] = (this.hs[i] || 1) + (hv - (this.hs[i] || 1)) * Math.min(1, (dt || 1) * 10);
```

`onWall` is `k < 0.001`. In follow mode, **focus is the hovered tile only**. There is no auto-focus. With a focused tile:

| Property | Focused tile | Other tiles | Smoothing |
|---|---|---|---|
| opacity target | 1 | **0.5** | exp-approach rate 8/s |
| scale target | **1.035** (multiplies S) | 1 | rate 10/s |
| z | **24px** (wall units, then ×S) | 0 | instant (no smoothing) |

- No focus, or a drag in progress: all opacity 1, scale 1.
- Hover is set by tile `onMouseEnter`, unless a drag has moved (L557). It is cleared by tile `onMouseLeave` (`leave`, L643).
- There is no blur.

**`near`** (L515–518) feeds the `onFocus` callback and the "magnet" in non-follow modes. It is the tile whose projected centre minimises `(X - 720)² + ((Y - 480) * 1.4)²`, using `scr` (projected `bp` with z = 0 and no intro offset).

**`onFocus` prop** (L521):

```js
const f = k > 0.5 ? this.ih : (focus != null ? focus : near);
if (f !== this.lastF) { this.lastF = f; this.props.onFocus(f == null ? -1 : f); }
```

On the wall this reports the hovered tile, or else the nearest-centre tile. It always reports something, even in follow mode. In Index it reports the hovered or focused row, or `-1`.

### 3.6 Frozen header: fade-in after rows land, fade-out first (L498–505, L602)

```js
const want = this.kt === 1 && k >= 0.9 && !this.leaving ? 1 : 0;
if (this.hr == null || !dts) this.hr = want; else this.hr = want ? Math.min(1, this.hr + dts / 0.45) : Math.max(0, this.hr - dts / 0.38);
const x = this.hr; this.hk = x * x * (3 - 2 * x);                      // smoothstep
if (this.leaving && this.hr <= 0.2) { this.leaving = false; this.kt = 0; }
...
hdr: (this.hk * out((T - 0.2) / 0.45)).toFixed(3), hdrY: ((1 - this.hk) * -8).toFixed(2) + 'px',
```

- **In:** the header waits for `k >= 0.9` (t = 1.35s into the fold). `hr` then rises **linearly over 0.45s**, and the visible value is `smoothstep(hr)`, so it finishes at t ≈ 1.80s.
- **Out:** `hr` falls **linearly over 0.38s**, smoothstepped. When `hr <= 0.2` (after 0.304s), `kt = 0` and the fold back starts. The header keeps fading for the last ≈ 0.076s while the tiles begin to move.
- **Drift:** the whole band content translates `hdrY = (1 - hk) * -8px`. It sits 8px **above** when hidden and settles to 0. On the way out it rises back up 8px.
- **Opacity nesting:** the band background, fade strip and wrapper use `hdr`. The filter row and column heads carry `opacity: hdr` again inside the band, so their **effective opacity is hdr²**.
- **Mount intro factor:** `out((T - 0.2) / 0.45)`.

### 3.7 The Fold: wall tile → row thumbnail (L522–564)

Per tile `i` each frame:

```js
const ut = ease((k - 0.024 * i) / 0.58);          // per-tile target progress, staggered by index
let su = this.su[i];
if (!su || dt === 0 || this.reduced) su = this.su[i] = { u: ut, v: 0 };
else { su.v += ((ut - su.u) * 230 - su.v * 23) * dt; su.u += su.v * dt; }   // spring K230 D23 (ζ≈0.758, slight overshoot)
const u = su.u, uc = cl(u);
const sl = Math.min(80 / 520, 50 / hh);
const rowY = R0 + this.rs[i].y + 30 - this.scrollY;
const vsv = this.vs[i];
const L = { x: lerp(160, 1206, pvp), y: lerp(rowY, PVy, pvp) };            // pvp = 0  ->  L = (160, rowY)
const w = { x: isPost ? 160 : this.bp[i].x,
            y: isPost ? 2400 : this.bp[i].y - camY + O[1] + (1 - intro) * 140,
            z: isF && onWall ? 24 : 0,
            op: isPost ? 0 : this.ops[i] * intro };
const x = lerp(w.x, L.x, u), y = lerp(w.y, L.y, u), z = lerp(w.z, 0, u) + Math.sin(PI * uc) * 180;
const s = lerp(this.hs[i], sl * (0.92 + 0.08 * vsv), u), op = lerp(w.op, vsv, uc);
const r = Math.sin(PI * uc) * (i % 2 ? 7 : -7);
const P3 = rot(x - O[0], y - O[1], z);
const X = O[0] + S * P3[0], Y = O[1] + S * P3[1], Z = S * P3[2];
tf: `translate3d(${(X - 260).toFixed(2)}px, ${(Y - hh / 2).toFixed(2)}px, ${Z.toFixed(1)}px) rotateX(${ax.toFixed(3)}deg) rotateY(${(ay - 14 * pvp * uc).toFixed(3)}deg) rotateZ(${(az + r).toFixed(3)}deg) scale(${(S * s).toFixed(4)})`
```

The tile is a 520 × hh box at left/top 0 with `transform-origin: 50% 50%`, so (X, Y) is its centre.

**Pose vs u.** The wall pose is at u = 0 and the row thumbnail at u = 1:

| Property | Formula | Wall (u=0) | Row (u=1) |
|---|---|---|---|
| centre x (plane) | `lerp(bp.x, 160, u)` | 152 / 720 / 1288 | 160 |
| centre y (plane) | `lerp(bp.y − camY + 470 (+intro), rowY, u)` | wall | `240 + rs.y + 30 − scrollY` |
| z | `lerp(zFocus, 0, u) + 180·sin(π·uc)` | 0 (24 focused) | 0; **peaks at +180 at u = 0.5** (arc toward viewer) |
| own scale | `lerp(hs, sl·(0.92 + 0.08·vs), u)` × S | 0.9 (×1.035) | sl (1.0 S) |
| opacity | `lerp(ops·intro, vs, uc)` | 1 (0.5 dimmed) | `vs` (row visibility) |
| extra rotateZ | `±7°·sin(π·uc)`. Even i: −7, odd i: +7 | 0 | 0 |
| plane rotations | ax, ay, az from 3.3 (driven by `pp`) | 34 / 0 / −18 | 0 / 0 / 0 |
| global S | `lerp(0.9, 1, pp)` | 0.9 | 1 |

Tile and plane notes:

- The tile is projected **individually**: its point is rotated by the plane and scaled by S, then the element is translated there and given the same plane rotations. Do not put all tiles in one rotated parent; the per-tile Z arc and rotZ wobble depend on this.
- **Posts (writing)** are invisible on the wall at plane (160, 2400). That is below the screen, in the thumbnail column, and *not* camera-relative. During the fold they rise into their row from below while fading in from 0 to `vs`.

**Timing per tile.** k = t/1.5. The target `ut` runs in-out-cubic over k ∈ [0.024·i, 0.024·i + 0.58], which is **t ∈ [0.036·i, 0.036·i + 0.87] s**. The K230/D23 spring then follows it, so the actual `u` lags a little and can overshoot slightly. x, y and s use **unclamped u**; z, opacity and wobble use `uc`.

| i | target starts (t) | target ends (t) | ut at k=1 |
|---|---|---|---|
| 0 | 0.000 | 0.870 | 1 |
| 4 | 0.144 | 1.014 | 1 |
| 8 | 0.288 | 1.158 | 1 |
| 12 | 0.432 | 1.302 | 1 |
| 16 | 0.576 | 1.446 | 1 |
| 17 | 0.612 | 1.482 | 1 |
| 18 | 0.648 | (k = 1.016) | ≈ 0.99999 |
| 19 | 0.684 | (k = 1.036) | **0.99904** (it never quite reaches 1) |

**Reverse (Index → Wall).** The same formulas run with `k` falling linearly from 1 to 0 over 1.5s, starting once the header has faded (3.6). High-index tiles reach u = 0 *last*: tile i is back at k = 0.024·i. The wall then reappears as `pp` re-tilts over k 0.8 → 0.

**Pointer events and tab order:**

- tile `pe = op > 0.3 && k < 0.5 ? 'auto' : 'none'` (L556)
- `tab: 0` always (L556)

### 3.8 Rows entering and leaving with the fold (L565–576)

```js
const rowAt = (j) => { const q = out((k - 0.36 - 0.016 * j) / 0.3) * out((T - 0.2 - 0.018 * j) / 0.45); return { q, op: q }; };
// j = visible rank (vis.indexOf(i)), or i when hidden
y:  (R0 + this.rs[i].y + (1 - a2.q) * 8).toFixed(2) + 'px',
op: (a2.q * w).toFixed(3),                 // w = vs[i]
line: a2.q.toFixed(3),                     // bottom hairline scaleX
pe: w > 0.5 && k > 0.5 ? 'auto' : 'none', tab: w > 0.5 ? 0 : -1,
```

- Row j fades and rises from **+8px** with easeOutCubic over k ∈ [0.36 + 0.016j, 0.66 + 0.016j], which is t ∈ [0.54 + 0.024j, 0.99 + 0.024j] s.
- The hairline draws left → right with the same q (`transform-origin: 0 50%`).
- Group headings use `op = gop[g] * rowAt(0).q` and an underline scale of `g.op`.
- The second factor is a mount-time intro: row j starts at T = 0.2 + 0.018j and runs 0.45s.
- On the way back, rows fade in reverse order: the bottom row is gone first, at k = 0.664 + … down to 0.36.
- `kc = cl(k * 2.5)` (L594) hides the caption and rail by k = 0.4 (t = 0.6s), linear.

### 3.9 Re-sort / filter / search: motion `"swap"` (L466–496)

The trigger is any change of `sig = sort|filt|q`: a column head click, a kind click, a group heading click, Escape, a typed character or Backspace. On change, a snapshot `chg` is taken:

```js
P.forEach((_, i) => { prevM[i] = this.mm[i] == null ? 0 : this.mm[i]; if (first || this.cy0[i] == null) this.cy0[i] = ty[i] != null ? ty[i] : i * 60; });
KIND.forEach((_, g) => { prevGM[g] = this.gm[g] || 0; if (first && gy[g] != null) this.gy0[g] = gy[g]; });
P.forEach((_, i) => { moved[i] = MO === 'cascade' || ty[i] == null || prevM[i] < 0.99 || Math.abs(ty[i] - this.cy0[i]) > 0.5; });
let r = 0; vis.forEach((i) => { if (moved[i]) rank[i] = r++; else rank[i] = 0; });          // stagger counts only changed rows
KIND.forEach((_, g) => { const f = vis.find((j) => kindOf[j] === g); grank[g] = f != null ? Math.max(0, rank[f] - 0.5) : 0; });
this.chg = { sig, t0: first ? now - 1e4 : now, prevM, prevGM, moved, rank, grank, ty: { ...ty }, gy: { ...gy } };
```

Then each frame, with `OUT = 0.1, IN = 0.22, ST = 0.018` (swap) and `ss = (now - c.t0) / 1000`:

```js
const on = c.ty[i] != null; let m, dy = 0;
if (!c.moved[i]) m = on ? 1 : 0;                                        // unchanged rows: untouched
else if (ss < OUT) m = c.prevM[i] * (1 - ss / OUT);                     // fade out in place, linear, 0.10s
else { if (on) this.cy0[i] = c.ty[i];                                   // jump to new slot while invisible
       const f = on ? out((ss - OUT - c.rank[i] * ST) / IN) : 0;        // fade in, easeOutCubic, 0.22s, 18ms per changed rank
       m = f; dy = (1 - f) * 6; }                                       // rise from 6px below
this.mm[i] = m; this.vs[i] = m; this.rs[i] = { y: this.cy0[i] + dy, v: 0, init: 1 };
```

| Phase | Time (since change) | Opacity `m` | Position |
|---|---|---|---|
| out | 0 → 0.10s | `prevM · (1 − ss/0.1)`, linear | old slot (`cy0`) |
| gap | 0.10 → 0.10 + 0.018·rank | 0 | new slot + 6px |
| in | over 0.22s | `out(...)`, easeOutCubic | `newY + 6·(1 − f)` |

What changes and what stays:

- A row is **moved** (it animates) if any of these hold:
  - it is now hidden (`ty == null`)
  - it was not fully visible (`prevM < 0.99`)
  - its slot moved by more than 0.5px
- Rows that are unchanged and visible stay perfectly still at opacity 1.
- Newly hidden rows fade out over 0.1s and stay at 0.
- **The stagger is uncapped:** `rank × 18ms`, counting only moved visible rows.
- Interrupting mid-animation snapshots the current `mm`, so a half-faded row fades out from where it is.

**Groups** (L487–495). These headings exist only for `sort = 'type'`.

```js
const on = c.gy[g] != null, same = on && MO === 'swap' && c.prevGM[g] > 0.99 && this.gy0[g] === c.gy[g];
if (same) m = 1; else if (ss < OUT) m = c.prevGM[g] * (1 - ss / OUT); else if (!on) m = 0;
else { this.gy0[g] = c.gy[g]; m = out((ss - OUT - c.grank[g] * ST) / IN); }
this.gm[g] = m; this.gop[g] = m; this.rs['g' + g] = { y: this.gy0[g] != null ? this.gy0[g] : 0, v: 0 };
```

Groups get the same out/in timing with **no 6px rise**. Their stagger rank is `rank(first row) − 0.5`, so a heading arrives 9ms before its first row.

**Row thumbnails follow automatically:** the tile pose reads `rs[i].y` (with dy) and `vs[i]`. The thumbnail fades with its row, rises 6px with it, and its scale dips to `sl × 0.92` at m = 0.

In swap mode the row spring and visibility easing (L451–465) **run but are overwritten every frame** by L485 and L494. Positions are set directly, so rows never glide.

### 3.10 Type filter: underline slide and name swap (CSS transitions)

| Element | Property | Transition (verbatim) |
|---|---|---|
| `.kind-line` | `translate: (filt+1)·78px 0` | `translate .5s cubic-bezier(.34,1.3,.64,1)` (L30) |
| `.kind-name` (one span per kind, stacked at x = 548) | active: `opacity 1; translate 0 0`. Inactive: `opacity 0; translate 0 ±18px` | `opacity .28s ease, translate .45s cubic-bezier(.22,1,.36,1)` (L31) |
| `.kd` colour | on `#EDEDED`, off `#5a5a63`, hover (off) `#C4C4CC` | `.kd{transition:color .3s ease}` (L28 overrides L25's .25s) |
| `.kdt` tooltip (hover/focus on inactive) | `opacity 0 → 1`, `translate -50% -4px → -50% 0`, at `top: 62px; left: 13px` | `opacity .2s ease, translate .3s cubic-bezier(.22,1,.36,1)` (L32–33) |

Name direction (L584):

```js
ly: c.on ? '0px' : ((c.g == null ? -1 : c.g) < (this.filt == null ? -1 : this.filt) ? '-18px' : '18px')
```

Kinds before the active one sit 18px **above**, and kinds after it sit 18px **below**. The new name therefore slides in from the side it comes from, and the old one exits the other way. "All" has index −1.

### 3.11 Column-head sort underline (L221–222)

- Underline span: `bottom: 2px; height: 1.5px; #EDEDED; transform-origin: 0 50%; scale: {0|1} 1; transition: scale .45s cubic-bezier(.34,1.56,.64,1)`.
- Labels swap instantly: `PROJECT` ↔ `PROJECT · A–Z`, `TYPE` ↔ `TYPE · GROUPED`.
- Colour: on `#EDEDED`, off `#8A8A93`, transition `.25s ease`; hover off → `#C4C4CC`.
- Clicking again returns to `'featured'` (L639–640).

### 3.12 Preview panel ("calm preview", L585–592, L611–612)

```js
const pl = this.pvLast != null ? this.pvLast : 0, ph = Math.round(this.H[P[pl][4]] * 0.5769);
const want = this.ih != null && k > 0.98 ? 1 : 0;
const yT = Math.max(110, Math.min(900 - ph - 110, R0 + this.rs[pl].y + 30 - this.scrollY - ph / 2));
if (this.pvY == null || this.pvA < 0.02) this.pvY = { y: yT, v: 0 };                       // appears in place, no fly-in
else if (dts) { this.pvY.v += ((yT - this.pvY.y) * 120 - this.pvY.v * 20) * dts; this.pvY.y += this.pvY.v * dts; }   // spring K120 D20 (ζ≈0.913)
this.pvA = dts ? this.pvA + (want - this.pvA) * Math.min(1, dts * (want ? 10 : 7)) : want;
P.forEach((_, i) => { const t = i === pl ? 1 : 0; const o = this.pvo[i] == null ? t : this.pvo[i]; this.pvo[i] = dts ? o + (t - o) * Math.min(1, dts * 12) : t; });
pvp: { op: (this.pvA * cl(k * 2 - 1)).toFixed(3), s: (0.985 + 0.015 * this.pvA).toFixed(4), y: this.pvY.y.toFixed(1) + 'px', h: ph + 'px', ... }
pvs: tiles.map((t, i) => ({ ...t, pop: this.pvo[i].toFixed(3), vis: this.pvo[i] > 0.01 ? 'visible' : 'hidden' }))
```

The trigger is the hovered or keyboard-focused row (`ih`), and only when k > 0.98.

| Aspect | Behaviour |
|---|---|
| target y | panel top aligned so the media box centres on the row centre, clamped to [110, 900 − ph − 110] |
| first show | snaps to target (no glide) whenever `pvA < 0.02` |
| moving row to row | spring **K120, D20** on y |
| panel opacity | exp-approach to `want`: rate **10/s in, 7/s out**; × `cl(2k − 1)` |
| panel scale | `0.985 → 1` with pvA (origin left-centre) |
| media | every project's media is rendered; only `pl` targets opacity 1; crossfade rate **12/s**; hidden below 0.01 |
| media box height | CSS `height .35s cubic-bezier(.22,1,.36,1)` to `ph` |
| text (name, line) | swaps instantly to `pl` (no transition) |
| `pvLast` | keeps the last hovered project, so the content stays during fade-out |

Preview heights (ph): phone 213, tv 190, web/discord 187, term/data/paper 173, repo 150.

### 3.13 Tick rail and caption (wall)

**Rail** (L614–617):

```js
op: (ui * (1 - kc) * chromeK).toFixed(3), pe: kc < 0.5 && chromeK > 0.5 ? 'auto' : 'none',
w: i === focus ? '32px' : inView[i] && !zoomedOut ? '18px' : '12px',
c: i === focus ? '#EDEDED' : inView[i] && !zoomedOut ? '#8A8A93' : '#3a3a42',
```

- `inView[i] = X in (0, 1440) && Y in (84, 900)`. This uses the projected `bp` centre, without the intro offset or z (L600).
- Transitions (L46–49): `.tl` width `.45s cubic-bezier(.34,1.56,.64,1)` and background `.25s ease`. `.tn` label opacity `.25s ease` and translate `.35s cubic-bezier(.22,1,.36,1)` from `6px` to `0`.
- On hover or focus-visible: the label shows and the line turns `#EDEDED`.
- Click → `glideTo(i)`.
- `aria-current = 'true'` on the focused tick. In follow mode that is the **hovered tile** only.

**Caption** (L596–599, L613):

```js
if (focus !== this.capId) { this.capId = focus; this.capAt = now; if (focus != null) this.capLast = focus; }
const ce = out((now - this.capAt) / 300);            // NB: now is ms, so this is a 300ms easeOutCubic
const capOp = focus != null ? ce : 1 - ce;
cap.op = shown != null ? ui * (1 - kc) * capOp * chromeK : 0;   cap.y = focus != null ? (1 - ce) * 8 : 0  (px)
n: String(shown + 1).padStart(2, '0') + ' / ' + this.NW
```

- When focus changes to a tile, the caption **re-enters over 300ms**, easeOutCubic, rising from +8px.
- When focus clears, it fades out over 300ms in place (y = 0) and keeps showing the last tile.
- Between two tiles it jumps to the new content and re-enters from 0.
- `ui = out((T - 1.1) / 0.8)` is the mount intro for the caption, rail and nav.

### 3.14 `onPeek`: pushing past the end (L381–386, L396, L399–400)

```js
peekAdd(d) { if (!this.props.onPeek || d <= 0) return; this.over = (this.over || 0) + d; this.overAt = performance.now(); }
// wall:  if (this.tCy >= this.maxY - 2 && d0 > 0 && !this.state.zoomOut) this.peekAdd(d0);
// index: if (ix.scrollTop + ix.clientHeight >= ix.scrollHeight - 2) this.peekAdd(d0);   (then return: native scroll)
// loop:
if (this.over && now - (this.overAt || 0) > 420) { this.over *= Math.pow(0.05, dt); if (this.over < 1) this.over = 0; }
const pk = Math.min(1, (this.over || 0) / 700);
if (Math.abs(pk - (this.pk || 0)) > 0.002 || (pk === 0 && this.pk)) { this.pk = pk; this.props.onPeek(pk); }
if (pk >= 1) { this.over = 0; }
```

- Only **downward** wheel deltas at the bottom count. `d0 = deltaY`, ×16 for line mode, and deltaX is ignored here.
- **700px** of accumulated push gives `pk = 1`.
- After **420ms** without input, `over` decays at ×0.05 per second.
- `onPeek` is called with 0…1 whenever the value changes by more than 0.002, and once more on return to 0.
- At 1 the accumulator resets, so the next frame emits 0.
- Room uses this to show the shelf (`pW = p`) and switches to the shelf at `p >= 1` (`Room.dc.html:191`).
- Drag does not feed peek; only the wheel does.

### 3.15 Not-approved variants (brief)

- **motion `slide`:** a reorder sets `pend[i] = {y, at: now + min(r·12, 120)}` (a ripple of 12ms per row, capped at 120ms). Rows follow a spring K260 D32. Visibility uses exp-approach rate 14; group opacity rate 9. Headings snap to place when invisible.
- **motion `cascade`:** like swap, but every row counts as moved and the stagger is 26ms.
- **mode `soft`:** focus is `near` when nothing is hovered, dim 0.62. A magnet pulls `tCy` to `near` at rate 3 after 450ms idle with |vel| < 40.
- **mode `overview`:** adds the soft behaviour, ctrl+wheel or "See all" to zoom out (`zl` spring K120 D20 to 0: S 0.52, ax −10, az +8, camY → midY), and click-to-glide when zoomed out.

---

## 4. Interaction

| Input | Wall (k ≈ 0) | Index (k = 1) |
|---|---|---|
| wheel / trackpad | `preventDefault`; `tCy += (deltaY + deltaX) × 1.15` (×16 line mode); peek at bottom | native scroll of `.ix`; `scrollY` read in `onScroll`; peek at bottom |
| drag (mouse / touch / pen) | Pointer Events on the root: 6px slop, along-column mapping, rubber band 0.35, release inertia; `touch-action: none` | none (`touch-action: pan-y`, native) |
| hover tile | focus: scale 1.035, z 24, others 0.5 opacity, caption, rail tick 32px | — |
| click tile | `onOpen(i)` (preventDefault); suppressed right after a drag | (tiles `pe: none` once k ≥ 0.5) |
| hover / focus row | — | `ih = i`: preview, arrow, type label, logo colours, background `#101013` |
| click row | — | `onOpen(i)` if provided (preventDefault), else follows `href` |
| tick click | `glideTo(i)` | (rail hidden) |
| keyboard | none (Tab reaches tiles and ticks) | see below |

Keyboard (L408–419). Active only when `kt === 1`, with no meta/ctrl/alt, and not in an INPUT or TEXTAREA. The listener is on `window`.

| Key | Action |
|---|---|
| printable `[0-9A-Za-z .\-]` | `q = (q + key).slice(0, 22)`, preventDefault. A leading space is ignored |
| Backspace | remove the last character, if q is non-empty |
| Escape | clear q if set, otherwise clear the type filter |
| ↓ / ↑ | move through `visNow` from `ih` (start 0, clamped), `el.focus()` the row; `ih` = that row; `.ix` `scroll-padding-top: 180px` keeps it below the band |

Type-to-find display:

- The filter row and query display **toggle instantly**. `fl.op` 1↔0 with translate 0↔−10px, and `qd.op` 0↔1 with translate 10px↔0. There are no CSS transitions on these (L194, L211).
- Query text is 34/600, −0.04em, line-height 56, `white-space: pre`.
- Caret: `2×30px`, `margin-left: 4px`, `vertical-align: -3px`, `#EDEDED`, `animation: blink 1.05s steps(1) infinite` with `50%{opacity:0}` (L42–43).
- Meta text: `"N projects · esc to clear"`, or `"1 project · esc to clear"`.
- The empty state shows instantly at opacity 1: `Nothing matches “q”. Try a type, like bots.` while searching, otherwise `Nothing here yet.`

Index hover styles (CSS, L20–41):

| Selector | Effect |
|---|---|
| `.row` | `background-color` `.2s ease` → `#101013` on hover |
| `.arr` (arrow inset) | `opacity 0; translate -10px 0` → `1; 0 0` on `.row:hover` / `:focus-visible`; `opacity .2s ease, translate .35s cubic-bezier(.34,1.56,.64,1)`. The arrow sits in the 24px last column, 20px in from the row edge |
| `.tyl` (type label) | `opacity 0; translate -4px 0` → visible; `opacity .2s ease, translate .3s cubic-bezier(.22,1,.36,1)` |
| `.ty svg` | `#A1A1AA` → `#EDEDED`, `.2s` |
| `.lg path` (logos) | fill `#7A7A83` → `var(--b)` (brand colour), `.3s ease` |
| `.gh` (group heading) | hover `#C4C4CC`; click toggles `filt = gi` |

Focus rings: `outline: 2px solid #EDEDED; outline-offset: 4px` on `.tile, .vbtn, .nlink, .tick, .row`. `.kd, .sh, .gh` get the same plus `border-radius: 2px` (L15, L27).

Accessibility attributes:

- Tiles: `aria-label="name, type"`, `tabIndex 0`, `draggable=false`, `-webkit-user-drag: none`.
- Rows: native `<a href>`; `tabIndex = vs > 0.5 ? 0 : -1`; `data-i`.
- Kind buttons: `role="group" aria-label="Show a type"`; buttons `aria-pressed`, `aria-label="Apps, 2"`; count `<sup aria-hidden>`; tooltip and name labels `aria-hidden`.
- Query: `aria-live="polite"`.
- Sort buttons: `aria-pressed`.
- Group buttons: `aria-label="Show only X"`.
- Logos: `role="img" aria-label` plus a `title` on the wrapper.
- Caption: `aria-live="polite"`.
- Rail: `role="group" aria-label="Projects"`; ticks `aria-label=name`, `aria-current`.
- Preview: `aria-hidden`. All decorative hairlines and underlines are `aria-hidden`.

---

## 5. Colours and typography

Fonts: Google Fonts `Geist` 400/500/600/700 and `Geist Mono` 400/500 (L11).

### 5.1 Typography

| Use | Spec |
|---|---|
| row name | Geist 17 / 500, −0.01em, nowrap ellipsis |
| row type label | Mono 12 |
| row stack text | Mono 12.5 `#A1A1AA` |
| column heads | Mono 11.5, letter-spacing 0.06em, `#8A8A93` (count right-aligned) |
| kind count `<sup>` | Mono 11 / 400, `vertical-align: 12px`, margin-left 5 |
| kind name | 22 / 600, −0.03em, line-height 56 |
| kind tooltip | Mono 11 `#A1A1AA` |
| group heading | 22 / 600, −0.03em; icon 22; count Mono 11.5 `#8A8A93` |
| query | 34 / 600, −0.04em, lh 56; meta Mono 12 `#8A8A93`; hint Mono 12 `#61616A` |
| preview | name 20 / 600 −0.02em; line 14 / 1.5 `#A1A1AA` |
| caption | Mono 12.5 `#8A8A93` / 30 / 600 −0.03em / 15 `#A1A1AA` |
| tick label | 13 `#EDEDED` |
| empty | 17 `#A1A1AA` |
| tile placeholders | Mono 12 `#8A8A93` (terminal 13 / 1.8) |
| paper | date Mono 12 `#61616A`; title 25 / 700 −0.03em lh 1.12; desc 14.5 / 1.55 `#3f3f46`; footer 13 `#61616A` |
| nav | brand 16 / 600 −0.02em; links 14 |

### 5.2 Dark palette (WallIndex2)

- Text: `#EDEDED` (primary, active, lines), `#C4C4CC` (hover off), `#A1A1AA` (secondary), `#8A8A93` (tertiary, inactive heads), `#7A7A83` (logo grey), `#61616A` (hint), `#5a5a63` (inactive kind).
- Lines: `#3a3a42` (off-screen tick), `#2a2a31` / `#2a2a30` (heading rule, nav divider), `#1c1c22` (row hairline).
- Row hover: `#101013`.
- Wall and band: `wallColor`, default `#0a0a0c`. Room passes `#0a0a0c`, `#17171b` (gallery) or a tint (`Room.dc.html:149`).
- Media: `#050506`, `#2e2e35`, `#131317`, `#141418`, `#1c1c21`, `#26262c`, `#0f0f12`, `#2c2c32`, `#0d0d10`, `#2c2c34`, `#1e1e24`, `#121215`, `#1f1f25`, `#17171b`, `#08080a`, `#18181c`, `#4ade80`, `#000`. Paper `#ECEBE6` / `#111113`.
- Nav glass: `rgba(10,10,12,0.72)`.

### 5.3 WallIndex2Light diff

The **logic is identical**. The only script changes are colour literals at L584, L606–607, L616, L624, L629 and L636, plus the `wallColor` default in data-props. The title gains a `(light) ` prefix.

UI colours map 1:1:

| Dark | Light | Uses |
|---|---|---|
| `#0a0a0c` | `#F2F1ED` | rootBg, wallColor default, `wc` fallback |
| `#EDEDED` | `#111114` | primary text, focus outlines, underlines, active colours (25×) |
| `#A1A1AA` | `#56565E` | secondary text |
| `#8A8A93` | `#6A6A72` | tertiary, inactive sort heads, in-view ticks, view buttons |
| `#C4C4CC` | `#3A3A40` | hover on inactive |
| `#7A7A83` | `#76767E` | logo grey |
| `#61616A` | `#8E8E95` | hint, paper date |
| `#5a5a63` | `#A3A29C` | inactive kind icon |
| `#3a3a42` | `#C4C2BC` | off-screen tick |
| `#2a2a30` / `#2a2a31` | `#D6D4CD` | dividers, group rule |
| `#1c1c22` | `#ECEAE5` (row hairline) / `#E6E4DE` | hairlines |
| `#101013` | `#FAFAF8` | row hover |
| `rgba(10,10,12,0.72)` | `rgba(242,241,237,0.72)` | nav glass |

Media templates are restyled. Every media card (all 8 templates; for phone and TV the shadow sits on the device shell) gains `box-shadow: 0 1px 2px rgba(17,17,20,.05), 0 16px 36px -18px rgba(17,17,20,.28)`.

| Template | Light changes |
|---|---|
| phone / TV shell | bg `#1B1B1F`, border `#1B1B1F`, plus the shadow; screen `#FFFFFF`; placeholder `#8E8E95`; TV neck `#2A2A2F`, foot `#3A3A40` |
| web | border `#E3E1DB`, bg `#FFFFFF`, bar border `#EEECE7`, dots `#E2E0DA`, body `#FAFAF8`, text `#8E8E95` |
| discord | border `#E3E1DB`; rail `#E3E5E8`; icons `#C4C8CE` / `#D3D6DB`; channel list `#F2F3F5`; bars `#C4C8CE` / `#DEE1E5`; main `#FFFFFF`; text `#80848E` |
| terminal | stays dark (`#08080a`), border `#1E1E22`, plus the shadow |
| repo | border `#E3E1DB`, bg `#FFFFFF` |
| paper | bg `#FFFFFF`, plus `border: 1px solid #E6E4DE` and the shadow |
| data | border `#E3E1DB`, bg `#FFFFFF`, text `#8E8E95` |

Room's light variant mounts `WallIndex2Light` with identical props (`RoomLight.dc.html:26`).

---

## 6. Gotchas: what drifts if you rebuild naively

1. **`k` is linear, and all easing is derived from it.** Do not swap in an eased 1.5s tween for `k`. Use `pp = ease(k/0.8)`, `ut = ease((k-0.024i)/0.58)`, row `out((k-0.36-0.016j)/0.3)`, `kc = k*2.5`, preview `cl(2k-1)`, and keep them all on the same linear clock.
2. **The tile fold is target-eased, then spring-followed** (K230/D23, underdamped). Positions use unclamped `u`, so a slight overshoot onto the row is part of the look. Opacity, z-arc and wobble use clamped `uc`.
3. **Per-tile projection.** Each tile computes its own projected centre with `rot()` and S, *then* applies the same rotations as CSS. One rotated parent plane gives different results; the Z arc of +180 and the alternating ±7° rotZ also need per-tile transforms. The root needs `perspective: 2200px; perspective-origin: 50% 45%`, and the tile layer `preserve-3d`.
4. **CSS transform order matters:** `translate3d(X-260, Y-hh/2, Z) rotateX(ax) rotateY(ay) rotateZ(az+r) scale(S*s)`, with `transform-origin: 50% 50%` on a 520 × H box.
5. **Projection origin is (720, 470), but the "nearest" metric uses (720, 480) with a 1.4 y-weight.**
6. **Frame-rate-dependent smoothing:**
   - mouse lean (`× 0.05 per frame`)
   - the overscroll `vel *= 0.8` per frame
   - the drag velocity blend `0.6/0.4` per pointermove

   Reproduce them per frame at 60fps, or convert them deliberately. Everything else is dt-based with dt clamped to 50ms.
7. **Wheel does not clamp `tCy`.** The bounds spring (rate 10) pulls it back. Drag uses a 0.35 rubber band instead.
8. **Camera follow differs while dragging:** `1 - pow(1e-6, dt)` dragging and `1 - pow(3e-4, dt)` free.
9. **Header opacity is squared** on the filter row and column heads (nested `opacity: hdr`). It waits for `k >= 0.9`, and on exit **gates the fold**: the wall return starts only when `hr <= 0.2`.
10. **Swap overrides springs.** In `"swap"` mode row and heading positions are written directly each frame. Rows jump to the new slot while invisible, then rise 6px. The stagger counts only changed rows (18ms each, uncapped). Unchanged rows must not flicker.
11. **Every keystroke in type-to-find is a re-sort event**, because `q` is in `sig`. The filter row ↔ query swap itself has no transition.
12. **Thumbnails are the tiles,** in a layer above the rows. They track `scrollY` from the `onScroll` handler, one frame late; Y uses `- scrollY`. If you put thumbnails inside the rows in production, match the visual result: the same fade (`vs`), the 6px rise, and the 0.92 scale dip.
13. **Posts** live on the wall at plane (160, 2400) with opacity 0. They are not camera-relative and sit outside the `bp` bounds. They rise from below during the fold. They are still `tabIndex 0` on the wall (pointer-events off). The rail and the "/ 17" counter exclude them only because they come **last** in `P`.
14. **Tile 19 never fully reaches u = 1** (ut = 0.99904 at k = 1). Keep the 0.024 stagger and 0.58 window exactly, or tiles land a hair off.
15. **The preview snaps into place** when it was hidden (`pvA < 0.02`). It glides only between rows, using spring K120/D20. Its text swaps instantly while the media crossfades (rate 12) and the box height transitions over .35s.
16. **Caption timing uses ms:** `out((now - capAt)/300)` is 300ms. The rail's "current" tick in follow mode is the hovered tile only. `onFocus` still reports the nearest tile when nothing is hovered.
17. **Kind underline pitch is 78px** (64 button + 14 gap). The underline is 26px wide at x = 0, aligned with the icon. The name slot is at x = 548. Kinds before the active one sit at −18px and kinds after it at +18px.
18. **`.kd` colour transition is .3s**, which overrides .25s. **`.kdt` inline `left: 13px`** overrides the CSS `left: 50%`.
19. **Click suppression after a drag** uses `setTimeout(0)`. Drag can start on a tile, and pointerleave ends the drag.
20. **Peek:** only downward wheel deltas at the bottom count. The threshold is 700px, decay ×0.05/s after 420ms idle, and the value resets to 0 after reaching 1.
21. **Brand-black logos** (Markdown `#000000`, Next.js `#000000`, GitHub `#181717`) become near-invisible on dark hover. This is faithful to the source.
22. **`scrollY` is never reset** on view change, and `.ix` keeps its scroll position across folds.
