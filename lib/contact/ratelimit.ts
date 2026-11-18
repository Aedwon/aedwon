import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Rate limits for the contact form. Fails open: if Upstash is missing or errors, the email still sends.

export type LimitResult = "ok" | "visitor" | "global";

type Limiters = { visitor: Ratelimit; global: Ratelimit } | null;

let limiters: Limiters | undefined;
let warned = false;

function build(): Limiters {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  const redis = new Redis({ url, token });
  return {
    visitor: new Ratelimit({ redis, prefix: "contact", limiter: Ratelimit.slidingWindow(3, "1 h") }),
    global: new Ratelimit({ redis, prefix: "contact", limiter: Ratelimit.fixedWindow(50, "1 d") }),
  };
}

export function visitorKey(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || "unknown";
}

export async function checkContactLimit(headers: Headers): Promise<LimitResult> {
  if (limiters === undefined) limiters = build();
  if (!limiters) {
    if (!warned) {
      warned = true;
      console.warn("contact: rate limit disabled, Upstash env vars not set");
    }
    return "ok";
  }
  try {
    const visitor = await limiters.visitor.limit(visitorKey(headers));
    if (!visitor.success) return "visitor";
    const global = await limiters.global.limit("global");
    if (!global.success) return "global";
  } catch {
    console.error("contact: rate limiter failed, sending anyway.");
  }
  return "ok";
}
