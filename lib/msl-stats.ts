// Turns the MSL Network Bot's analytics API responses into the small, anonymous summary the portfolio shows.
// Aggregates only: no names, ids or channel names get through. Used by the daily endpoint (app/api/msl-stats)
// and by scripts/pull-msl-stats.mjs. Keep this file free of enums and other non-erasable TypeScript, since the
// script runs it directly with Node.

export interface MslStats {
  pulledAt: string;
  timezone: string;
  firstDay: string;
  lastDay: string;
  daysRecorded: number;
  totals: { messages: number; voiceHours: number; joins: number; reactions: number; verifications: number; tickets: number };
  monthly: { month: string; messages: number; joins: number; voiceHours: number; days: number }[];
  messagesByHour: number[];
}

interface Rollup {
  date: string;
  total_messages: number;
  total_voice_minutes: number;
  new_joins: number;
  granular?: { new_verifications?: number; new_tickets?: number } | null;
}

export interface HistoryResponse {
  meta: { generated_at: string };
  data: {
    kpi: { total_messages: number; total_voice_hours: number; new_joins: number; total_reactions: number };
    rollups: Rollup[];
  };
}

export interface LiveResponse {
  data: { live: { peak_hours_heatmap: Record<string, number[]> } };
}

export function buildMslStats(hist: HistoryResponse, live: LiveResponse): MslStats {
  const rollups = hist.data.rollups;
  const active = rollups.filter((r) => r.total_messages || r.new_joins || r.total_voice_minutes);
  const months: Record<string, { messages: number; joins: number; voiceMinutes: number; days: number }> = {};
  let verifications = 0;
  let tickets = 0;
  for (const r of rollups) {
    const m = (months[r.date.slice(0, 7)] ??= { messages: 0, joins: 0, voiceMinutes: 0, days: 0 });
    m.messages += r.total_messages;
    m.joins += r.new_joins;
    m.voiceMinutes += r.total_voice_minutes;
    if (r.total_messages || r.new_joins) m.days += 1;
    verifications += r.granular?.new_verifications ?? 0;
    tickets += r.granular?.new_tickets ?? 0;
  }
  const monthly = Object.entries(months)
    .filter(([, m]) => m.days > 0)
    .map(([month, m]) => ({ month, messages: m.messages, joins: m.joins, voiceHours: Math.round(m.voiceMinutes / 60), days: m.days }));

  const heat = Object.values(live.data.live.peak_hours_heatmap);
  const messagesByHour = Array.from({ length: 24 }, (_, h) => heat.reduce((sum, day) => sum + (day[h] ?? 0), 0));

  const k = hist.data.kpi;
  return {
    pulledAt: hist.meta.generated_at.slice(0, 10), // the API's own date, Manila time
    timezone: "Asia/Manila",
    firstDay: active[0]?.date ?? "",
    lastDay: active[active.length - 1]?.date ?? "",
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
    messagesByHour,
  };
}

// Enough of a check that a bad response from anywhere never reaches the page.
export function isMslStats(v: unknown): v is MslStats {
  const s = v as MslStats | null;
  return !!s && typeof s.pulledAt === "string" && typeof s.daysRecorded === "number" && !!s.totals && typeof s.totals.messages === "number"
    && Array.isArray(s.monthly) && s.monthly.length > 0 && Array.isArray(s.messagesByHour) && s.messagesByHour.length === 24;
}
