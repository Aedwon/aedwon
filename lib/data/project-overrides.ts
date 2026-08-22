import { ALL_PROJECTS, type RegisteredProject } from "@/lib/data/project-registry";

const MSL_NETWORK_OVERRIDE: Partial<RegisteredProject> = {
  title: "MSL Network Bot",
  tagline:
    "Single-server MLBB Discord bot that links account verification to XP, Event Points, events, quests, moderation, and reporting.",
  role: "Developer",
  timeline: "2026",
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
  summary:
    "Single-server MLBB Discord bot that connects account verification with XP, Event Points, events, quests, moderation, and reporting.",
  problem:
    "The bot grew from XP, moderation, and boost tracking into the server's shared layer for verification, event participation, quests, moderation, and reporting.",
  architecture: [],
  hurdles: [],
  results:
    "The current code keeps Discord interactions in modular cogs, shared state in MySQL-backed services, and selected admin and analytics surfaces in Vercel serverless endpoints.",
  metrics: [],
  retrospective: undefined,
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
};

export const PORTFOLIO_PROJECTS: RegisteredProject[] = ALL_PROJECTS.map((project) =>
  project.slug === "msl-network"
    ? { ...project, ...MSL_NETWORK_OVERRIDE }
    : project,
);
