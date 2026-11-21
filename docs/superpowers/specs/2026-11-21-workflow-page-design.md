# Workflow page

Date: 2026-11-21
Status: draft. The motion and interface are not chosen yet. Aedwon reviews this once, after that choice.

## Part 1. For Aedwon's approval

### Purpose

A page at `workflow.aedwon.site` that shows friends, technical or not, how Aedwon works with AI agents. A friend who finds a part useful can copy its prompt and paste it into their own tool. It covers every project and every model vendor he uses.

### Decisions

Each decision carries one of his three labels.

| Topic | Decision | Label |
| --- | --- | --- |
| Address | `workflow.aedwon.site`, served from this repo and its Vercel project. | Locked by Aedwon |
| Complexity | Balanced. | Locked by Aedwon |
| Who can find it | Unlisted. No link from the portfolio, no sitemap entry, and search engines are told not to index it. | Locked by Aedwon |
| Where the text lives | In this public repo. He accepts that the text, his rules and his quotes are readable on GitHub. | Locked by Aedwon |
| The words | The "Page copy" tab of the Claude doc "Workflow page copy", as he approved it on 2026-11-21. The build copies it word for word. Nobody rewrites it. | Locked by Aedwon |
| Shape of a part | A short statement of what he does, his reason in his own voice, then the prompt. No labels in front of the lines. No lines after the prompt. | Locked by Aedwon |
| Order | Setup first, then one task in the order work happens. Work examples come last. | Locked by Aedwon |
| Prompts | His real rules, word for word, with private lines removed. | Locked by Aedwon |
| Quotes | His exact words, with his casing and typos. Calm and blunt both appear. | Locked by Aedwon |
| Private names | The long-running product is "a study app". The bot project is "a Discord bot". No emails, account names, prices, client names or personal matters. | Locked by Aedwon |
| Interface direction | The living map from design sample B. Its motion and interface get redesigned. | Locked by Aedwon |
| Copy for my agent | One button copies every prompt at once. The same text is served as plain text for an agent to read. | Locked by Aedwon |
| Snapshot | The page shows the date of its last update. It is refreshed on the 15th and the last day of each month, through a pull request he approves. | Locked by Aedwon |
| Account failover | Left off the page. Few friends run three accounts. | Decided on delegation |
| Commit hashes and branch names in the "before" reply | Replace them with neutral stand-ins, because the repo is public. | Open, recommended |
| Motion and interface | Chosen from real references, then one live sample in Claude Design. The approved sample is the reference the build must match exactly. | Open |

### What a visitor sees, in order

1. The title, one line ("My rules and workflow change often.") and the snapshot date.
2. Mindset and Treatment, which state how he runs the work like a company.
3. Setup parts: Company policy (global rules), Project playbook (project-specific rules), The org chart, Codex, Tools.
4. Task parts, in the order work happens: Scope before work, Top-down approach (brainstorm, spec, plan, build), Decision record, Proof before "done", Outside audit, Who may sign what, Process improvement.
5. Where to paste, a lookup of six tools with links to each vendor's help page.
6. Work examples: Before and after, One task, How the rules grew.

### What a visitor can do

- Open any part and read it.
- Copy a part's prompt with one button. The button confirms the copy.
- Copy every prompt at once with "Copy for my agent".
- Switch the org chart between the Claude models and the Gemini models. The rules do not change when the models do.
- Play one real task through the map in six steps.
- Move through seven dated changes, from April to November, and see the setup change at each one.
- Read both replies of the before and after in full.

The page works on a phone. A visitor who has asked their device for less motion gets a still version that loses no information.

### Left out

- Public listing and search indexing.
- Analytics, comments and sign-in.
- An automatic rebuild of the prompts from his live files. He chose a dated snapshot.
- The account failover part.

### Costs and risks

- The text is public on GitHub even though the page is unlisted.
- The page ages between snapshots. The date makes that visible.
- The refresh runs on his Mac, because his rule files live there. If the Mac is asleep on the date, the run happens when it wakes.
- Estimated agent work is 5 to 7 hours across the build and the visual passes. This is a first estimate. The plan records actual time against it.
- Two steps change outside systems and need his approval when they come up: adding the subdomain in Vercel and DNS, and installing the scheduled job on his Mac.

### How we will know it is done

- Every sentence, prompt and quote on the page matches the approved copy exactly. A test compares them.
- Each Copy button puts the exact prompt text on the clipboard.
- The subdomain serves the page. The main domain does not serve it at any path.
- The page tells search engines not to index it, and it is absent from the sitemap.
- An agent that requests the plain-text version gets every prompt.
- A check enforces the word budget for the parts.
- A separate privacy pass by a model from another vendor finds no email, account name, price, client name or product name in the published text.
- Aedwon compares the built page with the approved Claude Design sample and accepts it.

## Part 2. For agents

Read `AGENTS.md` and `docs/process-improvement.md` first. The six active written rules and the four required steps in that file apply to all design and copy work here.

### Facts about the repo this design relies on

- Next 16.1.1, React 19.2.3, App Router, Tailwind 3.4.1, Vitest 4.1.4 on jsdom. CI job `verify` runs `npm ci`, `npm test`, `npm run lint`, `npm run build`, then starts the server and curls agent endpoints, sitemap, robots and `noindex` pages.
- `app/logo-cropper/` and `app/logo-sizing/` are the pattern for a standalone page. Each sits outside the `(v2)` and `(v3)` groups with its own `layout.tsx` and sets `robots: { index: false, follow: false }` in metadata.
- The root `app/layout.tsx` applies to every route. It loads Geist fonts, `globals.css`, Person and WebSite JSON-LD, and a canonical of `/`.
- `proxy.ts` only negotiates the Accept header. It has no host checks. The one host rule in the repo is the `aedwon.site` to `www.aedwon.site` redirect in `next.config.ts`.
- `app/sitemap.ts` is a hand-built list. `app/robots.ts` is shared by every host.
- `lib/agent-content.ts` hardcodes which paths have a Markdown version. Unknown paths return 404.
- `framer-motion` 12.23.26 is installed and unused. No other motion or graph library is installed.
- Every file in `content/projects/` must be a valid project, or `lib/studio/__tests__/studio.test.ts` fails.

### Routing

- Add the page as `app/workflow/` with its own `layout.tsx`, following the logo-cropper pattern.
- Serve it at the root of `workflow.aedwon.site` with a host-conditioned rewrite. Requests for `/workflow` on any other host return 404, so the page has one address.
- The existing `aedwon.site` redirect matches that exact host only. Confirm the subdomain does not fall into it.
- Adding the domain to the Vercel project and creating the DNS record are external changes. Stop and ask Aedwon before either.

### Keeping it unlisted

- Set `robots: { index: false, follow: false }` in the page's metadata and send an `X-Robots-Tag: noindex, nofollow` header for the subdomain.
- Override the root layout's canonical for this route.
- Do not add the page to `app/sitemap.ts`, `llms.txt`, or any navigation.
- Extend the CI curl checks to assert `noindex` on the workflow page, as it already does for two other pages.

### Content

- Put the approved copy in `content/workflow/page.json`, outside `content/projects/` so the studio's project test is unaffected. The studio does not edit this file.
- Add a typed loader and a validator under `lib/workflow/`, and a test that the file is valid.
- Suggested shape: `snapshotDate`, `opener`, `parts[]` (each with `id`, `title`, `group` of `setup` or `task`, `paragraphs[]`, optional `prompt`, optional `models`), `pasteTable[]`, and `examples` (`beforeAfter`, `task[]`, `timeline[]`). Fit the shape to the approved copy, not the copy to the shape.
- Import the copy from the Claude doc's "Page copy" tab. The two replies in "Before and after" come from the second tab, "Draft 1 and builder notes".
- A test asserts that every paragraph, prompt and quote in the content file appears unchanged in the rendered page.
- Add the word-budget check that required step 1 in `docs/process-improvement.md` asks for. Count only what a visitor reads, leaving out prompts and quotes. Set the limit from the approved copy's longest part. When the check exists, retire that required step and rule 4 in the same change, as the process file says.

### Copy for my agent

- Build one plain-text document from the content file. It holds every prompt under its part title, plus one opening line that tells an agent what the text is.
- The "Copy for my agent" button copies that document.
- Serve the same document as `text/plain` at a fixed path on the subdomain.
- A request to the page with `Accept: text/markdown` should return it too. That needs a new entry in the path mapping in `lib/agent-content.ts`.

### Motion and interface

- Open until Aedwon picks from references. Reference clips are in the session scratch folder, and the earlier sample B is the Claude Design artifact "Workflow sample B: System map".
- Follow active written rules 1, 2, 5 and 6 in `docs/process-improvement.md`. Start from real references, view every render, run critique rounds before showing, deliver in Claude Design, and avoid overused fonts. The root layout loads Geist, so the page must set its own typefaces.
- No eyebrow labels (rule 3).
- UI work goes to Sonnet 5.5, never Codex.
- Use `framer-motion` if it can do what the approved sample needs. Add a library only when it cannot, and name the reason in the plan.
- Honor `prefers-reduced-motion` with a still layout that shows the same information.
- The build must match the approved sample exactly. This follows his global rule on visual choices.

### Snapshot refresh

- A script in `scripts/` compares his live rule files with the prompts in the content file and prepares the changes. It applies the privacy rules in the decisions table, updates `snapshotDate`, and opens a pull request. It does nothing when nothing changed.
- A user LaunchAgent on his Mac runs the script once a day at a fixed time. The script exits unless the date is the 15th or the last day of the month. A daily trigger is used because the scheduler cannot express "last day of the month" directly.
- The run never merges. Aedwon reviews and merges, since a new rule could carry a private line.
- Installing the LaunchAgent changes his machine. Stop and ask before doing it.

### Privacy pass

- Before the first publish and inside every snapshot run, search the content file for email addresses, account folder names, prices, and the product and bot names. Fail on any hit.
- Before the first publish, run one audit by a Codex model through `codex-pick` on the content file alone. It reports and fixes nothing.

### Tests

- Content file validates.
- Rendered text equals content text.
- Word budget holds.
- Copy buttons copy the exact prompt.
- The agent text contains every prompt.
- Host gating: the subdomain serves the page, and other hosts get 404 at `/workflow`.
- `noindex` metadata and header are present, and the sitemap omits the page.

### Out of scope for this spec

- Any change to the portfolio's own pages.
- Making the page public. That is a later decision with its own privacy review.
