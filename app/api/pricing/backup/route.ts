// Pricing tool: show backup status, and commit and push the private pricing repo. Dev server on localhost only.
import { fail, guard, respond } from '@/lib/studio/server';
import { gitLock } from '@/lib/studio/git';
import { backup, backupStatus } from '@/lib/pricing/backup';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    guard(req);
    return respond({ ok: true, status: await gitLock(backupStatus) });
  } catch (e) { return fail(e); }
}

export async function POST(req: Request) {
  try {
    guard(req);
    return respond({ ok: true, ...(await gitLock(backup)) });
  } catch (e) { return fail(e); }
}
