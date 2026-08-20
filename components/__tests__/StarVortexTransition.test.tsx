import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import StarVortexTransition from "../ThemeTransitions/StarVortexTransition";

describe("StarVortexTransition", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Setup mock canvas 2d context
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      scale: vi.fn(),
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      drawImage: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      createRadialGradient: vi.fn().mockReturnValue({
        addColorStop: vi.fn(),
      }),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    document.documentElement.classList.remove("is-theme-transitioning");
  });

  it("renders a canvas overlay with fixed inset positioning", () => {
    const onFlip = vi.fn();
    const onComplete = vi.fn();
    const { container } = render(
      <StarVortexTransition
        targetMode="dark"
        sourceMode="light"
        onFlipTheme={onFlip}
        onComplete={onComplete}
      />
    );

    const canvas = container.querySelector("canvas");
    expect(canvas).not.toBeNull();
    expect(canvas?.className).toContain("fixed inset-0");
  });

  it("adds and removes is-theme-transitioning class on documentElement", () => {
    const onFlip = vi.fn();
    const onComplete = vi.fn();
    const { unmount } = render(
      <StarVortexTransition
        targetMode="dark"
        sourceMode="light"
        onFlipTheme={onFlip}
        onComplete={onComplete}
      />
    );

    expect(document.documentElement.classList.contains("is-theme-transitioning")).toBe(true);

    unmount();
    expect(document.documentElement.classList.contains("is-theme-transitioning")).toBe(false);
  });
});
