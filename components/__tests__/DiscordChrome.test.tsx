import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import React from "react";
import DiscordServerRail from "../discord/DiscordServerRail";
import DiscordMemberSidebar from "../discord/DiscordMemberSidebar";

describe("Discord Chrome Components", () => {
  it("renders server rail with named external links", () => {
    render(<DiscordServerRail onSelectChannel={() => {}} />);
    expect(screen.getByRole("link", { name: /Email Aerol Balayon/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open Aedwon on GitHub/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Open Aedwon on LinkedIn/i })).toBeInTheDocument();
  });

  it("renders member list with organizations and brand partners", () => {
    render(<DiscordMemberSidebar isOpen={true} />);
    expect(screen.getByText(/OWNER — 1/i)).toBeInTheDocument();
    expect(screen.getByText(/ORGANIZATIONS & LGUS/i)).toBeInTheDocument();
    expect(screen.getByText(/EVENT & BRAND PARTNERS/i)).toBeInTheDocument();
    expect(screen.getByText("PSYSC")).toBeInTheDocument();
    expect(screen.getByText("Ayala Malls")).toBeInTheDocument();
  });
});
