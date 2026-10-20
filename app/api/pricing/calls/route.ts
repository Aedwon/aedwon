// Pricing tool: list calls and start a new one. Dev server on localhost only.
import { fail, guard, respond } from '@/lib/studio/server';
import { createCall, listCalls, readBody } from '@/lib/pricing/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    guard(req);
    return respond({ ok: true, calls: await listCalls() });
  } catch (e) { return fail(e); }
}

export async function POST(req: Request) {
  try {
    guard(req);
    return respond({ ok: true, call: await createCall(await readBody(req)) }, 201);
  } catch (e) { return fail(e); }
}
