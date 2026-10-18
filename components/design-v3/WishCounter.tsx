'use client';

// The wish counter section of the Genshin project page: my saved wish history as pity,
// five-star history and a pity chart. Read-only; the numbers come from lib/data/genshin-wishes
// through calculateWishStats. Loaded on demand (see WishCounterLazy) so the history stays out of
// the main bundle.

import { useMemo, useState, type CSSProperties } from 'react';
import { GENSHIN_WISHES } from '@/lib/data/genshin-wishes';
import { calculateWishStats, type GenshinBannerType } from '@/lib/genshin-wish-stats';

const mono = { fontFamily: "'Geist Mono', monospace" } as const;

const BANNERS: { id: GenshinBannerType; label: string; hard: number; soft: number }[] = [
  { id: 'character', label: 'Character', hard: 90, soft: 74 },
  { id: 'weapon', label: 'Weapon', hard: 80, soft: 63 },
  { id: 'standard', label: 'Standard', hard: 90, soft: 74 },
];

const PRIMOGEMS_PER_WISH = 160;

const fmtDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Manila' });

function pityColor(pity: number, soft: number) {
  return pity < soft ? 'var(--status-live)' : 'var(--status-wip)';
}

export default function WishCounter({ compact = false }: { compact?: boolean }) {
  const [banner, setBanner] = useState<GenshinBannerType>('character');
  const spec = BANNERS.find((b) => b.id === banner)!;

  const stats = useMemo(() => calculateWishStats(GENSHIN_WISHES, banner), [banner]);
  const updated = useMemo(
    () => GENSHIN_WISHES.reduce((latest, w) => (w.time > latest ? w.time : latest), ''),
    [],
  );
  const since = useMemo(() => {
    const times = GENSHIN_WISHES.filter((w) => w.bannerType === banner).map((w) => w.time);
    return times.length ? times.reduce((a, b) => (a < b ? a : b)) : '';
  }, [banner]);

  const chart = useMemo(
    () => (stats ? [...stats.fiveStarHistory].reverse().filter((h) => h.pity !== null) : []),
    [stats],
  );

  const pad = compact ? 16 : 24;
  const card: CSSProperties = { border: '1px solid var(--line-hairline-2)', borderRadius: 12, background: 'var(--surface-media)', boxSizing: 'border-box' };
  const label: CSSProperties = { ...mono, fontSize: 11.5, color: 'var(--text-label)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 14 : 18, marginTop: 8 }}>
      <div role="group" aria-label="Banner" style={{ display: 'flex', gap: compact ? 6 : 8, flexWrap: 'wrap' }}>
        {BANNERS.map((b) => (
          <button
            key={b.id}
            type="button"
            aria-pressed={banner === b.id}
            onClick={() => setBanner(b.id)}
            style={{
              height: 34, padding: '0 14px', borderRadius: 99, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14,
              border: '1px solid ' + (banner === b.id ? 'var(--text-primary)' : 'var(--line-hairline-2)'),
              background: banner === b.id ? 'var(--fill-inverse)' : 'transparent',
              color: banner === b.id ? 'var(--text-on-inverse)' : 'var(--text-secondary)',
              transition: 'background-color .2s ease, color .2s ease, border-color .2s ease',
            }}
          >
            {b.label}
          </button>
        ))}
      </div>

      {!stats ? (
        <div style={{ ...card, padding: pad, color: 'var(--text-secondary)', fontSize: 15 }}>No saved wishes on this banner yet.</div>
      ) : (
        <>
          <div style={{ ...card, padding: pad, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontSize: compact ? 48 : 64, fontWeight: 600, letterSpacing: '-0.05em', lineHeight: 1, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{stats.currentFiveStarPity}</span>
                <span style={{ ...mono, fontSize: 13, color: 'var(--text-label)' }}>/ {spec.hard} pulls since last 5★</span>
              </div>
              <span style={{ ...mono, fontSize: 12.5, color: 'var(--text-secondary)' }}>4★ pity {stats.currentFourStarPity} / 10</span>
            </div>
            <div
              role="img"
              aria-label={`${stats.currentFiveStarPity} of ${spec.hard} pulls to guaranteed 5 star, soft pity from ${spec.soft}`}
              style={{ position: 'relative', height: 8, borderRadius: 99, background: 'var(--line-track)' }}
            >
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.min(100, (stats.currentFiveStarPity / spec.hard) * 100)}%`, borderRadius: 99, background: pityColor(stats.currentFiveStarPity, spec.soft), transition: 'width .5s cubic-bezier(.22,1,.36,1), background-color .3s ease' }} />
              <div style={{ position: 'absolute', left: `${(spec.soft / spec.hard) * 100}%`, top: -4, bottom: -4, width: 1.5, background: 'var(--line-frame)' }} />
            </div>
            <div style={{ position: 'relative', height: 14, ...label }}>
              <span style={{ position: 'absolute', left: `${(spec.soft / spec.hard) * 100}%`, translate: '-100% 0', paddingRight: 8, whiteSpace: 'nowrap' }}>soft pity {spec.soft}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: compact ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))', gap: compact ? 10 : 12 }}>
            {[
              { k: 'Wishes', v: stats.totalWishes.toLocaleString('en-US') },
              { k: '5★ pulled', v: String(stats.fiveStarCount) },
              { k: 'Average 5★ pity', v: stats.averageFiveStarPity === null ? '-' : stats.averageFiveStarPity.toFixed(1) },
              { k: 'Primogems spent', v: (stats.totalWishes * PRIMOGEMS_PER_WISH).toLocaleString('en-US') },
            ].map((m) => (
              <div key={m.k} style={{ ...card, padding: compact ? '12px 14px' : '16px 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={label}>{m.k}</span>
                <span style={{ fontSize: compact ? 22 : 26, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{m.v}</span>
              </div>
            ))}
          </div>

          {chart.length > 0 && (
            <div style={{ ...card, padding: pad, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <span style={label}>Pulls it took to get each 5★ (oldest to newest)</span>
              <div role="img" aria-label={`Pity of each 5 star: ${chart.map((c) => `${c.name} ${c.pity}`).join(', ')}`} style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: compact ? 6 : 10, height: compact ? 110 : 140 }}>
                <div aria-hidden style={{ position: 'absolute', left: 0, right: 0, bottom: `${(spec.soft / spec.hard) * 100}%`, borderTop: '1px dashed var(--line-hover)' }} />
                {chart.map((c) => (
                  <div key={c.id} title={`${c.name}: ${c.pity}`} style={{ flex: '1 1 0', minWidth: 0, maxWidth: 56, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', height: '100%', gap: 4 }}>
                    <span style={{ ...mono, fontSize: 11, color: 'var(--text-secondary)' }}>{c.pity}</span>
                    <div style={{ width: '100%', height: `${((c.pity as number) / spec.hard) * 100}%`, minHeight: 3, borderRadius: 3, background: pityColor(c.pity as number, spec.soft) }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ ...label, paddingBottom: 8 }}>5★ history</span>
            {stats.fiveStarHistory.map((h) => (
              <div key={h.id} style={{ display: 'grid', gridTemplateColumns: compact ? 'minmax(0, 1fr) auto' : 'minmax(0, 1fr) 90px 130px', alignItems: 'baseline', columnGap: 16, rowGap: 2, padding: '12px 0', borderTop: '1px solid var(--line-hairline)' }}>
                <span style={{ fontSize: 15.5, fontWeight: 500, color: 'var(--text-primary)', minWidth: 0 }}>
                  {h.name}
                  <span style={{ ...mono, fontSize: 11.5, color: 'var(--text-label)', marginLeft: 10 }}>{h.itemType}</span>
                </span>
                <span style={{ ...mono, fontSize: 13, textAlign: compact ? 'right' : 'left', color: h.pity === null ? 'var(--text-tertiary)' : pityColor(h.pity, spec.soft) }}>
                  {h.pity === null ? 'pity unknown' : `${h.pity} pulls`}
                </span>
                <span style={{ ...mono, fontSize: 12.5, color: 'var(--text-label)', textAlign: 'right', gridColumn: compact ? '1 / -1' : undefined }}>{fmtDate.format(new Date(h.time))}</span>
              </div>
            ))}
            {stats.fiveStarHistory.length === 0 && <span style={{ fontSize: 15, color: 'var(--text-secondary)', borderTop: '1px solid var(--line-hairline)', paddingTop: 12 }}>No 5★ yet on this banner.</span>}
          </div>

          <p style={{ margin: 0, ...label, lineHeight: 1.6 }}>
            Counted from my first saved pull on this banner ({since ? fmtDate.format(new Date(since)) : '-'}), so the first 5★ has no known pity. Updated {updated ? fmtDate.format(new Date(updated)) : '-'}.
          </p>
        </>
      )}
    </div>
  );
}
