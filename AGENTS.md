# Agent Guidelines & Writing Guardrails

## Core Tone & Voice: Human, Grounded, Technical

All website copy, case studies, and documentation in this repository must sound like an authentic engineer/builder writing directly to peers—not an AI marketing assistant.

Reference model: Hiroki Osame ([`docs/tone-reference.md`](file:///Users/aedwon/Documents/Projects/aedwon/docs/tone-reference.md)).

---

## Strict Rules: AI Patterns to Actively Avoid

### 1. Ban the "Rule of Three" (Tricolons & Symmetrical Triplets)
- **Problem:** AI obsessively groups verbs, nouns, and adjectives into sets of three (e.g., *"I build web apps, offline tools, and Discord bots"*, *"fast, reliable, and accessible"*, *"loads instantly, works offline, and respects privacy"*).
- **Rule:** Break the symmetry. Use 1, 2, or 4+ items when describing tasks or features. Vary the cadence naturally. Do not structure bullet lists with exactly 3 parallel items in every section.

### 2. Ban False Parallelism & Predictable Openers
- **Avoid:** *"Whether you are looking for X, need Y, or want to Z..."*
- **Avoid:** *"In today's fast-paced digital world..."*
- **Avoid:** *"I'm Aedwon, a passionate developer dedicated to..."*
- **Instead:** State facts directly. *"I run community tooling for student esports leagues and write web apps in TypeScript."*

### 3. Ban Em-Dash Abuse
- **Problem:** AI relies on `—` in almost every sentence as a dramatic conversational crutch.
- **Rule:** Use regular punctuation (periods, commas, parentheses, colons) instead of peppering em-dashes throughout every paragraph.

### 4. Ban AI Buzzwords & Marketing Fluff
Never use these words or their variants:
- *tapestry, delve, testament, spearhead, leverage, empower, bespoke, curated, meticulous, seamless, robust, vibrant, realm, holistic, foster, elevate, revolutionize, passionate.*

### 5. Sentence Length & Rhythm (Burstiness)
- Mix short, blunt sentences with longer explanatory ones.
- Avoid uniform 15-to-20 word sentences.
- Avoid summarizing every section with a moralizing or inspirational concluding sentence.

### 6. Concrete Numbers & Real Context
- Use Aerol's actual background: UP Diliman BS Computer Science, Moonton Student Leaders (180+ universities, 10k+ member database, 3k+ tournament competitors), miHoYo Discord moderation (100k+ server), UP Fair logistics (90k attendees).
- Let the facts and constraints carry the weight without embellishment.

### 7. Living Copy Reference File
- All active copy, project descriptions, and case study notes must be maintained in [`docs/portfolio-copy.md`](file:///Users/aedwon/Documents/Projects/aedwon/docs/portfolio-copy.md).
- Edit that file directly when refining text rather than dumping walls of copy into conversation.
