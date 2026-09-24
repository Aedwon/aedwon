import "@testing-library/jest-dom";
import { fireEvent, render, screen, within } from "@testing-library/react";
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
    expect(screen.getByRole("region", { name: "Pity" })).toBeInTheDocument();
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
    expect(heading.parentElement?.querySelector("svg")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Standard" }));
    expect(
      screen.getAllByRole("img", { name: "Primordial Jade Winged-Spear icon" }).length,
    ).toBeGreaterThan(0);
  });

  it("gives known pity values a visual scale with an accessible range label", () => {
    render(<GenshinWishCounterProjectPage />);

    const pity = screen.getByLabelText("Pity 44 of 90");
    expect(pity.style.backgroundColor).toBe("");
    expect(pity.style.borderColor).toBe("");
    expect(pity.style.color).not.toBe("");
  });

  it("groups both pity counters and gives the latest five-star most of the hero", () => {
    render(<GenshinWishCounterProjectPage />);

    const pityRegion = screen.getByRole("region", { name: "Pity" });
    expect(within(pityRegion).queryByText(/^Pity$/)).not.toBeInTheDocument();
    expect(within(pityRegion).getByText("5★ pity")).toBeInTheDocument();
    expect(within(pityRegion).getByText("4★ pity")).toBeInTheDocument();
    expect(screen.queryByText(/pulls until hard pity/i)).not.toBeInTheDocument();

    const latestRegion = screen.getByRole("region", { name: "Latest 5★" });
    expect(within(latestRegion).getByText("Ineffa")).toBeInTheDocument();
    expect(latestRegion).toHaveClass("relative", "sm:min-h-[340px]");
    expect(latestRegion.parentElement).not.toHaveClass("sm:grid-cols-[minmax(190px,0.24fr)_minmax(0,0.76fr)]");
    expect(pityRegion).toHaveClass("sm:absolute", "sm:left-5", "sm:top-5", "z-20", "sm:w-[180px]");
    expect(pityRegion.className).not.toContain("backdrop-blur");

    expect(screen.queryByRole("slider", { name: "Card opacity" })).not.toBeInTheDocument();
    expect(pityRegion).toHaveClass("sm:left-5", "sm:top-5", "sm:w-[180px]", "px-4", "py-4");
    expect(pityRegion.className).not.toContain("border");
    expect(pityRegion.className).not.toContain("shadow");
    expect(pityRegion.style.background).toBe("");

    const heroTaper = latestRegion.querySelector('[data-hero-taper="true"]') as HTMLElement | null;
    expect(heroTaper).not.toBeNull();
    expect(heroTaper?.style.background).toContain("linear-gradient");
    expect(heroTaper?.style.background).toContain("70%");
    expect(heroTaper?.style.background).toContain("transparent");

    expect(within(pityRegion).getByText("Latest 5★")).toBeInTheDocument();
    expect(within(pityRegion).getByText("Ineffa")).toBeInTheDocument();

    const fiveStarPity = screen.getByLabelText(/Current 5★ pity/);
    const fourStarPity = screen.getByLabelText(/Current 4★ pity/);
    expect(fiveStarPity).toHaveClass("text-[40px]", "sm:text-[44px]");
    expect(fourStarPity).toHaveClass("text-[40px]", "sm:text-[44px]");
    expect(fiveStarPity.className).toContain("fiveStarPity");
    expect(fourStarPity.className).toContain("fourStarPity");
    expect(fiveStarPity).not.toHaveAttribute("style");
    expect(fourStarPity).not.toHaveAttribute("style");

    const featureImage = latestRegion.querySelector("img");
    expect(featureImage).toHaveAttribute("src", "/genshin-wish-counter/ineffa-feature.webp");
    expect(featureImage).toHaveClass("object-cover");

    fireEvent.click(screen.getByRole("button", { name: "Standard" }));
    const standardFeature = screen.getByRole("region", { name: "Latest 5★" }).querySelector("img");
    expect(standardFeature).toHaveAttribute("src", "/genshin-wish-counter/primordial-jade-winged-spear.png");
  });

  it("keeps pity number-only, improves light-mode contrast, and explains the implementation", () => {
    render(<GenshinWishCounterProjectPage />);

    const pity = screen.getByLabelText("Pity 23 of 90");
    expect(pity).toHaveTextContent("23");
    expect(pity.childElementCount).toBe(0);
    const lightColor = pity.style.getPropertyValue("--pity-color-light");
    const lightness = Number(lightColor.match(/([0-9]+)%\)$/)?.[1]);
    expect(lightness).toBeLessThanOrEqual(48);

    expect(screen.getByRole("heading", { name: "About" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Implementation" })).toBeInTheDocument();
    expect(
      screen.getByText(/Wish history is pulled privately from HoYoVerse/i),
    ).toBeInTheDocument();
  });
});
