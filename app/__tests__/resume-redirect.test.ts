import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";

describe("resume short link", () => {
  it("redirects /resume to the public resume PDF", async () => {
    const redirects = await nextConfig.redirects?.();

    expect(redirects).toContainEqual({
      source: "/resume",
      destination:
        "https://drive.google.com/file/d/1F2tjvYSaHlApExmlhdLqtmnN9JdSPb_B/view?usp=drivesdk",
      permanent: false,
    });
  });
});
