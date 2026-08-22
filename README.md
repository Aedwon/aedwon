# Aerol Balayon

[aedwon.com](https://aedwon.com) · [LinkedIn](https://linkedin.com/in/aedwon) · [Discord](https://discord.com/users/aedwon) · [Email](mailto:aerol.balayon@gmail.com)

## Selected work

### [Pantas](https://pantas.app)

Pre-launch Android reviewer for Philippine civil service and university entrance preparation. Study state is stored locally with Drift and SQLCipher, with FSRS-6 handling review scheduling.

`Flutter` `Drift` `SQLCipher` `FSRS-6`

[Pantas →](https://pantas.app)

---

<p align="center">
  <img src="./public/projects/msl-network-discord.webp" width="90%" alt="MSL Network Discord interface" />
</p>

### [MSL Network Bot](https://github.com/Aedwon/Discord-Bot)

Single-server Discord infrastructure for MLBB verification, community activity, events, quests, moderation, and reporting.

`Python` `Discord.py` `MySQL` `aiohttp`

[Repository →](https://github.com/Aedwon/Discord-Bot)

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
      <code>TypeScript</code> <code>Canvas</code> <code>Vite</code> <code>SVG</code><br /><br />
      <a href="https://github.com/Aedwon/QR-Code-Maker">Repository →</a>
    </td>
    <td valign="top">
      <b><a href="https://github.com/Aedwon/kiosk-survey">Kiosk Survey</a></b><br /><br />
      Offline Android TV survey system. It ran for eight continuous hours at a live event and synced queued submissions after connectivity returned.<br /><br />
      <code>Flutter</code> <code>Dart</code> <code>SQLite</code> <code>Android TV</code><br /><br />
      <a href="https://github.com/Aedwon/kiosk-survey">Repository →</a>
    </td>
  </tr>
</table>

## Open source

**[BetterGov PH](https://bettergov.ph)** works on Philippine government web services and public data access. I contribute to the project.

## This repository

This is the source for [aedwon.com](https://aedwon.com), built with Next.js 16, React 19, TypeScript, Tailwind CSS, and Framer Motion. Project facts live in a canonical registry that feeds the standard project pages, featured work, the Discord presentation, and the site's machine-readable responses.

The interface can switch between a default presentation, a neobrutalist one, and a Discord-style client. Default mode supports system, light, and dark color modes. Light and dark changes run through a custom Canvas star-vortex animation that flips the actual theme at the midpoint and skips the effect when reduced motion is requested. Theme-dependent logos are prewarmed only for the likely target presentation, with idle prewarming skipped on data-saver and slow connections.

Discord mode replaces the normal shell without replacing the routing model. The current URL is mapped into channels and threads, so deep links and browser navigation still use the same `/projects` and `/blogs` routes. The standard navbar measures its active indicator from the rendered tabs with `ResizeObserver`, and page motion follows that same route order.

`Next.js 16` `React 19` `TypeScript` `Tailwind CSS` `Framer Motion` `Vitest`

<details>
<summary><b>Agent-facing surface</b></summary>

The same content model also has a machine-readable surface. [`/llms.txt`](https://aedwon.com/llms.txt) describes the portfolio and its canonical sources, while normal pages can return Markdown when requested with `Accept: text/markdown`. [`/sitemap.xml`](https://aedwon.com/sitemap.xml) and [`/robots.txt`](https://aedwon.com/robots.txt) expose the public index and crawler guidance.

CI runs tests, lint, and the production build, then starts the built app and checks status codes, content negotiation, metadata, 404 behavior, and the public machine-readable endpoints with real HTTP requests.

</details>

<details>
<summary><b>Local development</b></summary>

```bash
git clone https://github.com/Aedwon/aedwon.git
cd aedwon
npm install
npm run dev
npm test
npm run build
```

</details>
