import { describe, expect, it } from "vitest";
import {
  appendVaryAccept,
  preferredPageRepresentation,
} from "../accept-negotiation";

describe("Accept negotiation", () => {
  it("defaults normal browser and wildcard requests to HTML", () => {
    expect(preferredPageRepresentation(null)).toBe("text/html");
    expect(preferredPageRepresentation("*/*")).toBe("text/html");
    expect(
      preferredPageRepresentation(
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      ),
    ).toBe("text/html");
  });

  it("prefers Markdown when the client ranks it above HTML", () => {
    expect(preferredPageRepresentation("text/markdown")).toBe("text/markdown");
    expect(
      preferredPageRepresentation("text/markdown, text/html;q=0.8, */*;q=0.1"),
    ).toBe("text/markdown");
  });

  it("honors q-values, specificity, and explicit rejection", () => {
    expect(
      preferredPageRepresentation("text/markdown;q=0.5, text/html;q=0.9"),
    ).toBe("text/html");
    expect(
      preferredPageRepresentation("text/markdown;q=0, text/html;q=0.8, */*;q=1"),
    ).toBe("text/html");
    expect(preferredPageRepresentation("application/pdf")).toBeNull();
  });

  it("adds Accept to Vary without duplicating it", () => {
    expect(appendVaryAccept(null)).toBe("Accept");
    expect(appendVaryAccept("RSC, Next-Router-State-Tree")).toBe(
      "RSC, Next-Router-State-Tree, Accept",
    );
    expect(appendVaryAccept("RSC, Accept")).toBe("RSC, Accept");
  });
});
