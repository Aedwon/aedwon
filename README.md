# Aerol Balayon

[aedwon.com](https://aedwon.com) · [LinkedIn](https://linkedin.com/in/aedwon) · [Discord](https://discord.com/users/aedwon) · [Email](mailto:aerol.balayon@gmail.com)

I build apps, bots and web tools, mostly for events, communities and exam prep. This repository is the source of my portfolio. The full list of work is on [aedwon.com](https://aedwon.com).

## Selected work

### [Pantas](https://pantas.app)

Pre-launch Android reviewer for Philippine civil service and university entrance preparation. Study state is stored locally with Drift and SQLCipher, with FSRS-6 handling review scheduling.

`Flutter` `Drift` `SQLCipher` `FSRS-6`

---

<p align="center">
  <img src="./public/projects/msl-network-discord.webp" width="90%" alt="MSL Network Discord interface" />
</p>

### [MSL Network Bot](https://github.com/Aedwon/Discord-Bot)

Single-server Discord infrastructure for MLBB verification, community activity, events, quests, moderation, and reporting.

`Python` `Discord.py` `MySQL` `aiohttp`

---

<table>
  <tr>
    <td width="50%" valign="top">
      <a href="https://github.com/Aedwon/QR-Code-Maker">
        <img src="./public/projects/qr-studio.webp" width="100%" alt="QR Studio editor" />
      </a>
    </td>
    <td width="50%" valign="top">
      <a href="https://github.com/Aedwon/kiosk-survey">
        <img src="./public/projects/kiosk-survey.webp" width="100%" alt="Kiosk Survey Android TV interface" />
      </a>
    </td>
  </tr>
  <tr>
    <td valign="top">
      <b><a href="https://github.com/Aedwon/QR-Code-Maker">QR Studio</a></b><br /><br />
      In-browser QR builder with gradient styling and SVG export. Encoding and rendering stay client-side.<br /><br />
      <code>TypeScript</code> <code>Canvas</code> <code>Vite</code> <code>SVG</code>
    </td>
    <td valign="top">
      <b><a href="https://github.com/Aedwon/kiosk-survey">Kiosk Survey</a></b><br /><br />
      Offline Android TV survey system. It ran for eight continuous hours at a live event and synced queued submissions after connectivity returned.<br /><br />
      <code>Flutter</code> <code>Dart</code> <code>SQLite</code> <code>Android TV</code>
    </td>
  </tr>
</table>

## Open source

I contribute to [Microsoft Aspire](https://github.com/microsoft/aspire), [OpenSRE](https://github.com/Tracer-Cloud/opensre), [DockRoute](https://www.dockroute.dev/) and [BetterGov PH](https://bettergov.ph).

## This repository

The site is a room. Projects hang on a **Wall**, the **Index** lists them, each project has its own page, and the About section is a shelf of books. The phone layout is designed separately at 390 by 844 instead of being a squeezed desktop page.

`Next.js 16` `React 19` `TypeScript` `Vitest`

- **Styling.** The current design uses role-based CSS tokens for dark and light modes (`lib/design-v3/tokens.css`). The older `/projects` and `/blogs` routes still use Tailwind CSS.
- **Content.** Every project is one JSON file in `content/projects`, and the About books are in `content/site`. No project copy lives in TypeScript.
- **Local studio.** Under `npm run dev`, press Edit on any project page to change text, pictures and links in the browser. It saves to the JSON files and can commit and push them. It only runs on localhost. See [`docs/studio.md`](docs/studio.md).
- **Animated diagrams.** Some bot and tooling projects carry a small SVG flow diagram, driven by a spec in `lib/design-v3/data/flows.ts`. It plays on hover on the wall and loops on the project page, and it stays still when reduced motion is requested.

<details>
<summary><b>Agent-facing surface</b></summary>

The same content has a machine-readable form. [`/llms.txt`](https://aedwon.com/llms.txt) describes the portfolio and its canonical sources, and pages return Markdown when requested with `Accept: text/markdown`. [`/sitemap.xml`](https://aedwon.com/sitemap.xml) and [`/robots.txt`](https://aedwon.com/robots.txt) cover the public index and crawler guidance.

CI runs the tests, lint and the production build. It then starts the built app and checks status codes, content negotiation, metadata, 404 behavior and the machine-readable endpoints with real HTTP requests.

</details>

## Run it locally

Node 24 is required.

```bash
git clone https://github.com/Aedwon/aedwon.git
cd aedwon
npm install
npm run dev        # http://127.0.0.1:3000, local studio on
npm test
npm run lint
npm run build
```

`npm run dev:lan` serves the site on your network for testing on a real phone. The studio is off in that mode.

## Where things are

| Path | What it holds |
|---|---|
| `app/(v3)` | The current routes: wall, index, work, writing, about, contact |
| `app/(v2)` | The older `/projects`, `/blogs` and `/privacy` routes |
| `components/design-v3` | The wall, index, project pages, About books and phone layout |
| `content` | Project and About copy as JSON |
| `lib/design-v3` | Tokens, theme and the data loaders and specs |
| `lib/studio` | The local studio's server side |
| `v3-design` | The approved design handoff: spec, reference prototype, recordings |
| `docs` | Studio guide, blog and tone rules, the living copy file |

## Writing rules

Anything written for the site follows [`AGENTS.md`](AGENTS.md). Blog posts also follow [`docs/blog-writing.md`](docs/blog-writing.md).
