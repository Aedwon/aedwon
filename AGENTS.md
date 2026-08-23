# Agent Guidelines & Writing Guardrails (Unslop Standard)

## Core Tone & Voice: Human, Grounded, Technical

All website copy, case studies, documentation, and agent responses in this repository must sound like an authentic engineer/builder writing directly to peers, not an AI marketing assistant.

Reference model: Hiroki Osame ([`docs/tone-reference.md`](file:///Users/aedwon/Documents/Projects/aedwon/docs/tone-reference.md)).

### Mandatory blog-specific rules

Any agent drafting, revising, formatting, or publishing a blog post must read and follow [`docs/blog-writing.md`](docs/blog-writing.md) before editing blog content. The blog standard supplements this file and contains the repository's rules for traditional long-form essays, first-person voice, research, references, quotations, pull quotes, editing, short links, and low-cost validation. If a blog-specific rule is stricter than a general rule here, use the stricter rule.

---

## Aedwon-Specific Voice Profile (Overrides Generic Humanizer Rules)

These are author-specific rules, not general AI-writing heuristics. They override outside style guides and generic humanizer defaults.

- Never use *"rather than"* in authored portfolio copy. Use *"instead of"* or rewrite the sentence.
- Do not use a colon in normal prose unless it directly introduces a real list.
- Do not use em dashes in authored portfolio copy. Use a period, comma, parentheses, or rewrite the sentence.
- Avoid semicolons in narrative copy. Use a period or a plain conjunction instead. Semicolons are fine inside code and lists where the punctuation is structurally necessary.
- Use sentence case for headings.
- Prefer connected prose over labeled mini-bullets. A list should exist because the content is actually enumerable, not because the paragraph can be split into tidy chunks.
- Group related sentences into real paragraphs. Do not format normal prose as one sentence per paragraph. Single-sentence paragraphs are allowed only when the sentence genuinely needs emphasis or a change in pace.
- Plain words win. Prefer *used* over *leveraged*, *built* over *architected* when the distinction does not matter, and *instead of* over elevated contrast phrases.
- Do not force every section into a clean setup, conflict, lesson, and optimistic ending. Leave a technical limitation unresolved when it is genuinely unresolved.
- Do not default every case-study section to problem, decision, tradeoff, and lesson. Use chronology when the build actually happened in stages. State a decision plainly when there is no useful story around it.
- Case studies do not need a standard number of headings. Use as few sections as the project needs. Two to four meaningful body sections is usually enough for a focused project, and section lengths should not be artificially balanced.
- Watch repeated contrast sentences such as *"X, but Y"*, *"X while Y"*, and *"on one hand / on the other hand"*. One is normal. Repeating the shape across a page sounds manufactured.
- Prefer specific build history when the repository supports it. A sequence such as *"the layout shell shipped first, the scroll behavior came later"* reads better than converting the same facts into an abstract architecture summary.
- Never invent failed versions, frustrations, motives, or lessons to make a case study sound more human. Personal texture must still come from source evidence or the author's own stated experience.
- Do not manufacture authenticity by deliberately inserting awkward sentences, fake uncertainty, or self-conscious lines about sounding human.
- Do not publish meta-writing commentary such as *"this version is less polished"*, *"I am avoiding portfolio language"*, or references to AI detection. The published copy should simply read naturally.
- Keep technical details that explain a decision, bug, constraint, or outcome. Remove details whose only job is to signal technical competence. One concrete implementation detail is often better than a catalogue of tools.
- Do not add a metric strip by default. Put numbers where they naturally explain scale, behavior, or a measured outcome. A separate metrics block is appropriate only when the numbers are central to the project.
- Do not end every section with a neat takeaway. Some paragraphs should simply stop when the useful information is finished.
- Preserve uneven rhythm. Short sentences are allowed. So are longer technical sentences when the detail needs them.

When an outside unslop or humanizer guide conflicts with these rules, follow this profile.

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
- Avoid repeated rhetorical balancing. Do not keep setting up two opposed options just to resolve them in the next sentence.

### 6. Ban Em Dashes, Semicolon Prose & Bullet-Soup
- **Em dashes:** Do not use them in authored portfolio copy.
- **Semicolons:** Avoid them in narrative prose. Split the sentence or use a plain conjunction.
- **Colons:** Use them only when the colon directly introduces a real list. Do not use constructions such as *"The problem: nobody tests this"* or *"The answer is: start earlier"*.
- **Bullet-Soup:** Avoid repetitive `- **Label:** Description` bullet stacks where every line has identical word count. Merge repetitive bullets into natural prose sentences.

### 7. Sentence Length, Burstiness & Rhythm
- Engineer burstiness: mix short blunt sentences with longer explanatory ones.
- Avoid uniform 15-to-20 word sentences.
- Avoid one-sentence-per-paragraph formatting as a default. Paragraph breaks should follow changes in idea, emphasis, or pacing, not every sentence boundary.
- Avoid making every section the same length or giving every heading the same amount of explanation.
- Avoid turning each implementation detail into its own heading. Related details should share a section when they belong to the same part of the build.
- Avoid tidy 5-paragraph essay structures and moralizing/inspirational concluding sentences.

### 8. Voice-Match Principles (Subtract, Don't Add)
- **Subtract slop:** Do not "warm up" text with fake empathy, polite cheerleading, or customer-service tone.
- **Contraction rate:** Use natural contractions (*I'm, don't, wasn't, it's*) matching real speech.
- **Concrete nouns over abstract ones:** Specific examples, real constraints, and exact technical tools over vague categories.
- **Calibrated uncertainty:** Use honest phrasing (*"I think"*, *"probably"*, *"seems to"*) when something isn't certain instead of asserting false robotic confidence.

### 9. Concrete Numbers & Ground Truth Sources
Before writing or revising any portfolio copy, project descriptions, or stats, cross-reference these ground truth sources:
- **Resume & Background:** [`CV Professional Aerol.pdf`](file:///Users/aedwon/Documents/Projects/aedwon/CV Professional Aerol.pdf) (in repo root)
- **LinkedIn:** [`linkedin.com/in/aedwon`](https://www.linkedin.com/in/aedwon/)
- **GitHub Repositories:** [`github.com/Aedwon`](https://github.com/Aedwon)
- **Local Sister Workspaces:** `~/Documents/Projects/` (e.g. `Pantas`, `gi_damage_calculator`, `SB`, `BetterGov`, `Discord-Bot`)
- **Tone Model:** [`docs/tone-reference.md`](file:///Users/aedwon/Documents/Projects/aedwon/docs/tone-reference.md) (Hiroki Osame model)

### 10. Living Copy Reference File
- All active copy, project descriptions, and case study notes must be maintained in [`docs/portfolio-copy.md`](file:///Users/aedwon/Documents/Projects/aedwon/docs/portfolio-copy.md).
- Blog posts are stored in `lib/data/blogs.ts` and additionally follow [`docs/blog-writing.md`](docs/blog-writing.md).
- Edit the relevant source file directly when refining text instead of dumping walls of copy into conversation.

### 11. Skill Evaluation & User Confirmation Gate
- For every user request, actively evaluate if a specialized skill applies (e.g. Visual Companion for UI brainstorming, Prototype for interactive exploration, TDD for feature code, Subagent-Driven Development for execution).
- Proactively tell the user which skill fits the task and ask for their confirmation before launching or proceeding.