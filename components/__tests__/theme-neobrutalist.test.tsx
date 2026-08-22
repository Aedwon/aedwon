import "@testing-library/jest-dom";
import { beforeEach, describe, expect, it } from "vitest";
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../ThemeContext";
import HeroSection from "../HeroSection";
import ProjectCard from "../ProjectCard";
import ExperienceDossier from "../ExperienceDossier";
import { PROJECTS } from "@/lib/data/projects";

function ThemeConsumer() {
  const { theme, mode, resolvedMode, supportsColorMode, setTheme, setMode } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <span data-testid="current-mode">{mode}</span>
      <span data-testid="resolved-mode">{resolvedMode}</span>
      <span data-testid="supports-color-mode">{String(supportsColorMode)}</span>
      <button onClick={() => setTheme("neobrutalist")}>Set Brutalist</button>
      <button onClick={() => setTheme("discord")}>Set Discord</button>
      <button onClick={() => setMode("dark")}>Set Dark</button>
    </div>
  );
}

describe("theme capabilities", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.setAttribute("data-theme", "default");
    document.documentElement.setAttribute("data-mode", "dark");
  });

  it("forces neobrutalist presentation to resolved light mode", () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByText("Set Brutalist"));
    expect(screen.getByTestId("current-theme")).toHaveTextContent("neobrutalist");
    expect(screen.getByTestId("resolved-mode")).toHaveTextContent("light");
    expect(screen.getByTestId("supports-color-mode")).toHaveTextContent("false");
    expect(document.documentElement).toHaveAttribute("data-theme", "neobrutalist");
    expect(document.documentElement).toHaveAttribute("data-mode", "light");

    fireEvent.click(screen.getByText("Set Dark"));
    expect(screen.getByTestId("resolved-mode")).toHaveTextContent("light");
  });

  it("forces Discord presentation to resolved dark mode", () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );
    fireEvent.click(screen.getByText("Set Discord"));
    expect(screen.getByTestId("resolved-mode")).toHaveTextContent("dark");
    expect(screen.getByTestId("supports-color-mode")).toHaveTextContent("false");
  });

  it("renders HeroSection with the existing neobrutalist frame", () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
        <HeroSection />
      </ThemeProvider>,
    );
    fireEvent.click(screen.getByText("Set Brutalist"));
    const heading = screen.getByText("I'm Aerol. You might also know me as Aedwon.");
    expect(heading.closest("section")?.className).toContain("border-[3px]");
  });

  it("renders project cards and experience controls with neobrutalist styling", () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
        <ProjectCard project={PROJECTS[0]} />
        <ExperienceDossier />
      </ThemeProvider>,
    );
    fireEvent.click(screen.getByText("Set Brutalist"));
    expect(screen.getByText("Pantas").closest("a")?.className).toContain("rounded-none");
    expect(screen.getByText("UP Fighting Maroons").className).toContain("rounded-none");
  });
});
