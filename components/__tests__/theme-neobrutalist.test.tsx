import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../ThemeContext";

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
});
