import "@testing-library/jest-dom";
import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ProjectCaseStudyPage from "../page";

describe("ProjectCaseStudyPage", () => {
  it("renders source-backed article sections for a flagship project", async () => {
    const component = await ProjectCaseStudyPage({
      params: Promise.resolve({ slug: "pantas" }),
    });
    render(component);

    expect(screen.getByText("Pantas")).toBeInTheDocument();
    expect(screen.getByText("Keeping study state local")).toBeInTheDocument();
    expect(screen.getByText("What happens after an answer")).toBeInTheDocument();
    expect(screen.getByText("Fixing passage ordering at the session boundary")).toBeInTheDocument();
    expect(screen.getByText("Building content before it reaches the app")).toBeInTheDocument();
  });

  it("renders a focused project with compact generic sections", async () => {
    const component = await ProjectCaseStudyPage({
      params: Promise.resolve({ slug: "qr-studio" }),
    });
    render(component);

    expect(screen.getByText("QR Studio")).toBeInTheDocument();
    expect(screen.getByText("Why I Built This")).toBeInTheDocument();
    expect(screen.getByText("How It Works")).toBeInTheDocument();
    expect(screen.getByText("Results & Numbers")).toBeInTheDocument();
    expect(screen.queryByText("Hurdles & Solutions")).not.toBeInTheDocument();
  });
});
