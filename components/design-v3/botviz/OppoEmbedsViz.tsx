'use client';

// OppoEmbedsViz: announcements in the Oppo bot. A Discohook link is parsed into
// an embed (first message only). It posts now, or it is saved as a row with a
// send time and one timer holds it until then. The post then goes out and the
// row is deleted. The log channel gets a jump link. The id, time and countdown
// are examples. One rAF clock writes straight to DOM refs.

import { useLayoutEffect, useRef } from 'react';
import { Caption, clamp01, mono, putCaption, useVizClock, usePaused, type Pal } from '../SystemViz';

const PHASES = [
  'Paste a Discohook link',
  'First message becomes embed',
  'Send now or schedule',
  'Row saved, timer set',
  'Timer counts to send time',
  'Posted, row removed, logged',
];

const pad = (n: number) => String(n).padStart(2, '0');

export default function OppoEmbedsViz({ P }: { P: Pal }) {
  const reducedRef = useRef(false);
  const { paused, pausedRef, toggle, setPaused } = usePaused();
  const elapsed = useRef(0);
  const raf = useRef(0);

  const linkRef = useRef<HTMLDivElement>(null);
  const urlRef = useRef<HTMLSpanElement>(null);
  const embedRef = useRef<HTMLDivElement>(null);
  const embedBodyRef = useRef<HTMLDivElement>(null);
  const sendRef = useRef<HTMLSpanElement>(null);
  const schedRef = useRef<HTMLSpanElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);
  const queueRef = useRef<HTMLDivElement>(null);
  const queueRowRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const timerBoxRef = useRef<HTMLDivElement>(null);
  const timerTxtRef = useRef<HTMLSpanElement>(null);
  const channelRef = useRef<HTMLDivElement>(null);
  const channelBodyRef = useRef<HTMLSpanElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const logTxtRef = useRef<HTMLSpanElement>(null);
  const arrows = useRef<(HTMLSpanElement | null)[]>([]); // link>embed, trunk, queue>timer, timer>channel, channel>log
  const arrowAt = (i: number) => (el: HTMLSpanElement | null) => { if (el) arrows.current[i] = el; };
  const statusRef = useRef<HTMLSpanElement>(null);
  const captionNumRef = useRef<HTMLSpanElement>(null);
  const captionNameRef = useRef<HTMLSpanElement>(null);

  const apply = () => {
    const reduced = reducedRef.current;
    const n = PHASES.length;
    const STEP = 3600;
    const t = elapsed.current % (n * STEP);
    const a = reduced ? n - 1 : Math.floor(t / STEP);
    const p = reduced ? 1 : (t % STEP) / STEP;

    // step 1: the link types in
    const urlK = a === 0 ? clamp01(p / 0.6) : 1;
    if (linkRef.current) linkRef.current.style.borderColor = a === 0 ? P.fg : P.div;
    if (urlRef.current) urlRef.current.style.clipPath = `inset(0 ${((1 - urlK) * 100).toFixed(1)}% 0 0)`;

    // step 2: parsed embed
    if (embedRef.current) embedRef.current.style.borderColor = a === 1 ? P.fg : P.div;
    if (embedBodyRef.current) embedBodyRef.current.style.opacity = a >= 1 ? '1' : '0';

    // step 3: send now, then schedule
    const sendNow = a === 2 && p < 0.4;
    const scheduled = (a === 2 && p >= 0.4) || a >= 3;
    if (sendRef.current) {
      sendRef.current.style.borderColor = sendNow ? P.fg : P.div;
      sendRef.current.style.color = sendNow ? P.fg : P.lbl;
    }
    if (schedRef.current) {
      schedRef.current.style.borderColor = scheduled ? (a === 2 ? P.fg : P.frame) : P.div;
      schedRef.current.style.color = scheduled ? P.fg : P.lbl;
    }
    if (timeRef.current) timeRef.current.style.opacity = scheduled ? '1' : '0';

    // queue row and timer
    const rowIn = (a === 3 && p > 0.3) || a === 4 || (a === 5 && p <= 0.1);
    const rowDone = a === 5 && p > 0.1;
    if (queueRef.current) queueRef.current.style.borderColor = a === 3 ? P.fg : P.div;
    if (queueRowRef.current) queueRowRef.current.style.opacity = rowIn ? '1' : '0';
    if (countRef.current) {
      countRef.current.textContent = rowDone ? 'row removed' : rowIn ? 'row added' : '';
      countRef.current.style.color = rowDone ? P.red : P.live;
    }
    let sec = 18;
    if (a === 4) sec = Math.round(18 * (1 - clamp01(p / 0.9)));
    if (a === 5) sec = 0;
    const timerShown = (a === 3 && p > 0.5) || a >= 4;
    const timerColor = a === 4 ? P.fg : a === 5 ? P.live : P.lbl;
    if (timerBoxRef.current) timerBoxRef.current.style.borderColor = a >= 4 ? timerColor : P.div;
    if (timerTxtRef.current) {
      timerTxtRef.current.textContent = timerShown ? '00:00:' + pad(sec) : '--:--:--';
      timerTxtRef.current.style.color = timerShown ? timerColor : P.under;
    }

    // step 4 and 5: post, delete the row, log
    const posted = (a === 2 && p >= 0.15 && p < 0.4) || (a === 5 && p > 0.05);
    const channelLit = (a === 2 && p < 0.4) || (a === 5 && p > 0.05);
    const logged = a === 5 && p > 0.5;
    if (channelRef.current) channelRef.current.style.borderColor = channelLit ? P.fg : P.div;
    if (channelBodyRef.current) channelBodyRef.current.style.opacity = posted ? '1' : '0';
    if (logRef.current) logRef.current.style.borderColor = logged ? P.fg : P.div;
    if (logTxtRef.current) logTxtRef.current.style.opacity = logged ? '1' : '0';

    // arrows: 0 link>embed, 1 schedule trunk, 2 queue>timer, 3 timer>channel, 4 channel>log
    const vertical = (el: HTMLSpanElement | null, on: boolean) => {
      if (!el) return;
      el.style.clipPath = on ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)';
      el.style.transition = on ? 'clip-path .5s cubic-bezier(.65,0,.35,1)' : 'clip-path .3s ease-in';
    };
    vertical(arrows.current[0], a >= 1);
    vertical(arrows.current[2], (a === 3 && p > 0.5) || a >= 4);
    vertical(arrows.current[3], a === 5 && p > 0.05);
    vertical(arrows.current[4], a === 5 && p > 0.5);
    const trunk = arrows.current[1];
    if (trunk) {
      const on = a >= 3;
      trunk.style.clipPath = on ? 'inset(0 0 0 0)' : 'inset(100% 0 0 0)';
      trunk.style.transition = on ? 'clip-path .8s cubic-bezier(.65,0,.35,1)' : 'clip-path .3s ease-in';
    }

    let status = '';
    if (a === 0) status = 'Link pasted.';
    if (a === 1) status = 'First message parsed.';
    if (a === 2) status = p < 0.4 ? 'Send now: posts.' : 'Or pick a time.';
    if (a === 3) status = 'Row saved.';
    if (a === 4) status = 'Waiting for time.';
    if (a === 5) status = p < 0.5 ? 'Posted.' : 'Posted and logged.';
    if (statusRef.current) statusRef.current.textContent = status;

    putCaption({ num: captionNumRef, name: captionNameRef }, pad(a + 1) + ' / ' + pad(n), PHASES[a]);
  };

  const applyRef = useRef(apply);
  useLayoutEffect(() => { applyRef.current = apply; });
  useVizClock(elapsed, raf, applyRef, pausedRef, reducedRef, () => setPaused(true));

  const box = { position: 'absolute', boxSizing: 'border-box', border: `1px solid ${P.div}`, borderRadius: 8, transition: 'border-color .3s ease' } as const;
  const line = { position: 'absolute', width: 1, background: P.sep, clipPath: 'inset(0 0 100% 0)' } as const;
  const label = { fontSize: 11, color: P.lbl } as const;

  return (
    <>
      <div aria-hidden style={{ position: 'relative', height: 300 }}>
        <div ref={linkRef} style={{ ...box, left: 0, top: 0, width: '42%', height: 52, padding: '8px 12px' }}>
          <span style={label}>Discohook link</span>
          <span ref={urlRef} style={{ display: 'block', marginTop: 4, ...mono, fontSize: 10.5, color: P.fg, whiteSpace: 'nowrap', clipPath: 'inset(0 100% 0 0)' }}>discohook.org/&hellip;</span>
        </div>
        <span ref={arrowAt(0)} style={{ ...line, left: '21%', top: 52, height: 14 }} />

        <div ref={embedRef} style={{ ...box, left: 0, top: 66, width: '42%', height: 92, padding: '8px 12px' }}>
          <span style={label}>Embed</span>
          <div ref={embedBodyRef} style={{ display: 'flex', gap: 8, marginTop: 8, opacity: 0, transition: 'opacity .5s ease' }}>
            <span style={{ width: 2, borderRadius: 1, background: P.frame, flexShrink: 0 }} />
            <span style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
              <span style={{ height: 6, width: '70%', borderRadius: 3, background: P.sec }} />
              <span style={{ height: 5, width: '95%', borderRadius: 3, background: P.div }} />
              <span style={{ height: 5, width: '60%', borderRadius: 3, background: P.div }} />
              <span style={{ ...mono, fontSize: 10, alignSelf: 'flex-start', padding: '1px 6px', borderRadius: 3, border: `1px solid ${P.under}`, color: P.lbl }}>Button</span>
            </span>
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, top: 170, width: '42%', display: 'flex', gap: 6 }}>
          <span ref={sendRef} style={{ flex: 1, textAlign: 'center', fontSize: 11.5, padding: '5px 0', borderRadius: 6, border: `1px solid ${P.div}`, color: P.lbl, whiteSpace: 'nowrap', transition: 'border-color .25s ease, color .25s ease' }}>Send now</span>
          <span ref={schedRef} style={{ flex: 1, textAlign: 'center', fontSize: 11.5, padding: '5px 0', borderRadius: 6, border: `1px solid ${P.div}`, color: P.lbl, whiteSpace: 'nowrap', transition: 'border-color .25s ease, color .25s ease' }}>Schedule</span>
        </div>
        <div ref={timeRef} style={{ position: 'absolute', left: 0, top: 208, ...mono, fontSize: 11, lineHeight: 1.5, color: P.sec, whiteSpace: 'nowrap', opacity: 0, transition: 'opacity .4s ease' }}>
          20/10/2026 18:00<br />UTC+8
        </div>

        <span style={{ position: 'absolute', left: '42%', width: '10%', top: 37, height: 170 }}>
          <span ref={arrowAt(1)} style={{ position: 'absolute', inset: 0, clipPath: 'inset(100% 0 0 0)' }}>
            <span style={{ position: 'absolute', left: 0, top: 169, width: '50%', height: 1, background: P.sep }} />
            <span style={{ position: 'absolute', left: '50%', top: 0, width: 1, height: 170, background: P.sep }} />
            <span style={{ position: 'absolute', left: '50%', top: 0, width: '50%', height: 1, background: P.sep }} />
          </span>
        </span>

        <div ref={queueRef} style={{ ...box, left: '52%', top: 0, width: '48%', height: 72, padding: '8px 12px' }}>
          <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={label}>Queue</span>
            <span ref={countRef} style={{ ...mono, fontSize: 11, color: P.live }} />
          </span>
          <span ref={queueRowRef} style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, padding: '4px 8px', borderRadius: 4, border: `1px solid ${P.div}`, ...mono, fontSize: 11, opacity: 0, transition: 'opacity .4s ease' }}>
            <span style={{ color: P.fg }}>K7Q2XD</span>
            <span style={{ color: P.sec }}>18:00</span>
          </span>
        </div>
        <span ref={arrowAt(2)} style={{ ...line, left: '76%', top: 72, height: 10 }} />

        <div ref={timerBoxRef} style={{ ...box, left: '52%', top: 82, width: '48%', height: 74, padding: '8px 12px' }}>
          <span style={label}>Timer</span>
          <span ref={timerTxtRef} style={{ display: 'block', ...mono, fontSize: 20, lineHeight: 1.3, marginTop: 6, color: P.under }}>--:--:--</span>
        </div>
        <span ref={arrowAt(3)} style={{ ...line, left: '76%', top: 156, height: 10 }} />

        <div ref={channelRef} style={{ ...box, left: '52%', top: 166, width: '48%', height: 44, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={label}>Channel</span>
          <span ref={channelBodyRef} style={{ display: 'flex', gap: 6, flex: 1, minWidth: 0, opacity: 0, transition: 'opacity .4s ease' }}>
            <span style={{ width: 2, height: 22, borderRadius: 1, background: P.frame, flexShrink: 0 }} />
            <span style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, justifyContent: 'center' }}>
              <span style={{ height: 5, width: '80%', borderRadius: 3, background: P.sec }} />
              <span style={{ height: 5, width: '55%', borderRadius: 3, background: P.div }} />
            </span>
          </span>
        </div>
        <span ref={arrowAt(4)} style={{ ...line, left: '76%', top: 210, height: 10 }} />

        <div ref={logRef} style={{ ...box, left: '52%', top: 220, width: '48%', height: 54, padding: '8px 12px' }}>
          <span style={label}>Log channel</span>
          <span ref={logTxtRef} style={{ display: 'block', marginTop: 6, ...mono, fontSize: 10.5, lineHeight: 1.3, color: P.sec, whiteSpace: 'nowrap', opacity: 0, transition: 'opacity .4s ease' }}>jump link</span>
        </div>

        <span ref={statusRef} style={{ position: 'absolute', left: 0, top: 252, fontSize: 13, color: P.sec, whiteSpace: 'nowrap' }} />

        <span style={{ position: 'absolute', left: 0, top: 284, fontSize: 11, fontStyle: 'italic', color: P.lbl }}>example id, time and countdown</span>
        <span style={{ position: 'absolute', right: 0, top: 284, fontSize: 11, color: P.lbl }}>times in Manila</span>
      </div>
      <Caption P={P} numRef={captionNumRef} nameRef={captionNameRef} paused={paused} onToggle={toggle} />
    </>
  );
}
