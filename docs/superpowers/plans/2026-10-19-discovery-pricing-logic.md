# Discovery and pricing tool: logic phase implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build everything behind the discovery and pricing tool except its screens: question bank, price math, recap builder, validation, storage in the private pricing repo, backup, and the local API.

**Architecture:** Pure modules in `lib/pricing/` (questions, defaults, estimate, recap, validate) with no I/O. A server module (`store.ts`) reads and writes JSON in a private git repo outside the portfolio, and `backup.ts` commits and pushes it. API routes under `app/api/pricing/` reuse the studio's `guard`, `respond` and `fail`, so they work only on the loopback dev server and return 404 in production.

**Tech Stack:** Next.js 16 route handlers, TypeScript, Node `fs` and `child_process`, Vitest.

Spec: `docs/superpowers/specs/2026-10-19-discovery-pricing-tool-design.md`

## Global Constraints

- The portfolio repo is public. No rates, hour values from a real settings file, or client data may be committed to it. Starter hour values in `lib/pricing/defaults.ts` are fine (they are labeled estimates and contain no rates).
- Rates default to `null`. The tool shows no price until a rate is set.
- Private data lives in `PRICING_DIR`, default `../aedwon-pricing` relative to the portfolio root. It must be a git repo. Nothing is ever written inside the portfolio repo.
- Every API route calls `guard(req)` from `lib/studio/server.ts` first. Do not copy the guard.
- Git runs without a shell, with fixed arguments, through the studio's `git()` helper.
- Hours are standard-effort hours (a typical solo developer without heavy AI help). They never appear in the recap.
- The recap never contains price, hours, rates, risk flags, section notes, status or real hours.
- Currencies: `PHP` and `USD`. Price rounding: PHP 1,000, USD 50. Monthly upkeep rounds to a tenth of that step.
- No em dashes in docs or UI copy. Sentence case.
- Screens are out of scope for this plan. They follow a design round in Claude Design and get their own plan.
- Bulk test runs go through a Haiku subagent per CLAUDE.md.

## File structure

| File | Responsibility |
| --- | --- |
| `lib/pricing/types.ts` | Shared types and constant lists |
| `lib/pricing/questions.ts` | Sections, question bank, `answerKey`, `mergeQuestions`, `findQuestion` |
| `lib/pricing/defaults.ts` | `defaultSettings()` with starter hour ranges |
| `lib/pricing/estimate.ts` | `estimate()`, the price math |
| `lib/pricing/recap.ts` | `buildRecap()`, the client-safe view |
| `lib/pricing/validate.ts` | `validateSettings()`, `validateCall()`, `validateNewCall()` |
| `lib/pricing/store.ts` | Server: pricing folder, settings and call files |
| `lib/pricing/backup.ts` | Server: backup status and commit and push |
| `lib/studio/git.ts` | Modify: export `git()` with a `cwd` parameter |
| `app/api/pricing/settings/route.ts` | GET and PUT settings |
| `app/api/pricing/calls/route.ts` | GET list, POST new call |
| `app/api/pricing/calls/[id]/route.ts` | GET and PUT one call |
| `app/api/pricing/backup/route.ts` | GET status, POST backup |
| `lib/pricing/__tests__/*.test.ts` | Tests |
| `docs/pricing.md` | Setup and use notes |

---

### Task 0: Create the private pricing repo (needs Aerol's approval)

Creating a GitHub repo is an external change. Do not run this without Aerol's explicit yes in chat.

- [ ] **Step 1: Ask Aerol to approve, then create and clone**

```bash
cd ~/Documents/Projects
gh repo create Aedwon/aedwon-pricing --private --clone --description "Private data for the discovery and pricing tool"
cd aedwon-pricing && printf "# aedwon-pricing\n\nPrivate data for the pricing tool in the portfolio repo. Do not make public.\n" > README.md
mkdir -p calls && touch calls/.gitkeep
git add -A && git commit -m "init" && git push -u origin HEAD
```

Expected: `gh repo view Aedwon/aedwon-pricing --json visibility` prints `"PRIVATE"`.

---

### Task 1: Types and question bank

**Files:**
- Create: `lib/pricing/types.ts`
- Create: `lib/pricing/questions.ts`
- Test: `lib/pricing/__tests__/questions.test.ts`

**Interfaces:**
- Produces: all types below; `SECTIONS`, `QUESTIONS`, `answerKey(questionId, choiceId): string`, `mergeQuestions(types: WorkType[]): Section[]`, `findQuestion(id: string): Question | undefined`.

- [ ] **Step 1: Write the types**

`lib/pricing/types.ts`:

```ts
// Types for the discovery and pricing tool. Question wording lives in questions.ts (public). Every number
// lives in the private pricing repo's settings.json, keyed by answerKey(question, choice).
export type WorkType = 'website' | 'webtool' | 'bot';
export const WORK_TYPES: WorkType[] = ['website', 'webtool', 'bot'];

export type Currency = 'PHP' | 'USD';
export const CURRENCIES: Currency[] = ['PHP', 'USD'];

export type CallStatus = 'open' | 'sent' | 'won' | 'lost';
export const CALL_STATUSES: CallStatus[] = ['open', 'sent', 'won', 'lost'];

export type SectionId = 'problem' | 'people' | 'scope' | 'features' | 'data' | 'integrations' | 'hosting' | 'timing' | 'budget';

export interface Choice { id: string; label: string; none?: boolean } // none: "no" answer, never a recap line
export interface Question {
  id: string;
  section: SectionId;
  types: WorkType[] | 'all';
  prompt: string;
  hint?: string;
  multi?: boolean;
  feature?: string; // recap label when this is a feature question
  choices: Choice[];
}
export interface Section { id: SectionId; title: string; questions: Question[] }

export interface AnswerPrice {
  low?: number; // standard-effort hours
  high?: number;
  risk?: number; // percent added to the high end
  rush?: boolean; // multiplies both ends by rushMultiplier
  hosting?: Record<Currency, number>; // monthly hosting cost
  changeHours?: number; // expected upkeep hours per month
  estimate?: boolean; // starter value, not yet edited
}

export interface Settings {
  version: 1;
  rates: Record<Currency, number | null>;
  upkeepRates: Record<Currency, number | null>;
  base: { low: number; high: number };
  upkeepBaseHours: number;
  rushMultiplier: number;
  rounding: Record<Currency, number>;
  answers: Record<string, AnswerPrice>;
}

export interface RecapEdits { heard?: string; build?: string[]; later?: string[]; next?: string }

export interface Call {
  version: 1;
  id: string;
  client: string;
  company: string;
  date: string; // YYYY-MM-DD
  currency: Currency;
  types: WorkType[];
  answers: Record<string, string[]>; // question id -> choice ids
  notes: Partial<Record<SectionId, string>>;
  words: string; // the client's problem in their own words
  scope: Record<string, 'included' | 'later'>; // feature question id -> scope
  nextSteps: string;
  upkeep: boolean;
  status: CallStatus;
  realHours: number | null;
  recapEdits: RecapEdits;
}

export interface Driver { key: string; question: string; choice: string; high: number }
export interface RiskHit { key: string; question: string; choice: string; percent: number }

export interface Estimate {
  hours: { low: number; high: number };
  price: { low: number; high: number } | null; // null until a rate is set
  monthly: number | null;
  missingRate: boolean;
  missingUpkeepRate: boolean;
  drivers: Driver[]; // top 3 by high hours
  risks: RiskHit[];
  rush: boolean;
  unanswered: number;
  unpriced: string[]; // answered keys with no settings entry
}

export interface Recap { client: string; company: string; date: string; heard: string; build: string[]; later: string[]; next: string }

export interface CallSummary {
  id: string; client: string; company: string; date: string; currency: Currency; types: WorkType[];
  status: CallStatus; hours: { low: number; high: number }; price: { low: number; high: number } | null; realHours: number | null;
}
```

- [ ] **Step 2: Write the failing test**

`lib/pricing/__tests__/questions.test.ts`:

```ts
// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { QUESTIONS, SECTIONS, answerKey, findQuestion, mergeQuestions } from '../questions';

describe('question bank', () => {
  it('has unique question ids and unique choice ids per question', () => {
    const ids = QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const q of QUESTIONS) {
      const cids = q.choices.map((c) => c.id);
      expect(new Set(cids).size, q.id).toBe(cids.length);
      expect(cids.length, q.id).toBeGreaterThan(1);
    }
  });
  it('uses ids that are safe as keys', () => {
    for (const q of QUESTIONS) {
      expect(q.id).toMatch(/^[a-z][a-z0-9-]*$/);
      for (const c of q.choices) expect(c.id).toMatch(/^[a-z][a-z0-9-]*$/);
    }
  });
  it('puts every question in a known section', () => {
    const known = new Set(SECTIONS.map((s) => s.id));
    for (const q of QUESTIONS) expect(known.has(q.section), q.id).toBe(true);
  });
});

describe('answerKey', () => {
  it('joins question and choice ids', () => expect(answerKey('timing-deadline', 'rush')).toBe('timing-deadline:rush'));
});

describe('mergeQuestions', () => {
  it('includes shared questions for every type', () => {
    const ids = mergeQuestions(['bot']).flatMap((s) => s.questions.map((q) => q.id));
    expect(ids).toContain('problem-trigger');
    expect(ids).toContain('bot-commands');
    expect(ids).not.toContain('website-pages');
  });
  it('merges several types in section order and drops empty sections', () => {
    const sections = mergeQuestions(['bot', 'webtool']);
    const order = SECTIONS.map((s) => s.id);
    const got = sections.map((s) => s.id);
    expect(got).toEqual(order.filter((id) => got.includes(id)));
    expect(sections.every((s) => s.questions.length > 0)).toBe(true);
    const ids = sections.flatMap((s) => s.questions.map((q) => q.id));
    expect(ids).toContain('bot-commands');
    expect(ids).toContain('webtool-login');
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('returns only shared questions for no types', () => {
    const ids = mergeQuestions([]).flatMap((s) => s.questions.map((q) => q.id));
    expect(ids.every((id) => findQuestion(id)!.types === 'all')).toBe(true);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run lib/pricing/__tests__/questions.test.ts`
Expected: FAIL, cannot find module `../questions`.

- [ ] **Step 4: Write the question bank**

`lib/pricing/questions.ts`:

```ts
// The discovery question bank. Wording only: hours, risks and costs for each answer live in the private
// pricing repo's settings.json under answerKey(question, choice). Starter values are in defaults.ts.
import type { Question, Section, SectionId, WorkType } from './types';

export const SECTIONS: { id: SectionId; title: string }[] = [
  { id: 'problem', title: 'Problem' },
  { id: 'people', title: 'People' },
  { id: 'scope', title: 'Scope' },
  { id: 'features', title: 'Features' },
  { id: 'data', title: 'Data' },
  { id: 'integrations', title: 'Integrations' },
  { id: 'hosting', title: 'Hosting' },
  { id: 'timing', title: 'Timing' },
  { id: 'budget', title: 'Budget' },
];

export const answerKey = (questionId: string, choiceId: string) => `${questionId}:${choiceId}`;

const NO = { id: 'no', label: 'No', none: true };

export const QUESTIONS: Question[] = [
  // shared
  { id: 'problem-trigger', section: 'problem', types: 'all', prompt: 'What made you look for help now?', hint: 'A deadline, a process that keeps breaking, a new idea. Listen for urgency and stakes.',
    choices: [{ id: 'new-idea', label: 'New idea, nothing exists yet' }, { id: 'replace', label: 'Replacing something that works badly' }, { id: 'broken', label: 'Something broke or is about to' }] },
  { id: 'problem-current', section: 'problem', types: 'all', prompt: 'How is this handled today?', hint: 'This is the baseline, and it tells you if there is data to move.',
    choices: [{ id: 'nothing', label: 'It is not handled at all' }, { id: 'manual', label: 'By hand or in spreadsheets' }, { id: 'tool', label: 'Another tool they want to leave' }] },
  { id: 'problem-success', section: 'problem', types: 'all', prompt: 'How will you know this worked, three months after launch?', hint: 'Listen for a number. No clear answer means the requirements are vague.',
    choices: [{ id: 'clear', label: 'Clear, measurable answer' }, { id: 'vague', label: 'Vague or unsure' }] },
  { id: 'people-decider', section: 'people', types: 'all', prompt: 'Who signs off on the proposal and the final result?', hint: 'If that person is not on this call, expect a second round.',
    choices: [{ id: 'on-call', label: 'Someone on this call' }, { id: 'elsewhere', label: 'Someone not on this call' }, { id: 'committee', label: 'A group or committee' }] },
  { id: 'people-feedback', section: 'people', types: 'all', prompt: 'Who gives feedback during the build?', hint: 'One named person is best. Several voices slow every review.',
    choices: [{ id: 'one', label: 'One named person' }, { id: 'several', label: 'Several people' }, { id: 'unclear', label: 'Not decided' }] },
  { id: 'people-maintainer', section: 'people', types: 'all', prompt: 'Who looks after it after launch?', hint: 'This decides whether upkeep is on the table.',
    choices: [{ id: 'me', label: 'They want me to' }, { id: 'team', label: 'Their own team' }, { id: 'unsure', label: 'Not sure yet' }] },
  { id: 'timing-deadline', section: 'timing', types: 'all', prompt: 'When does this need to be live?', hint: 'Ask what happens if it slips. A real deadline has a reason.',
    choices: [{ id: 'flexible', label: 'No fixed date' }, { id: 'normal', label: 'More than a month out' }, { id: 'rush', label: 'Within a month' }, { id: 'event', label: 'Tied to a fixed event' }] },
  { id: 'timing-response', section: 'timing', types: 'all', prompt: 'How fast can they answer questions and review work?',
    choices: [{ id: 'fast', label: 'Within a day or two' }, { id: 'slow', label: 'A week or more' }] },
  { id: 'budget-range', section: 'budget', types: 'all', prompt: 'Did they share a budget?', hint: 'Ask for a range. Do not name a number first. Write the figure in the notes.',
    choices: [{ id: 'range', label: 'Yes, a range' }, { id: 'none', label: 'No budget yet' }, { id: 'low', label: 'Far below the likely price' }] },
  { id: 'budget-payment', section: 'budget', types: 'all', prompt: 'How would they prefer to pay?',
    choices: [{ id: 'milestones', label: 'In milestones' }, { id: 'upfront', label: 'Mostly upfront' }, { id: 'after', label: 'After delivery' }] },

  // website
  { id: 'website-pages', section: 'scope', types: ['website'], prompt: 'How many distinct page designs?', hint: 'Count layouts, not pages. Ten blog posts share one layout.',
    choices: [{ id: 'few', label: '1 to 3' }, { id: 'some', label: '4 to 8' }, { id: 'many', label: '9 or more' }] },
  { id: 'website-content', section: 'scope', types: ['website'], prompt: 'Who writes the text and supplies the images?', hint: 'Missing content is the most common reason a website launch slips.',
    choices: [{ id: 'ready', label: 'They have it ready' }, { id: 'partial', label: 'Some of it' }, { id: 'nobody', label: 'Nobody yet' }] },
  { id: 'website-design', section: 'scope', types: ['website'], prompt: 'Is there a design or brand to follow?',
    choices: [{ id: 'full', label: 'Full designs ready' }, { id: 'brand', label: 'Brand only (logo, colors)' }, { id: 'nothing', label: 'Nothing, design from scratch' }] },
  { id: 'website-cms', section: 'features', types: ['website'], prompt: 'Will they edit the content themselves after launch?', feature: 'Content editing for your team',
    choices: [NO, { id: 'simple', label: 'Some text and images' }, { id: 'posts', label: 'A blog or regular posts' }] },
  { id: 'website-forms', section: 'features', types: ['website'], prompt: 'Contact forms, bookings or sign-ups?', feature: 'Forms and sign-ups',
    choices: [NO, { id: 'contact', label: 'A contact form' }, { id: 'booking', label: 'Bookings or a calendar' }] },
  { id: 'website-languages', section: 'features', types: ['website'], prompt: 'More than one language?', feature: 'More than one language',
    choices: [NO, { id: 'two', label: 'Two' }, { id: 'more', label: 'Three or more' }] },
  { id: 'website-seo', section: 'features', types: ['website'], prompt: 'Is search ranking a goal?', feature: 'Search engine setup',
    choices: [NO, { id: 'basic', label: 'Basic setup' }, { id: 'migration', label: 'Moving a site that already ranks' }] },
  { id: 'website-host', section: 'hosting', types: ['website'], prompt: 'Where will the website be hosted?',
    choices: [{ id: 'theirs', label: 'They have hosting' }, { id: 'mine', label: 'I host it' }, { id: 'unsure', label: 'Not sure yet' }] },

  // web tool or app
  { id: 'webtool-users', section: 'scope', types: ['webtool'], prompt: 'Who uses the tool?', hint: 'Public users mean more care with security and load.',
    choices: [{ id: 'internal', label: 'Only their team' }, { id: 'public', label: 'The public' }, { id: 'both', label: 'Both' }] },
  { id: 'webtool-screens', section: 'scope', types: ['webtool'], prompt: 'How many main screens?', hint: 'Lists, forms, dashboards. Count screens with their own job.',
    choices: [{ id: 'few', label: '1 to 3' }, { id: 'some', label: '4 to 8' }, { id: 'many', label: '9 or more' }] },
  { id: 'webtool-login', section: 'features', types: ['webtool'], prompt: 'Do users need to sign in?', feature: 'Sign-in',
    choices: [NO, { id: 'simple', label: 'Email or Google sign-in' }, { id: 'roles', label: 'Different roles and permissions' }] },
  { id: 'webtool-reports', section: 'features', types: ['webtool'], prompt: 'Charts, reports or exports?', feature: 'Reports and exports', multi: true,
    choices: [NO, { id: 'export', label: 'CSV or PDF export' }, { id: 'charts', label: 'Charts and dashboards' }] },
  { id: 'webtool-payments', section: 'features', types: ['webtool'], prompt: 'Does it take payments?', feature: 'Payments',
    choices: [NO, { id: 'once', label: 'One-time payments' }, { id: 'subscriptions', label: 'Subscriptions' }] },
  { id: 'webtool-data', section: 'data', types: ['webtool'], prompt: 'What does it need to store?',
    choices: [{ id: 'nothing', label: 'Nothing lasting' }, { id: 'simple', label: 'A few simple tables' }, { id: 'linked', label: 'Many linked records' }] },
  { id: 'webtool-migrate', section: 'data', types: ['webtool'], prompt: 'Is there existing data to bring over?',
    choices: [NO, { id: 'clean', label: 'Yes, clean spreadsheets' }, { id: 'messy', label: 'Yes, messy or from another system' }] },
  { id: 'webtool-apis', section: 'integrations', types: ['webtool'], prompt: 'Does it connect to other services?', hint: 'Each outside API is a risk you do not control.',
    choices: [NO, { id: 'one', label: 'One service' }, { id: 'several', label: 'Several' }] },
  { id: 'webtool-host', section: 'hosting', types: ['webtool'], prompt: 'Where will the tool run?',
    choices: [{ id: 'theirs', label: 'Their servers or account' }, { id: 'mine', label: 'I host it' }, { id: 'unsure', label: 'Not sure yet' }] },

  // Discord bot
  { id: 'bot-servers', section: 'scope', types: ['bot'], prompt: 'How many servers will use the bot?', hint: 'One server is a tool. Any server is a product.',
    choices: [{ id: 'one', label: 'One server' }, { id: 'few', label: 'A few they run' }, { id: 'public', label: 'Public, any server' }] },
  { id: 'bot-members', section: 'scope', types: ['bot'], prompt: 'How big is the largest server?',
    choices: [{ id: 'small', label: 'Under 1,000 members' }, { id: 'mid', label: '1,000 to 20,000' }, { id: 'large', label: 'Over 20,000' }] },
  { id: 'bot-commands', section: 'features', types: ['bot'], prompt: 'How many commands or actions?',
    choices: [{ id: 'few', label: '1 to 5' }, { id: 'some', label: '6 to 15' }, { id: 'many', label: '16 or more' }] },
  { id: 'bot-memory', section: 'features', types: ['bot'], prompt: 'Does it remember users between sessions?', hint: 'Leveling, economy, warnings, stats.', feature: 'Saved member data',
    choices: [NO, { id: 'simple', label: 'Yes, simple records' }, { id: 'history', label: 'Yes, with history and stats' }] },
  { id: 'bot-moderation', section: 'features', types: ['bot'], prompt: 'Moderation or automatic actions?', feature: 'Moderation tools',
    choices: [NO, { id: 'basic', label: 'Basic (warnings, filters)' }, { id: 'advanced', label: 'Advanced (appeals, logs, rules)' }] },
  { id: 'bot-tickets', section: 'features', types: ['bot'], prompt: 'Tickets, forms or sign-ups inside Discord?', feature: 'Tickets and sign-ups',
    choices: [NO, { id: 'yes', label: 'Yes' }] },
  { id: 'bot-dashboard', section: 'features', types: ['bot'], prompt: 'A web dashboard to manage it?', hint: 'If yes, add the web tool type to this call.', feature: 'Web dashboard',
    choices: [NO, { id: 'yes', label: 'Yes' }] },
  { id: 'bot-migrate', section: 'data', types: ['bot'], prompt: 'Is it replacing another bot?',
    choices: [NO, { id: 'yes', label: 'Yes, and its data must carry over' }] },
  { id: 'bot-apis', section: 'integrations', types: ['bot'], prompt: 'Does it pull data from outside services?', hint: 'Game APIs, sheets, Twitch. Each is a risk you do not control.',
    choices: [NO, { id: 'one', label: 'One service' }, { id: 'several', label: 'Several' }] },
  { id: 'bot-host', section: 'hosting', types: ['bot'], prompt: 'Where will the bot run?',
    choices: [{ id: 'theirs', label: 'Their server or account' }, { id: 'mine', label: 'I host it' }, { id: 'unsure', label: 'Not sure yet' }] },
  { id: 'bot-uptime', section: 'hosting', types: ['bot'], prompt: 'How bad is it if the bot is down for an hour?',
    choices: [{ id: 'fine', label: 'Annoying, not serious' }, { id: 'bad', label: 'Events or payments break' }] },
];

const BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));
export const findQuestion = (id: string) => BY_ID.get(id);

// Shared questions plus every question for the chosen types, grouped in SECTIONS order. Empty sections are dropped.
export function mergeQuestions(types: WorkType[]): Section[] {
  const picked = new Map<string, Question>();
  for (const q of QUESTIONS) {
    if (q.types === 'all' || q.types.some((t) => types.includes(t))) picked.set(q.id, q);
  }
  return SECTIONS
    .map((s) => ({ ...s, questions: [...picked.values()].filter((q) => q.section === s.id) }))
    .filter((s) => s.questions.length > 0);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run lib/pricing/__tests__/questions.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/pricing/types.ts lib/pricing/questions.ts lib/pricing/__tests__/questions.test.ts
git commit -m "feat(pricing): question bank and types"
```

---

### Task 2: Starter settings

**Files:**
- Create: `lib/pricing/defaults.ts`
- Test: `lib/pricing/__tests__/defaults.test.ts`

**Interfaces:**
- Consumes: `QUESTIONS`, `answerKey` from Task 1; `Settings`, `AnswerPrice` types.
- Produces: `defaultSettings(): Settings` (a fresh object every call).

- [ ] **Step 1: Write the failing test**

`lib/pricing/__tests__/defaults.test.ts`:

```ts
// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { defaultSettings } from '../defaults';
import { QUESTIONS, answerKey } from '../questions';

describe('defaultSettings', () => {
  it('prices every choice of every question, and nothing else', () => {
    const want = QUESTIONS.flatMap((q) => q.choices.map((c) => answerKey(q.id, c.id))).sort();
    expect(Object.keys(defaultSettings().answers).sort()).toEqual(want);
  });
  it('leaves rates empty and marks every answer as an estimate', () => {
    const s = defaultSettings();
    expect(s.rates).toEqual({ PHP: null, USD: null });
    expect(s.upkeepRates).toEqual({ PHP: null, USD: null });
    expect(Object.values(s.answers).every((a) => a.estimate === true)).toBe(true);
  });
  it('keeps low at or below high', () => {
    for (const [k, a] of Object.entries(defaultSettings().answers)) expect(a.low ?? 0, k).toBeLessThanOrEqual(a.high ?? 0);
  });
  it('returns a fresh copy each time', () => {
    const a = defaultSettings();
    a.answers['bot-host:mine'].hosting!.PHP = 1;
    expect(defaultSettings().answers['bot-host:mine'].hosting!.PHP).not.toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/pricing/__tests__/defaults.test.ts`
Expected: FAIL, cannot find module `../defaults`.

- [ ] **Step 3: Write the defaults**

`lib/pricing/defaults.ts`:

```ts
// Starter values for settings.json, written the first time the tool opens an empty pricing folder.
// Hours are standard-effort guesses (a typical solo developer without heavy AI help) and are marked as
// estimates until edited in Settings. Rates stay empty: the tool shows no price until they are set.
import { answerKey } from './questions';
import type { AnswerPrice, Settings } from './types';

type Extra = Omit<AnswerPrice, 'low' | 'high' | 'estimate'>;
const P = (low = 0, high = low, extra: Extra = {}): AnswerPrice => ({ low, high, ...extra, estimate: true });
const host = (PHP: number, USD: number) => ({ hosting: { PHP, USD } });

const DEFAULTS: Record<string, Record<string, AnswerPrice>> = {
  'problem-trigger': { 'new-idea': P(0, 0, { risk: 10 }), replace: P(4, 8), broken: P(0, 0, { risk: 10 }) },
  'problem-current': { nothing: P(), manual: P(), tool: P(6, 12, { risk: 10 }) },
  'problem-success': { clear: P(), vague: P(0, 0, { risk: 20 }) },
  'people-decider': { 'on-call': P(), elsewhere: P(0, 0, { risk: 15 }), committee: P(0, 0, { risk: 25 }) },
  'people-feedback': { one: P(), several: P(0, 0, { risk: 15 }), unclear: P(0, 0, { risk: 20 }) },
  'people-maintainer': { me: P(0, 0, { changeHours: 2 }), team: P(3, 6), unsure: P() },
  'timing-deadline': { flexible: P(), normal: P(), rush: P(0, 0, { rush: true }), event: P(0, 0, { risk: 10 }) },
  'timing-response': { fast: P(), slow: P(0, 0, { risk: 15 }) },
  'budget-range': { range: P(), none: P(), low: P() },
  'budget-payment': { milestones: P(), upfront: P(), after: P() },

  'website-pages': { few: P(10, 16), some: P(20, 32), many: P(36, 56) },
  'website-content': { ready: P(), partial: P(4, 8, { risk: 10 }), nobody: P(0, 0, { risk: 25 }) },
  'website-design': { full: P(), brand: P(6, 12), nothing: P(14, 24) },
  'website-cms': { no: P(), simple: P(8, 14), posts: P(14, 24) },
  'website-forms': { no: P(), contact: P(2, 4), booking: P(8, 16) },
  'website-languages': { no: P(), two: P(6, 12), more: P(12, 20) },
  'website-seo': { no: P(), basic: P(2, 4), migration: P(6, 12, { risk: 10 }) },
  'website-host': { theirs: P(1, 3), mine: P(0, 0, host(500, 10)), unsure: P() },

  'webtool-users': { internal: P(), public: P(8, 16, { risk: 10 }), both: P(12, 20, { risk: 10 }) },
  'webtool-screens': { few: P(12, 20), some: P(28, 44), many: P(50, 80, { risk: 15 }) },
  'webtool-login': { no: P(), simple: P(6, 10), roles: P(14, 24) },
  'webtool-reports': { no: P(), export: P(4, 8), charts: P(8, 16) },
  'webtool-payments': { no: P(), once: P(8, 14, { risk: 10 }), subscriptions: P(16, 28, { risk: 15 }) },
  'webtool-data': { nothing: P(), simple: P(6, 10), linked: P(14, 26) },
  'webtool-migrate': { no: P(), clean: P(4, 8), messy: P(10, 20, { risk: 15 }) },
  'webtool-apis': { no: P(), one: P(6, 12, { risk: 10 }), several: P(14, 28, { risk: 20 }) },
  'webtool-host': { theirs: P(3, 6), mine: P(0, 0, host(1500, 30)), unsure: P() },

  'bot-servers': { one: P(), few: P(2, 4), public: P(10, 18, { risk: 10 }) },
  'bot-members': { small: P(), mid: P(2, 6), large: P(8, 16, { risk: 10 }) },
  'bot-commands': { few: P(6, 10), some: P(14, 24), many: P(28, 44) },
  'bot-memory': { no: P(), simple: P(6, 10), history: P(12, 20) },
  'bot-moderation': { no: P(), basic: P(6, 12), advanced: P(14, 26) },
  'bot-tickets': { no: P(), yes: P(8, 14) },
  'bot-dashboard': { no: P(), yes: P() },
  'bot-migrate': { no: P(), yes: P(8, 16, { risk: 15 }) },
  'bot-apis': { no: P(), one: P(6, 12, { risk: 10 }), several: P(14, 26, { risk: 20 }) },
  'bot-host': { theirs: P(2, 4), mine: P(0, 0, host(800, 15)), unsure: P() },
  'bot-uptime': { fine: P(), bad: P(0, 0, { risk: 10, changeHours: 2 }) },
};

export function defaultSettings(): Settings {
  const answers: Record<string, AnswerPrice> = {};
  for (const [q, choices] of Object.entries(DEFAULTS)) {
    for (const [c, p] of Object.entries(choices)) answers[answerKey(q, c)] = { ...p, ...(p.hosting ? { hosting: { ...p.hosting } } : {}) };
  }
  return {
    version: 1,
    rates: { PHP: null, USD: null },
    upkeepRates: { PHP: null, USD: null },
    base: { low: 6, high: 10 }, // setup, testing, launch
    upkeepBaseHours: 2,
    rushMultiplier: 1.3,
    rounding: { PHP: 1000, USD: 50 },
    answers,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/pricing/__tests__/defaults.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/pricing/defaults.ts lib/pricing/__tests__/defaults.test.ts
git commit -m "feat(pricing): starter settings"
```

---

### Task 3: Price math

**Files:**
- Create: `lib/pricing/estimate.ts`
- Test: `lib/pricing/__tests__/estimate.test.ts`

**Interfaces:**
- Consumes: `mergeQuestions`, `answerKey` (Task 1); `Settings`, `Call`, `Estimate` types.
- Produces: `estimate(settings: Settings, call: Pick<Call, 'types' | 'answers' | 'currency' | 'upkeep'>): Estimate`.

Math, in order: base plus answered hours; each risk raises the high end by its percent, in sequence; rush multiplies both ends; multiply by the currency rate; round to `rounding[currency]`. Monthly upkeep is `max hosting + (upkeepBaseHours + sum changeHours) * upkeepRate`, rounded to a tenth of the step, and only when `call.upkeep` is on and an upkeep rate is set. Hours in the result are rounded to whole numbers.

- [ ] **Step 1: Write the failing test**

`lib/pricing/__tests__/estimate.test.ts`:

```ts
// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { estimate } from '../estimate';
import type { Call, Settings } from '../types';

const settings = (over: Partial<Settings> = {}): Settings => ({
  version: 1,
  rates: { PHP: 1000, USD: 20 },
  upkeepRates: { PHP: 800, USD: 15 },
  base: { low: 10, high: 20 },
  upkeepBaseHours: 2,
  rushMultiplier: 1.5,
  rounding: { PHP: 1000, USD: 50 },
  answers: {
    'bot-commands:few': { low: 6, high: 10 },
    'bot-commands:many': { low: 30, high: 40 },
    'bot-memory:simple': { low: 4, high: 8 },
    'bot-tickets:yes': { low: 2, high: 4 },
    'problem-success:vague': { risk: 20 },
    'people-decider:committee': { risk: 50 },
    'timing-deadline:rush': { rush: true },
    'bot-host:mine': { hosting: { PHP: 500, USD: 10 } },
    'bot-uptime:bad': { changeHours: 3 },
  },
  ...over,
});
const call = (answers: Record<string, string[]>, over: Partial<Call> = {}) =>
  ({ types: ['bot'], currency: 'PHP', upkeep: false, answers, ...over }) as Pick<Call, 'types' | 'answers' | 'currency' | 'upkeep'>;

describe('estimate', () => {
  it('uses base hours alone when nothing is answered', () => {
    const e = estimate(settings(), call({}));
    expect(e.hours).toEqual({ low: 10, high: 20 });
    expect(e.price).toEqual({ low: 10000, high: 20000 });
    expect(e.unanswered).toBeGreaterThan(0);
  });
  it('adds answered hours', () => {
    const e = estimate(settings(), call({ 'bot-commands': ['few'], 'bot-memory': ['simple'] }));
    expect(e.hours).toEqual({ low: 20, high: 38 });
    expect(e.price).toEqual({ low: 20000, high: 38000 });
  });
  it('raises only the high end for each risk, in sequence', () => {
    const e = estimate(settings(), call({ 'problem-success': ['vague'], 'people-decider': ['committee'] }));
    expect(e.hours).toEqual({ low: 10, high: 36 }); // 20 * 1.2 * 1.5
    expect(e.risks.map((r) => r.percent)).toEqual([20, 50]);
  });
  it('multiplies both ends for rush, after risks', () => {
    const e = estimate(settings(), call({ 'problem-success': ['vague'], 'timing-deadline': ['rush'] }));
    expect(e.rush).toBe(true);
    expect(e.hours).toEqual({ low: 15, high: 36 }); // low 10*1.5, high 20*1.2*1.5
  });
  it('rounds price to the currency step', () => {
    const e = estimate(settings({ rates: { PHP: 1234, USD: 21 } }), call({}, { currency: 'USD' }));
    expect(e.price).toEqual({ low: 200, high: 400 }); // 210 -> 200, 420 -> 400
    const p = estimate(settings({ rates: { PHP: 1234, USD: 21 } }), call({}));
    expect(p.price).toEqual({ low: 12000, high: 25000 }); // 12340, 24680
  });
  it('shows no price until a rate is set', () => {
    const e = estimate(settings({ rates: { PHP: null, USD: null } }), call({}));
    expect(e.price).toBeNull();
    expect(e.missingRate).toBe(true);
    expect(e.hours).toEqual({ low: 10, high: 20 });
  });
  it('computes monthly upkeep only when switched on and an upkeep rate is set', () => {
    const answers = { 'bot-host': ['mine'], 'bot-uptime': ['bad'] };
    expect(estimate(settings(), call(answers)).monthly).toBeNull();
    expect(estimate(settings(), call(answers, { upkeep: true })).monthly).toBe(4500); // 500 + (2+3)*800
    const noRate = estimate(settings({ upkeepRates: { PHP: null, USD: null } }), call(answers, { upkeep: true }));
    expect(noRate.monthly).toBeNull();
    expect(noRate.missingUpkeepRate).toBe(true);
  });
  it('lists the top three drivers by high hours', () => {
    const e = estimate(settings(), call({ 'bot-commands': ['many'], 'bot-memory': ['simple'], 'bot-tickets': ['yes'], 'bot-servers': ['one'] }));
    expect(e.drivers.map((d) => d.key)).toEqual(['bot-commands:many', 'bot-memory:simple', 'bot-tickets:yes']);
    expect(e.drivers[0]).toMatchObject({ question: 'How many commands or actions?', choice: '16 or more', high: 40 });
  });
  it('reports answered choices with no settings entry as unpriced and adds nothing for them', () => {
    const e = estimate(settings(), call({ 'bot-servers': ['public'] }));
    expect(e.unpriced).toEqual(['bot-servers:public']);
    expect(e.hours).toEqual({ low: 10, high: 20 });
  });
  it('ignores answers to questions outside the call types and unknown choices', () => {
    const e = estimate(settings(), call({ 'website-pages': ['many'], 'bot-commands': ['nope'] }));
    expect(e.hours).toEqual({ low: 10, high: 20 });
  });
  it('counts unanswered questions for the call types', () => {
    const all = estimate(settings(), call({})).unanswered;
    expect(estimate(settings(), call({ 'bot-commands': ['few'] })).unanswered).toBe(all - 1);
    expect(estimate(settings(), call({ 'bot-commands': [] })).unanswered).toBe(all);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/pricing/__tests__/estimate.test.ts`
Expected: FAIL, cannot find module `../estimate`.

- [ ] **Step 3: Write the math**

`lib/pricing/estimate.ts`:

```ts
// The price math. Pure: settings plus a call's answers in, an estimate out. See the spec's "Price math".
import { answerKey, mergeQuestions } from './questions';
import type { Call, Driver, Estimate, RiskHit, Settings } from './types';

const roundTo = (n: number, step: number) => Math.round(n / step) * step;

export function estimate(settings: Settings, call: Pick<Call, 'types' | 'answers' | 'currency' | 'upkeep'>): Estimate {
  let low = settings.base.low;
  let high = settings.base.high;
  let rush = false;
  let unanswered = 0;
  let hosting = 0;
  let changeHours = 0;
  const drivers: Driver[] = [];
  const risks: RiskHit[] = [];
  const unpriced: string[] = [];

  for (const q of mergeQuestions(call.types).flatMap((s) => s.questions)) {
    const picked = call.answers[q.id] ?? [];
    if (!picked.length) { unanswered++; continue; }
    for (const cid of picked) {
      const choice = q.choices.find((c) => c.id === cid);
      if (!choice) continue;
      const key = answerKey(q.id, cid);
      const p = settings.answers[key];
      if (!p) { unpriced.push(key); continue; }
      low += p.low ?? 0;
      high += p.high ?? 0;
      if (p.high) drivers.push({ key, question: q.prompt, choice: choice.label, high: p.high });
      if (p.risk) risks.push({ key, question: q.prompt, choice: choice.label, percent: p.risk });
      if (p.rush) rush = true;
      if (p.hosting) hosting = Math.max(hosting, p.hosting[call.currency]);
      changeHours += p.changeHours ?? 0;
    }
  }

  for (const r of risks) high *= 1 + r.percent / 100;
  if (rush) { low *= settings.rushMultiplier; high *= settings.rushMultiplier; }

  const step = settings.rounding[call.currency];
  const rate = settings.rates[call.currency];
  const upkeepRate = settings.upkeepRates[call.currency];
  drivers.sort((a, b) => b.high - a.high);

  return {
    hours: { low: Math.round(low), high: Math.round(high) },
    price: rate ? { low: roundTo(low * rate, step), high: roundTo(high * rate, step) } : null,
    monthly: call.upkeep && upkeepRate ? roundTo(hosting + (settings.upkeepBaseHours + changeHours) * upkeepRate, step / 10) : null,
    missingRate: !rate,
    missingUpkeepRate: call.upkeep && !upkeepRate,
    drivers: drivers.slice(0, 3),
    risks,
    rush,
    unanswered,
    unpriced,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/pricing/__tests__/estimate.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/pricing/estimate.ts lib/pricing/__tests__/estimate.test.ts
git commit -m "feat(pricing): price math"
```

---

### Task 4: Client recap

**Files:**
- Create: `lib/pricing/recap.ts`
- Test: `lib/pricing/__tests__/recap.test.ts`

**Interfaces:**
- Consumes: `mergeQuestions` (Task 1); `Call`, `Recap` types.
- Produces: `buildRecap(call: Call): Recap`.

Rules: `heard` is `call.words`. A feature question (one with `feature`) goes in `build` when it has an answer that is not a `none` choice and its scope is not `later`. It goes in `later` when its scope is `later`, whatever the answer. `next` is `call.nextSteps`. Any field in `call.recapEdits` replaces the built one. Strings are trimmed.

- [ ] **Step 1: Write the failing test**

`lib/pricing/__tests__/recap.test.ts`:

```ts
// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { buildRecap } from '../recap';
import type { Call } from '../types';

const call = (over: Partial<Call> = {}): Call => ({
  version: 1, id: '2026-10-19-kanto-ab12', client: 'Juan', company: 'Kanto Esports', date: '2026-10-19',
  currency: 'PHP', types: ['bot'],
  answers: { 'bot-tickets': ['yes'], 'bot-memory': ['no'], 'bot-moderation': ['basic'], 'bot-commands': ['some'], 'people-decider': ['committee'] },
  notes: { problem: 'PRIVATE NOTE', budget: 'Said 30k max' },
  words: '  Mods sort sign-ups by hand every night.  ',
  scope: { 'bot-moderation': 'later' },
  nextSteps: 'Proposal by Oct 22.',
  upkeep: true, status: 'won', realHours: 77, recapEdits: {},
  ...over,
});

describe('buildRecap', () => {
  it('builds the letter fields from the call', () => {
    expect(buildRecap(call())).toEqual({
      client: 'Juan', company: 'Kanto Esports', date: '2026-10-19',
      heard: 'Mods sort sign-ups by hand every night.',
      build: ['Tickets and sign-ups'],
      later: ['Moderation tools'],
      next: 'Proposal by Oct 22.',
    });
  });
  it('lets edits replace any built field', () => {
    const r = buildRecap(call({ recapEdits: { heard: 'Edited', build: ['A', 'B'], later: [], next: 'Call Friday' } }));
    expect(r).toMatchObject({ heard: 'Edited', build: ['A', 'B'], later: [], next: 'Call Friday' });
  });
  it('never leaks private fields', () => {
    const text = JSON.stringify(buildRecap(call()));
    for (const leak of ['PRIVATE NOTE', '30k', 'committee', '77', 'won', 'PHP', 'upkeep', 'hours', 'price', 'risk']) {
      expect(text, leak).not.toContain(leak);
    }
    expect(Object.keys(buildRecap(call())).sort()).toEqual(['build', 'client', 'company', 'date', 'heard', 'later', 'next']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/pricing/__tests__/recap.test.ts`
Expected: FAIL, cannot find module `../recap`.

- [ ] **Step 3: Write the recap builder**

`lib/pricing/recap.ts`:

```ts
// The client-safe recap shown by screen share at the end of a call. It reads only the fields listed here:
// never price, hours, rates, risks, notes, status or real hours.
import { mergeQuestions } from './questions';
import type { Call, Recap } from './types';

export function buildRecap(call: Call): Recap {
  const build: string[] = [];
  const later: string[] = [];
  for (const q of mergeQuestions(call.types).flatMap((s) => s.questions)) {
    if (!q.feature) continue;
    if (call.scope[q.id] === 'later') { later.push(q.feature); continue; }
    const picked = call.answers[q.id] ?? [];
    if (picked.some((id) => q.choices.some((c) => c.id === id && !c.none))) build.push(q.feature);
  }
  const e = call.recapEdits;
  return {
    client: call.client,
    company: call.company,
    date: call.date,
    heard: (e.heard ?? call.words).trim(),
    build: e.build ?? build,
    later: e.later ?? later,
    next: (e.next ?? call.nextSteps).trim(),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/pricing/__tests__/recap.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/pricing/recap.ts lib/pricing/__tests__/recap.test.ts
git commit -m "feat(pricing): client recap"
```

---

### Task 5: Validation

**Files:**
- Create: `lib/pricing/validate.ts`
- Test: `lib/pricing/__tests__/validate.test.ts`

**Interfaces:**
- Consumes: `StudioError` from `lib/studio/server.ts`; `findQuestion`, `answerKey`, `SECTIONS` (Task 1); `defaultSettings` (Task 2, tests only); constant lists from `types.ts`.
- Produces:
  - `CALL_ID_RE: RegExp`
  - `validateSettings(raw: unknown): Settings`
  - `validateCall(raw: unknown): Call`
  - `validateNewCall(raw: unknown): { client: string; company: string; currency: Currency; types: WorkType[] }`
  All throw `StudioError(400, message)` on bad input. They return new objects that hold only known fields.

- [ ] **Step 1: Write the failing test**

`lib/pricing/__tests__/validate.test.ts`:

```ts
// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { validateCall, validateNewCall, validateSettings } from '../validate';
import { defaultSettings } from '../defaults';
import { StudioError } from '@/lib/studio/server';
import type { Call } from '../types';

const bad = (fn: () => unknown) => { try { fn(); return 'ok'; } catch (e) { return e instanceof StudioError ? e.status : String(e); } };
const call = (over: Record<string, unknown> = {}): Call => ({
  version: 1, id: '2026-10-19-kanto-ab12', client: 'Juan', company: '', date: '2026-10-19', currency: 'PHP', types: ['bot'],
  answers: { 'bot-commands': ['few'], 'webtool-reports': ['export', 'charts'] }, notes: { problem: 'x' }, words: '', scope: { 'bot-tickets': 'later' },
  nextSteps: '', upkeep: false, status: 'open', realHours: null, recapEdits: {}, ...over,
} as Call);

describe('validateSettings', () => {
  it('accepts the defaults and a set rate', () => {
    const s = defaultSettings();
    s.rates.PHP = 1500;
    expect(validateSettings(JSON.parse(JSON.stringify(s)))).toEqual(s);
  });
  it('refuses bad numbers, unknown answer keys and extra fields', () => {
    const s = () => JSON.parse(JSON.stringify(defaultSettings()));
    expect(bad(() => validateSettings({ ...s(), rates: { PHP: -1, USD: null } }))).toBe(400);
    expect(bad(() => validateSettings({ ...s(), base: { low: 10, high: 5 } }))).toBe(400);
    expect(bad(() => validateSettings({ ...s(), rushMultiplier: 9 }))).toBe(400);
    expect(bad(() => validateSettings({ ...s(), answers: { 'nope:x': { low: 1, high: 2 } } }))).toBe(400);
    expect(bad(() => validateSettings({ ...s(), answers: { 'bot-tickets:yes': { low: 1, high: 2, extra: 1 } } }))).toBe(400);
    expect(bad(() => validateSettings({ ...s(), answers: JSON.parse('{"__proto__": {"low": 1}}') }))).toBe(400);
    expect(bad(() => validateSettings({ ...s(), surprise: true }))).toBe(400);
    expect(bad(() => validateSettings('nope'))).toBe(400);
  });
});

describe('validateCall', () => {
  it('accepts a good call', () => expect(validateCall(JSON.parse(JSON.stringify(call())))).toEqual(call()));
  it('refuses bad ids, types, answers and scope', () => {
    expect(bad(() => validateCall(call({ id: '../etc' })))).toBe(400);
    expect(bad(() => validateCall(call({ types: [] })))).toBe(400);
    expect(bad(() => validateCall(call({ types: ['bot', 'bot'] })))).toBe(400);
    expect(bad(() => validateCall(call({ currency: 'EUR' })))).toBe(400);
    expect(bad(() => validateCall(call({ answers: { nope: ['x'] } })))).toBe(400);
    expect(bad(() => validateCall(call({ answers: { 'bot-commands': ['nope'] } })))).toBe(400);
    expect(bad(() => validateCall(call({ answers: { 'bot-commands': ['few', 'some'] } })))).toBe(400); // single choice
    expect(bad(() => validateCall(call({ scope: { 'bot-commands': 'later' } })))).toBe(400); // not a feature question
    expect(bad(() => validateCall(call({ notes: { nowhere: 'x' } })))).toBe(400);
    expect(bad(() => validateCall(call({ status: 'maybe' })))).toBe(400);
    expect(bad(() => validateCall(call({ realHours: -2 })))).toBe(400);
    expect(bad(() => validateCall(call({ words: 'x'.repeat(5001) })))).toBe(400);
    expect(bad(() => validateCall(call({ date: '19/10/2026' })))).toBe(400);
  });
});

describe('validateNewCall', () => {
  it('trims and checks the start fields', () => {
    expect(validateNewCall({ client: ' Juan ', company: 'Kanto', currency: 'USD', types: ['bot', 'webtool'] }))
      .toEqual({ client: 'Juan', company: 'Kanto', currency: 'USD', types: ['bot', 'webtool'] });
    expect(bad(() => validateNewCall({ client: '', currency: 'USD', types: ['bot'] }))).toBe(400);
    expect(bad(() => validateNewCall({ client: 'Juan', currency: 'USD', types: [] }))).toBe(400);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/pricing/__tests__/validate.test.ts`
Expected: FAIL, cannot find module `../validate`.

- [ ] **Step 3: Write the validators**

`lib/pricing/validate.ts`:

```ts
// Validation for everything the pricing API writes. Each validator returns a new object holding only known
// fields, and throws StudioError(400) on anything else.
import { StudioError } from '@/lib/studio/server';
import { SECTIONS, answerKey, findQuestion, QUESTIONS } from './questions';
import { CALL_STATUSES, CURRENCIES, WORK_TYPES } from './types';
import type { AnswerPrice, Call, Currency, RecapEdits, SectionId, Settings, WorkType } from './types';

export const CALL_ID_RE = /^\d{4}-\d{2}-\d{2}-[a-z0-9-]{1,40}-[0-9a-f]{4}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const BAD_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const ANSWER_KEYS = new Set(QUESTIONS.flatMap((q) => q.choices.map((c) => answerKey(q.id, c.id))));
const SECTION_IDS = new Set<string>(SECTIONS.map((s) => s.id));

const fail = (msg: string): never => { throw new StudioError(400, msg); };
type Obj = Record<string, unknown>;

function obj(v: unknown, what: string, allowed?: string[]): Obj {
  if (!v || typeof v !== 'object' || Array.isArray(v)) fail(`${what} must be an object`);
  const o = v as Obj;
  for (const k of Object.keys(o)) {
    if (BAD_KEYS.has(k)) fail(`${what} has a forbidden key`);
    if (allowed && !allowed.includes(k)) fail(`${what} has an unknown field: ${k}`);
  }
  return o;
}
function num(v: unknown, what: string, min: number, max: number): number {
  if (typeof v !== 'number' || !Number.isFinite(v) || v < min || v > max) fail(`${what} must be a number from ${min} to ${max}`);
  return v as number;
}
const numOrNull = (v: unknown, what: string, min: number, max: number) => (v === null ? null : num(v, what, min, max));
function str(v: unknown, what: string, max: number, min = 0): string {
  if (typeof v !== 'string' || v.length > max || v.trim().length < min) fail(`${what} must be text of at most ${max} characters`);
  return v as string;
}
function oneOf<T extends string>(v: unknown, list: readonly T[], what: string): T {
  if (!list.includes(v as T)) fail(`${what} must be one of ${list.join(', ')}`);
  return v as T;
}
function types(v: unknown): WorkType[] {
  if (!Array.isArray(v) || !v.length) fail('Pick at least one work type');
  const list = (v as unknown[]).map((t) => oneOf(t, WORK_TYPES, 'Work type'));
  if (new Set(list).size !== list.length) fail('Work types repeat');
  return list;
}
const perCurrency = <T>(v: unknown, what: string, check: (x: unknown, w: string) => T): Record<Currency, T> => {
  const o = obj(v, what, [...CURRENCIES]);
  return { PHP: check(o.PHP, `${what} PHP`), USD: check(o.USD, `${what} USD`) };
};

function answerPrice(v: unknown, key: string): AnswerPrice {
  const o = obj(v, key, ['low', 'high', 'risk', 'rush', 'hosting', 'changeHours', 'estimate']);
  const out: AnswerPrice = {};
  if (o.low !== undefined) out.low = num(o.low, `${key} low`, 0, 1000);
  if (o.high !== undefined) out.high = num(o.high, `${key} high`, 0, 1000);
  if ((out.low ?? 0) > (out.high ?? 0)) fail(`${key} low is above high`);
  if (o.risk !== undefined) out.risk = num(o.risk, `${key} risk`, 0, 100);
  if (o.rush !== undefined) { if (typeof o.rush !== 'boolean') fail(`${key} rush must be true or false`); out.rush = o.rush as boolean; }
  if (o.hosting !== undefined) out.hosting = perCurrency(o.hosting, `${key} hosting`, (x, w) => num(x, w, 0, 1e7));
  if (o.changeHours !== undefined) out.changeHours = num(o.changeHours, `${key} changeHours`, 0, 200);
  if (o.estimate !== undefined) { if (typeof o.estimate !== 'boolean') fail(`${key} estimate must be true or false`); out.estimate = o.estimate as boolean; }
  return out;
}

export function validateSettings(raw: unknown): Settings {
  const o = obj(raw, 'Settings', ['version', 'rates', 'upkeepRates', 'base', 'upkeepBaseHours', 'rushMultiplier', 'rounding', 'answers']);
  if (o.version !== 1) fail('Settings version must be 1');
  const base = obj(o.base, 'Base hours', ['low', 'high']);
  const low = num(base.low, 'Base low', 0, 1000);
  const high = num(base.high, 'Base high', 0, 1000);
  if (low > high) fail('Base low is above high');
  const answersIn = obj(o.answers, 'Answers');
  const answers: Record<string, AnswerPrice> = {};
  for (const [k, v] of Object.entries(answersIn)) {
    if (!ANSWER_KEYS.has(k)) fail(`Unknown answer: ${k}`);
    answers[k] = answerPrice(v, k);
  }
  return {
    version: 1,
    rates: perCurrency(o.rates, 'Rate', (x, w) => numOrNull(x, w, 0.01, 1e7)),
    upkeepRates: perCurrency(o.upkeepRates, 'Upkeep rate', (x, w) => numOrNull(x, w, 0.01, 1e7)),
    base: { low, high },
    upkeepBaseHours: num(o.upkeepBaseHours, 'Upkeep base hours', 0, 200),
    rushMultiplier: num(o.rushMultiplier, 'Rush multiplier', 1, 3),
    rounding: perCurrency(o.rounding, 'Rounding', (x, w) => num(x, w, 1, 1e6)),
    answers,
  };
}

function lines(v: unknown, what: string): string[] {
  if (!Array.isArray(v) || v.length > 50) fail(`${what} must be a list of at most 50 lines`);
  return (v as unknown[]).map((x) => str(x, what, 300));
}

export function validateCall(raw: unknown): Call {
  const o = obj(raw, 'Call', ['version', 'id', 'client', 'company', 'date', 'currency', 'types', 'answers', 'notes', 'words', 'scope', 'nextSteps', 'upkeep', 'status', 'realHours', 'recapEdits']);
  if (o.version !== 1) fail('Call version must be 1');
  if (typeof o.id !== 'string' || !CALL_ID_RE.test(o.id)) fail('Bad call id');
  if (typeof o.date !== 'string' || !DATE_RE.test(o.date)) fail('Date must be YYYY-MM-DD');

  const answers: Record<string, string[]> = {};
  for (const [qid, v] of Object.entries(obj(o.answers, 'Answers'))) {
    const q = findQuestion(qid) ?? fail(`Unknown question: ${qid}`);
    if (!Array.isArray(v)) fail(`${qid} answer must be a list`);
    const ids = (v as unknown[]).map((c) => oneOf(c, q.choices.map((x) => x.id), `${qid} answer`));
    if (new Set(ids).size !== ids.length) fail(`${qid} answer repeats`);
    if (!q.multi && ids.length > 1) fail(`${qid} takes one answer`);
    answers[qid] = ids;
  }

  const notes: Partial<Record<SectionId, string>> = {};
  for (const [k, v] of Object.entries(obj(o.notes, 'Notes'))) {
    if (!SECTION_IDS.has(k)) fail(`Unknown section: ${k}`);
    notes[k as SectionId] = str(v, `${k} notes`, 5000);
  }

  const scope: Record<string, 'included' | 'later'> = {};
  for (const [k, v] of Object.entries(obj(o.scope, 'Scope'))) {
    if (!findQuestion(k)?.feature) fail(`${k} is not a feature question`);
    scope[k] = oneOf(v, ['included', 'later'] as const, `${k} scope`);
  }

  const e = obj(o.recapEdits, 'Recap edits', ['heard', 'build', 'later', 'next']);
  const recapEdits: RecapEdits = {};
  if (e.heard !== undefined) recapEdits.heard = str(e.heard, 'Recap heard', 5000);
  if (e.build !== undefined) recapEdits.build = lines(e.build, 'Recap build');
  if (e.later !== undefined) recapEdits.later = lines(e.later, 'Recap later');
  if (e.next !== undefined) recapEdits.next = str(e.next, 'Recap next', 1000);

  if (typeof o.upkeep !== 'boolean') fail('Upkeep must be true or false');
  return {
    version: 1,
    id: o.id as string,
    client: str(o.client, 'Client', 80, 1),
    company: str(o.company, 'Company', 80),
    date: o.date as string,
    currency: oneOf(o.currency, CURRENCIES, 'Currency'),
    types: types(o.types),
    answers,
    notes,
    words: str(o.words, 'In their words', 5000),
    scope,
    nextSteps: str(o.nextSteps, 'Next steps', 1000),
    upkeep: o.upkeep as boolean,
    status: oneOf(o.status, CALL_STATUSES, 'Status'),
    realHours: numOrNull(o.realHours, 'Real hours', 0, 10000),
    recapEdits,
  };
}

export function validateNewCall(raw: unknown) {
  const o = obj(raw, 'New call', ['client', 'company', 'currency', 'types']);
  return {
    client: str(o.client, 'Client', 80, 1).trim(),
    company: (o.company === undefined ? '' : str(o.company, 'Company', 80)).trim(),
    currency: oneOf(o.currency, CURRENCIES, 'Currency'),
    types: types(o.types),
  };
}
```

Note: `webtool-reports` is answered on a bot-only call in the test fixture. That is allowed on purpose: answers stay saved when a work type is removed, and `estimate` and `buildRecap` ignore questions outside the call's types.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/pricing/__tests__/validate.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/pricing/validate.ts lib/pricing/__tests__/validate.test.ts
git commit -m "feat(pricing): validation"
```

---

### Task 6: Storage in the private pricing folder

**Files:**
- Create: `lib/pricing/store.ts`
- Test: `lib/pricing/__tests__/store.test.ts`

**Interfaces:**
- Consumes: `StudioError` (studio server); validators (Task 5); `defaultSettings` (Task 2); `estimate` (Task 3).
- Produces:
  - `pricingDir(): string`
  - `assertPricingDir(): Promise<string>`: 503 when the folder or its `.git` is missing
  - `readSettings(): Promise<Settings>`: writes the defaults when `settings.json` is missing
  - `writeSettings(raw: unknown): Promise<Settings>`
  - `createCall(raw: unknown, date?: string): Promise<Call>`
  - `readCall(id: unknown): Promise<Call>`: 400 bad id, 404 missing
  - `writeCall(id: unknown, raw: unknown): Promise<Call>`: 400 when the body id differs, 404 missing
  - `listCalls(): Promise<CallSummary[]>`: newest date first; skips files that fail validation and logs them
  - `readBody(req: Request): Promise<unknown>`: 400 on bad JSON

- [ ] **Step 1: Write the failing test**

`lib/pricing/__tests__/store.test.ts`:

```ts
// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createCall, listCalls, readCall, readSettings, writeCall, writeSettings } from '../store';
import { StudioError } from '@/lib/studio/server';

let dir: string;
const status = async (p: Promise<unknown>) => { try { await p; return 200; } catch (e) { return e instanceof StudioError ? e.status : String(e); } };

beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pricing-'));
  await fs.mkdir(path.join(dir, '.git'));
  vi.stubEnv('PRICING_DIR', dir);
});
afterEach(async () => { vi.unstubAllEnvs(); await fs.rm(dir, { recursive: true, force: true }); });

describe('pricing folder', () => {
  it('refuses to work without the folder or its git repo', async () => {
    await fs.rm(path.join(dir, '.git'), { recursive: true });
    expect(await status(readSettings())).toBe(503);
    vi.stubEnv('PRICING_DIR', path.join(dir, 'missing'));
    expect(await status(readSettings())).toBe(503);
  });
});

describe('settings', () => {
  it('writes the defaults on first read, then reads them back', async () => {
    const s = await readSettings();
    expect(s.rates).toEqual({ PHP: null, USD: null });
    const file = JSON.parse(await fs.readFile(path.join(dir, 'settings.json'), 'utf8'));
    expect(file).toEqual(s);
  });
  it('validates before writing', async () => {
    const s = await readSettings();
    expect(await status(writeSettings({ ...s, rushMultiplier: 99 }))).toBe(400);
    const saved = await writeSettings({ ...s, rates: { PHP: 1500, USD: 30 } });
    expect((await readSettings()).rates).toEqual(saved.rates);
  });
});

describe('calls', () => {
  it('creates, reads, writes and lists calls', async () => {
    const c = await createCall({ client: 'Juan Dela Cruz', company: 'Kanto', currency: 'PHP', types: ['bot'] }, '2026-10-19');
    expect(c.id).toMatch(/^2026-10-19-juan-dela-cruz-[0-9a-f]{4}$/);
    expect(c).toMatchObject({ status: 'open', upkeep: false, answers: {}, realHours: null });
    expect(await readCall(c.id)).toEqual(c);

    const updated = await writeCall(c.id, { ...c, answers: { 'bot-commands': ['few'] }, status: 'sent' });
    expect(updated.status).toBe('sent');

    await createCall({ client: 'Older', currency: 'USD', types: ['website'] }, '2026-09-01');
    const list = await listCalls();
    expect(list.map((x) => x.client)).toEqual(['Juan Dela Cruz', 'Older']);
    expect(list[0].hours.low).toBeGreaterThan(0);
    expect(list[0].price).toBeNull(); // no rate yet
  });
  it('refuses bad ids, mismatched ids and missing calls', async () => {
    const c = await createCall({ client: 'Juan', currency: 'PHP', types: ['bot'] }, '2026-10-19');
    expect(await status(readCall('../settings'))).toBe(400);
    expect(await status(readCall('2026-10-19-nobody-0000'))).toBe(404);
    expect(await status(writeCall(c.id, { ...c, id: '2026-10-19-other-0000' }))).toBe(400);
    expect(await status(writeCall('2026-10-19-nobody-0000', { ...c, id: '2026-10-19-nobody-0000' }))).toBe(404);
  });
  it('uses a fallback slug for names with no latin letters', async () => {
    const c = await createCall({ client: '山田', currency: 'PHP', types: ['bot'] }, '2026-10-19');
    expect(c.id).toMatch(/^2026-10-19-client-[0-9a-f]{4}$/);
  });
  it('skips a broken call file when listing', async () => {
    await createCall({ client: 'Good', currency: 'PHP', types: ['bot'] }, '2026-10-19');
    await fs.writeFile(path.join(dir, 'calls', '2026-10-18-bad-0000.json'), '{nope');
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect((await listCalls()).map((x) => x.client)).toEqual(['Good']);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/pricing/__tests__/store.test.ts`
Expected: FAIL, cannot find module `../store`.

- [ ] **Step 3: Write the store**

`lib/pricing/store.ts`:

```ts
// Server side of the pricing tool: settings.json and calls/<id>.json in the private pricing repo
// (PRICING_DIR, default ../aedwon-pricing). Nothing is ever written inside the portfolio repo.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { StudioError } from '@/lib/studio/server';
import { defaultSettings } from './defaults';
import { estimate } from './estimate';
import { CALL_ID_RE, validateCall, validateNewCall, validateSettings } from './validate';
import type { Call, CallSummary, Settings } from './types';

export function pricingDir(): string {
  return process.env.PRICING_DIR ? path.resolve(process.env.PRICING_DIR) : path.resolve(process.cwd(), '..', 'aedwon-pricing');
}

export async function assertPricingDir(): Promise<string> {
  const dir = pricingDir();
  try { await fs.access(path.join(dir, '.git')); } catch {
    throw new StudioError(503, `Pricing folder not found at ${dir}. Clone your private repo there: git clone git@github.com:Aedwon/aedwon-pricing.git "${dir}"`);
  }
  return dir;
}

export async function readBody(req: Request): Promise<unknown> {
  try { return await req.json(); } catch { throw new StudioError(400, 'The request body is not valid JSON'); }
}

async function writeJson(file: string, data: unknown) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2) + '\n');
  await fs.rename(tmp, file);
}
const isMissing = (e: unknown) => (e as NodeJS.ErrnoException).code === 'ENOENT';

export async function readSettings(): Promise<Settings> {
  const file = path.join(await assertPricingDir(), 'settings.json');
  try {
    return validateSettings(JSON.parse(await fs.readFile(file, 'utf8')));
  } catch (e) {
    if (!isMissing(e)) throw e;
    const s = defaultSettings();
    await writeJson(file, s);
    return s;
  }
}

export async function writeSettings(raw: unknown): Promise<Settings> {
  const s = validateSettings(raw);
  await writeJson(path.join(await assertPricingDir(), 'settings.json'), s);
  return s;
}

function assertCallId(id: unknown): string {
  if (typeof id !== 'string' || !CALL_ID_RE.test(id)) throw new StudioError(400, 'Bad call id');
  return id;
}
const callFile = (dir: string, id: string) => path.join(dir, 'calls', id + '.json');

// Local date, not UTC: a call at 7am in Manila belongs to that day.
function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function slug(name: string): string {
  return name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+/, '').slice(0, 40).replace(/-+$/, '') || 'client';
}

export async function createCall(raw: unknown, date = today()): Promise<Call> {
  const start = validateNewCall(raw);
  const dir = await assertPricingDir();
  const call = validateCall({
    version: 1, id: `${date}-${slug(start.client)}-${crypto.randomBytes(2).toString('hex')}`, ...start, date,
    answers: {}, notes: {}, words: '', scope: {}, nextSteps: '', upkeep: false, status: 'open', realHours: null, recapEdits: {},
  });
  await writeJson(callFile(dir, call.id), call);
  return call;
}

export async function readCall(id: unknown): Promise<Call> {
  const cid = assertCallId(id);
  const dir = await assertPricingDir();
  try {
    return validateCall(JSON.parse(await fs.readFile(callFile(dir, cid), 'utf8')));
  } catch (e) {
    if (isMissing(e)) throw new StudioError(404, 'No such call');
    throw e;
  }
}

export async function writeCall(id: unknown, raw: unknown): Promise<Call> {
  const cid = assertCallId(id);
  const call = validateCall(raw);
  if (call.id !== cid) throw new StudioError(400, 'The call id does not match the address');
  const dir = await assertPricingDir();
  try { await fs.access(callFile(dir, cid)); } catch { throw new StudioError(404, 'No such call'); }
  await writeJson(callFile(dir, cid), call);
  return call;
}

export async function listCalls(): Promise<CallSummary[]> {
  const dir = await assertPricingDir();
  const settings = await readSettings();
  let files: string[] = [];
  try { files = await fs.readdir(path.join(dir, 'calls')); } catch (e) { if (!isMissing(e)) throw e; }
  const out: CallSummary[] = [];
  for (const f of files) {
    const id = f.replace(/\.json$/, '');
    if (!f.endsWith('.json') || !CALL_ID_RE.test(id)) continue;
    try {
      const c = validateCall(JSON.parse(await fs.readFile(callFile(dir, id), 'utf8')));
      const e = estimate(settings, c);
      out.push({ id: c.id, client: c.client, company: c.company, date: c.date, currency: c.currency, types: c.types, status: c.status, hours: e.hours, price: e.price, realHours: c.realHours });
    } catch (err) {
      console.error('[pricing] skipped unreadable call file', f, err instanceof Error ? err.message : err);
    }
  }
  return out.sort((a, b) => b.date.localeCompare(a.date) || a.client.localeCompare(b.client));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/pricing/__tests__/store.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/pricing/store.ts lib/pricing/__tests__/store.test.ts
git commit -m "feat(pricing): storage in the private pricing folder"
```

---

### Task 7: Backup (commit and push the pricing repo)

**Files:**
- Modify: `lib/studio/git.ts` (export `git`, add a `cwd` parameter)
- Create: `lib/pricing/backup.ts`
- Test: `lib/pricing/__tests__/backup.test.ts`

**Interfaces:**
- Consumes: `git(args, timeout?, cwd?)`, `gitLock`, `parsePorcelain` from `lib/studio/git.ts`; `assertPricingDir` (Task 6).
- Produces:
  - `interface BackupStatus { branch: string; upstream: boolean; ahead: number; behind: number; changes: number; lastBackup: string | null }`
  - `backupStatus(): Promise<BackupStatus>`
  - `backup(): Promise<{ committed: boolean; sha: string; status: BackupStatus }>`: 409 when behind, on a detached HEAD, or with nothing to back up.

- [ ] **Step 1: Export `git` with a working folder**

In `lib/studio/git.ts`, replace:

```ts
async function git(args: string[], timeout = 20000): Promise<string> {
  try {
    const { stdout } = await run('git', args, {
      cwd: process.cwd(), timeout, maxBuffer: 4 * 1024 * 1024,
```

with:

```ts
export async function git(args: string[], timeout = 20000, cwd = process.cwd()): Promise<string> {
  try {
    const { stdout } = await run('git', args, {
      cwd, timeout, maxBuffer: 4 * 1024 * 1024,
```

Existing callers pass at most two arguments, so they keep working in the portfolio folder.

- [ ] **Step 2: Write the failing test**

`lib/pricing/__tests__/backup.test.ts`:

```ts
// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { execFileSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { backup, backupStatus } from '../backup';
import { StudioError } from '@/lib/studio/server';

let root: string, remote: string, work: string;
const sh = (cwd: string, ...args: string[]) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
const status = async (p: Promise<unknown>) => { try { await p; return 200; } catch (e) { return e instanceof StudioError ? e.status : String(e); } };

beforeEach(async () => {
  root = await fs.mkdtemp(path.join(os.tmpdir(), 'pricing-git-'));
  remote = path.join(root, 'remote.git');
  work = path.join(root, 'work');
  for (const [k, v] of Object.entries({ GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' })) vi.stubEnv(k, v);
  sh(root, 'init', '--bare', '-b', 'main', remote);
  sh(root, 'clone', remote, work);
  sh(work, 'symbolic-ref', 'HEAD', 'refs/heads/main'); // an empty clone's branch name depends on git config
  await fs.writeFile(path.join(work, 'README.md'), 'x\n');
  sh(work, 'add', '-A'); sh(work, 'commit', '-m', 'init'); sh(work, 'push', '-u', 'origin', 'HEAD');
  vi.stubEnv('PRICING_DIR', work);
});
afterEach(async () => { vi.unstubAllEnvs(); await fs.rm(root, { recursive: true, force: true }); });

describe('backup', () => {
  it('commits every change in the pricing folder and pushes it', async () => {
    await fs.writeFile(path.join(work, 'settings.json'), '{}\n');
    expect((await backupStatus()).changes).toBe(1);
    const r = await backup();
    expect(r.committed).toBe(true);
    expect(r.status.changes).toBe(0);
    expect(sh(remote, 'log', '-1', '--format=%s')).toMatch(/^backup: \d{4}-\d{2}-\d{2}T/);
    expect(r.status.lastBackup).not.toBeNull();
  });
  it('refuses when there is nothing to back up', async () => {
    expect(await status(backup())).toBe(409);
  });
  it('refuses when the branch is behind origin', async () => {
    const other = path.join(root, 'other');
    sh(root, 'clone', remote, other);
    await fs.writeFile(path.join(other, 'b.txt'), 'b\n');
    sh(other, 'add', '-A'); sh(other, 'commit', '-m', 'b'); sh(other, 'push');
    await fs.writeFile(path.join(work, 'a.txt'), 'a\n');
    expect(await status(backup())).toBe(409);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run lib/pricing/__tests__/backup.test.ts`
Expected: FAIL, cannot find module `../backup`.

- [ ] **Step 4: Write the backup module**

`lib/pricing/backup.ts`:

```ts
// Backup for the private pricing repo: commit everything in it and push. Uses the studio's git runner
// (no shell, fixed arguments) with the pricing folder as the working folder.
import { StudioError } from '@/lib/studio/server';
import { git, parsePorcelain } from '@/lib/studio/git';
import { assertPricingDir } from './store';

export interface BackupStatus { branch: string; upstream: boolean; ahead: number; behind: number; changes: number; lastBackup: string | null }

const quiet = async (args: string[], cwd: string) => { try { return (await git(args, 20000, cwd)).trim(); } catch { return ''; } };

async function statusIn(cwd: string): Promise<BackupStatus> {
  const branch = (await quiet(['rev-parse', '--abbrev-ref', 'HEAD'], cwd)) || 'HEAD';
  const upstream = !!(await quiet(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], cwd));
  let ahead = 0, behind = 0;
  if (upstream) {
    const [b, a] = (await quiet(['rev-list', '--left-right', '--count', '@{u}...HEAD'], cwd)).split(/\s+/).map(Number);
    behind = b || 0; ahead = a || 0;
  }
  const changes = parsePorcelain(await git(['status', '--porcelain=v1', '-z', '--untracked-files=all'], 20000, cwd)).length;
  const lastBackup = (await quiet(['log', '-1', '--format=%cI'], cwd)) || null;
  return { branch, upstream, ahead, behind, changes, lastBackup };
}

export async function backupStatus(): Promise<BackupStatus> {
  return statusIn(await assertPricingDir());
}

export async function backup(): Promise<{ committed: boolean; sha: string; status: BackupStatus }> {
  const cwd = await assertPricingDir();
  await quiet(['fetch', '--quiet'], cwd); // to see whether another machine pushed first
  const before = await statusIn(cwd);
  if (before.branch === 'HEAD') throw new StudioError(409, 'The pricing repo is on a detached HEAD. Switch to a branch first.');
  if (before.behind > 0) throw new StudioError(409, `The pricing repo is ${before.behind} commit${before.behind === 1 ? '' : 's'} behind origin. Run git pull in it first.`);
  if (!before.changes && !before.ahead) throw new StudioError(409, 'Nothing to back up.');
  let committed = false;
  if (before.changes) {
    await git(['add', '-A'], 20000, cwd);
    await git(['commit', '-m', `backup: ${new Date().toISOString()}`], 60000, cwd);
    committed = true;
  }
  await git(before.upstream ? ['push'] : ['push', '-u', 'origin', before.branch], 90000, cwd);
  const sha = await quiet(['rev-parse', '--short', 'HEAD'], cwd);
  return { committed, sha, status: await statusIn(cwd) };
}
```

- [ ] **Step 5: Run the backup and studio tests**

Run: `npx vitest run lib/pricing/__tests__/backup.test.ts lib/studio`
Expected: PASS (the studio tests confirm the `git` change broke nothing).

- [ ] **Step 6: Commit**

```bash
git add lib/studio/git.ts lib/pricing/backup.ts lib/pricing/__tests__/backup.test.ts
git commit -m "feat(pricing): back up the private pricing repo"
```

---

### Task 8: API routes

**Files:**
- Create: `app/api/pricing/settings/route.ts`
- Create: `app/api/pricing/calls/route.ts`
- Create: `app/api/pricing/calls/[id]/route.ts`
- Create: `app/api/pricing/backup/route.ts`
- Test: `lib/pricing/__tests__/routes.test.ts`

**Interfaces:**
- Consumes: `guard`, `respond`, `fail` (studio server); store (Task 6); backup (Task 7); `gitLock` (studio git).
- Produces (all JSON, `{ ok: true, ... }` or `{ ok: false, error }`; every request needs the `x-studio: 1` header):
  - `GET /api/pricing/settings` → `{ settings }`; `PUT` body `Settings` → `{ settings }`
  - `GET /api/pricing/calls` → `{ calls: CallSummary[] }`; `POST` body `{ client, company?, currency, types }` → `{ call }` with status 201
  - `GET /api/pricing/calls/:id` → `{ call }`; `PUT` body `Call` → `{ call }`
  - `GET /api/pricing/backup` → `{ status: BackupStatus }`; `POST` → `{ committed, sha, status }`

- [ ] **Step 1: Write the failing test**

`lib/pricing/__tests__/routes.test.ts`:

```ts
// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import * as settingsRoute from '@/app/api/pricing/settings/route';
import * as callsRoute from '@/app/api/pricing/calls/route';
import * as callRoute from '@/app/api/pricing/calls/[id]/route';

let dir: string;
const H = { 'x-studio': '1', origin: 'http://localhost:3000', 'content-type': 'application/json' };
const req = (url: string, method = 'GET', body?: unknown, headers: Record<string, string> = H) =>
  new Request('http://localhost:3000' + url, { method, headers, body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body) });
const params = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pricing-api-'));
  await fs.mkdir(path.join(dir, '.git'));
  vi.stubEnv('PRICING_DIR', dir);
  vi.stubEnv('STUDIO_LOCAL', '1');
});
afterEach(async () => { vi.unstubAllEnvs(); await fs.rm(dir, { recursive: true, force: true }); });

describe('pricing API', () => {
  it('refuses requests without the studio guard passing', async () => {
    expect((await settingsRoute.GET(req('/api/pricing/settings', 'GET', undefined, {}))).status).toBe(403);
    vi.stubEnv('NODE_ENV', 'production');
    expect((await settingsRoute.GET(req('/api/pricing/settings'))).status).toBe(404);
  });
  it('reads and writes settings', async () => {
    const { settings } = await (await settingsRoute.GET(req('/api/pricing/settings'))).json();
    const put = await settingsRoute.PUT(req('/api/pricing/settings', 'PUT', { ...settings, rates: { PHP: 1500, USD: 30 } }));
    expect(put.status).toBe(200);
    expect((await put.json()).settings.rates.PHP).toBe(1500);
    expect((await settingsRoute.PUT(req('/api/pricing/settings', 'PUT', '{nope'))).status).toBe(400);
  });
  it('creates, reads, updates and lists calls', async () => {
    const created = await callsRoute.POST(req('/api/pricing/calls', 'POST', { client: 'Juan', currency: 'PHP', types: ['bot'] }));
    expect(created.status).toBe(201);
    const { call } = await created.json();
    const got = await (await callRoute.GET(req(`/api/pricing/calls/${call.id}`), params(call.id))).json();
    expect(got.call).toEqual(call);
    const put = await callRoute.PUT(req(`/api/pricing/calls/${call.id}`, 'PUT', { ...call, status: 'won', realHours: 40 }), params(call.id));
    expect((await put.json()).call.status).toBe('won');
    const { calls } = await (await callsRoute.GET(req('/api/pricing/calls'))).json();
    expect(calls).toHaveLength(1);
    expect((await callRoute.GET(req('/api/pricing/calls/x'), params('../x'))).status).toBe(400);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/pricing/__tests__/routes.test.ts`
Expected: FAIL, cannot find the route modules.

- [ ] **Step 3: Write the routes**

`app/api/pricing/settings/route.ts`:

```ts
// Pricing tool: read and save settings.json in the private pricing repo. Dev server on localhost only.
import { fail, guard, respond } from '@/lib/studio/server';
import { readBody, readSettings, writeSettings } from '@/lib/pricing/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    guard(req);
    return respond({ ok: true, settings: await readSettings() });
  } catch (e) { return fail(e); }
}

export async function PUT(req: Request) {
  try {
    guard(req);
    return respond({ ok: true, settings: await writeSettings(await readBody(req)) });
  } catch (e) { return fail(e); }
}
```

`app/api/pricing/calls/route.ts`:

```ts
// Pricing tool: list calls and start a new one. Dev server on localhost only.
import { fail, guard, respond } from '@/lib/studio/server';
import { createCall, listCalls, readBody } from '@/lib/pricing/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    guard(req);
    return respond({ ok: true, calls: await listCalls() });
  } catch (e) { return fail(e); }
}

export async function POST(req: Request) {
  try {
    guard(req);
    return respond({ ok: true, call: await createCall(await readBody(req)) }, 201);
  } catch (e) { return fail(e); }
}
```

`app/api/pricing/calls/[id]/route.ts`:

```ts
// Pricing tool: read and save one call. Dev server on localhost only.
import { fail, guard, respond } from '@/lib/studio/server';
import { readBody, readCall, writeCall } from '@/lib/pricing/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Ctx) {
  try {
    guard(req);
    return respond({ ok: true, call: await readCall((await params).id) });
  } catch (e) { return fail(e); }
}

export async function PUT(req: Request, { params }: Ctx) {
  try {
    guard(req);
    return respond({ ok: true, call: await writeCall((await params).id, await readBody(req)) });
  } catch (e) { return fail(e); }
}
```

`app/api/pricing/backup/route.ts`:

```ts
// Pricing tool: show backup status, and commit and push the private pricing repo. Dev server on localhost only.
import { fail, guard, respond } from '@/lib/studio/server';
import { gitLock } from '@/lib/studio/git';
import { backup, backupStatus } from '@/lib/pricing/backup';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    guard(req);
    return respond({ ok: true, status: await gitLock(backupStatus) });
  } catch (e) { return fail(e); }
}

export async function POST(req: Request) {
  try {
    guard(req);
    return respond({ ok: true, ...(await gitLock(backup)) });
  } catch (e) { return fail(e); }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/pricing/__tests__/routes.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/api/pricing lib/pricing/__tests__/routes.test.ts
git commit -m "feat(pricing): local API routes"
```

---

### Task 9: Docs, full checks and smoke test

**Files:**
- Create: `docs/pricing.md`
- Modify: `CLAUDE.md` (one pointer line under "Project Content and the Local Studio")

- [ ] **Step 1: Write `docs/pricing.md`**

```markdown
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
```

- [ ] **Step 2: Add the pointer to `CLAUDE.md`**

Under "Project Content and the Local Studio", after the `docs/studio.md` line, add:

```markdown
- The private pricing tool keeps its data in a separate private repo (`../aedwon-pricing`). Never commit rates, hours from settings, or client data to this public repo. See [`docs/pricing.md`](docs/pricing.md).
```

- [ ] **Step 3: Run the full checks (Haiku subagent)**

Run: `npx vitest run && npx tsc --noEmit && npm run lint`
Expected: all pass. Report failures with exact errors.

- [ ] **Step 4: Smoke test against the real pricing folder**

With Task 0 done, start the dev server (preview_start, or `npm run dev`), then:

```bash
curl -s -H 'x-studio: 1' http://localhost:3000/api/pricing/settings | head -c 200
curl -s -H 'x-studio: 1' -H 'content-type: application/json' -X POST -d '{"client":"Smoke test","currency":"PHP","types":["bot"]}' http://localhost:3000/api/pricing/calls
curl -s -H 'x-studio: 1' http://localhost:3000/api/pricing/backup
```

Expected: settings JSON with `"PHP":null` rates; a new call with status 201; a backup status showing the new files as changes. Delete the smoke-test call file from `../aedwon-pricing/calls/` afterwards, and do not back it up.

- [ ] **Step 5: Commit**

```bash
git add docs/pricing.md CLAUDE.md
git commit -m "docs: pricing tool setup and rules"
```

---

## Next: screens (separate plan)

The four screens (Calls, Call, Settings, Recap) and the `/pricing` page that returns 404 in production are not in this plan. They follow a design round in Claude Design, where Aerol picks the visual direction for layout B and recap style A. The screens plan is written after that pick and must reproduce the chosen design one to one.
