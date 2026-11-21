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

## Required steps

Run these before showing the work they name. Each came from an entry below.

1. **Page copy gets a word budget and a count.** Before showing copy for any page, state a budget for the words a visitor reads, count the draft against it, and report both numbers. Count only what the visitor reads. Leave out copyable prompts, quoted exhibits and notes for the builder. Keep builder notes and evidence out of the copy itself. Use at most one quote per part. Work examples may carry more, since he asked for his exact quotes there. The default budget is 60 words per part. When the copy moves into a content file in this repo, a check must enforce the budget, and this step and rule 4 can then retire.
2. **Agree the structure of one part before writing them all.** Before drafting copy for a page with repeated parts, show one part in full and get his answer on its structure, meaning which lines it holds and in what order. Write the rest only after that.
3. **Check a revision against what he already approved.** Before showing a new or shortened draft, list the decisions he approved earlier for that work and confirm the draft still carries each one. Name any it drops and why. For work that spans a session, keep those decisions in a file, not only in the chat.
4. **Trace one real task before describing how he works.** Walk one real task from his first message to his sign-off and list each step in the order it happened. The description must carry every step, in that order. Steps that come from a plugin or a habit count, even when no rule file states them.
5. **A recommendation about look or motion ships with a working demo.** Never recommend a visual, layout or motion idea in words alone, and never ask him to pick from a description. Build the recommendation as a live sample first, view it, then show it with the recommendation. If the sample is not ready, say it is being built and ask nothing until it is. References from other sites support the sample. They do not replace it.
6. **Confirm the connections in words before drawing them.** Before drawing any diagram of how he works, write each connection as one sentence that says who calls whom, when, and whether it is optional. Get his yes on that list. Keep two kinds of picture apart. One shows who works for whom. The other shows what happens to a task in order.
7. **Get his dislikes before the next visual pass.** When he says he dislikes a design, collect the specific things he dislikes before building again. A sample that carries over a look he has not approved must say so when it is shown.

## Entries

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
