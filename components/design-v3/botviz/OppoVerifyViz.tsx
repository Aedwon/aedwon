'use client';

// OppoVerifyViz: how the OPPO bot verifies a member. Six phases on one rAF clock
// writing to DOM refs (no setState per frame; only `paused` is state).
// Facts: oppo-verify fact sheet. Every UID, server, team and nickname is an example.
// The access code is never drawn.

import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import { Caption, clamp01, easeOut, mono, putCaption, useVizClock, usePaused, type Pal } from '../SystemViz';

const NAMES = ['Player types two numbers', 'Check the cached sheet', 'Wrong pair, no match', 'Right pair, row saved', 'Role and nickname set', 'Staff pick a role'];
const STEP = 3400;
const A = { uid: '48210377', srv: '2041' }; // wrong pair (example)
const B = { uid: '48210337', srv: '2041' }; // right pair (example)
const TEAM = 'Example Team';

const typed = (s: string, f: number) => s.slice(0, Math.ceil(s.length * clamp01(f)));

export default function OppoVerifyViz({ P }: { P: Pal }) {
  const reducedRef = useRef(false);
  const { paused, pausedRef, toggle, setPaused } = usePaused();
  const elapsed = useRef(0);
  const raf = useRef(0);
  const R = useRef<Record<string, HTMLElement | null>>({});
  const rf = (k: string) => (el: HTMLElement | null) => { R.current[k] = el; };
  const captionNumRef = useRef<HTMLSpanElement>(null);
  const captionNameRef = useRef<HTMLSpanElement>(null);

  const apply = () => {
    const reduced = reducedRef.current;
    const n = NAMES.length;
    const t = elapsed.current % (n * STEP);
    const a = reduced ? n - 1 : Math.floor(t / STEP);
    const p = reduced ? 1 : (t % STEP) / STEP;
    const staff = a === 5;
    const g = (k: string) => R.current[k];
    const set = (k: string, s: Partial<CSSStyleDeclaration>) => { const el = g(k); if (el) Object.assign(el.style, s); };
    const text = (k: string, s: string) => { const el = g(k); if (el && el.textContent !== s) el.textContent = s; };
    const LIVE = P.live, RED = P.red;

    // panel buttons
    const verifyLit = a === 0 || (a === 3 && p < 0.3);
    const staffLit = a === 5 && p < 0.4;
    set('btnV', { borderColor: verifyLit ? P.fg : P.div, color: verifyLit ? P.fg : P.lbl });
    set('btnS', { borderColor: staffLit ? P.fg : P.div, color: staffLit ? P.fg : P.lbl });

    // modal
    const u = easeOut(p / 0.75);
    let v0 = '', v1 = '';
    if (a === 0) { v0 = typed(A.uid, u * 2); v1 = typed(A.srv, u * 2 - 1); }
    else if (a === 1 || a === 2) { v0 = A.uid; v1 = A.srv; }
    else if (a === 3) { v0 = typed(B.uid, easeOut(p / 0.3)); v1 = B.srv; }
    else if (a === 4) { v0 = B.uid; v1 = B.srv; }
    let v2 = '';
    if (staff) { v0 = typed('Coach', p / 0.15); v1 = typed(TEAM, (p - 0.15) / 0.45); v2 = p > 0.65 ? 'not shown' : ''; }
    text('l0', staff ? 'Role' : 'UID');
    text('l1', staff ? 'Team name' : 'Server ID');
    text('l2', staff ? 'Access code' : '');
    text('v0', v0); text('v1', v1); text('v2', v2);
    text('mTitle', staff ? 'Dropdown, then form' : 'Form from Verify');
    const fail = a === 2 && p > 0.35;
    const ok = (a === 3 && p > 0.55) || a === 4;
    const vCol = fail ? RED : ok ? LIVE : P.fg;
    set('v0', { color: vCol }); set('v1', { color: vCol });
    const typing = a === 0 || (a === 3 && p < 0.35) || staff;
    set('modal', { borderColor: fail ? RED : ok ? LIVE : typing ? P.fg : P.div });
    set('l2row', { opacity: staff ? '1' : '0' });

    // cache and arrow
    const lookup = a === 1 || a === 2 || (a === 3 && p > 0.3) || (a === 5 && p > 0.5);
    set('cache', { borderColor: lookup ? P.fg : P.div });
    const secs = 252 - Math.floor((a * STEP + p * STEP) / 1000);
    text('timer', Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0'));
    set('timer', { color: lookup ? P.fg : P.lbl });
    text('cSub', staff ? 'team must be listed' : 'both numbers must match');
    const arrowOn = a === 1 || a === 2 || (a === 3 && p > 0.25) || (a === 5 && p > 0.45);
    set('arrow', { clipPath: arrowOn ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)' });

    // result
    let r1 = '', r2 = '', rc = P.sec;
    if (a === 1 && p > 0.3) { r1 = 'Comparing the pair'; }
    if (a === 2 && p > 0.25) { r1 = 'Not found.'; rc = RED; r2 = 'Falls back to League Ops list'; }
    if (a === 3 && p > 0.5) { r1 = 'Match.'; rc = LIVE; r2 = 'Sheet row found'; }
    if (a === 4) { r1 = 'Match.'; rc = LIVE; r2 = 'Sheet row found'; }
    if (staff && p > 0.5) { r1 = 'Code and team ok.'; rc = LIVE; r2 = 'One coach, one manager per team'; }
    text('r1', r1); text('r2', r2);
    set('r1', { color: rc });

    // database row
    const saved = (a === 3 && p > 0.7) || a === 4 || (staff && p > 0.8);
    set('db', { borderColor: saved ? LIVE : P.div });
    text('dbCount', saved ? '+1' : '0');
    set('dbCount', { color: saved ? LIVE : P.lbl });
    text('dbSub', staff ? 'UID STAFF, server 0' : 'one row per user');
    set('dbSub', { opacity: saved ? '1' : '0.45' });

    // role and nickname
    const roleOn = (a === 3 && p > 0.8) || a === 4 || (staff && p > 0.8);
    text('role', staff ? 'Role: Coach' : 'Role: Player');
    set('role', { borderColor: roleOn ? LIVE : P.div, color: roleOn ? P.fg : P.lbl });
    const nickOn = a === 4 && p > 0.2;
    text('nick', nickOn ? 'ABBREV | IGN' : 'Nickname');
    set('nick', { borderColor: nickOn ? P.fg : P.div, color: nickOn ? P.fg : P.lbl });
    set('nickEx', { opacity: nickOn ? '1' : '0' });

    putCaption({ num: captionNumRef, name: captionNameRef }, String(a + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0'), NAMES[a]);
  };

  const applyRef = useRef(apply);
  useLayoutEffect(() => { applyRef.current = apply; });
  useVizClock(elapsed, raf, applyRef, pausedRef, reducedRef, () => setPaused(true));

  const box: CSSProperties = { position: 'absolute', boxSizing: 'border-box', border: `1px solid ${P.div}`, borderRadius: 8, transition: 'border-color .3s ease' };
  const lab: CSSProperties = { fontSize: 11, color: P.lbl };
  const btn: CSSProperties = { padding: '3px 9px', border: `1px solid ${P.div}`, borderRadius: 6, fontSize: 11.5, color: P.lbl, transition: 'border-color .3s ease, color .3s ease' };
  const chip: CSSProperties = { position: 'absolute', left: '54%', width: '46%', boxSizing: 'border-box', height: 22, padding: '0 9px', display: 'flex', alignItems: 'center', border: `1px solid ${P.div}`, borderRadius: 6, ...mono, fontSize: 11, color: P.lbl, transition: 'border-color .3s ease, color .3s ease' };
  const field = (top: number, l: string, v: string, extra?: CSSProperties) => (
    <div ref={rf(l + 'row')} style={{ position: 'absolute', left: 12, right: 12, top, transition: 'opacity .3s ease', ...extra }}>
      <span ref={rf(l)} style={{ display: 'block', ...lab }} />
      <span ref={rf(v)} style={{ display: 'block', marginTop: 2, minHeight: 16, ...mono, fontSize: 12, color: P.fg, borderBottom: `1px solid ${P.div}` }} />
    </div>
  );

  return (
    <>
      <div aria-hidden style={{ position: 'relative', height: 300 }}>
        <div style={{ ...box, left: 0, right: 0, top: 0, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px' }}>
          <span style={{ display: 'flex', gap: 8 }}>
            <span ref={rf('btnV')} style={btn}>Verify</span>
            <span ref={rf('btnS')} style={btn}>Staff / Coach</span>
          </span>
          <span style={{ ...mono, fontSize: 10, color: P.lbl }}>/setup_verification</span>
        </div>

        <div ref={rf('modal')} style={{ ...box, left: 0, width: '46%', top: 52, height: 150 }}>
          <span ref={rf('mTitle')} style={{ position: 'absolute', left: 12, top: 9, ...lab }} />
          {field(34, 'l0', 'v0')}
          {field(76, 'l1', 'v1')}
          {field(118, 'l2', 'v2')}
        </div>

        <span ref={rf('arrow')} style={{ position: 'absolute', left: '46%', width: '8%', top: 83, height: 9, clipPath: 'inset(0 100% 0 0)', transition: 'clip-path .5s cubic-bezier(.65,0,.35,1)' }}>
          <span style={{ position: 'absolute', left: 2, right: 4, top: 4, height: 1, background: P.fg }} />
          <span style={{ position: 'absolute', right: 0, top: 1, width: 0, height: 0, borderLeft: `5px solid ${P.fg}`, borderTop: '4px solid transparent', borderBottom: '4px solid transparent' }} />
        </span>

        <div ref={rf('cache')} style={{ ...box, left: '54%', width: '46%', top: 52, height: 70 }}>
          <span style={{ position: 'absolute', left: 10, top: 9, ...lab }}>Sheet cache, 5 min</span>
          <span ref={rf('timer')} style={{ position: 'absolute', right: 10, top: 28, ...mono, fontSize: 13, color: P.lbl }} />
          <span ref={rf('cSub')} style={{ position: 'absolute', left: 10, top: 30, width: '56%', fontSize: 11, lineHeight: 1.35, color: P.sec }} />
        </div>

        <div style={{ position: 'absolute', left: '54%', width: '46%', top: 130, height: 34 }}>
          <span ref={rf('r1')} style={{ display: 'block', fontSize: 12.5, color: P.sec, minHeight: 17 }} />
          <span ref={rf('r2')} style={{ display: 'block', fontSize: 11, color: P.lbl, minHeight: 15 }} />
        </div>

        <div ref={rf('db')} style={{ ...box, left: '54%', width: '46%', top: 170, height: 46 }}>
          <span style={{ position: 'absolute', left: 10, top: 8, ...mono, fontSize: 10.5, color: P.lbl }}>verified_users</span>
          <span ref={rf('dbCount')} style={{ position: 'absolute', right: 10, top: 6, ...mono, fontSize: 13, color: P.lbl }} />
          <span ref={rf('dbSub')} style={{ position: 'absolute', left: 10, top: 26, fontSize: 11, color: P.sec, transition: 'opacity .3s ease' }} />
        </div>

        <span ref={rf('role')} style={{ ...chip, top: 224 }} />
        <span ref={rf('nick')} style={{ ...chip, top: 250 }} />
        <span ref={rf('nickEx')} style={{ position: 'absolute', left: 0, top: 254, fontSize: 11, fontStyle: 'italic', color: P.lbl, opacity: 0, transition: 'opacity .3s ease' }}>nickname is an example</span>

        <span style={{ position: 'absolute', left: 0, top: 278, fontSize: 11, fontStyle: 'italic', color: P.lbl }}>example values, access code never shown</span>
      </div>
      <Caption P={P} numRef={captionNumRef} nameRef={captionNameRef} paused={paused} onToggle={toggle} />
    </>
  );
}
