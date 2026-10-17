// Local studio: show what would be published, and commit + push the studio's own files.
// Dev server on localhost only (see lib/studio/server.ts).
import { fail, guard, respond } from '@/lib/studio/server';
import { gitLock, publish, publishStatus, validateMessage } from '@/lib/studio/git';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    guard(req);
    return respond({ ok: true, status: await gitLock(publishStatus) });
  } catch (e) { return fail(e); }
}

export async function POST(req: Request) {
  try {
    guard(req);
    const body = (await req.json()) as { message?: unknown };
    const message = validateMessage(body.message);
    return respond({ ok: true, ...(await gitLock(() => publish(message))) });
  } catch (e) { return fail(e); }
}
