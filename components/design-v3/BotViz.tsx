'use client';

// The animated system visuals on the MSL Network Bot and OPPO Hyper Legend Cup pages.
// Same frame, palette and clock as the Pantas visuals (SystemViz); each one is a file in ./botviz.

import type { ReactNode } from 'react';
import { useTheme } from '@/lib/design-v3/theme';
import { DARK, LIGHT, type Pal } from './SystemViz';
import MslVerifyViz from './botviz/MslVerifyViz';
import MslXpViz from './botviz/MslXpViz';
import MslQuizViz from './botviz/MslQuizViz';
import MslRaffleViz from './botviz/MslRaffleViz';
import MslQuestsViz from './botviz/MslQuestsViz';
import OppoVerifyViz from './botviz/OppoVerifyViz';
import OppoTicketsViz from './botviz/OppoTicketsViz';
import OppoMatchViz from './botviz/OppoMatchViz';
import OppoEmbedsViz from './botviz/OppoEmbedsViz';

const VIZ: Record<string, (props: { P: Pal }) => ReactNode> = {
  'msl-verify': MslVerifyViz,
  'msl-xp': MslXpViz,
  'msl-quiz': MslQuizViz,
  'msl-raffle': MslRaffleViz,
  'msl-quests': MslQuestsViz,
  'oppo-verify': OppoVerifyViz,
  'oppo-tickets': OppoTicketsViz,
  'oppo-match': OppoMatchViz,
  'oppo-embeds': OppoEmbedsViz,
};

export const isBotViz = (which: string) => which in VIZ;

export default function BotViz({ which }: { which: string }) {
  const { theme } = useTheme();
  const P = theme === 'light' ? LIGHT : DARK;
  const Viz = VIZ[which];
  if (!Viz) return null;
  return (
    <div style={{ width: '100%', boxSizing: 'border-box', background: P.bg, color: P.fg, fontFamily: "'Geist', system-ui, sans-serif", display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Viz P={P} />
    </div>
  );
}
