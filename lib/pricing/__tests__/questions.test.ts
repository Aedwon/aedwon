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
