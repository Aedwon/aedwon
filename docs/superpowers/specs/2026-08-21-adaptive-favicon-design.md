# Adaptive Terminal Emerald Favicon Design Specification

## Overview
Design and asset specification for the website favicon, Apple touch icon, web manifest, and page title metadata for `aedwon.com`.

The favicon system establishes an adaptive vector icon featuring a monospace code tag (`</>`) with a Terminal Emerald accent slash, seamlessly switching between dark and light operating system color schemes without page reload.

---

## 1. Visual & Vector Geometry

### Motif & Anatomy
- **Glyph Type:** Monospace terminal code tag (`</>`) aligned with the navbar mark (`</aedwon>`).
- **Base Geometry:**
  - ViewBox: `0 0 32 32`
  - Container: 32×32 rounded squircle with `rx="7"`
  - Stroke: `stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"`
  - Left Chevron (`<`): `M10 11L5 16L10 21`
  - Right Chevron (`>`): `M22 11L27 16L22 21`
  - Forward Slash (`/`): `M18 9L14 23`

### Adaptive Theme Styling (In-SVG CSS)
Embedded `@media (prefers-color-scheme)` within the SVG:

- **Dark Mode (Default):**
  - Background container fill: `#18181B` (Zinc-900)
  - Border stroke: `#27272A` (Zinc-800)
  - Chevron stroke: `#F4F4F5` (Zinc-100)
  - Slash accent stroke: `#10B981` (Emerald-500)

- **Light Mode:**
  - Background container fill: `#FFFFFF` (Pure White)
  - Border stroke: `#E4E4E7` (Zinc-200)
  - Chevron stroke: `#09090B` (Zinc-950)
  - Slash accent stroke: `#059669` (Emerald-600)

---

## 2. File Scaffolding & Technical Architecture

### Assets & Locations
1. **`app/icon.svg`** (Vector Favicon):
   - Native SVG loaded automatically by Next.js 15 App Router metadata conventions (`<link rel="icon" type="image/svg+xml" sizes="any">`).
   - Contains adaptive `@media (prefers-color-scheme)` style block.

2. **`app/apple-icon.png`** (Apple Touch Icon):
   - High-resolution 180×180px PNG generated from the vector geometry with dark base `#18181B` and Terminal Emerald slash for crisp iOS bookmarking.

3. **`public/favicon.ico` & `app/favicon.ico`**:
   - Multi-resolution ICO (16×16, 32×32, 48×48) fallback for legacy browsers, RSS readers, and automated web crawlers.

4. **`app/manifest.ts`** (Web App Manifest):
   - Generates `/manifest.webmanifest` defining:
     - `name`: "Aedwon"
     - `short_name`: "Aedwon"
     - `theme_color`: "#18181B"
     - `background_color`: "#18181B"
     - `display`: "standalone"
     - `icons`: standard SVG and PNG icon definitions.

5. **`app/layout.tsx`** (Metadata Configuration):
   - Set page title to `"Aedwon"` (per user requirement for `aedwon.com`).
   - Clean metadata icon and manifest associations.

---

## 3. Verification Plan

### Automated Checks
- Run `npm run build` or `next build` to verify App Router icon discovery, manifest generation, and metadata compilation without warnings or errors.
- Run test suite with `npm run test` (or `vitest run`).

### Visual & Browser Verification
- Open in browser via local dev server (`npm run dev`).
- Test tab title display (`Aedwon`).
- Test favicon rendering in browser tab at 100% scale.
- Toggle OS / browser light and dark appearance in DevTools (`Emulate CSS media feature prefers-color-scheme: light / dark`) to verify live adaptive color changes.
