import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "../Navbar";
import { ThemeProvider } from "../ThemeContext";

let mockPathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

describe("Navbar Component", () => {
  beforeEach(() => {
    mockPathname = "/";
  });

  it("renders the </aedwon> brand link to home", () => {
    render(
      <ThemeProvider>
        <Navbar />
      </ThemeProvider>
    );

    const brandLink = screen.getByText("</aedwon>");
    expect(brandLink).toBeDefined();
    expect(brandLink.closest("a")?.getAttribute("href")).toBe("/");
  });

  it("renders Home, Projects, and Blogs navigation links", () => {
    render(
      <ThemeProvider>
        <Navbar />
      </ThemeProvider>
    );

    expect(screen.getByText("Home")).toBeDefined();
    expect(screen.getByText("Projects")).toBeDefined();
    expect(screen.getByText("Blogs")).toBeDefined();
  });

  it("highlights the active route based on pathname", () => {
    mockPathname = "/projects";
    const { rerender } = render(
      <ThemeProvider>
        <Navbar />
      </ThemeProvider>
    );

    const projectsLink = screen.getByText("Projects");
    expect(projectsLink.className).toContain("text-[var(--text-primary)]");

    mockPathname = "/blogs";
    rerender(
      <ThemeProvider>
        <Navbar />
      </ThemeProvider>
    );
    const blogsLink = screen.getByText("Blogs");
    expect(blogsLink.className).toContain("text-[var(--text-primary)]");
  });

  it("toggles the theme popover menu when clicking the palette button", () => {
    render(
      <ThemeProvider>
        <Navbar />
      </ThemeProvider>
    );

    const themeButton = screen.getByLabelText("Theme settings");
    expect(themeButton).toBeDefined();

    // Popover is initially not in document
    expect(screen.queryByTestId("theme-popover")).toBeNull();

    // Click to open
    fireEvent.click(themeButton);
    expect(screen.getByTestId("theme-popover")).toBeDefined();

    // Click outside to close
    fireEvent.mouseDown(document.body);
    expect(screen.queryByTestId("theme-popover")).toBeNull();
  });

  it("renders neobrutalist styling when theme is neobrutalist", () => {
    render(
      <ThemeProvider>
        <Navbar />
      </ThemeProvider>
    );

    const themeButton = screen.getByLabelText("Theme settings");
    fireEvent.click(themeButton);

    const brutalistButton = screen.getByLabelText ? screen.getByLabelText("Theme settings") : themeButton;
    const brutalistOption = screen.getByText((content, element) => {
      return element?.getAttribute("data-tooltip") === "Brutalist";
    });

    fireEvent.click(brutalistOption);
    const navContainer = screen.getByText("</aedwon>").closest("div");
    expect(navContainer?.className).toContain("rounded-none");
    expect(navContainer?.className).toContain("border-[3px]");
  });
});
