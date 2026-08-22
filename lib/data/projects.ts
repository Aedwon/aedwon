export interface TechItem {
  name: string;
  category?: string;
  icon?: string;
}

export interface ProjectMetric {
  value: string;
  label: string;
}

export interface ProjectHurdle {
  title: string;
  issue: string;
  solution: string;
}

export interface ProjectArchitectureItem {
  title: string;
  description: string;
  tradeOff?: string;
  codeSnippet?: string;
  codeLanguage?: string;
}

export interface ProjectArticleSection {
  title: string;
  paragraphs: string[];
  codeSnippet?: string;
  codeLanguage?: string;
}

export interface ProjectItem {
  slug: string;
  title: string;
  tagline: string;
  category: "mobile" | "web" | "bots" | "civic";
  categoryLabel: string;
  tier: "flagship" | "focused";
  role: string;
  timeline: string;
  featured: boolean;
  order: number;
  glowColor: "blue" | "purple" | "pink" | "violet" | "green" | "amber" | "cyan";
  brandColor: string;
  icon: string;
  platforms: { name: string; icon: "android" | "apple" | "web" | "server" }[];
  stack: TechItem[];
  liveUrl?: string;
  githubUrl?: string;
  summary: string;
  problem: string;
  architecture: ProjectArchitectureItem[];
  hurdles?: ProjectHurdle[];
  results: string;
  metrics?: ProjectMetric[];
  retrospective?: string;
  articleSections?: ProjectArticleSection[];
}

/**
 * Canonical project records used by every presentation of the portfolio.
 * Keep factual changes aligned with docs/portfolio-copy.md.
 */
export const PROJECTS: ProjectItem[] = [
  {
    slug: "pantas",
    title: "Pantas",
    tagline: "Android-first exam reviewer for Philippine civil service and university entrance preparation, with encrypted local study state and on-device FSRS-6 scheduling.",
    category: "mobile",
    categoryLabel: "Mobile & Offline",
    tier: "flagship",
    role: "Lead Architect & Developer",
    timeline: "2026 to Present",
    featured: true,
    order: 1,
    glowColor: "blue",
    brandColor: "#60A5FA",
    icon: "book-open",
    platforms: [{ name: "Android", icon: "android" }],
    stack: [
      { name: "Flutter 3.41+", icon: "flutter" },
      { name: "Dart", icon: "dart" },
      { name: "Drift (SQLite)", icon: "sqlite" },
      { name: "SQLCipher", icon: "lock" },
      { name: "Riverpod 2.x", icon: "state" },
      { name: "Open Spaced Repetition (FSRS)", icon: "fsrs" },
      { name: "Firebase Firestore", icon: "firebase" },
      { name: "Sanity CMS", icon: "cms" },
      { name: "RevenueCat", icon: "payment" },
    ],
    liveUrl: "https://pantas.app",
    summary: "Pre-launch Flutter reviewer for Philippine exam preparation, with local encrypted progress, FSRS-6 review scheduling, and a validated question-to-SQLite content pipeline.",
    problem: "Pantas is a pre-launch Flutter reviewer for Philippine exam preparation. Its current implementation keeps study state in an encrypted local database and schedules practice with an on-device FSRS-6 engine.",
    architecture: [],
    results: "The local study and scheduling paths are implemented. Firebase-backed account sync and the mock-exam content path are not currently usable in the running build.",
    articleSections: [
      {
        title: "Keeping study state local",
        paragraphs: [
          "Pantas stores its mutable study state in a Drift database instead of depending on a network request before a quiz can work. The database includes attempts, review state, quiz sessions, lesson progress, preferences, review logs, and a queue of changes waiting to sync.",
          "The database is opened through Drift's background native database path. Pantas generates a 32-byte key with `Random.secure()`, stores that key through `flutter_secure_storage`, and supplies it to SQLite3MultipleCiphers in SQLCipher compatibility mode. The repository also records the migration details because changing the encryption library or secure-storage format incorrectly could leave an existing install unable to open its own database.",
          "The sync layer was built around that local state. Changes such as an updated review schedule are added to a persistent pending queue, which keeps failed operations available for another attempt. The Firestore mappers, push and pull paths, and conflict handling exist in the repository. They are not live in the current build because Firebase bootstrap is still intentionally unwired.",
        ],
      },
      {
        title: "What happens after an answer",
        paragraphs: [
          "A practice answer feeds directly into the review scheduler. `SubmitAnswer` checks the selected choice, derives a scheduler rating from correctness and response time, loads the existing review state or creates a new one, runs the FSRS scheduler, and saves the next due state. The same operation writes a review log containing the state from before the review, the rating that was actually used, correctness, response duration, and the version of the rating heuristic.",
          "That log was added when the scheduler moved from FSRS-4.5 to FSRS-6. The original implementation landed in May with separate paths for new questions, successful reviews, and lapses. In July, the scheduler moved to FSRS-6's 21 default weights, a trainable decay parameter, and a separate same-day stability formula. Tests were updated with reference values and migration cases so existing review states could continue through the new formulas.",
          "The current build still uses the published default weight vector. There is a separate design for fitting weights from a student's review history on the device, but that optimizer has not been implemented. Keeping that distinction in the article matters because the scheduling code is real today while personalized parameter fitting is not.",
        ],
      },
      {
        title: "Fixing passage ordering at the session boundary",
        paragraphs: [
          "Reading-comprehension passages exposed a problem in how quiz sessions were assembled. Quick Quiz shuffled individual questions, which could split questions from one passage across different parts of the session. A student could read the same passage, answer something unrelated, then encounter another question from that passage later.",
          "The first fix grouped passage questions in the Quick Quiz path. That did not solve the general case because other use cases could create sessions through different routes. The grouping logic was moved into `QuizSession.start`, which is the shared constructor for new quiz sessions. Every new session now runs its questions through `groupPassageSets` before the first answer is recorded.",
          "Resumed sessions deliberately keep their stored order. Answer outcomes are indexed by question position, so regrouping a session after answers already exist could attach those outcomes to different questions. The common constructor is therefore the right boundary for new-session ordering, while resume restores the order that was originally saved.",
        ],
      },
      {
        title: "Building content before it reaches the app",
        paragraphs: [
          "Questions are authored as structured files and pass through tooling before they are packed into the application. The authoring runbook has a validator for schema and content errors, followed by a Question Studio review step for flagged issues and duplicate stems. Questions that need a figure can stay inactive until the required illustration and renderer exist.",
          "The content model also separates two meanings of difficulty. Authored difficulty is only used to organize the writing progression from easier questions toward exam-level ones. It is not written into the runtime question model. FSRS difficulty belongs to an individual student's review state and changes from their actual review history instead.",
          "For the SQLite content path, the seed writer takes exported JSON and passes exams, subjects, topics, passages, questions, choices, lessons, and related records through the project's content parsers before writing `content.db`. When it builds the shipped database asset, it hashes the finished SQLite file and writes a shortened digest into `content_seed_version.dart`. The installer can use that digest to tell that bundled content changed instead of relying on somebody remembering to update a date or version string by hand.",
          "Pantas is still in active pre-launch development. The local study and scheduling paths are implemented, while Firebase-backed account sync and the mock-exam content path are not currently usable in the running build. I am keeping those unfinished pieces out of the feature claims until their runtime paths are actually connected.",
        ],
      },
    ],
  },
  {
    slug: "msl-network",
    title: "MSL Network Bot",
    tagline: "Single-server MLBB Discord bot that connects account verification with XP, Event Points, events, quests, moderation, and reporting.",
    category: "bots",
    categoryLabel: "Bots & Systems",
    tier: "flagship",
    role: "Developer",
    timeline: "2026",
    featured: true,
    order: 2,
    glowColor: "purple",
    brandColor: "#818CF8",
    icon: "bot",
    platforms: [
      { name: "Discord", icon: "server" },
      { name: "Web", icon: "web" },
    ],
    stack: [
      { name: "Python", icon: "python" },
      { name: "Discord.py", icon: "bot" },
      { name: "MySQL", icon: "mysql" },
      { name: "aiomysql", icon: "database" },
      { name: "aiohttp", icon: "web" },
      { name: "Vercel", icon: "vercel" },
      { name: "Pterodactyl", icon: "server" },
    ],
    githubUrl: "https://github.com/Aedwon/Discord-Bot",
    summary: "Single-server MLBB Discord bot that connects account verification with XP, Event Points, events, quests, moderation, and reporting.",
    problem: "The bot grew from XP, moderation, and boost tracking into the server's shared layer for verification, event participation, quests, moderation, and reporting.",
    architecture: [],
    results: "The current code keeps Discord interactions in modular cogs, shared state in MySQL-backed services, and selected admin and analytics surfaces in Vercel serverless endpoints.",
    articleSections: [
      {
        title: "From XP tracking to community operations",
        paragraphs: [
          "The bot started in January 2026 with XP, moderation, and boost tracking. The leveling code already collected pending message, reaction, and voice XP in memory before writing updates. As more features arrived, the project moved into separate Discord cogs backed by shared services and an async MySQL pool. The current entry point loads verification, events, raffles, quests, tickets, analytics, moderation, voice tools, and other server features from one process.",
          "The bot is intentionally scoped to one Discord server. `config.py` carries a single guild ID, and startup opens the database, restores persistent views, then syncs slash commands to that guild. Configurable role and channel IDs live in database-backed settings. It is server-specific community infrastructure instead of a general multi-server bot framework.",
        ],
      },
      {
        title: "Verification became part of the economy",
        paragraphs: [
          "MLBB account verification landed in March after XP and Event Points were already present. A persistent Discord button opens a modal for a member's full name, MLBB UID, server ID, and an optional referral code. The verification service enforces a unique MLBB UID in MySQL, then keeps verified Discord user IDs in an in-memory set. Message, reaction, voice, XP, and Event Point paths can check that set without querying the verification table for every activity update.",
          "MSL cross-referencing came next. The current service reads the public `FINAL` Google Sheet tab as CSV with `aiohttp`, normalizes the UID and server values, and rebuilds an in-memory lookup every six hours. The first implementation keyed MSL records by UID alone. A later change moved the lookup to the `(UID, server)` pair used by the current code. The same check now feeds eligibility rules in event registration, placements, and raffles.",
        ],
      },
      {
        title: "Event workflows use Discord state directly",
        paragraphs: [
          "Event tracking stays attached to Discord Scheduled Events instead of maintaining a separate event calendar. An administrator can configure an activity workflow for an event. Audio workflows accumulate minutes from voice-state changes. Text workflows count qualifying messages. Forum entries require an administrator to validate the post with a check reaction. A kiosk workflow can require registration before a participation claim is accepted.",
          "Progress is kept in memory while an event is active and written to MySQL as it changes. When Discord marks the scheduled event complete, the bot flushes remaining voice time, checks stored progress against the configured threshold, records eligible rewards, and sends the Event Point change through the existing economy service. The same event system also tracks registration, placement rewards, participation claims, and peak attendance across the main and overflow voice channels.",
        ],
      },
      {
        title: "Web admin tools share the same data",
        paragraphs: [
          "Not every admin surface stayed inside Discord. The repository includes a Vercel endpoint for the quest configuration dashboard with authenticated create, edit, activation, and deletion operations against the same quest tables used by the bot. Daily quests themselves track message counts, voice minutes, or reactions and store each member's assignment and progress in MySQL.",
          "The analytics dashboard follows a similar split. Its serverless endpoint reads daily rollups from MySQL and resolves cached Discord member and channel names before returning the dashboard data. The long-running Discord process uses `aiomysql`, while these request-based endpoints use `PyMySQL`. Both sides work from the same database instead of maintaining a second reporting store.",
        ],
      },
    ],
  },
  {
    slug: "norala-sb-portal",
    title: "Norala SB Transparency Portal",
    tagline: "Unofficial bilingual legislative-transparency prototype for the Sangguniang Bayan of Norala, built around repository-backed records, linked council data, and explicit demo safeguards.",
    category: "civic",
    categoryLabel: "Civic Tech",
    tier: "flagship",
    role: "Creator & Developer",
    timeline: "2026",
    featured: false,
    order: 3,
    glowColor: "green",
    brandColor: "#10B981",
    icon: "building-columns",
    platforms: [{ name: "Web", icon: "web" }],
    stack: [
      { name: "Next.js 16", icon: "nextjs" },
      { name: "TypeScript", icon: "typescript" },
      { name: "Tailwind CSS 4", icon: "tailwind" },
      { name: "next-intl", icon: "i18n" },
    ],
    liveUrl: "https://norala-sb-demo.vercel.app",
    githubUrl: "https://github.com/Aedwon/norala-sb-demo",
    summary: "Unofficial bilingual legislative-transparency prototype with repository-backed records, derived council links, and explicit safeguards that keep the demo separate from an official LGU service.",
    problem: "Norala SB Transparency Portal is a student proof-of-concept for the Sangguniang Bayan of Norala, South Cotabato. It uses synthetic officials and legislative records and was prepared for possible donation to the LGU. The current repository has no application database or admin backend. Its public records are kept with the code instead.",
    architecture: [],
    results: "The current prototype connects repository-backed legislative records to council, committee, session, announcement, and bilingual route views while keeping the deployment visibly marked as unofficial. The ordinance index and detail routes remain placeholders in the current code.",
    articleSections: [
      {
        title: "Repository-backed legislative records",
        paragraphs: [
          "Legislative documents and announcements live in repository content files. Officials, committees, sessions, and the subject vocabulary live in TypeScript. `lib/content.ts` reads document frontmatter and body content, then builds the relationships used elsewhere in the site.",
          "Some of those relationships are derived instead of stored twice. An official's authored legislation is found by matching document `authorSlugs`. Committee pages collect legislation through `committeeSlug`. When one document lists another under `amends`, the loader derives the reverse `amendedBy` relationship.",
          "The content layer also has a `verifyCrossLinks()` pass for references between records. It checks document authors, committees, sessions, amendment targets, and document links inside session agendas.",
        ],
      },
      {
        title: "One set of records across two locales",
        paragraphs: [
          "The application uses `next-intl` with `/en` and `/fil` as explicit route prefixes. The content records themselves are shared, while translated interface labels come from locale message files.",
          "The home page pulls recent legislation, the next scheduled session, and the latest announcements from the same content layer. Council pages use the document relationships to connect officials and committees back to the records associated with them.",
        ],
      },
      {
        title: "Keeping the prototype visibly unofficial",
        paragraphs: [
          "The demo status is part of the implementation. The locale layout always renders a prototype banner. Page metadata sets `index` and `follow` to false, and `robots.ts` blocks crawling of the site. The contact page shows the shape of an official inquiry form, but every control is disabled and the page states that the demo does not submit or store the entered information.",
          "The current build is still incomplete around ordinance browsing. The `/ordinances` index and `/ordinances/[slug]` detail routes are placeholders in the current code. The current repository also does not contain the SQLite, Prisma, Workbox, OCR, or PWA implementation claimed by the older portfolio article.",
        ],
      },
    ],
  },
  {
    slug: "pso-scoring-model",
    title: "PSO Automated Scorer",
    tagline: "Automated evaluation, tiebreaker, and bracket ranking engine processing 4,000+ national Science Olympiad competitors across multiple elimination tiers.",
    category: "bots",
    categoryLabel: "Bots & Systems",
    tier: "flagship",
    role: "Lead Scoring Architect",
    timeline: "2024",
    featured: false,
    order: 4,
    glowColor: "amber",
    brandColor: "#F59E0B",
    icon: "award",
    platforms: [{ name: "Server", icon: "server" }],
    stack: [
      { name: "Python", icon: "python" },
      { name: "Pandas", icon: "pandas" },
      { name: "NumPy", icon: "numpy" },
      { name: "Google Sheets API", icon: "sheets" },
    ],
    summary: "Evaluation and scoring model processing 4,000+ national Science Olympiad competitors across elimination tiers.",
    problem: "Grading, applying complex tiebreaker matrices, and ranking 4,000+ high school student competitors across regional cluster eliminations within tight 2-hour event turnaround windows.",
    architecture: [
      {
        title: "Automated Matrix Scoring Pipeline",
        description: "Vectorized NumPy and Pandas matrix operations evaluating regional cluster answer keys, applying subject-weighted penalties, and computing tiebreakers in seconds.",
      },
    ],
    hurdles: [
      {
        title: "Multi-Way Tiebreaker Deadlocks",
        issue: "Top national qualifiers frequently tied on total score, requiring recursive evaluation of difficulty-weighted question tiers and timestamp priority.",
        solution: "Implemented a deterministic multi-key sorting algorithm evaluating total score, tier-3 problem counts, and verification check marks in sequence.",
      },
    ],
    results: "Processed scores and verified rankings for 4,000+ competitors with 100% accuracy and zero tabulation delays.",
    metrics: [
      { value: "4,000+", label: "Competitors scored and ranked" },
      { value: "100%", label: "Tabulation accuracy across elimination rounds" },
    ],
  },
  {
    slug: "qr-studio",
    title: "QR Studio",
    tagline: "Zero-backend client-side custom QR code generator with gradient styling and crisp vector SVG/PNG export.",
    category: "web",
    categoryLabel: "Web & Tools",
    tier: "focused",
    role: "Creator & Frontend Engineer",
    timeline: "2024",
    featured: true,
    order: 5,
    glowColor: "pink",
    brandColor: "#FB7185",
    icon: "qr-code",
    platforms: [{ name: "Web", icon: "web" }],
    stack: [
      { name: "TypeScript", icon: "typescript" },
      { name: "HTML5 Canvas", icon: "canvas" },
      { name: "Vite", icon: "vite" },
      { name: "Tailwind CSS", icon: "tailwind" },
    ],
    summary: "In-browser QR code builder with gradient styling and SVG export that runs entirely client-side without backend requests.",
    problem: "Most web QR code generators are bloated with popups, require account sign-ups, or transmit user payloads and Wi-Fi credentials to remote tracking servers.",
    architecture: [
      {
        title: "Client-side Canvas and vector matrix engine",
        description: "Generates the Reed-Solomon error correction matrix and encodes payload bits in memory. Renders real-time gradient patterns directly on an HTML5 canvas and exports clean SVG path strings for print-ready vector files.",
      },
    ],
    results: "Instant in-browser generator with zero network latency, complete data privacy, and clean vector exports.",
    metrics: [
      { value: "0ms", label: "Network latency with zero backend requests" },
      { value: "100%", label: "Client-side privacy and vector precision" },
    ],
  },
  {
    slug: "kiosk-survey",
    title: "Kiosk Survey",
    tagline: "Offline touchscreen survey application for Android TV operating reliably in high-density event environments with automatic queue syncing.",
    category: "mobile",
    categoryLabel: "Mobile & Offline",
    tier: "focused",
    role: "Lead Developer",
    timeline: "2023 to 2024",
    featured: true,
    order: 6,
    glowColor: "violet",
    brandColor: "#A78BFA",
    icon: "tv",
    platforms: [{ name: "Android TV", icon: "android" }],
    stack: [
      { name: "Flutter", icon: "flutter" },
      { name: "Dart", icon: "dart" },
      { name: "SQLite", icon: "sqlite" },
      { name: "Android TV", icon: "android" },
    ],
    summary: "Touchscreen survey app for Android TV that operated for 8 continuous hours during a live event without internet, syncing queued submissions once reconnected.",
    problem: "Event venues suffer from severe cellular congestion and dropped Wi-Fi under crowd loads. Standard web forms freeze or drop responses when attendees submit surveys at interactive booths.",
    architecture: [
      {
        title: "Android TV local persistence queue",
        description: "Every attendee submission writes immediately to a local SQLite journal. A connectivity listener detects stable connections and flushes queued JSON records in atomic batches.",
      },
    ],
    results: "Ran continuously for 8 hours on-site during a high-density live event with zero dropped responses and zero crashes.",
    metrics: [
      { value: "8 Hours", label: "Continuous offline operation during live event" },
      { value: "0", label: "Dropped survey submissions or app crashes" },
    ],
  },
  {
    slug: "bettergov-ph",
    title: "BetterGov PH",
    tagline: "Open-source civic tech initiative modernizing Philippine government digital infrastructure and public service portals.",
    category: "civic",
    categoryLabel: "Civic Tech",
    tier: "focused",
    role: "Open Source Contributor",
    timeline: "2024 to Present",
    featured: false,
    order: 7,
    glowColor: "green",
    brandColor: "#34D399",
    icon: "shield-check",
    platforms: [{ name: "Web", icon: "web" }],
    stack: [
      { name: "TypeScript", icon: "typescript" },
      { name: "Next.js", icon: "nextjs" },
      { name: "Tailwind CSS", icon: "tailwind" },
      { name: "Turborepo", icon: "turborepo" },
    ],
    liveUrl: "https://bettergov.ph",
    githubUrl: "https://github.com/bettergovph",
    summary: "Contributor to civic tech initiatives modernizing Philippine government web services and open public data.",
    problem: "Public services in the Philippines frequently suffer from outdated web portals, confusing information architecture, and fragmented citizen accessibility.",
    architecture: [
      {
        title: "Accessible public UI components",
        description: "Contributing standardized, high-contrast components and responsive layouts designed for low-bandwidth mobile devices across the country.",
      },
    ],
    results: "Active open-source contributor building accessible public web tooling.",
    metrics: [{ value: "Open Source", label: "Public citizen digital infrastructure" }],
  },
  {
    slug: "msl-collegiate-cup-bot",
    title: "MSL Collegiate Cup Bot",
    tagline: "Discord operations bot for the MSL Collegiate Cup with roster verification, persistent match handling, support tickets, and Challonge bracket commands.",
    category: "bots",
    categoryLabel: "Bots & Systems",
    tier: "focused",
    role: "Developer",
    timeline: "2025 to 2026",
    featured: false,
    order: 8,
    glowColor: "purple",
    brandColor: "#6366F1",
    icon: "trophy",
    platforms: [{ name: "Discord", icon: "server" }],
    stack: [
      { name: "Python", icon: "python" },
      { name: "Discord.py", icon: "bot" },
      { name: "Google Sheets", icon: "sheets" },
      { name: "requests", icon: "web" },
      { name: "aiohttp", icon: "async" },
      { name: "Challonge API", icon: "challonge" },
      { name: "JSON & CSV", icon: "storage" },
    ],
    summary: "Python Discord bot that connects tournament roster data to player verification and match acknowledgements, then keeps live match and support state on disk so those workflows can recover after restarts.",
    problem: "The bot coordinates roster verification, match acknowledgements and disputes, support tickets, and bracket operations inside Discord while preserving enough state to recover active workflows after restarts.",
    architecture: [],
    results: "The current repository includes persistent verification mappings, restart-aware match sessions, persistent support tickets with HTML transcripts, and explicit Challonge bracket reporting commands.",
  },
  {
    slug: "ilocos-sur-esports-bot",
    title: "Ilocos Sur Festival Esports Bot",
    tagline: "Provincial tournament engine for Ilocos Sur Government syncing Discord registrations with live Challonge brackets for MLBB and CODM.",
    category: "bots",
    categoryLabel: "Bots & Systems",
    tier: "focused",
    role: "Bot Developer & Operations Lead",
    timeline: "2024",
    featured: false,
    order: 9,
    glowColor: "cyan",
    brandColor: "#06B6D4",
    icon: "swords",
    platforms: [
      { name: "Discord", icon: "server" },
      { name: "Hostinger (KVM2 VPS)", icon: "server" },
    ],
    stack: [
      { name: "Python", icon: "python" },
      { name: "Discord.py", icon: "bot" },
      { name: "MySQL", icon: "mysql" },
      { name: "Hostinger (KVM2 VPS)", icon: "hostinger" },
      { name: "Challonge API", icon: "challonge" },
    ],
    summary: "Tournament and community bot for the Ilocos Sur Provincial Government syncing player registrations with Challonge brackets on Hostinger VPS.",
    problem: "Running multi-game municipal qualifiers for MLBB and CODM during the provincial festival without manual bracket delays.",
    architecture: [
      {
        title: "Challonge bracket integration",
        description: "Synced Discord player registrations directly with live brackets on Hostinger KVM2 VPS with a MySQL backend, handling automated match alerts and ticketing.",
      },
    ],
    results: "Smooth tournament execution for 250+ provincial competitors across municipal qualifiers.",
    metrics: [{ value: "250+", label: "Players coordinated across municipal brackets" }],
  },
  {
    slug: "oppo-legend-cup-bot",
    title: "OPPO Smooth / Hyper Legend Cup Bot",
    tagline: "Tournament-grade verification bot for OPPO Philippines handling roster validation, schedule alerts, and automated match result logging.",
    category: "bots",
    categoryLabel: "Bots & Systems",
    tier: "focused",
    role: "Project Lead & Bot Developer",
    timeline: "2024 to 2025",
    featured: false,
    order: 10,
    glowColor: "cyan",
    brandColor: "#14B8A6",
    icon: "smartphone",
    platforms: [
      { name: "Discord", icon: "server" },
      { name: "Hostinger (KVM2 VPS)", icon: "server" },
    ],
    stack: [
      { name: "Python", icon: "python" },
      { name: "Discord.py", icon: "bot" },
      { name: "MySQL", icon: "mysql" },
      { name: "Hostinger (KVM2 VPS)", icon: "hostinger" },
    ],
    summary: "Corporate tournament bot for OPPO Philippines managing team verification, roster validation, and automated support workflows on Hostinger VPS.",
    problem: "Enforcing roster verification and managing amateur match disputes for OPPO nationwide tournament qualifiers.",
    architecture: [
      {
        title: "Team verification engine",
        description: "Automated roster validation, schedule alerts, and match result logging on Hostinger KVM2 VPS with a MySQL backend.",
      },
    ],
    results: "Managed 32+ teams across qualifiers without administrative overhead.",
    metrics: [{ value: "32+", label: "Teams managed across nationwide qualifiers" }],
  },
  {
    slug: "gi-damage-calculator",
    title: "KQM-Standard Genshin Team DPS Calculator",
    tagline: "Client-side theorycrafting tool for Genshin Impact damage formulas with full artifact substat and weapon talent scaling.",
    category: "web",
    categoryLabel: "Web & Tools",
    tier: "focused",
    role: "Creator & Developer",
    timeline: "2022 to 2023",
    featured: false,
    order: 11,
    glowColor: "cyan",
    brandColor: "#0284C7",
    icon: "calculator",
    platforms: [{ name: "Web", icon: "web" }],
    stack: [
      { name: "JavaScript (ES6+)", icon: "javascript" },
      { name: "HTML5 Canvas", icon: "canvas" },
      { name: "CSS3", icon: "css" },
      { name: "Vite", icon: "vite" },
    ],
    summary: "Theorycrafting calculator for character damage formulas, artifact substat rolls, and weapon scaling.",
    problem: "Optimizing high-tier character builds requires complex damage formula calculations that are tedious to calculate manually.",
    architecture: [
      {
        title: "Client-side formula engine",
        description: "Complete mathematical model of in-game scaling mechanics with real-time reactive substat optimization built with vanilla JavaScript and CSS3 on Vite.",
      },
    ],
    results: "Instant in-browser calculations with zero latency.",
    metrics: [{ value: "Client-Side", label: "Instant reactive damage calculations" }],
  },
  {
    slug: "ai-agent-framework",
    title: "AI Agent Instruction & Skills Framework",
    tagline: "Modular instruction and skill architecture for agentic pair-programming, TDD guardrails, and deterministic subagent orchestration.",
    category: "web",
    categoryLabel: "Web & Tools",
    tier: "focused",
    role: "Creator",
    timeline: "2024 to Present",
    featured: false,
    order: 12,
    glowColor: "pink",
    brandColor: "#F43F5E",
    icon: "terminal",
    platforms: [{ name: "Server", icon: "server" }],
    stack: [
      { name: "Markdown", icon: "markdown" },
      { name: "Shell / Bash", icon: "bash" },
      { name: "Python", icon: "python" },
      { name: "YAML", icon: "yaml" },
    ],
    summary: "Portable instruction system and skill cheatsheets designed for high-precision autonomous and pair-programming agents.",
    problem: "Context degradation, prompt drift, and missing architectural guardrails when collaborating with AI coding agents across multiple codebases.",
    architecture: [
      {
        title: "Modular skills and guardrails",
        description: "Portable instruction system providing specialized engineering skills, testing guardrails, and subagent orchestration cheatsheets.",
      },
    ],
    results: "Reusable, stack-agnostic workflow framework for agentic pair programming.",
    metrics: [{ value: "Modular", label: "Multi-agent engineering skills and guardrails" }],
  },
  {
    slug: "webp-unli",
    title: "WebP Unli",
    tagline: "Static WebP converter that runs wasm-vips in a browser worker and keeps source images off the server.",
    category: "web",
    categoryLabel: "Web & Tools",
    tier: "focused",
    role: "Creator & Developer",
    timeline: "2026",
    featured: false,
    order: 13,
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
    summary: "Next.js static export that converts supported images to WebP in a wasm-vips worker. Each queued file stores its own options, and completed results can be downloaded individually or as a ZIP.",
    problem: "WebP Unli is a browser converter that keeps source images on the user's device. The site is a static Next.js export, with image conversion handled locally through wasm-vips.",
    architecture: [],
    results: "The current tool covers local file selection through WebP download, including batch conversion, per-file settings, reconversion, and ZIP downloads.",
    articleSections: [
      {
        title: "Browser-side conversion",
        paragraphs: [
          "WebP Unli is a static Next.js 16 export. When the page loads, `useVips` starts a module worker from `/worker.js` and waits for wasm-vips to report that it is ready. Converting a file means reading it into an ArrayBuffer, transferring that buffer to the worker, decoding it with libvips, applying the selected resize and WebP options, then transferring the encoded buffer back to the page. The result is wrapped in a WebP Blob for download. There is no image-processing API in that path.",
          "The worker uses `thumbnailImage` when resize is enabled, then writes the result as WebP with `writeToBuffer`. The input filter accepts JPG and JPEG, PNG, GIF, WebP, AVIF, TIFF and TIF, BMP, SVG, and HEIC or HEIF by MIME type or file extension.",
        ],
      },
      {
        title: "Queue state lives with each file",
        paragraphs: [
          "Each file enters the queue with its own copy of the conversion options, including a separate nested resize object. A later fix moved current entries into a ref, added a counter for active conversion batches, copied the nested resize settings, and disabled reconvert controls while conversion was already running.",
          "There is one module worker for the page. Convert All submits every idle entry through the same worker-backed conversion function while React keeps status and progress on each file. Finished files can be downloaded one at a time or packaged with `fflate` when multiple results are ready.",
        ],
      },
      {
        title: "Getting wasm-vips through a static build",
        paragraphs: [
          "The worker first lived in `lib/worker.ts` and was constructed from a module URL. Turbopack emitted it as a raw TypeScript asset in production, which the browser could not execute. The worker was moved to `public/worker.js` as plain JavaScript and is loaded as a static asset instead.",
          "wasm-vips still depends on cross-origin isolation because its SharedArrayBuffer and pthread path needs COOP and COEP. The deployment repeats those headers in `vercel.json` because the static export does not carry the Next.js header configuration into the built site.",
        ],
      },
    ],
  },
];
