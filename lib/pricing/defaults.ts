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
