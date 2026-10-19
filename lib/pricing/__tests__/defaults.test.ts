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
