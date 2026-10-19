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
