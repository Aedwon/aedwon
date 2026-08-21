import { describe, it, expect } from "vitest";
import { metadata } from "../layout";
import manifest from "../manifest";

describe("Metadata and Manifest Verification", () => {
  it("exports exact page title 'Aedwon'", () => {
    expect(metadata.title).toBe("Aedwon");
  });

  it("exports manifest with correct branding", () => {
    const data = manifest();
    expect(data.name).toBe("Aedwon");
    expect(data.short_name).toBe("Aedwon");
    expect(data.theme_color).toBe("#18181B");
    expect(data.background_color).toBe("#18181B");
  });
});
