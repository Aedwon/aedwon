// Ported verbatim from v3-design/reference/generators/volumes_js.txt (== AboutVolumes.dc.html:155-208)
// including the derived all/spreads pass (volumes_js.txt:36-44, verbatim).
// L = '#EDEDED', D = '#0a0a0c'; ph() is AboutVolumes.dc.html:156.

export interface BookPageDef {
  t?: string;
  kind?: string;
  eyebrow?: string;
  title?: string;
  titleSize?: string;
  body?: string;
  meta?: string;
  slot?: string;
  caption?: string;
  big?: string;
  bigSize?: string;
  org?: string;
  roles?: { title: string; dates: string; desc: string }[];
  toc?: { title: string; page: number; n: string }[];
  vol?: string;
  running?: string;
  folio?: string;
  nextVol?: string;
  nextTitle?: string;
  [k: string]: unknown;
}

export interface Volume {
  n: string;
  title: string;
  tone: string;
  ink: string;
  D: number;
  pages: BookPageDef[];
  all: BookPageDef[];
  spreads: number;
  contact?: boolean;
}

export const VOLUMES: Volume[] = [
  {
    "n": "01",
    "title": "Aerol",
    "tone": "#EDEDED",
    "ink": "#0a0a0c",
    "D": 84,
    "pages": [
      {
        "t": "Hello",
        "kind": "text",
        "eyebrow": "CHAPTER 1",
        "title": "Hi. I’m Aerol.",
        "titleSize": "50px",
        "body": "I design and build apps, bots and websites, mostly for communities, events and people studying for something hard.",
        "meta": "Manila · [open to freelance and full-time work]"
      },
      {
        "t": "A photo",
        "kind": "photo",
        "slot": "[a photo of you]",
        "caption": "[where this was taken]"
      },
      {
        "kind": "text",
        "eyebrow": "CHAPTER 2",
        "title": "High school",
        "titleSize": "44px",
        "body": "[Where you went, and what you were into back then. The first thing you ever built, if you remember it.]",
        "meta": "[School] · [years]"
      },
      {
        "kind": "text",
        "eyebrow": "CHAPTER 3",
        "title": "College",
        "titleSize": "44px",
        "body": "[What you studied, and what you ended up doing outside class: the orgs, the events, the first real projects.]",
        "meta": "[University] · [course] · [years]"
      },
      {
        "t": "Why “Aedwon”",
        "kind": "big",
        "eyebrow": "CHAPTER 4 · ONLINE, I GO BY",
        "big": "Aedwon",
        "bigSize": "86px",
        "body": "Online, that’s me. [Where the name comes from, in two sentences.]"
      }
    ],
    "all": [
      {
        "kind": "contents",
        "vol": "01",
        "title": "Aerol",
        "toc": [
          {
            "title": "Hello",
            "page": 1,
            "n": "01"
          },
          {
            "title": "A photo",
            "page": 2,
            "n": "02"
          },
          {
            "title": "High school",
            "page": 3,
            "n": "03"
          },
          {
            "title": "College",
            "page": 4,
            "n": "04"
          },
          {
            "title": "Why “Aedwon”",
            "page": 5,
            "n": "05"
          }
        ]
      },
      {
        "t": "Hello",
        "kind": "text",
        "eyebrow": "CHAPTER 1",
        "title": "Hi. I’m Aerol.",
        "titleSize": "50px",
        "body": "I design and build apps, bots and websites, mostly for communities, events and people studying for something hard.",
        "meta": "Manila · [open to freelance and full-time work]",
        "vol": "01",
        "running": "Aerol",
        "folio": "01"
      },
      {
        "t": "A photo",
        "kind": "photo",
        "slot": "[a photo of you]",
        "caption": "[where this was taken]",
        "vol": "01",
        "running": "Aerol",
        "folio": "02"
      },
      {
        "kind": "text",
        "eyebrow": "CHAPTER 2",
        "title": "High school",
        "titleSize": "44px",
        "body": "[Where you went, and what you were into back then. The first thing you ever built, if you remember it.]",
        "meta": "[School] · [years]",
        "vol": "01",
        "running": "Aerol",
        "folio": "03"
      },
      {
        "kind": "text",
        "eyebrow": "CHAPTER 3",
        "title": "College",
        "titleSize": "44px",
        "body": "[What you studied, and what you ended up doing outside class: the orgs, the events, the first real projects.]",
        "meta": "[University] · [course] · [years]",
        "vol": "01",
        "running": "Aerol",
        "folio": "04"
      },
      {
        "t": "Why “Aedwon”",
        "kind": "big",
        "eyebrow": "CHAPTER 4 · ONLINE, I GO BY",
        "big": "Aedwon",
        "bigSize": "86px",
        "body": "Online, that’s me. [Where the name comes from, in two sentences.]",
        "vol": "01",
        "running": "Aerol",
        "folio": "05"
      }
    ],
    "spreads": 3
  },
  {
    "n": "02",
    "title": "How I work",
    "tone": "#26262c",
    "ink": "#EDEDED",
    "D": 68,
    "pages": [
      {
        "t": "Research first",
        "kind": "big",
        "eyebrow": "CHAPTER 1 · RESEARCH FIRST",
        "big": "80%",
        "bigSize": "176px",
        "body": "of every project is research and planning, before any code."
      },
      {
        "t": "The optimal choice",
        "kind": "text",
        "eyebrow": "CHAPTER 2 · OPTIMIZE",
        "title": "Is this the most optimal choice?",
        "titleSize": "40px",
        "body": "I obsess over it. Every architecture and every workflow gets the same question before it stays."
      },
      {
        "t": "Daily kit",
        "kind": "list",
        "eyebrow": "CHAPTER 3 · DAILY KIT",
        "title": "What I build with",
        "items": [
          {
            "a": "Claude Code",
            "b": "agentic coding"
          },
          {
            "a": "Codex",
            "b": "agentic coding"
          },
          {
            "a": "using-superpowers",
            "b": "skill framework"
          },
          {
            "a": "Matt Pocock’s skills",
            "b": "engineering"
          },
          {
            "a": "Gemini Deep Research",
            "b": "research"
          }
        ]
      }
    ],
    "all": [
      {
        "kind": "contents",
        "vol": "02",
        "title": "How I work",
        "toc": [
          {
            "title": "Research first",
            "page": 1,
            "n": "01"
          },
          {
            "title": "The optimal choice",
            "page": 2,
            "n": "02"
          },
          {
            "title": "Daily kit",
            "page": 3,
            "n": "03"
          }
        ]
      },
      {
        "t": "Research first",
        "kind": "big",
        "eyebrow": "CHAPTER 1 · RESEARCH FIRST",
        "big": "80%",
        "bigSize": "176px",
        "body": "of every project is research and planning, before any code.",
        "vol": "02",
        "running": "How I work",
        "folio": "01"
      },
      {
        "t": "The optimal choice",
        "kind": "text",
        "eyebrow": "CHAPTER 2 · OPTIMIZE",
        "title": "Is this the most optimal choice?",
        "titleSize": "40px",
        "body": "I obsess over it. Every architecture and every workflow gets the same question before it stays.",
        "vol": "02",
        "running": "How I work",
        "folio": "02"
      },
      {
        "t": "Daily kit",
        "kind": "list",
        "eyebrow": "CHAPTER 3 · DAILY KIT",
        "title": "What I build with",
        "items": [
          {
            "a": "Claude Code",
            "b": "agentic coding"
          },
          {
            "a": "Codex",
            "b": "agentic coding"
          },
          {
            "a": "using-superpowers",
            "b": "skill framework"
          },
          {
            "a": "Matt Pocock’s skills",
            "b": "engineering"
          },
          {
            "a": "Gemini Deep Research",
            "b": "research"
          }
        ],
        "vol": "02",
        "running": "How I work",
        "folio": "03"
      }
    ],
    "spreads": 2
  },
  {
    "n": "03",
    "title": "Guilds",
    "tone": "#15151a",
    "ink": "#EDEDED",
    "D": 76,
    "pages": [
      {
        "kind": "guild",
        "eyebrow": "GAMES & ESPORTS",
        "title": "Games and esports",
        "cols": 2,
        "orgs": [
          "MOONTON",
          "HoYoverse",
          "Dark League Studios",
          "UP Oblation Esports"
        ]
      },
      {
        "kind": "guild",
        "eyebrow": "BRANDS",
        "title": "Brands",
        "cols": 1,
        "orgs": [
          "OPPO Philippines"
        ]
      },
      {
        "kind": "guild",
        "eyebrow": "GOVERNMENT",
        "title": "Government",
        "cols": 1,
        "orgs": [
          "Ilocos Sur Provincial Government"
        ]
      },
      {
        "kind": "guild",
        "eyebrow": "EDUCATION & SCIENCE",
        "title": "Education and science",
        "cols": 1,
        "orgs": [
          "PSYSC",
          "3STUDYANTE"
        ]
      },
      {
        "kind": "guild",
        "eyebrow": "UNIVERSITY",
        "title": "University",
        "cols": 1,
        "orgs": [
          "UP Diliman",
          "UP Fighting Maroons",
          "UP Fair 2024"
        ]
      }
    ],
    "all": [
      {
        "kind": "contents",
        "vol": "03",
        "title": "Guilds",
        "toc": [
          {
            "title": "Games and esports",
            "page": 1,
            "n": "01"
          },
          {
            "title": "Brands",
            "page": 2,
            "n": "02"
          },
          {
            "title": "Government",
            "page": 3,
            "n": "03"
          },
          {
            "title": "Education and science",
            "page": 4,
            "n": "04"
          },
          {
            "title": "University",
            "page": 5,
            "n": "05"
          }
        ]
      },
      {
        "kind": "guild",
        "eyebrow": "GAMES & ESPORTS",
        "title": "Games and esports",
        "cols": 2,
        "orgs": [
          "MOONTON",
          "HoYoverse",
          "Dark League Studios",
          "UP Oblation Esports"
        ],
        "vol": "03",
        "running": "Guilds",
        "folio": "01"
      },
      {
        "kind": "guild",
        "eyebrow": "BRANDS",
        "title": "Brands",
        "cols": 1,
        "orgs": [
          "OPPO Philippines"
        ],
        "vol": "03",
        "running": "Guilds",
        "folio": "02"
      },
      {
        "kind": "guild",
        "eyebrow": "GOVERNMENT",
        "title": "Government",
        "cols": 1,
        "orgs": [
          "Ilocos Sur Provincial Government"
        ],
        "vol": "03",
        "running": "Guilds",
        "folio": "03"
      },
      {
        "kind": "guild",
        "eyebrow": "EDUCATION & SCIENCE",
        "title": "Education and science",
        "cols": 1,
        "orgs": [
          "PSYSC",
          "3STUDYANTE"
        ],
        "vol": "03",
        "running": "Guilds",
        "folio": "04"
      },
      {
        "kind": "guild",
        "eyebrow": "UNIVERSITY",
        "title": "University",
        "cols": 1,
        "orgs": [
          "UP Diliman",
          "UP Fighting Maroons",
          "UP Fair 2024"
        ],
        "vol": "03",
        "running": "Guilds",
        "folio": "05"
      }
    ],
    "spreads": 3
  },
  {
    "n": "04",
    "title": "Training arc",
    "tone": "#202026",
    "ink": "#EDEDED",
    "D": 96,
    "pages": [
      {
        "kind": "org",
        "eyebrow": "TRAINING ARC",
        "org": "PSYSC",
        "roles": [
          {
            "title": "Marketing Associate",
            "dates": "Feb 2024 – Present",
            "desc": "Secured corporate sponsorships generating over ₱800,000 in funding for a national science competition."
          },
          {
            "title": "Regional Head, Region I/II/NCR",
            "dates": "May – Sep 2024",
            "desc": "Directed regional elimination rounds and MathSciAKa workshops, coordinating 30+ volunteers."
          },
          {
            "title": "Science Olympiad Core",
            "dates": "May – Sep 2024",
            "desc": "Co-authored 500+ questions and built the scoring model for 4,000+ competitors."
          }
        ]
      },
      {
        "kind": "org",
        "eyebrow": "TRAINING ARC",
        "org": "MOONTON Games",
        "roles": [
          {
            "title": "[Role]",
            "dates": "[Start] – [End]",
            "desc": "[What you did and what came of it, in a sentence or two.]"
          }
        ]
      },
      {
        "kind": "org",
        "eyebrow": "TRAINING ARC",
        "org": "UP Fighting Maroons",
        "roles": [
          {
            "title": "[Role]",
            "dates": "[Start] – [End]",
            "desc": "[What you did and what came of it, in a sentence or two.]"
          }
        ]
      },
      {
        "kind": "org",
        "eyebrow": "TRAINING ARC",
        "org": "UP Oblation Esports",
        "roles": [
          {
            "title": "[Role]",
            "dates": "[Start] – [End]",
            "desc": "[What you did and what came of it, in a sentence or two.]"
          }
        ]
      },
      {
        "kind": "org",
        "eyebrow": "TRAINING ARC",
        "org": "Dark League Studios",
        "roles": [
          {
            "title": "[Role]",
            "dates": "[Start] – [End]",
            "desc": "[What you did and what came of it, in a sentence or two.]"
          }
        ]
      },
      {
        "kind": "org",
        "eyebrow": "TRAINING ARC",
        "org": "UP Fair 2024",
        "roles": [
          {
            "title": "[Role]",
            "dates": "[Start] – [End]",
            "desc": "[What you did and what came of it, in a sentence or two.]"
          }
        ]
      },
      {
        "kind": "org",
        "eyebrow": "TRAINING ARC",
        "org": "miHoYo (HoYoverse)",
        "roles": [
          {
            "title": "[Role]",
            "dates": "[Start] – [End]",
            "desc": "[What you did and what came of it, in a sentence or two.]"
          }
        ]
      }
    ],
    "all": [
      {
        "kind": "contents",
        "vol": "04",
        "title": "Training arc",
        "toc": [
          {
            "title": "PSYSC",
            "page": 1,
            "n": "01"
          },
          {
            "title": "MOONTON Games",
            "page": 2,
            "n": "02"
          },
          {
            "title": "UP Fighting Maroons",
            "page": 3,
            "n": "03"
          },
          {
            "title": "UP Oblation Esports",
            "page": 4,
            "n": "04"
          },
          {
            "title": "Dark League Studios",
            "page": 5,
            "n": "05"
          },
          {
            "title": "UP Fair 2024",
            "page": 6,
            "n": "06"
          },
          {
            "title": "miHoYo (HoYoverse)",
            "page": 7,
            "n": "07"
          }
        ]
      },
      {
        "kind": "org",
        "eyebrow": "TRAINING ARC",
        "org": "PSYSC",
        "roles": [
          {
            "title": "Marketing Associate",
            "dates": "Feb 2024 – Present",
            "desc": "Secured corporate sponsorships generating over ₱800,000 in funding for a national science competition."
          },
          {
            "title": "Regional Head, Region I/II/NCR",
            "dates": "May – Sep 2024",
            "desc": "Directed regional elimination rounds and MathSciAKa workshops, coordinating 30+ volunteers."
          },
          {
            "title": "Science Olympiad Core",
            "dates": "May – Sep 2024",
            "desc": "Co-authored 500+ questions and built the scoring model for 4,000+ competitors."
          }
        ],
        "vol": "04",
        "running": "Training arc",
        "folio": "01"
      },
      {
        "kind": "org",
        "eyebrow": "TRAINING ARC",
        "org": "MOONTON Games",
        "roles": [
          {
            "title": "[Role]",
            "dates": "[Start] – [End]",
            "desc": "[What you did and what came of it, in a sentence or two.]"
          }
        ],
        "vol": "04",
        "running": "Training arc",
        "folio": "02"
      },
      {
        "kind": "org",
        "eyebrow": "TRAINING ARC",
        "org": "UP Fighting Maroons",
        "roles": [
          {
            "title": "[Role]",
            "dates": "[Start] – [End]",
            "desc": "[What you did and what came of it, in a sentence or two.]"
          }
        ],
        "vol": "04",
        "running": "Training arc",
        "folio": "03"
      },
      {
        "kind": "org",
        "eyebrow": "TRAINING ARC",
        "org": "UP Oblation Esports",
        "roles": [
          {
            "title": "[Role]",
            "dates": "[Start] – [End]",
            "desc": "[What you did and what came of it, in a sentence or two.]"
          }
        ],
        "vol": "04",
        "running": "Training arc",
        "folio": "04"
      },
      {
        "kind": "org",
        "eyebrow": "TRAINING ARC",
        "org": "Dark League Studios",
        "roles": [
          {
            "title": "[Role]",
            "dates": "[Start] – [End]",
            "desc": "[What you did and what came of it, in a sentence or two.]"
          }
        ],
        "vol": "04",
        "running": "Training arc",
        "folio": "05"
      },
      {
        "kind": "org",
        "eyebrow": "TRAINING ARC",
        "org": "UP Fair 2024",
        "roles": [
          {
            "title": "[Role]",
            "dates": "[Start] – [End]",
            "desc": "[What you did and what came of it, in a sentence or two.]"
          }
        ],
        "vol": "04",
        "running": "Training arc",
        "folio": "06"
      },
      {
        "kind": "org",
        "eyebrow": "TRAINING ARC",
        "org": "miHoYo (HoYoverse)",
        "roles": [
          {
            "title": "[Role]",
            "dates": "[Start] – [End]",
            "desc": "[What you did and what came of it, in a sentence or two.]"
          }
        ],
        "vol": "04",
        "running": "Training arc",
        "folio": "07"
      }
    ],
    "spreads": 4
  },
  {
    "n": "05",
    "title": "Off the clock",
    "tone": "#18181d",
    "ink": "#EDEDED",
    "D": 64,
    "pages": [
      {
        "t": "Manhwa",
        "kind": "read",
        "eyebrow": "READING · MANHWA"
      },
      {
        "t": "Manga",
        "kind": "read",
        "eyebrow": "READING · MANGA"
      },
      {
        "t": "Isekai and fantasy anime",
        "kind": "read",
        "eyebrow": "WATCHING · ISEKAI & FANTASY"
      }
    ],
    "all": [
      {
        "kind": "contents",
        "vol": "05",
        "title": "Off the clock",
        "toc": [
          {
            "title": "Manhwa",
            "page": 1,
            "n": "01"
          },
          {
            "title": "Manga",
            "page": 2,
            "n": "02"
          },
          {
            "title": "Isekai and fantasy anime",
            "page": 3,
            "n": "03"
          }
        ]
      },
      {
        "t": "Manhwa",
        "kind": "read",
        "eyebrow": "READING · MANHWA",
        "vol": "05",
        "running": "Off the clock",
        "folio": "01"
      },
      {
        "t": "Manga",
        "kind": "read",
        "eyebrow": "READING · MANGA",
        "vol": "05",
        "running": "Off the clock",
        "folio": "02"
      },
      {
        "t": "Isekai and fantasy anime",
        "kind": "read",
        "eyebrow": "WATCHING · ISEKAI & FANTASY",
        "vol": "05",
        "running": "Off the clock",
        "folio": "03"
      }
    ],
    "spreads": 2
  },
  {
    "n": "06",
    "title": "Next volume",
    "tone": "#EDEDED",
    "ink": "#0a0a0c",
    "D": 56,
    "contact": true,
    "pages": [
      {
        "kind": "titleit"
      },
      {
        "kind": "write"
      },
      {
        "kind": "contact",
        "quickTitle": "Or the quick way"
      }
    ],
    "all": [
      {
        "kind": "titleit",
        "vol": "06",
        "running": "Next volume"
      },
      {
        "kind": "write",
        "vol": "06",
        "running": "Next volume",
        "folio": "01"
      },
      {
        "kind": "contact",
        "quickTitle": "Or the quick way",
        "vol": "06",
        "running": "Next volume",
        "folio": "02"
      },
      {
        "kind": "end",
        "vol": "06",
        "nextVol": "",
        "nextTitle": ""
      }
    ],
    "spreads": 2
  }
];
