// Test environment gaps that the real browser and the Next compiler fill in.
import { vi } from "vitest";

// next/font/google is replaced by the Next compiler at build time; outside it every font call is a stub.
vi.mock("next/font/google", () => {
  const font = () => ({ className: "font", variable: "font-var", style: { fontFamily: "font" } });
  return { Geist: font, Geist_Mono: font };
});

// jsdom has no matchMedia; report "no match" (the phone frame) unless a test overrides it.
if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
