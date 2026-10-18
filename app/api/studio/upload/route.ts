// Local studio: upload one picture into a project slot (hero, shots.N, sections.N.img).
// Re-encodes to WebP, saves under public/projects/<id>/, and points the project JSON at it.
import { assertProject, assertSlot, fail, isSiteId, guard, parsePath, readProject, respond, saveImage, setPath, StudioError, withLock, writeProject } from '@/lib/studio/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    guard(req);
    const form = await req.formData();
    const id = await assertProject(form.get('id'));
    if (isSiteId(id)) throw new StudioError(400, 'Pictures go on project pages');
    const slot = assertSlot(form.get('slot'));
    const f = form.get('file');
    if (!(f instanceof File)) throw new StudioError(400, 'No file');
    const saved = await saveImage(id, slot, Buffer.from(await f.arrayBuffer()));
    const project = await withLock(id, async () => {
      const doc = await readProject(id);
      const segs = parsePath(slot);
      // keep the alt text and caption of the picture being replaced
      let cur: unknown = doc;
      for (const s of segs) cur = cur && typeof cur === 'object' ? (cur as Record<string, unknown>)[s] : undefined;
      const prev = (cur && typeof cur === 'object' ? cur : {}) as { alt?: string; caption?: string };
      if (segs[0] === 'shots') { // two tiles: keep the empty one as null
        const tiles = Array.isArray(doc.shots) ? (doc.shots as unknown[]) : (doc.shots = []) as unknown[];
        while (tiles.length < Number(segs[1])) tiles.push(null);
      }
      setPath(doc, segs, { src: saved.src, alt: prev.alt ?? '', ...(prev.caption ? { caption: prev.caption } : {}), w: saved.w, h: saved.h });
      await writeProject(id, doc);
      return doc;
    });
    return respond({ ok: true, project, src: saved.src });
  } catch (e) { return fail(e); }
}
