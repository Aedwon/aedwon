# Adaptive Terminal Emerald Favicon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create an adaptive Terminal Emerald vector favicon (`</>`), high-res Apple icon, web app manifest, and configure clean "Aedwon" metadata for Next.js App Router.

**Architecture:** Implement native Next.js App Router icon conventions: adaptive SVG `app/icon.svg` with embedded `@media (prefers-color-scheme)` queries, `app/apple-icon.tsx` (using Next.js `ImageResponse`) for automated 180×180 Apple Touch icon rendering, `app/manifest.ts` for PWA metadata, fallback `public/favicon.ico` + `app/favicon.ico`, and `app/layout.tsx` metadata setting title to `"Aedwon"`.

**Tech Stack:** Next.js 16 (App Router / ImageResponse), SVG, TypeScript, React 19, Vitest

## Global Constraints

- Title in `app/layout.tsx` must strictly be `"Aedwon"`.
- Favicon motif is the monospace code tag `</>` with Terminal Emerald accent slash (`#10B981` in dark, `#059669` in light).
- SVG must embed `@media (prefers-color-scheme)` for zero-reload adaptive switching.
- All code must pass `npm run build` and `npm run test`.

---

### Task 1: Vector Favicon & Next.js Icon Scaffolding

**Files:**
- Create: `app/icon.svg`
- Create: `app/apple-icon.tsx`
- Create: `app/manifest.ts`
- Modify: `app/layout.tsx`
- Test: `app/__tests__/favicon-metadata.test.ts`

**Interfaces:**
- Produces: `app/icon.svg` (vector favicon with adaptive CSS)
- Produces: `app/apple-icon.tsx` (exports `size`, `contentType`, and default `Icon()` component)
- Produces: `app/manifest.ts` (exports default `manifest(): MetadataRoute.Manifest`)
- Modifies: `app/layout.tsx` (metadata title `"Aedwon"`)

- [ ] **Step 1: Write test for metadata and layout properties**

```typescript
// app/__tests__/favicon-metadata.test.ts
import { describe, it, expect } from "vitest";
import { metadata } from "../layout";
import manifest from "../manifest";

describe("Metadata and Manifest Verification", () => {
  it("exports exact page title 'Aedwon'", () => {
    expect(metadata.title).toBe("Aedwon");
  });

  it("exports manifest with correct branding", () => {
    const data = manifest();
    expect(data.name).toBe("Aedwon");
    expect(data.short_name).toBe("Aedwon");
    expect(data.theme_color).toBe("#18181B");
    expect(data.background_color).toBe("#18181B");
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm run test`
Expected: FAIL (manifest and test files not found)

- [ ] **Step 3: Create `app/icon.svg`**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <style>
    :root {
      --bg: #18181B;
      --border: #27272A;
      --bracket: #F4F4F5;
      --slash: #10B981;
    }
    @media (prefers-color-scheme: light) {
      :root {
        --bg: #FFFFFF;
        --border: #E4E4E7;
        --bracket: #09090B;
        --slash: #059669;
      }
    }
  </style>
  <rect width="32" height="32" rx="7" fill="var(--bg)" stroke="var(--border)" stroke-width="1"/>
  <path d="M10 11L5 16L10 21" stroke="var(--bracket)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M22 11L27 16L22 21" stroke="var(--bracket)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M18 9L14 23" stroke="var(--slash)" stroke-width="2.5" stroke-linecap="round"/>
</svg>
```

- [ ] **Step 4: Create `app/apple-icon.tsx` using `ImageResponse`**

```tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#18181B",
          borderRadius: 40,
          border: "4px solid #27272A",
        }}
      >
        <svg
          width="130"
          height="130"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 11L5 16L10 21"
            stroke="#F4F4F5"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M22 11L27 16L22 21"
            stroke="#F4F4F5"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18 9L14 23"
            stroke="#10B981"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
```

- [ ] **Step 5: Create `app/manifest.ts`**

```typescript
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aedwon",
    short_name: "Aedwon",
    description: "Computer Science at UP Diliman on a DOST Merit Scholarship. Software builds, client-side tools, and platforms.",
    start_url: "/",
    display: "standalone",
    background_color: "#18181B",
    theme_color: "#18181B",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
```

- [ ] **Step 6: Update `app/layout.tsx` metadata title**

Update `export const metadata: Metadata = { ... }` in `app/layout.tsx` so `title` is `"Aedwon"`.

- [ ] **Step 7: Generate fallback `app/favicon.ico` and `public/favicon.ico`**

Generate and copy standard ICO fallback to `app/favicon.ico` and `public/favicon.ico`.

- [ ] **Step 8: Run test suite and Next.js build**

Run: `npm run test && npm run build`
Expected: Tests PASS and `next build` succeeds.

- [ ] **Step 9: Commit**

```bash
git add app/icon.svg app/apple-icon.tsx app/manifest.ts app/layout.tsx app/__tests__/favicon-metadata.test.ts public/favicon.ico app/favicon.ico
git commit -m "feat(branding): add adaptive terminal emerald favicon, apple icon, and manifest"
```

---

### Task 2: Visual & Browser Dev Server Verification

**Files:**
- Test: Local browser verification via `npm run dev`

- [ ] **Step 1: Start dev server or open local page**

Run `npm run build` to ensure all routes and assets bundle cleanly.

- [ ] **Step 2: Verify live tab title and favicon in browser**

Verify browser tab displays title `"Aedwon"` and renders the vector favicon.

- [ ] **Step 3: Commit and update progress ledger**
