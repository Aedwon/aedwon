import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import GenshinWishCounterProjectPage from "../projects/genshin-wish-counter/page";

describe("Genshin wish counter project page", () => {
  it("renders as a read-only portfolio project with imported stats", () => {
    render(<GenshinWishCounterProjectPage />);

    expect(screen.getByRole("heading", { name: "Genshin Wish Counter" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Back to all projects/i })).toHaveAttribute(
      "href",
      "/projects",
    );
    expect(screen.getByText("Current pity")).toBeInTheDocument();
    expect(screen.queryByText("Wish history not synced yet")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /import/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/authkey/i)).not.toBeInTheDocument();
  });

  it("keeps the history heading outside the table surface and shows character portraits", () => {
    render(<GenshinWishCounterProjectPage />);

    const heading = screen.getByRole("heading", { name: "5★ history" });
    const historySurface = screen.getByRole("group", { name: "5★ history" });
    const table = within(historySurface).getByRole("table");

    expect(historySurface).not.toContainElement(heading);
    expect(table.firstElementChild?.tagName).toBe("THEAD");
    expect(screen.getByRole("img", { name: "Ineffa portrait" })).toBeInTheDocument();
  });
});
