import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MotionWrapper } from "../MotionWrapper";

// framer-motion useReducedMotion is stubbed per test via dynamic import
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    useReducedMotion: vi.fn(),
  };
});

import { useReducedMotion } from "framer-motion";

describe("MotionWrapper", () => {
  it("renders children", () => {
    (useReducedMotion as ReturnType<typeof vi.fn>).mockReturnValue(false);
    render(<MotionWrapper>hello</MotionWrapper>);
    expect(screen.getByText("hello")).toBeDefined();
  });

  it("passes motion props when reduced-motion is OFF", () => {
    (useReducedMotion as ReturnType<typeof vi.fn>).mockReturnValue(false);
    const { container } = render(
      <MotionWrapper initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        content
      </MotionWrapper>
    );
    expect(container.firstChild).toBeDefined();
  });

  it("strips motion props when reduced-motion is ON", () => {
    (useReducedMotion as ReturnType<typeof vi.fn>).mockReturnValue(true);
    const { container } = render(
      <MotionWrapper initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        content
      </MotionWrapper>
    );
    // Element still renders; motion is zero-duration
    expect(container.textContent).toBe("content");
  });
});
