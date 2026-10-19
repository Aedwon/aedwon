# Agent Guidelines & Writing Guardrails (Unslop Standard)

## Core Tone & Voice: Human, Grounded, Technical

All website copy, case studies, documentation, and agent responses in this repository must sound like an authentic engineer/builder writing directly to peers—not an AI marketing assistant.

Reference model: Hiroki Osame ([`docs/tone-reference.md`](file:///Users/aedwon/Documents/Projects/aedwon/docs/tone-reference.md)).

---

## Strict Rules: AI Patterns to Actively Avoid

### 1. Ban Sycophancy & Affirmation Fillers
- **Never use:** *"Great question!"*, *"Certainly!"*, *"I'd be happy to help"*, *"Absolutely!"*, *"That's a fantastic idea!"*, *"Sure!"*
- Start directly with the answer or action.

### 2. Ban the "Rule of Three" (Tricolons & Symmetrical Triplets)
- **Problem:** AI obsessively groups verbs, nouns, adjectives, or bullet points into sets of three (e.g., *"web apps, offline tools, and bots"*, *"fast, reliable, and accessible"*, *"loads instantly, works offline, and respects privacy"*).
- **Rule:** Break symmetry. Use 1, 2, or 4+ items. Vary cadence. Never stack 3-item lists in consecutive sections.

### 3. Ban Hedging Stacks & Softener Residue
- **Never use:** *"It's important to note that"*, *"It's worth mentioning"*, *"Generally speaking"*, *"In essence"*, *"At its core"*, *"It should be noted that"*, *"Furthermore"*, *"Moreover"*.
- State claims directly without preamble.

### 4. Ban AI Stock Vocabulary & Buzzwords
Never use these words or their variants:
- *delve, tapestry, testament, navigate (figurative), embark, journey (figurative), pivotal, paramount, nuanced (as filler), robust (as filler), seamless, leverage (when "use" works), holistic, comprehensive (when "complete" works), realm, landscape (figurative), cutting-edge, state-of-the-art, spearhead, empower, bespoke, curated, meticulous, vibrant, foster, elevate, revolutionize, passionate.*

### 5. Ban Performative Balance & Symmetrical Formulas
- Avoid following every statement with an automatic *"However..."*, *"On the other hand..."*, or *"That being said..."*.
- Avoid formulaic openers: *"Whether you are looking for X, need Y, or want to Z..."*, *"In today's fast-paced digital world..."*.

### 6. Ban Em-Dash Abuse & Bullet-Soup
- **Em-dashes:** Hard cap of at most 1–2 per document. Use periods, commas, colons, or parentheses instead.
- **Bullet-Soup:** Avoid repetitive `- **Label:** Description` bullet stacks where every line has identical word count. Merge repetitive bullets into natural prose sentences.

### 7. Sentence Length, Burstiness & Rhythm
- Engineer burstiness: mix short blunt sentences with longer explanatory ones.
- Avoid uniform 15-to-20 word sentences.
- Avoid tidy 5-paragraph essay structures and moralizing/inspirational concluding sentences.

### 8. Voice-Match Principles (Subtract, Don't Add)
- **Subtract slop:** Do not "warm up" text with fake empathy, polite cheerleading, or customer-service tone.
- **Contraction rate:** Use natural contractions (*I'm, don't, wasn't, it's*) matching real speech.
- **Concrete nouns over abstract ones:** Specific examples, real constraints, and exact technical tools over vague categories.
- **Calibrated uncertainty:** Use honest phrasing (*"I think"*, *"probably"*, *"seems to"*) when something isn't certain rather than asserting false robotic confidence.

### 9. Concrete Numbers & Ground Truth Sources
Before writing or revising any portfolio copy, project descriptions, or stats, cross-reference these ground truth sources:
- **Resume & Background:** [`CV Professional Aerol.pdf`](file:///Users/aedwon/Documents/Projects/aedwon/CV Professional Aerol.pdf) (in repo root)
- **LinkedIn:** [`linkedin.com/in/aedwon`](https://www.linkedin.com/in/aedwon/)
- **GitHub Repositories:** [`github.com/Aedwon`](https://github.com/Aedwon)
- **Local Sister Workspaces:** `~/Documents/Projects/` (e.g. `Pantas`, `gi_damage_calculator`, `SB`, `BetterGov`, `Discord-Bot`)
- **Tone Model:** [`docs/tone-reference.md`](file:///Users/aedwon/Documents/Projects/aedwon/docs/tone-reference.md) (Hiroki Osame model)

### 10. Living Copy Reference File
- All active copy, project descriptions, and case study notes must be maintained in [`docs/portfolio-copy.md`](file:///Users/aedwon/Documents/Projects/aedwon/docs/portfolio-copy.md).
- Edit that file directly when refining text rather than dumping walls of copy into conversation.

### 11. Skill Evaluation & User Confirmation Gate
- For every user request, actively evaluate if a specialized skill applies (e.g. Visual Companion for UI brainstorming, Prototype for interactive exploration, TDD for feature code, Subagent-Driven Development for execution).
- Proactively tell the user which skill fits the task and ask for their confirmation before launching or proceeding.

## Project Content and the Local Studio

- Project content lives in `content/projects/<id>.json` (one file per project). `lib/design-v3/data/projects.ts` only holds the types and loads those files. Do not move copy back into TypeScript.
- The user edits projects on the page through the local studio (localhost dev only). See [`docs/studio.md`](docs/studio.md) for use, file format, safety rules and limits.
- The private pricing tool keeps its data in a separate private repo (`../aedwon-pricing`). Never commit rates, hours from settings, or client data to this public repo. See [`docs/pricing.md`](docs/pricing.md).
- `Room.tsx` and `Mobile.tsx` must export only their default component. Otherwise every content save reloads the whole page in dev.

## Delegate Bulk Work to a Haiku Subagent

- Run test suites, lint/typecheck runs, mechanical edits, and broad codebase crawling through a Haiku 5.5 subagent (`model: "haiku"`). Do not do them in the main thread.
- Tell the subagent to return a short summary: pass/fail, the exact failing assertions or errors, and file paths touched. Do not pull raw logs or file dumps into the main context.
- Keep in the main thread: design decisions, debugging reasoning, review of the subagent's result, and any single-file read or one-line edit where spawning costs more than doing it.
- If a failure needs full output to diagnose, ask the subagent for that specific output.
- The user approved this standing delegation, so no per-task confirmation is needed to spawn these subagents.
- Escalate when the task needs higher reasoning: if Haiku's result is unclear, contradictory, or the task turns out to need judgment (subtle debugging, design, security), take it over in the main thread or use a stronger model. Do not accept a weak result to save usage.
