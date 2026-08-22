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
      "Static WebP converter that runs wasm-vips in a browser worker and keeps source images off the server.",
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
      "Next.js static export that converts supported images to WebP in a wasm-vips worker. Each queued file stores its own options, and completed results can be downloaded individually or as a ZIP.",
    problem:
      "WebP Unli is a browser converter that keeps source images on the user's device. The site is a static Next.js export, with image conversion handled locally through wasm-vips.",
    architecture: [],
    results:
      "The current tool covers local file selection through WebP download, including batch conversion, per-file settings, reconversion, and ZIP downloads.",
    articleSections: [
      {
        title: "Browser-side conversion",
        paragraphs: [
          "WebP Unli is a static Next.js 16 export. When the page loads, useVips starts a module worker from /worker.js and waits for wasm-vips to report that it is ready. Converting a file means reading it into an ArrayBuffer, transferring that buffer to the worker, decoding it with libvips, applying the selected resize and WebP options, then transferring the encoded buffer back to the page. The result is wrapped in a WebP Blob for download. There is no image-processing API in that path.",
          "The worker uses thumbnailImage when resize is enabled, then writes the result as WebP with writeToBuffer. The write call receives the selected quality and lossless flag. Metadata stripping is passed through the same options object. The input filter accepts JPG and JPEG, PNG, GIF, WebP, AVIF, TIFF and TIF, BMP, SVG, and HEIC or HEIF by MIME type or file extension.",
        ],
      },
      {
        title: "Queue state lives with each file",
        paragraphs: [
          "Each file enters the queue with its own copy of the conversion options, including a separate nested resize object. That detail was added after the first queue implementation. The original runConversion callback closed over the files array, so reconversion could read an older queue snapshot. A later fix moved current entries into a ref, added a counter for active conversion batches, copied the nested resize settings, and disabled reconvert controls while conversion was already running.",
          "There is one module worker for the page. Convert All submits every idle entry through the same worker-backed conversion function while React keeps status and progress on each FileEntry. Finished files can be downloaded one at a time. When at least two results are ready, Download All reads the WebP blobs into Uint8Arrays and packages them with fflate.",
        ],
      },
      {
        title: "Getting wasm-vips through a static build",
        paragraphs: [
          "The worker first lived in lib/worker.ts and was constructed from a module URL. Turbopack emitted it as a raw TypeScript asset in production, which the browser could not execute. The worker never sent its ready message, so the page stayed on the loading screen. I moved the worker to public/worker.js as plain JavaScript and load that static asset directly instead.",
          "That fixed the worker asset, but wasm-vips still depended on cross-origin isolation because its SharedArrayBuffer and pthread path needs COOP and COEP. For local development, next.config.js sends Cross-Origin-Opener-Policy as same-origin and Cross-Origin-Embedder-Policy as require-corp. The Vercel deployment repeats those headers in vercel.json because the static export does not carry the Next.js header configuration into the built site.",
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

const NORALA_PROJECT_OVERRIDE: Partial<RegisteredProject> = {
  title: "Norala SB Transparency Portal",
  tagline:
    "Unofficial bilingual legislative-transparency prototype for the Sangguniang Bayan of Norala, built around repository-backed records, linked council data, and explicit demo safeguards.",
  role: "Creator & Developer",
  timeline: "2026",
  stack: [
    { name: "Next.js 16", icon: "nextjs" },
    { name: "TypeScript", icon: "typescript" },
    { name: "Tailwind CSS 4", icon: "tailwind" },
    { name: "next-intl", icon: "i18n" },
  ],
  liveUrl: "https://norala-sb-demo.vercel.app",
  githubUrl: "https://github.com/Aedwon/norala-sb-demo",
  summary:
    "Unofficial bilingual legislative-transparency prototype with repository-backed records, derived council links, and explicit safeguards that keep the demo separate from an official LGU service.",
  problem:
    "Norala SB Transparency Portal is a student proof-of-concept for the Sangguniang Bayan of Norala, South Cotabato. It uses synthetic officials and legislative records and was prepared for possible donation to the LGU. The current repository has no application database or admin backend. Its public records are kept with the code instead.",
  architecture: [],
  hurdles: undefined,
  results:
    "The current prototype connects repository-backed legislative records to council, committee, session, announcement, and bilingual route views while keeping the deployment visibly marked as unofficial. The ordinance index and detail routes remain placeholders in the current code.",
  metrics: undefined,
  retrospective: undefined,
  articleSections: [
    {
      title: "Repository-backed legislative records",
      paragraphs: [
        "Norala SB Transparency Portal is a student proof-of-concept for the Sangguniang Bayan of Norala, South Cotabato. It uses synthetic officials and legislative records and was prepared for possible donation to the LGU. The current repository has no application database or admin backend. Its public records are kept with the code instead.",
        "Legislative documents and announcements live in repository content files. Officials, committees, sessions, and the subject vocabulary live in TypeScript. `lib/content.ts` reads document frontmatter and body content, then builds the relationships used elsewhere in the site.",
        "Some of those relationships are derived instead of stored twice. An official's authored legislation is found by matching document `authorSlugs`. Committee pages collect legislation through `committeeSlug`. When one document lists another under `amends`, the loader derives the reverse `amendedBy` relationship.",
        "The content layer also has a `verifyCrossLinks()` pass for references between records. It checks document authors, committees, sessions, amendment targets, and document links inside session agendas. The Git history shows this data layer landing with a temporary verification page before the council, session, and announcement pages were built. That debug route was removed after the content relationships had been checked.",
      ],
    },
    {
      title: "One set of records across two locales",
      paragraphs: [
        "The application uses `next-intl` with `/en` and `/fil` as explicit route prefixes. The locale layout generates both route variants, loads the matching message bundle, sets the document language, and wraps the page in the same header, footer, skip link, and prototype banner.",
        "The content records themselves are shared. On the home page, the same legislative document supplies either `summaryEn` or `summaryFil` depending on the route. Council pages do the same with official biographies while translated interface labels come from the locale message files. A later commit also fixed the home page links so internal navigation keeps the active locale prefix.",
        "The home page pulls recent legislation, the next scheduled session, and the latest announcements from the same content layer. Council pages use the document relationships to connect officials and committees back to the records associated with them.",
      ],
    },
    {
      title: "Keeping the prototype visibly unofficial",
      paragraphs: [
        "The demo status is part of the implementation instead of being left to a disclaimer at the bottom of the page. The locale layout always renders a prototype banner. Page metadata sets `index` and `follow` to false, and `robots.ts` blocks crawling of the site. The contact page shows the shape of an official inquiry form, but every control is disabled and the page states that the demo does not submit or store the entered information.",
        "The handover document treats those restrictions as adoption steps. It explains how an LGU team could replace the synthetic records and remove the demo banner and crawler restrictions if the repository were adopted for official use.",
        "The current build is still incomplete around ordinance browsing. The home page includes a search form and links to recent legislation, but the `/ordinances` index and `/ordinances/[slug]` detail routes are placeholders in the current code. The project specification describes a FlexSearch index, URL-based filters, and a fuller document view, but those pieces are not implemented in the current `main` branch. The current repository also does not contain the SQLite, Prisma, Workbox, OCR, or PWA implementation claimed by the older portfolio article.",
      ],
    },
  ],
};

const REGISTERED_BASE_PROJECTS: RegisteredProject[] = PROJECTS.map((project) =>
  project.slug === "norala-sb-portal"
    ? ({ ...project, ...NORALA_PROJECT_OVERRIDE } as RegisteredProject)
    : project,
);

export const ALL_PROJECTS: RegisteredProject[] = [
  ...REGISTERED_BASE_PROJECTS,
  ...ADDITIONAL_PROJECTS,
].sort((a, b) => a.order - b.order);
