# Process improvement

This file holds this project's entries and active written rules under the global process-improvement process. Every agent reads the active written rules at the start of a session. When Aedwon rejects or corrects work, the entry goes here in the same turn, before anything else continues.

## Active written rules

At most 15. A rule retires when a check enforces it. If adding one would pass 15, retire or merge one first.

1. Never answer a look-and-feel question with a static mockup, a wireframe, or a page of placeholder boxes. Start with real reference sites shown as screenshots. Then build one live page with real images and motion. A plain structure sketch is fine only when he asks for an illustration of structure or content, and the reply must say it is not the design. His words (Nov 17) were "they all look like basic websites" and "if these are the choices I might as well drop the project". No check can judge whether a direction impresses. That is his call.
2. View the rendered result before showing it, and run critique-and-fix rounds first. Do not show a first pass and ask for approval. His words (Nov 17) were "you can hillclimb a lot of things... lots more principles, adjustments and refinements to make this awwwards-worthy". No check can judge when a design is refined enough.
3. No eyebrow labels and no eyebrow pills above headings. His words (Nov 17) were "i dont like eyebrows" and "i don't like eyebrow pills". No check exists yet. A lint for small label elements placed directly above a heading could retire this rule.
4. Use as little text as possible. Each fact appears once on a page. No explanatory paragraphs under headings and no helper captions. His words (Nov 17) were "i hate hate hate wordy websites. no redundancies, no unnecessary text or info." No check can tell a needed sentence from filler.
5. Deliver designs in Claude Design, not as loose HTML files. Refine in local HTML first, where a render can be viewed, then move the result to the canvas. His words (Nov 17) were "I would prefer things to be in Claude Design, not in html". No check can tell where a design was delivered.
6. Avoid overused fonts such as Geist, Inter and Instrument Serif. His words (Nov 17) were "others will spot the overused fonts". A font-name check on design files could retire this rule.

## Entries

### A grey layout sketch shown as the workflow page's overall visual (Nov 21)

- **His words.** "this doesn't impress me the slightest". Then, when the agent began collecting references, "spin up some sonnet 5.5 subagents and have it create samples in claude design. sigh".
- **What was wrong.** He asked what the overall visual of the workflow page would be. The agent showed two static sketches made of rows and boxes, with no motion and no real design.
- **Why the process let it through.** The rule against static mockups lived only in agent memory. The agent read it after the first sketch was already shown, and treated a layout sketch as exempt from it. No project file stated the rule, so nothing forced the read at the start of the session.
- **The fix.** A required step and written rules, since no check can judge whether a design impresses. The design rules moved from agent memory into the active written rules above (rules 1 to 6). Before showing any visual for a look-and-feel decision, the agent reads those rules and views the render. `AGENTS.md` and `CLAUDE.md` now point every agent to this file.
