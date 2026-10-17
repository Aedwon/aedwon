# Room: implementation spec

Source: `reference/components/Room.dc.html` (dark) and `RoomLight.dc.html` (light). Wrappers: `Main.dc.html`, `MainLight.dc.html`, `RoomShelf.dc.html`.
All line numbers refer to `Room.dc.html` unless prefixed. Every number below comes from the source. Where the Spec board (`Spec.dc.html`) and the code disagree, this document says so; **the code wins**.

---

## 0. Wrappers (how Room is mounted)

| File | What it does |
|---|---|
| `Main.dc.html:16` | `<div style="width:1440px;height:900px;background:#0a0a0c;font-family:'Geist',system-ui,sans-serif;color:#EDEDED"><dc-import name="Room" start="wall">` — no `theme` prop, so it defaults to `dark`. |
| `MainLight.dc.html:16` | Same frame with `background:#F2F1ED; color:#111114`, mounts **RoomLight** with `start="wall" theme="light"`. |
| `RoomShelf.dc.html:16` | Same as Main but `start="about"` (the camera starts on the shelf). |
| `RoomLight.dc.html` | A copy of Room with different colours and child components (see §5.3). It is not a prop switch. |

Room props (`:64`):

| Prop | Type / options | Default | Used? |
|---|---|---|---|
| `theme` | `dark` \| `light` | `dark` | Only picks the theme link's href, label and icon (`:153-155`). Colours are hard-coded per file. |
| `ambience` | `none` \| `gallery` \| `dots` \| `tint` \| `window` | `dots` | **Build only `dots`.** Unknown values fall back to `dots` (`:74`). |
| `hour` | number | `-1` | Used only by the `window` ambience (Manila time when -1). Not used. |
| `start` | `wall` \| `about` | `wall` | Sets the starting camera position (`:68`). |

Fonts (`:11`): Google Fonts `Geist` 400/500/600/700/800 and `Geist Mono` 400/500, `display=swap`.

---

## 1. Purpose and structure

Room is the whole desktop page: one 1440×900 frame. The **Wall/Index** (WallIndex2) sits on top and the **shelf** (AboutVolumes) hangs 740px below it on the same wall. A spring-driven "camera" moves between them. On top are the project page layer (ProjectSpread), one shared nav with a travelling underline, and a canvas of points behind everything.

### 1.1 Layers (DOM order = paint order; no z-index is used anywhere)

| # | Layer | Line | Box (design frame px) | transform-origin | Notes |
|---|---|---|---|---|---|
| root | `div[data-room]` | 19 | `position:relative; 1440×900; overflow:hidden` | — | `background: wallBg` (#0a0a0c), `color:#EDEDED`, `font-family:'Geist', system-ui, sans-serif`, `-webkit-font-smoothing:antialiased`, `perspective:1800px; perspective-origin:50% 50%`. Carries the `onMouseMove`/`onMouseLeave` used by the dots. |
| 1 | Dots `<canvas>` | 22 | `abs 0,0; 1440×900`; bitmap `width=1440 height=900` | — | `pointer-events:none`, `aria-hidden`, `display: block` only when ambience = dots. |
| 2 | Wall wrapper | 25-27 | `abs 0,0; 1440×900` | `50% 100%` | `transform`, `visibility`, `opacity`, `mask-image` (and `-webkit-mask-image`), `pointer-events`, `aria-hidden` are all camera-driven. Contains `WallIndex2`. |
| 3 | Shelf wrapper | 30-34 | `abs 0,0; 1440×900` | `50% 0` | `transform`, `visibility`, `pointer-events`, `aria-hidden` are camera-driven. Contains the book-shadow span (gallery only) and `AboutVolumes`. |
| 4 | Window light | 37-43 | `inset:0` | — | `window` ambience only (`display:none` otherwise). Not built. |
| 5 | Project layer | 46-48 | `abs; inset:0` | — | `opacity`, `translate`, `visibility`, `pointer-events`, `aria-hidden` driven by the project progress. Contains `ProjectSpread`. |
| 6 | Nav bar | 51-60 | `abs; left:0; right:0; top:0; height:84px` | — | Always on top, **including over an open project**. `background: wallC + 'b8'`, `backdrop-filter: saturate(180%) blur(20px)` (and the `-webkit-` version). |

### 1.2 Nav contents (all `position:absolute` inside the 84px bar)

`.rn` base class (`:14`): `border:none; background:none; padding:0; height:44px; width:72px; font-family:inherit; font-size:14px; cursor:pointer; color:var(--c); transition: color .3s ease`.

| Element | Line | left | top | w×h | Text / styles | `--c` |
|---|---|---|---|---|---|---|
| Brand button "Aedwon" | 52 | 44 | 20 | `width:auto` × 44 | font-size 16px, weight 600, letter-spacing -0.02em. Click = go.wall | `#EDEDED` (fixed) |
| "Wall" | 53 | 1016 | 20 | 72×44 | 14px / 400 | `nav.wall` |
| "Index" | 54 | 1088 | 20 | 72×44 | 14px | `nav.index` |
| Divider span | 55 | 1172 | 34 | 1×16 | `background:#2a2a30` | — |
| "About" | 56 | 1184 | 20 | 72×44 | 14px | `nav.about` |
| "Contact" | 57 | 1256 | 20 | 72×44 | 14px | `nav.contact` |
| Underline span | 58 | 0 (moved by `translate`) | 58 | 28×1.5 | `background:#EDEDED; translate: {lineX} 0` | — |
| Theme link `<a class="rn">` | 59 | 1384 | 20 | 44×44 | `display:flex; align/justify center`; inline SVG 18×18, viewBox 0 0 24 24, `fill:none; stroke:currentColor; stroke-width:1.6; stroke-linecap:round; stroke-linejoin:round` | `#8A8A93` |

Button centres (left + 36), used by the underline (`:131`): `X = { wall: 1052, index: 1124, about: 1220, contact: 1292 }`.

Theme link (`:153-155`):

| theme | href | aria-label | icon path `d` |
|---|---|---|---|
| dark (Room) | `MainLight.dc.html` | "Switch to light" | sun: `M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4` |
| light (RoomLight) | `Main.dc.html` | "Switch to dark" | moon: `M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z` |

(Production note from `canvas.json`, not code: follow the system setting first, then remember the visitor's choice.)

### 1.3 Child components and props

| Child | Line | Props passed in (kebab to camelCase) | Callbacks out |
|---|---|---|---|
| `WallIndex2` (`WallIndex2Light` in light) | 26 | `bare=true`, `dim=cam.dim` (= clamp(c), 3 decimals), `wallColor=amb.wall`, `shadow=amb.shadow`, `view="wall"` (fixed initial), `motion="swap"`, `viewReq`, `hintSize="1440px,900px"` | `onOpen(i)` = openProject, `onFocus(i)` (only used by tint), `onPeek(p)` |
| `AboutVolumes` (`AboutVolumesLight`) | 33 | `bare=true`, `openReq`, `closeReq` | `onScrollOut(deltaY)`, `onOpen(o)` with o ∈ `'' \| 'book' \| 'contact'` |
| `ProjectSpread` (`ProjectSpreadLight`) | 47 | `bare=true`, `openReq=projReq` | `onBack()` = closeProject |

**Request-string protocol.** Room sends commands to children as strings that change on every request: `value + '#' + counter` (`:119`, `:176`). The child parses `split('#')[0]` and acts only when the whole string differs from the last one it saw. So sending the same command twice still fires twice. In React, use an `{cmd, nonce}` object or a counter.
- `viewReq`: `'wall' | 'index' | 'wall!' | 'index!'`. A trailing `!` means "switch while out of sight": WallIndex2 jumps instantly with no fold (`WallIndex2.dc.html:623`).
- `openReq`: only ever `'contact#n'`. AboutVolumes does `parseInt('contact')`, gets NaN, and opens the last volume, Vol. 06 (`AboutVolumes.dc.html:296`).
- `closeReq`: `'close#n'`.
- `projReq`: `'<projectIndex>#pn'`, using a **separate** counter `pn` (`:176`).

---

## 2. State model

Room keeps almost all state on instance fields, not in React state. A rAF loop calls `setState({tick})` on every frame so `renderVals()` recomputes everything (`:98`).

| Field | Init (`:68-79`) | Meaning | Changed by |
|---|---|---|---|
| `c` | `s` (0 for start=wall, 1 for start=about) | Camera position. 0 = wall, 1 = shelf. Not clamped, so it can drift a hair past [0,1]. | The spring in the loop (`:90`) |
| `cv` | 0 | Camera velocity | The spring |
| `cT` | `s` | Camera target "page": exactly 0 or 1 | `toWall` sets 0, `toShelf` sets 1 |
| `pW` | 0 | Peek amount past the end of the wall, 0..1 | `onPeek(p)` (`:191`); reset to 0 in `toShelf` |
| `pS` | 0 | Push amount upward out of the shelf, 0..1+ | `onScrollOut` (`:193`); decays in the loop (`:88`); reset to 0 in `toWall` |
| `pSAt` | 0 | Time of the last shelf scroll-out | `onScrollOut` |
| `view` | `'wall'` | What the top of the room shows: `'wall' \| 'index'` | `toWall(view)` |
| `shelfSel` | `'about'` | Which shelf nav item is current: `'about' \| 'contact'` | `toShelf(true)` sets `'contact'`; `onOpen(o)` sets `'contact'` if o==='contact', otherwise `'about'` |
| `bookOpen` | undefined (falsy) | A volume is open on the shelf | `onOpen(o)`: `!!o` |
| `pOpen` | false | Project page requested open | `openProject` sets true; `closeProject`, Esc, `toWall`, `toShelf` set false |
| `po` | 0 | Project progress, linear 0..1 | The loop (`:97`) |
| `pn` | 0 | projReq counter | `openProject` |
| `n` | 0 | viewReq/openReq/closeReq counter | `req()` |
| `amb` | from prop | Ambience | constructor only |
| `mx,my` | -999 | Raw cursor position in design px (-999 = none) | `track` / `untrack` (`:161-162`) |
| `mxs,mys` | -999 | Smoothed cursor | `drawDots` (`:107`); snapped to the raw value on first entry (`:161`) |
| `bk` | undefined, then 0 | Eased "hide dots under the Index header" factor | `drawDots` (`:109`) |
| `focus` | -1 | Focused project index | `onFocus` (tint only) |
| `tint` | `[10,10,12]` | Tint ambience colour | loop (tint only) |
| `reduced` | — | `matchMedia('(prefers-reduced-motion: reduce)').matches`, read **once** on mount | `componentDidMount` (`:84`) |
| `state` | `{tick:0, viewReq:'', openReq:'', closeReq:''}`, plus `projReq` added later | Child request strings | `req()`, `openProject` |

### 2.1 Actions (verbatim)

```js
// :120
toWall(view) { this.pOpen = false; if (this.bookOpen) this.req('closeReq', 'close'); const away = this.c > 0.5; this.cT = 0; this.pS = 0; this.view = view; this.req('viewReq', away ? view + '!' : view); }
// :121
toShelf(contact) { this.pOpen = false; this.cT = 1; this.pW = 0; if (contact) { this.shelfSel = 'contact'; this.req('openReq', 'contact'); } else if (this.bookOpen) this.req('closeReq', 'close'); }
```

| Trigger | Effect |
|---|---|
| Click "Aedwon" or "Wall" | `toWall('wall')` |
| Click "Index" | `toWall('index')` |
| Click "About" | `toShelf(false)`: camera to the shelf; closes an open book (so About always lands on the closed shelf) |
| Click "Contact" | `toShelf(true)`: camera to the shelf and opens Vol. 06 |
| WallIndex2 `onPeek(p)` | Ignored unless `cT===0`. Sets `pW = p`; if `p >= 1`, calls `toShelf(false)` (`:191`) |
| AboutVolumes `onScrollOut(dy)` | Ignored unless `cT===1`. `pS = max(0, pS - dy/700)`, `pSAt = now`; if `pS >= 1`, calls `toWall(this.view)`, returning to whichever of Wall/Index you left (`:193`) |
| AboutVolumes `onOpen(o)` | `bookOpen = !!o; shelfSel = o==='contact' ? 'contact' : 'about'` (`:194`) |
| WallIndex2 `onOpen(i)` | `pn++; setState({projReq: i+'#'+pn}); pOpen = true` (`:176`) |
| ProjectSpread `onBack()` | `pOpen = false` (`:177`) |
| `keydown` Escape (window) | `if (pOpen) pOpen = false` (`:82`) |

Leaving a page while a project is open (any nav click) closes the project, because every `toWall`/`toShelf` sets `pOpen=false`. The wall's scroll position is never reset by Room. WallIndex2 keeps its own `cy`, so Back returns you to the same spot.

---

## 3. Animations

### 3.0 The frame loop (`:86-100`)

```js
const loop = (now) => {
  const dt = Math.min(0.05, (now - this.last) / 1000); this.last = now;
  if (this.pS && now - this.pSAt > 420) { this.pS *= Math.pow(0.05, dt); if (this.pS < 0.002) this.pS = 0; }
  const tgt = this.cT === 0 ? 0.35 * this.pW : 1 - 0.3 * this.pS;
  if (this.reduced) this.c = this.cT; else { this.cv += ((tgt - this.c) * 48 - this.cv * 14) * dt; this.c += this.cv * dt; }
  if (this.amb === 'dots') this.drawDots(dt);
  if (this.amb === 'tint') { ... }
  this.po = this.reduced ? (this.pOpen ? 1 : 0) : Math.max(0, Math.min(1, this.po + (this.pOpen ? 1 : -1) * dt / (this.pOpen ? 0.55 : 0.42)));
  this.setState({ tick: this.state.tick + 1 });
  this.raf = requestAnimationFrame(loop);
};
```

- `dt` is in seconds and **capped at 0.05**.
- Order inside each frame: pS decay, camera target, spring, dots (using the *new* `c` and the *previous* `po`), then the `po` update, then render.
- The loop runs forever, even when idle. (`canvas.json` lists "pause loops when idle / hidden" as a later production task.)

### 3.1 Camera spring

| Constant | Value |
|---|---|
| Stiffness k | **48** |
| Damping d | **14** (ζ = 14 / (2·√48) ≈ 1.010, just over critical, so no visible overshoot) |
| Mass | 1 |
| Integrator | Semi-implicit (symplectic) Euler: velocity first, then position with the new velocity |
| Target | `cT===0 ? 0.35*pW : 1 - 0.3*pS` |
| Reduced motion | `c = cT` directly (the 0.35/0.3 peek offsets are ignored, so no peek is shown) |

Measured by running the exact loop at 60 fps from 0 to 1: 50% at 0.233 s, 90% at 0.583 s, 99% at 1.050 s, 99.9% at 1.500 s. Max value 0.9999995, so no overshoot.

**Interruption and reversal.** Only the target changes; `c` and `cv` carry over. A reversal mid-flight is a continuous spring bounce-back with momentum. Nothing restarts from 0.

### 3.2 Camera-driven properties

Definitions (`:123-129`): `c` = raw camera, `cc = clamp01(c)`, `D = 740`, `po_e = po*po*(3-2*po)` (smoothstep of the linear project progress).

| Property | Element | Formula (verbatim) | Line |
|---|---|---|---|
| Wall `transform` | wall wrapper (origin 50% 100%) | `` `translateY(${(-0.55 * D * c).toFixed(2)}px) scale(${(1 - 0.035 * po).toFixed(4)})` `` where `po` = **eased** po_e | 129 |
| Wall `mask-image` | wall wrapper | `c < 0.002 ? 'none' : linear-gradient(to bottom, #000 0, #000 38%, rgba(0,0,0,${(1 - cl(c * 5)).toFixed(3)}) 88%)` | 169 |
| Wall `opacity` | wall wrapper | `((1 - cl((c - 0.3) / 0.45)) * (1 - po_e)).toFixed(3)` | 169 |
| Wall `visibility` | wall wrapper | `c > 0.999 ? 'hidden' : 'visible'` | 170 |
| Wall `pointer-events` | wall wrapper | `c < 0.5 && !pOpen ? 'auto' : 'none'` | 171 |
| Wall `aria-hidden` | wall wrapper | `c < 0.5 ? 'false' : 'true'` | 172 |
| Shelf `transform` | shelf wrapper (origin 50% 0) | `` `translateY(${(D * (1 - c)).toFixed(2)}px)` `` | 130 |
| Shelf `visibility` | shelf wrapper | `c < 0.001 ? 'hidden' : 'visible'` | 170 |
| Shelf `pointer-events` | shelf wrapper | `c < 0.5 ? 'none' : 'auto'` | 171 |
| Shelf `aria-hidden` | shelf wrapper | `c < 0.5 ? 'true' : 'false'` | 172 |
| `dim` prop to WallIndex2 | — | `cc.toFixed(3)` | 167 |
| `world` (window light only) | — | `(-D * c).toFixed(2) + 'px'` | 167 |

**Tip angle.** The tilt is *not* in Room's CSS. Room passes `dim = clamp(c)` and WallIndex2 adds it to every tile's rotateX (`WallIndex2.dc.html:509-510`):

```js
const dm = Math.max(0, Math.min(1, +this.props.dim || 0)), dme = dm * dm * (3 - 2 * dm);
const ax = lerp(this.ax0 - this.ms.y * 3 + (1 - zl) * -10, 0, pp) + 46 * dme, ...
```

So the extra tilt is `46° × smoothstep(cc)`, applied as `rotateX(ax deg)` on each tile (`:554`), inside WallIndex2's own `perspective: 2200px; perspective-origin: 50% 45%` (`WallIndex2.dc.html:52`). WallIndex2 also fades its chrome (caption and controls) with `chromeK = 1 - cl(dim * 6)`, so it is gone by c ≈ 0.167 (`WallIndex2.dc.html:594`).

Mask notes: the gradient has only 3 stops. The last stop's alpha also fills 88%–100%. When `c ≥ 0.2` the bottom 12% of the wall is fully transparent, and alpha ramps from opaque at 38% to that value at 88%.

Reference values (computed from the formulas, po = 0):

| c | wall translateY | shelf translateY | mask end alpha | wall opacity | extra tilt (46·smoothstep) | chromeK |
|---|---|---|---|---|---|---|
| 0 | 0 | 740 | (mask none) | 1 | 0° | 1 |
| 0.1 | -40.70 | 666.00 | 0.500 | 1 | 1.29° | 0.4 |
| 0.2 | -81.40 | 592.00 | 0.000 | 1 | 4.78° | 0 |
| 0.35 (max wall peek) | -142.45 | 481.00 | 0 | 0.889 | 12.96° | 0 |
| 0.5 | -203.50 | 370.00 | 0 | 0.556 | 23.00° | 0 |
| 0.7 (max shelf push, 1-0.3) | -284.90 | 222.00 | 0 | 0.111 | 36.06° | 0 |
| 0.75 | -305.25 | 185.00 | 0 | 0 | 38.81° | 0 |
| 1 | -407.00 | 0 | 0 | 0 (and visibility hidden above 0.999) | 46° | 0 |

The wall moves at 0.55× the shelf's speed (407 px vs 740 px), which gives parallax.

### 3.3 Scroll-peek: wall to shelf

Accumulation happens in **WallIndex2** (`WallIndex2.dc.html:381-384, 396-401`). Room only maps the result.

```js
peekAdd(d) { if (!this.props.onPeek || d <= 0) return; this.over = (this.over || 0) + d; this.overAt = performance.now(); }
wheel(e) {
  let d0 = e.deltaY; if (e.deltaMode === 1) d0 *= 16;
  if (this.kt === 1) { const ix = ...querySelector('.ix'); if (ix && ix.scrollTop + ix.clientHeight >= ix.scrollHeight - 2) this.peekAdd(d0); return; } // index
  if (this.tCy >= this.maxY - 2 && d0 > 0 && !this.state.zoomOut) this.peekAdd(d0);   // wall
  ...
// in its loop:
if (this.over && now - (this.overAt || 0) > 420) { this.over *= Math.pow(0.05, dt); if (this.over < 1) this.over = 0; }
const pk = Math.min(1, (this.over || 0) / 700);
if (Math.abs(pk - (this.pk || 0)) > 0.002 || (pk === 0 && this.pk)) { this.pk = pk; this.props.onPeek(pk); }
if (pk >= 1) { this.over = 0; }
```

| Parameter | Value |
|---|---|
| What counts | Only positive (downward) deltaY. On the Wall it counts only when the wall's scroll target is within 2px of its end (`tCy >= maxY-2`) and not zoomed out. On the Index it counts only when the `.ix` list is scrolled within 2px of the bottom. |
| Line mode | `deltaMode===1` gives ×16 |
| Commit distance | **700** px accumulated (pk = over/700, reaches 1) |
| Visual peek | Room target `c = 0.35 * pW`, so up to 35% of the camera travel |
| Hold time before decay | **420 ms** after the last counted wheel event |
| Decay | `over *= 0.05^dt` (multiplies by 0.05 per second, about 95% gone in 1 s); snaps to 0 below 1px |
| Emit threshold | onPeek is called when pk changes by more than 0.002, or once when it returns to 0 |
| Commit | Room: `if (p >= 1) this.toShelf(false)`, which sets cT=1 and pW=0. The spring carries on from ~0.35 to 1. |

### 3.4 Scroll-out: shelf to wall

AboutVolumes forwards raw wheel events only when **no volume is open** (`AboutVolumes.dc.html:222`): `if (this.active == null) { if (this.props.onScrollOut) { e.preventDefault(); this.props.onScrollOut(e.deltaY); } return; }`. `deltaMode` is **not** normalised here.

| Parameter | Value |
|---|---|
| Accumulation | `pS = max(0, pS - dy/700)`. Scrolling up (negative dy) increases pS; scrolling down decreases it, floored at 0 |
| Commit | `pS >= 1`, i.e. **700** px of net upward scroll, then `toWall(this.view)` (sets pS=0) |
| Visual peek | Room target `c = 1 - 0.3*pS`, so up to 30% back toward the wall |
| Hold before decay | **420 ms** after the last scroll-out (`now - pSAt > 420`) |
| Decay | `pS *= 0.05^dt`; snaps to 0 below 0.002 |
| On commit | `away = c > 0.5` is usually true (c ≈ 0.7), so viewReq gets `'!'` and WallIndex2 switches Wall/Index instantly if needed |

### 3.5 Nav underline

```js
// :131-133, :180
const X = { wall: 1052, index: 1124, about: 1220, contact: 1292 };
const top = X[this.view], bottom = X[this.shelfSel];
lineX: (lerp(top, bottom, cc) - 14).toFixed(2) + 'px',
```

- Element: 28×1.5 px at `left:0; top:58px`, moved with the CSS `translate` property (not `transform`). Its centre is at `lerp(top, bottom, cc)`.
- It is **driven only by the camera** (`cc`). Between the wall and shelf groups it glides with the spring, and it follows the peek: up to 35% toward the shelf item while you push past the last project.
- **Within one group the change is discrete.** Wall to Index, or About to Contact, happens while cc stays near 0 or 1, so the line **jumps** (no CSS transition on it). Reproduce the jump; do not add an ease.
- Before the camera reaches the shelf, the shelf end of the line follows `shelfSel`. On "Contact" it is set immediately. On "About" with a book open, `shelfSel` changes only when AboutVolumes reports `onOpen('')`.

Label colours (`:134`, `:181-184`): `col(on) = on ? '#EDEDED' : '#8A8A93'`, with `near = c < 0.5`:

| Button | lit when | aria-current |
|---|---|---|
| Wall | `near && view==='wall'` | `'page'` else `'false'` |
| Index | `near && view==='index'` | same |
| About | `!near && shelfSel==='about'` | same |
| Contact | `!near && shelfSel==='contact'` | same |

The colour changes ease with `transition: color .3s ease` (`.rn`). The lit item flips at c = 0.5, partway through the camera move.

### 3.6 Project open and close

| Item | Value |
|---|---|
| Progress | `po` is a **linear** ramp: +dt/0.55 while open (0.55 s), −dt/0.42 while closing (0.42 s), clamped to [0,1] (`:97`) |
| Easing | `po_e = po*po*(3-2*po)` (smoothstep) in `renderVals` (`:128`) |
| Reversal | Continuous. The ramp just changes direction from wherever it is; no restart |
| Reduced motion | `po = pOpen ? 1 : 0` (instant) |

| Animated property | Formula | Line |
|---|---|---|
| Project layer `opacity` | `po_e.toFixed(3)` | 174 |
| Project layer `translate` | `0 ${((1 - po_e) * 26).toFixed(1)}px` (rises 26 px into place) | 174 |
| Project layer `visibility` | `po > 0.001 ? 'visible' : 'hidden'` (raw po) | 174 |
| Project layer `pointer-events` | `pOpen ? 'auto' : 'none'` (switches immediately) | 174 |
| Project layer `aria-hidden` | `pOpen ? 'false' : 'true'` | 174 |
| Wall scale | `1 - 0.035 * po_e`, so 0.965 when open, with origin 50% 100% (bottom centre) | 129 |
| Wall opacity | multiplied by `(1 - po_e)`, so 0 when open | 169 |
| Wall pointer-events | `'none'` while `pOpen` | 171 |
| Dots alpha | multiplied by `(1 - 0.75 * po)` using the **raw linear** po, not po_e, so 25% at rest while open | 112 |

The project content swap and its own internal fade are inside ProjectSpread. Room sends `projReq` in the same click that sets `pOpen = true`.

### 3.7 Dots canvas (the approved ambience)

```js
// :104-118
drawDots(dt) {
  const cv = this.cvs || (this.cvs = document.querySelector('[data-dots="' + this.uid + '"]'));
  if (!cv) return; const g = cv.getContext('2d'); g.clearRect(0, 0, 1440, 900);
  this.mxs += (this.mx - this.mxs) * Math.min(1, dt * 10); this.mys += (this.my - this.mys) * Math.min(1, dt * 10);
  const S = 30, off = ((-740 * this.c * 0.55) % S + S) % S;
  const band = this.view === 'index' && this.c < 0.5 ? 1 : 0; this.bk = (this.bk || 0) + (band - (this.bk || 0)) * Math.min(1, dt * 6);
  for (let y = off - S; y < 900 + S; y += S) for (let x = 15; x < 1440; x += S) {
    const dx = x - this.mxs, dy = y - this.mys, d = Math.sqrt(dx * dx + dy * dy), w = Math.max(0, 1 - d / 200), e = w * w * (3 - 2 * w);
    let a = (0.075 + 0.33 * e) * (1 - 0.75 * (this.po || 0));
    if (x < 1040 && y < 262) a *= 1 - this.bk;
    const push = 5 * e / Math.max(d, 1);
    g.fillStyle = 'rgba(237,237,237,' + a.toFixed(3) + ')';
    g.beginPath(); g.arc(x + dx * push, y + dy * push, 1 + 0.6 * e, 0, 6.283); g.fill();
  }
}
```

| Parameter | Value |
|---|---|
| Canvas | 1440×900 bitmap, CSS 1440×900. **No devicePixelRatio scaling** |
| Grid spacing S | 30 px |
| Columns | x = 15, 45, …, 1425 (48 columns) |
| Rows | y from `off-30` while `y < 930`, step 30 (drawn above and below the edges so wrapping is seamless) |
| Vertical drift | `off = ((-407·c) mod 30 + 30) mod 30`, the same 0.55×740 rate as the wall's translateY. Implemented as a wrapping offset, so the grid looks infinite |
| Base alpha | 0.075 (dark), 0.11 (light) |
| Cursor alpha boost | +0.33·e (dark), +0.30·e (light). Peak 0.405 / 0.41 |
| Influence | `w = max(0, 1 - d/200)` (radius **200 px**), `e = smoothstep(w) = w²(3-2w)` |
| Radius | `1 + 0.6·e` (1 px to 1.6 px) |
| Push | displacement = `(dx,dy) · 5e/max(d,1)`, i.e. **5·e px radially away** from the cursor (max 5 px, near the cursor) |
| Cursor smoothing | exponential lerp: `mxs += (mx - mxs)·min(1, 10·dt)` (rate 10/s) |
| First entry | `track` snaps `mxs/mys` to the raw position if `mxs < -900` (`:161`) |
| Leave | `untrack` sets `mx = my = -999`. The smoothed point glides off toward (-999,-999) at the same rate, so the bloom drifts up and left and fades instead of switching off. Once `mxs < -900` the next entry snaps again |
| Cursor coords | `(clientX - rect.left) * 1440 / rect.width`, `(clientY - rect.top) * 900 / rect.height` on the room root, so it works at any display scale |
| Project dimming | `× (1 - 0.75·po)` (raw linear po) |
| Header-band hide | `band = (view === 'index' && c < 0.5) ? 1 : 0`; `bk += (band - bk)·min(1, 6·dt)`; dots with `x < 1040 && y < 262` get `a *= 1 - bk`. This is the Index's frozen header rectangle |
| Fill | dark `rgba(237,237,237,a.toFixed(3))`; light `rgba(17,17,20,a.toFixed(3))` |
| Arc | `arc(x, y, r, 0, 6.283)` (not exactly 2π; harmless) |
| Reduced motion | **Not handled in code.** Dots still smooth, react to the cursor and drift with the (now instant) camera. The Spec board says "the points stay still" under reduced motion, which contradicts the code. Flag this and confirm with design. |

### 3.8 Other timed bits in this file

| Item | Value |
|---|---|
| `.rn` colour | `transition: color .3s ease` |
| Book shadow span (gallery only) | `transition: opacity .5s ease` |
| Tint ambience (unused) | `tint += (tgt - tint)·min(1, 2.2·dt)`; target = `[10,10,12] + (accent - [10,10,12])·0.07` for the focused project while `c < 0.5` |

### 3.9 Reduced motion summary (as coded)

| System | Behaviour |
|---|---|
| Camera | `c = cT` (instant jump, no peek offsets) |
| Project | `po` instant 0/1 |
| Nav underline | Follows `c`, so it jumps too |
| Nav colour | `.3s` CSS transition still runs (not media-queried) |
| Dots | Unchanged (see 3.7) |
| `bk` header fade | Still eased at 6/s |
| Detection | Read once on mount, so a live OS change is not picked up |

---

## 4. Interaction details

| Input | Where handled | Behaviour |
|---|---|---|
| Wheel/trackpad on the wall | WallIndex2's own non-passive `wheel` listener on its root | Scrolls the wall; overscroll at the end feeds the peek (§3.3). Room has **no wheel listener of its own** |
| Wheel at the bottom of the Index list | WallIndex2 | Native scroll; overscroll at the bottom feeds the peek |
| Wheel on the shelf (no book open) | AboutVolumes, which forwards `deltaY` and calls `preventDefault` | §3.4 |
| Wheel inside an open book | AboutVolumes | Turns pages; never reaches Room |
| Mouse move / leave on the room root | Room `track`/`untrack` | Dots cursor (works even over the nav and project, because the canvas has `pointer-events:none` and the handler is on the root) |
| Escape (window keydown) | Room | Closes the project if open. Nothing else |
| Nav buttons | `<button>` with onClick | §2.1. Keyboard Enter/Space by default |
| Theme | `<a href>` | Full navigation to the other theme's page |

Hit areas: nav buttons 72×44 (brand: auto width × 44; theme link 44×44). Nav bar 84 px high, painted over everything, so it blocks clicks to the top 84 px of the wall, shelf and project.

Hover: `.rn:hover { color:#EDEDED }` (light: `#111114`), eased by the .3s colour transition. No hover effect on the underline.

Focus: `.rn:focus-visible { outline: 2px solid #EDEDED; outline-offset: 2px; border-radius: 4px }` (light: `#111114`).

Pointer gating: the wall takes events only when `c < 0.5 && !pOpen`; the shelf only when `c >= 0.5`; the project layer only while `pOpen`. Inactive layers keep `visibility:visible` until their thresholds (0.999 / 0.001), so they stay painted but are not clickable.

---

## 5. Colours and typography

### 5.1 Room (dark)

| Token | Value | Use |
|---|---|---|
| Wall / room bg (`wallC`, dots/none/window) | `#0a0a0c` | root background, `wallColor` prop |
| Nav bg | `wallC + 'b8'` = `#0a0a0cb8` (alpha 184/255 ≈ 0.722) | plus `backdrop-filter: saturate(180%) blur(20px)` |
| Text / active nav / brand / underline / hover / focus ring | `#EDEDED` | |
| Inactive nav, theme icon | `#8A8A93` | |
| Divider | `#2a2a30` | |
| Dots | `rgba(237,237,237,a)` | |
| Gallery wall (unused) | `#17171b` | |
| Book shadow (gallery only) | `rgba(0,0,0,0.5)`, `blur(26px)`, radius 6, at 556,262 size 470×516 | |
| Project accents `ACC` (tint only) | `#3DA6F5 #5865F2 #E0567A #D97757 #3DDC84 #E70488 #3178C6 #F2C14E #2F6BD9 #5865F2 #5865F2 #2FA866 #F0B45A #7B5BE6 #FF7A45 #2496ED #3E73D6` | |

Typography: Geist (fallback `system-ui, sans-serif`), antialiased. Nav 14px, inherited weight (400). Brand 16px / 600 / -0.02em. No line-height is set; the 44px button height centres the text.

### 5.2 Light variant (full diff of RoomLight vs Room)

| Line | Room | RoomLight |
|---|---|---|
| 5 title | "The room — wall above, shelf below" | "(light) The room — wall above, shelf below" |
| 15 `.rn:hover` | `#EDEDED` | `#111114` |
| 16 focus outline | `#EDEDED` | `#111114` |
| 19 root `color` | `#EDEDED` | `#111114` |
| 26 wall child | `WallIndex2` | `WallIndex2Light` |
| 32 book shadow | `rgba(0,0,0,0.5)` | `rgba(17,17,20,0.175)` |
| 33 shelf child | `AboutVolumes` | `AboutVolumesLight` |
| 47 project child | `ProjectSpread` | `ProjectSpreadLight` |
| 52 brand `--c` | `#EDEDED` | `#111114` |
| 55 divider | `#2a2a30` | `#D6D4CD` |
| 58 underline | `#EDEDED` | `#111114` |
| 59 theme link `--c` | `#8A8A93` | `#6A6A72` |
| 77 ACC[12] | `#F0B45A` | `#B7791F` |
| 112 dot alpha | `(0.075 + 0.33*e)` | `(0.11 + 0.30*e)` |
| 115 dot fill | `rgba(237,237,237,…)` | `rgba(17,17,20,…)` |
| 134 nav colours | on `#EDEDED` / off `#8A8A93` | on `#111114` / off `#6A6A72` |
| 149 wall colour | gallery `#17171b`, default `#0a0a0c` | gallery `#EEEDE8`, default `#F2F1ED` |

So the light nav bg is `#F2F1EDb8`. Every motion constant is identical. Nothing else differs; for example, the tint start `[10,10,12]` is unchanged in light, which is a latent bug that does not matter because tint is unused.

### 5.3 Ambience variants (exist, NOT approved; build only `dots`)

| Value | What it does |
|---|---|
| `none` | No canvas, wall `#0a0a0c` |
| `gallery` | Wall `#17171b`; passes `shadow=true` to WallIndex2 (which disables it anyway: `this.props.shadow && false`, `WallIndex2.dc.html:555`); shows the book shadow span while no book is open |
| `dots` | **Approved.** §3.7 |
| `tint` | Wall colour leans 7% toward the focused project's accent (`ACC`) |
| `window` | Manila-time window light patch (6 blurred, skewed panes, screen-blended), positioned by hour (`:135-147`) |

---

## 6. Gotchas (things that cause drift if rebuilt naively)

1. **The tilt lives in WallIndex2, not Room.** Room's root has `perspective:1800px`, but the wall wrapper only translates and scales and has no `preserve-3d`, so that perspective has no effect on the wall. The 46° tip is `46·smoothstep(dim)` added to each tile's rotateX inside WallIndex2's own `perspective:2200px; origin 50% 45%`. Pass `dim = clamp(c)` exactly.
2. **Two different easings of `po`.** Wall scale/opacity and project opacity/translate use smoothstep(po). The dots' dimming uses the raw linear po. The project's visibility uses raw `po > 0.001`.
3. **Open and close durations differ** (0.55 s vs 0.42 s). It is a linear ramp, so a reversal continues from the current value rather than restarting a tween.
4. **Spring integration order.** Use semi-implicit Euler with dt capped at 0.05 s, not a CSS transition or a fixed-duration tween. Using `framer-motion`'s spring with stiffness 48 / damping 14 / mass 1 will be close but not identical; for 1:1, run the same per-frame code.
5. **The spring target includes peek offsets** (`0.35·pW`, `1-0.3·pS`). The camera physically moves during peek, and the nav underline, mask, tilt and dots all follow it.
6. **Raw `c` vs clamped `cc`.** Transforms, mask, opacity and the dots offset use raw `c`. `dim` and the underline use `clamp(c)`. Keep the split.
7. **The mask has only 3 stops**, and the last stop's alpha also covers 88–100%. With `c ≥ 0.2` the bottom 12% is fully transparent. Switch it off (`none`) below c = 0.002, or a 1-px seam can show.
8. **Transform origins**: wall `50% 100%` (it scales toward its bottom edge); shelf `50% 0`.
9. **The underline jumps within a group** (Wall to Index, About to Contact). It is driven only by `cc`. Do not add a CSS transition. It also uses the CSS `translate` property; if you combine it with `transform`, the order is translate first.
10. **Nav lit state flips at c = 0.5**, not when the move ends. The colour itself eases over .3 s.
11. **`'!'` suffix on viewReq** when leaving from the shelf (`c > 0.5`): WallIndex2 must switch Wall/Index instantly, with no 1.5 s fold, because the change happens out of sight.
12. **Request nonces.** Repeated identical commands must still fire. Project requests use their own counter.
13. **"About" closes an open book.** "Contact" opens Vol. 06 through `openReq='contact'`, which AboutVolumes treats as "last volume". `shelfSel` for About is updated by the child's `onOpen` callback, not by the click.
14. **Scroll-out uses raw deltaY** (no deltaMode×16), while the wall peek normalises line mode ×16. Both commit at 700 and both hold 420 ms before decaying at `0.05^dt`. The wall decay snaps to zero below 1 px; the shelf below 0.002 (in units of 0..1).
15. **Room has no wheel listener.** Peek input exists only where the children forward it: the wall at the end of its scroll, the Index at the bottom of its list, and the shelf with no book open.
16. **Dots drift equals the wall's translate rate** (0.55×740 = 407 px per unit of c), even though the source comment says "a little slower". The comment means slower than the shelf. It is a modulo-30 offset, not a translated canvas.
17. **The dots canvas is not DPR-scaled** (1440×900 bitmap). On retina it is soft and dots are about 1 CSS px. If you scale for DPR, keep the CSS-px radii (1 to 1.6) and the 0.075 alpha, or the look changes.
18. **Cursor leave glides away, it does not vanish.** The smoothed cursor eases toward (-999,-999). The first move after that snaps.
19. **Header-band hide** is the rectangle `x < 1040 && y < 262` in canvas coordinates. It is eased at 6/s and tied to `view==='index' && c<0.5`.
20. **Esc is global and also reaches WallIndex2.** WallIndex2's own keydown in Index view clears the find query or filter on Escape. One Esc with a project open over the Index will also clear the query/filter underneath. ProjectSpread also listens globally for ArrowLeft/Right (prev/next project), even while hidden. Decide in production whether to scope these; the reference does not.
21. **The nav is above the project layer** (DOM order, no z-index) and stays interactive while a project is open. Nav clicks close the project.
22. **Reduced motion** is read once and does not affect dots or the 0.3 s colour transition. The Spec board's "points stay still" is not implemented.
23. **Always-on rAF with a re-render every frame.** The behaviour depends on per-frame recomputation (decays, smoothing). If you optimise with idle pausing, resume before any decay or smoothing is due.
24. **The light theme is a separate file with separate children**, not a token swap. Dots in light have a higher base alpha (0.11) and a lower boost (0.30).
25. **Spec board text vs code**: "1px points at 7.5%, brighten to 40%" matches 0.075 and 0.405. "Up to 46°", "55% of 740px", "35% peek", "700px" and "26px, 0.55s smoothstep, 96.5%, closing 0.42s" all match the code.
