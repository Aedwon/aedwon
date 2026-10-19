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
