'use client';

// The studio's own interface: a small bar (Edit, Details, save status) and a details drawer.
// Loaded only in development (see Site.tsx) and shown only on localhost, on a project page.
import { useCallback, useEffect, useState } from 'react';
import { LOGO } from '@/lib/design-v3/data/icons';
import { gitPublish, gitStatus, loadProject, ping, saveOp, uploadImage, type PublishStatus } from './actions';
import { setStudio, useStudio } from './store';

const LOCAL = ['localhost', '127.0.0.1', '[::1]', '::1'];
const MEDIA = ['phone', 'tv', 'web', 'discord', 'term', 'data', 'repo', 'paper'];
const DEPTH = ['case', 'writeup', 'note'];

const CSS = `
.studio-ed{outline:1px dashed rgba(96,165,250,.55);outline-offset:3px;border-radius:2px;cursor:text;min-width:2ch}
.studio-ed:hover{outline-color:rgba(96,165,250,.95)}
.studio-ed:focus{outline:2px solid #60A5FA;background:rgba(96,165,250,.08)}
.studio-ed:empty::before{content:'(empty)';opacity:.45}
.studio-ed[data-ph]:empty::before{content:attr(data-ph)}
.studio-row{position:relative}
.studio-x{position:absolute;right:-32px;top:2px;width:22px;height:22px;border-radius:6px;border:1px solid rgba(255,255,255,.22);background:rgba(20,20,24,.92);color:#eee;cursor:pointer;opacity:0;font:14px/1 system-ui;padding:0}
.studio-row:hover .studio-x{opacity:1}
.studio-add{align-self:flex-start;height:30px;padding:0 12px;border-radius:8px;border:1px dashed rgba(96,165,250,.6);background:transparent;color:#60A5FA;cursor:pointer;font:13px system-ui}
.studio-add:hover{background:rgba(96,165,250,.1)}
.studio-slot-ui{position:absolute;left:0;right:0;bottom:0;display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:10px;background:linear-gradient(transparent,rgba(0,0,0,.72));opacity:0;transition:opacity .15s;z-index:3}
.studio-slot:hover .studio-slot-ui,.studio-slot:focus-within .studio-slot-ui,.studio-slot[data-over] .studio-slot-ui{opacity:1}
.studio-slot-ui[data-empty]{inset:0;justify-content:center;background:rgba(96,165,250,.06);border:1.5px dashed rgba(96,165,250,.65);border-radius:12px;opacity:1}
.studio-slot[data-over]{outline:2px solid #60A5FA;outline-offset:-2px}
.studio-btn{height:30px;padding:0 12px;border-radius:8px;border:1px solid rgba(255,255,255,.28);background:rgba(20,20,24,.92);color:#f2f2f2;cursor:pointer;font:13px system-ui;white-space:nowrap}
.studio-btn:hover:not(:disabled){border-color:#60A5FA}
.studio-btn:disabled{opacity:.35;cursor:default}
.studio-btn-quiet{background:rgba(20,20,24,.7)}
.studio-alt{flex:1;min-width:0;height:30px;padding:0 10px;border-radius:8px;border:1px solid rgba(255,255,255,.28);background:rgba(20,20,24,.92);color:#f2f2f2;font:13px system-ui}
.studio-link{position:relative;display:inline-flex;align-items:center;gap:6px}
.studio-tools{position:absolute;right:0;top:20px;display:flex;gap:6px;z-index:4}
.studio-bar{position:fixed;left:50%;bottom:18px;translate:-50% 0;z-index:2147483000;display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:12px;border:1px solid rgba(255,255,255,.16);background:rgba(18,18,22,.94);backdrop-filter:blur(14px);color:#eee;font:13px system-ui;box-shadow:0 10px 40px rgba(0,0,0,.45)}
.studio-bar button{height:30px;padding:0 14px;border-radius:8px;border:1px solid rgba(255,255,255,.22);background:transparent;color:#eee;cursor:pointer;font:13px system-ui}
.studio-bar button[aria-pressed=true]{background:#2563EB;border-color:#2563EB;color:#fff}
.studio-bar code{opacity:.55;font:12px ui-monospace,Menlo,monospace}
.studio-pub{position:fixed;left:50%;bottom:74px;translate:-50% 0;width:440px;max-width:calc(100vw - 24px);z-index:2147483001;max-height:70vh;overflow:auto;background:#101014;color:#e8e8ec;border:1px solid rgba(255,255,255,.16);border-radius:14px;padding:16px;font:13px/1.45 system-ui;box-shadow:0 20px 60px rgba(0,0,0,.55)}
.studio-pub h4{margin:0 0 10px;font:600 14px system-ui}
.studio-pub code,.studio-pub pre{font:12px/1.5 ui-monospace,Menlo,monospace}
.studio-pub pre{margin:8px 0;padding:10px;border-radius:8px;background:#18181d;overflow:auto;white-space:pre-wrap}
.studio-pub ul{margin:8px 0;padding:0;list-style:none;font:12px ui-monospace,Menlo,monospace;color:#c9c9d2}
.studio-pub input{width:100%;box-sizing:border-box;height:34px;padding:0 10px;border-radius:8px;border:1px solid rgba(255,255,255,.18);background:#18181d;color:#f2f2f2;font:13px system-ui}
.studio-pub .go{height:34px;padding:0 16px;border-radius:8px;border:1px solid #2563EB;background:#2563EB;color:#fff;cursor:pointer;font:13px system-ui}
.studio-pub .go:disabled{opacity:.4;cursor:default}
.studio-pub a{color:#60A5FA}
.studio-badge{display:inline-block;min-width:18px;margin-left:8px;padding:0 6px;border-radius:99px;background:#D97706;color:#fff;font:600 11px/18px system-ui;text-align:center}
.studio-drawer{position:fixed;top:0;right:0;bottom:0;width:380px;z-index:2147483001;overflow:auto;background:#101014;color:#e8e8ec;border-left:1px solid rgba(255,255,255,.14);padding:16px 16px 90px;font:13px/1.4 system-ui;box-shadow:-14px 0 50px rgba(0,0,0,.4)}
.studio-drawer h4{margin:22px 0 8px;font:600 12px system-ui;letter-spacing:.06em;text-transform:uppercase;color:#9a9aa6}
.studio-drawer label{display:flex;flex-direction:column;gap:4px;margin-bottom:10px;color:#9a9aa6;font-size:12px}
.studio-drawer input,.studio-drawer select,.studio-drawer textarea{height:32px;padding:0 10px;border-radius:8px;border:1px solid rgba(255,255,255,.18);background:#18181d;color:#f2f2f2;font:13px system-ui;width:100%;box-sizing:border-box}
.studio-drawer textarea{height:60vh;padding:10px;font:12px/1.5 ui-monospace,Menlo,monospace;resize:vertical}
.studio-drawer input:focus,.studio-drawer select:focus,.studio-drawer textarea:focus{outline:2px solid #60A5FA;outline-offset:-1px}
.studio-pair{display:grid;grid-template-columns:1fr 1.6fr 30px;gap:6px;margin-bottom:6px}
.studio-pair button,.studio-drawer .studio-small{height:32px;border-radius:8px;border:1px solid rgba(255,255,255,.18);background:transparent;color:#e8e8ec;cursor:pointer;font:13px system-ui}
.studio-tabs{display:flex;gap:6px;margin-bottom:6px}
.studio-tabs button{flex:1;height:32px;border-radius:8px;border:1px solid rgba(255,255,255,.18);background:transparent;color:#e8e8ec;cursor:pointer}
.studio-tabs button[aria-pressed=true]{background:#2563EB;border-color:#2563EB}
.studio-chip{display:inline-block;margin:0 6px 6px 0;padding:2px 8px;border-radius:99px;border:1px solid rgba(255,255,255,.2);font-size:12px}
.studio-chip[data-miss]{border-color:#D97706;color:#FBBF24}
`;

type Doc = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const isSite = (id: string) => id === 'ui' || id.startsWith('about-');
const BOOKS = ['about-01', 'about-02', 'about-03', 'about-04', 'about-05', 'about-06'];

// Every text value in a file, as [path, text].
function leaves(v: unknown, prefix = ''): [string, string][] {
  if (typeof v === 'string') return [[prefix, v]];
  if (v && typeof v === 'object') return Object.entries(v).flatMap(([k, x]) => (prefix === '' && k === 'id' ? [] : leaves(x, prefix ? prefix + '.' + k : k)));
  return [];
}

function useProjectId() {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    const read = () => { const m = location.pathname.match(/^\/(?:work|writing)\/([a-z0-9-]+)/); setId(m ? m[1] : null); };
    read();
    const t = setInterval(read, 300); // the room changes the address with pushState, which has no event
    return () => clearInterval(t);
  }, []);
  return id;
}

export default function StudioUI() {
  const st = useStudio();
  const urlId = useProjectId();
  // the page says which project (or About book) it shows; the address is the fallback (the phone layout); anywhere else it is the site's own text
  const id = st.project ?? urlId ?? 'ui';
  const [git, setGit] = useState<PublishStatus | null>(null);
  const refreshGit = useCallback(() => { gitStatus().then(setGit).catch(() => {}); }, []);
  // what would be published: on load, after each save, and now and then
  useEffect(() => { if (st.available) refreshGit(); }, [st.available, refreshGit]);
  useEffect(() => {
    if (!st.available || st.status !== 'saved') return;
    const t = setTimeout(refreshGit, 500);
    return () => clearTimeout(t);
  }, [st.available, st.status, refreshGit]);
  useEffect(() => {
    if (!st.available) return;
    const t = setInterval(refreshGit, 8000);
    return () => clearInterval(t);
  }, [st.available, refreshGit]);
  useEffect(() => {
    if (!LOCAL.includes(location.hostname)) return;
    ping().then((why) => setStudio(why ? { off: why } : { available: true, off: '', api: { saveOp, uploadImage } }));
  }, []);
  if (st.off && id) return <><style>{CSS}</style><div className="studio-bar" role="status"><span>Studio off: restart the site with <code>npm run dev</code></span></div></>;
  if (!st.available) return null;
  return (
    <>
      <style>{CSS}</style>
      {id && <Bar id={id} git={git} />}
      {id && st.drawer && (isSite(id) ? <SiteDrawer id={id} key={id} /> : <Drawer id={id} key={id} />)}
      {id && st.publish && <PublishPanel git={git} refresh={refreshGit} />}
    </>
  );
}

function Bar({ id, git }: { id: string; git: PublishStatus | null }) {
  const st = useStudio();
  const label = st.status === 'saving' ? 'Saving…' : st.status === 'saved' ? 'Saved' : st.status === 'error' ? st.message : st.editing ? 'Click text to edit. Enter saves.' : '';
  return (
    <div className="studio-bar" role="toolbar" aria-label="Studio">
      <button type="button" aria-pressed={st.editing} onClick={() => setStudio({ editing: !st.editing })}>{st.editing ? 'Editing' : 'Edit'}</button>
      <button type="button" aria-pressed={st.drawer} onClick={() => setStudio({ drawer: !st.drawer })}>Details</button>
      <button type="button" aria-pressed={st.publish} onClick={() => setStudio({ publish: !st.publish })}>Publish{git && (git.changes.length > 0 || git.ahead > 0) ? <span className="studio-badge">{git.changes.length || git.ahead}</span> : null}</button>
      <span style={{ minWidth: 150, color: st.status === 'error' ? '#F87171' : undefined }}>{label}</span>
      <code>content/{isSite(id) ? 'site' : 'projects'}/{id}.json</code>
    </div>
  );
}

// Commit and push the studio's own files, or show how to do it by hand.
function PublishPanel({ git, refresh }: { git: PublishStatus | null; refresh: () => void }) {
  const [message, setMessage] = useState('content: update projects');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState<{ sha: string; committed: boolean } | null>(null);
  const [hand, setHand] = useState(false);
  const n = git?.changes.length ?? 0;
  const onDefault = !!git && git.branch === git.defaultBranch;
  const send = () => {
    setBusy(true); setErr(''); setDone(null);
    gitPublish(message.trim())
      .then((r) => { setDone({ sha: r.sha, committed: r.committed }); refresh(); })
      .catch((e) => setErr(e.message))
      .finally(() => setBusy(false));
  };
  return (
    <section className="studio-pub" aria-label="Publish">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4>Publish your changes</h4>
        <button type="button" className="studio-btn studio-btn-quiet" onClick={() => setStudio({ publish: false })}>×</button>
      </div>
      {!git && <p>Reading git…</p>}
      {git && (
        <>
          <p style={{ margin: '0 0 6px' }}>
            Branch <code>{git.branch}</code>
            {git.ahead > 0 && <> · {git.ahead} commit{git.ahead === 1 ? '' : 's'} not pushed</>}
            {git.behind > 0 && <span style={{ color: '#FBBF24' }}> · {git.behind} behind origin: run <code>git pull</code> first</span>}
          </p>
          {n > 0 ? (
            <>
              <p style={{ margin: '8px 0 0' }}>{n} changed file{n === 1 ? '' : 's'} in your content and pictures:</p>
              <ul>{git.changes.slice(0, 8).map((c) => <li key={c.path}>{c.status} {c.path}</li>)}{n > 8 && <li>… and {n - 8} more</li>}</ul>
            </>
          ) : <p style={{ margin: '8px 0', color: '#9a9aa6' }}>{git.ahead > 0 ? 'Nothing new to commit.' : 'No content changes to publish.'}</p>}
          {git.otherChanges > 0 && <p style={{ color: '#9a9aa6', margin: '6px 0' }}>{git.otherChanges} other changed file{git.otherChanges === 1 ? ' is' : 's are'} not included. Only content and pictures are published here.</p>}
          {n > 0 && <input aria-label="Commit message" value={message} maxLength={120} onChange={(e) => setMessage(e.target.value)} />}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', margin: '12px 0 4px' }}>
            <button type="button" className="go" disabled={busy || git.behind > 0 || (n === 0 && git.ahead === 0) || (n > 0 && !message.trim())} onClick={send}>{busy ? 'Publishing…' : n > 0 ? 'Commit and push' : 'Push'}</button>
            <span style={{ color: '#9a9aa6' }}>{n > 0 ? 'Commits only the files listed, then pushes.' : ''}</span>
          </div>
          {err && <p style={{ color: '#F87171' }}>{err}</p>}
          {done && (
            <p style={{ color: '#34D399' }}>
              {done.committed ? `Committed (${done.sha}) and pushed.` : 'Pushed.'}{' '}
              {onDefault ? 'This is your main branch, so Vercel starts a production deploy.' : <>You are on <code>{git.branch}</code>, so this goes to a preview, not production.{git.compareUrl && <> <a href={git.compareUrl} target="_blank" rel="noreferrer">Open a pull request into {git.defaultBranch} ↗</a> and merge it to go live.</>}</>}
            </p>
          )}
          {!done && !onDefault && n + git.ahead > 0 && git.compareUrl && <p style={{ color: '#9a9aa6', margin: '6px 0' }}>To reach production, merge <code>{git.branch}</code> into <code>{git.defaultBranch}</code> after pushing. <a href={git.compareUrl} target="_blank" rel="noreferrer">Open the pull request ↗</a></p>}
          <button type="button" className="studio-btn studio-btn-quiet" style={{ marginTop: 6 }} onClick={() => setHand(!hand)}>{hand ? 'Hide' : 'Do it by hand'}</button>
          {hand && (
            <div>
              <p style={{ margin: '10px 0 0' }}>In a terminal, from the project folder:</p>
              <pre>{`git add content public/projects\ngit commit -m "${message.replace(/"/g, '\\"')}"\ngit push`}</pre>
              <p style={{ margin: 0, color: '#9a9aa6' }}>With Vercel&apos;s default setup, the <code>{git.defaultBranch}</code> branch deploys to production and every other branch gets a preview link. {onDefault ? `You are on ${git.defaultBranch}, so the push deploys.` : `To go live, merge ${git.branch} into ${git.defaultBranch} (a pull request on GitHub is the usual way).`}</p>
            </div>
          )}
        </>
      )}
    </section>
  );
}

// The drawer for the site's own text: the loader, the nav, the 404 page and the About books' labels. Book pages
// are edited on the page itself (Edit, then click the text); this holds the rest.
function SiteDrawer({ id }: { id: string }) {
  const st = useStudio();
  const vis = st.visible.filter((v) => v.id === id).map((v) => v.i);
  const visKey = vis.join(',');
  const [tab, setTab] = useState<'text' | 'json'>('text');
  const [doc, setDoc] = useState<Doc | null>(null);
  const [books, setBooks] = useState<Record<string, string>>({});
  const [json, setJson] = useState('');
  const [err, setErr] = useState('');
  const refresh = () => {
    loadProject(id).then((p) => { setDoc(p); setJson(JSON.stringify(p, null, 2)); setErr(''); }).catch((e) => setErr(e.message));
    if (id === 'ui') Promise.all(BOOKS.map((b) => loadProject(b).then((p) => [b, String(p.title ?? '')] as const))).then((r) => setBooks(Object.fromEntries(r))).catch(() => {});
  };
  useEffect(() => { refresh(); }, [id, visKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const commit = (target: string, op: Parameters<typeof saveOp>[1]) =>
    saveOp(target, op).then((r) => { if (target === id) { setDoc(r.project); setJson(JSON.stringify(r.project, null, 2)); } setErr(''); }).catch((e) => setErr(e.message));
  const rows = doc ? leaves(doc) : [];
  const groups = [...new Set(rows.map(([p]) => p.split('.')[0]))];
  const GROUP: Record<string, string> = { nav: 'Navigation', loader: 'Loading screen', notFound: 'Page not found', about: 'About', title: 'Book label' };
  return (
    <aside className="studio-drawer" aria-label="Site text">
      <div className="studio-tabs">
        <button type="button" aria-pressed={tab === 'text'} onClick={() => { setTab('text'); refresh(); }}>{id === 'ui' ? 'Site text' : 'This book'}</button>
        <button type="button" aria-pressed={tab === 'json'} onClick={() => { setTab('json'); refresh(); }}>JSON</button>
        <button type="button" style={{ flex: '0 0 34px' }} title="Close" onClick={() => setStudio({ drawer: false })}>×</button>
      </div>
      {err && <p style={{ color: '#F87171', margin: '8px 0' }}>{err}</p>}
      {!doc && !err && <p>Loading…</p>}
      {doc && tab === 'text' && (
        <>
          {id !== 'ui' && vis.length === 0 && <p style={{ color: '#9a9aa6', margin: '8px 0' }}>Open a book, and the text of the pages you are looking at shows here.</p>}
          {id !== 'ui' && vis.map((i) => {
            const page = (doc.pages || [])[i] as Doc | undefined;
            if (!page) return null;
            const SKIP = /^(kind|titleSize|bigSize|logo|logos|img|src|cols)(\.|$)/;
            const fields = leaves(page).filter(([k]) => !SKIP.test(k));
            return (
              <div key={i}>
                <h4>Page {String(i + 1).padStart(2, '0')} · {String(page.kind)}</h4>
                {fields.map(([k, v]) => {
                  const path = `pages.${i}.${k}`;
                  const save = (val: string) => { if (val !== v) commit(id, { op: 'set', path, value: val }); };
                  return (
                    <label key={path + v}>{k.replace(/\./g, ' · ')}
                      {v.length > 60
                        ? <textarea style={{ height: 96, padding: 8, font: '13px/1.4 system-ui', resize: 'vertical' }} defaultValue={v} onBlur={(e) => save(e.target.value)} />
                        : <input defaultValue={v} onBlur={(e) => save(e.target.value)} />}
                    </label>
                  );
                })}
                <p style={{ color: '#9a9aa6', margin: '0 0 8px' }}>Pictures and logos: press Edit and use the controls on the page.</p>
              </div>
            );
          })}
          {id === 'ui' && groups.map((g) => (
            <div key={g}>
              <h4>{GROUP[g] || g}</h4>
              {rows.filter(([p]) => p.split('.')[0] === g).map(([p, v]) => (
                <label key={p + v}>{p.split('.').slice(1).join(' · ') || p}<input defaultValue={v} onBlur={(e) => { if (e.target.value !== v) commit(id, { op: 'set', path: p, value: e.target.value }); }} /></label>
              ))}
            </div>
          ))}
          {id !== 'ui' && (
            <>
              <h4>Spine label</h4>
              <label key={String(doc.title)}>Title<input defaultValue={String(doc.title ?? '')} onBlur={(e) => { if (e.target.value !== doc.title) commit(id, { op: 'set', path: 'title', value: e.target.value }); }} /></label>
            </>
          )}
          {id === 'ui' && (
            <>
              <h4>About books: spine labels</h4>
              {BOOKS.map((b, i) => (
                <label key={b + books[b]}>{'Volume 0' + (i + 1)}<input defaultValue={books[b] ?? ''} onBlur={(e) => { if (e.target.value !== books[b]) commit(b, { op: 'set', path: 'title', value: e.target.value }).then(refresh); }} /></label>
              ))}
              <p style={{ color: '#9a9aa6' }}>The text inside a book: open it on the About page, press Edit, and click the text.</p>
            </>
          )}
        </>
      )}
      {doc && tab === 'json' && (
        <>
          <p style={{ color: '#9a9aa6', margin: '8px 0' }}>The whole file.</p>
          <textarea value={json} spellCheck={false} onChange={(e) => setJson(e.target.value)} />
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button type="button" className="studio-small" style={{ padding: '0 14px', background: '#2563EB', borderColor: '#2563EB', color: '#fff' }}
              onClick={() => { try { commit(id, { op: 'put', project: JSON.parse(json) }); } catch (e) { setErr('Not valid JSON: ' + (e as Error).message); } }}>Save JSON</button>
            <button type="button" className="studio-small" style={{ padding: '0 14px' }} onClick={refresh}>Reload from disk</button>
          </div>
        </>
      )}
    </aside>
  );
}

function Drawer({ id }: { id: string }) {
  const [tab, setTab] = useState<'details' | 'json'>('details');
  const [doc, setDoc] = useState<Doc | null>(null);
  const [json, setJson] = useState('');
  const [err, setErr] = useState('');

  const refresh = () => loadProject(id).then((p) => { setDoc(p); setJson(JSON.stringify(p, null, 2)); setErr(''); }).catch((e) => setErr(e.message));
  useEffect(() => { refresh(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const commit = (op: Parameters<typeof saveOp>[1]) =>
    saveOp(id, op).then((r) => { setDoc(r.project); setJson(JSON.stringify(r.project, null, 2)); setErr(''); }).catch((e) => setErr(e.message));
  const setField = (key: string, v: string, optional: boolean) => {
    if (doc && (doc[key] ?? '') === v) return;
    commit(optional && v === '' ? { op: 'unset', path: key } : { op: 'set', path: key, value: v });
  };

  return (
    <aside className="studio-drawer" aria-label="Project details">
      <div className="studio-tabs">
        <button type="button" aria-pressed={tab === 'details'} onClick={() => { setTab('details'); refresh(); }}>Details</button>
        <button type="button" aria-pressed={tab === 'json'} onClick={() => { setTab('json'); refresh(); }}>JSON</button>
        <button type="button" style={{ flex: '0 0 34px' }} title="Close" onClick={() => setStudio({ drawer: false })}>×</button>
      </div>
      {err && <p style={{ color: '#F87171', margin: '8px 0' }}>{err}</p>}
      {!doc && !err && <p>Loading…</p>}

      {doc && tab === 'details' && (
        <>
          <h4>Basics</h4>
          {([['type', 'Type', false], ['date', 'Date', true], ['mins', 'Reading time', true], ['repo', 'Repository', true], ['stackText', 'Stack line (text)', true], ['topic', 'Topic', true]] as const).map(([k, label, optional]) => (
            <label key={k + (doc[k] ?? '')}>{label}<input defaultValue={doc[k] ?? ''} onBlur={(e) => setField(k, e.target.value, optional)} /></label>
          ))}
          <label>Picture style (media)
            <select value={doc.media} onChange={(e) => setField('media', e.target.value, false)}>{MEDIA.map((m) => <option key={m}>{m}</option>)}</select>
          </label>
          <label>Depth
            <select value={doc.depth} onChange={(e) => setField('depth', e.target.value, false)}>{DEPTH.map((m) => <option key={m}>{m}</option>)}</select>
          </label>

          <Pictures doc={doc} commit={commit} />

          <h4>Stack</h4>
          <label key={(doc.stack || []).join()}>Names, separated by commas
            <input defaultValue={(doc.stack || []).join(', ')} onBlur={(e) => commit({ op: 'set', path: 'stack', value: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
          </label>
          <div>{(doc.stack || []).map((s: string) => <span key={s} className="studio-chip" data-miss={LOGO[s] ? undefined : true}>{s}{LOGO[s] ? '' : ' (no icon)'}</span>)}</div>

          <h4>Facts</h4>
          <Pairs list={doc.facts || []} a="k" b="v" ph={['Label', 'Value']} onChange={(next) => commit({ op: 'set', path: 'facts', value: next })} />

          <h4>Links</h4>
          <Pairs list={doc.links || []} a="label" b="href" ph={['Label', 'https://']} onChange={(next) => commit({ op: 'set', path: 'links', value: next })} />
        </>
      )}

      {doc && tab === 'json' && (
        <>
          <p style={{ color: '#9a9aa6', margin: '8px 0' }}>The whole file. Everything the form does not cover lives here.</p>
          <textarea value={json} spellCheck={false} onChange={(e) => setJson(e.target.value)} />
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button
              type="button"
              className="studio-small"
              style={{ padding: '0 14px', background: '#2563EB', borderColor: '#2563EB', color: '#fff' }}
              onClick={() => { try { commit({ op: 'put', project: JSON.parse(json) }); } catch (e) { setErr('Not valid JSON: ' + (e as Error).message); } }}
            >Save JSON</button>
            <button type="button" className="studio-small" style={{ padding: '0 14px' }} onClick={refresh}>Reload from disk</button>
          </div>
        </>
      )}
    </aside>
  );
}

// A list of two-field rows (facts, links) with add and remove. Saves the whole list when a field loses focus.
function Pairs({ list, a, b, ph, onChange }: { list: Record<string, string>[]; a: string; b: string; ph: [string, string]; onChange: (next: Record<string, string>[]) => void }) {
  const set = (i: number, key: string, v: string) => { if (list[i][key] !== v) onChange(list.map((r, j) => (j === i ? { ...r, [key]: v } : r))); };
  return (
    <div>
      {list.map((r, i) => (
        <div key={i + r[a] + r[b]} className="studio-pair">
          <input defaultValue={r[a]} placeholder={ph[0]} onBlur={(e) => set(i, a, e.target.value)} />
          <input defaultValue={r[b]} placeholder={ph[1]} onBlur={(e) => set(i, b, e.target.value)} />
          <button type="button" title="Remove" onClick={() => onChange(list.filter((_, j) => j !== i))}>×</button>
        </div>
      ))}
      <button type="button" className="studio-small" style={{ padding: '0 12px' }} onClick={() => onChange([...list, { [a]: '', [b]: '' }])}>+ Add</button>
    </div>
  );
}

const FRAME_DEFAULT: Record<string, number> = { phone: 370, tv: 330, web: 325, discord: 325, term: 300, data: 300, repo: 260, paper: 300 };

// The frame (its height; it is always 520 wide) and, for each picture, which part stays in view and how close.
// The Wall, the Index preview and the page all follow, because they draw the same frame.
function Pictures({ doc, commit }: { doc: Doc; commit: (op: Parameters<typeof saveOp>[1]) => void }) {
  const phone = doc.media === 'phone';
  const pics: { slot: string; label: string; img: Doc }[] = phone
    ? [0, 1, 2].filter((n) => doc.screens?.[n]?.src).map((n) => ({ slot: `screens.${n}`, label: `Phone ${n + 1}`, img: doc.screens[n] }))
    : doc.hero?.src ? [{ slot: 'hero', label: 'Picture', img: doc.hero }] : [];
  const def = FRAME_DEFAULT[doc.media] ?? 300, h = doc.frame?.h ?? def;
  const setH = (v: string) => { const n = Math.round(Number(v)); if (Number.isFinite(n) && n >= 160 && n <= 640 && n !== h) commit(n === def ? { op: 'unset', path: 'frame' } : { op: 'set', path: 'frame', value: { h: n } }); };
  const onEnd = (fn: (v: string) => void) => ({
    onPointerUp: (e: React.PointerEvent<HTMLInputElement>) => fn(e.currentTarget.value),
    onKeyUp: (e: React.KeyboardEvent<HTMLInputElement>) => fn(e.currentTarget.value),
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => fn(e.currentTarget.value),
  });
  return (
    <>
      <h4>Picture frame</h4>
      <p style={{ color: '#9a9aa6', margin: '0 0 8px' }}>Height of the frame, in pixels. The width stays fixed. Taller or shorter, the Wall, the Index and this page all follow.</p>
      <label key={'h' + h}>Height ({def} is the default)
        <input type="range" min={160} max={640} step={5} defaultValue={h} {...onEnd(setH)} />
      </label>
      <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
        <input key={'n' + h} type="number" min={160} max={640} defaultValue={h} style={{ width: 90 }} onBlur={(e) => setH(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }} />
        {doc.frame && <button type="button" className="studio-small" style={{ padding: '0 12px' }} onClick={() => commit({ op: 'unset', path: 'frame' })}>Reset height</button>}
      </div>
      {pics.map(({ slot, label, img }) => {
        const f = img.focus || { x: 50, y: 50 }, z = img.zoom || 1;
        const setZoom = (v: string) => { const n = Math.round(Number(v) * 20) / 20; if (n >= 1 && n <= 4 && n !== z) commit(n === 1 ? { op: 'unset', path: slot + '.zoom' } : { op: 'set', path: slot + '.zoom', value: n }); };
        return (
          <div key={slot}>
            <h4>{label}: position and zoom</h4>
            <p style={{ color: '#9a9aa6', margin: '0 0 8px' }}>Click the part that must stay in view.</p>
            <div style={{ position: 'relative', lineHeight: 0, cursor: 'crosshair' }}
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                const x = Math.round(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100))), y = Math.round(Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100)));
                commit({ op: 'set', path: slot + '.focus', value: { x, y } });
              }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- the studio's own uploaded picture */}
              <img src={img.src} alt="" draggable={false} style={{ width: '100%', height: 'auto', borderRadius: 8, display: 'block' }} />
              <span aria-hidden style={{ position: 'absolute', left: `${f.x}%`, top: `${f.y}%`, width: 18, height: 18, margin: '-9px 0 0 -9px', borderRadius: 99, border: '2px solid #fff', boxShadow: '0 0 0 1.5px #2563EB, 0 1px 6px rgba(0,0,0,.5)', pointerEvents: 'none' }} />
            </div>
            <label key={slot + z} style={{ marginTop: 8 }}>Zoom ({z.toFixed(2)}×)
              <input type="range" min={1} max={4} step={0.05} defaultValue={z} {...onEnd(setZoom)} />
            </label>
            {(img.focus || img.zoom) && <button type="button" className="studio-small" style={{ padding: '0 12px' }} onClick={() => commit({ op: 'put', project: { ...doc, ...(slot === 'hero' ? { hero: { ...doc.hero, focus: undefined, zoom: undefined } } : { screens: doc.screens.map((s: Doc | null, n: number) => (`screens.${n}` === slot && s ? { ...s, focus: undefined, zoom: undefined } : s)) }) } })}>Reset position and zoom</button>}
          </div>
        );
      })}
    </>
  );
}
