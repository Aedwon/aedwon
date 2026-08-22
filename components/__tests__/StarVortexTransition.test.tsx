import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import StarVortexTransition from "../ThemeTransitions/StarVortexTransition";

function mockContext() {
  return {
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    createRadialGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
  };
}

describe("StarVortexTransition", () => {
  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation(() => mockContext()) as never;
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as never;
  });

  afterEach(() => {
    document.documentElement.classList.remove("is-theme-transitioning");
    vi.restoreAllMocks();
  });

  it("renders a non-interactive canvas overlay", () => {
    const { container } = render(
      <StarVortexTransition
        targetMode="dark"
        sourceMode="light"
        onFlipTheme={vi.fn()}
        onComplete={vi.fn()}
      />,
    );
    const canvas = container.querySelector("canvas");
    expect(canvas).not.toBeNull();
    expect(canvas?.className).toContain("pointer-events-none");
    expect(canvas).toHaveAttribute("aria-hidden", "true");
  });

  it("removes the transition class and animation frame on unmount", () => {
    const cancelAnimationFrameSpy = vi.spyOn(window, "cancelAnimationFrame");
    const { unmount } = render(
      <StarVortexTransition
        targetMode="dark"
        sourceMode="light"
        onFlipTheme={vi.fn()}
        onComplete={vi.fn()}
      />,
    );

    expect(document.documentElement).toHaveClass("is-theme-transitioning");
    unmount();
    expect(document.documentElement).not.toHaveClass("is-theme-transitioning");
    expect(cancelAnimationFrameSpy).toHaveBeenCalled();
  });

  it("flips and completes immediately for reduced motion", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as never;
    const onFlip = vi.fn();
    const onComplete = vi.fn();

    render(
      <StarVortexTransition
        targetMode="light"
        sourceMode="dark"
        onFlipTheme={onFlip}
        onComplete={onComplete}
      />,
    );

    expect(onFlip).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(document.documentElement).not.toHaveClass("is-theme-transitioning");
  });
});
