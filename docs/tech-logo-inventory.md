# Technology logo inventory

This read-only report maps the audited stack and tooling to existing marks and the 19 staged SVG resources. Resource provenance is linked in the tables; no page or registry integration is included.

| Coverage | Technologies | Current evidence |
| --- | --- | --- |
| Existing v3 inline `LOGO` marks | Dart, Discord, Firebase, Flutter, Framer Motion, Hive, JavaScript, Markdown, MySQL, Next.js, PostgreSQL, Python, React, RevenueCat, SQLite, Tailwind, Tesseract.js, TypeScript, Vite, `wasm-vips`, YAML, Android, GitHub, Sheets | 24 relevant brand keys of 31 total. Drift is excluded because its path duplicates SQLite and is not verified Drift branding. Other keys are not used by this audit. These are path definitions rendered inside SVG elements, not standalone files. |
| Existing label aliases or platform marks | Tailwind CSS → Tailwind; Google Sheets / `gspread` → Sheets; `discord.py` → Discord; `purchases_flutter` → RevenueCat; `@vercel/analytics` / `@vercel/speed-insights` → Vercel | v3 uses exact `LOGO[stackLabel]` keys. These marks identify brands/platforms, not the client libraries. |
| Existing legacy platform alias | iOS → Apple | Available only through the older `TechIcons.tsx` resolver; v3 has no iOS key. |
| Existing separate technology SVGs | Vercel; WebAssembly | `public/tech-icons/vercel.svg` and `webassembly.svg`. Pterodactyl is also present but outside this stack audit. Vercel is used by a CSS mask; WebAssembly is related to `wasm-vips`. |
| Legacy inline-only mark or alias | Riverpod; `asyncpg` → Asyncio; `aiomysql` / PyMySQL → MySQL | `TechIcons.tsx` has a Riverpod mark, and its substring fallback maps `asyncpg` to Asyncio and MySQL drivers to MySQL. These are not v3 `LOGO` entries; the driver mappings are proxies, not dedicated marks. |
| Added Simple Icons assets | See the 13 rows below | Source SVGs come from Simple Icons 16.35.0, pinned at `ed9a5192b24ad2f169bf1009931da0df27d5a49a`. The source and license data are in [the catalog manifest](tech-logo-catalog-sources.json). |
| Added first-party assets | See the 6 rows below | Exact upstream source URLs and license notes are in [the first-party manifest](tech-logo-official-sources.json). |
| No dedicated official SVG found in the bounded check | See the 21 rows below | Links identify the checked upstream project repositories. This means no dedicated SVG was found there, not that none exists anywhere. |

## Added SVG resources

| Technology | Resource file | Pinned source |
| --- | --- | --- |
| Node.js | [`nodejs.svg`](../public/tech-icons/nodejs.svg) | [Simple Icons](https://raw.githubusercontent.com/simple-icons/simple-icons/ed9a5192b24ad2f169bf1009931da0df27d5a49a/icons/nodedotjs.svg) |
| Cloudflare Workers | [`cloudflareworkers.svg`](../public/tech-icons/cloudflareworkers.svg) | [Simple Icons](https://raw.githubusercontent.com/simple-icons/simple-icons/ed9a5192b24ad2f169bf1009931da0df27d5a49a/icons/cloudflareworkers.svg) |
| Meilisearch | [`meilisearch.svg`](../public/tech-icons/meilisearch.svg) | [Simple Icons](https://raw.githubusercontent.com/simple-icons/simple-icons/ed9a5192b24ad2f169bf1009931da0df27d5a49a/icons/meilisearch.svg) |
| GitHub Actions | [`githubactions.svg`](../public/tech-icons/githubactions.svg) | [Simple Icons](https://raw.githubusercontent.com/simple-icons/simple-icons/ed9a5192b24ad2f169bf1009931da0df27d5a49a/icons/githubactions.svg) |
| Vitest | [`vitest.svg`](../public/tech-icons/vitest.svg) | [Simple Icons](https://raw.githubusercontent.com/simple-icons/simple-icons/ed9a5192b24ad2f169bf1009931da0df27d5a49a/icons/vitest.svg) |
| Testing Library | [`testinglibrary.svg`](../public/tech-icons/testinglibrary.svg) | [Simple Icons](https://raw.githubusercontent.com/simple-icons/simple-icons/ed9a5192b24ad2f169bf1009931da0df27d5a49a/icons/testinglibrary.svg) |
| pytest | [`pytest.svg`](../public/tech-icons/pytest.svg) | [Simple Icons](https://raw.githubusercontent.com/simple-icons/simple-icons/ed9a5192b24ad2f169bf1009931da0df27d5a49a/icons/pytest.svg) |
| Ruff | [`ruff.svg`](../public/tech-icons/ruff.svg) | [Simple Icons](https://raw.githubusercontent.com/simple-icons/simple-icons/ed9a5192b24ad2f169bf1009931da0df27d5a49a/icons/ruff.svg) |
| ESLint | [`eslint.svg`](../public/tech-icons/eslint.svg) | [Simple Icons](https://raw.githubusercontent.com/simple-icons/simple-icons/ed9a5192b24ad2f169bf1009931da0df27d5a49a/icons/eslint.svg) |
| SQLAlchemy | [`sqlalchemy.svg`](../public/tech-icons/sqlalchemy.svg) | [Simple Icons](https://raw.githubusercontent.com/simple-icons/simple-icons/ed9a5192b24ad2f169bf1009931da0df27d5a49a/icons/sqlalchemy.svg) |
| aiohttp | [`aiohttp.svg`](../public/tech-icons/aiohttp.svg) | [Simple Icons](https://raw.githubusercontent.com/simple-icons/simple-icons/ed9a5192b24ad2f169bf1009931da0df27d5a49a/icons/aiohttp.svg) |
| PostHog | [`posthog.svg`](../public/tech-icons/posthog.svg) | [Simple Icons](https://raw.githubusercontent.com/simple-icons/simple-icons/ed9a5192b24ad2f169bf1009931da0df27d5a49a/icons/posthog.svg) |
| Google Sheets | [`googlesheets.svg`](../public/tech-icons/googlesheets.svg) | [Simple Icons](https://raw.githubusercontent.com/simple-icons/simple-icons/ed9a5192b24ad2f169bf1009931da0df27d5a49a/icons/googlesheets.svg) |
| C# | [`csharp.svg`](../public/tech-icons/csharp.svg) | [dotnet/brand](https://github.com/dotnet/brand/blob/91845f6ddf2123b3bb1bfd1b6a386d9ce02b43aa/logo/language-icons/csharp-72.svg) |
| Playwright | [`playwright.svg`](../public/tech-icons/playwright.svg) | [Microsoft Playwright](https://github.com/microsoft/playwright/blob/8c1b148f3d73120aa90f10119920358062fda177/packages/web/src/assets/playwright-logo.svg) |
| Zustand | [`zustand.svg`](../public/tech-icons/zustand.svg) | [pmndrs/zustand](https://github.com/pmndrs/zustand/blob/382d29c485e67018c06e75ec7235130d0968522c/examples/starter/src/assets/zustand-mascot.svg) |
| Riverpod | [`riverpod.svg`](../public/tech-icons/riverpod.svg) | [rrousselGit/riverpod](https://github.com/rrousselGit/riverpod/blob/abc89e5219bc26532db897b79b3878f33c7fb55d/website/static/img/logo.svg) |
| next-intl | [`next-intl.svg`](../public/tech-icons/next-intl.svg) | [amannn/next-intl](https://github.com/amannn/next-intl/blob/b9fc98a814957b9c97894c7b57151215ac39afa6/media/logo.svg) |
| jsdom | [`jsdom.svg`](../public/tech-icons/jsdom.svg) | [jsdom/jsdom](https://github.com/jsdom/jsdom/blob/a394809bf24c9a84dbe2ab7e755c7d250135ec6b/logo.svg) |

## No dedicated official SVG found

| Technology | Checked source |
| --- | --- |
| Dio | [cfug/dio](https://github.com/cfug/dio/tree/f1bef462289b40992d625d4eb2a2f42321217573) |
| Alembic | [sqlalchemy/alembic](https://github.com/sqlalchemy/alembic/tree/c0fa30ce53cdd2ee6d92113333cc78b8e54da8d8) |
| aiomysql | [aio-libs/aiomysql](https://github.com/aio-libs/aiomysql/tree/1aa9cfcbad60f14f5a8bdccaa660f10f69123015) |
| PyMySQL | [PyMySQL/PyMySQL](https://github.com/PyMySQL/PyMySQL/tree/1aff0a859d73f5e63afe630c10e48604fb393fff) |
| aiosqlite | [omnilib/aiosqlite](https://github.com/omnilib/aiosqlite/tree/9b127cecc7de843bf4f343b6da63b641866533fb) |
| asyncpg | [MagicStack/asyncpg](https://github.com/MagicStack/asyncpg/tree/13b01910da3fe01b8241c31cc86eccb1301a2d39) |
| gspread | [burnash/gspread](https://github.com/burnash/gspread/tree/7ca71eaa4658320b89f82f49620dac6891986cdd) |
| mocktail | [felangel/mocktail](https://github.com/felangel/mocktail/tree/d6a96e15b9203d33af61083e02e8c40ac07192d6) |
| freezed | [rrousselGit/freezed](https://github.com/rrousselGit/freezed/tree/b96b69b2d2be3c1713de098d31b90305f06785af) |
| mypy | [python/mypy](https://github.com/python/mypy/tree/5b0b7f9516e2cb359cd45c2c8b3c810b0c860d18) |
| `discord.py` | [Rapptz/discord.py](https://github.com/Rapptz/discord.py/tree/65232c38702be5844cf2ce865a4777eb1928b5d0) |
| `qr-code-styling` | [kozakdenys/qr-code-styling](https://github.com/kozakdenys/qr-code-styling/tree/43d41710221204858ccbd5b5065ec41d23b50544) |
| `genshin-db` | [theBowja/genshin-db](https://github.com/theBowja/genshin-db/tree/49a6544a6c6ae36089cb42fa591fc46f01de8bcf) |
| build_runner | [dart-lang/build](https://github.com/dart-lang/build/tree/62ad14217b5667de34c8b6745eb7ed6cd7dc2a30) |
| json_serializable | [google/json_serializable.dart](https://github.com/google/json_serializable.dart/tree/c2c5c92f8f1b42e019e2f93a39399a8f9fa3dfba) |
| GoRouter | [flutter/packages](https://github.com/flutter/packages/tree/23a05b6ad5d55bc0df5b9340623570b69064edf1) |
| flutter_test | [flutter/flutter](https://github.com/flutter/flutter/tree/66b3ad90177ccbd2963836a5556076b370622fe4) |
| integration_test | [flutter/flutter](https://github.com/flutter/flutter/tree/66b3ad90177ccbd2963836a5556076b370622fe4) |
| Drift | [simolus3/drift](https://github.com/simolus3/drift/tree/85429ca2617eb923efa39dd9c947a592be6c70b2) and [official documentation](https://drift.simonbinder.eu/) |
| drift_dev | [simolus3/drift](https://github.com/simolus3/drift/tree/85429ca2617eb923efa39dd9c947a592be6c70b2) |
| pytest-asyncio | [pytest-dev/pytest-asyncio](https://github.com/pytest-dev/pytest-asyncio/tree/983007120dcc53b14f8f7e9df492cbd1d20a242c) |

## Rendering and scope notes

- The existing Drift mark duplicates SQLite geometry. It is a database proxy, not a verified Drift logo. The first-party Drift repository and documentation yielded no dedicated Drift SVG. The documentation uses text branding; its inline SVG badge belongs to Jaspr. Use SQLite only with an explicit SQLite or database label.

- `simple-icons` 16.28.0 is already installed and exports 3,453 icons, but no app source imports it. The 13 staged catalog files come from Simple Icons 16.35.0; the six other files use first-party assets. The resource manifests record source revisions and licenses. No dependency upgrade was made.
- Alias proxies are not dedicated marks. `discord.py` may use Discord only as a platform mark. `gspread` may use Google Sheets only as a service mark. Older `TechIcons.tsx` incorrectly maps `asyncpg` to Asyncio and MySQL drivers to MySQL.
- `purchases_flutter` uses RevenueCat’s parent mark. Vercel Analytics and Speed Insights use Vercel’s mark, while `posthog-js` uses PostHog’s. JSON and CSV are data formats, and KV is a Cloudflare service binding, not a separate brand.
- v3 renders stack icons from `LOGO[stackLabel]` in [`ProjectSpread.tsx`](../components/design-v3/ProjectSpread.tsx), [`Mobile.tsx`](../components/design-v3/Mobile.tsx), and [`WallIndex2.tsx`](../components/design-v3/WallIndex2.tsx). Unmatched labels remain text. `TechIcons.tsx` is separate legacy UI with aliases and a generic fallback.
- The v3 `LOGO` shape supports one path and one fill color. The resource SVGs are not registered or visible in the app yet. Multi-color marks would need renderer support or a simplified mark.
- [`scripts/logos.mjs`](../scripts/logos.mjs) and Studio tests cover organization logos in `public/logos`, not these technology icons. No test currently checks v3 technology-logo coverage.

## Local theme variants

These 10 local derivatives adjust colors against the portfolio backgrounds. They are not official brand revisions. Original resources remain unchanged. The [variant manifest](tech-logo-theme-variants.json) records colors and measured contrast. No page or registry integration is included.

| Technology | Theme | Adjusted color | Contrast | Resource |
| --- | --- | --- | --- | --- |
| Node.js | Light | `#5A974A` | 3.12:1 | [`nodejs.light.svg`](../public/tech-icons/nodejs.light.svg) |
| Cloudflare Workers | Light | `#D26E1C` | 3.10:1 | [`cloudflareworkers.light.svg`](../public/tech-icons/cloudflareworkers.light.svg) |
| Meilisearch | Light | `#E55298` | 3.10:1 | [`meilisearch.light.svg`](../public/tech-icons/meilisearch.light.svg) |
| Vitest | Light | `#009E48` | 3.10:1 | [`vitest.light.svg`](../public/tech-icons/vitest.light.svg) |
| pytest | Light | `#0992CB` | 3.10:1 | [`pytest.light.svg`](../public/tech-icons/pytest.light.svg) |
| Ruff | Light | `#7B9139` | 3.12:1 | [`ruff.light.svg`](../public/tech-icons/ruff.light.svg) |
| ESLint | Dark | `#5F49CA` | 3.10:1 | [`eslint.dark.svg`](../public/tech-icons/eslint.dark.svg) |
| PostHog | Dark | `#606060` | 3.15:1 | [`posthog.dark.svg`](../public/tech-icons/posthog.dark.svg) |
| Google Sheets | Light | `#309C4D` | 3.10:1 | [`googlesheets.light.svg`](../public/tech-icons/googlesheets.light.svg) |
| next-intl wordmark | Dark | `#EDEDED` | 16.90:1 | [`next-intl.dark.svg`](../public/tech-icons/next-intl.dark.svg) |

Light contrast uses `#F2F1ED`. Dark contrast uses `#0A0A0C`. Catalog variants use the smallest mixture with black or white that reaches 3.1:1 after hex rounding. The next-intl variant changes only the wordmark fill and preserves its blue globe.
