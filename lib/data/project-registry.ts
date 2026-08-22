import { PROJECTS, type ProjectItem } from "@/lib/data/projects";

export const ADDITIONAL_PROJECTS: ProjectItem[] = [
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
      "Static in-browser image converter using libvips through WebAssembly and a Web Worker, with batch controls, local processing, and no upload step.",
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
      "Private browser-based image converter that runs libvips locally, supports batch WebP conversion with per-file overrides, and packages completed files into a ZIP without sending source images to a server.",
    problem:
      "I wanted a WebP converter that did not require uploading personal images to a remote service, creating an account, or giving up control of the original files just to change formats. The real engineering problem was making a native-grade image library work inside a static browser application while keeping conversions responsive and giving each file enough control for quality, resizing, and metadata removal.",
    architecture: [
      {
        title: "libvips running inside a web worker",
        description:
          "The conversion engine is a plain JavaScript module worker served from public/worker.js. It loads wasm-vips at runtime, decodes the transferred image buffer with libvips, optionally resizes it, and writes the result back to a WebP buffer with the selected quality, lossless, and metadata-strip settings. The input ArrayBuffer is transferred to the worker instead of copied. The encoded output buffer is transferred back to the page when conversion finishes.",
        tradeOff:
          "The first visit has to download and initialize roughly 10 MB of WebAssembly runtime files. That is a real startup cost, but the files can then be cached by the browser and the actual images never need a conversion server.",
      },
      {
        title: "Static export with a runtime codec",
        description:
          "The site uses Next.js static export, so production hosting only serves files. The worker and wasm-vips runtime live under public/, while the application code coordinates conversion entirely in the browser. The user's device provides the conversion capacity. There is no backend queue.",
        tradeOff:
          "A static deployment removes server-side image processing, but browser capabilities and cross-origin isolation become part of the application runtime instead of infrastructure details hidden behind an API.",
      },
      {
        title: "Batch queue with per-file overrides",
        description:
          "Files enter a React-managed queue with a copy of the current global conversion settings. Each file can then override quality, lossless mode, resize dimensions, aspect-ratio locking, and metadata stripping without changing the rest of the batch. Conversions run through the worker with progress callbacks, completed files can be re-converted with new settings, and fflate bundles finished outputs into one ZIP for batch download.",
      },
      {
        title: "Format intake and edge cases",
        description:
          "The input layer recognizes JPG, PNG, GIF, WebP, AVIF, TIFF, BMP, SVG, HEIC, and HEIF through MIME types with extension fallback when browser metadata is incomplete. Animated GIFs are scanned for multiple graphic-control blocks and explicitly flagged because the current converter only keeps the first frame. HEIC files also skip browser-native previews when the browser cannot display them directly.",
      },
    ],
    hurdles: [
      {
        title: "A worker that built successfully but could not run",
        issue:
          "The original worker lived as TypeScript beside the application code. In production, Turbopack treated it as a static asset and emitted the raw TypeScript file, which the browser could not parse. The page then sat on its loading state waiting for a ready message that would never arrive.",
        solution:
          "I moved the worker to public/worker.js as plain JavaScript and instantiate it directly as a module worker. That makes the browser receive executable JavaScript instead of relying on the bundler to transform a worker entry correctly.",
      },
      {
        title: "wasm-vips needed cross-origin isolation",
        issue:
          "Even with the worker loading correctly, wasm-vips could hang during initialization because its SharedArrayBuffer and pthread path requires a cross-origin isolated page. A static export also meant Next.js production headers were not enough by themselves.",
        solution:
          "I set Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy headers for local development in next.config.js and again in vercel.json for the deployed static site. Once both environments were isolated correctly, the worker could initialize the threaded WebAssembly runtime instead of remaining on the loading screen.",
      },
    ],
    results:
      "WebP Unli now runs as a fully static conversion tool with no backend image-processing path. It supports batch conversion, quality and lossless output, resizing, metadata stripping, per-file settings, reconversion, animated-GIF warnings, and ZIP download while keeping source files on the user's device.",
    metrics: [
      { value: "0", label: "Server uploads required for image conversion" },
      { value: "~10 MB", label: "WebAssembly runtime downloaded and cached on first load" },
      { value: "8+", label: "Documented source image formats accepted" },
      { value: "Static", label: "Next.js export with browser-side conversion" },
    ],
    retrospective:
      "If I keep developing it, I'd start with the initial codec load. I'd make the download cost more visible and test whether optional decoders can be split or deferred. True animated-image conversion would come after that instead of stopping at the first GIF frame.",
  },
];

export const ALL_PROJECTS: ProjectItem[] = [
  ...PROJECTS,
  ...ADDITIONAL_PROJECTS,
].sort((a, b) => a.order - b.order);