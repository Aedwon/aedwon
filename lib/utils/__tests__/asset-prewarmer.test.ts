import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { prewarmThemeAssets, THEME_CRITICAL_ASSETS, isAssetWarmed } from "../asset-prewarmer";

describe("asset-prewarmer", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("exports a non-empty list of critical theme assets", () => {
    expect(THEME_CRITICAL_ASSETS.length).toBeGreaterThan(0);
    expect(THEME_CRITICAL_ASSETS).toContain("/logos/moonton-light.svg");
    expect(THEME_CRITICAL_ASSETS).toContain("/logos/moonton-dark.svg");
  });

  it("prewarms assets by creating Image instances and calling decode", async () => {
    const decodeMock = vi.fn().mockResolvedValue(undefined);
    const mockImageInstances: any[] = [];

    // Mock Image constructor in global scope
    const originalImage = global.Image;
    global.Image = class {
      src = "";
      decode = decodeMock;
      constructor() {
        mockImageInstances.push(this);
      }
    } as any;

    try {
      prewarmThemeAssets();

      expect(mockImageInstances.length).toBe(THEME_CRITICAL_ASSETS.length);
      expect(isAssetWarmed("/logos/moonton-light.svg")).toBe(true);
      expect(decodeMock).toHaveBeenCalled();
    } finally {
      global.Image = originalImage;
    }
  });

  it("does not re-warm assets that have already been warmed", () => {
    const mockImageInstances: any[] = [];
    const originalImage = global.Image;
    global.Image = class {
      src = "";
      decode = vi.fn().mockResolvedValue(undefined);
      constructor() {
        mockImageInstances.push(this);
      }
    } as any;

    try {
      prewarmThemeAssets(["/test-logo.svg"]);
      expect(mockImageInstances.length).toBe(1);

      // Second call with same asset should not instantiate new Image
      prewarmThemeAssets(["/test-logo.svg"]);
      expect(mockImageInstances.length).toBe(1);
    } finally {
      global.Image = originalImage;
    }
  });
});
