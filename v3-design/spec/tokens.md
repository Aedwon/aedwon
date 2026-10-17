# Design tokens: dark and light

Sources:

- Dark colours: collected from `reference/components/{Room, WallIndex2, AboutVolumes, BookPage, ProjectSpread, Mobile, Moments, Spec}.dc.html`.
- Official palette: `Spec.dc.html:46-61`.
- Light values: `reference/generators/light.py`, the exact script that produced `RoomLight`, `WallIndex2Light`, `ProjectSpreadLight` and `AboutVolumesLight`.

The light theme is **role-based, not inverted** (`light.py:1-3`): "the room and UI get light tokens, each kind of media keeps what it would really look like (dark phone bezels, a dark terminal, light Discord), books keep their own colours, paper stays paper."

Token names are proposed here so the production build has stable handles. The dark and light hex values come from the source and must not change.

---

## 1. How light.py works (for implementers)

| Step | Rule | Source |
|---|---|---|
| Split | The file is cut into **media blocks**, **protected spans** and **everything else**. A media block runs from a comment `<!-- <kind>… -->` to the next `</sc-if>`. | `light.py:55-69` |
| UI map | Everything else: every 6-digit hex is looked up case-insensitively in `UI` (`light.py:7-16`) and replaced. Unlisted hexes stay as they are. | `light.py:29-32` |
| rgba map | Only four rgb triples change; all others stay. See section 4. | `light.py:33-43` |
| Canvas points | String replacements for the points' colour and alpha. See section 6. | `light.py:31` |
| Media map | Each media block gets **only** its own small map (`MEDIA[kind]`, a case-sensitive string replace) plus the object shadow token. The UI map is **not** applied inside media blocks. | `light.py:18-27`, `45-54` |
| Protected | Spans that pass through untouched (AboutVolumes only). See section 7. | `light.py:91` |
| Not converted | `BookPage`, `SystemViz`, `Mobile`, `Moments`, `Writing` and `WallWriting` have no light build. `AboutVolumesLight` and `ProjectSpreadLight` import the dark `BookPage` / `SystemViz` (`AboutVolumesLight.dc.html:69`, `ProjectSpreadLight.dc.html:154`). | `light.py:72-102` |

---

## 2. Colour tokens: UI (UI map applies)

Columns: dark is the value in the dark components; light is `UI[dark]` from `light.py:7-16`. Example locations are `file:line` in `components/`.

### 2.1 Room, surfaces, glass

| Token | Role | Dark | Light | Where (dark) |
|---|---|---|---|---|
| `room.bg` | The wall / page background ("Room") | `#0A0A0C` | `#F2F1ED` | Room:149, Spec:49, Moments:20 |
| `room.bg.gallery` | Wall colour in the non-default `gallery` ambience | `#17171B` | `#EEEDE8` | Room:149 |
| `nav.glass` | Room nav bar: `wallC + 'b8'` (≈72 % alpha), `backdrop-filter: saturate(180%) blur(20px)` | `#0A0A0CB8` | `#F2F1EDB8` | Room:51, :159 |
| `glass.room.72` | Floating glass over the room (zoom button, Index/shelf nav) | `rgba(10,10,12,0.72)` | `rgba(242,241,237,0.72)` | WallIndex2:250, AboutVolumes:138 |
| `glass.room.78` | Project page nav | `rgba(10,10,12,0.78)` | `rgba(242,241,237,0.78)` | ProjectSpread:42 |
| `glass.room.80` / `.86` | Phone top bar / bottom nav (no light build) | `rgba(10,10,12,.8)` / `.86` | (map → `rgba(242,241,237,…)`) | Mobile:330, :336 |
| `glass.panel.84` | Book control bar | `rgba(17,17,20,0.84)` | `rgba(255,255,255,0.84)` | AboutVolumes:129 |
| `glass.panel.92` | Contents rail panel | `rgba(17,17,20,.92)` | `rgba(255,255,255,.92)` | ProjectSpread:175 |
| `glass.panel.90` / `.97` | Phone contents button / sheet (no light build) | `rgba(17,17,20,.9)` / `.97` | (map → `rgba(255,255,255,…)`) | Mobile:242, :245 |
| `surface.media` | "Surface (media)": screens, placeholders, figure boxes | `#131317` | `#FFFFFF` | Spec:50, ProjectSpread:78, :127 |
| `surface.frame` | Browser / repo card body; 404 clean patch | `#0F0F12` | `#FFFFFF` | WallIndex2:100, :112, Moments:43 |
| `surface.terminal` | Terminal body (UI map value; inside the terminal media block it stays dark, §3) | `#08080A` | `#FFFFFF` | WallIndex2:108 |
| `surface.row-hover` | Index row hover | `#101013` | `#FAFAF8` | WallIndex2:21 |
| `surface.hover` | Secondary button hover (404); Discord channel column | `#121215` | `#FAFAF8` | Moments:15, WallIndex2:104 |
| `surface.control-hover` | Book controls / rail link hover | `#1A1A1F` | `#E9E7E2` | AboutVolumes:18, ProjectSpread:37 |
| `surface.sunken` | 404 mat, TV neck, shelf front lip | `#141418` | `#EFEEE9` | Moments:47, WallIndex2:96, AboutVolumes:35 |
| `surface.404-frame` | 404 picture frame (not in UI map, so it would stay) | `#232329` | — (unmapped) | Moments:46 |

### 2.2 Lines

| Token | Role | Dark | Light | Where |
|---|---|---|---|---|
| `line.hairline` | "Hairline": row rules, card dividers, Spec row borders | `#1C1C22` | `#E6E4DE` | Spec:17, :51, WallIndex2:77 |
| `line.hairline.2` | Hairline 2: control and card borders, 404 secondary button, field underline (phone) | `#26262C` | `#DCDAD3` | Spec:51, WallIndex2:100, Moments:57 |
| `line.divider` | Nav divider (1 × 16), zoom-button border, section rule | `#2A2A30` | `#D6D4CD` | Room:55, WallIndex2:250, ProjectSpread:133 |
| `line.divider.alt` | Index type-heading rule | `#2A2A31` | `#D6D4CD` | WallIndex2:62 |
| `line.panel` | Floating panel border | `#222228` | `#E2E0DA` | AboutVolumes:129, ProjectSpread:175 |
| `line.track` | Load hairline track; phone contact divider | `#1F1F24` | `#E3E1DB` | Moments:27, Mobile:237 |
| `line.hover` | Secondary button hover border; inactive ticks / disabled arrows | `#3A3A42` | `#C4C2BC` | Moments:15, WallIndex2:616, Mobile:478 |
| `line.underline` | Link underline colour (`text-underline-offset: 4px`); inactive phone dot; 404 dashed outline and mat border | `#4A4A52` | `#B3B1AB` | ProjectSpread:15, Moments:43, :47 |
| `line.frame` | 404 frame border; inactive type-filter icon | `#5A5A63` | `#A3A29C` | Moments:46, WallIndex2:584 |
| `line.bezel` | Device bezel border (UI-map value; in media it becomes the body colour, §3) | `#2E2E35` | `#D3D1CA` | WallIndex2:92 |
| `line.shelf-top` | Shelf top edge, book-object top borders | `#34343B` | `#CFCDC6` | AboutVolumes:34, :38 |

### 2.3 Text

| Token | Role | Dark | Light | Where |
|---|---|---|---|---|
| `text.primary` | "Text", headings, active nav, focus outline | `#EDEDED` | `#111114` | Spec:52, Room:15-16 |
| `text.strong` | Detail facts, list items, Spec row text | `#D4D4D8` | `#2E2E34` | ProjectSpread:59, Spec:17 |
| `text.hover-soft` | Hover on inactive filter/sort/heading buttons; 404 nail | `#C4C4CC` | `#3A3A40` | WallIndex2:26, Moments:52 |
| `text.secondary` | "Text, secondary": body, descriptions, `.nlink` | `#A1A1AA` | `#56565E` | Spec:53, ProjectSpread:50 |
| `text.label` | "Text, labels": nav links, mono counts, placeholders in media | `#8A8A93` | `#6A6A72` | Spec:54, Room:59, :134 |
| `text.logo-rest` | Stack logos at rest in Index rows | `#7A7A83` | `#76767E` | WallIndex2:40 |
| `text.404` | The "404" numerals | `#71717A` | `#7E7E86` | Moments:48 |
| `text.figure` | `[a detail]` figure placeholders | `#6B6F7C` | `#8A8A92` | ProjectSpread:127 |
| `text.tertiary` | Second label tone: dates, "Read · n min", phone placeholder, status "unknown" dot | `#61616A` | `#8E8E95` | Spec:54, WallIndex2:121, ProjectSpread:241 |
| `text.on-inverse` | Text on the inverse (light-on-dark) button or tooltip | `#0A0A0C` | `#F2F1ED` | Moments:56, ProjectSpread:29 |
| `fill.inverse` | Primary CTA / tooltip background | `#EDEDED` | `#111114` | Moments:56, ProjectSpread:29 |
| `fill.inverse.hover` | Primary CTA hover | `#FFFFFF` | `#2A2A30` | Moments:16, ProjectSpread:25 |

### 2.4 Status

| Token | Role | Dark | Light | Where |
|---|---|---|---|---|
| `status.live` | Live / shipped / running dot (and terminal `$`, which stays dark-mapped inside the terminal) | `#4ADE80` | `#16A34A` | Spec:57, ProjectSpread:241 |
| `status.live.ring` | 3 px ring around the dot (`box-shadow: 0 0 0 3px`) | `rgba(74,222,128,.18)` | unchanged | ProjectSpread:60, :241 |
| `status.wip` | Pre-launch / prototype / beta / progress | `#F0B45A` | `#B7791F` | Spec:58, ProjectSpread:241 |
| `status.wip.ring` | ring | `rgba(240,180,90,.16)` | unchanged | ProjectSpread:241 |
| `status.none` | Anything else | `#61616A` | `#8E8E95` | ProjectSpread:241 |
| `status.none.ring` | ring | `rgba(97,97,106,.2)` | unchanged | ProjectSpread:241 |

Status matching rules (`ProjectSpread.dc.html:241`): `live = /live|shipped|running/`, `wip = /pre-launch|prototype|beta|progress/`, tested on the lower-cased value.

### 2.5 Shelf objects and other placeholders (UI map)

| Token | Role | Dark | Light |
|---|---|---|---|
| `ph.dot` | Window-chrome dots (6 × 6) | `#2C2C32` | `#DCDAD4` |
| `ph.block` | Placeholder blocks, shelf object border (`#2C2C33`, `#2C2C34`) | `#2C2C34` | `#DCDAD4` |
| `ph.line` | Placeholder lines; shelf bookend | `#1F1F25` | `#E3E1DB` |
| `ph.avatar` | Round placeholder | `#1E1E24` | `#E5E3DD` |
| `ph.rail` | Narrow rail column | `#0D0D10` | `#F7F6F3` |
| `ph.titlebar` | Terminal title-bar rule | `#18181C` | `#ECEAE5` |
| `shelf.*` | Dark shelf parts: `#141418`, `#0E0E11`, `#1C1C21`, `#25252B`, `#18181D`, `#1F1F25` | see §7 | replaced wholesale, §7 |

---

## 3. Colour tokens: per-media-kind maps (`light.py:18-27`)

Inside a media block, only these replacements happen (case-sensitive `str.replace`). Every other colour in the block keeps its dark value. Each block also gets `shadow.object` (§5).

| Media kind (comment prefix) | Dark → Light | Not changed (keeps dark) |
|---|---|---|
| `phone app` | body `#050506` → `#1B1B1F`; bezel border `#2e2e35` → `#1B1B1F`; screen `#131317` → `#FFFFFF`; label `#8A8A93` → `#8E8E95` | notch `#000` |
| `Android TV` | body `#050506` → `#1B1B1F`; border `#2e2e35` → `#1B1B1F`; screen `#131317` → `#FFFFFF`; label `#8A8A93` → `#8E8E95`; neck `#141418` → `#2A2A2F`; foot `#1c1c21` → `#3A3A40` | — |
| `website` (website or web tool) | border `#26262c` → `#E3E1DB`; body `#0f0f12` → `#FFFFFF`; dots `#2c2c32` → `#E2E0DA`; bar rule `#1c1c22` → `#EEECE7`; page `#131317` → `#FAFAF8`; label `#8A8A93` → `#8E8E95` | — |
| `Discord` | border `#26262c` → `#E3E1DB`; server rail `#0d0d10` → `#E3E5E8`; server icon / lines `#2c2c34` → `#C4C8CE`; avatars `#1e1e24` → `#D3D6DB`; channels `#121215` → `#F2F3F5`; lines `#1f1f25` → `#DEE1E5`; chat `#17171b` → `#FFFFFF`; label `#8A8A93` → `#80848E` | — |
| `developer tool` (terminal) | border `#26262c` → `#1E1E22` | body `#08080a`, title rule `#18181c`, dots `#2c2c32`, text/cursor `#8A8A93`, prompt `#4ade80`. **The terminal stays dark.** |
| `open source` (repo card) | border `#26262c` → `#E3E1DB`; body `#0f0f12` → `#FFFFFF`; repo name `#EDEDED` → `#111114`; label `#8A8A93` → `#6A6A72`; desc `#A1A1AA` → `#56565E`; rule `#1c1c22` → `#ECEAE5` | — |
| `data system` | border `#26262c` → `#E3E1DB`; body `#131317` → `#FFFFFF`; label `#8A8A93` → `#8E8E95` | — |
| `writing` (paper sheet) | paper `#ECEBE6` → `#FFFFFF`; adds `border: 1px solid #E6E4DE` (match string `border-radius: 3px; background: #FFFFFF`) | ink `#111113`, body `#3f3f46`, meta `#61616A` |

Device-body token: `media.device.body` is dark `#050506`, light `#1B1B1F`. In light the bezel border equals the body.

---

## 4. rgba mappings (UI areas, `light.py:33-43`)

| Dark rgb triple | Light | Rule | Examples (source → light file) |
|---|---|---|---|
| `237,237,237` (text white) | `17,17,20` | alpha kept | canvas points |
| `10,10,12` (room) | `242,241,237` | alpha kept | `rgba(10,10,12,0.72)` → `rgba(242,241,237,0.72)` |
| `17,17,20` (panel) | `255,255,255` | alpha kept | `rgba(17,17,20,0.84)` → `rgba(255,255,255,0.84)` |
| `0,0,0` (shadow) | `17,17,20` | **alpha × 0.35**, printed with 3 decimals. Template alphas (`${…}`) can't be parsed, so they stay unchanged | `.5` → `0.175` (RoomLight:32, ProjectSpreadLight); `.45` → `0.158`; `.6` → `0.210`; `.30` → `0.105`; `.16` → `0.056` |
| any other | unchanged | — | status rings, window light, `rgba(17,17,19,…)` on paper |

The Room's wall mask `rgba(0,0,0,${…})` and `#000` are unchanged (template value and 3-digit hex), as intended for a mask.

---

## 5. Shadows

| Token | Value | Use | Source |
|---|---|---|---|
| `shadow.object` (light only) | `0 1px 2px rgba(17,17,20,.05), 0 16px 36px -18px rgba(17,17,20,.28)` | Lifts every media object off the light wall. Applied as `box-shadow` (not filter) "so 3D stays intact" | `light.py:6`, `:47-53` |
| — placement | phone: on every `border-radius: 28px; background: #1B1B1F;` body. TV: on the first `border-radius: 10px; background: #1B1B1F;`. Other kinds: prepended to the first `<div style="` after the comment | | `light.py:48-53` |
| `shadow.frame` | `0 30px 60px rgba(0,0,0,.45)` | 404 picture frame | Moments:46 |
| `shadow.nail` | `0 2px 4px rgba(0,0,0,.6)` | 404 nail | Moments:52 |
| `shadow.panel` | `0 24px 60px rgba(0,0,0,.5)` (light: `rgba(17,17,20,0.175)`) | Contents rail panel | ProjectSpread:175 |
| `shadow.book` (phone) | `0 24px 60px rgba(0,0,0,.45)` | Open book pages, phone | Mobile:286-287 |
| `shadow.spine` (phone) | `inset 0 1px 0 rgba(255,255,255,.08), inset 0 -5px 10px rgba(0,0,0,.22)` | Spine buttons, phone | Mobile:256 |
| `shadow.book-on-wall` | `rgba(0,0,0,0.5)`, `filter: blur(26px)`, radius 6 (light `rgba(17,17,20,0.175)`). `gallery` ambience only | Room:32 |
| `shadow.gutter` | `linear-gradient(to left/right, rgba(0,0,0,.16), rgba(0,0,0,0))`, 46 px wide | Book page gutter (paper; not converted) | BookPage:140 |
| `shadow.cast` | `linear-gradient(to right, rgba(0,0,0,.32), rgba(0,0,0,0))` | Turning-page cast (protected; unchanged in light) | AboutVolumes:71 |
| Wall tiles (dark) | none. The tile drop-shadow is disabled (`this.props.shadow && false`) | | WallIndex2:555 |

---

## 6. Points (canvas) tokens

| Token | Dark | Light | Source |
|---|---|---|---|
| `points.color` | `rgba(237,237,237,a)` | `rgba(17,17,20,a)` | Room:115 / RoomLight:115; `light.py:31` |
| `points.alpha` | `(0.075 + 0.33·e)` | `(0.11 + 0.30·e)` | Room:112 / RoomLight:112 |
| grid / radius / push | 30 px pitch; `1 + 0.6e` px; push up to 5 px; 200 px falloff (smoothstep) | same | Room:108-116 |
| resting while project open | `× (1 − 0.75·po)` | same | Room:112 |
| phone points (CSS) | `radial-gradient(circle, rgba(237,237,237,0.075) 1px, transparent 1.6px)`, `background-size: 26px 26px` | no light build | Mobile:27 |

Note: the alpha replacement string in `light.py:31` matches only the Room's `let a = (0.075 + 0.33 * e)`. It does not match the Moments formula (`const a = … + wave`).

---

## 7. Books, paper, shelf

### 7.1 Volume tones (protected, identical in both themes)

`const L = '#EDEDED', D = '#0a0a0c';` and the volumes array are protected (`light.py:91`). Spec lists the tones at `Spec.dc.html:56`.

| Token | Vol | Tone (cover) | Ink | Spine depth `D` (px) | Source |
|---|---|---|---|---|---|
| `vol.01` | 01 Aerol | `#EDEDED` | `#0a0a0c` | 84 | AboutVolumes:155-160 |
| `vol.02` | 02 How I work | `#26262c` | `#EDEDED` | 68 | AboutVolumes:166 |
| `vol.03` | 03 Guilds | `#15151a` | `#EDEDED` | 76 | AboutVolumes:171 |
| `vol.04` | 04 Training arc | `#202026` | `#EDEDED` | 96 | AboutVolumes:178 |
| `vol.05` | 05 Off the clock | `#18181d` | `#EDEDED` | 64 | AboutVolumes:185 |
| `vol.06` | 06 Next volume | `#EDEDED` | `#0a0a0c` | 56 | AboutVolumes:188 |

### 7.2 Book shading tweak

`shadeOf(front, R, v.ink === '#0a0a0c' ? 0.5 : 0.6, dim)` for the front face and `… ? 0.5 : 0.62` for the spine (AboutVolumes:348-349). In light, light-toned volumes (ink `#0a0a0c`) use **0.26** instead of 0.5 on both faces: "light volumes in a light room need less shade" (`light.py:92`; AboutVolumesLight:348-349). Dark volumes keep 0.6 / 0.62. The inside face stays 0.26 and the back face 0.6 in both themes.

### 7.3 Paper (not converted; identical in both themes)

| Token | Role | Value | Source |
|---|---|---|---|
| `paper.bg` | Book page / paper sheet | `#ECEBE6` | Spec:55, BookPage:33 |
| `paper.ink` | Ink | `#111113` | Spec:55, BookPage:33 |
| `paper.body` | Body copy on paper | `#3f3f46` | BookPage:50, :56 |
| `paper.meta` | Mono folios / TOC numbers | `#61616A` | BookPage:41 |
| `paper.rule` | Rules between TOC / list rows | `#D3D1C9` | BookPage:40, :70 |
| `paper.field` | Field underline (1.5 px) | `#C9C7BF` | BookPage:21 |
| `paper.field.title` | Title field underline (1.5 px dashed) | `#A9A79F` | BookPage:25 |
| `paper.placeholder` | Field placeholder / footer folio | `#8B8A84` | BookPage:23, :138 |
| `paper.placeholder.title` | Title placeholder | `#A3A29B` | BookPage:27 |
| `paper.slot` | Dashed photo / logo slot (1.5 px dashed) | `#B6B4AC` | BookPage:62, :76 |
| `paper.hover` | Link hover wash | `rgba(17,17,19,.06)` | BookPage:15 |
| `paper.focus` | Textarea focus wash | `rgba(17,17,19,.035)` | BookPage:24 |
| `paper.btn` | Shelve button: bg `#111113`, text `#ECEBE6`, radius 10; `:active` `#2a2a30` | | BookPage:116, :29 |
| `paper.edge` | Page-block edges: stripes `#E4E2DB` 2 px / `#cfcdc5` 1 px (`.edge` vertical stripes, `.edgeV` horizontal) | protected | AboutVolumes:23-24 |

### 7.4 Shelf replacement (light)

The dark shelf (AboutVolumes:34-41) is replaced wholesale (`light.py:78-90`):

| Part | Dark | Light |
|---|---|---|
| Top edge (left 300, w 840, top 780, h 2) | `#34343b` | `#FFFFFF` |
| Front (top 782, h 16) | `#141418` | `#E1DFD8` + `box-shadow: 0 10px 22px -10px rgba(17,17,20,.25)` |
| Under-shadow (left 310, w 820, top 798, h 26) | `#0e0e11` | `linear-gradient(rgba(17,17,20,.07), rgba(17,17,20,0))` |
| Lying book 1 (340, 744, 150×36, r3) | `#1c1c21`, top `#2c2c33` | `#DAD8D1`, top `#E8E6E0` |
| Lying book 2 (350, 712, 134×32, r3) | `#25252b`, top `#34343b` | `#26262B`, top `#3a3a40` |
| Lying book 3 (346, 686, 142×26, r3) | `#18181d`, top `#2a2a30` | `#FBFAF7`, top `#FFFFFF`, `box-shadow: inset 0 -1px 0 #E3E1DB` |
| Bookend upright (1004, 600, 14×180) | `#1f1f25`, left `#34343b` | `#2A2A30`, left `#3a3a42` |
| Bookend foot (1004, 766, 64×14) | `#1f1f25` | `#2A2A30` |

---

## 8. Brand / accent colours (unchanged by theme)

| Token | Role | Value | Source |
|---|---|---|---|
| `logo.*` | Stack logos take their brand colour on hover (`.lg:hover path{fill:var(--b)}`). At rest they are `text.label` (spread) or `text.logo-rest` (Index), with `transition: fill .3s ease` | Flutter `#02569B`, Firebase `#DD2C00`, Python `#3776AB`, MySQL `#4479A1`, YAML `#CB171E`, TypeScript `#3178C6`, Vite `#646CFF`, Tailwind `#06B6D4`, wasm-vips `#654FF0`, JavaScript `#F7DF1E`, Sheets `#34A853`, Dart `#0175C2`, Android `#34A853`, Discord `#5865F2`, .NET `#512BD4`, Go `#00ADD8`, Docker `#2496ED`, React `#61DAFB`, Astro `#BC52EE`; SQLite, Markdown, pandas, NumPy, Next.js, GitHub = `#EDEDED` | ProjectSpread:17-18, :190 |
| — inconsistency | The Index's map keeps raw brand values for the dark marks (SQLite `#003B57`, Markdown `#000000`, pandas `#150458`, NumPy `#013243`, Next.js `#000000`, GitHub `#181717`), which are near-invisible on `#0A0A0C`. Use the ProjectSpread values (`#EDEDED`, mapped to `#111114` in light) for both | | WallIndex2:322 |
| `accent.project[i]` | Per-project colour, used only by the non-default `tint` ambience ("stand-ins until the real screenshots are in"). Wall order 0–16: `#3DA6F5 #5865F2 #E0567A #D97757 #3DDC84 #E70488 #3178C6 #F2C14E #2F6BD9 #5865F2 #5865F2 #2FA866 #F0B45A #7B5BE6 #FF7A45 #2496ED #3E73D6`. In light, index 12 becomes `#B7791F` | | Room:76-77 |
| `light.window` | `window` ambience patch (non-default). Day: `rgba(255, 236−52w, 206−86w, 0.06+0.05h+0.035w)`. Night: `rgba(150, 172, 235, 0.055)`, `mix-blend-mode: screen` | | Room:141 |

The default ambience is `dots` (Room:64, :74).

---

## 9. Typography

Families (`Spec.dc.html:65`): **Geist 400–800**; **Geist Mono 400–500** "for data (counts, paths, labels)". Loaded from Google Fonts: `family=Geist:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500&display=swap`. Fallbacks are `system-ui, sans-serif` and `monospace`. Use `-webkit-font-smoothing: antialiased` on all roots.

Spec scale (`Spec.dc.html:66-69`):

| Token | Size / weight / tracking / line height | Source |
|---|---|---|
| `type.display` | 46–60 px · 600 · −0.045em · 1.0 (project titles) | Spec:66; ProjectSpread:49 = 46 / 600 / −0.045em / 1.02; Spec title 56 / 600 / −0.045em / 1 |
| `type.section` | 26 px · 600 · −0.02em | Spec:15, :67; ProjectSpread:138 |
| `type.system-title` | 21 px · 600 · −0.02em | Spec:67; ProjectSpread:152 |
| `type.body` | 17 px · 1.75 · `text.secondary` | Spec:68; ProjectSpread:139 |
| `type.body.left` | 16.5 px · 1.6 (left-page description) | Spec:68; ProjectSpread:50 |
| `type.ui` | 14–15 px UI (nav 14; buttons 14.5; rows 15) | Spec:69; Room:14 |
| `type.label` | 13 px | Spec:16, :69 |
| `type.mono` | Mono 11.5–12.5 px for counts and code (12 px is the most common) | Spec:69; WallIndex2:71 |

Other sizes found in components:

| Use | Value | Source |
|---|---|---|
| Wordmark (nav) | 16 / 600 / −0.02em | Room:52, Moments:30 |
| Loader name | 30 / 600 / −0.035em | Moments:26 |
| 404 headline | 40 / 600 / −0.04em / 1.05 | Moments:54 |
| 404 numerals | Mono 46 / 500 / −0.02em | Moments:48 |
| Phone page title | 34 / 600 / −0.04em / 1.05 | Mobile:173 |
| Paper sheet title | 25 / 700 / −0.03em / 1.12; desc 14.5 / 1.55 | WallIndex2:122-123 |
| Preview name | 20 / 600 / −0.02em | WallIndex2:135 |
| Index type heading | 22 / 600 / −0.03em; count Mono 11.5 / 400 / 0 | WallIndex2:61 |
| Index row name | 17 / 500 / −0.01em | WallIndex2:70 |
| Column heads | Mono 11.5 · tracking 0.06em | WallIndex2:219 |
| Book cover number | 150 / 800 / −0.075em / .86 | AboutVolumes:78 |
| Book page titles | 30–44 / 800 / −0.04 to −0.05em (`titleSize` per page: 50, 44, 40 px); "big" numerals `bigSize` 86 / 176 px | BookPage:37, :68, :87; volumes_js |
| Book cover / spine marks ("VOL.", "AEDWON") | Mono 10.5–12 px, tracking 0.14–0.22em, caps, opacity .7 (cover number 30 / 800 / −0.04em) | AboutVolumes:53, :57, :77; BookPage:131 |
| Book body | 17–18 / 1.5–1.6, `paper.body` | BookPage:50, :56 |
| Folio footer | Mono 10.5, `paper.placeholder` | BookPage:138 |
| Tooltip | `font: 500 12px 'Geist'` | ProjectSpread:29 |

Rule (`Spec.dc.html:70`): "No eyebrows, no pills, no glows or gradient washes. Real copy or honest [brackets]." The book chapter eyebrows are the content model's `eyebrow` field, inside the books only.

---

## 10. Radii

| Token | Value | Use | Source |
|---|---|---|---|
| `radius.hair` | 1–2 px | TV screen (2), small marks | WallIndex2:96 |
| `radius.paper` | 3 px | Paper sheets, book pages, shelf objects, 404 frame | WallIndex2:120, Moments:46 |
| `radius.sm` | 4 px | 404 clean patch, focus ring (Room `.rn` 4 px), TV stand `4px 4px 2px 2px` | Moments:43, Room:16 |
| `radius.tip` | 6 px | Tooltip; book shadow; book page `6px 3px 3px 6px` | ProjectSpread:29, AboutVolumes:82 |
| `radius.row` | 8 px | Index rows, rail links, Spec swatches | WallIndex2:68, ProjectSpread:36 |
| `radius.card` | 10 px | Discord / terminal / repo / data / TV frames; shelve button | WallIndex2:104-112, BookPage:116 |
| `radius.control` | 12 px | Buttons (44–48 px tall), browser frame, figure boxes, rail panel | Moments:56-57, WallIndex2:250, ProjectSpread:78, :175 |
| `radius.bar` | 14 px | Book control bar | AboutVolumes:129 |
| `radius.sheet` | 16 px 16 px 0 0 | Phone contents sheet | Mobile:245 |
| `radius.screen` / `radius.device` | 23 px / 28 px | Phone screen / phone body (5 px padding) | WallIndex2:92 |
| `radius.pill` | 99 px | Dots, nail, avatars | Moments:52 |

---

## 11. Z-layers

The Room stacks by DOM order, bottom to top (`Room.dc.html:22-60`):

1. points canvas
2. wall (WallIndex2)
3. shelf (book shadow plus AboutVolumes)
4. window light (`mix-blend-mode: screen`)
5. project layer (ProjectSpread)
6. nav (84 px)

Explicit `z-index` values:

| Token | Value | Use | Source |
|---|---|---|---|
| `z.nav` | 5 | Project / writing page nav | ProjectSpread:42, Writing:33 |
| `z.rail` | 6 | Contents rail | ProjectSpread:171, Writing:96 |
| `z.tooltip` | 9 | `.tip::after` tooltip | ProjectSpread:29 |
| `z.drum` | `{{ t.z }}` per card (computed) | Phone wall drum | Mobile:33 |

The 404 stacks by DOM order: canvas, nav, dashed outline, swing group, nail, copy (`Moments.dc.html:21-59`).

---

## 12. Breakpoints and frames

| Token | Value | Source |
|---|---|---|
| `frame.desktop` | 1440 × 900 ("Design size is 1440 × 900") | Spec:27; Room:19 |
| `frame.phone` | 390 × 844 | Mobile:27 |
| Desktop nav height / gutter | 84 px; 56 px side padding (44 px wordmark offset in Room) | Moments:29, Room:52 |
| Phone top bar / bottom nav | 56 px / 74 px | Mobile:330, :336 |
| Switch point | **Not specified in source.** No CSS `@media` width queries exist; the only `matchMedia` calls are `prefers-reduced-motion`. Choose and document one | grep across components |

---

## 13. Theme switch

Prototype (`Room.dc.html:59`, `:152-155`):

- A 44 × 44 link in the nav at `left: 1384px; top: 20px`, colour `text.label` (`--c`), hover `text.primary` (`.rn:hover`, `transition: color .3s ease`). Focus: 2 px `text.primary` outline, 2 px offset, radius 4.
- Icon: 18 × 18 SVG, `viewBox 0 0 24 24`, stroke `currentColor` 1.6, round caps and joins.
  - **Dark theme shows a sun**: `M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4`, with `aria-label="Switch to light"`.
  - **Light theme shows a moon**: `M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z`, with `aria-label="Switch to dark"`.
- In the prototype the link navigates between `Main.dc.html` and `MainLight.dc.html`.
- The Moments nav and the phone have no theme control in the source.

Production (per brief):

1. On first visit, follow `prefers-color-scheme`.
2. Once the visitor clicks the sun or moon, remember the explicit choice and use it on later visits instead of the system setting.

The source has no transition for the swap. It is a page change.
