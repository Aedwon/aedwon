import { ALL_PROJECTS, type RegisteredProject } from "@/lib/data/project-registry";

const OPPO_HYPER_LEGEND_CUP_OVERRIDE: Partial<RegisteredProject> = {
  title: "OPPO Hyper Legend Cup Bot",
  tagline:
    "Discord tournament operations bot with sheet-backed roster verification, persistent match sessions, support workflows, and direct Challonge result reporting.",
  role: "Bot Developer",
  timeline: "2026",
  platforms: [{ name: "Discord", icon: "server" }],
  stack: [
    { name: "Python", icon: "python" },
    { name: "Discord.py", icon: "bot" },
    { name: "MySQL", icon: "mysql" },
    { name: "aiomysql", icon: "mysql" },
    { name: "aiohttp", icon: "python" },
    { name: "Google Sheets CSV", icon: "sheets" },
    { name: "Challonge API", icon: "challonge" },
  ],
  summary:
    "Discord operations bot for the OPPO Hyper Legend Cup. It validates registered players against tournament roster data, keeps match and support state in MySQL, and connects Discord match channels to Challonge brackets.",
  problem:
    "The bot ties Discord tournament operations to registered roster data, persistent match state, support workflows, and Challonge reporting.",
  architecture: [],
  hurdles: undefined,
  results:
    "The current implementation covers roster verification, persistent match sessions, ticket state, scheduled operations, and direct Challonge result reporting from Discord.",
  metrics: undefined,
  retrospective: undefined,
  articleSections: [
    {
      title: "Roster data drives verification",
      paragraphs: [
        "The first version of verification asked players to choose a team before submitting their details. That changed fairly early. The current flow only asks for a numeric UID and server ID, then uses that pair to find the registration record and pull the team name, abbreviation, and IGN automatically. A successful verification is written to MySQL, the relevant Discord role is assigned, and the member nickname becomes `ABBREV | IGN`.",
        "The roster source changed as the bot was used with the actual tournament sheet. The validator now reads the `FINAL Teams Database` tab as CSV through `aiohttp`, maps the sheet columns into its own fields, skips blank roster slots, and keeps the parsed entries in a five-minute cache protected by an `asyncio.Lock`. Staff use a separate access-code flow for coach and manager verification, while League Operations entries have a database-backed fallback when a UID and server pair is not present in the sheet.",
        "That cache needed follow-up work. Resetting a verification originally left the old sheet entries in memory, and a fresh HTTP request could still receive cached CSV data from Google. The fixes added timestamp parameters to the export URLs, cleared the in-memory cache before a forced refresh, and sent no-cache headers with the request. The refresh command also reports the entries and team names it loaded so an operator can check that the bot is working from the expected roster.",
      ],
    },
    {
      title: "Match state survives restarts",
      paragraphs: [
        "Match management is backed by `match_sessions` and `match_games` instead of existing only in Discord messages. A session stores its channel, marshal, best-of format, team names, acknowledgement state, dispute timing, and the last result message. Each logged game has its own result and acknowledgement fields. The bot still keeps active sessions in memory while it is running, but `cog_load()` rebuilds unfinished sessions from MySQL on startup and reattaches the appropriate dispute view to the saved message.",
        "After `/game_result`, the session moves into an acknowledgement state and a five-minute countdown begins. Team members can confirm the result by typing `I acknowledge`. Filing a dispute pauses that countdown. The elapsed-time calculation subtracts completed dispute time as well as an active dispute period before deciding whether the acknowledgement window has expired. Match channels can also run a separate 15-minute grace-period countdown before play, which `/game_started` cancels when the game begins.",
        "The same state is used for match summaries and history. Team names are stored with the session, game results are kept in sequence, and completed sessions can produce a series score, duration, and winner from the recorded games instead of reconstructing the match from channel messages later.",
      ],
    },
    {
      title: "Challonge reporting became a guided flow",
      paragraphs: [
        "A Discord channel can be linked to a Challonge tournament, with that relationship stored in MySQL. The bot can then fetch the bracket's participants and current matches through an asynchronous `aiohttp` client.",
        "Result reporting originally accepted a match number, winner name, and score as command arguments. It was later changed to a guided Discord interaction. `/challonge_report` fetches the open matches and presents them in a select menu. After choosing a match, the next menu contains only its two participants. The final step is a modal for an `X-Y` score. This removes manually typed match identifiers and participant names from the normal reporting path.",
        "Before sending the result, the bot rewrites the score into Challonge's player-one ordering and fetches the bracket state again. If another operator completed the match while the reporting UI was open, the submission stops instead of overwriting that result. Otherwise the bot updates Challonge and posts the completed result back to the Discord channel.",
      ],
    },
    {
      title: "Persistence also changed the ticket flow",
      paragraphs: [
        "Tickets exposed the same restart boundary earlier in the project. The original close flow kept the ticket creator and claimant on the active Discord view. A later fix changed it to retrieve both from the `active_tickets` row, so closing a ticket can still resolve the right users after the bot has restarted. The close path generates an HTML transcript, sends it to the relevant users and log channel, and creates a pending rating record before deleting the ticket channel.",
        "The rating path uncovered a smaller database issue. It initially inserted the pending rating and then ran `SELECT LAST_INSERT_ID()` through the connection pool. That could execute on a different pooled connection. The database helper was changed to return the insert cursor's `lastrowid` directly, so the rating buttons are created with the ID from the same insert that created their record.",
        "That pattern shows up across the rest of the bot as well. Guild configuration, scheduled embeds, thread-to-role links, verification records, ticket state, match sessions, and channel-to-Challonge links all have database-backed state instead of depending entirely on one running Discord process.",
      ],
    },
  ],
};

export const PORTFOLIO_PROJECTS: RegisteredProject[] = ALL_PROJECTS.map((project) =>
  project.slug === "oppo-legend-cup-bot"
    ? { ...project, ...OPPO_HYPER_LEGEND_CUP_OVERRIDE }
    : project,
);
