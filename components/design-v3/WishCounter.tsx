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

// Art lives in public/genshin (portraits and weapon icons from the open Project Amber data, re-encoded to WebP).
// A name with no file just shows nothing: the image hides itself on error.
const slugOf = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function Art({ name, kind, size, style }: { name: string; kind: 'icon' | 'splash'; size?: number; style?: CSSProperties }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- small static WebP, no optimizer needed
    <img
      src={`/genshin/${slugOf(name)}-${kind}.webp`}
      alt=""
      draggable={false}
      width={size}
      height={size}
      onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
      style={{ display: 'block', ...style }}
    />
  );
}

function Item({ name, size }: { name: string; size: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- small static WebP, no optimizer needed
    <img src={`/genshin/item-${name}.webp`} alt="" width={size} height={size} draggable={false} style={{ display: 'block', flex: 'none' }} />
  );
}

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

  // standard banner wishes use Acquaint Fate, the other two use Intertwined Fate
  const fate = banner === 'standard' ? 'acquaint-fate' : 'intertwined-fate';
  const pad = compact ? 16 : 24;
  const card: CSSProperties = { border: '1px solid var(--line-hairline-2)', borderRadius: 12, background: 'var(--surface-media)', boxSizing: 'border-box' };
  const label: CSSProperties = { fontSize: 13, color: 'var(--text-label)' };

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
          {stats.lastFiveStar && (
            <div style={{ ...card, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: compact ? 'column' : 'row', alignItems: compact ? 'stretch' : 'stretch', justifyContent: 'space-between', height: compact ? 400 : 300, background: 'radial-gradient(90% 120% at 82% 40%, color-mix(in srgb, var(--status-wip) 20%, transparent) 0%, transparent 62%), radial-gradient(circle, var(--line-hairline-2) 1px, transparent 1.6px) 0 0 / 22px 22px, var(--surface-media)' }}>
              <div style={{ padding: compact ? '20px 20px 0' : '32px 0 32px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: compact ? 14 : 24, position: 'relative', zIndex: 1, flex: '0 1 52%' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, ...label, color: 'var(--status-wip)' }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2.5l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.7 5.9 21.1l1.4-6.8L2.2 9.6l6.9-.8z" /></svg>
                  Latest 5-star
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <span style={{ fontSize: compact ? 34 : 54, fontWeight: 600, letterSpacing: '-0.045em', lineHeight: 1.02, color: 'var(--text-primary)' }}>{stats.lastFiveStar.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 32, padding: '0 14px 0 6px', borderRadius: 99, background: 'var(--surface-sunken)', border: '1px solid var(--line-hairline-2)', fontSize: 14, color: stats.lastFiveStar.pity === null ? 'var(--text-tertiary)' : pityColor(stats.lastFiveStar.pity, spec.soft) }}>
                      <Item name={fate} size={22} />
                      {stats.lastFiveStar.pity === null ? '-' : stats.lastFiveStar.pity}
                    </span>
                    <span style={{ fontSize: 14, color: 'var(--text-label)' }}>{fmtDate.format(new Date(stats.lastFiveStar.time))}</span>
                  </div>
                </div>
              </div>
              <div style={{ position: 'relative', flex: compact ? 'none' : '1 1 48%', display: 'flex', alignItems: 'center', justifyContent: 'center', height: compact ? 210 : undefined }}>
                {stats.lastFiveStar.itemType === 'Character' ? (
                  <Art key={stats.lastFiveStar.id} name={stats.lastFiveStar.name} kind="splash" style={{ height: compact ? 210 : 340, width: 'auto', maxWidth: '110%', objectFit: 'contain', marginRight: compact ? 0 : -8 }} />
                ) : (
                  <Art key={stats.lastFiveStar.id} name={stats.lastFiveStar.name} kind="icon" size={compact ? 140 : 220} />
                )}
              </div>
            </div>
          )}

          <div style={{ ...card, padding: pad, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: compact ? 12 : 16 }}>
                <Item name={fate} size={compact ? 44 : 60} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: compact ? 40 : 54, fontWeight: 600, letterSpacing: '-0.05em', lineHeight: 1, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{stats.currentFiveStarPity}</span>
                    <span style={{ fontSize: 14, color: 'var(--text-label)' }}>/ {spec.hard}</span>
                  </span>
                </div>
              </div>
            </div>
            <div
              role="img"
              aria-label={`${stats.currentFiveStarPity} of ${spec.hard} wishes to guaranteed 5 star, soft pity from ${spec.soft}`}
              style={{ position: 'relative', height: 10, borderRadius: 99, background: 'var(--line-track)' }}
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
              { k: 'Wishes', v: stats.totalWishes.toLocaleString('en-US'), icon: fate },
              { k: 'Primogems spent', v: (stats.totalWishes * PRIMOGEMS_PER_WISH).toLocaleString('en-US'), icon: 'primogem' },
              { k: '5-star pulls', v: String(stats.fiveStarCount), icon: 'starglitter' },
              { k: 'Avg 5-star pity', v: stats.averageFiveStarPity === null ? '-' : stats.averageFiveStarPity.toFixed(1), icon: null },
            ].map((m) => (
              <div key={m.k} style={{ ...card, padding: compact ? '12px 14px' : '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                {m.icon ? <Item name={m.icon} size={compact ? 36 : 44} /> : (
                  <svg width={compact ? 36 : 44} height={compact ? 36 : 44} viewBox="0 0 44 44" fill="none" aria-hidden><circle cx="22" cy="22" r="17" stroke="var(--line-hover)" strokeWidth="3" /><path d="M22 5a17 17 0 0 1 14.7 8.5" stroke="var(--status-wip)" strokeWidth="3" strokeLinecap="round" /><path d="M22 14.5l2.2 4.7 5.1.6-3.8 3.5 1 5.1-4.5-2.6-4.5 2.6 1-5.1-3.8-3.5 5.1-.6z" fill="var(--status-wip)" /></svg>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                  <span style={label}>{m.k}</span>
                  <span style={{ fontSize: compact ? 22 : 26, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{m.v}</span>
                </div>
              </div>
            ))}
          </div>

          {(
            <div style={{ ...card, padding: pad, display: 'flex', flexDirection: 'column', gap: 14, height: compact ? 230 : 290 }}>
              <span style={label}>Wishes per 5-star</span>
              <div role="img" aria-label={`Pity of each 5 star: ${chart.map((c) => `${c.name} ${c.pity}`).join(', ')}`} style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: compact ? 6 : 10, height: compact ? 140 : 180 }}>
                <div aria-hidden style={{ position: 'absolute', left: 0, right: 0, bottom: `${(spec.soft / spec.hard) * 100}%`, borderTop: '1px dashed var(--line-hover)' }} />
                {chart.map((c) => (
                  <div key={c.id} title={`${c.name}: ${c.pity}`} style={{ flex: '1 1 0', minWidth: 0, maxWidth: 56, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', height: '100%', gap: 4 }}>
                    <span style={{ ...mono, fontSize: 11, color: 'var(--text-secondary)' }}>{c.pity}</span>
                    <div style={{ width: '100%', height: `${((c.pity as number) / spec.hard) * 100}%`, minHeight: 3, borderRadius: 3, background: pityColor(c.pity as number, spec.soft) }} />
                    <Art name={c.name} kind="icon" size={compact ? 22 : 32} style={{ borderRadius: 99, marginTop: 2 }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ ...label, paddingBottom: 8 }}>5-star history</span>
            {stats.fiveStarHistory.map((h) => (
              <div key={h.id} style={{ display: 'grid', gridTemplateColumns: compact ? 'minmax(0, 1fr) auto' : 'minmax(0, 1fr) 90px 130px', alignItems: 'center', columnGap: 16, rowGap: 2, padding: '12px 0', borderTop: '1px solid var(--line-hairline)' }}>
                <span style={{ fontSize: 15.5, fontWeight: 500, color: 'var(--text-primary)', minWidth: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Art name={h.name} kind="icon" size={36} style={{ borderRadius: 99, flex: 'none', background: 'var(--surface-sunken)' }} />
                  {h.name}
                </span>
                <span style={{ fontSize: 13, textAlign: compact ? 'right' : 'left', color: h.pity === null ? 'var(--text-tertiary)' : pityColor(h.pity, spec.soft) }}>
                  {h.pity === null ? '-' : h.pity}
                </span>
                <span style={{ ...mono, fontSize: 12.5, color: 'var(--text-label)', textAlign: 'right', gridColumn: compact ? '1 / -1' : undefined }}>{fmtDate.format(new Date(h.time))}</span>
              </div>
            ))}
            {stats.fiveStarHistory.length === 0 && <span style={{ fontSize: 15, color: 'var(--text-secondary)', borderTop: '1px solid var(--line-hairline)', paddingTop: 12 }}>No 5-star yet on this banner.</span>}
          </div>

          <p style={{ margin: 0, ...label, lineHeight: 1.6 }}>
            Since {since ? fmtDate.format(new Date(since)) : '-'}. Updated {updated ? fmtDate.format(new Date(updated)) : '-'}.
          </p>
        </>
      )}
    </div>
  );
}
