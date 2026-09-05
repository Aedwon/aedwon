import { describe, expect, it } from "vitest";
import {
  calculateWishStats,
  type GenshinWishRecord,
} from "../genshin-wish-stats";

const CHARACTER_WISHES: GenshinWishRecord[] = [
  { id: "1", bannerType: "character", name: "Debate Club", itemType: "Weapon", rarity: 3, time: "2026-01-01T00:00:00Z" },
  { id: "2", bannerType: "character", name: "Favonius Sword", itemType: "Weapon", rarity: 4, time: "2026-01-01T00:01:00Z" },
  { id: "3", bannerType: "character", name: "Debate Club", itemType: "Weapon", rarity: 3, time: "2026-01-01T00:02:00Z" },
  { id: "4", bannerType: "character", name: "Diluc", itemType: "Character", rarity: 5, featured: false, time: "2026-01-01T00:03:00Z" },
  { id: "5", bannerType: "character", name: "Magic Guide", itemType: "Weapon", rarity: 3, time: "2026-01-01T00:04:00Z" },
  { id: "6", bannerType: "character", name: "Cool Steel", itemType: "Weapon", rarity: 3, time: "2026-01-01T00:05:00Z" },
  { id: "7", bannerType: "character", name: "Favonius Lance", itemType: "Weapon", rarity: 4, time: "2026-01-01T00:06:00Z" },
  { id: "8", bannerType: "character", name: "Magic Guide", itemType: "Weapon", rarity: 3, time: "2026-01-01T00:07:00Z" },
  { id: "9", bannerType: "character", name: "Furina", itemType: "Character", rarity: 5, featured: true, time: "2026-01-01T00:08:00Z" },
  { id: "10", bannerType: "character", name: "Debate Club", itemType: "Weapon", rarity: 3, time: "2026-01-01T00:09:00Z" },
  { id: "11", bannerType: "character", name: "Magic Guide", itemType: "Weapon", rarity: 3, time: "2026-01-01T00:10:00Z" },
  { id: "12", bannerType: "character", name: "Cool Steel", itemType: "Weapon", rarity: 3, time: "2026-01-01T00:11:00Z" },
];

describe("calculateWishStats", () => {
  it("returns null when a banner has no wish records", () => {
    expect(calculateWishStats([], "character")).toBeNull();
  });

  it("derives pity, summary totals, history, and guarantee state", () => {
    const stats = calculateWishStats(CHARACTER_WISHES, "character");

    expect(stats).not.toBeNull();
    expect(stats?.totalWishes).toBe(12);
    expect(stats?.fiveStarCount).toBe(2);
    expect(stats?.currentFiveStarPity).toBe(3);
    expect(stats?.currentFourStarPity).toBe(3);
    expect(stats?.averageFiveStarPity).toBe(4.5);
    expect(stats?.guaranteedNextFiveStar).toBe(false);
    expect(stats?.lastFiveStar?.name).toBe("Furina");
    expect(stats?.fiveStarHistory.map((entry) => [entry.name, entry.pity])).toEqual([
      ["Furina", 5],
      ["Diluc", 4],
    ]);
  });

  it("marks the next event five-star guaranteed after losing the latest 50/50", () => {
    const stats = calculateWishStats(CHARACTER_WISHES.slice(0, 8), "character");
    expect(stats?.guaranteedNextFiveStar).toBe(true);
    expect(stats?.lastFiveStar?.name).toBe("Diluc");
  });
});
