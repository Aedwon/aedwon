import "@testing-library/jest-dom";
import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, useTheme } from "../ThemeContext";

let colorSchemeListener: ((event: { matches: boolean }) => void) | null = null;
let systemDark = false;
let reduceMotion = false;

function installMatchMedia() {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("prefers-reduced-motion") ? reduceMotion : systemDark,
    media: query,
    onchange: null,
    addEventListener: (_type: string, listener: (event: { matches: boolean }) => void) => {
      if (query.includes("prefers-color-scheme")) colorSchemeListener = listener;
    },
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

function Consumer() {
  const { theme, mode, resolvedMode, setTheme, setMode } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="mode">{mode}</span>
      <span data-testid="resolved">{resolvedMode}</span>
      <button onClick={() => setTheme("neobrutalist")}>Brutalist</button>
      <button onClick={() => setMode("system")}>System</button>
      <button onClick={() => setMode("light")}>Light</button>
    </div>
  );
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    systemDark = false;
    reduceMotion = false;
    colorSchemeListener = null;
    installMatchMedia();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("persists valid theme choices and restores them", async () => {
    const first = render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );
    fireEvent.click(screen.getByText("Brutalist"));
    expect(localStorage.getItem("aedwon-theme")).toBe("neobrutalist");
    first.unmount();

    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("theme")).toHaveTextContent("neobrutalist"));
    expect(screen.getByTestId("resolved")).toHaveTextContent("light");
  });

  it("tracks OS color changes while persisted system mode is active", async () => {
    localStorage.setItem("aedwon-mode", "system");
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("mode")).toHaveTextContent("system");
      expect(screen.getByTestId("resolved")).toHaveTextContent("light");
      expect(colorSchemeListener).not.toBeNull();
    });

    act(() => colorSchemeListener?.({ matches: true }));
    expect(screen.getByTestId("resolved")).toHaveTextContent("dark");
    expect(document.documentElement).toHaveAttribute("data-mode", "dark");
  });

  it("skips the canvas transition when reduced motion is requested", () => {
    reduceMotion = true;
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );
    fireEvent.click(screen.getByText("Light"));
    expect(screen.getByTestId("resolved")).toHaveTextContent("light");
    expect(document.querySelector("canvas")).toBeNull();
  });

  it("ignores invalid persisted values", () => {
    localStorage.setItem("aedwon-theme", "invalid");
    localStorage.setItem("aedwon-mode", "invalid");
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("theme")).toHaveTextContent("default");
    expect(screen.getByTestId("mode")).toHaveTextContent("dark");
  });
});
