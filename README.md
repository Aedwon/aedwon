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

Source for [aedwon.com](https://aedwon.com). The portfolio uses a chameleon presentation system with default, neobrutalist, and full Discord-style modes. The Discord shell maps the site's real routes into channels and threads while reading the same canonical project records as the standard pages.

Light and dark changes in the default presentation use a custom Canvas star-vortex transition. Theme-dependent logo assets are prewarmed on demand, and the navbar indicator and page motion follow the same route ordering without maintaining a second navigation state.

The application is built with Next.js 16 and React 19, with Tailwind CSS and Framer Motion for presentation and motion.

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
