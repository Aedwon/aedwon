import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import DiscordChannelSidebar from "../discord/DiscordChannelSidebar";
import DiscordUserSettingsModal from "../discord/DiscordUserSettingsModal";
import { ThemeProvider } from "../ThemeContext";

describe("DiscordChannelSidebar & Thread Engine", () => {
  it("renders channels list and handles channel switching", () => {
    const handleSelect = vi.fn();
    render(
      <DiscordChannelSidebar
        activeChannel="home"
        activeThread={null}
        onSelectChannel={handleSelect}
        onOpenSettings={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "home" })).toHaveAttribute("aria-current", "page");
    fireEvent.click(screen.getByRole("button", { name: "projects" }));
    expect(handleSelect).toHaveBeenCalledWith("projects");
  });

  it("renders active thread item under parent channel with close button", () => {
    const handleCloseThread = vi.fn();
    render(
      <DiscordChannelSidebar
        activeChannel="projects"
        activeThread={{ parent: "projects", slug: "pantas" }}
        onSelectChannel={vi.fn()}
        onCloseThread={handleCloseThread}
        onOpenSettings={vi.fn()}
      />,
    );

    expect(screen.getByText("pantas")).toBeInTheDocument();
    const closeBtn = screen.getByTitle("Close Thread");
    fireEvent.click(closeBtn);
    expect(handleCloseThread).toHaveBeenCalled();
  });

  it("exposes theme settings as a modal dialog with keyboard-operable choices", () => {
    const handleClose = vi.fn();
    render(
      <ThemeProvider>
        <DiscordUserSettingsModal isOpen={true} onClose={handleClose} />
      </ThemeProvider>,
    );

    expect(screen.getByRole("dialog", { name: /User Settings & Theme Switcher/i })).toHaveAttribute(
      "aria-modal",
      "true",
    );
    expect(screen.getByRole("button", { name: "Default" })).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "Neobrutalist" }));
    expect(screen.getByRole("button", { name: "Neobrutalist" })).toHaveAttribute("aria-pressed", "true");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(handleClose).toHaveBeenCalled();
  });
});
