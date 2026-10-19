import { describe, expect, it } from "vitest";
import { buildMslStats, isMslStats, type HistoryResponse, type LiveResponse } from "../msl-stats";

const hist: HistoryResponse = {
  meta: { generated_at: "2026-10-19T05:29:44+08:00" },
  data: {
    kpi: { total_messages: 30, total_voice_hours: 1.6, new_joins: 12, total_reactions: 7 },
    rollups: [
      { date: "2026-09-30", total_messages: 0, total_voice_minutes: 0, new_joins: 0, granular: null },
      { date: "2026-10-01", total_messages: 10, total_voice_minutes: 60, new_joins: 5, granular: { new_verifications: 2, new_tickets: 1 } },
      { date: "2026-10-02", total_messages: 20, total_voice_minutes: 36, new_joins: 7, granular: { new_verifications: 3 } },
      { date: "2026-11-01", total_messages: 0, total_voice_minutes: 0, new_joins: 0 },
    ],
  },
};
const heat = Object.fromEntries(["Monday", "Tuesday"].map((d) => [d, Array.from({ length: 24 }, (_, h) => (h === 20 ? 5 : 1))]));
const live: LiveResponse = { data: { live: { peak_hours_heatmap: heat } } };

describe("buildMslStats", () => {
  const s = buildMslStats(hist, live);
  it("keeps only days with activity and groups them by month", () => {
    expect(s.firstDay).toBe("2026-10-01");
    expect(s.lastDay).toBe("2026-10-02");
    expect(s.daysRecorded).toBe(2);
    expect(s.monthly).toEqual([{ month: "2026-10", messages: 30, joins: 12, voiceHours: 2, days: 2 }]);
  });
  it("sums verifications and tickets from the granular rows, tolerating missing ones", () => {
    expect(s.totals.verifications).toBe(5);
    expect(s.totals.tickets).toBe(1);
    expect(s.totals.voiceHours).toBe(2);
  });
  it("adds the heatmap into 24 hourly totals and uses the API's own date", () => {
    expect(s.messagesByHour).toHaveLength(24);
    expect(s.messagesByHour[20]).toBe(10);
    expect(s.pulledAt).toBe("2026-10-19");
  });
  it("carries no names or ids", () => {
    expect(Object.keys(s).sort()).toEqual(["daysRecorded", "firstDay", "lastDay", "messagesByHour", "monthly", "pulledAt", "timezone", "totals"]);
  });
});

describe("isMslStats", () => {
  it("accepts a built summary and rejects other shapes", () => {
    expect(isMslStats(buildMslStats(hist, live))).toBe(true);
    expect(isMslStats({ error: "upstream unavailable" })).toBe(false);
    expect(isMslStats(null)).toBe(false);
  });
});
