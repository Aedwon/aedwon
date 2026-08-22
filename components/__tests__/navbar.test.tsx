import "@testing-library/jest-dom";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Navbar from "../Navbar";
import { ThemeProvider } from "../ThemeContext";

let mockPathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

describe("Navbar", () => {
  beforeEach(() => {
    mockPathname = "/";
    localStorage.clear();
  });

  it("renders primary links and marks the active route", () => {
    mockPathname = "/projects/example";
    render(
      <ThemeProvider>
        <Navbar />
      </ThemeProvider>,
    );

    expect(screen.getByText("</aedwon>").closest("a")).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Blogs" })).toBeInTheDocument();
  });

  it("opens and closes the theme settings popover", () => {
    render(
      <ThemeProvider>
        <Navbar />
      </ThemeProvider>,
    );

    const trigger = screen.getByRole("button", { name: "Theme settings" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("dialog", { name: "Theme settings" })).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("dialog", { name: "Theme settings" })).toBeNull();
  });

  it("returns focus to the theme trigger when Escape closes the popover", () => {
    render(
      <ThemeProvider>
        <Navbar />
      </ThemeProvider>,
    );
    const trigger = screen.getByRole("button", { name: "Theme settings" });
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Theme settings" })).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it("switches to neobrutalist presentation through the labeled control", () => {
    render(
      <ThemeProvider>
        <Navbar />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Theme settings" }));
    fireEvent.click(screen.getByRole("button", { name: "Use neobrutalist presentation" }));

    const navContainer = screen.getByText("</aedwon>").closest("div");
    expect(navContainer?.className).toContain("rounded-none");
    expect(navContainer?.className).toContain("border-[3px]");
  });
});
