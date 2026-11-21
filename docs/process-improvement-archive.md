# Process improvement archive

The incident history behind the rules and steps in [`docs/process-improvement.md`](process-improvement.md). Newest first.

## Entries

### Dropdown parts on the workflow page (Nov 21)

- **His words.** "the way these dropdowns appear is badly designed"
- **What was wrong.** A part's detail opened far from the box he clicked, under an unrelated row of boxes. The boxes looked like form dropdowns and only some of them were clickable. Opening one pushed the whole page down.
- **Why it got through.** The lead's brief left the disclosure pattern to the builder. The design check measures a page at rest, so it cannot see where a panel opens.
- **The fix.** Required step 1 now says the lead decides how detail is revealed and states it in the brief. The page was rebuilt as a reading layout: every part is a normal section, only long prompts collapse, and the pictures link to the sections.

### Process machinery outgrew the task (Nov 21)

- **His words.** "perhaps, in the endeavor of making things good here, we are committing an anti-pattern ourselves?"
- **What was wrong.** In one day the project gained eight required steps, seven written rules, a 33-rule linter, a standards library and a spec check. It still had no page to show for it.
- **Why it got through.** The global rule let checks and steps be added without his approval, and nothing capped the number of steps.
- **The fix.** Two outside reviews (Codex and Gemini) audited the machinery and he accepted their cuts. This change cuts the linter to a few errors, shortens the principles file, and replaces the eight steps with four. The global rule now caps a project at 12 rules and steps together. New tooling needs his approval.

### The map sample looked like average AI output (Nov 21)

- **His words.** "the current design regressed to an average and what others would call AI slop". Then "did you use principles of design, web design, animations, apple HIG, and other good references for design? i don't think so. it's not apparent here. did you use progressive disclosure? on some surface sure, but it seems inconsistent." Then "in hindsight, this is also a process in itself where I ask you to approach it using industry-proven standards, principles, patterns, setting checks for anti-patterns and whatnot". He also asked the agent to study his other projects for what he prefers, "in terms of border choice, principles, fundamentals".
- **What was wrong.** The sample had no stated design principles behind it. Its brief listed things he bans and asked for "award-level craft", which names no standard. The builder fell back on the common dark dashboard look. Progressive disclosure appeared in the part panels and nowhere else.
- **Why the process let it through.** Rules 1 to 6 say what to avoid and how to deliver. None says which principles a design must follow, and no step read his own projects for his taste. Nothing measured a sample before he saw it. This is the third visual rejection in this file, so the fix moves up to a check.
- **The fix.** A check, in two parts, with a required step. `docs/design-principles.md` records the principles a design here must follow, drawn from his own projects and from named sources (Apple's Human Interface Guidelines and others), each with the anti-pattern it rules out. `scripts/design-check/` checks a built page for the anti-patterns that can be measured. Run `node scripts/design-check/cli.mjs <file-or-url>`. It failed on sample D before it was trusted, and the report is in `docs/design-check-sample-d.md`. Required step 8 applies until the check runs on every sample without being asked.

### Motion sample drew wrong connections and carried an unapproved look (Nov 21)

- **His words.** "i saw the structure. it works i guess, but the UI/UX really needs a lot of work. there's a lot of things there that I hate that was implemented. i don't like the colors either and other design decisions". On the task row, "shouldn't this whole row be another separate page or something?" Then "audits are optional, and they happen through the lead i talk to, idk why the connections are like that. it's just not intuitive and things don't make sense".
- **What was wrong.** The sample drew the outside audit as a required step on the task path, fed by a line from Codex. In his setup an audit is optional and the lead calls it. The sample also put the company chart and the order of a task into one picture, which made the row of task steps hard to read. Its colors and other design choices came from the earlier sample B, which he had only called a direction that "makes a lot of sense".
- **Why the process let it through.** The agent wrote the map's composition into the builder's brief from its own reading of the rule files. Required step 4 traced the order of a task, but nothing checked who calls whom. The agent also never asked which parts of sample B he disliked before building on its look.
- **The fix.** Required steps 6 and 7 above.

### Recommended a mix of motions without showing it (Nov 21)

- **His words.** "show me your recommendation. how many times is this, you recommend a mix but never actually show me"
- **What was wrong.** The agent showed four clips of other sites, then recommended combining three of their motion ideas on his page, and asked which clips felt right. The combination itself existed only as a sentence. He had already said "show me" earlier the same day, about the page layout.
- **Why the process let it through.** Rule 1 says to start from references and then build one live page, but nothing said a recommendation needs its own demo. The agent treated the references as the demo. This repeats the first entry in this file, so the fix moves up from a written rule to a required step.
- **The fix.** Required step 5 above.

### Workflow copy left out brainstorming and ordered parts by category (Nov 21)

- **His words.** "hmm i noticed there's no brainstorming step? the part where I make sure the intent i have lands, and that the model i talk to and I are on the same page." Then "also shouldn't audit be further down? we should present this info with how things actually flow".
- **What was wrong.** The page copy had no brainstorming step, although every piece of his work starts with one. It also grouped parts by kind (rulebook, staff, gates), so the outside audit sat before the scope choice and the spec.
- **Why the process let it through.** The agent built the list of parts from his rule files. Brainstorming comes from a plugin, so no rule file named it and the list missed it. The grouping came from an earlier content map, and nobody checked it against the order of a real task.
- **The fix.** Required step 4 above.

### The short rewrite dropped the company frame (Nov 21)

- **His words.** "also sorry please add the things I asked you to add at the beginning, for ex. there's no mention that i run my orchestration like i'd run a company, or some other fundamental things with how I treat work"
- **What was wrong.** Earlier in the session he said he writes to agents as if they were people in his own company, and the agent accepted that as the idea that organizes the page. The shortened copy kept the part names (company policy, org chart) but never stated the idea. It also left out the tools he works in, which he asked for in his first message.
- **Why the process let it through.** The approved decisions lived only in the chat. The rewrite was checked against a word budget and nothing else, so cutting for length removed an approved decision without anyone noticing.
- **The fix.** Required step 3 above. The workflow page's decisions go into its spec, which is the file that step reads.

### Workflow page copy was too wordy (Nov 21)

- **His words.** "i read it, some things are unnecessary. the content is too wordy. i am approaching this as someone who will view this site, i just want a short explanation of what i do and why i do it and why the copy-able prompt is like that (and what its impact is)"
- **What was wrong.** The draft copy for the workflow page ran to sixteen parts, with up to five quotes each, tables of habits, a 21-row timeline, and builder notes mixed into the page text. It read as an archive of evidence. A visitor wants four things per part, which are what he does, why, why the prompt is written that way, and its impact.
- **Why the process let it through.** Rule 4 already said to use as little text as possible, but it set no number, so nothing could be counted. The agent wrote for a reviewer checking evidence, not for a visitor. This is a repeat of the failure behind rule 4, so the fix moves up from a written rule to a required step.
- **The fix.** Required step 1 above. A check replaces it once the copy lives in a content file.
- **His words after the rewrite.** "i think my issue was the structure of how info was presented." Length was the symptom. The first draft never asked what a part should hold, so each part grew a line, quotes, a prompt, a caution and notes. Required step 2 covers that cause. He also asked to drop the labels in front of each line ("What I do." through "What it changed.") and keep only the lines.

### A grey layout sketch shown as the workflow page's overall visual (Nov 21)

- **His words.** "this doesn't impress me the slightest". Then, when the agent began collecting references, "spin up some sonnet 5.5 subagents and have it create samples in claude design. sigh".
- **What was wrong.** He asked what the overall visual of the workflow page would be. The agent showed two static sketches made of rows and boxes, with no motion and no real design.
- **Why the process let it through.** The rule against static mockups lived only in agent memory. The agent read it after the first sketch was already shown, and treated a layout sketch as exempt from it. No project file stated the rule, so nothing forced the read at the start of the session.
- **The fix.** A required step and written rules, since no check can judge whether a design impresses. The design rules moved from agent memory into the active written rules above (rules 1 to 6). Before showing any visual for a look-and-feel decision, the agent reads those rules and views the render. `AGENTS.md` and `CLAUDE.md` now point every agent to this file.
