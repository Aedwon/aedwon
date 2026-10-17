# Local studio: edit projects on the page

Project content lives in `content/projects/<id>.json`, one file per project, in the order of `content/projects/index.ts`. The studio edits those files from the browser. It exists only on a localhost dev server.

## Use it

1. Run `npm run dev` and open any project page (for example `http://localhost:3000/work/pantas`). That script listens on `127.0.0.1` only and turns the studio on. `npm run dev:lan` starts the site on your network (for testing on a real phone) with the studio off.
2. Press **Edit** in the bar at the bottom. Dashed outlines mark every editable line.
3. Click text, type, press Enter (or click away). Escape puts the old text back. Each change saves to the JSON file at once and the page updates in place.
4. Drop an image onto a picture slot (hero, a section figure, or the two tiles on a note), or click the slot to choose one. Add alt text in the slot's bar. Once a picture is in, a caption line appears under it: click it to add or edit, and clear it to remove.
5. The links under the description are editable too: click a label to rename it, **↗** to change its address, **×** to remove it, **+ link** to add one. Only the first two show on the page; extras appear dimmed while editing. Addresses must start with `https://`, `http://`, `mailto:`, `/` or `#`.
6. **Details** opens a drawer: type, date, repo, stack names, facts and links. Its **JSON** tab holds the whole file for anything else.
7. Sections can be moved, removed, added, or given a figure from the controls on each section. Paragraphs have a **×** on hover and a **+ paragraph** button.

To publish, review with `git diff`, commit the changed files and push. Vercel rebuilds.

## What it saves

- Text and lists go to `content/projects/<id>.json`, formatted the same way every time.
- Images are re-encoded to WebP, at most 1800px wide, and saved to `public/projects/<id>/`. The file name carries a short hash, so a replaced image never serves from a stale cache.
- The JSON stores `hero` (the hero picture), `shots` (the two note tiles) and `sections[n].img` (a section figure) as `{ src, alt, caption?, w, h }`. Without one, the page keeps its drawn placeholder.

## Safety

- The site must be started by `npm run dev`, which sets `STUDIO_LOCAL=1` and binds `127.0.0.1`, so nothing else on your network can reach it. A plain `next dev` listens on the network, so the studio refuses to run there. This is the real protection: the Host header can be forged by a peer on your network, so it is not trusted on its own.
- On top of that, the API in `app/api/studio` answers only when `NODE_ENV` is not production, the request is for `localhost`, `127.0.0.1` or `[::1]`, the origin (if any) is local, and the `x-studio` header is present. These checks stop other websites open in your browser.
- It can write only `content/projects/<known id>.json` and `public/projects/<known id>/`. Paths and ids are checked, prototype keys are refused, and every write is validated before it is saved.
- Uploads are type-checked by their bytes (PNG, JPEG, WebP, GIF, AVIF), capped at 12 MB, and re-encoded.
- The studio interface is loaded only in development, so it is not in the production bundle. Production builds still contain the two API routes, which return 404.

## Notes for agents

- Do not hand-edit project copy in TypeScript. Edit the JSON (or let the user use the studio). `lib/design-v3/data/projects.ts` holds only types and loads the files.
- `Room.tsx` and `Mobile.tsx` must export only their component. That lets Next apply a content change in place; a non-component export makes every save reload the whole page.
- Tests: `npx vitest run lib/studio` covers the path rules, validation, the guard, upload checks and that every content file is valid.
