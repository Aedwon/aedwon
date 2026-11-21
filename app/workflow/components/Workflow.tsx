import { buildAgentText } from "@/lib/workflow/agent-text";
import { parseInline } from "@/lib/workflow/inline";
import type { WorkflowPage, WorkflowPart } from "@/lib/workflow/types";
import { BeforeAfter } from "./BeforeAfter";
import { CopyButton } from "./CopyButton";
import { LivingInstrument } from "./LivingInstrument";
import { PromptBlock } from "./PromptBlock";

const PART_KEY: Record<string, string> = {
  "company-policy": "policy",
  "project-playbook": "playbook",
  "the-org-chart": "org",
  codex: "codex",
  tools: "tools",
  "top-down-approach": "td",
  "scope-before-work": "sc",
  "standards-before-work": "st",
  "decision-record": "dr",
  "proof-before-done": "pf",
  "outside-audit": "au",
  "who-may-sign-what": "sg",
  "process-improvement": "pi",
};

function Inline({ source }: { source: string }) {
  const segs = parseInline(source);
  return (
    <>
      {segs.map((s, i) =>
        s.href ? (
          <a key={i} href={s.href}>
            {s.text}
          </a>
        ) : (
          <InlineCode key={i} text={s.text} />
        ),
      )}
    </>
  );
}

/** Highlights file paths (e.g. ~/.claude/CLAUDE.md, AGENTS.md) as inline code inside table cells. */
function InlineCode({ text }: { text: string }) {
  const parts = text.split(/(~\/[\w./-]+|\b(?:CLAUDE|GEMINI|AGENTS)\.md\b)/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? <code key={i}>{part}</code> : <span key={i}>{part}</span>,
      )}
    </>
  );
}

function PartSection({ part }: { part: WorkflowPart }) {
  return (
    <section className="part" data-part={PART_KEY[part.id] ?? "rest"} id={part.id}>
      <h3>{part.title}</h3>
      {part.paragraphs.map((p) => (
        <p key={p}>{p}</p>
      ))}
      {part.lines?.length ? (
        <p className="lines">
          {part.lines.map((line, i) => (
            <span key={line}>
              {line}
              {i < part.lines!.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>
      ) : null}
      {part.prompt ? <PromptBlock text={part.prompt} title={part.title} /> : null}
    </section>
  );
}

export function Workflow({ page }: { page: WorkflowPage }) {
  return (
    <main className="page" id="page">
      <div className="duo">
        <header className="intro">
          <h1>{page.title}</h1>
          <p className="lede">{page.line}</p>
          <p className="date">
            <time dateTime={page.snapshot.iso}>{page.snapshot.text}</time>
          </p>
          <CopyButton text={buildAgentText(page)} label={page.copyAll} className="btn btn-primary" />
        </header>

        <LivingInstrument />

        <div className="text">
          <section className="part" data-part="rest" id={page.mindset.id}>
            <h3>{page.mindset.title}</h3>
            {page.mindset.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </section>

          <section className="part" data-part="rest" id={page.treatment.id}>
            <h3>{page.treatment.title}</h3>
            {page.treatment.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </section>

          <div className="chapter" id="setup">
            <h2>Setup</h2>
          </div>
          {page.setup.parts.map((part) => (
            <PartSection key={part.id} part={part} />
          ))}

          <div className="chapter" id="workflow">
            <h2>Workflow</h2>
          </div>
          {page.task.parts.map((part) => (
            <PartSection key={part.id} part={part} />
          ))}
        </div>
      </div>

      <section className="part wide paste-sec" id={page.paste.id}>
        <h3>{page.paste.title}</h3>
        {page.paste.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {page.paste.head.map((h) => (
                  <th key={h} scope="col">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {page.paste.rows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, i) => (
                    <td key={i} data-label={i > 0 ? page.paste.head[i] : undefined}>
                      <Inline source={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="chapter wide" id="examples">
        <h2>Examples</h2>
      </div>

      <section className="part wide ba-sec" id={page.beforeAfter.id}>
        <h3>{page.beforeAfter.title}</h3>
        {page.beforeAfter.paragraphs.map((p) => (
          <p className="ba-intro" key={p}>
            {p}
          </p>
        ))}
        <BeforeAfter items={page.beforeAfter.items} />
      </section>

      <section className="part wide" id={page.oneTask.id}>
        <h3>{page.oneTask.title}</h3>
        {page.oneTask.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <ol className="steps">
          {page.oneTask.steps.map((s) => (
            <li key={s.lead}>
              <p>
                {s.lead} {s.text}
              </p>
              {s.quote ? <blockquote>{s.quote}</blockquote> : null}
            </li>
          ))}
        </ol>
      </section>

      <section className="part wide" id={page.rulesGrew.id}>
        <h3>{page.rulesGrew.title}</h3>
        <ol className="grew">
          {page.rulesGrew.items.map((s) => (
            <li key={s.lead}>
              <span className="when">{s.lead.replace(/\.$/, "")}</span>
              <div>
                <p>{s.text}</p>
                {s.quote ? <blockquote>{s.quote}</blockquote> : null}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="foot" />
    </main>
  );
}
