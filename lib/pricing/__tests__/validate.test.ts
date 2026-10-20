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
