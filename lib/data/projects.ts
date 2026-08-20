export interface TechItem {
  name: string;
  category?: string;
  icon?: string; // key for icon rendering
}

export interface ProjectMetric {
  value: string;
  label: string;
}

export interface ProjectItem {
  slug: string;
  title: string;
  tagline: string;
  category: 'mobile' | 'web' | 'bots' | 'civic';
  categoryLabel: string;
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
  architecture: {
    title: string;
    description: string;
    codeSnippet?: string;
  }[];
  results: string;
  metrics?: ProjectMetric[];
}

export const PROJECTS: ProjectItem[] = [
  {
    slug: 'pantas',
    title: 'Pantas',
    tagline: 'Offline-first mobile exam reviewer for Philippine civil service and university entrance preparation with FSRS spaced repetition and interactive OMR mock exam sheets.',
    category: 'mobile',
    categoryLabel: 'Mobile & Offline',
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
    problem: 'Civil Service Exam and UPCAT preparation in the Philippines relies on bulky 500-page printed reviewers or web apps that fail without steady internet during commutes.',
    architecture: [
      {
        title: 'FSRS Spaced Repetition Engine',
        description: 'Free Spaced Repetition Scheduler computing memory retention curves based on recall states.',
        codeSnippet: `// FSRS memory retention state calculation
State calculateNextFSRSState(Card card, Rating rating) {
  final interval = fsrs.nextInterval(card.stability, card.difficulty, rating);
  return State(interval: interval, lastReviewed: DateTime.now());
}`,
      },
      {
        title: 'Local-First Encrypted Persistence',
        description: 'Drift SQLite database with SQLCipher encryption, enabling 100% offline study drills.',
      },
      {
        title: 'Interactive OMR Exam UI',
        description: 'Digital bubble-sheet test interface mirroring physical examination papers with blueprint-weighted subject ratios.',
      },
      {
        title: 'Dynamic Content Pipeline',
        description: 'Dynamic lesson pulls from Sanity CMS with deferred cloud sync via Firebase Firestore and in-app subscriptions via RevenueCat.',
      },
    ],
    results: 'Sub-15ms local query performance, complete offline functionality, and pre-launch beta covering CSE Professional and UPCAT exams.',
    metrics: [
      { value: '100%', label: 'Offline capability with zero cloud telemetry' },
      { value: '< 15ms', label: 'Query latency for 50-item exam drills via Drift SQLite' },
      { value: 'RA 10173', label: 'Compliant on-device local user data encryption' },
    ],
  },
  {
    slug: 'msl-network',
    title: 'The MSL Network',
    tagline: 'Collegiate gaming platform and tournament verification engine serving 10,000+ student competitors across 180+ Philippine universities.',
    category: 'bots',
    categoryLabel: 'Bots & Systems',
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
    problem: 'Built the community from scratch to unite competitive MLBB student players nationwide, requiring automated operations as headcount scaled past 10,000 members.',
    architecture: [
      {
        title: 'Channel Architecture & Onboarding',
        description: 'Designed channel architecture and onboarding rituals across 80+ partner student esports orgs.',
      },
      {
        title: 'Discord Verification Bot & Hostinger KVM2 VPS',
        description: 'Engineered a Discord bot hosted on Hostinger KVM2 VPS bridging Google Sheets registration data with cached MySQL tables for instant student verification and seasonal quest leaderboards.',
      },
    ],
    results: 'Grew to 10,000+ active members with automated daily operations and tournament support.',
    metrics: [
      { value: '10,000+', label: 'Active student community members' },
      { value: '90%', label: 'Reduction in manual tournament check-in overhead' },
      { value: '180+', label: 'Philippine universities connected' },
    ],
  },
  {
    slug: 'qr-studio',
    title: 'QR Studio',
    tagline: 'Zero-backend client-side custom QR code generator with gradient styling and crisp vector SVG/PNG export.',
    category: 'web',
    categoryLabel: 'Web & Tools',
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
    problem: 'Most web QR code generators are bloated with ads, require accounts, or send sensitive data to backend servers.',
    architecture: [
      {
        title: 'Client-Side Canvas Rendering & Vector Export',
        description: 'Used HTML5 Canvas for real-time raster rendering and SVG generation for vector exports.',
      },
    ],
    results: 'Fast, private, zero-backend tool.',
    metrics: [
      { value: '0ms', label: 'Network latency with zero backend requests' },
      { value: '100%', label: 'Client-side privacy and vector precision' },
    ],
  },
  {
    slug: 'kiosk-survey',
    title: 'Kiosk Survey',
    tagline: 'Offline touchscreen survey application for Android TV operating reliably in high-density event environments with automatic queue syncing.',
    category: 'mobile',
    categoryLabel: 'Mobile & Offline',
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
    problem: 'Gathering live attendee feedback at event venues where mobile reception drops or Wi-Fi fails under crowd load.',
    architecture: [
      {
        title: 'Android TV Local Persistence',
        description: 'Built for Android TV touchscreens. Local SQLite queue persisting every survey submission to the device immediately, syncing to cloud database in batches only when connection is detected.',
      },
    ],
    results: 'Ran 8 continuous hours on-site with zero dropped submissions and zero crashes.',
    metrics: [
      { value: '8 Hours', label: 'Continuous offline operation during live event' },
      { value: '0', label: 'Dropped survey submissions or crashes' },
    ],
  },
  {
    slug: 'norala-sb-portal',
    title: 'Norala SB Portal',
    tagline: 'Public-facing legislative transparency portal for the Sangguniang Bayan of Norala tracking ordinances and resolutions with offline PWA caching.',
    category: 'civic',
    categoryLabel: 'Civic Tech',
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
    problem: 'Municipal legislative records in local government units are typically locked in paper binders or fragmented PDFs inaccessible to citizens on mobile devices.',
    architecture: [
      {
        title: 'Full-Text Indexing & Gazette Viewer',
        description: 'Indexed full-text search across enacted municipal ordinances, resolutions, and committee reports.',
      },
      {
        title: 'Offline-First PWA Caching',
        description: 'Service worker caching enabling citizens to browse passed legislative records on low-bandwidth mobile connections.',
      },
    ],
    results: 'Sub-second search indexing and accessible public portal for local municipal legislation.',
    metrics: [
      { value: 'Sub-second', label: 'Full-text search across municipal legislation' },
      { value: 'Offline PWA', label: 'Accessible on low-bandwidth mobile devices' },
    ],
  },
  {
    slug: 'bettergov-ph',
    title: 'BetterGov PH',
    tagline: 'Open-source civic tech initiative modernizing Philippine government digital infrastructure and public service portals.',
    category: 'civic',
    categoryLabel: 'Civic Tech',
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
        title: 'Modern Accessible Web Architecture',
        description: 'Contributing components, clean information architecture, and responsive layouts designed for low-bandwidth mobile devices across the country.',
      },
    ],
    results: 'Active open source contributor building accessible public web tooling.',
    metrics: [
      { value: 'Open Source', label: 'Public citizen digital infrastructure' },
    ],
  },
  {
    slug: 'pso-scoring-model',
    title: 'PSO Automated Scorer',
    tagline: 'Automated evaluation, tiebreaker, and bracket ranking engine processing 4,000+ national Science Olympiad competitors across multiple elimination tiers.',
    category: 'bots',
    categoryLabel: 'Bots & Systems',
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
        description: 'Engineered Python/Pandas scoring models applying multi-tier tiebreakers, blueprint weighting, and automated cluster ranking in seconds.',
      },
    ],
    results: 'Processed scores and verified rankings for 4,000+ competitors with 100% accuracy and zero tabulation delays.',
    metrics: [
      { value: '4,000+', label: 'Competitors scored and ranked' },
      { value: '100%', label: 'Tabulation accuracy across elimination rounds' },
    ],
  },
  {
    slug: 'msl-collegiate-cup-bot',
    title: 'MSL Cup Tournament Bot',
    tagline: 'Tournament operations engine for collegiate MLBB competitions automating match lobbies, bracket updates, and ticketing for 3,000+ student players.',
    category: 'bots',
    categoryLabel: 'Bots & Systems',
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
  },
  {
    slug: 'ilocos-sur-esports-bot',
    title: 'Ilocos Sur Esports Bot',
    tagline: 'Provincial tournament engine for Ilocos Sur Government syncing Discord registrations with live Challonge brackets for MLBB and CODM.',
    category: 'bots',
    categoryLabel: 'Bots & Systems',
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
    results: 'Seamless tournament execution for 250+ provincial competitors.',
    metrics: [
      { value: '250+', label: 'Players coordinated across municipal brackets' },
    ],
  },
  {
    slug: 'oppo-legend-cup-bot',
    title: 'OPPO Legend Cup Bot',
    tagline: 'Tournament-grade verification bot for OPPO Philippines handling roster validation, schedule alerts, and automated match result logging.',
    category: 'bots',
    categoryLabel: 'Bots & Systems',
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
  },
  {
    slug: 'gi-damage-calculator',
    title: 'GI Damage Calculator',
    tagline: 'Client-side theorycrafting tool for Genshin Impact damage formulas with full artifact substat and weapon talent scaling.',
    category: 'web',
    categoryLabel: 'Web & Tools',
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
  },
  {
    slug: 'ai-agent-framework',
    title: 'AI Agent Framework',
    tagline: 'Modular instruction and skill architecture for agentic pair-programming, TDD guardrails, and deterministic subagent orchestration.',
    category: 'web',
    categoryLabel: 'Web & Tools',
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
  },
];
