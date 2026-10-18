'use client';

// MslQuestsViz: three daily quests. Slot 1 common, slot 2 uncommon, slot 3 rolled
// 70/25/5 (code weights). Rewards 50/150/500 XP (code values). Quest names,
// targets, progress and the roll result are examples.

import { useLayoutEffect, useRef } from 'react';
import { Caption, clamp01, easeInOut, easeOut, mono, putCaption, usePaused, useVizClock, type Pal } from '../SystemViz';

const NAMES = ['First open builds the board', 'Slot 3 rolls the odds', 'Activity moves progress', 'Quest pays its XP', 'Host date changes'];
const LABELS = ['Built on first open', 'Slot 3 only', 'Example: 3 of 10', 'Example: +50 XP', 'Host date changes'];

const CARDS = [
  { slot: 'slot 1', tier: 'common', xp: 50, target: 10 },
  { slot: 'slot 2', tier: 'uncommon', xp: 150, target: 5 },
  { slot: 'slot 3', tier: 'uncommon', xp: 150, target: 15 },
];
const ODDS = [
  { tier: 'common', w: 70 },
  { tier: 'uncommon', w: 25 },
  { tier: 'rare', w: 5 },
];
const LAND = 82.5; // example roll lands in the uncommon segment (70 to 95)

export default function MslQuestsViz({ P }: { P: Pal }) {
  const reducedRef = useRef(false);
  const { paused, pausedRef, toggle, setPaused } = usePaused();
  const elapsed = useRef(0);
  const raf = useRef(0);

  const labelRef = useRef<HTMLSpanElement>(null);
  const statRef = useRef<HTMLSpanElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const cardAt = (i: number) => (el: HTMLDivElement | null) => { if (el) cards.current[i] = el; };
  // per card: [tier, fill, count, reward]
  const parts = useRef<(HTMLSpanElement | null)[]>([]);
  const partAt = (i: number, k: number) => (el: HTMLSpanElement | null) => { if (el) parts.current[i * 4 + k] = el; };
  const oddsWrap = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLSpanElement>(null);
  const segs = useRef<(HTMLSpanElement | null)[]>([]);
  const segAt = (i: number) => (el: HTMLSpanElement | null) => { if (el) segs.current[i] = el; };
  const feed = useRef<(HTMLSpanElement | null)[]>([]);
  const feedAt = (i: number) => (el: HTMLSpanElement | null) => { if (el) feed.current[i] = el; };
  const emptyRef = useRef<HTMLSpanElement>(null);
  const captionNumRef = useRef<HTMLSpanElement>(null);
  const captionNameRef = useRef<HTMLSpanElement>(null);

  const apply = () => {
    const reduced = reducedRef.current;
    const n = NAMES.length;
    const STEP = 3600;
    const t = elapsed.current % (n * STEP);
    const a = reduced ? 3 : Math.floor(t / STEP); // reduced shows "quest pays its XP"
    const p = reduced ? 1 : (t % STEP) / STEP;

    // Slot 3 roll: sweep across the odds bar, then settle on the example result.
    let mark = 0;
    if (a === 1) {
      if (p < 0.45) mark = easeInOut(p / 0.45) * 100;
      else if (p < 0.85) mark = 100 - (100 - LAND) * easeInOut((p - 0.45) / 0.4);
      else mark = LAND;
    } else if (a > 1) mark = LAND;
    const landed = a > 1 || (a === 1 && p >= 0.85);

    // Example progress.
    let c = [0, 0, 0];
    if (a === 2) {
      c = [
        Math.round(3 * easeOut(clamp01((p - 0.1) / 0.5))),
        Math.round(2 * easeOut(clamp01((p - 0.25) / 0.5))),
        Math.round(4 * easeOut(clamp01((p - 0.4) / 0.5))),
      ];
    } else if (a === 3) {
      c = [3 + Math.round(7 * easeInOut(clamp01(p / 0.5))), 2, 4];
    }
    const done = a === 3 && c[0] >= CARDS[0].target;
    const xp = a === 3 ? Math.round(50 * easeOut(clamp01((p - 0.5) / 0.3))) : a === 4 && p < 0.4 ? 50 : 0;
    const newDay = a === 4 && p >= 0.4;
    const boardOn = a < 4 || p < 0.25;

    if (labelRef.current) labelRef.current.textContent = LABELS[a];
    if (statRef.current) statRef.current.textContent = 'day ' + (newDay ? 2 : 1) + ' · xp ' + xp;

    CARDS.forEach((cd, i) => {
      const el = cards.current[i];
      const shown = boardOn && (a > 0 || p > 0.12 + i * 0.22);
      if (el) {
        el.style.opacity = shown ? '1' : '0';
        el.style.transform = shown ? 'translateY(0px)' : 'translateY(10px)';
        el.style.borderColor = i === 0 && done ? P.live : i === 2 && a === 1 && !landed ? P.sep : P.div;
      }
      const tier = parts.current[i * 4], fill = parts.current[i * 4 + 1], cnt = parts.current[i * 4 + 2], rew = parts.current[i * 4 + 3];
      const known = i < 2 || landed;
      if (tier) {
        tier.textContent = known ? cd.tier : a === 1 ? 'rolling' : 'weighted';
        tier.style.color = known ? P.sec : P.lbl;
      }
      if (fill) {
        fill.style.width = (c[i] / cd.target * 100).toFixed(1) + '%';
        fill.style.background = i === 0 && done ? P.live : P.fg;
      }
      if (cnt) cnt.textContent = c[i] + '/' + cd.target;
      if (rew) {
        rew.textContent = known ? '+' + cd.xp + ' XP' : '';
        rew.style.color = i === 0 && done ? P.live : P.sec;
      }
    });

    if (oddsWrap.current) oddsWrap.current.style.opacity = a >= 1 && a < 4 ? '1' : a === 4 && p < 0.25 ? '1' : '0';
    if (markRef.current) markRef.current.style.left = mark.toFixed(1) + '%';
    segs.current.forEach((el, i) => {
      if (el) el.style.borderColor = landed && i === 1 ? P.fg : P.div;
    });

    // Activity ticks: message, reaction, voice.
    const win = [[0.1, 0.6], [0.25, 0.75], [0.4, 0.9]];
    feed.current.forEach((el, i) => {
      if (!el) return;
      const live = a === 2 && p >= win[i][0] && p <= win[i][1];
      el.style.opacity = a === 2 || a === 3 ? '1' : '0';
      el.style.borderColor = live ? P.fg : P.div;
      el.style.color = live ? P.fg : P.lbl;
    });
    if (emptyRef.current) emptyRef.current.style.opacity = a === 4 && p >= 0.5 ? '1' : '0';

    putCaption({ num: captionNumRef, name: captionNameRef }, String(a + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0'), NAMES[a]);
  };

  const applyRef = useRef(apply);
  useLayoutEffect(() => { applyRef.current = apply; });
  useVizClock(elapsed, raf, applyRef, pausedRef, reducedRef, () => setPaused(true));

  const bar = (w: string) => <span style={{ display: 'block', height: 4, width: w, borderRadius: 2, background: P.div }} />;

  return (
    <>
      <div aria-hidden style={{ position: 'relative', height: 300 }}>
        <span ref={labelRef} style={{ position: 'absolute', left: 0, top: 0, ...mono, fontSize: 11.5, color: P.fg, whiteSpace: 'nowrap' }} />
        <span ref={statRef} style={{ position: 'absolute', right: 0, top: 0, ...mono, fontSize: 11.5, color: P.sec, whiteSpace: 'nowrap' }} />

        {CARDS.map((cd, i) => (
          <div key={cd.slot} ref={cardAt(i)} style={{ position: 'absolute', left: `${i * 34.25}%`, top: 28, width: '31.5%', height: 122, boxSizing: 'border-box', padding: 9, display: 'flex', flexDirection: 'column', gap: 6, border: `1px solid ${P.div}`, borderRadius: 8, opacity: 0, transform: 'translateY(10px)', transition: 'opacity .5s ease, transform .6s cubic-bezier(.22,1,.36,1), border-color .3s ease' }}>
            <span style={{ ...mono, fontSize: 10.5, color: P.lbl }}>{cd.slot}</span>
            <span ref={partAt(i, 0)} style={{ fontSize: 11.5, color: P.sec }} />
            <span style={{ marginTop: 2, display: 'flex', flexDirection: 'column', gap: 5 }}>
              {bar('85%')}
              {bar('55%')}
            </span>
            <span style={{ flex: 1 }} />
            <span style={{ display: 'block', height: 3, borderRadius: 2, background: P.track, position: 'relative' }}>
              <span ref={partAt(i, 1)} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '0%', borderRadius: 2, background: P.fg }} />
            </span>
            <span style={{ display: 'flex', justifyContent: 'space-between', ...mono, fontSize: 10.5 }}>
              <span ref={partAt(i, 2)} style={{ color: P.fg }} />
              <span ref={partAt(i, 3)} style={{ color: P.sec }} />
            </span>
          </div>
        ))}

        <span ref={emptyRef} style={{ position: 'absolute', left: 0, right: 0, top: 80, textAlign: 'center', fontSize: 12, fontStyle: 'italic', color: P.lbl, opacity: 0, transition: 'opacity .5s ease' }}>no board yet, next /quests builds it</span>

        <div ref={oddsWrap} style={{ position: 'absolute', left: 0, right: 0, top: 168, height: 56, opacity: 0, transition: 'opacity .5s ease' }}>
          <span style={{ display: 'flex', height: 22, gap: 2 }}>
            {ODDS.map((o, i) => (
              <span key={o.tier} ref={segAt(i)} style={{ width: o.w + '%', boxSizing: 'border-box', border: `1px solid ${P.div}`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', ...mono, fontSize: 10.5, color: P.sec, transition: 'border-color .3s ease' }}>{o.w}</span>
            ))}
          </span>
          <span ref={markRef} style={{ position: 'absolute', left: '0%', top: -5, width: 1, height: 32, background: P.fg }} />
          <span style={{ position: 'absolute', left: 0, top: 30, fontSize: 11, color: P.lbl }}>common</span>
          <span style={{ position: 'absolute', left: '70%', top: 30, fontSize: 11, color: P.lbl }}>uncommon</span>
          <span style={{ position: 'absolute', right: 0, top: 30, fontSize: 11, color: P.lbl }}>rare</span>
        </div>

        {['message', 'reaction', 'voice minute'].map((f, i) => (
          <span key={f} ref={feedAt(i)} style={{ position: 'absolute', left: `${i * 34.25}%`, top: 234, width: '31.5%', height: 24, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${P.div}`, borderRadius: 6, ...mono, fontSize: 10.5, color: P.lbl, whiteSpace: 'nowrap', opacity: 0, transition: 'opacity .4s ease, border-color .25s ease, color .25s ease' }}>{f}</span>
        ))}

        <span style={{ position: 'absolute', left: 0, top: 278, fontSize: 11, fontStyle: 'italic', color: P.lbl }}>example quests</span>
        <span style={{ position: 'absolute', right: 0, top: 278, fontSize: 11, fontStyle: 'italic', color: P.lbl }}>odds and XP: from code</span>
      </div>
      <Caption P={P} numRef={captionNumRef} nameRef={captionNameRef} paused={paused} onToggle={toggle} />
    </>
  );
}
