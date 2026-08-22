import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ExperienceDossier from "@/components/ExperienceDossier";

describe("ExperienceDossier", () => {
  it("keeps the mobile entity navigation row content-sized", () => {
    render(<ExperienceDossier />);

    const heading = screen.getByRole("heading", { name: "Experience" });
    const dossier = heading.nextElementSibling as HTMLElement;
    const rolesViewport = dossier.children[1] as HTMLElement;

    expect(dossier.className).toContain("grid-rows-[auto_minmax(0,1fr)]");
    expect(dossier.className).toContain("md:grid-rows-1");
    expect(rolesViewport.className).toContain("min-h-0");
  });
});
