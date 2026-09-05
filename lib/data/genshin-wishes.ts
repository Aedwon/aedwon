import type { GenshinWishRecord } from "@/lib/genshin-wish-stats";

/**
 * Public, normalized wish history used by the portfolio dashboard.
 *
 * Keep temporary HoYoVerse credentials and captured wish-history URLs out of
 * this file. Populate it only with the durable wish records returned by the
 * history API.
 */
export const GENSHIN_WISHES: GenshinWishRecord[] = [];
