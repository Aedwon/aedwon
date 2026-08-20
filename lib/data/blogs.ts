export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  readTime: string;
  summary: string;
  tags: string[];
  content: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'offline-first-architecture-for-unreliable-event-venues',
    title: 'Offline-First Architecture for Unreliable Event Venues',
    date: 'Aug 18, 2026',
    readTime: '4 min read',
    summary: 'Lessons from building and operating a touchscreen survey app on Android TV that ran 8 hours completely disconnected in a crowded convention center.',
    tags: ['Architecture', 'Offline-First', 'SQLite', 'Flutter'],
    content: `
When building applications for live events, assuming stable internet connectivity is a guaranteed recipe for failure. During a major live convention in Manila, 15,000+ attendees completely saturated the local mobile cell towers and venue Wi-Fi routers within 30 minutes of doors opening.

### The Failure Mode of Standard Cloud APIs

Most client apps make direct POST requests to a cloud endpoint. When the network drops, they either show an error dialog, block the UI thread, or discard user submissions. In an interactive kiosk setup, an error dialog immediately breaks attendee trust.

### The Local SQLite Submission Queue

To solve this, we decoupled the user interaction lifecycle from the network sync lifecycle:

1. **Synchronous Local Write:** When an attendee taps "Submit", the payload is immediately written to an indexed, local SQLite database table with a \`sync_status = 'pending'\` flag.
2. **Immediate UI Feedback:** The user immediately sees their completion confirmation in under 16ms without waiting for a server handshake.
3. **Background Daemon Sync:** A resilient background service continuously monitors connectivity health using exponential backoff and synchronizes pending rows in FIFO batches once a stable uplink is detected.

\`\`\`dart
// Queue submission locally before any network interaction
Future<void> submitSurvey(SurveyResponse response) async {
  await localDb.into(localDb.surveys).insert(
    SurveysCompanion.insert(
      id: response.id,
      payload: jsonEncode(response.data),
      createdAt: DateTime.now(),
      synced: const Value(false),
    ),
  );
}
\`\`\`

### Key Takeaway

Design event software under the constraint that the network is always down. Treat cloud synchronization as an asynchronous eventual consistency luxury rather than a synchronous blocker.
    `,
  },
  {
    slug: 'agentic-engineering-daily-stack',
    title: 'Agentic Engineering: Moving Fast with Precision',
    date: 'Jul 29, 2026',
    readTime: '5 min read',
    summary: 'How I spend 80% of project time on research, formal specifications, and planning before writing code using agentic workflows.',
    tags: ['AI Workflows', 'Engineering', 'Architecture'],
    content: `
Software engineering with autonomous coding agents is not about prompting an LLM to generate entire applications in one blind leap. That approach produces brittle codebases full of hallucinations and subtle regressions.

### The 80/20 Research and Planning Rule

The highest leverage phase of any software project is the planning phase:

- Deep dive research into API constraints, schema dependencies, and trade-offs.
- Writing formal markdown specifications with explicit data models and strict edge case handling.
- Reviewing implementation plans before a single line of application code is committed.

When an implementation plan has zero ambiguity, subagents execute with mathematical precision and pass automated test suites on the first run.
    `,
  },
];
