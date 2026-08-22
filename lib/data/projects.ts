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
    tagline: 'Zero-backend client-side custom QR code generator with gradient styling and crisp vector SVG/PNG export.',
    category: 'web',
    categoryLabel: 'Web & Tools',
    tier: 'focused',
    role: 'Creator & Frontend Engineer',
    timeline: '2024',
    featured: true,
    order: 3,
    glowColor: 'pink',
    brandColor: '#FB7185',
    icon: 'qr-code',
    platforms: [
      { name: 'Web', icon: 'web' },
    ],
    stack: [
      { name: 'TypeScript', icon: 'typescript' },
      { name: 'HTML5 Canvas', icon: 'canvas' },
      { name: 'Vite', icon: 'vite' },
      { name: 'Tailwind CSS', icon: 'tailwind' },
    ],
    summary: 'In-browser QR code builder with gradient styling and SVG export that runs entirely client-side without backend requests.',
    problem: 'Most web QR code generators are bloated with popups, require account sign-ups, or transmit user payloads and Wi-Fi credentials to remote tracking servers.',
    architecture: [
      {
        title: 'Client-Side Canvas & Vector Matrix Engine',
        description: 'Generates the Reed-Solomon error correction matrix and encodes payload bits in-memory. Renders real-time gradient patterns directly on an HTML5 canvas and exports clean SVG path strings for print-ready vector files.',
        tradeOff: 'Pure browser computation means zero server upkeep costs, zero user tracking, and sub-1ms re-renders during live color edits.',
      },
    ],
    results: 'Instant in-browser generator with zero network latency, complete data privacy, and clean vector exports.',
    metrics: [
      { value: '0ms', label: 'Network latency with zero backend requests' },
      { value: '100%', label: 'Client-side privacy and vector precision' },
    ],
    retrospective: 'Adding support for animated SVG QR codes and micro-logos in the center matrix is the logical next step.',
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
    title: 'MSL Collegiate Cup Bot',
    tagline: 'Discord operations bot for the MSL Collegiate Cup with roster verification, persistent match handling, support tickets, and Challonge bracket commands.',
    category: 'bots',
    categoryLabel: 'Bots & Systems',
    tier: 'focused',
    role: 'Developer',
    timeline: '2025 to 2026',
    featured: false,
    order: 8,
    glowColor: 'purple',
    brandColor: '#6366F1',
    icon: 'trophy',
    platforms: [
      { name: 'Discord', icon: 'server' },
    ],
    stack: [
      { name: 'Python', icon: 'python' },
      { name: 'Discord.py', icon: 'bot' },
      { name: 'Google Sheets', icon: 'sheets' },
      { name: 'requests', icon: 'web' },
      { name: 'aiohttp', icon: 'async' },
      { name: 'Challonge API', icon: 'challonge' },
      { name: 'JSON & CSV', icon: 'storage' },
    ],
    summary: 'Python Discord bot that connects tournament roster data to player verification and match acknowledgements, then keeps live match and support state on disk so those workflows can recover after restarts.',
    problem: 'The bot coordinates roster verification, match acknowledgements and disputes, support tickets, and bracket operations inside Discord while preserving enough state to recover active workflows after restarts.',
    architecture: [],
    results: 'The current repository includes persistent verification mappings, restart-aware match sessions, persistent support tickets with HTML transcripts, and explicit Challonge bracket reporting commands.',
    articleSections: [
      {
        title: 'Roster verification feeds match acknowledgement',
        paragraphs: [
          "The verification flow starts from the current Group Stage Teams sheet. `^verify` accepts a Mobile Legends UID and server pair, fetches the sheet's CSV export, rejects a pair already claimed by another Discord account, then looks for the matching roster row. A successful match assigns the verification role, changes the member nickname to `[ABBREV] IGN`, and appends the Discord ID, team abbreviation, IGN, UID, server, and timestamp to `data/verified_users.csv`.",
          "That local mapping is reused by the match cog. When someone replies `I acknowledge` after a game result, the bot looks up the Discord account in the verified-user file and records the team abbreviation along with the member name and acknowledgement time. The game moves on after two different team abbreviations have acknowledged it. Verification therefore does more than assign a Discord role. It gives the match workflow a persistent link between an account and the team it represents.",
        ],
      },
      {
        title: 'Match handling became restart-aware',
        paragraphs: [
          "The Git history shows the match cog arriving first as game-result tracking, then gaining dispute timing and persistence in follow-up commits. Each Discord channel can hold one `MatchSession` with its best-of format, marshal, game list, current status, acknowledgement timing, dispute timing, and last result message ID.",
          "`/game_result` moves the session into `checking_ack` and starts its acknowledgement timer. Filing a dispute records when the dispute began and pauses the effective timer. The elapsed-time calculation subtracts both completed dispute time and an active dispute, so `/match_force_ack` still requires five active minutes even when the process was paused. Resolving a dispute is limited to the session marshal, an administrator, or someone with the configured Marshal role.",
          "The session is written to `data/active_matches.json` whenever its state changes. When the cog loads again, it reconstructs those sessions and reattaches either the dispute or resolve view to the saved Discord message ID. The deserializer also accepts the older acknowledgement-list format and converts it into the newer per-team dictionary. That matches the repository history where acknowledgements later gained the name and timestamp of the person who submitted them.",
        ],
      },
      {
        title: 'Tickets became a second persistent workflow',
        paragraphs: [
          "The ticket system arrived later in December 2025 and grew through a series of smaller commits. A user chooses among League Operations, Rewards & Payouts, Contents & Socials, and General & Tech Support, then submits a subject and description through a modal. The bot creates a `[tag]-username` channel whose permission overwrites expose it to the creator, the bot, the relevant category role, and the support role. Creation time, category, creator, claim state, added users, and reminder state are stored in `data/active_tickets.json`.",
          "Claiming a ticket has its own permission checks. The creator and manually added users cannot claim it. Category staff and administrators can, while an escalated ticket can also become claimable by League Operations. A task runs every ten minutes and sends a reminder after an unclaimed ticket has been open for 24 hours. Rewards and Contents tickets receive an additional escalation after 48 hours.",
          "Closing a ticket reads up to 500 channel messages in chronological order and turns them into an HTML transcript. The renderer handles Discord mentions, basic message formatting, attachments, and embeds. The transcript is sent to the log channel and directly to the ticket creator, while manually added users receive their own copy. The creator also gets a rating prompt before the ticket channel is deleted. The Git history around this code includes separate passes for embed rendering, mention parsing, transcript layout, and Discord interaction-response handling instead of one large ticket-system commit.",
        ],
      },
      {
        title: 'Challonge was added after the Discord workflows',
        paragraphs: [
          "Challonge support was added in January 2026. A marshal or administrator can link a bracket to the current Discord channel with `/challonge_link`. The bot validates the tournament, fetches its participants, and stores the channel-to-bracket mapping in `data/challonge_brackets.json`. Other commands can list bracket matches or explicitly report a winner and score.",
          "The current client is a small asynchronous wrapper over Challonge API v1 using `aiohttp`. The Git history briefly moved the integration to the v2.1 OAuth flow before reverting to the API-key version that remains in the repository. The current code keeps this bracket state separate from `MatchSession`. Discord acknowledgements do not automatically submit a result to Challonge. Reporting the bracket result is still an explicit marshal or administrator action.",
        ],
      },
    ],
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
