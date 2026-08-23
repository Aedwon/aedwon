# Blog writing standard

This file is mandatory reading for any agent that drafts, revises, formats, or publishes a blog post in this repository. It supplements the root `AGENTS.md`. If the two conflict, the stricter rule wins.

The blog is a traditional personal and technical blog. It is not a LinkedIn feed, a marketing newsletter, a content-marketing funnel, or a place for generic thought-leadership copy. Posts should read like Aerol encountered a question, followed it far enough to have something worth saying, and wrote down what he found.

## Voice ownership

The voice belongs to Aerol, not the agent.

Do not invent first-person experiences, opinions, motives, frustrations, failures, timelines, conversations, or lessons. First-person material must come from something Aerol has said, something documented in the repository, or another source he explicitly supplied. If evidence only supports a neutral claim, write it neutrally.

Do not manufacture "human" writing by adding typos, forced awkwardness, fake uncertainty, filler anecdotes, or self-conscious comments about AI. The goal is good prose with natural variation, not simulated imperfection.

All portfolio-wide wording rules in `AGENTS.md` still apply, including the bans on em dashes, unnecessary colons, semicolon-heavy prose, stock AI vocabulary, repetitive contrast formulas, and the phrase "rather than."

## What a blog post should feel like

Prefer an essay that develops an idea over a post that announces a framework.

A post may begin with an observation, a specific thing Aerol saw, a technical problem, a result that did not make sense at first, a question, or a concrete experience. Do not default to a broad thesis paragraph that previews the whole article. Do not open with phrases such as "In today's...", "As technology continues to...", "Here are X lessons...", or other generic hook templates.

Let the argument become clearer as the piece progresses. The writer can discover the larger point partway through the article. A strong internal structure is useful, but it does not need to be exposed as a visible framework.

Do not make every paragraph perform exactly one rhetorical job. Real paragraphs may carry an observation into an example, qualify a thought midway through, or stop without summarizing themselves. Avoid a repeated pattern of thesis, evidence, qualification, takeaway, transition.

Do not over-signpost. Repeated transitions such as "This is where...", "The distinction is...", "The important point is...", and "The lesson here is..." make the prose feel mechanically assembled when used section after section.

Section lengths should be uneven when the material is uneven. Do not pad a short section to match the others. Do not create headings merely to make the page scan like a listicle. Use sentence-case headings and only as many as the article needs.

Single-sentence paragraphs are allowed for emphasis or pacing, but normal explanatory prose should remain in real paragraphs. Short blunt lines should be earned by the surrounding rhythm, not sprinkled throughout to manufacture quotability.

Do not stack slogans, aphorisms, or parallel one-liners. A memorable sentence is useful. A page full of them reads like social-media copy.

## Traditional blog, not social-post formatting

Do not add "Key takeaways," "TL;DR," "What this means for you," "Final thoughts," or similar sections by default.

Do not convert an essay into a numbered list unless the subject is genuinely enumerable. Avoid titles framed as "5 lessons," "7 things," "X mistakes," or "How to X in Y steps" unless Aerol specifically asks for that format and the content actually benefits from it.

Do not use label-heavy mini-sections, card-like prose, fake quotes, emoji bullets, motivational closers, or audience-addressing calls to action as a default blog style.

The ending does not need to restate the thesis. It may return to an image or question from the opening, stop on a remaining uncertainty, or end when the useful thought is finished. Do not append an extra summary paragraph after a strong ending.

## Research and references

References are appropriate when a post makes factual claims that a reader could reasonably want to verify. They should support the essay, not turn it into a report.

Prefer primary sources. Good examples include original research papers, official documentation, first-person postmortems, source repositories, and the author's own published data. Secondary reporting is acceptable when it is the best available source or when the post is specifically discussing that reporting.

Verify numbers, dates, study findings, quotations, and causal claims before publication. Do not include a citation merely because it appears plausible. Do not invent publication details or reconstruct a source from memory.

Use the blog's numbered citation system for factual claims that need support. Keep the prose readable and place the full entries in the `sources` block at the end under "Sources and further reading." A citation should point to the source that actually supports the nearby claim.

A first-person Reddit or forum postmortem can be a primary source for what that developer reports about their own project. Treat broader conclusions drawn from it as anecdotal unless stronger evidence exists.

Avoid citation dumping. One strong source is better than several weak sources saying nearly the same thing.

## Quotations and pull quotes

Only present words in quotation marks as another person's quote when the wording has been verified against the source. If the wording is a paraphrase, write it as a paraphrase.

The `pullquote` blog block is primarily a visual emphasis device for a line from Aerol's own essay. It is not a substitute for sourcing someone else's quotation. An external quotation needs clear attribution in the prose and a source entry.

Do not turn every strong sentence into a pull quote. Use them sparingly enough that they still change the reading rhythm.

## Evidence versus interpretation

Keep the line between evidence and interpretation visible.

If a game sold poorly while receiving strong reviews, that supports a claim about the mismatch between satisfaction among buyers and market size only to the extent the available evidence warrants. Do not quietly upgrade an anecdote into a universal law.

Qualify uncertainty where it actually exists. "I think," "seems," and "probably" are useful when they reflect real uncertainty. Do not add them mechanically to make the writing sound modest.

Counterarguments should appear when they genuinely pressure-test the thesis. Do not manufacture a perfectly symmetrical opposing view just so the article can resolve it in the next paragraph.

## Editing standard

The best revision is often subtraction.

On the final voice pass, look specifically for repeated transition phrases, repeated sentence shapes, tidy tricolons, sections that all have the same length, unnecessary research summaries, duplicated examples, catalogue-like technical detail, and paragraphs that end by explaining the lesson the reader already understood.

Preserve useful rough edges in thought. Do not sand every transition into a perfect bridge. Do not make every paragraph conclude cleanly. Natural prose can leave some connective work to the reader.

Do not deliberately lower grammatical quality. Correct factual errors, unclear syntax, accidental repetition, and distracting mistakes.

## Repository implementation

Blog data currently lives in `lib/data/blogs.ts`. The renderer supports `paragraph`, `heading`, `pullquote`, and `sources` blocks. Keep formatting semantic. Use a heading because the subject changes, a pull quote because a line deserves visual emphasis, and a sources block because the article has references.

Full article URLs use descriptive canonical slugs under `/blogs/<slug>`. Shareable short links use the `/b/<short-keyword>` redirect convention. The short key should be memorable, stable, lowercase, and meaningful instead of an opaque ID.

Tags may remain as internal post metadata, but they are not part of the visible blog presentation unless Aerol explicitly asks to expose them again.

For blog-only copy or documentation changes, do not spend GitHub Actions minutes by default. Use `[skip ci]` where the repository's workflow permits it. If a change touches rendering or TypeScript, validate with the lightest appropriate local or deployment check before considering Actions.

## Before publishing

An agent publishing or materially revising a blog must check that the piece is factually grounded, that every external quote is verified, that citations resolve to the claims they support, that first-person statements belong to Aerol's actual experience, and that the prose follows both this file and `AGENTS.md`.

The current published posts can be used as context for the site's level of detail and formatting. Do not copy their section structure, cadence, rhetorical devices, or number of references by default. Each post should take the shape its subject needs.
