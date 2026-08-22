import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  THEME_ASSETS,
  isAssetWarmed,
  prewarmThemeAssets,
  prewarmThemeTarget,
} from "../asset-prewarmer";

describe("asset-prewarmer", () => {
  const originalImage = global.Image;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.Image = originalImage;
  });

  it("groups only adaptive assets by target theme", () => {
    expect(THEME_ASSETS["default-light"]).toContain("/logos/moonton-light.svg");
    expect(THEME_ASSETS["default-dark"]).toContain("/logos/moonton-dark.svg");
    expect(THEME_ASSETS.neobrutalist).toEqual(THEME_ASSETS["default-light"]);
    expect(Object.values(THEME_ASSETS).flat().every((src) => src.startsWith("/logos/"))).toBe(true);
  });

  it("marks an asset warmed only after decode succeeds", async () => {
    const decodeMock = vi.fn().mockResolvedValue(undefined);
    const instances: { src: string; decode: typeof decodeMock }[] = [];

    global.Image = class {
      src = "";
      decode = decodeMock;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      constructor() {
        instances.push(this);
      }
    } as never;

    const src = "/test-targeted-logo.svg";
    prewarmThemeAssets([src]);
    expect(instances).toHaveLength(1);
    expect(isAssetWarmed(src)).toBe(false);

    await Promise.resolve();
    await Promise.resolve();
    expect(decodeMock).toHaveBeenCalledTimes(1);
    expect(isAssetWarmed(src)).toBe(true);
  });

  it("does not re-warm an asset after a successful decode", async () => {
    const decodeMock = vi.fn().mockResolvedValue(undefined);
    const instances: object[] = [];

    global.Image = class {
      src = "";
      decode = decodeMock;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      constructor() {
        instances.push(this);
      }
    } as never;

    const src = "/test-once-logo.svg";
    prewarmThemeAssets([src]);
    await Promise.resolve();
    await Promise.resolve();
    prewarmThemeAssets([src]);

    expect(instances).toHaveLength(1);
  });

  it("prewarms a specific target instead of every theme asset", () => {
    const instances: object[] = [];
    global.Image = class {
      src = "";
      decode = vi.fn().mockImplementation(() => new Promise<void>(() => {}));
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      constructor() {
        instances.push(this);
      }
    } as never;

    prewarmThemeTarget("default-dark");
    expect(instances).toHaveLength(THEME_ASSETS["default-dark"].length);
  });
});
