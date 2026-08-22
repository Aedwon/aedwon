export interface TechItem {
  name: string;
  category?: string;
  icon?: string; // key for icon rendering
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

export interface ProjectItem {
  slug: string;
  title: string;
  tagline: string;
  category: 'mobile' | 'web' | 'bots' | 'civic';
  categoryLabel: string;
  tier: 'flagship' | 'focused';
  role: string;
  timeline: string;
  featured: boolean;
  order: number;
  glowColor: 'blue' | 'purple' | 'pink' | 'violet' | 'green' | 'amber' | 'cyan';
  brandColor: string;
  icon: string;
  platforms: { name: string; icon: 'android' | 'apple' | 'web' | 'server' }[];
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
  articleSections?: {
    title: string;
    paragraphs: string[];
    codeSnippet?: string;
    codeLanguage?: string;
  }[];
}

export const PROJECTS: ProjectItem[] = [
  {
    slug: 'pantas',
    title: 'Pantas',
    tagline: 'Local-first mobile exam reviewer for Philippine civil service and university entrance preparation with on-device FSRS spaced repetition and OMR mock exam simulations.',
    category: 'mobile',
    categoryLabel: 'Mobile & Offline',
    tier: 'flagship',
    role: 'Lead Architect & Developer',
    timeline: '2024 to Present',
    featured: true,
    order: 1,
    glowColor: 'blue',
    brandColor: '#60A5FA',
    icon: 'book-open',
    platforms: [
      { name: 'Android', icon: 'android' },
      { name: 'iOS', icon: 'apple' },
    ],
    stack: [
      { name: 'Flutter (3.41+)', icon: 'flutter' },
      { name: 'Dart', icon: 'dart' },
      { name: 'Drift (SQLite)', icon: 'sqlite' },
      { name: 'SQLCipher', icon: 'lock' },
      { name: 'Riverpod 2.x', icon: 'state' },
      { name: 'Open Spaced Repetition (FSRS)', icon: 'fsrs' },
      { name: 'Firebase', icon: 'firebase' },
      { name: 'Sanity CMS', icon: 'cms' },
      { name: 'RevenueCat', icon: 'payment' },
    ],
    liveUrl: 'https://pantas.app',
    summary: 'Mobile exam reviewer for Philippine civil service and university entrance tests, with adaptive spaced repetition and OMR answer sheets.',
    problem: 'I built Pantas because Civil Service Exam and UPCAT preparation in the Philippines still relies on bulky 500-page printed reviewers or web apps that break when mobile data drops during long jeepney and bus commutes. Commercial review centers charge upwards of ₱10,000, while cheap digital reviewers are often bloated with synthetic passing probabilities and paywalled basic explanations. I wanted to give reviewees a guaranteed offline study tool that accurately tracks memory decay without consuming expensive mobile data buckets.',
    architecture: [
      {
        title: 'Editorial "Ink & Rule" Design System & Source Sans 3',
        description: 'I stripped away the generic AI aesthetic (Poppins bold, stock blue #1F6BFF, drop shadows, emoji icons, pastel pills) in favor of an editorial printed-workbook identity. I used warm paper surfaces (#FBF9F4), near-black ink (#26221B), 1px hairline rules (#E5DFD3), and tabular figures, budgeting Board Green (#1D5C50) strictly for the single primary CTA per screen. I originally tried pairing a serif with sans, but on a phone screen the serif became an eyesore at small sizes and distracted from the content. I standardized on Source Sans 3 across all 15 typography roles to keep the focus entirely on reading.',
        tradeOff: 'Abandoning standard Material cards and elevated shadows meant writing custom layout math with hairline dividers, but it eliminated visual fatigue during 2-hour study drills.',
      },
      {
        title: 'Local-First Encrypted Persistence via Drift SQLite & SQLCipher',
        description: 'I designed the app under one core rule: studying is never blocked by the network; only account and money are. All question banks, user response logs, and scheduled drill states live in an encrypted local database using Drift SQLite with 256-bit AES SQLCipher for RA 10173 compliance. I replaced dynamic runtime CMS queries with an immutable, pre-compiled static SQLite seed (content.db / assets/seed/v1.json), ensuring cold boots and drill queries stay instant.',
        tradeOff: 'Bundling static seed databases adds ~8MB to the initial APK size, but guarantees zero-latency drills with 100% offline availability.',
        codeSnippet: `// Pure local database setup with SQLCipher encryption and static seed loader
LazyDatabase openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'pantas_encrypted.db'));
    return SqlcipherDatabase(
      file,
      password: await secureStorage.getDatabaseKey(),
      setup: (rawDb) => rawDb.execute('PRAGMA cipher_memory_security = OFF;'),
    );
  });
}`,
      },
      {
        title: 'Pure Dart FSRS-6 Spaced Repetition Engine & On-Device Optimizer',
        description: 'I implemented the FSRS-6 algorithm locally in pure Dart using the 21-parameter weight vector with dedicated same-day stability formulas for exam cramming behavior. To personalize intervals without sending study logs to a cloud server, I designed an on-device optimizer that fits parameters directly on device once a student logs 200 reviews (compared to Anki\'s 400+ threshold), guarded by a held-out test split to prevent overfitting.',
        tradeOff: 'FSRS-6\'s 200-review optimizer threshold is calibrated for short 8-week Philippine exam countdowns, using held-out split validation to reject overfitted weights while allowing students to revert to defaults in Settings.',
        codeSnippet: `// Pure Dart FSRS-6 scheduler with 21-parameter weights and same-day stability
FsrsItem scheduleFsrs6Review(FsrsItem item, Rating rating, DateTime now, List<double> w) {
  final elapsedDays = item.lastReviewed == null ? 0.0 : now.difference(item.lastReviewed!).inHours / 24.0;
  final nextStability = elapsedDays < 1.0
      ? fsrs6.calculateSameDayStability(item.stability, rating, w)
      : fsrs6.calculateStability(item.stability, item.difficulty, elapsedDays, rating, w);
  final nextDifficulty = fsrs6.calculateDifficulty(item.difficulty, rating, w);
  final intervalDays = fsrs6.nextInterval(nextStability, targetRetention: 0.90, decay: -w[20]);
  return item.copyWith(
    stability: nextStability,
    difficulty: nextDifficulty,
    due: now.add(Duration(days: intervalDays.clamp(1, 36500).round())),
    lastReviewed: now,
  );
}`,
      },
      {
        title: 'Assessment Hub & Distractor Misconception Explanations',
        description: 'I replaced generic topic queues with an Assessment Hub (Today\'s Session, Drill, Retake, Mock Exam). Instead of showing a simple green checkmark or red cross, I authored answer reveals that explicitly explain why each incorrect choice (distractor) is wrong. To recreate real exam pressure, I wrote a custom canvas OMR bubble sheet with strict section boundary timers, question jump grids, and blueprint-weighted subject ratios.',
        tradeOff: 'Authoring custom misconception explanations for all 4 multiple-choice options quadrupled content writing time, but prevented students from relying on rote memorization.',
      },
      {
        title: 'Psychometric Integrity ("Never Invent a Figure")',
        description: 'I instituted a strict rule: never invent a figure. I banned synthetic score predictions and fake readiness percentages (\'Passing Probability: 92%\'). Instead, I structured the Progress tab around four honest questions: The Diagnosis (where points leak and why), The Mirror (behavioral archetypes like stamina drop-off and pacing under pressure), The Record (measurable movement over time), and What\'s Fading (FSRS decay curves). I show score impact strictly as point deltas (\'Fixing these weak topics is worth +9 points\').',
      },
    ],
    hurdles: [
      {
        title: 'SQLCipher Database Migration Deadlocks on Budget Devices',
        issue: 'When I ran question bank migrations and schema updates during cold boot on low-RAM Android devices, the SQLite database locked up and threw unhandled exceptions before the home view could mount.',
        solution: 'I decoupled static question banks from mutable user response tables and moved schema migrations into a background isolate with a dedicated write-ahead log (WAL) pool, unblocking the main UI thread.',
      },
      {
        title: 'FSRS-4.5 Cramming Flaws & Same-Day Review Drift',
        issue: 'In FSRS-4.5, repeating the same card multiple times during intense last-minute cram sessions had no stability formula, causing intervals to distort and easy cards to bury high-yield civil service and UPCAT topics.',
        solution: 'I upgraded to FSRS-6\'s 21-parameter weight vector with dedicated same-day review stability calculations (w[17..19]) and trainable decay. I built a local Dart optimizer with a 200-review threshold and held-out validation guard, giving cramming reviewees accurate intervals without cloud dependencies.',
      },
      {
        title: 'Cold-Start Entitlement Race Conditions in Offline Posture',
        issue: 'Standard subscription SDKs fail closed when network requests time out. A student studying on an offline commute could lose Pro access if a check failed.',
        solution: 'I instituted a fail-open local cache rule: the last known entitlement state stands until positively contradicted by a successful server verification. Cached subscription tokens survive cold starts and are read before the first frame renders.',
      },
    ],
    results: 'I delivered sub-15ms local query performance across 2,216+ question bank items with 100% offline study operation. The app runs without network dependencies during drills, eliminates synthetic passing metrics, and complies with RA 10173 on-device data encryption.',
    metrics: [
      { value: '100%', label: 'Offline study drills with zero cloud blockers' },
      { value: '< 15ms', label: 'SQLite query latency for 50-item exam drills' },
      { value: '21', label: 'FSRS-6 parameters with on-device optimizer' },
      { value: 'RA 10173', label: 'Compliant on-device 256-bit AES encryption' },
    ],
    retrospective: 'If I were starting over today, I would build the question validation toolchain as a standalone CLI to catch distractor formatting anomalies and schema typos before compiling the static SQLite seed.',
  },
  {
    slug: 'msl-network',
    title: 'The MSL Network',
    tagline: 'Collegiate gaming platform and tournament verification engine serving 10,000+ student competitors across 180+ Philippine universities.',
    category: 'bots',
    categoryLabel: 'Bots & Systems',
    tier: 'flagship',
    role: 'Platform Architect & Community Lead',
    timeline: '2022 to Present',
    featured: true,
    order: 2,
    glowColor: 'purple',
    brandColor: '#818CF8',
    icon: 'bot',
    platforms: [
      { name: 'Discord', icon: 'server' },
      { name: 'Hostinger (KVM2 VPS)', icon: 'server' },
    ],
    stack: [
      { name: 'Python', icon: 'python' },
      { name: 'Discord.py', icon: 'bot' },
      { name: 'MySQL', icon: 'mysql' },
      { name: 'Hostinger (KVM2 VPS)', icon: 'hostinger' },
      { name: 'Google Sheets API', icon: 'sheets' },
      { name: 'Asyncio', icon: 'async' },
    ],
    summary: 'Planned and built the Philippine student gaming community to 10,000+ members, using custom Discord bots on Hostinger KVM2 VPS with MySQL for verification.',
    problem: 'Managing competitive collegiate gaming across 180+ campuses manually meant tournament admins were overwhelmed by student ID verification, team check-ins, and dispute handling during live game days.',
    architecture: [
      {
        title: 'Discord Verification & Role Hierarchy Engine',
        description: 'An automated verification bot that validates student credentials against campus registrar lists, granting university-specific channels and competitive tier roles.',
        tradeOff: 'Using Google Sheets as a human-editable bridge introduced rate-limit bottlenecks, which required an in-memory async write queue.',
        codeSnippet: `// Asynchronous student ID verification & role synchronization
async def verify_student(ctx, student_id: str, school_code: str):
    cached_record = await db_pool.fetchrow(
        "SELECT * FROM verified_students WHERE id = $1 AND school = $2",
        student_id, school_code
    )
    if cached_record:
        await ctx.author.add_roles(school_roles[school_code])
        await ctx.send("Verification complete. University hub unlocked.")`,
      },
      {
        title: 'Hostinger KVM2 VPS Host Architecture',
        description: 'Hosted on a Linux KVM2 VPS running systemd service workers, asynchronous MySQL connection pools, and automatic memory-managed worker recycling.',
      },
      {
        title: 'Campus Leaderboard & Quest Engine',
        description: 'Tracks weekly inter-university scrimmage results and activity leaderboards across 80+ partner student organizations.',
      },
    ],
    hurdles: [
      {
        title: 'Discord Gateway Rate Limits During Tournament Kickoffs',
        issue: 'Over 800 players joining match lobbies simultaneously caused Discord API HTTP 429 rate limit freezes.',
        solution: 'Implemented token bucket rate limiters and queued role assignments through an asyncio worker pool with jittered backoff.',
      },
      {
        title: 'Google Sheets API Quota Exhaustion',
        issue: 'Live lookups during tournament registrations burned through the 300 requests-per-minute quota.',
        solution: 'Built a local MySQL write-through cache syncing modified rows in 60-second batch intervals.',
      },
    ],
    results: 'Scaled the platform to 10,000+ active student members across 180+ universities, cutting tournament check-in administrative time by 90%.',
    metrics: [
      { value: '10,000+', label: 'Active student community members' },
      { value: '90%', label: 'Reduction in manual tournament check-in overhead' },
      { value: '180+', label: 'Philippine universities connected' },
    ],
    retrospective: 'I should have moved off Google Sheets earlier in the lifecycle. The custom caching layer worked, but a direct PostgreSQL admin UI would have saved maintenance hours.',
  },
  {
    slug: 'qr-studio',
    title: 'QR Studio',
    tagline: 'Browser QR code editor built with vanilla JavaScript and qr-code-styling, with live customization and local file export.',
    category: 'web',
    categoryLabel: 'Web & Tools',
    tier: 'focused',
    role: 'Creator & Frontend Engineer',
    timeline: '2026',
    featured: true,
    order: 3,
    glowColor: 'pink',
    brandColor: '#FB7185',
    icon: 'qr-code',
    platforms: [
      { name: 'Web', icon: 'web' },
    ],
    stack: [
      { name: 'JavaScript', icon: 'javascript' },
      { name: 'Vite', icon: 'vite' },
      { name: 'HTML5 Canvas', icon: 'canvas' },
      { name: 'qr-code-styling', icon: 'qr-code' },
    ],
    githubUrl: 'https://github.com/Aedwon/QR-Code-Maker',
    summary: 'Static Vite QR editor that keeps QR payload generation and logo processing in the browser while using qr-code-styling for rendering and export.',
    problem: 'QR Studio is a static Vite QR editor built around qr-code-styling. Payload changes, styling controls, uploaded-logo processing, and file export run in the browser.',
    architecture: [],
    results: 'The current editor supports live styling, logo compositing, error-correction controls, responsive editing, capacity warnings, and PNG, SVG, and JPEG export.',
    articleSections: [
      {
        title: 'Building the editor around one QR instance',
        paragraphs: [
          'QR Studio is a static Vite app written in vanilla JavaScript and CSS. I did not implement the QR encoding algorithm myself. The app wraps `qr-code-styling` and keeps one `QRCodeStyling` instance mounted in the preview. The controls mutate a shared options object, then a 150 millisecond debounce rebuilds those options and passes them to `update()` instead of recreating the QR object for every input event.',
          'Presets and manual controls use the same state. Applying a preset deep-copies its dot, corner, and background settings before syncing the visible controls. A manual edit clears the active preset. There is also a library-specific state problem to handle. `qr-code-styling` shallow-merges updates, so removing a gradient from the local options is not enough to clear a previously rendered one. `buildOptions()` explicitly passes `gradient: undefined` for the dot and corner groups whenever they switch back to a flat color.',
        ],
      },
      {
        title: 'Processing logos before rendering',
        paragraphs: [
          'Logo uploads are read with `FileReader` and kept as data URLs in memory. I store the original image separately from the version passed into the QR renderer because QR Studio can add a circle, square, or rounded background behind the logo. When one of those backgrounds is selected, the app creates an off-screen canvas based on the largest image dimension, adds 15 percent padding, draws the background shape, centers the original logo, and converts the result back into a PNG data URL.',
          'Logo handling also changed after the first implementation. A later fix enabled `hideBackgroundDots` so transparent parts of an uploaded logo do not have QR modules showing through them. Uploading a logo changes the selected error-correction level from Q to H, and removing it restores Q. That does not guarantee that every heavily styled QR code will scan under every condition, but it gives embedded logos more error-correction headroom in the current editor.',
        ],
      },
      {
        title: 'Changes after the first editor',
        paragraphs: [
          'The first commit already contained the main editor with presets, gradient controls, logo embedding, error-correction settings, and PNG, SVG, and JPEG export. The next substantial change was the responsive layout. At 900 pixels and below, the page reverses the main column order and makes the preview sticky above the controls. Smaller breakpoints reduce the QR preview and increase several interactive controls to touch-friendly sizes so the editor remains usable without hiding the result below a long settings panel.',
          'The latest feature in the repository is the input capacity indicator. It measures the payload with `Blob([value]).size`, so non-ASCII text is counted as UTF-8 bytes instead of JavaScript string length. The configured limit changes with the selected L, M, Q, or H error-correction level. The progress bar warns after 75 percent of that limit and marks the input as too long once it passes the configured maximum.',
        ],
      },
      {
        title: 'What stays local',
        paragraphs: [
          'The QR generation path does not require an application backend. Payload changes, styling, uploaded-logo processing, and file export happen in the browser. The deployment configuration builds the Vite project into a static `dist` directory, and PNG, SVG, and JPEG files are exported through the `qr-code-styling` download API.',
          'The page itself is not completely network-free. It loads Google Analytics and Google Fonts, and the optional feedback form posts to Web3Forms. The useful boundary is narrower. QR payloads and uploaded logos are processed locally by the application, while those separate page services still make external requests.',
        ],
      },
    ],
  },
  {
    slug: 'kiosk-survey',
    title: 'Kiosk Survey',
    tagline: 'Offline touchscreen survey application for Android TV operating reliably in high-density event environments with automatic queue syncing.',
    category: 'mobile',
    categoryLabel: 'Mobile & Offline',
    tier: 'focused',
    role: 'Lead Developer',
    timeline: '2023 to 2024',
    featured: true,
    order: 4,
    glowColor: 'violet',
    brandColor: '#A78BFA',
    icon: 'tv',
    platforms: [
      { name: 'Android TV', icon: 'android' },
    ],
    stack: [
      { name: 'Flutter', icon: 'flutter' },
      { name: 'Dart', icon: 'dart' },
      { name: 'SQLite', icon: 'sqlite' },
      { name: 'Android TV OS', icon: 'android' },
    ],
    summary: 'Touchscreen survey app for Android TV that operated for 8 continuous hours during a live event without internet, syncing queued submissions once reconnected.',
    problem: 'Event venues suffer from severe cellular congestion and dropped Wi-Fi under crowd loads. Standard web forms freeze or drop responses when attendees submit surveys at interactive booths.',
    architecture: [
      {
        title: 'Android TV Local Persistence Queue',
        description: 'Built with Flutter for Android TV touch displays. Every attendee submission writes immediately to a local SQLite journal. A connectivity listener detects stable connections and flushes queued JSON records in atomic batches.',
      },
    ],
    results: 'Ran continuously for 8 hours on-site during a high-density live event with zero dropped responses and zero crashes.',
    metrics: [
      { value: '8 Hours', label: 'Continuous offline operation during live event' },
      { value: '0', label: 'Dropped survey submissions or app crashes' },
    ],
    retrospective: 'Adding an automated USB export fallback would give event coordinators even greater peace of mind during total network blackouts.',
  },
  {
    slug: 'norala-sb-portal',
    title: 'Norala SB Portal',
    tagline: 'Public-facing legislative transparency portal for the Sangguniang Bayan of Norala tracking ordinances and resolutions with offline PWA caching.',
    category: 'civic',
    categoryLabel: 'Civic Tech',
    tier: 'flagship',
    role: 'Creator & Full-Stack Architect',
    timeline: '2024',
    featured: false,
    order: 5,
    glowColor: 'green',
    brandColor: '#10B981',
    icon: 'building-columns',
    platforms: [
      { name: 'Web', icon: 'web' },
    ],
    stack: [
      { name: 'TypeScript', icon: 'typescript' },
      { name: 'Next.js', icon: 'nextjs' },
      { name: 'Tailwind CSS', icon: 'tailwind' },
      { name: 'SQLite', icon: 'sqlite' },
      { name: 'Prisma', icon: 'prisma' },
      { name: 'PWA Service Worker', icon: 'pwa' },
    ],
    summary: 'Public legislative transparency portal for municipal ordinances, resolutions, and gazettes with full-text search and offline PWA caching.',
    problem: 'Municipal legislative records in rural Philippine local government units are stored in physical paper binders or fragmented scanned PDFs. Citizens and municipal staff have no fast way to search enacted ordinances on mobile devices.',
    architecture: [
      {
        title: 'Full-Text Legislative Indexing',
        description: 'Builds an inverted index of enacted municipal ordinances, resolutions, and committee reports using SQLite FTS5 for sub-second keyword matching.',
        tradeOff: 'SQLite FTS5 runs on low-cost server hardware without requiring heavy Elasticsearch clusters.',
      },
      {
        title: 'Offline PWA Service Worker',
        description: 'Caches recent gazette listings and legislative metadata on the user device via Workbox, allowing citizens to read ordinances even with weak provincial mobile signals.',
      },
    ],
    hurdles: [
      {
        title: 'OCR Inaccuracies on Scanned Legacy Ordinances',
        issue: 'Decades-old typewriter municipal documents had skewed text and faded ink that broke text search indexing.',
        solution: 'Pre-processed document scans with contrast normalization filters before passing text blocks into the search index.',
      },
    ],
    results: 'Delivered sub-second search indexing across hundreds of local ordinances, giving citizens searchable mobile access to municipal legislation.',
    metrics: [
      { value: 'Sub-second', label: 'Full-text search across municipal legislation' },
      { value: 'Offline PWA', label: 'Accessible on low-bandwidth mobile devices' },
    ],
    retrospective: 'Structuring legislative metadata to support open civic data schemas (like Popolo) would make future inter-LGU integrations easier.',
  },
  {
    slug: 'bettergov-ph',
    title: 'BetterGov PH',
    tagline: 'Open-source civic tech initiative modernizing Philippine government digital infrastructure and public service portals.',
    category: 'civic',
    categoryLabel: 'Civic Tech',
    tier: 'focused',
    role: 'Open Source Contributor',
    timeline: '2024 to Present',
    featured: false,
    order: 6,
    glowColor: 'green',
    brandColor: '#34D399',
    icon: 'shield-check',
    platforms: [
      { name: 'Web', icon: 'web' },
    ],
    stack: [
      { name: 'Next.js', icon: 'nextjs' },
      { name: 'TypeScript', icon: 'typescript' },
      { name: 'Tailwind CSS', icon: 'tailwind' },
      { name: 'Turborepo', icon: 'turborepo' },
    ],
    liveUrl: 'https://bettergov.ph',
    githubUrl: 'https://github.com/bettergovph',
    summary: 'Contributor to civic tech initiatives modernizing Philippine government web services and open public data.',
    problem: 'Public services in the Philippines frequently suffer from outdated web portals, confusing information architecture, and fragmented citizen accessibility.',
    architecture: [
      {
        title: 'Accessible Public UI Components',
        description: 'Contributing standardized, high-contrast components and responsive layouts designed for low-bandwidth mobile devices across the country.',
      },
    ],
    results: 'Active open-source contributor building accessible public web tooling.',
    metrics: [
      { value: 'Open Source', label: 'Public citizen digital infrastructure' },
    ],
    retrospective: 'Advocating for unified design system tokens across government department web portals remains an important goal.',
  },
  {
    slug: 'pso-scoring-model',
    title: 'PSO Automated Scorer',
    tagline: 'Automated evaluation, tiebreaker, and bracket ranking engine processing 4,000+ national Science Olympiad competitors across multiple elimination tiers.',
    category: 'bots',
    categoryLabel: 'Bots & Systems',
    tier: 'flagship',
    role: 'Lead Scoring Architect',
    timeline: '2024',
    featured: false,
    order: 7,
    glowColor: 'amber',
    brandColor: '#F59E0B',
    icon: 'award',
    platforms: [
      { name: 'Server', icon: 'server' },
    ],
    stack: [
      { name: 'Python', icon: 'python' },
      { name: 'Pandas', icon: 'pandas' },
      { name: 'NumPy', icon: 'numpy' },
      { name: 'Google Sheets API', icon: 'sheets' },
    ],
    summary: 'Evaluation and scoring model processing 4,000+ national Science Olympiad competitors across elimination tiers.',
    problem: 'Grading, applying complex tiebreaker matrices, and ranking 4,000+ high school student competitors across regional cluster eliminations within tight 2-hour event turnaround windows.',
    architecture: [
      {
        title: 'Automated Matrix Scoring Pipeline',
        description: 'Vectorized NumPy and Pandas matrix operations evaluating regional cluster answer keys, applying subject-weighted penalties, and computing tiebreakers in seconds.',
        tradeOff: 'Vectorized in-memory matrices replaced manual spreadsheet formula recalculations that previously hung for 45+ minutes.',
        codeSnippet: `// Vectorized score computation with blueprint-weighted penalties
def compute_scores(raw_matrix: np.ndarray, answer_key: np.ndarray, weights: np.ndarray) -> np.ndarray:
    correct_mask = (raw_matrix == answer_key)
    return np.dot(correct_mask.astype(float), weights)`,
      },
    ],
    hurdles: [
      {
        title: 'Multi-Way Tiebreaker Deadlocks',
        issue: 'Top national qualifiers frequently tied on total score, requiring recursive evaluation of difficulty-weighted question tiers and timestamp priority.',
        solution: 'Implemented a deterministic multi-key sorting algorithm evaluating total score, tier-3 problem counts, and verification check marks in sequence.',
      },
    ],
    results: 'Processed scores and verified rankings for 4,000+ competitors with 100% accuracy and zero tabulation delays.',
    metrics: [
      { value: '4,000+', label: 'Competitors scored and ranked' },
      { value: '100%', label: 'Tabulation accuracy across elimination rounds' },
    ],
    retrospective: 'Building a web-based tabulation dashboard with live audit logs would make proctor cross-verification even faster.',
  },
  {
    slug: 'msl-collegiate-cup-bot',
    title: 'MSL Cup Tournament Bot',
    tagline: 'Tournament operations engine for collegiate MLBB competitions automating match lobbies, bracket updates, and ticketing for 3,000+ student players.',
    category: 'bots',
    categoryLabel: 'Bots & Systems',
    tier: 'focused',
    role: 'Head of League Operations & Developer',
    timeline: '2024 to 2025',
    featured: false,
    order: 8,
    glowColor: 'purple',
    brandColor: '#6366F1',
    icon: 'trophy',
    platforms: [
      { name: 'Discord', icon: 'server' },
      { name: 'Hostinger (KVM2 VPS)', icon: 'server' },
    ],
    stack: [
      { name: 'Python', icon: 'python' },
      { name: 'Discord.py', icon: 'bot' },
      { name: 'MySQL', icon: 'mysql' },
      { name: 'Hostinger (KVM2 VPS)', icon: 'hostinger' },
      { name: 'Google Sheets API', icon: 'sheets' },
    ],
    summary: 'Tournament bot automating match sessions, team check-ins, rulebook enforcement, and dispute ticketing for 3,000+ collegiate competitors on Hostinger VPS with MySQL.',
    problem: 'Operating a nationwide tournament for 3,000+ collegiate competitors across 180+ universities with referee arbitration and match scheduling.',
    architecture: [
      {
        title: 'Match Lobby & Ticketing Pipeline',
        description: 'Automated match lobby creation, team verification, bracket sync, and multi-tier support ticketing with HTML transcript logging on Hostinger KVM2 VPS with MySQL backend.',
      },
    ],
    results: 'Cut tournament administrative delays by 90% across full season schedule.',
    metrics: [
      { value: '3,000+', label: 'Collegiate competitors managed' },
      { value: '90%', label: 'Reduction in manual referee operations' },
    ],
    retrospective: 'Integrating Discord modal forms directly into match lobbies would make screenshot submission for match results even faster.',
  },
  {
    slug: 'ilocos-sur-esports-bot',
    title: 'Ilocos Sur Esports Bot',
    tagline: 'Provincial tournament engine for Ilocos Sur Government syncing Discord registrations with live Challonge brackets for MLBB and CODM.',
    category: 'bots',
    categoryLabel: 'Bots & Systems',
    tier: 'focused',
    role: 'Bot Developer & Operations Lead',
    timeline: '2024',
    featured: false,
    order: 9,
    glowColor: 'cyan',
    brandColor: '#06B6D4',
    icon: 'swords',
    platforms: [
      { name: 'Discord', icon: 'server' },
      { name: 'Hostinger (KVM2 VPS)', icon: 'server' },
    ],
    stack: [
      { name: 'Python', icon: 'python' },
      { name: 'Discord.py', icon: 'bot' },
      { name: 'MySQL', icon: 'mysql' },
      { name: 'Hostinger (KVM2 VPS)', icon: 'hostinger' },
      { name: 'Challonge API', icon: 'challonge' },
    ],
    summary: 'Tournament and community bot for the Ilocos Sur Provincial Government syncing player registrations with Challonge brackets on Hostinger VPS.',
    problem: 'Running multi-game municipal qualifiers (MLBB, CODM) during the provincial festival without manual bracket delays.',
    architecture: [
      {
        title: 'Challonge Bracket Integration',
        description: 'Synced Discord player registrations directly with live brackets on Hostinger KVM2 VPS with MySQL backend, handling automated match alerts and ticketing.',
      },
    ],
    results: 'Smooth tournament execution for 250+ provincial competitors across municipal qualifiers.',
    metrics: [
      { value: '250+', label: 'Players coordinated across municipal brackets' },
    ],
    retrospective: 'Adding SMS notifications for team captains would help in areas with spotty Discord connectivity.',
  },
  {
    slug: 'oppo-legend-cup-bot',
    title: 'OPPO Legend Cup Bot',
    tagline: 'Tournament-grade verification bot for OPPO Philippines handling roster validation, schedule alerts, and automated match result logging.',
    category: 'bots',
    categoryLabel: 'Bots & Systems',
    tier: 'focused',
    role: 'Project Lead & Bot Developer',
    timeline: '2024 to 2025',
    featured: false,
    order: 10,
    glowColor: 'cyan',
    brandColor: '#14B8A6',
    icon: 'smartphone',
    platforms: [
      { name: 'Discord', icon: 'server' },
      { name: 'Hostinger (KVM2 VPS)', icon: 'server' },
    ],
    stack: [
      { name: 'Python', icon: 'python' },
      { name: 'Discord.py', icon: 'bot' },
      { name: 'MySQL', icon: 'mysql' },
      { name: 'Hostinger (KVM2 VPS)', icon: 'hostinger' },
    ],
    summary: 'Corporate tournament bot for OPPO Philippines managing team verification, roster validation, and automated support workflows on Hostinger VPS.',
    problem: 'Enforcing roster verification and managing amateur match disputes for OPPO nationwide tournament qualifiers.',
    architecture: [
      {
        title: 'Team Verification Engine',
        description: 'Automated roster validation, schedule alerts, and match result logging on Hostinger KVM2 VPS with MySQL backend.',
      },
    ],
    results: 'Managed 32+ teams across qualifiers without administrative overhead.',
    metrics: [
      { value: '32+', label: 'Teams managed across nationwide qualifiers' },
    ],
    retrospective: 'Implementing automated screenshot OCR for in-game score validation would reduce manual referee confirmation steps.',
  },
  {
    slug: 'gi-damage-calculator',
    title: 'GI Damage Calculator',
    tagline: 'Client-side theorycrafting tool for Genshin Impact damage formulas with full artifact substat and weapon talent scaling.',
    category: 'web',
    categoryLabel: 'Web & Tools',
    tier: 'focused',
    role: 'Creator & Developer',
    timeline: '2022 to 2023',
    featured: false,
    order: 11,
    glowColor: 'cyan',
    brandColor: '#0284C7',
    icon: 'calculator',
    platforms: [
      { name: 'Web', icon: 'web' },
    ],
    stack: [
      { name: 'JavaScript (ES6+)', icon: 'javascript' },
      { name: 'CSS3', icon: 'css' },
      { name: 'HTML5 Canvas', icon: 'canvas' },
      { name: 'Vite', icon: 'vite' },
    ],
    summary: 'Theorycrafting calculator for character damage formulas, artifact substat rolls, and weapon scaling.',
    problem: 'Optimizing high-tier character builds requires complex damage formula calculations (motion values, defense multipliers, resistance shred, reaction scalars) that are tedious to calculate manually.',
    architecture: [
      {
        title: 'Client-Side Formula Engine',
        description: 'Complete mathematical model of in-game scaling mechanics with real-time reactive substat optimization built with vanilla JavaScript and CSS3 on Vite.',
      },
    ],
    results: 'Instant in-browser calculations with zero latency.',
    metrics: [
      { value: 'Client-Side', label: 'Instant reactive damage calculations' },
    ],
    retrospective: 'Migrating this calculation engine to TypeScript with a WebAssembly backend would allow running Monte Carlo substat roll simulations in milliseconds.',
  },
  {
    slug: 'ai-agent-framework',
    title: 'AI Agent Framework',
    tagline: 'Modular instruction and skill architecture for agentic pair-programming, TDD guardrails, and deterministic subagent orchestration.',
    category: 'web',
    categoryLabel: 'Web & Tools',
    tier: 'focused',
    role: 'Creator',
    timeline: '2024 to Present',
    featured: false,
    order: 12,
    glowColor: 'pink',
    brandColor: '#F43F5E',
    icon: 'terminal',
    platforms: [
      { name: 'Server', icon: 'server' },
    ],
    stack: [
      { name: 'Markdown', icon: 'markdown' },
      { name: 'Shell / Bash', icon: 'bash' },
      { name: 'Python', icon: 'python' },
      { name: 'YAML', icon: 'yaml' },
    ],
    summary: 'Portable instruction system and skill cheatsheets designed for high-precision autonomous and pair-programming agents.',
    problem: 'Context degradation, prompt drift, and missing architectural guardrails when collaborating with AI coding agents across multiple codebases.',
    architecture: [
      {
        title: 'Modular Skills & Guardrails',
        description: 'Portable instruction system providing specialized engineering skills, testing guardrails, and subagent orchestration cheatsheets.',
      },
    ],
    results: 'Reusable, stack-agnostic workflow framework for agentic pair programming.',
    metrics: [
      { value: 'Modular', label: 'Multi-agent engineering skills and guardrails' },
    ],
    retrospective: 'Adding automated benchmark suites to test prompt regressions across different agent models would make skill updates more reliable.',
  },
];