import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";
import DiscordLayout from "../../components/DiscordLayout";
import { ThemeProvider, useTheme } from "../../components/ThemeContext";

const mockPush = vi.fn();
let mockPathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: mockPush, replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
}));

function DiscordThemeActivator() {
  const { setTheme } = useTheme();
  return <button onClick={() => setTheme("discord")}>Enable Discord</button>;
}

function TestTree() {
  return (
    <ThemeProvider>
      <DiscordThemeActivator />
      <DiscordLayout>
        <div>Main Content</div>
      </DiscordLayout>
    </ThemeProvider>
  );
}

describe("Discord routing integration", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockPathname = "/";
    localStorage.clear();
  });

  it("navigates through the router and renders from the resulting pathname", () => {
    const { container, rerender } = render(<TestTree />);

    fireEvent.click(screen.getByText("Enable Discord"));
    expect(screen.getByText("Welcome to #home!")).toBeInTheDocument();

    fireEvent.click(container.querySelector("#nav-projects") as HTMLElement);
    expect(mockPush).toHaveBeenCalledWith("/projects");

    mockPathname = "/projects";
    rerender(<TestTree />);
    expect(screen.getByText("Welcome to #projects!")).toBeInTheDocument();

    fireEvent.click(screen.getAllByText("View case study →")[0]);
    expect(mockPush).toHaveBeenCalledWith("/projects/pantas");

    mockPathname = "/projects/pantas";
    rerender(<TestTree />);
    expect(screen.getByText("Keeping study state local")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Back to #projects/i }));
    expect(mockPush).toHaveBeenCalledWith("/projects");
  });
});
