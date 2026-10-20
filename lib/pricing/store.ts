// Server side of the pricing tool: settings.json and calls/<id>.json in the private pricing repo
// (PRICING_DIR, default ../aedwon-pricing). Nothing is ever written inside the portfolio repo.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { StudioError } from '@/lib/studio/server';
import { defaultSettings } from './defaults';
import { estimate } from './estimate';
import { CALL_ID_RE, validateCall, validateNewCall, validateSettings } from './validate';
import type { Call, CallSummary, Settings } from './types';

export function pricingDir(): string {
  return process.env.PRICING_DIR ? path.resolve(process.env.PRICING_DIR) : path.resolve(process.cwd(), '..', 'aedwon-pricing');
}

export async function assertPricingDir(): Promise<string> {
  const dir = pricingDir();
  try { await fs.access(path.join(dir, '.git')); } catch {
    throw new StudioError(503, `Pricing folder not found at ${dir}. Clone your private repo there: git clone git@github.com:Aedwon/aedwon-pricing.git "${dir}"`);
  }
  return dir;
}

export async function readBody(req: Request): Promise<unknown> {
  try { return await req.json(); } catch { throw new StudioError(400, 'The request body is not valid JSON'); }
}

async function writeJson(file: string, data: unknown) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2) + '\n');
  await fs.rename(tmp, file);
}
const isMissing = (e: unknown) => (e as NodeJS.ErrnoException).code === 'ENOENT';

export async function readSettings(): Promise<Settings> {
  const file = path.join(await assertPricingDir(), 'settings.json');
  try {
    return validateSettings(JSON.parse(await fs.readFile(file, 'utf8')));
  } catch (e) {
    if (!isMissing(e)) throw e;
    const s = defaultSettings();
    await writeJson(file, s);
    return s;
  }
}

export async function writeSettings(raw: unknown): Promise<Settings> {
  const s = validateSettings(raw);
  await writeJson(path.join(await assertPricingDir(), 'settings.json'), s);
  return s;
}

function assertCallId(id: unknown): string {
  if (typeof id !== 'string' || !CALL_ID_RE.test(id)) throw new StudioError(400, 'Bad call id');
  return id;
}
const callFile = (dir: string, id: string) => path.join(dir, 'calls', id + '.json');

// Local date, not UTC: a call at 7am in Manila belongs to that day.
function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function slug(name: string): string {
  return name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+/, '').slice(0, 40).replace(/-+$/, '') || 'client';
}

export async function createCall(raw: unknown, date = today()): Promise<Call> {
  const start = validateNewCall(raw);
  const dir = await assertPricingDir();
  const call = validateCall({
    version: 1, id: `${date}-${slug(start.client)}-${crypto.randomBytes(2).toString('hex')}`, ...start, date,
    answers: {}, notes: {}, words: '', scope: {}, nextSteps: '', upkeep: false, status: 'open', realHours: null, recapEdits: {},
  });
  await writeJson(callFile(dir, call.id), call);
  return call;
}

export async function readCall(id: unknown): Promise<Call> {
  const cid = assertCallId(id);
  const dir = await assertPricingDir();
  try {
    return validateCall(JSON.parse(await fs.readFile(callFile(dir, cid), 'utf8')));
  } catch (e) {
    if (isMissing(e)) throw new StudioError(404, 'No such call');
    throw e;
  }
}

export async function writeCall(id: unknown, raw: unknown): Promise<Call> {
  const cid = assertCallId(id);
  const call = validateCall(raw);
  if (call.id !== cid) throw new StudioError(400, 'The call id does not match the address');
  const dir = await assertPricingDir();
  try { await fs.access(callFile(dir, cid)); } catch { throw new StudioError(404, 'No such call'); }
  await writeJson(callFile(dir, cid), call);
  return call;
}

export async function listCalls(): Promise<CallSummary[]> {
  const dir = await assertPricingDir();
  const settings = await readSettings();
  let files: string[] = [];
  try { files = await fs.readdir(path.join(dir, 'calls')); } catch (e) { if (!isMissing(e)) throw e; }
  const out: CallSummary[] = [];
  for (const f of files) {
    const id = f.replace(/\.json$/, '');
    if (!f.endsWith('.json') || !CALL_ID_RE.test(id)) continue;
    try {
      const c = validateCall(JSON.parse(await fs.readFile(callFile(dir, id), 'utf8')));
      const e = estimate(settings, c);
      out.push({ id: c.id, client: c.client, company: c.company, date: c.date, currency: c.currency, types: c.types, status: c.status, hours: e.hours, price: e.price, realHours: c.realHours });
    } catch (err) {
      console.error('[pricing] skipped unreadable call file', f, err instanceof Error ? err.message : err);
    }
  }
  return out.sort((a, b) => b.date.localeCompare(a.date) || a.client.localeCompare(b.client));
}
