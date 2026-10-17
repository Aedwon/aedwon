// Calls to the local studio API (app/api/studio). Each one reports into the store so the bar can show
// Saving / Saved / the error. They throw on failure; callers that fire and forget should .catch(() => {}).
import { setStudio } from './store';

export type Op =
  | { op: 'set'; path: string; value: unknown }
  | { op: 'unset'; path: string }
  | { op: 'insert'; path: string; index: number; value: unknown }
  | { op: 'remove'; path: string; index: number }
  | { op: 'move'; path: string; from: number; to: number }
  | { op: 'put'; project: unknown };

let timer: ReturnType<typeof setTimeout> | undefined;

async function call(url: string, init: RequestInit) {
  setStudio({ status: 'saving', message: '' });
  try {
    const res = await fetch(url, { ...init, headers: { 'x-studio': '1', ...(init.headers || {}) } });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'Save failed');
    setStudio({ status: 'saved' });
    clearTimeout(timer);
    timer = setTimeout(() => setStudio({ status: 'idle' }), 1400);
    return data as { ok: true; project: Record<string, unknown> };
  } catch (e) {
    setStudio({ status: 'error', message: e instanceof Error ? e.message : 'Save failed' });
    throw e;
  }
}

export const saveOp = (id: string, op: Op) =>
  call('/api/studio/save', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, ...op }) });

export function uploadImage(id: string, slot: string, file: File) {
  const form = new FormData();
  form.set('id', id); form.set('slot', slot); form.set('file', file);
  return call('/api/studio/upload', { method: 'POST', body: form });
}

// Asks the server whether the studio is on. Resolves to an empty string when it is, otherwise the reason.
export async function ping(): Promise<string> {
  try {
    const data = await (await fetch('/api/studio/save', { headers: { 'x-studio': '1' } })).json();
    return data.ok ? '' : data.error || 'The studio is off';
  } catch { return 'The studio is off'; }
}

export async function loadProject(id: string): Promise<Record<string, unknown>> {
  const res = await fetch('/api/studio/save?id=' + encodeURIComponent(id), { headers: { 'x-studio': '1' } });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Could not load');
  return data.project;
}
