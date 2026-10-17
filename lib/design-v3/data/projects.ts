// Ported verbatim from v3-design/reference/generators/projects.py (executed and serialized).
// Field names, ordering and placeholder brackets are kept exactly as the generator emits them.
// Note: some entries carry no "sections" key (the generator omits it for notes).

export interface Project {
  id: string;
  name: string;
  type: string;
  media: string;
  depth: string;
  desc: string;
  stack: string[];
  stackText?: string;
  repo?: string;
  post?: boolean;
  topic?: string;
  mins?: string;
  date?: string;
  links: { label: string; href: string }[];
  facts: { k: string; v: string }[];
  points?: { h: string; p: string }[];
  sections?: Section[];
}

export interface Section {
  kind: string;
  h?: string;
  p?: string[];
  items?: { h: string; p: string[]; which: string; vh: string }[];
  cols?: { h: string; items: string[] }[];
  fig?: string;
  [k: string]: unknown;
}

export const PROJECTS: Project[] = [
  {
    "id": "pantas",
    "name": "Pantas",
    "type": "Mobile app",
    "media": "phone",
    "depth": "case",
    "desc": "Android-first exam reviewer for Philippine civil service and university entrance preparation, with encrypted local study state and on-device FSRS-6 scheduling.",
    "stack": [
      "Flutter",
      "Dart",
      "Firebase",
      "Drift",
      "RevenueCat"
    ],
    "links": [
      {
        "label": "pantas.app",
        "href": "https://pantas.app"
      }
    ],
    "facts": [
      {
        "k": "Role",
        "v": "Lead Architect & Developer"
      },
      {
        "k": "Status",
        "v": "Pre-launch"
      },
      {
        "k": "Platform",
        "v": "Android"
      },
      {
        "k": "Timeline",
        "v": "[Start] – present"
      },
      {
        "k": "Scale",
        "v": "158 lessons, 3,163 questions"
      }
    ],
    "points": [
      {
        "h": "Works offline",
        "p": "Content ships inside the app and study state lives in an encrypted local database."
      },
      {
        "h": "FSRS-6 review scheduling",
        "p": "Each student's review dates adapt to their own answer history, computed on the device."
      },
      {
        "h": "A plan that adapts daily",
        "p": "The roadmap sizes each day from the work left, the days left and how the student actually studies."
      }
    ],
    "sections": [
      {
        "kind": "text",
        "h": "Why Pantas",
        "p": [
          "[2–3 sentences: who it's for (civil service and university entrance exam takers), what's wrong with the reviewers they use today, and why working offline matters for them.]"
        ]
      },
      {
        "kind": "text",
        "h": "Keeping study state local",
        "p": [
          "Pantas stores its mutable study state in a Drift database instead of depending on a network request before a quiz can work. The database includes attempts, review state, quiz sessions, lesson progress, preferences, review logs, and a queue of changes waiting to sync.",
          "The database is opened through Drift’s background native database path. Pantas generates a 32-byte key with Random.secure(), stores that key through flutter_secure_storage, and supplies it to SQLite3MultipleCiphers in SQLCipher compatibility mode. The repository also records the migration details because changing the encryption library or secure-storage format incorrectly could leave an existing install unable to open its own database.",
          "The sync layer was built around that local state. Changes such as an updated review schedule are added to a persistent pending queue, which keeps failed operations available for another attempt. The Firestore mappers, push and pull paths, and conflict handling exist in the repository. They are not live in the current build because Firebase bootstrap is still intentionally unwired."
        ]
      },
      {
        "kind": "text",
        "h": "What happens after an answer",
        "p": [
          "[Your existing text for this section.]"
        ],
        "fig": "[5s silent loop: answer → next review date]"
      },
      {
        "kind": "systems",
        "h": "How Pantas works",
        "p": [
          "Five systems, from the daily plan to a second device. Each is labelled honestly: shipping is on main, candidate is built on a branch and still in review, planned is specified but not built."
        ],
        "items": [
          {
            "h": "Adaptive roadmap",
            "which": "roadmap",
            "vh": "370px",
            "p": [
              "Every day, Pantas plans the student's day from what's left and how they actually study. The last stretch before the exam is review-only. Topics go weakest first, prerequisites first. What's left is spread evenly over the study days left, due reviews are added up to a typical day, one mock lands 1 to 6 days before the exam, and today is split into short sittings and frozen.",
              "It rebuilds whenever something changes, like a new exam date or new content, and logs why."
            ]
          },
          {
            "h": "Study loop",
            "which": "study",
            "vh": "370px",
            "p": [
              "The student never rates themselves. The app grades each answer from two facts: right or wrong, and how long it took. Wrong is Again, right but slower than 25 seconds is Hard, right and quick is Good. FSRS then decides when the question comes back: good recalls push it further out, a miss brings it back soon. It’s all written to the encrypted local database, so it works offline.",
              "A per-student optimizer for the scheduler is specified but not built yet."
            ]
          },
          {
            "h": "Content",
            "which": "content",
            "vh": "370px",
            "p": [
              "Lessons are Markdown and questions are YAML. Each question passes a checklist and a blind-solve by someone other than its author, then an importer that rejects mistakes like a wrong choice without an explanation. Questions waiting on a figure stay inactive until it's drawn.",
              "Content ships inside the app. Updates never touch a student's progress."
            ]
          },
          {
            "h": "Insights",
            "which": "insights",
            "vh": "410px",
            "p": [
              "Pantas compares a student's own answers in two conditions, computed on the phone. Figures show as soon as both sides have data, but a sentence only appears once a standard statistical test says the gap is unlikely to be chance. Nothing unlocks at a fixed day or session count.",
              "Shown here is stamina: the first half of each mock against the second, checked with a two-proportion z-test. Other tendencies use Welch's t-test on log times, an exact binomial test and a Wilson interval. The student is an example."
            ]
          },
          {
            "h": "Pro and backup",
            "which": "pro",
            "vh": "370px",
            "p": [
              "Pro is decided on the phone from the store through RevenueCat, so it works offline and never drops a student to Free on a stale answer. Backup only turns on when three things are true: signed in with Google, Pro on the phone, and a Pro flag the server sets from RevenueCat's signed events.",
              "From then on, changes upload 5 seconds after the last one and reach the student's other devices. If Pro ends, backup stops and everything stays on the phone."
            ]
          }
        ]
      },
      {
        "kind": "text",
        "h": "Building content before it reaches the app",
        "p": [
          "Questions are authored as structured files and pass through tooling before they are packed into the application. The authoring runbook has a validator for schema and content errors, followed by a Question Studio review step for flagged issues and duplicate stems. Questions that need a figure can stay inactive until the required illustration and renderer exist.",
          "The content model also separates two meanings of difficulty. Authored difficulty is only used to organize the writing progression from easier questions toward exam-level ones. It is not written into the runtime question model. FSRS difficulty belongs to an individual student's review state and changes from their actual review history instead.",
          "For the SQLite content path, the seed writer takes exported JSON and passes exams, subjects, topics, passages, questions, choices, lessons, and related records through the project’s content parsers before writing content.db. When it builds the shipped database asset, it hashes the finished SQLite file and writes a shortened digest into content_seed_version.dart. The installer can use that digest to tell that bundled content changed instead of relying on somebody remembering to update a date or version string by hand."
        ]
      },
      {
        "kind": "status",
        "h": "Status and what’s next",
        "p": [
          "Pantas is still in pre-launch development. I keep unfinished pieces out of the feature claims until their runtime paths are actually connected."
        ],
        "cols": [
          {
            "h": "Shipping (on main)",
            "items": [
              "Content pipeline and illustrations",
              "Placement, study loop, mock exams",
              "Insights, Wrapped, notifications",
              "Pro, sync, consent-based telemetry",
              "Build and release"
            ]
          },
          {
            "h": "Candidate (on a branch)",
            "items": [
              "Adaptive roadmap",
              "Prepared Today session",
              "Signed, encrypted content packages",
              "Tendency confidence",
              "Question QA round"
            ]
          },
          {
            "h": "Planned",
            "items": [
              "Content coverage audit",
              "Per-student scheduler optimizer",
              "Export link and scheduled cleanups",
              "[Launch target]"
            ]
          }
        ],
        "link": {
          "label": "[Join the waitlist]",
          "href": "#"
        }
      }
    ]
  },
  {
    "id": "msl",
    "name": "MSL Network Bot",
    "type": "Discord bot",
    "media": "discord",
    "depth": "writeup",
    "desc": "Single-server MLBB Discord bot that connects account verification with XP, Event Points, events, quests, moderation, and reporting.",
    "stack": [
      "Python",
      "MySQL"
    ],
    "links": [
      {
        "label": "[Invite or demo link]",
        "href": "#"
      }
    ],
    "facts": [
      {
        "k": "Role",
        "v": "[Role]"
      },
      {
        "k": "Year",
        "v": "[Year]"
      },
      {
        "k": "Platform",
        "v": "Discord"
      },
      {
        "k": "Status",
        "v": "[Status]"
      }
    ],
    "sections": [
      {
        "h": "The brief",
        "p": [
          "[Who it was for and what they needed, in two or three sentences.]"
        ],
        "kind": "text"
      },
      {
        "h": "What I built",
        "p": [
          "Single-server MLBB Discord bot that connects account verification with XP, Event Points, events, quests, moderation, and reporting.",
          "[One or two sentences on the hardest part, and how you solved it.]"
        ],
        "fig": "[MSL Network Bot, in use]",
        "kind": "text"
      },
      {
        "h": "How it went",
        "p": [
          "[The result: numbers if you have them, or what people said.]"
        ],
        "kind": "text"
      }
    ]
  },
  {
    "id": "lakambini",
    "name": "Lakambini",
    "type": "Website redesign",
    "media": "web",
    "depth": "note",
    "desc": "Redesign of the website for Lakambini, an events and creative agency I worked with. [One line on what changed or the result.]",
    "stack": [],
    "stackText": "[stack]",
    "links": [
      {
        "label": "[lakambini url]",
        "href": "#"
      }
    ],
    "facts": [
      {
        "k": "Client",
        "v": "Lakambini"
      },
      {
        "k": "Role",
        "v": "[Role]"
      },
      {
        "k": "Year",
        "v": "[Year]"
      },
      {
        "k": "Platform",
        "v": "Web"
      }
    ]
  },
  {
    "id": "agent",
    "name": "AI Agent Config",
    "type": "Developer tooling",
    "media": "term",
    "depth": "writeup",
    "desc": "Portable configuration system for coding agents that composes shared policy with project-owned rules and renders the selected result into provider-specific instruction files.",
    "stack": [
      "Python",
      "Markdown",
      "YAML"
    ],
    "links": [
      {
        "label": "[Source]",
        "href": "#"
      }
    ],
    "facts": [
      {
        "k": "Role",
        "v": "[Role]"
      },
      {
        "k": "Year",
        "v": "[Year]"
      },
      {
        "k": "Platform",
        "v": "CLI"
      },
      {
        "k": "Status",
        "v": "[Status]"
      }
    ],
    "sections": [
      {
        "h": "The brief",
        "p": [
          "[Who it was for and what they needed, in two or three sentences.]"
        ],
        "kind": "text"
      },
      {
        "h": "What I built",
        "p": [
          "Portable configuration system for coding agents that composes shared policy with project-owned rules and renders the selected result into provider-specific instruction files.",
          "[One or two sentences on the hardest part, and how you solved it.]"
        ],
        "fig": "[AI Agent Config, in use]",
        "kind": "text"
      },
      {
        "h": "How it went",
        "p": [
          "[The result: numbers if you have them, or what people said.]"
        ],
        "kind": "text"
      }
    ]
  },
  {
    "id": "kiosk",
    "name": "Kiosk Survey",
    "type": "Android TV",
    "media": "tv",
    "depth": "writeup",
    "desc": "Touchscreen survey app for Android TV that operated for 8 continuous hours during a live event without internet, syncing queued submissions once reconnected.",
    "stack": [
      "Flutter",
      "Dart",
      "Firebase",
      "Android"
    ],
    "links": [],
    "facts": [
      {
        "k": "Role",
        "v": "[Role]"
      },
      {
        "k": "Event",
        "v": "[Event]"
      },
      {
        "k": "Platform",
        "v": "Android TV"
      },
      {
        "k": "Ran for",
        "v": "8 hours, offline"
      }
    ],
    "sections": [
      {
        "h": "The brief",
        "p": [
          "[Who it was for and what they needed, in two or three sentences.]"
        ],
        "kind": "text"
      },
      {
        "h": "What I built",
        "p": [
          "Touchscreen survey app for Android TV that operated for 8 continuous hours during a live event without internet, syncing queued submissions once reconnected.",
          "[One or two sentences on the hardest part, and how you solved it.]"
        ],
        "fig": "[Kiosk Survey, in use]",
        "kind": "text"
      },
      {
        "h": "How it went",
        "p": [
          "[The result: numbers if you have them, or what people said.]"
        ],
        "kind": "text"
      }
    ]
  },
  {
    "id": "pso",
    "name": "PSO Scorer",
    "type": "Data system",
    "media": "data",
    "depth": "writeup",
    "desc": "Evaluation and scoring model processing 4,000+ national Science Olympiad competitors across elimination tiers.",
    "stack": [
      "Python",
      "pandas",
      "NumPy",
      "Sheets"
    ],
    "links": [],
    "facts": [
      {
        "k": "Client",
        "v": "PSYSC"
      },
      {
        "k": "Role",
        "v": "Science Olympiad Core"
      },
      {
        "k": "Year",
        "v": "2024"
      },
      {
        "k": "Scale",
        "v": "4,000+ competitors"
      }
    ],
    "sections": [
      {
        "h": "The brief",
        "p": [
          "[Who it was for and what they needed, in two or three sentences.]"
        ],
        "kind": "text"
      },
      {
        "h": "What I built",
        "p": [
          "Evaluation and scoring model processing 4,000+ national Science Olympiad competitors across elimination tiers.",
          "[One or two sentences on the hardest part, and how you solved it.]"
        ],
        "fig": "[PSO Scorer, in use]",
        "kind": "text"
      },
      {
        "h": "How it went",
        "p": [
          "[The result: numbers if you have them, or what people said.]"
        ],
        "kind": "text"
      }
    ]
  },
  {
    "id": "qr",
    "name": "QR Studio",
    "type": "Web tool",
    "media": "web",
    "depth": "note",
    "desc": "In-browser QR code builder with gradient styling and SVG export that runs entirely client-side without backend requests.",
    "stack": [
      "TypeScript",
      "Vite",
      "Tailwind"
    ],
    "links": [
      {
        "label": "[qr studio url]",
        "href": "#"
      },
      {
        "label": "[Source]",
        "href": "#"
      }
    ],
    "facts": [
      {
        "k": "Role",
        "v": "[Role]"
      },
      {
        "k": "Year",
        "v": "[Year]"
      },
      {
        "k": "Platform",
        "v": "Web"
      },
      {
        "k": "Runs",
        "v": "Entirely in the browser"
      }
    ]
  },
  {
    "id": "webp",
    "name": "WebP Unli",
    "type": "Web tool",
    "media": "web",
    "depth": "note",
    "desc": "Next.js static export that converts supported images to WebP in a wasm-vips worker. Each queued file stores its own options, and completed results can be downloaded individually or as a ZIP.",
    "stack": [
      "Next.js",
      "TypeScript",
      "wasm-vips"
    ],
    "links": [
      {
        "label": "[webp unli url]",
        "href": "#"
      },
      {
        "label": "[Source]",
        "href": "#"
      }
    ],
    "facts": [
      {
        "k": "Role",
        "v": "[Role]"
      },
      {
        "k": "Year",
        "v": "[Year]"
      },
      {
        "k": "Platform",
        "v": "Web"
      },
      {
        "k": "Runs",
        "v": "Entirely in the browser"
      }
    ]
  },
  {
    "id": "norala",
    "name": "Norala SB Portal",
    "type": "Civic tech",
    "media": "web",
    "depth": "writeup",
    "desc": "Unofficial bilingual legislative-transparency prototype with repository-backed records, derived council links, and explicit safeguards that keep the demo separate from an official LGU service.",
    "stack": [
      "Next.js",
      "TypeScript",
      "Tailwind"
    ],
    "links": [
      {
        "label": "[portal url]",
        "href": "#"
      }
    ],
    "facts": [
      {
        "k": "Role",
        "v": "[Role]"
      },
      {
        "k": "Year",
        "v": "[Year]"
      },
      {
        "k": "Platform",
        "v": "Web"
      },
      {
        "k": "Status",
        "v": "Prototype, unofficial"
      }
    ],
    "sections": [
      {
        "h": "The brief",
        "p": [
          "[Who it was for and what they needed, in two or three sentences.]"
        ],
        "kind": "text"
      },
      {
        "h": "What I built",
        "p": [
          "Unofficial bilingual legislative-transparency prototype with repository-backed records, derived council links, and explicit safeguards that keep the demo separate from an official LGU service.",
          "[One or two sentences on the hardest part, and how you solved it.]"
        ],
        "fig": "[Norala SB Portal, in use]",
        "kind": "text"
      },
      {
        "h": "How it went",
        "p": [
          "[The result: numbers if you have them, or what people said.]"
        ],
        "kind": "text"
      }
    ]
  },
  {
    "id": "cup",
    "name": "MSL Collegiate Cup Bot",
    "type": "Discord bot",
    "media": "discord",
    "depth": "writeup",
    "desc": "Python Discord bot that connects tournament roster data to player verification and match acknowledgements, then keeps live match and support state on disk so those workflows can recover after restarts.",
    "stack": [
      "Python",
      "Sheets"
    ],
    "links": [],
    "facts": [
      {
        "k": "Role",
        "v": "[Role]"
      },
      {
        "k": "Year",
        "v": "[Year]"
      },
      {
        "k": "Platform",
        "v": "Discord"
      },
      {
        "k": "Status",
        "v": "[Status]"
      }
    ],
    "sections": [
      {
        "h": "The brief",
        "p": [
          "[Who it was for and what they needed, in two or three sentences.]"
        ],
        "kind": "text"
      },
      {
        "h": "What I built",
        "p": [
          "Python Discord bot that connects tournament roster data to player verification and match acknowledgements, then keeps live match and support state on disk so those workflows can recover after restarts.",
          "[One or two sentences on the hardest part, and how you solved it.]"
        ],
        "fig": "[MSL Collegiate Cup Bot, in use]",
        "kind": "text"
      },
      {
        "h": "How it went",
        "p": [
          "[The result: numbers if you have them, or what people said.]"
        ],
        "kind": "text"
      }
    ]
  },
  {
    "id": "ilocos",
    "name": "Ilocos Sur Esports Bot",
    "type": "Discord bot",
    "media": "discord",
    "depth": "writeup",
    "desc": "Tournament and community bot for the Ilocos Sur Provincial Government syncing player registrations with Challonge brackets on Hostinger VPS.",
    "stack": [
      "Python",
      "MySQL"
    ],
    "links": [],
    "facts": [
      {
        "k": "Client",
        "v": "Ilocos Sur Provincial Government"
      },
      {
        "k": "Role",
        "v": "[Role]"
      },
      {
        "k": "Year",
        "v": "[Year]"
      },
      {
        "k": "Hosting",
        "v": "Hostinger VPS"
      }
    ],
    "sections": [
      {
        "h": "The brief",
        "p": [
          "[Who it was for and what they needed, in two or three sentences.]"
        ],
        "kind": "text"
      },
      {
        "h": "What I built",
        "p": [
          "Tournament and community bot for the Ilocos Sur Provincial Government syncing player registrations with Challonge brackets on Hostinger VPS.",
          "[One or two sentences on the hardest part, and how you solved it.]"
        ],
        "fig": "[Ilocos Sur Esports Bot, in use]",
        "kind": "text"
      },
      {
        "h": "How it went",
        "p": [
          "[The result: numbers if you have them, or what people said.]"
        ],
        "kind": "text"
      }
    ]
  },
  {
    "id": "oppo",
    "name": "OPPO Cup Bot",
    "type": "Discord bot",
    "media": "discord",
    "depth": "writeup",
    "desc": "Corporate tournament bot for OPPO Philippines managing team verification, roster validation, and automated support workflows on Hostinger VPS.",
    "stack": [
      "Python",
      "MySQL"
    ],
    "links": [],
    "facts": [
      {
        "k": "Client",
        "v": "OPPO Philippines"
      },
      {
        "k": "Role",
        "v": "[Role]"
      },
      {
        "k": "Year",
        "v": "[Year]"
      },
      {
        "k": "Hosting",
        "v": "Hostinger VPS"
      }
    ],
    "sections": [
      {
        "h": "The brief",
        "p": [
          "[Who it was for and what they needed, in two or three sentences.]"
        ],
        "kind": "text"
      },
      {
        "h": "What I built",
        "p": [
          "Corporate tournament bot for OPPO Philippines managing team verification, roster validation, and automated support workflows on Hostinger VPS.",
          "[One or two sentences on the hardest part, and how you solved it.]"
        ],
        "fig": "[OPPO Cup Bot, in use]",
        "kind": "text"
      },
      {
        "h": "How it went",
        "p": [
          "[The result: numbers if you have them, or what people said.]"
        ],
        "kind": "text"
      }
    ]
  },
  {
    "id": "kqm",
    "name": "KQM Team DPS Calculator",
    "type": "Web tool",
    "media": "web",
    "depth": "note",
    "desc": "Theorycrafting calculator for character damage formulas, artifact substat rolls, and weapon scaling.",
    "stack": [
      "JavaScript",
      "Vite"
    ],
    "links": [
      {
        "label": "[calculator url]",
        "href": "#"
      }
    ],
    "facts": [
      {
        "k": "Role",
        "v": "[Role]"
      },
      {
        "k": "Year",
        "v": "[Year]"
      },
      {
        "k": "Platform",
        "v": "Web"
      },
      {
        "k": "For",
        "v": "KQM-standard theorycrafting"
      }
    ]
  },
  {
    "id": "aspire",
    "name": "Microsoft Aspire",
    "type": "Open source",
    "media": "repo",
    "depth": "note",
    "repo": "microsoft/aspire",
    "desc": "Code-first tooling for building, observing, and deploying distributed applications.",
    "stack": [
      "GitHub"
    ],
    "stackText": "microsoft/aspire",
    "links": [
      {
        "label": "github.com/microsoft/aspire",
        "href": "https://github.com/microsoft/aspire"
      }
    ],
    "facts": [
      {
        "k": "Contribution",
        "v": "[your PR or contribution]"
      },
      {
        "k": "Year",
        "v": "[Year]"
      }
    ],
    "sections": [
      {
        "h": "What I contributed",
        "p": [
          "[Your PR or contribution, in a sentence or two, with a link.]"
        ],
        "kind": "text"
      }
    ]
  },
  {
    "id": "opensre",
    "name": "OpenSRE",
    "type": "Open source",
    "media": "repo",
    "depth": "note",
    "repo": "Tracer-Cloud/opensre",
    "desc": "Open-source toolkit for building AI SRE agents for observability, incident response, and remediation.",
    "stack": [
      "GitHub"
    ],
    "stackText": "Tracer-Cloud/opensre",
    "links": [
      {
        "label": "github.com/Tracer-Cloud/opensre",
        "href": "https://github.com/Tracer-Cloud/opensre"
      }
    ],
    "facts": [
      {
        "k": "Contribution",
        "v": "[your PR or contribution]"
      },
      {
        "k": "Year",
        "v": "[Year]"
      }
    ],
    "sections": [
      {
        "h": "What I contributed",
        "p": [
          "[Your PR or contribution, in a sentence or two, with a link.]"
        ],
        "kind": "text"
      }
    ]
  },
  {
    "id": "dockroute",
    "name": "DockRoute",
    "type": "Open source",
    "media": "repo",
    "depth": "note",
    "repo": "Dockroute/Dockroute",
    "desc": "External-DNS for plain Docker hosts, keeping DNS records aligned with container routes.",
    "stack": [
      "GitHub"
    ],
    "stackText": "Dockroute/Dockroute",
    "links": [
      {
        "label": "github.com/Dockroute/Dockroute",
        "href": "https://github.com/Dockroute/Dockroute"
      }
    ],
    "facts": [
      {
        "k": "Contribution",
        "v": "[your PR or contribution]"
      },
      {
        "k": "Year",
        "v": "[Year]"
      }
    ],
    "sections": [
      {
        "h": "What I contributed",
        "p": [
          "[Your PR or contribution, in a sentence or two, with a link.]"
        ],
        "kind": "text"
      }
    ]
  },
  {
    "id": "bettergov",
    "name": "BetterGov PH",
    "type": "Open source",
    "media": "repo",
    "depth": "note",
    "repo": "bettergovph/bettergov",
    "desc": "Open-source effort building a better national website for the Philippines.",
    "stack": [
      "GitHub"
    ],
    "stackText": "bettergovph/bettergov",
    "links": [
      {
        "label": "github.com/bettergovph/bettergov",
        "href": "https://github.com/bettergovph/bettergov"
      }
    ],
    "facts": [
      {
        "k": "Contribution",
        "v": "[your PR or contribution]"
      },
      {
        "k": "Year",
        "v": "[Year]"
      }
    ],
    "sections": [
      {
        "h": "What I contributed",
        "p": [
          "[Your PR or contribution, in a sentence or two, with a link.]"
        ],
        "kind": "text"
      }
    ]
  },
  {
    "id": "w1",
    "name": "[On building Pantas offline-first]",
    "type": "Writing",
    "media": "paper",
    "depth": "writeup",
    "post": true,
    "desc": "[A two-line summary: what the piece is about and who it’s for.]",
    "stack": [],
    "stackText": "",
    "topic": "Pantas · offline-first",
    "mins": "[6] min",
    "date": "[Month DD, YYYY]",
    "links": [],
    "facts": [
      {
        "k": "Published",
        "v": "[Month DD, YYYY]"
      },
      {
        "k": "Reading time",
        "v": "[6] min read"
      },
      {
        "k": "Topic",
        "v": "Pantas · offline-first"
      }
    ],
    "sections": [
      {
        "kind": "text",
        "h": "[First section]",
        "p": [
          "[The opening: the problem in plain words, and why it mattered to you.]",
          "[Body copy. Short paragraphs, real numbers, honest about what isn’t built yet.]"
        ]
      },
      {
        "kind": "text",
        "h": "[Second section]",
        "p": [
          "[Body copy.]"
        ],
        "fig": "[a figure]"
      },
      {
        "kind": "text",
        "h": "[What I’d do differently]",
        "p": [
          "[Body copy.]"
        ]
      }
    ]
  },
  {
    "id": "w2",
    "name": "[What 8 hours without internet taught me]",
    "type": "Writing",
    "media": "paper",
    "depth": "writeup",
    "post": true,
    "desc": "[A two-line summary: what the piece is about and who it’s for.]",
    "stack": [],
    "stackText": "",
    "topic": "Kiosk Survey · events",
    "mins": "[4] min",
    "date": "[Month DD, YYYY]",
    "links": [],
    "facts": [
      {
        "k": "Published",
        "v": "[Month DD, YYYY]"
      },
      {
        "k": "Reading time",
        "v": "[4] min read"
      },
      {
        "k": "Topic",
        "v": "Kiosk Survey · events"
      }
    ],
    "sections": [
      {
        "kind": "text",
        "h": "[First section]",
        "p": [
          "[The opening: the problem in plain words, and why it mattered to you.]",
          "[Body copy. Short paragraphs, real numbers, honest about what isn’t built yet.]"
        ]
      },
      {
        "kind": "text",
        "h": "[Second section]",
        "p": [
          "[Body copy.]"
        ],
        "fig": "[a figure]"
      },
      {
        "kind": "text",
        "h": "[What I’d do differently]",
        "p": [
          "[Body copy.]"
        ]
      }
    ]
  },
  {
    "id": "w3",
    "name": "[Scoring 4,000 Olympiad competitors]",
    "type": "Writing",
    "media": "paper",
    "depth": "writeup",
    "post": true,
    "desc": "[A two-line summary: what the piece is about and who it’s for.]",
    "stack": [],
    "stackText": "",
    "topic": "PSO Scorer · data",
    "mins": "[5] min",
    "date": "[Month DD, YYYY]",
    "links": [],
    "facts": [
      {
        "k": "Published",
        "v": "[Month DD, YYYY]"
      },
      {
        "k": "Reading time",
        "v": "[5] min read"
      },
      {
        "k": "Topic",
        "v": "PSO Scorer · data"
      }
    ],
    "sections": [
      {
        "kind": "text",
        "h": "[First section]",
        "p": [
          "[The opening: the problem in plain words, and why it mattered to you.]",
          "[Body copy. Short paragraphs, real numbers, honest about what isn’t built yet.]"
        ]
      },
      {
        "kind": "text",
        "h": "[Second section]",
        "p": [
          "[Body copy.]"
        ],
        "fig": "[a figure]"
      },
      {
        "kind": "text",
        "h": "[What I’d do differently]",
        "p": [
          "[Body copy.]"
        ]
      }
    ]
  }
];

export const KINDS = ["text","systems","status"];
