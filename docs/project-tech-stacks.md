# Project technology stacks

Snapshot audited 24 October 2026 (Asia/Manila), with a review pass on 25 October. The table covers all 22 portfolio entries plus the portfolio host; detailed evidence and snapshot dates are in the appendix.

## Project stack matrix

| Project | Languages & frameworks | Data & integrations | Notes |
| --- | --- | --- | --- |
| Portfolio host | TypeScript, React, Next.js 16, Tailwind CSS 3, Node.js 24 | Vercel Speed Insights; Vercel configured target | PostHog, Vercel Analytics, and Framer Motion are declared but not active in the portfolio app. Live deployment is unverified. |
| Pantas | Dart, Flutter | Riverpod, GoRouter, Drift/SQLite, Firebase Auth/Firestore/Functions, RevenueCat webhook | `purchases_flutter` and Dio are declared without confirmed app imports. |
| Lakambini | TypeScript, React, Next.js, Tailwind CSS, Framer Motion | None verified | React was missing from the portfolio stack. |
| AI Agent Config | Python | YAML configuration, Markdown templates and outputs | Markdown and YAML are file formats, not runtime frameworks. |
| Kiosk Survey | Dart, Flutter | Hive, CSV and file export | Android and iOS scaffolds; no Firebase dependency. |
| QR Studio | JavaScript, Vite | `qr-code-styling` | Playwright is test tooling. |
| WebP Unli | TypeScript, React, Next.js, Tailwind CSS | `wasm-vips` image processing | The `vercel.app` link does not verify current hosting. |
| Norala SB Portal | TypeScript, React, Next.js, Tailwind CSS | `next-intl` localization | React and `next-intl` are missing from the portfolio stack. |
| MSL Collegiate Cup Bot | Python, `discord.py` | JSON state; `gspread` backup helper | Repository match is inferred. Google Sheets is limited to a backup helper. |
| MSL Network Bot | Python, `discord.py` | MySQL through `aiomysql`; stdlib API with PyMySQL | Live status of the separate API is unknown. |
| Ilocos Sur Festival Esports Bot | Python, `discord.py` | MySQL through `aiomysql` | Verified in entry point and database code. |
| OPPO Hyper Legend Cup Bot | Python, `discord.py` | MySQL through `aiomysql`; `aiohttp` declared | `aiohttp` import was not confirmed. |
| Marwie Community Bot | Python, `discord.py`, SQLAlchemy | SQLite through `aiosqlite`; PostgreSQL through `asyncpg`; Alembic declared | Alembic import was not confirmed. MySQL is not declared. |
| KQM Team DPS Calculator | TypeScript, React, Vite | Zustand, `genshin-db` | Next.js is not used. |
| Microsoft Aspire contribution | C# | Aspire CLI and tests | PR 19614 was open at the audit snapshot. |
| OpenSRE contribution | Python | VictoriaLogs integration and tests | PR 5634 was merged. This records Aedwon’s contribution only. |
| DockRoute contribution | None in contributed code | README only | PR 41 was a merged documentation contribution. |
| BetterGov PH | TypeScript, React, Vite, Tailwind CSS | Cloudflare Workers/KV, Meilisearch | Evidence covers a local fork only; upstream and live stack are unknown. |
| Genshin wish counter | TypeScript, React, Next.js host | Checked-in wish data; Node.js import script | Read-only counter; inherits portfolio host. |
| The next model won’t fix your specification | Not applicable | None | Writing project. |
| A perfect factory can still make something nobody wants | Not applicable | None | Writing project. |
| MLBB Post-Game Extractor | JavaScript, React, Vite | Tesseract.js OCR | JavaScript is the implementation language. |
| Kanlungan | Unknown | Unknown | Repository has a README only. |

## Aggregate technology inventory

This is the deduplicated inventory supported by the records above. It distinguishes Aedwon-owned code from upstream contributions. MSL Cup is an inferred repository match. BetterGov describes a local-only fork. Keep those qualifications when reusing the entries.

| Technology | Projects with evidence | Use |
| --- | --- | --- |
| Python | AI Agent Config, MSL Collegiate Cup Bot, Ilocos Bot, Marwie Bot, MSL Network Bot, OPPO Bot; OpenSRE contribution | Application, bot, serverless API, and automation code |
| Dart / Flutter | Kiosk Survey, Pantas | Mobile app language and framework |
| JavaScript | MLBB Extractor, QR Studio, Genshin import script | Browser app and import tooling code |
| TypeScript | Portfolio host, Genshin counter, KQM Calculator, Lakambini, Norala, Pantas Functions, WebP Unli, BetterGov local fork | Web app and server-function code |
| C# | Microsoft Aspire contribution | CLI and test changes in an open upstream PR |
| React | Portfolio host, Genshin counter, KQM Calculator, Lakambini, MLBB Extractor, Norala, WebP Unli, BetterGov local fork | UI library, often through Next.js or Vite |
| Next.js | Portfolio host, Genshin counter, Lakambini, Norala, WebP Unli | Web framework |
| Vite | BetterGov local fork, KQM Calculator, MLBB Extractor, QR Studio | Web build and development server |
| Tailwind CSS | Portfolio host, Lakambini, Norala, WebP Unli, BetterGov local fork | Styling system |
| Framer Motion | Lakambini | Browser animation library |
| Tesseract.js | MLBB Extractor | Browser OCR |
| `qr-code-styling` | QR Studio | QR code rendering |
| `wasm-vips` | WebP Unli | WebAssembly image processing |
| `discord.py` | MSL Collegiate Cup Bot, Ilocos Bot, Marwie Bot, MSL Network Bot, OPPO Bot | Imported by each bot entry point |
| `aiomysql` | Ilocos Bot, MSL Network Bot, OPPO Bot | Async MySQL driver |
| `PyMySQL` | MSL Network Bot API | MySQL driver in the Vercel-style stats handler |
| `aiosqlite` / `asyncpg` | Marwie Bot | SQLite and PostgreSQL drivers used by its SQLAlchemy adapters |
| MySQL | Ilocos Bot, MSL Network Bot, OPPO Bot | Relational database |
| SQLite | Marwie Bot, Pantas | Local or embedded relational storage |
| PostgreSQL | Marwie Bot | Relational database |
| Firebase | Pantas | Auth, Firestore, and Cloud Functions integration |
| RevenueCat | Pantas | Webhook integration implemented; Flutter SDK declared but unused in app source |
| Hive | Kiosk Survey | Local key-value storage |
| Drift | Pantas | Typed SQLite persistence |
| Node.js | Portfolio host (Node 24), Genshin import script, Pantas Functions (Node 20) | Web and server/tooling runtimes |
| Riverpod / GoRouter | Pantas | State management and routing |
| Zustand / `genshin-db` | KQM Calculator | State management and Genshin data |
| `next-intl` | Norala SB Portal | Next.js localization |
| SQLAlchemy | Marwie Bot | ORM used by database session code |
| Alembic | Marwie Bot | Declared migration dependency; active import not confirmed |
| `aiohttp` | MSL Cup likely source, Marwie Bot, OPPO Bot | Declared dependency; active import not confirmed in this review |
| `gspread` / Google Sheets | MSL Collegiate Cup Bot backup helper | Imported helper code; active bot use unverified |
| Markdown / YAML | AI Agent Config | Documentation, templates, and configuration formats |
| Cloudflare Workers / KV | BetterGov local fork | Wrangler config and local source only; deployment unverified |
| Meilisearch | BetterGov local fork | Search/indexing in local source only; upstream/live use unverified |
| Vercel | Portfolio host | Configured target; current live deployment not verified |

## Build and test tooling

| Tooling | Projects with evidence | Status |
| --- | --- | --- |
| Vitest | Portfolio host, MLBB Extractor, WebP Unli | Test runner |
| Testing Library, jsdom | Portfolio host | Component tests and DOM test environment |
| Playwright | QR Studio, WebP Unli, BetterGov local fork | Browser end-to-end tooling |
| `flutter_test` | Kiosk Survey, Pantas | Flutter test framework |
| `integration_test`, mocktail | Pantas | Integration and mock tooling |
| `build_runner`, `freezed`, `json_serializable`, `drift_dev` | Pantas | Code generation and development dependencies |
| pytest, pytest-asyncio, Ruff, mypy | Marwie Bot | Development and verification tools |
| ESLint | Portfolio host, Lakambini, Norala, WebP Unli, BetterGov local fork | Lint tooling |
| GitHub Actions | AI Agent Config, MSL Cup likely source, Ilocos Bot, MSL Network Bot, OPPO Bot | Verification or deployment workflows; MSL Cup mapping is inferred |

## Workflow book map

| Category | Technologies | Projects |
| --- | --- | --- |
| Web | TypeScript/React/Next.js; React/Vite with TypeScript or JavaScript | Portfolio, Genshin counter, Lakambini, Norala, WebP; KQM, QR, MLBB |
| Mobile | Flutter/Dart; Hive; Drift/SQLite; Firebase | Kiosk Survey, Pantas |
| Bots and data | Python/`discord.py`; MySQL; SQLite/PostgreSQL with SQLAlchemy | Five bot projects; Marwie |
| Focused tools | Tesseract.js, wasm-vips, qr-code-styling | MLBB, WebP, QR Studio |
| Contributions | C#, Python; documentation | Aspire, OpenSRE, DockRoute |

Keep these out of unqualified first-person stack claims: Google Sheets is confined to the inferred MSL Cup backup helper; Pantas’ `purchases_flutter` and Dio are declared without confirmed app imports; BetterGov evidence covers only a local fork; and Kanlungan has no source code to inspect. The live deployment behind URL-only project links remains unverified.
<details>
<summary>Source evidence and audit notes</summary>

## How to read this audit

The audit separates three evidence states. **Implemented** means source imports or calls the technology in an application path. **Declared** means a manifest lists it, but no active code path was confirmed. **Configured target** means repository configuration names a hosting or runtime service. Configuration alone does not prove that the live site currently runs that revision. Languages and frameworks are separate from hosting, data services, and development tools. This audit does not count every transitive package.

External repository links use commit-pinned source files. Each SHA is the remote default-branch commit observed on the audit date, except where a contribution pull request is the relevant source. The portfolio repository was audited at remote `main` commit `e46c74cab6bbef95c6d31e3b11a7c1b575080eb2`, which matched local `HEAD`; the local worktree had unrelated uncommitted edits, and this report makes no claim that those edits were pushed. For repositories without an external code source, the limits are stated per project.

## Portfolio host

### Aedwon portfolio site

**Implemented:** TypeScript, React, Next.js 16, and Tailwind CSS 3. The app targets Node.js 24. Vitest, Testing Library, and jsdom are used for tests. `@vercel/speed-insights` is mounted in the root layout. A Vercel deployment configuration is present. [`package.json`](https://github.com/Aedwon/aedwon/blob/e46c74cab6bbef95c6d31e3b11a7c1b575080eb2/package.json#L5-L48), [root layout](https://github.com/Aedwon/aedwon/blob/e46c74cab6bbef95c6d31e3b11a7c1b575080eb2/app/layout.tsx#L1-L4), [test configuration](https://github.com/Aedwon/aedwon/blob/e46c74cab6bbef95c6d31e3b11a7c1b575080eb2/vitest.config.ts#L1-L15), and [Vercel configuration](https://github.com/Aedwon/aedwon/blob/e46c74cab6bbef95c6d31e3b11a7c1b575080eb2/vercel.json).

**Declared but not mounted:** `@vercel/analytics` and `posthog-js` appear in an `Analytics` component, but no app route imports that component at this snapshot. The root layout mounts Speed Insights directly. Do not describe PostHog or Vercel Web Analytics as active site telemetry based on package presence alone.

`framer-motion` is also listed in the manifest, but no import was found in the application source at this snapshot. Treat it as declared for the portfolio host. It is implemented in Lakambini.

**Portfolio stack:** The site itself is Next.js, React, TypeScript, Tailwind CSS, and Node.js. Vercel is the configured deployment platform. Speed Insights is active. The Genshin wish counter inherits this host stack.

## Project records

### AI Agent Config

**Verified:** Python tooling; YAML catalog/configuration; Markdown templates, rules, and generated outputs. Python is the implementation language. Markdown and YAML are content/configuration formats, not runtime frameworks. Evidence includes the Python verifier and YAML catalog in [`ai-agent-config` at `18b03fa`](https://github.com/Aedwon/ai-agent-config/tree/18b03fa0c4106c277187fb53aa7ecf36cb3b56c2).

**Portfolio stack:** Python, Markdown, YAML. Faithful when presented as languages and file formats, not as a web or application stack.

### Microsoft Aspire contribution

**Verified contribution:** C# changes in the Aspire CLI and its tests. PR 19614 was open at audit time. Aspire itself is a large, multi-language upstream project; its full repository language list does not describe Aedwon’s contribution. [PR files](https://github.com/microsoft/aspire/pull/19614/files) and [source commit](https://github.com/microsoft/aspire/tree/fb62423be43d959fb47d9345f4edb0671d756542).

**Portfolio stack:** “GitHub” names the host, not the technology. Use “C# contribution to Microsoft Aspire” if the stack is shown.

### BetterGov PH

**Local source snapshot:** The upstream repository at the portfolio URL returned 404 through GitHub’s authenticated API on the audit date. The local Aedwon fork is on `feature/acronym-tooltip` at commit `3d233d1d5b34f4acca77fef06616dd047ac7ead0` (31 July 2026, Asia/Manila), one commit ahead of its remote branch. Its tracked worktree was clean. That snapshot implements React, TypeScript, Vite, Tailwind CSS, and Cloudflare Workers. Wrangler config declares static assets and Cloudflare KV namespaces; local source also uses Meilisearch. Local evidence: `/Users/aedwon/Documents/Projects/BetterGov/package.json`, `vite.config.ts`, `wrangler.jsonc`, and `functions/` at the recorded commit. This describes Aedwon’s local fork only. It does not verify the current upstream or deployed site.

**Portfolio stack:** “GitHub” names the host, not the technology. If a stack is needed, label the local fork’s verified technologies as a local source snapshot and keep the upstream/live stack unverified.

### MSL Collegiate Cup Bot

**Likely source match:** The portfolio does not link a repository. `Aedwon/msl-philippines-bot` identifies itself as the official MSL Collegiate Cup bot, and its match reporting, disputes, tickets, and booster tracking match the portfolio description. Treat this repository mapping as strong but inferred. Its audited default-branch commit is `9baad7395ff58d041276bccb5303b378a0b3c113` (15 January 2026).

**Implemented:** Python and `discord.py`. The entry point imports `discord` and starts a `commands.Bot`. Its match module also reads and writes JSON state. The same file declares `gspread` and `google-auth`, and `data/backup_bot.py` imports `gspread`; no import from the active bot entry point was found. Count Google Sheets as an implemented backup helper, not as a verified live bot dependency. [Entry point](https://github.com/Aedwon/msl-philippines-bot/blob/9baad7395ff58d041276bccb5303b378a0b3c113/bot.py#L2-L4), [dependencies](https://github.com/Aedwon/msl-philippines-bot/blob/9baad7395ff58d041276bccb5303b378a0b3c113/requirements.txt#L1-L9), [match persistence code](https://github.com/Aedwon/msl-philippines-bot/blob/9baad7395ff58d041276bccb5303b378a0b3c113/cogs/matches.py#L1-L30), and [backup helper](https://github.com/Aedwon/msl-philippines-bot/blob/9baad7395ff58d041276bccb5303b378a0b3c113/data/backup_bot.py).

**Portfolio stack:** Python and `discord.py` are verified. “Sheets” is an inactive backup helper and should be qualified.

### DockRoute contribution

**Verified contribution:** PR 41 changed only `README.md` and was merged on 24 August 2026. No implementation technology is attributable to that contribution. [PR files](https://github.com/Dockroute/Dockroute/pull/41/files) and [audited upstream snapshot](https://github.com/Dockroute/Dockroute/tree/d4efc22bca4aecd02e09f36f0d13a96578a3ac9f).

**Portfolio stack:** “GitHub” names the host. If listed, describe this as a documentation contribution and do not attach the upstream stack to Aedwon’s work.

### Genshin wish counter

**Verified:** The counter is a TypeScript React client component inside the portfolio’s Next.js application, not a separate Next.js repository. The page reads a checked-in wish-history data file; a Node.js import script fetches and updates that file. It is read-only at runtime. Evidence: [component imports](https://github.com/Aedwon/aedwon/blob/e46c74cab6bbef95c6d31e3b11a7c1b575080eb2/components/design-v3/WishCounter.tsx#L1-L10), [site manifest](https://github.com/Aedwon/aedwon/blob/e46c74cab6bbef95c6d31e3b11a7c1b575080eb2/package.json#L5-L31), and [import script](https://github.com/Aedwon/aedwon/blob/e46c74cab6bbef95c6d31e3b11a7c1b575080eb2/scripts/import-genshin-wishes.mjs#L1-L20).

**Portfolio stack:** Next.js and TypeScript are accurate. React and Node.js also apply, with Node.js limited to the import tool. The deployed counter inherits the portfolio’s runtime.

### Ilocos Sur Festival Esports Bot

**Verified:** Python, `discord.py`, and MySQL through `aiomysql`. The entry point imports `discord` and subclasses `commands.Bot`. [`main.py`](https://github.com/Aedwon/isfe-discord-bot/blob/b85907fd306fc97586373df4870468b2f3e0cf6f/main.py#L1-L2) and [`database/db.py`](https://github.com/Aedwon/isfe-discord-bot/blob/b85907fd306fc97586373df4870468b2f3e0cf6f/database/db.py) support these classifications.

**Portfolio stack:** Python, `discord.py`, and MySQL are verified.

### Kanlungan

**Evidence gap:** The audited repository at `20d71384f70f5c725fe64aa83f89f643376c7c7f` contains only `README.md`. No source code, manifest, or deployment configuration verifies a stack. Do not infer one from README claims.

**Portfolio stack:** Empty is accurate for this audit.

### Kiosk Survey

**Verified:** Flutter and Dart. Hive is used for local storage. The project includes Android and iOS platform scaffolding; it has CSV and file export dependencies, including a browser-specific export file. No Firebase dependency appears in the audited `pubspec.yaml`. See [`pubspec.yaml`](https://github.com/Aedwon/kiosk-survey/blob/2879be23dac01a6e0f8116b6fad5214a13c73431/pubspec.yaml) and [`survey_repository.dart`](https://github.com/Aedwon/kiosk-survey/blob/2879be23dac01a6e0f8116b6fad5214a13c73431/lib/data/survey_repository.dart).

**Portfolio stack:** Flutter, Dart, Hive, and Android are supported. The repository also contains iOS setup. Firebase is not part of the verified stack.

### KQM Team DPS Calculator

**Verified:** TypeScript, React, and Vite. Zustand provides client state; `genshin-db` provides game data. [`package.json`](https://github.com/Aedwon/genshin-impact-team-dps-calculator/blob/917a2b4c662aa45e412b09d0f693bb5d9b2ca0ef/package.json#L1-L27), [Zustand store](https://github.com/Aedwon/genshin-impact-team-dps-calculator/blob/917a2b4c662aa45e412b09d0f693bb5d9b2ca0ef/src/store.ts#L3-L5), and [game data wrapper](https://github.com/Aedwon/genshin-impact-team-dps-calculator/blob/917a2b4c662aa45e412b09d0f693bb5d9b2ca0ef/src/lib/genshinData.ts#L1-L5).

**Portfolio stack:** TypeScript, React, and Vite are accurate. Add Zustand and `genshin-db` when naming major libraries. Next.js is not used.

### Lakambini

**Verified:** Next.js, React, TypeScript, Tailwind CSS, and Framer Motion. The source is public at [`lakambini-redesign` commit `2c06c09`](https://github.com/Aedwon/lakambini-redesign/tree/2c06c0912aa29e86a039775c4c1d4dcf85680c40); the [manifest](https://github.com/Aedwon/lakambini-redesign/blob/2c06c0912aa29e86a039775c4c1d4dcf85680c40/package.json#L5-L27) declares the packages, and [`Reveal.tsx`](https://github.com/Aedwon/lakambini-redesign/blob/2c06c0912aa29e86a039775c4c1d4dcf85680c40/components/ui/Reveal.tsx#L1-L4) imports Framer Motion.

**Portfolio stack:** Accurate, with React omitted from the current list. The manifest uses `latest` for several packages, so this audit does not claim a stable version number.

### Marwie Community Bot

**Verified:** Python, `discord.py`, and SQLAlchemy. The bot entry point imports `discord` and `commands`. The session code selects SQLite through `aiosqlite` or PostgreSQL through `asyncpg`. Alembic is declared in [`pyproject.toml`](https://github.com/Aedwon/marwie-server-bot/blob/c6ad745548597c189ad9fe8bf1f75f451a40c9b0/pyproject.toml#L5-L28); this review did not confirm its app import. [Bot entry point](https://github.com/Aedwon/marwie-server-bot/blob/c6ad745548597c189ad9fe8bf1f75f451a40c9b0/src/marwie_bot/bot.py#L5-L7) and [database session](https://github.com/Aedwon/marwie-server-bot/blob/c6ad745548597c189ad9fe8bf1f75f451a40c9b0/src/marwie_bot/db/session.py).

**Portfolio stack:** Python, `discord.py`, SQLAlchemy, SQLite, and PostgreSQL are verified. Alembic is declared but not import-confirmed. MySQL is not declared in this project.

### MLBB Post-Game Extractor

**Verified:** JavaScript, React, Vite, and Tesseract.js. [`package.json`](https://github.com/Aedwon/mlbb-post-game-extractor/blob/fc3c0ff6c32408c80a3448cc4334a2d9e1d2b487/package.json#L1-L25) and [OCR import](https://github.com/Aedwon/mlbb-post-game-extractor/blob/fc3c0ff6c32408c80a3448cc4334a2d9e1d2b487/src/App.jsx#L1-L9).

**Portfolio stack:** React, Vite, and Tesseract.js are accurate. JavaScript is the implementation language.

### MSL Network Bot

**Implemented:** Python, `discord.py`, and MySQL through `aiomysql`. The entry point imports `discord` and starts a `commands.Bot`. The repository also contains a separate Vercel-style Python serverless API. Its stats handler uses the standard library HTTP handler with `PyMySQL`; it does not use FastAPI. [Bot entry point](https://github.com/Aedwon/Discord-Bot/blob/589f446ed5f316fba935a48ba8dbe5fa9efa7ee3/main.py#L6-L10), [database pool](https://github.com/Aedwon/Discord-Bot/blob/589f446ed5f316fba935a48ba8dbe5fa9efa7ee3/services/database.py#L1-L35), and [stats handler](https://github.com/Aedwon/Discord-Bot/blob/589f446ed5f316fba935a48ba8dbe5fa9efa7ee3/api/stats.py#L1-L24).

**Portfolio stack:** Python, `discord.py`, and MySQL are verified. The live status of the separate API is unknown.

### Norala SB Portal

**Verified:** Next.js, React, TypeScript, Tailwind CSS, and `next-intl` for localization. The locale layout imports `next-intl` helpers. [`package.json`](https://github.com/Aedwon/norala-sb-demo/blob/324ba435fad72b2e86367f00f388d38ea2bb7f0e/package.json#L1-L23) and [locale layout](https://github.com/Aedwon/norala-sb-demo/blob/324ba435fad72b2e86367f00f388d38ea2bb7f0e/app/%5Blocale%5D/layout.tsx#L5-L8).

**Portfolio stack:** Next.js, TypeScript, and Tailwind are accurate. React and `next-intl` are omitted from the current list.

### OpenSRE contribution

**Verified contribution:** Aedwon’s merged PR 5634 adds Python code and tests in OpenSRE’s VictoriaLogs integration. The upstream repository is primarily Python but includes more languages and subsystems; the contribution evidence supports Python only. [PR files](https://github.com/Tracer-Cloud/opensre/pull/5634/files) and [source commit](https://github.com/Tracer-Cloud/opensre/tree/c41ade578558ab2555a4de874b1842d438c78f81).

**Portfolio stack:** “GitHub” names the host, not the technology. Use “Python contribution to OpenSRE” if the stack is shown.

### OPPO Hyper Legend Cup Bot

**Verified:** Python, `discord.py`, and MySQL through `aiomysql`. The entry point imports `discord` and starts a `commands.Bot`. `aiohttp` is also declared, but its app import was not confirmed. [Bot entry point](https://github.com/Aedwon/oppo-hlc-2026-bot/blob/300a6f4ff200a60915a36114ba7f6fa1d3f84eed/main.py#L7-L8), [`db/database.py`](https://github.com/Aedwon/oppo-hlc-2026-bot/blob/300a6f4ff200a60915a36114ba7f6fa1d3f84eed/db/database.py), and [deployment workflow](https://github.com/Aedwon/oppo-hlc-2026-bot/blob/300a6f4ff200a60915a36114ba7f6fa1d3f84eed/.github/workflows/deploy.yml).

**Portfolio stack:** Python, `discord.py`, and MySQL are verified. `aiohttp` is declared but not import-confirmed.

### Pantas

**Implemented:** Flutter and Dart for the app; Riverpod for state management; Drift/SQLite for local data; Firebase Core and Firebase Authentication in app bootstrap and auth paths; Firestore and Firebase Functions in the backend. A TypeScript Firebase Cloud Function processes RevenueCat webhooks. [`pubspec.yaml`](https://github.com/Aedwon/Pantas/blob/159afc7f68490c0e282d6ab0c39cdac5c33ade4e/pubspec.yaml#L11-L58), [Drift database](https://github.com/Aedwon/Pantas/blob/159afc7f68490c0e282d6ab0c39cdac5c33ade4e/lib/core/content/content_database.dart#L1-L18), [Riverpod auth provider](https://github.com/Aedwon/Pantas/blob/159afc7f68490c0e282d6ab0c39cdac5c33ade4e/lib/core/auth/providers.dart#L1-L14), [GoRouter setup](https://github.com/Aedwon/Pantas/blob/159afc7f68490c0e282d6ab0c39cdac5c33ade4e/lib/app/router.dart#L55-L70), [Firebase bootstrap](https://github.com/Aedwon/Pantas/blob/159afc7f68490c0e282d6ab0c39cdac5c33ade4e/lib/app/firebase_bootstrap.dart#L1-L24), [Firebase auth adapter](https://github.com/Aedwon/Pantas/blob/159afc7f68490c0e282d6ab0c39cdac5c33ade4e/lib/core/auth/firebase_auth_gateway.dart#L1-L23), [Functions config](https://github.com/Aedwon/Pantas/blob/159afc7f68490c0e282d6ab0c39cdac5c33ade4e/firebase.json), and [RevenueCat webhook](https://github.com/Aedwon/Pantas/blob/159afc7f68490c0e282d6ab0c39cdac5c33ade4e/functions/src/revenuecatWebhook.ts#L1-L10).

`Dio` is declared in `pubspec.yaml`, but this review did not confirm an app import. Treat it as declared, not implemented.

**Declared but not found in app source:** `purchases_flutter` is in `pubspec.yaml`, but no import from the app’s `lib/` source was found at the audited revision. RevenueCat is implemented as a server-side webhook. Describe the Flutter SDK as declared, not as an active client purchase flow.

**Portfolio stack:** Flutter, Dart, Firebase, Drift, and RevenueCat are supported. Add Riverpod and SQLite for the main architecture. The portfolio list omits TypeScript/Node.js for Firebase Functions. This repository snapshot is remote `main` at `159afc7`, dated 23 October 2026. The local Pantas checkout was 76 commits behind remote `main` during the audit, so it was not used as the source snapshot.

### QR Studio

**Verified:** JavaScript and Vite. `qr-code-styling` is imported by the app. Playwright is used for end-to-end tests, not part of the application runtime. [`package.json`](https://github.com/Aedwon/QR-Code-Maker/blob/fec60969aa3176bca473f763c9bd586480f8c02f/package.json#L1-L21) and [app import](https://github.com/Aedwon/QR-Code-Maker/blob/fec60969aa3176bca473f763c9bd586480f8c02f/src/main.js#L1-L9).

**Portfolio stack:** JavaScript, Vite, and `qr-code-styling` are accurate. Playwright belongs in tooling only.

### Writing projects

**A perfect factory can still make something nobody wants** and **The next model won’t fix your specification** are writing entries with no associated code repository or software runtime in the project inventory. Their stack is not applicable.

### WebP Unli

**Verified:** TypeScript and React in a Next.js application, Tailwind CSS, and `wasm-vips` for image processing in WebAssembly. The browser worker loads the runtime and creates images with it. The manifest lists Playwright and Vitest as test tooling. [`package.json`](https://github.com/Aedwon/webp-unli/blob/fa026355e2a30295c364f20b6d22eb7b3fc83ec9/package.json#L5-L37) and [worker implementation](https://github.com/Aedwon/webp-unli/blob/fa026355e2a30295c364f20b6d22eb7b3fc83ec9/public/worker.js#L9-L15).

**Portfolio stack:** Next.js, TypeScript, and `wasm-vips` are accurate. Add React and Tailwind CSS. The portfolio link uses a `vercel.app` hostname, but this audit did not verify the live deployment or its current host.

## Source snapshots

These are the exact remote default-branch commits inspected on 24 October 2026. Dates are commit committer dates. Contribution commits are listed in project records. BetterGov is a local-only snapshot.

| Project source | Commit | Commit date |
| --- | --- | --- |
| AI Agent Config | [`18b03fa`](https://github.com/Aedwon/ai-agent-config/tree/18b03fa0c4106c277187fb53aa7ecf36cb3b56c2) | 2026-08-25 |
| Aspire upstream | [`0008228`](https://github.com/microsoft/aspire/tree/0008228ece84df0df7459cf037d44a687959d402) | 2026-10-23 |
| DockRoute upstream | [`d4efc22`](https://github.com/Dockroute/Dockroute/tree/d4efc22bca4aecd02e09f36f0d13a96578a3ac9f) | 2026-10-13 |
| MSL Cup likely source | [`9baad73`](https://github.com/Aedwon/msl-philippines-bot/tree/9baad7395ff58d041276bccb5303b378a0b3c113) | 2026-01-15 |
| Genshin counter and portfolio host | [`e46c74c`](https://github.com/Aedwon/aedwon/tree/e46c74cab6bbef95c6d31e3b11a7c1b575080eb2) | 2026-10-20 |
| Ilocos Bot | [`b85907f`](https://github.com/Aedwon/isfe-discord-bot/tree/b85907fd306fc97586373df4870468b2f3e0cf6f) | 2026-01-31 |
| Kanlungan | [`20d7138`](https://github.com/Aedwon/kanlungan/tree/20d71384f70f5c725fe64aa83f89f643376c7c7f) | 2026-10-15 |
| Kiosk Survey | [`2879be2`](https://github.com/Aedwon/kiosk-survey/tree/2879be23dac01a6e0f8116b6fad5214a13c73431) | 2026-03-20 |
| KQM Calculator | [`917a2b4`](https://github.com/Aedwon/genshin-impact-team-dps-calculator/tree/917a2b4c662aa45e412b09d0f693bb5d9b2ca0ef) | 2026-08-22 |
| Lakambini | [`2c06c09`](https://github.com/Aedwon/lakambini-redesign/tree/2c06c0912aa29e86a039775c4c1d4dcf85680c40) | 2026-10-19 |
| Marwie Bot | [`c6ad745`](https://github.com/Aedwon/marwie-server-bot/tree/c6ad745548597c189ad9fe8bf1f75f451a40c9b0) | 2026-10-23 |
| MLBB Extractor | [`fc3c0ff`](https://github.com/Aedwon/mlbb-post-game-extractor/tree/fc3c0ff6c32408c80a3448cc4334a2d9e1d2b487) | 2026-05-02 |
| MSL Network Bot | [`589f446`](https://github.com/Aedwon/Discord-Bot/tree/589f446ed5f316fba935a48ba8dbe5fa9efa7ee3) | 2026-05-01 |
| Norala Portal | [`324ba43`](https://github.com/Aedwon/norala-sb-demo/tree/324ba435fad72b2e86367f00f388d38ea2bb7f0e) | 2026-07-21 |
| OpenSRE upstream | [`6479872`](https://github.com/Tracer-Cloud/opensre/tree/6479872be3142766071be5195a65d54dbc445b46) | 2026-10-23 |
| OPPO Bot | [`300a6f4`](https://github.com/Aedwon/oppo-hlc-2026-bot/tree/300a6f4ff200a60915a36114ba7f6fa1d3f84eed) | 2026-03-07 |
| Pantas | [`159afc7`](https://github.com/Aedwon/Pantas/tree/159afc7f68490c0e282d6ab0c39cdac5c33ade4e) | 2026-10-23 |
| QR Studio | [`fec6096`](https://github.com/Aedwon/QR-Code-Maker/tree/fec60969aa3176bca473f763c9bd586480f8c02f) | 2026-10-18 |
| WebP Unli | [`fa02635`](https://github.com/Aedwon/webp-unli/tree/fa026355e2a30295c364f20b6d22eb7b3fc83ec9) | 2026-10-18 |
| BetterGov local fork | `3d233d1` | 2026-07-31, local only |

## Open evidence gaps

- BetterGov has no verified upstream code snapshot available through GitHub on the audit date. The local fork describes Aedwon’s branch only. Its relation to the deployed site remains unknown.
- Kanlungan’s repository has no source beyond its README.
- The MSL Collegiate Cup repository match is inferred from a close title and feature match because the project record has no repository link. Its Google Sheets dependency is confined to a backup helper.
- The live deployment configuration for projects linked only by their public URL cannot be proven from repository code alone.

</details>
