/**
 * Theme & Asset Prewarmer
 * Pre-instantiates and decodes SVG/WebP assets into browser image decode cache
 * during idle moments or upon user hover over navigation/theme triggers.
 */

export const THEME_CRITICAL_ASSETS = [
  "/logos/moonton-light.svg",
  "/logos/moonton-dark.svg",
  "/logos/dls-light.svg",
  "/logos/dls-dark.svg",
  "/logos/estudyante-esports-light.svg",
  "/logos/estudyante-esports-dark.svg",
  "/logos/psysc.svg",
  "/logos/hoyoverse.svg",
  "/logos/up-diliman.svg",
  "/logos/up-maroons.svg",
  "/logos/up-fair.webp",
  "/logos/up-kugihan.webp",
  "/logos/dost.svg",
  "/logos/pshs.svg",
  "/logos/ilocos-sur.webp",
  "/logos/lgu-norala.webp",
  "/logos/riot-games.svg",
  "/logos/ayala-malls.svg",
  "/logos/sm-supermalls.svg",
  "/logos/smart.svg",
  "/logos/converge.svg",
  "/logos/msi.svg",
  "/logos/hotel101.webp",
  "/logos/oppo.svg",
  "/logos/zowie.svg",
  "/logos/chronos.webp",
];

const warmedAssets = new Set<string>();

/**
 * Checks if a specific asset URL has already been warmed.
 */
export function isAssetWarmed(src: string): boolean {
  return warmedAssets.has(src);
}

/**
 * Pre-warms and decodes a list of assets asynchronously.
 */
export function prewarmThemeAssets(assets: string[] = THEME_CRITICAL_ASSETS): void {
  if (typeof window === "undefined" || typeof Image === "undefined") return;

  for (const src of assets) {
    if (warmedAssets.has(src)) continue;
    warmedAssets.add(src);

    try {
      const img = new Image();
      img.src = src;
      if (typeof img.decode === "function") {
        img.decode().catch(() => {
          // Ignore decoding errors for silent background prewarm
        });
      }
    } catch {
      // Ignore background prewarm failures
    }
  }
}

/**
 * Schedules prewarming during browser idle time via requestIdleCallback.
 */
export function scheduleIdlePrewarm(delayMs: number = 1000): void {
  if (typeof window === "undefined") return;

  const runPrewarm = () => {
    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(
        () => prewarmThemeAssets(),
        { timeout: 3000 }
      );
    } else {
      setTimeout(() => prewarmThemeAssets(), 150);
    }
  };

  if (document.readyState === "complete") {
    setTimeout(runPrewarm, delayMs);
  } else {
    window.addEventListener("load", () => setTimeout(runPrewarm, delayMs), { once: true });
  }
}
