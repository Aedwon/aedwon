import { describe, expect, it } from "vitest";
import {
  buildGachaUrl,
  mergeWishRecords,
  normalizeRows,
} from "../import-genshin-wishes.mjs";

const CAPTURE_URL =
  "https://public-operation-hk4e-sg.hoyoverse.com/gacha_info/api/getGachaLog?authkey_ver=1&sign_type=2&auth_appid=webview_gacha&init_type=301&lang=en&region=os_asia&authkey=test-secret&game_biz=hk4e_global&gacha_type=301&page=1&size=5&end_id=0";

describe("Genshin wish import helpers", () => {
  it("builds paginated HoYoVerse requests without changing the credential", () => {
    const url = buildGachaUrl(CAPTURE_URL, "302", 4, "987654321");

    expect(url.hostname).toBe("public-operation-hk4e-sg.hoyoverse.com");
    expect(url.pathname).toBe("/gacha_info/api/getGachaLog");
    expect(url.searchParams.get("authkey")).toBe("test-secret");
    expect(url.searchParams.get("gacha_type")).toBe("302");
    expect(url.searchParams.get("page")).toBe("4");
    expect(url.searchParams.get("size")).toBe("20");
    expect(url.searchParams.get("end_id")).toBe("987654321");
  });

  it("normalizes event-2 rows into the shared character banner", () => {
    const rows = normalizeRows([
      {
        id: "1002",
        gacha_type: "400",
        name: "Example Character",
        item_type: "Character",
        rank_type: "5",
        time: "2026-09-06 04:00:00",
      },
      {
        id: "1001",
        gacha_type: "301",
        name: "Example Sword",
        item_type: "Weapon",
        rank_type: "3",
        time: "2026-09-06 03:59:00",
      },
    ]);

    expect(rows).toEqual([
      {
        id: "1002",
        bannerType: "character",
        name: "Example Character",
        itemType: "Character",
        rarity: 5,
        time: "2026-09-06T04:00:00Z",
      },
      {
        id: "1001",
        bannerType: "character",
        name: "Example Sword",
        itemType: "Weapon",
        rarity: 3,
        time: "2026-09-06T03:59:00Z",
      },
    ]);
  });

  it("deduplicates refreshes while preserving manually derived featured state", () => {
    const merged = mergeWishRecords(
      [
        {
          id: "1",
          bannerType: "character",
          name: "Diluc",
          itemType: "Character",
          rarity: 5,
          time: "2026-01-01T00:00:00Z",
          featured: false,
        },
      ],
      [
        {
          id: "1",
          bannerType: "character",
          name: "Diluc",
          itemType: "Character",
          rarity: 5,
          time: "2026-01-01T00:00:00Z",
        },
        {
          id: "2",
          bannerType: "character",
          name: "Magic Guide",
          itemType: "Weapon",
          rarity: 3,
          time: "2026-01-01T00:01:00Z",
        },
      ],
    );

    expect(merged).toHaveLength(2);
    expect(merged[0].featured).toBe(false);
    expect(merged.map((wish) => wish.id)).toEqual(["1", "2"]);
  });
});
