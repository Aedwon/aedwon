// @vitest-environment node
import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  arrayAt, guard, parsePath, removeKey, saveImage, setPath, StudioError, validateProject, CONTENT_DIR,
} from '../server';

const req = (url: string, headers: Record<string, string> = {}) => new Request(url, { method: 'POST', headers });
const status = (fn: () => unknown) => { try { fn(); return 200; } catch (e) { return e instanceof StudioError ? e.status : -1; } };

// the studio is on only when the site was started by `npm run dev` (STUDIO_LOCAL=1, loopback-only)
beforeEach(() => vi.stubEnv('STUDIO_LOCAL', '1'));
afterEach(() => vi.unstubAllEnvs());

describe('guard', () => {
  it('allows the dev server on localhost with the studio header', () => {
    expect(status(() => guard(req('http://localhost:3000/api/studio/save', { 'x-studio': '1', origin: 'http://localhost:3000' })))).toBe(200);
    expect(status(() => guard(req('http://127.0.0.1:3000/api/studio/save', { 'x-studio': '1' })))).toBe(200);
  });
  it('refuses production, other hosts, foreign origins and a missing header', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(status(() => guard(req('http://localhost:3000/x', { 'x-studio': '1' })))).toBe(404);
    vi.unstubAllEnvs();
    vi.stubEnv('STUDIO_LOCAL', '1');
    expect(status(() => guard(req('http://192.168.1.5:3000/x', { 'x-studio': '1' })))).toBe(403);
    expect(status(() => guard(req('https://aedwon.com/x', { 'x-studio': '1' })))).toBe(403);
    expect(status(() => guard(req('http://localhost:3000/x', { 'x-studio': '1', origin: 'https://evil.example' })))).toBe(403);
    expect(status(() => guard(req('http://localhost:3000/x')))).toBe(403);
  });
});

describe('guard without the loopback-only start', () => {
  it('stays off when the site was not started by npm run dev, even for a localhost request', () => {
    vi.stubEnv('STUDIO_LOCAL', '');
    expect(status(() => guard(req('http://localhost:3000/api/studio/save', { 'x-studio': '1', origin: 'http://localhost:3000' })))).toBe(403);
  });
});

describe('paths', () => {
  it('accepts plain field paths and list indexes', () => {
    expect(parsePath('sections.2.p.0')).toEqual(['sections', '2', 'p', '0']);
    expect(parsePath('hero.alt')).toEqual(['hero', 'alt']);
  });
  it('rejects prototype keys, odd characters, the id and long paths', () => {
    for (const bad of ['__proto__.x', 'a.constructor', 'a.prototype.b', 'a..b', 'a/b', '../x', 'id', '', 'a.b.c.d.e.f.g.h.i']) {
      expect(status(() => parsePath(bad)), bad).toBe(400);
    }
  });
  it('sets, creates and removes values', () => {
    const doc: Record<string, unknown> = { sections: [{ p: ['a'] }] };
    setPath(doc, ['sections', '0', 'p', '1'], 'b');
    setPath(doc, ['sections', '0', 'img'], { src: '/projects/x/y.webp' });
    expect(doc).toEqual({ sections: [{ p: ['a', 'b'], img: { src: '/projects/x/y.webp' } }] });
    removeKey(doc, ['sections', '0', 'img']);
    expect((doc.sections as { img?: unknown }[])[0].img).toBeUndefined();
    expect(status(() => setPath(doc, ['sections', '0', 'p', '9'], 'x'))).toBe(400);
  });
  it('starts a missing list only when asked', () => {
    const doc: Record<string, unknown> = {};
    expect(status(() => arrayAt(doc, ['sections']))).toBe(400);
    expect(arrayAt(doc, ['sections'], true)).toEqual([]);
    expect(doc.sections).toEqual([]);
  });
});

describe('validateProject', () => {
  const base = { id: 'x', name: 'N', type: 'T', media: 'web', depth: 'note', desc: 'D', stack: [], links: [], facts: [] };
  it('accepts a minimal project and an image inside its own folder', () => {
    expect(validateProject(base, 'x')).toEqual([]);
    expect(validateProject({ ...base, hero: { src: '/projects/x/hero-1.webp', alt: '' }, shots: [null, { src: '/projects/x/s.webp' }] }, 'x')).toEqual([]);
  });
  it('rejects wrong types, a changed id and images outside the project folder', () => {
    expect(validateProject({ ...base, name: 4 }, 'x').join()).toMatch(/name must be text/);
    expect(validateProject({ ...base, id: 'y' }, 'x').join()).toMatch(/id must stay/);
    expect(validateProject({ ...base, hero: { src: '/etc/passwd' } }, 'x').join()).toMatch(/hero\.src/);
    expect(validateProject({ ...base, hero: { src: '/projects/x/../y/a.webp' } }, 'x').join()).toMatch(/hero\.src/);
    expect(validateProject({ ...base, sections: [{ kind: 'text', p: 'not a list' }] }, 'x').join()).toMatch(/sections\.0\.p/);
  });
});

describe('content files', () => {
  it('every project file is valid and named after its id', async () => {
    const files = (await fs.readdir(CONTENT_DIR)).filter((f) => f.endsWith('.json'));
    expect(files.length).toBeGreaterThan(0);
    for (const f of files) {
      const id = f.replace(/\.json$/, '');
      const doc = JSON.parse(await fs.readFile(path.join(CONTENT_DIR, f), 'utf8'));
      expect(validateProject(doc, id), f).toEqual([]);
    }
  });
  it('the index lists every project file exactly once', async () => {
    const files = (await fs.readdir(CONTENT_DIR)).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, '')).sort();
    const idx = await fs.readFile(path.join(CONTENT_DIR, 'index.ts'), 'utf8');
    const listed = [...idx.matchAll(/from '\.\/([^']+)\.json'/g)].map((m) => m[1]).sort();
    expect(listed).toEqual(files);
  });
});

describe('saveImage', () => {
  it('refuses a file that is not an image, whatever it is called', async () => {
    const e = await saveImage('x', 'hero', Buffer.from('definitely not an image at all')).catch((err) => err);
    expect(e).toBeInstanceOf(StudioError);
    expect(e.status).toBe(415);
  });
  it('refuses a file over 12 MB', async () => {
    const e = await saveImage('x', 'hero', Buffer.alloc(13 * 1024 * 1024)).catch((err) => err);
    expect(e.status).toBe(413);
  });
});
