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
      />
    );

    expect(screen.getByText("home")).toBeInTheDocument();
    expect(screen.getByText("projects")).toBeInTheDocument();
    expect(screen.getByText("blogs")).toBeInTheDocument();

    fireEvent.click(screen.getByText("projects"));
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
      />
    );

    expect(screen.getByText("pantas")).toBeInTheDocument();
    const closeBtn = screen.getByTitle("Close Thread");
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn);
    expect(handleCloseThread).toHaveBeenCalled();
  });

  it("renders user settings modal and allows theme selection", () => {
    const handleClose = vi.fn();
    render(
      <ThemeProvider>
        <DiscordUserSettingsModal isOpen={true} onClose={handleClose} />
      </ThemeProvider>
    );

    expect(screen.getByText(/User Settings & Theme Switcher/i)).toBeInTheDocument();
    expect(screen.getByText("Default")).toBeInTheDocument();
    expect(screen.getByText("Neobrutalist")).toBeInTheDocument();
    expect(screen.getByText("Discord")).toBeInTheDocument();
  });
});
