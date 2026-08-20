import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../ThemeContext";
import HeroSection from "../HeroSection";
import ProjectCard from "../ProjectCard";
import ExperienceDossier from "../ExperienceDossier";

function ThemeConsumer() {
  const { theme, setTheme, mode, setMode } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <span data-testid="current-mode">{mode}</span>
      <button onClick={() => setTheme("neobrutalist")}>Set Brutalist</button>
      <button onClick={() => setMode("light")}>Set Light</button>
      <button onClick={() => setMode("dark")}>Set Dark</button>
    </div>
  );
}

describe("Neobrutalist Theme Integration", () => {
  it("should switch theme to neobrutalist and set attributes on document", () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    const btn = screen.getByText("Set Brutalist");
    fireEvent.click(btn);

    expect(screen.getByTestId("current-theme").textContent).toBe("neobrutalist");
    expect(document.documentElement.getAttribute("data-theme")).toBe("neobrutalist");
  });

  it("renders status stickers in HeroSection under neobrutalist theme", () => {
    const { HeroSectionWithTheme } = render(
      <ThemeProvider>
        <div>
          <ThemeConsumer />
          <HeroSection />
        </div>
      </ThemeProvider>
    );

    const btn = screen.getByText("Set Brutalist");
    fireEvent.click(btn);

    expect(screen.getByText("STATUS: OPEN FOR WORK")).toBeDefined();
    expect(screen.getByText("UP DILIMAN CS")).toBeDefined();
    expect(screen.getByText("DOST SCHOLAR")).toBeDefined();
  });

  it("renders ProjectCard with neobrutalist styling when theme is neobrutalist", () => {
    const testProject = {
      slug: "pantas",
      title: "Pantas — Offline Kiosk",
      tagline: "Touchscreen survey engine",
      summary: "Touchscreen survey engine running SQLite offline.",
      role: "Lead Engineer",
      period: "2024",
      platforms: [{ name: "Android", icon: "android" }],
      stack: [{ name: "React" }, { name: "SQLite" }],
      problem: "Offline requirement.",
      architecture: [{ title: "Local DB", description: "SQLite sync" }],
      results: "Deployed.",
      featured: true,
      glowColor: "blue",
      brandColor: "#2563EB",
    };

    render(
      <ThemeProvider>
        <div>
          <ThemeConsumer />
          <ProjectCard project={testProject} />
        </div>
      </ThemeProvider>
    );

    const btn = screen.getByText("Set Brutalist");
    fireEvent.click(btn);

    const cardTitle = screen.getByText("Pantas — Offline Kiosk");
    const cardContainer = cardTitle.closest("a");
    expect(cardContainer).toBeDefined();
    expect(cardContainer?.className).toContain("border-black");
  });

  it("renders ExperienceDossier with brutalist index stamps and tabs", () => {
    render(
      <ThemeProvider>
        <div>
          <ThemeConsumer />
          <ExperienceDossier />
        </div>
      </ThemeProvider>
    );

    const btn = screen.getByText("Set Brutalist");
    fireEvent.click(btn);

    expect(screen.getByText("/// Experience Dossier")).toBeDefined();
    expect(screen.getByText("[01]")).toBeDefined();
  });
});
