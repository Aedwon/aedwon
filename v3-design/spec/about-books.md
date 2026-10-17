# About shelf ("Volumes") + BookPage: implementation spec

Sources (all line refs are to these files):
- `AV` = `reference/components/AboutVolumes.dc.html` (dark, canonical)
- `BP` = `reference/components/BookPage.dc.html`
- `AVL` = `reference/components/AboutVolumesLight.dc.html` (light variant; same line numbers as AV, see section 6)

Everything is laid out on a fixed **1440 x 900** artboard (AV:30). Every number below is in artboard px. Scale the whole stage if the viewport differs; do not re-flow it.

The whole thing is one `requestAnimationFrame` loop (AV:232-255) that advances a handful of scalars, then a pure function (`renderVals`, AV:288-437) turns those scalars into CSS transforms and shade opacities. Rebuild it the same way: one rAF loop, state in refs, and transforms derived from that state on every frame. Do not use CSS transitions or springs from a library for anything in sections 3.1 to 3.9.

---

## 1. Structure

### 1.1 Stage / 3D scene

| Element | Line | Styles |
|---|---|---|
| Root | AV:30 | `position:relative; width:1440px; height:900px; overflow:hidden; background:#0a0a0c` (transparent when `bare`); `color:#EDEDED; font-family:'Geist',system-ui,sans-serif; -webkit-font-smoothing:antialiased; perspective:2600px; perspective-origin:50% 46%` (that is 720px, 414px). Has the `onMouseMove`/`onMouseLeave` (parallax) and the non-passive `wheel` listener. |
| Room layer (flat, 2D) | AV:33 | `position:absolute; inset:0; opacity:{room.op}; translate:0 {room.y}`, `aria-hidden` |
| 3D world | AV:46 | `position:absolute; inset:0; transform-style:preserve-3d; pointer-events:none`. It holds all 6 books as siblings, so they share **one** 3D context and sort against each other correctly. |
| "Shelved." block | AV:117 | 2D, above the world |
| Hit buttons | AV:124-126 | 2D, transparent, above the world |
| Reading bar | AV:129 | 2D |
| Nav | AV:138 | 2D, top |

DOM order is paint order for the 2D layers: room, world, done text, hits, bar, nav.

### 1.2 One book (AV:48-112)

Book root: `position:absolute; left:0; top:0; width:420px; height:600px; transform-style:preserve-3d; transform:{b.tf}; opacity:1` (opacity is always `1`, see Gotchas).

```js
// AV:342
tf: `translate3d(${(P.x - 210).toFixed(2)}px, ${(P.y - 300).toFixed(2)}px, ${P.z.toFixed(2)}px) rotateX(${P.rx.toFixed(3)}deg) rotateY(${P.ry.toFixed(3)}deg) rotateZ(${P.rz.toFixed(3)}deg) scale(${P.s.toFixed(4)})`
```
So `(P.x, P.y)` is the centre of the 420x600 cover. The default transform-origin is the box centre (210, 300, 0).

Shared face class (AV:21): `.face{position:absolute;backface-visibility:hidden;-webkit-backface-visibility:hidden;box-sizing:border-box}`.
Shade overlay (AV:22): `.shade{position:absolute;inset:0;background:#000;pointer-events:none}`, with its opacity set per face.
Page-edge textures (AV:23-24):
```css
.edge {background-color:#E4E2DB;background-image:repeating-linear-gradient(to bottom,#E4E2DB 0px,#E4E2DB 2px,#cfcdc5 2px,#cfcdc5 3px)}
.edgeV{background-color:#E4E2DB;background-image:repeating-linear-gradient(to right, #E4E2DB 0px,#E4E2DB 2px,#cfcdc5 2px,#cfcdc5 3px)}
```

Let `D` = the volume's thickness and `hd = D/2`, `spL = 210 − D/2`, `tbT = 300 − D/2` (AV:341).

| Face | Line | Box (left, top, w, h) | Transform | Fill | Visibility / notes | Shade key |
|---|---|---|---|---|---|---|
| Back cover | AV:50 | 0, 0, 420, 600 | `rotateY(180deg) translateZ(hd)` | `tone`, radius `3px 6px 6px 3px` | `visibility:{b.solid}` | `back` |
| Spine | AV:52-59 | spL, 0, D, 600 | `rotateY(-90deg) translateZ(210px)` | `tone`, `color:ink`, radius 4px; flex column, `justify-content:space-between; align-items:center; padding:22px 0 20px; overflow:hidden` | `visibility:{b.solid}` | `spine` |
| Fore-edge (page block) | AV:61 | spL, **5**, D, **590** | `rotateY(90deg) translateZ(206px)` (4px inset from the cover edge) | `.edge` (horizontal stripes) | always visible | `fore` |
| Top edge | AV:62 | **4**, tbT, **412**, D | `rotateX(90deg) translateZ(297px)` (3px inset) | `.edgeV` | always | `top` |
| Bottom edge | AV:63 | 4, tbT, 412, D | `rotateX(-90deg) translateZ(297px)` | `.edgeV` | always | `bottom` |
| Front group | AV:66 | inset 0 | `translateZ(hd)`, `preserve-3d` | n/a | holds the next 3 rows | n/a |
| Right page stack (active book only) | AV:68-72 | 0, 0, 420, 600 | `transform-origin:0 50%; transform:translateZ(-3px) scale(0.982)` | `<BookPage side="right" page={rd.R}>` + `.shade` (opacity `rd.Rsh`, always 0) + cast-shadow span | `pointer-events:{rd.pe}`; `onClick=fwd`; class `pagehit` (cursor:pointer) | n/a |
| Cover hinge | AV:74 | inset 0 | `transform-origin:0 50%; transform:rotateY({b.cover})`, `preserve-3d` | n/a | n/a | n/a |
| Cover front | AV:75-81 | inset 0 | none | `tone`, `color:ink`, radius `3px 6px 6px 3px`, `padding:44px 40px`, flex column, overflow hidden | n/a | `front` |
| Cover inside (left page) | AV:82-85 | inset 0 | `rotateY(180deg)` | `#ECEBE6`, radius `6px 3px 3px 6px`, overflow hidden; `<BookPage side="left" page={rd.L}>` only when the book is active | `pointer-events:{rd.pe}`, `onClick=backPage` | `inside` |
| Turning leaf | AV:89-109 | 0, 0, 420, 600 | `transform-origin:0 50%; transform:{rd.ls}`, preserve-3d, `visibility:{rd.vis}`, `pointer-events:none` | 6 nested strips (1.3) | mounted while `leafOn` | per strip |

Spine content (AV:53-57), top to bottom:
1. `VOL.`: Geist Mono 11px, letter-spacing .14em, opacity .7. Then the number `n`: 30px/800, letter-spacing −0.04em. Gap 2px, in a column.
2. A rule: 64% wide, 1px, `currentColor`, opacity .28.
3. The title: `writing-mode:vertical-rl`, font-size `b.fs`, weight 800, letter-spacing .03em, nowrap, `max-height:360px`, ellipsis.
4. A rule (same as 2).
5. `AEDWON`: Mono 10.5px, letter-spacing .22em, opacity .7, vertical-rl.

`b.fs` (AV:339): title length > 12 gives `18px`, > 9 gives `22px`, otherwise `27px`.

Cover-front content (AV:76-80):
- A crease line: absolute, `left:14px; top:0; bottom:0; width:1px; background:currentColor; opacity:.14`.
- `AEDWON`: Mono 12px, .22em, opacity .7.
- The number: `margin-top:auto`, 150px/800, letter-spacing −0.075em, line-height .86.
- The title: `b.cfs` (title length > 16 gives `34px`, otherwise `46px`; AV:340), weight 800, letter-spacing −0.045em, line-height 1.02, `overflow-wrap:anywhere`.

### 1.3 The leaf: six hinged strips (AV:89-108)

Each strip is **70px** wide (420/6) and 600 tall, with `transform-origin:0 50%` and `preserve-3d`. Strip 1 sits at `left:0`. Strips 2-6 are each nested **inside the previous strip** at `left:70px`, so each one hinges on the right edge of its parent and the angles accumulate.

Every strip has two `.face` children, both `inset:0; overflow:hidden; opacity:{rd.fo}`:
- Front: a 420x600 `<BookPage side="right" page={rd.A}>` offset `left: −(k−1)·70px`, so the offsets are 0, −70, −140, −210, −280, −350.
- Back: `transform:rotateY(180deg)` and `<BookPage side="left" page={rd.B}>` offset `left: −(6−k)·70px`, so −350, −280, −210, −140, −70, 0 (mirrored, because the back of strip 1 is the right-most slice of the left page).
- Each face has its own `.shade`: `rd.s{k}a` on the front and `rd.s{k}b` on the back.

### 1.4 Shelf / room geometry (AV:34-42, all `position:absolute`)

| Item | left | top | w | h | Fill |
|---|---|---|---|---|---|
| Plank top lip | 300 | 780 | 840 | 2 | `#34343b` |
| Plank face | 300 | 782 | 840 | 16 | `#141418` |
| Under-plank shadow | 310 | 798 | 820 | 26 | `#0e0e11` |
| Lying book 1 (bottom) | 340 | 744 | 150 | 36 | `#1c1c21`, radius 3, `border-top:1px solid #2c2c33` |
| Lying book 2 | 350 | 712 | 134 | 32 | `#25252b`, radius 3, `border-top:1px solid #34343b` |
| Lying book 3 (top) | 346 | 686 | 142 | 26 | `#18181d`, radius 3, `border-top:1px solid #2a2a30` |
| Bookend upright | 1004 | 600 | 14 | 180 | `#1f1f25`, `border-left:1px solid #34343b` |
| Bookend foot | 1004 | 766 | 64 | 14 | `#1f1f25` |
| Clock | right:300 | 846 | n/a | n/a | `Manila · {clock}`, Geist Mono 12px `#8A8A93` |

`clock` (AV:425): `new Date().toLocaleTimeString('en-US',{timeZone:'Asia/Manila',hour:'numeric',minute:'2-digit'})`, for example "9:41 PM".

### 1.5 Volume data (AV:158-191)

`L = '#EDEDED'`, `D = '#0a0a0c'` (AV:155).

| idx | n | title | tone | ink | D (px) | body pages | `all.length` | spreads | contents page? | end page appended? |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | 01 | Aerol | #EDEDED | #0a0a0c | 84 | 5 (text, photo, text, text, big) | 6 | 3 | yes | no |
| 1 | 02 | How I work | #26262c | #EDEDED | 68 | 3 (big, text, list) | 4 | 2 | yes | no |
| 2 | 03 | Guilds | #15151a | #EDEDED | 76 | 5 guild | 6 | 3 | yes | no |
| 3 | 04 | Training arc | #202026 | #EDEDED | 96 | 7 org (1 real + 6 `ph()` placeholders, AV:156) | 8 | 4 | yes | no |
| 4 | 05 | Off the clock | #18181d | #EDEDED | 64 | 3 read | 4 | 2 | yes | no |
| 5 | 06 | Next volume | #EDEDED | #0a0a0c | 56 | titleit, write, contact (`contact:true`) | 3+1=4 | 2 | **no** | yes (`nextVol:''`, so no button) |

Full page content (titles, bodies, sizes, org lists) is verbatim at AV:159-190; copy it as-is.

Page assembly (AV:193-204):
- Each page gets `vol` and `running = v.title`.
- Every non-contact volume gets a `contents` page at index 0 (so it shows on the inside cover). Its `toc` entries are `{ title: p.t || p.title || p.org || p.big, page: i+1, n: '01'.. }`.
- If the count is odd, an `end` page is pushed with `nextVol` and `nextTitle` set to the following volume.
- `folio = String(i).padStart(2,'0')` for `i>0 && kind!=='end'`.
- Spread `s` = left page `all[2s]` (cover inside, or left of the gutter) + right page `all[2s+1]`. `spreads = all.length/2`.
- Out-of-range pages fall back to `{kind:'end', vol, nextVol:'', nextTitle:''}` (AV:356).

Vol. 06 spreads: spread 0 = `titleit` (left) + `write` (right); spread 1 = `contact` (left) + `end` (right).

### 1.6 Shelf positions (AV:206-209)

`W=420, Hh=600, s0=0.92, gap=12`. Each spine's on-screen width is `D·0.92`. The start is `x = 720 − (Σwidths + 12·5)/2 + 30`, and then `sx_i = x + w_i/2; x += w_i + 12`.

| idx | spine w | sx (centre) | hit button x | hit w |
|---|---|---|---|---|
| 0 | 77.28 | 554.40 | 511.76 | 85.28 |
| 1 | 62.56 | 636.32 | 601.04 | 70.56 |
| 2 | 69.92 | 714.56 | 675.60 | 77.92 |
| 3 | 88.32 | 805.68 | 757.52 | 96.32 |
| 4 | 58.88 | 891.28 | 857.84 | 66.88 |
| 5 | 51.52 | 958.48 | 928.72 | 59.52 |

The row spans 515.76 to 984.24. The bookend starts at 1004.

Hit buttons (AV:411-418) are `left: sx − w/2 − 4`, `top: 780 − 552 − 30 = 198`, `width: w + 8`, `height: 552 + 30 = 582`. They have `pointer-events:auto` only while no book is active.

---

## 2. State model and props

### 2.1 Props (AV:149 `data-props`)

| Prop | Type / default | Behaviour |
|---|---|---|
| `bare` | bool, false | Root background becomes `transparent` and the nav gets `visibility:hidden` (AV:403). Use it when embedded in another page. |
| `openReq` | string, "" | Each **new** value opens a volume. `n = parseInt(orq.split('#')[0],10)` and the value is used **as an index** (0-5), not as the volume number. NaN opens index 5 (contact) (AV:296). Re-send the same index with a different `#suffix` to re-trigger. |
| `closeReq` | string, "" | Each new value calls `close()` (AV:297). |
| `onScrollOut(deltaY)` | callback | Wheel with no active book: `preventDefault()` and then `onScrollOut(e.deltaY)` (AV:222). The host uses this to go back to the wall. |
| `onOpen(o)` | callback | Fires on change with `'contact'` (active **or pending** is index 5), `'book'` (any other active book), or `''` (AV:298). |
| `start` | `'shelf'`/`'contact'` | `'contact'` runs `openVol(5)` after **1100ms** (0 with reduced motion) (AV:230). |

### 2.2 Internal state (AV:210-216)

| Field | Meaning |
|---|---|
| `active` | index of the open (or opening/closing) book, or null |
| `pending`, `pendingSpread` | the book to open once the current one has closed |
| `p`, `pt` | open progress 0..1 and its target (0 or 1) |
| `spread` | current spread index |
| `turn` | `{from,to,t,dir,fast}` or null |
| `settle` | copy of the finished turn with its own `t` (fade-out of the leaf) |
| `queue` | pending target spreads, max 2 via fwd/back |
| `hov[i]`, `hovT[i]` | hover spring value and its target, per book |
| `m`, `ms` | raw / smoothed mouse in −1..1 |
| `t0` | mount time, used for the intro |
| `form` | `{name, mail, msg, title}` |
| `shelving` | true while Vol. 06 is closing after a submit |
| `shelvedAt` | timestamp when the shelved book finished closing |
| `reduced` | `prefers-reduced-motion: reduce` |

### 2.3 Transitions

```js
// AV:258-263
openVol(i, spread) {
  this.shelvedAt = null;
  if (this.active == null) { this.active = i; this.spread = spread || 0; this.turn = null; this.queue = []; this.pt = 1; this.hovT[i] = 0; }
  else if (i !== this.active) { this.pending = i; this.pendingSpread = spread || 0; this.turn = null; this.queue = []; this.pt = 0; }
}
close() { this.pending = null; this.turn = null; this.queue = []; this.pt = 0; }
```
When the close lands (AV:239-242), with `p===0 && pt===0 && active!=null`:
- If `pending` is set, swap to it: `active = pending`, `spread = pendingSpread`, `pt = 1`. The new book now flies out, so switching volumes takes about 2 x 1.9s.
- Otherwise `active = null`, and if `shelving` was set: `shelving = false; shelvedAt = now`.

`ready()` is `active != null && p >= 0.999` (AV:267). Turns, fwd/back and goPage all require it.

---

## 3. Animations (exact)

### 3.0 Loop and easings (verbatim)

```js
// AV:233  frame delta, clamped
const dt = Math.min(0.1, (now - this.last) / 1000); this.last = now;
```
```js
// AV:289-293
const cl = (x) => Math.max(0, Math.min(1, x));
const ease = (x) => { x = cl(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };   // easeInOutCubic
const ease2 = (x) => { x = cl(x); return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; };      // easeInOutQuad
const back = (x) => { x = cl(x); const c = 1.25; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); }; // easeOutBack, c=1.25
const lerp = (a, b, t) => a + (b - a) * t;
const rad = Math.PI / 180;
```
`back` peaks at about 1.057 (at x ≈ 0.63), so the books overshoot by about 24px upward and then settle.

Order of work per frame (AV:234-252): smooth the mouse, step `p`, handle close-landing, step the hover springs, step settle, step turn (and dequeue), then re-render.

### 3.1 Intro (books rise onto the shelf)

```js
// AV:315
const intro = this.reduced ? 1 : back((T - 0.15 - i * 0.08) / 0.9);   // T = seconds since mount (t0)
// AV:318  P.y = 780 - 600*0.92/2 + (1 - intro) * 420   → rest y = 504
// AV:321
let dim = 1 - cl(intro * 1.4);
```
| Param | Value |
|---|---|
| Delay | 0.15s + i·0.08s (i = 0..5, left to right) |
| Duration | 0.9s each, so the last one ends at 1.45s |
| Travel | starts 420px below rest (y = 924) and rises |
| Darkness | `dim` goes 1 to 0 by intro = 0.714 (applied through the shades, not opacity) |

The intro runs once, from mount. There is no fade.

### 3.2 Shelf pose and hover

```js
// AV:318-319
let P = { x: v.sx, y: 780 - this.Hh * this.s0 / 2 + (1 - intro) * 420, z: -210 * this.s0 + 70 * h, rx: -7 * h, ry: 100, rz: 0, s: this.s0, cover: 0 };
P.y -= 22 * h;
```
At rest: `x=sx, y=504, z=−193.2, rx=0, ry=100°, rz=0, s=0.92`. `ry 100°` turns the spine (normal −x) toward the viewer, angled 10°.

The hover spring (AV:244) is `hov[i] += (hovT[i] - hov[i]) * Math.min(1, dt * 9)`, which is exponential with k = 9/s. At full hover (h = 1) the book moves z +70, rx −7°, y −22.

`hovT[i] = 1` comes from mouseenter **or focus** on the hit button, only when `active == null`. It goes back to 0 on leave/blur, and `openVol` forces `hovT[i] = 0`.

### 3.3 Open path (shelf to open spread), 1.9s linear p

```js
// AV:236-238
const d = Math.sign(this.pt - this.p);
if (this.reduced) this.p = this.pt;
else if (d) { this.p += d * dt / 1.9; /* clamp to pt */ }
```
`p` moves linearly at 1/1.9 per second in both directions. All of the shape comes from functions of `p` (AV:322-330):

```js
const a = ease(p / 0.52), b = ease2((p - 0.44) / 0.56);
const C = { x: 720, y: 468, z: 150, rx: 7, ry: -26, rz: 0, s: 1, cover: 0 };
const O = { x: 930 + this.ms.x * 4, y: 500, z: 20, rx: 13 - this.ms.y * 2, ry: this.ms.x * 2.5, rz: 0, s: 1, cover: -176 };
const k1 = {}; Object.keys(P).forEach((key) => { k1[key] = lerp(P[key], C[key], a); });
k1.y -= Math.sin(Math.PI * a) * 80; k1.z += Math.sin(Math.PI * a) * 90; k1.rz = Math.sin(Math.PI * a) * -6;
const k2 = {}; Object.keys(k1).forEach((key) => { k2[key] = lerp(k1[key], O[key], b); });
k2.cover = -176 * ease((p - 0.5) / 0.5) + (p > 0.5 ? Math.sin(Math.PI * cl((p - 0.5) / 0.5)) * -4 : 0);
P = k2; dim = 0;
```

The three poses:

| Pose | x | y | z | rx | ry | rz | s | cover |
|---|---|---|---|---|---|---|---|---|
| P (shelf) | sx | 504 (−22h, + intro offset) | −193.2+70h | −7h | 100 | 0 (+ wobble) | 0.92 | 0 |
| C (pulled out, facing you) | 720 | 468 | 150 | 7 | −26 | 0 | 1 | 0 |
| O (open) | 930 + 4·ms.x | 500 | 20 | 13 − 2·ms.y | 2.5·ms.x | 0 | 1 | −176 |

The arc overlay on the P to C leg: `y −= 80·sin(πa)`, `z += 90·sin(πa)`, and `rz = −6·sin(πa)`. That rz **replaces** the lerped value, so any P.rz wobble is discarded.

The cover angle is `−176·ease((p−0.5)/0.5) − 4·sin(π·cl((p−0.5)/0.5))` (the extra −4° bulge only applies for p > 0.5). It lands at exactly −176°.

O.x = 930 puts the hinge (book-left = x − 210) at **720**, the stage centre. The cover swings left over 300..720 and the right page covers 720..1140.

Timeline (s = p·1.9):

| Channel | p range | seconds |
|---|---|---|
| P to C (a, cubic) | 0 to 0.52 | 0 to 0.988 |
| C to O (b, quad) | 0.44 to 1 | 0.836 to 1.9 |
| Cover opens (cubic + bulge) | 0.5 to 1 | 0.95 to 1.9 |
| Other books/room step back (openK) | 0 to 0.714 | 0 to 1.357 |
| Spine/back hidden (`solid`) | p > 0.9 | > 1.71 |
| Reading bar in (bk) | 0.85 to 1 | 1.615 to 1.9 |
| `ready()` / leaf mounted | p ≥ 0.999 | ≈1.9 |

**Closing** is the exact reverse: `pt = 0`, and `p` runs down at the same rate along the same functions. That includes the cover bulge and the arc. Hover is not re-applied while a book is active.

Other books while one is active (AV:331-333), with `openK = cl(p*1.4)` (AV:309):
```js
dim = Math.max(dim, 0.9 * openK); P.y += 60 * openK; P.z -= 520 * openK;
```
Room layer (AV:410): `opacity = 1 − 0.7·openK`, `translate: 0 (openK·18)px`.

### 3.4 Mouse parallax on the open book

- `lean` (AV:434): `m = {x: (clientX−left)/width·2−1, y: (clientY−top)/height·2−1}`, computed on the root rect. `unlean` sets it to {0,0}.
- Smoothing (AV:234): `ms += (m − ms)·min(1, dt·3)`, per axis.
- This only feeds pose O: `x += 4·ms.x` px, `rx = 13 − 2·ms.y`°, `ry = 2.5·ms.x`°. It is weighted by `b`, so it fades in during the second leg.

### 3.5 Shading model (one light, verbatim)

```js
// AV:302-308
const Lx = -0.38, Ly = -0.58, Lz = 0.72, Ln = Math.hypot(Lx, Ly, Lz);   // up-left, toward the viewer (CSS y is down)
const shadeOf = (n, R, k, dim) => { const v = R(n[0], n[1], n[2]); const lit = Math.max(0, (v[0] * Lx + v[1] * Ly + v[2] * Lz) / Ln); const sh = (1 - lit) * k; return (1 - (1 - sh) * (1 - (dim || 0))).toFixed(3); };
const mkR = (rx, ry, rz) => {
  const cx = Math.cos(rx * rad), sx = Math.sin(rx * rad), cy = Math.cos(ry * rad), sy = Math.sin(ry * rad), cz = Math.cos(rz * rad), sz = Math.sin(rz * rad);
  return (x, y, z) => { const x1 = cz * x - sz * y, y1 = sz * x + cz * y; const x2 = cy * x1 + sy * z, z2 = -sy * x1 + cy * z; return [x2, cx * y1 - sx * z2, sx * y1 + cx * z2]; };
};
```
`mkR` applies Z, then Y, then X, which matches the CSS `rotateX() rotateY() rotateZ()` order. The returned value is the `.shade` opacity (black overlay).

Per-book face normals and darkness coefficients `k` (AV:335-351), with `R = mkR(P.rx,P.ry,P.rz)` and `front = [sin(cover), 0, cos(cover)]`:

| Face | Normal | k (dark AV) | k (light AVL) |
|---|---|---|---|
| front (cover) | `front` | 0.5 if ink=#0a0a0c (light books) else 0.6 | **0.26** if ink=#0a0a0c else 0.6 |
| inside (cover back = left page) | `[-front[0],0,-front[2]]` | 0.26 | 0.26 |
| back | [0,0,−1] | 0.6 | 0.6 |
| spine | [−1,0,0] | 0.5 light books / 0.62 | **0.26** / 0.62 |
| fore | [1,0,0] | 0.55 | 0.55 |
| top | [0,−1,0] | 0.5 | 0.5 |
| bottom | [0,1,0] | 0.6 | 0.6 |

`dim` (intro darkness, or background books 0.9·openK) is combined multiplicatively. The active book uses `dim = 0`.

Leaf shading uses `RBox = mkR(rx, ry, 0)` of the active book, parsed back from its `tf` string (AV:360), so it uses the rounded values with rz ignored. Strip k uses `g = ang + (k−1)·bend`:
```js
// AV:377-379
const flatA = parseFloat(shadeOf([0, 0, 1], RBox, 0.45));
const shA = (g) => { const r = g * rad; return Math.max(0, parseFloat(shadeOf([Math.sin(r), 0, Math.cos(r)], RBox, 0.45)) - flatA).toFixed(3); };   // front, relative to a flat page
const shB = (g) => { const r = g * rad; return shadeOf([-Math.sin(r), 0, -Math.cos(r)], RBox, 0.26); };                                            // back
```
The right page stack shade `Rsh` is always `0`.

### 3.6 Page turn

Start (AV:268-274):
```js
startTurn(to) {
  const v = this.V[this.active]; if (!v) return;
  const from = this.turn ? this.turn.to : this.spread;
  if (to < 0 || to >= v.spreads || to === from) return;
  this.settle = null;
  this.turn = { from, to, t: 0, dir: to > from ? 1 : -1, fast: Math.abs(to - from) > 1 };
}
```
Step (AV:249-250): `turn.t += reduced ? 1 : dt / (fast ? 0.55 : 0.95)`. When `t ≥ 1`: `spread = to`, `settle = {...turn, t:0}` (null if reduced), `turn = null`, and the next queued item starts **in the same frame**.

Per frame (AV:361-391); `tr` is the turn, or the settle with `t=1`:

| Quantity | Formula |
|---|---|
| e | `ease(tr.t)` (cubic in/out) |
| ang (strip 1 angle) | dir>0: `−176·e`; dir<0: `−176·(1−e)` |
| lift | `sin(π·e)` |
| bend (extra per strip, deg) | `lift · 6.5 · (dir>0 ? 1 : −1)` |
| f (0 = on right page, 1 = on left) | `−ang/176` |
| leaf container `rd.ls` | `scale(${(0.982 + 0.018·f).toFixed(5)})`, origin `0 50%` |
| strip 1 `t1` | `translateZ(${(−2.8 + 3.1·f + lift·10).toFixed(3)}px) rotateY(${ang}deg)` |
| strips 2..6 `tk` | `rotateY(${bend}deg)`, relative to the parent strip, so strip k's absolute angle is `ang + (k−1)·bend` (max extra at strip 6 = 5·6.5 = 32.5° at mid-turn) |
| fadeIn | `settling ? 1 : cl(tr.t / 0.06)` |
| fo (leaf face opacity) | `settling ? 1 − cl(settle.t) : fadeIn` |
| castVis | `lift > 0.01 ? 'visible' : 'hidden'` |
| castOp | `lift · 0.9` |
| castW | `40 + 300·(1 − |ang + 88|/88)` px (40 at the ends, 340 at ang = −88) |
| pe (page hits) | `settling && ready ? 'auto' : 'none'`; idle: `ready ? 'auto' : 'none'` |

How the leaf matches the stacks at each end: lying on the right (f = 0) it is `scale .982` at z −2.8 (the right stack is `translateZ(−3px) scale(.982)`), so it sits 0.2px in front. Lying on the left (f = 1) it is `scale 1` at z +0.3 (the cover inside is scale 1 at z 0).

Which page shows where (AV:364-371):

| | dir > 0 (forward) | dir < 0 (back) |
|---|---|---|
| Leaf front A (right-side page) | `pg(2·from+1)` | `pg(2·to+1)` |
| Leaf back B (left-side page) | `pg(2·to)` | `pg(2·from)` |
| Under, left L | `pg(2·from)` | `pg(2·to)`; while fadeIn<1: **B** |
| Under, right R | `pg(2·to+1)`; while fadeIn<1: **A** | `pg(2·from+1)` |
| During settle | L=`pg(2·to)`, R=`pg(2·to+1)` | same |

Hand-off sequence:
1. In the first 6% of `t` the leaf fades in (0 to 1) over an identical copy of the page it lifts from (the stack keeps showing that page).
2. Only after that does the stack beneath swap to the revealed page.
3. After landing, the leaf rests at its end pose (t = 1, lift 0) over an identical page and fades out over **0.16s** (`settle.t += dt/0.16`, AV:246).

Idle (no turn, no settle; AV:393): `L=pg(2s)`, `R=pg(2s+1)`. The leaf is pre-loaded with `A=pg(2s+1)` and `B=pg(min(len−1, 2s+2))`, `vis:hidden`, `fo:0`, `ls:scale(0.982)`, all `tk:none`, cast hidden. The leaf is kept mounted while `leafOn = active && (p ≥ 0.999 || turn)` (AV:346), so a turn starts with no mount cost.

Cast shadow on the page beneath (AV:71): a span inside the right stack, `top:0; bottom:0; left:0; width:{castW}; background:linear-gradient(to right, rgba(0,0,0,.32), rgba(0,0,0,0)); opacity:{castOp}`.

Queue and skip rules (AV:275-287):
- `forward()`: on the last spread it opens the next volume (`openVol(active+1)`; it does nothing on Vol. 06). Otherwise, while turning, it pushes `at+1` only if `queue.length < 2`; when idle it calls `startTurn(at+1)`. Here `at = turn ? turn.to : spread`.
- `backward()` mirrors that (it does nothing at spread 0).
- `goPage(pageIndex)` (from the contents links): `to = floor(pageIndex/2)`. While turning it **replaces** the queue with `[to]`, otherwise it starts the turn directly. A jump of more than one spread is a **single** leaf turn (A/B taken straight from the from/to spreads) at **0.55s**. Pages in between are never shown.
- Any `openVol` of another book or `close()` clears turn and queue.

### 3.7 Reading bar

`bk = active!=null ? cl((p − 0.85)/0.15) : 0` (AV:400). The bar uses `opacity: bk` and `translate: −50% ((1−bk)·16)px`. It is linear in p, so it also fades out first when closing. `pointer-events:auto` only when `ready`.

### 3.8 "Close and shelve" and the "Shelved." state

```js
// AV:264-266
okForm() { const f = this.form; return !!(f.name.trim() && f.msg.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.mail.trim())); }
shelveIt() { if (!this.okForm() || this.shelving || this.active !== this.V.length - 1) return; this.spread = 0; this.turn = null; this.queue = []; this.shelving = true; this.shelvedAt = null; this.close(); }
```
1. The book snaps to spread 0 (no turn) and then closes over 1.9s, back onto the shelf. Its spine and cover now show the user's title (`titleOf`, AV:311) if they set one.
2. When it lands, `shelvedAt = now`. With `s` = seconds since then:
   ```js
   // AV:313,320
   const wob = sinceShelf < 0.6 ? Math.sin(Math.PI * sinceShelf / 0.6) * (1 - sinceShelf / 0.6) : 0;
   if (i === 5) { P.rz += 3 * wob; P.y -= 6 * wob; } else if (i === 4) P.rz -= 1.4 * wob;
   ```
   Vol. 06 rocks up to about +3°z and 6px up, then settles; its neighbour Vol. 05 nudges −1.4°.
3. The text block (AV:407): `d = (shelvedAt==null || active!=null) ? 0 : 1 − (1 − cl((s − 0.1)/0.5))³` (easeOutCubic, 0.1s delay, 0.5s long). It uses `opacity:d`, `translate: 0 ((1−d)·14)px`, and `pointer-events` auto once d > 0.5.
4. `doneLine` (AV:408): `'Vol. 06, ' + (title || 'Next volume') + ', is on the shelf. I’ll write back to ' + (mail.trim() || 'you') + ', usually within [a day].'`
5. "Write another" (AV:409) clears `msg` and `title` (keeps name and mail), resets the running heads, and calls `openVol(5)`. That also resets `shelvedAt`, so the text vanishes instantly.

### 3.9 Things with CSS transitions (the only ones)

| Selector | Transition |
|---|---|
| `.nlink` (AV:15) | `color .2s ease` |
| `.ctl` (AV:17-19) | `scale .3s cubic-bezier(.34,1.56,.64,1), background-color .2s ease, opacity .2s ease`; hover bg `#1a1a1f`; `:active{scale:.94}` |
| BP `.bp-link` (BP:14-16) | `background-color .2s ease`; hover `rgba(17,17,19,.06)`; its arrow `.bp-ar` moves `translate:3px 0` with `.3s cubic-bezier(.34,1.56,.64,1)` |
| BP `.bp-btn` (BP:18-19) | `scale .3s cubic-bezier(.34,1.56,.64,1)`; `:active{scale:.96}` |
| BP `.bp-fld` (BP:21) | `border-color .2s ease` |
| BP `.bp-shelve` (BP:28-29) | `background-color .15s ease, opacity .25s ease`; `:active{background:#2a2a30}` |
| BP copy labels (BP:124) | `translate .45s cubic-bezier(.34,1.56,.64,1)` |

### 3.10 Reduced motion

With `prefers-reduced-motion: reduce` (AV:219), these all jump to their end state:
- `p` jumps to `pt`
- the intro is 1
- a turn completes in one frame, with no settle
- `start=contact` opens immediately

Hover springs, the shelved wobble and the done fade are not disabled.

---

## 4. Interaction

| Target | Action | Effect |
|---|---|---|
| Spine hit button (AV:125) | click | `openVol(i)` |
| | enter/focus, leave/blur | hover spring target 1 / 0 (only while nothing is open) |
| | `aria-label` | `Volume 01: Aerol` (live title for Vol. 06) |
| Right page stack (AV:68) | click | `forward()` |
| Cover inside / left page (AV:82) | click | `backward()` |
| Contents row (BP:40) | click | `goPage(t.page)` (stopPropagation) |
| "Vol. NN · Title →" on end page (BP:133) | click | `nextVol()`, which opens `active+1` |
| Bar ← | click | `backward()`; opacity .35 at spread 0 (still enabled) |
| Bar centre text | n/a | `aria-live` |
| Bar → | click | `forward()`; label `→`, or on the last spread `Vol. NN →` (nextLabel "Next volume") |
| Bar "Back to shelf" | click | `close()` |
| Nav "About" | click | `close()` only if Vol. 06 is the active book |
| Nav "Contact" | click | `openVol(5)` |
| Nav "Aedwon" / "Wall" / "Index" | click | links to `WallOSS.dc.html` |
| Wheel, no book (AV:222) | wheel | `preventDefault`; `onScrollOut(deltaY)` |
| Wheel, book active (AV:223-227) | wheel | `preventDefault`. Accumulates `wa += deltaY + deltaX`. Once `|wa| > 40` it calls forward (positive) or backward (negative), then **locks** until there have been 220ms with no wheel events (each event restarts the timer, which resets `wl` and `wa`). |
| Form wrappers and links on pages | click | `stopPropagation` (BP `stop`), so typing and clicking never turn the page |
| "Close and shelve" | click | `onShelve`, which calls `shelveIt()` (a no-op unless the form is valid) |

Bar text (AV:421): `'Vol. ' + n + ' · ' + title`, then for non-contact volumes `' · ' + ('Contents' | 'pp. a–b') + ' / ' + (len−1)`, where `first = 2·at` and `last = min(len−1, 2·at+1)`. Example: `Vol. 01 · Aerol · pp. 2–3 / 5`.

Nav state (AV:433): "Contact" is current (`#EDEDED`, `aria-current=page`) when Vol. 06 is active or pending; otherwise "About" is current. The inactive item is `#A1A1AA`.

Keyboard: there are **no key handlers** (no arrows, no Esc). Keyboard use is only Tab through the native buttons. Focus rings: `outline:2px solid #EDEDED; outline-offset:3px` (hit buttons 4px) (AV:20,26). Flag this to the product owner rather than inventing behaviour.

Nav bar (AV:138-146): height 84, `padding:0 56px`, `background:rgba(10,10,12,.72)`, `backdrop-filter:saturate(180%) blur(20px)`. The brand is 16px/600 with −0.02em. The links are 14px with gap 36, and there is a 1x16 `#2a2a30` divider between Index and About.

Bar (AV:129-135):
- Container: `bottom:26px`, centred, gap 4, padding 4, radius 14, `rgba(17,17,20,.84)`, the same blur, `border:1px solid #222228`.
- Buttons: 44 tall, radius 10, transparent. ← is 44x44 at 17px; → has `padding:0 12px`, min-width 44, 13.5px; "Back to shelf" has `padding:0 14px`, 13.5px.
- Text: Mono 12.5px `#A1A1AA`, min-width 260, centred.
- Divider: 1x22 `#2a2a30`, `margin:0 4px`.

Done block (AV:117-121):
- Container: `left:96; top:250; width:330`, column, gap 14, `aria-live=polite`.
- "Shelved.": 44px/800, −0.05em, line-height 1.
- Line: 16.5px, line-height 1.6, `#A1A1AA`.
- Button: `margin-top:6px`, 44 tall, `padding:0 18px`, radius 12, `1px solid #26262c`, 14px.

---

## 5. BookPage (BP)

Props: `page`, `side` ('left'|'right'), `onGo`, `onNextVol`, `clock`, `form` (`{name, mail, msg, title, ready}`), `onField(key, value)`, `onShelve`.

Container (BP:33): `420x600; box-sizing:border-box; padding:44px 40px 52px; background:#ECEBE6; color:#111113; Geist; flex column; gap:16px; overflow:hidden`.

Always-present overlays:
- Running head/folio (BP:138): `position:absolute; left:40; right:40; bottom:20`; Mono 10.5px `#8b8a84`; `justify-content` flex-start on the left side and flex-end on the right. The text is left = `folio + '   ' + running` and right = `running + '   ' + folio`. Normal whitespace collapses those 3 spaces into one. It is empty when there is no folio (the contents and end pages).
- Gutter (BP:140): `top:0; bottom:0; width:46px`, on the spine side (right page: `left:0`, `to right`; left page: `right:0`, `to left`), `linear-gradient(dir, rgba(0,0,0,.16), rgba(0,0,0,0))`.

Shared colours: rules `#d3d1c9`, secondary text `#3f3f46`, meta `#61616A`, dashed placeholders `1.5px dashed #b6b4ac`.

| kind | Layout (in flex column order) |
|---|---|
| `contents` (BP:36-45) | Title: 40px/800, −0.045em, lh 1. Then the list: each row is a `button.bp-link` with flex, baseline, gap 10, `padding:11px 6px; margin:0 -6px; border-top:1px solid #d3d1c9`, 15.5px, left-aligned. Row = title (flex 1), the number in Mono 11.5 `#61616A`, then `→` (`.bp-ar`, `#61616A`). |
| `big` (BP:48-51) | Big text: `margin-top:auto`, `bigSize` (Vol 01 p5 86px, Vol 02 p1 176px), 800, −0.065em, lh .88. Body: 18px, lh 1.5, `#3f3f46`. |
| `text` (BP:54-58) | Title: `titleSize` (50/44/40px), 800, −0.045em, lh 1.02. Body: 17px, lh 1.6, `#3f3f46`. Optional `meta`: `margin-top:auto`, Mono 11.5 `#61616A`. |
| `photo` (BP:61-64) | Slot: `flex:1`, dashed border, centred, Mono 12 `#61616A`, **`rotate:-1deg`**. Caption: Mono 11.5 `#61616A`. |
| `list` (BP:67-72) | Title: 30px/800, −0.04em, lh 1.05. List: `margin-top:6px`; rows are flex, space-between, gap 12, `padding:12px 0`, `border-top:1px solid #d3d1c9`, 16px; right cell Mono 11.5 `#61616A`, right-aligned. |
| `org` (BP:75-83) | Logo slot: 64px tall, dashed, Mono 11 `[ORG logo]`. Org name: 32px/800, −0.045em, lh 1.02. Roles: column, gap 14; each is `padding-top:12px; border-top`, column gap 3. Role line 1: title 15.5/700 and dates Mono 11 `#61616A` nowrap, space-between. Line 2: desc 14px, lh 1.5, `#3f3f46`. |
| `guild` (BP:86-91) | Title: 34px/800, −0.045em, lh 1.02. Grid: `flex:1; grid-template-columns:repeat(cols,minmax(0,1fr)); grid-auto-rows:minmax(0,1fr); gap:10px; margin-top:6px`. Each cell: dashed, column, centred, gap 8, padding 10, holding `[logo]` (Mono 10.5), the org name (14/600) and `[what you built for them]` (Mono 10.5). |
| `read` (BP:94-98) | Cover: `align-self:center`, width 200, `aspect-ratio:2/3`, dashed, `[cover]` Mono 11, **`rotate:1.5deg`**. Then a column gap 4 with `[title]` (24/800, −0.03em) and `p.t` (15px `#3f3f46`). Then a sentence (15px, lh 1.55, `#3f3f46`). |
| `titleit` (BP:101-107) | Wrapper: `margin-top:auto`, column gap 14, stopPropagation. The vol number: 150px/800, −0.075em, lh .86. Input `.bp-ttl` (placeholder "Title this volume", `maxlength=28`, aria-label same). Byline: 15px `#61616A` reading `by {name.trim()||'you'} and Aerol`. |
| `write` (BP:110-118) | Wrapper: `flex:1`, column gap 18, `min-height:0`, stopPropagation. "Chapter 1": 30/800, −0.04em. Three labels (13px `#61616A`): **Your name** (input, placeholder "Maria Santos", autocomplete name), **Where I can reach you** (type=email, "you@example.com", autocomplete email), **What we'd build** (textarea, `flex:1`, "A booking app for our clinic, in time for…"). Then the button "Close and shelve". |
| `contact` (BP:121-127) | Optional `quickTitle` ("Or the quick way"): 30/800, −0.04em. Paragraph: 17px, lh 1.55, `#3f3f46`, reading "For software projects or community infrastructure. I'm in Manila; it's {clock} here." Copy button (below). GitHub and LinkedIn links: 52 tall, `border:1.5px solid #111113`, 15px, `.bp-btn`, stopPropagation. |
| `end` (BP:130-135) | `— END OF VOLUME NN —`: `margin:auto 0`, centred, Mono 12, .2em, `#61616A`. If `nextTitle`, a `button.bp-link`: centred, gap 10, `padding:12px 16px`, `1.5px solid #111113`, 15px, reading `Vol. NN · Title →`. |

Note: the `eyebrow` fields in the data are **not rendered** by BookPage.

Form fields:
- `.bp-fld` (BP:21-24): block, 100% wide, no border except `border-bottom:1.5px solid #c9c7bf`, transparent, 18px, lh 1.5, `padding:3px 0 6px`, no outline. Focus: border `#111113`. Placeholder `#8b8a84`. A focused textarea gets bg `rgba(17,17,19,.035)`.
- Textarea override (BP:115): `resize:none; border-bottom:none; line-height:30px; padding-top:0; background-image:repeating-linear-gradient(to bottom, transparent 0, transparent 29px, #d3d1c9 29px, #d3d1c9 30px)`, which gives ruled-paper lines every 30px aligned to the text lines.
- `.bp-ttl` (BP:25-27): 40px/800, −0.045em, lh 1.1, `padding:0 0 6px`, `border-bottom:1.5px dashed #a9a79f`; focus is solid `#111113`; placeholder `#a3a29b`.
- Shelve button (BP:116): 52 tall, `flex:none`, radius 10, `#111113` bg, `#ECEBE6` text, 15/600. When invalid: `aria-disabled=true`, opacity .35, cursor default. It is never truly `disabled`.

Validation is `okForm` (section 3.8): name and msg non-blank after trim, and the trimmed mail matches `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. The title is optional. Typing a title also live-rewrites the `running` head of every Vol. 06 page (AV:405) and the spine/cover title.

The form state lives in AboutVolumes (the parent). Every BookPage instance (stack, cover inside, 12 leaf faces) renders from the same `form`.

Build note (AV:265): POST to a form endpoint inside `shelveIt` before shelving.

**Copy email** (BP:124, 169):
- The button: 56 tall, `margin-top:auto`, `position:relative; overflow:hidden`, `#111113` / `#ECEBE6`, Mono 14.
- It holds two absolutely positioned centred labels: `aerol.balayon@gmail.com` (translateY `0%`, or `−100%` when copied) and `Copied ✓` (`100%`, or `0%` when copied, `aria-live`). Both use `transition: translate .45s cubic-bezier(.34,1.56,.64,1)`.
- On click: `stopPropagation`, `navigator.clipboard.writeText('aerol.balayon@gmail.com')` (errors swallowed), `copied=true`, and a reset after **1800ms** (the timer restarts on each click).

---

## 6. Colours, type, and the light variant

Fonts are Geist 400/500/600/700/800 and Geist Mono 400/500 from Google Fonts (AV:11).

| Token | Dark (AV) | Light (AVL) |
|---|---|---|
| Root bg | `#0a0a0c` | `#F2F1ED` |
| Root text / primary | `#EDEDED` | `#111114` |
| Secondary (nlink, bar text, done line, nav inactive) | `#A1A1AA` | `#56565E` |
| nlink hover / nav active | `#EDEDED` | `#111114` |
| `.ctl` hover bg | `#1a1a1f` | `#E9E7E2` |
| Focus outline | `#EDEDED` | `#111114` |
| Plank lip | `#34343b` | `#FFFFFF` |
| Plank face | `#141418` | `#E1DFD8` + `box-shadow:0 10px 22px -10px rgba(17,17,20,.25)` |
| Under-plank | `#0e0e11` | `linear-gradient(rgba(17,17,20,.07), rgba(17,17,20,0))` |
| Lying book 1 | `#1c1c21` / top `#2c2c33` | `#DAD8D1` / `#E8E6E0` |
| Lying book 2 | `#25252b` / `#34343b` | `#26262B` / `#3a3a40` |
| Lying book 3 | `#18181d` / `#2a2a30` | `#FBFAF7` / `#FFFFFF` + `box-shadow:inset 0 -1px 0 #E3E1DB` |
| Bookend | `#1f1f25`, border `#34343b` | `#2A2A30`, border `#3a3a42` |
| Clock | `#8A8A93` | `#6A6A72` |
| Bar bg / border | `rgba(17,17,20,.84)` / `#222228` | `rgba(255,255,255,.84)` / `#E2E0DA` |
| Bar divider / nav divider | `#2a2a30` | `#D6D4CD` |
| Nav bg | `rgba(10,10,12,.72)` | `rgba(242,241,237,.72)` |
| "Write another" border | `#26262c` | `#DCDAD3` |
| Light-book (ink `#0a0a0c`) front and spine shade k | 0.5 / 0.5 | **0.26 / 0.26** |

Everything else is identical: volume tones, BookPage, geometry, and all motion (diff of AV vs AVL, lines 5, 15-20, 26, 30, 34-42, 119-120, 129-134, 138-139, 142, 348-349, 403, 433). The `<title>` is "(light) About — volumes".

Paper is `#ECEBE6` with ink `#111113`, and the edge stripes are `#E4E2DB`/`#cfcdc5`.

---

## 7. Gotchas that cause drift

1. **Never put `opacity` (or `filter`, `mask`, `overflow:hidden`, `clip-path`, `isolation`, `will-change:opacity`) on any element that has `preserve-3d` 3D children.** It flattens the 3D context. That is why book opacity is pinned to 1 and dimming is done with black `.shade` overlays on each face (comment at AV:303). The leaf's `fo` opacity is applied to the leaf `.face` elements (leaf nodes), never to the strip containers. The room's opacity is fine because it is a separate 2D layer.
2. **`backface-visibility:hidden` on every face** is what lets the cover front, cover inside and leaf front/back swap automatically. Missing it on even one face shows mirrored text. Shades are inside the faces, so they inherit the culling.
3. **Hide spine and back when open** (`visibility:hidden` for p > 0.9, AV:345). Otherwise they sit exactly on the hinge plane and z-fight ("gutter shimmer").
4. **Z ordering at the hinge**: the right stack is at `translateZ(-3px) scale(.982)` with origin `0 50%`, the leaf goes from −2.8 to +0.3 (+10·lift), and the cover inside is at 0. These sub-pixel offsets avoid z-fighting. Keep them exact, and keep `transform-origin:0 50%` on the stack, leaf, strips and cover hinge.
5. **Strip seams**: strips are exactly 70px, nested at `left:70px`, and the page clones inside are offset by exact multiples of 70. Do not use percentages, and do not round `bend`. Slices of the same page meet edge-to-edge; any 1px gap shows a hairline when bent. Each strip face needs `overflow:hidden` (allowed, because a face has no 3D children).
6. **Hand-off frames**: keep the leaf mounted (`leafOn`) and preloaded with the next pages, keep the 6% fade-in over an identical page before the stack underneath swaps, and keep the 0.16s settle fade-out. Skipping either step makes a one-frame flash.
7. **Transform function order and precision** must match AV:342 (translate3d, rotateX, rotateY, rotateZ, scale) and the `toFixed` precisions (2 for translate, 3 for degrees, 4 for scale, 5 for leaf scale). `mkR` assumes that order. Leaf shading reads rx/ry back from the rounded string.
8. **Individual transform properties**: `translate:`/`scale:`/`rotate:` (room, done, bar, `.ctl:active`, photo/read rotations, copy labels) are separate CSS properties from `transform`. Don't merge them into `transform` on elements that also have one.
9. **Linear p, eased channels**: the open/close clock is linear (`dt/1.9`), and each channel applies its own easing over its own sub-range of p. Do not ease p itself. Closing replays the same path in reverse.
10. **dt clamp 0.1s** (AV:233): after a tab switch, animations jump at most 0.1s per frame. The springs use `min(1, dt·k)`.
11. **Re-render cost**: the prototype `setState`s every frame (AV:252), which re-renders 14+ BookPage instances. In React, write transforms and opacities to refs/DOM directly (or memoise BookPage on `page`/`form`) so 60fps holds; otherwise frame drops make the dt-based timing visibly steppy.
12. **`openReq` is an index**, not a volume number, and only a *change* of string triggers it.
13. **The perspective is on the root** (`2600px`, origin 50% 46%) and the 3D world div is `inset:0` with preserve-3d. Do not add another perspective or a transform on intermediate wrappers, or the vanishing point moves.
14. **`pointer-events`**: the world has `none`; only the active book's page stack and cover inside re-enable `pe`, and only when ready (or settling). The leaf is always `none`. Clicks during a turn go nowhere, but bar buttons and the wheel still queue (max 2).
15. **Folio spacing**: the 3 spaces collapse to 1 because there is no `white-space:pre`. Reproduce what renders (one space plus nothing else), not the source string.
16. Shelving sets `spread=0` with no animation before closing. This is invisible in practice because submit happens on spread 0.
