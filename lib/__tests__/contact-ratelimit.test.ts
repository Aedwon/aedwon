/** @vitest-environment node */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const limit = vi.fn();
vi.mock("@upstash/redis", () => ({ Redis: class {} }));
vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: class {
    static slidingWindow = () => "sliding";
    static fixedWindow = () => "fixed";
    limit = limit;
  },
}));

const load = async () => (await import("../contact/ratelimit")).checkContactLimit;
const headers = (h: Record<string, string> = {}) => new Headers(h);

beforeEach(() => {
  vi.resetModules();
  limit.mockReset();
  limit.mockResolvedValue({ success: true });
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
  vi.stubEnv("KV_REST_API_URL", "");
  vi.stubEnv("KV_REST_API_TOKEN", "");
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe("checkContactLimit", () => {
  it("skips the limit and warns once when Upstash is not configured", async () => {
    const check = await load();
    expect(await check(headers())).toBe("ok");
    expect(await check(headers())).toBe("ok");
    expect(limit).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  it("accepts the KV_REST_API names", async () => {
    vi.stubEnv("KV_REST_API_URL", "https://r.example");
    vi.stubEnv("KV_REST_API_TOKEN", "t");
    const check = await load();
    await check(headers());
    expect(limit).toHaveBeenCalled();
  });

  describe("configured", () => {
    beforeEach(() => {
      vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://r.example");
      vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "t");
    });

    it("keys the visitor by the first x-forwarded-for entry, then global", async () => {
      const check = await load();
      expect(await check(headers({ "x-forwarded-for": " 1.2.3.4 , 5.6.7.8" }))).toBe("ok");
      expect(limit.mock.calls.map((c) => c[0])).toEqual(["1.2.3.4", "global"]);
    });

    it("falls back to x-real-ip, then unknown", async () => {
      const check = await load();
      await check(headers({ "x-real-ip": "9.9.9.9" }));
      await check(headers());
      expect(limit.mock.calls.map((c) => c[0])).toEqual(["9.9.9.9", "global", "unknown", "global"]);
    });

    it("returns visitor and skips the global check when the visitor is over", async () => {
      limit.mockResolvedValueOnce({ success: false });
      const check = await load();
      expect(await check(headers())).toBe("visitor");
      expect(limit).toHaveBeenCalledTimes(1);
    });

    it("returns global when only the global limit is over", async () => {
      limit.mockResolvedValueOnce({ success: true }).mockResolvedValueOnce({ success: false });
      const check = await load();
      expect(await check(headers())).toBe("global");
    });

    it("fails open and logs when Upstash throws", async () => {
      limit.mockRejectedValue(new Error("down"));
      const check = await load();
      expect(await check(headers())).toBe("ok");
      expect(console.error).toHaveBeenCalled();
    });
  });
});
