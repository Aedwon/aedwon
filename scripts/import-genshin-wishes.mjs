import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const FETCH_SIZE = 20;
const DATA_FILE = new URL("../lib/data/genshin-wishes.ts", import.meta.url);
const ALLOWED_HOSTS = new Set([
  "public-operation-hk4e-sg.hoyoverse.com",
  "hk4e-api-os.hoyoverse.com",
  "hk4e-api-os.mihoyo.com",
  "public-operation-hk4e.mihoyo.com",
  "hk4e-api.mihoyo.com",
]);

const BANNERS = [
  { gachaType: "301", label: "Character" },
  { gachaType: "302", label: "Weapon" },
  { gachaType: "200", label: "Standard" },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseCaptureUrl(value) {
  const input = value.trim();
  const match = input.match(/https:\/\/[^\s<>]+/);
  if (!match) throw new Error("No HoYoVerse wish-history URL found in stdin.");

  const cleaned = match[0].replace(/[)\]}>,.;]+$/, "");
  const url = new URL(cleaned.replace(/\\&/g, "&"));

  if (!ALLOWED_HOSTS.has(url.hostname)) {
    throw new Error("The capture URL is not from an allowed HoYoVerse wish-history host.");
  }
  if (!url.pathname.endsWith("/gacha_info/api/getGachaLog")) {
    throw new Error("The capture URL is not a getGachaLog request.");
  }
  if (!url.searchParams.get("authkey")) {
    throw new Error("The capture URL does not contain an authkey.");
  }
  if (!url.searchParams.get("region")) {
    throw new Error("The capture URL does not contain a region.");
  }
  if (!url.searchParams.get("game_biz")) {
    throw new Error("The capture URL does not contain game_biz.");
  }

  return url;
}

export function buildGachaUrl(captureUrl, gachaType, page, endId) {
  const url = parseCaptureUrl(captureUrl);
  const isChina =
    url.hostname === "public-operation-hk4e.mihoyo.com" ||
    url.hostname === "hk4e-api.mihoyo.com";

  url.protocol = "https:";
  url.hostname = isChina
    ? "public-operation-hk4e.mihoyo.com"
    : "public-operation-hk4e-sg.hoyoverse.com";
  url.pathname = "/gacha_info/api/getGachaLog";
  url.hash = "";

  url.searchParams.set("auth_appid", "webview_gacha");
  url.searchParams.set("sign_type", "2");
  url.searchParams.set("init_type", "301");
  url.searchParams.set("lang", "en");
  url.searchParams.set("gacha_type", gachaType);
  url.searchParams.set("page", String(page));
  url.searchParams.set("size", String(FETCH_SIZE));
  url.searchParams.set("end_id", String(endId));

  return url;
}

function normalizeTime(value) {
  const trimmed = String(value).trim();
  const serverWallClock = trimmed.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})$/);
  if (serverWallClock) return `${serverWallClock[1]}T${serverWallClock[2]}Z`;

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid wish timestamp: ${trimmed}`);
  }
  return parsed.toISOString();
}

function bannerTypeFor(code) {
  if (code === "301" || code === "400") return "character";
  if (code === "302") return "weapon";
  if (code === "200") return "standard";
  return null;
}

export function normalizeRows(rows) {
  return rows.map((row) => {
    const bannerType = bannerTypeFor(String(row.gacha_type));
    if (!bannerType) throw new Error(`Unsupported gacha type: ${row.gacha_type}`);

    const rarity = Number(row.rank_type);
    if (![3, 4, 5].includes(rarity)) {
      throw new Error(`Unsupported rarity for wish ${row.id}.`);
    }

    const itemType = String(row.item_type).replace(/\s+/g, "");
    if (itemType !== "Character" && itemType !== "Weapon") {
      throw new Error(`Unsupported item type for wish ${row.id}.`);
    }

    return {
      id: String(row.id),
      bannerType,
      name: String(row.name),
      itemType,
      rarity,
      time: normalizeTime(row.time),
    };
  });
}

export function mergeWishRecords(existing, incoming) {
  const byId = new Map(existing.map((wish) => [wish.id, wish]));

  for (const wish of incoming) {
    const previous = byId.get(wish.id);
    const merged = { ...previous, ...wish };

    if (previous?.featured !== undefined && wish.featured === undefined) {
      merged.featured = previous.featured;
    }

    byId.set(wish.id, merged);
  }

  return [...byId.values()].sort((a, b) => {
    const timeDelta = a.time.localeCompare(b.time);
    if (timeDelta !== 0) return timeDelta;
    return a.id.localeCompare(b.id);
  });
}

function parseExistingWishes(source) {
  const match = source.match(
    /export const GENSHIN_WISHES: GenshinWishRecord\[\] = (\[[\s\S]*\]);\s*$/,
  );
  if (!match) throw new Error("Could not parse the existing Genshin wish data file.");
  return JSON.parse(match[1]);
}

function serializeWishes(wishes) {
  return `import type { GenshinWishRecord } from "@/lib/genshin-wish-stats";\n\n/**\n * Public, normalized wish history used by the portfolio dashboard.\n *\n * Keep temporary HoYoVerse credentials and captured wish-history URLs out of\n * this file. Populate it only with the durable wish records returned by the\n * history API.\n */\nexport const GENSHIN_WISHES: GenshinWishRecord[] = ${JSON.stringify(wishes, null, 2)};\n`;
}

async function fetchBanner(captureUrl, gachaType) {
  const wishes = [];
  let page = 1;
  let endId = "0";

  while (true) {
    const url = buildGachaUrl(captureUrl, gachaType, page, endId);
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`HoYoVerse wish-history request failed with HTTP ${response.status}.`);
    }

    const payload = await response.json();
    if (payload.retcode !== 0) {
      if (payload.message === "authkey timeout") {
        throw new Error("The HoYoVerse authkey has expired. Capture Wish History again and retry.");
      }
      throw new Error(
        `HoYoVerse wish-history API returned ${payload.retcode}: ${payload.message ?? "unknown error"}.`,
      );
    }

    const rows = payload.data?.list;
    if (!Array.isArray(rows)) {
      throw new Error("HoYoVerse returned an unexpected wish-history payload.");
    }
    if (rows.length === 0) break;

    wishes.push(...normalizeRows(rows));
    endId = String(rows.at(-1)?.id ?? "0");
    page += 1;

    if (page > 1000) {
      throw new Error("Wish-history pagination exceeded the safety limit.");
    }

    await sleep(750);
  }

  return wishes;
}

async function readStdin() {
  let value = "";
  for await (const chunk of process.stdin) value += chunk;
  return value;
}

async function main() {
  if (process.stdin.isTTY) {
    throw new Error(
      "Pipe the captured URL through stdin. On macOS, copy it and run: pbpaste | npm run wishes:import",
    );
  }

  const captureUrl = await readStdin();
  parseCaptureUrl(captureUrl);

  const imported = [];
  for (const banner of BANNERS) {
    console.log(`Fetching ${banner.label} wish history...`);
    imported.push(...(await fetchBanner(captureUrl, banner.gachaType)));
    await sleep(1000);
  }

  const existingSource = await fs.readFile(DATA_FILE, "utf8");
  const existing = parseExistingWishes(existingSource);
  const merged = mergeWishRecords(existing, imported);
  const added = merged.length - existing.length;

  await fs.writeFile(DATA_FILE, serializeWishes(merged), "utf8");

  const totals = Object.fromEntries(
    ["character", "weapon", "standard"].map((bannerType) => [
      bannerType,
      merged.filter((wish) => wish.bannerType === bannerType).length,
    ]),
  );

  console.log(`Imported ${added} new wishes. ${merged.length} saved in total.`);
  console.log(
    `Character ${totals.character} · Weapon ${totals.weapon} · Standard ${totals.standard}`,
  );
  console.log("No authkey, UID, or source URL was written to the data file.");
}

const executedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (executedDirectly) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
