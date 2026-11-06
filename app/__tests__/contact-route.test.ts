/** @vitest-environment node */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const send = vi.fn();
vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
  },
}));

const checkContactLimit = vi.fn();
vi.mock("@/lib/contact/ratelimit", () => ({ checkContactLimit: (h: Headers) => checkContactLimit(h) }));

import { POST } from "../api/contact/route";

const good = { name: "Maria Santos", mail: "maria@example.com", msg: "A booking app.", title: "", website: "" };
const sameOrigin = { origin: "http://x", host: "x" };
const post = (body: unknown, raw = false, headers: Record<string, string> = sameOrigin) =>
  POST(new Request("http://x/api/contact", { method: "POST", headers, body: raw ? (body as string) : JSON.stringify(body) }));

beforeEach(() => {
  checkContactLimit.mockReset();
  checkContactLimit.mockResolvedValue("ok");
  send.mockReset();
  send.mockResolvedValue({ data: { id: "1" }, error: null });
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe("POST /api/contact", () => {
  it("answers ok and sends nothing when the honeypot is filled", async () => {
    const res = await post({ ...good, website: "http://spam" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(send).not.toHaveBeenCalled();
  });

  it.each([
    ["empty name", { name: " " }],
    ["long name", { name: "a".repeat(101) }],
    ["bad email", { mail: "nope" }],
    ["long email", { mail: `${"a".repeat(250)}@x.co` }],
    ["empty message", { msg: "  " }],
    ["long message", { msg: "a".repeat(5001) }],
    ["long title", { title: "a".repeat(29) }],
    ["non-string name", { name: 5 }],
  ])("rejects %s with 400", async (_n, patch) => {
    const res = await post({ ...good, ...patch });
    expect(res.status).toBe(400);
    expect(send).not.toHaveBeenCalled();
  });

  it("rejects non-JSON and oversized bodies with 400", async () => {
    expect((await post("not json", true)).status).toBe(400);
    expect((await post({ ...good, msg: "a".repeat(21 * 1024) })).status).toBe(400);
  });

  it("answers 500 and logs when the key is missing", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const res = await post(good);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ ok: false });
    expect(console.error).toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it("sends with the visitor as replyTo and trims fields", async () => {
    const res = await post({ ...good, name: "  Maria  ", title: "Clinic" });
    expect(res.status).toBe(200);
    const arg = send.mock.calls[0][0];
    expect(arg.from).toBe("Aedwon contact <contact@aedwon.site>");
    expect(arg.to).toBe("aerol.balayon@gmail.com");
    expect(arg.replyTo).toBe("maria@example.com");
    expect(arg.subject).toBe("Portfolio: Maria · Clinic");
    expect(arg.text).toContain("Name: Maria");
    expect(arg.text).toContain("Email: maria@example.com");
    expect(arg.text).toContain("Title: Clinic");
    expect(arg.text).toContain("A booking app.");
  });

  it("omits the title from the subject when empty", async () => {
    await post(good);
    expect(send.mock.calls[0][0].subject).toBe("Portfolio: Maria Santos");
  });

  it("answers 502 without echoing the message when Resend errors", async () => {
    send.mockResolvedValue({ data: null, error: { name: "validation_error", message: "A booking app." } });
    const res = await post(good);
    expect(res.status).toBe(502);
    expect(JSON.stringify(await res.json())).not.toContain("booking");
  });

  it("answers 502 when Resend throws", async () => {
    send.mockRejectedValue(new Error("down"));
    expect((await post(good)).status).toBe(502);
  });

  it("rejects a missing Origin with 403", async () => {
    const res = await post(good, false, { host: "x" });
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ ok: false });
    expect(send).not.toHaveBeenCalled();
  });

  it("rejects a foreign Origin with 403", async () => {
    const res = await post(good, false, { origin: "https://evil.example", host: "x" });
    expect(res.status).toBe(403);
    expect(send).not.toHaveBeenCalled();
  });

  it("prefers x-forwarded-host over host", async () => {
    const headers = { origin: "https://aedwon.site", host: "internal", "x-forwarded-host": "aedwon.site" };
    expect((await post(good, false, headers)).status).toBe(200);
  });

  it("answers 429 and does not send when the visitor is limited", async () => {
    checkContactLimit.mockResolvedValue("visitor");
    const res = await post(good);
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ ok: false });
    expect(send).not.toHaveBeenCalled();
  });

  it("answers 429 and does not send when the global limit is hit", async () => {
    checkContactLimit.mockResolvedValue("global");
    expect((await post(good)).status).toBe(429);
    expect(send).not.toHaveBeenCalled();
  });

  it("does not check the limit for invalid or honeypot requests", async () => {
    await post({ ...good, name: " " });
    await post({ ...good, website: "spam" });
    expect(checkContactLimit).not.toHaveBeenCalled();
  });
});
