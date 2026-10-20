// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createCall, listCalls, readCall, readSettings, writeCall, writeSettings } from '../store';
import { StudioError } from '@/lib/studio/server';

let dir: string;
const status = async (p: Promise<unknown>) => { try { await p; return 200; } catch (e) { return e instanceof StudioError ? e.status : String(e); } };

beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pricing-'));
  await fs.mkdir(path.join(dir, '.git'));
  vi.stubEnv('PRICING_DIR', dir);
});
afterEach(async () => { vi.unstubAllEnvs(); await fs.rm(dir, { recursive: true, force: true }); });

describe('pricing folder', () => {
  it('refuses to work without the folder or its git repo', async () => {
    await fs.rm(path.join(dir, '.git'), { recursive: true });
    expect(await status(readSettings())).toBe(503);
    vi.stubEnv('PRICING_DIR', path.join(dir, 'missing'));
    expect(await status(readSettings())).toBe(503);
  });
});

describe('settings', () => {
  it('writes the defaults on first read, then reads them back', async () => {
    const s = await readSettings();
    expect(s.rates).toEqual({ PHP: null, USD: null });
    const file = JSON.parse(await fs.readFile(path.join(dir, 'settings.json'), 'utf8'));
    expect(file).toEqual(s);
  });
  it('validates before writing', async () => {
    const s = await readSettings();
    expect(await status(writeSettings({ ...s, rushMultiplier: 99 }))).toBe(400);
    const saved = await writeSettings({ ...s, rates: { PHP: 1500, USD: 30 } });
    expect((await readSettings()).rates).toEqual(saved.rates);
  });
});

describe('calls', () => {
  it('creates, reads, writes and lists calls', async () => {
    const c = await createCall({ client: 'Juan Dela Cruz', company: 'Kanto', currency: 'PHP', types: ['bot'] }, '2026-10-19');
    expect(c.id).toMatch(/^2026-10-19-juan-dela-cruz-[0-9a-f]{4}$/);
    expect(c).toMatchObject({ status: 'open', upkeep: false, answers: {}, realHours: null });
    expect(await readCall(c.id)).toEqual(c);

    const updated = await writeCall(c.id, { ...c, answers: { 'bot-commands': ['few'] }, status: 'sent' });
    expect(updated.status).toBe('sent');

    await createCall({ client: 'Older', currency: 'USD', types: ['website'] }, '2026-09-01');
    const list = await listCalls();
    expect(list.map((x) => x.client)).toEqual(['Juan Dela Cruz', 'Older']);
    expect(list[0].hours.low).toBeGreaterThan(0);
    expect(list[0].price).toBeNull(); // no rate yet
  });
  it('refuses bad ids, mismatched ids and missing calls', async () => {
    const c = await createCall({ client: 'Juan', currency: 'PHP', types: ['bot'] }, '2026-10-19');
    expect(await status(readCall('../settings'))).toBe(400);
    expect(await status(readCall('2026-10-19-nobody-0000'))).toBe(404);
    expect(await status(writeCall(c.id, { ...c, id: '2026-10-19-other-0000' }))).toBe(400);
    expect(await status(writeCall('2026-10-19-nobody-0000', { ...c, id: '2026-10-19-nobody-0000' }))).toBe(404);
  });
  it('uses a fallback slug for names with no latin letters', async () => {
    const c = await createCall({ client: '山田', currency: 'PHP', types: ['bot'] }, '2026-10-19');
    expect(c.id).toMatch(/^2026-10-19-client-[0-9a-f]{4}$/);
  });
  it('skips a broken call file when listing', async () => {
    await createCall({ client: 'Good', currency: 'PHP', types: ['bot'] }, '2026-10-19');
    await fs.writeFile(path.join(dir, 'calls', '2026-10-18-bad-0000.json'), '{nope');
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect((await listCalls()).map((x) => x.client)).toEqual(['Good']);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
