// Pricing tool: read and save one call. Dev server on localhost only.
import { fail, guard, respond } from '@/lib/studio/server';
import { readBody, readCall, writeCall } from '@/lib/pricing/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Ctx) {
  try {
    guard(req);
    return respond({ ok: true, call: await readCall((await params).id) });
  } catch (e) { return fail(e); }
}

export async function PUT(req: Request, { params }: Ctx) {
  try {
    guard(req);
    return respond({ ok: true, call: await writeCall((await params).id, await readBody(req)) });
  } catch (e) { return fail(e); }
}
