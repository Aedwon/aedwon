import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import React from "react";
import DiscordHomeFeed from "../discord/DiscordHomeFeed";
import DiscordProjectsFeed from "../discord/DiscordProjectsFeed";
import DiscordBlogsFeed from "../discord/DiscordBlogsFeed";
import DiscordThreadFeed from "../discord/DiscordThreadFeed";
import { ALL_PROJECTS } from "@/lib/data/project-registry";

describe("Discord message feeds", () => {
  it("renders home feed from the canonical featured project set", () => {
    const handleOpenThread = vi.fn();
    const handleSwitchChannel = vi.fn();
    render(
      <DiscordHomeFeed
        onOpenThread={handleOpenThread}
        onSwitchChannel={handleSwitchChannel}
      />,
    );

    expect(screen.getByText(/I'm Aerol. You might also know me as Aedwon./i)).toBeInTheDocument();
    expect(screen.getByText("Pantas")).toBeInTheDocument();
    expect(screen.getByText("MSL Network Bot")).toBeInTheDocument();
    expect(screen.getByText("QR Studio")).toBeInTheDocument();
    expect(screen.getByText("Kiosk Survey")).toBeInTheDocument();

    fireEvent.click(screen.getByText("See all projects"));
    expect(handleSwitchChannel).toHaveBeenCalledWith("projects");
  });

  it("renders every registry project in the projects feed", () => {
    const handleOpenThread = vi.fn();
    render(<DiscordProjectsFeed onOpenThread={handleOpenThread} />);

    expect(screen.getByText(`Projects Catalog (${ALL_PROJECTS.length})`)).toBeInTheDocument();
    expect(screen.getByText("MSL Network Bot")).toBeInTheDocument();
    expect(screen.getByText("BetterGov PH")).toBeInTheDocument();
    expect(screen.getByText("WebP Unli")).toBeInTheDocument();

    const pantasCard = screen.getByText("Pantas").closest("div");
    const link = pantasCard?.parentElement?.querySelector("button, a");
    if (link) fireEvent.click(link);
  });

  it("renders blogs feed with articles", () => {
    render(<DiscordBlogsFeed onOpenThread={vi.fn()} />);
    expect(screen.getByText("Offline-First Architecture for Unreliable Event Venues")).toBeInTheDocument();
    expect(screen.getByText("Agentic Engineering: Moving Fast with Precision")).toBeInTheDocument();
  });

  it("renders canonical article sections in a project thread", () => {
    render(
      <DiscordThreadFeed
        thread={{ parent: "projects", slug: "pantas" }}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("Pantas")).toBeInTheDocument();
    expect(screen.getByText("Keeping study state local")).toBeInTheDocument();
    expect(screen.getByText("What happens after an answer")).toBeInTheDocument();
    expect(screen.getByText("Outcome")).toBeInTheDocument();
  });

  it("resolves legacy project aliases in Discord threads", () => {
    render(
      <DiscordThreadFeed
        thread={{ parent: "projects", slug: "sb-norala" }}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("Norala SB Transparency Portal")).toBeInTheDocument();
  });
});
