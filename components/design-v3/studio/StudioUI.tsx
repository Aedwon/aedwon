'use client';

// The studio's own interface: a small bar (Edit, Details, save status) and a details drawer.
// Loaded only in development (see Site.tsx) and shown only on localhost, on a project page.
import { useEffect, useState } from 'react';
import { LOGO } from '@/lib/design-v3/data/icons';
import { loadProject, ping, saveOp, uploadImage } from './actions';
import { setStudio, useStudio } from './store';

const LOCAL = ['localhost', '127.0.0.1', '[::1]', '::1'];
const MEDIA = ['phone', 'tv', 'web', 'discord', 'term', 'data', 'repo', 'paper'];
const DEPTH = ['case', 'writeup', 'note'];

const CSS = `
.studio-ed{outline:1px dashed rgba(96,165,250,.55);outline-offset:3px;border-radius:2px;cursor:text;min-width:2ch}
.studio-ed:hover{outline-color:rgba(96,165,250,.95)}
.studio-ed:focus{outline:2px solid #60A5FA;background:rgba(96,165,250,.08)}
.studio-ed:empty::before{content:'(empty)';opacity:.45}
.studio-row{position:relative}
.studio-x{position:absolute;right:-32px;top:2px;width:22px;height:22px;border-radius:6px;border:1px solid rgba(255,255,255,.22);background:rgba(20,20,24,.92);color:#eee;cursor:pointer;opacity:0;font:14px/1 system-ui;padding:0}
.studio-row:hover .studio-x{opacity:1}
.studio-add{align-self:flex-start;height:30px;padding:0 12px;border-radius:8px;border:1px dashed rgba(96,165,250,.6);background:transparent;color:#60A5FA;cursor:pointer;font:13px system-ui}
.studio-add:hover{background:rgba(96,165,250,.1)}
.studio-slot-ui{position:absolute;left:0;right:0;bottom:0;display:flex;gap:8px;align-items:center;padding:10px;background:linear-gradient(transparent,rgba(0,0,0,.72));opacity:0;transition:opacity .15s;z-index:3}
.studio-slot:hover .studio-slot-ui,.studio-slot:focus-within .studio-slot-ui,.studio-slot[data-over] .studio-slot-ui{opacity:1}
.studio-slot-ui[data-empty]{inset:0;justify-content:center;background:rgba(96,165,250,.06);border:1.5px dashed rgba(96,165,250,.65);border-radius:12px;opacity:1}
.studio-slot[data-over]{outline:2px solid #60A5FA;outline-offset:-2px}
.studio-btn{height:30px;padding:0 12px;border-radius:8px;border:1px solid rgba(255,255,255,.28);background:rgba(20,20,24,.92);color:#f2f2f2;cursor:pointer;font:13px system-ui;white-space:nowrap}
.studio-btn:hover:not(:disabled){border-color:#60A5FA}
.studio-btn:disabled{opacity:.35;cursor:default}
.studio-btn-quiet{background:rgba(20,20,24,.7)}
.studio-alt{flex:1;min-width:0;height:30px;padding:0 10px;border-radius:8px;border:1px solid rgba(255,255,255,.28);background:rgba(20,20,24,.92);color:#f2f2f2;font:13px system-ui}
.studio-tools{position:absolute;right:0;top:20px;display:flex;gap:6px;z-index:4}
.studio-bar{position:fixed;left:50%;bottom:18px;translate:-50% 0;z-index:2147483000;display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:12px;border:1px solid rgba(255,255,255,.16);background:rgba(18,18,22,.94);backdrop-filter:blur(14px);color:#eee;font:13px system-ui;box-shadow:0 10px 40px rgba(0,0,0,.45)}
.studio-bar button{height:30px;padding:0 14px;border-radius:8px;border:1px solid rgba(255,255,255,.22);background:transparent;color:#eee;cursor:pointer;font:13px system-ui}
.studio-bar button[aria-pressed=true]{background:#2563EB;border-color:#2563EB;color:#fff}
.studio-bar code{opacity:.55;font:12px ui-monospace,Menlo,monospace}
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
  const id = useProjectId();
  useEffect(() => {
    if (!LOCAL.includes(location.hostname)) return;
    ping().then((why) => setStudio(why ? { off: why } : { available: true, off: '', api: { saveOp, uploadImage } }));
  }, []);
  if (st.off && id) return <><style>{CSS}</style><div className="studio-bar" role="status"><span>Studio off: restart the site with <code>npm run dev</code></span></div></>;
  if (!st.available) return null;
  return (
    <>
      <style>{CSS}</style>
      {id && <Bar id={id} />}
      {id && st.drawer && <Drawer id={id} key={id} />}
    </>
  );
}

function Bar({ id }: { id: string }) {
  const st = useStudio();
  const label = st.status === 'saving' ? 'Saving…' : st.status === 'saved' ? 'Saved' : st.status === 'error' ? st.message : st.editing ? 'Click text to edit. Enter saves.' : '';
  return (
    <div className="studio-bar" role="toolbar" aria-label="Studio">
      <button type="button" aria-pressed={st.editing} onClick={() => setStudio({ editing: !st.editing })}>{st.editing ? 'Editing' : 'Edit'}</button>
      <button type="button" aria-pressed={st.drawer} onClick={() => setStudio({ drawer: !st.drawer })}>Details</button>
      <span style={{ minWidth: 150, color: st.status === 'error' ? '#F87171' : undefined }}>{label}</span>
      <code>content/projects/{id}.json</code>
    </div>
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
