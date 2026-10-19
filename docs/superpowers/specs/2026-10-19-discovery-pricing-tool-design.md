# Discovery and pricing tool

Date: 2026-10-19
Status: design approved in brainstorm, awaiting spec review

## Purpose

A private tool Aerol uses during discovery calls with potential clients. It guides the questions to ask, records the answers, and turns them into a price range for the work. At the end of the call it shows a client-safe recap Aerol can screen-share. Only Aerol uses it.

## Decisions

| Topic | Decision |
| --- | --- |
| Where it runs | A page in the portfolio repo, available only on the local dev server (`npm run dev`), guarded like the studio. Not present on the live site. |
| Who sees it | Aerol only. The client sees the recap screen through a screen share. |
| Saving | Every call is saved as a file. |
| Private data location | A separate private GitHub repo, `aedwon-pricing`, cloned next to the portfolio folder. The portfolio repo is public and never holds rates, hours or client data. |
| Backup | A "Back up" button commits and pushes the pricing repo, modeled on the studio's Publish. |
| Work types (v1) | Websites (new or redesign), web tools and apps, Discord bots. Mobile and TV apps are out of scope. |
| Pricing model | Standard-effort hours times rate, plus risk buffers. Hours mean what a typical solo developer would need without heavy AI help. The client never sees hours. |
| Upkeep | An optional monthly line, switchable per call. |
| Currency | PHP and USD, chosen per call, each with its own rate (not converted). |
| Call layout | Free-order checklist with a live price panel (option B from the brainstorm). |
| Client recap | Letter style, built from the client's own words (option A). No price. |
| Starting content | The agent drafts the question bank and starting hour ranges. They are labeled as starting estimates. Aerol edits them in Settings. |

## Where things live

```
~/Documents/Projects/
  aedwon/                 public portfolio repo: tool code and question wording only
  aedwon-pricing/         private repo
    settings.json         rates, base hours, hours per answer, risk percents, upkeep rates
    calls/<id>.json       one file per call
```

- The pricing folder path comes from the `PRICING_DIR` env var, defaulting to `../aedwon-pricing` relative to the portfolio root.
- If the folder is missing or is not a git repo, the tool shows a setup message with the clone command and refuses to save. It never creates data inside the portfolio repo.
- The question wording, hints and answer choices live in the portfolio repo (public). Every number tied to them (hours, risk percents) lives in `settings.json`, keyed by question and answer id. A question with no entry in settings counts as 0 hours, and Settings lists it as "unpriced".

## Screens

The route is `/pricing` (exact path open to the plan). In production the page returns 404 and the API routes return 404, as the studio routes do. The UI is loaded only in development.

1. **Calls.** A list of calls with client, date, work types, status, quoted range, and (once logged) real hours. A "New call" button.
2. **Call.** The working screen (see below). Opens the recap.
3. **Settings.** Edit rates (PHP, USD), base hours, hour ranges per answer, risk percents, rush multiplier, upkeep rates. Lists unpriced answers.
4. **Recap.** The client-safe view, opened from a call.

## Call screen

Layout B from the brainstorm: a section list on the left, the current section in the middle, the price panel on the right.

**Starting a call.** Client name, company (optional), currency, one or more work types. Multiple types merge their question sets. A bot with a dashboard is "Discord bot" plus "Web tool".

**Sections.** Shared sections apply to every call: Problem, People (who decides, who maintains it), Timing, Budget. Each work type adds its own sections (for example Features, Data, Integrations, Hosting). When two types share a question id, it appears once.

**Questions.** Each question has a short "listen for" hint and answer choices. Answers can be single or multiple choice. Every answer starts as "not asked". Each answer choice can carry an hour range, a risk flag, a rush flag, an upkeep effect, or nothing. Each section has a free-text notes box. A separate "In their words" box records the client's problem as they described it, for the recap.

**Recap fields on the call.** Each feature-type answer can be marked "included" or "not now". A "Next steps" text field is filled before showing the recap.

**Autosave.** Every change saves to `calls/<id>.json` right away. If a save fails, the error shows and the answers stay on screen.

## Price math

All inputs come from `settings.json` and the call's answers.

1. `hoursLow = baseLow + sum(answer.low)`, `hoursHigh = baseHigh + sum(answer.high)` over answered choices.
2. Each risk flag raises only the high end: `hoursHigh *= (1 + riskPercent/100)` per flag, applied in sequence.
3. A rush flag multiplies both ends by the rush multiplier.
4. `priceLow = hoursLow * rate`, `priceHigh = hoursHigh * rate`, rate in the call's currency.
5. Round to the nearest PHP 1,000 or USD 50 (step sizes in settings).
6. Upkeep (when on): the monthly hosting tier picked from the answers plus expected changes per month (from the answers) times an upkeep hourly rate, rounded the same way.

The panel shows the range, the monthly upkeep, the three answers that add the most hours, the active risk flags, and the count of unanswered questions. Unanswered questions add nothing, so a high count means the range is likely low.

The math is a pure function of settings and answers, with no I/O, so it can be unit tested.

## Recap

Letter style. Header with client, company and date. Then "Here's what I heard" (the In their words text), "What we'd build" (included features as prose-ready lines), "Not included for now" (features marked not now), and "Next steps". Aerol can edit any line before sharing.

The recap never shows price, hours, rates, risk flags, section notes or status. A test asserts that none of these fields reach the recap output.

## After the call

Status per call: open, proposal sent, won, lost. For won jobs, Aerol logs real hours when done. The Calls list shows quoted hours (midpoint) against real hours so estimates can be tuned in Settings.

## Safety

- Same guard as the studio: dev only, `STUDIO_LOCAL=1`, local host and origin, the `x-studio` header. Reuse the studio's guard. Do not copy it.
- Writes are limited to `settings.json` and `calls/<id>.json` inside the pricing folder. Call ids are generated and validated. Paths are checked, and prototype keys are refused.
- Every write is validated against its schema before saving.
- Backup runs `git` without a shell, with fixed arguments, only inside the pricing folder. It commits all changes in that folder with a fixed message plus timestamp, then pushes. It refuses if the branch is behind origin.
- Nothing from the pricing folder is imported into the build or sent anywhere but the local API.

## Starting content

The agent drafts the shared question bank and one per work type, with starting hour ranges, risk percents and upkeep tiers, and seeds `settings.json` with them. Rates are left empty for Aerol to fill in. The tool refuses to show a price until a rate is set and shows "Set your rate in Settings" instead. Starting hours are marked as estimates in the Settings screen until edited.

## Tests

- Price math: base only, answers summed, risk raises only high, rush raises both, rounding per currency, upkeep, unpriced answers.
- Question merge: shared plus multiple types, duplicate ids appear once.
- Recap: builds from the right fields and leaks none of the private ones.
- Server: guard refusal outside dev, path and id checks, schema validation, missing pricing folder.

## Out of scope for v1

Mobile and TV app work types, a draft proposal document, phone access, AI-written summaries, multiple users.
