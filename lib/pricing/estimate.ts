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
