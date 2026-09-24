# Genshin wish counter design

## Goal

Add a read-only Genshin Impact wish statistics project to the portfolio. Visitors reach it through the normal Projects directory and see Aerol's own wish statistics instead of a case-study article.

## Scope

The project route is `/projects/genshin-wish-counter`. It stays inside the existing portfolio shell and design system. The page contains a compact banner selector, current pity, guarantee state, four summary metrics, 5-star history, and a simple pity-history chart.

There is no public importer, account system, database, sync UI, or visitor-owned data. A future refresh replaces the static normalized wish history used by the page.

## Data

Wish records are static repository data. The public site never stores a HoYoVerse authkey or captured wish-history URL. Statistics are derived from normalized records at build time.

If no real wish history has been imported yet, the page renders a clean unavailable state instead of fabricated statistics.

## Visual system

Use the portfolio's existing CSS variables, typography, spacing, card radii, borders, focus treatment, light/dark support, neobrutalist support where practical, and existing shell. The page should not imitate HoYoVerse or Paimon.moe UI.

Use only existing open-source icon dependencies and CSS/SVG primitives. Do not add Genshin character art, promotional art, logos, or other franchise assets to the repository for this page.

## Integration

A dedicated static App Router route takes precedence over the generic `/projects/[slug]` case-study route. The project is added to the canonical project registry so the existing Projects grid and machine-readable project surfaces can discover it.

## Verification

Unit tests cover pity/stat aggregation from normalized wishes and the no-data state. Existing repository tests, lint, and production build must remain green.