/** @vitest-environment node */

import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "../api/msl-stats/route";

const hist = {
  meta: { generated_at: "2026-10-19T05:00:00+08:00" },
  data: {
    kpi: { total_messages: 10, total_voice_hours: 1, new_joins: 2, total_reactions: 3 },
    rollups: [{ date: "2026-10-01", total_messages: 10, total_voice_minutes: 60, new_joins: 2, granular: { new_verifications: 1 } }],
  },
};
const live = { data: { live: { peak_hours_heatmap: { Monday: Array(24).fill(1) } } } };

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("GET /api/msl-stats", () => {
  it("answers 503 without a key", async () => {
    vi.stubEnv("ANALYTICS_API_KEY", "");
    expect((await GET()).status).toBe(503);
  });

  it("sends the key upstream, never back, and returns an anonymous summary", async () => {
    vi.stubEnv("ANALYTICS_API_KEY", "test-key");
    const seen: string[] = [];
    vi.stubGlobal("fetch", vi.fn(async (url: string, init: { headers: Record<string, string> }) => {
      seen.push(init.headers.Authorization);
      return new Response(JSON.stringify(String(url).includes("include=live") ? live : hist), { status: 200 });
    }));
    const res = await GET();
    expect(res.status).toBe(200);
    expect(seen).toEqual(["Bearer test-key", "Bearer test-key"]);
    expect(res.headers.get("Cache-Control")).toContain("s-maxage=86400");
    const text = await res.text();
    expect(text).not.toContain("test-key");
    expect(JSON.parse(text).totals.messages).toBe(10);
  });

  it("answers 502 when the bot's API is down", async () => {
    vi.stubEnv("ANALYTICS_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn(async () => new Response("no", { status: 500 })));
    expect((await GET()).status).toBe(502);
  });
});
