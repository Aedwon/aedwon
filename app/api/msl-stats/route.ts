import { NextResponse } from "next/server";
import { buildMslStats, type HistoryResponse, type LiveResponse } from "@/lib/msl-stats";

// The MSL page's numbers, refreshed once a day from the bot's analytics API.
// The key lives only in the ANALYTICS_API_KEY environment variable on the server and is never sent to the browser.
// Without the key or when the bot's API is down this answers with an error and the page keeps its saved snapshot.

export const dynamic = "force-dynamic";

const BASE = process.env.MSL_ANALYTICS_URL ?? "https://discord-bot-omega-eight.vercel.app/api/analytics";
const DAY = 60 * 60 * 24;

async function pull<T>(query: string, key: string): Promise<T> {
  const res = await fetch(`${BASE}?${query}`, {
    headers: { Authorization: `Bearer ${key}` },
    next: { revalidate: DAY },
  });
  if (!res.ok) throw new Error(`analytics ${res.status}`);
  return (await res.json()) as T;
}

export async function GET() {
  const key = process.env.ANALYTICS_API_KEY;
  if (!key) return NextResponse.json({ error: "not configured" }, { status: 503 });
  try {
    const [hist, live] = await Promise.all([
      pull<HistoryResponse>("include=kpi,rollups&days=365&include_granular=true", key),
      pull<LiveResponse>("include=live&days=30", key),
    ]);
    return NextResponse.json(buildMslStats(hist, live), {
      headers: { "Cache-Control": `public, s-maxage=${DAY}, stale-while-revalidate=${DAY}` },
    });
  } catch {
    return NextResponse.json({ error: "upstream unavailable" }, { status: 502 });
  }
}
