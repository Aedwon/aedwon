import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NotFound from "../not-found";

describe("portfolio 404", () => {
  it("points humans and agents at canonical recovery indexes", () => {
    render(<NotFound />);

    expect(screen.getByRole("heading", { name: "Page not found" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Projects/ })).toHaveAttribute("href", "/projects");
    expect(screen.getByRole("link", { name: /llms\.txt/ })).toHaveAttribute("href", "/llms.txt");
    expect(screen.getByRole("link", { name: /sitemap\.xml/ })).toHaveAttribute("href", "/sitemap.xml");
  });
});
