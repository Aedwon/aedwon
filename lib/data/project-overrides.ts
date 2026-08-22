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

const MLBB_EXTRACTOR_OVERRIDE: Partial<RegisteredProject> = {
  tagline:
    "Client-side MLBB screenshot extractor built around configurable crop presets, Tesseract.js OCR, and long or role-positioned CSV exports.",
  summary:
    "Browser tool that maps post-game screenshots to five tab presets, slices stat columns into ten player records, checks battle IDs across a batch, and exports match data as a 40-column long CSV or a 226-column wide CSV.",
  problem:
    "The extractor turns MLBB post-game screenshots into structured ten-player match data using configurable crop presets and browser-based OCR.",
  architecture: [],
  hurdles: undefined,
  results:
    "The current implementation covers batch screenshot mapping, Battle ID verification, editable player review, match metadata, and selectable long or role-positioned CSV exports without a backend.",
  metrics: undefined,
  retrospective: undefined,
  articleSections: [
    {
      title: "Building the batch around crop presets",
      paragraphs: [
        "The extractor works from the five MLBB post-game tabs it knows about: Main, DPS, Team, Overall, and Farm. Each uploaded screenshot gets a preset, and the app blocks OCR when two screenshots are assigned to the same tab. The batch architecture landed early in the repository history along with the switch from reading one image to building ten player records across several screenshots.",
        "Each preset is a collection of crop boxes in source-image coordinates. The screenshot is drawn to a full-resolution canvas while the browser displays a scaled version, so dragging a box in the UI still updates coordinates against the original image. Those boxes are saved in `localStorage` using the image dimensions and preset name as the key. A calibrated Main preset at one resolution does not overwrite the configuration for another resolution or another tab.",
        "Most boxes represent a full stat column instead of one player cell. During OCR, the code divides a column's height into five equal slices, adds a small amount of padding around each crop, and sends the slices through Tesseract one at a time. Crops on the left half become players 1 through 5. Crops on the right become players 6 through 10. Header fields such as Battle ID and duration use a single crop instead.",
        "Before extracting the stat columns, the app makes a separate Battle ID pass over the uploaded screenshots. It strips the OCR result down to digits and compares each usable ID with the first one using Levenshtein distance. A distance above three stops the batch. It is a small check, but it keeps screenshots from different matches from being merged into the same ten-player record.",
      ],
    },
    {
      title: "The red side needed its own field order",
      paragraphs: [
        "The crop editor has a symmetry lock because the two team layouts share much of the same geometry. Default red-side boxes are generated by moving the blue group to the other half of the screenshot while preserving the spacing inside the group. Moving or resizing one side can update its paired box on the other side as well.",
        "The field order is not fully symmetric, though. The current defaults have explicit red-side orders for the Main and DPS tabs. This distinction came from a concrete bug in the DPS export. The red-side crops were landing on valid cells, but Hero Damage and Consecutive Kills were being attached to the wrong fields because the code assumed the blue-side column sequence also described the red side.",
        "The fix was one line in `RED_COLUMN_ORDER`, adding the DPS sequence as `consec_kills` followed by `hero_dmg`. That kept the mirroring code for positioning while giving tabs with different semantics their own field order. It is also why I would not replace the crop presets with a single blanket rule for both halves of the scoreboard.",
      ],
    },
    {
      title: "Exporting a match instead of dumping OCR text",
      paragraphs: [
        "The match schema was added in a sequence of small commits on May 2. The repository first added a duration parser and roster validation, then the role and hero constants. The long serializer came next, followed by the role-positioned wide serializer. After that, the duration crop, DPS mapping fix, player review fields, match metadata form, and final export picker were wired into the application.",
        "The review step groups OCR values by player and keeps the extracted stat fields editable. Each player also needs a hero and one of the five roles. Confirmation stays disabled while a hero or role is missing, or when the same role appears twice on one side. That validation also protects the wide export because the serializer finds each slot by its side and role. Without unique role assignments, a column such as `blue_mid_kills` would not have one unambiguous player to read from.",
        "The long CSV keeps one row per player. It has 16 match-level columns, five player metadata columns, and 19 stat columns for a total of 40. Match information such as Battle ID, patch, duration, winner, ban mode, and bans is repeated across the ten player rows.",
        "The wide CSV turns the same match into one 226-column row. It starts with the same 16 match columns, then writes ten fixed role slots in Blue then Red order. Within each side the order is EXP, Jungle, Mid, Roam, and Gold. Each slot contains IGN and hero followed by the 19 stat fields. The serializer therefore does the reshaping itself instead of requiring a separate pivot after export.",
        "Patch, winning side, and bans are manual metadata fields in the current UI. Duration comes from OCR and is converted from `MM:SS` to seconds only when it matches that format. The crop configurations and IGN history persist in `localStorage`, while the current match metadata and player assignments are reset after a match is saved. Screenshot processing and CSV generation stay in the browser. There is no backend in the current application path.",
      ],
    },
  ],
};

const QR_STUDIO_OVERRIDE: Partial<RegisteredProject> = {
  tagline:
    "Browser QR code editor built with vanilla JavaScript and qr-code-styling, with live customization and local file export.",
  timeline: "2026",
  stack: [
    { name: "JavaScript", icon: "javascript" },
    { name: "Vite", icon: "vite" },
    { name: "HTML5 Canvas", icon: "canvas" },
    { name: "qr-code-styling", icon: "qr-code" },
  ],
  githubUrl: "https://github.com/Aedwon/QR-Code-Maker",
  summary:
    "Static Vite QR editor that keeps QR payload generation and logo processing in the browser while using qr-code-styling for rendering and export.",
  problem:
    "QR Studio is a static Vite QR editor built around qr-code-styling. Payload changes, styling controls, uploaded-logo processing, and file export run in the browser.",
  architecture: [],
  results:
    "The current editor supports live styling, logo compositing, error-correction controls, responsive editing, capacity warnings, and PNG, SVG, and JPEG export.",
  metrics: undefined,
  retrospective: undefined,
  articleSections: [
    {
      title: "Building the editor around one QR instance",
      paragraphs: [
        "QR Studio is a static Vite app written in vanilla JavaScript and CSS. I did not implement the QR encoding algorithm myself. The app wraps `qr-code-styling` and keeps one `QRCodeStyling` instance mounted in the preview. The controls mutate a shared options object, then a 150 millisecond debounce rebuilds those options and passes them to `update()` instead of recreating the QR object for every input event.",
        "Presets and manual controls use the same state. Applying a preset deep-copies its dot, corner, and background settings before syncing the visible controls. A manual edit clears the active preset. There is also a library-specific state problem to handle. `qr-code-styling` shallow-merges updates, so removing a gradient from the local options is not enough to clear a previously rendered one. `buildOptions()` explicitly passes `gradient: undefined` for the dot and corner groups whenever they switch back to a flat color.",
      ],
    },
    {
      title: "Processing logos before rendering",
      paragraphs: [
        "Logo uploads are read with `FileReader` and kept as data URLs in memory. I store the original image separately from the version passed into the QR renderer because QR Studio can add a circle, square, or rounded background behind the logo. When one of those backgrounds is selected, the app creates an off-screen canvas based on the largest image dimension, adds 15 percent padding, draws the background shape, centers the original logo, and converts the result back into a PNG data URL.",
        "Logo handling also changed after the first implementation. A later fix enabled `hideBackgroundDots` so transparent parts of an uploaded logo do not have QR modules showing through them. Uploading a logo changes the selected error-correction level from Q to H, and removing it restores Q. That does not guarantee that every heavily styled QR code will scan under every condition, but it gives embedded logos more error-correction headroom in the current editor.",
      ],
    },
    {
      title: "Changes after the first editor",
      paragraphs: [
        "The first commit already contained the main editor with presets, gradient controls, logo embedding, error-correction settings, and PNG, SVG, and JPEG export. The next substantial change was the responsive layout. At 900 pixels and below, the page reverses the main column order and makes the preview sticky above the controls. Smaller breakpoints reduce the QR preview and increase several interactive controls to touch-friendly sizes so the editor remains usable without hiding the result below a long settings panel.",
        "The latest feature in the repository is the input capacity indicator. It measures the payload with `Blob([value]).size`, so non-ASCII text is counted as UTF-8 bytes instead of JavaScript string length. The configured limit changes with the selected L, M, Q, or H error-correction level. The progress bar warns after 75 percent of that limit and marks the input as too long once it passes the configured maximum.",
      ],
    },
    {
      title: "What stays local",
      paragraphs: [
        "The QR generation path does not require an application backend. Payload changes, styling, uploaded-logo processing, and file export happen in the browser. The deployment configuration builds the Vite project into a static `dist` directory, and PNG, SVG, and JPEG files are exported through the `qr-code-styling` download API.",
        "The page itself is not completely network-free. It loads Google Analytics and Google Fonts, and the optional feedback form posts to Web3Forms. The useful boundary is narrower. QR payloads and uploaded logos are processed locally by the application, while those separate page services still make external requests.",
      ],
    },
  ],
};

const KIOSK_SURVEY_OVERRIDE: Partial<RegisteredProject> = {
  tagline:
    "Flutter survey kiosk for HOK Benefits with local Hive storage, a controlled on-screen keyboard, CSV export, and Android screen pinning.",
  role: "Developer",
  timeline: "2026",
  platforms: [{ name: "Android", icon: "android" }],
  stack: [
    { name: "Flutter", icon: "flutter" },
    { name: "Dart", icon: "dart" },
    { name: "Hive", icon: "storage" },
    { name: "Android", icon: "android" },
  ],
  summary:
    "Landscape Flutter survey kiosk that stores responses locally in Hive, resets inactive sessions, gives operators a CSV export path, and uses Android lock-task mode to keep the app pinned.",
  problem:
    "Kiosk Survey is a landscape Flutter app for collecting three HOK Benefits feedback prompts with local storage, controlled text entry, session resets, and an operator export path.",
  architecture: [],
  results:
    "The current build stores completed surveys locally in Hive, exports them to CSV through the admin screen, and uses Android lock-task mode for screen pinning.",
  metrics: undefined,
  retrospective: undefined,
  articleSections: [
    {
      title: "The attendee loop",
      paragraphs: [
        "Kiosk Survey is a landscape Flutter app for collecting three HOK Benefits feedback prompts. The welcome screen starts the survey from a full-screen tap. Each question accepts one text response, and the user cannot continue until the current field contains an answer.",
        "The response fields are read-only to the system keyboard and open a custom on-screen keyboard when tapped. It handles letters, numbers, symbols, shift state, cursor-aware insertion, backspace, space, and dismissal. A March 16 commit changed the survey from suggested answer chips plus free text to text-only responses. Later commits hid the keyboard by default and increased the question text to 72 pixels.",
        "Session reset behavior lives in the application shell instead of being repeated across individual screens. Pointer activity resets a 45-second timer, and an inactive survey returns to the welcome route. After submission, the thank-you screen stays up for three seconds before returning to the start screen for the next response.",
      ],
    },
    {
      title: "Responses stay on the device until export",
      paragraphs: [
        "The current build does not have a reconnection queue or automatic server sync. `SurveyRepository` opens a Hive box and writes each completed submission there, adding an ISO timestamp before saving it. Submitting the survey only waits for that local write before moving to the thank-you screen.",
        "Operators have a separate admin path reached through a hidden five-tap target on the welcome screen, followed by password entry. The admin view shows the current entry count and can export the stored responses to CSV or clear them after confirmation.",
        "CSV export was already part of the initial implementation, then changed in smaller passes. One commit replaced internal headings such as `Q1_Answer` with the full question text. Another changed the native save flow to pass the generated CSV bytes through the file picker. The current dialog lets the operator choose the output file, with a USB drive given as an example destination.",
      ],
    },
    {
      title: "Screen pinning moved into Android",
      paragraphs: [
        "The Flutter shell already forced landscape orientation, hid the system UI with immersive mode, and handled session resets in the initial commit. Native screen pinning came later.",
        "On March 17, the Android activity was changed from a plain `FlutterActivity` to one that calls `startLockTask()` when it resumes. The same change added a method channel between Flutter and Android. The admin screen can invoke `stopKioskMode`, which calls `stopLockTask()` before closing the application.",
        "That leaves the kiosk behavior split across the two layers. Flutter controls the survey flow, fullscreen presentation, inactivity reset, and operator interface. Android lock-task mode keeps the application pinned until an operator exits through the admin path.",
      ],
    },
  ],
};

const ISFE_OVERRIDE: Partial<RegisteredProject> = {
  title: "Ilocos Sur Festival Esports Bot",
  tagline:
    "Discord operations bot for festival esports that handles MLBB and CODM team verification, Challonge result reporting, support tickets, and batch match threads.",
  role: "Bot Developer",
  timeline: "2026",
  platforms: [{ name: "Discord", icon: "server" }],
  stack: [
    { name: "Python", icon: "python" },
    { name: "Discord.py", icon: "bot" },
    { name: "MySQL", icon: "mysql" },
    { name: "Challonge API", icon: "challonge" },
  ],
  githubUrl: "https://github.com/Aedwon/isfe-discord-bot",
  summary:
    "Festival esports bot built with Discord.py and MySQL. Players verify against game-specific team lists, while admins manage rosters, create match threads, handle support tickets, and report results to linked Challonge brackets.",
  problem:
    "The current bot combines player verification, league operations utilities, support tickets, and channel-linked Challonge result reporting for festival esports operations.",
  architecture: [],
  results:
    "The current repository covers verification, roster administration, match-thread tooling, support tickets, Challonge result reporting, and Pterodactyl restart automation.",
  metrics: undefined,
  retrospective: undefined,
  articleSections: [
    {
      title: "Verification grew out of registration",
      paragraphs: [
        "The repository started as a general league operations bot in January 2026. Player registration was added a few days later, then the flow changed in several small commits. Team selection gained pagination around Discord's 25-option select limit. The registration panel was then replaced with a persistent verification panel that checks a member's game roles before showing the corresponding team list.",
        "The current verification path covers MLBB and CODM. A member selects a game role first, chooses a team from the MySQL-backed list, and enters an IGN through a modal. Re-verifying for the same game deletes the previous registration before inserting the new one, so the one-registration-per-game rule is enforced in application code. Members verified for both games can choose a nickname based on either IGN, both IGNs, or the current IGN without a game prefix. The final nickname is truncated to Discord's 32-character limit.",
        "The same team and registration tables feed the administrative commands. `/teams` handles the team list, `/entries` summarizes teams with verified players, and `/mention` and `/roster` query those registrations for league operations. That keeps the roster commands on the same data the verification panel writes instead of maintaining a second copy.",
      ],
    },
    {
      title: "Challonge stays separate from verification",
      paragraphs: [
        "Player registrations are not pushed into Challonge in the current implementation. An administrator or member with the configured Marshal role links an existing Challonge tournament to a Discord channel. Those channel mappings live in `data/challonge_brackets.json`, while teams and player registrations remain in MySQL. When a bracket is linked, the bot fetches its participants from Challonge and keeps an ID-to-name cache for match displays and command autocomplete.",
        "From a linked channel, `/challonge_matches` reads the bracket and formats its matches with participant names. `/challonge_report` validates the score format, resolves the requested match, checks that both participant slots are populated, finds the proposed winner in the current Challonge participant list, and verifies that the winner belongs to that match before sending the result back through the API.",
        "Challonge support landed after the verification work. The first version covered linking, unlinking, viewing matches, reporting results, and showing bracket information. A later commit added winner autocomplete, participant-cache refresh, completed-match reopening, and retry handling for server errors, timeouts, and network failures. The API client retries with exponential backoff instead of treating every temporary failure as a final error.",
      ],
    },
    {
      title: "Operations around the tournament",
      paragraphs: [
        "The bot has utilities for repetitive Discord setup alongside the registration and bracket commands. `/createthreads` can create a numbered batch of private threads from a prefix and a set of roles. It pauses between groups of thread creations and has explicit handling for Discord rate-limit responses. Afterward it posts the created thread links back to the parent channel. `/deletethreads` finds active and archived threads matching a prefix and puts the batch deletion behind a confirmation step.",
        "Support requests use a separate ticket cog. A member chooses a category and submits a subject and description, then the bot creates a private text channel with access for the requester and the corresponding support role. Open tickets are recorded in MySQL. Closing one collects up to 500 messages into an HTML transcript, marks the database row closed, sends the transcript to the configured log channel when one is available, and removes the ticket channel. A background task also checks open tickets every ten minutes and posts a reminder once a ticket has been open for more than 24 hours.",
        "Deployment is kept small in the repository. Pushes to `main` run a GitHub Actions workflow that sends a restart signal to a Pterodactyl server through its client API. The repository does not identify the underlying hosting provider, so the project does not need a provider-specific hosting claim.",
      ],
    },
  ],
};

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

const PROJECT_OVERRIDES: Partial<Record<string, Partial<RegisteredProject>>> = {
  "msl-network": MSL_NETWORK_OVERRIDE,
  "mlbb-post-game-extractor": MLBB_EXTRACTOR_OVERRIDE,
  "qr-studio": QR_STUDIO_OVERRIDE,
  "kiosk-survey": KIOSK_SURVEY_OVERRIDE,
  "ilocos-sur-esports-bot": ISFE_OVERRIDE,
  "oppo-legend-cup-bot": OPPO_HYPER_LEGEND_CUP_OVERRIDE,
};

export const PORTFOLIO_PROJECTS: RegisteredProject[] = ALL_PROJECTS.map((project) => ({
  ...project,
  ...(PROJECT_OVERRIDES[project.slug] ?? {}),
}));
