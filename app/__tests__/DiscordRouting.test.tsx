import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import DiscordLayout from "../../components/DiscordLayout";
import { ThemeProvider, useTheme } from "../../components/ThemeContext";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));

function DiscordThemeActivator() {
  const { setTheme } = useTheme();
  return <button onClick={() => setTheme("discord")}>Enable Discord</button>;
}

describe("Discord Client End-to-End Integration & Routing", () => {
  it("allows seamless channel navigation, thread opening, and closing", () => {
    const { container } = render(
      <ThemeProvider>
        <div>
          <DiscordThemeActivator />
          <DiscordLayout>
            <div>Main Content</div>
          </DiscordLayout>
        </div>
      </ThemeProvider>
    );

    // 1. Activate Discord theme
    fireEvent.click(screen.getByText("Enable Discord"));
    expect(screen.getByText("Welcome to #home!")).toBeInTheDocument();

    // 2. Switch to #projects via sidebar button
    const projectsNav = container.querySelector("#nav-projects") as HTMLElement;
    expect(projectsNav).toBeInTheDocument();
    fireEvent.click(projectsNav);
    expect(mockPush).toHaveBeenCalledWith("/projects");
    expect(screen.getByText("Welcome to #projects!")).toBeInTheDocument();

    // 3. Open a thread (e.g. Pantas)
    const pantasLinks = screen.getAllByText("View case study →");
    fireEvent.click(pantasLinks[0]);
    expect(mockPush).toHaveBeenCalledWith("/projects/pantas");

    // 4. Verify thread feed rendered with case study details
    expect(screen.getByText("The Spark")).toBeInTheDocument();
    expect(screen.getByText("Architecture Breakdown")).toBeInTheDocument();
    expect(screen.getByText("Outcome & Metrics")).toBeInTheDocument();

    // 5. Close the thread
    const backBtn = screen.getByRole("button", { name: /Back to #projects/i });
    fireEvent.click(backBtn);
    expect(mockPush).toHaveBeenCalledWith("/projects");
    expect(screen.getByText("Welcome to #projects!")).toBeInTheDocument();

    // 6. Switch to #blogs
    const blogsNav = container.querySelector("#nav-blogs") as HTMLElement;
    expect(blogsNav).toBeInTheDocument();
    fireEvent.click(blogsNav);
    expect(mockPush).toHaveBeenCalledWith("/blogs");
    expect(screen.getByText("Welcome to #blogs!")).toBeInTheDocument();
  });
});
