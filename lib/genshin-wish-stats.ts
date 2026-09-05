export type GenshinBannerType = "character" | "weapon" | "standard";

export interface GenshinWishRecord {
  id: string;
  bannerType: GenshinBannerType;
  name: string;
  itemType: "Character" | "Weapon";
  rarity: 3 | 4 | 5;
  time: string;
  featured?: boolean;
}

export interface FiveStarHistoryEntry {
  id: string;
  name: string;
  time: string;
  pity: number;
  featured?: boolean;
}

export interface WishStats {
  bannerType: GenshinBannerType;
  totalWishes: number;
  fiveStarCount: number;
  currentFiveStarPity: number;
  currentFourStarPity: number;
  averageFiveStarPity: number | null;
  guaranteedNextFiveStar: boolean;
  lastFiveStar: FiveStarHistoryEntry | null;
  fiveStarHistory: FiveStarHistoryEntry[];
}

function chronological(records: GenshinWishRecord[]) {
  return [...records].sort((a, b) => {
    const timeDelta = new Date(a.time).getTime() - new Date(b.time).getTime();
    if (timeDelta !== 0) return timeDelta;
    return a.id.localeCompare(b.id);
  });
}

export function calculateWishStats(
  records: GenshinWishRecord[],
  bannerType: GenshinBannerType,
): WishStats | null {
  const bannerRecords = chronological(
    records.filter((record) => record.bannerType === bannerType),
  );

  if (bannerRecords.length === 0) return null;

  let fiveStarPity = 0;
  let fourStarPity = 0;
  const fiveStarHistory: FiveStarHistoryEntry[] = [];

  for (const record of bannerRecords) {
    fiveStarPity += 1;
    fourStarPity += 1;

    if (record.rarity >= 4) {
      fourStarPity = 0;
    }

    if (record.rarity === 5) {
      fiveStarHistory.push({
        id: record.id,
        name: record.name,
        time: record.time,
        pity: fiveStarPity,
        featured: record.featured,
      });
      fiveStarPity = 0;
    }
  }

  const latestFirst = [...fiveStarHistory].reverse();
  const lastFiveStar = latestFirst[0] ?? null;
  const averageFiveStarPity =
    fiveStarHistory.length > 0
      ? fiveStarHistory.reduce((sum, wish) => sum + wish.pity, 0) /
        fiveStarHistory.length
      : null;

  return {
    bannerType,
    totalWishes: bannerRecords.length,
    fiveStarCount: fiveStarHistory.length,
    currentFiveStarPity: fiveStarPity,
    currentFourStarPity: fourStarPity,
    averageFiveStarPity,
    guaranteedNextFiveStar:
      bannerType === "character" && lastFiveStar?.featured === false,
    lastFiveStar,
    fiveStarHistory: latestFirst,
  };
}
