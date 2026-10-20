# Pricing tool

A private discovery-call guide and price calculator. It runs only on the local dev server (`npm run dev`), behind the same guard as the studio. On the live site the API returns 404.

## Setup

Clone the private data repo next to this one:

    git clone git@github.com:Aedwon/aedwon-pricing.git ../aedwon-pricing

Set `PRICING_DIR` to use another folder. If the folder or its `.git` is missing, every pricing request fails with a message saying where to clone it.

## Data

- `settings.json`: rates per currency, base hours, hours and risk per answer, rush multiplier, upkeep rates, rounding. Written with starter estimates on first use. Rates start empty, and no price shows until one is set.
- `calls/<date>-<client>-<hex>.json`: one file per call.

Question wording lives in `lib/pricing/questions.ts` in this public repo. Numbers never do. Every number is in `settings.json`, keyed `question-id:choice-id`.

## Price math

Base hours plus the hours of every answered choice. Each risk raises the high end by its percent, in sequence. A rush answer multiplies both ends. Hours times the currency rate, rounded to PHP 1,000 or USD 50. Upkeep: the highest hosting cost plus (base upkeep hours plus change hours) times the upkeep rate. Hours are standard-effort hours, not your real hours.

## Backup

`POST /api/pricing/backup` commits everything in the pricing folder and pushes it. It refuses when the repo is behind origin.

## Tests

    npx vitest run lib/pricing
