// The 520-wide media blocks used by Wall tiles and Index previews.
// Markup ported verbatim from WallIndex2.dc.html:90-130 (== generators/tileblocks.html);
// colours go through the per-media-kind token maps so light works without a second file.

import { LOGO } from '@/lib/design-v3/data/icons';
import type { Img } from '@/lib/design-v3/data/projects';

export type MediaKind = 'phone' | 'tv' | 'web' | 'discord' | 'term' | 'data' | 'repo' | 'paper' | 'wishes';

export interface MediaBlockProps {
  kind: MediaKind;
  name: string;
  repo?: string;
  desc?: string;
  date?: string;
  mins?: string;
  // a real picture: it replaces the drawing, cropped to the same frame (same size and corners) as the mockup it stands in for
  img?: Img | null;
  // phones: one picture per phone
  screens?: (Img | null)[] | null;
  // the frame height (520 wide always); the default for the kind when left out
  h?: number;
  // the local studio wraps each phone screen with its picture controls
  renderScreen?: (i: number, screen: React.ReactNode) => React.ReactNode;
}

// a picture cropped into its frame: which part stays in view (focus) and how close (zoom)
export function Photo({ img }: { img: Img }) {
  const f = img.focus || { x: 50, y: 50 }, z = img.zoom && img.zoom > 1 ? img.zoom : 1;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- already re-encoded to WebP by the studio upload
    <img src={img.src} alt={img.alt || ''} draggable={false} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${f.x}% ${f.y}%`, transform: z > 1 ? `scale(${z})` : undefined, transformOrigin: `${f.x}% ${f.y}%` }} />
  );
}

// the height of each kind's 520-wide frame
export const FRAME_H: Record<string, number> = { phone: 370, tv: 330, web: 325, discord: 325, term: 300, data: 300, repo: 260, paper: 300, wishes: 300 };
// the frame height of a project: the one you set in the studio, or the default for its kind
export const frameH = (p: { media: string; frame?: { h: number } }): number => p.frame?.h ?? FRAME_H[p.media] ?? 300;

const mono = { fontFamily: "'Geist Mono', monospace" } as const;

export default function MediaBlock({ kind, name, repo, desc, date, mins, img, screens, h, renderScreen }: MediaBlockProps) {
  const H = h ?? FRAME_H[kind] ?? 300;
  if (kind !== 'phone' && img?.src) {
    return (
      <div style={{ width: 520, height: H, borderRadius: 14, overflow: 'hidden', boxSizing: 'border-box', background: 'var(--dev-screen)', border: '1px solid var(--dev-bezel)', boxShadow: 'var(--shadow-object)' }}>
        <Photo img={img} />
      </div>
    );
  }
  if (H !== (FRAME_H[kind] ?? 300) && kind !== 'phone') {
    // a drawn mockup in a frame of another height: it stays its own size, centred
    return <div style={{ width: 520, height: H, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MediaBlock kind={kind} name={name} repo={repo} desc={desc} date={date} mins={mins} /></div>;
  }
  if (kind === 'phone') {
    const PH = H - 40, PW = Math.round((PH * 156) / 330); // the phones keep their proportions as the frame grows or shrinks
    return (
      <div style={{ width: 520, height: H, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        {[12, -12, 12].map((ty, i) => {
          const shot = screens?.[i];
          const screen = shot?.src ? <Photo img={shot} /> : <>[screen {i + 1}]</>;
          return (
          <div key={i} style={{ width: PW, height: PH, padding: 5, boxSizing: 'border-box', borderRadius: 28, background: 'var(--dev-body)', border: '1px solid var(--dev-bezel)', boxShadow: 'var(--shadow-object)', translate: `0 ${ty}px` }}>
            <div style={{ position: 'relative', height: '100%', borderRadius: 23, overflow: 'hidden', background: 'var(--dev-screen)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...mono, fontSize: 12, color: 'var(--dev-label)', textAlign: 'center' }}>
              {renderScreen ? renderScreen(i, screen) : screen}
              <span style={{ position: 'absolute', left: '50%', top: 7, width: 44, height: 13, marginLeft: -22, borderRadius: 99, background: '#000' }} />
            </div>
          </div>
          );
        })}
      </div>
    );
  }
  if (kind === 'tv') {
    return (
      <div style={{ width: 520, height: 330, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 520, height: 301, padding: 10, boxSizing: 'border-box', borderRadius: 10, background: 'var(--dev-body)', border: '1px solid var(--dev-bezel)', boxShadow: 'var(--shadow-object)' }}>
          <div style={{ height: '100%', borderRadius: 2, background: 'var(--dev-screen)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...mono, fontSize: 12, color: 'var(--dev-label)', textAlign: 'center' }}>[{name} screen]</div>
        </div>
        <div style={{ width: 26, height: 12, background: 'var(--tv-neck)' }} />
        <div style={{ width: 150, height: 8, borderRadius: '4px 4px 2px 2px', background: 'var(--tv-foot)' }} />
      </div>
    );
  }
  if (kind === 'web') {
    return (
      <div style={{ width: 520, height: 325, boxSizing: 'border-box', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--web-border)', background: 'var(--web-body)', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-object)' }}>
        <div style={{ height: 20, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, padding: '0 10px', borderBottom: '1px solid var(--web-bar)' }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--web-dot)' }} />
          <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--web-dot)' }} />
          <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--web-dot)' }} />
        </div>
        <div style={{ flex: 1, background: 'var(--web-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...mono, fontSize: 12, color: 'var(--dev-label)', textAlign: 'center', padding: '0 16px' }}>[{name} screenshot]</div>
      </div>
    );
  }
  if (kind === 'discord') {
    return (
      <div style={{ width: 520, height: 325, boxSizing: 'border-box', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--dc-border)', display: 'flex', boxShadow: 'var(--shadow-object)' }}>
        <div style={{ width: 48, background: 'var(--dc-rail)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, paddingTop: 12 }}>
          <span style={{ width: 30, height: 30, borderRadius: 10, background: 'var(--dc-icon)' }} />
          <span style={{ width: 30, height: 30, borderRadius: 99, background: 'var(--dc-avatar)' }} />
          <span style={{ width: 30, height: 30, borderRadius: 99, background: 'var(--dc-avatar)' }} />
        </div>
        <div style={{ width: 124, background: 'var(--dc-channels)', display: 'flex', flexDirection: 'column', gap: 10, padding: '16px 12px', boxSizing: 'border-box' }}>
          <span style={{ height: 7, width: '70%', borderRadius: 4, background: 'var(--dc-icon)' }} />
          <span style={{ height: 6, width: '80%', borderRadius: 3, background: 'var(--dc-lines)' }} />
          <span style={{ height: 6, width: '60%', borderRadius: 3, background: 'var(--dc-icon)' }} />
          <span style={{ height: 6, width: '75%', borderRadius: 3, background: 'var(--dc-lines)' }} />
          <span style={{ height: 6, width: '55%', borderRadius: 3, background: 'var(--dc-lines)' }} />
        </div>
        <div style={{ flex: 1, background: 'var(--dc-chat)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...mono, fontSize: 12, color: 'var(--dc-label)', textAlign: 'center', padding: '0 16px' }}>[{name} in Discord]</div>
      </div>
    );
  }
  if (kind === 'term') {
    return (
      <div style={{ width: 520, height: 300, boxSizing: 'border-box', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--term-border)', background: 'var(--surface-terminal)', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-object)' }}>
        <div style={{ height: 24, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, padding: '0 10px', borderBottom: '1px solid var(--term-titlebar)' }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--term-dot)' }} />
          <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--term-dot)' }} />
          <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--term-dot)' }} />
        </div>
        <div style={{ padding: '18px 20px', ...mono, fontSize: 13, lineHeight: 1.8, color: 'var(--term-label)' }}>
          <div><span style={{ color: 'var(--term-prompt)' }}>$</span> [command]</div>
          <div>[real output from the repo]</div>
          <div><span style={{ color: 'var(--term-prompt)' }}>$</span> <span style={{ display: 'inline-block', width: 8, height: 15, verticalAlign: -2, background: 'var(--term-label)' }} /></div>
        </div>
      </div>
    );
  }
  if (kind === 'repo') {
    return (
      <div style={{ width: 520, height: 260, boxSizing: 'border-box', borderRadius: 10, border: '1px solid var(--data-border)', background: 'var(--web-body)', padding: '26px 28px', display: 'flex', flexDirection: 'column', gap: 14, boxShadow: 'var(--shadow-object)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, ...mono, fontSize: 14, color: 'var(--repo-name)' }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--repo-label)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M4 19.5V5a2 2 0 0 1 2-2h12v15H6a2 2 0 0 0-2 2z" />
            <path d="M8 7h6" />
          </svg>
          {repo}
        </span>
        <span style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--repo-desc)' }}>{desc}</span>
        <span style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid var(--repo-rule)', ...mono, fontSize: 12, color: 'var(--repo-label)' }}>[your PR or contribution]</span>
      </div>
    );
  }
  if (kind === 'paper') {
    return (
      <div style={{ position: 'relative', width: 520, height: 300, boxSizing: 'border-box', padding: '34px 36px 30px', borderRadius: 3, background: 'var(--sheet-bg)', border: '1px solid var(--sheet-border)', color: '#111113', display: 'flex', flexDirection: 'column', gap: 12, boxShadow: 'var(--shadow-object)' }}>
        <span style={{ ...mono, fontSize: 12, color: '#61616A' }}>{date}</span>
        <span style={{ fontSize: 25, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.12 }}>{name}</span>
        <span style={{ fontSize: 14.5, lineHeight: 1.55, color: '#3f3f46' }}>{desc}</span>
        <span style={{ marginTop: 'auto', fontSize: 13, color: '#61616A' }}>Read · {mins}</span>
      </div>
    );
  }
  if (kind === 'wishes') {
    // three 5-star portraits over a dotted gold glow. Art only, no numbers, so nothing here can go stale.
    return (
      <div style={{ position: 'relative', width: 520, height: H, boxSizing: 'border-box', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--data-border)', background: 'radial-gradient(70% 90% at 50% 45%, color-mix(in srgb, var(--status-wip) 22%, transparent) 0%, transparent 70%), radial-gradient(circle, var(--line-hairline-2) 1px, transparent 1.6px) 0 0 / 20px 20px, var(--data-body)', boxShadow: 'var(--shadow-object)' }}>
        {[['diluc', -24, 6, 245], ['odette', 292, 6, 245], ['ineffa', 128, 0, 300]].map(([n, x, y, ht]) => (
          // eslint-disable-next-line @next/next/no-img-element -- small static WebP
          <img key={n as string} src={`/genshin/tile-${n}.webp`} alt="" draggable={false} style={{ position: 'absolute', left: x as number, bottom: y as number, height: ht as number, width: 'auto' }} />
        ))}
        <span style={{ position: 'absolute', left: 20, top: 18, ...mono, fontSize: 11.5, color: 'var(--dev-label)' }}>{name}</span>
      </div>
    );
  }
  // data
  return (
    <div style={{ width: 520, height: 300, boxSizing: 'border-box', borderRadius: 10, border: '1px solid var(--data-border)', background: 'var(--data-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...mono, fontSize: 12, color: 'var(--dev-label)', textAlign: 'center', boxShadow: 'var(--shadow-object)' }}>[{name} results]</div>
  );
}

// GitHub mark used by repo rows in the Index (WallIndex2.dc.html:324)
export const GITHUB_LOGO = LOGO.GitHub;
