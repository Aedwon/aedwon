/** @vitest-environment node */

import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "../api/msl-stats/route";

const upstream = {
  meta: { generated_at: "2026-10-19T05:00:00+08:00" },
  data: {
    kpi: {
      total_messages: 10, total_voice_hours: 1, total_reactions: 3, peak_daily_messagers: 5, peak_daily_voice_users: 2,
      member_counts: { human_members: 100, verified_members: 10 },
    },
    rollups: [
      { date: "2026-10-01", total_messages: 10, total_voice_minutes: 60, new_joins: 2, new_leaves: 0, granular: { new_tickets: 1 } },
      { date: "2026-10-02", total_messages: 4, total_voice_minutes: 0, new_joins: 3, new_leaves: 1, granular: null },
    ],
    rankings: { top_events: [{ name: "Secret Event" }], quiz_global: { total_correct: 7 } },
  },
};

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("GET /api/msl-stats", () => {
  it("answers 503 without a key", async () => {
    vi.stubEnv("ANALYTICS_API_KEY", "");
    expect((await GET()).status).toBe(503);
  });

  it("makes one upstream call, sends the key upstream, never back, and returns an anonymous summary", async () => {
    vi.stubEnv("ANALYTICS_API_KEY", "test-key");
    const seen: { url: string; auth: string }[] = [];
    vi.stubGlobal("fetch", vi.fn(async (url: string, init: { headers: Record<string, string> }) => {
      seen.push({ url: String(url), auth: init.headers.Authorization });
      return new Response(JSON.stringify(upstream), { status: 200 });
    }));
    const res = await GET();
    expect(res.status).toBe(200);
    expect(seen).toHaveLength(1);
    expect(seen[0].auth).toBe("Bearer test-key");
    expect(seen[0].url).toContain("include=kpi,rollups,rankings&days=365&include_granular=true&ranking_limit=25");
    expect(res.headers.get("Cache-Control")).toContain("s-maxage=86400");
    expect(res.headers.get("Cache-Control")).toContain("stale-while-revalidate=86400");
    const text = await res.text();
    expect(text).not.toContain("test-key");
    expect(text).not.toContain("Secret Event");
    const body = JSON.parse(text);
    expect(body.totals.messages).toBe(10);
    expect(body.totals.events).toBe(1);
    expect(body.members.current).toBe(100);
  });

  it("answers 502 when the bot's API is down", async () => {
    vi.stubEnv("ANALYTICS_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn(async () => new Response("no", { status: 500 })));
    expect((await GET()).status).toBe(502);
  });
});
