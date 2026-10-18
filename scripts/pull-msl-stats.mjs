// Pulls a dated snapshot of the MSL Network Bot's community numbers from its analytics API and writes
// lib/design-v3/data/msl-stats.json. Aggregates only: no names, ids or channel names are kept.
//
//   ANALYTICS_API_KEY=... node scripts/pull-msl-stats.mjs
//
// The key is read from the environment and is never written to the repo.

import fs from 'node:fs';

const BASE = 'https://discord-bot-omega-eight.vercel.app/api/analytics';
const key = process.env.ANALYTICS_API_KEY;
if (!key) { console.error('Set ANALYTICS_API_KEY first.'); process.exit(1); }

async function get(query) {
  const res = await fetch(`${BASE}?${query}`, { headers: { Authorization: `Bearer ${key}` } });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

const hist = await get('include=kpi,rollups&days=365&include_granular=true');
const live = await get('include=live&days=30');

const rollups = hist.data.rollups;
const active = rollups.filter((r) => r.total_messages || r.new_joins || r.total_voice_minutes);
const months = {};
let verifications = 0, tickets = 0;
for (const r of rollups) {
  const m = (months[r.date.slice(0, 7)] ??= { messages: 0, joins: 0, voiceHours: 0, days: 0 });
  m.messages += r.total_messages;
  m.joins += r.new_joins;
  m.voiceHours += r.total_voice_minutes / 60;
  if (r.total_messages || r.new_joins) m.days += 1;
  verifications += r.granular?.new_verifications ?? 0;
  tickets += r.granular?.new_tickets ?? 0;
}
const monthly = Object.entries(months)
  .filter(([, m]) => m.days > 0)
  .map(([month, m]) => ({ month, messages: m.messages, joins: m.joins, voiceHours: Math.round(m.voiceHours), days: m.days }));

const heat = live.data.live.peak_hours_heatmap;
const byHour = Array.from({ length: 24 }, (_, h) => Object.values(heat).reduce((s, day) => s + (day[h] ?? 0), 0));

const k = hist.data.kpi;
const out = {
  pulledAt: hist.meta.generated_at.slice(0, 10), // the API's own date, Manila time
  timezone: 'Asia/Manila',
  firstDay: active[0].date,
  lastDay: active[active.length - 1].date,
  daysRecorded: active.length,
  totals: {
    messages: k.total_messages,
    voiceHours: Math.round(k.total_voice_hours),
    joins: k.new_joins,
    reactions: k.total_reactions,
    verifications,
    tickets,
  },
  monthly,
  messagesByHour: byHour,
};
fs.writeFileSync(new URL('../lib/design-v3/data/msl-stats.json', import.meta.url), JSON.stringify(out, null, 2) + '\n');
console.log('wrote msl-stats.json', out.firstDay, out.lastDay, out.totals);
