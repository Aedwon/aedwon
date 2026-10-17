# Content model

Sources:

- `reference/generators/projects.py`: 17 projects in wall order, plus 3 writing posts.
- `reference/generators/volumes_js.txt`: the six About volumes. This is the same block as `AboutVolumes.dc.html:155-208`.

**Copy will change; the structure won't.** Keep every field name, kind value, array shape and ordering rule below exactly as written. Change only the strings.

**Placeholders.** Any value in `[square brackets]` is a placeholder. The house rule is "Real copy or honest [brackets]" (`Spec.dc.html:70`). Production must render brackets as they are until real copy replaces them. Do not hide them and do not invent filler. In the tables below, placeholders are marked **⟦P⟧**.

---

## 1. Project record (schema)

Built in `projects.py:3-116`. After construction, tuples become objects (`projects.py:79-81`), templated sections are added (`:82-87`), and every section gets `kind` (default `'text'`, `:114-116`).

| Field | Type | Required | Meaning / used by | Source |
|---|---|---|---|---|
| `id` | string | yes | URL slug: `/work/:id` (`Spec.dc.html:41`) | `:4` |
| `name` | string | yes | Title | `:4` |
| `type` | string | yes | One of the 10 types in §1.1. Drives the type icon and the Index filter group | `:4` |
| `media` | enum | yes | `phone` · `tv` · `web` · `discord` · `term` · `data` · `repo` · `paper`. Picks the media mock (`WallIndex2.dc.html:553`, `ProjectSpread.dc.html:224`) | `:4` |
| `depth` | enum | yes | `note` (work only) · `writeup` (The brief / What I built / How it went) · `case` (whole case study on the page) (`Spec.dc.html:91`) | `:2`, `:4` |
| `desc` | string | yes | Left-page description; Index preview | `:5` |
| `stack` | string[] | yes (may be `[]`) | Logo keys (see `tokens.md` §8). Unknown names fall back to text | `:6` |
| `stackText` | string | optional | Text shown instead of logos (repos: `owner/repo`; Lakambini: ⟦P⟧) | `:20`, `:64` |
| `repo` | string | open source only | `owner/repo`, shown on the repo card | `:62` |
| `links` | `{label, href}[]` | yes (may be `[]`) | `links[0]` is the main link. A second `[Source]` link is "the source as a mark" (`ProjectSpread.dc.html:65`) | `:7` |
| `facts` | `{k, v}[]` | yes | Details as icon + fact. A `k` of `Status` gets a coloured dot (`tokens.md` §2.4) | `:8`, `:80` |
| `points` | `{h, p}[]` | Pantas only | Three headline points | `:9`, `:81` |
| `sections` | Section[] | yes | Right page story (§1.2) | `:82-113` |
| `post`, `topic`, `mins`, `date` | — | writing only | §3 | `:125-128` |

### 1.1 Types and Index filter groups

`WallIndex2.dc.html:309-318`:

| Group label | `type` values | Type icon |
|---|---|---|
| Apps | Mobile app, Android TV | phone, tv |
| Bots | Discord bot | bot |
| Web | Website redesign, Web tool, Civic tech | redesign, web, civic |
| Tools | Developer tooling, Data system | term, data |
| Open source | Open source | repo |
| Writing | Writing | pen |

### 1.2 Section kinds

| `kind` | Fields | Used by |
|---|---|---|
| `text` | `h`, `p: string[]`, optional `fig` (figure placeholder caption) | all |
| `systems` | `h`, `p[]`, `items: {h, which, vh, p[]}[]`. `which` names a SystemViz visual (`roadmap`, `study`, `content`, `insights`, `pro`); `vh` is its height | Pantas |
| `status` | `h`, `p[]`, `cols: {h, items[]}[]`, `link: {label, href}` | Pantas |

Templated sections:

- **writeup** (`projects.py:82-85`):
  1. `The brief`: `['[Who it was for and what they needed, in two or three sentences.]']` ⟦P⟧
  2. `What I built`: `[desc, '[One or two sentences on the hardest part, and how you solved it.]']`, with `fig='[<name>, in use]'` ⟦P⟧
  3. `How it went`: `['[The result: numbers if you have them, or what people said.]']` ⟦P⟧
- **Open source** (`projects.py:86-87`): one section, `What I contributed`: `['[Your PR or contribution, in a sentence or two, with a link.]']` ⟦P⟧

The "Contents" rail shows only when a project has more than one section (`Spec.dc.html:92`).

---

## 2. The 17 projects (wall order)

The wall shows these 17 in this order. Writing is excluded from the wall (`WallIndex2.dc.html:305`, `NW = P.filter(p => p[4] !== 'paper').length`).

| # | id | name | type | media | depth | stack | links | Source |
|---|---|---|---|---|---|---|---|---|
| 1 | `pantas` | Pantas | Mobile app | phone | case | Flutter, Dart, Firebase, Drift, RevenueCat | pantas.app → https://pantas.app | `:4-13` |
| 2 | `msl` | MSL Network Bot | Discord bot | discord | writeup | Python, MySQL | ⟦P⟧ `[Invite or demo link]` → `#` | `:14-17` |
| 3 | `lakambini` | Lakambini | Website redesign | web | note | `[]`, stackText ⟦P⟧ `[stack]` | ⟦P⟧ `[lakambini url]` | `:18-21` |
| 4 | `agent` | AI Agent Config | Developer tooling | term | writeup | Python, Markdown, YAML | ⟦P⟧ `[Source]` | `:22-25` |
| 5 | `kiosk` | Kiosk Survey | Android TV | tv | writeup | Flutter, Dart, Firebase, Android | none | `:26-29` |
| 6 | `pso` | PSO Scorer | Data system | data | writeup | Python, pandas, NumPy, Sheets | none | `:30-33` |
| 7 | `qr` | QR Studio | Web tool | web | note | TypeScript, Vite, Tailwind | ⟦P⟧ `[qr studio url]`, ⟦P⟧ `[Source]` | `:34-37` |
| 8 | `webp` | WebP Unli | Web tool | web | note | Next.js, TypeScript, wasm-vips | ⟦P⟧ `[webp unli url]`, ⟦P⟧ `[Source]` | `:38-41` |
| 9 | `norala` | Norala SB Portal | Civic tech | web | writeup | Next.js, TypeScript, Tailwind | ⟦P⟧ `[portal url]` | `:42-45` |
| 10 | `cup` | MSL Collegiate Cup Bot | Discord bot | discord | writeup | Python, Sheets | none | `:46-49` |
| 11 | `ilocos` | Ilocos Sur Esports Bot | Discord bot | discord | writeup | Python, MySQL | none | `:50-53` |
| 12 | `oppo` | OPPO Cup Bot | Discord bot | discord | writeup | Python, MySQL | none | `:54-57` |
| 13 | `kqm` | KQM Team DPS Calculator | Web tool | web | note | JavaScript, Vite | ⟦P⟧ `[calculator url]` | `:58-61` |
| 14 | `aspire` | Microsoft Aspire | Open source | repo | note | GitHub; stackText/repo `microsoft/aspire` | github.com/microsoft/aspire | `:62-65` |
| 15 | `opensre` | OpenSRE | Open source | repo | note | GitHub; `Tracer-Cloud/opensre` | github.com/Tracer-Cloud/opensre | `:66-69` |
| 16 | `dockroute` | DockRoute | Open source | repo | note | GitHub; `Dockroute/Dockroute` | github.com/Dockroute/Dockroute | `:70-73` |
| 17 | `bettergov` | BetterGov PH | Open source | repo | note | GitHub; `bettergovph/bettergov` | github.com/bettergovph/bettergov | `:74-77` |

Every placeholder link has `href: '#'`.

### 2.1 Descriptions (`desc`)

| id | desc |
|---|---|
| pantas | Android-first exam reviewer for Philippine civil service and university entrance preparation, with encrypted local study state and on-device FSRS-6 scheduling. |
| msl | Single-server MLBB Discord bot that connects account verification with XP, Event Points, events, quests, moderation, and reporting. |
| lakambini | Redesign of the website for Lakambini, an events and creative agency I worked with. ⟦P⟧ `[One line on what changed or the result.]` |
| agent | Portable configuration system for coding agents that composes shared policy with project-owned rules and renders the selected result into provider-specific instruction files. |
| kiosk | Touchscreen survey app for Android TV that operated for 8 continuous hours during a live event without internet, syncing queued submissions once reconnected. |
| pso | Evaluation and scoring model processing 4,000+ national Science Olympiad competitors across elimination tiers. |
| qr | In-browser QR code builder with gradient styling and SVG export that runs entirely client-side without backend requests. |
| webp | Next.js static export that converts supported images to WebP in a wasm-vips worker. Each queued file stores its own options, and completed results can be downloaded individually or as a ZIP. |
| norala | Unofficial bilingual legislative-transparency prototype with repository-backed records, derived council links, and explicit safeguards that keep the demo separate from an official LGU service. |
| cup | Python Discord bot that connects tournament roster data to player verification and match acknowledgements, then keeps live match and support state on disk so those workflows can recover after restarts. |
| ilocos | Tournament and community bot for the Ilocos Sur Provincial Government syncing player registrations with Challonge brackets on Hostinger VPS. |
| oppo | Corporate tournament bot for OPPO Philippines managing team verification, roster validation, and automated support workflows on Hostinger VPS. |
| kqm | Theorycrafting calculator for character damage formulas, artifact substat rolls, and weapon scaling. |
| aspire | Code-first tooling for building, observing, and deploying distributed applications. |
| opensre | Open-source toolkit for building AI SRE agents for observability, incident response, and remediation. |
| dockroute | External-DNS for plain Docker hosts, keeping DNS records aligned with container routes. |
| bettergov | Open-source effort building a better national website for the Philippines. |

### 2.2 Facts (`facts`, in order)

| id | facts (k: v) |
|---|---|
| pantas | Role: Lead Architect & Developer · Status: Pre-launch · Platform: Android · Timeline: ⟦P⟧ `[Start] – present` · Scale: 158 lessons, 3,163 questions |
| msl | Role: ⟦P⟧ · Year: ⟦P⟧ · Platform: Discord · Status: ⟦P⟧ |
| lakambini | Client: Lakambini · Role: ⟦P⟧ · Year: ⟦P⟧ · Platform: Web |
| agent | Role: ⟦P⟧ · Year: ⟦P⟧ · Platform: CLI · Status: ⟦P⟧ |
| kiosk | Role: ⟦P⟧ · Event: ⟦P⟧ · Platform: Android TV · Ran for: 8 hours, offline |
| pso | Client: PSYSC · Role: Science Olympiad Core · Year: 2024 · Scale: 4,000+ competitors |
| qr | Role: ⟦P⟧ · Year: ⟦P⟧ · Platform: Web · Runs: Entirely in the browser |
| webp | Role: ⟦P⟧ · Year: ⟦P⟧ · Platform: Web · Runs: Entirely in the browser |
| norala | Role: ⟦P⟧ · Year: ⟦P⟧ · Platform: Web · Status: Prototype, unofficial |
| cup | Role: ⟦P⟧ · Year: ⟦P⟧ · Platform: Discord · Status: ⟦P⟧ |
| ilocos | Client: Ilocos Sur Provincial Government · Role: ⟦P⟧ · Year: ⟦P⟧ · Hosting: Hostinger VPS |
| oppo | Client: OPPO Philippines · Role: ⟦P⟧ · Year: ⟦P⟧ · Hosting: Hostinger VPS |
| kqm | Role: ⟦P⟧ · Year: ⟦P⟧ · Platform: Web · For: KQM-standard theorycrafting |
| aspire, opensre, dockroute, bettergov | Contribution: ⟦P⟧ `[your PR or contribution]` · Year: ⟦P⟧ |

⟦P⟧ alone means the literal `[Role]`, `[Year]`, `[Status]` or `[Event]`.

### 2.3 Sections per project

| id | depth | sections (`h`, kind) |
|---|---|---|
| pantas | case | see §2.4 |
| msl, agent, kiosk, pso, norala, cup, ilocos, oppo | writeup | The brief · What I built (fig `[<name>, in use]`) · How it went, all `text`, mostly ⟦P⟧ |
| lakambini, qr, webp, kqm | note | none (the work only) |
| aspire, opensre, dockroute, bettergov | note | What I contributed ⟦P⟧ |

### 2.4 Pantas (case study, `projects.py:89-113`)

`points` (`:9`):

| h | p |
|---|---|
| Works offline | Content ships inside the app and study state lives in an encrypted local database. |
| FSRS-6 review scheduling | Each student's review dates adapt to their own answer history, computed on the device. |
| A plan that adapts daily | The roadmap sizes each day from the work left, the days left and how the student actually studies. |

`sections` (the final list; the first definition at `:10-13`, `more` and `caseLabel` are removed at `:91-92`):

| # | kind | h | content |
|---|---|---|---|
| 1 | text | Why Pantas | ⟦P⟧ `[2–3 sentences: who it's for …]` |
| 2 | text | Keeping study state local | 3 real paragraphs (`:95-97`) |
| 3 | text | What happens after an answer | ⟦P⟧ `[Your existing text for this section.]`; fig ⟦P⟧ `[5s silent loop: answer → next review date]` |
| 4 | systems | How Pantas works | intro p (`:99`) + 5 items (below) |
| 5 | text | Building content before it reaches the app | 3 real paragraphs (`:106-108`) |
| 6 | status | Status and what’s next | p (`:109`), 3 cols (below), link ⟦P⟧ `[Join the waitlist]` → `#` |

Systems items (`:100-104`):

| h | which | vh | p count |
|---|---|---|---|
| Adaptive roadmap | roadmap | 370px | 2 |
| Study loop | study | 370px | 2 |
| Content | content | 370px | 2 |
| Insights | insights | 410px | 2 |
| Pro and backup | pro | 370px | 2 |

Status columns (`:110-112`):

| h | items |
|---|---|
| Shipping (on main) | Content pipeline and illustrations · Placement, study loop, mock exams · Insights, Wrapped, notifications · Pro, sync, consent-based telemetry · Build and release |
| Candidate (on a branch) | Adaptive roadmap · Prepared Today session · Signed, encrypted content packages · Tendency confidence · Question QA round |
| Planned | Content coverage audit · Per-student scheduler optimizer · Export link and scheduled cleanups · ⟦P⟧ `[Launch target]` |

Discrepancy: the Index rows in `WallIndex2.dc.html:283-299` carry an older short stack string (Pantas `Flutter · Firebase · SQLite`, Kiosk `Flutter · Firebase`, PSO without Sheets). `projects.py` is the authoritative content source.

---

## 3. Writing posts (`projects.py:118-131`)

The posts appear in the Index only, never on the wall. Each opens like a project at `/writing/:slug`, and Back returns to the Index (`Spec.dc.html:39-40`).

| id | name (title) | topic | mins |
|---|---|---|---|
| `w1` | ⟦P⟧ `[On building Pantas offline-first]` | Pantas · offline-first | ⟦P⟧ `[6] min` |
| `w2` | ⟦P⟧ `[What 8 hours without internet taught me]` | Kiosk Survey · events | ⟦P⟧ `[4] min` |
| `w3` | ⟦P⟧ `[Scoring 4,000 Olympiad competitors]` | PSO Scorer · data | ⟦P⟧ `[5] min` |

Shared fields for every post (`:125-131`):

| Field | Value |
|---|---|
| `type` / `media` / `depth` / `post` | `'Writing'` / `'paper'` / `'writeup'` / `true` |
| `desc` | ⟦P⟧ `[A two-line summary: what the piece is about and who it’s for.]` |
| `stack`, `stackText`, `links` | `[]`, `''`, `[]` |
| `date` | ⟦P⟧ `[Month DD, YYYY]` |
| `facts` | Published: ⟦P⟧ `[Month DD, YYYY]` · Reading time: `<mins> read` · Topic: `<topic>` |
| `sections` | ⟦P⟧ `[First section]` (2 p) · ⟦P⟧ `[Second section]` (1 p, fig ⟦P⟧ `[a figure]`) · ⟦P⟧ `[What I’d do differently]` (1 p), all `text`, all bodies ⟦P⟧ |

In the Index, choosing Writing makes the third column TOPIC (`Spec.dc.html:39`).

---

## 4. Volumes (About shelf, `volumes_js.txt`)

### 4.1 Volume record

| Field | Meaning |
|---|---|
| `n` | `'01'`–`'06'` |
| `title` | Volume title; also the running head (`running`) on its pages |
| `tone` / `ink` | Cover colour / cover text (see `tokens.md` §7.1; `L = '#EDEDED'`, `D = '#0a0a0c'`) |
| `D` | Spine thickness in px (on the shelf ×0.92, `AboutVolumes.dc.html:206-207`) |
| `contact` | `true` on Vol. 06: no contents page |
| `pages` | Page[] (§4.3) |

Derived on build (`volumes_js.txt:35-47`):

1. Unless `contact`, page 0 is an auto `contents` page. Its `toc` entries are `{title: p.t || p.title || p.org || p.big, page: i+1, n: '01'…}`.
2. If the total is odd, an `end` page is appended: `{kind:'end', vol, nextVol, nextTitle}`.
3. Every page with index > 0 that is not `end` gets `folio = String(i).padStart(2,'0')`.
4. `spreads = all.length / 2`.

Book page size is 420 × 600 (`AboutVolumes.dc.html:205`).

### 4.2 The six volumes

| Vol | title | tone / ink | D | body pages (kinds, in order) | total pages (with auto) | spreads |
|---|---|---|---|---|---|---|
| 01 | Aerol | L / D | 84 | text · photo · text · text · big | 6 (contents + 5) | 3 |
| 02 | How I work | `#26262c` / L | 68 | big · text · list | 4 | 2 |
| 03 | Guilds | `#15151a` / L | 76 | guild × 5 | 6 | 3 |
| 04 | Training arc | `#202026` / L | 96 | org × 7 (1 real + 6 `ph()`) | 8 | 4 |
| 05 | Off the clock | `#18181d` / L | 64 | read × 3 | 4 | 2 |
| 06 | Next volume | L / D | 56 | titleit · write · contact | 4 (3 + end) | 2 |

### 4.3 Page kinds and their fields

The renderer knows these kinds (`BookPage.dc.html:150`): `contents, big, text, photo, list, org, guild, read, contact, end, titleit, write`.

| kind | Fields | Used in |
|---|---|---|
| `contents` | auto: `vol`, `title`, `toc[]` | 01–05 |
| `text` | `t?` (TOC label), `eyebrow`, `title`, `titleSize`, `body`, `meta?` | 01, 02 |
| `photo` | `t`, `slot`, `caption` | 01 |
| `big` | `t`, `eyebrow`, `big`, `bigSize`, `body` | 01, 02 |
| `list` | `t`, `eyebrow`, `title`, `items: {a, b}[]` | 02 |
| `guild` | `eyebrow`, `title`, `cols` (1 or 2), `orgs: string[]` (logo slots render as `[<org> logo]`) | 03 |
| `org` | `eyebrow`, `org`, `roles: {title, dates, desc}[]` | 04 |
| `read` | `t`, `eyebrow` (no other content) | 05 |
| `titleit` | none (form: title the next volume) | 06 |
| `write` | none (form: name, mail, msg) | 06 |
| `contact` | `quickTitle` | 06 |
| `end` | auto: `vol`, `nextVol`, `nextTitle` | 06 |

The Vol. 06 form state is `{name, mail, msg, title, ready}`. The byline reads `by <name or "you"> and Aerol`. "Copy" writes `aerol.balayon@gmail.com` to the clipboard and resets after 1800 ms (`BookPage.dc.html:157`, `:166`).

### 4.4 Page content per volume

**Vol. 01 · Aerol**

| # | kind | t | eyebrow | title / big | size | body | meta / caption |
|---|---|---|---|---|---|---|---|
| 1 | text | Hello | CHAPTER 1 | Hi. I’m Aerol. | 50px | I design and build apps, bots and websites, mostly for communities, events and people studying for something hard. | Manila · ⟦P⟧ `[open to freelance and full-time work]` |
| 2 | photo | A photo | — | slot ⟦P⟧ `[a photo of you]` | — | — | ⟦P⟧ `[where this was taken]` |
| 3 | text | — | CHAPTER 2 | High school | 44px | ⟦P⟧ | ⟦P⟧ `[School] · [years]` |
| 4 | text | — | CHAPTER 3 | College | 44px | ⟦P⟧ | ⟦P⟧ `[University] · [course] · [years]` |
| 5 | big | Why “Aedwon” | CHAPTER 4 · ONLINE, I GO BY | Aedwon | 86px | Online, that’s me. ⟦P⟧ `[Where the name comes from, in two sentences.]` | — |

**Vol. 02 · How I work**

| # | kind | t | eyebrow | title / big | size | body / items |
|---|---|---|---|---|---|---|
| 1 | big | Research first | CHAPTER 1 · RESEARCH FIRST | 80% | 176px | of every project is research and planning, before any code. |
| 2 | text | The optimal choice | CHAPTER 2 · OPTIMIZE | Is this the most optimal choice? | 40px | I obsess over it. Every architecture and every workflow gets the same question before it stays. |
| 3 | list | Daily kit | CHAPTER 3 · DAILY KIT | What I build with | — | Claude Code / agentic coding · Codex / agentic coding · using-superpowers / skill framework · Matt Pocock’s skills / engineering · Gemini Deep Research / research |

**Vol. 03 · Guilds** (all `guild`)

| # | eyebrow | title | cols | orgs |
|---|---|---|---|---|
| 1 | GAMES & ESPORTS | Games and esports | 2 | MOONTON, HoYoverse, Dark League Studios, UP Oblation Esports |
| 2 | BRANDS | Brands | 1 | OPPO Philippines |
| 3 | GOVERNMENT | Government | 1 | Ilocos Sur Provincial Government |
| 4 | EDUCATION & SCIENCE | Education and science | 1 | PSYSC, 3STUDYANTE |
| 5 | UNIVERSITY | University | 1 | UP Diliman, UP Fighting Maroons, UP Fair 2024 |

**Vol. 04 · Training arc** (all `org`, eyebrow `TRAINING ARC`)

| # | org | roles |
|---|---|---|
| 1 | PSYSC | Marketing Associate · Feb 2024 – Present · Secured corporate sponsorships generating over ₱800,000 in funding for a national science competition. / Regional Head, Region I/II/NCR · May – Sep 2024 · Directed regional elimination rounds and MathSciAKa workshops, coordinating 30+ volunteers. / Science Olympiad Core · May – Sep 2024 · Co-authored 500+ questions and built the scoring model for 4,000+ competitors. |
| 2–7 | MOONTON Games · UP Fighting Maroons · UP Oblation Esports · Dark League Studios · UP Fair 2024 · miHoYo (HoYoverse) | `ph(o)` (`AboutVolumes.dc.html:156`): one role ⟦P⟧ `{title:'[Role]', dates:'[Start] – [End]', desc:'[What you did and what came of it, in a sentence or two.]'}` |

**Vol. 05 · Off the clock** (all `read`)

| # | t | eyebrow |
|---|---|---|
| 1 | Manhwa | READING · MANHWA |
| 2 | Manga | READING · MANGA |
| 3 | Isekai and fantasy anime | WATCHING · ISEKAI & FANTASY |

**Vol. 06 · Next volume** (`contact: true`)

| # | kind | fields |
|---|---|---|
| 1 | titleit | — |
| 2 | write | — |
| 3 | contact | quickTitle: Or the quick way |
| 4 | end (auto) | nextVol `''`, nextTitle `''` |

---

## 5. What may change and what may not

| Free to change | Keep fixed |
|---|---|
| Any string value, replacing ⟦P⟧ brackets with real copy | Field names (`id, name, type, media, depth, desc, stack, stackText, repo, links{label,href}, facts{k,v}, points{h,p}, sections{kind,h,p,fig,items,cols,link}, post, topic, mins, date`; volume `n, title, tone, ink, D, contact, pages`; page fields per kind) |
| Number of facts, links, stack items, paragraphs | Enumerations: `media`, `depth`, section `kind`, page `kind`, the 10 `type` values and their 6 filter groups |
| Adding or removing projects and posts | Wall order = array order; writing is never on the wall; slugs = `id` |
| Volume page copy and page count | Auto rules: contents page, `end` padding to even, folio numbering, TOC title fallback chain |
| — | Six volumes, with Vol. 06 as contact |
