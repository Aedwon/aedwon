import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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
  return <button onClick={() => setTheme("discord")}>Activate Discord</button>;
}

describe("DiscordLayout shell", () => {
  it("renders regular children outside Discord presentation", () => {
    render(
      <ThemeProvider>
        <DiscordLayout>
          <div data-testid="regular-content">Regular Content</div>
        </DiscordLayout>
      </ThemeProvider>,
    );

    expect(screen.getByTestId("regular-content")).toBeInTheDocument();
    expect(document.querySelector("#discord-client-root")).toBeNull();
  });

  it("renders the Discord shell with named landmarks and a decorative composer", () => {
    render(
      <ThemeProvider>
        <div>
          <ThemeController />
          <DiscordLayout>
            <div data-testid="inner-content">Inner Content</div>
          </DiscordLayout>
        </div>
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByText("Activate Discord"));

    expect(
      screen.getByRole("navigation", { name: "Servers and profiles" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: "Channels" })).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: "Member list" })).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.getByText("Message #home")).toBeInTheDocument();
  });

  it("toggles the member list through an accessible button", () => {
    render(
      <ThemeProvider>
        <div>
          <ThemeController />
          <DiscordLayout>
            <div>Content</div>
          </DiscordLayout>
        </div>
      </ThemeProvider>,
    );

    fireEvent.click(screen.getByText("Activate Discord"));

    const memberToggle = screen.getByRole("button", { name: "Toggle member list" });
    expect(memberToggle).toHaveAttribute("aria-controls", "member-sidebar");
    expect(memberToggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("complementary", { name: "Member list" })).toBeInTheDocument();

    fireEvent.click(memberToggle);
    expect(memberToggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("complementary", { name: "Member list" })).toBeNull();

    fireEvent.click(memberToggle);
    expect(screen.getByRole("complementary", { name: "Member list" })).toBeInTheDocument();
  });
});
