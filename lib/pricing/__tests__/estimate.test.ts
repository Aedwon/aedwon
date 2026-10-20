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
