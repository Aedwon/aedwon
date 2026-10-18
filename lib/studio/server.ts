// Server side of the local studio: reads and writes content/projects/<id>.json and saves images
// into public/projects/<id>/. It runs only under `next dev` on localhost (see guard()).
import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const CONTENT_DIR = path.join(process.cwd(), 'content', 'projects');
export const IMAGE_DIR = path.join(process.cwd(), 'public', 'projects');
export const SITE_DIR = path.join(process.cwd(), 'content', 'site');
export const SITE_IMAGE_DIR = path.join(process.cwd(), 'public', 'about');
// The site's own text (loader, nav, 404, About books). A fixed list: nothing else under content/site can be written.
export const SITE_IDS = ['ui', 'about-01', 'about-02', 'about-03', 'about-04', 'about-05', 'about-06'];
export const isSiteId = (id: unknown): id is string => typeof id === 'string' && SITE_IDS.includes(id);

export class StudioError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);
const hostOf = (value: string) => { try { return new URL(value).hostname; } catch { return ''; } };

// Refuse everything unless this is the dev server started loopback-only (`npm run dev` sets STUDIO_LOCAL and
// binds 127.0.0.1), reached as localhost, from a localhost page. The Host and Origin checks stop other
// websites in your browser; they can not stop a peer on your network who forges a Host header, which is why
// the server must not be listening on the network at all (the STUDIO_LOCAL gate). `npm run dev:lan` leaves
// the studio off.
export function guard(req: Request) {
  if (process.env.NODE_ENV === 'production') throw new StudioError(404, 'Not found');
  if (process.env.STUDIO_LOCAL !== '1') throw new StudioError(403, 'The studio is off. Start the site with npm run dev (it listens on 127.0.0.1 only and turns the studio on).');
  if (!LOCAL_HOSTS.has(hostOf(req.url))) throw new StudioError(403, 'The studio only runs on localhost');
  const origin = req.headers.get('origin');
  if (origin && !LOCAL_HOSTS.has(hostOf(origin))) throw new StudioError(403, 'Foreign origin');
  if (req.headers.get('x-studio') !== '1') throw new StudioError(403, 'Missing studio header');
}

export const respond = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

export function fail(e: unknown) {
  if (e instanceof StudioError) return respond({ ok: false, error: e.message }, e.status);
  console.error('[studio]', e);
  return respond({ ok: false, error: 'Unexpected error, see the dev server log' }, 500);
}

// ---------------------------------------------------------------- projects

const ID_RE = /^[a-z0-9][a-z0-9-]{0,40}$/;
const file = (id: string) => path.join(isSiteId(id) ? SITE_DIR : CONTENT_DIR, id + '.json');

export async function assertProject(id: unknown): Promise<string> {
  if (typeof id !== 'string' || !ID_RE.test(id)) throw new StudioError(400, 'Bad project id');
  if (isSiteId(id)) { try { await fs.access(file(id)); } catch { throw new StudioError(404, 'No such file'); } return id; }
  try { await fs.access(file(id)); } catch { throw new StudioError(404, 'No such project'); }
  return id;
}

export async function readProject(id: string): Promise<Record<string, unknown>> {
  return JSON.parse(await fs.readFile(file(id), 'utf8'));
}

// One writer per project at a time, so two quick edits can not overwrite each other.
const chains = new Map<string, Promise<unknown>>();
export function withLock<T>(id: string, fn: () => Promise<T>): Promise<T> {
  const next = (chains.get(id) || Promise.resolve()).then(fn, fn);
  chains.set(id, next.catch(() => undefined));
  return next;
}

export async function writeProject(id: string, project: unknown) {
  const errors = isSiteId(id) ? validateSite(project, id) : validateProject(project, id);
  if (errors.length) throw new StudioError(400, errors.slice(0, 4).join('; '));
  const target = file(id), tmp = target + '.tmp-' + process.pid;
  await fs.writeFile(tmp, JSON.stringify(project, null, 2) + '\n');
  await fs.rename(tmp, target);
}

// ---------------------------------------------------------------- paths

const BAD_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const SEG_RE = /^(?:[A-Za-z_][A-Za-z0-9_]{0,30}|\d{1,3})$/;

export function parsePath(p: unknown): string[] {
  if (typeof p !== 'string' || !p) throw new StudioError(400, 'Bad path');
  const segs = p.split('.');
  if (segs.length > 8 || segs.some((s) => !SEG_RE.test(s) || BAD_KEYS.has(s))) throw new StudioError(400, 'Bad path');
  if (segs[0] === 'id') throw new StudioError(400, 'The id can not be changed');
  return segs;
}

const isIdx = (s: string) => /^\d+$/.test(s);
type Bag = Record<string, unknown> | unknown[];

function walk(root: Bag, segs: string[], create: boolean, tail?: string): Bag {
  let cur: Bag = root;
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i];
    let next = (cur as Record<string, unknown>)[s];
    if (next == null || typeof next !== 'object') {
      if (!create) throw new StudioError(400, 'Nothing at ' + segs.slice(0, i + 1).join('.'));
      if (Array.isArray(cur) && Number(s) > cur.length) throw new StudioError(400, 'Index out of range');
      next = isIdx(segs[i + 1] ?? tail ?? '') ? [] : {}; // the last container is a list when the key being set is a number
      (cur as Record<string, unknown>)[s] = next;
    }
    cur = next as Bag;
  }
  return cur;
}

export function setPath(root: Bag, segs: string[], value: unknown) {
  const parent = walk(root, segs.slice(0, -1), true, segs[segs.length - 1]);
  const last = segs[segs.length - 1];
  if (Array.isArray(parent)) {
    if (!isIdx(last) || Number(last) > parent.length) throw new StudioError(400, 'Index out of range');
  }
  (parent as Record<string, unknown>)[last] = value;
}

export function removeKey(root: Bag, segs: string[]) {
  const parent = walk(root, segs.slice(0, -1), false);
  const last = segs[segs.length - 1];
  if (Array.isArray(parent)) parent.splice(Number(last), 1);
  else delete (parent as Record<string, unknown>)[last];
}

// The list at a path. With create, a missing list (a note with no sections yet) is started empty.
export function arrayAt(root: Bag, segs: string[], create = false): unknown[] {
  const parent = walk(root, segs.slice(0, -1), create);
  const last = segs[segs.length - 1];
  let arr = (parent as Record<string, unknown>)[last];
  if (arr === undefined && create) { arr = []; (parent as Record<string, unknown>)[last] = arr; }
  if (!Array.isArray(arr)) throw new StudioError(400, 'Not a list');
  return arr;
}

// ---------------------------------------------------------------- validation

const isStr = (v: unknown): v is string => typeof v === 'string';
// Link addresses: web, mail, a path on this site, or a # placeholder. Nothing that runs script.
export const HREF_RE = /^(https?:\/\/|mailto:|\/|#)/i;
const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const strList = (v: unknown) => Array.isArray(v) && v.every(isStr);

function imgErrors(v: unknown, id: string, where: string): string[] {
  if (v == null) return [];
  if (!isObj(v)) return [where + ' must be an object'];
  const e: string[] = [];
  if (!isStr(v.src) || !v.src.startsWith('/projects/' + id + '/') || v.src.includes('..')) e.push(where + '.src must be inside /projects/' + id + '/');
  for (const k of ['alt', 'caption']) if (v[k] !== undefined && !isStr(v[k])) e.push(where + '.' + k + ' must be text');
  if (v.focus !== undefined) {
    const f = v.focus as Record<string, unknown>, ok = (n: unknown) => typeof n === 'number' && n >= 0 && n <= 100;
    if (!isObj(f) || !ok(f.x) || !ok(f.y)) e.push(where + '.focus must be {x, y} between 0 and 100');
  }
  if (v.zoom !== undefined && !(typeof v.zoom === 'number' && v.zoom >= 1 && v.zoom <= 4)) e.push(where + '.zoom must be between 1 and 4');
  return e;
}

export function validateProject(p: unknown, id: string): string[] {
  if (!isObj(p)) return ['The project must be an object'];
  const e: string[] = [];
  if (p.id !== id) e.push('id must stay "' + id + '"');
  for (const k of ['name', 'type', 'media', 'depth', 'desc']) if (!isStr(p[k])) e.push(k + ' must be text');
  for (const k of ['stackText', 'repo', 'topic', 'mins', 'date']) if (p[k] !== undefined && !isStr(p[k])) e.push(k + ' must be text');
  if (p.post !== undefined && typeof p.post !== 'boolean') e.push('post must be true or false');
  if (!strList(p.stack)) e.push('stack must be a list of names');
  if (!Array.isArray(p.links) || !p.links.every((l) => isObj(l) && isStr(l.label) && isStr(l.href))) e.push('links must be a list of {label, href}');
  else p.links.forEach((l, i) => { if (!HREF_RE.test((l as { href: string }).href)) e.push('links.' + i + '.href must start with https://, http://, mailto:, / or #'); });
  if (!Array.isArray(p.facts) || !p.facts.every((f) => isObj(f) && isStr(f.k) && isStr(f.v))) e.push('facts must be a list of {k, v}');
  if (p.points !== undefined && (!Array.isArray(p.points) || !p.points.every((x) => isObj(x) && isStr(x.h) && isStr(x.p)))) e.push('points must be a list of {h, p}');
  e.push(...imgErrors(p.hero, id, 'hero'));
  if (p.screens !== undefined) {
    if (!Array.isArray(p.screens) || p.screens.length > 3) e.push('screens must be a list of at most 3 pictures');
    else p.screens.forEach((s, i) => e.push(...imgErrors(s, id, 'screens.' + i)));
  }
  if (p.frame !== undefined && !(isObj(p.frame) && typeof p.frame.h === 'number' && p.frame.h >= 160 && p.frame.h <= 640)) e.push('frame.h must be a number from 160 to 640');
  if (p.shots !== undefined) {
    if (!Array.isArray(p.shots)) e.push('shots must be a list');
    else p.shots.forEach((s, i) => e.push(...imgErrors(s, id, 'shots.' + i)));
  }
  if (p.sections !== undefined) {
    if (!Array.isArray(p.sections)) e.push('sections must be a list');
    else p.sections.forEach((s, i) => {
      if (!isObj(s) || !isStr(s.kind)) { e.push('sections.' + i + ' needs a kind'); return; }
      if (s.h !== undefined && !isStr(s.h)) e.push('sections.' + i + '.h must be text');
      if (s.p !== undefined && !strList(s.p)) e.push('sections.' + i + '.p must be a list of paragraphs');
      e.push(...imgErrors(s.img, id, 'sections.' + i + '.img'));
      if (isObj(s.link) && (!isStr(s.link.href) || !HREF_RE.test(s.link.href))) e.push('sections.' + i + '.link.href must start with https://, http://, mailto:, / or #');
    });
  }
  return e;
}

// The site's text files: plain data only (text, numbers, true/false, lists, objects), nothing that runs.
const LOGO_RE = /^[a-z0-9][a-z0-9-]{0,40}$/;
export function validateSite(d: unknown, id: string): string[] {
  if (!isObj(d)) return ['The file must be an object'];
  const e: string[] = [];
  if (d.id !== id) e.push('id must stay "' + id + '"');
  const deep = (v: unknown, where: string, depth: number) => {
    if (e.length > 4) return;
    if (depth > 8) { e.push(where + ' is nested too deep'); return; }
    if (isStr(v)) { if (v.length > 4000) e.push(where + ' is too long'); return; }
    if (v === null || typeof v === 'number' || typeof v === 'boolean') return;
    if (Array.isArray(v)) { if (v.length > 200) e.push(where + ' has too many items'); v.forEach((x, i) => deep(x, where + '.' + i, depth + 1)); return; }
    if (isObj(v)) { for (const k of Object.keys(v)) { if (BAD_KEYS.has(k)) e.push(where + ' has a bad key'); else deep(v[k], where + '.' + k, depth + 1); } return; }
    e.push(where + ' has an unsupported value');
  };
  deep(d, 'file', 0);
  if (id.startsWith('about-')) {
    if (!isStr(d.title) || !d.title) e.push('title must be text');
    if (!Array.isArray(d.pages) || !d.pages.every((p) => isObj(p) && isStr(p.kind))) e.push('pages must be a list of pages that each have a kind');
    else d.pages.forEach((p, i) => {
      const pg = p as Record<string, unknown>;
      if (pg.img !== undefined && !(isObj(pg.img) && isStr(pg.img.src) && pg.img.src.startsWith('/about/' + id + '/') && !pg.img.src.includes('..') && (pg.img.alt === undefined || isStr(pg.img.alt)))) e.push('pages.' + i + '.img must be a picture saved under /about/' + id + '/');
      if (pg.logo !== undefined && pg.logo !== '' && !(isStr(pg.logo) && LOGO_RE.test(pg.logo))) e.push('pages.' + i + '.logo must be a logo name');
      if (pg.logos !== undefined && !(Array.isArray(pg.logos) && pg.logos.every((l) => isStr(l) && (l === '' || LOGO_RE.test(l))))) e.push('pages.' + i + '.logos must be a list of logo names');
    });
  }
  return e;
}

// The logo files in public/logos, one name per logo (the -light and -dark files are one logo with two looks).
export async function listLogos(): Promise<string[]> {
  const files = await fs.readdir(path.join(process.cwd(), 'public', 'logos'));
  const names = new Set<string>();
  for (const f of files) if (/\.(svg|webp)$/.test(f)) names.add(f.replace(/\.(svg|webp)$/, '').replace(/-(light|dark)$/, ''));
  return [...names].sort();
}

// ---------------------------------------------------------------- images

const SLOT_RE = /^(hero|shots\.[01]|screens\.[0-2]|sections\.\d{1,2}\.img)$/;
const SITE_SLOT_RE = /^pages\.\d{1,2}\.img$/; // a picture on an About book page
const MAX_BYTES = 12 * 1024 * 1024;

export function assertSlot(slot: unknown, id?: string): string {
  if (typeof slot !== 'string' || !(id && isSiteId(id) ? SITE_SLOT_RE : SLOT_RE).test(slot)) throw new StudioError(400, 'Bad image slot');
  return slot;
}

function sniff(b: Buffer): string | null {
  if (b.length < 12) return null;
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'png';
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpeg';
  if (b.toString('ascii', 0, 4) === 'GIF8') return 'gif';
  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  if (b.toString('ascii', 4, 8) === 'ftyp' && /avi[fs]/.test(b.toString('ascii', 8, 12))) return 'avif';
  return null;
}

// Re-encode to WebP at most 1800px wide. Sniffs the real file type; never trusts the name or MIME.
export async function saveImage(id: string, slot: string, bytes: Buffer): Promise<{ src: string; w: number; h: number }> {
  if (bytes.length > MAX_BYTES) throw new StudioError(413, 'The image is over 12 MB');
  if (!sniff(bytes)) throw new StudioError(415, 'Use a PNG, JPEG, WebP, GIF or AVIF image');
  const sharp = (await import('sharp')).default;
  const out = await sharp(bytes).rotate().resize({ width: 1800, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
  const name = slot.replace(/[^a-z0-9]+/gi, '-') + '-' + crypto.createHash('sha1').update(out.data).digest('hex').slice(0, 8) + '.webp';
  const site = isSiteId(id);
  const dir = path.join(site ? SITE_IMAGE_DIR : IMAGE_DIR, id);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), out.data);
  return { src: (site ? '/about/' : '/projects/') + id + '/' + name, w: out.info.width, h: out.info.height };
}
