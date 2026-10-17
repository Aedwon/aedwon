# Moments: First load and 404

Source: `reference/components/Moments.dc.html` (one component with prop `which` = `"loading"` | `"404"`, default `"loading"`, `Moments.dc.html:63`). The boards `Moments_loading.dc.html` and `Moments_404.dc.html` only mount it at 1440 × 900 with `which="loading"` / `which="404"`.

All numbers below are in design pixels on the 1440 × 900 desktop frame. Only the dark theme exists for this component (see the Light note at the end).

---

## 0. Shared shell

| Property | Value | Source |
|---|---|---|
| Frame | `position: relative; width: 1440px; height: 900px; overflow: hidden` | `Moments.dc.html:20` |
| Background | `#0a0a0c` (Room) | `:20` |
| Text colour | `#EDEDED` | `:20` |
| Font | `'Geist', system-ui, sans-serif`, `-webkit-font-smoothing: antialiased` | `:20` |
| Fonts loaded | Geist 400/500/600/700/800, Geist Mono 400/500 (Google Fonts, `display=swap`) | `:11` |
| Points canvas | `<canvas width="1440" height="900" aria-hidden="true">`, `position: absolute; inset: 0; pointer-events: none`, sits under all content | `:21` |
| Pointer tracking | `onMouseMove` / `onMouseLeave` on the frame (see section 3) | `:20`, `:108-109` |
| Focus ring (links) | `a:focus-visible{outline:2px solid #EDEDED;outline-offset:3px}` | `:17` |

### Frame clock

One `requestAnimationFrame` loop drives both the canvas and the DOM values (`:73-75`):

```js
const loop = (now) => { const dt = Math.min(0.05, (now - last) / 1000); last = now; this.draw(dt); this.setState({ tick: this.state.tick + 1 }); this.raf = requestAnimationFrame(loop); };
```

- `dt` is clamped to 0.05 s.
- The timeline clock `T` (`:79`):

```js
T() { const t = (performance.now() - this.t0) / 1000; return this.props.which === '404' || this.reduced ? 99 : t % 5.5; }
```

  - `t0` is set in the constructor (`:69`).
  - **Canvas board:** `t % 5.5` makes the load sequence loop every 5.5 s so it can be watched (comment at `:78`: "the loading sequence replays every 5.5s here so you can watch it; on the site it plays once").
  - **Production:** play the sequence **once**. Do not apply `% 5.5`. After it ends, hold the end state and hand over to the real Room.
  - On 404 and under reduced motion, `T` is pinned to `99`, so every load value is already at its end state.

### Easing helpers (`:99`)

```js
const cl = (x) => Math.max(0, Math.min(1, x)), out = (x) => 1 - Math.pow(1 - cl(x), 3);
```

`out` is a clamped ease-out cubic.

---

## 1. First load (`which = "loading"`)

### 1.1 Layout

| Element | Spec | Source |
|---|---|---|
| Centre stack | `position: absolute; left: 50%; top: 50%; translate: -50% -50%; display: flex; flex-direction: column; align-items: center; gap: 22px` · `opacity: ld.op` · `scale: ld.s` | `:25` |
| Name | "Aedwon", `font-size: 30px; font-weight: 600; letter-spacing: -0.035em` | `:26` |
| Hairline track | `width: 120px; height: 1px; background: #1f1f24; overflow: hidden` (`aria-hidden`) | `:27` |
| Hairline fill | `position: absolute; left:0; top:0; bottom:0; width: 120px; background: #EDEDED; transform-origin: 0 50%; scale: ld.bar 1` | `:27` |
| Nav bar | `position: absolute; left: 0; right: 0; top: 0; height: 84px; padding: 0 56px; display: flex; justify-content: space-between; align-items: center; opacity: ld.nav` | `:29` |
| Nav wordmark | "Aedwon", `16px / 600 / -0.02em` | `:30` |
| Nav links | flex, `gap: 36px; font-size: 14px; color: #8A8A93`. Items: **Wall** (current, `color: #EDEDED`), Index, divider (`width: 1px; height: 16px; background: #2a2a30`), About, Contact | `:31` |
| Note slot | `position: absolute; left: 56px; bottom: 40px;` Geist Mono `12px`, `#61616A`, content `ld.note` | `:33` |

`ld.note` is `T < 1.5 ? '' : ''` (`:106`), so it is always empty. The slot exists but has no copy in the source.

The load-screen nav has no theme toggle and no travelling underline. Those belong to the Room nav (`Room.dc.html:51-60`). This nav is a stand-in that fades into the place where the Room nav will be.

### 1.2 Timeline (seconds, `T` from first frame)

Values from `renderVals()` (`:100-106`):

```js
const bar = out(T / 1.4);                                 // stands in for real loading progress
const gone = out((T - 1.5) / 0.5);
ld: { op: (out(T / 0.4) * (1 - gone)).toFixed(3), s: (1 - 0.04 * gone).toFixed(4), bar: bar.toFixed(3), nav: out((T - 2.0) / 0.6).toFixed(3), ... }
```

| Channel | Formula | Starts | Ends | End value |
|---|---|---|---|---|
| Name + bar opacity (in) | `out(T / 0.4)` | 0.0 | 0.4 | 1 |
| Hairline fill `scaleX` | `bar = out(T / 1.4)` | 0.0 | 1.4 | 1 |
| Exit `gone` | `out((T − 1.5) / 0.5)` | 1.5 | 2.0 | 1 |
| Centre stack opacity | `out(T/0.4) × (1 − gone)` | — | 2.0 | 0 |
| Centre stack scale | `1 − 0.04 × gone` | 1.5 | 2.0 | 0.96 |
| Points ring radius `R` | `max(0, T − 1.6) × 900` px/s | 1.6 | ≈2.70 (all points fully on, see below) | — |
| Nav opacity | `out((T − 2.0) / 0.6)` | 2.0 | 2.6 | 1 |
| (board only) loop | `t % 5.5` | — | 5.5 | restarts |

**Production: the bar tracks real loading.** In the source, `bar = out(T / 1.4)` "stands in for real loading progress" (`:101`). In production:

- Drive the fill's `scaleX` from actual load progress (0 → 1, e.g. fonts plus first-view assets).
- Start the exit (`gone`, 0.5 s ease-out cubic, 1 → 0.96 scale, fade to 0) once progress reaches 1.
- Keep the source's offsets *relative to the exit start*. If `t_done` is the moment progress hits 1 (it is 1.4 s on the board), then:
  - exit begins at `t_done + 0.1` (board: 1.5)
  - points start at `t_done + 0.2` (board: 1.6)
  - nav fades in from `t_done + 0.6` for 0.6 s (board: 2.0–2.6)

  These relative offsets come straight from the board numbers. The source has no other rule for an early or slow finish.

### 1.3 Points switching on from the centre (`draw()`, `:80-96`)

Grid:

```js
for (let y = 15; y < 900; y += 30) for (let x = 15; x < 1440; x += 30) {
```

That gives a 30 px pitch, offset 15 px, 48 columns × 30 rows (1440 points). Each frame starts with `clearRect(0,0,1440,900)`.

Per point:

| Quantity | Formula | Source |
|---|---|---|
| Ring radius | `R = loading ? Math.max(0, (T - 1.6)) * 900 : 9999` | `:86` |
| Distance from centre | `r = Math.hypot(x - 720, y - 450)` | `:88` |
| Switch-on factor | `on = clamp((R - r) / 160, 0, 1)`. The point is skipped if `on <= 0` | `:88-89` |
| Cursor falloff | `dx = x − mxs, dy = y − mys, d = √(dx²+dy²)`, `w = max(0, 1 − d/200)`, `e = w·w·(3 − 2w)` (smoothstep) | `:90` |
| Leading-edge wave | `wave = loading ? max(0, 1 − |R − r − 40| / 90) × 0.35 : 0` | `:91` |
| Alpha | `a = (0.075 + 0.33·e + wave) × on` | `:92` |
| Push (lean away from cursor) | `push = 5·e / max(d, 1)`. Draw at `(x + dx·push, y + dy·push)`, which is a displacement of up to 5 px | `:93`, `:95` |
| Radius | `1 + 0.6·e` px | `:95` |
| Fill | `'rgba(237,237,237,' + a.toFixed(3) + ')'` | `:94` |

How it reads:

- The ring expands from the frame centre (720, 450) at 900 px/s.
- Each point fades from 0 to its resting 7.5 % alpha over the 160 px just inside the ring front.
- A bright band (up to +0.35 alpha) rides 40 px inside the front, with a ±90 px triangular falloff.
- The farthest point is (15, 15) / (1425, 885), at r ≈ 828.4. It is fully on when `R ≥ 988.4`, i.e. `T ≈ 2.70 s`. The wave has passed it when `R − r − 40 ≥ 90`, i.e. `R ≥ 958.4`.
- After that, the field is the steady wall field: 7.5 % at rest, brightening toward the cursor. This matches the Room's points, `Room.dc.html:111-116`.

---

## 2. 404 (`which = "404"`)

Concept, from the comment at `:36`: "an empty spot on the wall. A nail, and the clean patch where a frame used to hang". The frame hangs crooked from its nail and sways a little (`:42`).

### 2.1 Nav (static, fully visible)

| Element | Spec | Source |
|---|---|---|
| Bar | same box as load nav: `top: 0; height: 84px; padding: 0 56px; flex; space-between; center` (no opacity channel) | `:38` |
| Wordmark | `<a href="Main.dc.html">` "Aedwon", `16px / 600 / -0.02em; color: #EDEDED; text-decoration: none` (links to the Wall) | `:39` |
| Links | `gap: 36px; 14px; #8A8A93`. Wall, Index, divider `1×16 #2a2a30`, About, Contact. **None is marked current** | `:40` |

### 2.2 The picture (all `aria-hidden="true"`)

DOM order, bottom to top: dashed outline, swinging frame group, nail.

| Layer | Box | Style | Source |
|---|---|---|---|
| Clean patch / dashed outline | `left: 540px; top: 196px; width: 360px; height: 230px; box-sizing: border-box` | `border-radius: 4px; border: 1.5px dashed #4a4a52; background: #0f0f12` | `:43` |
| Swing group | `left: 540px; top: 146px; width: 360px; height: 280px` | `transform-origin: 180px 4px; rotate: {{ e.tilt }}deg` | `:44` |
| └ Strings (SVG) | `width="360" height="56" viewBox="0 0 360 56"`, `left:0; top:0; overflow: visible` | `<path d="M180 4 L22 52 M180 4 L338 52" stroke="#8A8A93" stroke-width="1.2" fill="none" stroke-linecap="round">`: two straight wires from the nail to the frame's top corners | `:45` |
| └ Frame | `left: 0; top: 50px; width: 360px; height: 230px; box-sizing: border-box; padding: 14px` | `border-radius: 3px; background: #232329; border: 1px solid #5a5a63; box-shadow: 0 30px 60px rgba(0,0,0,.45)` | `:46` |
| └└ Mat / inner | `width: 100%; height: 100%; box-sizing: border-box` | `border: 1px solid #4a4a52; background: #141418; display: flex; align-items: center; justify-content: center` | `:47` |
| └└└ Label | "404" | `font-family: 'Geist Mono'; font-size: 46px; font-weight: 500; letter-spacing: -0.02em; color: #71717A` | `:48` |
| Nail | `left: 716px; top: 146px; width: 8px; height: 8px` | `border-radius: 99px; background: #C4C4CC; box-shadow: 0 2px 4px rgba(0,0,0,.6)` | `:52` |

Geometry checks, derived from the numbers above:

- The pivot `transform-origin: 180px 4px` inside the group at (540, 146) is the page point **(720, 150)**. That is the nail's centre (716 + 4, 146 + 4) and the strings' apex (`M180 4`).
- The frame's top edge sits at group y = 50. The strings end at y = 52 at x = 22 and x = 338, 22 px inside each frame edge.
- Hanging straight, the frame would be at page (540, 196) to (900, 426). That is exactly the dashed outline, so the outline is "where it hung straight".

### 2.3 Sway formula (`:107`)

```js
e: { tilt: (-7 + (this.reduced ? 0 : Math.sin(now * 1.15) * 1.3)).toFixed(3), ... }
```

where `now = performance.now() / 1000` (`:103`).

| Quantity | Value |
|---|---|
| Rest tilt | −7° (counter-clockwise) |
| Amplitude | ±1.3°, so the range is −8.3° to −5.7° |
| Angular speed | 1.15 rad/s, period 2π / 1.15 ≈ 5.46 s |
| Reduced motion | fixed at −7° |

Note: `renderVals` also computes `e.string` (`:107`, a quadratic path `M260 6 Q …` swinging with `sin(now*1.4)`). **Nothing in the markup uses it.** The strings are the static path at `:45`. Do not build `e.string`.

### 2.4 Copy and buttons

| Element | Spec | Source |
|---|---|---|
| Block | `position: absolute; left: 0; right: 0; top: 520px; display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center` | `:53` |
| Headline | "Page not found." `font-size: 40px; font-weight: 600; letter-spacing: -0.04em; line-height: 1.05` | `:54` |
| Button row | `display: flex; gap: 12px; margin-top: 14px` | `:55` |
| Primary `.mb.pri` | "Back to the wall", `href="Main.dc.html"`. `height: 46px; padding: 0 20px; display: flex; align-items: center; border-radius: 12px; background: #EDEDED; color: #0a0a0c; font-size: 14.5px; font-weight: 600; text-decoration: none` | `:56` |
| Secondary `.mb` | "Open the Index", `href="Main.dc.html"` in the prototype. `height: 46px; padding: 0 20px; display: flex; align-items: center; border-radius: 12px; border: 1px solid #26262c; color: #EDEDED; font-size: 14.5px; text-decoration: none` (weight inherits 400) | `:57` |

Routing: in the prototype both buttons point at `Main.dc.html`. In production:

- the primary goes to `/` (Wall);
- the secondary goes to `/index`. The route is defined in `Spec.dc.html:39`, and the label says Index.

### 2.5 Hover and focus (`:14-17`)

```css
.mb{transition:background-color .2s ease,border-color .2s ease,color .2s ease}
.mb:hover{border-color:#3a3a42;background-color:#121215}
.mb.pri:hover{background-color:#ffffff}
a:focus-visible{outline:2px solid #EDEDED;outline-offset:3px}
```

| State | Primary | Secondary |
|---|---|---|
| Rest | bg `#EDEDED`, text `#0a0a0c` | border `#26262c`, transparent bg, text `#EDEDED` |
| Hover | bg `#ffffff` (the `.mb:hover` border change has no visible effect because the primary has no border) | border `#3a3a42`, bg `#121215` |
| Transition | 0.2 s ease on background-color, border-color, color | same |
| Focus-visible | 2 px `#EDEDED` outline, 3 px offset | same |

### 2.6 Points reacting to the cursor

The same canvas code as the load screen runs with `loading = false`:

- `R = 9999` and `wave = 0` (`:86`, `:91`), so every point is on (`on = 1`) from the first frame.
- Alpha is `0.075 + 0.33·e`, so 7.5 % at rest and up to 40.5 % right under the cursor.
- Points within 200 px of the cursor brighten, grow to 1.6 px radius and lean up to 5 px away (formulas in 1.3).

Cursor smoothing (`:83`, `:108-109`):

```js
this.mxs += (this.mx - this.mxs) * Math.min(1, dt * 10); this.mys += (this.my - this.mys) * Math.min(1, dt * 10);
track: (ev) => { const r = ev.currentTarget.getBoundingClientRect(); this.mx = (ev.clientX - r.left) * 1440 / r.width; this.my = (ev.clientY - r.top) * 900 / r.height; if (this.mxs < -900) { this.mxs = this.mx; this.mys = this.my; } },
untrack: () => { this.mx = -999; this.my = -999; }
```

- The pointer is mapped into the 1440 × 900 design space, so it scales with the frame.
- Smoothing is exponential toward the target at rate 10/s, clamped to ≤ 1 per frame.
- On first entry, the smoothed point snaps to the pointer.
- On leave, the target moves to (−999, −999), so the highlight glides off the top-left and fades out instead of vanishing.

The same tracking applies on the load screen.

---

## 3. Reduced motion

Detection is `window.matchMedia('(prefers-reduced-motion: reduce)').matches`, read once on mount (`:72`).

| What | Behaviour in source |
|---|---|
| Load sequence | `T()` returns 99 (`:79`), so the end state shows immediately: name and bar hidden (`op = 0`), bar full, nav at opacity 1, every point on, no wave. |
| 404 sway | `tilt = -7` fixed (`:107`). |
| Production | Show the end state at once. Under reduced motion the hairline is never visible, because the end state hides it, so real-progress tracking does not apply. |

Discrepancy to resolve: the canvas cursor reaction is **not** gated by `reduced` in `Moments.dc.html:83-95`, and the Room is the same (`Room.dc.html:104-117`). `Spec.dc.html:85` says "Every transition jumps to its end state; the points stay still". Follow the Spec in production: under reduced motion, draw the static 7.5 % field with no brighten and no push.

---

## 4. Light theme

`generators/light.py` does not convert `Moments` (it processes only WallIndex2, ProjectSpread, AboutVolumes and Room, `light.py:72-102`), so no light Moments board exists. If a light first-load and 404 are built, apply the same role map as everywhere else (see `tokens.md`). That includes the points: fill `rgba(17,17,20,a)`, and the base alpha formula changes as in `light.py:31`. The source gives no light-specific values beyond that map.
