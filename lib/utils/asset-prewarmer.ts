/**
 * Theme asset prewarmer.
 * Only adaptive assets that change with the selected presentation are warmed.
 */

export type ThemeAssetTarget = "default-light" | "default-dark" | "neobrutalist";

export const THEME_ASSETS: Record<ThemeAssetTarget, readonly string[]> = {
  "default-light": [
    "/logos/moonton-light.svg",
    "/logos/dls-light.svg",
    "/logos/estudyante-esports-light.svg",
  ],
  "default-dark": [
    "/logos/moonton-dark.svg",
    "/logos/dls-dark.svg",
    "/logos/estudyante-esports-dark.svg",
  ],
  neobrutalist: [
    "/logos/moonton-light.svg",
    "/logos/dls-light.svg",
    "/logos/estudyante-esports-light.svg",
  ],
};

const warmedAssets = new Set<string>();
const pendingAssets = new Set<string>();
const pendingImages = new Map<string, HTMLImageElement>();

export function isAssetWarmed(src: string): boolean {
  return warmedAssets.has(src);
}

function finishPrewarm(src: string, succeeded: boolean): void {
  pendingAssets.delete(src);
  pendingImages.delete(src);
  if (succeeded) warmedAssets.add(src);
}

export function prewarmThemeAssets(assets: readonly string[]): void {
  if (typeof window === "undefined" || typeof Image === "undefined") return;

  for (const src of assets) {
    if (warmedAssets.has(src) || pendingAssets.has(src)) continue;

    try {
      const image = new Image();
      pendingAssets.add(src);
      pendingImages.set(src, image);

      image.onload = () => finishPrewarm(src, true);
      image.onerror = () => finishPrewarm(src, false);
      image.src = src;

      if (typeof image.decode === "function") {
        void image.decode().then(
          () => finishPrewarm(src, true),
          () => {
            // onload/onerror remains the fallback for formats with inconsistent decode support.
          },
        );
      }
    } catch {
      finishPrewarm(src, false);
    }
  }
}

export function prewarmThemeTarget(target: ThemeAssetTarget): void {
  prewarmThemeAssets(THEME_ASSETS[target]);
}

function getCurrentTarget(): ThemeAssetTarget | null {
  const root = document.documentElement;
  const theme = root.getAttribute("data-theme");
  const mode = root.getAttribute("data-mode");

  if (theme === "neobrutalist") return "neobrutalist";
  if (theme !== "default") return null;
  return mode === "light" ? "default-light" : "default-dark";
}

function shouldSkipIdlePrewarm(): boolean {
  const connection = (navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  }).connection;

  return Boolean(
    connection?.saveData ||
      connection?.effectiveType === "slow-2g" ||
      connection?.effectiveType === "2g",
  );
}

/**
 * Schedules a small current-theme prewarm and returns a cleanup function.
 */
export function scheduleIdlePrewarm(delayMs = 1000): () => void {
  if (typeof window === "undefined") return () => {};

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let idleId: number | null = null;
  let cancelled = false;

  const run = () => {
    if (cancelled || shouldSkipIdlePrewarm()) return;

    const prewarm = () => {
      if (cancelled) return;
      const target = getCurrentTarget();
      if (target) prewarmThemeTarget(target);
    };

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(prewarm, { timeout: 2500 });
    } else {
      timeoutId = setTimeout(prewarm, 150);
    }
  };

  const schedule = () => {
    timeoutId = setTimeout(run, delayMs);
  };

  if (document.readyState === "complete") {
    schedule();
  } else {
    window.addEventListener("load", schedule, { once: true });
  }

  return () => {
    cancelled = true;
    window.removeEventListener("load", schedule);
    if (timeoutId !== null) clearTimeout(timeoutId);
    if (idleId !== null && "cancelIdleCallback" in window) {
      window.cancelIdleCallback(idleId);
    }
  };
}
