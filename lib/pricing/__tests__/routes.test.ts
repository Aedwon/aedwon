// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import * as settingsRoute from '@/app/api/pricing/settings/route';
import * as callsRoute from '@/app/api/pricing/calls/route';
import * as callRoute from '@/app/api/pricing/calls/[id]/route';

let dir: string;
const H = { 'x-studio': '1', origin: 'http://localhost:3000', 'content-type': 'application/json' };
const req = (url: string, method = 'GET', body?: unknown, headers: Record<string, string> = H) =>
  new Request('http://localhost:3000' + url, { method, headers, body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body) });
const params = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pricing-api-'));
  await fs.mkdir(path.join(dir, '.git'));
  vi.stubEnv('PRICING_DIR', dir);
  vi.stubEnv('STUDIO_LOCAL', '1');
});
afterEach(async () => { vi.unstubAllEnvs(); await fs.rm(dir, { recursive: true, force: true }); });

describe('pricing API', () => {
  it('refuses requests without the studio guard passing', async () => {
    expect((await settingsRoute.GET(req('/api/pricing/settings', 'GET', undefined, {}))).status).toBe(403);
    vi.stubEnv('NODE_ENV', 'production');
    expect((await settingsRoute.GET(req('/api/pricing/settings'))).status).toBe(404);
  });
  it('reads and writes settings', async () => {
    const { settings } = await (await settingsRoute.GET(req('/api/pricing/settings'))).json();
    const put = await settingsRoute.PUT(req('/api/pricing/settings', 'PUT', { ...settings, rates: { PHP: 1500, USD: 30 } }));
    expect(put.status).toBe(200);
    expect((await put.json()).settings.rates.PHP).toBe(1500);
    expect((await settingsRoute.PUT(req('/api/pricing/settings', 'PUT', '{nope'))).status).toBe(400);
  });
  it('creates, reads, updates and lists calls', async () => {
    const created = await callsRoute.POST(req('/api/pricing/calls', 'POST', { client: 'Juan', currency: 'PHP', types: ['bot'] }));
    expect(created.status).toBe(201);
    const { call } = await created.json();
    const got = await (await callRoute.GET(req(`/api/pricing/calls/${call.id}`), params(call.id))).json();
    expect(got.call).toEqual(call);
    const put = await callRoute.PUT(req(`/api/pricing/calls/${call.id}`, 'PUT', { ...call, status: 'won', realHours: 40 }), params(call.id));
    expect((await put.json()).call.status).toBe('won');
    const { calls } = await (await callsRoute.GET(req('/api/pricing/calls'))).json();
    expect(calls).toHaveLength(1);
    expect((await callRoute.GET(req('/api/pricing/calls/x'), params('../x'))).status).toBe(400);
  });
});
