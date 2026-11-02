// Turns the MSL Network Bot's analytics API response into the small, anonymous summary the portfolio shows.
// Aggregates only: no names, ids or channel names get through. Used by the daily endpoint (app/api/msl-stats)
// and by scripts/pull-msl-stats.mjs. Keep this file free of enums and other non-erasable TypeScript, since the
// script runs it directly with Node.

export interface MslStats {
  pulledAt: string;
  timezone: string;
  firstDay: string;
  lastDay: string;
  daysRecorded: number;
  members: { current: number; verified: number; curve: { date: string; members: number }[] };
  totals: {
    messages: number; voiceHours: number; reactions: number;
    peakActive: number; peakMessages: number; peakVoice: number;
    quizDays: number; raffles: number; events: number;
    correctAnswers: number; eventSignups: number; raffleEntries: number;
    referrals: number; tickets: number; supportRating: number;
  };
}

interface Granular {
  quiz_sessions?: number | null;
  event_raffles_created?: number | null;
  event_raffle_entries?: number | null;
  event_registrations?: number | null;
  new_referrals?: number | null;
  new_tickets?: number | null;
  ticket_ratings_count?: number | null;
  ticket_avg_rating?: number | null;
}

interface Rollup {
  date: string;
  total_messages: number;
  total_voice_minutes: number;
  new_joins: number;
  new_leaves?: number | null;
  granular?: Granular | null;
}

export interface AnalyticsResponse {
  meta: { generated_at: string };
  data: {
    kpi: {
      total_messages: number; total_voice_hours: number; total_reactions: number;
      peak_daily_messagers: number; peak_daily_voice_users: number;
      member_counts: { human_members: number; verified_members: number };
    };
    rollups: Rollup[];
    rankings?: { top_events?: unknown[] | null; quiz_global?: { total_correct?: number | null } | null } | null;
  };
}

const DAY_MS = 86400000;
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
const stamp = (date: string) => Date.parse(date + "T00:00:00Z");
const isoDay = (t: number) => new Date(t).toISOString().slice(0, 10);

// Members per calendar day, worked backward from today's count. The API only has the current count,
// so each earlier day is the next day's count minus that day's joins and leaves. Missing days change nothing.
function memberCurve(rollups: Rollup[], current: number): { date: string; members: number }[] {
  if (rollups.length === 0) return [];
  const byDate = new Map(rollups.map((r) => [r.date, r]));
  const first = stamp(rollups[0].date);
  const last = stamp(rollups[rollups.length - 1].date);
  const daily = new Map<string, number>();
  let value = current;
  for (let t = last; t >= first; t -= DAY_MS) {
    const day = isoDay(t);
    daily.set(day, value);
    const r = byDate.get(day);
    if (r) value -= num(r.new_joins) - num(r.new_leaves);
  }
  const dates = [isoDay(first)];
  const firstDate = new Date(first);
  let ym = firstDate.getUTCFullYear() * 12 + firstDate.getUTCMonth();
  for (;; ym += 1) {
    const end = Date.UTC(Math.floor(ym / 12), (ym % 12) + 1, 0);
    if (end >= last) break;
    if (end > first) dates.push(isoDay(end));
  }
  if (last > first) dates.push(isoDay(last));
  return dates.map((date) => ({ date, members: daily.get(date) ?? current }));
}

export function buildMslStats(res: AnalyticsResponse): MslStats {
  const rollups = [...res.data.rollups].sort((a, b) => (a.date < b.date ? -1 : 1));
  const active = rollups.filter((r) => r.total_messages || r.new_joins || r.total_voice_minutes);
  let quizDays = 0, raffles = 0, raffleEntries = 0, eventSignups = 0, referrals = 0, tickets = 0, ratings = 0, ratingSum = 0;
  for (const r of rollups) {
    const g = r.granular;
    if (!g) continue;
    if (num(g.quiz_sessions) > 0) quizDays += 1;
    raffles += num(g.event_raffles_created);
    raffleEntries += num(g.event_raffle_entries);
    eventSignups += num(g.event_registrations);
    referrals += num(g.new_referrals);
    tickets += num(g.new_tickets);
    ratings += num(g.ticket_ratings_count);
    ratingSum += num(g.ticket_ratings_count) * num(g.ticket_avg_rating);
  }

  const k = res.data.kpi;
  const rk = res.data.rankings;
  const current = k.member_counts.human_members;
  return {
    pulledAt: res.meta.generated_at.slice(0, 10), // the API's own date, Manila time
    timezone: "Asia/Manila",
    firstDay: active[0]?.date ?? "",
    lastDay: active[active.length - 1]?.date ?? "",
    daysRecorded: active.length,
    members: { current, verified: k.member_counts.verified_members, curve: memberCurve(rollups, current) },
    totals: {
      messages: k.total_messages,
      voiceHours: Math.round(k.total_voice_hours),
      reactions: k.total_reactions,
      peakActive: k.peak_daily_messagers,
      peakMessages: rollups.reduce((max, r) => Math.max(max, num(r.total_messages)), 0),
      peakVoice: k.peak_daily_voice_users,
      quizDays,
      raffles,
      events: Array.isArray(rk?.top_events) ? rk.top_events.length : 0,
      correctAnswers: num(rk?.quiz_global?.total_correct),
      eventSignups,
      raffleEntries,
      referrals,
      tickets,
      supportRating: ratings > 0 ? Math.round((ratingSum / ratings) * 100) / 100 : 0,
    },
  };
}

const TOTAL_KEYS = [
  "messages", "voiceHours", "reactions", "peakActive", "peakMessages", "peakVoice", "quizDays", "raffles",
  "events", "correctAnswers", "eventSignups", "raffleEntries", "referrals", "tickets", "supportRating",
];

// Enough of a check that a bad or old-shape response from anywhere never reaches the page.
export function isMslStats(v: unknown): v is MslStats {
  const s = v as MslStats | null;
  if (!s || typeof s.pulledAt !== "string" || typeof s.daysRecorded !== "number") return false;
  if (!s.totals || TOTAL_KEYS.some((key) => typeof (s.totals as Record<string, unknown>)[key] !== "number")) return false;
  const m = s.members;
  return !!m && typeof m.current === "number" && typeof m.verified === "number" && Array.isArray(m.curve) && m.curve.length >= 2
    && m.curve.every((p) => !!p && typeof p.date === "string" && typeof p.members === "number");
}
