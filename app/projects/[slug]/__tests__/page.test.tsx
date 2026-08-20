import "@testing-library/jest-dom";
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProjectCaseStudyPage from "../page";

describe("ProjectCaseStudyPage", () => {
  it("renders flagship project with problem, architecture, hurdles, and results", async () => {
    const Component = await ProjectCaseStudyPage({
      params: Promise.resolve({ slug: "pantas" }),
    });
    render(Component);

    expect(screen.getByText("Pantas")).toBeInTheDocument();
    expect(screen.getByText("Problem & Constraints")).toBeInTheDocument();
    expect(screen.getByText("How It's Built")).toBeInTheDocument();
    expect(screen.getByText("Hurdles & Solutions")).toBeInTheDocument();
    expect(screen.getByText("Results & Numbers")).toBeInTheDocument();
    expect(screen.getByText(/SQLCipher Database Migration Deadlocks/i)).toBeInTheDocument();
  });

  it("renders focused project with compact sections", async () => {
    const Component = await ProjectCaseStudyPage({
      params: Promise.resolve({ slug: "qr-studio" }),
    });
    render(Component);

    expect(screen.getByText("QR Studio")).toBeInTheDocument();
    expect(screen.getByText("Why I Built This")).toBeInTheDocument();
    expect(screen.getByText("How It Works")).toBeInTheDocument();
    expect(screen.getByText("Results & Numbers")).toBeInTheDocument();
    expect(screen.queryByText("Hurdles & Solutions")).not.toBeInTheDocument();
  });
});
