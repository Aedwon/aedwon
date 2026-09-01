import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import * as openSourceModule from "../open-source";

const moduleUnderTest = openSourceModule as typeof openSourceModule & {
  getPullRequestStatusLabel?: (pullRequest: Record<string, unknown>) => string;
  validateOpenSourceProjects?: (projects: unknown[]) => string[];
};

describe("open-source contribution lifecycle", () => {
  it("stores structured PR and review state instead of a presentation-only status", () => {
    for (const project of openSourceModule.OPEN_SOURCE_PROJECTS) {
      for (const pullRequest of project.pullRequests) {
        const record = pullRequest as unknown as Record<string, unknown>;
        expect(record.state).toMatch(/^(draft|open|merged|closed)$/);
        expect(record.reviewState).toMatch(
          /^(pending|approved|changes_requested|not_applicable)$/,
        );
        expect(record).not.toHaveProperty("status");
      }
    }
  });

  it("derives public labels from lifecycle facts", () => {
    expect(moduleUnderTest.getPullRequestStatusLabel).toBeTypeOf("function");
    if (!moduleUnderTest.getPullRequestStatusLabel) return;

    expect(
      moduleUnderTest.getPullRequestStatusLabel({
        number: 1,
        state: "open",
        reviewState: "approved",
      }),
    ).toBe("Approved");
    expect(
      moduleUnderTest.getPullRequestStatusLabel({
        number: 2,
        state: "merged",
        reviewState: "approved",
      }),
    ).toBe("Merged");
    expect(
      moduleUnderTest.getPullRequestStatusLabel({
        number: 3,
        state: "merged",
        reviewState: "approved",
        release: { version: "v1.2.3", releasedAt: "2026-09-01" },
      }),
    ).toBe("Released · v1.2.3");
  });

  it("does not render a release claim unless the PR is merged", () => {
    expect(moduleUnderTest.getPullRequestStatusLabel).toBeTypeOf("function");
    if (!moduleUnderTest.getPullRequestStatusLabel) return;

    expect(
      moduleUnderTest.getPullRequestStatusLabel({
        number: 4,
        state: "open",
        reviewState: "approved",
        release: { version: "v9.9.9", releasedAt: "2026-09-02" },
      }),
    ).toBe("Approved");
  });

  it("validates impossible and duplicate contribution records", () => {
    expect(moduleUnderTest.validateOpenSourceProjects).toBeTypeOf("function");
    if (!moduleUnderTest.validateOpenSourceProjects) return;

    const invalid = [
      {
        id: "example",
        repository: "owner/repo",
        pullRequests: [
          {
            number: 7,
            state: "open",
            reviewState: "approved",
            url: "https://github.com/owner/repo/pull/7",
            release: { version: "v1.0.0", releasedAt: "2026-09-01" },
          },
          {
            number: 7,
            state: "merged",
            reviewState: "approved",
            url: "https://github.com/other/repo/pull/8",
          },
        ],
      },
    ];

    const errors = moduleUnderTest.validateOpenSourceProjects(invalid);
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining("release requires merged state"),
        expect.stringContaining("duplicate pull request"),
        expect.stringContaining("does not match repository/number"),
      ]),
    );
  });

  it("keeps the shipped contribution registry internally consistent", () => {
    expect(moduleUnderTest.validateOpenSourceProjects).toBeTypeOf("function");
    if (!moduleUnderTest.validateOpenSourceProjects) return;

    expect(
      moduleUnderTest.validateOpenSourceProjects(
        openSourceModule.OPEN_SOURCE_PROJECTS,
      ),
    ).toEqual([]);
  });
});

describe("portfolio verification runtime contract", () => {
  it("keeps GitHub verification aligned with Vercel Node 24 and cancels stale same-ref runs", () => {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), "package.json"), "utf8"),
    ) as { engines?: { node?: string } };
    const workflow = readFileSync(
      join(process.cwd(), ".github/workflows/verify.yml"),
      "utf8",
    );

    expect(packageJson.engines?.node).toBe(">=24 <25");
    expect(workflow).toContain("node-version: 24");
    expect(workflow).toContain("concurrency:");
    expect(workflow).toContain(
      "group: portfolio-${{ github.workflow }}-${{ github.ref }}",
    );
    expect(workflow).toContain("cancel-in-progress: true");
  });
});
