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
      "Next.js redesign for Lakambini Events with five core pages, nine dedicated service routes, shared division data, and a scroll-responsive navigation system.",
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
      { name: "next/image", icon: "nextjs" },
      { name: "next/font", icon: "nextjs" },
    ],
    githubUrl: "https://github.com/Aedwon/lakambini-redesign",
    summary:
      "I rebuilt the Lakambini Events site around five core pages and nine individual service routes. Shared division data keeps repeated service information consistent, while each service page keeps its own layout and deep-dive content. The navigation also went through several implementation passes as the service structure, scroll behavior, mobile controls, and accessibility work came together.",
    problem:
      "Lakambini has nine service divisions. Each division has its own static route, while repeated service metadata is stored in a shared TypeScript data file and consumed by common hero and cross-link components.",
    architecture: [],
    results:
      "The page structure and visual system are in place. Many image slots still use remote placeholder or reference images, and the repository includes an archive image brief for replacing them with actual Lakambini event photography.",
    articleSections: [
      {
        title: "Nine service routes, one division model",
        paragraphs: [
          "Lakambini has nine service divisions covering live entertainment, multimedia production, experiential marketing, event production, training, design, community work, software, and spatial builds. I gave each division its own route under `app/services` instead of putting every service through one generic page template. The shared pieces stay consistent, but the rest of each page can follow the subject. TANGHAL has sections for live performances and talent management, while DALOY uses bento grids and feature blocks for its technology-focused content.",
          "The shared part is the division data instead of the page composition. `lib/divisions.ts` stores each division's slug, name, subtitle, description, capabilities, CTA copy, and image references. `DivisionHero` renders that information at the top of each service page, and `DivisionCrossLinks` reads the same array to link to the other eight divisions. This keeps repeated service metadata in one place without requiring the nine pages to share the same body layout.",
          "The broader visual rules are centralized as well. Noto Serif and Manrope are loaded through `next/font`, while the emerald surfaces, gold accents, font families, typography scales, and reusable effects live in the Tailwind v4 theme and utilities in `styles/globals.css`.",
        ],
      },
      {
        title: "The header changed in stages",
        paragraphs: [
          "The header started as part of the first shared layout shell. A later pass added scroll-based styling using a simple `window.scrollY > 50` state. As the header picked up the services dropdown and more visual transitions, that threshold became too coarse for the expanded-to-compact change.",
          "A later commit replaced the boolean transition with a `scrollProgress` value calculated across the first 80 pixels of scrolling. Scroll updates are scheduled with `requestAnimationFrame`, then the component interpolates the outer and inner padding, maximum width, border radius, background opacity, blur, shadow, and other visual properties. The desktop Inquire button also crossfades between its outline and filled versions over the same progress value.",
          "The current header has separate state for the desktop services dropdown, mobile menu, and mobile services accordion. Route changes close the open menus. Escape closes the menus and returns focus to the hamburger after closing the mobile menu. Opening that menu locks body scrolling. The accessibility pass also added `aria-expanded` and `aria-controls`, a 44 pixel mobile menu button, visible keyboard focus styles, and a reduced-motion path that snaps the header between states instead of running the scroll interpolation.",
        ],
      },
      {
        title: "The photography is still placeholder-heavy",
        paragraphs: [
          "The current repository has the visual system and page structure in place, but it does not yet contain the event photography that the redesign calls for. Many image slots still use remote Unsplash or Google-hosted references, and the only image currently stored under `public/images` is the Lakambini logo.",
          "I documented those placeholders in `ARCHIVE_IMAGE_BRIEF.md` instead of filling the site with substitute project imagery. The brief records the location and aspect ratio of each slot, the kind of archive photo that fits it, and composition notes for the dark emerald and gold treatment. It also points to specific past events where useful. That leaves a concrete path for replacing the references with actual Lakambini work once the archive photos are selected.",
        ],
      },
    ],
  },
];

export const ALL_PROJECTS: RegisteredProject[] = [
  ...PROJECTS,
  ...ADDITIONAL_PROJECTS,
].sort((a, b) => a.order - b.order);
