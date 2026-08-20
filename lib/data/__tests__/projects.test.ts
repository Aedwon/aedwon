import { describe, it, expect } from 'vitest';
import { PROJECTS, ProjectItem } from '../projects';

describe('PROJECTS Data Integrity', () => {
  it('should have 12 unique projects with valid slugs and tiers', () => {
    expect(PROJECTS.length).toBe(12);
    const slugs = new Set(PROJECTS.map((p) => p.slug));
    expect(slugs.size).toBe(12);

    PROJECTS.forEach((project: ProjectItem) => {
      expect(['flagship', 'focused']).toContain(project.tier);
      expect(project.problem).toBeTruthy();
      expect(project.architecture.length).toBeGreaterThan(0);
      expect(project.results).toBeTruthy();
    });
  });

  it('should have hurdles defined for flagship tier projects', () => {
    const flagships = PROJECTS.filter((p) => p.tier === 'flagship');
    expect(flagships.length).toBeGreaterThanOrEqual(4);
    flagships.forEach((p) => {
      expect(p.hurdles).toBeDefined();
      expect(p.hurdles!.length).toBeGreaterThan(0);
      p.hurdles!.forEach((h) => {
        expect(h.title).toBeTruthy();
        expect(h.issue).toBeTruthy();
        expect(h.solution).toBeTruthy();
      });
    });
  });

  it('should not contain banned slop buzzwords in copy', () => {
    const bannedWords = [
      'delve',
      'tapestry',
      'testament',
      'seamless',
      'leverage',
      'holistic',
      'cutting-edge',
      'state-of-the-art',
      'spearhead',
      'empower',
      'bespoke',
      'revolutionize',
    ];

    PROJECTS.forEach((p) => {
      const allText = [
        p.tagline,
        p.summary,
        p.problem,
        p.results,
        ...(p.hurdles?.flatMap((h) => [h.title, h.issue, h.solution]) || []),
        ...p.architecture.flatMap((a) => [a.title, a.description, a.tradeOff || '']),
      ].join(' ').toLowerCase();

      bannedWords.forEach((word) => {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        expect(allText).not.toMatch(regex);
      });
    });
  });
});
