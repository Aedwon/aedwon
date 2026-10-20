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
