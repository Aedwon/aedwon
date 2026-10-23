'use client';

// The MSL server in numbers. It shows the saved snapshot (lib/design-v3/data/msl-stats.json, refreshed with
// scripts/pull-msl-stats.mjs) and swaps in the daily numbers from /api/msl-stats when that answers.
// Aggregates only. Still, so there is no clock or pause button.

import { useEffect, useState, type CSSProperties } from 'react';
import { mono, type Pal } from '../SystemViz';
import snapshot from '@/lib/design-v3/data/msl-stats.json';
import { isMslStats, type MslStats } from '@/lib/msl-stats';
import { useTheme } from '@/lib/design-v3/theme';

const nf = new Intl.NumberFormat('en-US');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const short = (n: number) => (n >= 1000 ? Math.round(n / 1000) + 'k' : String(n));
const dayLabel = (iso: string) => { const [, m, d] = iso.split('-'); return Number(d) + ' ' + MONTHS[Number(m) - 1]; };
const hourLabel = (h: number) => (h === 0 ? '12a' : h < 12 ? h + 'a' : h === 12 ? '12p' : h - 12 + 'p');
const ordinal = (day: number) => `${day}${day % 100 >= 11 && day % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[day % 10] || 'th'}`;

export default function MslNumbersViz({ P }: { P: Pal }) {
  const { theme } = useTheme();
  const light = theme === 'light';
  const [stats, setStats] = useState<MslStats>(snapshot as MslStats);
  const [fresh, setFresh] = useState(false);
  useEffect(() => {
    let live = true;
    fetch('/api/msl-stats')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (live && isMslStats(j)) { setStats(j); setFresh(true); } })
      .catch(() => {});
    return () => { live = false; };
  }, []);
  const cells: [string, string][] = [
    ['messages', nf.format(stats.totals.messages)],
    ['voice hours', nf.format(stats.totals.voiceHours)],
    ['joins', nf.format(stats.totals.joins)],
    ['verifications', nf.format(stats.totals.verifications)],
    ['tickets', nf.format(stats.totals.tickets)],
  ];
  const maxM = Math.max(...stats.monthly.map((m) => m.messages));
  const maxH = Math.max(...stats.messagesByHour);
  const peakHour = stats.messagesByHour.indexOf(maxH);
  const bar = (on: boolean): CSSProperties => ({ width: '100%', borderRadius: 2, background: on ? (light ? P.sec : P.fg) : (light ? P.sep : P.div) });
  const labelSize = light ? 12 : 11;
  const tickSize = light ? 11 : 10;
  const first = stats.monthly[0].month, last = stats.monthly[stats.monthly.length - 1].month;
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: light ? 24 : 22 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(92px, 1fr))', gap: '14px 12px' }}>
          {cells.map(([label, value]) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ ...mono, fontSize: 19, color: P.fg }}>{value}</span>
              <span style={{ fontSize: labelSize, color: P.lbl }}>{label}</span>
            </div>
          ))}
        </div>
        <div>
          <span style={{ fontSize: labelSize, color: light ? P.sec : P.lbl }}>Messages per month</span>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100, marginTop: 8 }}>
            {stats.monthly.map((m) => (
              <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: 4 }}>
                <span style={{ ...mono, fontSize: tickSize, color: P.sec }}>{short(m.messages)}</span>
                <div title={`${nf.format(m.messages)} messages`} style={{ ...bar(m.month === last), height: Math.max(2, (m.messages / maxM) * 70) }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            {stats.monthly.map((m) => (
              <span key={m.month} style={{ flex: 1, textAlign: 'center', ...mono, fontSize: tickSize, color: P.lbl }}>
                {MONTHS[Number(m.month.slice(5)) - 1]}{m.month === first || m.month === last ? '*' : ''}
              </span>
            ))}
          </div>
        </div>
        <div>
          <span style={{ fontSize: labelSize, color: light ? P.sec : P.lbl }}>Messages by hour of day, last 30 days (Manila time), peak {hourLabel(peakHour)}</span>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 44, marginTop: 8 }}>
            {stats.messagesByHour.map((v, h) => (
              <div key={h} title={`${hourLabel(h)}: ${nf.format(v)} messages`} style={{ ...bar(h === peakHour), flex: 1, height: Math.max(2, (v / maxH) * 44) }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: light ? 6 : 4, ...mono, fontSize: tickSize, color: P.lbl }}>
            <span>12a</span><span>6a</span><span>12p</span><span>6p</span><span>11p</span>
          </div>
        </div>
      </div>
      <div style={{ paddingTop: light ? 14 : 12, borderTop: '1px solid ' + (light ? P.hair2 : P.track), fontSize: labelSize, fontStyle: light ? 'normal' : 'italic', color: P.lbl, lineHeight: 1.5 }}>
        {fresh ? "From the bot's analytics API, updated daily, last pulled" : "Snapshot from the bot's analytics API, pulled"} {dayLabel(stats.pulledAt)} {stats.pulledAt.slice(0, 4)}. {stats.daysRecorded} recorded days from {dayLabel(stats.firstDay)}, so *{MONTHS[Number(first.slice(5)) - 1]} starts on the {ordinal(Number(stats.firstDay.slice(8)))} and {MONTHS[Number(last.slice(5)) - 1]} ends on the {ordinal(Number(stats.lastDay.slice(8)))}.
      </div>
    </>
  );
}
