import { PROJECTS, type ProjectItem } from "@/lib/data/projects";

export interface ProjectArticleSection {
  title: string;
  paragraphs: string[];
  codeSnippet?: string;
  codeLanguage?: string;
}

export type RegisteredProject = ProjectItem & {
  articleSections?: ProjectArticleSection[];
};

export const ADDITIONAL_PROJECTS: RegisteredProject[] = [
  {
    slug: "mlbb-post-game-extractor",
    title: "MLBB Post-Game Extractor",
    tagline:
      "Browser-based OCR pipeline that turns Mobile Legends post-game screenshots into reviewable match data and analysis-ready CSV exports without uploading images to a server.",
    category: "web",
    categoryLabel: "Web & Tools",
    tier: "focused",
    role: "Creator & Developer",
    timeline: "2026",
    featured: false,
    order: 13,
    glowColor: "cyan",
    brandColor: "#22D3EE",
    icon: "scan-text",
    platforms: [{ name: "Web", icon: "web" }],
    stack: [
      { name: "React 18", icon: "react" },
      { name: "Vite", icon: "vite" },
      { name: "Tesseract.js", icon: "ocr" },
      { name: "HTML5 Canvas", icon: "canvas" },
      { name: "WebAssembly", icon: "wasm" },
      { name: "Web Workers", icon: "worker" },
      { name: "localStorage", icon: "storage" },
      { name: "Vitest", icon: "test" },
    ],
    githubUrl: "https://github.com/Aedwon/mlbb-post-game-extractor",
    summary:
      "Client-side MLBB screenshot extractor that crops stat regions, runs OCR in browser workers, lets analysts reconcile the result, and exports match data in long or role-positional wide CSV formats.",
    problem:
      "Post-game analysis starts with screenshots, but screenshots are a poor data format. Copying kills, assists, damage, gold, hero picks, roles, bans, and match metadata by hand is slow enough that analysts either sample only a few games or accept inconsistent spreadsheets. I built this as a browser tool that turns a batch of MLBB post-game screens into structured rows while keeping the original images on the analyst's machine.",
    architecture: [
      {
        title: "Coordinate-mapped Canvas slicing",
        description:
          "The UI lets me define stat bounding boxes against a base screenshot. Those coordinates are stored as x, y, width, and height values, then reused across a batch. A symmetry lock mirrors regions across the center line so the same preset can target Blue and Red team columns without drawing every crop twice. Each screenshot is normalized through an off-screen canvas and sliced into small image blobs before OCR begins.",
        tradeOff:
          "This is deliberately template-driven instead of trying to detect the whole scoreboard layout with computer vision. It needs a preset when the game UI changes, but the crop is predictable and gives Tesseract much less visual noise to interpret.",
      },
      {
        title: "Tesseract.js in web workers",
        description:
          "The cropped stat cells are passed to Tesseract.js workers, so OCR runs through WebAssembly away from the main React thread. The app can process many small regions from several screenshots while the interface remains usable. Raw OCR output is normalized with field-specific parsing instead of treating every result as trustworthy text.",
        tradeOff:
          "Running OCR locally is heavier on the user's CPU than sending screenshots to a hosted vision API, but there is no image upload step, no API bill, and no external service holding match screenshots.",
      },
      {
        title: "Human reconciliation before export",
        description:
          "OCR is treated as a first pass, not ground truth. Extracted values are grouped by player in a review interface where the analyst can correct text, assign heroes and roles, add patch and draft metadata, choose the winning side, and verify duration before saving a match. Roster validation checks that role assignments are complete and unique before role-positional exports are produced.",
      },
      {
        title: "Long and role-positional CSV schemas",
        description:
          "The exporter supports two downstream shapes. Long format writes ten player rows per match for conventional analysis. Wide format places both teams into one role-positioned match row with 226 columns, which is useful when the next stage expects EXP, Jungle, Mid, Gold, and Roam features to stay in fixed positions instead of depending on player order.",
        tradeOff:
          "The wide schema is intentionally large. It is less pleasant to inspect by hand, but it removes reshaping work for models and team-analysis pipelines that need one feature vector per match.",
      },
    ],
    hurdles: [
      {
        title: "Mirrored scoreboards are not actually symmetric data",
        issue:
          "The visual layout suggests that Blue and Red team stat columns can be mirrored mechanically, but the DPS screen used a different red-side column order. That produced valid-looking crops attached to the wrong fields.",
        solution:
          "I separated visual crop mirroring from semantic field ordering and corrected the red-side DPS mapping explicitly instead of forcing one universal column sequence.",
      },
      {
        title: "OCR errors need a workflow, not a better promise",
        issue:
          "Small game fonts, compression, outlines, and dense numeric columns make occasional OCR mistakes unavoidable. Silently exporting the first recognition result would turn those mistakes into bad analysis data.",
        solution:
          "I put reconciliation in the normal path. OCR results stay editable, structured fields get parsers and validation, and manual metadata sits beside extracted stats before a row is considered ready for export.",
      },
    ],
    results:
      "The project now covers the full local pipeline from screenshot ingestion to normalized match exports. It has reusable crop presets, worker-based OCR, player-level review, hero and role assignment, patch and draft metadata, duration parsing, and selectable long or wide CSV output. No backend is required for image processing or export.",
    metrics: [
      { value: "0", label: "Server uploads required for screenshot processing" },
      { value: "10", label: "Player rows emitted per match in long format" },
      { value: "226", label: "Columns in the role-positional wide export" },
      { value: "2", label: "CSV layouts: long and wide" },
    ],
    retrospective:
      "If I extend this further, I would version crop presets against specific MLBB patches and add a confidence-driven review queue so low-confidence fields are surfaced first instead of making analysts scan every extracted value equally.",
  },
  {
    slug: "webp-unli",
    title: "WebP Unli",
    tagline:
      "Static browser image converter built around libvips through WebAssembly, with batch conversion, per-file settings, and no image upload step.",
    category: "web",
    categoryLabel: "Web & Tools",
    tier: "focused",
    role: "Creator & Developer",
    timeline: "2026",
    featured: false,
    order: 14,
    glowColor: "green",
    brandColor: "#22C55E",
    icon: "image-down",
    platforms: [{ name: "Web", icon: "web" }],
    stack: [
      { name: "Next.js 16", icon: "nextjs" },
      { name: "TypeScript", icon: "typescript" },
      { name: "Tailwind CSS", icon: "tailwind" },
      { name: "wasm-vips", icon: "wasm" },
      { name: "WebAssembly", icon: "wasm" },
      { name: "Web Workers", icon: "worker" },
      { name: "fflate", icon: "zip" },
      { name: "Vitest", icon: "test" },
      { name: "Playwright", icon: "test" },
    ],
    githubUrl: "https://github.com/Aedwon/webp-unli",
    summary:
      "Static browser image converter that runs libvips in a Web Worker, supports per-file batch settings, and keeps source images on the user's device.",
    problem:
      "WebP Unli is a browser converter that keeps source images on the user's device. The site is a static Next.js export, with image conversion handled locally through wasm-vips.",
    architecture: [],
    results:
      "The current tool covers local file selection through WebP download, including batch conversion, per-file settings, reconversion, and ZIP downloads.",
    articleSections: [
      {
        title: "Local conversion with libvips",
        paragraphs: [
          "WebP Unli is a browser converter that keeps source images on the user's device. The site is a static Next.js export. Image decoding, resizing, WebP encoding, and metadata stripping all happen locally through `wasm-vips`, so there is no image-processing API or upload queue behind the page.",
          "Each file's `ArrayBuffer` is transferred to a module worker. libvips decodes it, applies the selected resize and WebP options, then transfers the encoded buffer back. The first load includes roughly 10 MB of WebAssembly runtime files, which the browser can cache afterward.",
        ],
      },
      {
        title: "The batch queue changed after the first implementation",
        paragraphs: [
          "The first conversion flow could already process multiple files. A later commit fixed state around reconversion and overlapping jobs. `runConversion` originally closed over the `files` array. It now reads the current queue through a ref, keeps a count of active conversion batches, and copies the nested resize settings when a file enters the queue.",
          "Each file keeps its own settings after that point. Completed files can be converted again with different options, and two or more finished images can be packaged into one ZIP with `fflate`.",
        ],
      },
      {
        title: "Production loading needed two fixes",
        paragraphs: [
          "The worker originally lived beside the application code as TypeScript. Turbopack emitted it as a raw `.ts` asset in production, so the browser could not execute it and the loading screen never received its ready message. I moved the worker to `public/worker.js` and load it directly as a module worker.",
          "That fixed the worker file, but `wasm-vips` could still hang during initialization. Its `SharedArrayBuffer` and pthread path requires a cross-origin isolated page. Local development gets the COOP and COEP headers from `next.config.js`. The Vercel deployment sets the same headers in `vercel.json` because those Next.js headers are not carried into the static export.",
        ],
      },
      {
        title: "Where it is now",
        paragraphs: [
          "The input layer recognizes JPG, PNG, GIF, WebP, AVIF, TIFF, BMP, SVG, HEIC, and HEIF through MIME types with an extension fallback. Animated GIFs are flagged because the current converter only keeps the first frame. HEIC and HEIF files are accepted for conversion, while the file card skips a browser preview when the format cannot be displayed natively.",
          "Playwright covers the basic PNG and JPG conversion paths, multi-file download, removing files from the queue, and the conversion controls. The current conversion and export path runs without a backend.",
        ],
      },
    ],
  },
  {
    slug: "lakambini-events-redesign",
    title: "Lakambini Events Redesign",
    tagline:
      "Redesign of Lakambini Events across five core pages and nine service pages, with a shared content model and custom layouts for each division.",
    category: "web",
    categoryLabel: "Web & Tools",
    tier: "focused",
    role: "Redesign & Frontend Developer",
    timeline: "2026",
    featured: false,
    order: 15,
    glowColor: "green",
    brandColor: "#E9C255",
    icon: "layout-template",
    platforms: [{ name: "Web", icon: "web" }],
    stack: [
      { name: "Next.js", icon: "nextjs" },
      { name: "TypeScript", icon: "typescript" },
      { name: "Tailwind CSS v4", icon: "tailwind" },
      { name: "Framer Motion", icon: "motion" },
      { name: "next/image", icon: "nextjs" },
      { name: "next/font", icon: "nextjs" },
    ],
    githubUrl: "https://github.com/Aedwon/lakambini-redesign",
    summary:
      "Lakambini Events redesign with nine dedicated service pages, shared division data, and a frontend that grew most around the navigation and accessibility work.",
    problem:
      "Lakambini has nine service divisions covering live entertainment, multimedia, event production, training, design, community work, software, and spatial builds. I gave each division its own static page instead of stretching one Services template across all of them. The repeated names, capabilities, hero copy, and cross-links live in a shared TypeScript file, so the page layouts can differ without copying the same content everywhere.",
    architecture: [
      {
        title: "Nine divisions, nine pages",
        description:
          "The division routes are static. TANGHAL, DALOY, TAYO, and the other services can each use their own deep-dive sections, while the shared data file handles the content that repeats between pages. The visual rules work the same way. Noto Serif, Manrope, the emerald surface colors, and the main spacing decisions live in Tailwind v4 theme tokens and reusable utilities. There are fourteen pages in the current build, so keeping those values in one place saves me from fixing the same small inconsistency several times.",
      },
      {
        title: "The header got complicated",
        description:
          "What looks like a normal header ended up needing separate state for the desktop services menu, the mobile menu, the mobile services accordion, scroll progress, route changes, focus return, and reduced motion. The Git history shows the layout shell first, scroll-based styling after that, then a later move to requestAnimationFrame interpolation over the first 80 pixels. The accessibility pass came later and added the keyboard and menu behavior that was missing from the earlier implementation. Mobile controls were also brought to a 44 pixel touch baseline during that pass.",
      },
    ],
    results:
      "The page structure is in place across five core pages and nine service pages. The remaining work is mostly photography. Many of the larger slots still point to stock or reference images, and the repository only contains the real Lakambini logo locally. I wrote an archive image brief that lists the real event photo each slot needs, including the crop, subject, mood, and past projects worth checking. I am leaving those placeholders alone until the actual archive can replace them.",
  },
];

export const ALL_PROJECTS: RegisteredProject[] = [
  ...PROJECTS,
  ...ADDITIONAL_PROJECTS,
].sort((a, b) => a.order - b.order);
