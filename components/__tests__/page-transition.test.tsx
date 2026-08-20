import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PageTransition from "../PageTransition";

vi.mock("next/navigation", () => ({
  usePathname: () => "/test-route",
}));

describe("PageTransition Component", () => {
  it("renders child content smoothly", () => {
    render(
      <PageTransition>
        <div data-testid="test-content">Portfolio Content</div>
      </PageTransition>
    );

    expect(screen.getByTestId("test-content")).toBeDefined();
    expect(screen.getByText("Portfolio Content")).toBeDefined();
  });
});
