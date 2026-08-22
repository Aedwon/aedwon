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
    tagline: 'Android-first exam reviewer for Philippine civil service and university entrance preparation, with encrypted local study state and on-device FSRS-6 scheduling.',
    category: 'mobile',
    categoryLabel: 'Mobile & Offline',
    tier: 'flagship',
    role: 'Lead Architect & Developer',
    timeline: '2026 to Present',
    featured: true,
    order: 1,
    glowColor: 'blue',
    brandColor: '#60A5FA',
    icon: 'book-open',
    platforms: [
      { name: 'Android', icon: 'android' },
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
    summary: 'Pre-launch Flutter reviewer for Philippine exam preparation, with local encrypted progress, FSRS-6 review scheduling, and a validated question-to-SQLite content pipeline.',
    problem: 'Pantas is a pre-launch Flutter reviewer for Philippine exam preparation. Its current implementation keeps study state in an encrypted local database and schedules practice with an on-device FSRS-6 engine.',
    architecture: [],
    results: 'The local study and scheduling paths are implemented. Firebase-backed account sync and the mock-exam content path are not currently usable in the running build.',
    articleSections: [
      {
        title: 'Keeping study state local',
        paragraphs: [
          'Pantas stores its mutable study state in a Drift database instead of depending on a network request before a quiz can work. The database includes attempts, review state, quiz sessions, lesson progress, preferences, review logs, and a queue of changes waiting to sync.',
          'The database is opened through Drift\'s background native database path. Pantas generates a 32-byte key with `Random.secure()`, stores that key through `flutter_secure_storage`, and supplies it to SQLite3MultipleCiphers in SQLCipher compatibility mode. The repository also records the migration details because changing the encryption library or secure-storage format incorrectly could leave an existing install unable to open its own database.',
          'The sync layer was built around that local state. Changes such as an updated review schedule are added to a persistent pending queue, which keeps failed operations available for another attempt. The Firestore mappers, push and pull paths, and conflict handling exist in the repository. They are not live in the current build because Firebase bootstrap is still intentionally unwired.',
        ],
      },
      {
        title: 'What happens after an answer',
        paragraphs: [
          'A practice answer feeds directly into the review scheduler. `SubmitAnswer` checks the selected choice, derives a scheduler rating from correctness and response time, loads the existing review state or creates a new one, runs the FSRS scheduler, and saves the next due state. The same operation writes a review log containing the state from before the review, the rating that was actually used, correctness, response duration, and the version of the rating heuristic.',
          'That log was added when the scheduler moved from FSRS-4.5 to FSRS-6. The original implementation landed in May with separate paths for new questions, successful reviews, and lapses. In July, the scheduler moved to FSRS-6\'s 21 default weights, a trainable decay parameter, and a separate same-day stability formula. Tests were updated with reference values and migration cases so existing review states could continue through the new formulas.',
          'The current build still uses the published default weight vector. There is a separate design for fitting weights from a student\'s review history on the device, but that optimizer has not been implemented. Keeping that distinction in the article matters because the scheduling code is real today while personalized parameter fitting is not.',
        ],
      },
      {
        title: 'Fixing passage ordering at the session boundary',
        paragraphs: [
          'Reading-comprehension passages exposed a problem in how quiz sessions were assembled. Quick Quiz shuffled individual questions, which could split questions from one passage across different parts of the session. A student could read the same passage, answer something unrelated, then encounter another question from that passage later.',
          'The first fix grouped passage questions in the Quick Quiz path. That did not solve the general case because other use cases could create sessions through different routes. The grouping logic was moved into `QuizSession.start`, which is the shared constructor for new quiz sessions. Every new session now runs its questions through `groupPassageSets` before the first answer is recorded.',
          'Resumed sessions deliberately keep their stored order. Answer outcomes are indexed by question position, so regrouping a session after answers already exist could attach those outcomes to different questions. The common constructor is therefore the right boundary for new-session ordering, while resume restores the order that was originally saved.',
        ],
      },
      {
        title: 'Building content before it reaches the app',
        paragraphs: [
          'Questions are authored as structured files and pass through tooling before they are packed into the application. The authoring runbook has a validator for schema and content errors, followed by a Question Studio review step for flagged issues and duplicate stems. Questions that need a figure can stay inactive until the required illustration and renderer exist.',
          'The content model also separates two meanings of difficulty. Authored difficulty is only used to organize the writing progression from easier questions toward exam-level ones. It is not written into the runtime question model. FSRS difficulty belongs to an individual student\'s review state and changes from their actual review history instead.',
          'For the SQLite content path, the seed writer takes exported JSON and passes exams, subjects, topics, passages, questions, choices, lessons, and related records through the project\'s content parsers before writing `content.db`. When it builds the shipped database asset, it hashes the finished SQLite file and writes a shortened digest into `content_seed_version.dart`. The installer can use that digest to tell that bundled content changed instead of relying on somebody remembering to update a date or version string by hand.',
          'Pantas is still in active pre-launch development. The local study and scheduling paths are implemented, while Firebase-backed account sync and the mock-exam content path are not currently usable in the running build. I am keeping those unfinished pieces out of the feature claims until their runtime paths are actually connected.',
        ],
      },
    ],
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
