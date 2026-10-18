// The drawn diagrams on the bot projects. Each project's `media` is "flow-<id>" and picks its spec here.
// Nodes sit on the 520 by 260 canvas (x, y are the centre). An edge is a hop: `step` orders the hops, 0 first.
// Tone a is teal (where something starts), b is amber (where it ends up), c is a soft neutral.

export interface FlowNode { id: string; x: number; y: number; label: string; sub?: string; tone?: 'a' | 'b' | 'c'; w?: number }
export interface FlowEdge { from: string; to: string; step: number }
export interface FlowSpec { label: string; nodes: FlowNode[]; edges: FlowEdge[]; caption?: string }

export const FLOWS: Record<string, FlowSpec> = {
  cup: {
    label: 'A match starts, a result is logged, the other team acknowledges it, or a dispute pauses the timers and alerts the Marshals',
    nodes: [
      { id: 'start', x: 68, y: 86, label: '/match_start', sub: 'BO1, BO3, BO5', tone: 'a' },
      { id: 'result', x: 196, y: 86, label: '/game_result', sub: 'players log it', tone: 'a' },
      { id: 'ack', x: 324, y: 86, label: 'Acknowledge', sub: '5 min window', tone: 'c' },
      { id: 'saved', x: 452, y: 86, label: 'Result saved', sub: 'continues', tone: 'b' },
      { id: 'dispute', x: 324, y: 176, label: 'File dispute', sub: 'timers pause', tone: 'c' },
      { id: 'marshals', x: 452, y: 176, label: 'Marshals', sub: 'alerted', tone: 'b' },
    ],
    edges: [
      { from: 'start', to: 'result', step: 0 },
      { from: 'result', to: 'ack', step: 1 },
      { from: 'ack', to: 'saved', step: 2 },
      { from: 'ack', to: 'dispute', step: 2 },
      { from: 'dispute', to: 'marshals', step: 3 },
    ],
    caption: 'live matches are kept on disk, so a restart loses nothing',
  },
  ilocos: {
    label: 'Players verify through a panel, teams are added to the roster, the bracket links to Challonge, and results are reported back',
    nodes: [
      { id: 'verify', x: 68, y: 110, label: '/verifypanel', sub: 'game, then IGN', tone: 'a' },
      { id: 'teams', x: 196, y: 110, label: '/teams', sub: 'add, list', tone: 'a' },
      { id: 'bracket', x: 324, y: 110, label: 'Challonge', sub: 'bracket linked', tone: 'c' },
      { id: 'report', x: 452, y: 110, label: 'Result', sub: 'reported back', tone: 'b' },
      { id: 'db', x: 196, y: 195, label: 'MySQL', sub: 'players, teams', tone: 'c' },
    ],
    edges: [
      { from: 'verify', to: 'teams', step: 0 },
      { from: 'teams', to: 'bracket', step: 1 },
      { from: 'bracket', to: 'report', step: 2 },
      { from: 'teams', to: 'db', step: 1 },
    ],
    caption: 'sign-up through to a synced bracket',
  },
  oppo: {
    label: 'Verification, tickets and scheduled embeds all run through one bot, which assigns team roles and collects a rating when a ticket closes',
    nodes: [
      { id: 'verify', x: 68, y: 60, label: 'Verify', sub: 'team, UID', tone: 'a' },
      { id: 'ticket', x: 68, y: 130, label: 'Tickets', sub: '4 categories', tone: 'a' },
      { id: 'embed', x: 68, y: 200, label: 'Embeds', sub: 'scheduled', tone: 'a' },
      { id: 'bot', x: 260, y: 130, label: 'OPPO bot', sub: 'MySQL', tone: 'c', w: 104 },
      { id: 'roles', x: 452, y: 80, label: 'Team roles', sub: 'on verify', tone: 'b' },
      { id: 'rating', x: 452, y: 180, label: '5 star rating', sub: 'by DM on close', tone: 'b' },
    ],
    edges: [
      { from: 'verify', to: 'bot', step: 0 },
      { from: 'ticket', to: 'bot', step: 1 },
      { from: 'embed', to: 'bot', step: 2 },
      { from: 'bot', to: 'roles', step: 3 },
      { from: 'bot', to: 'rating', step: 4 },
    ],
  },
  msl: {
    label: 'Verification, quizzes and daily quests feed one XP and Event Points system, which drives levels, booster perks and a raffle export',
    nodes: [
      { id: 'verify', x: 68, y: 60, label: '/verify', sub: 'UID, server', tone: 'a' },
      { id: 'quiz', x: 68, y: 130, label: '/quiz', sub: 'speed bonus', tone: 'a' },
      { id: 'quests', x: 68, y: 200, label: '/quests', sub: '3 daily', tone: 'a' },
      { id: 'xp', x: 260, y: 130, label: 'XP + EP', sub: 'levels', tone: 'c', w: 104 },
      { id: 'perks', x: 452, y: 80, label: 'Booster perks', sub: 'colors, roles', tone: 'b' },
      { id: 'raffle', x: 452, y: 180, label: 'Raffle', sub: 'CSV for prizes', tone: 'b' },
    ],
    edges: [
      { from: 'verify', to: 'xp', step: 0 },
      { from: 'quiz', to: 'xp', step: 1 },
      { from: 'quests', to: 'xp', step: 2 },
      { from: 'xp', to: 'perks', step: 3 },
      { from: 'xp', to: 'raffle', step: 4 },
    ],
  },
  marwie: {
    label: 'A setting changed on the website is queued in a database, the bot is woken by a webhook ping, applies it to the server, and the status is shown back on the site',
    nodes: [
      { id: 'site', x: 68, y: 80, label: 'Dashboard', sub: 'Discord login', tone: 'a' },
      { id: 'queue', x: 196, y: 80, label: 'Queue', sub: 'Postgres', tone: 'c' },
      { id: 'wake', x: 324, y: 80, label: 'Wake ping', sub: 'webhook', tone: 'c' },
      { id: 'bot', x: 452, y: 80, label: 'Rob-bot', sub: 'applies it', tone: 'c' },
      { id: 'server', x: 452, y: 170, label: 'Server', sub: 'updated', tone: 'b' },
      { id: 'status', x: 68, y: 170, label: 'Status', sub: 'shown on site', tone: 'b' },
    ],
    edges: [
      { from: 'site', to: 'queue', step: 0 },
      { from: 'queue', to: 'wake', step: 1 },
      { from: 'wake', to: 'bot', step: 2 },
      { from: 'bot', to: 'server', step: 3 },
      { from: 'server', to: 'status', step: 4 },
    ],
    caption: 'the bot never serves HTTP, the site never reaches it directly',
  },
};
