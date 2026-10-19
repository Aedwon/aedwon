// Pricing tool: read and save settings.json in the private pricing repo. Dev server on localhost only.
import { fail, guard, respond } from '@/lib/studio/server';
import { readBody, readSettings, writeSettings } from '@/lib/pricing/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    guard(req);
    return respond({ ok: true, settings: await readSettings() });
  } catch (e) { return fail(e); }
}

export async function PUT(req: Request) {
  try {
    guard(req);
    return respond({ ok: true, settings: await writeSettings(await readBody(req)) });
  } catch (e) { return fail(e); }
}
