// The 520-wide media blocks used by Wall tiles and Index previews.
// Markup ported verbatim from WallIndex2.dc.html:90-130 (== generators/tileblocks.html);
// colours go through the per-media-kind token maps so light works without a second file.

import { LOGO } from '@/lib/design-v3/data/icons';

export type MediaKind = 'phone' | 'tv' | 'web' | 'discord' | 'term' | 'data' | 'repo' | 'paper';

export interface MediaBlockProps {
  kind: MediaKind;
  name: string;
  repo?: string;
  desc?: string;
  date?: string;
  mins?: string;
}

const mono = { fontFamily: "'Geist Mono', monospace" } as const;

export default function MediaBlock({ kind, name, repo, desc, date, mins }: MediaBlockProps) {
  if (kind === 'phone') {
    return (
      <div style={{ width: 520, height: 370, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        {[12, -12, 12].map((ty, i) => (
          <div key={i} style={{ width: 156, height: 330, padding: 5, boxSizing: 'border-box', borderRadius: 28, background: 'var(--dev-body)', border: '1px solid var(--dev-bezel)', boxShadow: 'var(--shadow-object)', translate: `0 ${ty}px` }}>
            <div style={{ position: 'relative', height: '100%', borderRadius: 23, background: 'var(--dev-screen)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...mono, fontSize: 12, color: 'var(--dev-label)', textAlign: 'center' }}>
              [screen {i + 1}]
              <span style={{ position: 'absolute', left: '50%', top: 7, width: 44, height: 13, marginLeft: -22, borderRadius: 99, background: '#000' }} />
            </div>
          </div>
        ))}
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
  // data
  return (
    <div style={{ width: 520, height: 300, boxSizing: 'border-box', borderRadius: 10, border: '1px solid var(--data-border)', background: 'var(--data-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...mono, fontSize: 12, color: 'var(--dev-label)', textAlign: 'center', boxShadow: 'var(--shadow-object)' }}>[{name} results]</div>
  );
}

// GitHub mark used by repo rows in the Index (WallIndex2.dc.html:324)
export const GITHUB_LOGO = LOGO.GitHub;
