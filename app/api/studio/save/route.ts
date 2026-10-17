// Local studio: read and edit one project's JSON. Dev server on localhost only (see lib/studio/server.ts).
import { arrayAt, assertProject, fail, guard, parsePath, readProject, removeKey, respond, setPath, StudioError, withLock, writeProject } from '@/lib/studio/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    guard(req);
    const id = await assertProject(new URL(req.url).searchParams.get('id'));
    return respond({ ok: true, project: await readProject(id) });
  } catch (e) { return fail(e); }
}

type Op =
  | { op: 'set'; path: string; value: unknown }
  | { op: 'unset'; path: string }
  | { op: 'insert'; path: string; index: number; value: unknown }
  | { op: 'remove'; path: string; index: number }
  | { op: 'move'; path: string; from: number; to: number }
  | { op: 'put'; project: unknown };

export async function POST(req: Request) {
  try {
    guard(req);
    const body = (await req.json()) as { id?: unknown } & Partial<Op>;
    const id = await assertProject(body.id);
    const project = await withLock(id, async () => {
      if (body.op === 'put') {
        await writeProject(id, body.project);
        return body.project;
      }
      const doc = await readProject(id);
      const n = (v: unknown) => { if (!Number.isInteger(v) || (v as number) < 0) throw new StudioError(400, 'Bad index'); return v as number; };
      switch (body.op) {
        case 'set': setPath(doc, parsePath(body.path), body.value); break;
        case 'unset': removeKey(doc, parsePath(body.path)); break;
        case 'insert': {
          const arr = arrayAt(doc, parsePath(body.path), true), i = n(body.index);
          if (i > arr.length) throw new StudioError(400, 'Index out of range');
          arr.splice(i, 0, body.value);
          break;
        }
        case 'remove': {
          const arr = arrayAt(doc, parsePath(body.path)), i = n(body.index);
          if (i >= arr.length) throw new StudioError(400, 'Index out of range');
          arr.splice(i, 1);
          break;
        }
        case 'move': {
          const arr = arrayAt(doc, parsePath(body.path)), a = n(body.from), b = n(body.to);
          if (a >= arr.length || b >= arr.length) throw new StudioError(400, 'Index out of range');
          arr.splice(b, 0, arr.splice(a, 1)[0]);
          break;
        }
        default: throw new StudioError(400, 'Unknown operation');
      }
      await writeProject(id, doc);
      return doc;
    });
    return respond({ ok: true, project });
  } catch (e) { return fail(e); }
}
