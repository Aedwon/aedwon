import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import GenshinWishCounterProjectPage from "../projects/genshin-wish-counter/page";

describe("Genshin wish counter project page", () => {
  it("renders as a read-only portfolio project with an honest no-data state", () => {
    render(<GenshinWishCounterProjectPage />);

    expect(screen.getByRole("heading", { name: "Genshin Wish Counter" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Back to all projects/i })).toHaveAttribute(
      "href",
      "/projects",
    );
    expect(screen.getByText("Wish history not synced yet")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /import/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/authkey/i)).not.toBeInTheDocument();
  });
});
