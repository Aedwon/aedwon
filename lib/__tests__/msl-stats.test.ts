import { describe, expect, it } from "vitest";
import { buildMslStats, isMslStats, type AnalyticsResponse } from "../msl-stats";

// 2026-09-29 to 2026-10-04, with 10-02 missing from the rollups.
const res: AnalyticsResponse = {
  meta: { generated_at: "2026-10-05T05:29:44+08:00" },
  data: {
    kpi: {
      total_messages: 60, total_voice_hours: 1.6, total_reactions: 7, peak_daily_messagers: 9, peak_daily_voice_users: 4,
      member_counts: { human_members: 1000, verified_members: 120 },
    },
    rollups: [
      { date: "2026-09-29", total_messages: 10, total_voice_minutes: 60, new_joins: 5, new_leaves: 1, granular: { quiz_sessions: 1, event_raffles_created: 1, event_raffle_entries: 4, event_registrations: 3, new_referrals: 2, new_tickets: 1, ticket_ratings_count: 1, ticket_avg_rating: 5, quiz_top_3: [{ name: "Secret Person" }] } as never },
      { date: "2026-09-30", total_messages: 30, total_voice_minutes: 36, new_joins: 10, new_leaves: 0, granular: { quiz_sessions: 0, event_raffles_created: null, new_tickets: 2, ticket_ratings_count: 3, ticket_avg_rating: 4 } },
      { date: "2026-10-01", total_messages: 20, total_voice_minutes: 0, new_joins: 20, new_leaves: 10, granular: null },
      { date: "2026-10-03", total_messages: 0, total_voice_minutes: 0, new_joins: 100, new_leaves: 0 },
      { date: "2026-10-04", total_messages: 0, total_voice_minutes: 0, new_joins: 50, new_leaves: 20 },
    ],
    rankings: { top_events: [{ name: "Event One" }, { name: "Event Two" }], quiz_global: { total_correct: 99 } },
  },
};

describe("buildMslStats", () => {
  const s = buildMslStats(res);
  const at = (date: string) => s.members.curve.find((p) => p.date === date)?.members;

  it("works member counts backward from today, leaving missing days unchanged", () => {
    expect(s.members.current).toBe(1000);
    expect(s.members.verified).toBe(120);
    // 10-04 is 1000. 10-03 is 1000 - (50 - 20) = 970. 10-02 is 970 - 100 = 870 (10-02 has no row, so 10-01 is 870 too).
    // 10-01 is 870, 09-30 is 870 - 10 = 860, 09-29 is 860 - 10 = 850, the day before it would be 850 - 4.
    expect(at("2026-09-30")).toBe(860);
    expect(at("2026-09-29")).toBe(850);
  });
  it("curve is the first day, each earlier month end and the last day with no duplicates", () => {
    expect(s.members.curve.map((p) => p.date)).toEqual(["2026-09-29", "2026-09-30", "2026-10-04"]);
    expect(s.members.curve[s.members.curve.length - 1].members).toBe(1000);
  });
  it("does not repeat the last day when it is also a month end", () => {
    const r = structuredClone(res);
    r.data.rollups = r.data.rollups.slice(0, 2);
    const dates = buildMslStats(r).members.curve.map((p) => p.date);
    expect(dates).toEqual(["2026-09-29", "2026-09-30"]);
  });
  it("sums the granular rows and tolerates nulls and missing fields", () => {
    expect(s.totals).toMatchObject({
      quizDays: 1, raffles: 1, raffleEntries: 4, eventSignups: 3, referrals: 2, tickets: 3,
      events: 2, correctAnswers: 99, messages: 60, voiceHours: 2, reactions: 7,
      peakActive: 9, peakVoice: 4, peakMessages: 30,
    });
    expect(s.totals.supportRating).toBe(4.25);
  });
  it("falls back to zero without rankings or ratings and uses the API's own date", () => {
    const r = structuredClone(res);
    delete r.data.rankings;
    r.data.rollups.forEach((x) => { x.granular = null; });
    const t = buildMslStats(r).totals;
    expect([t.events, t.correctAnswers, t.supportRating]).toEqual([0, 0, 0]);
    expect(s.pulledAt).toBe("2026-10-05");
  });
  it("carries no names or ids", () => {
    const json = JSON.stringify(s);
    expect(json).not.toContain("Secret Person");
    expect(json).not.toContain("Event One");
    expect(Object.keys(s).sort()).toEqual(["daysRecorded", "firstDay", "lastDay", "members", "pulledAt", "timezone", "totals"]);
  });
});

describe("isMslStats", () => {
  it("accepts a built summary and rejects other shapes", () => {
    expect(isMslStats(buildMslStats(res))).toBe(true);
    expect(isMslStats({ error: "upstream unavailable" })).toBe(false);
    expect(isMslStats(null)).toBe(false);
  });
  it("rejects the old cached shape and a curve that is too short", () => {
    const old = { pulledAt: "2026-10-19", daysRecorded: 2, totals: { messages: 1 }, monthly: [{}], messagesByHour: Array(24).fill(0) };
    expect(isMslStats(old)).toBe(false);
    const s = buildMslStats(res);
    expect(isMslStats({ ...s, members: { ...s.members, curve: s.members.curve.slice(0, 1) } })).toBe(false);
    expect(isMslStats({ ...s, members: { ...s.members, curve: [{ date: "a", members: "1" }, { date: "b", members: 2 }] } })).toBe(false);
  });
});
