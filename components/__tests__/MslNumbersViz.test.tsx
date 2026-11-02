import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import MslNumbersViz from "../design-v3/botviz/MslNumbersViz";
import { DARK } from "../design-v3/SystemViz";

vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 500 })));

describe("MslNumbersViz", () => {
  // jsdom has no IntersectionObserver, so the chart shows its end state straight away.
  it("shows the end state and toggles the longer list", () => {
    render(<MslNumbersViz P={DARK} />);
    expect(screen.getByText("Members")).toBeTruthy();
    expect(screen.getByText(/^35,\d{3}$/)).toBeTruthy();
    expect(screen.getByText("Updated daily.")).toBeTruthy();
    expect(screen.queryByText("Correct quiz answers")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /more/i }));
    expect(screen.getByText("Correct quiz answers")).toBeTruthy();
    expect(screen.getByText(/of 5$/)).toBeTruthy();
    expect(screen.getByRole("button", { name: /less/i })).toBeTruthy();
  });
});
