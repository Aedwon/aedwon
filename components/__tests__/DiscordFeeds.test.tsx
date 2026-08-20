import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import DiscordHomeFeed from "../discord/DiscordHomeFeed";
import DiscordProjectsFeed from "../discord/DiscordProjectsFeed";
import DiscordBlogsFeed from "../discord/DiscordBlogsFeed";
import DiscordThreadFeed from "../discord/DiscordThreadFeed";

describe("Discord Message Feeds", () => {
  it("renders home feed with intro, 4 featured projects, and link button", () => {
    const handleOpenThread = vi.fn();
    const handleSwitchChannel = vi.fn();
    render(
      <DiscordHomeFeed
        onOpenThread={handleOpenThread}
        onSwitchChannel={handleSwitchChannel}
      />
    );

    expect(screen.getByText(/I'm Aerol. You might also know me as Aedwon./i)).toBeInTheDocument();
    expect(screen.getByText("Pantas")).toBeInTheDocument();
    expect(screen.getByText("The MSL Network")).toBeInTheDocument();
    expect(screen.getByText("QR Studio")).toBeInTheDocument();
    expect(screen.getByText("Kiosk Survey")).toBeInTheDocument();
    expect(screen.getByText("See all projects")).toBeInTheDocument();

    fireEvent.click(screen.getByText("See all projects"));
    expect(handleSwitchChannel).toHaveBeenCalledWith("projects");
  });

  it("renders all 12 projects grouped in projects feed and triggers thread opening", () => {
    const handleOpenThread = vi.fn();
    render(<DiscordProjectsFeed onOpenThread={handleOpenThread} />);

    expect(screen.getByText("Pantas")).toBeInTheDocument();
    expect(screen.getByText("The MSL Network")).toBeInTheDocument();
    expect(screen.getByText("BetterGov PH")).toBeInTheDocument();
    expect(screen.getByText("AI Agent Instruction & Skills Framework")).toBeInTheDocument();

    const pantasLinks = screen.getAllByText("View case study →");
    fireEvent.click(pantasLinks[0]);
    expect(handleOpenThread).toHaveBeenCalled();
  });

  it("renders blogs feed with articles", () => {
    const handleOpenThread = vi.fn();
    render(<DiscordBlogsFeed onOpenThread={handleOpenThread} />);

    expect(screen.getByText("Offline-First Architecture for Unreliable Event Venues")).toBeInTheDocument();
    expect(screen.getByText("Agentic Engineering: Moving Fast with Precision")).toBeInTheDocument();
  });

  it("renders detailed thread view for a project case study", () => {
    const handleClose = vi.fn();
    render(
      <DiscordThreadFeed
        thread={{ parent: "projects", slug: "pantas" }}
        onClose={handleClose}
      />
    );

    expect(screen.getByText("Pantas")).toBeInTheDocument();
    expect(screen.getByText("The Spark")).toBeInTheDocument();
    expect(screen.getByText("Architecture Breakdown")).toBeInTheDocument();
    expect(screen.getByText("Outcome & Metrics")).toBeInTheDocument();
  });
});
