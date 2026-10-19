// Pulls a dated snapshot of the MSL Network Bot's community numbers from its analytics API and writes
// lib/design-v3/data/msl-stats.json, the fallback the page shows until the live endpoint answers.
// Aggregates only: no names, ids or channel names are kept (see lib/msl-stats.ts).
//
//   ANALYTICS_API_KEY=... node scripts/pull-msl-stats.mjs
//
// The key is read from the environment and is never written to the repo.

import fs from 'node:fs';
import { buildMslStats } from '../lib/msl-stats.ts';

const BASE = process.env.MSL_ANALYTICS_URL ?? 'https://discord-bot-omega-eight.vercel.app/api/analytics';
const key = process.env.ANALYTICS_API_KEY;
if (!key) { console.error('Set ANALYTICS_API_KEY first.'); process.exit(1); }

async function get(query) {
  const res = await fetch(`${BASE}?${query}`, { headers: { Authorization: `Bearer ${key}` } });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

const hist = await get('include=kpi,rollups&days=365&include_granular=true');
const live = await get('include=live&days=30');
const out = buildMslStats(hist, live);
fs.writeFileSync(new URL('../lib/design-v3/data/msl-stats.json', import.meta.url), JSON.stringify(out, null, 2) + '\n');
console.log('wrote msl-stats.json', out.firstDay, out.lastDay, out.totals);
