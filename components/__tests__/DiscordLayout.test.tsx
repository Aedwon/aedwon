import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import DiscordLayout from "../DiscordLayout";
import { ThemeProvider, useTheme } from "../ThemeContext";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));

function ThemeController() {
  const { setTheme } = useTheme();
  return (
    <button onClick={() => setTheme("discord")}>Activate Discord</button>
  );
}

describe("DiscordLayout Full Shell", () => {
  it("renders regular children when theme is default or neobrutalist", () => {
    render(
      <ThemeProvider>
        <DiscordLayout>
          <div data-testid="regular-content">Regular Content</div>
        </DiscordLayout>
      </ThemeProvider>
    );

    expect(screen.getByTestId("regular-content")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Message #home/i)).not.toBeInTheDocument();
  });

  it("renders full 4-column Discord client shell when theme is discord", () => {
    render(
      <ThemeProvider>
        <div>
          <ThemeController />
          <DiscordLayout>
            <div data-testid="inner-content">Inner Content</div>
          </DiscordLayout>
        </div>
      </ThemeProvider>
    );

    const btn = screen.getByText("Activate Discord");
    fireEvent.click(btn);

    // Verify 4 columns exist
    expect(screen.getByLabelText("Servers")).toBeInTheDocument();
    expect(screen.getByLabelText("Channels")).toBeInTheDocument();
    expect(screen.getByLabelText("Member List")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Message #home/i)).toBeInTheDocument();
  });

  it("toggles member list when member icon is clicked", () => {
    render(
      <ThemeProvider>
        <div>
          <ThemeController />
          <DiscordLayout>
            <div>Content</div>
          </DiscordLayout>
        </div>
      </ThemeProvider>
    );

    const activateBtn = screen.getByText("Activate Discord");
    fireEvent.click(activateBtn);

    const memberToggle = screen.getByTitle(/Member List/i);
    expect(screen.getByLabelText("Member List")).toBeInTheDocument();

    fireEvent.click(memberToggle);
    expect(screen.queryByLabelText("Member List")).not.toBeInTheDocument();

    fireEvent.click(memberToggle);
    expect(screen.getByLabelText("Member List")).toBeInTheDocument();
  });
});
